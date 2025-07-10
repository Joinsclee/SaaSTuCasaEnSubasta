import { users, properties, savedProperties, type User, type InsertUser, type Property, type InsertProperty, type SavedProperty, type InsertSavedProperty } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, ilike, or, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  getProperties(filters?: PropertyFilters): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  
  getSavedProperties(userId: number): Promise<Array<SavedProperty & { property: Property }>>;
  saveProperty(userId: number, propertyId: number): Promise<SavedProperty>;
  unsaveProperty(userId: number, propertyId: number): Promise<void>;
  isPropertySaved(userId: number, propertyId: number): Promise<boolean>;
  
  sessionStore: session.SessionStore;
}

export interface PropertyFilters {
  state?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  propertyTypes?: string[];
  auctionTypes?: string[];
  minDiscount?: number;
  bedrooms?: number;
  bathrooms?: number;
  sortBy?: 'discount' | 'price' | 'auction_date' | 'recently_added';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
    let query = db.select().from(properties);
    const conditions = [];

    if (filters.state) {
      conditions.push(eq(properties.state, filters.state));
    }

    if (filters.city) {
      conditions.push(ilike(properties.city, `%${filters.city}%`));
    }

    if (filters.priceMin) {
      conditions.push(gte(properties.auctionPrice, filters.priceMin.toString()));
    }

    if (filters.priceMax) {
      conditions.push(lte(properties.auctionPrice, filters.priceMax.toString()));
    }

    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      conditions.push(inArray(properties.propertyType, filters.propertyTypes));
    }

    if (filters.auctionTypes && filters.auctionTypes.length > 0) {
      conditions.push(inArray(properties.auctionType, filters.auctionTypes));
    }

    if (filters.minDiscount) {
      conditions.push(gte(properties.discount, filters.minDiscount));
    }

    if (filters.bedrooms) {
      conditions.push(eq(properties.bedrooms, filters.bedrooms));
    }

    if (filters.bathrooms) {
      conditions.push(gte(properties.bathrooms, filters.bathrooms.toString()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Add sorting
    const sortBy = filters.sortBy || 'discount';
    const sortOrder = filters.sortOrder || 'desc';
    
    switch (sortBy) {
      case 'discount':
        query = sortOrder === 'desc' ? query.orderBy(desc(properties.discount)) : query.orderBy(asc(properties.discount));
        break;
      case 'price':
        query = sortOrder === 'desc' ? query.orderBy(desc(properties.auctionPrice)) : query.orderBy(asc(properties.auctionPrice));
        break;
      case 'auction_date':
        query = sortOrder === 'desc' ? query.orderBy(desc(properties.auctionDate)) : query.orderBy(asc(properties.auctionDate));
        break;
      case 'recently_added':
        query = sortOrder === 'desc' ? query.orderBy(desc(properties.createdAt)) : query.orderBy(asc(properties.createdAt));
        break;
    }

    // Add pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values(insertProperty)
      .returning();
    return property;
  }

  async getSavedProperties(userId: number): Promise<Array<SavedProperty & { property: Property }>> {
    const result = await db
      .select()
      .from(savedProperties)
      .innerJoin(properties, eq(savedProperties.propertyId, properties.id))
      .where(eq(savedProperties.userId, userId))
      .orderBy(desc(savedProperties.createdAt));

    return result.map(row => ({
      ...row.saved_properties,
      property: row.properties
    }));
  }

  async saveProperty(userId: number, propertyId: number): Promise<SavedProperty> {
    const [savedProperty] = await db
      .insert(savedProperties)
      .values({ userId, propertyId })
      .returning();
    return savedProperty;
  }

  async unsaveProperty(userId: number, propertyId: number): Promise<void> {
    await db
      .delete(savedProperties)
      .where(and(
        eq(savedProperties.userId, userId),
        eq(savedProperties.propertyId, propertyId)
      ));
  }

  async isPropertySaved(userId: number, propertyId: number): Promise<boolean> {
    const [saved] = await db
      .select()
      .from(savedProperties)
      .where(and(
        eq(savedProperties.userId, userId),
        eq(savedProperties.propertyId, propertyId)
      ));
    return !!saved;
  }
}

export const storage = new DatabaseStorage();

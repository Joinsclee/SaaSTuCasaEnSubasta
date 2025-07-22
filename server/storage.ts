import { users, properties, savedProperties, propertyEvaluations, type User, type InsertUser, type Property, type InsertProperty, type SavedProperty, type InsertSavedProperty, type PropertyEvaluation, type InsertPropertyEvaluation } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, ilike, or, inArray, sql } from "drizzle-orm";
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
  getCountiesByState(state: string): Promise<Array<{ county: string; propertiesCount: number }>>;
  
  getSavedProperties(userId: number): Promise<Array<SavedProperty & { property: Property }>>;
  saveProperty(userId: number, propertyId: number): Promise<SavedProperty>;
  unsaveProperty(userId: number, propertyId: number): Promise<void>;
  isPropertySaved(userId: number, propertyId: number): Promise<boolean>;
  
  // Admin functions
  getAdminStats(): Promise<{ totalUsers: number; totalProperties: number; adminUsers: number; regularUsers: number }>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: number, role: string): Promise<User | undefined>;
  
  // Property evaluations
  getPropertyEvaluations(userId: number): Promise<PropertyEvaluation[]>;
  createPropertyEvaluation(evaluation: InsertPropertyEvaluation): Promise<PropertyEvaluation>;
  updatePropertyEvaluation(id: number, evaluation: Partial<InsertPropertyEvaluation>): Promise<PropertyEvaluation | undefined>;
  deletePropertyEvaluation(id: number, userId: number): Promise<void>;
  
  sessionStore: any;
}

export interface PropertyFilters {
  state?: string;
  county?: string;
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
  propertyId?: number;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

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

    if (filters.county) {
      conditions.push(eq(properties.county, filters.county));
    }

    if (filters.city) {
      conditions.push(ilike(properties.city, `%${filters.city}%`));
    }

    if (filters.propertyId) {
      conditions.push(eq(properties.id, filters.propertyId));
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

  async getCountiesByState(state: string): Promise<Array<{ county: string; propertiesCount: number }>> {
    const result = await db
      .select({
        county: properties.county,
        propertiesCount: sql<number>`count(*)::int`
      })
      .from(properties)
      .where(eq(properties.state, state))
      .groupBy(properties.county)
      .orderBy(properties.county);

    return result;
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

  // Admin functions
  async getAdminStats(): Promise<{ totalUsers: number; totalProperties: number; adminUsers: number; regularUsers: number }> {
    const [userStats] = await db
      .select({
        totalUsers: sql<number>`count(*)::int`,
        adminUsers: sql<number>`count(case when role = 'admin' then 1 end)::int`,
        regularUsers: sql<number>`count(case when role = 'user' then 1 end)::int`
      })
      .from(users);

    const [propertyStats] = await db
      .select({
        totalProperties: sql<number>`count(*)::int`
      })
      .from(properties);

    return {
      totalUsers: userStats.totalUsers,
      adminUsers: userStats.adminUsers,
      regularUsers: userStats.regularUsers,
      totalProperties: propertyStats.totalProperties
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: number, role: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }

  // Property evaluations
  async getPropertyEvaluations(userId: number): Promise<PropertyEvaluation[]> {
    return await db
      .select()
      .from(propertyEvaluations)
      .where(eq(propertyEvaluations.userId, userId))
      .orderBy(desc(propertyEvaluations.createdAt));
  }

  async createPropertyEvaluation(evaluation: InsertPropertyEvaluation): Promise<PropertyEvaluation> {
    const [newEvaluation] = await db
      .insert(propertyEvaluations)
      .values(evaluation)
      .returning();
    return newEvaluation;
  }

  async updatePropertyEvaluation(id: number, evaluation: Partial<InsertPropertyEvaluation>): Promise<PropertyEvaluation | undefined> {
    const [updatedEvaluation] = await db
      .update(propertyEvaluations)
      .set(evaluation)
      .where(eq(propertyEvaluations.id, id))
      .returning();
    return updatedEvaluation || undefined;
  }

  async deletePropertyEvaluation(id: number, userId: number): Promise<void> {
    await db
      .delete(propertyEvaluations)
      .where(and(
        eq(propertyEvaluations.id, id),
        eq(propertyEvaluations.userId, userId)
      ));
  }
}

export const storage = new DatabaseStorage();

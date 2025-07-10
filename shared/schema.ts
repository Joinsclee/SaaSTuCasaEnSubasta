import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  subscriptionType: text("subscription_type").notNull().default("free"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  county: text("county").notNull(),
  propertyType: text("property_type").notNull(), // casa, condominio, townhouse, terreno
  bedrooms: integer("bedrooms"),
  bathrooms: decimal("bathrooms"),
  sqft: integer("sqft"),
  lotSize: text("lot_size"),
  yearBuilt: integer("year_built"),
  condition: text("condition"),
  parking: text("parking"),
  hoa: decimal("hoa"),
  originalPrice: decimal("original_price").notNull(),
  auctionPrice: decimal("auction_price").notNull(),
  discount: integer("discount").notNull(), // percentage
  auctionType: text("auction_type").notNull(), // ejecucion, bancarrota, impuestos
  auctionDate: timestamp("auction_date").notNull(),
  auctionLocation: text("auction_location"),
  depositRequired: decimal("deposit_required"),
  marketValue: decimal("market_value"),
  monthlyRent: decimal("monthly_rent"),
  annualROI: decimal("annual_roi"),
  capRate: decimal("cap_rate"),
  images: json("images").$type<string[]>().default([]),
  featured: boolean("featured").default(false),
  status: text("status").notNull().default("active"), // active, sold, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedProperties = pgTable("saved_properties", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  savedProperties: many(savedProperties),
}));

export const propertiesRelations = relations(properties, ({ many }) => ({
  savedProperties: many(savedProperties),
}));

export const savedPropertiesRelations = relations(savedProperties, ({ one }) => ({
  user: one(users, {
    fields: [savedProperties.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [savedProperties.propertyId],
    references: [properties.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
}).extend({
  phone: z.string({
    required_error: "El teléfono es requerido",
    invalid_type_error: "El teléfono debe ser un texto"
  }).min(1, "El teléfono es requerido").min(10, "El teléfono debe tener al menos 10 dígitos"),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertSavedPropertySchema = createInsertSchema(savedProperties).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertSavedProperty = z.infer<typeof insertSavedPropertySchema>;
export type SavedProperty = typeof savedProperties.$inferSelect;

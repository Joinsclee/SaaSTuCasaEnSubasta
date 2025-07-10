import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertPropertySchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Property routes
  app.get("/api/properties", async (req, res, next) => {
    try {
      const filters = {
        state: req.query.state as string,
        city: req.query.city as string,
        priceMin: req.query.priceMin ? parseInt(req.query.priceMin as string) : undefined,
        priceMax: req.query.priceMax ? parseInt(req.query.priceMax as string) : undefined,
        propertyTypes: req.query.propertyTypes ? (req.query.propertyTypes as string).split(',') : undefined,
        auctionTypes: req.query.auctionTypes ? (req.query.auctionTypes as string).split(',') : undefined,
        minDiscount: req.query.minDiscount ? parseInt(req.query.minDiscount as string) : undefined,
        bedrooms: req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined,
        bathrooms: req.query.bathrooms ? parseInt(req.query.bathrooms as string) : undefined,
        sortBy: req.query.sortBy as 'discount' | 'price' | 'auction_date' | 'recently_added',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/properties/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de propiedad inválido" });
      }
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Propiedad no encontrada" });
      }

      // Check if property is saved by current user
      let isSaved = false;
      if (req.isAuthenticated()) {
        isSaved = await storage.isPropertySaved(req.user!.id, id);
      }

      res.json({ ...property, isSaved });
    } catch (error) {
      next(error);
    }
  });

  // Saved properties routes (protected)
  app.get("/api/saved-properties", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      const savedProperties = await storage.getSavedProperties(req.user!.id);
      res.json(savedProperties);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/saved-properties", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      const { propertyId } = req.body;
      const savedProperty = await storage.saveProperty(req.user!.id, propertyId);
      res.status(201).json(savedProperty);
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        return res.status(400).json({ message: "La propiedad ya está guardada" });
      }
      next(error);
    }
  });

  app.delete("/api/saved-properties/:propertyId", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      const propertyId = parseInt(req.params.propertyId);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "ID de propiedad inválido" });
      }
      await storage.unsaveProperty(req.user!.id, propertyId);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      const savedProperties = await storage.getSavedProperties(req.user!.id);
      const allProperties = await storage.getProperties({ limit: 1000 });
      
      // Calculate average discount from viewed properties (simplified)
      const averageDiscount = allProperties.length > 0 
        ? Math.round(allProperties.reduce((sum, p) => sum + p.discount, 0) / allProperties.length)
        : 0;

      const stats = {
        propertiesViewed: allProperties.length,
        savedProperties: savedProperties.length,
        averageDiscount,
        subscriptionDaysRemaining: req.user!.subscriptionExpiresAt 
          ? Math.max(0, Math.ceil((new Date(req.user!.subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : 0
      };

      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // User profile update
  app.patch("/api/user", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      const { fullName, email, phone } = req.body;
      const updatedUser = await storage.updateUser(req.user!.id, {
        fullName,
        email,
        phone
      });
      
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

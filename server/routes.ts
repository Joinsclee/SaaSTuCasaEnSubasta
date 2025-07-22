import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { requireAdmin, requireAuth } from "./middleware/adminAuth";
import { z } from "zod";
import { insertPropertySchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Counties route - get counties by state
  app.get("/api/counties/:state", async (req, res, next) => {
    try {
      const state = req.params.state;
      const counties = await storage.getCountiesByState(state);
      res.json(counties);
    } catch (error) {
      next(error);
    }
  });

  // Property routes
  app.get("/api/properties", async (req, res, next) => {
    try {
      const filters = {
        state: req.query.state as string,
        county: req.query.county as string,
        city: req.query.city as string,
        propertyId: req.query.propertyId ? parseInt(req.query.propertyId as string) : undefined,
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
      const evaluations = await storage.getPropertyEvaluations(req.user!.id);
      
      // Calculate average discount from viewed properties (simplified)
      const averageDiscount = allProperties.length > 0 
        ? Math.round(allProperties.reduce((sum, p) => sum + p.discount, 0) / allProperties.length)
        : 0;

      const stats = {
        propertiesViewed: allProperties.length,
        savedProperties: savedProperties.length,
        propertiesEvaluated: evaluations.length,
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

  // Admin routes (protected)
  app.get("/api/admin/stats", requireAdmin, async (req, res, next) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password field for security
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/users/:id/role", requireAdmin, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuario inválido" });
      }

      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Rol inválido. Debe ser 'user' o 'admin'" });
      }

      // Prevent admin from removing their own admin role
      if (userId === req.user!.id && role !== 'admin') {
        return res.status(400).json({ message: "No puedes cambiar tu propio rol de administrador" });
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Remove password field for security
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      next(error);
    }
  });

  // Property evaluation routes (protected)
  app.get("/api/evaluations", requireAuth, async (req, res, next) => {
    try {
      const evaluations = await storage.getPropertyEvaluations(req.user!.id);
      res.json(evaluations);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/evaluations", requireAuth, async (req, res, next) => {
    try {
      const evaluationData = {
        ...req.body,
        userId: req.user!.id
      };
      const evaluation = await storage.createPropertyEvaluation(evaluationData);
      res.status(201).json(evaluation);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/evaluations/:id", requireAuth, async (req, res, next) => {
    try {
      const evaluationId = parseInt(req.params.id);
      if (isNaN(evaluationId)) {
        return res.status(400).json({ message: "ID de evaluación inválido" });
      }
      
      const updatedEvaluation = await storage.updatePropertyEvaluation(evaluationId, req.body);
      if (!updatedEvaluation) {
        return res.status(404).json({ message: "Evaluación no encontrada" });
      }
      
      res.json(updatedEvaluation);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/evaluations/:id", requireAuth, async (req, res, next) => {
    try {
      const evaluationId = parseInt(req.params.id);
      if (isNaN(evaluationId)) {
        return res.status(400).json({ message: "ID de evaluación inválido" });
      }
      
      await storage.deletePropertyEvaluation(evaluationId, req.user!.id);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

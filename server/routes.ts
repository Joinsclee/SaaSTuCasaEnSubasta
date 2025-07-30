import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { requireAdmin, requireAuth } from "./middleware/adminAuth";
import { z } from "zod";
import { insertPropertySchema } from "@shared/schema";

// Helper function for Kevin's notes based on opportunity score
function getKevinNotes(opportunityScore: number): string {
  const notes = [
    "Requiere inspección detallada. Posible problema estructural.",
    "Buena oportunidad pero verificar títulos y gravámenes.",
    "Propiedad sólida con potencial de revalorización moderada.",
    "Excelente inversión. Ubicación premium y condición favorable.",
    "Oportunidad excepcional. Máxima prioridad para inversión."
  ];
  return notes[opportunityScore - 1] || notes[2];
}

// Seeded random function for consistent property generation
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

// Generate consistent auction events data using deterministic seed
function generateAuctionEvents(state?: string, year = new Date().getFullYear(), month = new Date().getMonth() + 1) {
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const cities: Record<string, string[]> = {
    'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
    'TX': ['Houston', 'Dallas', 'Austin', 'San Antonio'],
    'FL': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
    'NY': ['New York', 'Albany', 'Buffalo', 'Rochester'],
    'AZ': ['Phoenix', 'Tucson', 'Mesa', 'Scottsdale'],
    'NC': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham'],
    'AL': ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville'],
    'AK': ['Anchorage', 'Fairbanks', 'Juneau', 'Wasilla'],
    'AR': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale'],
    'CO': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins'],
    'CT': ['Hartford', 'Bridgeport', 'New Haven', 'Stamford'],
    'DE': ['Wilmington', 'Dover', 'Newark', 'Middletown'],
    'GA': ['Atlanta', 'Augusta', 'Columbus', 'Savannah'],
    'HI': ['Honolulu', 'Hilo', 'Kailua', 'Kaneohe'],
    'ID': ['Boise', 'Meridian', 'Nampa', 'Idaho Falls'],
    'IL': ['Chicago', 'Aurora', 'Rockford', 'Joliet'],
    'IN': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend'],
    'IA': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City'],
    'KS': ['Wichita', 'Overland Park', 'Kansas City', 'Topeka'],
    'KY': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro'],
    'LA': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette'],
    'ME': ['Portland', 'Lewiston', 'Bangor', 'South Portland'],
    'MD': ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg'],
    'MA': ['Boston', 'Worcester', 'Springfield', 'Lowell'],
    'MI': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights'],
    'MN': ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth'],
    'MS': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg'],
    'MO': ['Kansas City', 'Saint Louis', 'Springfield', 'Independence'],
    'MT': ['Billings', 'Missoula', 'Great Falls', 'Bozeman'],
    'NE': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island'],
    'NV': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas'],
    'NH': ['Manchester', 'Nashua', 'Concord', 'Dover'],
    'NJ': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth'],
    'NM': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe'],
    'ND': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot'],
    'OH': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo'],
    'OK': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow'],
    'OR': ['Portland', 'Eugene', 'Salem', 'Gresham'],
    'PA': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie'],
    'RI': ['Providence', 'Warwick', 'Cranston', 'Pawtucket'],
    'SC': ['Charleston', 'Columbia', 'North Charleston', 'Mount Pleasant'],
    'SD': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings'],
    'TN': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga'],
    'UT': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan'],
    'VT': ['Burlington', 'Essex', 'South Burlington', 'Colchester'],
    'VA': ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond'],
    'WA': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver'],
    'WV': ['Charleston', 'Huntington', 'Parkersburg', 'Morgantown'],
    'WI': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha'],
    'WY': ['Cheyenne', 'Casper', 'Laramie', 'Gillette']
  };

  const auctionTypes = ['foreclosure', 'bankruptcy', 'tax'];
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  
  // Create deterministic seed based on year and month
  const seed = year * 100 + month;
  
  // Deterministic random function using seed
  function seededRandom(seed: number, index: number) {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  }
  
  // First generate ALL events for the month (without state filter)
  const allEvents: Array<{
    id: number;
    date: string;
    state: string;
    city: string;
    auctionType: string;
    time: string;
    propertiesCount: number;
  }> = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Generate consistent events for each state
  states.forEach((stateCode, stateIndex) => {
    // Each state gets 1-3 events this month based on deterministic calculation
    // Ensure minimum 1 event for better user experience
    const baseEventCount = Math.floor(seededRandom(seed, stateIndex) * 3) + 1;
    const stateEventCount = Math.min(baseEventCount, 3);
    
    for (let i = 0; i < stateEventCount; i++) {
      const eventIndex = stateIndex * 10 + i;
      let eventDay = Math.floor(seededRandom(seed, eventIndex + 1000) * daysInMonth) + 1;
      
      // Ensure events are spread out (avoid too many on same day)
      if (i > 0) {
        eventDay = Math.min(eventDay + i * 3, daysInMonth);
      }
      
      const eventDate = `${year}-${String(month).padStart(2, '0')}-${String(eventDay).padStart(2, '0')}`;
      
      // Skip events in the past, but allow current day
      const eventDateTime = new Date(eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDateTime < today) continue;
      
      const stateCities = cities[stateCode] || ['Downtown', 'Metro Area', 'City Center'];
      const cityIndex = Math.floor(seededRandom(seed, eventIndex + 2000) * stateCities.length);
      const auctionTypeIndex = Math.floor(seededRandom(seed, eventIndex + 3000) * auctionTypes.length);
      const timeIndex = Math.floor(seededRandom(seed, eventIndex + 4000) * times.length);
      const propertiesCount = Math.floor(seededRandom(seed, eventIndex + 5000) * 15) + 5;
      
      allEvents.push({
        id: eventIndex,
        date: eventDate,
        state: stateCode,
        city: stateCities[cityIndex],
        auctionType: auctionTypes[auctionTypeIndex],
        time: times[timeIndex],
        propertiesCount
      });
    }
  });
  
  // Sort all events by date
  const sortedEvents = allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Filter by state if specified
  if (state) {
    return sortedEvents.filter(event => event.state === state);
  }
  
  return sortedEvents;
}

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

  // Auction events route
  app.get("/api/auction-events", async (req, res, next) => {
    try {
      const state = req.query.state as string;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;
      
      // Generate sample auction events data
      const auctionEvents = generateAuctionEvents(state, year, month);
      res.json(auctionEvents);
    } catch (error) {
      next(error);
    }
  });

  // Properties by auction route
  app.get("/api/auction/:eventId/properties", async (req, res, next) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const state = req.query.state as string;
      const date = req.query.date as string;
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "ID de evento inválido" });
      }
      
      // Generate properties for this specific auction event
      let properties = await storage.getProperties({
        state: state || undefined,
        sortBy: 'discount',
        sortOrder: 'desc',
        limit: 50
      });

      // If no properties found, get all properties without state filter
      if (properties.length === 0) {
        properties = await storage.getProperties({
          sortBy: 'discount',
          sortOrder: 'desc',
          limit: 50
        });
      }
      
      // Create deterministic seed for consistent properties per auction
      const seed = eventId * 1000 + new Date(date || '2025-07-29').getTime();
      
      // Filter and enhance properties for the auction
      const numProperties = Math.floor(seededRandom(seed, 1) * 8) + 5; // 5-12 properties
      const auctionProperties = properties.slice(0, numProperties).map((property, index) => ({
        ...property,
        auctionEventId: eventId,
        opportunityScore: Math.floor(seededRandom(seed, index + 100) * 5) + 1, // 1-5 stars
        auctionDate: date,
        lienAmount: Math.floor(seededRandom(seed, index + 200) * 50000) + 10000,
        estimatedValue: property.marketValue || property.originalPrice,
        bidIncrement: 1000,
        openingBid: Math.floor(Number(property.auctionPrice) * (0.7 + seededRandom(seed, index + 300) * 0.2)),
        kevinNotes: getKevinNotes(Math.floor(seededRandom(seed, index + 100) * 5) + 1)
      }));
      
      res.json(auctionProperties);
    } catch (error) {
      next(error);
    }
  });

  // Toggle property favorite status
  app.post("/api/properties/:id/favorite", requireAuth, async (req, res, next) => {
    try {
      const propertyId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "ID de propiedad inválido" });
      }
      
      // Check if property exists in favorites
      const existingFavorite = await storage.getSavedProperty(userId, propertyId);
      
      if (existingFavorite) {
        // Remove from favorites
        await storage.removeSavedProperty(userId, propertyId);
        res.json({ message: "Propiedad removida de favoritos", isFavorite: false });
      } else {
        // Add to favorites
        await storage.saveProperty(userId, propertyId);
        res.json({ message: "Propiedad agregada a favoritos", isFavorite: true });
      }
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

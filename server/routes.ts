import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBotStatsSchema } from "@shared/schema";
import { z } from "zod";

// For demonstration, we'll store incidents in memory
let incidents = [
  {
    id: 1,
    title: 'Database Connection Issues',
    description: 'Intermittent database connection issues affecting some user profile operations.',
    status: 'investigating',
    type: 'yellow',
    timestamp: 'April 9, 2025 - 03:25 AM UTC',
    public: true
  },
  {
    id: 2,
    title: 'API Rate Limiting Resolved',
    description: 'Previously experienced Discord API rate limiting issues have been resolved.',
    status: 'resolved',
    type: 'green',
    timestamp: 'April 9, 2025 - 02:15 AM UTC',
    public: true
  }
];

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to get bot stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getBotStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bot statistics" });
    }
  });

  // API endpoint to update bot stats (for dev tools)
  app.post("/api/stats", async (req: Request, res: Response) => {
    try {
      const currentStats = await storage.getBotStats();
      
      // Only update the fields that are provided
      const updatedStats = {
        ...currentStats,
        ...req.body
      };
      
      // Validate the updated stats
      const parsedStats = insertBotStatsSchema.parse(updatedStats);
      
      // Update stats in storage
      const newStats = await storage.updateBotStats(parsedStats);
      
      return res.status(200).json(newStats);
    } catch (error) {
      console.error("Error updating bot stats:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: "Failed to update bot stats" });
    }
  });

  // API endpoint to get public incidents
  app.get("/api/incidents", (req, res) => {
    try {
      // Only return public incidents for regular users
      const publicIncidents = incidents.filter(incident => incident.public);
      res.json(publicIncidents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });
  
  // API endpoint to get all incidents (for dev tools)
  app.get("/api/incidents/all", (req, res) => {
    try {
      res.json(incidents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });
  
  // API endpoint to create a new incident
  app.post("/api/incidents", (req, res) => {
    try {
      const { title, description, status, type, public: isPublic } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ message: "Title and description are required" });
      }
      
      const timestamp = new Date();
      const formattedTimestamp = `${timestamp.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')} AM UTC`;
      
      const newId = incidents.length > 0 ? Math.max(...incidents.map(inc => inc.id)) + 1 : 1;
      
      const newIncident = {
        id: newId,
        title,
        description,
        status: status || 'investigating',
        type: type || 'yellow',
        timestamp: formattedTimestamp,
        public: isPublic !== undefined ? isPublic : true
      };
      
      incidents = [newIncident, ...incidents];
      
      res.status(201).json(newIncident);
    } catch (error) {
      console.error("Error creating incident:", error);
      res.status(500).json({ message: "Failed to create incident" });
    }
  });
  
  // API endpoint to update an incident
  app.patch("/api/incidents/:id", (req, res) => {
    try {
      const { id } = req.params;
      const incidentId = parseInt(id);
      
      if (isNaN(incidentId)) {
        return res.status(400).json({ message: "Invalid incident ID" });
      }
      
      const incidentIndex = incidents.findIndex(inc => inc.id === incidentId);
      
      if (incidentIndex === -1) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      const { status, type, public: isPublic } = req.body;
      
      const timestamp = new Date();
      const formattedTimestamp = `${timestamp.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')} AM UTC`;
      
      const updatedIncident = {
        ...incidents[incidentIndex],
        status: status || incidents[incidentIndex].status,
        type: type || incidents[incidentIndex].type,
        timestamp: formattedTimestamp,
        public: isPublic !== undefined ? isPublic : incidents[incidentIndex].public
      };
      
      incidents[incidentIndex] = updatedIncident;
      
      res.json(updatedIncident);
    } catch (error) {
      console.error("Error updating incident:", error);
      res.status(500).json({ message: "Failed to update incident" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBotStatsSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);

  return httpServer;
}

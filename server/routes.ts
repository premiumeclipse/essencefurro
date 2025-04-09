import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  const httpServer = createServer(app);

  return httpServer;
}

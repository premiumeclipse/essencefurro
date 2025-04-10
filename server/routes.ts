import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBotStatsSchema } from "@shared/schema";
import { z } from "zod";
import { WebSocketServer, WebSocket } from 'ws';
import { setupAuth } from "./auth";

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
  // Setup authentication
  setupAuth(app);

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
  
  // API endpoint for bot dashboard status
  app.get("/api/bot/status", (req, res) => {
    try {
      // Return bot connection and health status
      res.json({
        isOnline: botStatus.isOnline,
        uptime: botStatus.uptime,
        lastHeartbeat: botStatus.lastHeartbeat,
        connectedServers: botStatus.connectedServers,
        activeUsers: botStatus.activeUsers,
        commandsProcessed: botStatus.commandsProcessed
      });
    } catch (error) {
      console.error("Error fetching bot status:", error);
      res.status(500).json({ message: "Failed to fetch bot status" });
    }
  });
  
  // API endpoint for user sessions
  app.get("/api/users/active", (req, res) => {
    try {
      type SessionData = {
        userId: string;
        username: string;
        lastActive: Date;
        status: 'online' | 'idle' | 'dnd' | 'offline';
        serverId?: string;
        activities?: string[];
      };
      
      const activeSessionsData: SessionData[] = [];
      
      // Convert the Map to a JSON-friendly array
      userSessions.forEach((session, userId) => {
        if (session.status === 'online' || session.status === 'idle') {
          activeSessionsData.push({
            userId,
            ...session
          });
        }
      });
      
      res.json(activeSessionsData);
    } catch (error) {
      console.error("Error fetching active users:", error);
      res.status(500).json({ message: "Failed to fetch active users" });
    }
  });
  
  // API endpoint for available bot commands
  app.get("/api/bot/commands", (req, res) => {
    try {
      // This is a placeholder - in a real implementation, this would
      // be populated by the bot when it connects
      const availableCommands = [
        {
          name: "help",
          description: "Shows help information about available commands",
          usage: ">help [command]",
          category: "utility"
        },
        {
          name: "ping",
          description: "Check bot response time",
          usage: ">ping",
          category: "utility"
        },
        {
          name: "profile",
          description: "View or edit your user profile",
          usage: ">profile [user]",
          category: "utility"
        },
        {
          name: "purge",
          description: "Delete multiple messages at once",
          usage: ">purge [amount]",
          category: "moderation"
        },
        {
          name: "play",
          description: "Play music from YouTube or Spotify",
          usage: ">play [song]",
          category: "music"
        },
        {
          name: "boop",
          description: "Boop another user",
          usage: ">boop [user]",
          category: "fun"
        }
      ];
      
      res.json(availableCommands);
    } catch (error) {
      console.error("Error fetching bot commands:", error);
      res.status(500).json({ message: "Failed to fetch bot commands" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for bot connection
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients with their authentication status
  const clients = new Map<WebSocket, { 
    authenticated: boolean;
    username?: string;
    isBot?: boolean;
    userId?: string;
  }>();
  
  // Active user sessions by userId
  const userSessions = new Map<string, {
    username: string;
    lastActive: Date;
    status: 'online' | 'idle' | 'dnd' | 'offline';
    serverId?: string;
    activities?: string[];
  }>();

  // Bot events and stats
  let botStatus = {
    isOnline: false,
    uptime: 0,
    lastHeartbeat: new Date(),
    connectedServers: 0,
    activeUsers: 0,
    commandsProcessed: 0
  };
  
  // Message handler for WebSocket communications
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    clients.set(ws, { authenticated: false });
    
    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data.type);
        
        // Handle authentication
        if (data.type === 'auth') {
          // Basic auth mechanism - you should implement a stronger one
          if (data.token === 'essence_bot_secret_token' && data.isBot) {
            // Bot authentication
            clients.set(ws, { 
              authenticated: true, 
              username: 'essence-bot',
              isBot: true 
            });
            botStatus.isOnline = true;
            botStatus.lastHeartbeat = new Date();
            
            // Notify all clients about bot connection
            broadcast({ 
              type: 'bot_status', 
              status: 'connected',
              timestamp: new Date().toISOString()
            });
            
            console.log('Bot authenticated successfully');
          } else if (data.userId && data.username) {
            // User authentication
            clients.set(ws, { 
              authenticated: true, 
              username: data.username,
              userId: data.userId
            });
            
            // Add to active user sessions
            userSessions.set(data.userId, {
              username: data.username,
              lastActive: new Date(),
              status: 'online'
            });
            
            console.log(`User authenticated: ${data.username}`);
          } else {
            ws.send(JSON.stringify({ 
              type: 'auth_error', 
              message: 'Invalid authentication' 
            }));
          }
        } 
        // Handle bot stats update
        else if (data.type === 'bot_stats' && isAuthenticated(ws, true)) {
          botStatus = {
            ...botStatus,
            ...data.stats,
            lastHeartbeat: new Date()
          };
          
          // Broadcast updated stats to dashboard users
          broadcastToDashboard({
            type: 'bot_stats_update',
            stats: botStatus
          });
        }
        // Handle bot heartbeat
        else if (data.type === 'heartbeat' && isAuthenticated(ws, true)) {
          botStatus.lastHeartbeat = new Date();
          botStatus.uptime = data.uptime || botStatus.uptime;
          
          // Send acknowledgment
          ws.send(JSON.stringify({ 
            type: 'heartbeat_ack', 
            timestamp: new Date().toISOString() 
          }));
        }
        // Handle user data update
        else if (data.type === 'user_update' && isAuthenticated(ws)) {
          const clientInfo = clients.get(ws);
          if (clientInfo && clientInfo.userId) {
            const userId = clientInfo.userId;
            const currentSession = userSessions.get(userId);
            
            if (currentSession) {
              userSessions.set(userId, {
                ...currentSession,
                ...data.user,
                lastActive: new Date()
              });
              
              // Broadcast user update to bot (if connected)
              broadcastToBot({
                type: 'user_update_ack',
                userId,
                status: 'success'
              });
            }
          }
        }
        // Handle command request from dashboard to bot
        else if (data.type === 'run_command' && isAuthenticated(ws)) {
          const clientInfo = clients.get(ws);
          if (clientInfo && clientInfo.userId) {
            // Relay command to bot
            broadcastToBot({
              type: 'command_request',
              command: data.command,
              params: data.params,
              userId: clientInfo.userId,
              username: clientInfo.username,
              requestId: data.requestId
            });
            
            // Acknowledge receipt to user
            ws.send(JSON.stringify({
              type: 'command_received',
              requestId: data.requestId,
              timestamp: new Date().toISOString()
            }));
          }
        }
        // Handle command response from bot to dashboard
        else if (data.type === 'command_response' && isAuthenticated(ws, true)) {
          // Find the user to send the response to
          let foundUser = false;
          clients.forEach((info, client) => {
            if (!foundUser && info.userId === data.userId && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'command_result',
                requestId: data.requestId,
                result: data.result,
                success: data.success,
                error: data.error
              }));
              foundUser = true;
            }
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to process message' 
        }));
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      const clientInfo = clients.get(ws);
      if (clientInfo) {
        if (clientInfo.isBot) {
          botStatus.isOnline = false;
          // Notify users that bot disconnected
          broadcast({ 
            type: 'bot_status', 
            status: 'disconnected',
            timestamp: new Date().toISOString()
          });
        } else if (clientInfo.userId) {
          // Update user session status
          const userSession = userSessions.get(clientInfo.userId);
          if (userSession) {
            userSessions.set(clientInfo.userId, {
              ...userSession,
              status: 'offline',
              lastActive: new Date()
            });
          }
        }
        clients.delete(ws);
      }
      console.log('WebSocket connection closed');
    });
  });
  
  // Helper function to check if a client is authenticated
  function isAuthenticated(ws: WebSocket, checkBot = false): boolean {
    const client = clients.get(ws);
    if (!client || !client.authenticated) return false;
    if (checkBot && !client.isBot) return false;
    return true;
  }
  
  // Helper function to broadcast to all authenticated clients
  function broadcast(message: any): void {
    clients.forEach((info, client) => {
      if (info.authenticated && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  
  // Helper function to broadcast only to the bot
  function broadcastToBot(message: any): void {
    clients.forEach((info, client) => {
      if (info.authenticated && info.isBot && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        return; // Only send to the first bot found
      }
    });
  }
  
  // Helper function to broadcast only to dashboard users
  function broadcastToDashboard(message: any): void {
    clients.forEach((info, client) => {
      if (info.authenticated && !info.isBot && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  
  // Set up a periodic check for bot health
  setInterval(() => {
    const now = new Date();
    const botLastHeartbeat = botStatus.lastHeartbeat;
    const timeSinceLastHeartbeat = now.getTime() - botLastHeartbeat.getTime();
    
    // If no heartbeat received in 30 seconds, mark bot as offline
    if (botStatus.isOnline && timeSinceLastHeartbeat > 30000) {
      botStatus.isOnline = false;
      broadcast({ 
        type: 'bot_status', 
        status: 'disconnected',
        timestamp: now.toISOString()
      });
    }
  }, 15000); // Check every 15 seconds

  return httpServer;
}

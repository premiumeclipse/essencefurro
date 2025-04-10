import { users, type User, type InsertUser, botStats, type BotStats, type InsertBotStats } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getBotStats(): Promise<BotStats>;
  updateBotStats(stats: InsertBotStats): Promise<BotStats>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private botStats: BotStats;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    // Initialize with some default statistics
    this.botStats = {
      id: 1,
      servers: 5000,
      users: 1500000,
      commandsRun: 10000000,
      uptime: 99,
      messageCount: 75000000,
      isOnline: true,
      updatedAt: new Date()
    };
    
    // Create in-memory session store
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBotStats(): Promise<BotStats> {
    return this.botStats;
  }

  async updateBotStats(stats: InsertBotStats): Promise<BotStats> {
    this.botStats = { ...this.botStats, ...stats };
    return this.botStats;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session' 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getBotStats(): Promise<BotStats> {
    const [stats] = await db.select().from(botStats).limit(1);
    if (!stats) {
      // Create default stats if none exist
      const [newStats] = await db
        .insert(botStats)
        .values({
          servers: 5000,
          users: 1500000,
          commandsRun: 50000000,
          uptime: 9999999,
          messageCount: 75000000,
          isOnline: true
        })
        .returning();
      return newStats;
    }
    return stats;
  }

  async updateBotStats(stats: InsertBotStats): Promise<BotStats> {
    const [existingStats] = await db.select().from(botStats).limit(1);
    
    if (existingStats) {
      const [updatedStats] = await db
        .update(botStats)
        .set(stats)
        .where(eq(botStats.id, existingStats.id))
        .returning();
      return updatedStats;
    } else {
      const [newStats] = await db
        .insert(botStats)
        .values(stats)
        .returning();
      return newStats;
    }
  }
}

// Use database storage to persist data
export const storage = new DatabaseStorage();

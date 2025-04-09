import { users, type User, type InsertUser, type BotStats, type InsertBotStats } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getBotStats(): Promise<BotStats>;
  updateBotStats(stats: InsertBotStats): Promise<BotStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private botStats: BotStats;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    // Initialize with some default statistics
    this.botStats = {
      id: 1,
      servers: 5000,
      users: 1500000,
      commandsRun: 10000000,
      uptime: 99
    };
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

export const storage = new MemStorage();

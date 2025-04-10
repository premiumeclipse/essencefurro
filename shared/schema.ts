import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const moderationActionTypeEnum = pgEnum('moderation_action_type', [
  'ban', 'kick', 'mute', 'warn', 'timeout', 'unmute', 'unban'
]);

export const userRoleEnum = pgEnum('user_role', [
  'admin', 'moderator', 'regular'
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  discordId: varchar("discord_id", { length: 255 }).unique(),
  email: varchar("email", { length: 255 }),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").default('regular'),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

// Bot stats table
export const botStats = pgTable("bot_stats", {
  id: serial("id").primaryKey(),
  servers: integer("servers").notNull(),
  users: integer("users").notNull(),
  commandsRun: integer("commands_run").notNull(),
  uptime: integer("uptime").notNull(),
  messageCount: integer("message_count").default(0),
  isOnline: boolean("is_online").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guilds/servers table
export const guilds = pgTable("guilds", {
  id: serial("id").primaryKey(),
  discordId: varchar("discord_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  iconUrl: text("icon_url"),
  memberCount: integer("member_count").default(0),
  ownerDiscordId: varchar("owner_discord_id", { length: 255 }),
  prefix: varchar("prefix", { length: 10 }).default('>'),
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  settings: json("settings").$type<{
    moderationEnabled: boolean;
    welcomeMessage: string | null;
    leaveMessage: string | null;
    welcomeChannelId: string | null;
    logChannelId: string | null;
    autoRoleId: string | null;
    muteRoleId: string | null;
  }>(),
});

// Guild members join table
export const guildMembers = pgTable("guild_members", {
  id: serial("id").primaryKey(),
  guildId: integer("guild_id").notNull().references(() => guilds.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  discordId: varchar("discord_id", { length: 255 }).notNull(),
  nickname: varchar("nickname", { length: 255 }),
  joinedAt: timestamp("joined_at").defaultNow(),
  isAdmin: boolean("is_admin").default(false),
  isModerator: boolean("is_moderator").default(false),
  xp: integer("xp").default(0),
  level: integer("level").default(0),
  lastActive: timestamp("last_active"),
  roles: json("roles").$type<string[]>(), // Array of role IDs
});

// Moderation actions
export const moderationActions = pgTable("moderation_actions", {
  id: serial("id").primaryKey(),
  guildId: integer("guild_id").notNull().references(() => guilds.id, { onDelete: 'cascade' }),
  targetDiscordId: varchar("target_discord_id", { length: 255 }).notNull(),
  moderatorDiscordId: varchar("moderator_discord_id", { length: 255 }),
  type: moderationActionTypeEnum("type").notNull(),
  reason: text("reason"),
  duration: integer("duration"), // in seconds, for timeouts/mutes
  createdAt: timestamp("created_at").defaultNow(),
  active: boolean("active").default(true),
  caseId: integer("case_id").notNull(), // Guild-specific case ID
});

// Custom commands
export const customCommands = pgTable("custom_commands", {
  id: serial("id").primaryKey(),
  guildId: integer("guild_id").notNull().references(() => guilds.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 100 }).notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by", { length: 255 }), // Discord ID of creator
  isEnabled: boolean("is_enabled").default(true),
  usageCount: integer("usage_count").default(0),
});

// Auto-moderation rules
export const autoModRules = pgTable("auto_mod_rules", {
  id: serial("id").primaryKey(),
  guildId: integer("guild_id").notNull().references(() => guilds.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // spam, invites, links, etc.
  enabled: boolean("enabled").default(true),
  action: varchar("action", { length: 50 }).notNull(), // delete, warn, mute, etc.
  duration: integer("duration"), // for timeout/mute actions
  createdAt: timestamp("created_at").defaultNow(),
  settings: json("settings").$type<{
    regex?: string;
    whitelistedRoles?: string[];
    whitelistedChannels?: string[];
    deleteMessage?: boolean;
    notifyUser?: boolean;
  }>(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  guildMembers: many(guildMembers),
}));

export const guildsRelations = relations(guilds, ({ many }) => ({
  members: many(guildMembers),
  moderationActions: many(moderationActions),
  customCommands: many(customCommands),
  autoModRules: many(autoModRules),
}));

export const guildMembersRelations = relations(guildMembers, ({ one }) => ({
  guild: one(guilds, {
    fields: [guildMembers.guildId],
    references: [guilds.id],
  }),
  user: one(users, {
    fields: [guildMembers.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  discordId: true,
  email: true,
  avatarUrl: true,
  role: true,
});

export const insertBotStatsSchema = createInsertSchema(botStats).pick({
  servers: true,
  users: true,
  commandsRun: true,
  uptime: true,
  messageCount: true,
  isOnline: true,
});

export const insertGuildSchema = createInsertSchema(guilds).pick({
  discordId: true,
  name: true,
  iconUrl: true,
  memberCount: true,
  ownerDiscordId: true,
  prefix: true,
  settings: true,
});

export const insertGuildMemberSchema = createInsertSchema(guildMembers).pick({
  guildId: true,
  userId: true,
  discordId: true,
  nickname: true,
  isAdmin: true,
  isModerator: true,
  xp: true,
  level: true,
  roles: true,
});

export const insertModerationActionSchema = createInsertSchema(moderationActions).pick({
  guildId: true,
  targetDiscordId: true,
  moderatorDiscordId: true,
  type: true,
  reason: true,
  duration: true,
  active: true,
  caseId: true,
});

export const insertCustomCommandSchema = createInsertSchema(customCommands).pick({
  guildId: true,
  name: true,
  response: true,
  createdBy: true,
  isEnabled: true,
});

export const insertAutoModRuleSchema = createInsertSchema(autoModRules).pick({
  guildId: true,
  name: true,
  type: true,
  enabled: true,
  action: true,
  duration: true,
  settings: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBotStats = z.infer<typeof insertBotStatsSchema>;
export type BotStats = typeof botStats.$inferSelect;

export type InsertGuild = z.infer<typeof insertGuildSchema>;
export type Guild = typeof guilds.$inferSelect;

export type InsertGuildMember = z.infer<typeof insertGuildMemberSchema>;
export type GuildMember = typeof guildMembers.$inferSelect;

export type InsertModerationAction = z.infer<typeof insertModerationActionSchema>;
export type ModerationAction = typeof moderationActions.$inferSelect;

export type InsertCustomCommand = z.infer<typeof insertCustomCommandSchema>;
export type CustomCommand = typeof customCommands.$inferSelect;

export type InsertAutoModRule = z.infer<typeof insertAutoModRuleSchema>;
export type AutoModRule = typeof autoModRules.$inferSelect;

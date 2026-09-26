import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatarUrl: text("avatar_url"),
  rating: integer("rating").default(1200),
  gamesPlayed: integer("games_played").default(0),
  gamesWon: integer("games_won").default(0),
  stripeCustomerId: text("stripe_customer_id"),
  membershipTier: text("membership_tier").default("free"), // 'free', 'premium', 'platinum'
  membershipExpiresAt: timestamp("membership_expires_at"),
  ownedThemes: text("owned_themes").array().default(sql`ARRAY['saints']::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Games table to track individual game results
export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameMode: integer("game_mode").notNull(), // 8, 16, 32, 48, 64, 96
  playerScore: integer("player_score").notNull(),
  aiScore: integer("ai_score").notNull(),
  aiDifficulty: integer("ai_difficulty").notNull(), // AI ELO rating
  won: integer("won").notNull(), // 1 for win, 0 for loss
  moves: integer("moves").notNull(),
  duration: integer("duration"), // game duration in seconds
  ratingBefore: integer("rating_before").notNull(),
  ratingAfter: integer("rating_after").notNull(),
  ratingChange: integer("rating_change").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGameSchema = createInsertSchema(games).pick({
  userId: true,
  gameMode: true,
  playerScore: true,
  aiScore: true,
  aiDifficulty: true,
  won: true,
  moves: true,
  duration: true,
  ratingBefore: true,
  ratingAfter: true,
  ratingChange: true,
});

// Settings table to store user preferences
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  theme: text("theme").notNull().default("space"), // 'space' (default), 'saints', 'animals', 'barbie', 'puppy', 'santa', 'minecraft'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  theme: true,
});

export const updateSettingsSchema = z.object({
  theme: z.enum(["saints", "animals", "barbie", "puppy", "santa", "space", "minecraft"]),
});

// Tournament Seasons table
export const tournamentSeasons = pgTable("tournament_seasons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  status: text("status").notNull().default("upcoming"), // 'upcoming', 'active', 'completed'
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  boardSize: integer("board_size").notNull().default(16), // default card count for this season
  theme: text("theme").notNull().default("saints"), // theme for tournament matches
  createdAt: timestamp("created_at").defaultNow(),
});

// Tournament Ratings - separate rating per user per season
export const tournamentRatings = pgTable("tournament_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  seasonId: varchar("season_id").notNull().references(() => tournamentSeasons.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull().default(1000),
  matchesPlayed: integer("matches_played").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  lastMatchAt: timestamp("last_match_at"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Tournament Matches - track individual tournament games
export const tournamentMatches = pgTable("tournament_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  seasonId: varchar("season_id").notNull().references(() => tournamentSeasons.id),
  player1Id: varchar("player1_id").notNull().references(() => users.id),
  player2Id: varchar("player2_id").notNull().references(() => users.id),
  boardSize: integer("board_size").notNull(),
  theme: text("theme").notNull(),
  player1Score: integer("player1_score"),
  player2Score: integer("player2_score"),
  winnerId: varchar("winner_id").references(() => users.id),
  player1RatingBefore: integer("player1_rating_before"),
  player1RatingAfter: integer("player1_rating_after"),
  player2RatingBefore: integer("player2_rating_before"),
  player2RatingAfter: integer("player2_rating_after"),
  status: text("status").notNull().default("in_progress"), // 'in_progress', 'completed', 'abandoned'
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertTournamentSeasonSchema = createInsertSchema(tournamentSeasons).pick({
  name: true,
  startsAt: true,
  endsAt: true,
  boardSize: true,
  theme: true,
});

export const insertTournamentRatingSchema = createInsertSchema(tournamentRatings).pick({
  seasonId: true,
  userId: true,
});

export const insertTournamentMatchSchema = createInsertSchema(tournamentMatches).pick({
  seasonId: true,
  player1Id: true,
  player2Id: true,
  boardSize: true,
  theme: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
export type TournamentSeason = typeof tournamentSeasons.$inferSelect;
export type InsertTournamentSeason = z.infer<typeof insertTournamentSeasonSchema>;
export type TournamentRating = typeof tournamentRatings.$inferSelect;
export type InsertTournamentRating = z.infer<typeof insertTournamentRatingSchema>;
export type TournamentMatch = typeof tournamentMatches.$inferSelect;
export type InsertTournamentMatch = z.infer<typeof insertTournamentMatchSchema>;

// Friendships table - one row per friend request/relationship
export const friendships = pgTable("friendships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  addresseeId: varchar("addressee_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"), // 'pending' | 'accepted'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFriendshipSchema = createInsertSchema(friendships).pick({
  requesterId: true,
  addresseeId: true,
});

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;

// Daily Challenge definitions - one per calendar date (shared across users)
export const dailyChallenges = pgTable("daily_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeDate: text("challenge_date").notNull().unique(), // YYYY-MM-DD
  seed: integer("seed").notNull(),
  boardSize: integer("board_size").notNull().default(16),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).pick({
  challengeDate: true,
  seed: true,
  boardSize: true,
});

// Per-user completion records - one row per user per local-day completed
export const dailyChallengeCompletions = pgTable("daily_challenge_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeDate: text("challenge_date").notNull(), // user's local YYYY-MM-DD
  playerScore: integer("player_score").notNull(),
  aiScore: integer("ai_score").notNull(),
  won: integer("won").notNull(),
  moves: integer("moves").notNull(),
  duration: integer("duration").notNull().default(0),
  timeZone: text("time_zone").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
}, (t) => ({
  userDateUnique: uniqueIndex("daily_completion_user_date_unique").on(t.userId, t.challengeDate),
}));

export const insertDailyChallengeCompletionSchema = createInsertSchema(dailyChallengeCompletions).pick({
  userId: true,
  challengeDate: true,
  playerScore: true,
  aiScore: true,
  won: true,
  moves: true,
  duration: true,
  timeZone: true,
});

// Per-user streak state - one row per user
export const userStreaks = pgTable("user_streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastCompletedDate: text("last_completed_date"), // YYYY-MM-DD local
  freezesAvailable: integer("freezes_available").notNull().default(1),
  freezeWeekStart: text("freeze_week_start"), // YYYY-MM-DD (Mon) of current freeze week
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserStreakSchema = createInsertSchema(userStreaks).pick({
  userId: true,
});

// Earned streak milestone badges - one row per user per milestone earned
export const streakBadges = pgTable("streak_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  milestone: integer("milestone").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
}, (t) => ({
  userMilestoneUnique: uniqueIndex("streak_badge_user_milestone_unique").on(t.userId, t.milestone),
}));

export const insertStreakBadgeSchema = createInsertSchema(streakBadges).pick({
  userId: true,
  milestone: true,
});

export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type DailyChallengeCompletion = typeof dailyChallengeCompletions.$inferSelect;
export type InsertDailyChallengeCompletion = z.infer<typeof insertDailyChallengeCompletionSchema>;
export type UserStreak = typeof userStreaks.$inferSelect;
export type InsertUserStreak = z.infer<typeof insertUserStreakSchema>;
export type StreakBadge = typeof streakBadges.$inferSelect;
export type InsertStreakBadge = z.infer<typeof insertStreakBadgeSchema>;

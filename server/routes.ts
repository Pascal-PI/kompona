import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, updateSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { getRatingTier, getNextTierProgress } from "@shared/rating";
import {
  DAILY_CHALLENGE_AI_DIFFICULTY,
  getDateInTimeZone,
  getNextMilestone,
  getHighestMilestoneAchieved,
  isValidIanaTimeZone,
  STREAK_MILESTONES,
} from "@shared/streak";

// Session middleware
function setupSession(app: Express) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      },
    })
  );
}

// Auth middleware to check if user is logged in
function isAuthenticated(req: any, res: any, next: any) {
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupSession(app);

  // Get current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Register new user
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(userData);
      
      // Log user in after registration
      (req as any).session.userId = user.id;
      
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login user
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await storage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      (req as any).session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout user
  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Update avatar (750KB limit to account for base64 encoding overhead from 500KB files)
  const updateAvatarSchema = z.object({
    avatarUrl: z.string().max(750000).nullable(),
  });

  app.patch('/api/user/avatar', isAuthenticated, async (req: any, res) => {
    try {
      const { avatarUrl } = updateAvatarSchema.parse(req.body);
      
      const user = await storage.updateUserAvatar(req.session.userId, avatarUrl);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid avatar data", errors: error.errors });
      }
      console.error("Avatar update error:", error);
      res.status(500).json({ message: "Failed to update avatar" });
    }
  });

  // Game result schema
  const gameResultSchema = z.object({
    gameMode: z.number().min(8).max(96),
    playerScore: z.number().min(0),
    aiScore: z.number().min(0),
    aiDifficulty: z.number().min(100).max(3000),
    moves: z.number().min(1),
    duration: z.number().optional(),
  });

  // Record game result and update rating
  app.post('/api/games/result', isAuthenticated, async (req: any, res) => {
    try {
      const gameData = gameResultSchema.parse(req.body);
      
      const result = await storage.recordGameResult({
        userId: req.session.userId,
        ...gameData,
      });

      // Add rating tier information
      const ratingInfo = getRatingTier(result.user.rating!);
      const progressInfo = getNextTierProgress(result.user.rating!);

      res.json({
        game: result.game,
        user: result.user,
        ratingInfo: {
          ...ratingInfo,
          ...progressInfo,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid game data", errors: error.errors });
      }
      console.error("Game result error:", error);
      res.status(500).json({ message: "Failed to record game result" });
    }
  });

  // Get user's recent games
  app.get('/api/games/history', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const games = await storage.getUserGames(req.session.userId, limit);
      res.json(games);
    } catch (error) {
      console.error("Game history error:", error);
      res.status(500).json({ message: "Failed to fetch game history" });
    }
  });

  // Get user rating info
  app.get('/api/user/rating', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const rating = user.rating || 1200;
      const ratingInfo = getRatingTier(rating);
      const progressInfo = getNextTierProgress(rating);

      res.json({
        rating,
        gamesPlayed: user.gamesPlayed || 0,
        gamesWon: user.gamesWon || 0,
        winRate: user.gamesPlayed ? ((user.gamesWon || 0) / user.gamesPlayed * 100).toFixed(1) : "0.0",
        ratingInfo: {
          ...ratingInfo,
          ...progressInfo,
        },
      });
    } catch (error) {
      console.error("Rating info error:", error);
      res.status(500).json({ message: "Failed to fetch rating info" });
    }
  });

  // Get leaderboard
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const leaderboard = await storage.getLeaderboard(limit);
      const summaries = await storage.getStreakSummariesForUsers(leaderboard.map(p => p.id));

      const leaderboardWithTiers = leaderboard.map((player, index) => ({
        ...player,
        rank: index + 1,
        tier: getRatingTier(player.rating).tier,
        currentStreak: summaries[player.id]?.currentStreak ?? 0,
        longestStreak: summaries[player.id]?.longestStreak ?? 0,
        highestMilestone: summaries[player.id]?.highestMilestone ?? null,
      }));

      res.json(leaderboardWithTiers);
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Streak leaderboard
  app.get('/api/streaks/leaderboard', async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const leaderboard = await storage.getStreakLeaderboard(limit);
      const withRank = leaderboard.map((player, index) => ({
        ...player,
        rank: index + 1,
      }));
      res.json(withRank);
    } catch (error) {
      console.error("Streak leaderboard error:", error);
      res.status(500).json({ message: "Failed to fetch streak leaderboard" });
    }
  });

  // Daily Challenge: get today's challenge and user's status
  const dailyTodayQuerySchema = z.object({
    timeZone: z.string().min(1).max(64),
  });

  app.get('/api/daily/today', isAuthenticated, async (req: any, res) => {
    try {
      const { timeZone } = dailyTodayQuerySchema.parse({ timeZone: req.query.timeZone });
      if (!isValidIanaTimeZone(timeZone)) {
        return res.status(400).json({ message: "Invalid time zone" });
      }
      const todayLocal = getDateInTimeZone(new Date(), timeZone);
      const challenge = await storage.getOrCreateDailyChallenge(todayLocal);
      const completion = await storage.getDailyChallengeCompletion(req.session.userId, todayLocal);
      const streak = await storage.getOrCreateUserStreak(req.session.userId);
      const badges = await storage.getUserStreakBadges(req.session.userId);

      res.json({
        challenge: {
          challengeDate: challenge.challengeDate,
          seed: challenge.seed,
          boardSize: challenge.boardSize,
          aiDifficulty: DAILY_CHALLENGE_AI_DIFFICULTY,
        },
        completion: completion ? {
          playerScore: completion.playerScore,
          aiScore: completion.aiScore,
          won: completion.won === 1,
          moves: completion.moves,
          duration: completion.duration,
          completedAt: completion.completedAt,
        } : null,
        streak: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          freezesAvailable: streak.freezesAvailable,
          lastCompletedDate: streak.lastCompletedDate,
          nextMilestone: getNextMilestone(streak.currentStreak),
          highestMilestone: getHighestMilestoneAchieved(badges.map(b => b.milestone)),
          earnedMilestones: badges.map(b => b.milestone),
        },
        milestones: STREAK_MILESTONES,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid time zone parameter" });
      }
      console.error("Daily today error:", error);
      res.status(500).json({ message: "Failed to fetch daily challenge" });
    }
  });

  // Daily Challenge: submit completion
  const dailyCompleteSchema = z.object({
    timeZone: z.string().min(1).max(64),
    playerScore: z.number().int().min(0).max(64),
    aiScore: z.number().int().min(0).max(64),
    moves: z.number().int().min(1).max(10000),
    duration: z.number().int().min(0).max(86400),
  });

  app.post('/api/daily/complete', isAuthenticated, async (req: any, res) => {
    try {
      const data = dailyCompleteSchema.parse(req.body);
      if (!isValidIanaTimeZone(data.timeZone)) {
        return res.status(400).json({ message: "Invalid time zone" });
      }
      const todayLocal = getDateInTimeZone(new Date(), data.timeZone);

      const result = await storage.recordDailyChallengeCompletion({
        userId: req.session.userId,
        challengeDate: todayLocal,
        timeZone: data.timeZone,
        playerScore: data.playerScore,
        aiScore: data.aiScore,
        moves: data.moves,
        duration: data.duration,
      });

      res.json({
        completion: {
          playerScore: result.completion.playerScore,
          aiScore: result.completion.aiScore,
          won: result.completion.won === 1,
          moves: result.completion.moves,
          duration: result.completion.duration,
          completedAt: result.completion.completedAt,
        },
        streak: {
          currentStreak: result.streak.currentStreak,
          longestStreak: result.streak.longestStreak,
          freezesAvailable: result.streak.freezesAvailable,
          lastCompletedDate: result.streak.lastCompletedDate,
          nextMilestone: getNextMilestone(result.streak.currentStreak),
          highestMilestone: getHighestMilestoneAchieved(result.badges.map(b => b.milestone)),
          earnedMilestones: result.badges.map(b => b.milestone),
        },
        update: {
          freezeUsed: result.update.freezeUsed,
          alreadyCompletedToday: result.update.alreadyCompletedToday,
          newMilestones: result.update.newMilestones,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid completion data", errors: error.errors });
      }
      console.error("Daily complete error:", error);
      res.status(500).json({ message: "Failed to record daily challenge completion" });
    }
  });

  // Get user settings
  app.get('/api/user/settings', isAuthenticated, async (req: any, res) => {
    try {
      let userSettings = await storage.getUserSettings(req.session.userId);
      
      // If no settings exist, create default settings
      if (!userSettings) {
        userSettings = await storage.createUserSettings({
          userId: req.session.userId,
          theme: 'space', // Default theme
        });
      }

      res.json(userSettings);
    } catch (error) {
      console.error("Settings retrieval error:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Update user settings
  app.put('/api/user/settings', isAuthenticated, async (req: any, res) => {
    try {
      const settingsData = updateSettingsSchema.parse(req.body);
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const requestedTheme = settingsData.theme;
      
      const FREE_THEMES = ['saints', 'space'];
      if (!FREE_THEMES.includes(requestedTheme)) {
        const hasMembership = (user.membershipTier === 'premium' || user.membershipTier === 'platinum') && 
          user.membershipExpiresAt && 
          new Date(user.membershipExpiresAt) > new Date();
        
        const ownedThemes = user.ownedThemes || ['saints'];
        
        if (!hasMembership && !ownedThemes.includes(requestedTheme)) {
          return res.status(403).json({ 
            message: "Theme not owned. Please purchase this theme from the store." 
          });
        }
      }
      
      const updatedSettings = await storage.updateUserSettings(req.session.userId, settingsData);
      
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      console.error("Settings update error:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Get detailed user statistics
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getUserStats(req.session.userId);
      res.json(stats);
    } catch (error) {
      console.error("User stats error:", error);
      res.status(500).json({ message: "Failed to fetch user statistics" });
    }
  });

  // Get user entitlements (owned themes and membership status)
  app.get('/api/user/entitlements', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const membershipActive = (user.membershipTier === 'premium' || user.membershipTier === 'platinum') && 
        user.membershipExpiresAt && 
        new Date(user.membershipExpiresAt) > new Date();

      res.json({
        ownedThemes: user.ownedThemes || ['saints'],
        membershipTier: membershipActive ? user.membershipTier : 'free',
        membershipExpiresAt: user.membershipExpiresAt,
        allThemesUnlocked: membershipActive,
        hasTournamentAccess: user.membershipTier === 'platinum' && membershipActive
      });
    } catch (error) {
      console.error("Entitlements error:", error);
      res.status(500).json({ message: "Failed to fetch entitlements" });
    }
  });

  app.get('/api/ws/token', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      const expiresAt = Date.now() + 60000;
      
      if (!global.wsTokens) {
        global.wsTokens = new Map();
      }
      global.wsTokens.set(token, { userId, expiresAt });
      
      setTimeout(() => {
        global.wsTokens?.delete(token);
      }, 60000);
      
      res.json({ token });
    } catch (error) {
      console.error("WS token error:", error);
      res.status(500).json({ message: "Failed to generate token" });
    }
  });

  // Tournament Routes
  
  // Get all tournament seasons
  app.get('/api/tournaments/seasons', async (req, res) => {
    try {
      const seasons = await storage.getAllTournamentSeasons();
      const activeSeason = await storage.getActiveTournamentSeason();
      res.json({ 
        seasons, 
        activeSeasonId: activeSeason?.id || null 
      });
    } catch (error) {
      console.error("Tournament seasons error:", error);
      res.status(500).json({ message: "Failed to fetch tournament seasons" });
    }
  });

  // Get active tournament season
  app.get('/api/tournaments/active', async (req, res) => {
    try {
      const season = await storage.getActiveTournamentSeason();
      if (!season) {
        return res.json({ season: null });
      }
      res.json({ season });
    } catch (error) {
      console.error("Active tournament error:", error);
      res.status(500).json({ message: "Failed to fetch active tournament" });
    }
  });

  // Join active tournament (Platinum only)
  app.post('/api/tournaments/join', isAuthenticated, async (req: any, res) => {
    try {
      // Check if user has Platinum membership
      const user = await storage.getUser(req.session.userId);
      if (!user || user.membershipTier !== 'platinum') {
        return res.status(403).json({ message: "Tournament access requires Platinum membership" });
      }

      const season = await storage.getActiveTournamentSeason();
      if (!season) {
        return res.status(400).json({ message: "No active tournament season" });
      }

      const rating = await storage.joinTournament(season.id, req.session.userId);
      res.json({ 
        success: true, 
        rating,
        seasonId: season.id,
        seasonName: season.name
      });
    } catch (error) {
      console.error("Tournament join error:", error);
      res.status(500).json({ message: "Failed to join tournament" });
    }
  });

  // Get user's tournament rating for active season
  app.get('/api/tournaments/my-rating', isAuthenticated, async (req: any, res) => {
    try {
      const season = await storage.getActiveTournamentSeason();
      if (!season) {
        return res.json({ joined: false, season: null });
      }

      const rating = await storage.getUserTournamentRating(season.id, req.session.userId);
      if (!rating) {
        return res.json({ joined: false, season });
      }

      res.json({ 
        joined: true, 
        season,
        rating: rating.rating,
        matchesPlayed: rating.matchesPlayed,
        wins: rating.wins,
        losses: rating.losses,
        bestStreak: rating.bestStreak,
        currentStreak: rating.currentStreak
      });
    } catch (error) {
      console.error("Tournament rating error:", error);
      res.status(500).json({ message: "Failed to fetch tournament rating" });
    }
  });

  // Get tournament leaderboard
  app.get('/api/tournaments/leaderboard', async (req, res) => {
    try {
      const seasonId = req.query.seasonId as string;
      let targetSeasonId = seasonId;

      if (!targetSeasonId) {
        const activeSeason = await storage.getActiveTournamentSeason();
        if (!activeSeason) {
          return res.json({ leaderboard: [], season: null });
        }
        targetSeasonId = activeSeason.id;
      }

      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const leaderboard = await storage.getTournamentLeaderboard(targetSeasonId, limit);
      
      // Get season info
      const seasons = await storage.getAllTournamentSeasons();
      const season = seasons.find(s => s.id === targetSeasonId);

      res.json({ leaderboard, season });
    } catch (error) {
      console.error("Tournament leaderboard error:", error);
      res.status(500).json({ message: "Failed to fetch tournament leaderboard" });
    }
  });

  // Get user's tournament match history
  app.get('/api/tournaments/matches', isAuthenticated, async (req: any, res) => {
    try {
      const seasonId = req.query.seasonId as string;
      let targetSeasonId = seasonId;

      if (!targetSeasonId) {
        const activeSeason = await storage.getActiveTournamentSeason();
        if (!activeSeason) {
          return res.json({ matches: [] });
        }
        targetSeasonId = activeSeason.id;
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const matches = await storage.getUserTournamentMatches(targetSeasonId, req.session.userId, limit);
      res.json({ matches });
    } catch (error) {
      console.error("Tournament matches error:", error);
      res.status(500).json({ message: "Failed to fetch tournament matches" });
    }
  });

  // Create a new tournament season (admin only - for now just allow it)
  app.post('/api/tournaments/seasons', isAuthenticated, async (req: any, res) => {
    try {
      const { name, startsAt, endsAt, boardSize, theme } = req.body;
      
      if (!name || !startsAt || !endsAt) {
        return res.status(400).json({ message: "Name, start date, and end date are required" });
      }

      const season = await storage.createTournamentSeason({
        name,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        boardSize: boardSize || 16,
        theme: theme || 'saints'
      });

      res.json({ season });
    } catch (error) {
      console.error("Create tournament error:", error);
      res.status(500).json({ message: "Failed to create tournament season" });
    }
  });

  // Friend Routes

  // Search users (for sending friend requests)
  app.get('/api/users/search', isAuthenticated, async (req: any, res) => {
    try {
      const q = (req.query.q as string) || '';
      if (q.trim().length < 2) {
        return res.json({ users: [] });
      }
      const users = await storage.searchUsers(q, req.session.userId, 10);
      res.json({ users });
    } catch (error) {
      console.error("User search error:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Get friends list
  app.get('/api/friends', isAuthenticated, async (req: any, res) => {
    try {
      const friends = await storage.getFriends(req.session.userId);
      res.json({ friends });
    } catch (error) {
      console.error("Get friends error:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  // Get incoming and outgoing friend requests
  app.get('/api/friends/requests', isAuthenticated, async (req: any, res) => {
    try {
      const [incoming, outgoing] = await Promise.all([
        storage.getIncomingFriendRequests(req.session.userId),
        storage.getOutgoingFriendRequests(req.session.userId),
      ]);
      res.json({ incoming, outgoing });
    } catch (error) {
      console.error("Get requests error:", error);
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  // Send a friend request
  app.post('/api/friends/request', isAuthenticated, async (req: any, res) => {
    try {
      const schema = z.object({ addresseeId: z.string().min(1) });
      const { addresseeId } = schema.parse(req.body);
      const friendship = await storage.sendFriendRequest(req.session.userId, addresseeId);
      res.json({ friendship });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request" });
      }
      console.error("Send friend request error:", error);
      res.status(400).json({ message: error.message || "Failed to send friend request" });
    }
  });

  // Accept a friend request
  app.post('/api/friends/accept/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updated = await storage.acceptFriendRequest(req.params.id, req.session.userId);
      if (!updated) {
        return res.status(404).json({ message: "Friend request not found" });
      }
      res.json({ friendship: updated });
    } catch (error) {
      console.error("Accept friend request error:", error);
      res.status(500).json({ message: "Failed to accept friend request" });
    }
  });

  // Decline an incoming request OR cancel an outgoing request
  app.delete('/api/friends/request/:id', isAuthenticated, async (req: any, res) => {
    try {
      const ok = await storage.declineOrCancelFriendRequest(req.params.id, req.session.userId);
      if (!ok) return res.status(404).json({ message: "Request not found" });
      res.json({ success: true });
    } catch (error) {
      console.error("Decline/cancel friend request error:", error);
      res.status(500).json({ message: "Failed to remove request" });
    }
  });

  // Remove an existing friend
  app.delete('/api/friends/:friendId', isAuthenticated, async (req: any, res) => {
    try {
      const ok = await storage.removeFriend(req.session.userId, req.params.friendId);
      if (!ok) return res.status(404).json({ message: "Friendship not found" });
      res.json({ success: true });
    } catch (error) {
      console.error("Remove friend error:", error);
      res.status(500).json({ message: "Failed to remove friend" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

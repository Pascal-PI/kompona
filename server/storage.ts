import { users, games, settings, tournamentSeasons, tournamentRatings, tournamentMatches, friendships, dailyChallenges, dailyChallengeCompletions, userStreaks, streakBadges, type User, type InsertUser, type Game, type InsertGame, type Settings, type InsertSettings, type UpdateSettings, type TournamentSeason, type TournamentRating, type TournamentMatch, type Friendship, type DailyChallenge, type DailyChallengeCompletion, type UserStreak, type StreakBadge } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, inArray } from "drizzle-orm";
import bcrypt from "bcrypt";
import { calculateRatingChange } from "@shared/rating";
import {
  applyDailyCompletion,
  dailyChallengeSeed,
  DAILY_CHALLENGE_BOARD_SIZE,
  type StreakState,
  type StreakUpdateResult,
} from "@shared/streak";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  recordGameResult(gameData: {
    userId: string;
    gameMode: number;
    playerScore: number;
    aiScore: number;
    aiDifficulty: number;
    moves: number;
    duration?: number;
  }): Promise<{ game: Game; user: User }>;
  getUserGames(userId: string, limit?: number): Promise<Game[]>;
  updateUserRating(userId: string, newRating: number, gamesPlayed: number, gamesWon: number): Promise<User>;
  getUserSettings(userId: string): Promise<Settings | undefined>;
  createUserSettings(settingsData: InsertSettings): Promise<Settings>;
  updateUserSettings(userId: string, settingsData: UpdateSettings): Promise<Settings>;
  getUserStats(userId: string): Promise<any>;
  updateUserStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User>;
  updateUserMembership(userId: string, membershipTier: string, membershipExpiresAt: Date): Promise<User>;
  addUserTheme(userId: string, theme: string): Promise<User>;
  updateUserOnlineStats(userId: string, stats: { eloChange: number; won: boolean; lost: boolean; drawn: boolean }): Promise<User>;
  updateUserAvatar(userId: string, avatarUrl: string | null): Promise<User | undefined>;
  getLeaderboard(limit?: number): Promise<{ id: string; username: string; rating: number; gamesPlayed: number; gamesWon: number; membershipTier: string; avatarUrl: string | null }[]>;
  
  // Tournament methods
  getActiveTournamentSeason(): Promise<TournamentSeason | undefined>;
  getAllTournamentSeasons(): Promise<TournamentSeason[]>;
  createTournamentSeason(data: { name: string; startsAt: Date; endsAt: Date; boardSize?: number; theme?: string }): Promise<TournamentSeason>;
  updateTournamentSeasonStatus(seasonId: string, status: string): Promise<TournamentSeason>;
  joinTournament(seasonId: string, userId: string): Promise<TournamentRating>;
  getUserTournamentRating(seasonId: string, userId: string): Promise<TournamentRating | undefined>;
  getTournamentLeaderboard(seasonId: string, limit?: number): Promise<{ id: string; rank: number; username: string; rating: number; matchesPlayed: number; wins: number; losses: number; winRate: number; bestStreak: number; membershipTier: string }[]>;
  recordTournamentMatch(data: { seasonId: string; player1Id: string; player2Id: string; boardSize: number; theme: string; player1Score: number; player2Score: number; winnerId: string | null }): Promise<TournamentMatch>;
  getUserTournamentMatches(seasonId: string, userId: string, limit?: number): Promise<TournamentMatch[]>;

  // Friend methods
  searchUsers(query: string, excludeUserId: string, limit?: number): Promise<{ id: string; username: string; avatarUrl: string | null; rating: number }[]>;
  sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship>;
  acceptFriendRequest(requestId: string, userId: string): Promise<Friendship | undefined>;
  declineOrCancelFriendRequest(requestId: string, userId: string): Promise<boolean>;
  removeFriend(userId: string, friendId: string): Promise<boolean>;
  getFriends(userId: string): Promise<{ id: string; username: string; avatarUrl: string | null; rating: number; membershipTier: string; friendshipId: string }[]>;
  getIncomingFriendRequests(userId: string): Promise<{ friendshipId: string; id: string; username: string; avatarUrl: string | null; rating: number; createdAt: Date | null }[]>;
  getOutgoingFriendRequests(userId: string): Promise<{ friendshipId: string; id: string; username: string; avatarUrl: string | null; rating: number; createdAt: Date | null }[]>;

  // Daily Challenge & Streak methods
  getOrCreateDailyChallenge(challengeDate: string): Promise<DailyChallenge>;
  getDailyChallengeCompletion(userId: string, challengeDate: string): Promise<DailyChallengeCompletion | undefined>;
  getOrCreateUserStreak(userId: string): Promise<UserStreak>;
  getUserStreakBadges(userId: string): Promise<StreakBadge[]>;
  recordDailyChallengeCompletion(args: {
    userId: string;
    challengeDate: string;
    timeZone: string;
    playerScore: number;
    aiScore: number;
    moves: number;
    duration: number;
  }): Promise<{
    completion: DailyChallengeCompletion;
    streak: UserStreak;
    badges: StreakBadge[];
    update: StreakUpdateResult;
    challenge: DailyChallenge;
  }>;
  getStreakLeaderboard(limit?: number): Promise<{ id: string; username: string; avatarUrl: string | null; membershipTier: string; currentStreak: number; longestStreak: number; highestMilestone: number | null }[]>;
  getStreakSummariesForUsers(userIds: string[]): Promise<Record<string, { currentStreak: number; longestStreak: number; highestMilestone: number | null }>>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async recordGameResult(gameData: {
    userId: string;
    gameMode: number;
    playerScore: number;
    aiScore: number;
    aiDifficulty: number;
    moves: number;
    duration?: number;
  }): Promise<{ game: Game; user: User }> {
    // Get current user for rating calculation
    const currentUser = await this.getUser(gameData.userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    const playerWon = gameData.playerScore > gameData.aiScore;
    const currentRating = currentUser.rating || 1200;
    
    // Calculate new rating
    const ratingResult = calculateRatingChange(
      currentRating,
      gameData.aiDifficulty,
      playerWon,
      gameData.gameMode
    );

    // Insert game record
    const [game] = await db
      .insert(games)
      .values({
        userId: gameData.userId,
        gameMode: gameData.gameMode,
        playerScore: gameData.playerScore,
        aiScore: gameData.aiScore,
        aiDifficulty: gameData.aiDifficulty,
        won: playerWon ? 1 : 0,
        moves: gameData.moves,
        duration: gameData.duration,
        ratingBefore: currentRating,
        ratingAfter: ratingResult.newRating,
        ratingChange: ratingResult.ratingChange,
      })
      .returning();

    // Update user stats
    const newGamesPlayed = (currentUser.gamesPlayed || 0) + 1;
    const newGamesWon = (currentUser.gamesWon || 0) + (playerWon ? 1 : 0);
    
    const updatedUser = await this.updateUserRating(
      gameData.userId,
      ratingResult.newRating,
      newGamesPlayed,
      newGamesWon
    );

    return { game, user: updatedUser };
  }

  async getUserGames(userId: string, limit: number = 10): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .where(eq(games.userId, userId))
      .orderBy(desc(games.createdAt))
      .limit(limit);
  }

  async updateUserRating(userId: string, newRating: number, gamesPlayed: number, gamesWon: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        rating: newRating,
        gamesPlayed: gamesPlayed,
        gamesWon: gamesWon,
      })
      .where(eq(users.id, userId))
      .returning();

    return user;
  }

  async getUserSettings(userId: string): Promise<Settings | undefined> {
    const [userSettings] = await db.select().from(settings).where(eq(settings.userId, userId));
    return userSettings;
  }

  async createUserSettings(settingsData: InsertSettings): Promise<Settings> {
    const [userSettings] = await db
      .insert(settings)
      .values(settingsData)
      .returning();
    return userSettings;
  }

  async updateUserSettings(userId: string, settingsData: UpdateSettings): Promise<Settings> {
    // First try to update existing settings
    const [updated] = await db
      .update(settings)
      .set({
        ...settingsData,
        updatedAt: new Date(),
      })
      .where(eq(settings.userId, userId))
      .returning();

    // If no settings exist, create them
    if (!updated) {
      return await this.createUserSettings({
        userId,
        theme: settingsData.theme,
      });
    }

    return updated;
  }

  async getUserStats(userId: string): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) {
      return null;
    }

    const allGames = await db
      .select()
      .from(games)
      .where(eq(games.userId, userId))
      .orderBy(desc(games.createdAt));

    if (allGames.length === 0) {
      return {
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        winRate: 0,
        totalMatches: 0,
        totalMoves: 0,
        avgMovesPerGame: 0,
        avgGameDuration: 0,
        bestStreak: 0,
        currentStreak: 0,
        favoriteMode: null,
        performanceByDifficulty: {},
        performanceByMode: {},
        recentGames: [],
      };
    }

    // Calculate statistics
    const totalWins = allGames.filter(g => g.won === 1).length;
    const totalLosses = allGames.length - totalWins;
    const winRate = (totalWins / allGames.length) * 100;
    const totalMatches = allGames.reduce((sum, g) => sum + g.playerScore + g.aiScore, 0);
    const totalMoves = allGames.reduce((sum, g) => sum + g.moves, 0);
    const avgMovesPerGame = totalMoves / allGames.length;
    const gamesWithDuration = allGames.filter(g => g.duration);
    const avgGameDuration = gamesWithDuration.length > 0
      ? gamesWithDuration.reduce((sum, g) => sum + (g.duration || 0), 0) / gamesWithDuration.length
      : 0;

    // Calculate streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < allGames.length; i++) {
      if (allGames[i].won === 1) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak; // Most recent games are first
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Find favorite mode
    const modeCount: { [key: number]: number } = {};
    allGames.forEach(g => {
      modeCount[g.gameMode] = (modeCount[g.gameMode] || 0) + 1;
    });
    const favoriteMode = Object.keys(modeCount).reduce((a, b) => 
      modeCount[Number(a)] > modeCount[Number(b)] ? a : b
    );

    // Performance by difficulty
    const performanceByDifficulty: { [key: string]: { wins: number; total: number; winRate: number } } = {};
    allGames.forEach(g => {
      const difficultyBracket = Math.floor(g.aiDifficulty / 500) * 500;
      const key = `${difficultyBracket}-${difficultyBracket + 499}`;
      if (!performanceByDifficulty[key]) {
        performanceByDifficulty[key] = { wins: 0, total: 0, winRate: 0 };
      }
      performanceByDifficulty[key].total++;
      if (g.won === 1) performanceByDifficulty[key].wins++;
      performanceByDifficulty[key].winRate = (performanceByDifficulty[key].wins / performanceByDifficulty[key].total) * 100;
    });

    // Performance by mode
    const performanceByMode: { [key: number]: { wins: number; total: number; winRate: number } } = {};
    allGames.forEach(g => {
      if (!performanceByMode[g.gameMode]) {
        performanceByMode[g.gameMode] = { wins: 0, total: 0, winRate: 0 };
      }
      performanceByMode[g.gameMode].total++;
      if (g.won === 1) performanceByMode[g.gameMode].wins++;
      performanceByMode[g.gameMode].winRate = (performanceByMode[g.gameMode].wins / performanceByMode[g.gameMode].total) * 100;
    });

    return {
      totalGames: allGames.length,
      totalWins,
      totalLosses,
      winRate: parseFloat(winRate.toFixed(1)),
      totalMatches,
      totalMoves,
      avgMovesPerGame: parseFloat(avgMovesPerGame.toFixed(1)),
      avgGameDuration: parseFloat(avgGameDuration.toFixed(1)),
      bestStreak,
      currentStreak,
      favoriteMode: Number(favoriteMode),
      performanceByDifficulty,
      performanceByMode,
      recentGames: allGames.slice(0, 5),
    };
  }

  async updateUserStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserMembership(userId: string, membershipTier: string, membershipExpiresAt: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ membershipTier, membershipExpiresAt })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async addUserTheme(userId: string, theme: string): Promise<User> {
    const currentUser = await this.getUser(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    const currentThemes = currentUser.ownedThemes || ['saints'];
    if (currentThemes.includes(theme)) {
      return currentUser;
    }

    const newThemes = [...currentThemes, theme];
    const [user] = await db
      .update(users)
      .set({ ownedThemes: newThemes })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserOnlineStats(userId: string, stats: { eloChange: number; won: boolean; lost: boolean; drawn: boolean }): Promise<User> {
    const currentUser = await this.getUser(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    const newRating = Math.max(100, (currentUser.rating || 1000) + stats.eloChange);
    const newGamesPlayed = (currentUser.gamesPlayed || 0) + 1;
    const newGamesWon = (currentUser.gamesWon || 0) + (stats.won ? 1 : 0);

    const [user] = await db
      .update(users)
      .set({
        rating: newRating,
        gamesPlayed: newGamesPlayed,
        gamesWon: newGamesWon,
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserAvatar(userId: string, avatarUrl: string | null): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ avatarUrl })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getLeaderboard(limit: number = 50): Promise<{ id: string; username: string; rating: number; gamesPlayed: number; gamesWon: number; membershipTier: string; avatarUrl: string | null }[]> {
    const topPlayers = await db
      .select({
        id: users.id,
        username: users.username,
        rating: users.rating,
        gamesPlayed: users.gamesPlayed,
        gamesWon: users.gamesWon,
        membershipTier: users.membershipTier,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .orderBy(desc(users.rating))
      .limit(limit);
    
    return topPlayers.map(player => ({
      id: player.id,
      username: player.username,
      rating: player.rating || 1200,
      gamesPlayed: player.gamesPlayed || 0,
      gamesWon: player.gamesWon || 0,
      membershipTier: player.membershipTier || 'free',
      avatarUrl: player.avatarUrl ?? null,
    }));
  }

  // Tournament Methods
  async getActiveTournamentSeason(): Promise<TournamentSeason | undefined> {
    const now = new Date();
    const [season] = await db
      .select()
      .from(tournamentSeasons)
      .where(eq(tournamentSeasons.status, 'active'));
    
    // Also auto-update status based on dates
    if (!season) {
      // Check if there's an upcoming season that should be active
      const [upcomingSeason] = await db
        .select()
        .from(tournamentSeasons)
        .where(and(
          eq(tournamentSeasons.status, 'upcoming'),
          sql`${tournamentSeasons.startsAt} <= ${now}`
        ));
      
      if (upcomingSeason) {
        return await this.updateTournamentSeasonStatus(upcomingSeason.id, 'active');
      }
    }
    
    return season;
  }

  async getAllTournamentSeasons(): Promise<TournamentSeason[]> {
    return await db
      .select()
      .from(tournamentSeasons)
      .orderBy(desc(tournamentSeasons.startsAt));
  }

  async createTournamentSeason(data: { name: string; startsAt: Date; endsAt: Date; boardSize?: number; theme?: string }): Promise<TournamentSeason> {
    const [season] = await db
      .insert(tournamentSeasons)
      .values({
        name: data.name,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        boardSize: data.boardSize || 16,
        theme: data.theme || 'saints',
        status: new Date() >= data.startsAt ? 'active' : 'upcoming',
      })
      .returning();
    return season;
  }

  async updateTournamentSeasonStatus(seasonId: string, status: string): Promise<TournamentSeason> {
    const [season] = await db
      .update(tournamentSeasons)
      .set({ status })
      .where(eq(tournamentSeasons.id, seasonId))
      .returning();
    return season;
  }

  async joinTournament(seasonId: string, userId: string): Promise<TournamentRating> {
    // Check if already joined
    const existing = await this.getUserTournamentRating(seasonId, userId);
    if (existing) {
      return existing;
    }

    const [rating] = await db
      .insert(tournamentRatings)
      .values({
        seasonId,
        userId,
        rating: 1000,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        bestStreak: 0,
        currentStreak: 0,
      })
      .returning();
    return rating;
  }

  async getUserTournamentRating(seasonId: string, userId: string): Promise<TournamentRating | undefined> {
    const [rating] = await db
      .select()
      .from(tournamentRatings)
      .where(and(
        eq(tournamentRatings.seasonId, seasonId),
        eq(tournamentRatings.userId, userId)
      ));
    return rating;
  }

  async getTournamentLeaderboard(seasonId: string, limit: number = 50): Promise<{ id: string; rank: number; username: string; rating: number; matchesPlayed: number; wins: number; losses: number; winRate: number; bestStreak: number; membershipTier: string }[]> {
    const ratings = await db
      .select({
        odUserId: tournamentRatings.userId,
        odUsername: users.username,
        odRating: tournamentRatings.rating,
        odMatchesPlayed: tournamentRatings.matchesPlayed,
        odWins: tournamentRatings.wins,
        odLosses: tournamentRatings.losses,
        odBestStreak: tournamentRatings.bestStreak,
        odMembershipTier: users.membershipTier,
      })
      .from(tournamentRatings)
      .innerJoin(users, eq(tournamentRatings.userId, users.id))
      .where(eq(tournamentRatings.seasonId, seasonId))
      .orderBy(desc(tournamentRatings.rating))
      .limit(limit);

    return ratings.map((r, index) => ({
      id: r.odUserId,
      rank: index + 1,
      username: r.odUsername,
      rating: r.odRating,
      matchesPlayed: r.odMatchesPlayed,
      wins: r.odWins,
      losses: r.odLosses,
      winRate: r.odMatchesPlayed > 0 ? parseFloat(((r.odWins / r.odMatchesPlayed) * 100).toFixed(1)) : 0,
      bestStreak: r.odBestStreak,
      membershipTier: r.odMembershipTier || 'free',
    }));
  }

  async recordTournamentMatch(data: { seasonId: string; player1Id: string; player2Id: string; boardSize: number; theme: string; player1Score: number; player2Score: number; winnerId: string | null }): Promise<TournamentMatch> {
    // Get current ratings
    const p1Rating = await this.getUserTournamentRating(data.seasonId, data.player1Id);
    const p2Rating = await this.getUserTournamentRating(data.seasonId, data.player2Id);

    if (!p1Rating || !p2Rating) {
      throw new Error("Both players must be registered for the tournament");
    }

    // Calculate ELO changes (K factor = 40 for first 20 games, 24 after)
    const p1K = p1Rating.matchesPlayed < 20 ? 40 : 24;
    const p2K = p2Rating.matchesPlayed < 20 ? 40 : 24;

    const expectedP1 = 1 / (1 + Math.pow(10, (p2Rating.rating - p1Rating.rating) / 400));
    const expectedP2 = 1 / (1 + Math.pow(10, (p1Rating.rating - p2Rating.rating) / 400));

    let p1Actual = 0.5; // draw
    let p2Actual = 0.5;
    if (data.winnerId === data.player1Id) {
      p1Actual = 1;
      p2Actual = 0;
    } else if (data.winnerId === data.player2Id) {
      p1Actual = 0;
      p2Actual = 1;
    }

    const p1NewRating = Math.max(100, Math.round(p1Rating.rating + p1K * (p1Actual - expectedP1)));
    const p2NewRating = Math.max(100, Math.round(p2Rating.rating + p2K * (p2Actual - expectedP2)));

    // Update player 1 stats
    const p1Won = data.winnerId === data.player1Id;
    const p1NewStreak = p1Won ? p1Rating.currentStreak + 1 : 0;
    await db
      .update(tournamentRatings)
      .set({
        rating: p1NewRating,
        matchesPlayed: p1Rating.matchesPlayed + 1,
        wins: p1Rating.wins + (p1Won ? 1 : 0),
        losses: p1Rating.losses + (p1Won ? 0 : 1),
        currentStreak: p1NewStreak,
        bestStreak: Math.max(p1Rating.bestStreak, p1NewStreak),
        lastMatchAt: new Date(),
      })
      .where(eq(tournamentRatings.id, p1Rating.id));

    // Update player 2 stats
    const p2Won = data.winnerId === data.player2Id;
    const p2NewStreak = p2Won ? p2Rating.currentStreak + 1 : 0;
    await db
      .update(tournamentRatings)
      .set({
        rating: p2NewRating,
        matchesPlayed: p2Rating.matchesPlayed + 1,
        wins: p2Rating.wins + (p2Won ? 1 : 0),
        losses: p2Rating.losses + (p2Won ? 0 : 1),
        currentStreak: p2NewStreak,
        bestStreak: Math.max(p2Rating.bestStreak, p2NewStreak),
        lastMatchAt: new Date(),
      })
      .where(eq(tournamentRatings.id, p2Rating.id));

    // Record the match
    const [match] = await db
      .insert(tournamentMatches)
      .values({
        seasonId: data.seasonId,
        player1Id: data.player1Id,
        player2Id: data.player2Id,
        boardSize: data.boardSize,
        theme: data.theme,
        player1Score: data.player1Score,
        player2Score: data.player2Score,
        winnerId: data.winnerId,
        player1RatingBefore: p1Rating.rating,
        player1RatingAfter: p1NewRating,
        player2RatingBefore: p2Rating.rating,
        player2RatingAfter: p2NewRating,
        status: 'completed',
        completedAt: new Date(),
      })
      .returning();

    return match;
  }

  async getUserTournamentMatches(seasonId: string, userId: string, limit: number = 10): Promise<TournamentMatch[]> {
    return await db
      .select()
      .from(tournamentMatches)
      .where(and(
        eq(tournamentMatches.seasonId, seasonId),
        or(
          eq(tournamentMatches.player1Id, userId),
          eq(tournamentMatches.player2Id, userId)
        )
      ))
      .orderBy(desc(tournamentMatches.completedAt))
      .limit(limit);
  }

  // Friend Methods
  async searchUsers(query: string, excludeUserId: string, limit: number = 10) {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const results = await db
      .select({
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
        rating: users.rating,
      })
      .from(users)
      .where(and(
        sql`LOWER(${users.username}) LIKE LOWER(${'%' + trimmed + '%'})`,
        sql`${users.id} != ${excludeUserId}`
      ))
      .limit(limit);
    return results.map(r => ({
      id: r.id,
      username: r.username,
      avatarUrl: r.avatarUrl ?? null,
      rating: r.rating ?? 1200,
    }));
  }

  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
    if (requesterId === addresseeId) {
      throw new Error("You cannot send a friend request to yourself");
    }
    // Check if any relationship already exists in either direction
    const existing = await db
      .select()
      .from(friendships)
      .where(or(
        and(eq(friendships.requesterId, requesterId), eq(friendships.addresseeId, addresseeId)),
        and(eq(friendships.requesterId, addresseeId), eq(friendships.addresseeId, requesterId)),
      ));
    if (existing.length > 0) {
      const f = existing[0];
      if (f.status === 'accepted') throw new Error("You are already friends with this user");
      if (f.requesterId === requesterId) throw new Error("Friend request already sent");
      throw new Error("This user has already sent you a friend request");
    }
    try {
      const [created] = await db
        .insert(friendships)
        .values({ requesterId, addresseeId, status: 'pending' })
        .returning();
      return created;
    } catch (err: any) {
      // Unique pair index prevents duplicates under concurrent requests
      if (err?.code === '23505' || /unique/i.test(err?.message ?? '')) {
        throw new Error("A friend request between you and this user already exists");
      }
      throw err;
    }
  }

  async acceptFriendRequest(requestId: string, userId: string): Promise<Friendship | undefined> {
    const [updated] = await db
      .update(friendships)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(and(
        eq(friendships.id, requestId),
        eq(friendships.addresseeId, userId),
        eq(friendships.status, 'pending'),
      ))
      .returning();
    return updated;
  }

  async declineOrCancelFriendRequest(requestId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(friendships)
      .where(and(
        eq(friendships.id, requestId),
        eq(friendships.status, 'pending'),
        or(eq(friendships.addresseeId, userId), eq(friendships.requesterId, userId)),
      ))
      .returning();
    return result.length > 0;
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    const result = await db
      .delete(friendships)
      .where(and(
        eq(friendships.status, 'accepted'),
        or(
          and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, friendId)),
          and(eq(friendships.requesterId, friendId), eq(friendships.addresseeId, userId)),
        ),
      ))
      .returning();
    return result.length > 0;
  }

  async getFriends(userId: string) {
    const rows = await db.execute(sql`
      SELECT 
        f.id AS friendship_id,
        u.id AS id,
        u.username AS username,
        u.avatar_url AS avatar_url,
        u.rating AS rating,
        u.membership_tier AS membership_tier
      FROM friendships f
      JOIN users u ON (u.id = CASE WHEN f.requester_id = ${userId} THEN f.addressee_id ELSE f.requester_id END)
      WHERE f.status = 'accepted' AND (f.requester_id = ${userId} OR f.addressee_id = ${userId})
      ORDER BY u.username ASC
    `);
    return (rows.rows as any[]).map(r => ({
      friendshipId: r.friendship_id,
      id: r.id,
      username: r.username,
      avatarUrl: r.avatar_url ?? null,
      rating: r.rating ?? 1200,
      membershipTier: r.membership_tier ?? 'free',
    }));
  }

  async getIncomingFriendRequests(userId: string) {
    const rows = await db
      .select({
        friendshipId: friendships.id,
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
        rating: users.rating,
        createdAt: friendships.createdAt,
      })
      .from(friendships)
      .innerJoin(users, eq(users.id, friendships.requesterId))
      .where(and(eq(friendships.addresseeId, userId), eq(friendships.status, 'pending')))
      .orderBy(desc(friendships.createdAt));
    return rows.map(r => ({
      friendshipId: r.friendshipId,
      id: r.id,
      username: r.username,
      avatarUrl: r.avatarUrl ?? null,
      rating: r.rating ?? 1200,
      createdAt: r.createdAt,
    }));
  }

  async getOutgoingFriendRequests(userId: string) {
    const rows = await db
      .select({
        friendshipId: friendships.id,
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
        rating: users.rating,
        createdAt: friendships.createdAt,
      })
      .from(friendships)
      .innerJoin(users, eq(users.id, friendships.addresseeId))
      .where(and(eq(friendships.requesterId, userId), eq(friendships.status, 'pending')))
      .orderBy(desc(friendships.createdAt));
    return rows.map(r => ({
      friendshipId: r.friendshipId,
      id: r.id,
      username: r.username,
      avatarUrl: r.avatarUrl ?? null,
      rating: r.rating ?? 1200,
      createdAt: r.createdAt,
    }));
  }

  // Daily Challenge & Streak Methods
  async getOrCreateDailyChallenge(challengeDate: string): Promise<DailyChallenge> {
    const [existing] = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.challengeDate, challengeDate));
    if (existing) return existing;

    const seed = dailyChallengeSeed(challengeDate);
    try {
      const [created] = await db
        .insert(dailyChallenges)
        .values({
          challengeDate,
          seed,
          boardSize: DAILY_CHALLENGE_BOARD_SIZE,
        })
        .returning();
      return created;
    } catch (err: any) {
      // Race condition - re-fetch
      const [existing2] = await db
        .select()
        .from(dailyChallenges)
        .where(eq(dailyChallenges.challengeDate, challengeDate));
      if (existing2) return existing2;
      throw err;
    }
  }

  async getDailyChallengeCompletion(
    userId: string,
    challengeDate: string,
  ): Promise<DailyChallengeCompletion | undefined> {
    const [row] = await db
      .select()
      .from(dailyChallengeCompletions)
      .where(and(
        eq(dailyChallengeCompletions.userId, userId),
        eq(dailyChallengeCompletions.challengeDate, challengeDate),
      ));
    return row;
  }

  async getOrCreateUserStreak(userId: string): Promise<UserStreak> {
    const [existing] = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId));
    if (existing) return existing;
    try {
      const [created] = await db
        .insert(userStreaks)
        .values({ userId })
        .returning();
      return created;
    } catch (err) {
      const [existing2] = await db
        .select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, userId));
      if (existing2) return existing2;
      throw err;
    }
  }

  async getUserStreakBadges(userId: string): Promise<StreakBadge[]> {
    return await db
      .select()
      .from(streakBadges)
      .where(eq(streakBadges.userId, userId))
      .orderBy(streakBadges.milestone);
  }

  async recordDailyChallengeCompletion(args: {
    userId: string;
    challengeDate: string;
    timeZone: string;
    playerScore: number;
    aiScore: number;
    moves: number;
    duration: number;
  }) {
    const challenge = await this.getOrCreateDailyChallenge(args.challengeDate);

    // Idempotent check - if already submitted today, return current state
    const existing = await this.getDailyChallengeCompletion(args.userId, args.challengeDate);
    if (existing) {
      const streak = await this.getOrCreateUserStreak(args.userId);
      const badges = await this.getUserStreakBadges(args.userId);
      return {
        completion: existing,
        streak,
        badges,
        challenge,
        update: {
          newState: {
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            lastCompletedDate: streak.lastCompletedDate,
            freezesAvailable: streak.freezesAvailable,
            freezeWeekStart: streak.freezeWeekStart,
          },
          freezeUsed: false,
          alreadyCompletedToday: true,
          newMilestones: [],
        } as StreakUpdateResult,
      };
    }

    const currentStreak = await this.getOrCreateUserStreak(args.userId);
    const earnedBadges = await this.getUserStreakBadges(args.userId);

    const state: StreakState = {
      currentStreak: currentStreak.currentStreak,
      longestStreak: currentStreak.longestStreak,
      lastCompletedDate: currentStreak.lastCompletedDate,
      freezesAvailable: currentStreak.freezesAvailable,
      freezeWeekStart: currentStreak.freezeWeekStart,
    };

    const update = applyDailyCompletion(
      state,
      args.challengeDate,
      earnedBadges.map(b => b.milestone),
    );

    const won = args.playerScore > args.aiScore ? 1 : 0;

    // Insert completion (race-safe via unique index)
    let completion: DailyChallengeCompletion;
    try {
      const [inserted] = await db
        .insert(dailyChallengeCompletions)
        .values({
          userId: args.userId,
          challengeDate: args.challengeDate,
          playerScore: args.playerScore,
          aiScore: args.aiScore,
          won,
          moves: args.moves,
          duration: args.duration,
          timeZone: args.timeZone,
        })
        .returning();
      completion = inserted;
    } catch (err: any) {
      // Lost race - someone else just inserted; treat as already completed
      if (err?.code === '23505' || /unique/i.test(err?.message ?? '')) {
        const exist = await this.getDailyChallengeCompletion(args.userId, args.challengeDate);
        const streak = await this.getOrCreateUserStreak(args.userId);
        const badges = await this.getUserStreakBadges(args.userId);
        return {
          completion: exist!,
          streak,
          badges,
          challenge,
          update: {
            newState: {
              currentStreak: streak.currentStreak,
              longestStreak: streak.longestStreak,
              lastCompletedDate: streak.lastCompletedDate,
              freezesAvailable: streak.freezesAvailable,
              freezeWeekStart: streak.freezeWeekStart,
            },
            freezeUsed: false,
            alreadyCompletedToday: true,
            newMilestones: [],
          } as StreakUpdateResult,
        };
      }
      throw err;
    }

    // Update streak state
    const [updatedStreak] = await db
      .update(userStreaks)
      .set({
        currentStreak: update.newState.currentStreak,
        longestStreak: update.newState.longestStreak,
        lastCompletedDate: update.newState.lastCompletedDate,
        freezesAvailable: update.newState.freezesAvailable,
        freezeWeekStart: update.newState.freezeWeekStart,
        updatedAt: new Date(),
      })
      .where(eq(userStreaks.userId, args.userId))
      .returning();

    // Insert any newly earned badges
    if (update.newMilestones.length > 0) {
      try {
        await db
          .insert(streakBadges)
          .values(update.newMilestones.map(m => ({
            userId: args.userId,
            milestone: m,
          })))
          .onConflictDoNothing();
      } catch {
        // ignore - already earned by another path
      }
    }

    const allBadges = await this.getUserStreakBadges(args.userId);

    return {
      completion,
      streak: updatedStreak,
      badges: allBadges,
      challenge,
      update,
    };
  }

  async getStreakLeaderboard(limit: number = 50) {
    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
        membershipTier: users.membershipTier,
        currentStreak: userStreaks.currentStreak,
        longestStreak: userStreaks.longestStreak,
      })
      .from(userStreaks)
      .innerJoin(users, eq(users.id, userStreaks.userId))
      .where(sql`${userStreaks.currentStreak} > 0`)
      .orderBy(desc(userStreaks.currentStreak), desc(userStreaks.longestStreak))
      .limit(limit);

    if (rows.length === 0) return [];

    const userIds = rows.map(r => r.id);
    const badges = await db
      .select()
      .from(streakBadges)
      .where(inArray(streakBadges.userId, userIds));

    const highest: Record<string, number> = {};
    for (const b of badges) {
      if (!highest[b.userId] || b.milestone > highest[b.userId]) {
        highest[b.userId] = b.milestone;
      }
    }

    return rows.map(r => ({
      id: r.id,
      username: r.username,
      avatarUrl: r.avatarUrl ?? null,
      membershipTier: r.membershipTier ?? 'free',
      currentStreak: r.currentStreak,
      longestStreak: r.longestStreak,
      highestMilestone: highest[r.id] ?? null,
    }));
  }

  async getStreakSummariesForUsers(userIds: string[]) {
    const result: Record<string, { currentStreak: number; longestStreak: number; highestMilestone: number | null }> = {};
    if (userIds.length === 0) return result;

    const streaksRows = await db
      .select()
      .from(userStreaks)
      .where(inArray(userStreaks.userId, userIds));

    const badges = await db
      .select()
      .from(streakBadges)
      .where(inArray(streakBadges.userId, userIds));

    const highest: Record<string, number> = {};
    for (const b of badges) {
      if (!highest[b.userId] || b.milestone > highest[b.userId]) {
        highest[b.userId] = b.milestone;
      }
    }

    for (const id of userIds) {
      const s = streaksRows.find(r => r.userId === id);
      result[id] = {
        currentStreak: s?.currentStreak ?? 0,
        longestStreak: s?.longestStreak ?? 0,
        highestMilestone: highest[id] ?? null,
      };
    }
    return result;
  }
}

export const storage = new DatabaseStorage();

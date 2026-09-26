/**
 * ELO Rating System for Pexeso Game
 * Based on chess ELO with adjustments for memory games
 */

export interface RatingCalculationResult {
  newRating: number;
  ratingChange: number;
}

export function calculateRatingChange(
  playerRating: number,
  aiRating: number,
  playerWon: boolean,
  gameMode: number
): RatingCalculationResult {
  // K-factor determines how much ratings can change
  // Higher K for lower-rated players, lower K for established players
  const getKFactor = (rating: number): number => {
    if (rating < 1000) return 40;
    if (rating < 1400) return 32;
    if (rating < 1800) return 24;
    if (rating < 2000) return 16;
    return 12;
  };

  // Game mode modifier - harder modes have slightly higher stakes
  const getModeModifier = (mode: number): number => {
    switch (mode) {
      case 8: return 0.8;   // Beginner mode
      case 16: return 1.0;  // Standard multiplier
      case 32: return 1.1;  
      case 48: return 1.2;  
      case 64: return 1.3;  
      case 96: return 1.4;  // Expert mode
      default: return 1.0;
    }
  };

  const kFactor = getKFactor(playerRating);
  const modeModifier = getModeModifier(gameMode);
  
  // Expected score calculation (probability of winning)
  const expectedScore = 1 / (1 + Math.pow(10, (aiRating - playerRating) / 400));
  
  // Actual score (1 for win, 0 for loss)
  const actualScore = playerWon ? 1 : 0;
  
  // Rating change calculation
  const baseChange = kFactor * (actualScore - expectedScore);
  const ratingChange = Math.round(baseChange * modeModifier);
  
  const newRating = Math.max(100, playerRating + ratingChange); // Minimum rating of 100
  
  return {
    newRating,
    ratingChange
  };
}

export function getRatingTier(rating: number): {
  tier: string;
  color: string;
  minRating: number;
  maxRating: number;
} {
  if (rating >= 2400) return { tier: "Grandmaster", color: "text-purple-600", minRating: 2400, maxRating: 9999 };
  if (rating >= 2200) return { tier: "Master", color: "text-purple-500", minRating: 2200, maxRating: 2399 };
  if (rating >= 2000) return { tier: "Expert", color: "text-red-600", minRating: 2000, maxRating: 2199 };
  if (rating >= 1800) return { tier: "Advanced", color: "text-orange-600", minRating: 1800, maxRating: 1999 };
  if (rating >= 1600) return { tier: "Intermediate", color: "text-yellow-600", minRating: 1600, maxRating: 1799 };
  if (rating >= 1400) return { tier: "Improving", color: "text-blue-600", minRating: 1400, maxRating: 1599 };
  if (rating >= 1200) return { tier: "Novice", color: "text-green-600", minRating: 1200, maxRating: 1399 };
  if (rating >= 1000) return { tier: "Beginner", color: "text-green-500", minRating: 1000, maxRating: 1199 };
  return { tier: "Learning", color: "text-gray-600", minRating: 0, maxRating: 999 };
}

export function getNextTierProgress(rating: number): {
  currentTier: string;
  nextTier: string | null;
  progress: number; // 0-100
  pointsNeeded: number;
} {
  const current = getRatingTier(rating);
  
  if (current.maxRating === 9999) {
    return {
      currentTier: current.tier,
      nextTier: null,
      progress: 100,
      pointsNeeded: 0
    };
  }
  
  const next = getRatingTier(current.maxRating + 1);
  const tierRange = current.maxRating - current.minRating + 1;
  const currentProgress = rating - current.minRating;
  const progress = Math.min(100, Math.max(0, (currentProgress / tierRange) * 100));
  const pointsNeeded = Math.max(0, current.maxRating + 1 - rating);
  
  return {
    currentTier: current.tier,
    nextTier: next.tier,
    progress,
    pointsNeeded
  };
}
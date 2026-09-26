export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365] as const;

export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

export const DAILY_CHALLENGE_BOARD_SIZE = 16;
export const DAILY_CHALLENGE_AI_DIFFICULTY = 1200;

export function getDateInTimeZone(date: Date, timeZone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  const [y1, m1, d1] = from.split("-").map(Number);
  const [y2, m2, d2] = to.split("-").map(Number);
  const a = Date.UTC(y1, m1 - 1, d1);
  const b = Date.UTC(y2, m2 - 1, d2);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function getWeekStart(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayOfWeek = date.getUTCDay();
  const diff = (dayOfWeek + 6) % 7;
  date.setUTCDate(date.getUTCDate() - diff);
  return date.toISOString().slice(0, 10);
}

export function dailyChallengeSeed(dateStr: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < dateStr.length; i++) {
    hash ^= dateStr.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function isValidIanaTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  freezesAvailable: number;
  freezeWeekStart: string | null;
}

export interface StreakUpdateResult {
  newState: StreakState;
  freezeUsed: boolean;
  alreadyCompletedToday: boolean;
  newMilestones: StreakMilestone[];
}

export function applyDailyCompletion(
  state: StreakState,
  todayLocal: string,
  earnedMilestones: number[],
): StreakUpdateResult {
  const working: StreakState = { ...state };

  const todayWeekStart = getWeekStart(todayLocal);
  if (working.freezeWeekStart !== todayWeekStart) {
    working.freezesAvailable = 1;
    working.freezeWeekStart = todayWeekStart;
  }

  if (working.lastCompletedDate === todayLocal) {
    return {
      newState: working,
      freezeUsed: false,
      alreadyCompletedToday: true,
      newMilestones: [],
    };
  }

  let newStreak: number;
  let freezeUsed = false;

  if (!working.lastCompletedDate) {
    newStreak = 1;
  } else {
    const gap = daysBetween(working.lastCompletedDate, todayLocal);
    if (gap === 1) {
      newStreak = working.currentStreak + 1;
    } else if (gap === 2 && working.freezesAvailable > 0) {
      newStreak = working.currentStreak + 1;
      working.freezesAvailable -= 1;
      freezeUsed = true;
    } else if (gap <= 0) {
      newStreak = working.currentStreak;
    } else {
      newStreak = 1;
    }
  }

  working.currentStreak = newStreak;
  working.lastCompletedDate = todayLocal;
  working.longestStreak = Math.max(working.longestStreak, newStreak);

  const newMilestones = STREAK_MILESTONES.filter(
    (m) => m <= newStreak && !earnedMilestones.includes(m),
  );

  return {
    newState: working,
    freezeUsed,
    alreadyCompletedToday: false,
    newMilestones,
  };
}

export function regenerateFreezeIfNeeded(
  state: StreakState,
  todayLocal: string,
): StreakState {
  const todayWeekStart = getWeekStart(todayLocal);
  if (state.freezeWeekStart !== todayWeekStart) {
    return {
      ...state,
      freezesAvailable: 1,
      freezeWeekStart: todayWeekStart,
    };
  }
  return state;
}

export function getNextMilestone(currentStreak: number): StreakMilestone | null {
  for (const m of STREAK_MILESTONES) {
    if (m > currentStreak) return m;
  }
  return null;
}

export function getHighestMilestoneAchieved(
  earnedMilestones: number[],
): StreakMilestone | null {
  if (earnedMilestones.length === 0) return null;
  const sorted = [...earnedMilestones].sort((a, b) => b - a);
  for (const m of sorted) {
    if ((STREAK_MILESTONES as readonly number[]).includes(m)) {
      return m as StreakMilestone;
    }
  }
  return null;
}

export interface DailyHabit {
  id: string;
  number: number;
  name: string;
  category: "SLEEP" | "MIND" | "ACADEMIC" | "FITNESS";
  xpReward: number;
  creditsReward: number;
  completedToday: boolean;
  streakCount: number;
  iconName: string; // bedside, psych, terminal, etc.
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  iconName: string;
  benefit: string;
  cooldownHours?: number;
  effectsApplied?: string;
}

export interface GameState {
  xp: number;
  maxXp: number;
  level: number;
  levelName: string;
  credits: number;
  streak: number;
  maxStreak: number;
  totalHabitsCompleted: number;
  habits: DailyHabit[];
  activeView: "home" | "stats" | "shop" | "settings" | "battle";
  visualMode: "DARK" | "LIGHT";
  volume: number;
  battleHp: number;
  maxBattleHp: number;
  bossHp: number;
  maxBossHp: number;
  bossName: string;
}

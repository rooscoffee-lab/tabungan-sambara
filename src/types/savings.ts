export type AppTab = 'beranda' | 'impian' | 'misi' | 'belajar';

export type UserMode = 'anak' | 'orang_tua';

export type JarKey = 'impian' | 'jajan' | 'berbagi';

export interface JarBalances {
  impian: number;   // 70%
  jajan: number;    // 20%
  berbagi: number;  // 10%
}

export type TransactionType = 'deposit' | 'withdraw' | 'mission_reward' | 'goal_allocation';

export interface LedgerTransaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number; // positive for income, negative for withdrawal/allocation
  jar?: JarKey;
  dateISO: string;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  iconName: 'bike' | 'book' | 'shoe' | 'backpack' | 'lego' | 'guitar';
  targetAmount: number;
  collectedAmount: number;
  accentColor: 'sky' | 'amber' | 'emerald' | 'coral';
}

export type MissionStatus = 'available' | 'pending_approval' | 'approved';

export interface MissionItem {
  id: string;
  title: string;
  description: string;
  reward: number;
  iconName: 'bed' | 'plant' | 'dish' | 'book' | 'broom' | 'shoe';
  status: MissionStatus;
  completedAtISO?: string;
}

export interface BadgeItem {
  id: string;
  title: string;
  subtitle: string;
  howToEarn: string;
  iconName: 'star' | 'shield' | 'sparkles' | 'heart' | 'trophy' | 'flame';
  unlocked: boolean;
  unlockedDate?: string;
  color: 'amber' | 'sky' | 'emerald' | 'coral';
}

export interface QuizQuestion {
  id: string;
  scenario: string;
  itemTitle: string;
  correctAnswer: 'kebutuhan' | 'keinginan';
  explanation: string;
  points: number;
}

export interface SambaraAppState {
  childName: string;
  jars: JarBalances;
  weeklyAverageSavings: number; // used for goal ETA estimate
  streakDays: number;
  starPoints: number;
  transactions: LedgerTransaction[];
  goals: SavingsGoal[];
  missions: MissionItem[];
  badges: BadgeItem[];
  quizCompletedIds: string[];
}

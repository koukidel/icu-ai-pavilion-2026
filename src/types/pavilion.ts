export type WorkMode = 'kids' | 'student' | 'pro';

export interface TaskCard {
  id: string;
  label: string;
  description: string;
  category: 'thinking' | 'execution' | 'empathy' | 'creation' | 'routine';
}

export interface WorkResult {
  mode: WorkMode;
  userInterest: string;
  futureTitle: string; // 2030年の共創型肩書（例: 概念翻訳アーキテクト）
  workStyle: 'logical' | 'intuitive' | 'balanced'; // 思考特性
  synergyRatio: number; // AI協調比率（0〜100%）
  delegatedCards: TaskCard[]; // AIに委ねる箱
  keptCards: TaskCard[]; // 自分が抱きしめる箱
  feedbackSummary: string; // 短い講評
}

export type EngineType =
  | 'fall_catch'
  | 'endless_run'
  | 'flying'
  | 'target_smash'
  | 'balance_tower';

export interface GameConfig {
  id: string;
  title: string;
  engineType: EngineType;
  characterName: string;
  characterShape: 'cat' | 'robot' | 'star' | 'rose' | 'bird';
  characterColor: string;
  themeName: string;
  backgroundColor: string;
  speed: number;
  gravity: number;
  spawnRate: number;
  specialRuleName: string;
  specialRuleDescription: string;
  createdAt: string;
  score?: number;
}

export type WorldTheme =
  | 'Dreamy Cute'
  | 'Neo Cyber'
  | 'Nature Warmth'
  | 'Blue Rose Mystic';

export interface SelfResult {
  avatarId: string;
  avatarStyle: 'pixar_boy' | 'pixar_girl' | 'cyber_explorer' | 'nature_scholar' | 'mystic_artisan';
  avatarSvg?: string;
  worldTheme: WorldTheme;
  userMood: string;
  concernText: string;
  blueRoseStatement: string; // 未来への宣言
}

export interface LovotProfile {
  id: string;
  name: string;
  colorName: string;
  bodyColor: string;
  eyeColor: string;
  hornColor: string;
  personality: string;
  favoriteThing: string;
}

export interface CareResult {
  lovot: LovotProfile;
  interactionType: 'hug' | 'eye_contact' | 'tickle' | 'handshake';
  interactionLabel: string;
  reflectionNote: string;
  timestamp: string;
}

export interface PassportData {
  id: string;
  createdAt: string;
  work?: WorkResult;
  make?: GameConfig;
  self?: SelfResult;
  care?: CareResult;
  dioramaImageUrl?: string;
}

export interface ClassroomStats {
  totalGames: number;
  totalPassports: number;
  totalDelegated: number;
  totalKept: number;
  recentGames: GameConfig[];
  recentPassports: PassportData[];
}

export interface KeystrokeEvent {
  timestamp: number;
  content: string; // Snapshot of content for MVP replay simplicity
  action: 'type' | 'backspace' | 'paste' | 'cut' | 'init' | 'sync' | 'auto-save' | 'comment' | 'format';
  charCount: number;
  authorId: string;
}

export type BadgeStyle = 'classic' | 'modern' | 'minimal';
export type BadgeColor = 'emerald' | 'blue' | 'purple' | 'gold' | 'red' | 'cyan' | 'pink' | 'indigo';
export type BadgeTheme = 'light' | 'dark';

export interface BadgeConfig {
  style: BadgeStyle;
  color: BadgeColor;
  theme: BadgeTheme;
}

export interface BlockchainReceipt {
  transactionHash: string;
  blockHeight: number;
  timestamp: number;
  contentHash: string; // SHA-256 of the content
  network: string;
  status: 'pending' | 'confirmed';
}

export interface GeneratedAsset {
  id: string;
  theme: string;
  prompt: string;
  imageUrl: string;
  createdAt: number;
}

export interface TimelineMarker {
  id: string;
  eventIndex: number;
  timestamp: number;
  label: string;
  color: string;
}

export interface WritingSession {
  id: string;
  startTime: number;
  endTime: number | null;
  events: KeystrokeEvent[];
  finalContent: string;
  pasteCount: number;
  backspaceCount: number;
  totalKeystrokes: number;
  isCertified: boolean;
  badgeConfig: BadgeConfig;
  blockchainReceipt?: BlockchainReceipt;
  generatedAssets: GeneratedAsset[];
  timelineMarkers: TimelineMarker[];
}

export interface CertifiedArticle {
  id: string;
  title: string;
  date: number;
  wordCount: number;
  humanScore: number;
  badgeStyle: BadgeConfig;
  blockchainReceipt?: BlockchainReceipt;
}

export interface AIAnalysis {
  tone: string;
  vocabularyLevel: string;
  originalityScore: number;
  humanScore: number;
  burstinessAnalysis: string;
  summary: string;
  feedback: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  WRITE = 'WRITE',
  VERIFY = 'VERIFY',
  PUBLISH = 'PUBLISH',
  SCANNER = 'SCANNER',
  INTEGRATIONS = 'INTEGRATIONS'
}
export interface MetricTrend {
  name: string;
  value: number;
  previousValue: number;
  change: number; // percentage
  unit?: string;
}

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface HotspotModule {
  name: string;
  complexity: number;
  churn: number;
  coverage: number;
}

export enum TabView {
  OVERVIEW = 'OVERVIEW',
  MODERNIZATION = 'MODERNIZATION',
  PRODUCTIVITY = 'PRODUCTIVITY',
  RISK = 'RISK'
}

export type Page = 'dashboard' | 'refactoring' | 'dependencies' | 'coverage' | 'risk' | 'prs';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface RefactorSuggestion {
  original: string;
  modernized: string;
  explanation: string;
}

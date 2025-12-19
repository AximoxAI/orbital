export enum EntityType {
  AGENT = 'AGENT',
  HUMAN = 'HUMAN'
}

export enum ActivityCategory {
  CODE = 'CODE',
  INFRA = 'INFRA',
  CONFIG = 'CONFIG',
  MANAGEMENT = 'MANAGEMENT',
  SECURITY = 'SECURITY',
  QA = 'QA'
}

export enum Role {
  ENGINEER = 'ENGINEER',
  MANAGER = 'MANAGER',
  LEAD = 'LEAD',
  ARCHITECT = 'ARCHITECT',
  SRE = 'SRE',
  AI_AGENT = 'AI_AGENT'
}

export interface Activity {
  id: string;
  timestamp: string;
  entityName: string;
  entityType: EntityType;
  role: Role;
  category: ActivityCategory;
  title: string;
  description: string;
  longDescription?: string;
  logs?: string[];
  metadata?: Record<string, any>;
  avatarUrl?: string;
}

export interface Insight {
  title: string;
  content: string;
  impact: 'low' | 'medium' | 'high';
}

export interface MetricTrend {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  unit?: string;
}

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number | boolean | undefined;
  fill?: string;
}

export interface HotspotModule {
  name: string;
  complexity: number;
  churn: number;
  coverage: number;
}
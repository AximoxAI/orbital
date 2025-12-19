import React from 'react';
import { 
  CodeBracketIcon, 
  CloudIcon, 
  WrenchScrewdriverIcon, 
  UserGroupIcon, 
  ShieldCheckIcon, 
  BeakerIcon,
  CpuChipIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Activity, EntityType, ActivityCategory, Role, MetricTrend, ChartDataPoint, HotspotModule } from '../types';

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  CODE: React.createElement(CodeBracketIcon, { className: "w-5 h-5" }),
  INFRA: React.createElement(CloudIcon, { className: "w-5 h-5" }),
  CONFIG: React.createElement(WrenchScrewdriverIcon, { className: "w-5 h-5" }),
  MANAGEMENT: React.createElement(UserGroupIcon, { className: "w-5 h-5" }),
  SECURITY: React.createElement(ShieldCheckIcon, { className: "w-5 h-5" }),
  QA: React.createElement(BeakerIcon, { className: "w-5 h-5" }),
};

export const ENTITY_ICONS: Record<string, React.ReactNode> = {
  AGENT: React.createElement(CpuChipIcon, { className: "w-4 h-4" }),
  HUMAN: React.createElement(UserIcon, { className: "w-4 h-4" }),
};

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    entityName: 'orbital_cli',
    entityType: EntityType.AGENT,
    role: Role.AI_AGENT,
    category: ActivityCategory.CODE,
    title: 'Automated Refactor Completed',
    description: 'Refactored `authService.ts` to reduce cyclomatic complexity. Reduced from 12 to 4.',
    longDescription: 'The agent analyzed existing authentication logic and identified multiple nested conditionals. Using the strategy pattern, it decoupled the authentication providers.',
    logs: [
      '[14:02:01] Scanning repository...',
      '[14:02:10] Applying refactoring plan...',
      '[14:02:20] Tests passed. Applying changes.'
    ],
    metadata: { file: 'authService.ts', linesChanged: '+42, -58', testCoverage: '98.2%' },
    avatarUrl: 'https://picsum.photos/seed/agent1/200'
  },
  {
    id: 'sec-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    entityName: 'claude_code',
    entityType: EntityType.AGENT,
    role: Role.AI_AGENT,
    category: ActivityCategory.SECURITY,
    title: 'Critical Vulnerability Mitigated',
    description: 'Detected and patched a prototype pollution vulnerability.',
    metadata: { severity: 'CRITICAL', action: 'AUTO_PATCH' },
    avatarUrl: 'https://picsum.photos/seed/sec/200'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    entityName: 'Sarah Chen',
    entityType: EntityType.HUMAN,
    role: Role.LEAD,
    category: ActivityCategory.MANAGEMENT,
    title: 'Sprint Planning Updated',
    description: 'Promoted 3 issues to P0.',
    avatarUrl: 'https://picsum.photos/seed/sarah/200'
  }
];

export const KPIS: MetricTrend[] = [
  { name: "Refactoring Impact", value: 85, previousValue: 72, change: 18.05 },
  { name: "Tech Debt Ratio", value: 12, previousValue: 18, change: -33.3, unit: "%" },
  { name: "Test Coverage", value: 78.4, previousValue: 65.2, change: 20.24, unit: "%" },
];

export const PR_METRICS: ChartDataPoint[] = [
  { name: 'Mon', openedHuman: 8, openedAI: 4, mergedHuman: 6, mergedAI: 2 },
  { name: 'Tue', openedHuman: 10, openedAI: 5, mergedHuman: 7, mergedAI: 3 },
  { name: 'Wed', openedHuman: 12, openedAI: 6, mergedHuman: 10, mergedAI: 5 },
  { name: 'Thu', openedHuman: 9, openedAI: 5, mergedHuman: 8, mergedAI: 4 },
  { name: 'Fri', openedHuman: 5, openedAI: 3, mergedHuman: 10, mergedAI: 4 },
];

export const VELOCITY_DATA: ChartDataPoint[] = [
  { name: 'Sprint 20', manual: 12, automated: 2 },
  { name: 'Sprint 21', manual: 10, automated: 5 },
  { name: 'Sprint 22', manual: 8, automated: 12 },
  { name: 'Sprint 23', manual: 6, automated: 18 },
  { name: 'Sprint 24', manual: 5, automated: 22 },
];

export const HOTSPOTS: HotspotModule[] = [
  { name: 'AuthService', complexity: 85, churn: 90, coverage: 30 },
  { name: 'LegacyBilling', complexity: 95, churn: 20, coverage: 10 },
  { name: 'UserProfile', complexity: 40, churn: 60, coverage: 85 },
];

export const RISK_TRENDS: ChartDataPoint[] = [
  { name: 'Sprint 22', bugsHuman: 7, bugsAI: 1, rollbacks: 0 },
  { name: 'Sprint 23', bugsHuman: 4, bugsAI: 1, rollbacks: 1 },
  { name: 'Sprint 24', bugsHuman: 3, bugsAI: 0, rollbacks: 0 },
];

export const DUPLICATION_DATA: ChartDataPoint[] = [
  { name: 'Jan', before: 12.5, after: 12.5 },
  { name: 'Feb', before: 12.8, after: 11.2 },
  { name: 'Mar', before: 13.5, after: 10.1 },
];

export const COVERAGE_DATA: ChartDataPoint[] = [
  { name: 'Week 4', unit: 65, integration: 42, e2e: 22 },
  { name: 'Week 5', unit: 72, integration: 50, e2e: 35 },
];

export const MIGRATION_DATA: ChartDataPoint[] = [
  { name: 'React 18', progress: 100, total: 100, status: 'Completed' },
  { name: 'TypeScript', progress: 85, total: 100, status: 'In Progress' },
];

export const DEPENDENCY_HEALTH: ChartDataPoint[] = [
  { name: 'Critical', value: 5, fill: '#ef4444' },
  { name: 'High', value: 12, fill: '#f97316' },
  { name: 'Safe', value: 120, fill: '#10b981' },
];

export const MEASURES_DATA = [
  { name: 'AuthController.ts', coverage: 2.5, debt: 15, rating: 'A', loc: 120 },
  { name: 'PaymentGateway.tsx', coverage: 0, debt: 150, rating: 'C', loc: 450 },
];
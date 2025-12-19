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
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    entityName: 'orbital_cli',
    entityType: EntityType.AGENT,
    role: Role.AI_AGENT,
    category: ActivityCategory.CODE,
    title: 'Automated Refactor Completed',
    description: 'Refactored `authService.ts` to reduce cyclomatic complexity. Reduced from 12 to 4.',
    longDescription: 'The agent analyzed existing authentication logic and identified multiple nested conditionals. Using the strategy pattern, it decoupled the authentication providers.',
    logs: ['[14:02:01] Scanning repository...', '[14:02:10] Applying refactoring plan...', '[14:02:20] Tests passed.'],
    metadata: { file: 'authService.ts', linesChanged: '+42, -58', testCoverage: '98.2%' },
    avatarUrl: 'https://picsum.photos/seed/agent1/200'
  },
  {
    id: 'sec-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    entityName: 'claude_code',
    entityType: EntityType.AGENT,
    role: Role.AI_AGENT,
    category: ActivityCategory.SECURITY,
    title: 'Critical Vulnerability Mitigated',
    description: 'Detected and patched a prototype pollution vulnerability in the gateway.',
    metadata: { severity: 'CRITICAL', action: 'AUTO_PATCH', cve: '2024-3312' },
    avatarUrl: 'https://picsum.photos/seed/sec/200'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    entityName: 'Sarah Chen',
    entityType: EntityType.HUMAN,
    role: Role.LEAD,
    category: ActivityCategory.MANAGEMENT,
    title: 'Sprint Planning Updated',
    description: 'Promoted 3 issues to P0 for the v2.4 stable release.',
    metadata: { sprint: 'Q4-S2', priority_shift: 'High' },
    avatarUrl: 'https://picsum.photos/seed/sarah/200'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    entityName: 'goose',
    entityType: EntityType.AGENT,
    role: Role.AI_AGENT,
    category: ActivityCategory.CONFIG,
    title: 'Dev Container Optimization',
    description: 'Updated `.devcontainer` and Dockerfile to optimize build layers.',
    longDescription: 'Goose identified redundant layers in the Docker build process. By consolidating RUN commands, image size was reduced by 140MB.',
    metadata: { file: 'Dockerfile', sizeReduction: '140MB', buildTime: '-12%' },
    avatarUrl: 'https://picsum.photos/seed/goose/200'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    entityName: 'gemini_cli',
    entityType: EntityType.AGENT,
    role: Role.AI_AGENT,
    category: ActivityCategory.QA,
    title: 'Test Suite Expansion',
    description: 'Generated 14 new integration tests for the Stripe payment module.',
    logs: ['[13:15:02] Analyzing payment routes...', '[13:15:20] Generating test cases...'],
    metadata: { coverageIncrease: '+4.2%', testsGenerated: '14' },
    avatarUrl: 'https://picsum.photos/seed/gemini/200'
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    entityName: 'Marcus Wright',
    entityType: EntityType.HUMAN,
    role: Role.SRE,
    category: ActivityCategory.INFRA,
    title: 'Kubernetes Cluster Scaling',
    description: 'Manually adjusted replica sets for the notifications-service.',
    metadata: { cluster: 'prod-us-east', replicas: '10 -> 25' },
    avatarUrl: 'https://picsum.photos/seed/marcus/200'
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    entityName: 'orbital_cli',
    entityType: EntityType.AGENT,
    role: Role.AI_AGENT,
    category: ActivityCategory.INFRA,
    title: 'Terraform State Drift Fixed',
    description: 'Automatically reconciled AWS IAM drift detected during nightly scan.',
    metadata: { resource: 'iam_role.lambda_exec', provider: 'AWS' },
    avatarUrl: 'https://picsum.photos/seed/orbital/200'
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    entityName: 'orbital_cli',
    entityType: EntityType.AGENT,
    role: Role.AI_AGENT,
    category: ActivityCategory.CODE,
    title: 'Performance Bottleneck Resolved',
    description: 'Optimized memoization logic in `OrbitalPanel.tsx` to prevent unnecessary re-renders.',
    metadata: { component: 'OrbitalPanel', fps_gain: '+15', complexity_reduction: 'Medium' },
    avatarUrl: 'https://picsum.photos/seed/orbital/200'
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    entityName: 'Alex Rivera',
    entityType: EntityType.HUMAN,
    role: Role.SRE,
    category: ActivityCategory.QA,
    title: 'Regression Discovery',
    description: 'Identified a layout shift on mobile viewports within the dashboard feed.',
    metadata: { priority: 'P2', environment: 'Staging', browser: 'Chrome Mobile' },
    avatarUrl: 'https://picsum.photos/seed/alex/200'
  },
  {
    id: '10',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    entityName: 'goose',
    entityType: EntityType.AGENT,
    role: Role.AI_AGENT,
    category: ActivityCategory.INFRA,
    title: 'Log Retention Policy Update',
    description: 'Modified CloudWatch retention from infinite to 30 days for dev clusters.',
    metadata: { service: 'CloudWatch', cost_saving: '$120/mo', region: 'us-east-1' },
    avatarUrl: 'https://picsum.photos/seed/goose/200'
  },
  {
    id: '11',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    entityName: 'gemini_cli',
    entityType: EntityType.AGENT,
    role: Role.AI_AGENT,
    category: ActivityCategory.SECURITY,
    title: 'Dependency Audit & Upgrade',
    description: 'Auto-upgraded 4 packages to resolve high-severity `npm audit` warnings.',
    logs: ['[08:00:10] Running audit...', '[08:01:45] Patching axios...', '[08:02:10] Verification complete.'],
    metadata: { packages: 'axios, lodash, vite, undici', status: 'Secure' },
    avatarUrl: 'https://picsum.photos/seed/gemini/200'
  },
  {
    id: '12',
    timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    entityName: 'claude_code',
    entityType: EntityType.AGENT,
    role: Role.AI_AGENT,
    category: ActivityCategory.CODE,
    title: 'API Documentation Generated',
    description: 'Automatically updated JSDoc and Swagger definitions for the v2/activity endpoint.',
    metadata: { endpoint: '/v2/activity', documentation: 'Swagger/OpenAPI', accuracy: '100%' },
    avatarUrl: 'https://picsum.photos/seed/sec/200'
  },
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

export const INSIGHTS = [
  {
    title: 'Security Resilience Increased',
    content: 'Agent claude_code automatically mitigated a critical prototype pollution vulnerability in the gateway.',
    impact: 'high',
  },
  {
    title: 'Infrastructure Autonomy',
    content: 'AI agents are currently handling 100% of infrastructure reconciliation and scaling tasks.',
    impact: 'high',
  },
  {
    title: 'Code Quality Improvement',
    content: 'Automated refactoring has successfully reduced cyclomatic complexity in core services from 12 to 4.',
    impact: 'medium',
  }
];
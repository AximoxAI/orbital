import { ChartDataPoint, HotspotModule, MetricTrend } from '../types';

export const KPIS: MetricTrend[] = [
  { name: "Refactoring Impact", value: 85, previousValue: 72, change: 18.05 },
  { name: "Tech Debt Ratio", value: 12, previousValue: 18, change: -33.3, unit: "%" },
  { name: "Test Coverage", value: 78.4, previousValue: 65.2, change: 20.24, unit: "%" },
  { name: "Refactoring Velocity", value: 24, previousValue: 15, change: 60, unit: "tickets/sprint" },
];

export const DUPLICATION_DATA: ChartDataPoint[] = [
  { name: 'Jan', before: 12.5, after: 12.5 },
  { name: 'Feb', before: 12.8, after: 11.2 },
  { name: 'Mar', before: 13.5, after: 10.1 },
  { name: 'Apr', before: 14.2, after: 8.5 },
  { name: 'May', before: 13.8, after: 6.2 },
  { name: 'Jun', before: 13.2, after: 4.8 },
];

export const COVERAGE_DATA: ChartDataPoint[] = [
  { name: 'Week 1', unit: 45, integration: 20, e2e: 10 },
  { name: 'Week 2', unit: 52, integration: 25, e2e: 12 },
  { name: 'Week 3', unit: 58, integration: 35, e2e: 15 },
  { name: 'Week 4', unit: 65, integration: 42, e2e: 22 },
  { name: 'Week 5', unit: 72, integration: 50, e2e: 35 },
];

export const MIGRATION_DATA: ChartDataPoint[] = [
  { name: 'React 18', progress: 100, total: 100, status: 'Completed' },
  { name: 'TypeScript', progress: 85, total: 100, status: 'In Progress' },
  { name: 'Tailwind', progress: 60, total: 100, status: 'In Progress' },
  { name: 'Vite', progress: 30, total: 100, status: 'Started' },
  { name: 'GraphQL', progress: 10, total: 100, status: 'Planned' },
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
  { name: 'OrderProcessing', complexity: 75, churn: 80, coverage: 45 },
  { name: 'Notifications', complexity: 30, churn: 10, coverage: 90 },
  { name: 'InventoryManager', complexity: 65, churn: 40, coverage: 60 },
  { name: 'ReportingEngine', complexity: 90, churn: 15, coverage: 25 },
  { name: 'APIGateway', complexity: 55, churn: 70, coverage: 80 },
];

export const DEPENDENCY_HEALTH: ChartDataPoint[] = [
  { name: 'Critical', value: 5, fill: '#ef4444' },
  { name: 'High', value: 12, fill: '#f97316' },
  { name: 'Moderate', value: 25, fill: '#eab308' },
  { name: 'Low', value: 58, fill: '#3b82f6' },
  { name: 'Safe', value: 120, fill: '#10b981' },
];

export const RISK_TRENDS: ChartDataPoint[] = [
  { name: 'Sprint 20', bugsHuman: 10, bugsAI: 2, rollbacks: 2 },
  { name: 'Sprint 21', bugsHuman: 12, bugsAI: 3, rollbacks: 1 },
  { name: 'Sprint 22', bugsHuman: 7, bugsAI: 1, rollbacks: 0 },
  { name: 'Sprint 23', bugsHuman: 4, bugsAI: 1, rollbacks: 1 },
  { name: 'Sprint 24', bugsHuman: 3, bugsAI: 0, rollbacks: 0 },
];

export const PR_METRICS: ChartDataPoint[] = [
  { name: 'Mon', openedHuman: 8, openedAI: 4, mergedHuman: 6, mergedAI: 2 },
  { name: 'Tue', openedHuman: 10, openedAI: 5, mergedHuman: 7, mergedAI: 3 },
  { name: 'Wed', openedHuman: 12, openedAI: 6, mergedHuman: 10, mergedAI: 5 },
  { name: 'Thu', openedHuman: 9, openedAI: 5, mergedHuman: 8, mergedAI: 4 },
  { name: 'Fri', openedHuman: 5, openedAI: 3, mergedHuman: 10, mergedAI: 4 },
];

export const MEASURES_DATA = [
  { name: 'AuthController.ts', coverage: 2.5, debt: 15, rating: 'A', loc: 120 },
  { name: 'PaymentGateway.tsx', coverage: 0, debt: 150, rating: 'C', loc: 450 },
  { name: 'UserUtils.ts', coverage: 5.0, debt: 30, rating: 'A', loc: 80 },
  { name: 'LegacyParser.js', coverage: 0, debt: 210, rating: 'D', loc: 600 },
  { name: 'Dashboard.tsx', coverage: 8.5, debt: 60, rating: 'B', loc: 320 },
  { name: 'ReportGen.ts', coverage: 0, debt: 90, rating: 'B', loc: 250 },
  { name: 'ApiConfig.ts', coverage: 15.0, debt: 10, rating: 'A', loc: 45 },
  { name: 'OldLogin.jsx', coverage: 0, debt: 250, rating: 'E', loc: 500 },
  { name: 'Sidebar.tsx', coverage: 12.0, debt: 45, rating: 'A', loc: 180 },
  { name: 'ChartConfig.ts', coverage: 20.0, debt: 20, rating: 'A', loc: 90 },
  { name: 'Middleware.ts', coverage: 1.5, debt: 110, rating: 'C', loc: 300 },
  { name: 'DataTransform.ts', coverage: 45.0, debt: 5, rating: 'A', loc: 60 },
];

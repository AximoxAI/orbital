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
    role: Role.AGENT,
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
    role: Role.AGENT,
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
    role: Role.AGENT,
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
    role: Role.AGENT,
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
    role: Role.AGENT,
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
    role: Role.AGENT,
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
    role: Role.AGENT,
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
    role: Role.AGENT,
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
    role: Role.AGENT,
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

const generateSparkline = () => Array.from({ length: 24 }, () => ({ value: 20 + Math.random() * 80 }));

const generateEfficiencyData = () => [
  { date: '7/2', score: 0.65 },
  { date: '7/4', score: 0.72 },
  { date: '7/5', score: 0.68 },
  { date: '7/6', score: 0.78 },
  { date: '7/6', score: 0.83 },
];

const generateAgentFlowData = () => [
  { date: '7/2', intentResolution: 30, inference: 25, toolUsage: 20, waiting: 25 },
  { date: '7/3', intentResolution: 35, inference: 20, toolUsage: 25, waiting: 20 },
  { date: '7/4', intentResolution: 28, inference: 30, toolUsage: 22, waiting: 20 },
  { date: '7/5', intentResolution: 32, inference: 28, toolUsage: 20, waiting: 20 },
  { date: '7/6', intentResolution: 30, inference: 25, toolUsage: 25, waiting: 20 },
  { date: '7/8', intentResolution: 35, inference: 22, toolUsage: 23, waiting: 20 },
];

const generateToolQualityData = () => [
  { date: '7/2', rating: 3.8 },
  { date: '7/3', rating: 4.0 },
  { date: '7/4', rating: 4.1 },
  { date: '7/5', rating: 4.3 },
  { date: '7/6', rating: 4.4 },
  { date: '7/8', rating: 4.7 },
];

const generateToolErrorData = () => [
  { date: '7/2', errorRate: 8 },
  { date: '7/3', errorRate: 12 },
  { date: '7/5', errorRate: 6 },
  { date: '7/5', errorRate: 9 },
  { date: '7/8', errorRate: 4.6 },
];

const generateActionCompletionData = () => [
  { name: 'Successful', value: 85 },
  { name: 'Retry Attempt', value: 8 },
  { name: 'Aborted', value: 4 },
  { name: 'Incomplete', value: 3 },
];

const generateActionAdvancementData = () => [
  { date: '7/2', advancement: 72 },
  { date: '7/3', advancement: 75 },
  { date: '7/4', advancement: 73 },
  { date: '7/5', advancement: 76 },
  { date: '7/6', advancement: 78 },
  { date: '7/8', advancement: 79 },
];

export const AGENTS_OBSERVABILITY_DATA = [
  { 
    id: 'orbital',
    name: "orbital_cli", 
    role: "Orchestrator", 
    successRate: 94, 
    cost: 42.5, 
    latency: 2.1, 
    sparkline: generateSparkline(),
    tokens: [ { name: 'Input', value: 4500 }, { name: 'Output', value: 2100 }, { name: 'Cached', value: 12000 } ],
    burn: [ { day: 'M', cost: 12 }, { day: 'T', cost: 15 }, { day: 'W', cost: 42 }, { day: 'T', cost: 25 }, { day: 'F', cost: 30 }, { day: 'S', cost: 10 }, { day: 'S', cost: 5 } ],
    latencyBreakdown: [
      { stage: 'Context Retrieval', time: 800 },
      { stage: 'Planner Inference', time: 900 },
      { stage: 'Tool Delegation', time: 400 },
    ],
    trace: [
      { type: 'prompt', title: "Trigger Received", detail: "Webhook: Push to main", color: "bg-blue-500" },
      { type: 'thought', title: "Orchestration Plan", detail: "Detected 3 changed files. Assigning tasks...", color: "bg-purple-500" },
      { type: 'tool', title: "Delegation", detail: "Spawned: gemini_cli (Tests), claude_code (Review)", color: "bg-slate-700" },
      { type: 'output', title: "Workflow Complete", detail: "All child tasks finished successfully.", color: "bg-green-500" },
    ],
    groundedness: 0.98,
    metrics: {
      efficiencyScore: 0.83,
      efficiencyData: generateEfficiencyData(),
      agentFlowData: generateAgentFlowData(),
      toolQuality: 4.7,
      toolQualityData: generateToolQualityData(),
      toolErrorRate: 4.6,
      toolErrorData: generateToolErrorData(),
      actionCompletion: 95,
      actionCompletionData: generateActionCompletionData(),
      actionAverage: '±$$',
      actionAdvancement: 79,
      actionAdvancementData: generateActionAdvancementData(),
      reasoningCoherence: 8.3,
      instructionAdherence: 87,
      instructionAverage: 79,
      userIntentChange: 11,
      userIntentScore: 9.1,
    }
  },
  { 
    id: 'gemini',
    name: "gemini_cli", 
    role: "Fast Reasoning", 
    successRate: 88, 
    cost: 12.8, 
    latency: 0.8, 
    sparkline: generateSparkline(),
    tokens: [ { name: 'Input', value: 8000 }, { name: 'Output', value: 4000 }, { name: 'Cached', value: 2000 } ],
    burn: [ { day: 'M', cost: 5 }, { day: 'T', cost: 8 }, { day: 'W', cost: 6 }, { day: 'T', cost: 9 }, { day: 'F', cost: 12 }, { day: 'S', cost: 4 }, { day: 'S', cost: 2 } ],
    latencyBreakdown: [
      { stage: 'Model Inference', time: 300 },
      { stage: 'Search Tool', time: 400 },
      { stage: 'Response Gen', time: 100 },
    ],
    trace: [
      { type: 'prompt', title: "Task Received", detail: "Generate Unit Tests for PaymentGateway", color: "bg-blue-500" },
      { type: 'thought', title: "Reasoning", detail: "Analyzing boundary cases for currency conversion...", color: "bg-purple-500" },
      { type: 'tool', title: "File Access", detail: "read_file src/utils/currency.ts", color: "bg-slate-700" },
      { type: 'output', title: "Code Generated", detail: "Created 12 test cases in PaymentGateway.test.tsx", color: "bg-green-500" },
    ],
    groundedness: 0.85,
    metrics: {
      efficiencyScore: 0.78,
      efficiencyData: generateEfficiencyData(),
      agentFlowData: generateAgentFlowData(),
      toolQuality: 4.3,
      toolQualityData: generateToolQualityData(),
      toolErrorRate: 6.2,
      toolErrorData: generateToolErrorData(),
      actionCompletion: 92,
      actionCompletionData: generateActionCompletionData(),
      actionAverage: '±$$',
      actionAdvancement: 82,
      actionAdvancementData: generateActionAdvancementData(),
      reasoningCoherence: 7.8,
      instructionAdherence: 83,
      instructionAverage: 79,
      userIntentChange: 15,
      userIntentScore: 8.5,
    }
  },
  { 
    id: 'claude',
    name: "claude_code", 
    role: "Complex Coding", 
    successRate: 98, 
    cost: 85.2, 
    latency: 5.4, 
    sparkline: generateSparkline(),
    tokens: [ { name: 'Input', value: 6000 }, { name: 'Output', value: 5500 }, { name: 'Cached', value: 15000 } ],
    burn: [ { day: 'M', cost: 50 }, { day: 'T', cost: 65 }, { day: 'W', cost: 40 }, { day: 'T', cost: 85 }, { day: 'F', cost: 70 }, { day: 'S', cost: 20 }, { day: 'S', cost: 10 } ],
    latencyBreakdown: [
      { stage: 'Deep Analysis', time: 2500 },
      { stage: 'Safety Check', time: 500 },
      { stage: 'Code Synthesis', time: 2400 },
    ],
    trace: [
      { type: 'prompt', title: "Security Audit", detail: "Scan PR #402 for vulnerabilities", color: "bg-blue-500" },
      { type: 'thought', title: "Static Analysis", detail: "Tracing data flow from user input to SQL query...", color: "bg-purple-500" },
      { type: 'tool', title: "AST Parsing", detail: "parse_ast src/db/query.ts", color: "bg-slate-700" },
      { type: 'output', title: "Report Generated", detail: "Found 0 critical, 2 low severity issues.", color: "bg-green-500" },
    ],
    groundedness: 0.99,
    metrics: {
      efficiencyScore: 0.91,
      efficiencyData: generateEfficiencyData(),
      agentFlowData: generateAgentFlowData(),
      toolQuality: 4.8,
      toolQualityData: generateToolQualityData(),
      toolErrorRate: 2.1,
      toolErrorData: generateToolErrorData(),
      actionCompletion: 98,
      actionCompletionData: generateActionCompletionData(),
      actionAverage: '±$$',
      actionAdvancement: 92,
      actionAdvancementData: generateActionAdvancementData(),
      reasoningCoherence: 9.2,
      instructionAdherence: 94,
      instructionAverage: 79,
      userIntentChange: 7,
      userIntentScore: 9.5,
    }
  },
  { 
    id: 'goose',
    name: "goose", 
    role: "Experimental", 
    successRate: 65, 
    cost: 5.4, 
    latency: 1.2, 
    sparkline: generateSparkline(),
    tokens: [ { name: 'Input', value: 2000 }, { name: 'Output', value: 1000 }, { name: 'Cached', value: 500 } ],
    burn: [ { day: 'M', cost: 2 }, { day: 'T', cost: 3 }, { day: 'W', cost: 1 }, { day: 'T', cost: 5 }, { day: 'F', cost: 4 }, { day: 'S', cost: 1 }, { day: 'S', cost: 0 } ],
    latencyBreakdown: [
      { stage: 'Config Load', time: 200 },
      { stage: 'Inference', time: 800 },
      { stage: 'Retry Loop', time: 200 },
    ],
    trace: [
      { type: 'prompt', title: "Config Update", detail: "Update retention policy", color: "bg-blue-500" },
      { type: 'thought', title: "Schema Check", detail: "Validating against schema v2...", color: "bg-purple-500" },
      { type: 'tool', title: "Shell Exec", detail: "aws logs put-retention-policy", color: "bg-slate-700" },
      { type: 'output', title: "Action Failed", detail: "PermissionDenied: IAM role missing policy.", color: "bg-red-500" },
    ],
    groundedness: 0.60,
    metrics: {
      efficiencyScore: 0.62,
      efficiencyData: generateEfficiencyData(),
      agentFlowData: generateAgentFlowData(),
      toolQuality: 3.5,
      toolQualityData: generateToolQualityData(),
      toolErrorRate: 18.5,
      toolErrorData: generateToolErrorData(),
      actionCompletion: 72,
      actionCompletionData: generateActionCompletionData(),
      actionAverage: '±$$',
      actionAdvancement: 65,
      actionAdvancementData: generateActionAdvancementData(),
      reasoningCoherence: 5.8,
      instructionAdherence: 68,
      instructionAverage: 79,
      userIntentChange: 24,
      userIntentScore: 6.2,
    }
  }
];
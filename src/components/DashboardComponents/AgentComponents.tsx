import React, { useState } from 'react';
import { 
  Bot, Clock, Zap, CheckCircle2, 
  Terminal, Globe, ArrowRight, LayoutList, LayoutGrid,
  AlertTriangle, TrendingUp, Activity, HelpCircle
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AgentSparkline, 
  LatencyBreakdownChart, 
  TokenDonutChart, 
  CostBurnChart,
  EfficiencyChart,
  AgentFlowChart,
  ToolSelectionQualityChart,
  ToolErrorRateChart,
  ActionCompletionDonut,
  ActionAdvancementChart,
  ProgressBar
} from './AgentCharts';
import { AGENTS_OBSERVABILITY_DATA } from '@/constants';

const Tooltip = ({ content }: { content: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="ml-1 text-slate-400 hover:text-slate-600 transition-colors"
        type="button"
      >
        <HelpCircle size={14} />
      </button>
      {isVisible && (
        <div className="absolute left-0 top-6 z-50 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 border-l border-t border-slate-700 transform rotate-45"></div>
          {content}
        </div>
      )}
    </div>
  );
};

const TraceView = ({ trace }: { trace: any[] }) => (
  <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 py-2">
    {trace.map((step, idx) => {
      let Icon = Bot;
      if (step.type === 'thought') Icon = Zap;
      if (step.type === 'tool') Icon = Terminal;
      if (step.type === 'output') Icon = CheckCircle2;
      if (step.detail.includes("Failed")) Icon = AlertTriangle;

      return (
        <div key={idx} className="relative pl-8">
          <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${step.color}`} />
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-slate-500"><Icon size={16} /></span>
              <span className="font-semibold text-sm text-slate-900">{step.title}</span>
            </div>
            <p className="text-xs text-slate-600 font-mono">{step.detail}</p>
          </div>
        </div>
      );
    })}
  </div>
);

interface AgentShowcaseProps {
  onAgentClick: (agent: any) => void;
  viewMode: 'grid' | 'table';
}

export const AgentShowcase = ({ onAgentClick, viewMode }: AgentShowcaseProps) => {
  if (viewMode === 'table') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500">Agent Name</th>
              <th className="px-6 py-4 font-medium text-slate-500">Role</th>
              <th className="px-6 py-4 font-medium text-slate-500">Success Rate</th>
              <th className="px-6 py-4 font-medium text-slate-500">Cost (24h)</th>
              <th className="px-6 py-4 font-medium text-slate-500">Avg Latency</th>
              <th className="px-6 py-4 font-medium text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {AGENTS_OBSERVABILITY_DATA.map((agent) => (
              <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                  <Bot size={16} className="text-slate-400" />
                  {agent.name}
                </td>
                <td className="px-6 py-4 text-slate-600">{agent.role}</td>
                <td className="px-6 py-4">
                  <span className={`font-medium ${agent.successRate > 90 ? 'text-emerald-600' : agent.successRate < 70 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {agent.successRate}%
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700">${agent.cost}</td>
                <td className="px-6 py-4 text-slate-700">{agent.latency}s</td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="sm" onClick={() => onAgentClick(agent)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    View Details <ArrowRight size={14} className="ml-1" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {AGENTS_OBSERVABILITY_DATA.map((agent) => (
        <Card 
          key={agent.id} 
          onClick={() => onAgentClick(agent)}
          className="p-6 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group bg-white border-slate-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{agent.name}</h3>
              <p className="text-xs text-slate-500">{agent.role}</p>
            </div>
            <Bot className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
          </div>
          
          <div className="h-16 mb-4">
             <AgentSparkline data={agent.sparkline} color="#3b82f6" />
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Success Rate</p>
              <p className={`font-bold ${agent.successRate > 90 ? 'text-emerald-600' : 'text-slate-700'}`}>{agent.successRate}%</p>
            </div>
            <div className="text-center border-l border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Cost</p>
              <p className="font-bold text-slate-700">${agent.cost}</p>
            </div>
            <div className="text-center border-l border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Time</p>
              <p className="font-bold text-slate-700">{agent.latency}s</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export const AgentDetailView = ({ agent, onBack }: { agent: any, onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'observability' | 'billing'>('observability');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
           &larr; Back to Fleet
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <h2 className="text-2xl font-bold text-slate-900">{agent.name}</h2>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('observability')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'observability' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Observability
        </button>
        <button 
          onClick={() => setActiveTab('billing')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'billing' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Billing & Efficiency
        </button>
      </div>

      {activeTab === 'observability' ? (
        <>
          {/* OLD COMPONENTS - Live Execution Trace, Latency, Groundedness */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6 border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Terminal size={18} className="text-slate-500" /> 
                Live Execution Trace
                <Tooltip content="Real-time visualization of agent execution steps including prompts, reasoning, tool usage, and outputs. Shows the complete workflow from task receipt to completion." />
              </h3>
              <TraceView trace={agent.trace} />
            </Card>

            <div className="space-y-6">
              <Card className="p-6 border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-slate-500" /> 
                  Latency Breakdown
                  <Tooltip content="Time distribution across different execution phases. Calculated by measuring milliseconds spent in context retrieval, model inference, and tool delegation stages." />
                </h3>
                <LatencyBreakdownChart data={agent.latencyBreakdown} />
              </Card>

              <Card className="p-6 border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-slate-500" /> 
                  Groundedness Score
                  <Tooltip content="Measures how well agent responses align with source context (0-1 scale). Calculated using semantic similarity between generated output and retrieved context documents." />
                </h3>
                <div className="flex items-center justify-center py-6 relative">
                  <div className="text-4xl font-bold text-slate-800">{agent.groundedness}</div>
                  <div className="absolute w-full h-full border-4 border-slate-100 rounded-full opacity-20" />
                </div>
                <p className="text-center text-xs text-slate-500">Fidelity to source context</p>
              </Card>
            </div>
          </div>

          {/* NEW METRICS START HERE */}
          <div className="border-t-2 border-slate-200 pt-8 mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Advanced Metrics</h2>
            
            {/* Core Agent Metrics */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg text-slate-900 mb-4">Core Agent Metrics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6 border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-slate-500 text-sm font-medium mb-1 flex items-center">
                        Efficiency Score
                        <Tooltip content="Overall agent performance metric (0-1 scale). Calculated as: (Successful Tasks × Avg Speed) / (Total Tasks × Cost). Higher scores indicate better resource utilization." />
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">{agent.metrics.efficiencyScore}</span>
                        <TrendingUp size={16} className="text-emerald-500" />
                      </div>
                    </div>
                  </div>
                  <EfficiencyChart data={agent.metrics.efficiencyData} />
                </Card>

                <Card className="lg:col-span-2 p-6 border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-slate-500" /> 
                    Agent Flow
                    <Tooltip content="100% stacked area chart showing time distribution across agent workflow stages. Calculated by tracking execution time in each phase: intent resolution, planning/inference, tool usage, and waiting states." />
                  </h3>
                  <div className="flex items-center gap-6 mb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-slate-600">Intent Resolution</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-slate-600">Inference & Planning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-slate-600">Tool Usage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                      <span className="text-slate-600">Waiting for filancing</span>
                    </div>
                  </div>
                  <AgentFlowChart data={agent.metrics.agentFlowData} />
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1 flex items-center">
                      Tool Selection Quality
                      <Tooltip content="User rating of agent's tool choices (1-5 scale). Calculated from feedback on whether the agent selected appropriate tools for each task. Average of all tool selection decisions over time." />
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-600 text-sm">Avg Rating</span>
                    </div>
                    <span className="text-3xl font-bold text-slate-900">{agent.metrics.toolQuality}</span>
                    <span className="text-slate-400 text-lg">/5</span>
                  </div>
                </div>
                <ToolSelectionQualityChart data={agent.metrics.toolQualityData} />
              </Card>
            </div>

            {/* Tool & Action Metrics */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg text-slate-900 mb-4">Tool & Action Metrics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6 border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-slate-900 font-semibold mb-1 flex items-center">
                        Tool Error Rate
                        <Tooltip content="Percentage of tool executions that failed or returned errors. Calculated as: (Failed Tool Calls / Total Tool Calls) × 100. Includes timeouts, invalid parameters, and execution failures." />
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">{agent.metrics.toolErrorRate}%</span>
                        <ArrowRight size={16} className="text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <ToolErrorRateChart data={agent.metrics.toolErrorData} />
                </Card>

                <Card className="p-6 border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-slate-900 font-semibold mb-1 flex items-center">
                        Action Completion
                        <Tooltip content="Distribution of action outcomes. Calculated by categorizing each action: Successful (completed fully), Retry Attempt (required re-execution), Aborted (manually stopped), Incomplete (timed out or partial)." />
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">{agent.metrics.actionCompletion}%</span>
                        <TrendingUp size={16} className="text-emerald-500" />
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <ActionCompletionDonut data={agent.metrics.actionCompletionData} />
                    <div className="flex flex-col gap-2 mt-4 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-slate-600">Successful</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-slate-600">Retry Attempt</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="text-slate-600">Aborted</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                          <span className="text-slate-600">Incomplete</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 text-center mt-2">Average: {agent.metrics.actionAverage}</p>
                  </div>
                </Card>

                <Card className="p-6 border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-slate-900 font-semibold mb-1 flex items-center">
                        Action Advancement
                        <Tooltip content="Percentage of actions that moved tasks toward completion. Calculated as: (Actions with Forward Progress / Total Actions) × 100. Measures productive vs. redundant work." />
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">{agent.metrics.actionAdvancement}%</span>
                        <ArrowRight size={16} className="text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <ActionAdvancementChart data={agent.metrics.actionAdvancementData} />
                </Card>
              </div>
            </div>

            {/* Cognitive & Behavioral Metrics */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg text-slate-900 mb-4">Cognitive & Behavioral Metrics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6 border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                    Reasoning Coherence
                    <Tooltip content="Logical consistency in agent's thought process (0-10 scale). Calculated by analyzing reasoning chains for contradictions, circular logic, and premise-conclusion alignment using NLP coherence models." />
                  </h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-slate-900">{agent.metrics.reasoningCoherence}</span>
                    <span className="text-slate-400 text-lg">/10</span>
                  </div>
                  <ProgressBar value={agent.metrics.reasoningCoherence} max={10} color="#3b82f6" bgColor="#e0e7ff" />
                  <p className="text-xs text-slate-500 mt-2">Average state of progressions</p>
                </Card>

                <Card className="p-6 border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                    Instruction Adherence
                    <Tooltip content="How closely agent follows given instructions (0-100%). Calculated by comparing agent actions against instruction requirements using semantic matching. Measures deviation from specified constraints and guidelines." />
                  </h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-slate-900">{agent.metrics.instructionAdherence}%</span>
                  </div>
                  <ProgressBar value={agent.metrics.instructionAdherence} max={100} color="#06b6d4" bgColor="#cffafe" />
                  <p className="text-xs text-slate-500 mt-2">Average steep of newagents: <span className="font-semibold">{agent.metrics.instructionAverage}%</span></p>
                </Card>

                <Card className="p-6 border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                    User IntentChange
                    <Tooltip content="Frequency of user goal modifications during interaction (0-100%). Calculated as: (Conversations with Intent Changes / Total Conversations) × 100. Higher values may indicate unclear initial requests or agent misunderstanding." />
                  </h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-slate-900">{agent.metrics.userIntentChange}%</span>
                    <Badge className="bg-blue-500 text-white text-xs px-2 py-0.5">
                      5m
                    </Badge>
                  </div>
                  <ProgressBar value={agent.metrics.userIntentChange} max={100} color="#f59e0b" bgColor="#fef3c7" />
                  <p className="text-xs text-slate-500 mt-2">Changed user goals. <span className="font-semibold">{agent.metrics.userIntentChange}%</span></p>
                  <div className="mt-3 flex items-center justify-end">
                    <Badge className="bg-blue-500 text-white text-sm px-3 py-1">
                      {agent.metrics.userIntentScore}/10
                    </Badge>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Card className="p-6 border-slate-200 shadow-sm">
             <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
               Token Consumption
               <Tooltip content="Breakdown of token usage across input prompts, output generation, and cached context. Calculated by tracking tokens used in each LLM API call, categorized by type." />
             </h3>
             <TokenDonutChart data={agent.tokens} />
           </Card>

           <Card className="p-6 col-span-2 border-slate-200 shadow-sm">
             <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
               Cost Burn Rate (7d)
               <Tooltip content="Daily operational costs over the past week. Calculated by summing all token costs, API calls, and compute resources used per day. Helps identify cost spikes and usage patterns." />
             </h3>
             <CostBurnChart data={agent.burn} />
           </Card>

           <Card className="p-6 bg-slate-900 text-white col-span-3 flex items-center justify-between shadow-lg">
             <div>
               <h3 className="font-medium text-slate-300 flex items-center">
                 Efficiency Metric (Cost-per-Success)
                 <Tooltip content="Average cost to complete one successful task. Calculated as: Total Daily Cost / Number of Successful Completions. Lower values indicate better cost efficiency." />
               </h3>
               <p className="text-3xl font-bold text-white mt-1">${(agent.cost / agent.successRate).toFixed(3)}</p>
             </div>
             <div className="text-right">
               <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-none">
                 {agent.successRate > 90 ? 'Top 5%' : 'Standard'}
               </Badge>
               <p className="text-xs text-slate-400 mt-2">Vs. fleet avg $0.20</p>
             </div>
           </Card>
        </div>
      )}
    </div>
  );
};
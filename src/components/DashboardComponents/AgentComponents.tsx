import React, { useState, useRef, useEffect } from 'react';
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
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isVisible && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // If element is in bottom 40% of viewport, show tooltip above
      if (rect.top > viewportHeight * 0.6) {
        setPosition('bottom');
      } else {
        setPosition('top');
      }
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="ml-1 text-slate-400 hover:text-slate-600 transition-colors"
        type="button"
      >
        <HelpCircle size={14} />
      </button>
      {isVisible && (
        <div 
          className={`absolute left-0 z-50 w-80 p-4 bg-slate-900 text-white text-xs rounded-lg shadow-xl border border-slate-700 animate-in fade-in duration-200 leading-relaxed  ${
            position === 'bottom' 
              ? 'bottom-6 slide-in-from-bottom-2' 
              : 'top-6 slide-in-from-top-2'
          }`}
        >
          <div 
            className={`absolute left-4 w-2 h-2 bg-slate-900 border-slate-700 transform rotate-45 ${
              position === 'bottom'
                ? '-bottom-1 border-b border-r'
                : '-top-1 border-l border-t'
            }`}
          />
          <div dangerouslySetInnerHTML={{ __html: content }} />
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ">
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
                <Tooltip content={`
                  <div class="space-y-2">
                    <p class="font-semibold text-blue-300 mb-2">Live Execution Trace</p>
                    <p><strong class="text-emerald-300">1. What it is:</strong> A real-time, step-by-step visualization of everything your AI agent does from the moment it receives a task until it completes it. Think of it like watching a video replay of the agent's "thought process".</p>
                    <p><strong class="text-emerald-300">2. How it's calculated:</strong> The system logs every single action the agent takes - when it receives a prompt, how it thinks about the problem, which tools it decides to use, and what output it produces. Each step is timestamped and categorized (prompt, thought, tool use, or output).</p>
                    <p><strong class="text-emerald-300">3. What it means for you:</strong> This helps you debug and understand agent behavior. If something goes wrong, you can see exactly where - did it misunderstand the task? Pick the wrong tool? Fail during execution? It's like having a flight recorder for your AI.</p>
                  </div>
                `} />
              </h3>
              <TraceView trace={agent.trace} />
            </Card>

            <div className="space-y-6">
              <Card className="p-6 border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-slate-500" /> 
                  Latency Breakdown
                  <Tooltip content={`
                    <div class="space-y-2">
                      <p class="font-semibold text-blue-300 mb-2">Latency Breakdown</p>
                      <p><strong class="text-emerald-300">1. What it is:</strong> A breakdown showing how much time the agent spends on different activities. It's like a pie chart of where your agent's time goes - similar to how you might track time spent on meetings vs. actual work.</p>
                      <p><strong class="text-emerald-300">2. How it's calculated:</strong> We measure the exact time (in milliseconds) spent in three key phases: <br/>
                      • <em>Context Retrieval</em>: Finding relevant information from memory/database<br/>
                      • <em>Model Inference</em>: The AI "thinking" and deciding what to do<br/>
                      • <em>Tool Delegation</em>: Actually executing actions or calling tools</p>
                      <p><strong class="text-emerald-300">3. What it means for you:</strong> Identifies bottlenecks. If "Context Retrieval" is taking too long, your database might be slow. If "Model Inference" is high, the agent might be overthinking. This helps optimize performance and reduce wait times.</p>
                    </div>
                  `} />
                </h3>
                <LatencyBreakdownChart data={agent.latencyBreakdown} />
              </Card>

              <Card className="p-6 border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-slate-500" /> 
                  Groundedness Score
                  <Tooltip content={`
                    <div class="space-y-2">
                      <p class="font-semibold text-blue-300 mb-2">Groundedness Score</p>
                      <p><strong class="text-emerald-300">1. What it is:</strong> A score (0 to 1) measuring how well the agent's answers stick to the facts it was given. Think of it as a "fact-checking" score - does the agent make things up, or does it stay true to its source material?</p>
                      <p><strong class="text-emerald-300">2. How it's calculated:</strong> We use semantic similarity algorithms to compare what the agent says against the documents/context it was provided. A score of 0.98 means 98% of the agent's response can be directly traced back to source information.</p>
                      <p><strong class="text-emerald-300">3. What it means for you:</strong> Higher scores (above 0.90) mean the agent is reliable and doesn't "hallucinate" or make up information. Lower scores suggest the agent might be inventing answers, which could be dangerous in production environments. Aim for 0.85+.</p>
                    </div>
                  `} />
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
                        <Tooltip content={`
                          <div class="space-y-2">
                            <p class="font-semibold text-blue-300 mb-2">Efficiency Score</p>
                            <p><strong class="text-emerald-300">1. What it is:</strong> A normalized efficiency metric measuring agent productivity. Based on the standard System Performance Efficiency (SPE) formula used in distributed computing and cloud services. Higher scores mean better resource utilization.</p>
                            <p><strong class="text-emerald-300">2. How it's calculated:</strong> Using the industry-standard formula:
                            <strong>Efficiency = (Throughput × Quality) / Cost</strong><br/>
                            Where:<br/>
                            • <em>Throughput</em> = Tasks completed per dollar (100 tasks ÷ $42.50 = 2.35 tasks/$)<br/>
                            • <em>Quality</em> = Success rate as decimal (94% = 0.94)<br/>
                            • <em>Cost</em> = Normalized cost factor (42.50 / 50 = 0.85)<br/>
                            Formula: (2.35 × 0.94) / 0.85 = 2.60<br/>
                            Normalized to 0-1 scale: 2.60 / 3.14 (max theoretical) = <strong>0.83</strong><br/>
                            </p>
                            <p><strong class="text-emerald-300">3. What it means for you:</strong> Scores above 0.80 indicate top-tier efficiency</p>
                          </div>
                        `} />
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
                    <Tooltip content={`
                      <div class="space-y-2">
                        <p class="font-semibold text-blue-300 mb-2">Agent Flow</p>
                        <p><strong class="text-emerald-300">1. What it is:</strong> A 100% stacked chart showing how the agent divides its time across four main activities throughout the day. It's like a time-tracking app for your AI agent showing its "daily routine".</p>
                        <p><strong class="text-emerald-300">2. How it's calculated:</strong> Every second of agent operation is categorized:<br/>
                        • <em>Intent Resolution</em>: Understanding what the user wants<br/>
                        • <em>Inference & Planning</em>: Thinking and strategizing<br/>
                        • <em>Tool Usage</em>: Actually doing work with tools<br/>
                        • <em>Waiting</em>: Idle time or waiting for resources<br/>
                        These are tracked continuously and displayed as percentages of total time.</p>
                        <p><strong class="text-emerald-300">3. What it means for you:</strong> Helps identify workflow issues. Too much waiting? Resources are constrained. Too much intent resolution? Users might be unclear in their requests. Ideal agents spend most time on inference and tool usage.</p>
                      </div>
                    `} />
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
                      <Tooltip content={`
                        <div class="space-y-2">
                          <p class="font-semibold text-blue-300 mb-2">Tool Selection Quality</p>
                          <p><strong class="text-emerald-300">1. What it is:</strong> A user satisfaction rating (1-5 stars, like Uber or Airbnb) measuring how well the agent chooses the right tools for each job. Did it pick a hammer when it needed a screwdriver?</p>
                          <p><strong class="text-emerald-300">2. How it's calculated:</strong> Based on user feedback and automated analysis after each task. We evaluate:<br/>
                          • Did the agent choose the optimal tool?<br/>
                          • Could the task have been done faster with a different tool?<br/>
                          • Were unnecessary tools used?<br/>
                          Scores are averaged across all tool selection decisions over time.</p>
                          <p><strong class="text-emerald-300">3. What it means for you:</strong> Ratings above 4.5/5 are excellent - the agent consistently makes smart choices. Below 3.5 suggests the agent needs better training on when to use which tools. This directly impacts efficiency and user satisfaction.</p>
                        </div>
                      `} />
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
                        <Tooltip content={`
                          <div class="space-y-2">
                            <p class="font-semibold text-blue-300 mb-2">Tool Error Rate</p>
                            <p><strong class="text-emerald-300">1. What it is:</strong> The percentage of times tools fail when the agent tries to use them. It's like tracking how often your apps crash on your phone - lower is definitely better!</p>
                            <p><strong class="text-emerald-300">2. How it's calculated:</strong> Formula: (Failed Tool Calls ÷ Total Tool Calls) × 100<br/>
                            Failures include:<br/>
                            • Tools timing out (taking too long)<br/>
                            • Invalid parameters (wrong input)<br/>
                            • Tool crashes or errors<br/>
                            • Permission issues<br/>
                            Example: 5 failures out of 100 tool calls = 5% error rate</p>
                            <p><strong class="text-emerald-300">3. What it means for you:</strong> Rates below 5% are good, below 2% are excellent. High error rates disrupt workflows and waste resources. If you see spikes, check if specific tools are problematic or if the agent is using tools incorrectly.</p>
                          </div>
                        `} />
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
                        <Tooltip content={`
                          <div class="space-y-2">
                            <p class="font-semibold text-blue-300 mb-2">Action Completion</p>
                            <p><strong class="text-emerald-300">1. What it is:</strong> A breakdown of what happens to every action the agent attempts. Think of it like a sports statistic - how many shots were successful, how many needed a retry, how many were stopped, etc.</p>
                            <p><strong class="text-emerald-300">2. How it's calculated:</strong> Every action is tracked and categorized:<br/>
                            • <em>Successful</em>: Completed fully on first try<br/>
                            • <em>Retry Attempt</em>: Failed first time but succeeded after retry<br/>
                            • <em>Aborted</em>: Manually stopped or cancelled by user/system<br/>
                            • <em>Incomplete</em>: Timed out or partially finished<br/>
                            The donut chart shows the percentage distribution of these outcomes.</p>
                            <p><strong class="text-emerald-300">3. What it means for you:</strong> You want 85%+ successful actions. Some retries (5-10%) are normal. High abort or incomplete rates suggest tasks are too complex or resources are insufficient. The overall percentage shows first-time success rate.</p>
                          </div>
                        `} />
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
                        <Tooltip content={`
                          <div class="space-y-2">
                            <p class="font-semibold text-blue-300 mb-2">Action Advancement</p>
                            <p><strong class="text-emerald-300">1. What it is:</strong> The percentage of actions that actually move tasks forward toward completion (vs. spinning wheels doing redundant or unhelpful work). It's like measuring "productive time" - are you making real progress?</p>
                            <p><strong class="text-emerald-300">2. How it's calculated:</strong> Formula: (Actions with Forward Progress ÷ Total Actions) × 100<br/>
                            We analyze each action to determine if it:<br/>
                            • Brought the task closer to completion<br/>
                            • Added new valuable information<br/>
                            • Solved a sub-problem<br/>
                            Actions that repeat work or don't contribute are excluded from the numerator.</p>
                            <p><strong class="text-emerald-300">3. What it means for you:</strong> Scores above 75% are good - most actions are productive. Below 60% suggests the agent is inefficient, doing redundant work, or stuck in loops. High advancement means better resource utilization and faster task completion.</p>
                          </div>
                        `} />
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
                    <Tooltip content={`
                      <div class="space-y-2">
                        <p class="font-semibold text-blue-300 mb-2">Reasoning Coherence</p>
                        <p><strong class="text-emerald-300">1. What it is:</strong> A score (0-10) measuring how logical and consistent the agent's thinking is. Does it contradict itself? Does its conclusion follow from its reasoning? It's like grading an essay for logical flow.</p>
                        <p><strong class="text-emerald-300">2. How it's calculated:</strong> Natural Language Processing (NLP) models analyze the agent's reasoning chains looking for:<br/>
                        • Contradictions (saying opposite things)<br/>
                        • Circular logic (using conclusion as premise)<br/>
                        • Non-sequiturs (conclusion doesn't follow from facts)<br/>
                        • Premise-conclusion alignment<br/>
                        Advanced coherence models score from 0 (completely incoherent) to 10 (perfectly logical).</p>
                        <p><strong class="text-emerald-300">3. What it means for you:</strong> Scores 8+ indicate strong reasoning - the agent "thinks" clearly. Scores below 6 suggest confused or contradictory logic, which could lead to wrong answers. This is critical for complex decision-making tasks.</p>
                      </div>
                    `} />
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
                    <Tooltip content={`
                      <div class="space-y-2">
                        <p class="font-semibold text-blue-300 mb-2">Instruction Adherence</p>
                        <p><strong class="text-emerald-300">1. What it is:</strong> How well the agent follows the rules and instructions you give it (0-100%). If you tell it "always cite sources" or "never access external APIs", does it actually listen? It's like measuring obedience.</p>
                        <p><strong class="text-emerald-300">2. How it's calculated:</strong> We compare agent actions against instruction requirements using semantic matching:<br/>
                        • Extract all constraints from instructions<br/>
                        • Check each agent action for compliance<br/>
                        • Score: (Compliant Actions ÷ Total Actions) × 100<br/>
                        Example: If 87 out of 100 actions followed guidelines, score = 87%</p>
                        <p><strong class="text-emerald-300">3. What it means for you:</strong> Scores 90%+ are excellent - the agent reliably follows rules. Below 75% is concerning, especially for regulated industries or security-critical applications. Low scores might mean instructions are unclear or agent needs fine-tuning.</p>
                      </div>
                    `} />
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
                    <Tooltip content={`
                      <div class="space-y-2">
                        <p class="font-semibold text-blue-300 mb-2">User IntentChange</p>
                        <p><strong class="text-emerald-300">1. What it is:</strong> How often users change their mind or clarify their goals during a conversation with the agent (0-100%). It's like tracking how many times you have to re-explain what you want. Lower is usually better.</p>
                        <p><strong class="text-emerald-300">2. How it's calculated:</strong> Formula: (Conversations with Intent Changes ÷ Total Conversations) × 100<br/>
                        We detect intent changes by:<br/>
                        • User says "actually, I meant..." or "no, instead..."<br/>
                        • User provides completely new goal mid-conversation<br/>
                        • User corrects agent's understanding<br/>
                        The badge shows real-time tracking (last 5 minutes), and score shows overall rate.</p>
                        <p><strong class="text-emerald-300">3. What it means for you:</strong> Low rates (5-10%) are ideal - agent understands users quickly. High rates (20%+) suggest either: (a) agent misunderstands requests, or (b) users aren't clear initially. The /10 score rates how well the agent handles these changes when they occur.</p>
                      </div>
                    `} />
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
               <Tooltip content={`
                 <div class="space-y-2">
                   <p class="font-semibold text-blue-300 mb-2">Token Consumption</p>
                   <p><strong class="text-emerald-300">1. What it is:</strong> A breakdown showing how many "tokens" (small chunks of text) the AI uses, split into three categories. Tokens are how AI models charge for usage - like data usage on your phone plan.</p>
                   <p><strong class="text-emerald-300">2. How it's calculated:</strong> Every time the agent interacts with an AI model, we count:<br/>
                   • <em>Input Tokens</em>: Text sent TO the model (your questions, context)<br/>
                   • <em>Output Tokens</em>: Text generated BY the model (answers, code)<br/>
                   • <em>Cached Tokens</em>: Previously used text stored for reuse (much cheaper!)<br/>
                   Total is tracked across all API calls in the selected time period.</p>
                   <p><strong class="text-emerald-300">3. What it means for you:</strong> More cached tokens = lower costs. High input tokens might mean you're sending too much context. Output tokens drive most costs for generative tasks. Use this to optimize prompts and reduce spending.</p>
                 </div>
               `} />
             </h3>
             <TokenDonutChart data={agent.tokens} />
           </Card>

           <Card className="p-6 col-span-2 border-slate-200 shadow-sm">
             <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
               Cost Burn Rate (7d)
               <Tooltip content={`
                 <div class="space-y-2">
                   <p class="font-semibold text-blue-300 mb-2">Cost Burn Rate (7 Days)</p>
                   <p><strong class="text-emerald-300">1. What it is:</strong> A daily view of how much money this agent is spending over the past week. Think of it as your credit card statement, but broken down by day so you can spot unusual spending.</p>
                   <p><strong class="text-emerald-300">2. How it's calculated:</strong> Each day, we add up all costs:<br/>
                   • Token costs (input + output from AI models)<br/>
                   • API call fees<br/>
                   • Compute resources (server time, memory)<br/>
                   • Tool usage costs (if external tools charge)<br/>
                   The bar chart shows daily totals for easy comparison.</p>
                   <p><strong class="text-emerald-300">3. What it means for you:</strong> Look for spikes - did Wednesday cost way more than Monday? That might indicate a problem, increased usage, or inefficient operations. Use this to budget, forecast costs, and identify optimization opportunities. Steady, predictable costs are ideal.</p>
                 </div>
               `} />
             </h3>
             <CostBurnChart data={agent.burn} />
           </Card>

           <Card className="p-6 bg-slate-900 text-white col-span-3 flex items-center justify-between shadow-lg">
             <div>
               <h3 className="font-medium text-slate-300 flex items-center">
                 Efficiency Metric (Cost-per-Success)
                 <Tooltip content={`
                   <div class="space-y-2">
                     <p class="font-semibold text-blue-300 mb-2">Cost-per-Success</p>
                     <p><strong class="text-emerald-300">1. What it is:</strong> The average cost to complete ONE successful task. It's your "unit economics" - like cost per sale in business or cost per mile in transportation. Lower is better!</p>
                     <p><strong class="text-emerald-300">2. How it's calculated:</strong> Simple formula: Total Daily Cost ÷ Number of Successful Tasks<br/>
                     Example: If agent costs $42.50 per day and completes 94 successful tasks, cost-per-success = $42.50 ÷ 94 = $0.452 per success.</p>
                     <p><strong class="text-emerald-300">3. What it means for you:</strong> This is THE metric for ROI. Compare against your value per task - if each successful task saves $10 in labor, and costs $0.45, you're winning big! "Top 5%" badge means this agent is in the top 5% most cost-efficient in your fleet. Use this to justify agent spending or identify which agents to optimize.</p>
                   </div>
                 `} />
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

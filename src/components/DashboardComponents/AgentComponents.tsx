import React, { useState } from 'react';
import { 
  Bot, Clock, Zap, CheckCircle2, 
  Terminal, Globe, ArrowRight, LayoutList, LayoutGrid,
  AlertTriangle 
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentSparkline, LatencyBreakdownChart, TokenDonutChart, CostBurnChart } from './AgentCharts';
import { AGENTS_OBSERVABILITY_DATA } from '@/constants';

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Terminal size={18} className="text-slate-500" /> Live Execution Trace
            </h3>
            <TraceView trace={agent.trace} />
          </Card>

          <div className="space-y-6">
             <Card className="p-6 border-slate-200 shadow-sm">
               <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                 <Clock size={18} className="text-slate-500" /> Latency Breakdown
               </h3>
               <LatencyBreakdownChart data={agent.latencyBreakdown} />
             </Card>

             <Card className="p-6 border-slate-200 shadow-sm">
               <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                 <CheckCircle2 size={18} className="text-slate-500" /> Groundedness Score
               </h3>
               <div className="flex items-center justify-center py-6 relative">
                 <div className="text-4xl font-bold text-slate-800">{agent.groundedness}</div>
                 <div className="absolute w-full h-full border-4 border-slate-100 rounded-full opacity-20" />
                 
               </div>
               <p className="text-center text-xs text-slate-500">Fidelity to source context</p>
             </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Card className="p-6 border-slate-200 shadow-sm">
             <h3 className="font-semibold text-slate-900 mb-4">Token Consumption</h3>
             <TokenDonutChart data={agent.tokens} />
           </Card>

           <Card className="p-6 col-span-2 border-slate-200 shadow-sm">
             <h3 className="font-semibold text-slate-900 mb-4">Cost Burn Rate (7d)</h3>
             <CostBurnChart data={agent.burn} />
           </Card>

           <Card className="p-6 bg-slate-900 text-white col-span-3 flex items-center justify-between shadow-lg">
             <div>
               <h3 className="font-medium text-slate-300">Efficiency Metric (Cost-per-Success)</h3>
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
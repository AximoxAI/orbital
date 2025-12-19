import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { InboxIcon } from '@heroicons/react/24/outline';
import { INSIGHTS } from '../../constants';

const InsightsPanel: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-slate-800 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">Agentic Insights</h2>
        </div>
        <div className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          CORE ENGINE
        </div>
      </div>

      <div className="p-5 bg-white">
        {INSIGHTS.length > 0 ? (
          <div className="space-y-6">
            {INSIGHTS.map((insight, idx) => (
              <div key={idx} className="group">
                <div className="flex items-start gap-3">
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                    insight.impact === 'high' ? 'bg-slate-900' : 'bg-slate-400'
                  }`} />
                  
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-800 leading-tight">
                      {insight.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      {insight.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
              <InboxIcon className="w-5 h-5 text-slate-300" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">No insights found</h3>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[180px] leading-relaxed">
              We couldn't find any high-level patterns in current stream activities.
            </p>
          </div>
        )}

        <div className="mt-8 pt-5 border-t border-slate-100">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collab Velocity</span>
              <div className="text-lg font-bold text-slate-900 leading-none">92.4%</div>
            </div>
            <div className="text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
              STABLE
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-900 rounded-full" style={{ width: '92.4%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
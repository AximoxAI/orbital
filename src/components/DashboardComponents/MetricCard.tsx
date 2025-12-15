import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  unit?: string;
  inverse?: boolean; // If true, lower is better (e.g. debt ratio)
}

const MetricCard: React.FC<MetricCardProps> = ({ name, value, previousValue, change, unit = '', inverse = false }) => {
  const isPositive = inverse ? change < 0 : change > 0;
  const isNeutral = change === 0;

  return (
    <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-wider">{name}</h3>
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-900">{value}</span>
          <span className="text-slate-500 text-lg">{unit}</span>
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full border ${
          isNeutral ? 'bg-slate-100 text-slate-600 border-slate-200' : 
          isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
        }`}>
          {isNeutral ? <Minus size={14} /> : isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <p className="text-slate-400 text-xs mt-3">vs. previous {previousValue}{unit}</p>
    </Card>
  );
};

export default MetricCard;
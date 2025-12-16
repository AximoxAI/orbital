import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, Legend, CartesianGrid } from 'recharts';
import { MEASURES_DATA } from '@/constants';

const formatDebt = (minutes: number) => {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
};

const COLORS: Record<string, string> = {
  A: '#10b981',
  B: '#84cc16',
  C: '#eab308',
  D: '#f97316',
  E: '#ef4444',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg text-xs">
        <p className="font-bold text-slate-900 mb-1">{data.name}</p>
        <div className="space-y-1 text-slate-600">
          <p>Rating: <span style={{ color: COLORS[data.rating], fontWeight: 'bold' }}>{data.rating}</span></p>
          <p>Tech Debt: {formatDebt(data.debt)}</p>
          <p>Coverage: {data.coverage}%</p>
          <p>Lines of Code: {data.loc}</p>
        </div>
      </div>
    );
  }
  return null;
};

const MeasuresChart: React.FC = () => {
  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            type="number" 
            dataKey="debt" 
            name="Technical Debt" 
            tickFormatter={formatDebt}
            label={{ value: 'Technical Debt', position: 'bottom', offset: 0, fontSize: 12, fill: '#64748b' }}
            stroke="#cbd5e1"
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <YAxis 
            type="number" 
            dataKey="coverage" 
            name="Coverage" 
            unit="%" 
            reversed={true}
            label={{ value: 'Coverage', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748b' }}
            stroke="#cbd5e1"
            tick={{ fontSize: 11, fill: '#64748b' }}
            domain={[0, 100]}
          />
          <ZAxis type="number" dataKey="loc" range={[100, 1000]} name="Lines of Code" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend 
            verticalAlign="top" 
            height={36}
            content={() => (
               <div className="flex justify-end gap-3 text-xs text-slate-500 -mt-2">
                 <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#10b981]"></span> A (Reliable)</div>
                 <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#eab308]"></span> C (Warning)</div>
                 <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#ef4444]"></span> E (Critical)</div>
                 <span className="ml-4 italic">Size represents Lines of Code</span>
               </div>
            )}
          />
          <Scatter name="Files" data={MEASURES_DATA} fill="#8884d8">
            {MEASURES_DATA.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.rating] || '#cbd5e1'} stroke="#fff" strokeWidth={1} fillOpacity={0.6} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MeasuresChart;
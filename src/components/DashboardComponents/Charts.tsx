import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line, ComposedChart, Scatter, PieChart, Pie, Cell
} from 'recharts';
import { DUPLICATION_DATA, COVERAGE_DATA, VELOCITY_DATA, HOTSPOTS, DEPENDENCY_HEALTH, RISK_TRENDS, PR_METRICS } from '@/constants';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl z-50">
        {label && <p className="text-slate-700 font-medium mb-2">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill }}></span>
            <span className="text-slate-500">{entry.name}:</span>
            <span className="text-slate-900 font-mono font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Common styles for charts
const gridColor = "#e2e8f0"; // slate-200
const axisColor = "#94a3b8"; // slate-400

export const DuplicationChart: React.FC = () => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={DUPLICATION_DATA}>
      <defs>
        <linearGradient id="colorBefore" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
        </linearGradient>
        <linearGradient id="colorAfter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
      <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
      <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} unit="%" />
      <Tooltip content={<CustomTooltip />} />
      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
      <Area type="monotone" dataKey="before" name="Before Refactor" stroke="#ef4444" fillOpacity={1} fill="url(#colorBefore)" />
      <Area type="monotone" dataKey="after" name="Current" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAfter)" />
    </AreaChart>
  </ResponsiveContainer>
);

export const CoverageChart: React.FC = () => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={COVERAGE_DATA}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
      <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
      <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} unit="%" />
      <Tooltip content={<CustomTooltip />} />
      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
      <Bar dataKey="unit" name="Unit" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
      <Bar dataKey="integration" name="Integration" stackId="a" fill="#8b5cf6" />
      <Bar dataKey="e2e" name="E2E" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const VelocityChart: React.FC = () => (
  <ResponsiveContainer width="100%" height={300}>
    <ComposedChart data={VELOCITY_DATA}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
      <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
      <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
      <Tooltip content={<CustomTooltip />} />
      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
      <Bar dataKey="manual" name="Manual Refactors" barSize={20} fill="#f59e0b" radius={[4, 4, 0, 0]} />
      <Bar dataKey="automated" name="AI Refactors" barSize={20} fill="#6366f1" radius={[4, 4, 0, 0]} />
      <Line type="monotone" dataKey="automated" name="AI Trend" stroke="#a5b4fc" strokeWidth={2} dot={{ r: 4 }} />
    </ComposedChart>
  </ResponsiveContainer>
);

export const HotspotHeatmap: React.FC = () => {
  const data = HOTSPOTS.map((h, i) => ({
    x: h.complexity,
    y: h.churn,
    z: h.coverage, 
    name: h.name
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis type="number" dataKey="x" name="Complexity" stroke={axisColor} label={{ value: 'Cyclomatic Complexity', position: 'bottom', fill: axisColor, fontSize: 12 }} />
        <YAxis type="number" dataKey="y" name="Churn" stroke={axisColor} label={{ value: 'File Churn Rate', angle: -90, position: 'left', fill: axisColor, fontSize: 12 }} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
           if (payload && payload.length) {
             const d = payload[0].payload;
             return (
               <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl text-xs">
                 <p className="font-bold text-slate-900 mb-1">{d.name}</p>
                 <p className="text-slate-500">Complexity: <span className="text-slate-700 font-semibold">{d.x}</span></p>
                 <p className="text-slate-500">Churn: <span className="text-slate-700 font-semibold">{d.y}%</span></p>
                 <p className="text-slate-500">Coverage: <span className={d.z < 50 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>{d.z}%</span></p>
               </div>
             )
           }
           return null;
        }} />
        <Scatter name="Modules" data={data} fill="#8884d8">
          {data.map((entry, index) => (
             <Cell key={`cell-${index}`} fill={entry.z < 50 ? '#ef4444' : entry.z < 80 ? '#f59e0b' : '#10b981'} />
          ))}
        </Scatter>
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export const DependencyPieChart: React.FC = () => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={DEPENDENCY_HEALTH}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={100}
        paddingAngle={5}
        dataKey="value"
      >
        {DEPENDENCY_HEALTH.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.fill as string} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
    </PieChart>
  </ResponsiveContainer>
);

export const RiskTrendChart: React.FC = () => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={RISK_TRENDS}>
       <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
       <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
       <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
       <Tooltip content={<CustomTooltip />} />
       <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
       <Line type="monotone" dataKey="bugsHuman" name="Bugs (Human)" stroke="#ef4444" strokeWidth={2} />
       <Line type="monotone" dataKey="bugsAI" name="Bugs (AI)" stroke="#ec4899" strokeDasharray="5 5" strokeWidth={2} />
       <Line type="monotone" dataKey="rollbacks" name="Rollbacks" stroke="#f59e0b" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

export const PrChart: React.FC = () => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={PR_METRICS}>
       <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
       <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
       <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
       <Tooltip content={<CustomTooltip />} />
       <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
       <Bar dataKey="openedHuman" name="Opened (Human)" stackId="a" fill="#3b82f6" />
       <Bar dataKey="openedAI" name="Opened (AI)" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
       <Bar dataKey="mergedHuman" name="Merged (Human)" stackId="b" fill="#10b981" />
       <Bar dataKey="mergedAI" name="Merged (AI)" stackId="b" fill="#34d399" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
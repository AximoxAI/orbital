import React from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981', 
  warning: '#f59e0b',
  danger: '#ef4444',
  slate: '#64748b',
  grid: '#e2e8f0',
  purple: '#8b5cf6',
  emerald: '#10b981',
  amber: '#f59e0b'
};

const DONUT_COLORS = ['#3b82f6', '#10b981', '#cbd5e1'];
const AGENT_FLOW_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#94a3b8'];
const ACTION_COMPLETION_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#94a3b8'];

export const AgentSparkline = ({ data, color = COLORS.primary }: { data: any[], color?: string }) => (
  <ResponsiveContainer width="100%" height={50}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area 
        type="monotone" 
        dataKey="value" 
        stroke={color} 
        fill={`url(#gradient-${color})`} 
        strokeWidth={2} 
        isAnimationActive={false}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export const LatencyBreakdownChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data} layout="vertical" barSize={20}>
      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.grid} />
      <XAxis type="number" hide />
      <YAxis 
        dataKey="stage" 
        type="category" 
        width={100} 
        tick={{ fontSize: 12, fill: COLORS.slate }} 
        axisLine={false} 
        tickLine={false} 
      />
      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
      <Bar dataKey="time" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const TokenDonutChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={80}
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend verticalAlign="bottom" height={36} iconType="circle" />
    </PieChart>
  </ResponsiveContainer>
);

export const CostBurnChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={data} barSize={30}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
      <YAxis hide />
      <Tooltip cursor={{ fill: '#f1f5f9' }} />
      <Bar dataKey="cost" fill={COLORS.slate} radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const EfficiencyChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={120}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="efficiency-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
          <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
      <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <Tooltip />
      <Area 
        type="monotone" 
        dataKey="score" 
        stroke={COLORS.success} 
        fill="url(#efficiency-gradient)" 
        strokeWidth={2}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export const AgentFlowChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={200}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
      <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <Tooltip />
      <Area type="monotone" dataKey="intentResolution" stackId="1" stroke={AGENT_FLOW_COLORS[0]} fill={AGENT_FLOW_COLORS[0]} />
      <Area type="monotone" dataKey="inference" stackId="1" stroke={AGENT_FLOW_COLORS[1]} fill={AGENT_FLOW_COLORS[1]} />
      <Area type="monotone" dataKey="toolUsage" stackId="1" stroke={AGENT_FLOW_COLORS[2]} fill={AGENT_FLOW_COLORS[2]} />
      <Area type="monotone" dataKey="waiting" stackId="1" stroke={AGENT_FLOW_COLORS[3]} fill={AGENT_FLOW_COLORS[3]} />
    </AreaChart>
  </ResponsiveContainer>
);

export const ToolSelectionQualityChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={140}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="quality-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
      <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis domain={[3, 5]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <Tooltip />
      <Area 
        type="monotone" 
        dataKey="rating" 
        stroke={COLORS.primary} 
        fill="url(#quality-gradient)" 
        strokeWidth={2}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export const ToolErrorRateChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={120}>
    <LineChart data={data}>
      <defs>
        <linearGradient id="error-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
        </linearGradient>
      </defs>
      <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <Tooltip />
      <Line 
        type="monotone" 
        dataKey="errorRate" 
        stroke={COLORS.primary} 
        strokeWidth={2}
        dot={false}
      />
    </LineChart>
  </ResponsiveContainer>
);

export const ActionCompletionDonut = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={90}
        paddingAngle={2}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={ACTION_COMPLETION_COLORS[index % ACTION_COMPLETION_COLORS.length]} />
        ))}
      </Pie>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-slate-900">
        95%
      </text>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

export const ActionAdvancementChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={120}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="advancement-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
      <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis domain={[30, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <Tooltip />
      <Area 
        type="monotone" 
        dataKey="advancement" 
        stroke={COLORS.primary} 
        fill="url(#advancement-gradient)" 
        strokeWidth={2}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export const ProgressBar = ({ value, max = 100, color = COLORS.primary, bgColor = '#e0e7ff' }: { value: number, max?: number, color?: string, bgColor?: string }) => (
  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: bgColor }}>
    <div 
      className="h-full rounded-full transition-all duration-500" 
      style={{ 
        width: `${(value / max) * 100}%`,
        backgroundColor: color 
      }}
    />
  </div>
);
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981', 
  warning: '#f59e0b',
  danger: '#ef4444',
  slate: '#64748b',
  grid: '#e2e8f0'
};

const DONUT_COLORS = ['#3b82f6', '#10b981', '#cbd5e1'];

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
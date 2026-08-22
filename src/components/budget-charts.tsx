// src/components/budget-charts.tsx
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#0f172a", "#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

export function CategoryPieChart({ data }: { data: { category: string; cost: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-400">No costed activities yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="cost"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={(entry: any) => `${entry.category}: $${entry.cost.toFixed(0)}`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DailyCostBarChart({ data }: { data: { date: string; cost: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-400">No daily costs to show yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          fontSize={12}
        />
        <YAxis fontSize={12} />
        <Tooltip
          formatter={(value: any) => `$${Number(value).toFixed(2)}`}
          labelFormatter={(d: any) => new Date(d).toLocaleDateString()}
        />
        <Legend />
        <Bar dataKey="cost" fill="#0f172a" name="Daily cost" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
// src/components/admin-charts.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export function TopItemsBarChart({
  data,
  dataKey,
  nameKey,
}: {
  data: any[];
  dataKey: string;
  nameKey: string;
}) {
  if (data.length === 0) return <p className="text-sm text-slate-400">No data yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} fontSize={12} />
        <YAxis type="category" dataKey={nameKey} width={120} fontSize={12} />
        <Tooltip />
        <Bar dataKey={dataKey} fill="#0f172a" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TripsOverTimeChart({ data }: { data: { month: string; count: number }[] }) {
  if (data.length === 0) return <p className="text-sm text-slate-400">No trips yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" fontSize={12} />
        <YAxis allowDecimals={false} fontSize={12} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
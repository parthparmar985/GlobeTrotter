// src/lib/budget.ts
type StopActivity = {
  date: Date;
  activity: { cost: number; category: string };
};

type Stop = {
  startDate: Date;
  endDate: Date;
  activities: StopActivity[];
};

export type BudgetBreakdown = {
  totalCost: number;
  byCategory: { category: string; cost: number }[];
  tripDays: number;
  avgCostPerDay: number;
  budgetCap: number | null;
  isOverBudget: boolean;
  overBudgetAmount: number;
  dailyCosts: { date: string; cost: number }[];
};

export function calculateBudget(
  stops: Stop[],
  tripStart: Date,
  tripEnd: Date,
  budgetCap: number | null
): BudgetBreakdown {
  const allActivities = stops.flatMap((s) => s.activities);
  const totalCost = allActivities.reduce((sum, sa) => sum + sa.activity.cost, 0);

  const categoryMap = new Map<string, number>();
  for (const sa of allActivities) {
    categoryMap.set(sa.activity.category, (categoryMap.get(sa.activity.category) || 0) + sa.activity.cost);
  }
  const byCategory = Array.from(categoryMap.entries()).map(([category, cost]) => ({ category, cost }));

  const tripDays = Math.max(
    1,
    Math.ceil((tripEnd.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
  const avgCostPerDay = totalCost / tripDays;

  const dailyMap = new Map<string, number>();
  for (const sa of allActivities) {
    const key = sa.date.toISOString().slice(0, 10);
    dailyMap.set(key, (dailyMap.get(key) || 0) + sa.activity.cost);
  }
  const dailyCosts = Array.from(dailyMap.entries())
    .map(([date, cost]) => ({ date, cost }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const isOverBudget = budgetCap !== null && totalCost > budgetCap;
  const overBudgetAmount = isOverBudget ? totalCost - (budgetCap as number) : 0;

  return {
    totalCost,
    byCategory,
    tripDays,
    avgCostPerDay,
    budgetCap,
    isOverBudget,
    overBudgetAmount,
    dailyCosts,
  };
}
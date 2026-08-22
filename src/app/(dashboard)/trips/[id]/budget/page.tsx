// src/app/(dashboard)/trips/[id]/budget/page.tsx
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateBudget } from "@/lib/budget";
import { CategoryPieChart, DailyCostBarChart } from "@/components/budget-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TripBudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      stops: {
        include: { activities: { include: { activity: true } } },
      },
    },
  });

  if (!trip || trip.userId !== session!.user.id) notFound();

  const budget = calculateBudget(trip.stops, trip.startDate, trip.endDate, trip.budgetCap);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{trip.name} — Budget & Cost Breakdown</h1>
        <p className="text-slate-600">Stay informed and within budget.</p>
      </div>

      {budget.isOverBudget && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ This trip is <strong>${budget.overBudgetAmount.toFixed(0)} over</strong> your budget cap of
          ${budget.budgetCap?.toFixed(0)}.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total estimated cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${budget.totalCost.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Average per day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${budget.avgCostPerDay.toFixed(0)}</p>
            <p className="text-xs text-slate-400">{budget.tripDays} day trip</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Budget cap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {budget.budgetCap ? `$${budget.budgetCap.toFixed(0)}` : "—"}
            </p>
            {budget.budgetCap && (
              <Badge variant={budget.isOverBudget ? "destructive" : "secondary"} className="mt-1">
                {budget.isOverBudget ? "Over budget" : "On track"}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost by category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={budget.byCategory} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost by day</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyCostBarChart data={budget.dailyCosts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
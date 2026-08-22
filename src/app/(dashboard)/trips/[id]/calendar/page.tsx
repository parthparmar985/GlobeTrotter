// src/app/(dashboard)/trips/[id]/calendar/page.tsx
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default async function TripCalendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      stops: {
        orderBy: { order: "asc" },
        include: {
          city: true,
          activities: { include: { activity: true }, orderBy: { date: "asc" } },
        },
      },
    },
  });

  if (!trip || trip.userId !== session!.user.id) notFound();

  // Build a full day-by-day timeline from trip start to end
  const days: { date: Date; city: string | null; activities: typeof trip.stops[0]["activities"] }[] = [];
  const cursor = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  while (cursor <= end) {
    const stop = trip.stops.find(
      (s) => cursor >= new Date(s.startDate) && cursor <= new Date(s.endDate)
    );
    const dayActivities = stop
      ? stop.activities.filter(
          (sa) => new Date(sa.date).toISOString().slice(0, 10) === cursor.toISOString().slice(0, 10)
        )
      : [];
    days.push({ date: new Date(cursor), city: stop?.city.name ?? null, activities: dayActivities });
    cursor.setDate(cursor.getDate() + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{trip.name} — Timeline</h1>
        <Link href={`/trips/${trip.id}/build`}>
          <Button variant="outline">Quick edit in Builder</Button>
        </Link>
      </div>

      <div className="relative space-y-0 border-l-2 border-slate-200 pl-6">
        {days.map((day, i) => (
          <details key={i} className="group mb-4" open={day.activities.length > 0}>
            <summary className="relative cursor-pointer list-none">
              <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-slate-900" />
              <div className="flex items-center justify-between rounded-md border bg-white px-4 py-3">
                <div>
                  <p className="font-medium">{formatDate(day.date)}</p>
                  <p className="text-xs text-slate-500">{day.city ?? "No stop scheduled"}</p>
                </div>
                <span className="text-xs text-slate-400">
                  {day.activities.length} {day.activities.length === 1 ? "activity" : "activities"} · click to {day.activities.length ? "collapse" : "expand"}
                </span>
              </div>
            </summary>
            <div className="ml-1 mt-2 space-y-2 pb-2">
              {day.activities.length === 0 ? (
                <p className="text-sm text-slate-400">Free day — nothing scheduled.</p>
              ) : (
                day.activities.map((sa) => (
                  <div key={sa.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                    <span>{sa.time && `${sa.time} · `}{sa.activity.name}</span>
                    <span className="text-slate-500">${sa.activity.cost.toFixed(0)}</span>
                  </div>
                ))
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
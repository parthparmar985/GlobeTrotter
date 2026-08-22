// src/app/(dashboard)/trips/[id]/activities/page.tsx
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchActivities } from "@/lib/actions/discovery";
import { ActivityToggleButton } from "@/components/discovery-widgets";
import { Badge } from "@/components/ui/badge";

export default async function TripActivitiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ stopId?: string; category?: string; maxCost?: string }>;
}) {
  const { id } = await params;
  const { stopId, category, maxCost } = await searchParams;
  const session = await getServerSession(authOptions);

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      stops: {
        orderBy: { order: "asc" },
        include: { city: true, activities: true },
      },
    },
  });

  if (!trip || trip.userId !== session!.user.id) notFound();

  if (trip.stops.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold">{trip.name} — Activities</h1>
        <p className="mt-4 rounded-md border border-dashed p-6 text-center text-slate-500">
          Add a city stop to this trip first, from the{" "}
          <a href="/cities" className="underline">Explore Cities</a> page.
        </p>
      </div>
    );
  }

  const activeStop = trip.stops.find((s) => s.id === stopId) || trip.stops[0];

  const activities = await searchActivities(
    activeStop.cityId,
    category,
    maxCost ? Number(maxCost) : undefined
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{trip.name} — Activities</h1>

      {/* Stop selector tabs */}
      <div className="flex flex-wrap gap-2">
        {trip.stops.map((stop) => (
          <a
            key={stop.id}
            href={`?stopId=${stop.id}`}
            className={`rounded-full px-4 py-1.5 text-sm ${
              stop.id === activeStop.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {stop.city.name}
          </a>
        ))}
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <input type="hidden" name="stopId" value={activeStop.id} />
        <select
          name="category"
          defaultValue={category}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          <option value="Sightseeing">Sightseeing</option>
          <option value="Food">Food</option>
          <option value="Adventure">Adventure</option>
        </select>
        <input
          type="number"
          name="maxCost"
          placeholder="Max cost"
          defaultValue={maxCost}
          className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
          Filter
        </button>
      </form>

      {/* Activity list */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => {
          const existing = activeStop.activities.find((sa) => sa.activityId === activity.id);
          return (
            <div key={activity.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{activity.name}</p>
                  <p className="text-sm text-slate-500">{activity.category}</p>
                </div>
                <Badge variant="secondary">${activity.cost.toFixed(0)}</Badge>
              </div>
              <p className="mt-2 text-xs text-slate-400">{activity.durationHrs} hrs</p>
              <div className="mt-4">
                <ActivityToggleButton
                  activityId={activity.id}
                  stopId={activeStop.id}
                  tripId={trip.id}
                  date={activeStop.startDate.toISOString()}
                  stopActivityId={existing?.id ?? null}
                />
              </div>
            </div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <p className="text-center text-slate-500">No activities match your filters.</p>
      )}
    </div>
  );
}
// src/app/(dashboard)/dashboard/page.tsx
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trip-card";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const trips = await prisma.trip.findMany({
    where: { userId: session!.user.id },
    orderBy: { startDate: "asc" },
    include: { stops: true },
    take: 3,
  });

  const popularCities = await prisma.city.findMany({
    orderBy: { popularity: "desc" },
    take: 4,
  });

  const totalTrips = await prisma.trip.count({ where: { userId: session!.user.id } });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {session!.user.name} 👋</h1>
          <p className="mt-1 text-slate-600">
            You have {totalTrips} {totalTrips === 1 ? "trip" : "trips"} planned.
          </p>
        </div>
        <Link href="/trips/new">
          <Button>+ Plan New Trip</Button>
        </Link>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent trips</h2>
        {trips.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-slate-500">
            No trips yet. <Link href="/trips/new" className="underline">Create your first one</Link>.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={JSON.parse(JSON.stringify(trip))} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Recommended destinations</h2>
        {popularCities.length === 0 ? (
          <p className="text-sm text-slate-500">
            No cities seeded yet — we'll add sample data in Phase 4.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {popularCities.map((city) => (
              <div key={city.id} className="rounded-lg border bg-white p-4">
                <p className="font-medium">{city.name}</p>
                <p className="text-sm text-slate-500">{city.country}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
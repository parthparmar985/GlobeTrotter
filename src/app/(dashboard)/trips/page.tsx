// src/app/(dashboard)/trips/page.tsx
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TripCard } from "@/components/trip-card";

export default async function TripsPage() {
  const session = await getServerSession(authOptions);

  const trips = await prisma.trip.findMany({
    where: { userId: session!.user.id },
    orderBy: { startDate: "asc" },
    include: { stops: true },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Trips</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your itineraries, view budgets, and plan new adventures.
          </p>
        </div>
        <Link
          href="/trips/new"
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>✨</span> Plan New Trip
        </Link>
      </div>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-14 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            ✈️
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">No trips added yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            Create your first trip to start organizing stops, schedule activities, and keep track of your budget.
          </p>
          <Link
            href="/trips/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all"
          >
            Create your first trip
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={JSON.parse(JSON.stringify(trip))} />
          ))}
        </div>
      )}
    </div>
  );
}
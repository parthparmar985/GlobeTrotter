// src/app/(dashboard)/dashboard/page.tsx
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl shadow-slate-900/10">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-12 right-24 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium backdrop-blur-md border border-white/10 mb-3 text-slate-200">
              ✨ Welcome back
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Hello, {session!.user.name}!
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl">
              You currently have <span className="font-semibold text-white">{totalTrips}</span> {totalTrips === 1 ? "trip" : "trips"} planned. Ready for your next journey?
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-lg transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>✨</span> Plan New Trip
            </Link>
            <Link
              href="/cities"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              <span>🌆</span> Explore Cities
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Trips Section */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Trips</h2>
            <p className="text-xs text-slate-500">Your upcoming and active itineraries</p>
          </div>
          {trips.length > 0 && (
            <Link href="/trips" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View all trips →
            </Link>
          )}
        </div>

        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              🗺️
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No trips planned yet</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              Start building your dream itinerary with multi-stop planning and budget tracking.
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
      </section>

      {/* Recommended Destinations Section */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Recommended Destinations</h2>
            <p className="text-xs text-slate-500">Explore popular cities around the world</p>
          </div>
          <Link href="/cities" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Browse all cities →
          </Link>
        </div>

        {popularCities.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No cities found. Head to Explore Cities to discover destinations!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {popularCities.map((city) => (
              <Link
                key={city.id}
                href={`/cities`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg group-hover:scale-110 transition-transform">
                    🌆
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                    Popular
                  </span>
                </div>
                <div className="mt-4">
                  <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {city.name}
                  </p>
                  <p className="text-xs text-slate-500">{city.country}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
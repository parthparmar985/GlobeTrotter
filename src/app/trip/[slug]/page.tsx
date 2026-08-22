// src/app/trip/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { CopyTripButton } from "@/components/copy-trip-button";
import { ItineraryView } from "@/components/itinerary-view";

export default async function PublicTripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = await prisma.trip.findUnique({
    where: { shareSlug: slug },
    include: {
      user: { select: { name: true } },
      stops: {
        orderBy: { order: "asc" },
        include: {
          city: true,
          activities: { include: { activity: true }, orderBy: { date: "asc" } },
        },
      },
    },
  });

  if (!trip || !trip.isPublic) notFound();

  const totalCost = trip.stops.reduce(
    (sum, stop) => sum + stop.activities.reduce((s, sa) => s + sa.activity.cost, 0),
    0
  );
  const cities = [...new Set(trip.stops.map((s) => s.city.name))];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <span className="text-lg font-bold tracking-tight">🌍 GlobeTrotter</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {trip.coverPhoto && (
          <div
            className="mb-6 h-48 rounded-lg bg-cover bg-center"
            style={{ backgroundImage: `url(${trip.coverPhoto})` }}
          />
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{trip.name}</h1>
            <p className="mt-1 text-slate-600">Shared by {trip.user.name}</p>
            <p className="mt-2 text-slate-700">{trip.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>
                {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
              </Badge>
              {cities.map((c) => (
                <Badge key={c} variant="secondary">{c}</Badge>
              ))}
              <Badge variant="secondary">Est. ${totalCost.toFixed(0)}</Badge>
            </div>
          </div>
          <CopyTripButton tripId={trip.id} />
        </div>

        <div className="mt-8">
          <ItineraryView stops={JSON.parse(JSON.stringify(trip.stops))} />
        </div>
      </main>
    </div>
  );
}
// src/app/(dashboard)/trips/[id]/build/page.tsx
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ItineraryBuilder } from "@/components/itinerary-builder";
import { Button } from "@/components/ui/button";

export default async function BuildItineraryPage({ params }: { params: Promise<{ id: string }> }) {
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

  const totalCost = trip.stops.reduce(
    (sum, stop) => sum + stop.activities.reduce((s, sa) => s + sa.activity.cost, 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{trip.name} — Itinerary Builder</h1>
          <p className="text-sm text-slate-600">
            Drag stops (⠿) to reorder your route. Estimated cost so far: ${totalCost.toFixed(0)}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/cities">
            <Button variant="outline">+ Add City</Button>
          </Link>
          <Link href={`/trips/${trip.id}`}>
            <Button variant="outline">View Itinerary</Button>
          </Link>
        </div>
      </div>

      <ItineraryBuilder
        tripId={trip.id}
        initialStops={JSON.parse(JSON.stringify(trip.stops))}
      />
    </div>
  );
}
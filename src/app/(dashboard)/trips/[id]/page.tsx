// src/app/(dashboard)/trips/[id]/page.tsx
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ItineraryView } from "@/components/itinerary-view";
import { ShareTripButton } from "@/components/share-trip-button";

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{trip.name}</h1>
          <p className="mt-1 text-slate-600">{trip.description}</p>
          <Badge className="mt-3">
            {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/trips/${trip.id}/build`}><Button variant="outline">Builder</Button></Link>
          <Link href={`/trips/${trip.id}/budget`}><Button variant="outline">Budget</Button></Link>
          <Link href={`/trips/${trip.id}/calendar`}><Button variant="outline">Calendar</Button></Link>
          <ShareTripButton tripId={trip.id} isPublic={trip.isPublic} shareSlug={trip.shareSlug} />
        </div>
      </div>

      <ItineraryView stops={JSON.parse(JSON.stringify(trip.stops))} />
    </div>
  );
}
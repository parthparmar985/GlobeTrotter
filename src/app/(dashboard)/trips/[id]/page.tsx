// src/app/(dashboard)/trips/[id]/page.tsx
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { stops: { include: { city: true } } },
  });

  if (!trip || trip.userId !== session!.user.id) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold">{trip.name}</h1>
      <p className="mt-1 text-slate-600">{trip.description}</p>
      <Badge className="mt-3">
        {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
      </Badge>

      <div className="mt-8 rounded-lg border border-dashed p-10 text-center text-slate-500">
        Itinerary builder (stops, cities, activities) — coming in Phase 5.
      </div>
    </div>
  );
}
// src/app/(dashboard)/trips/page.tsx
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trip-card";

export default async function TripsPage() {
  const session = await getServerSession(authOptions);

  const trips = await prisma.trip.findMany({
    where: { userId: session!.user.id },
    orderBy: { startDate: "asc" },
    include: { stops: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Trips</h1>
        <Link href="/trips/new">
          <Button>+ Plan New Trip</Button>
        </Link>
      </div>

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
    </div>
  );
}
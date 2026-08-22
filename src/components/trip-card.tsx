// src/components/trip-card.tsx
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  coverPhoto: string | null;
  stops: { id: string }[];
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TripCard({ trip, onDeleted }: { trip: Trip; onDeleted?: () => void }) {
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete "${trip.name}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
    if (res.ok) {
      onDeleted?.();
      router.refresh();
    } else {
      alert("Failed to delete trip");
    }
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/trips/${trip.id}/edit`);
  }

  return (
    <Card
      className="overflow-hidden transition hover:shadow-md cursor-pointer"
      onClick={() => router.push(`/trips/${trip.id}`)}
    >
      <div
        className="h-32 bg-gradient-to-br from-slate-700 to-slate-900 bg-cover bg-center"
        style={trip.coverPhoto ? { backgroundImage: `url(${trip.coverPhoto})` } : {}}
      />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{trip.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
          </p>
          <Badge variant="secondary" className="mt-2">
            {trip.stops.length} {trip.stops.length === 1 ? "stop" : "stops"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleEdit}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
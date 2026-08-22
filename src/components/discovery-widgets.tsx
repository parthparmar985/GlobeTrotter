// src/components/discovery-widgets.tsx
"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addCityToTrip,
  addActivityToStop,
  removeStopActivity,
} from "@/lib/actions/discovery";

type Trip = { id: string; name: string };

// --- Add a city to one of the user's trips (used on City Search screen) ---
export function AddToTripDialog({ city, trips }: { city: { id: string; name: string }; trips: Trip[] }) {
  const [open, setOpen] = useState(false);
  const [tripId, setTripId] = useState(trips[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!tripId) {
      setError("Create a trip first before adding cities.");
      return;
    }

    startTransition(async () => {
      try {
        await addCityToTrip(tripId, city.id, startDate, endDate);
        setOpen(false);
      } catch (err: any) {
        setError(err.message || "Failed to add city");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>Add to Trip</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {city.name} to a trip</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="trip-select">Trip</Label>
            <select
              id="trip-select"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
            >
              {trips.length === 0 && <option value="">No trips yet</option>}
              {trips.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stop-start">Arrival date</Label>
              <Input id="stop-start" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="stop-end">Departure date</Label>
              <Input id="stop-end" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Adding..." : "Add to trip"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Toggle an activity on/off a stop (used on Activity Search screen) ---
export function ActivityToggleButton({
  activityId,
  stopId,
  tripId,
  date,
  stopActivityId,
}: {
  activityId: string;
  stopId: string;
  tripId: string;
  date: string;
  stopActivityId: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const added = !!stopActivityId;

  function handleClick() {
    startTransition(async () => {
      if (added && stopActivityId) {
        await removeStopActivity(stopActivityId, tripId);
      } else {
        await addActivityToStop(stopId, activityId, tripId, date);
      }
    });
  }

  return (
    <Button
      size="sm"
      variant={added ? "destructive" : "default"}
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "..." : added ? "Remove" : "Add"}
    </Button>
  );
}
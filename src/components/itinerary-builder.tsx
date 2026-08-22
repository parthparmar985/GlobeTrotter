// src/components/itinerary-builder.tsx
"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableStopCard } from "@/components/sortable-stop-card";
import { reorderStops } from "@/lib/actions/itinerary";

type StopActivity = {
  id: string;
  date: string;
  time: string | null;
  activity: { id: string; name: string; cost: number; category: string };
};

type Stop = {
  id: string;
  order: number;
  startDate: string;
  endDate: string;
  city: { id: string; name: string; country: string };
  activities: StopActivity[];
};

export function ItineraryBuilder({ tripId, initialStops }: { tripId: string; initialStops: Stop[] }) {
  const [stops, setStops] = useState(initialStops);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stops.findIndex((s) => s.id === active.id);
    const newIndex = stops.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(stops, oldIndex, newIndex);

    setStops(reordered); // optimistic update
    startTransition(() => {
      reorderStops(tripId, reordered.map((s) => s.id));
    });
  }

  if (stops.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-slate-500">
        No stops yet.{" "}
        <a href="/cities" className="underline">Add a city</a> to start building your itinerary.
      </div>
    );
  }

  return (
    <DndContext id="itinerary-builder-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {stops.map((stop) => (
            <SortableStopCard key={stop.id} stop={stop} tripId={tripId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
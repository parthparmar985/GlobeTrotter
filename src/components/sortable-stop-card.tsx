// src/components/sortable-stop-card.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  updateStopDates,
  updateStopActivityTime,
  removeStopFromBuilder,
  removeActivityFromBuilder,
} from "@/lib/actions/itinerary";

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

function toDateInput(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export function SortableStopCard({ stop, tripId }: { stop: Stop; tripId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stop.id });
  const [isPending, startTransition] = useTransition();
  const [dates, setDates] = useState({
    startDate: toDateInput(stop.startDate),
    endDate: toDateInput(stop.endDate),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleDateBlur() {
    startTransition(() => {
      updateStopDates(tripId, stop.id, dates.startDate, dates.endDate);
    });
  }

  function handleRemoveStop() {
    if (!confirm(`Remove ${stop.city.name} and all its activities from this trip?`)) return;
    startTransition(() => {
      removeStopFromBuilder(tripId, stop.id);
    });
  }

  const totalCost = stop.activities.reduce((sum, sa) => sum + sa.activity.cost, 0);

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab text-slate-400 hover:text-slate-700 active:cursor-grabbing"
            title="Drag to reorder"
          >
            ⠿
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Stop {stop.order}</Badge>
              <p className="font-semibold">{stop.city.name}, {stop.city.country}</p>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="date"
                value={dates.startDate}
                onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
                onBlur={handleDateBlur}
                className="h-8 w-36 text-xs"
              />
              <span className="text-xs text-slate-400">to</span>
              <Input
                type="date"
                value={dates.endDate}
                onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
                onBlur={handleDateBlur}
                className="h-8 w-36 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium">${totalCost.toFixed(0)}</p>
          <Button
            size="sm"
            variant="ghost"
            className="mt-1 text-red-600 hover:text-red-700"
            onClick={handleRemoveStop}
            disabled={isPending}
          >
            Remove stop
          </Button>
        </div>
      </div>

      {/* Activities assigned to this stop */}
      <div className="mt-4 space-y-2 border-t pt-3">
        {stop.activities.length === 0 ? (
          <p className="text-xs text-slate-400">
            No activities yet — add some from the{" "}
            <a href={`/trips/${tripId}/activities?stopId=${stop.id}`} className="underline">
              Activities page
            </a>.
          </p>
        ) : (
          stop.activities.map((sa) => (
            <div key={sa.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
              <div>
                <p className="text-sm font-medium">{sa.activity.name}</p>
                <p className="text-xs text-slate-500">{sa.activity.category} · ${sa.activity.cost.toFixed(0)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  defaultValue={toDateInput(sa.date)}
                  onBlur={(e) =>
                    startTransition(() =>
                      updateStopActivityTime(tripId, sa.id, e.target.value, sa.time || "")
                    )
                  }
                  className="h-7 w-32 text-xs"
                />
                <Input
                  type="time"
                  defaultValue={sa.time || ""}
                  onBlur={(e) =>
                    startTransition(() =>
                      updateStopActivityTime(tripId, sa.id, toDateInput(sa.date), e.target.value)
                    )
                  }
                  className="h-7 w-24 text-xs"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-red-600 hover:text-red-700"
                  onClick={() => startTransition(() => removeActivityFromBuilder(tripId, sa.id))}
                >
                  ✕
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
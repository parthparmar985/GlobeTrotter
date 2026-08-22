// src/components/itinerary-view.tsx
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Activity = { id: string; name: string; cost: number; category: string };
type StopActivity = { id: string; date: string; time: string | null; activity: Activity };
type Stop = {
  id: string;
  startDate: string;
  endDate: string;
  city: { name: string; country: string };
  activities: StopActivity[];
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// Build a flat list of { date, stopCity, activities[] } across the whole trip
function buildDayGroups(stops: Stop[]) {
  const days = new Map<string, { city: string; country: string; activities: StopActivity[] }>();

  for (const stop of stops) {
    const cursor = new Date(stop.startDate);
    const end = new Date(stop.endDate);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      if (!days.has(key)) days.set(key, { city: stop.city.name, country: stop.city.country, activities: [] });
      cursor.setDate(cursor.getDate() + 1);
    }
    for (const sa of stop.activities) {
      const key = new Date(sa.date).toISOString().slice(0, 10);
      const entry = days.get(key);
      if (entry) entry.activities.push(sa);
      else days.set(key, { city: stop.city.name, country: stop.city.country, activities: [sa] });
    }
  }

  return Array.from(days.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({ date, ...data }));
}

export function ItineraryView({ stops }: { stops: Stop[] }) {
  const [mode, setMode] = useState<"list" | "calendar">("list");
  const dayGroups = buildDayGroups(stops);

  if (stops.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-slate-500">
        No itinerary yet — build one from the Itinerary Builder.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button size="sm" variant={mode === "list" ? "default" : "outline"} onClick={() => setMode("list")}>
          List view
        </Button>
        <Button size="sm" variant={mode === "calendar" ? "default" : "outline"} onClick={() => setMode("calendar")}>
          Calendar view
        </Button>
      </div>

      {mode === "list" ? (
        <div className="space-y-4">
          {dayGroups.map((day) => (
            <div key={day.date} className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between border-b pb-2">
                <p className="font-semibold">{formatDate(day.date)}</p>
                <Badge variant="secondary">{day.city}, {day.country}</Badge>
              </div>
              {day.activities.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">No activities scheduled.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {day.activities.map((sa) => (
                    <div key={sa.id} className="flex items-center justify-between text-sm">
                      <span>
                        {sa.time && <span className="text-slate-400">{sa.time} · </span>}
                        {sa.activity.name}
                      </span>
                      <span className="text-slate-500">${sa.activity.cost.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dayGroups.map((day) => (
            <div key={day.date} className="rounded-lg border bg-white p-3">
              <p className="text-xs font-semibold text-slate-500">{formatDate(day.date)}</p>
              <p className="text-sm font-medium">{day.city}</p>
              <div className="mt-2 space-y-1">
                {day.activities.map((sa) => (
                  <div key={sa.id} className="rounded bg-slate-100 px-2 py-1 text-xs">
                    {sa.time && `${sa.time} `}{sa.activity.name}
                  </div>
                ))}
                {day.activities.length === 0 && (
                  <p className="text-xs text-slate-400">Free day</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
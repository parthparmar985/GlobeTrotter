// src/components/trip-card.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  coverPhoto: string | null;
  budgetCap?: number | null;
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
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete "${trip.name}"? This cannot be undone.`)) return;

    setIsDeleting(true);
    const res = await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
    if (res.ok) {
      onDeleted?.();
      router.refresh();
    } else {
      alert("Failed to delete trip");
      setIsDeleting(false);
    }
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/trips/${trip.id}/edit`);
  }

  return (
    <div
      onClick={() => router.push(`/trips/${trip.id}`)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 cursor-pointer"
    >
      {/* Cover Image Header */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        {trip.coverPhoto ? (
          <div
            className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${trip.coverPhoto})` }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 p-6 text-center transition-transform duration-500 group-hover:scale-105">
            <span className="text-3xl">✈️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        
        {/* Badges on top of cover */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
            📍 {trip.stops.length} {trip.stops.length === 1 ? "stop" : "stops"}
          </span>
          {trip.budgetCap && (
            <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow-sm">
              💵 ${trip.budgetCap}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {trip.name}
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <span>🗓️</span> {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs font-semibold text-slate-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            View itinerary →
          </span>
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleEdit}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg border border-red-100 bg-red-50/50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              {isDeleting ? "..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
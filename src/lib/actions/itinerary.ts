// src/lib/actions/itinerary.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
}

async function assertTripOwnership(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.userId !== userId) throw new Error("Trip not found or not yours");
  return trip;
}

// Reorder stops after a drag-and-drop — takes the new full order of stop IDs
export async function reorderStops(tripId: string, orderedStopIds: string[]) {
  const userId = await requireUserId();
  await assertTripOwnership(tripId, userId);

  await prisma.$transaction(
    orderedStopIds.map((stopId, index) =>
      prisma.stop.update({
        where: { id: stopId },
        data: { order: index + 1 },
      })
    )
  );

  revalidatePath(`/trips/${tripId}/build`);
}

// Update a stop's date range (e.g. dragging to extend/shrink days)
export async function updateStopDates(
  tripId: string,
  stopId: string,
  startDate: string,
  endDate: string
) {
  const userId = await requireUserId();
  await assertTripOwnership(tripId, userId);

  await prisma.stop.update({
    where: { id: stopId },
    data: { startDate: new Date(startDate), endDate: new Date(endDate) },
  });

  revalidatePath(`/trips/${tripId}/build`);
}

// Update the date/time a specific activity is scheduled within a stop
export async function updateStopActivityTime(
  tripId: string,
  stopActivityId: string,
  date: string,
  time: string
) {
  const userId = await requireUserId();
  await assertTripOwnership(tripId, userId);

  await prisma.stopActivity.update({
    where: { id: stopActivityId },
    data: { date: new Date(date), time },
  });

  revalidatePath(`/trips/${tripId}/build`);
}

export async function removeStopFromBuilder(tripId: string, stopId: string) {
  const userId = await requireUserId();
  await assertTripOwnership(tripId, userId);

  await prisma.stop.delete({ where: { id: stopId } });

  // Re-sequence remaining stops so order stays contiguous
  const remaining = await prisma.stop.findMany({
    where: { tripId },
    orderBy: { order: "asc" },
  });
  await prisma.$transaction(
    remaining.map((s, i) => prisma.stop.update({ where: { id: s.id }, data: { order: i + 1 } }))
  );

  revalidatePath(`/trips/${tripId}/build`);
}

export async function removeActivityFromBuilder(tripId: string, stopActivityId: string) {
  const userId = await requireUserId();
  await assertTripOwnership(tripId, userId);

  await prisma.stopActivity.delete({ where: { id: stopActivityId } });
  revalidatePath(`/trips/${tripId}/build`);
}
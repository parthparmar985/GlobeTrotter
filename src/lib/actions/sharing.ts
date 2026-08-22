// src/lib/actions/sharing.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
}

function generateSlug(tripName: string) {
  const base = tripName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  const random = crypto.randomBytes(3).toString("hex"); // 6 chars, avoids collisions
  return `${base}-${random}`;
}

export async function makeTripPublic(tripId: string) {
  const userId = await requireUserId();
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.userId !== userId) throw new Error("Trip not found or not yours");

  const slug = trip.shareSlug || generateSlug(trip.name);

  const updated = await prisma.trip.update({
    where: { id: tripId },
    data: { isPublic: true, shareSlug: slug },
  });

  revalidatePath(`/trips/${tripId}`);
  return updated.shareSlug;
}

export async function makeTripPrivate(tripId: string) {
  const userId = await requireUserId();
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.userId !== userId) throw new Error("Trip not found or not yours");

  await prisma.trip.update({ where: { id: tripId }, data: { isPublic: false } });
  revalidatePath(`/trips/${tripId}`);
}

// Duplicates a public trip (all stops + scheduled activities) into the logged-in viewer's account
export async function copyTrip(sourceTripId: string) {
  const userId = await requireUserId();

  const source = await prisma.trip.findUnique({
    where: { id: sourceTripId },
    include: {
      stops: {
        orderBy: { order: "asc" },
        include: { activities: true },
      },
    },
  });

  if (!source || !source.isPublic) {
    throw new Error("This trip is not available to copy");
  }

  const newTrip = await prisma.trip.create({
    data: {
      userId,
      name: `${source.name} (copy)`,
      description: source.description,
      coverPhoto: source.coverPhoto,
      startDate: source.startDate,
      endDate: source.endDate,
      budgetCap: source.budgetCap,
      isPublic: false,
    },
  });

  for (const stop of source.stops) {
    const newStop = await prisma.stop.create({
      data: {
        tripId: newTrip.id,
        cityId: stop.cityId,
        order: stop.order,
        startDate: stop.startDate,
        endDate: stop.endDate,
      },
    });

    if (stop.activities.length > 0) {
      await prisma.stopActivity.createMany({
        data: stop.activities.map((sa) => ({
          stopId: newStop.id,
          activityId: sa.activityId,
          date: sa.date,
          time: sa.time,
        })),
      });
    }
  }

  return newTrip.id;
}
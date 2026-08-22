// src/lib/actions/discovery.ts
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

// ---------- READS ----------

export async function searchCities(search?: string, country?: string) {
  return prisma.city.findMany({
    where: {
      name: search ? { contains: search, mode: "insensitive" } : undefined,
      country: country ? { equals: country, mode: "insensitive" } : undefined,
    },
    orderBy: { popularity: "desc" },
  });
}

export async function searchActivities(cityId: string, category?: string, maxCost?: number) {
  return prisma.activity.findMany({
    where: {
      cityId,
      category: category ? { equals: category } : undefined,
      cost: maxCost ? { lte: maxCost } : undefined,
    },
    orderBy: { cost: "asc" },
  });
}

// ---------- MUTATIONS ----------

export async function addCityToTrip(
  tripId: string,
  cityId: string,
  startDate: string,
  endDate: string
) {
  const userId = await requireUserId();

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.userId !== userId) throw new Error("Trip not found or not yours");

  const stopCount = await prisma.stop.count({ where: { tripId } });

  await prisma.stop.create({
    data: {
      tripId,
      cityId,
      order: stopCount + 1,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  revalidatePath(`/trips/${tripId}`);
  revalidatePath(`/trips/${tripId}/activities`);
}

export async function removeStop(stopId: string, tripId: string) {
  const userId = await requireUserId();
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip || trip.userId !== userId) throw new Error("Trip not found or not yours");

  await prisma.stop.delete({ where: { id: stopId } });
  revalidatePath(`/trips/${tripId}`);
  revalidatePath(`/trips/${tripId}/activities`);
}

export async function addActivityToStop(
  stopId: string,
  activityId: string,
  tripId: string,
  date: string
) {
  await requireUserId();

  await prisma.stopActivity.create({
    data: { stopId, activityId, date: new Date(date) },
  });

  revalidatePath(`/trips/${tripId}/activities`);
}

export async function removeStopActivity(id: string, tripId: string) {
  await requireUserId();
  await prisma.stopActivity.delete({ where: { id } });
  revalidatePath(`/trips/${tripId}/activities`);
}
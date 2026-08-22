// src/lib/actions/admin.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    throw new Error("Forbidden: admin access required");
  }
  return session;
}

export async function getPlatformStats() {
  await requireAdmin();

  const [totalUsers, totalTrips, totalStops, totalActivitiesBooked, publicTrips] =
    await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.stop.count(),
      prisma.stopActivity.count(),
      prisma.trip.count({ where: { isPublic: true } }),
    ]);

  return { totalUsers, totalTrips, totalStops, totalActivitiesBooked, publicTrips };
}

export async function getTopCities(limit = 8) {
  await requireAdmin();

  const cities = await prisma.city.findMany({
    include: { _count: { select: { stops: true } } },
    orderBy: { stops: { _count: "desc" } },
    take: limit,
  });

  return cities.map((c) => ({
    name: c.name,
    country: c.country,
    tripCount: c._count.stops,
  }));
}

export async function getTopActivities(limit = 8) {
  await requireAdmin();

  const activities = await prisma.activity.findMany({
    include: { _count: { select: { stopActivities: true } } },
    orderBy: { stopActivities: { _count: "desc" } },
    take: limit,
  });

  return activities
    .filter((a) => a._count.stopActivities > 0)
    .map((a) => ({
      name: a.name,
      category: a.category,
      bookedCount: a._count.stopActivities,
    }));
}

export async function getTripsOverTime() {
  await requireAdmin();

  const trips = await prisma.trip.findMany({
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const monthMap = new Map<string, number>();
  for (const trip of trips) {
    const key = trip.createdAt.toISOString().slice(0, 7); // YYYY-MM
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  }

  return Array.from(monthMap.entries()).map(([month, count]) => ({ month, count }));
}

export async function getAllUsers() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { trips: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
}

export async function toggleUserRole(userId: string) {
  const session = await requireAdmin();

  if (userId === session.user.id) {
    throw new Error("You can't change your own role");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({
    where: { id: userId },
    data: { role: user.role === "admin" ? "user" : "admin" },
  });
}
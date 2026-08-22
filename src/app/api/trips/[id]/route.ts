// src/app/api/trips/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/lib/validations/trip";

async function assertOwnership(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return { trip: null, error: "Trip not found", status: 404 };
  if (trip.userId !== userId) return { trip: null, error: "Forbidden", status: 403 };
  return { trip, error: null, status: 200 };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { trip, error, status } = await assertOwnership(id, session.user.id);
  if (error) return NextResponse.json({ error }, { status });

  const fullTrip = await prisma.trip.findUnique({
    where: { id },
    include: {
      stops: {
        orderBy: { order: "asc" },
        include: { city: true, activities: { include: { activity: true } } },
      },
    },
  });

  return NextResponse.json(fullTrip);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error, status } = await assertOwnership(id, session.user.id);
  if (error) return NextResponse.json({ error }, { status });

  const body = await req.json();
  const parsed = tripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, description, coverPhoto, startDate, endDate } = parsed.data;

  const updated = await prisma.trip.update({
    where: { id },
    data: {
      name,
      description: description || null,
      coverPhoto: coverPhoto || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error, status } = await assertOwnership(id, session.user.id);
  if (error) return NextResponse.json({ error }, { status });

  await prisma.trip.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
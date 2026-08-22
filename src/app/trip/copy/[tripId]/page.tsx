// src/app/trip/copy/[tripId]/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { copyTrip } from "@/lib/actions/sharing";

export default async function CopyTripRedirectPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?callbackUrl=/trip/copy/${tripId}`);

  try {
    const newTripId = await copyTrip(tripId);
    redirect(`/trips/${newTripId}`);
  } catch {
    redirect("/dashboard");
  }
}
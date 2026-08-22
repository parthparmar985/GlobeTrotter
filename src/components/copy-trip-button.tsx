// src/components/copy-trip-button.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { copyTrip } from "@/lib/actions/sharing";

export function CopyTripButton({ tripId }: { tripId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleClick() {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/trip/copy/${tripId}`);
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const newTripId = await copyTrip(tripId);
        router.push(`/trips/${newTripId}`);
      } catch (err: any) {
        setError(err.message || "Failed to copy trip");
      }
    });
  }

  return (
    <div>
      <Button onClick={handleClick} disabled={isPending}>
        {isPending ? "Copying..." : session ? "Copy this trip" : "Log in to copy this trip"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
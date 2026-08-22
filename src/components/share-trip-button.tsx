// src/components/share-trip-button.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { makeTripPublic, makeTripPrivate } from "@/lib/actions/sharing";

export function ShareTripButton({
  tripId,
  isPublic,
  shareSlug,
}: {
  tripId: string;
  isPublic: boolean;
  shareSlug: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [publicState, setPublicState] = useState(isPublic);
  const [slug, setSlug] = useState(shareSlug);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const shareUrl = slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/trip/${slug}` : "";

  function handleTogglePublic() {
    startTransition(async () => {
      if (publicState) {
        await makeTripPrivate(tripId);
        setPublicState(false);
      } else {
        const newSlug = await makeTripPublic(tripId);
        setSlug(newSlug);
        setPublicState(true);
      }
    });
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>Share</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this trip</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">{publicState ? "Public" : "Private"}</p>
              <p className="text-xs text-slate-500">
                {publicState ? "Anyone with the link can view and copy this trip." : "Only you can see this trip."}
              </p>
            </div>
            <Button size="sm" variant={publicState ? "destructive" : "default"} onClick={handleTogglePublic} disabled={isPending}>
              {isPending ? "..." : publicState ? "Make private" : "Make public"}
            </Button>
          </div>

          {publicState && slug && (
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                onFocus={(e) => e.target.select()}
              />
              <Button size="sm" onClick={handleCopyLink}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
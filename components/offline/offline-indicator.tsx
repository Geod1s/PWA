// components/offline/offline-indicator.tsx
"use client";

import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { useOfflineSync } from "@/hooks/use-offline-sync";

export function OfflineIndicator() {
  const { isOnline, isSyncing, syncError } = useOfflineSync();

  // Nothing to show if we are online, not syncing, and have no error
  if (isOnline && !isSyncing && !syncError) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-md border border-border text-sm">
        {!isOnline && (
          <>
            <WifiOff className="h-4 w-4" />
            <span>
              Offline mode – sales will sync automatically when you reconnect.
            </span>
          </>
        )}

        {isOnline && isSyncing && (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Syncing offline sales…</span>
          </>
        )}

        {isOnline && !isSyncing && syncError && (
          <>
            <Wifi className="h-4 w-4" />
            <span>Online, but sync failed: {syncError}</span>
          </>
        )}
      </div>
    </div>
  );
}

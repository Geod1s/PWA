"use client"

import { useOfflineSync } from "@/hooks/use-offline-sync"
import { Wifi, WifiOff, Loader } from "lucide-react"

export function OfflineIndicator() {
  const { isOnline, isSyncing, syncError } = useOfflineSync()

  if (isOnline && !isSyncing && !syncError) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg">
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium">Offline Mode</span>
          </>
        ) : isSyncing ? (
          <>
            <Loader className="w-4 h-4 text-primary animate-spin" />
            <span className="text-sm font-medium">Syncing...</span>
          </>
        ) : syncError ? (
          <>
            <Wifi className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">Sync Error</span>
          </>
        ) : null}
      </div>
      {syncError && <p className="text-xs text-muted-foreground mt-1">{syncError}</p>}
    </div>
  )
}

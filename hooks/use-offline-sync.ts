"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getUnsyncedTransactions,
  markTransactionSynced,
} from "@/lib/offline/db";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const supabase = createClient();

  // Detect browser online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncTransactions = async () => {
    if (isSyncing || isOnline === false) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const unsynced = await getUnsyncedTransactions();

      for (const tx of unsynced) {
        try {
          // Convert offline items → RPC-friendly JSON structure
          const itemsPayload = tx.items.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
            unit_price_cents: Math.round(Number(item.price) * 100),
          }));

          // Call your Postgres RPC function
          const { data, error } = await supabase.rpc(
            "create_sale_with_items",
            {
              p_store_id: tx.storeId,
              p_cashier_id: tx.cashierId,
              p_items: itemsPayload,
              p_payment_method: tx.paymentMethod?.toUpperCase() ?? "CASH",
              p_discount_cents: 0, // offline system has no discount
            }
          );

          if (error) throw error;

          console.log("Synced offline sale → Sale ID:", data);

          // Mark local transaction as synced
          await markTransactionSynced(tx.id);
        } catch (err) {
          console.error("Failed to sync transaction:", err);
          throw err;
        }
      }
    } catch (err) {
      setSyncError(
        err instanceof Error ? err.message : "Offline sync failed"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync whenever internet comes back
  useEffect(() => {
    if (isOnline && !isSyncing) {
      syncTransactions();
    }
  }, [isOnline]);

  return { isOnline, isSyncing, syncError, syncTransactions };
}

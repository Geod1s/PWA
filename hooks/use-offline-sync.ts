"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getUnsyncedTransactions, markTransactionSynced } from "@/lib/offline/db"

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const syncTransactions = async () => {
    if (isSyncing || isOnline === false) return

    setIsSyncing(true)
    setSyncError(null)

    try {
      const unsyncedTransactions = await getUnsyncedTransactions()

      for (const transaction of unsyncedTransactions) {
        try {
          // Create transaction in Supabase
          const { data: txData, error: txError } = await supabase
            .from("transactions")
            .insert({
              store_id: transaction.storeId,
              cashier_id: transaction.cashierId,
              transaction_number: `OFFLINE-${transaction.id}`,
              subtotal: transaction.subtotal,
              tax_amount: transaction.tax,
              total: transaction.total,
              payment_method: transaction.paymentMethod,
              status: "completed",
              notes: transaction.notes || null,
            })
            .select()
            .single()

          if (txError) throw txError

          // Insert transaction items
          const items = transaction.items.map((item) => ({
            transaction_id: txData.id,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.price,
            line_total: item.price * item.quantity,
          }))

          const { error: itemsError } = await supabase.from("transaction_items").insert(items)

          if (itemsError) throw itemsError

          // Mark as synced
          await markTransactionSynced(transaction.id)
        } catch (error) {
          console.error("Failed to sync transaction:", error)
          throw error
        }
      }
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Sync failed")
    } finally {
      setIsSyncing(false)
    }
  }

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && !isSyncing) {
      syncTransactions()
    }
  }, [isOnline])

  return { isOnline, isSyncing, syncError, syncTransactions }
}

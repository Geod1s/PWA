"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { initializeDB, saveTransaction } from "@/lib/offline/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOfflineSync } from "@/hooks/use-offline-sync"

interface OfflineCheckoutProps {
  storeId: string
  cashierId: string
  cart: any[]
  subtotal: number
  tax: number
  total: number
  onCancel: () => void
  onSuccess: () => void
}

export function OfflineCheckout({
  storeId,
  cashierId,
  cart,
  subtotal,
  tax,
  total,
  onCancel,
  onSuccess,
}: OfflineCheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isOnline } = useOfflineSync()
  const supabase = createClient()

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const transactionId = `tx-${Date.now()}`

      if (isOnline) {
        // Online: save to Supabase directly
        const { data: transaction, error: txError } = await supabase
          .from("transactions")
          .insert({
            store_id: storeId,
            cashier_id: cashierId,
            transaction_number: `TXN-${transactionId}`,
            subtotal,
            tax_amount: tax,
            total,
            payment_method: paymentMethod,
            status: "completed",
            notes: notes || null,
          })
          .select()
          .single()

        if (txError) throw txError

        const transactionItems = cart.map((item) => ({
          transaction_id: transaction.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          line_total: item.price * item.quantity,
        }))

        const { error: itemsError } = await supabase.from("transaction_items").insert(transactionItems)

        if (itemsError) throw itemsError
      } else {
        // Offline: save to IndexedDB
        await initializeDB()
        await saveTransaction({
          id: transactionId,
          storeId,
          cashierId,
          items: cart.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal,
          tax,
          total,
          paymentMethod,
          notes: notes || undefined,
          timestamp: Date.now(),
          synced: false,
        })
      }

      onSuccess()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleCheckout} className="space-y-4">
            {!isOnline && (
              <div className="bg-warning/10 text-warning text-sm p-3 rounded">
                You are in offline mode. Transactions will be synced when online.
              </div>
            )}

            <div className="bg-muted p-4 rounded space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-border pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Order notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">{error}</div>}

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : "Complete Sale"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="w-full bg-transparent">
                Back to Cart
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

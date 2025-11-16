"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
// ⬇️ update this path to wherever your IndexedDB file lives
import { deleteOfflineProduct } from "@/lib/offline/db"
import { Trash2 } from "lucide-react" // remove if you don't use lucide

interface ProductRowProps {
  product: {
    id: string
    name: string
    price: number
    quantity_in_stock: number
    // add any other fields you need (sku, barcode, etc.)
  }
}

export function ProductRow({ product }: ProductRowProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Delete product "${product.name}"?`)) return

    setIsDeleting(true)

    try {
      // 1) Try to delete from Supabase (cloud)
      try {
        const res = await fetch(`/api/products/${product.id}`, {
          method: "DELETE",
        })

        if (!res.ok) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.error || "Failed to delete in cloud")
        }
      } catch (err) {
        // If this fails (offline / Supabase error), we still delete locally
        console.warn("[Delete] Cloud delete failed, deleting locally only:", err)
      }

      // 2) Delete from IndexedDB (offline cache)
      try {
        await deleteOfflineProduct(product.id)
      } catch (err) {
        console.warn("[Delete] Failed to delete offline product:", err)
      }

      // 3) Refresh data (for Server Components / lists)
      router.refresh()
    } catch (err: any) {
      alert(err?.message || "Failed to delete product")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-between border-b py-2">
      <div>
        <div className="font-medium">{product.name}</div>
        <div className="text-sm text-muted-foreground">
          {product.quantity_in_stock} in stock · ${product.price.toFixed(2)}
        </div>
      </div>

      <Button
        variant="destructive"
        size="icon"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

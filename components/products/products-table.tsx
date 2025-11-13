"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Pencil, Trash2 } from "lucide-react"

interface Product {
  id: string
  sku: string
  name: string
  category: string
  price: number
  cost?: number
  quantity_in_stock: number
  is_active: boolean
}

interface ProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  storeId: string
}

export function ProductsTable({ products, onEdit, onDelete, storeId }: ProductsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleDelete = async (productId: string) => {
    setDeletingId(productId)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)
        .eq("store_id", storeId)

      if (deleteError) throw deleteError
      onDelete(productId)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete product")
    } finally {
      setDeletingId(null)
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products yet. Create one to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded mb-4">{error}</div>}
      <table className="w-full text-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="py-3 px-4 font-semibold">SKU</th>
            <th className="py-3 px-4 font-semibold">Name</th>
            <th className="py-3 px-4 font-semibold">Category</th>
            <th className="py-3 px-4 font-semibold text-right">Price</th>
            <th className="py-3 px-4 font-semibold text-right">Cost</th>
            <th className="py-3 px-4 font-semibold text-right">Stock</th>
            <th className="py-3 px-4 font-semibold text-center">Status</th>
            <th className="py-3 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-border hover:bg-muted/50">
              <td className="py-3 px-4 font-mono text-xs">{product.sku}</td>
              <td className="py-3 px-4 font-medium">{product.name}</td>
              <td className="py-3 px-4">{product.category}</td>
              <td className="py-3 px-4 text-right">${product.price.toFixed(2)}</td>
              <td className="py-3 px-4 text-right">${product.cost?.toFixed(2) || "N/A"}</td>
              <td className="py-3 px-4 text-right">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    product.quantity_in_stock > 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {product.quantity_in_stock}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    product.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {product.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-3 px-4 text-right space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(product)} className="h-8 w-8 p-0">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId === product.id}
                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

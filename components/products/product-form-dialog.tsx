"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: string
  sku: string
  name: string
  description?: string
  category: string
  price: number
  cost?: number
  quantity_in_stock: number
  barcode?: string
  is_active: boolean
  created_at?: string
  image_url?: string
}

interface ProductFormDialogProps {
  storeId: string
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSave: (isNew: boolean, product: Product) => void
}

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food & Beverage",
  "Home & Garden",
  "Sports & Outdoors",
  "Books",
  "Toys & Games",
  "Other",
]

export function ProductFormDialog({ storeId, product, isOpen, onClose, onSave }: ProductFormDialogProps) {
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    category: "Electronics",
    price: "",
    cost: "",
    quantity_in_stock: "0",
    barcode: "",
    is_active: true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || "",
        category: product.category,
        price: product.price.toString(),
        cost: product.cost?.toString() || "",
        quantity_in_stock: product.quantity_in_stock.toString(),
        barcode: product.barcode || "",
        is_active: product.is_active,
      })
    } else {
      setFormData({
        sku: "",
        name: "",
        description: "",
        category: "Electronics",
        price: "",
        cost: "",
        quantity_in_stock: "0",
        barcode: "",
        is_active: true,
      })
    }
    setError(null)
  }, [product, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!formData.sku || !formData.name || !formData.price) {
        throw new Error("SKU, name, and price are required")
      }

      const payload = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        price: Number.parseFloat(formData.price),
        cost: formData.cost ? Number.parseFloat(formData.cost) : null,
        quantity_in_stock: Number.parseInt(formData.quantity_in_stock) || 0,
        barcode: formData.barcode || null,
        is_active: formData.is_active,
      }

      if (product) {
        // Update
        const { data, error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id)
          .eq("store_id", storeId)
          .select()
          .single()

        if (updateError) throw updateError
        onSave(false, { ...data, id: product.id })
      } else {
        // Create
        const { data, error: createError } = await supabase
          .from("products")
          .insert({
            ...payload,
            store_id: storeId,
          })
          .select()
          .single()

        if (createError) throw createError
        onSave(true, data)
      }

      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update product details" : "Create a new product in your store"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description (optional)"
              className="h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={formData.quantity_in_stock}
                onChange={(e) => setFormData({ ...formData, quantity_in_stock: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Barcode (optional)"
              />
            </div>
          </div>

          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

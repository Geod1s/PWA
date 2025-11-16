"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import TopNav from "@/components/TopNav"
import { supabase } from "@/lib/supabaseClient"
// adjust path if your offline db file is different
import { deleteOfflineProduct } from "@/lib/offline/db"

type Product = {
  id: string
  name: string
  sku: string | null
  price: number
  stock_quantity: number | null
  category: string | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, price, stock_quantity, category")
        .order("name", { ascending: true })

      if (error) {
        console.error("Error loading products", error)
      } else if (data) {
        setProducts(data as Product[])
      }

      setLoading(false)
    }

    loadProducts()
  }, [])

  const handleDelete = async (product: Product) => {
    const confirmed = confirm(`Delete product "${product.name}"?`)
    if (!confirmed) return

    setDeletingId(product.id)

    try {
      // 1) Try cloud delete (Supabase)
      const { data, error, status } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)
        .select()

      if (error) {
        console.error("Error deleting product from Supabase", {
          status,
          error,
          data,
        })
        // We *don't* return here – we still delete locally so UI stays in sync
        alert(
          error.message ||
            `Failed to delete product in cloud (status ${status}). It will still be removed locally.`,
        )
      }

      // 2) Delete from offline IndexedDB (best-effort)
      try {
        await deleteOfflineProduct(product.id)
      } catch (err) {
        console.warn("[Delete] Failed to delete offline product:", err)
      }

      // 3) Update UI
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <TopNav />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Products</h1>
          <Link
            href="/products/new"
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
          >
            Add Product
          </Link>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <p>No products yet. Click &quot;Add Product&quot; to create one.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">SKU</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-right">Stock</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">{p.sku ?? "-"}</td>
                    <td className="px-3 py-2">{p.category ?? "-"}</td>
                    <td className="px-3 py-2 text-right">
                      {p.price.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {p.stock_quantity ?? 0}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        className="px-3 py-1 rounded-md bg-red-600 text-white text-xs disabled:opacity-50"
                      >
                        {deletingId === p.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

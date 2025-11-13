"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState(""); // e.g. "12.50"
  const [stock, setStock] = useState("0");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const priceNumber = Number(price);
    const stockNumber = Number(stock);

    if (!name.trim()) {
      setErrorMsg("Name is required.");
      return;
    }
    if (isNaN(priceNumber) || priceNumber <= 0) {
      setErrorMsg("Price must be a positive number.");
      return;
    }
    if (isNaN(stockNumber) || stockNumber < 0) {
      setErrorMsg("Stock must be zero or more.");
      return;
    }

    const price_cents = Math.round(priceNumber * 100);

    setLoading(true);

    try {
      const { error } = await supabase.from("products").insert([
        {
          name: name.trim(),
          sku: sku.trim() || null,
          price_cents,
          stock_quantity: stockNumber,
          is_active: true,
        },
      ]);

      if (error) {
        // Log the full error so we can see what's wrong
        console.error("Insert error:", JSON.stringify(error, null, 2));
        setErrorMsg(
          error.message ||
            "Supabase insert failed. Open the browser console to see more details."
        );
        setLoading(false);
        return;
      }

      // Success → go back to products list
      router.push("/products");
    } catch (err) {
      console.error("Unexpected error during insert:", err);
      setErrorMsg("Unexpected error. Check console for details.");
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name *</label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Coca Cola 330ml"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">SKU / Code</label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Optional barcode or code"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Price (e.g. 9.99) *</label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Stock quantity *</label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-md border text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

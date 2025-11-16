"use client";
import TopNav from "@/components/TopNav";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  price: number;                 // numeric column in DB
  stock_quantity: number | null; // our stock column
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState("0"); // same currency
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, price, stock_quantity")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading products", error);
      } else if (data) {
        setProducts(data as Product[]);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    );
  }, [products, query]);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    [cart]
  );

  const discountNumber = Number(discount) || 0;
  const total = Math.max(subtotal - discountNumber, 0);

  const addToCart = (product: Product) => {
    setMessage(null);

    const available = product.stock_quantity ?? 0;
    if (available <= 0) {
      setMessage("No stock available for this product.");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((ci) => ci.product.id === product.id);
      const currentQty = existing?.quantity ?? 0;
      const nextQty = currentQty + 1;

      if (nextQty > available) {
        setMessage("Cannot add more, not enough stock.");
        return prev;
      }

      if (existing) {
        return prev.map((ci) =>
          ci.product.id === product.id
            ? { ...ci, quantity: nextQty }
            : ci
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setMessage(null);

    const product = products.find((p) => p.id === productId);
    const available = product?.stock_quantity ?? 0;

    if (!product) return;

    if (quantity <= 0) {
      setCart((prev) =>
        prev.filter((ci) => ci.product.id !== productId)
      );
      return;
    }

    if (quantity > available) {
      setMessage("Quantity exceeds available stock.");
      return;
    }

    setCart((prev) =>
      prev.map((ci) =>
        ci.product.id === productId ? { ...ci, quantity } : ci
      )
    );
  };

  const handleCompleteSale = () => {
    if (!cart.length) {
      setMessage("Cart is empty.");
      return;
    }

    const payload = cart.map((ci) => ({
      product_id: ci.product.id,
      quantity: ci.quantity,
      unit_price: ci.product.price,
    }));

    console.log("Sale payload (to send to Supabase later):", {
      items: payload,
      subtotal,
      discount: discountNumber,
      total,
    });

    setMessage(
      "Sale simulated in console. Later we will save it to the database."
    );

    // Optional: clear cart
    // setCart([]);
    // setDiscount("0");
  };

  return (
    <>
    <TopNav />
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: Products & search */}
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">POS</h1>

        <input
          className="w-full border rounded-md px-3 py-2 text-sm"
          placeholder="Search by name or SKU..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="border rounded-md max-h-[400px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right">Stock</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const stock = p.stock_quantity ?? 0;
                return (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2 text-right">
                      {p.price.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right">{stock}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => addToCart(p)}
                        disabled={stock <= 0}
                        className={`px-3 py-1 rounded-md text-xs ${
                          stock <= 0
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!filteredProducts.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-2 text-center text-gray-500"
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Cart</h2>

        <div className="border rounded-md max-h-[400px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Item</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((ci) => (
                <tr key={ci.product.id} className="border-t">
                  <td className="px-3 py-2">{ci.product.name}</td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min={0}
                      value={ci.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          ci.product.id,
                          Number(e.target.value) || 0
                        )
                      }
                      className="w-16 border rounded px-2 py-1 text-right text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    {ci.product.price.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {(ci.product.price * ci.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
              {!cart.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-2 text-center text-gray-500"
                  >
                    Cart is empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span>Discount</span>
            <input
              className="w-24 border rounded-md px-2 py-1 text-right text-sm"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleCompleteSale}
          className="w-full px-4 py-2 rounded-md bg-green-600 text-white text-sm"
        >
          Complete Sale (simulate)
        </button>

        {message && (
          <p className="text-xs text-gray-700 mt-2">{message}</p>
        )}
      </div>
    </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartItem } from "./cart-item";
import { ProductSearch } from "./product-search";
import { OfflineCheckout } from "@/components/pos/offline-checkout";
import { useCart } from "@/hooks/use-cart";

interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
  barcode?: string;
  quantity_in_stock: number;
  image_url?: string;
}

interface POSCheckoutProps {
  storeId: string;
  products: Product[];
  cashierId: string;
}

export function POSCheckout({ storeId, products, cashierId }: POSCheckoutProps) {
  const { cart, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.includes(searchQuery),
  );

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleAddProduct = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  };

  const handleSuccess = () => {
    setShowCheckout(false);
    clearCart(); // ✅ use hook's clearCart instead of setCart
    console.log("Sale Completed!");
  };

  if (showCheckout) {
    return (
      <OfflineCheckout
        storeId={storeId}
        cashierId={cashierId}
        cart={cart}
        subtotal={subtotal}
        tax={tax}
        total={total}
        onCancel={() => setShowCheckout(false)}
        onSuccess={handleSuccess}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Search */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProductSearch query={searchQuery} onQueryChange={setSearchQuery} />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  disabled={product.quantity_in_stock === 0}
                  className="p-3 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-left transition"
                >
                  <div className="font-medium text-sm truncate">{product.name}</div>
                  <div className="text-primary font-semibold">
                    ${product.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Stock: {product.quantity_in_stock}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart Summary */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cart ({cart.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No items in cart
                </p>
              ) : (
                cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))
              )}
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => setShowCheckout(true)}
                disabled={cart.length === 0}
                className="w-full"
              >
                Complete Sale
              </Button>
              <Button
                variant="outline"
                onClick={clearCart}
                disabled={cart.length === 0}
                className="w-full bg-transparent"
              >
                Clear Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

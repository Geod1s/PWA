"use client"

import { useState, useEffect } from "react"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

const STORAGE_KEY = "pos_cart"

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setCart(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load cart:", e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  const addItem = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i))
      }
      return [...prev, item]
    })
  }

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
    } else {
      setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
    }
  }

  const clearCart = () => {
    setCart([])
  }

  return { cart, addItem, removeItem, updateQuantity, clearCart }
}

"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"

interface CartItemProps {
  item: {
    id: string
    name: string
    price: number
    quantity: number
  }
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
      <div className="flex-1">
        <div className="font-medium truncate">{item.name}</div>
        <div className="text-muted-foreground">
          ${item.price.toFixed(2)} x {item.quantity}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(Number.parseInt(e.target.value) || 1)}
          className="w-12 h-8 text-center"
        />
        <Button variant="ghost" size="sm" onClick={onRemove} className="h-8 w-8 p-0">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

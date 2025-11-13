"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface ProductSearchProps {
  query: string
  onQueryChange: (query: string) => void
}

export function ProductSearch({ query, onQueryChange }: ProductSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search by name, SKU, or barcode..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}

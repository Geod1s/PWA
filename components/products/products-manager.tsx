"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductsTable } from "./products-table"
import { ProductFormDialog } from "./product-form-dialog"

interface Product {
  id: string
  sku: string
  name: string
  description?: string
  category: string
  price: number
  cost?: number
  quantity_in_stock: number
  image_url?: string
  barcode?: string
  is_active: boolean
  created_at: string
}

interface ProductsManagerProps {
  storeId: string
  initialProducts: Product[]
}

export function ProductsManager({ storeId, initialProducts }: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleAddProduct = (newProduct: Product) => {
    setProducts([newProduct, ...products])
    setIsDialogOpen(false)
  }

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)))
    setSelectedProduct(null)
  }

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId))
  }

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedProduct(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your store inventory and pricing</p>
        </div>
        <Button
          onClick={() => {
            setSelectedProduct(null)
            setIsDialogOpen(true)
          }}
        >
          Add Product
        </Button>
      </div>

      <ProductFormDialog
        storeId={storeId}
        product={selectedProduct}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={(isNew, product) => {
          if (isNew) {
            handleAddProduct(product)
          } else {
            handleEditProduct(product)
          }
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>{products.length} Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductsTable
            products={products}
            onEdit={handleEditClick}
            onDelete={handleDeleteProduct}
            storeId={storeId}
          />
        </CardContent>
      </Card>
    </div>
  )
}

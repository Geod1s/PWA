import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StoreHeader } from "@/components/store/header"
import { ProductsManager } from "@/components/products/products-manager"

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ storeId: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { storeId } = await params

  const { data: store, error: storeError } = await supabase.from("stores").select("*").eq("id", storeId).single()

  if (storeError || !store) {
    redirect("/dashboard")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user is admin or creator
  if (profile?.store_id !== storeId || !["admin", "creator"].includes(profile?.role)) {
    redirect("/dashboard")
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-svh bg-background">
      <StoreHeader store={store} user={profile} />
      <main className="container mx-auto px-4 py-6">
        <ProductsManager storeId={storeId} initialProducts={products || []} />
      </main>
    </div>
  )
}

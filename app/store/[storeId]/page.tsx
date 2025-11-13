import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { POSCheckout } from "@/components/pos/checkout"
import { StoreHeader } from "@/components/store/header"

export default async function StorePage({
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

  // Check if user has access to this store
  if (profile?.store_id !== storeId && store.creator_id !== user.id) {
    redirect("/dashboard")
  }

  const { data: products } = await supabase.from("products").select("*").eq("store_id", storeId).eq("is_active", true)

  return (
    <div className="min-h-svh bg-background">
      <StoreHeader store={store} user={profile} />
      <main className="container mx-auto px-4 py-6">
        <POSCheckout storeId={storeId} products={products || []} cashierId={user.id} />
      </main>
    </div>
  )
}

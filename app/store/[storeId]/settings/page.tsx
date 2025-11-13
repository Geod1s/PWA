import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StoreHeader } from "@/components/store/header"
import { StoreSettings } from "@/components/store/store-settings"

export default async function SettingsPage({
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

  const { data: store } = await supabase.from("stores").select("*").eq("id", storeId).single()

  if (!store || store.creator_id !== user.id) {
    redirect("/dashboard")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-svh bg-background">
      <StoreHeader store={store} user={profile} />
      <main className="container mx-auto px-4 py-6">
        <StoreSettings storeId={storeId} store={store} />
      </main>
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StoreHeader } from "@/components/store/header"
import { StaffManager } from "@/components/staff/staff-manager"

export default async function StaffPage({
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

  if (!store) {
    redirect("/dashboard")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Only creators and admins can access
  if (
    (profile?.store_id !== storeId || !["admin", "creator"].includes(profile?.role)) &&
    store.creator_id !== user.id
  ) {
    redirect("/dashboard")
  }

  const { data: staff } = await supabase.from("profiles").select("*").eq("store_id", storeId).neq("id", user.id)

  const { data: invitations } = await supabase.from("role_invitations").select("*").eq("store_id", storeId)

  return (
    <div className="min-h-svh bg-background">
      <StoreHeader store={store} user={profile} />
      <main className="container mx-auto px-4 py-6">
        <StaffManager
          storeId={storeId}
          isCreator={store.creator_id === user.id}
          initialStaff={staff || []}
          initialInvitations={invitations || []}
        />
      </main>
    </div>
  )
}

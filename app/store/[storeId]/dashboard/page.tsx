import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StoreHeader } from "@/components/store/header"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import TopNav from "@/components/TopNav";
export default async function DashboardPage({
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

  if (profile?.store_id !== storeId && store.creator_id !== user.id) {
    redirect("/dashboard")
  }

  // Get today's analytics
  const today = new Date().toISOString().split("T")[0]
  const { data: todayAnalytics } = await supabase
    .from("daily_analytics")
    .select("*")
    .eq("store_id", storeId)
    .eq("date", today)
    .single()

  // Get recent transactions
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select(`
      id,
      transaction_number,
      total,
      payment_method,
      created_at,
      profiles:cashier_id(first_name, last_name)
    `)
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <>
    <TopNav />
    <div className="min-h-svh bg-background">
      <StoreHeader store={store} user={profile} />
      <main className="container mx-auto px-4 py-6">
        <DashboardContent
          storeId={storeId}
          todayAnalytics={todayAnalytics}
          recentTransactions={recentTransactions || []}
        />
      </main>
    </div>
    </>
  )
}

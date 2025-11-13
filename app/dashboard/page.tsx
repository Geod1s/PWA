import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  const { data: stores } = await supabase.from("stores").select("*").eq("creator_id", data.user.id)

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Cloud POS System</h1>
          <Button variant="outline">Sign out</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {profile?.first_name || "User"}!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Role: {profile?.role}</p>
            </CardContent>
          </Card>

          {stores && stores.length > 0 && (
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold">Your Stores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stores.map((store) => (
                  <Card key={store.id}>
                    <CardHeader>
                      <CardTitle>{store.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <p className="text-sm text-muted-foreground">{store.city}</p>
                      <Link href={`/store/${store.id}`}>
                        <Button className="w-full">Open Store</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!stores ||
            (stores.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">You don't have any stores yet.</p>
                  <Link href="/create-store">
                    <Button>Create Your First Store</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
        </div>
      </main>
    </div>
  )
}

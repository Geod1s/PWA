"use client"
import TopNav from "@/components/TopNav";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface StoreHeaderProps {
  store: any
  user: any
}

export function StoreHeader({ store, user }: StoreHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <>
    <TopNav />
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <p className="text-sm text-muted-foreground">
            {user?.first_name} • {user?.role}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Button variant="ghost" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
    </>
  )
}

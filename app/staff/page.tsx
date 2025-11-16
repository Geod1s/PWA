import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StaffManager } from "@/components/staff/staff-manager"
import TopNav from "@/components/TopNav"

// Types should match what you used in StaffManager
interface StaffMember {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  status: string
  created_at: string
}

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  created_at: string
  expires_at: string
}

export default async function StaffPage() {
  const supabase = await createClient()

  // 1) Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // 2) Get current user's profile to know store + role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, store_id, role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.store_id) {
    // No store associated – you can customize this
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Staff Management</h1>
        <p className="mt-2 text-muted-foreground">
          You are not assigned to a store yet.
        </p>
      </div>
    )
  }

  const storeId = profile.store_id as string

  // Decide who can invite / remove staff.
  // Adjust this to your own logic (e.g. only "owner" can manage staff).
  const isCreator = profile.role === "admin" || profile.role === "owner"

  // 3) Load active staff for this store
  const { data: staffRows, error: staffError } = await supabase
    .from("profiles")
    .select(
      "id, email, first_name, last_name, role, status, created_at, store_id",
    )
    .eq("store_id", storeId)

  if (staffError) {
    console.error("Error loading staff", staffError)
  }

  const staff: StaffMember[] = (staffRows || []).map((row: any) => ({
    id: row.id,
    email: row.email,
    first_name: row.first_name,
    last_name: row.last_name,
    role: row.role,
    status: row.status,
    created_at: row.created_at,
  }))

  // 4) Load pending invitations for this store
  const { data: invitationRows, error: inviteError } = await supabase
    .from("role_invitations")
    .select("id, email, role, status, created_at, expires_at, store_id")
    .eq("store_id", storeId)

  if (inviteError) {
    console.error("Error loading invitations", inviteError)
  }

  const invitations: Invitation[] = (invitationRows || []).map((row: any) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    status: row.status,
    created_at: row.created_at,
    expires_at: row.expires_at,
  }))

  // 5) Render your client-side manager
  return (
    <>
    <TopNav />
    <div className="p-6">
      <StaffManager
        storeId={storeId}
        isCreator={isCreator}
        initialStaff={staff}
        initialInvitations={invitations}
      />
    </div>
    </>
  )
}

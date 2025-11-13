"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Trash2 } from "lucide-react"

interface StaffMember {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  status: string
}

interface StaffTableProps {
  staff: StaffMember[]
  storeId: string
  isCreator: boolean
  onStaffRemoved: (staffId: string) => void
}

export function StaffTable({ staff, storeId, isCreator, onStaffRemoved }: StaffTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleRemove = async (staffId: string) => {
    setDeletingId(staffId)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ status: "inactive", store_id: null })
        .eq("id", staffId)
        .eq("store_id", storeId)

      if (updateError) throw updateError
      onStaffRemoved(staffId)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove staff")
    } finally {
      setDeletingId(null)
    }
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No staff members yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded mb-4">{error}</div>}
      <table className="w-full text-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="py-3 px-4 font-semibold">Name</th>
            <th className="py-3 px-4 font-semibold">Email</th>
            <th className="py-3 px-4 font-semibold">Role</th>
            <th className="py-3 px-4 font-semibold">Status</th>
            <th className="py-3 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr key={member.id} className="border-b border-border hover:bg-muted/50">
              <td className="py-3 px-4 font-medium">
                {member.first_name} {member.last_name}
              </td>
              <td className="py-3 px-4">{member.email}</td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">
                  {member.role}
                </span>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    member.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {member.status}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                {isCreator && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(member.id)}
                    disabled={deletingId === member.id}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

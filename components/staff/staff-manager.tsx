"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StaffTable } from "./staff-table"
import { InvitationForm } from "./invitation-form"

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

interface StaffManagerProps {
  storeId: string
  isCreator: boolean
  initialStaff: StaffMember[]
  initialInvitations: Invitation[]
}

export function StaffManager({ storeId, isCreator, initialStaff, initialInvitations }: StaffManagerProps) {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff)
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations)
  const [showInviteForm, setShowInviteForm] = useState(false)

  const handleStaffRemoved = (staffId: string) => {
    setStaff(staff.filter((s) => s.id !== staffId))
  }

  const handleInvitationSent = (newInvitation: Invitation) => {
    setInvitations([newInvitation, ...invitations])
    setShowInviteForm(false)
  }

  const handleInvitationRevoked = (invitationId: string) => {
    setInvitations(invitations.filter((i) => i.id !== invitationId))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage team members and invite new staff</p>
        </div>
      </div>

      <Tabs defaultValue="staff" className="w-full">
        <TabsList>
          <TabsTrigger value="staff">Staff ({staff.length})</TabsTrigger>
          <TabsTrigger value="invitations">Pending Invitations ({invitations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffTable staff={staff} storeId={storeId} isCreator={isCreator} onStaffRemoved={handleStaffRemoved} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          {isCreator && (
            <Button onClick={() => setShowInviteForm(!showInviteForm)}>
              {showInviteForm ? "Cancel" : "Send Invitation"}
            </Button>
          )}

          {showInviteForm && isCreator && (
            <InvitationForm
              storeId={storeId}
              onInvitationSent={handleInvitationSent}
              onCancel={() => setShowInviteForm(false)}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No pending invitations</p>
              ) : (
                <div className="space-y-3">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="flex justify-between items-center p-3 border border-border rounded">
                      <div>
                        <p className="font-medium">{inv.email}</p>
                        <p className="text-sm text-muted-foreground">Role: {inv.role}</p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(inv.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      {isCreator && (
                        <Button variant="destructive" size="sm" onClick={() => handleInvitationRevoked(inv.id)}>
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

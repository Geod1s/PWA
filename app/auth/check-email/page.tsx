"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-sm text-muted-foreground mt-2">Verify your email address to continue</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Confirm Email</CardTitle>
              <CardDescription>
                We sent a confirmation link to your email. Click the link to verify your account and get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  After confirming your email, you'll be able to sign in and create your first store.
                </p>
                <div className="bg-muted p-4 rounded text-sm">
                  <strong>Didn't receive the email?</strong>
                  <p className="mt-2 text-muted-foreground">Check your spam folder or try signing up again.</p>
                </div>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full bg-transparent">
                    Back to login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

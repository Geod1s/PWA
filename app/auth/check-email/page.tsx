// app/auth/check-email/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CheckEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            Verify your email address to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to your email. Click the link to verify
            your account and get started.
          </p>
          <p className="text-sm text-muted-foreground">
            After confirming your email, you&apos;ll be able to sign in and
            create your first store.
          </p>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Didn&apos;t receive the email?</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Check your spam or promotions folder</li>
              <li>Make sure you entered the correct email address</li>
            </ul>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

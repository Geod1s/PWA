"use client"; // Convert to a client component to resolve build errors

import { useState, useEffect } from "react";
// The build environment is having trouble resolving "next/navigation"
// This import is correct for a Next.js app, but I'll try a relative path.
import { useRouter } from "@/node_modules/next/navigation"; 
// Try relative paths for local modules, assuming 'app' is not the root.
import { createClient } from "@/lib/supabase/client"; 
import { StoreHeader } from "@/components/store/header"; 
import { StoreSettings } from "@/components/store/store-settings"; 

interface StoreSettingsPageProps {
  params: {
    storeId: string;
  };
}

/**
 * Client component for the Store Settings page.
 * It fetches user and store data on the client-side.
 */
export default function StoreSettingsPage({ params }: StoreSettingsPageProps) {
  const [store, setStore] = useState<any>(null);
  const [fullUser, setFullUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient(); // Create client-side Supabase client
  const storeId = params.storeId;

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      // 1. Get the current authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth error:", authError);
        router.push("/auth/login"); // Redirect to login
        return;
      }

      // 2. Fetch store and user profile data in parallel
      const [storeResponse, profileResponse] = await Promise.all([
        supabase.from("stores").select("*").eq("id", storeId).single(),
        supabase
          .from("user_profiles") // <-- ASSUMPTION: Update with your actual user profile table
          .select("first_name, role")
          .eq("id", user.id)
          .single(),
      ]);

      const { data: storeData, error: storeError } = storeResponse;
      const { data: userProfile, error: userError } = profileResponse;

      // 4. Handle errors during data fetching
      if (storeError || userError || !storeData || !userProfile) {
        console.error("Error fetching settings data:", storeError || userError);
        if (!storeData) {
          setError("Store not found or you do not have permission to view it.");
        } else if (!userProfile) {
          setError("Could not load user profile.");
        } else {
          setError("An error occurred while loading page data.");
        }
        setIsLoading(false);
        return;
      }

      // 5. Combine auth user data with profile data
      setFullUser({
        ...user, // from auth.getUser()
        ...userProfile, // from 'user_profiles' table
      });
      setStore(storeData);
      setIsLoading(false);
    }

    fetchData();
  }, [supabase, storeId, router]);

  // 6. Render loading or error states
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        {/* You can render a minimal header or a full-page loader */}
        <div className="container mx-auto p-8 text-center">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error || !store || !fullUser) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="container mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-destructive">{error || "Could not load data."}</p>
        </div>
      </div>
    );
  }

  // 7. Render the page with the fetched data
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* StoreHeader is a client component */}
      <StoreHeader store={store} user={fullUser} />

      {/* Main content area for the settings form */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* StoreSettings is a client component */}
        <StoreSettings storeId={params.storeId} store={store} />
      </main>
    </div>
  );
}
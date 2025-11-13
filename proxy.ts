// proxy.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const config = {
  matcher: [
    // Run on everything except:
    // - Next static files
    // - Next image optimizer
    // - favicon
    // - service worker
    // - manifest
    "/((?!_next/static|_next/image|favicon.ico|service-worker.js|manifest.json).*)",
  ],
};

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update request cookies
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // Recreate response so updated cookies are included
          response = NextResponse.next({ request });

          // Send cookies back to the browser
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get current user (this also refreshes tokens via cookies)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect everything except /auth/* and /invite*
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/invite")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return response;
}

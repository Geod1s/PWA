import { updateSession } from "./lib/supabase/middleware"

export const middleware = updateSession

export const config = {
  matcher: [
    // Run middleware on everything EXCEPT:
    // - Next static files
    // - Next image optimizer
    // - favicon
    // - service worker
    // - manifest
    "/((?!_next/static|_next/image|favicon.ico|service-worker.js|manifest.json).*)",
  ],
}

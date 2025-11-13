const CACHE_NAME = "cloud-pos-v1"

// Only cache URLs that actually exist and are public
// You can add more later once you're sure they work.
const URLS_TO_CACHE = [
  "/auth/login",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        URLS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            // Don't break install if one URL fails
            console.warn("[SW] Skipping", url, ":", err)
          }),
        ),
      ),
    ),
  )

  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // API requests - try network first, then cache
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cachePromise = caches.open(CACHE_NAME)
          cachePromise.then((cache) =>
            cache.put(event.request, response.clone()),
          )
          return response
        })
        .catch(() => {
          return caches.match(event.request).then((response) => {
            return response || new Response("Offline")
          })
        }),
    )
    return
  }

  // Cache-first strategy for everything else
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      return fetch(event.request).then((networkResponse) => {
        // Only cache valid responses
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse
        }

        const cachePromise = caches.open(CACHE_NAME)
        cachePromise.then((cache) =>
          cache.put(event.request, networkResponse.clone()),
        )

        return networkResponse
      })
    }),
  )
})

// Handle offline sync messages
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

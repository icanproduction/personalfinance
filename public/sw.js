// ============================================
// iCAN Financial - Service Worker
// ============================================

const CACHE_NAME = 'ican-financial-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/budget',
  '/transactions',
  '/settings',
  '/manifest.json',
]

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch: network-first for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // API calls: network only
  if (url.pathname.startsWith('/api/')) return

  // Static assets: stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request)
      const fetched = fetch(request).then((response) => {
        if (response.ok) {
          cache.put(request, response.clone())
        }
        return response
      }).catch(() => cached)

      return cached || fetched
    })
  )
})

// Push notification handler
self.addEventListener('push', (event) => {
  let data = { title: 'iCAN Financial', body: 'Ada update keuangan kamu!' }

  try {
    if (event.data) {
      data = event.data.json()
    }
  } catch (e) {
    // fallback to default
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200],
      data: data.url || '/dashboard',
      actions: [
        { action: 'open', title: 'Buka App' },
      ],
    })
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.openWindow(event.notification.data || '/dashboard')
  )
})

const CACHE = 'bss-v1'

const PRECACHE = [
  '/',
  '/offline',
  '/icon-192.png',
  '/icon-512.png',
]

// Installation : on précache les ressources essentielles
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

// Activation : on nettoie les anciens caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Fetch : network-first avec fallback cache
self.addEventListener('fetch', (e) => {
  // Ignorer les requêtes non-GET et les API
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/api/')) return
  if (e.request.url.includes('supabase')) return

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Mettre en cache les pages HTML et assets
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request).then(cached => cached || caches.match('/offline')))
  )
})

// Notifications push
self.addEventListener('push', (e) => {
  if (!e.data) return
  const data = e.data.json()
  e.waitUntil(
    self.registration.showNotification(data.title || 'BuySellSeychelles', {
      body: data.body || 'Vous avez un nouveau message',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
    })
  )
})

// Clic sur notification → ouvre la page
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      const url = e.notification.data?.url || '/'
      const match = list.find(c => c.url === url && 'focus' in c)
      if (match) return match.focus()
      return clients.openWindow(url)
    })
  )
})

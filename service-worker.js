// Graspion Service Worker
// IMPORTANT DESIGN DECISION: pages (HTML) are NEVER served from cache.
// Earlier versions of this file cached HTML too, which caused customers
// and staff to keep seeing old versions after every update — a serious
// experience problem for a site that changes often. Now:
//   - HTML pages: always fetched fresh from the network (never stale)
//   - Only truly static assets (icon, manifest files) are cached, purely
//     to make "Add to Home Screen" installable and slightly faster —
//     these rarely change, and even if they do, they're small.
//   - Supabase/Razorpay calls are never touched by the service worker.
// Net effect: the app always shows the latest deployed version
// automatically — no manual cache-clearing needed by anyone, ever.

const CACHE_NAME = 'graspion-static-v7';
const STATIC_ONLY_FILES = [
  './icon.svg',
  './icon-customer.png',
  './icon-vendor.png',
  './icon-rider.png',
  './icon-admin.png',
  './manifest.json',
  './manifest-admin.json',
  './manifest-vendor.json',
  './manifest-rider.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ONLY_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  const url = event.request.url;

  // Never touch Supabase or Razorpay calls — always live
  if (url.indexOf('supabase.co') !== -1 || url.indexOf('razorpay.com') !== -1) {
    return;
  }

  // HTML pages (navigations), any .html file, and manifest*.json files:
  // ALWAYS network-first, never served from a stale cache. Manifests
  // control PWA identity (scope/id/icon per app) — a stale cached one
  // caused a real bug (couldn't install Vendor/Rider/Admin separately
  // from Customer) that only went away after forcing a fresh fetch.
  const isAlwaysFreshRequest = event.request.mode === 'navigate' || url.endsWith('.html') || /manifest(-\w+)?\.json$/.test(url);
  if (isAlwaysFreshRequest) {
    event.respondWith(
      fetch(event.request).catch(function() {
        // only if genuinely offline, fall back to whatever's cached
        return caches.match(event.request);
      })
    );
    return;
  }

  // Everything else (icon, manifest files): cache-first is fine, they
  // barely ever change and this keeps things fast.
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request);
    })
  );
});

// ===================== PUSH NOTIFICATIONS =====================
// Shows a rich notification (title, body, image, custom icon) when the
// server sends a push message — used for offers/announcements/campaigns to
// people who've installed the app. Free (uses the browser's own push
// service via Web Push), no SMS/email API needed for this channel.
self.addEventListener('push', function(event) {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: 'Graspion', body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'Graspion';
  const options = {
    body: data.body || '',
    icon: data.icon || './icon-customer.png',
    badge: './icon-customer.png',
    image: data.image || undefined,
    data: { url: data.url || './' },
    vibrate: [200, 100, 200]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(clients.openWindow(url));
});

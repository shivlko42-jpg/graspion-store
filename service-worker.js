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

const CACHE_NAME = 'graspion-static-v3';
const STATIC_ONLY_FILES = [
  './icon.svg',
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

  // HTML pages (navigations) and any .html file: ALWAYS network-first,
  // never served from a stale cache. This is the fix for the "old
  // version keeps showing" problem.
  const isHtmlRequest = event.request.mode === 'navigate' || url.endsWith('.html');
  if (isHtmlRequest) {
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

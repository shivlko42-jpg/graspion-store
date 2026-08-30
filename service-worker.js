// Graspion Service Worker — minimal, just enough to make the site
// installable as a PWA and keep the app shell available offline.
// Product/order data always comes fresh from Supabase (never cached here),
// only the static shell (HTML/CSS/JS/icon) is cached for fast reloads.

const CACHE_NAME = 'graspion-shell-v2';
const SHELL_FILES = [
  './index.html',
  './admin.html',
  './vendor.html',
  './rider.html',
  './graspion-lang.js',
  './graspion-logo.js',
  './icon.svg',
  './manifest.json',
  './manifest-admin.json',
  './manifest-vendor.json',
  './manifest-rider.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_FILES);
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
  // Never cache Supabase API calls or Razorpay — always go live for those
  if (event.request.url.indexOf('supabase.co') !== -1 || event.request.url.indexOf('razorpay.com') !== -1) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request);
    })
  );
});

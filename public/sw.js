const CACHE_NAME = "marcheduroi-v8";
const STATIC_ASSETS = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  self.skipWaiting(); // Forcer remplacement immédiat
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim()) // Prendre le contrôle immédiatement
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ignorer les requêtes non-GET
  if (event.request.method !== "GET") return;

  // Ignorer les APIs externes
  const externalDomains = [
    "supabase.co", "fedapay.com", "flutterwave.com",
    "cloudflare.com", "cloudinary.com", "resend.com",
    "googleapis.com", "gstatic.com", "youtube.com", "youtu.be"
  ];
  if (externalDomains.some(d => url.hostname.includes(d))) return;

  // Routes SPA → toujours servir index.html
  const spaRoutes = ["/annonce/", "/boutique/", "/atelier/", "/resto/", "/beaute/", "/structure/", "/demandes", "/reset-password"];
  if (url.pathname === "/" || spaRoutes.some(r => url.pathname.startsWith(r))) {
    event.respondWith(
      caches.match("/index.html")
        .then(r => r || fetch("/index.html"))
        .catch(() => fetch("/index.html"))
    );
    return;
  }

  // Assets statiques → cache first, network fallback
  if (url.hostname === self.location.hostname) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        }).catch(() => caches.match("/index.html"));
      })
    );
  }
});

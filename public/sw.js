const CACHE_NAME = "marcheduroi-v35";
const STATIC_ASSETS = ["/", "/index.html"];
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  const externalDomains = [
    "supabase.co", "fedapay.com", "flutterwave.com",
    "cloudflare.com", "cloudinary.com", "resend.com",
    "googleapis.com", "gstatic.com", "youtube.com", "youtu.be"
  ];
  if (externalDomains.some(d => url.hostname.includes(d))) return;
  const bypassRoutes = ["/demandes", "/api/"];
  if (bypassRoutes.some(r => url.pathname.startsWith(r))) return;

  const importantParams = ["ref", "code", "token", "mdr_post"];
  if (importantParams.some(p => url.searchParams.has(p))) {
    event.respondWith(fetch(event.request).catch(() => caches.match("/index.html")));
    return;
  }

  const spaRoutes = ["/annonce/", "/boutique/", "/atelier/", "/resto/", "/beaute/", "/structure/", "/reset-password"];
  if (url.pathname === "/" || spaRoutes.some(r => url.pathname.startsWith(r))) {
    event.respondWith(
      caches.match("/index.html")
        .then(r => r || fetch("/index.html"))
        .catch(() => fetch("/index.html"))
    );
    return;
  }
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

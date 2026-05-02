const CACHE_NAME = "marcheduroi-v3";
const STATIC_ASSETS = ["/", "/index.html"];

// Installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activation
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — stratégie SPA : toujours servir index.html pour les routes React
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ignorer les requêtes non-GET
  if (event.request.method !== "GET") return;

  // Ignorer les APIs externes (Supabase, FedaPay, Cloudflare, etc.)
  const externalDomains = [
    "supabase.co", "fedapay.com", "flutterwave.com",
    "cloudflare.com", "cloudinary.com", "resend.com",
    "googleapis.com", "gstatic.com"
  ];
  if (externalDomains.some(d => url.hostname.includes(d))) return;

  // Pour les routes SPA (/annonce/, /boutique/, etc.) → servir index.html
  const spaRoutes = ["/annonce/", "/boutique/", "/atelier/", "/resto/", "/beaute/", "/structure/", "/demandes"];
  if (spaRoutes.some(r => url.pathname.startsWith(r)) || url.pathname === "/") {
    event.respondWith(
      caches.match("/index.html").then(r => r || fetch(event.request))
    );
    return;
  }

  // Pour les assets statiques → cache first
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      })
    )
  );
});

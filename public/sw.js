const CACHE_NAME = "marcheduroi-v3";
const ASSETS = ["/", "/index.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// ── Notifications push ────────────────────────────────────────────────────────
self.addEventListener("push", (e) => {
  let data = { title: "💬 Nouveau message — MarchéduRoi", body: "Vous avez reçu un nouveau message.", icon: "/marcheduRoi-icon.svg" };
  try { if (e.data) data = { ...data, ...e.data.json() }; } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/marcheduRoi-icon.svg",
      badge: "/marcheduRoi-icon.svg",
      tag: data.tag || "mdr-message",
      renotify: true,
      vibrate: [200, 100, 200],
    })
  );
});

// Clic sur la notification → ouvre le site
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("marcheduroi.com") && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow("https://marcheduroi.com");
    })
  );
});

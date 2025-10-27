/*******************************************************
🍝 MERCATTO DELIVERY - SERVICE WORKER
Versão: 2.1
********************************************************/

const CACHE_NAME = "mercatto-v2.1";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",

  // Ícones
  "/icons/logo-192.png",
  "/icons/logo-512.png",

  // 🍽️ Imagens do banner e cardápio (pasta /paste)
  "/paste/CAPA MERCATTO.png",
  "/paste/Captura de tela 2025-10-24 100412.png",
  "/paste/Captura de tela 2025-10-24 101231.png",
  "/paste/Captura de tela 2025-10-24 101406.png",
  "/paste/Captura de tela 2025-10-24 103740.png",
  "/paste/Captura de tela 2025-10-24 103901.png",
  "/paste/Captura de tela 2025-10-24 104030.png",
  "/paste/Captura de tela 2025-10-24 104231.png",
  "/paste/Captura de tela 2025-10-27 155128.png",
  "/paste/Captura de tela 2025-10-27 162118.png",
  "/paste/polvo braseado.png"
];

/********************************************************
📦 INSTALAÇÃO DO SERVICE WORKER
********************************************************/
self.addEventListener("install", (event) => {
  console.log("📦 Instalando cache inicial Mercatto...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

/********************************************************
⚡ ATIVAÇÃO (limpa versões antigas)
********************************************************/
self.addEventListener("activate", (event) => {
  console.log("⚡ Ativando nova versão e limpando caches antigos...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/********************************************************
🌐 FETCH - busca no cache primeiro
********************************************************/
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return networkResponse;
        })
        .catch(() => {
          if (event.request.destination === "image") {
            return caches.match("/paste/CAPA MERCATTO.png");
          }
        });
    })
  );
});

/********************************************************
🔔 PUSH NOTIFICATIONS
********************************************************/
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(
      data.title || "Atualização Mercatto",
      {
        body: data.body || "Seu pedido mudou de status!",
        icon: "/icons/logo-192.png",
        badge: "/icons/logo-192.png",
      }
    )
  );
});

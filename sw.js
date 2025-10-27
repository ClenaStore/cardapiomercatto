/*******************************************************
🍝 MERCATTO DELIVERY - SERVICE WORKER
Versão: 2.0
Funções:
✅ Cache de todas as páginas e imagens locais (/paste e /icons)
✅ Suporte offline total (index, manifest, imagens)
✅ Atualização automática
✅ Push notifications (para atualizações de pedido)
********************************************************/

const CACHE_NAME = "mercatto-v2";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",

  // Ícones
  "/icons/logo-192.png",
  "/icons/logo-512.png",

  // 🍽️ Imagens do cardápio (todas da pasta /paste)
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
  console.log("📦 Instalando Service Worker e armazenando cache inicial...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

/********************************************************
⚡ ATIVAÇÃO (LIMPEZA DE CACHES ANTIGOS)
********************************************************/
self.addEventListener("activate", (event) => {
  console.log("⚡ Ativando nova versão e limpando caches antigos...");
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Deletando cache antigo:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/********************************************************
🌐 INTERCEPTADOR DE REQUISIÇÕES
********************************************************/
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      // Busca online e adiciona ao cache (estratégia network-first)
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // 🔴 Caso offline e sem cache: retorna imagem padrão
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
      data.title || "Atualização do Pedido Mercatto",
      {
        body: data.body || "Seu pedido mudou de status!",
        icon: "icons/logo-192.png",
        badge: "icons/logo-192.png",
      }
    )
  );
});

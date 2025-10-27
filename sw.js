/*******************************************************
🍝 MERCATTO DELIVERY - SERVICE WORKER
Versão: 1.3
Funções:
✅ Cache de páginas e imagens locais
✅ Suporte offline total (index, manifest e mídias)
✅ Push notifications (atualizações de pedido)
********************************************************/

const CACHE_NAME = "mercatto-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",

  // Ícones
  "/icons/logo-192.png",
  "/icons/logo-512.png",

  // 🍽️ Imagens da pasta /paste (adicione todas aqui)
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
  "/paste/polvo braseado.png",
];

/********************************************************
🧩 INSTALAÇÃO DO SERVICE WORKER
********************************************************/
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("🟡 Instalando cache inicial...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

/********************************************************
⚡ ATIVAÇÃO (LIMPEZA DE CACHES ANTIGOS)
********************************************************/
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Limpando cache antigo:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/********************************************************
🌐 INTERCEPTADOR DE REQUISIÇÕES
********************************************************/
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // 🟢 Retorna do cache se já estiver salvo
        return cachedResponse;
      }
      // 🔵 Caso contrário, faz a requisição e salva no cache dinamicamente
      return fetch(e.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, clonedResponse);
          });
          return networkResponse;
        })
        .catch(() => {
          // 🔴 Offline e não encontrado no cache
          if (e.request.destination === "image") {
            // Retorna uma imagem padrão se desejar
            return caches.match("/paste/CAPA MERCATTO.png");
          }
        });
    })
  );
});

/********************************************************
🔔 PUSH NOTIFICATIONS (opcional)
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

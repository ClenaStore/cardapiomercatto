// ============================
// 📦 SERVICE WORKER MERCATTO
// ============================

const CACHE_NAME = "mercatto-v2";

// 🧩 Todos os arquivos importantes do app
const FILES_TO_CACHE = [
  "/", 
  "/index.html",
  "/manifest.json",

  // 🖼️ Imagens principais
  "/img/padrao.jpg",
  "/icons/logo-192.png",
  "/icons/logo-512.png",

  // 📸 Fotos do cardápio
  "/paste/CAPA MERCATTO.png",
  "/paste/Captura de tela 2025-10-24 101406.png",
  "/paste/Captura de tela 2025-10-24 101231.png",
  "/paste/Captura de tela 2025-10-24 101004.png",
  "/paste/Captura de tela 2025-10-24 103740.png",
  "/paste/Captura de tela 2025-10-24 104030.png",
  "/paste/Captura de tela 2025-10-24 104412.png",

  // 🎥 Vídeos do cardápio
  "/videos/risoto-camarao.mp4",
  "/videos/talharim-camarao.mp4",
  "/videos/polvo-braseado.mp4",
  "/videos/salmao-crocante.mp4",
  "/videos/new-york.mp4",
  "/videos/galak-oreo.mp4",
  "/videos/pudim.mp4"
];

// 🏗️ Instalação: adiciona arquivos ao cache
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// 🚀 Ativação: remove caches antigos
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 🌐 Intercepta requisições e serve do cache se disponível
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response =>
      response ||
      fetch(e.request)
        .then(fetchRes => {
          // 🔄 Atualiza o cache automaticamente com novos arquivos
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, fetchRes.clone());
            return fetchRes;
          });
        })
        .catch(() => caches.match("/img/padrao.jpg")) // fallback se offline
    )
  );
});

// 🔔 Notificações push
self.addEventListener("push", event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Atualização do Pedido", {
      body: data.body || "Seu pedido mudou de status!",
      icon: "icons/logo-192.png",
      badge: "icons/logo-192.png"
    })
  );
});

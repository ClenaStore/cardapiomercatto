self.addEventListener('install', e => {
  e.waitUntil(caches.open('mercatto-v1').then(c =>
    c.addAll(['/', '/index.html', '/manifest.json'])
  ));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Atualização do Pedido", {
      body: data.body || "Seu pedido mudou de status!",
      icon: "icons/logo-192.png",
      badge: "icons/logo-192.png"
    })
  );
});

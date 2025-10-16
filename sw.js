const REPO_NAME = 'Jairo-Senna-Controle-de-entregas-Log-Servi-osv2';
const CACHE_NAME = 'delivery-control-cache-v3';

const URLS_TO_CACHE = [
  `/${REPO_NAME}/`,
  `/${REPO_NAME}/index.html`,
  `/${REPO_NAME}/main.js`,
  `/${REPO_NAME}/manifest.webmanifest`,
  `/${REPO_NAME}/icon-192.png`,
  `/${REPO_NAME}/icon-512.png`,
];

// Instala o service worker e armazena o shell do aplicativo em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('Cache aberto');
        try {
          await cache.addAll(URLS_TO_CACHE);
        } catch (err) {
          console.warn('⚠️ Alguns arquivos não puderam ser armazenados em cache:', err);
        }
      })
      .then(() => self.skipWaiting())
  );
});

// Busca recursos primeiro do cache, depois da rede
self.addEventListener('fetch', event => {
  // Ignora requisições não-GET ou de extensões
  if (
    event.request.method !== 'GET' ||
    event.request.url.startsWith('chrome-extension://') ||
    event.request.url.includes('extension')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;

        return fetch(event.request).then(networkResponse => {
          // Evita cachear respostas inválidas ou externas (CORS)
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type === 'opaque'
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch(err => {
          console.error('Falha ao buscar recurso:', err);
        });
      })
  );
});

// Remove caches antigos durante a ativação
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🧹 Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

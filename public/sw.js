const CACHE_NAME = 'neri-animators-cache-v2';

// Файли для миттєвого прекешу
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Працюємо виключно з GET-запитами
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // СТРАТЕГІЯ 1: Для статичних файлів самого коду програми (_next/static, шрифти, іконки)
  // Використовуємо Cache First (якщо є в кеші — віддаємо миттєво, не турбуючи мережу)
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // СТРАТЕГІЯ 2: Для динамічних сторінок категорій та запитів до бази Supabase
  // Використовуємо Network First (шукаємо в мережі, якщо мережі нема — беремо з кешу)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Рятуємо запит у кеш, якщо все добре (status 0 потрібен для CORS запитів типу Supabase)
        if (networkResponse.status === 200 || networkResponse.status === 0) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 🔥 ГОЛОВНЕ ВИПРАВЛЕННЯ: додаємо параметр { ignoreVary: true }
        // Це змушує сервіс-воркер ігнорувати службові заголовки Next.js (RSC, Prefetch)
        // і повертати сторінку категорії суто за збігом URL адреси
        return caches.match(event.request, { ignoreVary: true }).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Якщо користувач повністю офлайн і намагається відкрити сторінку, де ще ні разу не був
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
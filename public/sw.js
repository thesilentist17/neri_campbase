const CACHE_NAME = 'neri-animators-cache-v1';

// Файли, які кешуються одразу при першому заході на сайт
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json'
];

// Інсталяція Сервіс-Воркера
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Активація та очищення старого кешу при оновленні додатка
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

// Перехоплення запитів (Fetch) та магія офлайн-режиму
self.addEventListener('fetch', (event) => {
  // Кешуємо лише GET запити (сторінки, картинки, дані Supabase)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Якщо запит успішний, копіюємо його у кеш
        if (networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Якщо сталася помилка (НЕМАЄ ІНТЕРНЕТУ) — шукаємо в кеші
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Якщо користувач офлайн і намагається відкрити сторінку, яка ще ні разу не відкривалася
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
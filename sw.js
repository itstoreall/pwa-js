const staticCacheKey = 's-pwa-js';
const dynamicCacheKey = 'd-pwa-js';

const cacheSources = [
  'index.html',
  '/js/app.js',
  '/css/styles.css',
  'offline.html'
];

// ---

const cacheFirst = async req => {
  const cached = await caches.match(req);
  return cached ?? (await fetch(req));
};

const networkFirst = async req => {
  console.log('d!!!');

  const cache = await caches.open(dynamicCacheKey);

  try {
    const response = await fetch(req);
    await cache.put(req, response.clone());
    return response;
  } catch (e) {
    const cached = await cache.match(req);
    return cached ?? (await caches.match('/offline.html'));
  }
};

// ---

self.addEventListener('install', async event => {
  const cache = await caches.open(staticCacheKey);
  await cache.addAll(cacheSources);
});

self.addEventListener('activate', async event => {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter(name => name !== staticCacheKey)
      .filter(name => name !== dynamicCacheKey)
      .map(name => caches.delete(name))
  );
});

self.addEventListener('fetch', event => {
  const { request: req } = event;

  !req.url.includes('chrome-extension') && console.log('request:', req.url);

  // event.respondWith(cacheFirst(request));

  const url = new URL(req.url);

  // console.log('url.origin:', url.origin);
  // console.log('location.origin:', location.origin);

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(req));
  } else {
    event.respondWith(networkFirst(req));
  }
});

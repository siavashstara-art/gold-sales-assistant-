/**
 * TalaYar Global VIP — Service Worker Gold & Silver Rates Caching Strategy
 * Implements Network-First with Offline Cache Fallback + Offline POST Mutation Sync
 * Cache Name: talayar-gold-rates-cache-v1
 */

const GOLD_RATES_CACHE_NAME = 'talayar-gold-rates-cache-v1';
const RATES_API_PATH = '/api/rates';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
    })()
  );
});

/**
 * Helper: Store a gold rates JSON object inside the Service Worker Cache Storage
 */
async function putRatesInSwCache(ratesData) {
  try {
    const cache = await caches.open(GOLD_RATES_CACHE_NAME);
    const payload = {
      ...ratesData,
      _swCachedAt: new Date().toISOString(),
    };
    const response = new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-TalaYar-Cache': 'HIT-SW-CACHE',
        'Cache-Control': 'no-cache',
      },
    });
    await cache.put(new Request(RATES_API_PATH, { method: 'GET' }), response);
  } catch (err) {
    // Ignore storage quota errors in restricted environments
  }
}

/**
 * Helper: Read the last known gold rates JSON response from Service Worker Cache Storage
 */
async function getRatesFromSwCache() {
  try {
    const cache = await caches.open(GOLD_RATES_CACHE_NAME);
    const cachedResponse = await cache.match(new Request(RATES_API_PATH, { method: 'GET' }));
    if (cachedResponse) {
      const data = await cachedResponse.clone().json();
      return new Response(
        JSON.stringify({
          ...data,
          _servedFromOfflineSw: true,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-TalaYar-Cache': 'OFFLINE-SW-FALLBACK',
          },
        }
      );
    }
  } catch (err) {
    // Fallback below
  }
  return null;
}

/**
 * Fetch Event Strategy for /api/rates and /api/rates/tick:
 * 1. GET /api/rates -> Network-First (3.5s timeout). On success, updates SW cache.
 *    On network failure / offline, serves last known gold rates from SW cache.
 * 2. POST /api/rates or /api/rates/tick -> Tries network first and updates SW cache with new rates.
 *    If device is offline during POST /api/rates, merges changes into cached rates and returns 200 OK.
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Handle GET /api/rates with Network-First + SW Cache Fallback
  if (url.pathname === RATES_API_PATH && request.method === 'GET') {
    event.respondWith(
      (async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const networkResponse = await fetch(request, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (networkResponse && networkResponse.ok) {
            const cloned = networkResponse.clone();
            try {
              const jsonData = await cloned.json();
              if (jsonData && jsonData.gram18kToman) {
                await putRatesInSwCache(jsonData);
              }
            } catch {}
            return networkResponse;
          }
        } catch {
          // Network unreachable or timed out -> serve last known gold rates from SW cache
        }

        const cachedRatesResponse = await getRatesFromSwCache();
        if (cachedRatesResponse) {
          return cachedRatesResponse;
        }

        return new Response(
          JSON.stringify({
            error: 'OFFLINE_NO_CACHE',
            message: 'Offline and no cached rates in SW yet.',
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })()
    );
    return;
  }

  // Handle POST /api/rates or POST /api/rates/tick to keep SW cache updated even when offline
  if (
    (url.pathname === RATES_API_PATH || url.pathname === '/api/rates/tick') &&
    request.method === 'POST'
  ) {
    event.respondWith(
      (async () => {
        let bodyData = {};
        try {
          bodyData = await request.clone().json();
        } catch {}

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            const cloned = networkResponse.clone();
            try {
              const updatedRates = await cloned.json();
              if (updatedRates && updatedRates.gram18kToman) {
                await putRatesInSwCache(updatedRates);
              }
            } catch {}
            return networkResponse;
          }
        } catch {
          // Device is offline while updating rates -> merge with cached rates in SW
          const cachedResp = await getRatesFromSwCache();
          if (cachedResp) {
            const existing = await cachedResp.json();
            const merged = {
              ...existing,
              ...bodyData,
              updatedAt: new Date().toISOString(),
              _servedFromOfflineSw: true,
            };
            await putRatesInSwCache(merged);
            return new Response(JSON.stringify(merged), {
              status: 200,
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'X-TalaYar-Cache': 'OFFLINE-SW-MUTATION',
              },
            });
          }
        }

        return fetch(request);
      })()
    );
  }
});

/**
 * Listen for proactive rate caching messages from the React application
 */
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (data.type === 'CACHE_GOLD_RATES' && data.payload) {
    event.waitUntil(putRatesInSwCache(data.payload));
  }
});

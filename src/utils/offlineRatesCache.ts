import { MarketRatesState } from '../types/gold';

export const GOLD_RATES_CACHE_NAME = 'talayar-gold-rates-cache-v1';
export const GOLD_RATES_STORAGE_KEY = 'talayar_last_known_gold_rates_v1';
const RATES_API_PATH = '/api/rates';

/**
 * Registers the Service Worker strategy for caching gold & silver rates offline.
 */
export async function registerGoldRatesServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw-rates-strategy.js', {
      scope: '/',
    });

    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  } catch {
    // Service worker may already be handled by Workbox in production build
  }
}

/**
 * Persists the latest gold & silver rates into:
 * 1) Browser Cache Storage API ('talayar-gold-rates-cache-v1') for Service Worker offline serving
 * 2) Active Service Worker via postMessage('CACHE_GOLD_RATES')
 * 3) localStorage ('talayar_last_known_gold_rates_v1') as synchronous instant fallback
 */
export async function saveRatesToOfflineCache(rates: MarketRatesState): Promise<void> {
  if (typeof window === 'undefined') return;

  const enrichedRates: MarketRatesState = {
    ...rates,
    updatedAt: rates.updatedAt || new Date().toISOString(),
  };

  // 1. Synchronous localStorage backup
  try {
    localStorage.setItem(GOLD_RATES_STORAGE_KEY, JSON.stringify(enrichedRates));
  } catch {}

  // 2. Cache Storage API (shared with Service Worker)
  if ('caches' in window) {
    try {
      const cache = await caches.open(GOLD_RATES_CACHE_NAME);
      const response = new Response(JSON.stringify(enrichedRates), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-TalaYar-Cache': 'CLIENT-SYNCED-SW-CACHE',
        },
      });
      await cache.put(new Request(RATES_API_PATH, { method: 'GET' }), response);
    } catch {}
  }

  // 3. Notify active Service Worker controller
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_GOLD_RATES',
        payload: enrichedRates,
      });
    } catch {}
  }
}

/**
 * Reads the last known gold rates from the Service Worker Cache Storage or localStorage
 * when the device is offline or initializing.
 */
export async function loadLastKnownRatesFromCache(): Promise<MarketRatesState | null> {
  if (typeof window === 'undefined') return null;

  // 1. Try Service Worker Cache Storage first
  if ('caches' in window) {
    try {
      const cache = await caches.open(GOLD_RATES_CACHE_NAME);
      const match = await cache.match(new Request(RATES_API_PATH, { method: 'GET' }));
      if (match) {
        const data = await match.json();
        if (data && typeof data.gram18kToman === 'number') {
          return data as MarketRatesState;
        }
      }
    } catch {}
  }

  // 2. Fallback to localStorage snapshot
  try {
    const raw = localStorage.getItem(GOLD_RATES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.gram18kToman === 'number') {
        return parsed as MarketRatesState;
      }
    }
  } catch {}

  return null;
}

/**
 * Synchronous read for initial React state hydration before network completes
 */
export function getInitialCachedRatesSync(fallback: MarketRatesState): MarketRatesState {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(GOLD_RATES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.gram18kToman === 'number') {
        return { ...fallback, ...parsed };
      }
    }
  } catch {}
  return fallback;
}

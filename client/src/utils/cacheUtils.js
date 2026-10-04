// Client-side in-memory & localStorage cache utility for instantaneous rendering (SWR pattern)

const memoryStore = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function getCachedData(key) {
  // 1. Check in-memory first (0ms)
  const memItem = memoryStore.get(key);
  if (memItem && Date.now() - memItem.timestamp < memItem.ttl) {
    return memItem.data;
  }

  // 2. Check localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(`nv_cache_${key}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp < parsed.ttl) {
          // Sync to memory store
          memoryStore.set(key, parsed);
          return parsed.data;
        }
      }
    } catch (e) {
      // Storage access or parse error
    }
  }

  return null;
}

export function setCachedData(key, data, ttl = DEFAULT_TTL_MS) {
  const item = { data, timestamp: Date.now(), ttl };
  // Save in memory
  memoryStore.set(key, item);

  // Save in localStorage for instant render on refresh
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(`nv_cache_${key}`, JSON.stringify(item));
    } catch (e) {
      // Quota exceeded or private browsing
    }
  }
}

export function removeCachedData(key) {
  memoryStore.delete(key);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(`nv_cache_${key}`);
    } catch (e) {}
  }
}

export function clearAllNotesCache() {
  memoryStore.clear();
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('nv_cache_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }
}

export function createCache(ttlSeconds) {
  const cache = new Map();

  return {
    get(key) {
      const item = cache.get(key);
      if (!item) return null;

      if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
      }

      return item.value;
    },
    set(key, value, customTtl) {
      const expiry = Date.now() + (customTtl || ttlSeconds) * 1000;
      cache.set(key, { value, expiry });
    },
    invalidate(key) {
      cache.delete(key);
    },
    clear() {
      cache.clear();
    },
    persist(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    retrieve(key) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  };
}

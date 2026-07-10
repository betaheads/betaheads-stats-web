// Wraps an async function with an in-memory cache so heavy aggregate
// queries hit the database at most once per TTL window per key.
// Concurrent calls for the same key share one in-flight promise.
function cachedByKey(ttlMs, fn) {
  const entries = new Map();

  return async function (...args) {
    const key = args.length > 0 ? String(args[0]) : '';
    const now = Date.now();

    const entry = entries.get(key);

    if (entry?.value !== undefined && now < entry.expiresAt) {
      return entry.value;
    }

    if (entry?.pending) {
      return entry.pending;
    }

    const pending = Promise.resolve(fn(...args)).then(
      (value) => {
        entries.set(key, { value, expiresAt: Date.now() + ttlMs });
        return value;
      },
      (error) => {
        entries.delete(key);
        throw error;
      }
    );

    entries.set(key, { ...entry, pending });

    return pending;
  };
}

module.exports = { cachedByKey };

const UA = 'Mozilla/5.0 (compatible; ExposingPoliticiansBot/1.0; +https://github.com/aditya-saini3/exposingpoliticians)';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchText(url, { retries = 3 } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt >= retries) throw new Error(`${url}: ${err.message}`);
      await sleep(2000 * 2 ** (attempt - 1));
    }
  }
}

/** Runs `fn` over items with limited concurrency and a delay between calls. */
export async function mapLimit(items, limit, delayMs, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
      await sleep(delayMs);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

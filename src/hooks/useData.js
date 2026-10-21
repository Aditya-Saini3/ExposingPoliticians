import { useEffect, useState } from 'react';

// Data lives in /public/data and is refreshed by the scheduled GitHub Action,
// so it is fetched at runtime rather than bundled.
const cache = new Map();

export function useJson(path, { optional = false } = {}) {
  const [state, setState] = useState(() => ({ data: cache.get(path), error: null, loading: !cache.has(path) }));

  useEffect(() => {
    if (cache.has(path)) return setState({ data: cache.get(path), error: null, loading: false });
    let live = true;
    setState({ data: undefined, error: null, loading: true });
    fetch(`${import.meta.env.BASE_URL}data/${path}`, { cache: 'no-cache' })
      .then((r) => {
        if (r.ok) return r.json();
        if (optional && r.status === 404) return null;
        throw new Error(`Could not load ${path} (${r.status})`);
      })
      .then((data) => {
        cache.set(path, data);
        if (live) setState({ data, error: null, loading: false });
      })
      .catch((error) => live && setState({ data: undefined, error: error.message, loading: false }));
    return () => { live = false; };
  }, [path, optional]);

  return state;
}

export const usePoliticians = () => useJson('politicians.json');
export const useHeadlines = () => useJson('headlines.json', { optional: true });
export const useNews = (id) => useJson(`news/${id}.json`, { optional: true });

import { useCallback, useEffect, useRef, useState } from 'react';
import api, { fail } from './api';

// Loads one page at a time from a paged admin endpoint. Search is debounced; any filter change returns to page 1.
export default function usePaged(endpoint, { q = '', limit = 20, ...filters } = {}) {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 }); const [page, setPage] = useState(1); const [loading, setLoading] = useState(true); const [dq, setDq] = useState(q);
  const seq = useRef(0); const fkey = JSON.stringify(filters);
  useEffect(() => { const id = setTimeout(() => setDq(q), 350); return () => clearTimeout(id); }, [q]);
  useEffect(() => { setPage(1); }, [dq, fkey]);
  const load = useCallback(() => {
    const my = ++seq.current; setLoading(true);
    const p = new URLSearchParams({ page, limit }); if (dq) p.set('q', dq); Object.entries(filters).forEach(([k, v]) => v && p.set(k, v));
    return api.get(`${endpoint}?${p}`).then((r) => { if (my === seq.current) { const d = r.data; setData(Array.isArray(d) ? { items: d, total: d.length, page: 1, pages: 1 } : { items: [], total: 0, page: 1, pages: 1, ...d, items: Array.isArray(d?.items) ? d.items : [] }); } }).catch(fail).finally(() => { if (my === seq.current) setLoading(false); });
  }, [endpoint, page, dq, fkey, limit]); // eslint-disable-line
  useEffect(() => { load(); }, [load]);
  return { ...data, limit, loading, setPage, reload: load };
}

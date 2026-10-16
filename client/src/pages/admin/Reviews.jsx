import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import api, { fail } from '../../api';
import Pager from '../../components/Pager';
import usePaged from '../../usePaged';

export default function Reviews() {
  const [s, setS] = useState(''); const pg = usePaged('/admin/reviews', { q: s, limit: 15 });
  const act = async (fn) => { try { await fn(); pg.reload(); } catch (e) { fail(e); } };
  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm"><FiSearch className="absolute left-3.5 top-3.5 text-slate-400" /><input className="input pl-10" placeholder="Search product / user / comment" value={s} onChange={(e) => setS(e.target.value)} /></div>
      <div className="space-y-3">
        {pg.items.map((r) => <div key={r.id} className="card flex items-center justify-between gap-4 p-3 text-sm"><div><b>{r.product}</b> — {r.user_name} <span className="text-amber-500">{'★'.repeat(r.rating)}</span><p>{r.comment}</p></div>
          <div className="space-x-3"><button className="text-brand-600" onClick={() => act(() => api.put(`/admin/reviews/${r.id}`, { is_approved: r.is_approved ? 0 : 1 }))}>{r.is_approved ? 'Hide' : 'Approve'}</button>
            <button className="text-red-500" onClick={() => act(() => api.delete(`/admin/reviews/${r.id}`))}>Delete</button></div></div>)}
        {!pg.loading && pg.items.length === 0 && <p className="card p-10 text-center text-sm text-slate-400">No reviews</p>}</div>
      <div className="card overflow-hidden"><Pager page={pg.page} pages={pg.pages} total={pg.total} limit={pg.limit} onPage={pg.setPage} /></div>
    </div>
  );
}

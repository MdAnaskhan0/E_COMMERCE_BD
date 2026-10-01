import { useEffect, useState } from 'react';
import api from '../../api';

export default function Reviews() {
  const [rows, setRows] = useState([]); const load = () => api.get('/admin/reviews').then((r) => setRows(r.data)); useEffect(() => { load(); }, []);
  return (
    <div className="space-y-3">
      {rows.map((r) => <div key={r.id} className="card flex items-center justify-between gap-4 p-3 text-sm"><div><b>{r.product}</b> — {r.user_name} <span className="text-amber-500">{'★'.repeat(r.rating)}</span><p>{r.comment}</p></div>
        <div className="space-x-3"><button className="text-brand-600" onClick={async () => { await api.put(`/admin/reviews/${r.id}`, { is_approved: r.is_approved ? 0 : 1 }); load(); }}>{r.is_approved ? 'Hide' : 'Approve'}</button>
          <button className="text-red-500" onClick={async () => { await api.delete(`/admin/reviews/${r.id}`); load(); }}>Delete</button></div></div>)}</div>
  );
}

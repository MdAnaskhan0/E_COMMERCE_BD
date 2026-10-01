import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiPhone, FiMapPin, FiCreditCard } from 'react-icons/fi';
import api, { fail } from '../../api';
import Badge from '../../components/Badge';

const ST = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
export default function Orders() {
  const [rows, setRows] = useState([]); const [flt, setFlt] = useState('');
  const load = () => api.get(`/admin/orders${flt ? `?status=${flt}` : ''}`).then((r) => setRows(r.data)).catch(fail);
  useEffect(() => { load(); }, [flt]);
  const upd = async (o, patch) => { try { await api.put(`/admin/orders/${o.id}`, { status: o.status, payment_status: o.payment_status, ...patch }); toast.success('Order updated'); load(); } catch (e) { fail(e); } };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">{['', ...ST].map((s) => <button key={s} onClick={() => setFlt(s)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${flt === s ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>{s || 'All'}</button>)}</div>
      {rows.length === 0 && <div className="card p-12 text-center text-slate-400">No orders</div>}
      {rows.map((o) => (
        <div key={o.id} className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3"><b className="text-base">{o.order_no}</b><Badge s={o.status} /><Badge s={o.payment_status} /></div>
            <div className="text-right"><p className="text-lg font-extrabold text-brand-600">৳{o.total}</p><p className="text-xs text-slate-500">{new Date(o.created_at).toLocaleString()}</p></div>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
            <p><b className="text-slate-800">{o.customer_name}</b><br /><FiPhone className="mr-1 inline" />{o.customer_phone}</p>
            <p><FiMapPin className="mr-1 inline" />{o.address_line}, {o.city}</p>
            <p><FiCreditCard className="mr-1 inline" />{o.payment_method.toUpperCase()}{o.payment_trx_id && ` · ${o.payment_trx_id}`}{o.coupon_code && ` · ${o.coupon_code}`}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">{o.items.map((i, k) => <span key={k} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium">{i.product_name} × {i.quantity}</span>)}</div>
          <div className="mt-4 flex flex-wrap gap-3 border-t pt-4">
            <select className="input !w-44" value={o.status} onChange={(e) => upd(o, { status: e.target.value })}>{ST.map((s) => <option key={s}>{s}</option>)}</select>
            <select className="input !w-36" value={o.payment_status} onChange={(e) => upd(o, { payment_status: e.target.value })}>{['unpaid', 'paid', 'refunded'].map((s) => <option key={s}>{s}</option>)}</select>
          </div>
        </div>))}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiClock, FiDollarSign, FiUsers, FiBox, FiAlertTriangle } from 'react-icons/fi';
import api from '../../api';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/admin/stats').then((r) => setS(r.data)); }, []);
  if (!s) return <Spinner />;
  const max = Math.max(1, ...s.sales.map((x) => +x.t));
  const cards = [['Total Orders', s.orders, FiShoppingBag, 'from-indigo-500 to-violet-500'], ['Pending', s.pending, FiClock, 'from-amber-400 to-orange-500'], ['Revenue', '৳' + Number(s.revenue).toLocaleString(), FiDollarSign, 'from-emerald-500 to-teal-500'],
    ['Customers', s.customers, FiUsers, 'from-sky-500 to-blue-600'], ['Products', s.products, FiBox, 'from-pink-500 to-rose-500']];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([l, v, I, g], i) => <motion.div key={l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card flex items-center gap-4 p-5">
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-xl text-white shadow-lg ${g}`}><I /></span>
          <div><p className="text-xs font-semibold text-slate-500">{l}</p><p className="text-2xl font-extrabold">{v}</p></div></motion.div>)}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2"><h3 className="mb-6 font-bold">Sales — last 7 days</h3>
          {s.sales.length === 0 ? <p className="py-12 text-center text-sm text-slate-400">No sales yet</p> :
            <div className="flex h-52 items-end gap-3">{s.sales.map((x, i) => <div key={x.d} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">৳{Number(x.t).toLocaleString()}</span>
              <motion.div initial={{ height: 0 }} animate={{ height: `${(x.t / max) * 100}%` }} transition={{ delay: i * 0.08, duration: 0.6 }} className="w-full rounded-t-xl bg-gradient-to-t from-brand-600 to-violet-400" />
              <span className="text-[11px] text-slate-500">{x.d}</span></div>)}</div>}</div>
        <div className="card p-6"><h3 className="mb-4 flex items-center gap-2 font-bold"><FiAlertTriangle className="text-amber-500" />Low stock</h3>
          {s.lowStock.length === 0 && <p className="text-sm text-slate-400">All good 👍</p>}
          {s.lowStock.map((p) => <div key={p.id} className="flex items-center justify-between border-b border-slate-100 py-2.5 text-sm"><span className="truncate pr-2">{p.name_en}</span><Badge s={p.stock === 0 ? 'cancelled' : 'pending'}>{p.stock} left</Badge></div>)}</div>
      </div>
      <div className="card overflow-hidden"><h3 className="p-6 pb-3 font-bold">Recent orders</h3><div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>{s.recent.map((o) => <tr key={o.order_no}><td className="font-semibold">{o.order_no}</td><td>{o.customer_name}</td><td>৳{o.total}</td><td><Badge s={o.status} /></td><td className="text-slate-500">{new Date(o.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div></div>
    </div>
  );
}

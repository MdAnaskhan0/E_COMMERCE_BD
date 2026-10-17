import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiClock, FiDollarSign, FiUsers, FiBox, FiAlertTriangle, FiTrendingUp, FiCalendar, FiCreditCard, FiAward } from 'react-icons/fi';
import api, { fail } from '../../api';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';

const tk = (n) => '৳' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
const short = (n) => (n >= 1e7 ? (n / 1e7).toFixed(1) + 'Cr' : n >= 1e5 ? (n / 1e5).toFixed(1) + 'L' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(Math.round(n)));
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const label = (k, range) => (range === 'day' ? `${+k.slice(8)} ${MON[+k.slice(5, 7) - 1]}` : range === 'month' ? `${MON[+k.slice(5, 7) - 1]} ${k.slice(2, 4)}` : k);
const STATUS_COLOR = { pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6', shipped: '#06b6d4', delivered: '#10b981', cancelled: '#ef4444' };
const PAY_COLOR = { cod: '#64748b', bkash: '#e2136e', nagad: '#f97316' };

// ----- charts (module level so they never remount) -----
function BarChart({ data, range }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...data.map((d) => d.t)), H = 220, W = 720, pad = { l: 44, r: 8, t: 12, b: 28 }, iw = W - pad.l - pad.r, ih = H - pad.t - pad.b, bw = iw / data.length;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Sales bar chart">
        <defs><linearGradient id="bar" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#4f46e5" /><stop offset="1" stopColor="#a78bfa" /></linearGradient></defs>
        {ticks.map((t) => <g key={t}><line x1={pad.l} x2={W - pad.r} y1={pad.t + ih * (1 - t)} y2={pad.t + ih * (1 - t)} stroke="#e2e8f0" strokeDasharray={t ? '3 4' : ''} /><text x={pad.l - 6} y={pad.t + ih * (1 - t) + 3} textAnchor="end" fontSize="10" fill="#94a3b8">{short(max * t)}</text></g>)}
        {data.map((d, i) => { const h = (d.t / max) * ih, x = pad.l + i * bw + bw * 0.15, w = bw * 0.7; return (
          <g key={d.k} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={pad.l + i * bw} y={pad.t} width={bw} height={ih} fill="transparent" />
            <motion.rect initial={{ height: 0, y: pad.t + ih }} animate={{ height: Math.max(h, d.t ? 2 : 0), y: pad.t + ih - Math.max(h, d.t ? 2 : 0) }} transition={{ delay: i * 0.015, duration: 0.5 }} x={x} width={w} rx="3" fill={hover === i ? '#4338ca' : 'url(#bar)'} />
            {(data.length <= 12 || i % Math.ceil(data.length / 10) === 0) && <text x={x + w / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#64748b">{label(d.k, range)}</text>}</g>); })}
      </svg>
      {hover !== null && <div className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-xl" style={{ left: `${((pad.l + hover * bw + bw / 2) / W) * 100}%` }}><b>{label(data[hover].k, range)}</b><br />{tk(data[hover].t)} · {data[hover].c} orders</div>}
    </div>
  );
}
function Donut({ parts, colors, center }) {
  const total = parts.reduce((a, p) => a + p.c, 0) || 1; let acc = 0; const R = 52, C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 140 140" className="mx-auto h-40 w-40 -rotate-90">
      <circle cx="70" cy="70" r={R} fill="none" stroke="#f1f5f9" strokeWidth="18" />
      {parts.map((p) => { const len = (p.c / total) * C, el = <circle key={p.k} cx="70" cy="70" r={R} fill="none" stroke={colors[p.k] || '#94a3b8'} strokeWidth="18" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc}><title>{`${p.k}: ${p.c}`}</title></circle>; acc += len; return el; })}
      <g className="rotate-90 origin-center"><text x="70" y="68" textAnchor="middle" fontSize="22" fontWeight="800" fill="#0f172a">{center}</text><text x="70" y="84" textAnchor="middle" fontSize="9" fill="#64748b">orders</text></g>
    </svg>
  );
}
const HBars = ({ rows, val, name, fmt, color = 'from-brand-600 to-violet-400' }) => { const max = Math.max(1, ...rows.map(val)); return (
  <div className="space-y-3">{rows.map((r, i) => <div key={i}><div className="mb-1 flex justify-between gap-2 text-xs"><span className="truncate font-medium text-slate-700">{name(r)}</span><b className="shrink-0">{fmt(r)}</b></div>
    <div className="h-2 overflow-hidden rounded-full bg-slate-100"><motion.div initial={{ width: 0 }} animate={{ width: `${(val(r) / max) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} className={`h-full rounded-full bg-gradient-to-r ${color}`} /></div></div>)}</div>); };
const Legend = ({ parts, colors }) => <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">{parts.map((p) => <span key={p.k} className="flex items-center gap-1.5 capitalize"><i className="h-2.5 w-2.5 rounded-full" style={{ background: colors[p.k] || '#94a3b8' }} />{p.k} <b>{p.c}</b></span>)}</div>;
const Empty = ({ children = 'No data yet' }) => <p className="py-10 text-center text-sm text-slate-400">{children}</p>;

export default function AdminDashboard() {
  const [s, setS] = useState(null); const [range, setRange] = useState('day');
  useEffect(() => { api.get(`/admin/stats?range=${range}`).then((r) => setS(r.data)).catch(fail); }, [range]);
  if (!s) return <Spinner />;
  const total = s.sales.reduce((a, x) => a + x.t, 0), cnt = s.sales.reduce((a, x) => a + x.c, 0), best = s.sales.reduce((a, x) => (x.t > a.t ? x : a), s.sales[0] || { t: 0, k: '' });
  const cards = [['Total Revenue', tk(s.revenue), FiDollarSign, 'from-emerald-500 to-teal-500'], ["Today's Sales", tk(s.today_revenue), FiTrendingUp, 'from-indigo-500 to-violet-500', `${s.today_orders} orders today`], ['This Month', tk(s.month_revenue), FiCalendar, 'from-sky-500 to-blue-600'],
    ['Unpaid Amount', tk(s.unpaid_total), FiCreditCard, 'from-rose-500 to-pink-500', `Paid: ${tk(s.paid_total)}`], ['Total Orders', s.orders, FiShoppingBag, 'from-violet-500 to-purple-600'], ['Pending Orders', s.pending, FiClock, 'from-amber-400 to-orange-500'],
    ['Customers', s.customers, FiUsers, 'from-cyan-500 to-sky-500'], ['Products', s.products, FiBox, 'from-pink-500 to-rose-500']];
  const RANGES = [['day', 'Daily · 30 days'], ['month', 'Monthly · 12 months'], ['year', 'Yearly · 5 years']];
  const periodWord = { day: 'last 30 days', month: 'last 12 months', year: 'last 5 years' }[range];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([l, v, I, g, sub], i) => <motion.div key={l} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card flex items-center gap-4 p-5">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl text-white shadow-lg ${g}`}><I /></span>
          <div className="min-w-0"><p className="text-xs font-semibold text-slate-500">{l}</p><p className="truncate text-2xl font-extrabold">{v}</p>{sub && <p className="text-[11px] text-slate-400">{sub}</p>}</div></motion.div>)}
      </div>

      <div className="card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Sales overview</h3><p className="text-xs text-slate-500">Revenue from non-cancelled orders · {periodWord}</p></div>
          <div className="flex rounded-full bg-slate-100 p-1">{RANGES.map(([k, l]) => <button key={k} onClick={() => setRange(k)} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${range === k ? 'bg-white text-brand-700 shadow' : 'text-slate-500 hover:text-slate-800'}`}>{l}</button>)}</div></div>
        <div className="mb-4 grid grid-cols-3 gap-3 text-center">{[['Sales', tk(total)], ['Orders', cnt], ['Average order', tk(cnt ? total / cnt : 0)]].map(([l, v]) => <div key={l} className="rounded-xl bg-slate-50 py-2.5"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{l}</p><p className="text-lg font-extrabold">{v}</p></div>)}</div>
        {total === 0 ? <Empty>No sales in this period</Empty> : <><BarChart data={s.sales} range={range} /><p className="mt-2 text-center text-xs text-slate-500">Best {range}: <b>{label(best.k, range)}</b> — {tk(best.t)}</p></>}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6"><h3 className="mb-2 font-bold">Orders by status</h3>{s.status.length === 0 ? <Empty /> : <><Donut parts={s.status} colors={STATUS_COLOR} center={s.orders} /><Legend parts={s.status} colors={STATUS_COLOR} /></>}</div>
        <div className="card p-6"><h3 className="mb-2 font-bold">Payment methods</h3>{s.payments.length === 0 ? <Empty /> : <><Donut parts={s.payments} colors={PAY_COLOR} center={s.payments.reduce((a, p) => a + p.c, 0)} /><Legend parts={s.payments} colors={PAY_COLOR} />
          <div className="mt-3 space-y-1 text-xs text-slate-600">{s.payments.map((p) => <div key={p.k} className="flex justify-between"><span className="uppercase">{p.k}</span><b>{tk(p.t)}</b></div>)}</div></>}</div>
        <div className="card p-6"><h3 className="mb-4 flex items-center gap-2 font-bold"><FiAlertTriangle className="text-amber-500" />Low stock</h3>
          {s.lowStock.length === 0 && <p className="text-sm text-slate-400">All good 👍</p>}
          {s.lowStock.map((p) => <Link to={`/admin/products/${p.id}`} key={p.id} className="flex items-center justify-between border-b border-slate-100 py-2.5 text-sm hover:text-brand-600"><span className="truncate pr-2">{p.name_en}</span><Badge s={p.stock === 0 ? 'cancelled' : 'pending'}>{p.stock} left</Badge></Link>)}</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6"><h3 className="mb-1 flex items-center gap-2 font-bold"><FiAward className="text-amber-500" />Top selling products</h3><p className="mb-4 text-xs text-slate-500">By quantity sold · {periodWord}</p>
          {s.topSold.length === 0 ? <Empty>No product sales in this period</Empty> : <HBars rows={s.topSold} val={(r) => +r.qty} name={(r) => r.name} fmt={(r) => `${r.qty} sold · ${tk(r.revenue)}`} color="from-amber-500 to-orange-400" />}</div>
        <div className="card p-6"><h3 className="mb-1 font-bold">Products by category</h3><p className="mb-4 text-xs text-slate-500">Number of products in each category</p>
          {s.byCat.length === 0 ? <Empty /> : <HBars rows={s.byCat} val={(r) => +r.products} name={(r) => r.name} fmt={(r) => `${r.products} products · ${r.stock} in stock`} color="from-emerald-500 to-teal-400" />}</div>
      </div>

      <div className="card overflow-hidden"><h3 className="p-6 pb-3 font-bold">Recent orders</h3><div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>{s.recent.map((o) => <tr key={o.order_no}><td className="font-semibold">{o.order_no}</td><td>{o.customer_name}</td><td>{tk(o.total)}</td><td><Badge s={o.status} /></td><td className="text-slate-500">{new Date(o.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div></div>
    </div>
  );
}

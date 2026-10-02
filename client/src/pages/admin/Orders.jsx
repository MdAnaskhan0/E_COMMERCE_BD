import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiChevronRight } from 'react-icons/fi';
import api, { fail } from '../../api';
import Badge from '../../components/Badge';

const ST = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
export default function Orders() {
  const nav = useNavigate(); const [rows, setRows] = useState([]); const [flt, setFlt] = useState(''); const [s, setS] = useState('');
  useEffect(() => { api.get(`/admin/orders${flt ? `?status=${flt}` : ''}`).then((r) => setRows(r.data)).catch(fail); }, [flt]);
  const list = rows.filter((o) => (o.order_no + o.customer_name + o.customer_phone).toLowerCase().includes(s.toLowerCase()));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">{['', ...ST].map((x) => <button key={x} onClick={() => setFlt(x)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${flt === x ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>{x || 'All'}</button>)}</div>
        <div className="relative w-full max-w-xs"><FiSearch className="absolute left-3.5 top-3.5 text-slate-400" /><input className="input pl-10" placeholder="Order no / name / phone" value={s} onChange={(e) => setS(e.target.value)} /></div>
      </div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="tbl">
        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th /></tr></thead>
        <tbody>{list.map((o) => (
          <tr key={o.id} onClick={() => nav(`/admin/orders/${o.id}`)} className="cursor-pointer">
            <td className="font-bold text-brand-600">{o.order_no}</td><td><b>{o.customer_name}</b><br /><span className="text-xs text-slate-500">{o.customer_phone}</span></td><td>{o.items}</td><td className="font-bold">৳{o.total}</td>
            <td><span className="mr-1 text-xs font-semibold uppercase">{o.payment_method}</span><Badge s={o.payment_status} /></td><td><Badge s={o.status} /></td>
            <td className="text-xs text-slate-500">{new Date(o.created_at).toLocaleString()}</td><td className="text-slate-400"><FiChevronRight /></td></tr>))}</tbody></table></div>
        {list.length === 0 && <p className="p-12 text-center text-sm text-slate-400">No orders</p>}</div>
    </div>
  );
}

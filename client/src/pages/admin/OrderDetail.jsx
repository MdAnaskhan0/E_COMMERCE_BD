import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPhone, FiMapPin, FiMail, FiUser, FiCreditCard, FiCopy, FiCheck, FiLock, FiSave, FiClock, FiAlertTriangle, FiPrinter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { fail } from '../../api';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';

const FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
export default function OrderDetail() {
  const { id } = useParams(); const [o, setO] = useState(null); const [status, setStatus] = useState(''); const [pay, setPay] = useState(''); const [busy, setBusy] = useState(false);
  const load = () => api.get(`/admin/orders/${id}`).then((r) => { setO(r.data); setStatus(r.data.status); setPay(r.data.payment_status); }).catch(fail);
  useEffect(() => { load(); }, [id]);
  if (!o) return <Spinner />;
  const cur = FLOW.indexOf(o.status); const final = o.status === 'delivered' || o.status === 'cancelled';
  // status can only go forward; cancel only before shipping
  const allowed = (s) => !final && (s === 'cancelled' ? o.status !== 'shipped' : FLOW.indexOf(s) >= cur);
  const dirty = status !== o.status || pay !== o.payment_status; const mobile = o.payment_method !== 'cod';
  const save = async () => { setBusy(true); try { await api.put(`/admin/orders/${id}`, { status, payment_status: pay }); toast.success('Order updated'); load(); } catch (e) { fail(e); } finally { setBusy(false); } };
  const Info = ({ I, children }) => <p className="flex items-start gap-2.5 text-sm"><I className="mt-0.5 shrink-0 text-slate-400" />{children}</p>;
  return (
    <div className="space-y-6">
      <Link to="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600"><FiArrowLeft />All orders</Link>
      <div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-extrabold">{o.order_no}</h2><Badge s={o.status} /><Badge s={o.payment_status} /><span className="ml-auto flex items-center gap-1.5 text-sm text-slate-500"><FiClock />{new Date(o.created_at).toLocaleString()}</span><Link to={`/admin/orders/${o.id}/invoice`} className="btn-ghost !py-2"><FiPrinter />Print invoice</Link></div>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="card grid gap-3 p-6 md:grid-cols-2"><h3 className="font-bold md:col-span-2">Customer & delivery</h3>
            <Info I={FiUser}><b>{o.customer_name}</b></Info><Info I={FiPhone}><a href={`tel:${o.customer_phone}`} className="text-brand-600">{o.customer_phone}</a></Info>
            {o.customer_email && <Info I={FiMail}>{o.customer_email}</Info>}<Info I={FiMapPin}>{o.address_line}, {o.city}</Info>
            {o.note && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 md:col-span-2"><b>Note:</b> {o.note}</p>}</div>
          <div className="card overflow-hidden"><h3 className="p-6 pb-3 font-bold">Items</h3><table className="tbl"><thead><tr><th>Product</th><th>Price</th><th>Qty</th><th className="text-right">Total</th></tr></thead>
            <tbody>{o.items.map((i, k) => <tr key={k}><td>{i.product_name}</td><td>৳{i.unit_price}</td><td>{i.quantity}</td><td className="text-right font-semibold">৳{i.line_total}</td></tr>)}</tbody></table>
            <div className="space-y-1 bg-slate-50 p-6 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>৳{o.subtotal}</span></div>{o.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount {o.coupon_code && `(${o.coupon_code})`}</span><span>-৳{o.discount}</span></div>}
              <div className="flex justify-between"><span>Shipping</span><span>৳{o.shipping_fee}</span></div><div className="flex justify-between border-t pt-2 text-lg font-extrabold"><span>Total</span><span className="text-brand-600">৳{o.total}</span></div></div></div>
          <div className="card p-6"><h3 className="mb-4 font-bold">Status history</h3><ol className="relative space-y-4 border-l-2 border-brand-100 pl-6">{o.history.map((h, k) => <li key={k} className="relative"><span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 ring-4 ring-white" /><Badge s={h.status} /><span className="ml-2 text-xs text-slate-500">{new Date(h.created_at).toLocaleString()}</span></li>)}</ol></div>
        </div>
        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <div className={`card p-6 ${mobile && o.payment_status === 'unpaid' ? 'ring-2 ring-amber-400' : ''}`}><h3 className="mb-3 flex items-center gap-2 font-bold"><FiCreditCard />Payment</h3>
            <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Method</span><b className="uppercase">{o.payment_method}</b></div>
            <div className="mt-1 flex items-center justify-between text-sm"><span className="text-slate-500">Amount</span><b>৳{o.total}</b></div>
            {mobile && <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-white"><p className="text-[11px] uppercase tracking-widest text-slate-400">Transaction ID</p>
              <div className="mt-1 flex items-center justify-between"><span className="font-mono text-xl font-bold tracking-widest">{o.payment_trx_id}</span><button onClick={() => { navigator.clipboard?.writeText(o.payment_trx_id); toast.success('Copied'); }} className="rounded-lg bg-white/10 p-2 hover:bg-white/20"><FiCopy /></button></div>
              <p className="mt-2 flex gap-1.5 text-[11px] text-slate-400"><FiAlertTriangle className="mt-0.5 shrink-0 text-amber-400" />Verify this ID & amount in your {o.payment_method} account, then mark as Paid.</p></div>}
            <label className="label mb-1 mt-4 block">Payment status</label>
            <div className="grid grid-cols-3 gap-2">{['unpaid', 'paid', 'refunded'].map((p) => <button key={p} onClick={() => setPay(p)} className={`rounded-xl border-2 py-2 text-xs font-bold capitalize transition ${pay === p ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>{p}</button>)}</div></div>
          <div className="card p-6"><h3 className="mb-3 font-bold">Order status</h3>
            {final && <p className="mb-3 flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-xs text-slate-600"><FiLock />This order is {o.status} and can no longer change status.</p>}
            <div className="space-y-2">{[...FLOW, 'cancelled'].map((s) => { const ok = allowed(s) || s === o.status; return (
              <button key={s} disabled={!ok} onClick={() => setStatus(s)} className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-2.5 text-sm font-semibold capitalize transition ${status === s ? 'border-brand-600 bg-brand-50 text-brand-700' : ok ? 'border-slate-200 hover:border-brand-500/50' : 'border-slate-100 text-slate-300'}`}>
                <span>{s}{s === o.status && <span className="ml-2 text-[10px] font-bold uppercase text-slate-400">current</span>}</span>{status === s ? <FiCheck /> : !ok && <FiLock size={13} />}</button>); })}</div>
            <p className="mt-3 text-[11px] text-slate-400">Status can only move forward. Cancelling is possible until the order is shipped (stock is restored).</p>
            <motion.button whileTap={{ scale: 0.97 }} disabled={!dirty || busy} onClick={save} className="btn-primary mt-4 w-full !py-3"><FiSave />{busy ? 'Saving…' : 'Save changes'}</motion.button></div>
        </div>
      </div>
    </div>
  );
}

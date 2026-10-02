import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiSearch, FiPackage, FiCheck } from 'react-icons/fi';
import api, { fail } from '../api';
import { useT } from '../i18n';
import Badge from '../components/Badge';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
export const OrderTimeline = ({ o }) => {
  const { st, money, t } = useT(); const idx = STEPS.indexOf(o.status);
  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs text-slate-500">{t('orderNo')}</p><b className="text-lg">{o.order_no}</b></div><div className="flex items-center gap-2"><Badge s={o.status}>{st(o.status)}</Badge><Badge s={o.payment_status} /><b className="ml-2 text-lg text-brand-600">{money(o.total)}</b></div></div>
      {o.status === 'cancelled' ? <p className="mt-6 rounded-xl bg-red-50 p-4 text-center font-semibold text-red-600">{st('cancelled')}</p> :
        <div className="relative mt-8 flex justify-between">
          <div className="absolute left-[10%] right-[10%] top-4 h-1 rounded bg-slate-200" /><motion.div initial={{ width: 0 }} animate={{ width: `${(idx / (STEPS.length - 1)) * 80}%` }} transition={{ duration: 0.8 }} className="absolute left-[10%] top-4 h-1 rounded bg-gradient-to-r from-brand-600 to-violet-600" />
          {STEPS.map((s, k) => (<div key={s} className="relative flex flex-1 flex-col items-center text-center text-xs">
            <span className={`z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white font-bold shadow ${k <= idx ? 'bg-gradient-to-br from-brand-600 to-violet-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{k <= idx ? <FiCheck /> : k + 1}</span>
            <span className={`mt-2 font-semibold ${k <= idx ? 'text-slate-800' : 'text-slate-400'}`}>{st(s)}</span></div>))}</div>}
      <ul className="mt-6 space-y-1 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{o.items.map((i, k) => <li key={k} className="flex justify-between"><span>{i.product_name} × {i.quantity}</span><span>{money(i.line_total)}</span></li>)}</ul>
    </div>
  );
};
export default function TrackOrder() {
  const { state } = useLocation(); const [sp] = useSearchParams(); const { t } = useT();
  const [no, setNo] = useState(state?.done?.order_no || sp.get('no') || ''); const [o, setO] = useState(null);
  const go = async (e, v = no) => { e?.preventDefault(); try { setO((await api.post('/orders/track', { order_no: v })).data); } catch (er) { setO(null); fail(er); } };
  useEffect(() => { if (no) go(null, no); }, []);
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {state?.done && <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 text-center text-white shadow-xl shadow-emerald-500/20">
        <FiCheckCircle className="mx-auto text-5xl" /><p className="mt-2 text-xl font-extrabold">{t('orderDone')}</p><p className="mt-1">{t('orderNo')}: <b className="rounded-lg bg-white/20 px-2 py-0.5 tracking-wider">{state.done.order_no}</b></p></motion.div>}
      <form onSubmit={go} className="card p-6"><div className="mb-4 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-xl text-brand-600"><FiPackage /></span><div><h2 className="text-lg font-extrabold">{t('track')}</h2><p className="text-xs text-slate-500">{t('trackHint')}</p></div></div>
        <div className="flex gap-2"><input required className="input !py-3 font-mono uppercase tracking-wider" placeholder="ORD-XXXXXXXX" value={no} onChange={(e) => setNo(e.target.value.trim())} /><button className="btn-primary !px-6"><FiSearch />{t('track')}</button></div></form>
      {o && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6"><OrderTimeline o={o} /></motion.div>}
    </div>
  );
}

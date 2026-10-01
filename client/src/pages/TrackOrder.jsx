import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import api, { fail } from '../api';
import { useT } from '../i18n';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
export const OrderTimeline = ({ o }) => {
  const { st, money } = useT(); const idx = STEPS.indexOf(o.status);
  return (
    <div className="card p-5">
      <div className="flex justify-between"><b>{o.order_no}</b><b>{money(o.total)}</b></div>
      {o.status === 'cancelled' ? <p className="mt-3 font-semibold text-red-500">{st('cancelled')}</p> :
        <div className="mt-4 flex justify-between">{STEPS.map((s, k) => (
          <div key={s} className="flex flex-1 flex-col items-center text-center text-xs"><div className={`flex h-8 w-8 items-center justify-center rounded-full ${k <= idx ? 'bg-brand-600 text-white' : 'bg-slate-200'}`}>{k <= idx ? '✓' : k + 1}</div><span className="mt-1">{st(s)}</span></div>))}</div>}
      <ul className="mt-4 space-y-0.5 text-sm text-slate-600">{o.items.map((i, k) => <li key={k}>{i.product_name} × {i.quantity}</li>)}</ul>
    </div>
  );
};
export default function TrackOrder() {
  const { state } = useLocation(); const { t } = useT();
  const [f, setF] = useState({ order_no: state?.done?.order_no || '', phone: state?.phone || '' }); const [o, setO] = useState(null);
  const go = async (e) => { e?.preventDefault(); try { setO((await api.post('/orders/track', f)).data); } catch (er) { fail(er); } };
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      {state?.done && <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card mb-6 border-green-300 bg-green-50 p-5 text-center">
        <FiCheckCircle className="mx-auto text-4xl text-green-600" /><p className="mt-2 font-bold">{t('orderDone')}</p><p>{t('orderNo')}: <b>{state.done.order_no}</b></p></motion.div>}
      <form onSubmit={go} className="card space-y-3 p-5"><h2 className="text-lg font-bold">{t('track')}</h2>
        <input required className="input" placeholder={t('orderNo')} value={f.order_no} onChange={(e) => setF({ ...f, order_no: e.target.value })} />
        <input required className="input" placeholder={t('phone')} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /><button className="btn-primary w-full">{t('track')}</button></form>
      {o && <div className="mt-6"><OrderTimeline o={o} /></div>}
    </div>
  );
}

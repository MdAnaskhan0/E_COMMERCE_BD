import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { FiTruck, FiCheck, FiCopy, FiX, FiLock, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { fail, img } from '../api';
import { clearCart, unitPrice, lineTotal } from '../store';
import { useT } from '../i18n';

const METHODS = {
  cod: { name: 'cod', color: 'from-emerald-500 to-teal-500', mark: <FiTruck /> },
  bkash: { name: 'bkashName', color: 'from-pink-600 to-rose-500', mark: 'bK', hex: '#e2136e', field: 'bkash_number', en: 'bKash' },
  nagad: { name: 'nagadName', color: 'from-orange-500 to-amber-500', mark: 'N', hex: '#f6921e', field: 'nagad_number', en: 'Nagad' },
};

export default function Checkout() {
  const { t, money, pick } = useT(); const d = useDispatch(); const nav = useNavigate();
  const items = useSelector((s) => s.cart.items); const user = useSelector((s) => s.auth.user); const shop = useSelector((s) => s.ui.shop);
  const [addrs, setAddrs] = useState([]); const [busy, setBusy] = useState(false); const [modal, setModal] = useState(false); const [trx, setTrx] = useState('');
  const [f, setF] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', address_line: '', city: '', note: '', payment_method: 'cod' });
  const [code, setCode] = useState(''); const [cp, setCp] = useState(null);
  const sub = items.reduce((a, i) => a + lineTotal(i), 0); const ship = Number(shop?.shipping_fee || 0); const total = Math.max(0, sub - (cp?.discount || 0)) + ship;
  const pickAddr = (a) => setF((p) => ({ ...p, name: a.full_name, phone: a.phone, address_line: a.address_line, city: a.city }));
  useEffect(() => { if (user) api.get('/auth/addresses').then((r) => { setAddrs(r.data); const a = r.data.find((x) => x.is_default) || r.data[0]; if (a) pickAddr(a); }); }, [user]);
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const apply = async () => { try { setCp((await api.post('/coupons/validate', { code, subtotal: sub })).data); toast.success('✓'); } catch (e) { setCp(null); fail(e); } };
  const place = async (trxId) => {
    setBusy(true);
    try {
      const { data } = await api.post('/orders', { ...f, items: items.map((i) => ({ product_id: i.id, qty: i.qty })), coupon: cp?.code, email: f.email || undefined, note: f.note || undefined, payment_trx_id: trxId || undefined });
      d(clearCart()); nav('/track', { state: { done: data } });
    } catch (er) { fail(er); } finally { setBusy(false); }
  };
  const submit = (e) => { e.preventDefault(); f.payment_method === 'cod' ? place() : setModal(true); };
  const M = METHODS[f.payment_method]; const number = M.field ? shop?.[M.field] : '';
  const copy = () => { navigator.clipboard?.writeText(number); toast.success(t('copied')); };
  if (!items.length) return <div className="py-24 text-center"><Link to="/shop" className="btn-primary">{t('shopNow')}</Link></div>;
  return (
    <>
      <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="card space-y-4 p-6">
            <h2 className="text-lg font-extrabold">{t('deliveryInfo')}</h2>
            {!user && <p className="rounded-xl bg-brand-50 p-3 text-sm">{t('guestInfo')} <Link to="/login" className="font-bold text-brand-600">{t('login')}</Link></p>}
            {addrs.length > 0 && <select className="input" onChange={(e) => pickAddr(addrs.find((a) => a.id === +e.target.value))}>{addrs.map((a) => <option key={a.id} value={a.id}>{a.label} — {a.address_line}</option>)}</select>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label mb-1 block">{t('name')}</label><input required minLength="2" className="input" value={f.name} onChange={on('name')} /></div>
              <div><label className="label mb-1 block">{t('phone')}</label><input required pattern="^(\+?88)?01[3-9]\d{8}$" title="01XXXXXXXXX" className="input" value={f.phone} onChange={on('phone')} /></div>
              <div><label className="label mb-1 block">{t('email')}</label><input type="email" className="input" value={f.email} onChange={on('email')} /></div>
              <div><label className="label mb-1 block">{t('city')}</label><input required className="input" value={f.city} onChange={on('city')} /></div>
            </div>
            <div><label className="label mb-1 block">{t('address')}</label><input required minLength="5" className="input" value={f.address_line} onChange={on('address_line')} /></div>
            <div><label className="label mb-1 block">{t('note')}</label><textarea className="input" rows="2" maxLength="500" value={f.note} onChange={on('note')} /></div>
          </div>
          <div className="card p-6"><h2 className="mb-4 text-lg font-extrabold">{t('payHow')}</h2>
            <div role="radiogroup" className="grid gap-3 sm:grid-cols-3">{Object.entries(METHODS).map(([k, m]) => { const sel = f.payment_method === k; return (
              <label key={k} className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition ${sel ? 'border-brand-600 bg-brand-50/60 shadow-lg shadow-brand-600/10' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="pay" className="sr-only" checked={sel} onChange={() => setF({ ...f, payment_method: k })} />
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black text-white ${m.color}`}>{m.mark}</span>
                <span className="leading-tight"><b className="block text-sm">{t(m.name)}</b><span className="text-[11px] text-slate-500">{k === 'cod' ? t('codS') : t('mobS')}</span></span>
                <span className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${sel ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'}`}>{sel && <FiCheck size={12} />}</span>
              </label>); })}</div></div>
        </div>
        <div className="card h-fit space-y-3 p-6 text-sm lg:sticky lg:top-28">
          <h2 className="text-lg font-extrabold">{t('orderSummary')}</h2>
          <div className="max-h-56 space-y-3 overflow-y-auto">{items.map((i) => <div key={i.id} className="flex items-center gap-3"><img src={img(i.image)} className="h-12 w-12 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-medium">{pick(i, 'name')}</p><p className="text-xs text-slate-500">{money(unitPrice(i))} × {i.qty}</p></div><b>{money(lineTotal(i))}</b></div>)}</div>
          <hr /><div className="flex gap-2"><input className="input" placeholder={t('coupon')} value={code} onChange={(e) => setCode(e.target.value)} /><button type="button" className="btn-ghost" onClick={apply}>{t('apply')}</button></div>
          <div className="flex justify-between"><span>{t('subtotal')}</span><span>{money(sub)}</span></div>
          {cp && <div className="flex justify-between text-emerald-600"><span>{t('discount')}</span><span>-{money(cp.discount)}</span></div>}
          <div className="flex justify-between"><span>{t('shipping')}</span><span>{money(ship)}</span></div>
          <div className="flex justify-between border-t pt-3 text-xl font-extrabold"><span>{t('total')}</span><span className="text-brand-600">{money(total)}</span></div>
          <button disabled={busy} className="btn-primary w-full !py-3.5 text-base"><FiLock />{t('placeOrder')}</button>
        </div>
      </form>
      <AnimatePresence>{modal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className={`relative bg-gradient-to-br p-6 text-white ${M.color}`}>
              <button type="button" onClick={() => setModal(false)} className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 hover:bg-white/30"><FiX /></button>
              <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black" style={{ color: M.hex }}>{M.mark}</span><h3 className="text-xl font-extrabold">{t(M.name)}</h3></div>
              <p className="mt-5 text-xs uppercase tracking-widest text-white/80">{t('amountToPay')}</p><p className="text-4xl font-extrabold">{money(total)}</p>
            </div>
            <div className="space-y-4 p-6">
              {number ? <div className="flex items-center justify-between rounded-2xl border-2 border-dashed p-4" style={{ borderColor: M.hex }}>
                <div><p className="text-xs text-slate-500">{t('sendMoney')}</p><p className="text-2xl font-extrabold tracking-wide">{number}</p></div>
                <button type="button" onClick={copy} className="rounded-xl p-3 text-white" style={{ background: M.hex }}><FiCopy /></button></div>
                : <p className="flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600"><FiAlertCircle className="mt-0.5 shrink-0" />{t('noPayNumber')}</p>}
              <ol className="space-y-1.5 text-xs text-slate-600">{['step1', 'step2', 'step3'].map((s, k) => <li key={s} className="flex gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold">{k + 1}</span>{t(s).replace('{m}', M.en)}</li>)}</ol>
              <form onSubmit={(e) => { e.preventDefault(); place(trx.trim()); }} className="space-y-3">
                <div><label className="label mb-1 block">{t('enterTrx')}</label><input required autoFocus pattern="[A-Za-z0-9]{6,20}" title="6-20 letters/numbers" className="input !py-3 font-mono uppercase tracking-widest" placeholder="8N7A6D5E4C" value={trx} onChange={(e) => setTrx(e.target.value.toUpperCase())} /><p className="mt-1 text-[11px] text-slate-500">{t('trxHelp')}</p></div>
                <div className="flex gap-3"><button type="button" className="btn-ghost flex-1" onClick={() => setModal(false)}>{t('cancel')}</button><button disabled={busy || !number} className="btn-primary flex-1">{busy ? '...' : t('confirmOrder')}</button></div>
              </form>
            </div>
          </motion.div></motion.div>)}</AnimatePresence>
    </>
  );
}

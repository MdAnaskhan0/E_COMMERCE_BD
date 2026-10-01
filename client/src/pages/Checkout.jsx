import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api, { fail } from '../api';
import { clearCart, unitPrice } from '../store';
import { useT } from '../i18n';

export default function Checkout() {
  const { t, money, pick } = useT(); const d = useDispatch(); const nav = useNavigate();
  const items = useSelector((s) => s.cart.items); const user = useSelector((s) => s.auth.user); const shop = useSelector((s) => s.ui.shop);
  const [addrs, setAddrs] = useState([]); const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', address_line: '', city: '', note: '', payment_method: 'cod', payment_trx_id: '' });
  const [code, setCode] = useState(''); const [cp, setCp] = useState(null);
  const sub = items.reduce((a, i) => a + unitPrice(i) * i.qty, 0);
  const ship = Number(shop?.shipping_fee || 0), total = Math.max(0, sub - (cp?.discount || 0)) + ship;
  useEffect(() => { if (user) api.get('/auth/addresses').then((r) => { setAddrs(r.data); const a = r.data.find((x) => x.is_default) || r.data[0]; if (a) pickAddr(a); }); }, [user]);
  const pickAddr = (a) => setF((p) => ({ ...p, name: a.full_name, phone: a.phone, address_line: a.address_line, city: a.city }));
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const apply = async () => { try { setCp((await api.post('/coupons/validate', { code, subtotal: sub })).data); toast.success('✓'); } catch (e) { setCp(null); fail(e); } };
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const { data } = await api.post('/orders', { ...f, items: items.map((i) => ({ product_id: i.id, qty: i.qty })), coupon: cp?.code, email: f.email || undefined, payment_trx_id: f.payment_trx_id || undefined, note: f.note || undefined });
      d(clearCart()); nav('/track', { state: { done: data, phone: f.phone } });
    } catch (er) { fail(er); } finally { setBusy(false); }
  };
  if (!items.length) return <div className="py-24 text-center"><Link to="/shop" className="btn-primary">{t('shopNow')}</Link></div>;
  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[1fr_360px]">
      <div className="card space-y-3 p-5">
        <h2 className="text-lg font-bold">{t('checkout')}</h2>
        {!user && <p className="rounded bg-brand-50 p-2 text-sm">{t('guestInfo')} <Link to="/login" className="font-semibold text-brand-600">{t('login')}</Link></p>}
        {addrs.length > 0 && <select className="input" onChange={(e) => pickAddr(addrs.find((a) => a.id === +e.target.value))}>{addrs.map((a) => <option key={a.id} value={a.id}>{a.label} — {a.address_line}</option>)}</select>}
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label">{t('name')}</label><input required minLength="2" className="input" value={f.name} onChange={on('name')} /></div>
          <div><label className="label">{t('phone')}</label><input required pattern="^(\+?88)?01[3-9]\d{8}$" title="01XXXXXXXXX" className="input" value={f.phone} onChange={on('phone')} /></div>
          <div><label className="label">{t('email')}</label><input type="email" className="input" value={f.email} onChange={on('email')} /></div>
          <div><label className="label">{t('city')}</label><input required className="input" value={f.city} onChange={on('city')} /></div>
        </div>
        <div><label className="label">{t('address')}</label><input required minLength="5" className="input" value={f.address_line} onChange={on('address_line')} /></div>
        <div><label className="label">{t('note')}</label><textarea className="input" rows="2" maxLength="500" value={f.note} onChange={on('note')} /></div>
        <div><label className="label">{t('payment')}</label>
          <select className="input" value={f.payment_method} onChange={on('payment_method')}><option value="cod">{t('cod')}</option><option value="bkash">bKash</option><option value="nagad">Nagad</option></select></div>
        {f.payment_method !== 'cod' && <div><label className="label">{t('trxId')}</label><input required className="input" value={f.payment_trx_id} onChange={on('payment_trx_id')} /></div>}
      </div>
      <div className="card h-fit space-y-2 p-5 text-sm">
        {items.map((i) => <div key={i.id} className="flex justify-between"><span>{pick(i, 'name')} × {i.qty}</span><span>{money(unitPrice(i) * i.qty)}</span></div>)}
        <hr /><div className="flex gap-2"><input className="input" placeholder={t('coupon')} value={code} onChange={(e) => setCode(e.target.value)} /><button type="button" className="btn-ghost" onClick={apply}>{t('apply')}</button></div>
        <div className="flex justify-between"><span>{t('subtotal')}</span><span>{money(sub)}</span></div>
        {cp && <div className="flex justify-between text-green-600"><span>{t('discount')}</span><span>-{money(cp.discount)}</span></div>}
        <div className="flex justify-between"><span>{t('shipping')}</span><span>{money(ship)}</span></div>
        <div className="flex justify-between text-lg font-bold"><span>{t('total')}</span><span>{money(total)}</span></div>
        <button disabled={busy} className="btn-primary w-full">{t('placeOrder')}</button>
      </div>
    </form>
  );
}

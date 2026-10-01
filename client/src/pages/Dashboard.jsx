import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiBox, FiMapPin, FiUser, FiHome } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { fail } from '../api';
import { setUser } from '../store';
import { useT } from '../i18n';
import { OrderTimeline } from './TrackOrder';

const blank = { label: 'Home', full_name: '', phone: '', address_line: '', city: '', is_default: false };
export default function Dashboard() {
  const { t, money } = useT(); const d = useDispatch(); const user = useSelector((s) => s.auth.user);
  const [tab, setTab] = useState('overview'); const [orders, setOrders] = useState([]); const [addrs, setAddrs] = useState([]);
  const [a, setA] = useState(blank); const [pf, setPf] = useState({ name: user.name, phone: user.phone, current_password: '', new_password: '' });
  const loadA = () => api.get('/auth/addresses').then((r) => setAddrs(r.data));
  useEffect(() => { api.get('/orders/my').then((r) => setOrders(r.data)); loadA(); }, []);
  const addAddr = async (e) => { e.preventDefault(); try { await api.post('/auth/addresses', a); setA(blank); loadA(); toast.success('✓'); } catch (er) { fail(er); } };
  const delAddr = async (id) => { await api.delete(`/auth/addresses/${id}`); loadA(); };
  const saveProfile = async (e) => { e.preventDefault(); try { const b = { name: pf.name, phone: pf.phone }; if (pf.new_password) { b.current_password = pf.current_password; b.new_password = pf.new_password; } const { data } = await api.put('/auth/me', b); d(setUser(data.user)); toast.success('✓'); } catch (er) { fail(er); } };
  const tabs = [['overview', FiHome, t('dashboard')], ['orders', FiBox, t('orders')], ['addresses', FiMapPin, t('addresses')], ['profile', FiUser, t('profile')]];
  const spent = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="card h-fit p-2">{tabs.map(([k, I, l]) => <button key={k} onClick={() => setTab(k)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${tab === k ? 'bg-brand-50 font-semibold text-brand-600' : ''}`}><I />{l}</button>)}</aside>
      <section className="space-y-4">
        {tab === 'overview' && <><h2 className="text-xl font-bold">{user.name}</h2><div className="grid gap-4 sm:grid-cols-3">
          {[[t('orders'), orders.length], [t('total'), money(spent)], [t('addresses'), addrs.length]].map(([l, v]) => <div key={l} className="card p-4"><p className="text-xs text-slate-500">{l}</p><p className="text-2xl font-bold text-brand-600">{v}</p></div>)}</div>
          {orders.slice(0, 2).map((o) => <OrderTimeline key={o.id} o={o} />)}</>}
        {tab === 'orders' && (orders.length ? orders.map((o) => <OrderTimeline key={o.id} o={o} />) : <p>{t('noResult')}</p>)}
        {tab === 'addresses' && <>{addrs.map((x) => <div key={x.id} className="card flex justify-between p-3 text-sm"><div><b>{x.label}</b>{x.is_default ? ' ★' : ''}<p>{x.full_name}, {x.phone}</p><p>{x.address_line}, {x.city}</p></div><button className="text-red-500" onClick={() => delAddr(x.id)}>{t('delete')}</button></div>)}
          <form onSubmit={addAddr} className="card grid gap-3 p-4 sm:grid-cols-2">
            {[['label', 'Label'], ['full_name', t('name')], ['phone', t('phone')], ['city', t('city')]].map(([k, l]) => <input key={k} required className="input" placeholder={l} value={a[k]} onChange={(e) => setA({ ...a, [k]: e.target.value })} />)}
            <input required className="input sm:col-span-2" placeholder={t('address')} value={a.address_line} onChange={(e) => setA({ ...a, address_line: e.target.value })} />
            <label className="text-sm"><input type="checkbox" checked={a.is_default} onChange={(e) => setA({ ...a, is_default: e.target.checked })} /> Default</label><button className="btn-primary">{t('add')}</button></form></>}
        {tab === 'profile' && <form onSubmit={saveProfile} className="card max-w-md space-y-3 p-5">
          <input className="input" value={pf.name} onChange={(e) => setPf({ ...pf, name: e.target.value })} /><input className="input" value={pf.phone} onChange={(e) => setPf({ ...pf, phone: e.target.value })} />
          <input type="password" className="input" placeholder="Current password" value={pf.current_password} onChange={(e) => setPf({ ...pf, current_password: e.target.value })} />
          <input type="password" className="input" placeholder="New password (optional)" value={pf.new_password} onChange={(e) => setPf({ ...pf, new_password: e.target.value })} /><button className="btn-primary">{t('save')}</button></form>}
      </section>
    </div>
  );
}

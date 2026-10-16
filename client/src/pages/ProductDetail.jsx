import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiShoppingCart, FiZap, FiTruck, FiShield, FiRefreshCw, FiMinus, FiPlus, FiChevronRight, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { img, fail } from '../api';
import { addItem } from '../store';
import { useT } from '../i18n';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import RichText from '../components/RichText';

const Stars = ({ n, size = 16 }) => <span className="flex text-amber-400">{[1, 2, 3, 4, 5].map((i) => <FiStar key={i} size={size} className={i <= Math.round(n) ? 'fill-current' : 'text-slate-300'} />)}</span>;

export default function ProductDetail() {
  const { id } = useParams(); const { t, pick, money } = useT(); const d = useDispatch(); const nav = useNavigate(); const user = useSelector((s) => s.auth.user);
  const [p, setP] = useState(null); const [i, setI] = useState(0); const [qty, setQty] = useState(1); const [tab, setTab] = useState('details'); const [zoom, setZoom] = useState(null); const [rel, setRel] = useState([]);
  const [rv, setRv] = useState({ rating: 5, comment: '' });
  const load = () => api.get(`/products/${id}`).then((r) => { setP(r.data); setI(0); setQty(1); api.get(`/products?category=${r.data.category_id}&limit=5`).then((x) => setRel(x.data.items.filter((y) => y.id !== r.data.id).slice(0, 4))); }).catch(fail);
  useEffect(() => { load(); window.scrollTo(0, 0); }, [id]);
  if (!p) return <Spinner />;
  const tiers = [...p.tiers].sort((a, b) => a.min_qty - b.min_qty); const active = [...tiers].reverse().find((x) => qty >= x.min_qty);
  const base = p.sale_price ?? p.price; const total = active ? (active.unit_price / active.min_qty) * qty : base * qty; const unit = total / qty; const save = p.price * qty - total; const avg = p.reviews.length ? p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length : 0;
  const add = (go) => { d(addItem({ p: { ...p, image: p.images[0]?.url }, qty })); toast.success(t('addedCart')); if (go) nav('/checkout'); };
  const submit = async () => { try { await api.post(`/products/${id}/reviews`, rv); toast.success('✓'); setRv({ rating: 5, comment: '' }); load(); } catch (e) { fail(e); } };
  const move = (e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`); };
  const tabs = [['details', t('details')], ['features', `${t('features')} (${p.features.length})`], ['reviews', `${t('reviews')} (${p.reviews.length})`]];
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-28 lg:pb-6">
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-slate-500"><Link to="/" className="hover:text-brand-600">{t('home')}</Link><FiChevronRight /><Link to={`/shop?category=${p.category_id}`} className="hover:text-brand-600">{pick({ name_en: p.cat_en, name_bn: p.cat_bn }, 'name')}</Link><FiChevronRight /><span className="truncate font-semibold text-slate-700">{pick(p, 'name')}</span></nav>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex gap-4 max-md:flex-col-reverse">
          <div className="flex gap-3 md:flex-col">{p.images.map((m, k) => <button key={m.id} onClick={() => setI(k)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${k === i ? 'border-brand-600 shadow-lg shadow-brand-600/20' : 'border-transparent opacity-70 hover:opacity-100'}`}><img src={m.url} className="h-full w-full object-cover" /></button>)}</div>
          <div className="card relative flex-1 cursor-zoom-in overflow-hidden" onMouseMove={move} onMouseLeave={() => setZoom(null)}>
            <AnimatePresence mode="wait"><motion.img key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} src={img(p.images[i]?.url)} alt="" className="aspect-square w-full object-cover transition-transform duration-200" style={{ transform: zoom ? 'scale(2)' : 'scale(1)', transformOrigin: zoom || 'center' }} /></AnimatePresence>
            {save > 0 && <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-3 py-1 text-sm font-bold text-white shadow-lg">-{Math.round((save / p.price) * 100)}%</span>}
          </div>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-brand-50 px-3 py-1 font-bold uppercase tracking-wide text-brand-600">{pick({ name_en: p.cat_en, name_bn: p.cat_bn }, 'name')}</span>{p.brand && <span className="text-slate-500">{t('brand')}: <b className="text-slate-700">{p.brand}</b></span>}</div>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight">{pick(p, 'name')}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm"><Stars n={avg} /><span className="text-slate-500">{avg ? avg.toFixed(1) : '—'} · {p.reviews.length} {t('reviews')}</span><span className={`ml-auto flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${p.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{p.stock > 0 && <FiCheck />}{p.stock > 0 ? `${t('inStock')} (${p.stock})` : t('outStock')}</span></div>
          <div className="mt-5 rounded-3xl bg-gradient-to-br from-brand-50 to-violet-50 p-5">
            <div className="flex flex-wrap items-baseline gap-3"><motion.span key={unit} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-4xl font-extrabold text-brand-700">{money(Math.round(unit * 100) / 100)}</motion.span><span className="text-sm text-slate-500">/ {p.unit}</span>
              {unit < p.price && <span className="text-lg text-slate-400 line-through">{money(p.price)}</span>}</div>
            {save > 0 && <p className="mt-1 text-sm font-semibold text-emerald-600">{t('savings')} {money(save)}</p>}
            {tiers.length > 0 && <div className="mt-4"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{t('bulk')}</p><div className="flex flex-wrap gap-2">
              <div className={`rounded-xl border-2 px-3 py-2 text-center text-xs transition ${!active ? 'border-brand-600 bg-white shadow' : 'border-transparent bg-white/60'}`}><b className="block text-sm">{money(base)}</b>1 {p.unit}</div>
              {tiers.map((x) => <button key={x.min_qty} onClick={() => setQty(Math.min(p.stock, x.min_qty))} className={`rounded-xl border-2 px-3 py-2 text-center text-xs transition ${active?.min_qty === x.min_qty ? 'border-brand-600 bg-white shadow' : 'border-transparent bg-white/60 hover:bg-white'}`}><b className="block text-sm">{money(x.unit_price)}</b>{x.min_qty} {p.unit}</button>)}</div></div>}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-2xl border-2 border-slate-200 bg-white"><button className="p-3.5 transition hover:text-brand-600" onClick={() => setQty(Math.max(1, qty - 1))}><FiMinus /></button><span className="w-12 text-center font-bold">{qty}</span><button className="p-3.5 transition hover:text-brand-600" onClick={() => setQty(Math.min(p.stock, qty + 1))}><FiPlus /></button></div>
            <button disabled={p.stock < 1} className="btn-ghost flex-1 !rounded-2xl !py-3.5" onClick={() => add(false)}><FiShoppingCart />{t('addCart')}</button>
            <button disabled={p.stock < 1} className="btn-primary flex-1 !rounded-2xl !py-3.5" onClick={() => add(true)}><FiZap />{t('buyNow')}</button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">{[[FiTruck, t('deliveryNote')], [FiShield, t('securePay')], [FiRefreshCw, t('easyReturn')]].map(([I, l], k) => <div key={k} className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 text-xs font-medium"><I className="shrink-0 text-lg text-brand-600" />{l}</div>)}</div>
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 text-sm sm:grid-cols-4">{[[t('sku'), p.sku], [t('unitW'), p.unit], [t('weightW'), p.weight], [t('sold'), p.sold_count]].map(([l, v]) => <div key={l} className="bg-white px-4 py-3"><p className="text-[11px] uppercase tracking-wide text-slate-400">{l}</p><p className="truncate font-bold">{v || '—'}</p></div>)}</div>
        </div>
      </div>
      <section className="card mt-10 overflow-hidden">
        <div className="flex gap-1 border-b bg-slate-50/70 px-4">{tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`relative px-5 py-4 text-sm font-bold transition ${tab === k ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800'}`}>{l}{tab === k && <motion.span layoutId="tab" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-600" />}</button>)}</div>
        <div className="p-6">
          {tab === 'details' && <RichText html={pick(p, 'description')} />}
          {tab === 'features' && (p.features.length === 0 ? '—' : <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200">{p.features.map((f, k) => <div key={k} className={`grid grid-cols-[38%_1fr] gap-4 px-5 py-3.5 text-sm ${k % 2 ? 'bg-slate-50/70' : 'bg-white'} ${k ? 'border-t border-slate-100' : ''}`}><span className="font-medium text-slate-500">{f.k}</span><b className="text-slate-900">{f.v}</b></div>)}</div>)}
          {tab === 'reviews' && <div className="grid gap-8 md:grid-cols-[1fr_340px]"><div>{p.reviews.length === 0 && <p className="text-slate-400">—</p>}
            {p.reviews.map((r) => <div key={r.id} className="flex gap-3 border-b border-slate-100 py-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-violet-600 font-bold text-white">{r.name[0]}</span><div><div className="flex items-center gap-2"><b className="text-sm">{r.name}</b><Stars n={r.rating} size={13} /></div><p className="mt-1 text-sm text-slate-600">{r.comment}</p></div></div>)}</div>
            <div className="h-fit rounded-2xl bg-slate-50 p-5"><h4 className="mb-3 font-bold">{t('writeReview')}</h4>{user ? <div className="space-y-3">
              <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRv({ ...rv, rating: n })}><FiStar size={26} className={n <= rv.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} /></button>)}</div>
              <textarea className="input" rows="3" maxLength="1000" value={rv.comment} onChange={(e) => setRv({ ...rv, comment: e.target.value })} /><button className="btn-primary w-full" onClick={submit}>{t('submit')}</button></div>
              : <button className="btn-primary w-full" onClick={() => nav('/login')}>{t('login')}</button>}</div></div>}
        </div>
      </section>
      {rel.length > 0 && <section className="mt-14"><div className="section-title"><span>{t('related')}</span></div><div className="grid grid-cols-2 gap-5 md:grid-cols-4">{rel.map((x) => <ProductCard key={x.id} p={x} />)}</div></section>}

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="leading-tight"><p className="text-[11px] text-slate-500">{t('total')}</p><p className="text-lg font-extrabold text-brand-700">{money(total)}</p></div>
        <button disabled={p.stock < 1} className="btn-ghost flex-1 !rounded-2xl" onClick={() => add(false)}><FiShoppingCart />{t('addCart')}</button>
        <button disabled={p.stock < 1} className="btn-primary flex-1 !rounded-2xl" onClick={() => add(true)}><FiZap />{t('buyNow')}</button></div>
    </div>
  );
}

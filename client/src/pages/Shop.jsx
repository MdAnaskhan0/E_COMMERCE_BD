import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiGrid, FiChevronRight, FiX, FiSliders, FiCheck, FiSearch } from 'react-icons/fi';
import api from '../api';
import { useT } from '../i18n';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const { t, pick, money } = useT(); const [sp, setSp] = useSearchParams(); const [cats, setCats] = useState([]); const [data, setData] = useState(null); const [more, setMore] = useState(false); const seq = useRef(0); const [show, setShow] = useState(false);
  const [price, setPrice] = useState({ min: sp.get('min') || '', max: sp.get('max') || '' });
  const set = (obj) => { const n = new URLSearchParams(sp); Object.entries(obj).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); if (!('page' in obj)) n.delete('page'); setSp(n); };
  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)); }, []);
  const filterKey = (() => { const n = new URLSearchParams(sp); n.delete('page'); return n.toString(); })();
  const fetchPage = (page) => api.get(`/products?${filterKey}&page=${page}&limit=12`).then((r) => r.data);
  useEffect(() => { const my = ++seq.current; setData(null); setMore(false); fetchPage(1).then((d) => { if (my === seq.current) setData(d); }).catch(() => { if (my === seq.current) setData({ items: [], total: 0, page: 1, pages: 1, hasMore: false }); }); setPrice({ min: sp.get('min') || '', max: sp.get('max') || '' }); }, [filterKey]); // eslint-disable-line
  const loadMore = () => { if (more || !data?.hasMore) return; const my = seq.current; setMore(true); fetchPage(data.page + 1).then((d) => { if (my === seq.current) setData((o) => ({ ...d, items: [...o.items, ...d.items.filter((x) => !o.items.some((y) => y.id === x.id))] })); }).finally(() => { if (my === seq.current) setMore(false); }); };
  const cat = cats.find((c) => String(c.id) === sp.get('category')); const sub = cat?.subs.find((s) => String(s.id) === sp.get('sub'));
  const chips = [sp.get('q') && ['q', `“${sp.get('q')}”`], cat && ['category', pick(cat, 'name')], sub && ['sub', pick(sub, 'name')], (sp.get('min') || sp.get('max')) && ['price', `${money(sp.get('min') || 0)} – ${sp.get('max') ? money(sp.get('max')) : '∞'}`], sp.get('instock') && ['instock', t('inStockOnly')]].filter(Boolean);
  const clear = (k) => (k === 'price' ? set({ min: '', max: '' }) : k === 'category' ? set({ category: '', sub: '' }) : set({ [k]: '' }));
  const Side = (
    <div className="space-y-5">
      <div className="card overflow-hidden"><div className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-violet-600 px-5 py-3.5 font-bold text-white"><FiGrid />{t('categories')}</div>
        <div className="p-2">
          <button onClick={() => set({ category: '', sub: '' })} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${!cat ? 'bg-brand-50 font-bold text-brand-600' : 'hover:bg-slate-50'}`}>{t('all')}{!cat && <FiCheck />}</button>
          {cats.map((c) => { const act = String(c.id) === sp.get('category'); return (<div key={c.id}>
            <button onClick={() => set({ category: c.id, sub: '' })} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${act ? 'bg-brand-50 font-bold text-brand-600' : 'hover:bg-slate-50'}`}>{pick(c, 'name')}{c.subs.length > 0 && <FiChevronRight className={`transition ${act ? 'rotate-90' : ''}`} />}</button>
            <AnimatePresence>{act && c.subs.length > 0 && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="ml-4 overflow-hidden border-l-2 border-brand-100 pl-2">
              {c.subs.map((s) => <button key={s.id} onClick={() => set({ sub: String(s.id) === sp.get('sub') ? '' : s.id })} className={`block w-full rounded-lg px-3 py-2 text-left text-[13px] transition ${String(s.id) === sp.get('sub') ? 'font-bold text-brand-600' : 'text-slate-500 hover:text-brand-600'}`}>{pick(s, 'name')}</button>)}</motion.div>}</AnimatePresence></div>); })}
        </div></div>
      <div className="card p-5"><h4 className="mb-3 font-bold">{t('priceRange')}</h4>
        <div className="flex items-center gap-2"><input type="number" min="0" placeholder={t('min')} className="input !px-3" value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })} /><span className="text-slate-400">–</span><input type="number" min="0" placeholder={t('max')} className="input !px-3" value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })} /></div>
        <button className="btn-primary mt-3 w-full !py-2" onClick={() => set({ min: price.min, max: price.max })}>{t('apply')}</button></div>
      <label className="card flex cursor-pointer items-center justify-between p-5"><span className="font-semibold">{t('inStockOnly')}</span>
        <span className={`relative h-6 w-11 rounded-full transition ${sp.get('instock') ? 'bg-brand-600' : 'bg-slate-300'}`}><input type="checkbox" hidden checked={!!sp.get('instock')} onChange={(e) => set({ instock: e.target.checked ? '1' : '' })} /><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${sp.get('instock') ? 'left-[22px]' : 'left-0.5'}`} /></span></label>
    </div>);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold tracking-tight">{cat ? pick(cat, 'name') : t('shop')}</h1>{data && <p className="text-sm text-slate-500">{data.total} {t('productsWord')}</p>}</div>
        <div className="flex gap-2"><button className="btn-ghost lg:hidden" onClick={() => setShow(true)}><FiSliders />{t('filters')}</button>
          <select className="input !w-auto !rounded-full" value={sp.get('sort') || ''} onChange={(e) => set({ sort: e.target.value })}><option value="">{t('sortNew')}</option><option value="price_asc">{t('sortLow')}</option><option value="price_desc">{t('sortHigh')}</option></select></div>
      </div>
      {chips.length > 0 && <div className="mb-5 flex flex-wrap items-center gap-2">{chips.map(([k, l]) => <button key={k} onClick={() => clear(k)} className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100">{l}<FiX /></button>)}
        <button className="text-xs font-semibold text-red-500" onClick={() => setSp({})}>{t('clearAll')}</button></div>}
      <div className="grid gap-8 lg:grid-cols-[270px_1fr]">
        <aside className="hidden lg:block"><div className="sticky top-32">{Side}</div></aside>
        <div>
          {!data ? <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}</div>
            : data.items.length === 0 ? <div className="card py-24 text-center"><FiSearch className="mx-auto mb-3 text-5xl text-slate-300" /><p className="mb-4 text-slate-500">{t('noResult')}</p><button className="btn-primary" onClick={() => setSp({})}>{t('tryAgain')}</button></div>
            : (<><div className="grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-3">{data.items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
              <div className="mt-10 text-center"><p className="mb-3 text-sm text-slate-500">{t('showing')} <b>{data.items.length}</b> / <b>{data.total}</b></p>
                <div className="mx-auto mb-4 h-1.5 w-56 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-violet-600 transition-all" style={{ width: `${Math.min(100, (data.items.length / data.total) * 100)}%` }} /></div>
                {data.hasMore && <button className="btn-primary" disabled={more} onClick={loadMore}>{more ? '…' : t('loadMore')}</button>}</div></>)}
        </div>
      </div>
      <AnimatePresence>{show && <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" onClick={() => setShow(false)} />
        <motion.div initial={{ x: -340 }} animate={{ x: 0 }} exit={{ x: -340 }} className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-slate-50 p-4"><div className="mb-4 flex items-center justify-between"><b>{t('filters')}</b><button onClick={() => setShow(false)}><FiX size={22} /></button></div>{Side}</motion.div></>}</AnimatePresence>
    </div>
  );
}

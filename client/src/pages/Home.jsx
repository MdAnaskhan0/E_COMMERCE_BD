import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTruck, FiShield, FiAward, FiHeadphones, FiArrowRight, FiChevronLeft, FiChevronRight, FiGrid, FiZap } from 'react-icons/fi';
import api from '../api';
import { useT } from '../i18n';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';

const Head = ({ title, sub, to, children }) => { const { t } = useT(); return (
  <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
    <div><h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2><span className="mt-2 block h-1 w-14 rounded-full bg-gradient-to-r from-brand-600 to-violet-500" />{sub && <p className="mt-2 text-sm text-slate-500">{sub}</p>}</div>
    {children}{to && <Link to={to} className="group flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold transition hover:border-brand-500 hover:text-brand-600">{t('viewAll')} <FiArrowRight className="transition group-hover:translate-x-1" /></Link>}
  </div>); };

const Carousel = ({ items }) => {
  const ref = useRef(null); const sc = (d) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: 'smooth' });
  return (<div className="group/c relative">
    <div ref={ref} className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-4 pt-2">{items.map((p) => <div key={p.id} className="w-[220px] shrink-0 snap-start sm:w-[255px]"><ProductCard p={p} /></div>)}</div>
    <button aria-label="Previous" onClick={() => sc(-1)} className="absolute -left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-200 transition hover:bg-brand-600 hover:text-white md:flex"><FiChevronLeft /></button>
    <button aria-label="Next" onClick={() => sc(1)} className="absolute -right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-200 transition hover:bg-brand-600 hover:text-white md:flex"><FiChevronRight /></button>
  </div>); };

const DefaultHero = ({ feat }) => { const { t } = useT(); return (
  <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-violet-700 to-fuchsia-600 text-white">
    <div className="float absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" /><div className="float absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl" style={{ animationDelay: '2s' }} />
    <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
      <div><motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold backdrop-blur">✨ {t('trustLine')}</motion.span>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">{t('heroTitle')}</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5 max-w-lg text-lg text-white/80">{t('heroSub')}</motion.p>
        <div className="mt-8 flex gap-3"><Link to="/shop" className="btn bg-white !px-7 !py-3.5 text-base text-brand-700 shadow-xl hover:bg-brand-50">{t('shopNow')} <FiArrowRight /></Link><Link to="/track" className="btn border border-white/40 !px-7 !py-3.5 text-base text-white hover:bg-white/10">{t('track')}</Link></div></div>
      <div className="relative hidden h-80 md:block">{(feat.slice(0, 3).length ? feat.slice(0, 3) : [{}, {}, {}]).map((p, i) => (
        <motion.div key={i} animate={{ y: [0, -12, 0] }} transition={{ duration: 5 + i, repeat: Infinity }} className="absolute overflow-hidden rounded-3xl border-4 border-white/30 bg-white/10 shadow-2xl backdrop-blur" style={{ width: 190, height: 230, left: i * 130, top: i === 1 ? 0 : 50 }}>{p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}</motion.div>))}</div>
    </div></section>); };

const GRADS = ['from-indigo-500 to-violet-500', 'from-pink-500 to-rose-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-sky-500 to-blue-600', 'from-fuchsia-500 to-purple-600'];

export default function Home() {
  const { t, pick } = useT(); const [cats, setCats] = useState([]); const [feat, setFeat] = useState([]); const [best, setBest] = useState([]); const [latest, setLatest] = useState([]);
  const [tab, setTab] = useState(null); const [tabItems, setTabItems] = useState(null);
  useEffect(() => {
    api.get('/categories').then((r) => { setCats(r.data); if (r.data[0]) setTab(r.data[0].id); });
    api.get('/products?featured=1&limit=8').then((r) => setFeat(r.data.items));
    api.get('/products?best=1&limit=10').then((r) => setBest(r.data.items));
    api.get('/products?limit=8').then((r) => setLatest(r.data.items));
  }, []);
  useEffect(() => { if (tab) { setTabItems(null); api.get(`/products?category=${tab}&limit=8`).then((r) => setTabItems(r.data.items)); } }, [tab]);
  const perks = [[FiTruck, 'fastDel', 'fastDelS', 'from-sky-500 to-indigo-500'], [FiShield, 'securePay', 'securePayS', 'from-emerald-500 to-teal-500'], [FiAward, 'genuine', 'genuineS', 'from-amber-500 to-orange-500'], [FiHeadphones, 'support', 'supportS', 'from-pink-500 to-rose-500']];
  const sec = 'mx-auto mt-20 max-w-7xl px-4';
  return (
    <>
      <HeroSlider fallback={<DefaultHero feat={feat} />} />
      <section className="relative z-10 mx-auto -mt-8 grid max-w-7xl grid-cols-2 gap-3 px-4 md:grid-cols-4 md:gap-4">
        {perks.map(([I, a, b, g], i) => <motion.div key={a} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card flex items-center gap-3 p-4">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg text-white ${g}`}><I /></span><div><p className="text-sm font-bold">{t(a)}</p><p className="text-xs text-slate-500">{t(b)}</p></div></motion.div>)}
      </section>

      {cats.length > 0 && <section className={sec}><Head title={t('categories')} sub={t('shopByCat')} to="/shop" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{cats.map((c, i) => <Link key={c.id} to={`/shop?category=${c.id}`}>
          <motion.div whileHover={{ y: -6 }} className="group relative overflow-hidden rounded-3xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-xl hover:ring-brand-500/30">
            <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl text-white shadow-lg transition group-hover:rotate-6 group-hover:scale-110 ${GRADS[i % GRADS.length]}`}><FiGrid /></span>
            <p className="mt-3 text-sm font-bold">{pick(c, 'name')}</p><p className="text-[11px] text-slate-400">{c.subs.length > 0 ? `${c.subs.length} ${t('categories').toLowerCase()}` : t('browse')}</p></motion.div></Link>)}</div></section>}

      {feat.length > 0 && <section className={sec}><Head title={t('featured')} to="/shop?featured=1" />
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">{feat.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}</div></section>}

      <section className={sec}><div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-brand-700 to-violet-700 p-8 text-white md:p-14">
        <div className="float absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" /><div className="absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6"><div className="max-w-xl"><span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold"><FiZap />{t('sale')}</span>
          <h3 className="mt-3 text-2xl font-extrabold leading-tight md:text-4xl">{t('promoTitle')}</h3><p className="mt-2 text-white/75">{t('promoSub')}</p></div>
          <Link to="/shop" className="btn bg-white !px-8 !py-4 text-base text-brand-700 shadow-xl hover:bg-brand-50">{t('shopNow')} <FiArrowRight /></Link></div></div></section>

      {best.length > 0 && <section className={sec}><Head title={t('best')} to="/shop?best=1" /><Carousel items={best} /></section>}

      {cats.length > 0 && <section className={sec}><Head title={t('shopByCat')} />
        <div className="mb-7 flex flex-wrap gap-2.5">{cats.map((c) => <button key={c.id} onClick={() => setTab(c.id)} className={`relative whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition ${tab === c.id ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600'}`}>
          {tab === c.id && <motion.span layoutId="ctab" className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-600 to-violet-600 shadow-lg shadow-brand-600/30" />}<span className="relative">{pick(c, 'name')}</span></button>)}</div>
        <AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {!tabItems ? <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}</div>
            : tabItems.length === 0 ? <p className="py-12 text-center text-slate-400">{t('noResult')}</p>
            : <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">{tabItems.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
        </motion.div></AnimatePresence>
        {tab && <div className="mt-8 text-center"><Link to={`/shop?category=${tab}`} className="btn-ghost !rounded-full !px-8">{t('viewAll')} <FiArrowRight /></Link></div>}</section>}

      {latest.length > 0 && <section className={sec}><Head title={t('newArrivals')} to="/shop" />
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">{latest.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}</div></section>}
    </>
  );
}

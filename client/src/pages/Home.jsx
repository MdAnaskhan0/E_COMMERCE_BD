import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiShield, FiAward, FiHeadphones, FiArrowRight, FiGrid } from 'react-icons/fi';
import api from '../api';
import { useT } from '../i18n';
import ProductCard from '../components/ProductCard';

const Row = ({ title, items, to }) => { const { t } = useT(); return items.length > 0 && (
  <section className="mx-auto mt-16 max-w-7xl px-4">
    <div className="section-title"><span>{title}</span><Link to={to} className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2">{t('viewAll')} <FiArrowRight /></Link></div>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
  </section>); };

export default function Home() {
  const { t, pick } = useT(); const [cats, setCats] = useState([]); const [feat, setFeat] = useState([]); const [best, setBest] = useState([]); const [latest, setLatest] = useState([]);
  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data));
    api.get('/products?featured=1&limit=8').then((r) => setFeat(r.data.items));
    api.get('/products?best=1&limit=8').then((r) => setBest(r.data.items));
    api.get('/products?limit=8').then((r) => setLatest(r.data.items));
  }, []);
  const perks = [[FiTruck, 'fastDel', 'fastDelS', 'from-sky-500 to-indigo-500'], [FiShield, 'securePay', 'securePayS', 'from-emerald-500 to-teal-500'], [FiAward, 'genuine', 'genuineS', 'from-amber-500 to-orange-500'], [FiHeadphones, 'support', 'supportS', 'from-pink-500 to-rose-500']];
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-violet-700 to-fuchsia-600 text-white">
        <div className="float absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" /><div className="float absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div>
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold backdrop-blur">✨ {t('trustLine')}</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">{t('heroTitle')}</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5 max-w-lg text-lg text-white/80">{t('heroSub')}</motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-8 flex gap-3">
              <Link to="/shop" className="btn bg-white !px-7 !py-3.5 text-base text-brand-700 shadow-xl hover:bg-brand-50">{t('shopNow')} <FiArrowRight /></Link>
              <Link to="/track" className="btn border border-white/40 !px-7 !py-3.5 text-base text-white hover:bg-white/10">{t('track')}</Link></motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="relative hidden h-80 md:block">
            {(feat.slice(0, 3).length ? feat.slice(0, 3) : [{}, {}, {}]).map((p, i) => (
              <motion.div key={i} animate={{ y: [0, -12, 0] }} transition={{ duration: 5 + i, repeat: Infinity }} className="absolute overflow-hidden rounded-3xl border-4 border-white/30 bg-white/10 shadow-2xl backdrop-blur"
                style={{ width: 190, height: 230, left: i * 130, top: i === 1 ? 0 : 50 }}>{p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}</motion.div>))}
          </motion.div>
        </div>
      </section>
      <section className="relative z-10 mx-auto -mt-10 grid max-w-7xl grid-cols-2 gap-4 px-4 md:grid-cols-4">
        {perks.map(([I, a, b, g], i) => <motion.div key={a} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card flex items-center gap-3 p-4">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg text-white ${g}`}><I /></span><div><p className="text-sm font-bold">{t(a)}</p><p className="text-xs text-slate-500">{t(b)}</p></div></motion.div>)}
      </section>
      {cats.length > 0 && <section className="mx-auto mt-16 max-w-7xl px-4"><div className="section-title"><span>{t('categories')}</span></div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{cats.map((c, i) => <Link key={c.id} to={`/shop?category=${c.id}`}>
          <motion.div whileHover={{ y: -5 }} className="card group flex flex-col items-center gap-3 p-5 text-center transition hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-600/10">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-violet-100 text-2xl text-brand-600 transition group-hover:from-brand-600 group-hover:to-violet-600 group-hover:text-white"><FiGrid /></span>
            <span className="text-sm font-bold">{pick(c, 'name')}</span></motion.div></Link>)}</div></section>}
      <Row title={t('featured')} items={feat} to="/shop" /><Row title={t('best')} items={best} to="/shop" />
      {latest.length > 0 && <Row title={t('sortNew')} items={latest} to="/shop" />}
    </>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiGift } from 'react-icons/fi';
import api from '../api';
import { useT } from '../i18n';
import OfferCard from '../components/OfferCard';

export default function Offers() {
  const { t } = useT(); const [rows, setRows] = useState(null);
  useEffect(() => { api.get('/offers').then((r) => setRows(r.data)).catch(() => setRows([])); }, []);
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-700 text-white">
        <div className="float absolute -left-16 top-4 h-64 w-64 rounded-full bg-white/10 blur-3xl" /><div className="float absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="relative mx-auto max-w-7xl px-4 py-14 text-center md:py-20">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 text-3xl backdrop-blur"><FiGift /></motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-extrabold tracking-tight md:text-5xl">{t('latestOffers')}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-3 text-white/80">{t('offersSub')}</motion.p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-12">
        {!rows ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton aspect-[4/3]" />)}</div>
          : rows.length === 0 ? <div className="card py-24 text-center"><FiGift className="mx-auto mb-3 text-5xl text-slate-300" /><p className="text-slate-500">{t('noOffers')}</p></div>
          : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{rows.map((o, i) => <OfferCard key={o.id} o={o} i={i} />)}</div>}
      </div>
    </>
  );
}

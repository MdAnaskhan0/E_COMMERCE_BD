import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import api from '../api';
import { useT } from '../i18n';

const Cta = ({ link, children }) => (/^https?:/.test(link) ? <a href={link} target="_blank" rel="noopener noreferrer" className="btn bg-white !px-7 !py-3.5 text-brand-700 shadow-xl hover:bg-brand-50">{children}</a>
  : <Link to={link || '/shop'} className="btn bg-white !px-7 !py-3.5 text-brand-700 shadow-xl hover:bg-brand-50">{children}</Link>);

// Admin-managed slider (up to 5 slides). Renders `fallback` (the default hero) when no slides exist.
export default function HeroSlider({ fallback }) {
  const { t, pick } = useT(); const [slides, setSlides] = useState(null); const [i, setI] = useState(0); const [pause, setPause] = useState(false);
  useEffect(() => { api.get('/banners').then((r) => setSlides(r.data)).catch(() => setSlides([])); }, []);
  const n = slides?.length || 0; const go = (d) => setI((x) => (x + d + n) % n);
  useEffect(() => { if (n < 2 || pause) return; const id = setInterval(() => setI((x) => (x + 1) % n), 5500); return () => clearInterval(id); }, [n, pause]);
  if (!slides) return <div className="skeleton h-[300px] !rounded-none md:h-[480px]" />;
  if (!n) return fallback;
  return (
    <section className="relative overflow-hidden bg-slate-900" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}>
      <div className="relative h-[300px] sm:h-[400px] md:h-[500px]">
        {slides.map((s, k) => (
          <div key={s.id} className={`absolute inset-0 transition-opacity duration-1000 ${k === i ? 'z-10 opacity-100' : 'opacity-0'}`} aria-hidden={k !== i}>
            <img src={s.image} alt="" className={`h-full w-full object-cover transition-transform duration-[7000ms] ease-out ${k === i ? 'scale-110' : 'scale-100'}`} />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
          </div>))}
        <div className="absolute inset-0 z-20"><div className="mx-auto flex h-full max-w-7xl items-center px-6 md:px-14">
          <AnimatePresence mode="wait"><motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="max-w-xl text-white">
            {pick(slides[i], 'title') && <h2 className="text-3xl font-extrabold leading-tight drop-shadow sm:text-4xl md:text-6xl">{pick(slides[i], 'title')}</h2>}
            {pick(slides[i], 'subtitle') && <p className="mt-3 text-sm text-white/85 sm:text-base md:mt-4 md:text-lg">{pick(slides[i], 'subtitle')}</p>}
            {(slides[i].button_text || slides[i].link) && <div className="mt-5 md:mt-8"><Cta link={slides[i].link}>{slides[i].button_text || t('shopNow')} <FiArrowRight /></Cta></div>}
          </motion.div></AnimatePresence></div></div>
        {n > 1 && <>
          <button aria-label="Previous" onClick={() => go(-1)} className="absolute left-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white hover:text-brand-700 md:flex"><FiChevronLeft size={24} /></button>
          <button aria-label="Next" onClick={() => go(1)} className="absolute right-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white hover:text-brand-700 md:flex"><FiChevronRight size={24} /></button>
          <div className="absolute inset-x-0 bottom-4 z-30 flex justify-center gap-2">{slides.map((s, k) => <button key={s.id} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className={`h-2 rounded-full transition-all ${k === i ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`} />)}</div></>}
      </div>
    </section>
  );
}

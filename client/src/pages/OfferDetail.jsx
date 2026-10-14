import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCopy, FiCheck, FiTag, FiCalendar, FiArrowRight, FiGift } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { img } from '../api';
import { useT } from '../i18n';
import RichText from '../components/RichText';
import OfferCard, { Timer } from '../components/OfferCard';
import Spinner from '../components/Spinner';

const fmt = (d, lang) => new Date(`${d}T00:00:00`).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function OfferDetail() {
  const { id } = useParams(); const { t, pick, lang } = useT(); const [o, setO] = useState(null); const [err, setErr] = useState(false); const [more, setMore] = useState([]); const [copied, setCopied] = useState(false);
  useEffect(() => {
    setO(null); setErr(false); window.scrollTo(0, 0);
    api.get(`/offers/${id}`).then((r) => setO(r.data)).catch(() => setErr(true));
    api.get('/offers').then((r) => setMore(r.data.filter((x) => String(x.id) !== id).slice(0, 3)));
  }, [id]);
  const copy = () => { navigator.clipboard?.writeText(o.coupon_code); setCopied(true); toast.success(t('copied')); setTimeout(() => setCopied(false), 2000); };
  if (err) return <div className="mx-auto max-w-lg px-4 py-24 text-center"><FiGift className="mx-auto mb-3 text-5xl text-slate-300" /><p className="mb-5 text-slate-500">{t('offerEnded')}</p><Link to="/offers" className="btn-primary">{t('backOffers')}</Link></div>;
  if (!o) return <Spinner />;
  const cta = o.link || '/shop'; const ext = /^https?:/.test(cta);
  const CtaBtn = ({ className = '' }) => (ext ? <a href={cta} target="_blank" rel="noopener noreferrer" className={`btn-primary !px-8 !py-3.5 ${className}`}>{t('shopNow')} <FiArrowRight /></a> : <Link to={cta} className={`btn-primary !px-8 !py-3.5 ${className}`}>{t('shopNow')} <FiArrowRight /></Link>);
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/offers" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600"><FiArrowLeft />{t('backOffers')}</Link>
      <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden !rounded-[32px]">
        <div className="relative aspect-[16/8] bg-slate-100"><img src={img(o.image)} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
          {o.badge && <span className="absolute left-0 top-6 rounded-r-full bg-gradient-to-r from-rose-500 to-orange-500 py-2 pl-5 pr-7 text-lg font-extrabold text-white shadow-xl">{o.badge}</span>}</div>
        <div className="p-6 md:p-10">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">{pick(o, 'title')}</h1>
          {pick(o, 'summary') && <p className="mt-3 text-lg text-slate-500">{pick(o, 'summary')}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <Timer end={o.ends_at} className="rounded-full bg-slate-100 px-4 py-1.5 font-semibold text-slate-700" />
            {o.ends_at && <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-1.5 font-semibold text-slate-700"><FiCalendar />{t('validTill')} {fmt(o.ends_at, lang)}</span>}
          </div>
          {o.coupon_code && <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-dashed border-brand-500/50 bg-gradient-to-br from-brand-50 to-violet-50 p-5">
            <div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-xl text-white"><FiTag /></span>
              <div><p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t('couponCode')}</p><p className="font-mono text-2xl font-extrabold tracking-widest text-brand-700">{o.coupon_code}</p><p className="text-xs text-slate-500">{t('useAtCheckout')}</p></div></div>
            <button onClick={copy} className="btn-primary">{copied ? <FiCheck /> : <FiCopy />}{copied ? t('copied') : 'Copy'}</button></div>}
          {(pick(o, 'description')) && <div className="mt-8 border-t border-slate-100 pt-8"><h2 className="mb-4 text-xl font-extrabold">{t('offerDetails')}</h2><RichText html={pick(o, 'description')} /></div>}
          <div className="mt-8"><CtaBtn /></div>
        </div>
      </motion.article>
      {more.length > 0 && <section className="mt-14"><div className="section-title"><span>{t('otherOffers')}</span></div><div className="grid gap-6 md:grid-cols-3">{more.map((x, i) => <OfferCard key={x.id} o={x} i={i} />)}</div></section>}
    </div>
  );
}

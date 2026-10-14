import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiInfo, FiFileText, FiShield, FiRefreshCw } from 'react-icons/fi';
import api from '../api';
import { useT } from '../i18n';
import RichText from '../components/RichText';
import Spinner from '../components/Spinner';

export const INFO_PAGES = [['about', '/about', 'aboutUs', FiInfo], ['terms', '/terms', 'termsT', FiFileText], ['privacy', '/privacy', 'privacyT', FiShield], ['refund', '/refund', 'refundT', FiRefreshCw]];

// About / Terms / Privacy / Refund - all content is edited from Admin → Pages
export default function InfoPage({ slug }) {
  const { t, pick, lang } = useT(); const [p, setP] = useState(null); const [err, setErr] = useState(false);
  useEffect(() => { setP(null); setErr(false); window.scrollTo(0, 0); api.get(`/pages/${slug}`).then((r) => setP(r.data)).catch(() => setErr(true)); }, [slug]);
  const cur = INFO_PAGES.find((x) => x[0] === slug); const Icon = cur?.[3] || FiInfo;
  return (
    <>
      <section className="bg-gradient-to-br from-brand-700 via-violet-700 to-fuchsia-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur"><Icon /></motion.span>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">{p ? pick(p, 'title') : t(cur?.[2] || 'information')}</h1>
          {p && <p className="mt-2 text-sm text-white/70">{t('lastUpdated')}: {new Date(p.updated_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[250px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start"><div className="card p-2"><p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('information')}</p>
          {INFO_PAGES.map(([s, to, key, I]) => <Link key={s} to={to} className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${s === slug ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/25' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-600'}`}><I />{t(key)}</Link>)}</div></aside>
        <motion.div key={slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card min-h-[300px] p-6 md:p-10">
          {err ? <p className="py-10 text-center text-slate-400">404</p> : !p ? <Spinner /> : <RichText html={pick(p, 'content')} />}
        </motion.div>
      </div>
    </>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiArrowRight, FiTag } from 'react-icons/fi';
import { useT } from '../i18n';
import { img } from '../api';

// days left until ends_at ('YYYY-MM-DD', inclusive). null = no end date
export const daysLeft = (end) => (end ? Math.ceil((new Date(`${end}T23:59:59`) - new Date()) / 864e5) : null);

export const Timer = ({ end, className = '' }) => {
  const { t } = useT(); const d = daysLeft(end);
  if (d === null) return <span className={`flex items-center gap-1.5 ${className}`}><FiClock />{t('ongoing')}</span>;
  return <span className={`flex items-center gap-1.5 ${d <= 2 ? 'font-bold text-rose-500' : ''} ${className}`}><FiClock />{d <= 1 ? t('endsToday') : `${d} ${t('daysLeft')}`}</span>;
};

export default function OfferCard({ o, i = 0 }) {
  const { t, pick } = useT();
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: (i % 3) * 0.08 }} className="h-full">
      <Link to={`/offers/${o.id}`} className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_2px_12px_-4px_rgba(15,23,42,.12)] ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_48px_-16px_rgba(79,70,229,.35)] hover:ring-brand-500/40">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img src={img(o.image)} alt={pick(o, 'title')} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
          {o.badge && <span className="absolute left-0 top-5 rounded-r-full bg-gradient-to-r from-rose-500 to-orange-500 py-1.5 pl-4 pr-5 text-sm font-extrabold text-white shadow-lg">{o.badge}</span>}
          <Timer end={o.ends_at} className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow" />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-lg font-extrabold leading-snug transition group-hover:text-brand-600">{pick(o, 'title')}</h3>
          {pick(o, 'summary') && <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{pick(o, 'summary')}</p>}
          <div className="mt-auto flex items-center justify-between gap-2 pt-4">
            {o.coupon_code ? <span className="flex items-center gap-1.5 rounded-lg border border-dashed border-brand-500/50 bg-brand-50 px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-brand-700"><FiTag />{o.coupon_code}</span> : <span />}
            <span className="flex items-center gap-1.5 text-sm font-bold text-brand-600">{t('viewOffer')}<FiArrowRight className="transition group-hover:translate-x-1" /></span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

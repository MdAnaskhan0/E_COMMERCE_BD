import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiStar, FiEye, FiZap } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { addItem } from '../store';
import { useT } from '../i18n';
import { img } from '../api';

export default function ProductCard({ p }) {
  const { t, pick, money } = useT(); const d = useDispatch();
  const price = p.sale_price ?? p.price; const off = p.sale_price ? Math.round((1 - p.sale_price / p.price) * 100) : 0; const out = p.stock < 1;
  const add = (e) => { e.preventDefault(); e.stopPropagation(); d(addItem({ p, qty: 1 })); toast.success(t('addedCart')); };
  return (
    <motion.article initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.4 }}
      className="group relative flex h-full flex-col rounded-[28px] bg-white p-2.5 shadow-[0_2px_12px_-4px_rgba(15,23,42,.12)] ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_48px_-16px_rgba(79,70,229,.35)] hover:ring-brand-500/40">
      <Link to={`/product/${p.id}`} className="relative block aspect-square overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-100 via-white to-brand-50">
        <img src={img(p.image)} alt={pick(p, 'name')} loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${p.image2 ? 'group-hover:opacity-0' : 'group-hover:scale-110'}`} />
        {p.image2 && <img src={p.image2} alt="" loading="lazy" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0 transition duration-700 group-hover:scale-100 group-hover:opacity-100" />}
        {off > 0 && <span className="absolute left-0 top-4 rounded-r-full bg-gradient-to-r from-rose-500 to-red-500 py-1 pl-3 pr-4 text-xs font-extrabold text-white shadow-lg">-{off}%</span>}
        {p.is_featured ? <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm text-amber-950 shadow-lg" title={t('featured')}>★</span> : null}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-slate-900/60 to-transparent p-3 pt-10 opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-lg"><FiEye />{t('details')}</span>
        </div>
        {out && <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]"><span className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white">{t('outStock')}</span></div>}
      </Link>
      <div className="flex flex-1 flex-col px-2 pb-1 pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-600">{pick({ name_en: p.cat_en, name_bn: p.cat_bn }, 'name')}</span>
          {p.review_count > 0 ? <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-slate-700"><FiStar className="fill-amber-400 text-amber-400" />{p.rating}<span className="font-normal text-slate-400">({p.review_count})</span></span> : p.sold_count > 0 ? <span className="shrink-0 text-[11px] text-slate-400">{p.sold_count} {t('sold')}</span> : null}
        </div>
        <Link to={`/product/${p.id}`} className="mt-2 line-clamp-2 min-h-[2.7rem] text-[15px] font-bold leading-snug text-slate-800 transition hover:text-brand-600">{pick(p, 'name')}</Link>
        {!out && p.stock <= 10 && <div className="mt-2"><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-500" style={{ width: `${Math.max(8, p.stock * 10)}%` }} /></div><p className="mt-1 text-[11px] font-semibold text-orange-500">{t('onlyWord')} {p.stock} {t('leftWord')}</p></div>}
        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="leading-none"><p className="text-xl font-extrabold text-slate-900">{money(price)}</p>{p.sale_price && <p className="mt-1 text-xs text-slate-400 line-through">{money(p.price)}</p>}</div>
          <motion.button whileTap={{ scale: 0.85 }} disabled={out} onClick={add} aria-label={t('addCart')} title={t('addCart')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg transition hover:bg-gradient-to-br hover:from-brand-600 hover:to-violet-600 disabled:opacity-40"><FiShoppingCart /></motion.button>
        </div>
      </div>
    </motion.article>
  );
}

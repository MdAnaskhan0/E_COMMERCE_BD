import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiStar, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { addItem } from '../store';
import { useT } from '../i18n';
import { img } from '../api';

export default function ProductCard({ p }) {
  const { t, lang, pick, money } = useT(); const d = useDispatch();
  const off = p.sale_price ? Math.round((1 - p.sale_price / p.price) * 100) : 0;
  const add = (e) => { e.preventDefault(); d(addItem({ p, qty: 1 })); toast.success(t('addedCart')); };
  return (
    <motion.article initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.4 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white transition duration-300 hover:-translate-y-1.5 hover:border-brand-500/30 hover:shadow-2xl hover:shadow-brand-600/15">
      <Link to={`/product/${p.id}`} className="relative block aspect-[4/5] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        <img src={img(p.image)} alt={pick(p, 'name')} loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition duration-700 ${p.image2 ? 'group-hover:opacity-0' : 'group-hover:scale-110'}`} />
        {p.image2 && <img src={p.image2} alt="" loading="lazy" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition duration-700 group-hover:scale-100 group-hover:opacity-100" />}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {off > 0 && <span className="rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">-{off}%</span>}
          {p.is_featured ? <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950 shadow-lg">★ {t('featured').split(' ')[0]}</span> : null}
        </div>
        <div className="absolute inset-x-3 bottom-3 flex translate-y-14 gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button disabled={p.stock < 1} onClick={add} className="btn-primary flex-1 !rounded-2xl !py-2.5 text-xs"><FiShoppingCart />{t('addCart')}</button>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-lg"><FiEye /></span>
        </div>
        {p.stock < 1 && <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]"><span className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white">{t('outStock')}</span></div>}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{pick({ name_en: p.cat_en, name_bn: p.cat_bn }, 'name')}</p>
        <Link to={`/product/${p.id}`} className="mt-1 line-clamp-2 min-h-[2.6rem] text-[15px] font-semibold leading-snug transition hover:text-brand-600">{pick(p, 'name')}</Link>
        <div className="mt-1.5 flex h-5 items-center gap-1 text-xs">{p.review_count > 0 ? <><span className="flex text-amber-400">{[1, 2, 3, 4, 5].map((n) => <FiStar key={n} className={n <= Math.round(p.rating) ? 'fill-current' : 'text-slate-300'} />)}</span><span className="text-slate-400">({p.review_count})</span></> : null}
          {p.stock > 0 && p.stock <= 5 && <span className="ml-auto font-semibold text-orange-500">{t('onlyWord')} {p.stock} {t('leftWord')}</span>}</div>
        <div className="mt-3 flex items-baseline gap-2 border-t border-dashed border-slate-200 pt-3">
          <span className="text-xl font-extrabold text-slate-900">{money(p.sale_price ?? p.price)}</span>{p.sale_price && <span className="text-sm text-slate-400 line-through">{money(p.price)}</span>}
        </div>
      </div>
    </motion.article>
  );
}

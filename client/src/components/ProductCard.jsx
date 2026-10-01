import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { addItem } from '../store';
import { useT } from '../i18n';
import { img } from '../api';

export default function ProductCard({ p }) {
  const { t, pick, money } = useT(); const d = useDispatch();
  const off = p.sale_price ? Math.round((1 - p.sale_price / p.price) * 100) : 0;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-xl hover:shadow-brand-600/10">
      <Link to={`/product/${p.id}`} className="relative block aspect-square overflow-hidden bg-slate-100">
        <img src={img(p.image)} alt={pick(p, 'name')} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {off > 0 && <span className="badge bg-red-500 text-white shadow">-{off}%</span>}
          {p.is_featured ? <span className="badge bg-amber-400 text-amber-950 shadow">★</span> : null}
        </div>
        {p.stock < 1 && <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-bold text-red-500 backdrop-blur-[1px]">{t('outStock')}</div>}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link to={`/product/${p.id}`} className="line-clamp-2 min-h-[2.8rem] text-sm font-semibold leading-snug transition hover:text-brand-600">{pick(p, 'name')}</Link>
        <div className="mt-1 flex h-4 items-center gap-1 text-xs text-amber-500">{p.review_count > 0 && <><FiStar className="fill-current" />{p.rating}<span className="text-slate-400">({p.review_count})</span></>}</div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="leading-tight"><div className="text-lg font-bold text-brand-600">{money(p.sale_price ?? p.price)}</div>{p.sale_price && <div className="text-xs text-slate-400 line-through">{money(p.price)}</div>}</div>
          <motion.button whileTap={{ scale: 0.85 }} disabled={p.stock < 1} className="btn-primary !rounded-full !p-3" title={t('addCart')} onClick={() => { d(addItem({ p, qty: 1 })); toast.success(t('addedCart')); }}><FiShoppingCart /></motion.button>
        </div>
      </div>
    </motion.div>
  );
}

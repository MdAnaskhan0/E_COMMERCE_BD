import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { img, fail } from '../api';
import { addItem } from '../store';
import { useT } from '../i18n';
import Spinner from '../components/Spinner';

export default function ProductDetail() {
  const { id } = useParams(); const { t, pick, money } = useT(); const d = useDispatch(); const nav = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [p, setP] = useState(null); const [i, setI] = useState(0); const [qty, setQty] = useState(1); const [rv, setRv] = useState({ rating: 5, comment: '' });
  const load = () => api.get(`/products/${id}`).then((r) => { setP(r.data); setI(0); }).catch(fail);
  useEffect(() => { load(); window.scrollTo(0, 0); }, [id]);
  if (!p) return <Spinner />;
  const tier = [...p.tiers].sort((a, b) => b.min_qty - a.min_qty).find((x) => qty >= x.min_qty);
  const unit = tier ? tier.unit_price : p.sale_price ?? p.price;
  const add = (go) => { d(addItem({ p: { ...p, image: p.images[0]?.url }, qty })); toast.success(t('addCart') + ' ✓'); if (go) nav('/checkout'); };
  const submit = async () => { try { await api.post(`/products/${id}/reviews`, rv); toast.success('✓'); setRv({ rating: 5, comment: '' }); load(); } catch (e) { fail(e); } };
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="card aspect-square overflow-hidden"><img src={img(p.images[i]?.url)} alt="" className="h-full w-full object-cover" /></div>
          <div className="mt-3 flex gap-2 overflow-x-auto">{p.images.map((m, k) => <img key={m.id} src={m.url} onClick={() => setI(k)} className={`h-16 w-16 cursor-pointer rounded border-2 object-cover ${k === i ? 'border-brand-600' : 'border-transparent'}`} />)}</div>
        </div>
        <div>
          <p className="text-xs text-slate-500">{pick({ name_en: p.cat_en, name_bn: p.cat_bn }, 'name')}{p.brand && ` · ${p.brand}`}</p>
          <h1 className="mt-1 text-2xl font-bold">{pick(p, 'name')}</h1>
          <div className="mt-3 flex items-end gap-2"><span className="text-3xl font-bold text-brand-600">{money(unit)}</span>{unit < p.price && <span className="text-slate-400 line-through">{money(p.price)}</span>}<span className="text-sm text-slate-500">/ {p.unit}</span></div>
          <p className={`mt-1 text-sm ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>{p.stock > 0 ? `${t('inStock')} (${p.stock})` : t('outStock')}</p>
          {p.tiers.length > 0 && <div className="card mt-4 p-3"><h4 className="mb-1 text-sm font-bold">{t('bulk')}</h4>
            {p.tiers.map((x) => <p key={x.min_qty} className="text-sm">{x.min_qty}+ {p.unit} → <b>{money(x.unit_price)}</b></p>)}</div>}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center rounded-lg border"><button className="px-3 py-2" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span className="w-10 text-center">{qty}</span><button className="px-3 py-2" onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button></div>
            <button disabled={p.stock < 1} className="btn-ghost" onClick={() => add(false)}>{t('addCart')}</button>
            <button disabled={p.stock < 1} className="btn-primary" onClick={() => add(true)}>{t('buyNow')}</button>
          </div>
          {p.features.length > 0 && <div className="mt-6"><h3 className="mb-2 font-bold">{t('features')}</h3>
            <table className="w-full text-sm"><tbody>{p.features.map((f, k) => <tr key={k} className="border-b"><td className="w-1/3 py-1.5 font-medium text-slate-500">{f.k}</td><td>{f.v}</td></tr>)}</tbody></table></div>}
        </div>
      </div>
      {(p.description_en || p.description_bn) && <section className="card mt-8 p-5"><h3 className="mb-2 font-bold">{t('details')}</h3><p className="whitespace-pre-line text-sm">{pick(p, 'description')}</p></section>}
      <section className="card mt-6 p-5"><h3 className="mb-3 font-bold">{t('reviews')} ({p.reviews.length})</h3>
        {p.reviews.map((r) => <div key={r.id} className="border-b py-3 text-sm"><b>{r.name}</b> <span className="ml-2 text-amber-500">{'★'.repeat(r.rating)}</span><p>{r.comment}</p></div>)}
        {user ? <div className="mt-4 max-w-md space-y-2"><h4 className="text-sm font-bold">{t('writeReview')}</h4>
          <select className="input" value={rv.rating} onChange={(e) => setRv({ ...rv, rating: +e.target.value })}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}</select>
          <textarea className="input" rows="3" maxLength="1000" value={rv.comment} onChange={(e) => setRv({ ...rv, comment: e.target.value })} /><button className="btn-primary" onClick={submit}><FiStar />{t('submit')}</button></div>
          : <button className="btn-ghost mt-3" onClick={() => nav('/login')}>{t('login')}</button>}
      </section>
    </div>
  );
}

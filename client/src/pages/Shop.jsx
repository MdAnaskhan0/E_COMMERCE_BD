import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import { useT } from '../i18n';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

export default function Shop() {
  const { t, pick } = useT(); const [sp, setSp] = useSearchParams(); const [cats, setCats] = useState([]); const [data, setData] = useState(null);
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };
  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)); }, []);
  useEffect(() => { setData(null); api.get(`/products?${sp.toString()}&limit=12`).then((r) => setData(r.data)); }, [sp]);
  const cat = cats.find((c) => String(c.id) === sp.get('category'));
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="card h-fit p-4">
        <h3 className="mb-2 font-bold">{t('categories')}</h3>
        <button className={`block w-full py-1 text-left text-sm ${!cat ? 'font-bold text-brand-600' : ''}`} onClick={() => { set('sub', ''); set('category', ''); }}>{t('all')}</button>
        {cats.map((c) => (<div key={c.id}>
          <button className={`block w-full py-1 text-left text-sm ${String(c.id) === sp.get('category') ? 'font-bold text-brand-600' : ''}`} onClick={() => { set('sub', ''); set('category', c.id); }}>{pick(c, 'name')}</button>
          {String(c.id) === sp.get('category') && c.subs.map((s) => <button key={s.id} className={`ml-3 block py-0.5 text-xs ${String(s.id) === sp.get('sub') ? 'font-bold text-brand-600' : 'text-slate-500'}`} onClick={() => set('sub', s.id)}>{pick(s, 'name')}</button>)}
        </div>))}
      </aside>
      <div>
        <div className="mb-4 flex gap-2">
          <input className="input" placeholder={t('search')} defaultValue={sp.get('q') || ''} onKeyDown={(e) => e.key === 'Enter' && set('q', e.target.value)} />
          <select className="input !w-auto" value={sp.get('sort') || ''} onChange={(e) => set('sort', e.target.value)}>
            <option value="">{t('sortNew')}</option><option value="price_asc">{t('sortLow')}</option><option value="price_desc">{t('sortHigh')}</option>
          </select>
        </div>
        {!data ? <Spinner /> : data.items.length === 0 ? <p className="py-20 text-center text-slate-500">{t('noResult')}</p> : (<>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{data.items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          <div className="mt-6 flex justify-center gap-1">{Array.from({ length: data.pages }, (_, i) => <button key={i} onClick={() => set('page', i + 1)} className={`h-8 w-8 rounded text-sm ${data.page === i + 1 ? 'bg-brand-600 text-white' : 'bg-white border'}`}>{i + 1}</button>)}</div>
        </>)}
      </div>
    </div>
  );
}

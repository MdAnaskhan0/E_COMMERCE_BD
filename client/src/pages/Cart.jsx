import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiTrash2 } from 'react-icons/fi';
import { removeItem, setQty, unitPrice, lineTotal } from '../store';
import { useT } from '../i18n';
import { img } from '../api';

export default function Cart() {
  const { t, pick, money } = useT(); const d = useDispatch(); const items = useSelector((s) => s.cart.items);
  const sub = items.reduce((a, i) => a + lineTotal(i), 0);
  if (!items.length) return <div className="py-24 text-center"><p className="mb-4 text-lg">{t('emptyCart')}</p><Link to="/shop" className="btn-primary">{t('shopNow')}</Link></div>;
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-3">{items.map((i) => (
        <div key={i.id} className="card flex items-center gap-4 p-3">
          <img src={img(i.image)} className="h-20 w-20 rounded object-cover" />
          <div className="flex-1"><Link to={`/product/${i.id}`} className="font-semibold">{pick(i, 'name')}</Link><p className="text-sm text-brand-600">{money(unitPrice(i))}</p></div>
          <input type="number" min="1" max={i.stock} className="input !w-20" value={i.qty} onChange={(e) => d(setQty({ id: i.id, qty: +e.target.value || 1 }))} />
          <b className="w-24 text-right">{money(lineTotal(i))}</b>
          <button onClick={() => d(removeItem(i.id))} className="text-red-500"><FiTrash2 /></button>
        </div>))}</div>
      <div className="card h-fit p-5"><div className="flex justify-between text-lg font-bold"><span>{t('subtotal')}</span><span>{money(sub)}</span></div>
        <Link to="/checkout" className="btn-primary mt-4 w-full">{t('checkout')}</Link></div>
    </div>
  );
}

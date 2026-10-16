import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPrinter, FiArrowLeft } from 'react-icons/fi';
import api, { fail } from '../../api';
import Spinner from '../../components/Spinner';

const tk = (n) => '৳' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
const PAY = { cod: 'Cash on Delivery', bkash: 'bKash', nagad: 'Nagad' };
// Standalone A4 invoice. Outside AdminLayout, so only the invoice is printed.
export default function Invoice() {
  const { id } = useParams(); const [o, setO] = useState(null); const [shop, setShop] = useState(null);
  useEffect(() => { Promise.all([api.get(`/admin/orders/${id}`), api.get('/shop-info')]).then(([a, b]) => { setO(a.data); setShop(b.data); document.title = `Invoice ${a.data.order_no}`; }).catch(fail); }, [id]);
  if (!o || !shop) return <Spinner />;
  const paid = o.payment_status === 'paid';
  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <style>{`@media print { @page { size: A4; margin: 12mm; } body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>
      <div className="mx-auto mb-4 flex max-w-[800px] items-center justify-between px-4 print:hidden">
        <Link to={`/admin/orders/${o.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-600"><FiArrowLeft />Back to order</Link>
        <button onClick={() => window.print()} className="btn-primary"><FiPrinter />Print / Save as PDF</button></div>
      <div className="mx-auto max-w-[800px] bg-white p-10 shadow-xl print:max-w-none print:p-0 print:shadow-none">
        <div className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-6">
          <div className="flex items-center gap-3">{shop.logo ? <img src={shop.logo} alt="" className="h-16 max-w-[180px] object-contain" /> : <h1 className="text-2xl font-extrabold">{shop.shop_name}</h1>}</div>
          <div className="text-right text-xs leading-relaxed text-slate-600">{shop.logo && <p className="text-sm font-bold text-slate-900">{shop.shop_name}</p>}{shop.address && <p>{shop.address}</p>}{shop.phone && <p>Phone: {shop.phone}</p>}{shop.email && <p>{shop.email}</p>}</div></div>
        <div className="mt-6 flex items-start justify-between">
          <h2 className="text-3xl font-black tracking-widest text-slate-900">INVOICE</h2>
          <div className="text-right text-sm"><p><span className="text-slate-500">Invoice no:</span> <b>{o.order_no}</b></p><p><span className="text-slate-500">Date:</span> {new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            <p className="mt-1"><span className={`inline-block rounded px-2 py-0.5 text-xs font-extrabold uppercase ${paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{o.payment_status}</span></p></div></div>
        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div><p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Bill / Ship to</p><p className="font-bold">{o.customer_name}</p><p>{o.customer_phone}</p>{o.customer_email && <p>{o.customer_email}</p>}<p>{o.address_line}, {o.city}</p></div>
          <div className="text-right"><p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Payment</p><p className="font-bold">{PAY[o.payment_method] || o.payment_method}</p>{o.payment_trx_id && <p className="text-xs">Trx ID: {o.payment_trx_id}</p>}<p className="mt-1 text-xs capitalize text-slate-500">Order status: {o.status}</p></div></div>
        <table className="mt-8 w-full text-sm"><thead><tr className="bg-slate-900 text-left text-xs uppercase tracking-wide text-white"><th className="w-10 px-3 py-2">#</th><th className="px-3 py-2">Item</th><th className="px-3 py-2 text-right">Unit price</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Amount</th></tr></thead>
          <tbody>{o.items.map((i, k) => <tr key={k} className="border-b border-slate-200"><td className="px-3 py-2.5 text-slate-500">{k + 1}</td><td className="px-3 py-2.5 font-medium">{i.product_name}</td><td className="px-3 py-2.5 text-right">{tk(i.unit_price)}</td><td className="px-3 py-2.5 text-right">{i.quantity}</td><td className="px-3 py-2.5 text-right font-semibold">{tk(i.line_total)}</td></tr>)}</tbody></table>
        <div className="mt-4 ml-auto w-72 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{tk(o.subtotal)}</span></div>
          {Number(o.discount) > 0 && <div className="flex justify-between text-emerald-700"><span>Discount{o.coupon_code ? ` (${o.coupon_code})` : ''}</span><span>− {tk(o.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>{tk(o.shipping_fee)}</span></div>
          <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-lg font-extrabold"><span>Total</span><span>{tk(o.total)}</span></div></div>
        {o.note && <p className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-600"><b>Note:</b> {o.note}</p>}
        <div className="mt-16 flex items-end justify-between text-xs text-slate-500"><p>Thank you for shopping with {shop.shop_name}!</p><div className="w-44 border-t border-slate-400 pt-1 text-center">Authorized signature</div></div>
      </div>
    </div>
  );
}

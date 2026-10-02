import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import api, { fail } from '../../api';
import { fetchShop } from '../../store';

const F = [['shop_name', 'Shop name'], ['phone', 'Phone'], ['email', 'Email'], ['address', 'Address'], ['facebook', 'Facebook URL'], ['instagram', 'Instagram URL'], ['youtube', 'YouTube URL'], ['whatsapp', 'WhatsApp URL'], ['bkash_number', 'bKash number (customers send money here)'], ['nagad_number', 'Nagad number (customers send money here)'], ['shipping_fee', 'Shipping fee ৳'], ['notice', 'Notice / বিজ্ঞপ্তি']];
export default function ShopInfo() {
  const d = useDispatch(); const [f, setF] = useState(null); const [logo, setLogo] = useState(null);
  useEffect(() => { api.get('/shop-info').then((r) => setF(r.data)); }, []);
  if (!f) return null;
  const save = async (e) => {
    e.preventDefault(); const { id, logo: _l, ...data } = f; const fd = new FormData(); fd.append('data', JSON.stringify(data)); if (logo) fd.append('logo', logo);
    try { await api.put('/admin/shop-info', fd); toast.success('Saved'); d(fetchShop()); } catch (er) { fail(er); }
  };
  return (
    <form onSubmit={save} className="card max-w-2xl space-y-3 p-5">
      {f.logo && <img src={f.logo} className="h-24 max-w-xs rounded-xl bg-slate-100 object-contain p-2" />}<input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} />
      {F.map(([k, l]) => <div key={k}><label className="label">{l}</label><input className="input" value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>)}
      <button className="btn-primary">Save</button></form>
  );
}

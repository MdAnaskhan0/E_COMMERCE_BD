import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { img, fail } from '../../api';
import Badge from '../../components/Badge';

export default function Products() {
  const [rows, setRows] = useState([]); const [s, setS] = useState('');
  const load = () => api.get('/admin/products').then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);
  const del = async (id) => { if (confirm('Delete this product?')) { try { await api.delete(`/admin/products/${id}`); toast.success('Deleted'); load(); } catch (e) { fail(e); } } };
  const list = rows.filter((p) => (p.name_en + p.name_bn + (p.sku || '')).toLowerCase().includes(s.toLowerCase()));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm"><FiSearch className="absolute left-3.5 top-3.5 text-slate-400" /><input className="input pl-10" placeholder="Search name / SKU..." value={s} onChange={(e) => setS(e.target.value)} /></div>
        <Link to="/admin/products/new" className="btn-primary"><FiPlus />New product</Link></div>
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Sold</th><th>Status</th><th /></tr></thead>
        <tbody>{list.map((p) => <tr key={p.id}>
          <td><div className="flex items-center gap-3"><img src={img(p.image)} className="h-12 w-12 rounded-xl object-cover" /><div><p className="font-semibold">{p.name_en}</p><p className="text-xs text-slate-500">{p.name_bn}</p></div></div></td>
          <td><b>৳{p.sale_price ?? p.price}</b>{p.sale_price && <span className="ml-1 text-xs text-slate-400 line-through">৳{p.price}</span>}</td>
          <td>{p.stock <= 5 ? <Badge s="cancelled">{p.stock}</Badge> : p.stock}</td><td>{p.sold_count}</td>
          <td className="space-x-1"><Badge s={p.is_active ? 'on' : 'off'}>{p.is_active ? 'Active' : 'Hidden'}</Badge>{p.is_featured ? <Badge s="pending">★ Featured</Badge> : null}</td>
          <td className="space-x-1 text-right"><Link className="inline-flex rounded-lg p-2 text-brand-600 hover:bg-brand-50" to={`/admin/products/${p.id}`}><FiEdit2 /></Link><button className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={() => del(p.id)}><FiTrash2 /></button></td></tr>)}</tbody></table></div>
        {list.length === 0 && <p className="p-10 text-center text-sm text-slate-400">No products</p>}</div>
    </div>
  );
}

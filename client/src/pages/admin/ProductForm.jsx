import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiInfo, FiDollarSign, FiList, FiImage, FiFileText, FiPlus, FiX, FiUploadCloud, FiSave } from 'react-icons/fi';
import api, { fail } from '../../api';
import RichEditor from '../../components/RichEditor';

const init = { name_en: '', name_bn: '', sku: '', brand: '', category_id: '', sub_category_id: '', price: '', sale_price: '', stock: 0, unit: 'pcs', weight: '', description_en: '', description_bn: '', is_featured: false, is_active: true };

// IMPORTANT: components live OUTSIDE ProductForm so inputs keep focus while typing
const Section = ({ icon: I, title, children }) => (
  <div className="card p-6"><h3 className="mb-5 flex items-center gap-2.5 font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><I /></span>{title}</h3>{children}</div>
);
const Field = ({ label, children }) => <div><label className="label mb-1.5 block">{label}</label>{children}</div>;
const Pairs = ({ arr, set, a, b, la, lb, num }) => (
  <div className="space-y-2">
    {arr.map((x, i) => (
      <div key={i} className="flex gap-2">
        <input className="input" placeholder={la} type={num ? 'number' : 'text'} value={x[a]} onChange={(e) => set(arr.map((y, j) => (j === i ? { ...y, [a]: e.target.value } : y)))} />
        <input className="input" placeholder={lb} type={num ? 'number' : 'text'} step="any" value={x[b]} onChange={(e) => set(arr.map((y, j) => (j === i ? { ...y, [b]: e.target.value } : y)))} />
        <button type="button" className="rounded-xl px-3 text-red-500 hover:bg-red-50" onClick={() => set(arr.filter((_, j) => j !== i))}><FiX /></button>
      </div>))}
    <button type="button" className="btn-ghost !py-2" onClick={() => set([...arr, { [a]: '', [b]: '' }])}><FiPlus />Add</button>
  </div>
);

export default function ProductForm() {
  const { id } = useParams(); const nav = useNavigate();
  const [f, setF] = useState(init); const [cats, setCats] = useState([]); const [subs, setSubs] = useState([]);
  const [features, setFeatures] = useState([]); const [tiers, setTiers] = useState([]); const [old, setOld] = useState([]); const [removed, setRemoved] = useState([]); const [files, setFiles] = useState([]); const [busy, setBusy] = useState(false);
  useEffect(() => {
    api.get('/admin/categories').then((r) => setCats(r.data)); api.get('/admin/sub-categories').then((r) => setSubs(r.data));
    if (id) api.get(`/admin/products/${id}`).then(({ data: p }) => { setF({ ...init, ...p, sku: p.sku || '', sub_category_id: p.sub_category_id || '', sale_price: p.sale_price ?? '' }); setFeatures(p.features); setTiers(p.tiers); setOld(p.images); }).catch(fail);
  }, [id]);
  const on = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    const data = { ...f, category_id: +f.category_id, sub_category_id: f.sub_category_id ? +f.sub_category_id : null, price: +f.price, sale_price: f.sale_price ? +f.sale_price : null, stock: +f.stock,
      sku: f.sku || null, is_featured: f.is_featured ? 1 : 0, is_active: f.is_active ? 1 : 0, features: features.filter((x) => x.k && x.v), tiers: tiers.map((t) => ({ min_qty: +t.min_qty, unit_price: +t.unit_price })), remove_image_ids: removed };
    ['id', 'created_at', 'sold_count', 'images'].forEach((k) => delete data[k]);
    const fd = new FormData(); fd.append('data', JSON.stringify(data)); files.forEach((x) => fd.append('images', x));
    try { id ? await api.put(`/admin/products/${id}`, fd) : await api.post('/admin/products', fd); toast.success('Product saved'); nav('/admin/products'); } catch (er) { fail(er); } finally { setBusy(false); }
  };
  const inp = (k, props = {}) => <input className="input" value={f[k]} onChange={on(k)} {...props} />;
  return (
    <form onSubmit={submit} className="mx-auto max-w-5xl space-y-6 pb-24">
      <Link to="/admin/products" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600"><FiArrowLeft />Back to products</Link>
      <Section icon={FiInfo} title="Basic information">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Product name (English) *">{inp('name_en', { required: true })}</Field><Field label="পণ্যের নাম (বাংলা)">{inp('name_bn')}</Field><Field label="Brand">{inp('brand')}</Field>
          <Field label="Category *"><select required className="input" value={f.category_id} onChange={on('category_id')}><option value="">Select…</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}</select></Field>
          <Field label="Sub-category"><select className="input" value={f.sub_category_id} onChange={on('sub_category_id')}><option value="">None</option>{subs.filter((s) => s.category_id === +f.category_id).map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}</select></Field>
          <Field label="SKU">{inp('sku')}</Field>
        </div>
      </Section>
      <Section icon={FiDollarSign} title="Pricing & inventory">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Price ৳ *">{inp('price', { type: 'number', step: 'any', required: true, min: 0 })}</Field><Field label="Sale price ৳">{inp('sale_price', { type: 'number', step: 'any', min: 0 })}</Field><Field label="Stock *">{inp('stock', { type: 'number', required: true, min: 0 })}</Field>
          <Field label="Unit (pcs, kg…)">{inp('unit')}</Field><Field label="Weight / Size">{inp('weight')}</Field>
          <div className="flex items-end gap-6 pb-2.5"><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={f.is_featured} onChange={on('is_featured')} />Featured</label>
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={f.is_active} onChange={on('is_active')} />Active</label></div>
        </div>
        <div className="mt-6"><p className="label mb-2">Price by quantity (bulk discount)</p><Pairs arr={tiers} set={setTiers} a="min_qty" b="unit_price" la="Min quantity (e.g. 10)" lb="Unit price ৳" num /></div>
      </Section>
      <Section icon={FiList} title="Product features"><Pairs arr={features} set={setFeatures} a="k" b="v" la="Feature name (e.g. Color)" lb="Value (e.g. Black)" /></Section>
      <Section icon={FiImage} title="Product images">
        <div className="mb-4 flex flex-wrap gap-3">
          {old.filter((o) => !removed.includes(o.id)).map((o) => <div key={o.id} className="group relative"><img src={o.url} className="h-24 w-24 rounded-xl object-cover" /><button type="button" className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow" onClick={() => setRemoved([...removed, o.id])}><FiX size={14} /></button></div>)}
          {files.map((x, i) => <div key={i} className="relative"><img src={URL.createObjectURL(x)} className="h-24 w-24 rounded-xl object-cover ring-2 ring-brand-500" /><button type="button" className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow" onClick={() => setFiles(files.filter((_, j) => j !== i))}><FiX size={14} /></button></div>)}
        </div>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 py-8 text-sm text-slate-500 transition hover:border-brand-500 hover:bg-brand-50/40">
          <FiUploadCloud className="text-3xl text-brand-600" /><span className="font-semibold">Click to upload images</span><span className="text-xs">JPG, PNG, WEBP · max 3MB each · up to 8</span>
          <input type="file" multiple hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => { setFiles([...files, ...e.target.files].slice(0, 8)); e.target.value = ''; }} /></label>
      </Section>
      <Section icon={FiFileText} title="Description (Title, Header, Bold, Lists…)">
        <div className="space-y-6"><Field label="Description (English)"><RichEditor value={f.description_en} onChange={(v) => setF((p) => ({ ...p, description_en: v }))} placeholder="Write product details here. Use the toolbar for Title, Header, Bold, lists…" /></Field>
          <Field label="বিবরণ (বাংলা)"><RichEditor value={f.description_bn} onChange={(v) => setF((p) => ({ ...p, description_bn: v }))} placeholder="এখানে পণ্যের বিবরণ লিখুন…" /></Field></div>
      </Section>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 px-6 py-3 backdrop-blur lg:left-64"><div className="mx-auto flex max-w-5xl justify-end gap-3">
        <Link to="/admin/products" className="btn-ghost">Cancel</Link><button disabled={busy} className="btn-primary"><FiSave />{busy ? 'Saving…' : 'Save product'}</button></div></div>
    </form>
  );
}

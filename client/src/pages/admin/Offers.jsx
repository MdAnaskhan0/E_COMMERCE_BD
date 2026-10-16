import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUploadCloud, FiSave, FiX, FiCalendar, FiTag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { fail } from '../../api';
import Badge from '../../components/Badge';
import RichEditor from '../../components/RichEditor';

const blank = { title_en: '', title_bn: '', summary_en: '', summary_bn: '', description_en: '', description_bn: '', badge: '', coupon_code: '', coupon_type: 'percent', coupon_value: '', coupon_min_order: 0, coupon_max_uses: '', link: '', starts_at: '', ends_at: '', sort_order: 0, is_active: true };
const Field = ({ label, children, hint }) => <div><label className="label mb-1.5 block">{label}</label>{children}{hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}</div>;
const today = () => new Date().toISOString().slice(0, 10);
const state = (o) => (!o.is_active ? ['off', 'Hidden'] : o.ends_at && o.ends_at < today() ? ['cancelled', 'Ended'] : o.starts_at && o.starts_at > today() ? ['processing', 'Scheduled'] : ['on', 'Live']);

export default function Offers() {
  const [rows, setRows] = useState([]); const [f, setF] = useState(blank); const [editing, setEditing] = useState(null); const [file, setFile] = useState(null); const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false);
  const load = () => api.get('/admin/offers').then((r) => setRows(r.data)).catch(fail);
  useEffect(() => { load(); }, []);
  const on = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const close = () => { setOpen(false); setEditing(null); setF(blank); setFile(null); };
  const edit = (o) => { setEditing(o); setF({ ...blank, ...o, coupon_type: o.coupon_type || 'percent', coupon_value: o.coupon_value ?? '', coupon_min_order: o.coupon_min_order ?? 0, coupon_max_uses: o.coupon_max_uses ?? '', starts_at: o.starts_at || '', ends_at: o.ends_at || '', is_active: !!o.is_active }); setFile(null); setOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const body = (o, over = {}) => { const { id, image, created_at, ...rest } = o; return { ...rest, ...over, starts_at: rest.starts_at || null, ends_at: rest.ends_at || null, sort_order: +rest.sort_order || 0, coupon_code: (rest.coupon_code || '').trim().toUpperCase(), coupon_type: rest.coupon_type || 'percent', coupon_value: rest.coupon_value === null || rest.coupon_value === undefined ? '' : rest.coupon_value, coupon_min_order: rest.coupon_min_order || 0, coupon_max_uses: rest.coupon_max_uses ?? '', is_active: (over.is_active ?? rest.is_active) ? 1 : 0 }; };
  const save = async (e) => {
    e.preventDefault(); if (!editing && !file) return toast.error('Please choose an offer image'); setBusy(true);
    const fd = new FormData(); fd.append('data', JSON.stringify(body(f))); if (file) fd.append('image', file);
    try { editing ? await api.put(`/admin/offers/${editing.id}`, fd) : await api.post('/admin/offers', fd); toast.success('Offer saved'); close(); load(); } catch (er) { fail(er); } finally { setBusy(false); }
  };
  const del = async (id) => { if (!confirm('Delete this offer?')) return; try { await api.delete(`/admin/offers/${id}`); toast.success('Deleted'); load(); } catch (e) { fail(e); } };
  const toggle = async (o) => { const fd = new FormData(); fd.append('data', JSON.stringify(body(o, { is_active: !o.is_active }))); try { await api.put(`/admin/offers/${o.id}`, fd); load(); } catch (e) { fail(e); } };
  const preview = file ? URL.createObjectURL(file) : editing?.image;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">Create as many offers as you like. Customers see <b>live</b> offers on the Offers page; clicking a card opens its full details.</p>
        {!open && <button className="btn-primary" onClick={() => setOpen(true)}><FiPlus />New offer</button>}</div>
      {open && <form onSubmit={save} className="card space-y-6 p-6">
        <div className="flex items-center justify-between"><h3 className="text-lg font-bold">{editing ? 'Edit offer' : 'New offer'}</h3><button type="button" onClick={close} className="rounded-lg p-2 hover:bg-slate-100"><FiX /></button></div>
        <label className="relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 text-sm text-slate-500 transition hover:border-brand-500">
          {preview && <img src={preview} className="absolute inset-0 h-full w-full object-cover" />}
          <span className={`relative z-10 flex flex-col items-center gap-1 rounded-xl px-4 py-3 ${preview ? 'bg-slate-900/60 text-white' : ''}`}><FiUploadCloud className="text-3xl" /><b>{preview ? 'Change image' : 'Click to upload offer image'}</b><span className="text-xs opacity-80">Recommended 1200 × 750 px · JPG, PNG, WEBP · max 3MB</span></span>
          <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0] || null)} /></label>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title (English)"><input className="input" maxLength="200" value={f.title_en} onChange={on('title_en')} /></Field><Field label="শিরোনাম (বাংলা)"><input className="input" maxLength="200" value={f.title_bn} onChange={on('title_bn')} /></Field>
          <Field label="Short summary (English)" hint="Shown on the offer card"><input className="input" maxLength="400" value={f.summary_en} onChange={on('summary_en')} /></Field><Field label="সংক্ষিপ্ত বিবরণ (বাংলা)"><input className="input" maxLength="400" value={f.summary_bn} onChange={on('summary_bn')} /></Field>
          <Field label="Badge text" hint="e.g. 50% OFF, Buy 1 Get 1"><input className="input" maxLength="40" value={f.badge} onChange={on('badge')} placeholder="50% OFF" /></Field>
          <Field label="Coupon code (optional)" hint="Saved to the Coupons table automatically so it works at checkout"><input className="input font-mono uppercase" maxLength="40" value={f.coupon_code} onChange={on('coupon_code')} placeholder="EID50" /></Field>
          {f.coupon_code.trim() && <div className="grid gap-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-4 md:col-span-2 md:grid-cols-4">
            <Field label="Discount type"><select className="input" value={f.coupon_type} onChange={on('coupon_type')}><option value="percent">Percent %</option><option value="fixed">Fixed ৳</option></select></Field>
            <Field label="Discount value" hint="Leave empty only if the coupon already exists"><input type="number" min="0" step="any" className="input" value={f.coupon_value} onChange={on('coupon_value')} /></Field>
            <Field label="Min order (৳)"><input type="number" min="0" className="input" value={f.coupon_min_order} onChange={on('coupon_min_order')} /></Field>
            <Field label="Max uses (optional)"><input type="number" min="1" className="input" value={f.coupon_max_uses} onChange={on('coupon_max_uses')} /></Field></div>}
          <Field label="Start date (optional)"><input type="date" className="input" value={f.starts_at} onChange={on('starts_at')} /></Field>
          <Field label="End date (optional)" hint="The offer disappears automatically after this date"><input type="date" className="input" min={f.starts_at || undefined} value={f.ends_at} onChange={on('ends_at')} /></Field>
          <Field label="Button link (optional)" hint="/shop?category=1 or https://… (default: /shop)"><input className="input" value={f.link} onChange={on('link')} placeholder="/shop" /></Field>
          <Field label="Order (0 = first)"><input type="number" min="0" className="input" value={f.sort_order} onChange={on('sort_order')} /></Field>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={f.is_active} onChange={on('is_active')} />Show on website</label>
        </div>
        <div className="space-y-5"><Field label="Full details (English)"><RichEditor value={f.description_en} onChange={(v) => setF((p) => ({ ...p, description_en: v }))} placeholder="Explain the offer: what's included, terms, how to get it…" /></Field>
          <Field label="বিস্তারিত (বাংলা)"><RichEditor value={f.description_bn} onChange={(v) => setF((p) => ({ ...p, description_bn: v }))} placeholder="অফারের বিস্তারিত লিখুন…" /></Field></div>
        <div className="flex justify-end gap-3"><button type="button" className="btn-ghost" onClick={close}>Cancel</button><button disabled={busy} className="btn-primary"><FiSave />{busy ? 'Saving…' : 'Save offer'}</button></div></form>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{rows.map((o) => { const [bs, bl] = state(o); return (
        <div key={o.id} className="card overflow-hidden"><div className="relative aspect-[16/10] bg-slate-100"><img src={o.image} className={`h-full w-full object-cover ${bs === 'on' ? '' : 'opacity-50 grayscale'}`} />
          {o.badge && <span className="absolute left-0 top-4 rounded-r-full bg-gradient-to-r from-rose-500 to-orange-500 py-1 pl-3 pr-4 text-xs font-extrabold text-white shadow">{o.badge}</span>}</div>
          <div className="space-y-2 p-4"><p className="truncate font-bold">{o.title_en || o.title_bn}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500"><Badge s={bs}>{bl}</Badge>{o.coupon_code && <span className="flex items-center gap-1 font-mono font-bold text-brand-600"><FiTag />{o.coupon_code}{o.coupon_value ? ` (${o.coupon_type === 'percent' ? o.coupon_value + '%' : '৳' + o.coupon_value})` : ''}</span>}
              {(o.starts_at || o.ends_at) && <span className="flex items-center gap-1"><FiCalendar />{o.starts_at || '…'} → {o.ends_at || '…'}</span>}</div>
            <div className="flex items-center justify-between pt-1"><label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-500"><input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={!!o.is_active} onChange={() => toggle(o)} />Visible</label>
              <div className="flex gap-1"><button onClick={() => edit(o)} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50"><FiEdit2 /></button><button onClick={() => del(o.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><FiTrash2 /></button></div></div></div></div>); })}</div>
      {rows.length === 0 && !open && <div className="card p-12 text-center text-slate-400">No offers yet. Click “New offer” to create your first one.</div>}
    </div>
  );
}

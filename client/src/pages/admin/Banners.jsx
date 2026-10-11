import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUploadCloud, FiSave, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { fail } from '../../api';
import Badge from '../../components/Badge';

const blank = { title_en: '', title_bn: '', subtitle_en: '', subtitle_bn: '', button_text: '', link: '', sort_order: 0, is_active: true };
const Field = ({ label, children }) => <div><label className="label mb-1.5 block">{label}</label>{children}</div>;

export default function Banners() {
  const [rows, setRows] = useState([]); const [f, setF] = useState(blank); const [editing, setEditing] = useState(null); const [file, setFile] = useState(null); const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false);
  const load = () => api.get('/admin/banners').then((r) => setRows(r.data)).catch(fail);
  useEffect(() => { load(); }, []);
  const on = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const close = () => { setOpen(false); setEditing(null); setF(blank); setFile(null); };
  const edit = (b) => { setEditing(b); setF({ ...blank, ...b, is_active: !!b.is_active }); setFile(null); setOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const save = async (e) => {
    e.preventDefault(); if (!editing && !file) return toast.error('Please choose a slide image'); setBusy(true);
    const { id, image, ...rest } = f; const fd = new FormData(); fd.append('data', JSON.stringify({ ...rest, sort_order: +rest.sort_order || 0, is_active: rest.is_active ? 1 : 0 })); if (file) fd.append('image', file);
    try { editing ? await api.put(`/admin/banners/${editing.id}`, fd) : await api.post('/admin/banners', fd); toast.success('Slide saved'); close(); load(); } catch (er) { fail(er); } finally { setBusy(false); }
  };
  const del = async (id) => { if (!confirm('Delete this slide?')) return; try { await api.delete(`/admin/banners/${id}`); toast.success('Deleted'); load(); } catch (e) { fail(e); } };
  const toggle = async (b) => { const { id, image, ...rest } = b; const fd = new FormData(); fd.append('data', JSON.stringify({ ...rest, is_active: b.is_active ? 0 : 1 })); try { await api.put(`/admin/banners/${id}`, fd); load(); } catch (e) { fail(e); } };
  const preview = file ? URL.createObjectURL(file) : editing?.image;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">Home page slider · up to <b>5</b> slides ({rows.length}/5) · recommended image size <b>1600 × 600 px</b></p>
        {!open && <button disabled={rows.length >= 5} className="btn-primary" onClick={() => setOpen(true)}><FiPlus />Add slide</button>}</div>
      {open && <form onSubmit={save} className="card space-y-5 p-6">
        <div className="flex items-center justify-between"><h3 className="font-bold">{editing ? 'Edit slide' : 'New slide'}</h3><button type="button" onClick={close} className="rounded-lg p-2 hover:bg-slate-100"><FiX /></button></div>
        <label className="relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 text-sm text-slate-500 transition hover:border-brand-500">
          {preview ? <img src={preview} className="absolute inset-0 h-full w-full object-cover" /> : null}
          <span className={`relative z-10 flex flex-col items-center gap-1 rounded-xl px-4 py-3 ${preview ? 'bg-slate-900/60 text-white' : ''}`}><FiUploadCloud className="text-3xl" /><b>{preview ? 'Change image' : 'Click to upload slide image'}</b><span className="text-xs opacity-80">JPG, PNG, WEBP · max 3MB</span></span>
          <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0] || null)} /></label>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Title (English)"><input className="input" maxLength="150" value={f.title_en} onChange={on('title_en')} /></Field><Field label="শিরোনাম (বাংলা)"><input className="input" maxLength="150" value={f.title_bn} onChange={on('title_bn')} /></Field>
          <Field label="Subtitle (English)"><input className="input" maxLength="300" value={f.subtitle_en} onChange={on('subtitle_en')} /></Field><Field label="সাব-টাইটেল (বাংলা)"><input className="input" maxLength="300" value={f.subtitle_bn} onChange={on('subtitle_bn')} /></Field>
          <Field label="Button text"><input className="input" maxLength="40" value={f.button_text} onChange={on('button_text')} placeholder="Shop Now" /></Field><Field label="Button link (/shop or https://…)"><input className="input" value={f.link} onChange={on('link')} placeholder="/shop?category=1" /></Field>
          <Field label="Order (0 = first)"><input type="number" min="0" className="input" value={f.sort_order} onChange={on('sort_order')} /></Field>
          <label className="flex items-center gap-2 pt-7 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={f.is_active} onChange={on('is_active')} />Show on website</label></div>
        <div className="flex justify-end gap-3"><button type="button" className="btn-ghost" onClick={close}>Cancel</button><button disabled={busy} className="btn-primary"><FiSave />{busy ? 'Saving…' : 'Save slide'}</button></div></form>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{rows.map((b) => (
        <div key={b.id} className="card overflow-hidden"><div className="relative aspect-[8/3] bg-slate-100"><img src={b.image} className={`h-full w-full object-cover ${b.is_active ? '' : 'opacity-40 grayscale'}`} />
          <span className="absolute left-3 top-3 rounded-full bg-slate-900/70 px-2.5 py-0.5 text-xs font-bold text-white">#{b.sort_order}</span></div>
          <div className="p-4"><p className="truncate font-bold">{b.title_en || b.title_bn || '(no title)'}</p><p className="truncate text-xs text-slate-500">{b.subtitle_en || b.subtitle_bn}</p>
            <div className="mt-3 flex items-center justify-between"><Badge s={b.is_active ? 'on' : 'off'}>{b.is_active ? 'Visible' : 'Hidden'}</Badge>
              <div className="flex gap-1"><button title="Show / hide" onClick={() => toggle(b)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">{b.is_active ? <FiEyeOff /> : <FiEye />}</button><button onClick={() => edit(b)} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50"><FiEdit2 /></button><button onClick={() => del(b.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><FiTrash2 /></button></div></div></div></div>))}</div>
      {rows.length === 0 && !open && <div className="card p-12 text-center text-slate-400">No slides yet. The default banner is shown on the home page until you add one.</div>}
    </div>
  );
}

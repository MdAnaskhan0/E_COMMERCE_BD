import { useEffect, useState } from 'react';
import { FiInfo, FiFileText, FiShield, FiRefreshCw, FiSave, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { fail } from '../../api';
import RichEditor from '../../components/RichEditor';
import Spinner from '../../components/Spinner';

const META = { about: ['About Us', FiInfo, '/about'], terms: ['Terms & Conditions', FiFileText, '/terms'], privacy: ['Privacy Policy', FiShield, '/privacy'], refund: ['Refund & Return Policy', FiRefreshCw, '/refund'] };

function Editor({ page, onSaved }) {
  const [f, setF] = useState(page); const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault(); setBusy(true); const { slug, updated_at, ...body } = f;
    try { await api.put(`/admin/pages/${slug}`, body); toast.success('Page saved'); onSaved(); } catch (er) { fail(er); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="card space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div><label className="label mb-1.5 block">Page title (English)</label><input required className="input" value={f.title_en} onChange={(e) => setF({ ...f, title_en: e.target.value })} /></div>
        <div><label className="label mb-1.5 block">পেজের শিরোনাম (বাংলা)</label><input className="input" value={f.title_bn} onChange={(e) => setF({ ...f, title_bn: e.target.value })} /></div>
      </div>
      <div><label className="label mb-1.5 block">Content (English)</label><RichEditor value={f.content_en} onChange={(v) => setF((p) => ({ ...p, content_en: v }))} placeholder="Write the page content…" /></div>
      <div><label className="label mb-1.5 block">বিষয়বস্তু (বাংলা)</label><RichEditor value={f.content_bn} onChange={(v) => setF((p) => ({ ...p, content_bn: v }))} placeholder="পেজের বিষয়বস্তু লিখুন…" /></div>
      <div className="flex justify-end"><button disabled={busy} className="btn-primary"><FiSave />{busy ? 'Saving…' : 'Save page'}</button></div>
    </form>
  );
}

export default function Pages() {
  const [rows, setRows] = useState(null); const [slug, setSlug] = useState('about');
  const load = () => api.get('/admin/pages').then((r) => setRows(r.data)).catch(fail);
  useEffect(() => { load(); }, []);
  if (!rows) return <Spinner />;
  const page = rows.find((r) => r.slug === slug);
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800"><b>Starter text is included</b> for each page. Please read and edit it so it matches your real business (delivery times, return days, contact rules). It is a general template, not legal advice.</div>
      <div className="flex flex-wrap gap-2">{Object.entries(META).map(([k, [l, I]]) => <button key={k} onClick={() => setSlug(k)} className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${slug === k ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}><I />{l}</button>)}
        <a href={META[slug][2]} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-brand-600"><FiExternalLink />View page</a></div>
      {page && <Editor key={slug + page.updated_at} page={page} onSaved={load} />}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api, { fail } from '../../api';

// Reusable admin CRUD: title, endpoint, columns [{key,label,render}], fields [{key,label,type,options,def}]
export default function CrudPage({ title, endpoint, columns, fields, extra }) {
  const blank = Object.fromEntries(fields.map((f) => [f.key, f.def ?? '']));
  const [rows, setRows] = useState([]); const [f, setF] = useState(blank); const [editing, setEditing] = useState(null);
  const load = () => api.get(`/admin/${endpoint}`).then((r) => setRows(r.data)).catch(fail);
  useEffect(() => { load(); }, [endpoint]);
  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...f }; fields.forEach((x) => { if (x.type === 'select-num') body[x.key] = +body[x.key]; if (x.type === 'check') body[x.key] = body[x.key] ? 1 : 0; if (x.nullable && body[x.key] === '') body[x.key] = null; });
      editing ? await api.put(`/admin/${endpoint}/${editing}`, body) : await api.post(`/admin/${endpoint}`, body);
      toast.success('Saved'); setF(blank); setEditing(null); load();
    } catch (er) { fail(er); }
  };
  const del = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/admin/${endpoint}/${id}`); load(); } catch (er) { fail(er); } };
  return (
    <div className="space-y-4">
      
      <form onSubmit={save} className="card grid gap-4 p-6 sm:grid-cols-3">
        {fields.map((x) => (
          <div key={x.key}><label className="label">{x.label}</label>
            {x.type === 'select' || x.type === 'select-num' ? <select required={!x.nullable} className="input" value={f[x.key]} onChange={(e) => setF({ ...f, [x.key]: e.target.value })}><option value="">--</option>{x.options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
              : x.type === 'check' ? <input type="checkbox" checked={!!f[x.key]} onChange={(e) => setF({ ...f, [x.key]: e.target.checked })} />
              : <input required={x.required} type={x.type || 'text'} step="any" className="input" value={f[x.key] ?? ''} onChange={(e) => setF({ ...f, [x.key]: e.target.value })} />}
          </div>))}
        <div className="flex items-end gap-2"><button className="btn-primary">{editing ? 'Update' : 'Add'}</button>{editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setF(blank); }}>Cancel</button>}</div>
      </form>
      <div className="card overflow-x-auto"><table className="tbl">
        <thead className="bg-slate-50 text-left"><tr>{columns.map((c) => <th key={c.key} className="p-3">{c.label}</th>)}<th className="p-3" /></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className="border-t">{columns.map((c) => <td key={c.key} className="p-3">{c.render ? c.render(r) : String(r[c.key] ?? '')}</td>)}
          <td className="space-x-2 p-3 text-right"><button className="text-brand-600" onClick={() => { setEditing(r.id); setF(Object.fromEntries(fields.map((x) => [x.key, r[x.key] ?? (x.def ?? '')]))); }}>Edit</button><button className="text-red-500" onClick={() => del(r.id)}>Delete</button></td></tr>)}</tbody>
      </table></div>{extra}
    </div>
  );
}

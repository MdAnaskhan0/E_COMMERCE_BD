import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api, { fail } from '../../api';
import CrudPage from './CrudPage';
import Pager from '../../components/Pager';
import usePaged from '../../usePaged';

const yn = (r) => (r.is_active ? '✅' : '❌');
const names = [{ key: 'name_en', label: 'Name (English)', required: true }, { key: 'name_bn', label: 'নাম (বাংলা)' }, { key: 'is_active', label: 'Active', type: 'check', def: 1 }];
export const Categories = () => <CrudPage title="Product Categories" endpoint="categories" fields={names} columns={[{ key: 'name_en', label: 'English' }, { key: 'name_bn', label: 'বাংলা' }, { key: 'is_active', label: 'Active', render: yn }]} />;

export function SubCategories() {
  const [cats, setCats] = useState([]);
  useEffect(() => { api.get('/admin/categories').then((r) => setCats(r.data)); }, []);
  return <CrudPage title="Product Sub-Categories" endpoint="sub-categories" fields={[{ key: 'category_id', label: 'Category', type: 'select-num', options: cats.map((c) => ({ v: c.id, l: c.name_en })) }, ...names]}
    columns={[{ key: 'category_id', label: 'Category', render: (r) => cats.find((c) => c.id === r.category_id)?.name_en }, { key: 'name_en', label: 'English' }, { key: 'name_bn', label: 'বাংলা' }, { key: 'is_active', label: 'Active', render: yn }]} />;
}
export const Coupons = () => <CrudPage title="Coupons" endpoint="coupons"
  fields={[{ key: 'code', label: 'Code', required: true }, { key: 'type', label: 'Type', type: 'select', options: [{ v: 'percent', l: 'Percent %' }, { v: 'fixed', l: 'Fixed ৳' }] }, { key: 'value', label: 'Value', type: 'number', required: true },
    { key: 'min_order', label: 'Min order', type: 'number', def: 0 }, { key: 'max_uses', label: 'Max uses', type: 'number', nullable: true }, { key: 'expires_at', label: 'Expires', type: 'date', nullable: true }, { key: 'is_active', label: 'Active', type: 'check', def: 1 }]}
  columns={[{ key: 'code', label: 'Code' }, { key: 'type', label: 'Type' }, { key: 'value', label: 'Value' }, { key: 'used_count', label: 'Used' }, { key: 'is_active', label: 'Active', render: yn }]} />;

export function Users() {
  const [s, setS] = useState(''); const pg = usePaged('/admin/users', { q: s, limit: 15 }); const load = pg.reload;
  const upd = async (u, patch) => { try { await api.put(`/admin/users/${u.id}`, { role: u.role, is_active: u.is_active, ...patch }); toast.success('Updated'); load(); } catch (e) { fail(e); } };
  return (
    <div className="space-y-4">
      <input className="input max-w-sm" placeholder="Search name / email / phone" value={s} onChange={(e) => setS(e.target.value)} />
      <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="tbl"><thead className="bg-slate-50 text-left"><tr>{['Name', 'Email', 'Phone', 'Role', 'Active'].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
        <tbody>{pg.items.map((u) => <tr key={u.id} className="border-t"><td className="p-3">{u.name}</td><td>{u.email}</td><td>{u.phone}</td>
          <td><select className="input !w-28" value={u.role} onChange={(e) => upd(u, { role: e.target.value })}><option>customer</option><option>admin</option></select></td>
          <td><input type="checkbox" checked={!!u.is_active} onChange={(e) => upd(u, { is_active: e.target.checked ? 1 : 0 })} /></td></tr>)}</tbody></table></div>
        <Pager page={pg.page} pages={pg.pages} total={pg.total} limit={pg.limit} onPage={pg.setPage} /></div></div>
  );
}

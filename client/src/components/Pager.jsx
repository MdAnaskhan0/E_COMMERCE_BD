import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Numbered pager used by the admin lists: "Showing 21-40 of 130", Prev, 1 … 4 5 6 … 9, Next
export default function Pager({ page, pages, total, limit, onPage }) {
  if (!total) return null;
  const from = (page - 1) * limit + 1, to = Math.min(total, page * limit);
  const nums = []; for (let n = 1; n <= pages; n++) if (n === 1 || n === pages || Math.abs(n - page) <= 1) nums.push(n); else if (nums[nums.length - 1] !== '…') nums.push('…');
  const b = 'flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-semibold transition';
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
      <p className="text-xs text-slate-500">Showing <b>{from}–{to}</b> of <b>{total}</b></p>
      {pages > 1 && <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className={`${b} border border-slate-200 hover:border-brand-500 disabled:opacity-40`} aria-label="Previous"><FiChevronLeft /></button>
        {nums.map((n, i) => n === '…' ? <span key={i} className="px-1 text-slate-400">…</span> : <button key={n} onClick={() => onPage(n)} className={`${b} ${n === page ? 'bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/30' : 'border border-slate-200 hover:border-brand-500'}`}>{n}</button>)}
        <button disabled={page >= pages} onClick={() => onPage(page + 1)} className={`${b} border border-slate-200 hover:border-brand-500 disabled:opacity-40`} aria-label="Next"><FiChevronRight /></button></div>}
    </div>
  );
}

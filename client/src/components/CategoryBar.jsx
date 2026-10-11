import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiHome, FiGrid } from 'react-icons/fi';
import { useT } from '../i18n';

// One clean, scrollable row of category pills (no dropdowns). Arrows appear only when the row overflows.
export default function CategoryBar({ cats }) {
  const { t, pick } = useT(); const ref = useRef(null); const loc = useLocation(); const [sp] = useSearchParams(); const [edge, setEdge] = useState({ l: false, r: false });
  const check = () => { const e = ref.current; if (e) setEdge({ l: e.scrollLeft > 8, r: e.scrollLeft + e.clientWidth < e.scrollWidth - 8 }); };
  useEffect(() => { check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check); }, [cats]);
  const scroll = (d) => ref.current?.scrollBy({ left: d * 280, behavior: 'smooth' });
  const onShop = loc.pathname === '/shop'; const cur = onShop ? sp.get('category') : null;
  const pill = (on) => `flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ${on ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/25' : 'bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600'}`;
  const Arrow = ({ side, show }) => show && (
    <button aria-label={side < 0 ? 'Scroll left' : 'Scroll right'} onClick={() => scroll(side)} className={`absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-600 shadow-md ring-1 ring-slate-200 transition hover:bg-brand-600 hover:text-white ${side < 0 ? 'left-0' : 'right-0'}`}>{side < 0 ? <FiChevronLeft /> : <FiChevronRight />}</button>);
  return (
    <div className="relative isolate z-0 min-w-0 flex-1">
      <Arrow side={-1} show={edge.l} /><Arrow side={1} show={edge.r} />
      {edge.l && <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-14 bg-gradient-to-r from-white to-transparent" />}
      {edge.r && <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-14 bg-gradient-to-l from-white to-transparent" />}
      <div ref={ref} onScroll={check} className="no-scrollbar flex items-center gap-2 overflow-x-auto scroll-smooth py-2.5">
        <Link to="/" className={pill(loc.pathname === '/')}><FiHome size={14} />{t('home')}</Link>
        <Link to="/shop" className={pill(onShop && !cur)}><FiGrid size={14} />{t('all')}</Link>
        {cats.map((c) => <Link key={c.id} to={`/shop?category=${c.id}`} className={pill(String(c.id) === cur)}>{pick(c, 'name')}</Link>)}
      </div>
    </div>
  );
}

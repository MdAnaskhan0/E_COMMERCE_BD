import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiUsers, FiTag, FiLayers, FiBox, FiShoppingBag, FiPercent, FiStar, FiSettings, FiExternalLink, FiMenu, FiX, FiImage } from 'react-icons/fi';

const nav = [['/admin', FiGrid, 'Dashboard', true], ['/admin/orders', FiShoppingBag, 'Orders'], ['/admin/banners', FiImage, 'Home Slider'], ['/admin/products', FiBox, 'Products'], ['/admin/categories', FiTag, 'Categories'], ['/admin/sub-categories', FiLayers, 'Sub-Categories'],
  ['/admin/users', FiUsers, 'Users'], ['/admin/coupons', FiPercent, 'Coupons'], ['/admin/reviews', FiStar, 'Reviews'], ['/admin/shop-info', FiSettings, 'Shop Info']];
export default function AdminLayout() {
  const [open, setOpen] = useState(false); const loc = useLocation(); const user = useSelector((s) => s.auth.user); const shop = useSelector((s) => s.ui.shop);
  const title = nav.find(([to, , , end]) => (end ? loc.pathname === to : loc.pathname.startsWith(to)))?.[2] || 'Admin';
  const Side = (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 p-4 text-slate-300">
      <div className="mb-8 px-2">{shop?.logo ? <div className="rounded-2xl bg-white p-2"><img src={shop.logo} alt={shop.shop_name} className="mx-auto h-16 max-w-full object-contain" /></div>
        : <div className="flex items-center gap-2.5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white"><FiShoppingBag /></span><div><p className="font-extrabold leading-tight text-white">{shop?.shop_name || 'Shop'}</p><p className="text-[11px] uppercase tracking-widest text-slate-500">Admin</p></div></div>}</div>
      <nav className="flex-1 space-y-1">{nav.map(([to, I, l, end]) => <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
        className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${isActive ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/30' : 'hover:bg-white/5 hover:text-white'}`}><I size={18} />{l}</NavLink>)}</nav>
      <Link to="/" className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-sm hover:bg-white/5"><FiExternalLink />View website</Link>
    </div>
  );
  return (
    <div className="flex min-h-screen bg-slate-100/70">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{Side}</aside>
      <AnimatePresence>{open && <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
        <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">{Side}</motion.aside></>}</AnimatePresence>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/70 bg-white/80 px-5 py-3.5 backdrop-blur-xl">
          <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(!open)}>{open ? <FiX /> : <FiMenu />}</button>
          <h1 className="text-lg font-extrabold tracking-tight">{title}</h1>
          <div className="ml-auto flex items-center gap-3"><div className="text-right text-xs leading-tight"><p className="font-bold">{user?.name}</p><p className="text-slate-500">{user?.email}</p></div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-violet-600 font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span></div>
        </header>
        <motion.main key={loc.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 lg:p-8"><Outlet /></motion.main>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { FiShoppingBag, FiUser, FiSearch, FiMenu, FiX, FiFacebook, FiInstagram, FiYoutube, FiPhone, FiMapPin, FiMail, FiLogOut, FiGrid, FiArrowUp, FiTruck, FiChevronDown } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { setLang, setUser } from '../store';
import { useT } from '../i18n';
import api from '../api';
import Logo from './Logo';
import CategoryBar from './CategoryBar';
import { toast } from 'react-toastify';

export default function Layout() {
  const { t, lang, pick } = useT(); const d = useDispatch(); const nav = useNavigate(); const loc = useLocation();
  const { user } = useSelector((s) => s.auth); const shop = useSelector((s) => s.ui.shop);
  const count = useSelector((s) => s.cart.items.reduce((a, i) => a + i.qty, 0));
  const [open, setOpen] = useState(false); const [menu, setMenu] = useState(false); const [term, setTerm] = useState(''); const [cat, setCat] = useState(''); const [cats, setCats] = useState([]); const [top, setTop] = useState(false);
  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)); }, []);
  useEffect(() => { setOpen(false); setMenu(false); window.scrollTo(0, 0); }, [loc.pathname]);
  useEffect(() => { const f = () => setTop(window.scrollY > 500); window.addEventListener('scroll', f); return () => window.removeEventListener('scroll', f); }, []);
  const logout = async () => { await api.post('/auth/logout'); d(setUser(null)); toast.info('Signed out'); nav('/'); };
  const search = (e) => { e.preventDefault(); const p = new URLSearchParams(); if (term) p.set('q', term); if (cat) p.set('category', cat); nav(`/shop?${p}`); };
  const nl = ({ isActive }) => `relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition ${isActive ? 'text-brand-600 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand-600' : 'text-slate-600 hover:text-brand-600'}`;
  const SearchBar = (
    <form onSubmit={search} className="flex w-full items-center overflow-hidden rounded-full border-2 border-slate-200 bg-white shadow-sm transition focus-within:border-brand-500 focus-within:shadow-lg focus-within:shadow-brand-600/10">
      <div className="relative hidden border-r border-slate-200 sm:block">
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-11 max-w-[150px] cursor-pointer appearance-none bg-transparent pl-4 pr-8 text-sm font-medium text-slate-600 outline-none">
          <option value="">{t('allCats')}</option>{cats.map((c) => <option key={c.id} value={c.id}>{pick(c, 'name')}</option>)}</select>
        <FiChevronDown className="pointer-events-none absolute right-2.5 top-3.5 text-slate-400" /></div>
      <input className="h-11 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none" placeholder={t('search')} value={term} onChange={(e) => setTerm(e.target.value)} />
      <button className="m-1 flex h-9 w-11 items-center justify-center rounded-full bg-gradient-to-r from-brand-600 to-violet-600 text-white transition hover:brightness-110"><FiSearch /></button>
    </form>);
  return (
    <div className="flex min-h-screen flex-col">
      <div className="hidden bg-slate-900 text-xs text-slate-300 md:block"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <span className="flex items-center gap-2 truncate"><FiTruck className="text-brand-500" />{shop?.notice}</span>
        <div className="flex items-center gap-5">{shop?.phone && <span className="flex items-center gap-1.5"><FiPhone />{shop.phone}</span>}
          <button onClick={() => d(setLang(lang === 'en' ? 'bn' : 'en'))} className="rounded-full bg-white/10 px-3 py-0.5 font-bold text-white transition hover:bg-brand-600">{lang === 'en' ? 'বাংলা' : 'English'}</button></div></div></div>
      <header className="sticky top-0 z-40 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <button className="rounded-xl p-2 hover:bg-slate-100 md:hidden" onClick={() => setOpen(!open)}>{open ? <FiX size={22} /> : <FiMenu size={22} />}</button>
          <Logo />
          <div className="mx-6 hidden max-w-2xl flex-1 md:block">{SearchBar}</div>
          <div className="ml-auto flex items-center gap-1.5">
            <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold transition hover:border-brand-500 hover:text-brand-600 md:hidden" onClick={() => d(setLang(lang === 'en' ? 'bn' : 'en'))}>{lang === 'en' ? 'বাংলা' : 'EN'}</button>
            <Link to="/cart" className="relative flex items-center gap-2 rounded-2xl px-3 py-2 transition hover:bg-slate-100"><span className="relative"><FiShoppingBag size={22} />
              <AnimatePresence>{count > 0 && <motion.span key={count} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-1 text-[10px] font-bold text-white">{count}</motion.span>}</AnimatePresence></span>
              <span className="hidden text-sm font-semibold lg:block">{t('cart')}</span></Link>
            {user ? (
              <div className="relative z-50">
                <button onClick={() => setMenu(!menu)} className="flex items-center gap-2 rounded-2xl px-2 py-1.5 transition hover:bg-slate-100"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-violet-600 text-sm font-bold text-white">{user.name[0].toUpperCase()}</span><FiChevronDown className="hidden text-slate-400 lg:block" /></button>
                <AnimatePresence>{menu && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card absolute right-0 z-50 mt-2 w-60 overflow-hidden py-1">
                  <div className="border-b px-4 py-3"><p className="text-sm font-bold">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
                  <Link className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50" to="/dashboard"><FiUser />{t('dashboard')}</Link>
                  {user.role === 'admin' && <Link className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50" to="/admin"><FiGrid />{t('admin')}</Link>}
                  <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50" onClick={logout}><FiLogOut />{t('logout')}</button></motion.div>}</AnimatePresence>
              </div>
            ) : <Link to="/login" className="btn-primary !rounded-full !py-2.5"><FiUser />{t('login')}</Link>}
          </div>
        </div>
        <div className="px-4 pb-3 md:hidden">{SearchBar}</div>
        <nav className="hidden border-t border-slate-100 bg-white md:block"><div className="mx-auto flex max-w-7xl items-center gap-4 px-4">
          <CategoryBar cats={cats} />
          <NavLink to="/track" className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-brand-500 hover:text-brand-600"><FiTruck size={14} />{t('track')}</NavLink></div></nav>
        <AnimatePresence>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="max-h-[70vh] overflow-y-auto border-t md:hidden">
          {[['/', t('home')], ['/shop', t('shop')]].map(([to, l]) => <Link key={to} to={to} className="block px-5 py-3 text-sm font-semibold hover:bg-slate-50">{l}</Link>)}
          <p className="bg-slate-50 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('categories')}</p>
          <div className="flex flex-wrap gap-2 p-4">{cats.map((c) => <Link key={c.id} to={`/shop?category=${c.id}`} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-brand-50 hover:text-brand-600">{pick(c, 'name')}</Link>)}</div>
          {[['/track', t('track')], ['/cart', t('cart')]].map(([to, l]) => <Link key={to} to={to} className="block border-t px-5 py-3 text-sm font-semibold hover:bg-slate-50">{l}</Link>)}
        </motion.div>}</AnimatePresence>
      </header>
      <AnimatePresence mode="wait"><motion.main key={loc.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex-1"><Outlet /></motion.main></AnimatePresence>
      <footer className="mt-20 bg-gradient-to-b from-slate-900 to-slate-950 text-sm text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
          <div className="md:col-span-2"><div className="inline-block rounded-2xl bg-white/95 p-2"><Logo className="h-14 max-w-[200px]" /></div><p className="mt-4 max-w-sm">{t('trustLine')}</p>
            <div className="mt-4 flex gap-3 text-lg">{[[shop?.facebook, FiFacebook], [shop?.instagram, FiInstagram], [shop?.youtube, FiYoutube], [shop?.whatsapp, FaWhatsapp]].map(([u, I], i) => u && <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-200 transition hover:bg-brand-600"><I /></a>)}</div></div>
          <div><h5 className="mb-3 font-bold text-white">{t('quickLinks')}</h5><div className="flex flex-col gap-2"><Link className="hover:text-white" to="/shop">{t('shop')}</Link><Link className="hover:text-white" to="/track">{t('track')}</Link><Link className="hover:text-white" to="/cart">{t('cart')}</Link></div></div>
          <div><h5 className="mb-3 font-bold text-white">{t('contact')}</h5><div className="space-y-2">
            {shop?.address && <p className="flex gap-2"><FiMapPin className="mt-1 shrink-0" />{shop.address}</p>}{shop?.phone && <p className="flex gap-2"><FiPhone className="mt-1" />{shop.phone}</p>}{shop?.email && <p className="flex gap-2"><FiMail className="mt-1" />{shop.email}</p>}</div></div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-xs">© {new Date().getFullYear()} {shop?.shop_name}. All rights reserved.</div>
      </footer>
      <AnimatePresence>{top && <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn-primary fixed bottom-6 right-6 z-40 !rounded-full !p-3"><FiArrowUp /></motion.button>}</AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { FiShoppingBag, FiUser, FiSearch, FiMenu, FiX, FiFacebook, FiInstagram, FiYoutube, FiPhone, FiMapPin, FiMail, FiLogOut, FiGrid, FiBox, FiArrowUp } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { setLang, setUser } from '../store';
import { useT } from '../i18n';
import api from '../api';
import { toast } from 'react-toastify';

export default function Layout() {
  const { t, lang } = useT(); const d = useDispatch(); const nav = useNavigate(); const loc = useLocation();
  const { user } = useSelector((s) => s.auth); const shop = useSelector((s) => s.ui.shop);
  const count = useSelector((s) => s.cart.items.reduce((a, i) => a + i.qty, 0));
  const [open, setOpen] = useState(false); const [menu, setMenu] = useState(false); const [term, setTerm] = useState(''); const [top, setTop] = useState(false);
  useEffect(() => { setOpen(false); setMenu(false); window.scrollTo(0, 0); }, [loc.pathname]);
  useEffect(() => { const f = () => setTop(window.scrollY > 500); window.addEventListener('scroll', f); return () => window.removeEventListener('scroll', f); }, []);
  const logout = async () => { await api.post('/auth/logout'); d(setUser(null)); toast.info('Signed out'); nav('/'); };
  const link = ({ isActive }) => `relative px-3 py-2 text-sm font-semibold transition ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'}`;
  const search = (e) => { e.preventDefault(); nav(`/shop?q=${encodeURIComponent(term)}`); };
  return (
    <div className="flex min-h-screen flex-col">
      {shop?.notice && <div className="bg-gradient-to-r from-brand-700 via-violet-600 to-brand-700 py-2 text-center text-xs font-medium text-white">{shop.notice}</div>}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button className="rounded-lg p-2 hover:bg-slate-100 md:hidden" onClick={() => setOpen(!open)}>{open ? <FiX size={20} /> : <FiMenu size={20} />}</button>
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
            {shop?.logo ? <img src={shop.logo} alt="" className="h-9 w-9 rounded-xl object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white"><FiShoppingBag /></span>}
            <span className="bg-gradient-to-r from-brand-700 to-violet-600 bg-clip-text text-transparent">{shop?.shop_name || 'Shop'}</span>
          </Link>
          <nav className="ml-6 hidden md:flex"><NavLink to="/" end className={link}>{t('home')}</NavLink><NavLink to="/shop" className={link}>{t('shop')}</NavLink><NavLink to="/track" className={link}>{t('track')}</NavLink></nav>
          <form className="ml-auto hidden max-w-sm flex-1 sm:block" onSubmit={search}>
            <div className="relative"><FiSearch className="absolute left-3.5 top-3 text-slate-400" /><input className="input !rounded-full pl-10" placeholder={t('search')} value={term} onChange={(e) => setTerm(e.target.value)} /></div>
          </form>
          <button className="ml-auto rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold transition hover:border-brand-500 hover:text-brand-600 sm:ml-0" onClick={() => d(setLang(lang === 'en' ? 'bn' : 'en'))}>{lang === 'en' ? 'বাংলা' : 'EN'}</button>
          <Link to="/cart" className="relative rounded-full p-2.5 transition hover:bg-slate-100"><FiShoppingBag size={20} />
            <AnimatePresence>{count > 0 && <motion.span key={count} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-1 text-[10px] font-bold text-white">{count}</motion.span>}</AnimatePresence></Link>
          {user ? (
            <div className="relative">
              <button onClick={() => setMenu(!menu)} className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-violet-600 text-sm font-bold text-white">{user.name[0].toUpperCase()}</button>
              <AnimatePresence>{menu && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card absolute right-0 mt-2 w-56 overflow-hidden py-1">
                <div className="border-b px-4 py-3"><p className="text-sm font-bold">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
                <Link className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50" to="/dashboard"><FiUser />{t('dashboard')}</Link>
                {user.role === 'admin' && <Link className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50" to="/admin"><FiGrid />{t('admin')}</Link>}
                <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50" onClick={logout}><FiLogOut />{t('logout')}</button>
              </motion.div>}</AnimatePresence>
            </div>
          ) : <Link to="/login" className="btn-primary !rounded-full !py-2">{t('login')}</Link>}
        </div>
        <AnimatePresence>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t md:hidden">
          <form className="p-3" onSubmit={search}><input className="input !rounded-full" placeholder={t('search')} value={term} onChange={(e) => setTerm(e.target.value)} /></form>
          {[['/', t('home')], ['/shop', t('shop')], ['/track', t('track')], ['/cart', t('cart')]].map(([to, l]) => <NavLink key={to} to={to} className="block px-5 py-3 text-sm font-semibold hover:bg-slate-50">{l}</NavLink>)}
        </motion.div>}</AnimatePresence>
      </header>
      <AnimatePresence mode="wait"><motion.main key={loc.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex-1"><Outlet /></motion.main></AnimatePresence>
      <footer className="mt-20 bg-gradient-to-b from-slate-900 to-slate-950 text-sm text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
          <div className="md:col-span-2"><h4 className="mb-3 text-xl font-extrabold text-white">{shop?.shop_name}</h4><p className="max-w-sm">{t('trustLine')}</p>
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

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiShoppingBag, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { fail } from '../api';
import { setUser } from '../store';
import { useT } from '../i18n';

export default function Login({ register }) {
  const { t } = useT(); const d = useDispatch(); const nav = useNavigate(); const shop = useSelector((s) => s.ui.shop);
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' }); const [busy, setBusy] = useState(false); const [show, setShow] = useState(false);
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const { data } = await api.post(register ? '/auth/register' : '/auth/login', register ? f : { email: f.email, password: f.password }); d(setUser(data.user)); toast.success(`${t('hello')} ${data.user.name}`); nav(data.user.role === 'admin' ? '/admin' : '/dashboard'); }
    catch (er) { fail(er); } finally { setBusy(false); }
  };
  const Ic = ({ I, children }) => <div className="relative"><I className="absolute left-3.5 top-3.5 text-slate-400" />{children}</div>;
  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden px-4 py-10 md:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden rounded-l-3xl bg-gradient-to-br from-brand-700 via-violet-700 to-fuchsia-600 p-10 text-white md:flex">
        <div className="float absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl"><FiShoppingBag /></span>
        <div><h2 className="text-3xl font-extrabold leading-tight">{shop?.shop_name}</h2><p className="mt-3 text-white/80">{t('heroSub')}</p></div>
        <p className="text-sm text-white/70">{t('trustLine')}</p>
      </div>
      <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={submit} className="card space-y-4 rounded-3xl p-8 md:rounded-l-none">
        <div><h2 className="text-2xl font-extrabold">{register ? t('createAcc') : t('welcomeBack')}</h2><p className="text-sm text-slate-500">{register ? t('register') : t('login')}</p></div>
        {register && <><Ic I={FiUser}><input required minLength="2" className="input pl-10" placeholder={t('name')} value={f.name} onChange={on('name')} /></Ic>
          <Ic I={FiPhone}><input required className="input pl-10" placeholder="01XXXXXXXXX" pattern="^(\+?88)?01[3-9]\d{8}$" value={f.phone} onChange={on('phone')} /></Ic></>}
        <Ic I={FiMail}><input required type="email" className="input pl-10" placeholder={t('email')} value={f.email} onChange={on('email')} /></Ic>
        <Ic I={FiLock}><input required type={show ? 'text' : 'password'} minLength="8" className="input pl-10 pr-10" placeholder={t('password')} autoComplete={register ? 'new-password' : 'current-password'} value={f.password} onChange={on('password')} />
          <button type="button" className="absolute right-3 top-3.5 text-slate-400" onClick={() => setShow(!show)}>{show ? <FiEyeOff /> : <FiEye />}</button></Ic>
        {register && <p className="text-xs text-slate-500">8+ chars, letter + number</p>}
        <button disabled={busy} className="btn-primary w-full !py-3">{busy ? '...' : register ? t('register') : t('login')}</button>
        <p className="text-center text-sm">{register ? t('haveAccount') : t('noAccount')} <Link className="font-bold text-brand-600" to={register ? '/login' : '/register'}>{register ? t('login') : t('register')}</Link></p>
      </motion.form>
    </div>
  );
}

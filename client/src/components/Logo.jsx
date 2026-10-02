import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiShoppingBag } from 'react-icons/fi';

// If a logo image exists -> show ONLY the big logo (no site name). Otherwise icon + site name.
export default function Logo({ className = 'h-14 md:h-16 max-w-[240px]', dark = false, to = '/' }) {
  const shop = useSelector((s) => s.ui.shop);
  return (
    <Link to={to} className="flex shrink-0 items-center gap-2.5">
      {shop?.logo ? <img src={shop.logo} alt={shop.shop_name} className={`${className} object-contain`} />
        : <><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-xl text-white shadow-lg shadow-brand-600/30"><FiShoppingBag /></span>
          <span className={`text-xl font-extrabold tracking-tight ${dark ? 'text-white' : 'bg-gradient-to-r from-brand-700 to-violet-600 bg-clip-text text-transparent'}`}>{shop?.shop_name || 'Shop'}</span></>}
    </Link>
  );
}

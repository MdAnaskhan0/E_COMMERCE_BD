import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, fetchShop } from './store';
import Layout from './components/Layout';
import Spinner from './components/Spinner';
import Home from './pages/Home';
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Offers = lazy(() => import('./pages/Offers'));
const OfferDetail = lazy(() => import('./pages/OfferDetail'));
const InfoPage = lazy(() => import('./pages/InfoPage'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Products = lazy(() => import('./pages/admin/Products'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminOffers = lazy(() => import('./pages/admin/Offers'));
const AdminPages = lazy(() => import('./pages/admin/Pages'));
const Banners = lazy(() => import('./pages/admin/Banners'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const Reviews = lazy(() => import('./pages/admin/Reviews'));
const ShopInfo = lazy(() => import('./pages/admin/ShopInfo'));
const { Categories, SubCategories, Coupons, Users } = { Categories: lazy(() => import('./pages/admin/Simple').then((m) => ({ default: m.Categories }))),
  SubCategories: lazy(() => import('./pages/admin/Simple').then((m) => ({ default: m.SubCategories }))), Coupons: lazy(() => import('./pages/admin/Simple').then((m) => ({ default: m.Coupons }))),
  Users: lazy(() => import('./pages/admin/Simple').then((m) => ({ default: m.Users }))) };

const Guard = ({ admin, children }) => {
  const { user, ready } = useSelector((s) => s.auth);
  if (!ready) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const d = useDispatch(); const shop = useSelector((s) => s.ui.shop);
  useEffect(() => { d(fetchMe()); d(fetchShop()); }, [d]);
  useEffect(() => { if (shop) document.title = shop.shop_name; }, [shop]);
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="offers" element={<Offers />} />
          <Route path="offers/:id" element={<OfferDetail />} />
          <Route path="about" element={<InfoPage slug="about" />} />
          <Route path="terms" element={<InfoPage slug="terms" />} />
          <Route path="privacy" element={<InfoPage slug="privacy" />} />
          <Route path="refund" element={<InfoPage slug="refund" />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="track" element={<TrackOrder />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Login register />} />
          <Route path="dashboard" element={<Guard><Dashboard /></Guard>} />
        </Route>
        <Route path="admin" element={<Guard admin><AdminLayout /></Guard>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="categories" element={<Categories />} />
          <Route path="sub-categories" element={<SubCategories />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="banners" element={<Banners />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="shop-info" element={<ShopInfo />} />
        </Route>
        <Route path="*" element={<div className="p-20 text-center text-2xl font-bold">404</div>} />
      </Routes>
    </Suspense>
  );
}

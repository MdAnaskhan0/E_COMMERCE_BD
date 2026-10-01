import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchMe = createAsyncThunk('auth/me', async () => (await api.get('/auth/me')).data.user);
export const fetchShop = createAsyncThunk('ui/shop', async () => (await api.get('/shop-info')).data);

const auth = createSlice({ name: 'auth', initialState: { user: null, ready: false }, reducers: { setUser: (s, a) => { s.user = a.payload; } },
  extraReducers: (b) => b.addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; s.ready = true; }).addCase(fetchMe.rejected, (s) => { s.ready = true; }) });

const ui = createSlice({ name: 'ui', initialState: { lang: localStorage.getItem('lang') || 'en', shop: null },
  reducers: { setLang: (s, a) => { s.lang = a.payload; localStorage.setItem('lang', a.payload); document.documentElement.lang = a.payload; } },
  extraReducers: (b) => b.addCase(fetchShop.fulfilled, (s, a) => { s.shop = a.payload; }) });

const saved = JSON.parse(localStorage.getItem('cart') || '[]');
const cart = createSlice({ name: 'cart', initialState: { items: saved }, reducers: {
  addItem: (s, { payload: { p, qty } }) => {
    const ex = s.items.find((i) => i.id === p.id);
    if (ex) ex.qty = Math.min(p.stock, ex.qty + qty);
    else s.items.push({ id: p.id, name_en: p.name_en, name_bn: p.name_bn, image: p.image || p.images?.[0]?.url, price: p.price, sale_price: p.sale_price, stock: p.stock, tiers: p.tiers || [], qty: Math.min(p.stock, qty) });
  },
  setQty: (s, { payload: { id, qty } }) => { const i = s.items.find((x) => x.id === id); if (i) i.qty = Math.max(1, Math.min(i.stock, qty)); },
  removeItem: (s, a) => { s.items = s.items.filter((i) => i.id !== a.payload); },
  clearCart: (s) => { s.items = []; },
} });

export const { setUser } = auth.actions; export const { setLang } = ui.actions;
export const { addItem, setQty, removeItem, clearCart } = cart.actions;
export const unitPrice = (i) => { const t = [...(i.tiers || [])].sort((a, b) => b.min_qty - a.min_qty).find((x) => i.qty >= x.min_qty); return t ? t.unit_price : i.sale_price ?? i.price; };
export const store = configureStore({ reducer: { auth: auth.reducer, ui: ui.reducer, cart: cart.reducer } });
store.subscribe(() => localStorage.setItem('cart', JSON.stringify(store.getState().cart.items)));

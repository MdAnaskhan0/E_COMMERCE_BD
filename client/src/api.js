import axios from 'axios';
import { toast } from 'react-toastify';
const api = axios.create({ baseURL: '/api', withCredentials: true, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
export const errMsg = (e) => e.response?.data?.message || 'Something went wrong';
export const img = (u) => u || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>';
export const fail = (e) => toast.error(errMsg(e));
export default api;

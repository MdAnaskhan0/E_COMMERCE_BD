import nodemailer from 'nodemailer';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function sendOrderEmail(order, items) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ORDER_NOTIFY_EMAIL } = process.env;
  const rows = items.map((i) => `<tr><td>${esc(i.product_name)}</td><td align="center">${i.quantity}</td><td align="right">৳${i.line_total}</td></tr>`).join('');
  const html = `<meta charset="utf-8"><div style="font-family:Arial,'Noto Sans Bengali',sans-serif;max-width:560px">
  <h2>New Order: ${esc(order.order_no)}</h2>
  <p><b>Customer:</b> ${esc(order.customer_name)}<br><b>Phone:</b> ${esc(order.customer_phone)}<br><b>Address:</b> ${esc(order.address_line)}, ${esc(order.city)}</p>
  <table width="100%" cellpadding="6" border="1" style="border-collapse:collapse"><tr><th align="left">Product</th><th>Qty</th><th align="right">Price</th></tr>${rows}</table>
  <h3>Total: ৳${order.total}</h3><p>Payment: ${esc(order.payment_method)}</p></div>`;
  if (!SMTP_USER || !SMTP_PASS) { console.log('[mail] SMTP not configured. Order email skipped:', order.order_no); return; }
  const t = nodemailer.createTransport({ host: SMTP_HOST, port: +SMTP_PORT, secure: +SMTP_PORT === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
  await t.sendMail({ from: `"Shop Orders" <${SMTP_USER}>`, to: ORDER_NOTIFY_EMAIL || 'anaskhan.shikho@gmail.com', subject: `New Order ${order.order_no} - ${order.customer_name}`, html });
}

# E-Commerce Project (React + Node/Express + MySQL) — Bangla + English

## Structure
```
ecommerce/
├── database/schema.sql   # MySQL tables (utf8mb4 = Bangla safe)
├── server/               # Node + Express API  (http://localhost:5000)
└── client/               # React Vite + Tailwind (http://localhost:5173)
```

## A. One-time installs (Windows 10)
1. **Node.js LTS** (v20+): https://nodejs.org  → check: `node -v`
2. **Laragon Full**: https://laragon.org  → open Laragon → **Start All** (MySQL runs on port 3306, user `root`, empty password).
3. (Optional) VS Code.

## B. Create the database
1. Laragon → **Database** button (HeidiSQL) → connect (root, no password).
2. File → **Load SQL file** → `database/schema.sql` → press **F9**.
   (Or Laragon menu → MySQL → open terminal: `mysql -u root < database\schema.sql`)

## C. Run the backend
Open **PowerShell** in the `server` folder:
```powershell
cd server
npm install
copy .env.example .env
```
Edit `.env`:
- `JWT_SECRET` → run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` and paste the output.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` → your admin login (use a strong password).
- Email notification (Gmail): turn on 2-Step Verification → Google Account → Security → **App passwords** → create one.
  Put your Gmail in `SMTP_USER` and the 16-char app password in `SMTP_PASS`.
  Orders are mailed to `ORDER_NOTIFY_EMAIL` (already `anaskhan.shikho@gmail.com`).
```powershell
npm run seed      # creates admin + sample categories + coupon WELCOME10
npm run dev       # API on http://localhost:5000
```

## D. Run the frontend
Open a **second** PowerShell:
```powershell
cd client
npm install
npm run dev       # http://localhost:5173
```

## E. First use
1. Open http://localhost:5173/login → sign in with the admin email/password → **Admin Panel** (user menu).
2. Admin → **Shop Info**: logo, address, phone, social links, notice, shipping fee.
3. Admin → Categories → Sub-Categories → **Products** (Bangla + English name, dynamic features, price-by-quantity, multiple images).
4. Place a test order from the website (guest or account) → email arrives, admin sees it in **Orders**; change status/payment and the customer sees it in **Track Order**.

## Bangla + English
- Header button **বাংলা / EN** switches the interface (saved in browser).
- Fonts: *Inter* (English) + *Noto Sans Bengali* (Bangla), bundled locally (works offline, no Google Fonts).
- Products/categories have `name_en` + `name_bn` and `description_en` + `description_bn`; the site shows Bangla when selected (falls back to English).
- Database is `utf8mb4`, so Bangla is stored correctly.

## Security implemented
| Area | Protection |
|---|---|
| Passwords | bcrypt (cost 12), min 8 chars with letter+number |
| Sessions | JWT in **httpOnly, SameSite** cookie (JS/XSS cannot read it), `secure` in production |
| SQL Injection | 100% parameterised queries; sort columns whitelisted |
| Validation | Zod schemas on every input; server-side |
| Brute force | Rate limit: 15 login/register tries per 15 min, 200 API calls/min |
| CSRF | SameSite cookie + required `X-Requested-With` header + CORS allow-list |
| Headers | Helmet (CSP-ready, no-sniff, HSTS…), `x-powered-by` off, HPP |
| Prices | Recomputed on server (cart prices, bulk tiers, coupon, shipping) — never trusted from browser |
| Orders | Transaction + row lock (no overselling), stock restored on cancel |
| Guest tracking | Needs order number **and** phone |
| Uploads | Only JPG/PNG/WEBP, 3MB, random filenames, MIME allow-list |
| Access control | Admin routes need role=admin checked from DB on every request |
| Errors | No stack traces / internals leaked |
| Email | All customer text HTML-escaped |

## Before going live
- `NODE_ENV=production`, HTTPS, set `CLIENT_URL` to your domain, strong `JWT_SECRET`, non-root MySQL user.
- Build the client: `npm run build` (serve `client/dist` via Nginx/IIS and proxy `/api` + `/uploads` to port 5000).
- Change the seeded admin password; back up MySQL regularly.

## Troubleshooting
- `ECONNREFUSED 3306` → Laragon MySQL not started.
- `Access denied for user root` → set `DB_PASSWORD` in `.env`.
- Bangla shows `???` → re-import `schema.sql` (must be utf8mb4).
- Email not arriving → check Gmail App Password; server logs `[mail]` errors.
- Blocked (CSRF) / 401 on API → use the Vite dev URL (5173) so the proxy works.








## Problem have to solved
  - logo image size need more bigger, If have image the Site Name should not be shown
  - Product Page Side bar need to be UI change 
  - Navbar and Search bar need to be UI change 
  - Order Track no need Phobe number just track with only order number
  - Order status can't update backword.
  - Product Card, Single Product Page UI need to be change.
  - Checkout Page: Payment option not Dropdown use radio, If select Bkash/Nagad get a popup screen show amount to pay and Bkash/Nagad Number and get Transaction ID by input. Admin will check Transaction ID and update Payment Status.
  - Admin Panel Order Manage Page UI need to be update like click on the order and the order manage page will come then he will update order/payment status.

  solved the issue on 02/10/2026

## next work:
  - In header we see category I want to change the UI Category, here not showing all category here want to see all category and dropdown every subcategory. 

  - In Hero/Banner are I want a Slider here and 4/5 Slider image will be show here which can be managed by admin in admin panel. Banner Text and image is ok now.

  -  Home Page UI need to be change Look more professional to show the product.

  - Change Product Card UI Design look more professional and intersting.

  - Single product page UI need more professional and Intersting
    - "Details" showing simple text but need more professional like when write description here can Bold, Title, Header. 
    - Feature page show 2 column but I want in single collumn. 


## next work:
  - Offers (Letest Offer) Page, admin can create multiple offer, user show offer Card when click on a offer show full details, Manage by admin panel.
  - About Us Page
  - Terms and Condition Page
  - Privicy and Policy
  - Refund and Return Policy
  - Footer UI need to be change and professional UI look like , About Us, Terms and condition, Privicy and Policy, Refund and return policy those page link use in footer not in the navbar.



## next work:
  - Footer UI need to be change quick link and information Just simple text no icon or hifen need.
  - Layout.jsx : this notice give a written animation 
    <span className="flex items-center gap-2 truncate">
        <FiTruck className="text-brand-500" />
        {shop?.notice}
    </span>

## next work:
  - Product Page show pagination or load more button so that server don't send all product data it will be crush server when user is more.
  - Coupon is not save in database.
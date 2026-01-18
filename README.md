# Lagos Service Hub

Marketplace + escrow platform for Lagos-based services where **buyers hire verified sellers**, pay a **deposit into escrow**, chat, submit satisfaction reports, and admins manage verification/disputes.

## Core Features
- **Auth**: register/login, role-based access (buyer/seller/admin)
- **Browse Sellers**: filter by profession/area/rating and view seller profiles
- **Jobs + Escrow**: buyers create jobs, pay deposit via Paystack, track job status
- **Chat**: simplified production chat via HTTP polling (no Socket.IO required)
- **Seller Onboarding**: profile setup, ID upload + portfolio upload (Supabase Storage)
- **Admin**: verification queue, escrow management, disputes, reports
- **Themes**: theme switcher with persistence (localStorage)

## Pages (Routes)
This app uses **HashRouter** for production-safe routing on Vercel. That means:
- `/browse` becomes `/#/browse`
- `/register` becomes `/#/register`

**Public**
- `/#/` Home
- `/#/browse` Browse sellers
- `/#/login` Login
- `/#/register` Register
- `/#/sellers/:id` Seller profile

**Buyer**
- `/#/buyer` Buyer dashboard
- `/#/jobs/:id` Job details
- `/#/payment/:id` Pay deposit (Paystack)
- `/#/chat/:jobId` Chat (polling)
- `/#/buyer/profile` Profile
- `/#/buyer/settings` Settings

**Seller**
- `/#/seller` Seller dashboard
- `/#/onboarding` Seller onboarding
- `/#/seller/profile` Edit profile
- `/#/seller/earnings` Earnings
- `/#/seller/settings` Settings

**Admin**
- `/#/admin` Admin dashboard
- `/#/admin/verifications` Verification queue
- `/#/admin/escrow` Escrow management
- `/#/admin/disputes` Disputes
- `/#/admin/reports` Reports

## API
- Backend is an Express app in [server](file:///c:/Users/user/Desktop/Lagos%20Service%20Hub/server).
- On Vercel, requests to `/api/*` are handled by [api/[...path].js](file:///c:/Users/user/Desktop/Lagos%20Service%20Hub/api/%5B...path%5D.js).

Health check:
- `GET /api/health` → `{ "ok": true }`

## Local Development
### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
npm run dev
```

## Environment Variables
### Frontend (Vercel)
- `VITE_API_URL=https://YOUR_DOMAIN` (no `/api` suffix)

### Backend (Vercel)
- `DATABASE_URL=postgresql://...` (Supabase Postgres)
- `JWT_SECRET=...` (32+ chars)
- `JWT_REFRESH_SECRET=...` (32+ chars)
- `FRONTEND_URL=https://YOUR_DOMAIN`  
  - Supports multiple origins: `https://domain1.com,https://domain2.com`
- `SUPABASE_URL=https://xxxxx.supabase.co`
- `SUPABASE_KEY=SUPABASE_SERVICE_ROLE_KEY` (server-only, keep secret)
- `PAYSTACK_SECRET_KEY=sk_test_...` or `sk_live_...`
- `PAYSTACK_WEBHOOK_SECRET=...` (often same as Paystack secret key)

## Deployment
- Simplified (Vercel-only, no Socket.IO): [DEPLOYMENT.md](file:///c:/Users/user/Desktop/Lagos%20Service%20Hub/DEPLOYMENT.md)
- Full realtime (Socket.IO on Render/Railway): [DEPLOYMENT_FULL_SOCKETIO.md](file:///c:/Users/user/Desktop/Lagos%20Service%20Hub/DEPLOYMENT_FULL_SOCKETIO.md)

## Tech Stack
- React 18 + Vite
- Tailwind CSS (CSS variables for theme colors)
- Framer Motion (animations)
- React Router v6
- Express + Prisma schema (DB created via Supabase SQL Editor script)
- Supabase (Postgres + Storage)
- Paystack (payments)

## Themes
- Light (Gold & Blue)
- Dark (Gold & Blue)
- Midnight
- Ocean Breeze
- Warm Night
- Sunset Gold

## Notes
- Theme persists in localStorage and applies via an `html` class (`theme-*`).
- Place your logo at `public/logo.png` and update the Header logo usage if needed.

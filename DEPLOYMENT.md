# DEPLOYMENT (Simplified - Vercel Only, No Socket.IO)

This guide deploys the **simplified version** (chat via **HTTP polling** every 5 seconds) to **Vercel only**. Socket.IO code is preserved in the repo, but **disabled** in the main server entrypoint for this deployment.

## What You’re Deploying
- **Frontend (Vite/React)**: served as static files by Vercel
- **Backend (Express API)**: deployed as a Vercel Serverless Function, mounted under `/api/*`
- **Chat**: HTTP endpoints + polling (no WebSockets)

## Prerequisites
- Node.js 18+
- A Vercel account (free tier is fine)
- A Supabase account (Postgres database + Storage)
- A Paystack account (test keys are fine)

---

## 1) Supabase Setup (Database + Storage)

### A. Create a Supabase project
1. Go to Supabase → **New project**
2. Choose a region close to your users
3. Save your project password somewhere safe

### B. Get your Postgres connection string
1. Supabase → **Project Settings** → **Database**
2. Copy a connection string and use it for `DATABASE_URL`
   - If you see an option for **Connection Pooler / Transaction Pooling**, prefer that for serverless deployments.

### C. Create tables using Supabase SQL Editor (cloud-only workflow)
1. Supabase → **SQL Editor**
2. Click **New query**
3. Copy the entire SQL script below
4. Paste into Supabase SQL Editor
5. Click **Run** (run it once on a fresh database)

```sql
-- Lagos Service Hub schema (from Prisma) - Supabase/PostgreSQL
-- Paste the whole script into Supabase SQL Editor and run once.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'Role') then
    create type "Role" as enum ('buyer', 'seller', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'VerificationStatus') then
    create type "VerificationStatus" as enum ('pending', 'approved', 'rejected');
  end if;

  if not exists (select 1 from pg_type where typname = 'JobStatus') then
    create type "JobStatus" as enum (
      'proposed',
      'funded',
      'in_progress',
      'partial_completed',
      'completed',
      'disputed',
      'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'PaymentType') then
    create type "PaymentType" as enum ('deposit', 'payout', 'refund');
  end if;

  if not exists (select 1 from pg_type where typname = 'PaymentStatus') then
    create type "PaymentStatus" as enum ('pending', 'succeeded', 'failed', 'refunded');
  end if;
end $$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

create table if not exists "User" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "email" text not null,
  "passwordHash" text not null,
  "role" "Role" not null,
  "address" jsonb not null,
  "verified" boolean not null default false,
  "avatar" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "User_email_key" unique ("email")
);

create index if not exists "User_email_idx" on "User" ("email");
create index if not exists "User_role_idx" on "User" ("role");

create trigger "User_set_updatedAt"
before update on "User"
for each row
execute function set_updated_at();

create table if not exists "SellerProfile" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" uuid not null,
  "category" text not null,
  "summary" text not null,
  "portfolioImages" text[] not null default '{}'::text[],
  "idDocumentUrl" text,
  "testimonials" jsonb[] not null default '{}'::jsonb[],
  "rating" double precision not null default 0,
  "reviewsCount" integer not null default 0,
  "verificationStatus" "VerificationStatus" not null default 'pending',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "SellerProfile_userId_key" unique ("userId"),
  constraint "SellerProfile_userId_fkey"
    foreign key ("userId") references "User" ("id")
    on delete cascade on update cascade
);

create index if not exists "SellerProfile_userId_idx" on "SellerProfile" ("userId");
create index if not exists "SellerProfile_category_idx" on "SellerProfile" ("category");
create index if not exists "SellerProfile_rating_idx" on "SellerProfile" ("rating");

create trigger "SellerProfile_set_updatedAt"
before update on "SellerProfile"
for each row
execute function set_updated_at();

create table if not exists "Job" (
  "id" uuid primary key default gen_random_uuid(),
  "buyerId" uuid not null,
  "sellerId" uuid not null,
  "title" text not null,
  "description" text not null,
  "agreedAmount" double precision not null,
  "depositAmount" double precision not null,
  "platformCommission" double precision not null,
  "status" "JobStatus" not null default 'proposed',
  "satisfactionReports" jsonb[] not null default '{}'::jsonb[],
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "Job_buyerId_fkey"
    foreign key ("buyerId") references "User" ("id")
    on delete restrict on update cascade,
  constraint "Job_sellerId_fkey"
    foreign key ("sellerId") references "User" ("id")
    on delete restrict on update cascade
);

create index if not exists "Job_buyerId_idx" on "Job" ("buyerId");
create index if not exists "Job_sellerId_idx" on "Job" ("sellerId");
create index if not exists "Job_status_idx" on "Job" ("status");

create trigger "Job_set_updatedAt"
before update on "Job"
for each row
execute function set_updated_at();

create table if not exists "PaymentTransaction" (
  "id" uuid primary key default gen_random_uuid(),
  "jobId" uuid not null,
  "amount" double precision not null,
  "currency" text not null default 'NGN',
  "type" "PaymentType" not null,
  "status" "PaymentStatus" not null default 'pending',
  "providerReference" text not null,
  "paystackData" jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "PaymentTransaction_providerReference_key" unique ("providerReference"),
  constraint "PaymentTransaction_jobId_fkey"
    foreign key ("jobId") references "Job" ("id")
    on delete cascade on update cascade
);

create index if not exists "PaymentTransaction_jobId_idx" on "PaymentTransaction" ("jobId");
create index if not exists "PaymentTransaction_providerReference_idx" on "PaymentTransaction" ("providerReference");

create trigger "PaymentTransaction_set_updatedAt"
before update on "PaymentTransaction"
for each row
execute function set_updated_at();

create table if not exists "ChatMessage" (
  "id" uuid primary key default gen_random_uuid(),
  "jobId" uuid not null,
  "fromUserId" uuid not null,
  "toUserId" uuid not null,
  "messageText" text not null,
  "attachments" text[] not null default '{}'::text[],
  "readAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  constraint "ChatMessage_jobId_fkey"
    foreign key ("jobId") references "Job" ("id")
    on delete cascade on update cascade,
  constraint "ChatMessage_fromUserId_fkey"
    foreign key ("fromUserId") references "User" ("id")
    on delete restrict on update cascade,
  constraint "ChatMessage_toUserId_fkey"
    foreign key ("toUserId") references "User" ("id")
    on delete restrict on update cascade
);

create index if not exists "ChatMessage_jobId_idx" on "ChatMessage" ("jobId");

create table if not exists "AuditLog" (
  "id" uuid primary key default gen_random_uuid(),
  "action" text not null,
  "userId" uuid,
  "adminId" uuid,
  "jobId" uuid,
  "details" jsonb not null,
  "createdAt" timestamptz not null default now(),
  constraint "AuditLog_userId_fkey"
    foreign key ("userId") references "User" ("id")
    on delete set null on update cascade,
  constraint "AuditLog_adminId_fkey"
    foreign key ("adminId") references "User" ("id")
    on delete set null on update cascade,
  constraint "AuditLog_jobId_fkey"
    foreign key ("jobId") references "Job" ("id")
    on delete set null on update cascade
);




### D. Create a Storage bucket for chat attachments
1. Supabase → **Storage** → **New bucket**
2. Bucket name: `chat-files`
3. Keep it **private** (recommended)

---

## 2) Paystack Setup (Keys + Webhook)

### A. Get API keys
Paystack → **Settings** → **API Keys & Webhooks**
- `PAYSTACK_SECRET_KEY` = your secret key (starts with `sk_...`)

### B. Configure webhook URL
After you deploy, set your webhook to:
```
https://YOUR_VERCEL_DOMAIN.vercel.app/api/payments/webhook
```

### C. Webhook signature secret
This project expects:
- `PAYSTACK_WEBHOOK_SECRET`

Most teams set:
- `PAYSTACK_WEBHOOK_SECRET = PAYSTACK_SECRET_KEY`

---

## 3) Vercel Deployment (Single Project)

This repo is configured so Vercel serves:
- `/api/*` → backend
- everything else → frontend SPA

### A. Import the repo into Vercel
1. Vercel Dashboard → **Add New…** → **Project**
2. Import your GitHub repository
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`

### B. Add Environment Variables in Vercel
Vercel Project → **Settings** → **Environment Variables**
**Backend (Server)**
- `DATABASE_URL` = Supabase Postgres connection string
- `JWT_SECRET` = random long string (at least 32 chars)
- `JWT_REFRESH_SECRET` = random long string (at least 32 chars)
- `FRONTEND_URL` = `https://YOUR_VERCEL_DOMAIN.vercel.app`
- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_KEY` = Supabase **Service Role** key (keep secret)
- `PAYSTACK_SECRET_KEY` = Paystack secret key
- `PAYSTACK_WEBHOOK_SECRET` = webhook HMAC secret (often same as `PAYSTACK_SECRET_KEY`)

**Frontend (Vite)**
- `VITE_API_URL` = `https://YOUR_VERCEL_DOMAIN.vercel.app`

### C. Deploy
1. Click **Deploy**
2. After deploy, open:
   - Health check: `https://YOUR_VERCEL_DOMAIN.vercel.app/api/health`

---

## 4) Local Run (Optional, Before Deploy)

### Backend
```bash
cd server
npm install
npm run dev
```
Backend runs at `http://localhost:3000`

### Frontend
```bash
npm install
npm run dev
```
Frontend runs at the Vite URL shown in your terminal (usually `http://localhost:5173`)

For local dev, set:
- `VITE_API_URL=http://localhost:3000`
- `FRONTEND_URL=http://localhost:5173`

---

## Free vs Paid (Rough Guide)

**Free (typical for MVP testing)**
- Vercel Free: host frontend + serverless API (fair-use limits)
- Supabase Free: small Postgres + limited Storage + limited egress
- Paystack: no monthly fee to start (but transaction fees apply)

**Usually costs money later**
- Higher Supabase tiers (more DB size, more connections, higher bandwidth)
- A dedicated Socket.IO server (Render/Railway) for realtime chat
- Higher Vercel usage (more builds, bandwidth, function invocations)

# DEPLOYMENT (Full - Socket.IO for Production Later)

This guide explains how to upgrade from the **simplified polling chat** to the **full realtime Socket.IO chat**.

## Why Split the Deployment?
Vercel Serverless Functions are a great fit for REST APIs, but **WebSockets** (Socket.IO) are not a good match for Vercel’s serverless runtime. The production approach is:
- **API (Express)** → Vercel
- **Socket.IO server** → Render or Railway (always-on server)
- **Frontend (Vite)** → Vercel

---

## 1) Current State in This Repo

### Simplified (Vercel-safe)
- The API runs without Socket.IO.
- The frontend chat polls:
  - `GET /api/chats/jobs/:jobId/messages` every 5 seconds
  - Sends messages with `POST /api/chats/messages`

### Socket.IO code preserved (for later)
- Socket handlers are in: `server/socket/`
- A production Socket.IO entrypoint is in: `server/socket-io-version/socketServer.js`
- The Socket.IO wiring in `server/index.js` is also preserved (disabled) with markers:
  - `// SOCKET.IO - UNCOMMENT FOR PRODUCTION`

---

## 2) Deploy the API to Vercel (Same as Simplified)

Follow [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Supabase DB + bucket
- Paystack webhook
- Vercel env vars

Your API base remains:
```
https://YOUR_VERCEL_DOMAIN.vercel.app/api
```

---

## 3) Deploy the Socket.IO Server (Render/Railway)

### Option A: Render (typical ~ $7/month)
1. Create a new **Web Service**
2. Connect the same GitHub repo
3. Set **Root Directory** to `server`
4. Build command:
```bash
npm install
```
5. Start command:
```bash
node socket-io-version/socketServer.js
```

### Option B: Railway (similar pricing)
1. New Project → Deploy from GitHub
2. Set service root to `server`
3. Use start command:
```bash
node socket-io-version/socketServer.js
```

### IMPORTANT: Keep Vercel API simplified, run Socket.IO separately
- Vercel: keep the API as-is (Socket.IO disabled)
- Render/Railway: run `server/socket-io-version/socketServer.js` (Socket.IO enabled)

---

## 4) Environment Variables (API vs Socket Server)

### A. Vercel (API)
Use the same vars as in DEPLOYMENT.md:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_WEBHOOK_SECRET`

### B. Render/Railway (Socket.IO Server)
Socket server needs:
- `DATABASE_URL` (same as API)
- `JWT_SECRET` (must match the API)
- `FRONTEND_URL` (your Vercel frontend URL)

Optional but recommended:
- `NODE_ENV=production`
- `PORT` (Render/Railway sets this automatically)

---

## 5) Frontend Switch: Polling → Socket.IO

### A. Add Socket server URL
In Vercel Frontend env vars:
- `VITE_SOCKET_URL` = `https://YOUR_RENDER_OR_RAILWAY_SOCKET_DOMAIN`

### B. Update the Chat UI
Switch the chat page from polling back to Socket.IO:
- Connect to `VITE_SOCKET_URL`
- Use events:
  - `join_room`
  - `send_message`
  - `receive_message`

---

## 6) Migration Steps (Simplified → Full)

1. Keep the API on Vercel exactly as-is.
2. Deploy the Socket server on Render/Railway (with Socket.IO enabled).
3. Set `VITE_SOCKET_URL` in the frontend.
4. Update the Chat UI back to Socket.IO events.
5. Verify:
   - messages persist in the database (they do)
   - realtime updates work between two logged-in users

No database migration is required: the simplified and full versions use the same `ChatMessage` table.

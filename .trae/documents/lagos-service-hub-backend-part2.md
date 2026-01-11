## Current State (What I Found)

* Frontend uses local-only data via [mockData.js](file:///c:/Users/user/Desktop/Lagos%20Service%20Hub/src/services/mockData.js) and localStorage-based auth via [AuthContext.jsx](file:///c:/Users/user/Desktop/Lagos%20Service%20Hub/src/contexts/AuthContext.jsx).

* There is no `src/services/api.js` yet.

* Backend Part 1 exists in `server/` with Prisma schema, JWT cookies, users/sellers/jobs/ratings routes.

## Step 1: Paystack Payments (Deposit + Webhook + Verify)

* **Add new server modules**

  * `server/routes/payments.js`

  * `server/controllers/paymentsController.js`

  * `server/services/paystack.js` (axios wrapper: initialize, verify, transfer, refund)

  * `server/middleware/paystackWebhook.js` (raw-body capture + signature verification)

  * `server/services/auditLog.js` (central helper to create `AuditLog` entries)

* **Update server bootstrap**

  * Mount `/api/payments` in `server/index.js`.

  * Add a JSON raw-body capture only for webhook route so HMAC is computed on the exact payload bytes.

* **Endpoints**

  * `POST /api/payments/initialize`

    * Buyer-only, job must belong to buyer, status must be `proposed`.

    * Compute `depositAmount = agreedAmount * 0.70`.

    * Call Paystack `POST https://api.paystack.co/transaction/initialize` with `Authorization: Bearer PAYSTACK_SECRET_KEY` (Paystack rejects requests without this header).

    * Create `PaymentTransaction` (type `deposit`, status `pending`, providerReference = paystack reference).

    * Return `{ authorization_url, reference }`.

  * `POST /api/payments/webhook`

    * Verify signature: `crypto.createHmac('sha512', PAYSTACK_WEBHOOK_SECRET).update(rawBody).digest('hex')`.

    * Idempotency: if `PaymentTransaction.providerReference` already processed as succeeded, do nothing.

    * On `charge.success`: mark transaction `succeeded`, set job status `funded`, write `AuditLog`.

  * `GET /api/payments/verify/:reference`

    * Call Paystack verify endpoint and reconcile local `PaymentTransaction` status.

* **Rules**

  * Never trust frontend amounts.

  * All financial actions logged to `AuditLog`.

  * Provider reference uniqueness enforced.

## Step 2: Real-time Chat (Socket.IO + Persistence)

* **Add dependencies (server/package.json)**

  * `socket.io`

* **Socket server setup**

  * Update `server/index.js` to create HTTP server and attach Socket.IO.

  * Socket auth: verify JWT from cookie or `Authorization: Bearer` in the handshake and set `socket.user`.

* **Socket events**

  * `join_room({ jobId })`: verify user is buyer/seller on the job; then `socket.join(jobId)`.

  * `send_message({ jobId, toUserId, text, attachments })`:

    * Validate membership + sanitize text.

    * Persist to `ChatMessage`.

    * Emit `receive_message` to room.

  * `typing({ jobId, isTyping })`: broadcast to room.

* **REST endpoints**

  * `GET /api/chats/jobs/:jobId/messages` (paged history)

  * `PATCH /api/chats/messages/:id/read`

  * `POST /api/chats/jobs/:jobId/attachment` (upload to Supabase bucket `chat-files`, return signed URL)

* **Supabase changes**

  * Extend `server/services/supabaseStorage.js` to support **signed URLs** for private buckets.

## Step 3: Admin APIs (Verification + Escrow + Disputes + Reports)

* **Add routes/controllers**

  * `server/routes/admin.js`

  * `server/controllers/admin/*` (verifications, escrow, disputes, reports)

* **Verification**

  * `GET /api/admin/verifications` (SellerProfile where `verificationStatus=pending`)

  * `POST /api/admin/verifications/:sellerId/approve`:

    * Set `SellerProfile.verificationStatus=approved` and `User.verified=true`, log.

  * `POST /api/admin/verifications/:sellerId/reject`:

    * Set status rejected, log reason.

* **Escrow**

  * `GET /api/admin/escrow` (jobs `partial_completed`)

  * `POST /api/admin/escrow/:jobId/release`:

    * Ensure last satisfaction report percentage ≥ 50.

    * Compute payout `agreedAmount - platformCommission`.

    * Call Paystack transfer API.

    * Create `PaymentTransaction` type `payout`.

    * Update job status `completed`.

    * Audit log everything.

* **Disputes**

  * `GET /api/admin/disputes` (jobs `disputed`)

  * `POST /api/admin/disputes/:jobId/resolve`:

    * Actions: `full_refund`, `partial_refund`, `release_to_seller`.

    * Create refund transaction if needed and call Paystack refund/transfer accordingly.

    * Log notes in `AuditLog.details`.

* **Reports**

  * `GET /api/admin/reports?from&to[&format=csv]`:

    * Aggregate totals from `PaymentTransaction` and `Job`.

    * Revenue by category via `Job -> seller -> sellerProfile.category`.

    * CSV output when requested.

## Step 4: File Upload Buckets + Signed URLs

* Buckets:

  * public: `avatars`, `portfolios`

  * private: `id-documents`, `chat-files`

* Ensure uploads validate type/size (already), then:

  * public files return public URL

  * private files return signed URL (1 hour)

* Add optional basic image compression step (server-side) only if library already approved/available; otherwise defer.

## Step 5: Frontend Integration (Replace mockData)

* Add `src/services/api.js` (fetch wrapper with `credentials: 'include'`, consistent error mapping).

* Update `AuthContext.jsx`:

  * Replace localStorage auth with `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/refresh`.

* Replace mockData usage in pages incrementally:

  * Browse sellers → `/api/sellers`

  * Seller profile → `/api/sellers/:id`

  * Job request/create → `/api/jobs`

  * Job details/status/satisfaction → `/api/jobs/:id`, `/api/jobs/:id/status`, `/api/jobs/:id/satisfaction`

  * Payments page → `/api/payments/initialize` then redirect to Paystack `authorization_url`

  * Chat page → socket.io + `/api/chats/...` for history

  * Admin pages → `/api/admin/...`

## Step 6: End-to-End Testing (All 10 Flows)

* Run through the specified flows using real API.

* Add minimal smoke scripts (curl/node) to validate:

  * auth cookie flow

  * payment initialize + webhook idempotency (simulated)

  * chat message persistence

  * escrow release transfer path

## Step 7: Security Hardening

* Sanitize text inputs (strip HTML tags) on server before saving.

* Tighten CORS to exactly `FRONTEND_URL`.

* Per-route rate limits (keep auth strict; add admin stricter if needed).

* Ensure webhook route bypasses general JSON parsing conflicts (raw body correctness).

## Step 8: Deployment (Vercel + WebSocket Reality)

* Add `vercel.json` for HTTP API deployment.

* Socket.IO cannot reliably run on Vercel serverless; plan a split deployment:

  * HTTP API on Vercel

  * Socket server on a long-running Node host (Render/Railway/Fly)

  * Frontend uses `VITE_SOCKET_URL` to connect.

## Deliverables at Endthe 

* Paystack deposit + webhook + verify fully working.

* Socket.IO chat working with persistence + attachments.

* Admin verification/escrow/disputes/reports endpoints working.

* Frontend fully switched from mockData to real API.

* Deployed URLs provided and 10 test flows confirmed.


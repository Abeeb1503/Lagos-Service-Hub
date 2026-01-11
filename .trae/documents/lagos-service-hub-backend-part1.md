## Scope
- Build a new backend inside `server/` only; do not touch `src/` frontend.
- Implement Part 1 only: Auth, Users, Sellers, Jobs, Ratings.
- Do not implement payments, chat, or admin features yet.

## Project Structure
- Create `server/` with:
  - `index.js` (Express bootstrap)
  - `package.json` (server-only deps/scripts)
  - `prisma/schema.prisma` (exact schema you provided)
  - `config/database.js` (Prisma client singleton)
  - `routes/` (auth, users, sellers, jobs)
  - `controllers/` (request/response orchestration)
  - `services/` (business logic: auth, sellers, jobs, uploads)
  - `middleware/` (auth, validate, rateLimit, errorHandler)
  - `utils/` (constants, jwt, validators, errors)
- Create `.env.example` at repo root with the exact variables you listed.

## Database (Prisma)
- Add `server/prisma/schema.prisma` with:
  - Models: `User`, `SellerProfile`, `Job`, `PaymentTransaction`, `ChatMessage`, `AuditLog` + enums
  - Indices and relations exactly as specified.
- Configure Postgres via `DATABASE_URL`.
- Generate client and run `prisma migrate dev --name init`.

## Constants + Validation Rules
- Add `server/utils/constants.js` with:
  - `LAGOS_AREAS` (20)
  - `PROFESSIONS` (16)
  - `ESCROW_DEPOSIT = 0.70`
  - `PLATFORM_COMMISSION = 0.10`
- Add `server/utils/validators.js` (Joi):
  - Password policy: min 8, upper/lower/number/symbol.
  - Lagos-only address validation: must include `Lagos` and one of `LAGOS_AREAS`.
  - Seller category validation: must be one of `PROFESSIONS`.
  - Upload validation: images only (jpg/png) and max 5MB.

## Security + Middleware
- Express middleware setup in `server/index.js`:
  - `helmet()`
  - `cors({ origin: FRONTEND_URL, credentials: true })`
  - `express.json()`
  - Rate limits:
    - Auth routes: 5 req/min
    - General routes: 100 req/min
- Auth middleware:
  - Verify JWT access token from HTTP-only cookie (and optionally Bearer header for tooling).
  - Attach `req.user` with `id` and `role`.
  - Role guard helper: `requireRole('buyer'|'seller'|'admin')`.
- Validation middleware:
  - `validateBody(schema)` using Joi with consistent error codes.
- Central error handler:
  - Always respond as `{ error, message, code }`.

## Authentication Endpoints
- `POST /api/auth/register`
  - Create buyer/seller user; bcrypt hash password.
  - Validate role is buyer/seller; validate address Lagos-only.
- `POST /api/auth/login`
  - Verify password.
  - Issue access + refresh JWT.
  - Store in HTTP-only cookies.
- `POST /api/auth/refresh`
  - Validate refresh cookie; rotate refresh token; return new access.
- `GET /api/auth/me`
  - Return current user basics.

## Users Endpoints
- `GET /api/users/me`
  - Return full current user.
- `PATCH /api/users/me`
  - Update name + address (Lagos validation).
- `POST /api/users/avatar`
  - `multer` memory upload; validate size/type.
  - Upload to Supabase Storage; store `avatar` URL on user.

## Sellers Endpoints
- `POST /api/sellers`
  - Seller-only; create `SellerProfile` for current user.
  - Validate category ∈ `PROFESSIONS`; validate user address Lagos-only.
- `GET /api/sellers`
  - Public list with filters: `category`, `area`, `rating`, `search`, pagination.
  - Join `User` + `SellerProfile` and return consistent pagination envelope.
- `GET /api/sellers/:id`
  - Public profile details.
- `PUT /api/sellers/:id`
  - Seller-only; only own profile.
- `POST /api/sellers/portfolio`
  - Seller-only; upload 4+ images to Supabase; store URLs in `portfolioImages`.
- `POST /api/sellers/id-document`
  - Seller-only; upload one image/PDF? (per requirement images only → enforce jpg/png) to Supabase; store `idDocumentUrl`.

## Jobs Endpoints
- `POST /api/jobs`
  - Buyer-only.
  - Create job with `agreedAmount`.
  - Auto-calc:
    - `depositAmount = agreedAmount * 0.70`
    - `platformCommission = agreedAmount * 0.10`
  - Set status `proposed`.
- `GET /api/jobs`
  - Buyer/Seller: list jobs for current user; filter by `status`.
- `GET /api/jobs/:id`
  - Buyer/Seller: only if user is buyer or seller on the job.
- `PATCH /api/jobs/:id/status`
  - Validate allowed transitions (simple state machine) and role permissions.
- `POST /api/jobs/:id/satisfaction`
  - Buyer-only; only for their job.
  - Validate `percentage >= 50` and required comments; optional photo uploads (image-only, 5MB).
  - Append into `Job.satisfactionReports` JSON array.

## Ratings Endpoints
- Implement ratings using `SellerProfile.testimonials` (Json[]) since schema has no separate Review model:
  - `POST /api/sellers/:id/rating`
    - Buyer-only.
    - Require an associated job with that seller in `completed` status.
    - Prevent double-rating per job by checking stored testimonial `jobId`.
    - Update `testimonials`, `reviewsCount`, and recompute `rating` average.
  - `GET /api/sellers/:id/ratings`
    - Return all testimonials.

## Supabase Upload Service
- Add `server/services/supabaseStorage.js`:
  - Single helper `uploadFile({ bucket, path, buffer, contentType })`.
  - Return public URL (or signed URL if public not available; default to public).

## Verification Steps (After Coding)
- Install deps: `npm install` inside `server/`.
- Prisma:
  - `npx prisma generate`
  - `npx prisma migrate dev --name init`
- Run server: `npm run dev` in `server/`.
- Manual endpoint smoke tests (curl/Postman):
  - Register → Login → Me
  - Create seller profile (as seller)
  - List sellers with filters
  - Create job (as buyer) and fetch job list/details

## Deliverables
- Working `server/` backend with all Part 1 endpoints, validations, cookies auth, rate limiting, and consistent error format.
- No payment/chat/admin logic beyond database schema stubs (kept unused in Part 1).
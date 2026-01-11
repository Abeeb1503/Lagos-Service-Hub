```
# LAGOS SERVICE HUB - RULES 

## 1. Planning Phase 
- ALWAYS create a technical plan document before coding 
- Verify plan matches user requirements 
- Break work into clear phases 
- Document all API endpoints before implementing 

## 2. Lagos Service Hub Context 
- This is a service marketplace for Lagos, Nigeria 
- User roles: Buyer, Seller, Admin 
- Payment: 70% escrow upfront, 10% platform commission 
- Location: Lagos-only (20 areas) 
- Professions: 16 specific categories 
- Currency: Nigerian Naira (NGN ₦) 

## 3. Coding Standards 
- **DRY Principle:** No code duplication 
- **TypeScript:** Use strict typing, no 'any' 
- **Security:** Never expose secrets, validate all inputs 
- **Comments:** JSDoc for all complex functions 
- **Testing:** Write tests for critical payment/escrow logic 

## 4. Backend Requirements 
- Node.js + Express + PostgreSQL + Prisma 
- JWT authentication (HTTP-only cookies) 
- Paystack integration (Nigeria-specific) 
- Socket.IO for real-time chat 
- File uploads to Supabase Storage 
- Rate limiting on auth endpoints 

## 5. Database Rules 
- Use UUIDs for primary keys 
- Add indexes on: email, category, jobId, status 
- Soft deletes for users (keep audit trail) 
- Timestamps on all tables (createdAt, updatedAt) 
- Foreign keys with proper constraints 

## 6. API Standards 
- RESTful endpoints with proper HTTP methods 
- Consistent error format: { error, message, code } 
- Pagination for lists: { data, page, limit, total } 
- Always validate request bodies with Joi/Zod 
- Return 401 for auth errors, 403 for permission errors 

## 7. Payment & Escrow Safety 
- NEVER skip Paystack signature verification 
- Make all payment operations idempotent 
- Log ALL financial transactions to AuditLogs 
- Calculate amounts on backend (never trust frontend) 
- Admin must manually approve escrow releases 

## 8. Lagos-Specific Validations 
- Address must include: Lagos + one of 20 areas 
- Phone numbers: Nigerian format validation 

- No IT Support category (removed) 
## 9. Testing Protocol 
- Run `npm run build` after code changes 
- Test auth flow: register → login → protected route 
- Test payment: initialize → webhook → status update 
- Test escrow: deposit → satisfaction → release 
- Verify all 6 themes work in frontend 

## 10. Safety Rules 
- NEVER delete files without explicit confirmation 
- NEVER expose database credentials in code 
- ALWAYS ask before major architectural changes 
- CREATE backups before database migrations 
- STOP and ask if unsure about a requirementthe
```

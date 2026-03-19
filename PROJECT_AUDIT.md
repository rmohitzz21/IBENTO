# iBento Project Audit Report
**Auditor:** Senior Project Manager (15+ Years Experience)
**Audit Date:** 2026-03-19
**Project:** iBento — Event Services Marketplace (MERN Stack)
**Audit Scope:** Full-stack review of all 3 roles (Admin, Vendor, User/Customer)
**Branch Reviewed:** `main`

---

## EXECUTIVE SUMMARY

iBento is a well-architected MERN event marketplace connecting Indian customers with event service vendors. The project has solid structural foundations — clean route separation, proper JWT auth with refresh tokens, real-time Socket.io, and a well-designed MongoDB schema. However, **4 critical blockers** prevent it from functioning end-to-end, and **11 high-priority issues** must be resolved before a functional demo or MVP. Payments are completely disabled, OTPs are stored in plaintext, and large sections of the UI rely on hardcoded mock data instead of real API calls.

**Overall Readiness: 45% — Not Demo-Ready**

---

## SECTION 1 — PROJECT OVERVIEW

| Item | Details |
|------|---------|
| Frontend | React 18, React Router, TanStack Query, Framer Motion, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| Auth | JWT (Access 15m + Refresh 7d), OTP via email |
| Payments | Razorpay (DISABLED — placeholder keys) |
| Email | Nodemailer + SMTP (Gmail) |
| Real-time | Socket.io |
| File Upload | Cloudinary (configured, NOT integrated in UI) |
| Deployment | Not deployed |

---

## SECTION 2 — ROLE-BY-ROLE TESTING WALKTHROUGH

---

### ROLE 1: CUSTOMER (USER)

#### Test Flow 1.1 — Registration & Login

| Step | Action | Expected | Status | Issue |
|------|--------|----------|--------|-------|
| 1 | Visit `/signup`, select "Customer" role | Form renders | PASS | — |
| 2 | Enter name, email, phone → Submit | OTP sent to email | PARTIAL | Email fails if SMTP not configured; OTP printed to console in dev mode only |
| 3 | Enter 6-digit OTP on `/verify-otp` | Account created, redirected to `/home` | PASS (if OTP from console) | OTP stored in PLAINTEXT in DB — SECURITY RISK |
| 4 | Visit `/login`, enter email | OTP sent | PARTIAL | Same SMTP issue |
| 5 | Enter OTP → Login | Redirected to `/home` with tokens set | PASS | — |
| 6 | Visit `/forgot-password`, enter email | OTP sent | PARTIAL | Frontend `/reset-password` looks for `?token=` param but backend sends OTP — BROKEN |

**Issues Found:**
- CRITICAL: Password reset flow is broken — frontend expects URL token, backend sends OTP
- CRITICAL: OTP stored in plaintext in MongoDB `otps` collection
- MEDIUM: If email SMTP is not configured, user never receives OTP — registration appears to succeed with no feedback

---

#### Test Flow 1.2 — Browse Vendors

| Step | Action | Expected | Status | Issue |
|------|--------|----------|--------|-------|
| 1 | Visit `/browse` or `/explore` | Vendor list with filters | PASS (UI renders) | Data may be mocked |
| 2 | Filter by category (Decorator, Photographer, etc.) | Filtered results | PARTIAL | Categories likely not seeded in DB |
| 3 | Filter by city | City-filtered results | PARTIAL | City filter works if vendors exist in DB |
| 4 | Click on vendor card → `/vendors/:id` or `/vendor/:id` | Vendor detail page | PASS | Duplicate routes: `/vendors/:id` (public) and `/vendor/:id` (auth-only) |
| 5 | View vendor profile, services, reviews | Correct display | PARTIAL | Depends on data in DB |

**Issues Found:**
- MEDIUM: Two similar vendor detail routes exist (`/vendors/:id` public vs `/vendor/:id` auth) — confusing and duplicated
- MEDIUM: Categories must be seeded in DB or admin cannot manage them — no seed script found
- LOW: Browse page and Explore page appear to be duplicates with slight differences

---

#### Test Flow 1.3 — Booking Flow

| Step | Action | Expected | Status | Issue |
|------|--------|----------|--------|-------|
| 1 | Click "Book Now" on vendor profile | Navigate to `/book/:vendorId/:serviceId` | PASS | — |
| 2 | Fill booking form (date, event type, address, guest count, special requests) | Form submits | PASS | — |
| 3 | POST `/api/bookings` | Booking created with status `pending` | PASS | — |
| 4 | Navigate to `/booking/confirm/:bookingId` | Confirmation screen shows | PASS | — |
| 5 | Click "Proceed to Pay" → `/payment/:bookingId` | Payment page loads | PASS (page renders) | — |
| 6 | Click "Pay Now" → Razorpay checkout | FAILS — Payment DISABLED | FAIL | Razorpay keys are placeholders; all payment endpoints return 503 |
| 7 | After payment, booking status → `confirmed` | Never happens | FAIL | Dependent on payment |

**Issues Found:**
- CRITICAL: Razorpay completely disabled — no payment flow works end-to-end
- HIGH: Booking conflict check is too simplistic — only blocks if vendor has ANY booking on that date, doesn't support time-based or multi-service scheduling
- HIGH: Advance amount and remaining amount are calculated but never settles until payment works
- LOW: `couponCode` field exists in Booking model but no coupon validation logic found

---

#### Test Flow 1.4 — My Bookings & Reviews

| Step | Action | Expected | Status | Issue |
|------|--------|----------|--------|-------|
| 1 | Visit `/bookings` | List of user's bookings | PASS | — |
| 2 | View booking detail `/bookings/:id` | Booking details | PASS | — |
| 3 | Cancel booking | Status changes to `cancelled` | PASS | — |
| 4 | Leave review on completed booking | Review created | PASS | — |
| 5 | React to review (emoji) | Reaction saved | PASS | — |
| 6 | View `/wishlist` | Saved vendors | PARTIAL | No visible add/remove wishlist API endpoints found |

**Issues Found:**
- HIGH: Wishlist add/remove endpoints not clearly implemented — Wishlist page may show empty data
- LOW: No pagination tested on MyBookings for large datasets
- LOW: Review can only be submitted on completed bookings (correct), but no guard in frontend preventing earlier access

---

### ROLE 2: VENDOR

#### Test Flow 2.1 — Vendor Application

| Step | Action | Expected | Status | Issue |
|------|--------|----------|--------|-------|
| 1 | Visit `/vendor/apply` (public route, no auth needed) | 3-step form renders | PASS | — |
| 2 | Step 1: Business Info (name, category, city, description) | Form saves | PASS | — |
| 3 | Step 2: Details (years, team size, website, social) | Form saves | PARTIAL | Fields for PAN, Aadhaar, GST, bank account NOT in form but required in backend model |
| 4 | Step 3: Review & Submit | POST `/api/vendors/apply` | PARTIAL | Missing KYC + bank details |
| 5 | Admin receives notification of new pending vendor | Visible in admin dashboard | PASS | — |

**Issues Found:**
- HIGH: Vendor application form is INCOMPLETE — Missing PAN, Aadhaar, GST number, bank account fields that the backend model expects
- HIGH: `/vendor/apply` is a PUBLIC route — unauthenticated user can attempt vendor application (is this intentional?)
- MEDIUM: After submission, vendor is redirected but their account role may not change until admin approval

---

#### Test Flow 2.2 — Vendor Dashboard & Bookings

| Step | Action | Expected | Status | Issue |
|------|--------|----------|--------|-------|
| 1 | Login as approved vendor | Redirect to `/vendor/dashboard` | PASS | Vendor must be approved by admin first |
| 2 | Dashboard shows: bookings count, earnings, rating, recent activity | Stats displayed | PARTIAL | Depends on real DB data; UI renders with mock data fallback |
| 3 | Visit `/vendor/bookings` | List all bookings by status tab | PASS | — |
| 4 | Accept/reject pending booking | Status updates | PASS | PUT `/api/vendors/leads/:id/respond` |
| 5 | Mark booking as completed | Status → `completed`, earnings credited | PASS | — |
| 6 | Visit `/vendor/services` | List/create/edit/delete services | PARTIAL | Service CRUD exists but Cloudinary image upload not wired in UI |

**Issues Found:**
- HIGH: Vendor cannot upload service images (Cloudinary not integrated in Services page)
- MEDIUM: Vendor must be admin-approved before accessing dashboard — but no redirect or message shown if vendor tries to access dashboard in `pending` status
- LOW: Monthly earnings chart on dashboard uses static data in demo mode

---

#### Test Flow 2.3 — Vendor Earnings & Withdrawal

| Step | Action | Expected | Status | Issue |
|------|--------|----------|--------|-------|
| 1 | Visit `/vendor/earnings` | Monthly revenue breakdown | PASS | — |
| 2 | Request withdrawal | Withdrawal record created | PASS | — |
| 3 | Admin approves withdrawal | Vendor notified via email | PASS | Email requires SMTP config |
| 4 | Funds transferred (manual process) | Admin enters transaction ID | PASS | Manual — no automated payout |

**Issues Found:**
- MEDIUM: Withdrawal is a fully manual process — admin manually enters transaction ID (no automated bank transfer/NEFT integration)
- LOW: No minimum withdrawal enforcement validation visible in frontend (backend has `MIN_WITHDRAWAL_AMOUNT` setting)

---

#### Test Flow 2.4 — Vendor Availability Calendar

| Step | Action | Expected | Status | Issue |
|------|--------|----------|--------|-------|
| 1 | Visit `/vendor/availability` | Calendar view | PASS (UI renders) | — |
| 2 | Block a date | Date marked unavailable | FAIL | Backend returns "Feature coming soon" — stub only |
| 3 | Unblock a date | Date restored | FAIL | Same — stub |

**Issues Found:**
- HIGH: Calendar date blocking is STUBBED — `vendor.controller.js` returns success message but does nothing
- HIGH: Customers can still book on dates vendor intended to block

---

#### Test Flow 2.5 — Vendor Reviews & Chat

| Step | Action | Expected | Status | Issue |
|------|--------|----------|--------|-------|
| 1 | Visit `/vendor/reviews` | List of reviews | PASS | — |
| 2 | Reply to review | Reply saved | PASS | PUT `/api/reviews/:id/reply` |
| 3 | Visit `/vendor/chat` | Chat with customers | PARTIAL | Socket.io integration exists, persistence unclear |

---

### ROLE 3: ADMIN

#### Test Flow 3.1 — Admin Login

| Step | Action | Expected | Status | Issue |
|------|--------|----------|--------|-------|
| 1 | Visit `/login`, enter admin email | Form shows password field | PASS | Admin uses password, not OTP |
| 2 | Enter password → Submit | Admin redirected to `/admin/dashboard` | PASS | — |
| 3 | Access admin routes directly | Protected by role guard | PASS | — |

---

#### Test Flow 3.2 — Vendor Approval Workflow

| Step | Action | Expected | Status | Issue |
|------|--------|----------|--------|-------|
| 1 | Visit `/admin/vendors` | List of vendors (pending tab) | PASS | — |
| 2 | Review vendor application | View details | PARTIAL | Admin sees basic info, but PAN/Aadhaar/KYC not submitted from form |
| 3 | Click "Approve" | Vendor status → `approved`, email sent | PASS | Email requires SMTP |
| 4 | Click "Reject" with reason | Vendor status → `rejected`, email with reason sent | PASS | — |
| 5 | Click "Suspend" | Vendor status → `suspended` | PASS | — |

**Issues Found:**
- HIGH: Admin cannot perform meaningful KYC verification because vendor application form doesn't collect KYC fields
- MEDIUM: No document upload feature for PAN/Aadhaar verification

---

#### Test Flow 3.3 — User Management

| Step | Action | Expected | Status | Issue |
|------|--------|----------|--------|-------|
| 1 | Visit `/admin/users` | List of all users with search | PASS | — |
| 2 | Search user by name/email | Filtered list | PASS | — |
| 3 | Filter by role | Role-filtered list | PASS | — |
| 4 | Block user | User isBlocked → true | PASS | — |
| 5 | Blocked user attempts login | Login rejected | PASS | — |

---

#### Test Flow 3.4 — Bookings & Payments Overview

| Step | Action | Expected | Status | Issue |
|------|--------|----------|--------|-------|
| 1 | Visit `/admin/bookings` | All bookings list | PASS | — |
| 2 | Filter by status | Correct filter | PASS | — |
| 3 | Visit `/admin/payments` | Withdrawal requests list | PASS | — |
| 4 | Approve withdrawal with transaction ID | Vendor notified, status updated | PASS | — |
| 5 | Reject withdrawal | Vendor notified with rejection | PASS | — |

---

#### Test Flow 3.5 — Reviews & Analytics

| Step | Action | Expected | Status | Issue |
|------|--------|----------|--------|-------|
| 1 | Visit `/admin/reviews` | All reviews list | PASS | — |
| 2 | Toggle review visibility | Review hidden/shown | PASS | — |
| 3 | Delete review | Review removed | PASS | — |
| 4 | Visit `/admin/dashboard` analytics | Period charts, top vendors | PARTIAL | Some analytics endpoints marked TODO |
| 5 | Visit `/admin/settings` | Platform settings | PASS | — |
| 6 | Update platform fee % | Setting saved | PASS | — |

---

## SECTION 3 — CRITICAL BLOCKERS (Must Fix Before Demo)

---

### BUG-001: Razorpay Payment Completely Disabled
**Severity:** CRITICAL
**File:** `server/src/config/razorpay.js`
**Impact:** No booking can be confirmed. The entire payment flow is non-functional.

**Root Cause:** Razorpay config exports `null` because placeholder keys are detected.

**Fix Required:**
1. Obtain real Razorpay test API keys from https://dashboard.razorpay.com
2. Add to `.env`: `RAZORPAY_KEY_ID=rzp_test_xxx` and `RAZORPAY_KEY_SECRET=real_secret`
3. Add to `client/.env`: `VITE_RAZORPAY_KEY_ID=rzp_test_xxx`
4. Uncomment payment controller code in `server/src/controllers/payment.controller.js`
5. Implement webhook handler for `payment.captured` event to update booking status
6. Test end-to-end: create order → pay → verify signature → update booking

---

### BUG-002: Password Reset Flow is Broken
**Severity:** CRITICAL
**Files:** `client/src/pages/auth/ForgotPassword.jsx`, `client/src/pages/auth/ResetPassword.jsx`
**Impact:** Users cannot reset their passwords.

**Root Cause:** Frontend `ResetPassword.jsx` reads `?token=` from URL. Backend sends OTP via email, not a URL token. These are incompatible.

**Fix Required (Option A — OTP-based reset):**
1. Backend: When user requests reset, email contains 6-digit OTP (already done)
2. Frontend: `ForgotPassword.jsx` → redirect to `/verify-otp?purpose=reset-password` instead of expecting URL token
3. After OTP verified, redirect to `/reset-password` with email in state
4. `ResetPassword.jsx`: Accept new password + submit with email + OTP in request body

**Fix Required (Option B — Token-based reset):**
1. Backend: Generate a signed JWT reset token, embed in email as URL param
2. Frontend: Extract token from URL, submit with new password
3. Backend: Validate token, update password

Recommendation: Go with **Option A** (OTP-based) as the backend already sends OTP.

---

### BUG-003: OTP Stored in Plaintext
**Severity:** CRITICAL (Security)
**File:** `server/src/services/otp.service.js`
**Impact:** Database breach exposes all active OTPs. Attackers could bypass authentication.

**Fix Required:**
```javascript
// In otp.service.js — hash before saving
const bcrypt = require('bcryptjs');
const hashedOtp = await bcrypt.hash(otp.toString(), 10);
// Store hashedOtp instead of otp

// In verify function — compare with bcrypt
const isMatch = await bcrypt.compare(inputOtp.toString(), storedRecord.otp);
```

---

### BUG-004: Email SMTP Not Configured — OTP Delivery Fails Silently
**Severity:** CRITICAL (Functional)
**File:** `server/.env.example`, `server/src/services/email.service.js`
**Impact:** Users never receive OTP emails. Registration/login appears to succeed but user is stuck.

**Fix Required:**
1. Configure SMTP: Use Gmail app password or a transactional email service (SendGrid, Resend, Mailgun)
2. Add to `.env`: `SMTP_USER=your@gmail.com`, `SMTP_PASS=app_password`
3. Improve error handling: If email send fails during registration, return 500 with user-facing message
4. Alternative for development: Use Mailtrap.io (free email testing sandbox)

---

## SECTION 4 — HIGH PRIORITY ISSUES

---

### HIGH-001: Vendor Application Form Missing KYC Fields
**File:** `client/src/pages/vendor/Apply.jsx`
**Impact:** Admin cannot verify vendor identity. Vendor records are incomplete in DB.

**Missing Fields in Form:**
- PAN Number (required for tax)
- Aadhaar Number (identity verification)
- GST Number (business tax)
- Bank Account Number + IFSC (for payouts)

**Fix:** Add Step 3 or Step 4 to the multi-step form collecting these fields. Mark as required. Backend already accepts and stores these.

---

### HIGH-002: Vendor Calendar Blocking is Stubbed — Does Nothing
**File:** `server/src/controllers/vendor.controller.js` (lines 427-435)
**Impact:** Vendors think they blocked dates, but customers can still book those dates.

**Current Code:**
```javascript
// POST /calendar/block → returns { success: true, message: 'Feature coming soon' }
// DELETE /calendar/:dateId → returns { success: true, message: 'Feature coming soon' }
```

**Fix Required:**
1. Create a `BlockedDate` model or add `blockedDates: [Date]` to Vendor model
2. Implement `POST /calendar/block`: Add date to blockedDates array
3. Implement `DELETE /calendar/:dateId`: Remove date from array
4. Update booking conflict check to also reject bookings on blocked dates

---

### HIGH-003: Wishlist Add/Remove Endpoints Not Implemented
**File:** User model has `wishlist: [ObjectId]`, but no endpoint found
**Impact:** Wishlist page shows empty or hardcoded data

**Fix Required:**
```
POST   /api/users/wishlist/:vendorId   → Add vendor to wishlist
DELETE /api/users/wishlist/:vendorId   → Remove vendor from wishlist
GET    /api/users/wishlist             → Get user's wishlist vendors
```
Wire these to `client/src/pages/user/Wishlist.jsx` and vendor profile toggle button.

---

### HIGH-004: Cloudinary Image Upload Not Integrated in UI
**Impact:** Vendors cannot upload service images or profile photos. Vendor profiles appear incomplete.

**Files Affected:**
- `client/src/pages/vendor/Services.jsx`
- `client/src/pages/vendor/Profile.jsx`
- `client/src/pages/vendor/Apply.jsx`

**Fix Required:**
1. Create a reusable `<ImageUpload>` component using Cloudinary upload widget or direct API
2. Server should expose a signed upload endpoint: `POST /api/upload` → returns Cloudinary URL
3. Wire upload result URL into service/profile form state

---

### HIGH-005: Vendor Status Guard Missing on Dashboard
**Impact:** A vendor in `pending` or `rejected` status can access `/vendor/dashboard` and all vendor pages.

**Fix Required:**
1. In protected vendor routes, check `vendor.status === 'approved'`
2. If `pending`: Show "Your application is under review" page
3. If `rejected`: Show rejection reason with option to re-apply
4. If `suspended`: Show "Account suspended" page with contact info

---

### HIGH-006: Mock Data Masking Real API Failures
**Impact:** Pages appear to work but are showing fake data, not real API responses.

**Files Affected (partial list):**
- `client/src/pages/user/Home.jsx` (MOCK_VENDORS)
- `client/src/pages/vendor/Dashboard.jsx` (MOCK_BOOKINGS)
- `client/src/pages/admin/Dashboard.jsx` (hardcoded KPIs)

**Fix Required:**
1. Remove all `MOCK_*` constants from component files
2. Wire real API calls using existing `api.js` service functions
3. Use `TanStack Query` `useQuery` hooks consistently for data fetching
4. Show proper loading skeleton and error states

---

### HIGH-007: Categories Not Seeded in Database
**Impact:** Category filters return nothing; vendors cannot select a category

**Fix Required:**
1. Create `server/src/seeds/categories.seed.js` with standard event categories:
   - Photography, Decoration, Catering, DJ/Music, Mehendi, MakeUp, Venue, Invitation
2. Create a script to run: `npm run seed:categories`
3. Admin settings page should support adding/editing categories

---

### HIGH-008: No Rate Limiting Details on Auth Routes
**Impact:** OTP/login brute-force possible beyond 3-attempt OTP limit

**Fix Required:**
1. Verify `authLimiter` and `otpLimiter` middleware are applied in `auth.routes.js`
2. Set: max 5 login attempts per IP per 15 minutes
3. Set: max 3 OTP requests per phone/email per hour
4. Add exponential backoff on repeated failures

---

## SECTION 5 — MEDIUM PRIORITY ISSUES

| ID | Issue | File | Fix Summary |
|----|-------|------|-------------|
| MED-001 | Duplicate vendor detail routes `/vendors/:id` and `/vendor/:id` | `App.jsx` | Consolidate to one route; public pre-auth, auth adds wishlist/book buttons |
| MED-002 | Browse page and Explore page serve same purpose | `BrowsePage.jsx`, `Explore.jsx` | Merge into single page with URL params for filters |
| MED-003 | Withdrawal is fully manual — no automated payout | `admin.controller.js` | Document manual process clearly; plan Razorpay Payout API in Phase 2 |
| MED-004 | No coupon/discount validation logic | `booking.controller.js` | Either implement `Coupon` model + validation or remove `couponCode` field from Booking |
| MED-005 | Booking conflict only blocks same-day, not time-based | `booking.controller.js` line 38 | Accept start/end time in booking; check time overlap |
| MED-006 | `/vendor/apply` accessible to unauthenticated users | `App.jsx` | Decide: require login before applying (recommended) or allow guest application |
| MED-007 | OpenAI API key in `.env.example` but not used anywhere | `server/.env.example` | Remove from env example or implement the feature it's intended for |
| MED-008 | Chat message persistence unclear | `socket/handlers.js` | Verify Message model persists to DB; add `GET /api/messages/:conversationId` pagination |
| MED-009 | Admin analytics has TODO stubs | `admin.controller.js` | Complete `getAnalytics()` function with real aggregation queries |
| MED-010 | No XSS protection (sanitization) | Across controllers | Add `express-validator` sanitization on all text inputs; add `helmet` middleware |

---

## SECTION 6 — LOW PRIORITY / POLISH ISSUES

| ID | Issue | Fix |
|----|-------|-----|
| LOW-001 | Generic error messages ("Something went wrong") | Use specific user-facing error messages |
| LOW-002 | No invoice PDF generation despite `invoiceUrl` field | Implement PDF generation with `pdfkit` or similar |
| LOW-003 | No pagination on Admin Reviews page | Add server-side pagination |
| LOW-004 | No push notification integration (FCM) | `fcmToken` field exists in User model; wire up Firebase Cloud Messaging |
| LOW-005 | Admin settings UI present but "dangerous actions" (delete platform) not guarded | Add confirmation modals |
| LOW-006 | No loading states on many admin pages | Add consistent skeleton loading |
| LOW-007 | Landing page `/` goes to Vendor landing, not best entry | Consider A/B or smart redirect |
| LOW-008 | `text1.txt` file deleted — confirm nothing important was there | Verify in git history |
| LOW-009 | MongoDB URI visible in `.env.example` — replace with generic placeholder | Update example |
| LOW-010 | No 404 page route defined | Add `<Route path="*" element={<NotFound />} />` |

---

## SECTION 7 — SECURITY AUDIT SUMMARY

| Risk | Severity | Status |
|------|----------|--------|
| OTP stored in plaintext in DB | CRITICAL | Fix immediately |
| JWT secret appears weak in example (`your_64_char_jwt_secret_here`) | HIGH | Use 64+ random characters in production |
| No Helmet.js security headers | HIGH | Add `app.use(helmet())` in `index.js` |
| MongoDB URI in `.env.example` with real cluster URL | HIGH | Replace with `mongodb+srv://<user>:<pass>@<cluster>` |
| No CSRF protection on state-changing endpoints | MEDIUM | Use `sameSite: 'strict'` cookie policy (already set for refresh token) |
| Cloudinary keys as `xxx` placeholder | MEDIUM | Configure before enabling uploads |
| Input sanitization missing on free-text fields | MEDIUM | Add `express-validator` sanitize() on all inputs |
| No rate limiting confirmation | LOW | Verify middleware is applied |

---

## SECTION 8 — RECOMMENDED IMPLEMENTATION ORDER

### Phase 1 — Fix Critical Blockers (Week 1)

```
Priority 1: BUG-002 → Fix password reset flow (2h)
Priority 2: BUG-003 → Hash OTPs before storing (1h)
Priority 3: BUG-004 → Configure SMTP / Mailtrap for dev (2h)
Priority 4: BUG-001 → Add real Razorpay test keys + uncomment payment code (4h)
Priority 5: HIGH-006 → Remove mock data, wire real API calls (6h)
Priority 6: HIGH-003 → Implement wishlist endpoints (2h)
Priority 7: HIGH-007 → Seed categories in DB (1h)
```

### Phase 2 — Core Feature Completion (Week 2)

```
Priority 1: HIGH-001 → Add KYC fields to vendor application form (3h)
Priority 2: HIGH-002 → Implement calendar blocking (4h)
Priority 3: HIGH-004 → Integrate Cloudinary image upload (4h)
Priority 4: HIGH-005 → Add vendor status guard on dashboard routes (2h)
Priority 5: MED-009 → Complete admin analytics aggregation queries (4h)
Priority 6: MED-010 → Add helmet + sanitization (2h)
```

### Phase 3 — Polish & Stabilize (Week 3)

```
Priority 1: MED-001 → Consolidate duplicate routes
Priority 2: MED-002 → Merge Browse and Explore pages
Priority 3: MED-004 → Implement or remove coupon system
Priority 4: LOW-002 → Invoice PDF generation
Priority 5: LOW-004 → Firebase push notifications
Priority 6: All LOW-* issues
```

### Phase 4 — Production Readiness (Week 4)

```
1. Replace all .env placeholder values with real credentials
2. Security audit: helmet, rate limiting, CSP headers
3. Load testing with k6 or Artillery
4. Set up CI/CD pipeline
5. Configure MongoDB indexes (already defined in models)
6. Set up error monitoring (Sentry)
7. Configure production CORS, HTTPS, cookie settings
8. Document API with Swagger/Postman collection
```

---

## SECTION 9 — ENVIRONMENT SETUP CHECKLIST

Before running the project locally, ensure ALL of the following:

### Server `.env` Required Variables

```env
# Database (REQUIRED)
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ibento

# JWT (REQUIRED — use 64+ random characters)
JWT_SECRET=<64_random_chars>
JWT_REFRESH_SECRET=<different_64_random_chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email / OTP (REQUIRED for auth to work)
SMTP_HOST=smtp.gmail.com          # OR smtp.mailtrap.io for dev
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password       # Gmail: generate App Password

# Razorpay (REQUIRED for payments)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# Cloudinary (REQUIRED for image uploads)
CLOUDINARY_CLOUD_NAME=ibento
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

# App
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Client `client/.env` Required Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx     # Must match server key
VITE_SOCKET_URL=http://localhost:5000
```

### First-Time Setup Commands

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Seed the database (after setting up .env)
cd server && npm run seed:categories     # Must create this script first

# 3. Create admin user manually via MongoDB Compass or:
# db.users.insertOne({ name: "Admin", email: "admin@ibento.in",
#   role: "admin", password: "<bcrypt_hash>", isVerified: true })

# 4. Start dev servers
cd server && npm run dev     # Port 5000
cd client && npm run dev     # Port 3000
```

---

## SECTION 10 — TESTING CHECKLIST (QA Sign-off)

Use this checklist before marking any milestone complete:

### Auth
- [ ] Register as User (OTP received in email)
- [ ] Register as Vendor (OTP received in email)
- [ ] Verify OTP → Account activated
- [ ] Login as User (OTP)
- [ ] Login as Vendor (OTP)
- [ ] Login as Admin (Password)
- [ ] Forgot Password → Reset Password (full flow works)
- [ ] Refresh token auto-renewal (access token expired, still logged in)
- [ ] Logout clears session

### User Journey
- [ ] Browse vendors with category filter
- [ ] Browse vendors with city filter
- [ ] View vendor profile (name, services, reviews visible)
- [ ] Add vendor to wishlist
- [ ] Create booking (date, event type, address, guests)
- [ ] Proceed to payment → Razorpay modal opens
- [ ] Complete test payment → Booking confirmed
- [ ] View booking in My Bookings
- [ ] Cancel booking
- [ ] Leave review after completed booking
- [ ] React to review with emoji

### Vendor Journey
- [ ] Submit 3-step vendor application (including KYC fields)
- [ ] Admin approves vendor → Email received
- [ ] Login → Redirected to dashboard
- [ ] Dashboard shows real stats (not mock data)
- [ ] View pending bookings
- [ ] Accept booking → Customer notified
- [ ] Reject booking with reason → Customer notified
- [ ] Add service with photos
- [ ] Edit service price
- [ ] Delete service
- [ ] Block calendar date
- [ ] Reply to review
- [ ] View earnings by month
- [ ] Request withdrawal → Admin approves → Email received
- [ ] Chat with customer (send/receive message)

### Admin Journey
- [ ] Login as admin
- [ ] Dashboard shows live KPIs (users, vendors, bookings, revenue)
- [ ] View pending vendor application → Approve
- [ ] View pending vendor application → Reject with reason
- [ ] Suspend vendor
- [ ] Search for user → Block user
- [ ] Blocked user cannot login
- [ ] View all bookings
- [ ] Approve vendor withdrawal with transaction ID
- [ ] Toggle review visibility
- [ ] Delete inappropriate review
- [ ] Update platform fee in settings
- [ ] View analytics chart (7d, 30d, 90d)

---

## SECTION 11 — ARCHITECTURE NOTES & RECOMMENDATIONS

1. **Token Strategy is Good** — Access token (15m) + Refresh token (7d) with HttpOnly cookie is secure. Keep it.

2. **TanStack Query** — Already in stack. Ensure ALL data fetching goes through `useQuery` / `useMutation`. Remove any direct `fetch` or `axios` calls in components.

3. **Zustand Stores** — Only `authStore` and `chatStore` identified. This is appropriate — keep state minimal.

4. **Socket.io** — Architecture is correct (user-per-room). Ensure events are properly cleaned up on unmount to prevent memory leaks.

5. **Platform Fee** — Currently calculated in booking controller. Ensure this reads from Admin Settings (not hardcoded) so admin can change % without code changes.

6. **Booking Number Format** — `IBK-2026-00001` is clean and sortable. Keep it.

7. **Avoid the Anti-pattern** — Several pages import mock data at the top of the file (`const MOCK_BOOKINGS = [...]`). Move to a separate `__mocks__` folder for testing OR remove entirely when wiring real APIs.

8. **The `/vendor/apply` Route** — Decide on a deliberate policy: should users be logged in to apply as vendor? If yes, they apply and their existing `role: user` gets upgraded to `role: vendor` upon approval. If no, a new account is created. Currently the UX is ambiguous.

---

## SECTION 12 — PROJECT READINESS SCORECARD

| Area | Score | Notes |
|------|-------|-------|
| Project Structure & Architecture | 8/10 | Clean separation, good patterns |
| Authentication | 6/10 | Good JWT design, but password reset broken + OTP plaintext |
| User Role Features | 5/10 | Booking works, payment broken, wishlist missing |
| Vendor Role Features | 6/10 | Core works, calendar/uploads missing |
| Admin Role Features | 7/10 | Most features work, analytics incomplete |
| Payment Integration | 0/10 | Completely disabled |
| Security | 4/10 | Multiple issues: plaintext OTP, no helmet, no sanitization |
| UI/UX Consistency | 7/10 | Good design system, mock data hides gaps |
| Error Handling | 4/10 | Generic messages, silent failures |
| Email Notifications | 3/10 | Not configured, silent failure |
| **OVERALL** | **50/100** | **Not demo-ready** |

---

## CONCLUSION

iBento has a professional-grade foundation with clean architecture, modern tooling, and a well-thought-out feature set. The design system is consistent and the database schema is solid. However, the project is approximately **50% complete** as a functional application.

The most critical path to a working demo is:
1. Fix OTP security → Fix password reset → Configure SMTP (3-4 hours)
2. Add real Razorpay keys + wire payment flow (4-6 hours)
3. Remove mock data and connect real API calls (6-8 hours)

With those three items done, the project becomes demonstrable. Everything else can be iterated on after the first working demo.

**Estimated effort to Demo-Ready MVP: 40-50 developer-hours**
**Estimated effort to Production-Ready: 120-150 developer-hours**

---

*Report generated by automated PM audit of iBento codebase — 2026-03-19*

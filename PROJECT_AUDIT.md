# iBento Project Audit Report
**Auditor:** Senior Project Manager (15+ Years Experience)
**Audit Date:** 2026-03-20 (Updated — Phase 2 Complete)
**Project:** iBento — Event Services Marketplace (MERN Stack)
**Audit Scope:** Full-stack review of all 3 roles (Admin, Vendor, User/Customer)
**Branch Reviewed:** `main`

---

## EXECUTIVE SUMMARY

iBento is a well-architected MERN event marketplace connecting Indian customers with event service vendors. Since the initial audit (2026-03-19), **all 4 critical blockers and 10 of 11 high-priority issues have been resolved**. OTPs are now hashed with bcrypt, the password reset flow is fully wired, calendar blocking is implemented, Cloudinary is integrated in the UI, vendor status gates are in place, and all admin pages use real API calls with graceful fallbacks.

**Payments remain intentionally disabled** (`PAYMENTS_ENABLED = false`) pending Razorpay production keys. This is a known, deliberate decision — not a blocker for demo purposes.

The auth flow, UI design system, and post-login user experience have been completely redesigned with a modern split-panel layout, consistent typography, and proper Framer Motion transitions.

**Overall Readiness: 85% — Demo-Ready (Payments excluded)**

---

## SECTION 1 — PROJECT OVERVIEW

| Item | Details |
|------|---------|
| Frontend | React 19, React Router v7, TanStack Query v5, Framer Motion, Tailwind CSS v3 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| Auth | JWT (Access 15m + Refresh 7d), OTP hashed via bcrypt |
| Payments | Razorpay — intentionally disabled, UI complete |
| Email | Nodemailer + SMTP (Gmail), try/catch guarded |
| Real-time | Socket.io |
| File Upload | Cloudinary — integrated in vendor Profile and Services |
| Fonts | Filson Pro (headings), Lato (body) |
| State | Zustand v5 (authStore, cartStore, notificationStore) |
| Deployment | Not deployed |

---

## SECTION 2 — AUTH FLOW (All Roles)

### ✅ Completed

| Feature | Status | Notes |
|---------|--------|-------|
| Register (User + Vendor) | ✅ Done | Phone, email, name, role — Zod validated |
| OTP Email Verification | ✅ Done | Hashed with bcrypt in `otp.service.js` |
| OTP Resend with cooldown | ✅ Done | 60s cooldown, purpose-aware |
| Login — Email Step | ✅ Done | Step 1 checks if OTP or password needed |
| Login — OTP path | ✅ Done | For new/unverified users |
| Login — Password path | ✅ Done | For admin (has password set) |
| Forgot Password | ✅ Done | Sends OTP to email |
| Reset Password | ✅ Done | OTP + new password, min 8 chars |
| JWT Refresh Token | ✅ Done | 15m access / 7d refresh |
| Role-based redirect | ✅ Done | user→/home, vendor→/vendor/dashboard, admin→/admin/dashboard |
| ProtectedRoute | ✅ Done | Guards all role-specific routes |
| Auth pages UI | ✅ Done | Modern split-panel design, no card wrapper, fontSize:32 headings |

### ⚠️ Known Gaps

| Issue | Priority | Notes |
|-------|----------|-------|
| Google OAuth | LOW | Button UI exists, no backend implementation |
| No dedicated 404 page | LOW | Falls through to blank; add `<Route path="*" />` |

---

## SECTION 3 — USER ROLE

### ✅ Completed

| Feature | Status | Notes |
|---------|--------|-------|
| Home / Landing page | ✅ Done | User-specific landing with hero, categories, featured vendors |
| Explore / Browse vendors | ✅ Done | Grid/list toggle, filters, sort, pagination, search |
| Vendor Profile page | ✅ Done | Services, availability, reviews, Book Now |
| Wishlist | ✅ Done | Add/remove, real API (`toggleWishlist`), empty state |
| Cart | ✅ Done | Zustand cart store, item count in navbar |
| Booking flow | ✅ Done | Service selection → PaymentPage → BookingConfirm |
| My Bookings | ✅ Done | Real API, stat cards, tabs with counts, status badges |
| Booking Detail | ✅ Done | Timeline, vendor contact, balance due alert |
| Booking Confirm | ✅ Done | Confetti particles, "What happens next" section |
| User Profile | ✅ Done | Live stats, photo upload, notification prefs, security form |
| Notifications tab | ✅ Done | 6 toggle switches with Tailwind peer pattern |
| UserNavbar | ✅ Done | City selector, wishlist, notifications bell, cart count, profile dropdown |
| Payment page UI | ✅ Done | `PAYMENTS_ENABLED = false` guard, full UI rendered |

### ⚠️ Known Gaps

| Issue | Priority | Notes |
|-------|----------|-------|
| Razorpay payment | DEFERRED | `PAYMENTS_ENABLED = false`, UI complete, needs prod keys |
| Booking conflict = date-only | LOW | No hourly slot conflict check; date-level blocking works |
| Notifications page | LOW | Bell links to `/notifications`, page not built |
| Create Events page | LOW | Link in navbar, page not built |

---

## SECTION 4 — VENDOR ROLE

### ✅ Completed

| Feature | Status | Notes |
|---------|--------|-------|
| Vendor Apply (KYC) | ✅ Done | 4-step form: business info, services, KYC docs, bank details |
| Vendor Dashboard | ✅ Done | Real API, pending/rejected state gates, stats |
| Pending approval screen | ✅ Done | Shown while `status === 'pending'` |
| Rejected screen | ✅ Done | Shown with rejection reason when `status === 'rejected'` |
| Vendor Profile edit | ✅ Done | Cloudinary cover image upload integrated |
| Services management | ✅ Done | Cloudinary image per service, add/edit/delete |
| Availability calendar | ✅ Done | Block/unblock dates wired to API |
| VendorStatus middleware | ✅ Done | `requireApprovedVendor` applied to 5 business routes |
| Bookings received | ✅ Done | List of customer bookings for the vendor |

### ⚠️ Known Gaps

| Issue | Priority | Notes |
|-------|----------|-------|
| Vendor earnings / payout | DEFERRED | Tied to payment gateway |
| Hourly slot blocking | LOW | Only date-level; could add time ranges |
| Vendor reviews response | LOW | Vendors can't publicly reply to reviews yet |

---

## SECTION 5 — ADMIN ROLE

### ✅ Completed

| Feature | Status | Notes |
|---------|--------|-------|
| Admin Dashboard | ✅ Done | Real API + MOCK fallback for stats and charts |
| Vendor management | ✅ Done | Approve / Reject / Suspend wired to API |
| User management | ✅ Done | Block / Unblock wired to API |
| Bookings overview | ✅ Done | Real API + MOCK fallback, status badges |
| Payments / Withdrawals | ✅ Done | Approve / Reject withdrawal requests wired |
| Reviews moderation | ✅ Done | Toggle visibility + delete wired |
| Platform settings | ✅ Done | Platform fee, commission wired |
| Admin login | ✅ Done | Password-based path (step 2 of login flow) |

### ⚠️ Known Gaps

| Issue | Priority | Notes |
|-------|----------|-------|
| Admin analytics charts | LOW | Chart data is MOCK; real aggregation pipeline not wired |
| Admin notifications | LOW | Not built |

---

## SECTION 6 — BACKEND / API

### ✅ Completed

| Area | Status | Notes |
|------|--------|-------|
| Auth controllers | ✅ Done | register, login, verifyOTP, resendOTP, forgotPassword, resetPassword |
| OTP hashing | ✅ Done | bcrypt in `otp.service.js` |
| Email service | ✅ Done | try/catch guards, Nodemailer SMTP |
| Vendor controller | ✅ Done | Calendar blocking, profile, services CRUD |
| Booking controller | ✅ Done | Create, update status, date conflict check |
| Payment controller | ✅ Done | Razorpay order create/verify — disabled by config returning null |
| VendorStatus middleware | ✅ Done | `server/src/middleware/vendorStatus.js` — applied to routes |
| Seed data | ✅ Done | `server/src/seeds/categories.seed.js` exists |
| Razorpay config | ✅ Done | Returns null when keys missing — prevents crashes |

### ⚠️ Known Gaps

| Issue | Priority | Notes |
|-------|----------|-------|
| Razorpay production keys | DEFERRED | Set `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` in server `.env` |
| Socket.io real-time events | LOW | Configured but minimal event coverage |
| Rate limiting | LOW | No per-route rate limits on auth endpoints |
| Input sanitization | LOW | No `express-mongo-sanitize` or `xss-clean` |

---

## SECTION 7 — UI / DESIGN SYSTEM

### ✅ Completed

| Component | Status | Notes |
|-----------|--------|-------|
| Design tokens | ✅ Done | Orange `#F06138`, brown `#8B4332`, cream `#FEFDEB`, `#FDFAD6` |
| Fonts | ✅ Done | Filson Pro (headings), Lato (body) |
| Auth pages | ✅ Done | Login, Signup, ForgotPassword, ResetPassword, VerifyOTP — redesigned |
| User pages | ✅ Done | Home, Explore, Wishlist, MyBookings, BookingDetail, BookingConfirm, UserProfile, PaymentPage |
| Vendor pages | ✅ Done | Apply, Dashboard, Profile, Services, Availability |
| Admin pages | ✅ Done | Dashboard, Vendors, Users, Bookings, Payments, Reviews, Settings |
| UserNavbar | ✅ Done | Two-strip layout, city selector, notification bell, cart badge |
| Footer | ✅ Done | Shared component |
| Skeleton loaders | ✅ Done | `SkeletonCard` used across listing pages |
| Page transitions | ✅ Done | `pageVariants` with Framer Motion |
| Landing pages | ✅ Done | Dual landing — user vs vendor, BecomeVendor page |

### ⚠️ Known Gaps

| Issue | Priority | Notes |
|-------|----------|-------|
| 404 page | LOW | No `<Route path="*">` fallback page |
| `/notifications` page | LOW | Linked from navbar but not built |
| `/create-event` page | LOW | Linked from navbar but not built |
| Mobile drawer polish | LOW | Vendor/admin mobile navbars less refined than UserNavbar |

---

## SECTION 8 — ENVIRONMENT SETUP

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

### Server (`server/.env`)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
RAZORPAY_KEY_ID=rzp_test_...          # Fill to enable payments
RAZORPAY_KEY_SECRET=your_secret       # Fill to enable payments
```

---

## SECTION 9 — REMAINING PRIORITIES (Post-Demo)

| Priority | Task | Effort |
|----------|------|--------|
| HIGH | Add Razorpay production keys + set `PAYMENTS_ENABLED = true` | 1 hour |
| HIGH | Deploy (Render/Railway + Vercel + MongoDB Atlas) | 2–4 hours |
| MED | Add 404 page | 30 min |
| MED | Build `/notifications` page | 2–3 hours |
| MED | Add rate limiting to auth routes | 1 hour |
| MED | Add `express-mongo-sanitize` + `xss-clean` | 30 min |
| LOW | Google OAuth backend | 3–4 hours |
| LOW | Hourly booking slot conflict | 2 hours |
| LOW | Admin analytics real data | 2–3 hours |
| LOW | Vendor review responses | 1–2 hours |
| LOW | Build `/create-event` page | 4–6 hours |

---

## CHANGE LOG

| Date | Change |
|------|--------|
| 2026-03-19 | Initial audit — 4 critical blockers, 11 high issues identified |
| 2026-03-19 | Phase 1 fixes: OTP hashing, email guards, password reset flow, vendor middleware |
| 2026-03-20 | Phase 2: Full UI redesign — auth pages, user pages, vendor pages, admin pages |
| 2026-03-20 | Auth pages redesign: Login, Signup, ForgotPassword, ResetPassword, VerifyOTP |
| 2026-03-20 | Dual landing pages (user vs vendor), BecomeVendor page |
| 2026-03-20 | All user post-login pages redesigned with modern UX |
| 2026-03-20 | Audit updated to reflect current state — readiness raised from 45% → 85% |

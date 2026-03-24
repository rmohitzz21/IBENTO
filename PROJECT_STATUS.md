# iBento — Project Status & Pre-Change Checklist

> **Always read this file before making any changes.**
> Update it after each session. Last updated: 2026-03-23

---

## Stack (Actual Versions — Not What You Might Expect)

| Package | Version | Notes |
|---|---|---|
| React | **19**.2.4 | Not 18. ref is a regular prop now (no forwardRef needed) |
| Vite | 8.0.0 | |
| react-router-dom | **7**.13.1 | Not v6. `element={<Comp/>}` still works; loaders/actions are v7 additions |
| @tanstack/react-query | 5.90.21 | `onSuccess`/`onError` **removed** from `useQuery` — only works in `useMutation` |
| zustand | 5.0.12 | persist middleware API unchanged from v4 |
| framer-motion | 12.37.0 | No breaking changes for current usage |
| react-hook-form | 7.71.2 | |
| @hookform/resolvers | 5.2.2 | |
| zod | **4**.3.6 | `.nonempty()` removed — use `.min(1)`. Otherwise compatible with v3 usage |
| socket.io-client | 4.8.3 | Must match server (server: 4.8.3 ✓) |
| razorpay (server) | 2.9.6 | **Currently disabled** — config/razorpay.js exports null |
| express | 4.22.1 | |
| mongoose | **9**.3.0 | Requires Node 14+; use `lean()` for read-only queries |
| recharts | 3.8.0 | Used in admin/vendor dashboards |
| swiper | 12.1.2 | Available, not yet wired to UI |
| date-fns | 4.1.0 | Used in formatDate utility |

---

## CRITICAL BUGS — Fix Before Running

### ~~1. Login route rejects email-only requests~~ ✅ FIXED 2026-03-18
~~`auth.routes.js` `/login` had `password.notEmpty()` — changed to `password.optional()`~~

### ~~2. Register route requires password field~~ ✅ FIXED 2026-03-18
~~`auth.routes.js` `/register` had `password.isLength({min:8})` — removed entirely~~

### ~~3. Socket.io event name mismatch (chat is broken)~~ ✅ FIXED 2026-03-23
`useSocket.js` now uses correct server-side event names:
| Event | Client (`useSocket.js`) | Server (`handlers.js`) | Status |
|---|---|---|---|
| Join room | `join:conversation` | `join:conversation` | ✅ |
| Send message | `message:send` | `message:send` | ✅ |
| Typing | `typing:start` / `typing:stop` | `typing:start` / `typing:stop` | ✅ |

Singleton pattern implemented — socket persists across component mounts/unmounts. Auth-token-aware reconnection works correctly.

### 4. Razorpay is disabled on the server
**File:** `server/src/config/razorpay.js` exports `null`
**Impact:** Payment page UI exists and shows a "coming soon" notice. Server cannot create orders or verify payments.
**Fix:** Set real `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `server/.env` and enable in config.
**Client:** `PaymentPage.jsx` has `const PAYMENTS_ENABLED = false` — flip this after enabling server config.

---

## IMPORTANT — Stack Gotchas

### React Query v5: `onSuccess` in `useQuery` is silently ignored
```js
// BROKEN — v5 silently ignores this:
useQuery({ queryKey: [...], queryFn: ..., onSuccess: (data) => doSomething(data) })

// CORRECT — use useEffect instead:
const { data } = useQuery({ queryKey: [...], queryFn: ... })
useEffect(() => { if (data) doSomething(data) }, [data])
```
`onSuccess` / `onError` still work in `useMutation`. Only removed from `useQuery`.

### Zod v4 — `.nonempty()` removed
Use `.min(1, 'Required')` instead. Check `client/src/utils/validators.js` before adding new schemas.

### React Router v7 — `<Route component={X}>` removed
Use `element={<X />}`. App.jsx is already correct.

### Razorpay — payment flow requires server config
Pattern: `createOrder` (server) → Razorpay modal (client) → `verifyPayment` (server checks signature). Never trust client-side payment success alone.

---

## Architecture Overview

### Frontend `client/src/`

```
pages/
  public/    VendorLanding(/), UserLanding, BrowsePage, VendorDetail, AboutPage, ContactPage
  auth/      Login, Signup, VerifyOTP, ForgotPassword, ResetPassword
  user/      Home, Explore, VendorProfile, BookingForm, BookingConfirm, MyBookings,
             BookingDetail, Chat, Notifications, PaymentPage, UserProfile, Wishlist
  vendor/    Dashboard, Bookings, BookingDetail, Services, Earnings, Profile,
             Chat, Notifications, Availability, Reviews, Apply
  admin/     Dashboard, Vendors, Users, Bookings, Payments, Reviews, Settings

components/shared/
  Navbar, UserNavbar, AdminSidebar, VendorSidebar, Footer
  Button, Input, Badge, Modal, Skeleton/SkeletonCard, StatCard, SearchBar, Toast

animations/
  pageTransitions.js  — pageVariants, staggerContainer, fadeInUp, fadeIn, slideInRight, scaleIn, heroTextVariants
  microInteractions.js — cardHover, heartBounce, buttonPress, modalVariants, dropdownVariants, shakeVariants
  scrollReveal.js     — useScrollReveal hook, revealVariants, revealStagger, revealChild

utils/
  formatCurrency.js   — formatCurrency(amount, compact), formatPerPlate(amount)
  formatDate.js       — formatDate, formatDateTime, formatRelative, formatEventDate, countdown
  validators.js       — Zod schemas: loginSchema, registerSchema, bookingSchema, reviewSchema, vendorApplicationSchema

stores/   authStore (persisted: ibento-auth), cartStore (persisted: ibento-cart), chatStore, notificationStore
services/ api (axios + auto-refresh + 401 queue), auth, vendors, bookings, payments, uploads
hooks/    useAuth (auth mutations), useRazorpay (checkout modal), useSocket (socket.io)
```

### Auth Flow
- **User/Vendor login:** Email only → OTP sent → `/verify-otp` → tokens issued → redirect to `from` or `/home`
- **Admin login:** Email → `requiresPassword:true` → email+password → tokens issued
- **Register:** Name + email + phone + role (no password) → OTP → `/verify-otp` → tokens → redirect
- **Token refresh:** Auto-refresh on 401 via axios interceptor (queues concurrent failed requests)
- **Persistence:** zustand-persist saves `user`, `accessToken`, `isAuthenticated` → localStorage key: `ibento-auth`

### Backend `server/src/`

```
routes/     auth, user, vendor, service, booking, payment, message, review,
            cart, combo, withdrawal, category, notification, upload, admin
            Total: 14 route files, ~93 endpoints

models/     User, Vendor, Service, Booking, Review, Conversation, Message,
            Notification, OTP (TTL auto-delete), Cart, Category, Combo, Withdrawal

middleware/ protect (JWT), authorize(roles), errorHandler, rateLimiter (3 tiers), upload, validate
            vendorStatus.js — requireApprovedVendor (403 if pending/rejected/suspended)
config/     db (Mongoose), cloudinary, razorpay (DISABLED)
socket/     handlers.js — real-time messaging + typing indicators + booking notifications
services/   email.service (Nodemailer), otp.service (6-digit, 10-min TTL, 3 attempts max, bcrypt-hashed)
```

### Rate Limits (server)
| Limiter | Limit | Used On |
|---|---|---|
| apiLimiter | 100 req / 15 min | All `/api/*` except webhook |
| authLimiter | 10 req / 15 min | `/login`, `/register` |
| otpLimiter | 3 req / hour | `/forgot-password`, `/resend-otp` |

### Socket.io Events (server `handlers.js`)
| Event | Direction | Description |
|---|---|---|
| `join:conversation` | Client → Server | Join a chat room |
| `leave:conversation` | Client → Server | Leave a chat room |
| `message:send` | Client → Server | Send a message |
| `message:receive` | Server → Client | Receive a message |
| `message:sent` | Server → Client | Confirm message sent |
| `message:read` | Client → Server | Mark messages read |
| `message:read-ack` | Server → Client | Read acknowledgment |
| `typing:start` | Client → Server | User started typing |
| `typing:stop` | Client → Server | User stopped typing |
| `typing:indicator` | Server → Client | Broadcast typing status |
| `booking:notify` | Server → Client | New booking notification |
| `booking:update` | Server → Client | Booking status change |
| `notification:push` | Server → Client | Real-time notification delivery |

### Key API Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register (OTP flow, no password sent) |
| POST | `/api/auth/login` | — | Email only for user/vendor; email+pass for admin |
| POST | `/api/auth/verify-otp` | — | Verify OTP, receive access token |
| POST | `/api/auth/refresh` | cookie | Refresh access token via httpOnly cookie |
| GET | `/api/vendors` | — | Browse vendors (filters: category, city, price, rating) |
| GET | `/api/vendors/trending` | — | Top-rated vendors (by city) |
| GET | `/api/vendors/:id` | — | Vendor profile |
| GET | `/api/vendors/:id/services` | — | Vendor services |
| GET | `/api/vendors/:id/reviews` | — | Vendor reviews |
| GET | `/api/vendors/dashboard` | vendor/admin | Dashboard stats |
| GET | `/api/vendors/services` | vendor | Authenticated vendor's own services |
| GET | `/api/vendors/calendar` | vendor | Vendor blocked dates |
| PUT | `/api/vendors/availability` | vendor | Update availability + blockedDates |
| POST | `/api/vendors/apply` | any | Apply as vendor |
| POST | `/api/bookings` | user | Create booking |
| GET | `/api/bookings/my` | user | My bookings |
| GET | `/api/bookings/:id/invoice` | user | Invoice blob |
| POST | `/api/payments/create-order` | user | Create Razorpay order |
| POST | `/api/payments/verify` | user | Verify payment signature |
| POST | `/api/payments/webhook` | — | Razorpay webhook (no auth) |
| GET | `/api/messages/conversations` | any | List conversations |
| GET | `/api/messages/conversations/:id` | any | Get messages in conversation |
| PUT | `/api/messages/conversations/:id/read` | any | Mark conversation as read |
| POST | `/api/messages/send` | any | Send message (HTTP fallback) |
| GET | `/api/notifications` | any | Get notifications |
| PUT | `/api/notifications/mark-all-read` | any | Mark all notifications read |
| PUT | `/api/notifications/:id/read` | any | Mark single notification read |
| POST | `/api/uploads/single` | any | Upload to Cloudinary |
| GET | `/api/admin/dashboard` | admin | Platform stats |
| GET | `/api/admin/vendors` | admin | All vendors with filters |
| PUT | `/api/admin/vendors/:id/approve` | admin | Approve vendor |
| PUT | `/api/admin/vendors/:id/reject` | admin | Reject vendor with reason |
| PUT | `/api/admin/vendors/:id/suspend` | admin | Suspend vendor |
| GET | `/api/admin/users` | admin | All users |
| PUT | `/api/admin/users/:id/block` | admin | Block/unblock user |
| GET | `/api/admin/bookings` | admin | All bookings |

---

## User ↔ Vendor ↔ Admin Interaction Map (Current State)

### User → Vendor
| Action | How | Status |
|---|---|---|
| Browse vendors | BrowsePage → `/api/vendors` with filters | ✅ Working |
| View vendor profile | VendorProfile → `/api/vendors/:id` + services + reviews | ✅ Working |
| Book a service | BookingForm → `POST /api/bookings` → BookingConfirm | ✅ Working |
| Pay for booking | PaymentPage | ❌ Blocked (Razorpay disabled) |
| Message vendor | Chat → `POST /api/messages/send` + Socket `message:send` | ✅ Working |
| Add to wishlist | WishlistPage → real API via `data?.data?.wishlist` | ✅ Working |
| Write review | No submit UI yet — can read reviews | ⚠️ Read-only |

### Vendor → User
| Action | How | Status |
|---|---|---|
| Receive booking | VendorBookings list → `/api/vendor/bookings` | ✅ Working |
| Accept/Reject booking | VendorBookingDetail (individual row) | ✅ Working |
| Reply to message | Vendor Chat → Socket + HTTP fallback | ✅ Working |
| Block calendar dates | Availability → `PUT /api/vendors/availability` | ✅ Working |
| Manage services | Services page → `/api/vendors/services` + image upload | ✅ Working |

### Admin → All
| Action | How | Status |
|---|---|---|
| Approve vendor | Admin Vendors → `PUT /api/admin/vendors/:id/approve` | ✅ Working |
| Reject vendor | Admin Vendors → `PUT /api/admin/vendors/:id/reject` + reason | ✅ Working |
| Suspend vendor | Admin Vendors → `PUT /api/admin/vendors/:id/suspend` | ✅ Working |
| Block/Unblock user | Admin Users → `PUT /api/admin/users/:id/block` | ✅ Working |
| View all bookings | Admin Bookings → read-only with filters | ✅ Working |
| View platform stats | Admin Dashboard → `/api/admin/dashboard` | ✅ Working (real API, mock fallback) |
| Manage payments/withdrawals | Admin Payments page | ✅ Working (Recharts) |

---

## Pages Status

| Page | UI | Real API | Notes |
|---|---|---|---|
| Login | ✅ | ✅ | 2-step OTP; email+password for admin |
| Signup | ✅ | ✅ | Role toggle (user/vendor) |
| VerifyOTP | ✅ | ✅ | Restores `from` redirect after OTP |
| ForgotPassword | ✅ | ✅ | Shows "Enter Reset Code" button to /reset-password |
| ResetPassword | ✅ | ✅ | OTP-based (email + otp + newPassword) |
| VendorLanding (/) | ✅ | Partial | Smart root: redirects by auth/role |
| UserLanding | ✅ | Partial | |
| BrowsePage | ✅ | Partial | Filters work; API call wired |
| VendorDetail (public) | ✅ | Partial | Book Now passes `from` to login |
| Home (user) | ✅ | Partial | Categories, trending, recent bookings |
| Explore | ✅ | Partial | |
| VendorProfile (user) | ✅ | Partial | Message → Chat; Book Now → BookingForm |
| BookingForm | ✅ | ✅ | Submits to `/api/bookings`; correct field names |
| BookingConfirm | ✅ | ✅ | Confetti + booking summary + next steps |
| MyBookings | ✅ | ✅ | Real API; tab/search filters |
| BookingDetail (user) | ✅ | Partial | |
| PaymentPage | ✅ | ❌ | `PAYMENTS_ENABLED=false`; shows "coming soon" UI |
| Chat (user) | ✅ | ✅ | Socket + HTTP; typing indicators; read receipts |
| Notifications (user) | ✅ | ✅ | Mark read; real-time via `notification:push` |
| UserProfile | ✅ | Partial | |
| Wishlist | ✅ | ✅ | Real API; no mock fallback |
| Vendor Dashboard | ✅ | Partial | Stats from `/api/vendors/dashboard` |
| Vendor Bookings | ✅ | ✅ | Real API; tab/search; links to detail |
| Vendor BookingDetail | ✅ | ✅ | Accept/Reject actions |
| Vendor Services | ✅ | ✅ | Image upload (up to 5 per service via Cloudinary) |
| Vendor Profile | ✅ | ✅ | Avatar upload via `/api/users/avatar` |
| Vendor Availability | ✅ | ✅ | Calendar block/unblock; `isAvailable` toggle |
| Vendor Earnings | ✅ | Partial | Recharts wired |
| Vendor Chat | ✅ | ✅ | Socket + HTTP; can initiate conversations |
| Vendor Notifications | ✅ | ✅ | Mark read; real-time |
| Vendor Apply | ✅ | ✅ | 4-step: business → details → KYC/bank → review |
| Admin Dashboard | ✅ | ✅ | Real API; mock fallback; pending approvals |
| Admin Vendors | ✅ | ✅ | Approve / Reject (with reason) / Suspend |
| Admin Users | ✅ | ✅ | Block/Unblock; role filter |
| Admin Bookings | ✅ | ✅ | Read-only; status/search filters |
| Admin Payments | ✅ | Partial | Withdrawals view; Recharts |
| Admin Reviews | ✅ | Partial | |
| Admin Settings | ✅ | Partial | |

---

## TODO — Ordered by Priority

### Fix Now (breaks features)
- [x] ~~`auth.routes.js` — `password` optional on `/login`~~ ✅ Done
- [x] ~~`auth.routes.js` — remove `password` validation on `/register`~~ ✅ Done
- [x] ~~Fix socket event names in `useSocket.js`~~ ✅ Done 2026-03-23
- [ ] Enable Razorpay: set credentials in `server/.env`, flip `PAYMENTS_ENABLED=true` in `PaymentPage.jsx`

### Before Full Integration
- [x] Audit ALL `useQuery` calls for `onSuccess`/`onError` → replace with `useEffect` (Verified clean)
- [ ] Test auto token-refresh flow end-to-end (access token expires at 15m)
- [ ] Wire real SMTP credentials — OTP emails only log to console in dev mode
- [ ] Wire real Cloudinary credentials — image uploads fail without them

### Features with Server Ready, No Client UI
- [x] Review submission form (can read reviews, cannot write) -> Added to BookingDetail
- [ ] Google OAuth (login buttons exist, no backend handler)
- [ ] Cart page and checkout flow (cartStore + server routes exist)
- [ ] Combo packages (full server: routes + model + AI suggestions via OpenAI)
- [ ] Vendor withdrawal request UI
- [x] Invoice PDF download button (service call + server route exist) -> Found working in BookingDetail
- [ ] AI combo suggestions (OpenAI API key needed: `OPENAI_API_KEY`)

### UX Polish
- [x] Category cards on Home deep-link to BrowsePage with filter -> Native ?category= functionality verified
- [ ] Booking flow continuity: BookingConfirm → PaymentPage (once Razorpay enabled)
- [x] Error boundary / friendly 500 page -> NotFound and ErrorBoundary components implemented
- [ ] Consistent skeletons on all data-loading pages
- [x] Admin booking detail — add status change actions (currently read-only) -> Added management dropdown

---

## Environment Variables

### Server `server/.env`
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=          # 64-char random string
JWT_REFRESH_SECRET=  # different 64-char string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=           # Gmail App Password (not your Gmail password)
OPENAI_API_KEY=      # For AI combo suggestions
CLIENT_URL=http://localhost:3000
```

### Client `client/.env`
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_...
VITE_CLOUDINARY_PRESET=ibento_uploads
VITE_GOOGLE_MAPS_KEY=
```

---

## Color System (always use these)
| Token | Hex | Usage |
|---|---|---|
| orange-primary | `#F06138` | CTAs, buttons, active states |
| orange-dark | `#F54900` | Hover state for orange |
| orange-light | `#FFF3EF` | Hover bg, light accents |
| brown-dark | `#8B4332` | Headings, prices, logo |
| page-bg | `#FFFDFC` | Page background |
| card-bg | `#FEFDEB` | Cards, auth forms |
| input-bg | `#FFFEED` | Input fields |
| card-alt | `#FFFEF5` | Alt card background |
| text-on-orange | `#FDFAD6` | Text color on orange buttons |
| text-dark | `#101828` | Primary text |
| text-body | `#364153` | Body text |
| text-muted | `#6A6A6A` | Secondary/muted text |

---

## Rules Before Making Any Change

1. **Read this file first** — check if the change conflicts with anything listed
2. **Stack versions are final** — no APIs removed in these versions (esp. no `onSuccess` in `useQuery`)
3. **All pages have mock fallbacks** — always preserve `data?.x || MOCK_DATA` patterns
4. **Auth state fields** — `isAuthenticated`, `user`, `accessToken` in localStorage key `ibento-auth`
5. **Route protection** — `roles={['user']}` customer | `roles={['vendor']}` vendor | `roles={['admin']}` admin
6. **Server validation = controller fields** — don't validate fields the controller doesn't use
7. **Socket event names** — use server-side names from the table above (not invented names)
8. **Razorpay needs server config** — never trust client-side payment status alone
9. **Fonts** — `font-filson` headings/logo | `font-lato` body text
10. **Search web docs for new patterns** — especially Razorpay, socket.io, Cloudinary, OpenAI
11. **vendorStatus middleware** — `requireApprovedVendor` blocks pending/rejected/suspended vendors from key routes (returns 403 with `status` + `code` fields)
12. **OTPs are bcrypt-hashed** — never compare OTP plaintext to DB value; use `bcrypt.compare()`

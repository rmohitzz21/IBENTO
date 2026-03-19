# iBento — Project Status & Pre-Change Checklist

> **Always read this file before making any changes.**
> Update it after each session. Last updated: 2026-03-18

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

### 3. Socket.io event name mismatch (chat is broken)
**Client sends → Server expects:**
| Client (`useSocket.js`) | Server (`handlers.js`) | Status |
|---|---|---|
| `conversation:join` | `join:conversation` | ❌ MISMATCH |
| `message:send` | `message:send` | ✅ |
| `typing` | `typing:start` / `typing:stop` | ❌ MISMATCH |

**Fix:** Either update `useSocket.js` to use server event names, or update `handlers.js` to match client names. Recommend fixing `useSocket.js`:
```js
// conversation:join → join:conversation
emit('join:conversation', { conversationId })
// typing → typing:start / typing:stop
emit(isTyping ? 'typing:start' : 'typing:stop', { conversationId })
```

### 4. Razorpay is disabled on the server
**File:** `server/src/config/razorpay.js` exports `null`
**Impact:** Payment page UI exists and Razorpay hook works, but server cannot create orders or verify payments.
**Fix:** Set real `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `server/.env` and enable in config.

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
config/     db (Mongoose), cloudinary, razorpay (DISABLED)
socket/     handlers.js — real-time messaging + typing indicators + booking notifications
services/   email.service (Nodemailer), otp.service (6-digit, 10-min TTL, 3 attempts max)
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
| POST | `/api/vendors/apply` | any | Apply as vendor |
| POST | `/api/bookings` | user | Create booking |
| GET | `/api/bookings/my` | user | My bookings |
| GET | `/api/bookings/:id/invoice` | user | Invoice blob |
| POST | `/api/payments/create-order` | user | Create Razorpay order |
| POST | `/api/payments/verify` | user | Verify payment signature |
| POST | `/api/payments/webhook` | — | Razorpay webhook (no auth) |
| GET | `/api/messages/conversations` | any | List conversations |
| POST | `/api/messages/send` | any | Send message (HTTP fallback) |
| POST | `/api/uploads/single` | any | Upload to Cloudinary |
| GET | `/api/admin/dashboard` | admin | Platform stats |
| PUT | `/api/admin/vendors/:id/approve` | admin | Approve vendor |

---

## Pages Status

| Page | UI | Mock | Real API | Notes |
|---|---|---|---|---|
| Login | ✅ | — | ✅ | 2-step OTP; bugs #1+#2 now fixed |
| Signup | ✅ | — | ✅ | Role toggle (user/vendor) |
| VerifyOTP | ✅ | — | ✅ | Restores `from` redirect after OTP |
| ForgotPassword | ✅ | — | ✅ | |
| ResetPassword | ✅ | — | ✅ | |
| VendorLanding (/) | ✅ | ✅ | Partial | |
| UserLanding | ✅ | ✅ | Partial | |
| BrowsePage | ✅ | ✅ | Partial | |
| VendorDetail (public) | ✅ | ✅ | Partial | Book Now passes `from` to login |
| Home (user) | ✅ | ✅ | Partial | Categories, trending, recent bookings |
| Explore | ✅ | ✅ | Partial | |
| VendorProfile (user) | ✅ | ✅ | Partial | Message now passes `?vendorId` |
| BookingForm | ✅ | ✅ | ✅ | Submits to `/api/bookings` |
| BookingConfirm | ✅ | ✅ | Partial | |
| MyBookings | ✅ | ✅ | Partial | |
| BookingDetail (user) | ✅ | ✅ | Partial | |
| PaymentPage | ✅ | ✅ | Blocked | Razorpay disabled on server (bug #4) |
| Chat (user) | ✅ | ✅ | Broken | Socket event names mismatched (bug #3) |
| Notifications (user) | ✅ | ✅ | Partial | |
| UserProfile | ✅ | ✅ | Partial | |
| Wishlist | ✅ | ✅ | Partial | |
| Vendor Dashboard | ✅ | ✅ | Partial | |
| Vendor Bookings | ✅ | ✅ | Partial | |
| Vendor Services | ✅ | ✅ | Partial | |
| Vendor Profile | ✅ | ✅ | Partial | |
| Vendor Availability | ✅ | ✅ | Partial | |
| Vendor Earnings | ✅ | ✅ | Partial | Recharts wired |
| Vendor Chat | ✅ | ✅ | Broken | Same socket mismatch as user Chat |
| Vendor Apply | ✅ | — | ✅ | |
| Admin Dashboard | ✅ | ✅ | Partial | |
| Admin pages ×6 | ✅ | ✅ | Partial | Vendors, Users, Bookings, Payments, Reviews, Settings |

---

## TODO — Ordered by Priority

### Fix Now (breaks features)
- [x] ~~`auth.routes.js` — `password` optional on `/login`~~ ✅ Done
- [x] ~~`auth.routes.js` — remove `password` validation on `/register`~~ ✅ Done
- [ ] Fix socket event names: `conversation:join` → `join:conversation`, `typing` → `typing:start`/`typing:stop` in `useSocket.js`
- [ ] Enable Razorpay: set credentials in `server/.env` and update `config/razorpay.js`

### Before Full Integration
- [ ] Audit ALL `useQuery` calls for `onSuccess`/`onError` → replace with `useEffect`
- [ ] Verify `payments.js` service uses `/payments/create-order` not `/payments/order`
- [ ] Test auto token-refresh flow end-to-end (access token expires at 15m)
- [ ] Wire real SMTP credentials — OTP emails only log to console in dev mode

### Features with Server Ready, No Client UI
- [ ] Google OAuth (login buttons exist, no backend handler)
- [ ] Image upload UI via Cloudinary (upload service + server route exist)
- [ ] Combo packages (full server: routes + model + AI suggestions via OpenAI)
- [ ] Cart page and checkout flow (cartStore + server routes exist)
- [ ] Review submission form (can read reviews, cannot write)
- [ ] Vendor withdrawal request UI
- [ ] Admin vendor approval flow (approve/reject sends email)
- [ ] Invoice PDF download button (service call + server route exist)
- [ ] AI combo suggestions (OpenAI API key needed: `OPENAI_API_KEY`)

### UX Polish
- [ ] Category cards on Home deep-link to BrowsePage with filter
- [ ] Create new conversation if Message Vendor has no existing chat
- [ ] Booking flow: BookingForm success → BookingConfirm → PaymentPage
- [ ] Error boundary / friendly 500 page
- [ ] Consistent skeletons on all data-loading pages

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

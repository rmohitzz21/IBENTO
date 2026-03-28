import { Suspense, lazy } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import { toastConfig } from './components/shared/Toast'
import { useAuthStore } from './stores/authStore'
import { useSocket } from './hooks/useSocket'
import ErrorBoundary from './components/shared/ErrorBoundary'

/* ─── Lazy-loaded pages ─────────────────────────────────────── */

// Public
const UserLanding    = lazy(() => import('./pages/public/UserLanding'))
const BecomeVendor   = lazy(() => import('./pages/public/BecomeVendor'))
const BrowsePage     = lazy(() => import('./pages/public/BrowsePage'))
const VendorDetail   = lazy(() => import('./pages/public/VendorDetail'))
const AboutPage      = lazy(() => import('./pages/public/AboutPage'))
const ContactPage    = lazy(() => import('./pages/public/ContactPage'))
const NotFound       = lazy(() => import('./pages/public/NotFound'))

// Auth
const Login          = lazy(() => import('./pages/auth/Login'))
const Signup         = lazy(() => import('./pages/auth/Signup'))
const VerifyOTP      = lazy(() => import('./pages/auth/VerifyOTP'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword  = lazy(() => import('./pages/auth/ResetPassword'))

// Customer (protected – role: user)
const Home           = lazy(() => import('./pages/user/Home'))
const Explore        = lazy(() => import('./pages/user/Explore'))
const VendorProfile  = lazy(() => import('./pages/user/VendorProfile'))
const BookingForm    = lazy(() => import('./pages/user/BookingForm'))
const BookingConfirm = lazy(() => import('./pages/user/BookingConfirm'))
const MyBookings     = lazy(() => import('./pages/user/MyBookings'))
const BookingDetail  = lazy(() => import('./pages/user/BookingDetail'))
const Wishlist       = lazy(() => import('./pages/user/Wishlist'))
const UserProfile    = lazy(() => import('./pages/user/UserProfile'))
const Chat           = lazy(() => import('./pages/user/Chat'))
const Notifications  = lazy(() => import('./pages/user/Notifications'))
const PaymentPage    = lazy(() => import('./pages/user/PaymentPage'))
const CreateEvent    = lazy(() => import('./pages/user/CreateEvent'))
const Offers         = lazy(() => import('./pages/user/Offers'))

// Vendor (protected – role: vendor)
const VendorDashboard       = lazy(() => import('./pages/vendor/Dashboard'))
const VendorBookings        = lazy(() => import('./pages/vendor/Bookings'))
const VendorBookingDetail   = lazy(() => import('./pages/vendor/BookingDetail'))
const VendorServices        = lazy(() => import('./pages/vendor/Services'))
const VendorEarnings        = lazy(() => import('./pages/vendor/Earnings'))
const VendorProfile2        = lazy(() => import('./pages/vendor/Profile'))
const VendorChat            = lazy(() => import('./pages/vendor/Chat'))
const VendorNotifications   = lazy(() => import('./pages/vendor/Notifications'))
const VendorAvailability    = lazy(() => import('./pages/vendor/Availability'))
const VendorReviews         = lazy(() => import('./pages/vendor/Reviews'))
const VendorApply           = lazy(() => import('./pages/vendor/Apply'))

// Admin (protected – role: admin)
const AdminDashboard        = lazy(() => import('./pages/admin/Dashboard'))
const AdminVendors          = lazy(() => import('./pages/admin/Vendors'))
const AdminUsers            = lazy(() => import('./pages/admin/Users'))
const AdminBookings         = lazy(() => import('./pages/admin/Bookings'))
const AdminPayments         = lazy(() => import('./pages/admin/Payments'))
const AdminReviews          = lazy(() => import('./pages/admin/Reviews'))
const AdminSettings         = lazy(() => import('./pages/admin/Settings'))

/* ─── QueryClient ───────────────────────────────────────────── */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

/* ─── Page loader (top progress bar) ────────────────────────── */
function PageLoader() {
  return (
    <div
      className="fixed top-0 left-0 h-0.5 bg-[#F06138] z-50 animate-[progress_2s_ease-in-out]"
      style={{ width: '70%' }}
    />
  )
}

/* ─── Root redirect — smart landing based on auth state ─────── */
function RootPage() {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <UserLanding />
  if (user?.role === 'vendor') return <Navigate to="/vendor/dashboard" replace />
  if (user?.role === 'admin')  return <Navigate to="/admin/dashboard"  replace />
  return <Navigate to="/home" replace />
}

/* ─── Protected Route ───────────────────────────────────────── */
/**
 * @param {string[]} roles - allowed roles (e.g. ['user', 'admin'])
 */
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on actual role
    if (user?.role === 'vendor') return <Navigate to="/vendor/dashboard" replace />
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/home" replace />
  }

  return children
}

/* ─── Socket initialiser (must be inside Router) ────────────── */
function SocketInit() {
  useSocket()
  return null
}

/* ─── Animated routes (must be inside Router) ───────────────── */
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ── Public ──────────────────────────────────────────── */}
        <Route path="/" element={<RootPage />} />
        <Route path="/become-vendor" element={<BecomeVendor />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />
        <Route path="/for-customers" element={<Navigate to="/" replace />} />

        {/* ── Auth ────────────────────────────────────────────── */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ── Customer (role: user) ────────────────────────────── */}
        <Route
          path="/home"
          element={
            <ProtectedRoute roles={['user']}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute roles={['user']}>
              <Explore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-event"
          element={
            <ProtectedRoute roles={['user']}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/:id"
          element={
            <ProtectedRoute roles={['user']}>
              <VendorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book/:vendorId/:serviceId"
          element={
            <ProtectedRoute roles={['user']}>
              <BookingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/confirm/:bookingId"
          element={
            <ProtectedRoute roles={['user']}>
              <BookingConfirm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute roles={['user']}>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute roles={['user']}>
              <BookingDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute roles={['user']}>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={['user']}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute roles={['user']}>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute roles={['user']}>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:bookingId"
          element={
            <ProtectedRoute roles={['user']}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        {/* ── Vendor (role: vendor) ───────────────────────────── */}
        <Route
          path="/vendor/dashboard"
          element={
            <ProtectedRoute roles={['vendor']}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/bookings"
          element={
            <ProtectedRoute roles={['vendor']}>
              <VendorBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/bookings/:id"
          element={
            <ProtectedRoute roles={['vendor']}>
              <VendorBookingDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/services"
          element={
            <ProtectedRoute roles={['vendor']}>
              <VendorServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/earnings"
          element={
            <ProtectedRoute roles={['vendor']}>
              <VendorEarnings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/profile"
          element={
            <ProtectedRoute roles={['vendor']}>
              <VendorProfile2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/chat"
          element={
            <ProtectedRoute roles={['vendor']}>
              <VendorChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/notifications"
          element={
            <ProtectedRoute roles={['vendor']}>
              <VendorNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/availability"
          element={
            <ProtectedRoute roles={['vendor']}>
              <VendorAvailability />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/reviews"
          element={
            <ProtectedRoute roles={['vendor']}>
              <VendorReviews />
            </ProtectedRoute>
          }
        />
        <Route path="/vendor/apply" element={<VendorApply />} />

        {/* ── Admin (role: admin) ──────────────────────────────── */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vendors"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminVendors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* ── Offers ──────────────────────────────────────────── */}
        <Route
          path="/offers"
          element={
            <ProtectedRoute roles={['user']}>
              <Offers />
            </ProtectedRoute>
          }
        />

        {/* ── Navbar link redirects (no dedicated page yet) ─── */}
        <Route path="/cart" element={<Navigate to="/wishlist" replace />} />
        <Route path="/services" element={<Navigate to="/explore" replace />} />
        <Route path="/settings" element={<Navigate to="/profile" replace />} />

        {/* ── 404 fallback ────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

/* ─── Root App ───────────────────────────────────────────────── */
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster {...toastConfig} />
          <SocketInit />
          <Suspense fallback={<PageLoader />}>
            <AnimatedRoutes />
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

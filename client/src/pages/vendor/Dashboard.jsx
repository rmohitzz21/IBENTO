import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarCheck,
  IndianRupee,
  Star,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  ArrowUpRight,
  AlertCircle,
  Wrench,
  User,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { pageVariants, staggerContainer, fadeInUp } from '../../animations/pageTransitions'
import VendorSidebar from '../../components/shared/VendorSidebar'
import StatCard from '../../components/shared/StatCard'
import { useAuthStore } from '../../stores/authStore'
import { getVendorDashboard, updateAvailability } from '../../services/vendors'

/* ─── Helpers ────────────────────────────────────────────── */
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const STATUS_META = {
  pending:   { label: 'Pending',   textColor: '#92400E', bg: '#FFFBEB', dot: '#F59E0B' },
  confirmed: { label: 'Confirmed', textColor: '#065F46', bg: '#ECFDF5', dot: '#10B981' },
  completed: { label: 'Completed', textColor: '#1E40AF', bg: '#EFF6FF', dot: '#3B82F6' },
  cancelled: { label: 'Cancelled', textColor: '#991B1B', bg: '#FEF2F2', dot: '#EF4444' },
  rejected:  { label: 'Rejected',  textColor: '#991B1B', bg: '#FEF2F2', dot: '#EF4444' },
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '—'
  return new Intl.NumberFormat('en-IN').format(Math.round(amount))
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/* ─── Earnings bar chart ─────────────────────────────────── */
function EarningsChart({ data }) {
  const [hovered, setHovered] = useState(null)

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2">
        <IndianRupee size={24} strokeWidth={1.5} style={{ color: '#E5E7EB' }} />
        <p className="text-sm" style={{ color: '#9CA3AF' }}>No earnings yet</p>
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.earnings), 1)

  return (
    <div className="flex items-end gap-2 h-32 pt-2">
      {data.map((d, i) => {
        const heightPct = Math.max((d.earnings / max) * 100, 5)
        const isHovered = hovered === i

        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1.5 relative"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap pointer-events-none z-10"
                style={{
                  background: '#101828',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                ₹{formatCurrency(d.earnings)}
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: '4px solid #101828',
                  }}
                />
              </motion.div>
            )}

            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${heightPct}%` }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.06 }}
              className="w-full rounded-t-md cursor-pointer transition-opacity"
              style={{
                background: isHovered
                  ? 'linear-gradient(180deg, #F06138 0%, #C94B27 100%)'
                  : 'linear-gradient(180deg, #FDA278 0%, #F06138 100%)',
                opacity: isHovered ? 1 : 0.7 + 0.1 * (i / data.length),
              }}
            />
            <span className="text-[9px] font-medium" style={{ color: '#9CA3AF' }}>
              {MONTH_NAMES[(d._id?.month ?? 1) - 1]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Booking row ────────────────────────────────────────── */
function BookingRow({ booking }) {
  const meta = STATUS_META[booking.status] || STATUS_META.pending

  return (
    <tr
      className="group transition-colors"
      style={{ borderBottom: '1px solid #F9FAFB' }}
    >
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2.5">
          {booking.userId?.avatar ? (
            <img src={booking.userId.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-white" />
          ) : (
            <div
              className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #F06138, #8A4432)' }}
            >
              {(booking.userId?.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#101828' }}>
              {booking.userId?.name || '—'}
            </p>
            <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>
              {booking.serviceId?.title || '—'}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4 text-sm" style={{ color: '#6A7282' }}>
        {formatDate(booking.eventDate)}
      </td>
      <td className="py-3 pr-4 text-sm font-semibold" style={{ color: '#101828' }}>
        ₹{formatCurrency(booking.totalAmount)}
      </td>
      <td className="py-3">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: meta.bg, color: meta.textColor }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }} />
          {meta.label}
        </span>
      </td>
    </tr>
  )
}

/* ─── Skeleton ───────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="flex-1 p-8 space-y-6">
      <div className="h-28 rounded-2xl animate-pulse" style={{ background: '#F3F4F6' }} />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: '#F3F4F6' }} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 rounded-2xl animate-pulse" style={{ background: '#F3F4F6' }} />
        <div className="space-y-4">
          <div className="h-40 rounded-2xl animate-pulse" style={{ background: '#F3F4F6' }} />
          <div className="h-28 rounded-2xl animate-pulse" style={{ background: '#F3F4F6' }} />
        </div>
      </div>
    </div>
  )
}

/* ─── Pending approval screen ────────────────────────────── */
function PendingScreen({ onLogout }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#FFFDFC' }}>
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF9C3 100%)' }}
        >
          <Clock size={40} className="text-amber-500" />
        </motion.div>
        <h1 className="font-filson font-black text-3xl mb-3" style={{ color: '#101828' }}>
          Application Under Review
        </h1>
        <p className="font-lato text-sm leading-relaxed mb-2" style={{ color: '#6A6A6A' }}>
          Your vendor application has been submitted and is being reviewed by the iBento team.
        </p>
        <p className="font-lato text-sm mb-8" style={{ color: '#6A6A6A' }}>
          We typically review within{' '}
          <span className="font-semibold" style={{ color: '#101828' }}>2–3 business days</span>.
          You'll receive an email once approved.
        </p>
        <div
          className="p-4 rounded-2xl mb-8 text-left"
          style={{ background: '#FFFEF5', border: '1px solid rgba(139,67,50,0.1)' }}
        >
          <p className="font-lato text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#9CA3AF' }}>
            What happens next?
          </p>
          {[
            'Our team reviews your business details',
            'You receive an approval email',
            'Your profile goes live on iBento',
            'Customers can start booking your services',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5 mt-2.5">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white mt-0.5"
                style={{ background: 'linear-gradient(135deg, #F06138, #8A4432)' }}
              >
                {i + 1}
              </span>
              <p className="font-lato text-sm" style={{ color: '#364153' }}>{step}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onLogout}
          className="font-lato text-sm transition-colors underline"
          style={{ color: '#9CA3AF' }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

/* ─── Rejected screen ────────────────────────────────────── */
function RejectedScreen({ onLogout }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#FFFDFC' }}>
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: '#FEF2F2' }}
        >
          <AlertCircle size={40} className="text-red-500" />
        </motion.div>
        <h1 className="font-filson font-black text-3xl mb-3" style={{ color: '#101828' }}>
          Application Not Approved
        </h1>
        <p className="font-lato text-sm leading-relaxed mb-8" style={{ color: '#6A6A6A' }}>
          Unfortunately your vendor application was not approved at this time.
          Please contact our support team for more information or to reapply.
        </p>
        <a
          href="mailto:support@ibento.in"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity mb-4"
          style={{ background: 'linear-gradient(135deg, #F06138, #8A4432)', color: '#FDFAD6' }}
        >
          Contact Support
        </a>
        <br />
        <button
          onClick={onLogout}
          className="font-lato text-sm transition-colors underline"
          style={{ color: '#9CA3AF' }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

/* ─── Quick action item ──────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: 'Manage Services',  to: '/vendor/services',      icon: Wrench,        iconBg: '#FFF0EB', iconColor: '#F06138' },
  { label: 'View Bookings',    to: '/vendor/bookings',      icon: CalendarCheck, iconBg: '#EFF6FF', iconColor: '#3B82F6' },
  { label: 'Check Messages',   to: '/vendor/chat',          icon: MessageSquare, iconBg: '#F0FDF4', iconColor: '#16A34A' },
  { label: 'Update Profile',   to: '/vendor/profile',       icon: User,          iconBg: '#F5F3FF', iconColor: '#7C3AED' },
]

/* ─── Main Dashboard ─────────────────────────────────────── */
export default function VendorDashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [availToggling, setAvailToggling] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: () => getVendorDashboard().then((r) => r.data),
  })

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  const availMutation = useMutation({
    mutationFn: (isAvailable) => updateAvailability({ isAvailable }),
    onMutate: () => setAvailToggling(true),
    onSuccess: (_, isAvailable) => {
      queryClient.invalidateQueries(['vendor-dashboard'])
      toast.success(isAvailable ? 'You are now available for bookings' : 'You are now unavailable')
    },
    onError: () => toast.error('Failed to update availability'),
    onSettled: () => setAvailToggling(false),
  })

  const stats = data?.stats || {}
  const recentBookings = data?.recentBookings || []
  const monthlyEarnings = data?.monthlyEarnings || []
  const vendor = data?.vendor || {}

  if (!isLoading && !isError) {
    if (vendor.status === 'pending') return <PendingScreen onLogout={handleLogout} />
    if (vendor.status === 'rejected' || vendor.status === 'suspended') return <RejectedScreen onLogout={handleLogout} />
  }

  const vendorName = vendor.businessName || user?.name || 'Vendor'
  const pendingCount = recentBookings.filter((b) => b.status === 'pending').length

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex min-h-screen"
      style={{ background: '#F8F7F5' }}
    >
      <VendorSidebar />

      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <DashboardSkeleton />
        ) : isError ? (
          <div className="flex items-center justify-center h-full min-h-[60vh]">
            <div className="text-center">
              <p className="mb-3" style={{ color: '#9CA3AF' }}>Failed to load dashboard data.</p>
              <button
                onClick={() => queryClient.invalidateQueries(['vendor-dashboard'])}
                className="text-sm font-semibold hover:underline"
                style={{ color: '#F06138' }}
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="p-6 lg:p-8 max-w-7xl space-y-5"
          >
            {/* ── Welcome Banner ── */}
            <motion.div
              variants={fadeInUp}
              className="rounded-2xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap"
              style={{
                background: 'linear-gradient(135deg, #1A1008 0%, #2D1B0E 50%, #3D2010 100%)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              }}
            >
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'rgba(253,250,214,0.5)' }}>
                  {getGreeting()} 👋
                </p>
                <h1 className="font-filson font-black text-2xl" style={{ color: '#FDFAD6', letterSpacing: '-0.03em' }}>
                  {vendorName}
                </h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(253,250,214,0.45)' }}>
                  Here's your business overview for today.
                </p>
              </div>

              <button
                onClick={() => !availToggling && availMutation.mutate(!stats.isAvailable)}
                disabled={availToggling}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border shrink-0"
                style={
                  stats.isAvailable
                    ? { background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)', color: '#34D399' }
                    : { background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(253,250,214,0.5)' }
                }
              >
                {stats.isAvailable ? (
                  <ToggleRight size={18} className="text-emerald-400" />
                ) : (
                  <ToggleLeft size={18} />
                )}
                {availToggling ? 'Updating…' : stats.isAvailable ? 'Available' : 'Unavailable'}
              </button>
            </motion.div>

            {/* ── Pending alert ── */}
            {pendingCount > 0 && (
              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: '#FFFBEB',
                  border: '1px solid rgba(245,158,11,0.25)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: '#FEF3C7' }}
                >
                  <Clock size={15} className="text-amber-600" />
                </div>
                <p className="text-sm flex-1" style={{ color: '#92400E' }}>
                  You have{' '}
                  <span className="font-semibold">{pendingCount} pending booking{pendingCount > 1 ? 's' : ''}</span>{' '}
                  waiting for your response.
                </p>
                <Link
                  to="/vendor/bookings"
                  className="flex items-center gap-1 text-xs font-semibold whitespace-nowrap"
                  style={{ color: '#D97706' }}
                >
                  Review now <ChevronRight size={13} />
                </Link>
              </motion.div>
            )}

            {/* ── Stat Cards ── */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                icon={CalendarCheck}
                iconBg="#FFF0EB"
                iconColor="#F06138"
                accent="#F06138"
                value={stats.totalBookings || 0}
                label="Total Bookings"
                trend="All time"
              />
              <StatCard
                icon={IndianRupee}
                iconBg="#F0FDF4"
                iconColor="#16A34A"
                accent="#16A34A"
                value={stats.totalEarnings || 0}
                valuePrefix="₹"
                label="Total Earnings"
                trend="Net payout"
                trendUp={stats.totalEarnings > 0 ? true : undefined}
              />
              <StatCard
                icon={Star}
                iconBg="#FFFBEB"
                iconColor="#D97706"
                accent="#D97706"
                value={parseFloat((stats.avgRating || 0).toFixed(1))}
                valueSuffix={stats.totalReviews > 0 ? '/ 5' : ''}
                label={`${stats.totalReviews || 0} Review${stats.totalReviews !== 1 ? 's' : ''}`}
              />
              <StatCard
                icon={TrendingUp}
                iconBg="#EEF2FF"
                iconColor="#4F46E5"
                accent="#4F46E5"
                value={monthlyEarnings.reduce((s, m) => s + (m.bookings || 0), 0)}
                label="Bookings (6 months)"
                trend="Last 6 mo"
              />
            </motion.div>

            {/* ── Main Grid ── */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Recent Bookings */}
              <div
                className="lg:col-span-2 bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}
              >
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: '1px solid #F3F4F6' }}
                >
                  <div>
                    <h2 className="text-sm font-semibold" style={{ color: '#101828' }}>Recent Bookings</h2>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Latest activity</p>
                  </div>
                  <Link
                    to="/vendor/bookings"
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: '#FFF0EB', color: '#F06138' }}
                  >
                    View all <ArrowUpRight size={12} />
                  </Link>
                </div>

                {recentBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: '#F9FAFB' }}
                    >
                      <CalendarCheck size={22} strokeWidth={1.5} style={{ color: '#D1D5DB' }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>No bookings yet</p>
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                      Bookings will appear here once customers book your services
                    </p>
                  </div>
                ) : (
                  <div className="px-5 overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <th className="py-3 pr-4 text-xs font-medium text-left" style={{ color: '#9CA3AF' }}>Customer</th>
                          <th className="py-3 pr-4 text-xs font-medium text-left" style={{ color: '#9CA3AF' }}>Event Date</th>
                          <th className="py-3 pr-4 text-xs font-medium text-left" style={{ color: '#9CA3AF' }}>Amount</th>
                          <th className="py-3 text-xs font-medium text-left" style={{ color: '#9CA3AF' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((b) => (
                          <BookingRow key={b._id} booking={b} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-4">

                {/* Earnings Chart */}
                <div
                  className="bg-white rounded-2xl p-5"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h2 className="text-sm font-semibold" style={{ color: '#101828' }}>Monthly Earnings</h2>
                      <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Last 6 months</p>
                    </div>
                    <Link
                      to="/vendor/earnings"
                      className="flex items-center gap-0.5 text-xs font-semibold"
                      style={{ color: '#F06138' }}
                    >
                      Details <ArrowUpRight size={11} />
                    </Link>
                  </div>
                  <EarningsChart data={monthlyEarnings} />
                </div>

                {/* Quick Actions */}
                <div
                  className="bg-white rounded-2xl p-5"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}
                >
                  <h2 className="text-sm font-semibold mb-3" style={{ color: '#101828' }}>Quick Actions</h2>
                  <div className="space-y-1.5">
                    {QUICK_ACTIONS.map((action) => {
                      const ActionIcon = action.icon
                      return (
                        <Link
                          key={action.to}
                          to={action.to}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group"
                          style={{ background: 'transparent' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: action.iconBg }}
                          >
                            <ActionIcon size={15} color={action.iconColor} strokeWidth={2} />
                          </div>
                          <span className="text-sm font-medium flex-1" style={{ color: '#364153' }}>
                            {action.label}
                          </span>
                          <ChevronRight size={14} style={{ color: '#D1D5DB' }} />
                        </Link>
                      )
                    })}
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Plan badge */}
            {stats.planType && stats.planType !== 'free' && (
              <motion.div variants={fadeInUp} className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                  style={{ background: '#FFF0EB', color: '#F06138' }}
                >
                  <Zap size={11} fill="#F06138" />
                  {stats.planType} Plan
                </span>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>Active</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </motion.div>
  )
}

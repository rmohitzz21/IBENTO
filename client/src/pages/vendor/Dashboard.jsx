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
  pending:   { label: 'Pending',   color: 'text-amber-600',  bg: 'bg-amber-50',  icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'text-blue-600',   bg: 'bg-blue-50',   icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-500',    bg: 'bg-red-50',    icon: XCircle },
  rejected:  { label: 'Rejected',  color: 'text-red-500',    bg: 'bg-red-50',    icon: XCircle },
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '—'
  return new Intl.NumberFormat('en-IN').format(Math.round(amount))
}

/* ─── Earnings mini bar chart ────────────────────────────── */
function EarningsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-28 text-sm text-[#9CA3AF]">
        No earnings data yet
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.earnings), 1)

  return (
    <div className="flex items-end gap-2 h-28 pt-4">
      {data.map((d, i) => {
        const heightPct = Math.max((d.earnings / max) * 100, 4)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#101828] text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              ₹{formatCurrency(d.earnings)}
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${heightPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.05 }}
              className="w-full rounded-t-sm"
              style={{ background: '#F06138', opacity: 0.7 + 0.3 * (i / data.length) }}
            />
            <span className="text-[9px] text-[#9CA3AF]">
              {MONTH_NAMES[(d._id.month - 1)]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Recent bookings row ────────────────────────────────── */
function BookingRow({ booking }) {
  const meta = STATUS_META[booking.status] || STATUS_META.pending
  const StatusIcon = meta.icon

  return (
    <tr className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAFA] transition-colors">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2.5">
          {booking.userId?.avatar ? (
            <img src={booking.userId.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#F06138] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {(booking.userId?.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#101828] truncate">{booking.userId?.name || '—'}</p>
            <p className="text-xs text-[#6A7282] truncate">{booking.serviceId?.title || '—'}</p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4 text-sm text-[#364153]">{formatDate(booking.eventDate)}</td>
      <td className="py-3 pr-4 text-sm font-medium text-[#101828]">₹{formatCurrency(booking.totalAmount)}</td>
      <td className="py-3">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
          <StatusIcon size={11} strokeWidth={2.5} />
          {meta.label}
        </span>
      </td>
    </tr>
  )
}

/* ─── Skeleton loader ────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="flex-1 p-8 space-y-6">
      <div className="h-8 bg-gray-100 rounded-lg w-64 animate-pulse" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-64 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}

/* ─── Pending approval screen ────────────────────────────── */
function PendingScreen({ onLogout }) {
  return (
    <div className="min-h-screen bg-[#FFFDFC] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: '#FEF9C3' }}
        >
          <Clock size={40} className="text-amber-500" />
        </motion.div>
        <h1 className="font-filson font-black text-[#101828] text-3xl mb-3">Application Under Review</h1>
        <p className="font-lato text-[#6A6A6A] text-sm leading-relaxed mb-2">
          Your vendor application has been submitted and is being reviewed by the iBento team.
        </p>
        <p className="font-lato text-[#6A6A6A] text-sm mb-8">
          We typically review applications within <span className="font-semibold text-[#101828]">2–3 business days</span>. You'll receive an email notification once approved.
        </p>
        <div className="p-4 rounded-xl mb-8 text-left" style={{ background: '#FFFEF5', border: '1px solid rgba(139,67,50,0.1)' }}>
          <p className="font-lato text-xs text-[#6A6A6A] font-semibold uppercase tracking-wide mb-2">What happens next?</p>
          {[
            'Our team reviews your business details',
            'You receive an approval email',
            'Your profile goes live on iBento',
            'Customers can start booking your services',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2 mt-2">
              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white mt-0.5" style={{ background: '#F06138' }}>
                {i + 1}
              </span>
              <p className="font-lato text-sm text-[#364153]">{step}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onLogout}
          className="font-lato text-sm text-[#6A6A6A] hover:text-[#F06138] transition-colors underline"
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
    <div className="min-h-screen bg-[#FFFDFC] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: '#FEE2E2' }}
        >
          <AlertCircle size={40} className="text-red-500" />
        </motion.div>
        <h1 className="font-filson font-black text-[#101828] text-3xl mb-3">Application Not Approved</h1>
        <p className="font-lato text-[#6A6A6A] text-sm leading-relaxed mb-8">
          Unfortunately your vendor application was not approved at this time. Please contact our support team for more information or to reapply.
        </p>
        <a
          href="mailto:support@ibento.in"
          className="inline-block px-6 py-3 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity mb-4"
          style={{ background: '#F06138', color: '#FDFAD6' }}
        >
          Contact Support
        </a>
        <br />
        <button
          onClick={onLogout}
          className="font-lato text-sm text-[#6A6A6A] hover:text-[#F06138] transition-colors underline"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────── */
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

  // Gate: show pending/rejected screen before rendering the full dashboard
  if (!isLoading && !isError) {
    if (vendor.status === 'pending') return <PendingScreen onLogout={handleLogout} />
    if (vendor.status === 'rejected' || vendor.status === 'suspended') return <RejectedScreen onLogout={handleLogout} />
  }

  const vendorName = vendor.businessName || user?.name || 'Vendor'
  const profileProgress = (() => {
    let score = 0
    if (vendor.businessName) score += 20
    if (vendor.description) score += 20
    if (vendor.portfolio?.length > 0) score += 20
    if (vendor.bankAccount?.accountNumber) score += 20
    if (vendor.gst || vendor.pan) score += 20
    return score
  })()

  const pendingCount = recentBookings.filter((b) => b.status === 'pending').length

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex min-h-screen bg-[#FFFDFC]"
    >
      {/* Sidebar */}
      <VendorSidebar profileProgress={profileProgress} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <DashboardSkeleton />
        ) : isError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-[#6A7282] mb-3">Failed to load dashboard data.</p>
              <button
                onClick={() => queryClient.invalidateQueries(['vendor-dashboard'])}
                className="text-sm text-orange font-medium hover:underline"
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
            className="p-6 lg:p-8 max-w-7xl space-y-6"
          >
            {/* ── Header ── */}
            <motion.div variants={fadeInUp} className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-[#101828] font-[Georgia]">
                  Good {getGreeting()}, {vendorName.split(' ')[0]} 👋
                </h1>
                <p className="text-sm text-[#6A7282] mt-0.5">
                  Here's what's happening with your business today.
                </p>
              </div>

              {/* Availability toggle */}
              <button
                onClick={() => !availToggling && availMutation.mutate(!stats.isAvailable)}
                disabled={availToggling}
                className={[
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                  stats.isAvailable
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-gray-50 border-gray-200 text-[#6A7282]',
                ].join(' ')}
              >
                {stats.isAvailable ? (
                  <ToggleRight size={18} className="text-emerald-500" />
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
                className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
              >
                <Clock size={16} className="text-amber-600 shrink-0" />
                <p className="text-sm text-amber-700">
                  You have <span className="font-semibold">{pendingCount} pending booking{pendingCount > 1 ? 's' : ''}</span> waiting for your response.
                </p>
                <Link to="/vendor/bookings" className="ml-auto text-xs font-semibold text-amber-700 hover:underline whitespace-nowrap">
                  View all →
                </Link>
              </motion.div>
            )}

            {/* ── Stat cards ── */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                icon={CalendarCheck}
                iconBg="#FFF0EB"
                iconColor="#F06138"
                value={stats.totalBookings || 0}
                label="Total Bookings"
                trend={stats.totalBookings > 0 ? 'All time' : ''}
              />
              <StatCard
                icon={IndianRupee}
                iconBg="#F0FDF4"
                iconColor="#16A34A"
                value={stats.totalEarnings || 0}
                valuePrefix="₹"
                label="Total Earnings"
                trend={stats.totalEarnings > 0 ? 'Net payout' : ''}
              />
              <StatCard
                icon={Star}
                iconBg="#FFFBEB"
                iconColor="#D97706"
                value={parseFloat((stats.avgRating || 0).toFixed(1))}
                valueSuffix={stats.totalReviews > 0 ? ` / 5` : ''}
                label={`${stats.totalReviews || 0} Review${stats.totalReviews !== 1 ? 's' : ''}`}
              />
              <StatCard
                icon={TrendingUp}
                iconBg="#EEF2FF"
                iconColor="#4F46E5"
                value={monthlyEarnings.reduce((s, m) => s + m.bookings, 0)}
                label="Bookings (6 months)"
                trend="Last 6 months"
              />
            </motion.div>

            {/* ── Bottom grid ── */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Recent bookings */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#F3F4F6] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
                  <h2 className="text-sm font-semibold text-[#101828]">Recent Bookings</h2>
                  <Link
                    to="/vendor/bookings"
                    className="flex items-center gap-1 text-xs font-medium text-orange hover:underline"
                  >
                    View all <ChevronRight size={13} />
                  </Link>
                </div>

                {recentBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CalendarCheck size={32} className="text-gray-300 mb-2" />
                    <p className="text-sm text-[#9CA3AF]">No bookings yet</p>
                    <p className="text-xs text-[#B0B8C4] mt-1">Bookings will appear here once customers book your services</p>
                  </div>
                ) : (
                  <div className="px-5 overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="border-b border-[#F3F4F6]">
                          <th className="py-3 pr-4 text-xs font-medium text-[#9CA3AF] text-left">Customer</th>
                          <th className="py-3 pr-4 text-xs font-medium text-[#9CA3AF] text-left">Event Date</th>
                          <th className="py-3 pr-4 text-xs font-medium text-[#9CA3AF] text-left">Amount</th>
                          <th className="py-3 text-xs font-medium text-[#9CA3AF] text-left">Status</th>
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

              {/* Right column */}
              <div className="flex flex-col gap-4">

                {/* Earnings chart */}
                <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-sm p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-semibold text-[#101828]">Monthly Earnings</h2>
                    <Link to="/vendor/earnings" className="text-xs text-orange hover:underline flex items-center gap-0.5">
                      Details <ArrowUpRight size={11} />
                    </Link>
                  </div>
                  <p className="text-xs text-[#9CA3AF] mb-3">Last 6 months</p>
                  <EarningsChart data={monthlyEarnings} />
                </div>

                {/* Quick actions */}
                <div className="bg-white rounded-2xl border border-[#F3F4F6] shadow-sm p-5">
                  <h2 className="text-sm font-semibold text-[#101828] mb-3">Quick Actions</h2>
                  <div className="space-y-2">
                    {[
                      { label: 'Manage Services', to: '/vendor/services', icon: '⚙️' },
                      { label: 'View Bookings', to: '/vendor/bookings', icon: '📅' },
                      { label: 'Check Messages', to: '/vendor/chat', icon: '💬' },
                      { label: 'Update Profile', to: '/vendor/profile', icon: '👤' },
                    ].map((action) => (
                      <Link
                        key={action.to}
                        to={action.to}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#FFF5F2] transition-colors group"
                      >
                        <span className="text-base">{action.icon}</span>
                        <span className="text-sm text-[#364153] group-hover:text-orange transition-colors font-medium">
                          {action.label}
                        </span>
                        <ChevronRight size={14} className="ml-auto text-[#C9CDD4] group-hover:text-orange transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>

            {/* ── Plan badge ── */}
            {stats.planType && stats.planType !== 'free' && (
              <motion.div variants={fadeInUp} className="flex items-center gap-2 text-xs text-[#6A7282]">
                <span className="px-2 py-0.5 rounded-full bg-[#FFF0EB] text-orange font-semibold uppercase tracking-wide">
                  {stats.planType} Plan
                </span>
                <span>Active</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </motion.div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Users, Store, CalendarCheck, IndianRupee,
  Clock, CheckCircle2, ArrowUpRight, TrendingUp,
  AlertCircle, ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminSidebar from '../../components/shared/AdminSidebar'
import api from '../../services/api'

const MOCK = {
  totalUsers: 1240,
  totalVendors: 87,
  totalBookings: 3410,
  totalRevenue: 2840000,
  pendingApprovals: 5,
  pendingWithdrawals: 3,
  recentBookings: [
    { _id: '1', bookingNumber: 'IBK-0001', userName: 'Arjun Mehta',  vendorName: 'Royal Caterers', status: 'confirmed', totalAmount: 45000, eventDate: '2025-06-15' },
    { _id: '2', bookingNumber: 'IBK-0002', userName: 'Priya Singh',  vendorName: 'DJ Beats',       status: 'pending',   totalAmount: 12000, eventDate: '2025-06-20' },
    { _id: '3', bookingNumber: 'IBK-0003', userName: 'Ravi Kumar',   vendorName: 'Click Studios',  status: 'cancelled', totalAmount: 30000, eventDate: '2025-06-22' },
    { _id: '4', bookingNumber: 'IBK-0004', userName: 'Neha Joshi',   vendorName: 'Bloom Decor',    status: 'completed', totalAmount: 18000, eventDate: '2025-06-10' },
  ],
  pendingVendors: [
    { _id: '1', businessName: 'Saffron Events', category: 'Catering',     city: 'Mumbai', createdAt: '2025-06-01' },
    { _id: '2', businessName: 'Pixel Frames',   category: 'Photography',  city: 'Delhi',  createdAt: '2025-06-02' },
    { _id: '3', businessName: 'Sound Waves',    category: 'DJ',           city: 'Pune',   createdAt: '2025-06-03' },
  ],
}

const STATUS = {
  pending:   { label: 'Pending',   bg: '#FFFBEB', color: '#92400E', dot: '#F59E0B' },
  confirmed: { label: 'Confirmed', bg: '#ECFDF5', color: '#065F46', dot: '#10B981' },
  completed: { label: 'Completed', bg: '#EFF6FF', color: '#1E40AF', dot: '#3B82F6' },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444' },
}

/* ─── Premium stat card for admin (uses dark theme accents) ── */
function AdminStatCard({ icon: Icon, label, value, sub, accent, to }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        borderTop: `3px solid ${accent}`,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: accent + '18', boxShadow: `0 4px 14px ${accent}22` }}
        >
          <Icon size={20} color={accent} strokeWidth={2} />
        </div>
        {to && (
          <Link
            to={to}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: '#9CA3AF' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = accent }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF' }}
          >
            <ArrowUpRight size={15} />
          </Link>
        )}
      </div>

      <div>
        <p
          className="text-[28px] font-bold tracking-tight leading-none"
          style={{ color: '#101828', fontFamily: '"DM Sans", sans-serif' }}
        >
          {value}
        </p>
        <p className="text-sm mt-1.5" style={{ color: '#6A7282' }}>{label}</p>
        {sub && (
          <p className="text-xs font-semibold mt-1.5 flex items-center gap-1" style={{ color: accent }}>
            <AlertCircle size={11} /> {sub}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard')
      return {
        ...data.stats,
        pendingApprovals: data.stats.pendingVendors,
        pendingVendors: (data.pendingVendorList || []).map((v) => ({
          _id: v._id,
          businessName: v.businessName,
          category: v.category?.name || v.category || '—',
          city: v.city || '—',
          createdAt: v.createdAt,
        })),
        recentBookings: (data.recentBookings || []).map((b) => ({
          _id: b._id,
          bookingNumber: b.bookingNumber,
          userName: b.userId?.name,
          vendorName: b.vendorId?.businessName,
          status: b.status,
          totalAmount: b.totalAmount,
          eventDate: b.eventDate,
        })),
      }
    },
  })

  const d = data || MOCK
  const pendingApprovals = d.pendingApprovals ?? 0
  const pendingWithdrawals = d.pendingWithdrawals ?? 0

  const statCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: (d.totalUsers ?? 0).toLocaleString('en-IN'),
      accent: '#6366F1',
      to: '/admin/users',
    },
    {
      icon: Store,
      label: 'Total Vendors',
      value: (d.totalVendors ?? 0).toLocaleString('en-IN'),
      accent: '#F06138',
      to: '/admin/vendors',
      sub: pendingApprovals > 0 ? `${pendingApprovals} pending approval` : null,
    },
    {
      icon: CalendarCheck,
      label: 'Total Bookings',
      value: (d.totalBookings ?? 0).toLocaleString('en-IN'),
      accent: '#10B981',
      to: '/admin/bookings',
    },
    {
      icon: IndianRupee,
      label: 'Total Revenue',
      value: d.totalRevenue ? `₹${(d.totalRevenue / 100000).toFixed(1)}L` : '₹0',
      accent: '#8B4332',
      sub: pendingWithdrawals > 0 ? `${pendingWithdrawals} withdrawal pending` : null,
    },
  ]

  const recentBookings = d.recentBookings || MOCK.recentBookings
  const pendingVendors = d.pendingVendors || MOCK.pendingVendors

  return (
    <div className="flex min-h-screen" style={{ background: '#F0EEE8' }}>
      <AdminSidebar pendingApprovals={pendingApprovals} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 space-y-6">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap"
            style={{
              background: 'linear-gradient(135deg, #1A1008 0%, #2D1B0E 60%, #3D2010 100%)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
            }}
          >
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'rgba(253,250,214,0.45)' }}>
                Admin Console
              </p>
              <h1
                className="font-filson font-black text-2xl"
                style={{ color: '#FDFAD6', letterSpacing: '-0.03em' }}
              >
                Platform Overview
              </h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(253,250,214,0.4)' }}>
                Real-time metrics and activity.
              </p>
            </div>

            {pendingApprovals > 0 && (
              <Link
                to="/admin/vendors"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0"
                style={{ background: 'rgba(240,97,56,0.2)', color: '#F06138', border: '1px solid rgba(240,97,56,0.25)' }}
              >
                <Clock size={15} />
                {pendingApprovals} Pending Approval{pendingApprovals > 1 ? 's' : ''}
                <ChevronRight size={14} />
              </Link>
            )}
          </motion.div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <AdminStatCard {...s} />
              </motion.div>
            ))}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Recent Bookings */}
            <div
              className="lg:col-span-2 bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}
            >
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid #F3F4F6' }}
              >
                <div>
                  <h2 className="text-sm font-semibold" style={{ color: '#101828' }}>Recent Bookings</h2>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Latest platform activity</p>
                </div>
                <Link
                  to="/admin/bookings"
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: '#F3F4F6', color: '#6B7280' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF0EB'; e.currentTarget.style.color = '#F06138' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#6B7280' }}
                >
                  View all <ArrowUpRight size={12} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[540px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F9FAFB', background: '#FAFAFA' }}>
                      <th className="text-left px-6 py-3 text-xs font-medium" style={{ color: '#9CA3AF' }}>Booking</th>
                      <th className="text-left px-6 py-3 text-xs font-medium" style={{ color: '#9CA3AF' }}>Customer</th>
                      <th className="text-left px-6 py-3 text-xs font-medium" style={{ color: '#9CA3AF' }}>Amount</th>
                      <th className="text-left px-6 py-3 text-xs font-medium" style={{ color: '#9CA3AF' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => {
                      const sc = STATUS[b.status] || STATUS.pending
                      return (
                        <tr
                          key={b._id}
                          style={{ borderBottom: '1px solid #F9FAFB' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td className="px-6 py-3.5">
                            <p className="font-semibold text-xs" style={{ color: '#101828' }}>{b.bookingNumber}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                              {new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </td>
                          <td className="px-6 py-3.5">
                            <p className="font-medium text-sm" style={{ color: '#101828' }}>{b.userName}</p>
                            <p className="text-xs" style={{ color: '#9CA3AF' }}>{b.vendorName}</p>
                          </td>
                          <td className="px-6 py-3.5 font-semibold text-sm" style={{ color: '#101828' }}>
                            ₹{b.totalAmount?.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                              style={{ background: sc.bg, color: sc.color }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
                              {sc.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Vendor Approvals */}
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid #F3F4F6' }}
              >
                <div>
                  <h2 className="text-sm font-semibold" style={{ color: '#101828' }}>Pending Approvals</h2>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Vendors awaiting review</p>
                </div>
                <Link
                  to="/admin/vendors"
                  className="text-xs font-semibold"
                  style={{ color: '#F06138' }}
                >
                  View all
                </Link>
              </div>

              <div>
                {pendingVendors.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <CheckCircle2 size={28} strokeWidth={1.5} className="mx-auto mb-2.5" style={{ color: '#10B981' }} />
                    <p className="text-sm font-medium" style={{ color: '#374151' }}>All vendors reviewed!</p>
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>No pending approvals</p>
                  </div>
                ) : (
                  pendingVendors.map((v) => (
                    <div
                      key={v._id}
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors cursor-pointer"
                      style={{ borderBottom: '1px solid #F9FAFB' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, #F06138, #8A4432)' }}
                      >
                        {v.businessName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: '#101828' }}>{v.businessName}</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>{v.category} · {v.city}</p>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: '#FFFBEB', color: '#92400E' }}
                      >
                        <Clock size={9} /> Pending
                      </span>
                    </div>
                  ))
                )}
              </div>

              {pendingVendors.length > 0 && (
                <div className="px-5 py-3" style={{ borderTop: '1px solid #F3F4F6' }}>
                  <Link
                    to="/admin/vendors"
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    style={{ background: '#FFF0EB', color: '#F06138' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FFE4D9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#FFF0EB'}
                  >
                    Review All Vendors <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

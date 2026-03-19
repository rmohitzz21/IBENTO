import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Users, Store, CalendarCheck, IndianRupee,
  TrendingUp, Clock, CheckCircle, XCircle,
  Star, ArrowUpRight,
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
    { _id: '1', bookingNumber: 'IBK-0001', userName: 'Arjun Mehta', vendorName: 'Royal Caterers', status: 'confirmed', totalAmount: 45000, eventDate: '2025-06-15' },
    { _id: '2', bookingNumber: 'IBK-0002', userName: 'Priya Singh', vendorName: 'DJ Beats', status: 'pending', totalAmount: 12000, eventDate: '2025-06-20' },
    { _id: '3', bookingNumber: 'IBK-0003', userName: 'Ravi Kumar', vendorName: 'Click Studios', status: 'cancelled', totalAmount: 30000, eventDate: '2025-06-22' },
    { _id: '4', bookingNumber: 'IBK-0004', userName: 'Neha Joshi', vendorName: 'Bloom Decor', status: 'completed', totalAmount: 18000, eventDate: '2025-06-10' },
  ],
  pendingVendors: [
    { _id: '1', businessName: 'Saffron Events', category: 'Catering', city: 'Mumbai', createdAt: '2025-06-01' },
    { _id: '2', businessName: 'Pixel Frames', category: 'Photography', city: 'Delhi', createdAt: '2025-06-02' },
    { _id: '3', businessName: 'Sound Waves', category: 'DJ', city: 'Pune', createdAt: '2025-06-03' },
  ],
}

const statusConfig = {
  pending:   { label: 'Pending',   bg: '#FEF9C3', color: '#854D0E' },
  confirmed: { label: 'Confirmed', bg: '#DCFCE7', color: '#166534' },
  completed: { label: 'Completed', bg: '#DBEAFE', color: '#1E40AF' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', color: '#991B1B' },
}

const StatCard = ({ icon: Icon, label, value, sub, color, to }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl p-5 bg-white border border-gray-100 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div className="rounded-xl p-2.5" style={{ background: color + '20' }}>
        <Icon size={22} style={{ color }} />
      </div>
      {to && (
        <Link to={to} className="text-[#6A6A6A] hover:text-[#F06138] transition-colors">
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
    <p className="mt-3 text-2xl font-bold font-filson" style={{ color: '#1A1A1A' }}>{value}</p>
    <p className="text-sm text-[#6A6A6A] font-lato mt-0.5">{label}</p>
    {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
  </motion.div>
)

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard')
      return {
        ...data.stats,
        // stats.pendingVendors is a count — surface it as pendingApprovals to avoid
        // conflict with the pendingVendors array used for the list below
        pendingApprovals: data.stats.pendingVendors,
        pendingVendors: (data.pendingVendorList || []).map(v => ({
          _id: v._id,
          businessName: v.businessName,
          category: v.category?.name || v.category || '—',
          city: v.city || '—',
          createdAt: v.createdAt,
        })),
        recentBookings: (data.recentBookings || []).map(b => ({
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

  const stats = [
    { icon: Users,         label: 'Total Users',    value: (d.totalUsers ?? 0).toLocaleString('en-IN'),    color: '#6366F1', to: '/admin/users' },
    { icon: Store,         label: 'Total Vendors',   value: (d.totalVendors ?? 0).toLocaleString('en-IN'),  color: '#F06138', to: '/admin/vendors', sub: pendingApprovals > 0 ? `${pendingApprovals} pending approval` : null },
    { icon: CalendarCheck, label: 'Total Bookings',  value: (d.totalBookings ?? 0).toLocaleString('en-IN'), color: '#10B981', to: '/admin/bookings' },
    { icon: IndianRupee,   label: 'Total Revenue',   value: d.totalRevenue ? `₹${(d.totalRevenue / 100000).toFixed(1)}L` : '₹0', color: '#8B4332', sub: pendingWithdrawals > 0 ? `${pendingWithdrawals} withdrawal pending` : null },
  ]

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFDFC' }}>
      <AdminSidebar pendingApprovals={pendingApprovals} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-filson text-3xl font-bold" style={{ color: '#1A1A1A' }}>Dashboard</h1>
            <p className="text-[#6A6A6A] text-sm mt-1 font-lato">Welcome back, Admin. Here's what's happening.</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {stats.map(s => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Bookings */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-filson font-semibold text-lg" style={{ color: '#1A1A1A' }}>Recent Bookings</h2>
                <Link to="/admin/bookings" className="text-sm font-medium text-[#F06138] hover:underline">View all</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-lato">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-6 py-3 text-[#6A6A6A] font-medium">Booking</th>
                      <th className="text-left px-6 py-3 text-[#6A6A6A] font-medium">Customer</th>
                      <th className="text-left px-6 py-3 text-[#6A6A6A] font-medium">Amount</th>
                      <th className="text-left px-6 py-3 text-[#6A6A6A] font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(d.recentBookings || MOCK.recentBookings).map((b) => {
                      const sc = statusConfig[b.status] || statusConfig.pending
                      return (
                        <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3.5">
                            <p className="font-medium text-[#1A1A1A]">{b.bookingNumber}</p>
                            <p className="text-xs text-[#6A6A6A]">{new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </td>
                          <td className="px-6 py-3.5">
                            <p className="text-[#1A1A1A]">{b.userName}</p>
                            <p className="text-xs text-[#6A6A6A]">{b.vendorName}</p>
                          </td>
                          <td className="px-6 py-3.5 font-medium text-[#1A1A1A]">₹{b.totalAmount?.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-3.5">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: sc.bg, color: sc.color }}>
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
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-filson font-semibold text-lg" style={{ color: '#1A1A1A' }}>Pending Approvals</h2>
                <Link to="/admin/vendors" className="text-sm font-medium text-[#F06138] hover:underline">View all</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {(d.pendingVendors || MOCK.pendingVendors).map((v) => (
                  <div key={v._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm"
                        style={{ background: '#F06138' }}>
                        {v.businessName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#1A1A1A] truncate">{v.businessName}</p>
                        <p className="text-xs text-[#6A6A6A]">{v.category} · {v.city}</p>
                      </div>
                      <Clock size={14} className="text-amber-400 shrink-0" />
                    </div>
                  </div>
                ))}
                {!(d.pendingVendors || MOCK.pendingVendors)?.length && (
                  <div className="px-6 py-8 text-center">
                    <CheckCircle className="mx-auto mb-2 text-green-400" size={32} />
                    <p className="text-sm text-[#6A6A6A]">All vendors reviewed!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

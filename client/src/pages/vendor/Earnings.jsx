import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { IndianRupee, TrendingUp, CalendarCheck, Clock } from 'lucide-react'
import VendorSidebar from '../../components/shared/VendorSidebar'
import { getVendorEarnings, getVendorBookings } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function VendorEarnings() {
  const { data: earningsData, isLoading } = useQuery({
    queryKey: ['vendor-earnings'],
    queryFn: getVendorEarnings,
  })

  const { data: bookingsData } = useQuery({
    queryKey: ['vendor-bookings-paid'],
    queryFn: () => getVendorBookings({ status: 'completed' }),
  })

  const ed = earningsData?.data || {}
  const totalEarnings = ed.totalEarnings || 0
  const thisMonth = ed.thisMonth || 0
  const pendingAmount = ed.pendingAmount || 0
  const breakdown = ed.breakdown || []

  const totalBookingsCount = breakdown.reduce((s, d) => s + d.count, 0)
  const avgPerBooking = Math.round(totalEarnings / Math.max(totalBookingsCount, 1))

  const monthlyData = [...breakdown].map((d) => ({
    month: MONTH_NAMES[d._id.month - 1],
    earnings: d.net,
  }))

  const max = Math.max(...monthlyData.map((d) => d.earnings), 1)

  const recentBookings = (bookingsData?.data?.bookings || []).slice(0, 6)

  const STATS = [
    { label: 'Total Earnings',   val: totalEarnings,  icon: TrendingUp,    color: '#016630', bg: '#DCFCE7' },
    { label: 'This Month',       val: thisMonth,       icon: IndianRupee,   color: '#193CB8', bg: '#DBEAFE' },
    { label: 'Pending Payout',   val: pendingAmount,   icon: Clock,         color: '#894B00', bg: '#FEF9C2' },
    { label: 'Avg per Booking',  val: avgPerBooking,   icon: CalendarCheck, color: '#F06138', bg: '#FFF3EF' },
  ]

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex min-h-screen bg-[#F8F8F4]">
      <VendorSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="font-filson font-black text-[#101828] text-2xl mb-8">Earnings</h1>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {STATS.map((s) => {
                const Icon = s.icon
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-white border border-black/5"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                      <Icon size={18} style={{ color: s.color }} />
                    </div>
                    <p className="font-lato text-xs text-[#6A6A6A] mb-0.5">{s.label}</p>
                    <p className="font-filson font-black text-[#101828] text-xl">
                      ₹{new Intl.NumberFormat('en-IN').format(s.val)}
                    </p>
                  </motion.div>
                )
              })}
            </div>

            {/* Bar chart */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 mb-6">
              <h2 className="font-lato font-bold text-[#101828] text-sm mb-6">Monthly Earnings (Last 6 Months)</h2>
              {monthlyData.length === 0 ? (
                <div className="flex items-center justify-center h-36 text-sm text-[#9CA3AF]">
                  No earnings data yet
                </div>
              ) : (
                <div className="flex items-end gap-3 h-36">
                  {monthlyData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#101828] text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        ₹{new Intl.NumberFormat('en-IN').format(d.earnings)}
                      </div>
                      <span className="font-lato text-[10px] text-[#6A6A6A]">
                        ₹{(d.earnings / 1000).toFixed(0)}k
                      </span>
                      <motion.div
                        className="w-full rounded-t-lg"
                        style={{ background: '#F06138', opacity: 0.85 }}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max((d.earnings / max) * 100, 4)}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.05 }}
                      />
                      <span className="font-lato text-xs text-[#6A6A6A]">{d.month}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent completed bookings */}
            <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-black/5">
                <h2 className="font-lato font-bold text-[#101828] text-sm">Recent Completed Bookings</h2>
              </div>
              {recentBookings.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-lato text-sm text-[#9CA3AF]">No completed bookings yet</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/5">
                      {['Customer', 'Service', 'Event Date', 'Amount'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left font-lato font-semibold text-xs text-[#6A6A6A] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b._id} className="border-b border-black/3 hover:bg-[#FFFEF5] transition-colors">
                        <td className="px-5 py-3.5 font-lato font-semibold text-sm text-[#101828]">{b.userId?.name || '—'}</td>
                        <td className="px-5 py-3.5 font-lato text-sm text-[#364153]">{b.serviceId?.title || '—'}</td>
                        <td className="px-5 py-3.5 font-lato text-sm text-[#6A6A6A]">
                          {b.eventDate ? new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-5 py-3.5 font-lato font-bold text-[#8B4332] text-sm">
                          ₹{new Intl.NumberFormat('en-IN').format(b.netVendorAmount || b.totalAmount || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </motion.div>
  )
}

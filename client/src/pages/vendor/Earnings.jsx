import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { IndianRupee, TrendingUp, CalendarCheck, Clock } from 'lucide-react'
import VendorSidebar from '../../components/shared/VendorSidebar'
import { getVendorEarnings } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'

const MOCK_EARNINGS = {
  totalEarnings: 182000,
  thisMonth: 45000,
  pending: 28000,
  monthlyData: [
    { month: 'Oct', earnings: 22000 },
    { month: 'Nov', earnings: 35000 },
    { month: 'Dec', earnings: 18000 },
    { month: 'Jan', earnings: 42000 },
    { month: 'Feb', earnings: 38000 },
    { month: 'Mar', earnings: 45000 },
  ],
  transactions: [
    { _id: 't1', customer: 'Priya Sharma',  service: 'Basic Wedding Package', amount: 15000, date: '2025-03-10', status: 'received' },
    { _id: 't2', customer: 'Rahul Mehta',   service: 'Engagement Shoot',      amount: 12000, date: '2025-03-05', status: 'received' },
    { _id: 't3', customer: 'Ananya Singh',  service: 'Premium Decoration',    amount: 18000, date: '2025-02-28', status: 'pending' },
    { _id: 't4', customer: 'Vikram Nair',   service: 'Birthday Package',      amount: 8000,  date: '2025-02-20', status: 'received' },
  ],
}

export default function VendorEarnings() {
  const { data } = useQuery({
    queryKey: ['vendor-earnings'],
    queryFn: getVendorEarnings,
  })
  const earnings = data?.data || MOCK_EARNINGS
  const max = Math.max(...(earnings.monthlyData || []).map((d) => d.earnings), 1)

  const STATS = [
    { label: 'Total Earnings', val: earnings.totalEarnings, icon: TrendingUp, color: '#016630', bg: '#DCFCE7' },
    { label: 'This Month',     val: earnings.thisMonth,     icon: IndianRupee, color: '#193CB8', bg: '#DBEAFE' },
    { label: 'Pending',        val: earnings.pending,       icon: Clock,       color: '#894B00', bg: '#FEF9C2' },
    { label: 'Avg per Booking',val: Math.round((earnings.totalEarnings || 0) / Math.max(earnings.transactions?.length || 1, 1)), icon: CalendarCheck, color: '#F06138', bg: '#FFF3EF' },
  ]

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex min-h-screen bg-[#F8F8F4]">
      <VendorSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="font-filson font-black text-[#101828] text-2xl mb-8">Earnings</h1>

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
          <div className="flex items-end gap-3 h-36">
            {(earnings.monthlyData || []).map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="font-lato text-[10px] text-[#6A6A6A]">
                  ₹{(d.earnings / 1000).toFixed(0)}k
                </span>
                <motion.div
                  className="w-full rounded-t-lg"
                  style={{ background: '#F06138', opacity: 0.85 }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.earnings / max) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                />
                <span className="font-lato text-xs text-[#6A6A6A]">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction list */}
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-black/5">
            <h2 className="font-lato font-bold text-[#101828] text-sm">Recent Transactions</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/5">
                {['Customer', 'Service', 'Date', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-lato font-semibold text-xs text-[#6A6A6A] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(earnings.transactions || []).map((t) => (
                <tr key={t._id} className="border-b border-black/3 hover:bg-[#FFFEF5] transition-colors">
                  <td className="px-5 py-3.5 font-lato font-semibold text-sm text-[#101828]">{t.customer}</td>
                  <td className="px-5 py-3.5 font-lato text-sm text-[#364153]">{t.service}</td>
                  <td className="px-5 py-3.5 font-lato text-sm text-[#6A6A6A]">
                    {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 font-lato font-bold text-[#8B4332] text-sm">
                    ₹{new Intl.NumberFormat('en-IN').format(t.amount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-xs font-lato font-semibold px-2.5 py-1 rounded-full capitalize"
                      style={t.status === 'received'
                        ? { background: '#DCFCE7', color: '#016630' }
                        : { background: '#FEF9C2', color: '#894B00' }
                      }
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </motion.div>
  )
}

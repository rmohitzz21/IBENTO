import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, ChevronRight, Search, IndianRupee } from 'lucide-react'
import VendorSidebar from '../../components/shared/VendorSidebar'
import { getVendorBookings } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'

const TABS = [
  { value: 'all',       label: 'All' },
  { value: 'pending',   label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_STYLE = {
  pending:   { bg: '#FEF9C2', color: '#894B00' },
  confirmed: { bg: '#DBEAFE', color: '#193CB8' },
  completed: { bg: '#DCFCE7', color: '#016630' },
  cancelled: { bg: '#FFE2E2', color: '#9F0712' },
  rejected:  { bg: '#FFE2E2', color: '#9F0712' },
}

const MOCK_BOOKINGS = [
  { _id: 'b1', status: 'pending',   eventDate: '2025-04-15', totalAmount: 45000, customer: { name: 'Priya Sharma',   phone: '9812345678' }, service: { name: 'Basic Wedding Package' }, guests: 150 },
  { _id: 'b2', status: 'confirmed', eventDate: '2025-05-20', totalAmount: 25000, customer: { name: 'Rahul Mehta',   phone: '9876543210' }, service: { name: 'Engagement Shoot' }, guests: 50 },
  { _id: 'b3', status: 'completed', eventDate: '2025-01-10', totalAmount: 32000, customer: { name: 'Ananya Singh',  phone: '9901234567' }, service: { name: 'Premium Decoration' }, guests: 200 },
  { _id: 'b4', status: 'cancelled', eventDate: '2024-12-05', totalAmount: 12000, customer: { name: 'Vikram Nair',   phone: '9765432109' }, service: { name: 'Birthday Package' }, guests: 30 },
]

export default function VendorBookings() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-bookings', activeTab],
    queryFn: () => getVendorBookings({ status: activeTab !== 'all' ? activeTab : undefined }),
  })

  const allBookings = data?.data?.bookings || MOCK_BOOKINGS
  const bookings = allBookings.filter((b) =>
    activeTab !== 'all' ? b.status === activeTab : true
  ).filter((b) =>
    search ? b.customer?.name?.toLowerCase().includes(search.toLowerCase()) || b.service?.name?.toLowerCase().includes(search.toLowerCase()) : true
  )

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex min-h-screen bg-[#F8F8F4]">
      <VendorSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-filson font-black text-[#101828] text-2xl">Bookings</h1>
          <span className="font-lato text-sm text-[#6A6A6A]">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or service…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[rgba(139,67,50,0.2)] bg-white text-sm text-[#101828] placeholder:text-[#6A6A6A] focus:outline-none focus:ring-2 focus:ring-[#F06138]/20"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className="px-4 py-2 rounded-lg font-lato font-medium text-sm transition-colors whitespace-nowrap"
              style={activeTab === tab.value
                ? { background: '#F06138', color: '#FDFAD6' }
                : { background: 'white', color: '#6A6A6A', border: '1px solid rgba(139,67,50,0.15)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-white border border-black/5">
            <CalendarDays size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="font-lato font-semibold text-[#101828] text-sm">No bookings found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/5">
                  {['Customer', 'Service', 'Event Date', 'Guests', 'Amount', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-lato font-semibold text-xs text-[#6A6A6A] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending
                  return (
                    <tr key={b._id} className="border-b border-black/3 hover:bg-[#FFFEF5] transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-lato font-semibold text-sm text-[#101828]">{b.customer?.name}</p>
                        <p className="font-lato text-xs text-[#6A6A6A]">{b.customer?.phone}</p>
                      </td>
                      <td className="px-4 py-3.5 font-lato text-sm text-[#364153]">{b.service?.name}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={13} className="text-[#6A6A6A]" />
                          <span className="font-lato text-sm text-[#364153]">
                            {new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-lato text-sm text-[#364153]">{b.guests}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-0.5 font-lato font-bold text-[#8B4332] text-sm">
                          <IndianRupee size={13} />
                          {new Intl.NumberFormat('en-IN').format(b.totalAmount)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-lato font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: st.bg, color: st.color }}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link to={`/vendor/bookings/${b._id}`} className="text-[#F06138] hover:text-[#8B4332] transition-colors">
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </motion.div>
  )
}

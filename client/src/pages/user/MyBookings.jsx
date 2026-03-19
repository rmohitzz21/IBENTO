import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, ChevronRight, Search } from 'lucide-react'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { getMyBookings } from '../../services/bookings'
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
  { _id: 'b1', status: 'confirmed', eventDate: '2025-04-15', totalAmount: 45000, vendor: { businessName: 'Royal Events & Décor', coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=100&q=80', category: 'Decoration' }, service: { name: 'Basic Wedding Package' } },
  { _id: 'b2', status: 'pending',   eventDate: '2025-05-20', totalAmount: 25000, vendor: { businessName: 'Lens & Light Studio',   coverImage: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=100&q=80', category: 'Photography' }, service: { name: 'Wedding Photography' } },
  { _id: 'b3', status: 'completed', eventDate: '2025-01-10', totalAmount: 8000,  vendor: { businessName: 'Rhythm & Beats',         coverImage: 'https://images.unsplash.com/photo-1501386761578-eaa54522def9?w=100&q=80', category: 'Entertainment' }, service: { name: 'DJ Night' } },
  { _id: 'b4', status: 'cancelled', eventDate: '2024-12-05', totalAmount: 12000, vendor: { businessName: 'Flavours of India',       coverImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=100&q=80', category: 'Catering' }, service: { name: 'Catering 50 Pax' } },
]

function BookingCard({ booking }) {
  const st = STATUS_STYLE[booking.status] || STATUS_STYLE.pending
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}>
      <Link
        to={`/bookings/${booking._id}`}
        className="flex items-center gap-4 p-4 rounded-2xl border border-black/5 hover:shadow-md transition-all"
        style={{ background: '#FFFEF5' }}
      >
        <img
          src={booking.vendor?.coverImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100&q=80'}
          alt=""
          className="w-16 h-16 rounded-xl object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-lato font-semibold text-[#101828] text-sm truncate">{booking.vendor?.businessName}</p>
          <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{booking.service?.name}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1">
              <CalendarDays size={12} className="text-[#6A6A6A]" />
              <span className="font-lato text-xs text-[#6A6A6A]">
                {new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right flex flex-col items-end gap-2">
          <span className="text-xs font-lato font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: st.bg, color: st.color }}>
            {booking.status}
          </span>
          <span className="font-filson font-bold text-[#8B4332] text-sm">
            ₹{new Intl.NumberFormat('en-IN').format(booking.totalAmount)}
          </span>
        </div>
        <ChevronRight size={16} className="text-[#6A6A6A] shrink-0" />
      </Link>
    </motion.div>
  )
}

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', activeTab],
    queryFn: () => getMyBookings({ status: activeTab !== 'all' ? activeTab : undefined }),
  })

  const allBookings = data?.data?.bookings || MOCK_BOOKINGS
  const bookings = allBookings.filter((b) =>
    search ? b.vendor?.businessName?.toLowerCase().includes(search.toLowerCase()) : true
  )

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-filson font-black text-[#101828] text-3xl">My Bookings</h1>
          <Link to="/explore" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
            + New Booking
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vendor name…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[rgba(139,67,50,0.2)] bg-[#FFFEED] text-sm text-[#101828] placeholder:text-[#6A6A6A] focus:outline-none focus:ring-2 focus:ring-[#F06138]/30"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className="px-4 py-2 rounded-lg font-lato font-medium text-sm whitespace-nowrap transition-colors"
              style={activeTab === tab.value ? { background: '#F06138', color: '#FDFAD6' } : { background: '#FFFEF5', color: '#6A6A6A', border: '1px solid rgba(139,67,50,0.15)' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center rounded-2xl" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
            <CalendarDays size={36} className="text-[#F06138] mx-auto mb-3" />
            <p className="font-lato font-semibold text-[#101828] text-sm mb-1">No bookings found</p>
            <p className="font-lato text-[#6A6A6A] text-xs mb-5">Browse vendors and book your next event!</p>
            <Link to="/explore" className="inline-block px-6 py-2.5 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
              Explore Vendors
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => <BookingCard key={b._id} booking={b} />)}
          </div>
        )}
      </div>

      <Footer />
    </motion.div>
  )
}

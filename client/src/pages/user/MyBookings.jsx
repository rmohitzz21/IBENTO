import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarDays, ChevronRight, Search, CalendarCheck2,
  Clock, CheckCircle2, XCircle, Plus, Layers,
} from 'lucide-react'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { getMyBookings } from '../../services/bookings'
import { pageVariants } from '../../animations/pageTransitions'

const TABS = [
  { value: 'all',       label: 'All',       icon: Layers },
  { value: 'pending',   label: 'Pending',   icon: Clock },
  { value: 'confirmed', label: 'Confirmed', icon: CalendarCheck2 },
  { value: 'completed', label: 'Completed', icon: CheckCircle2 },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle },
]

const STATUS_CONFIG = {
  pending:   { bg: '#FEF9C2', color: '#894B00', dot: '#F59E0B', label: 'Pending' },
  confirmed: { bg: '#DBEAFE', color: '#193CB8', dot: '#3B82F6', label: 'Confirmed' },
  completed: { bg: '#DCFCE7', color: '#016630', dot: '#22C55E', label: 'Completed' },
  cancelled: { bg: '#FFE2E2', color: '#9F0712', dot: '#EF4444', label: 'Cancelled' },
  rejected:  { bg: '#FFE2E2', color: '#9F0712', dot: '#EF4444', label: 'Rejected' },
}

const MOCK_BOOKINGS = [
  { _id: 'b1', status: 'confirmed', eventDate: '2025-04-15', eventType: 'Wedding', totalAmount: 45000, vendor: { businessName: 'Royal Events & Décor', coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=100&q=80', category: 'Decoration' }, service: { name: 'Basic Wedding Package' } },
  { _id: 'b2', status: 'pending',   eventDate: '2025-05-20', eventType: 'Engagement', totalAmount: 25000, vendor: { businessName: 'Lens & Light Studio',   coverImage: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=100&q=80', category: 'Photography' }, service: { name: 'Wedding Photography' } },
  { _id: 'b3', status: 'completed', eventDate: '2025-01-10', eventType: 'Birthday', totalAmount: 8000,  vendor: { businessName: 'Rhythm & Beats',         coverImage: 'https://images.unsplash.com/photo-1501386761578-eaa54522def9?w=100&q=80', category: 'Entertainment' }, service: { name: 'DJ Night' } },
  { _id: 'b4', status: 'cancelled', eventDate: '2024-12-05', eventType: 'Corporate', totalAmount: 12000, vendor: { businessName: 'Flavours of India',       coverImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=100&q=80', category: 'Catering' }, service: { name: 'Catering 50 Pax' } },
]

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-4 rounded-2xl"
      style={{ background: bg, border: `1px solid ${color}22` }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="font-filson font-black text-xl leading-none" style={{ color }}>{value}</p>
        <p className="font-lato text-xs mt-0.5" style={{ color: `${color}CC` }}>{label}</p>
      </div>
    </motion.div>
  )
}

function BookingCard({ booking, index }) {
  const st = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
  const eventDate = new Date(booking.eventDate)
  const isPast = eventDate < new Date()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      <Link
        to={`/bookings/${booking._id}`}
        className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:shadow-lg group"
        style={{ background: '#fff', border: '1px solid rgba(139,67,50,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <div className="relative shrink-0">
          <img
            src={booking.vendor?.coverImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100&q=80'}
            alt=""
            className="w-[72px] h-[72px] rounded-xl object-cover"
          />
          {/* Status dot */}
          <span
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
            style={{ background: st.dot }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-lato font-bold text-[#101828] text-sm truncate group-hover:text-[#F06138] transition-colors">
                {booking.vendor?.businessName}
              </p>
              <p className="font-lato text-[#6A6A6A] text-xs mt-0.5 truncate">{booking.service?.name}</p>
            </div>
            <span
              className="shrink-0 text-[11px] font-lato font-bold px-2.5 py-1 rounded-full capitalize whitespace-nowrap"
              style={{ background: st.bg, color: st.color }}
            >
              {st.label}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <CalendarDays size={11} className="text-[#6A6A6A]" />
              <span className="font-lato text-xs text-[#6A6A6A]">
                {eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            {booking.eventType && (
              <>
                <span className="text-[#6A6A6A] text-xs">·</span>
                <span className="font-lato text-xs text-[#6A6A6A]">{booking.eventType}</span>
              </>
            )}
            {isPast && booking.status !== 'cancelled' && (
              <>
                <span className="text-[#6A6A6A] text-xs">·</span>
                <span className="font-lato text-xs text-[#6A6A6A] italic">Past event</span>
              </>
            )}
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className="font-filson font-black text-[#8B4332] text-sm">
            ₹{new Intl.NumberFormat('en-IN').format(booking.totalAmount)}
          </span>
          <ChevronRight size={16} className="text-[#6A6A6A] group-hover:text-[#F06138] transition-colors" />
        </div>
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
    search ? b.vendor?.businessName?.toLowerCase().includes(search.toLowerCase()) || b.service?.name?.toLowerCase().includes(search.toLowerCase()) : true
  )

  // Stats
  const counts = {
    all: allBookings.length,
    pending: allBookings.filter(b => b.status === 'pending').length,
    confirmed: allBookings.filter(b => b.status === 'confirmed').length,
    completed: allBookings.filter(b => b.status === 'completed').length,
    cancelled: allBookings.filter(b => ['cancelled', 'rejected'].includes(b.status)).length,
  }

  const TAB_WITH_COUNTS = TABS.map(t => ({ ...t, count: counts[t.value] }))

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-filson font-black text-[#101828] text-3xl">My Bookings</h1>
            <p className="font-lato text-[#6A6A6A] text-sm mt-0.5">Track and manage all your event bookings</p>
          </div>
          <Link
            to="/explore"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ background: '#F06138', color: '#FDFAD6' }}
          >
            <Plus size={15} /> New Booking
          </Link>
        </div>

        {/* Stats cards */}
        {!isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard label="Total Bookings" value={counts.all} icon={Layers} color="#F06138" bg="#FFF3EF" />
            <StatCard label="Pending" value={counts.pending} icon={Clock} color="#894B00" bg="#FEF9C2" />
            <StatCard label="Confirmed" value={counts.confirmed} icon={CalendarCheck2} color="#193CB8" bg="#DBEAFE" />
            <StatCard label="Completed" value={counts.completed} icon={CheckCircle2} color="#016630" bg="#DCFCE7" />
          </div>
        )}

        {/* Search */}
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vendor or service name…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[rgba(139,67,50,0.2)] bg-white text-sm text-[#101828] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F06138]/20 transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6 scrollbar-none">
          {TAB_WITH_COUNTS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-lato font-semibold text-sm whitespace-nowrap transition-all"
                style={isActive
                  ? { background: '#F06138', color: '#FDFAD6', boxShadow: '0 2px 8px rgba(240,97,56,0.25)' }
                  : { background: '#fff', color: '#6A6A6A', border: '1px solid rgba(139,67,50,0.15)' }
                }
              >
                <Icon size={14} />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className="min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1"
                    style={isActive
                      ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                      : { background: 'rgba(139,67,50,0.1)', color: '#8B4332' }
                    }
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* List */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#F3F4F6' }} />
              ))}
            </motion.div>
          ) : bookings.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center rounded-2xl"
              style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}
            >
              <CalendarDays size={40} className="text-[#F06138]/40 mx-auto mb-4" />
              <p className="font-lato font-bold text-[#101828] text-base mb-1">No bookings found</p>
              <p className="font-lato text-[#6A6A6A] text-sm mb-6">
                {search ? 'Try a different search term' : activeTab !== 'all' ? `No ${activeTab} bookings yet` : 'Start booking vendors for your next event!'}
              </p>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ background: '#F06138', color: '#FDFAD6' }}
              >
                <Plus size={15} /> Explore Vendors
              </Link>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {bookings.map((b, i) => <BookingCard key={b._id} booking={b} index={i} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </motion.div>
  )
}

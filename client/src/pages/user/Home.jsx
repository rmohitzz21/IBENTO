import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarDays, Heart, Star, ArrowRight, Search,
  Camera, Utensils, Music, Flower2, Video, Car,
} from 'lucide-react'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { SkeletonCard } from '../../components/shared/Skeleton'
import { useAuthStore } from '../../stores/authStore'
import { getMyBookings } from '../../services/bookings'
import { getTrendingVendors } from '../../services/vendors'
import { pageVariants, fadeInUp, staggerContainer } from '../../animations/pageTransitions'

const CATEGORIES = [
  { icon: Flower2,  label: 'Weddings',       bg: '#FFF3EF', color: '#F06138' },
  { icon: Camera,   label: 'Photography',    bg: '#FFF9F8', color: '#8B4332' },
  { icon: Utensils, label: 'Catering',       bg: '#FDFAD6', color: '#894B00' },
  { icon: Music,    label: 'Entertainment',  bg: '#F0FDF4', color: '#016630' },
  { icon: Video,    label: 'Decoration',     bg: '#EFF6FF', color: '#193CB8' },
  { icon: Car,      label: 'Transportation', bg: '#F5F3FF', color: '#6B21A8' },
]

const MOCK_VENDORS = [
  { _id: '1', businessName: 'Royal Events & Décor', category: 'Decoration', city: 'Mumbai', rating: 4.9, totalReviews: 128, startingPrice: 45000, coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80' },
  { _id: '2', businessName: 'Lens & Light Studio',   category: 'Photography', city: 'Bangalore', rating: 4.8, totalReviews: 94,  startingPrice: 25000, coverImage: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80' },
  { _id: '3', businessName: 'Flavours of India',     category: 'Catering', city: 'Delhi', rating: 4.7, totalReviews: 213, startingPrice: 800,   coverImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80' },
  { _id: '4', businessName: 'Rhythm & Beats',        category: 'Entertainment', city: 'Hyderabad', rating: 4.9, totalReviews: 76,  startingPrice: 30000, coverImage: 'https://images.unsplash.com/photo-1501386761578-eaa54522def9?w=400&q=80' },
]

const STATUS_STYLE = {
  pending:   { bg: '#FEF9C2', color: '#894B00' },
  confirmed: { bg: '#DBEAFE', color: '#193CB8' },
  completed: { bg: '#DCFCE7', color: '#016630' },
  cancelled: { bg: '#FFE2E2', color: '#9F0712' },
}

export default function Home() {
  const { user } = useAuthStore()
  const firstName = user?.name?.split(' ')[0] || 'there'

  const { data: bookingsData, isLoading: loadingBookings } = useQuery({
    queryKey: ['my-bookings', { limit: 3 }],
    queryFn: () => getMyBookings({ limit: 3, status: 'upcoming' }),
  })

  const { data: trendingData, isLoading: loadingVendors } = useQuery({
    queryKey: ['trending-vendors'],
    queryFn: () => getTrendingVendors(),
  })

  const bookings = bookingsData?.data?.bookings || []
  const vendors = trendingData?.data?.vendors || MOCK_VENDORS

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-10">

        {/* ── Welcome header ──────────────────────────────────── */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="rounded-3xl overflow-hidden relative px-8 py-10"
          style={{ background: 'linear-gradient(135deg, #F06138 0%, #8B4332 100%)' }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <motion.p variants={fadeInUp} className="font-lato text-white/70 text-sm mb-1">Welcome back</motion.p>
              <motion.h1 variants={fadeInUp} className="font-filson font-black text-white" style={{ fontSize: 'clamp(22px,3vw,36px)' }}>
                Hey, {firstName}! 👋
              </motion.h1>
              <motion.p variants={fadeInUp} className="font-lato text-white/80 mt-1 text-sm">What are you planning today?</motion.p>
            </div>
            <motion.div variants={fadeInUp} className="w-full sm:w-80">
              <Link
                to="/explore"
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-lato text-sm text-[#6A6A6A] bg-white/90 hover:bg-white transition-colors"
              >
                <Search size={16} className="text-[#F06138] shrink-0" />
                <span>Search vendors, services…</span>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* ── Quick stats ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: CalendarDays, label: 'Upcoming Bookings', value: bookings.length || 0, color: '#F06138', bg: '#FFF3EF', link: '/bookings' },
            { icon: Heart,        label: 'Saved Vendors',     value: user?.wishlistCount || 0, color: '#8B4332', bg: '#FFF9F8', link: '/wishlist' },
            { icon: Star,         label: 'Reviews Given',     value: user?.reviewCount || 0,   color: '#194B00', bg: '#F0FDF4', link: '/bookings' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.label}
                to={stat.link}
                className="flex items-center gap-4 p-4 rounded-2xl border border-black/5 hover:shadow-md transition-all"
                style={{ background: stat.bg }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.color + '18' }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="font-filson font-black text-[#101828] text-xl">{stat.value}</p>
                  <p className="font-lato text-xs text-[#6A6A6A]">{stat.label}</p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* ── Categories ──────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-filson font-bold text-[#101828] text-xl">Browse by Category</h2>
            <Link to="/explore" className="font-lato text-sm text-[#F06138] font-semibold hover:underline flex items-center gap-1">
              All vendors <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon
              return (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                >
                  <Link
                    to={`/explore?category=${cat.label}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-black/5 hover:border-orange/30 transition-all"
                    style={{ background: cat.bg }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: cat.color + '18' }}>
                      <Icon size={20} style={{ color: cat.color }} />
                    </div>
                    <span className="font-lato text-xs font-medium text-[#101828] text-center">{cat.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ── Upcoming bookings ────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-filson font-bold text-[#101828] text-xl">Upcoming Bookings</h2>
            <Link to="/bookings" className="font-lato text-sm text-[#F06138] font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loadingBookings ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}
            >
              <CalendarDays size={32} className="text-[#F06138] mx-auto mb-3" />
              <p className="font-lato font-semibold text-[#101828] text-sm mb-1">No upcoming bookings</p>
              <p className="font-lato text-[#6A6A6A] text-xs mb-4">Browse vendors and book your first event!</p>
              <Link to="/explore" className="inline-block px-5 py-2 rounded-lg font-lato font-semibold text-sm" style={{ background: '#F06138', color: '#FDFAD6' }}>
                Explore Vendors
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending
                return (
                  <Link
                    key={b._id}
                    to={`/bookings/${b._id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-black/5 hover:shadow-md transition-all"
                    style={{ background: '#FFFEF5' }}
                  >
                    <img src={b.vendor?.coverImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100&q=80'} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-lato font-semibold text-[#101828] text-sm truncate">{b.vendor?.businessName}</p>
                      <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{b.service?.name}</p>
                      <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">
                        {new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-lato font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: st.bg, color: st.color }}>
                      {b.status}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Trending vendors ─────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-filson font-bold text-[#101828] text-xl">Trending Near You</h2>
            <Link to="/explore" className="font-lato text-sm text-[#F06138] font-semibold hover:underline flex items-center gap-1">
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loadingVendors
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : vendors.map((v, i) => (
                  <motion.div
                    key={v._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ y: -3 }}
                  >
                    <Link to={`/vendor/${v._id}`} className="block rounded-2xl overflow-hidden border border-black/5 hover:shadow-lg transition-all" style={{ background: '#FFFEF5' }}>
                      <div className="relative overflow-hidden h-44">
                        <img src={v.coverImage} alt={v.businessName} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                      </div>
                      <div className="p-3">
                        <p className="font-lato font-semibold text-[#101828] text-sm truncate">{v.businessName}</p>
                        <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{v.category} · {v.city}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-[#F06138] fill-[#F06138]" />
                            <span className="font-lato text-xs font-semibold text-[#101828]">{v.rating}</span>
                            <span className="font-lato text-xs text-[#6A6A6A]">({v.totalReviews})</span>
                          </div>
                          <span className="font-lato text-xs font-bold text-[#8B4332]">
                            from ₹{new Intl.NumberFormat('en-IN').format(v.startingPrice)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </div>
        </section>
      </div>

      <Footer />
    </motion.div>
  )
}

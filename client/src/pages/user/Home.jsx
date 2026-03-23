import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Star, ArrowRight, Search, Camera, Utensils, Music, Flower2,
  Video, Building2, Paintbrush2, ClipboardList, Headphones,
  Sparkles, MapPin, IndianRupee, CalendarDays, ChevronRight,
  CheckCircle, BadgePercent,
} from 'lucide-react'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { useAuthStore } from '../../stores/authStore'
import { useCityStore } from '../../stores/cityStore'
import { getMyBookings } from '../../services/bookings'
import { getTrendingVendors, getServices } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'

const CATEGORIES = [
  { icon: Flower2,       label: 'Decoration',      color: '#F06138', bg: '#FFF3EF' },
  { icon: Camera,        label: 'Photography',      color: '#193CB8', bg: '#EFF6FF' },
  { icon: Video,         label: 'Videography',      color: '#6B21A8', bg: '#F5F3FF' },
  { icon: Utensils,      label: 'Catering',         color: '#894B00', bg: '#FDFAD6' },
  { icon: Music,         label: 'Entertainment',    color: '#016630', bg: '#F0FDF4' },
  { icon: Building2,     label: 'Venue',            color: '#9A3412', bg: '#FFF9F0' },
  { icon: Paintbrush2,   label: 'Makeup & Beauty',  color: '#9D174D', bg: '#FDF2F8' },
  { icon: ClipboardList, label: 'Planning',         color: '#0F766E', bg: '#F0FDFA' },
  { icon: Headphones,    label: 'Music & DJ',       color: '#92400E', bg: '#FEF3C7' },
  { icon: Flower2,       label: 'Florist',          color: '#BE123C', bg: '#FFF1F2' },
]

const STATUS_STYLE = {
  pending:   { bg: '#FEF9C2', color: '#894B00' },
  confirmed: { bg: '#DBEAFE', color: '#193CB8' },
  completed: { bg: '#DCFCE7', color: '#016630' },
  cancelled: { bg: '#FFE2E2', color: '#9F0712' },
}

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(Math.round(n || 0))
}

export default function Home() {
  const { user } = useAuthStore()
  const { city } = useCityStore()
  const navigate = useNavigate()
  const firstName = user?.name?.split(' ')[0] || 'there'
  const [search, setSearch] = useState('')
  const scrollRef = useRef(null)

  const { data: bookingsData, isLoading: loadingBookings } = useQuery({
    queryKey: ['my-bookings', { limit: 3 }],
    queryFn: () => getMyBookings({ limit: 3 }),
  })

  const { data: trendingData, isLoading: loadingVendors } = useQuery({
    queryKey: ['trending-vendors', city],
    queryFn: () => getTrendingVendors(city),
  })

  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ['popular-services', city],
    queryFn: () => getServices({ city, limit: 6 }),
  })

  const bookings = bookingsData?.data?.bookings || []
  const vendors = trendingData?.data?.vendors || []
  const services = servicesData?.data?.services || []

  function handleSearch(e) {
    e.preventDefault()
    navigate(`/explore${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`)
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a00 0%, #3d1a0a 50%, #5a2010 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #F06138 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-8 pointer-events-none" style={{ background: 'radial-gradient(circle, #F06138 0%, transparent 70%)', transform: 'translate(-40%, 40%)' }} />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="font-lato text-[#F06138] text-sm font-semibold tracking-wider uppercase mb-3"
          >
            Hello, {firstName} 👋
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-filson font-black text-white leading-[1.08] mb-5"
            style={{ fontSize: 'clamp(32px, 6vw, 64px)' }}
          >
            Find the perfect<br />
            <span style={{ color: '#F06138' }}>vendors</span> for your<br />
            event
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="font-lato text-white/60 text-base mb-8 max-w-lg"
          >
            Discover top-rated photographers, decorators, caterers and more — all in {city}.
          </motion.p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="flex items-center gap-2 max-w-xl"
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.95)' }}>
              <Search size={17} className="text-[#F06138] shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search vendors in ${city}…`}
                className="flex-1 bg-transparent font-lato text-sm text-[#101828] placeholder:text-[#9CA3AF] outline-none"
              />
            </div>
            <button type="submit" className="px-5 py-3.5 rounded-2xl font-lato font-bold text-sm hover:opacity-90 transition-opacity shrink-0" style={{ background: '#F06138', color: '#FDFAD6' }}>
              Search
            </button>
          </motion.form>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center flex-wrap gap-x-6 gap-y-2 mt-8"
          >
            {['500+ verified vendors', 'Instant booking', '4.8★ avg. rating'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-[#F06138]" />
                <span className="font-lato text-white/60 text-xs">{t}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-14">

        {/* ── CATEGORIES ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-filson font-bold text-[#101828] text-xl">What are you looking for?</h2>
            <Link to="/explore" className="font-lato text-sm text-[#F06138] font-semibold hover:underline flex items-center gap-1">
              All <ArrowRight size={13} />
            </Link>
          </div>

          {/* Horizontally scrollable on mobile, grid on desktop */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide lg:grid lg:grid-cols-10"
          >
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon
              return (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.035 }}
                  className="shrink-0 lg:shrink"
                >
                  <Link
                    to={`/explore?category=${encodeURIComponent(cat.label)}`}
                    className="flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border border-transparent hover:border-[rgba(240,97,56,0.2)] hover:shadow-md transition-all group w-[84px] lg:w-auto"
                    style={{ background: cat.bg }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ background: cat.color + '18' }}
                    >
                      <Icon size={19} style={{ color: cat.color }} />
                    </div>
                    <span className="font-lato text-[11px] font-semibold text-[#101828] text-center leading-tight">{cat.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ── OFFERS TEASER ────────────────────────────────────── */}
        <Link to="/offers">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="relative overflow-hidden rounded-2xl px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #F06138 0%, #8B4332 100%)' }}
          >
            <div className="absolute right-0 top-0 w-48 h-48 rounded-full pointer-events-none opacity-10" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <BadgePercent size={22} className="text-white" />
              </div>
              <div>
                <p className="font-filson font-black text-white text-base leading-snug">Exclusive packages & deals</p>
                <p className="font-lato text-white/70 text-xs mt-0.5">Handpicked service bundles from top vendors — curated for every occasion</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-lato font-bold text-sm shrink-0" style={{ background: 'rgba(255,255,255,0.18)', color: 'white' }}>
              Browse <ChevronRight size={14} />
            </div>
          </motion.div>
        </Link>

        {/* ── TOP VENDORS ──────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-filson font-bold text-[#101828] text-xl">Top vendors in {city}</h2>
              <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">Highest-rated, taking bookings now</p>
            </div>
            <Link to={`/explore?city=${encodeURIComponent(city)}`} className="font-lato text-sm text-[#F06138] font-semibold hover:underline flex items-center gap-1">
              See all <ArrowRight size={13} />
            </Link>
          </div>

          {loadingVendors ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="h-44 bg-gray-100 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="py-12 text-center rounded-2xl" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
              <MapPin size={28} className="text-[#F06138] mx-auto mb-3 opacity-50" />
              <p className="font-lato font-semibold text-[#101828] text-sm mb-1">No vendors in {city} yet</p>
              <p className="font-lato text-[#6A6A6A] text-xs mb-4">Try a different city or explore all vendors</p>
              <Link to="/explore" className="inline-block px-5 py-2 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
                Browse All Cities
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {vendors.slice(0, 8).map((v, i) => (
                <motion.div
                  key={v._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/vendor/${v._id}`} className="block rounded-2xl overflow-hidden border border-black/5 hover:shadow-xl transition-all duration-300 bg-white group">
                    {/* Image */}
                    <div className="relative overflow-hidden h-44">
                      <img
                        src={v.portfolio?.[0]?.url || v.coverImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80'}
                        alt={v.businessName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Rating pill on image */}
                      {v.rating > 0 && (
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-lato font-bold" style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          {v.rating?.toFixed(1)}
                        </div>
                      )}
                    </div>

                    <div className="p-3.5">
                      <p className="font-lato font-bold text-[#101828] text-sm truncate">{v.businessName}</p>
                      <div className="flex items-center gap-1 mt-0.5 mb-2.5">
                        <MapPin size={10} className="text-[#6A6A6A] shrink-0" />
                        <p className="font-lato text-[#6A6A6A] text-[11px] truncate">{v.category?.name || v.category} · {v.city}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-lato text-[11px] text-[#6A6A6A]">{v.totalReviews || 0} reviews</span>
                        {v.startingPrice ? (
                          <span className="font-filson font-black text-[#8B4332] text-sm">
                            ₹{fmt(v.startingPrice)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── POPULAR SERVICES ─────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-filson font-bold text-[#101828] text-xl">Popular services near you</h2>
              <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">Handpicked packages from top vendors in {city}</p>
            </div>
            <Link to="/explore" className="font-lato text-sm text-[#F06138] font-semibold hover:underline flex items-center gap-1">
              See all <ArrowRight size={13} />
            </Link>
          </div>

          {loadingServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
              <Sparkles size={28} className="text-[#F06138] mx-auto mb-3 opacity-50" />
              <p className="font-lato font-semibold text-[#101828] text-sm mb-1">No services listed yet in {city}</p>
              <p className="font-lato text-[#6A6A6A] text-xs">Vendors are joining — check back soon or explore all cities</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc, i) => (
                <motion.div
                  key={svc._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={`/vendor/${svc.vendorId?._id}`}
                    className="block bg-white rounded-2xl border border-black/5 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden h-40">
                      {svc.images?.length > 0 ? (
                        <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: '#FFF3EF' }}>
                          <Sparkles size={28} className="text-[#F06138] opacity-30" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="font-lato font-bold text-sm text-[#101828] truncate mb-0.5">{svc.title}</p>
                      <p className="font-lato text-xs text-[#6A6A6A] truncate mb-3">by {svc.vendorId?.businessName}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="font-lato text-xs font-semibold text-[#101828]">{svc.vendorId?.rating?.toFixed(1) || '—'}</span>
                          <span className="font-lato text-[11px] text-[#6A6A6A]">· {svc.vendorId?.city}</span>
                        </div>
                        <div className="flex items-center gap-0.5 font-filson font-black text-[#8B4332] text-base">
                          <IndianRupee size={13} />
                          {fmt(svc.price)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── UPCOMING BOOKINGS (personalised strip) ───────────── */}
        {(loadingBookings || bookings.length > 0) && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-filson font-bold text-[#101828] text-xl">Your upcoming bookings</h2>
              <Link to="/bookings" className="font-lato text-sm text-[#F06138] font-semibold hover:underline flex items-center gap-1">
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {loadingBookings ? (
              <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />)}</div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => {
                  const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending
                  return (
                    <Link
                      key={b._id}
                      to={`/bookings/${b._id}`}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-black/5 hover:shadow-md transition-all group"
                      style={{ background: '#FFFEF5' }}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={b.vendorId?.portfolio?.[0]?.url || b.vendor?.coverImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100&q=80'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-lato font-semibold text-[#101828] text-sm truncate">{b.vendorId?.businessName || b.vendor?.businessName}</p>
                        <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{b.serviceId?.title || b.service?.title}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="font-lato text-xs text-[#6A6A6A]">
                            <CalendarDays size={10} className="inline mr-1" />
                            {new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <span className="text-[11px] font-lato font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: st.bg, color: st.color }}>
                          {b.status}
                        </span>
                        <ChevronRight size={15} className="text-[#9CA3AF] group-hover:text-[#F06138] transition-colors" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* ── AI PLANNER BANNER ────────────────────────────────── */}
        <section>
          <div
            className="relative overflow-hidden rounded-3xl px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{ background: 'linear-gradient(135deg, #101828 0%, #1a2d40 100%)' }}
          >
            {/* Glow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle, #F06138 0%, transparent 70%)', transform: 'translate(30%, -50%)' }} />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 text-[11px] font-semibold font-lato" style={{ background: 'rgba(240,97,56,0.2)', color: '#F06138', border: '1px solid rgba(240,97,56,0.3)' }}>
                <Sparkles size={11} /> AI Event Planner
              </div>
              <h3 className="font-filson font-black text-white text-xl sm:text-2xl leading-snug mb-2">
                Plan your perfect event<br />
                <span style={{ color: '#F06138' }}>with AI assistance</span>
              </h3>
              <p className="font-lato text-white/55 text-sm max-w-sm">
                Tell us your event type, guest count and budget — we'll curate the ideal vendor list instantly.
              </p>
            </div>

            <Link
              to="/explore"
              className="relative z-10 shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-2xl font-lato font-bold text-sm hover:opacity-90 transition-opacity"
              style={{ background: '#F06138', color: '#FDFAD6' }}
            >
              <Sparkles size={15} /> Start Planning
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </motion.div>
  )
}

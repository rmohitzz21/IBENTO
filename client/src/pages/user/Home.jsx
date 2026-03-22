import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarDays, Heart, Star, ArrowRight, Search,
  Camera, Utensils, Music, Flower2, Video, Building2,
  Sparkles, Send, MapPin, Bell, ChevronRight, Paintbrush2,
  ClipboardList, Headphones, IndianRupee,
} from 'lucide-react'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { SkeletonCard } from '../../components/shared/Skeleton'
import { useAuthStore } from '../../stores/authStore'
import { useCityStore } from '../../stores/cityStore'
import { getMyBookings } from '../../services/bookings'
import { getTrendingVendors, getServices } from '../../services/vendors'
import { pageVariants, fadeInUp, staggerContainer } from '../../animations/pageTransitions'

const CATEGORIES = [
  { icon: Flower2,       label: 'Decoration',             bg: '#FFF3EF', color: '#F06138' },
  { icon: Camera,        label: 'Photography',            bg: '#EFF6FF', color: '#193CB8' },
  { icon: Video,         label: 'Videography',            bg: '#F5F3FF', color: '#6B21A8' },
  { icon: Utensils,      label: 'Catering',               bg: '#FDFAD6', color: '#894B00' },
  { icon: Music,         label: 'Entertainment',          bg: '#F0FDF4', color: '#016630' },
  { icon: Building2,     label: 'Venue',                  bg: '#FFF9F0', color: '#9A3412' },
  { icon: Paintbrush2,   label: 'Makeup & Beauty',        bg: '#FDF2F8', color: '#9D174D' },
  { icon: ClipboardList, label: 'Planning & Coordination', bg: '#F0FDFA', color: '#0F766E' },
  { icon: Headphones,    label: 'Music & DJ',             bg: '#FEF3C7', color: '#92400E' },
  { icon: Flower2,       label: 'Florist',                bg: '#FFF1F2', color: '#BE123C' },
]

const STATUS_STYLE = {
  pending:   { bg: '#FEF9C2', color: '#894B00' },
  confirmed: { bg: '#DBEAFE', color: '#193CB8' },
  completed: { bg: '#DCFCE7', color: '#016630' },
  cancelled: { bg: '#FFE2E2', color: '#9F0712' },
}

const AI_SUGGESTIONS = [
  'Plan a wedding for 200 guests in Mumbai under ₹5 lakhs',
  'Birthday party for 50 guests, fun theme, Delhi',
  'Corporate event for 100 people in Bangalore',
]

export default function Home() {
  const { user } = useAuthStore()
  const { city } = useCityStore()
  const navigate = useNavigate()
  const firstName = user?.name?.split(' ')[0] || 'there'

  const [aiQuery, setAiQuery] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessages, setAiMessages] = useState([
    { role: 'ai', text: `Hi ${firstName}! Tell me about the event you're planning — type, budget, guest count, and city — and I'll curate the perfect vendor list for you. 🎉` },
  ])

  const { data: bookingsData, isLoading: loadingBookings } = useQuery({
    queryKey: ['my-bookings', { limit: 3 }],
    queryFn: () => getMyBookings({ limit: 3, status: 'upcoming' }),
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

  function handleAiSubmit(e) {
    e.preventDefault()
    const q = aiQuery.trim()
    if (!q) return
    setAiMessages((prev) => [...prev, { role: 'user', text: q }])
    setAiQuery('')
    setAiLoading(true)
    setTimeout(() => {
      setAiMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `Great! Based on "${q}", I've found vendors that match your needs. Head to Explore to see curated results, or I can help you refine further. What's your budget range?`,
        },
      ])
      setAiLoading(false)
    }, 1200)
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-10">

        {/* ── Welcome hero ── */}
        <motion.section
          variants={staggerContainer} initial="initial" animate="animate"
          className="rounded-3xl overflow-hidden relative px-8 py-10"
          style={{ background: 'linear-gradient(135deg, #F06138 0%, #8B4332 100%)' }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <motion.p variants={fadeInUp} className="font-lato text-white/70 text-sm mb-1">Welcome back</motion.p>
              <motion.h1 variants={fadeInUp} className="font-filson font-black text-white" style={{ fontSize: 'clamp(22px, 3vw, 36px)' }}>
                Hey, {firstName}! 👋
              </motion.h1>
              <motion.p variants={fadeInUp} className="font-lato text-white/75 mt-1 text-sm">
                Finding the best vendors in <span className="font-bold text-white">{city}</span>
              </motion.p>
            </div>
            <motion.div variants={fadeInUp} className="w-full sm:w-80">
              <Link
                to="/explore"
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-lato text-sm text-[#6A6A6A] bg-white/90 hover:bg-white transition-colors"
              >
                <Search size={16} className="text-[#F06138] shrink-0" />
                <span>Search vendors, services in {city}…</span>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* ── Quick stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: CalendarDays, label: 'Upcoming Bookings', value: bookings.length || 0, color: '#F06138', bg: '#FFF3EF', link: '/bookings' },
            { icon: Heart,        label: 'Saved Vendors',     value: user?.wishlistCount || 0, color: '#8B4332', bg: '#FFF9F8', link: '/wishlist' },
            { icon: Star,         label: 'Reviews Given',     value: user?.reviewCount || 0,   color: '#016630', bg: '#F0FDF4', link: '/bookings' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.label}
                to={stat.link}
                className="flex items-center gap-4 p-4 rounded-2xl border border-black/5 hover:shadow-md transition-all group"
                style={{ background: stat.bg }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ background: stat.color + '18' }}>
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

        {/* ── Categories ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-filson font-bold text-[#101828] text-xl">Browse by Category</h2>
            <Link to="/explore" className="font-lato text-sm text-[#F06138] font-semibold hover:underline flex items-center gap-1">
              All vendors <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon
              return (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -3 }}
                >
                  <Link
                    to={`/explore?category=${encodeURIComponent(cat.label)}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-black/5 hover:border-orange/30 hover:shadow-md transition-all text-center"
                    style={{ background: cat.bg }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: cat.color + '18' }}>
                      <Icon size={18} style={{ color: cat.color }} />
                    </div>
                    <span className="font-lato text-[10px] font-medium text-[#101828] leading-tight">{cat.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ── Popular Services near you ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-filson font-bold text-[#101828] text-xl">Popular Services in {city}</h2>
              <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">Services added by top vendors in your city</p>
            </div>
            <Link to={`/explore`} className="font-lato text-sm text-[#F06138] font-semibold hover:underline flex items-center gap-1">
              See all <ArrowRight size={14} />
            </Link>
          </div>

          {loadingServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
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
                  whileHover={{ y: -3 }}
                >
                  <Link
                    to={`/vendor/${svc.vendorId?._id}`}
                    className="block bg-white rounded-2xl border border-black/5 hover:shadow-lg transition-all overflow-hidden group"
                  >
                    {svc.images?.length > 0 ? (
                      <div className="h-36 overflow-hidden">
                        <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="h-36 flex items-center justify-center" style={{ background: '#FFF3EF' }}>
                        <Sparkles size={28} className="text-[#F06138] opacity-30" />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="font-lato font-bold text-sm text-[#101828] truncate">{svc.title}</p>
                      <p className="font-lato text-xs text-[#6A6A6A] mt-0.5 truncate">by {svc.vendorId?.businessName}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                          <span className="font-lato text-xs font-semibold text-[#101828]">{svc.vendorId?.rating?.toFixed(1) || '—'}</span>
                          <span className="font-lato text-xs text-[#6A6A6A]">· {svc.vendorId?.city}</span>
                        </div>
                        <div className="flex items-center gap-0.5 font-filson font-black text-[#8B4332] text-sm">
                          <IndianRupee size={12} />
                          {new Intl.NumberFormat('en-IN').format(svc.price)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── Upcoming bookings ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-filson font-bold text-[#101828] text-xl">Upcoming Bookings</h2>
            <Link to="/bookings" className="font-lato text-sm text-[#F06138] font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loadingBookings ? (
            <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}</div>
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
              <CalendarDays size={32} className="text-[#F06138] mx-auto mb-3" />
              <p className="font-lato font-semibold text-[#101828] text-sm mb-1">No upcoming bookings</p>
              <p className="font-lato text-[#6A6A6A] text-xs mb-4">Browse vendors and book your first event!</p>
              <Link to="/explore" className="inline-block px-5 py-2.5 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
                Explore Vendors
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending
                return (
                  <Link key={b._id} to={`/bookings/${b._id}`} className="flex items-center gap-4 p-4 rounded-2xl border border-black/5 hover:shadow-md transition-all" style={{ background: '#FFFEF5' }}>
                    <img src={b.vendor?.coverImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100&q=80'} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-lato font-semibold text-[#101828] text-sm truncate">{b.vendor?.businessName || b.vendorId?.businessName}</p>
                      <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{b.service?.name || b.serviceId?.title}</p>
                      <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">
                        {new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-lato font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: st.bg, color: st.color }}>
                        {b.status}
                      </span>
                      <ChevronRight size={16} className="text-[#6A6A6A]" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Trending vendors ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-filson font-bold text-[#101828] text-xl">Top Vendors in {city}</h2>
              <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">Highest-rated vendors taking bookings now</p>
            </div>
            <Link to={`/explore?city=${encodeURIComponent(city)}`} className="font-lato text-sm text-[#F06138] font-semibold hover:underline flex items-center gap-1">
              See all <ArrowRight size={14} />
            </Link>
          </div>
          {loadingVendors ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : vendors.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
              <MapPin size={28} className="text-[#F06138] mx-auto mb-3 opacity-50" />
              <p className="font-lato font-semibold text-[#101828] text-sm mb-1">No vendors in {city} yet</p>
              <p className="font-lato text-[#6A6A6A] text-xs">Try a different city or explore all vendors</p>
              <Link to="/explore" className="inline-block mt-4 px-5 py-2 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
                Browse All Cities
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {vendors.slice(0, 8).map((v, i) => (
                <motion.div
                  key={v._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/vendor/${v._id}`} className="block rounded-2xl overflow-hidden border border-black/5 hover:shadow-xl transition-all bg-white">
                    <div className="relative overflow-hidden h-44">
                      <img
                        src={v.portfolio?.[0]?.url || v.coverImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80'}
                        alt={v.businessName}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-lato font-semibold text-[#101828] text-sm truncate">{v.businessName}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-[#6A6A6A] shrink-0" />
                        <p className="font-lato text-[#6A6A6A] text-xs">{v.category?.name || v.category} · {v.city}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-[#F06138] fill-[#F06138]" />
                          <span className="font-lato text-xs font-semibold text-[#101828]">{v.rating?.toFixed(1) || '0.0'}</span>
                          <span className="font-lato text-xs text-[#6A6A6A]">({v.totalReviews || 0})</span>
                        </div>
                        {v.startingPrice ? (
                          <span className="font-lato text-xs font-bold text-[#8B4332]">
                            from ₹{new Intl.NumberFormat('en-IN').format(v.startingPrice)}
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

        {/* ── AI Event Planner ── */}
        <section>
          <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #101828 0%, #1a2d40 100%)' }}>
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold font-lato w-fit" style={{ background: 'rgba(240,97,56,0.2)', color: '#F06138', border: '1px solid rgba(240,97,56,0.4)' }}>
                  <Sparkles size={12} /> AI Event Planner
                </div>
                <h2 className="font-filson font-black text-white mb-3 leading-[1.1]" style={{ fontSize: 'clamp(22px, 3vw, 34px)' }}>
                  Plan your event<br />
                  <span style={{ color: '#F06138' }}>with AI assistance</span>
                </h2>
                <p className="font-lato text-white/65 text-sm leading-relaxed mb-6">
                  Tell us your event type, budget, and guest count. Our AI instantly curates the best vendors and builds a complete event plan.
                </p>
                <div className="flex flex-col gap-2">
                  {AI_SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => setAiQuery(s)} className="text-left px-4 py-2.5 rounded-xl text-xs font-lato text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10 hover:border-white/25">
                      <Sparkles size={11} className="inline mr-2 text-[#F06138]" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-[400px] shrink-0 flex flex-col" style={{ background: 'rgba(255,255,255,0.04)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F06138' }}>
                    <Sparkles size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="font-lato font-semibold text-white text-sm">iBento AI</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <p className="font-lato text-white/50 text-xs">Online</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 260 }}>
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={msg.role === 'ai' ? { background: '#F06138', color: 'white' } : { background: '#2d3748', color: 'white' }}>
                        {msg.role === 'ai' ? '✦' : firstName[0]}
                      </div>
                      <div className="max-w-[80%] rounded-2xl px-3 py-2 text-xs font-lato leading-relaxed" style={msg.role === 'ai' ? { background: 'rgba(240,97,56,0.15)', color: '#ffd4c8' } : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs" style={{ background: '#F06138', color: 'white' }}>✦</div>
                      <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(240,97,56,0.15)' }}>
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} className="w-1.5 h-1.5 rounded-full bg-[#F06138]" />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleAiSubmit} className="p-4 flex gap-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <input
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Describe your event…"
                    className="flex-1 rounded-xl px-3 py-2.5 text-xs font-lato text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#F06138]/50 border border-white/10"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  />
                  <button type="submit" disabled={!aiQuery.trim() || aiLoading} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40" style={{ background: '#F06138' }}>
                    <Send size={14} className="text-white" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ── Notifications prompt ── */}
        <section>
          <div className="rounded-2xl p-5 flex items-center justify-between gap-4" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF3EF' }}>
                <Bell size={20} className="text-[#F06138]" />
              </div>
              <div>
                <p className="font-lato font-semibold text-[#101828] text-sm">Stay updated</p>
                <p className="font-lato text-[#6A6A6A] text-xs">Get real-time alerts for booking confirmations and vendor replies.</p>
              </div>
            </div>
            <Link to="/notifications" className="shrink-0 px-4 py-2 rounded-lg font-lato font-semibold text-xs hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
              View All
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </motion.div>
  )
}

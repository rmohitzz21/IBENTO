import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Star, Search, MapPin, Clock, IndianRupee, Flame, Zap, Award,
  Sparkles, Tag, Filter, ChevronRight, Camera, Utensils, Music,
  Flower2, Video, Building2, Paintbrush2, ClipboardList, SlidersHorizontal,
  CheckCircle, BadgePercent, TrendingUp, Heart,
} from 'lucide-react'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { useCityStore } from '../../stores/cityStore'
import { getServices } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(Math.round(n || 0))
}

/* ── Static deal tiers – cycle through services ─────────────── */
const DEAL_TAGS = [
  { label: 'Most Popular', icon: Flame,     bg: '#FFF3EF', color: '#F06138', border: 'rgba(240,97,56,0.25)' },
  { label: 'Best Value',   icon: Award,     bg: '#FDFAD6', color: '#894B00', border: 'rgba(137,75,0,0.2)' },
  { label: 'Flash Deal',   icon: Zap,       bg: '#F0FDF4', color: '#016630', border: 'rgba(1,102,48,0.2)' },
  { label: 'Trending',     icon: TrendingUp, bg: '#EFF6FF', color: '#193CB8', border: 'rgba(25,60,184,0.2)' },
  { label: 'Top Rated',    icon: Star,      bg: '#FDF2F8', color: '#9D174D', border: 'rgba(157,23,77,0.2)' },
]

const EVENT_FILTERS = [
  { key: 'all',        label: 'All Packages',   icon: Sparkles   },
  { key: 'wedding',    label: 'Wedding',         icon: Heart      },
  { key: 'birthday',   label: 'Birthday',        icon: Sparkles   },
  { key: 'corporate',  label: 'Corporate',       icon: Building2  },
  { key: 'photography',label: 'Photography',     icon: Camera     },
  { key: 'catering',   label: 'Catering',        icon: Utensils   },
  { key: 'decoration', label: 'Decoration',      icon: Flower2    },
  { key: 'music',      label: 'Music & DJ',      icon: Music      },
  { key: 'makeup',     label: 'Makeup',          icon: Paintbrush2},
  { key: 'planning',   label: 'Planning',        icon: ClipboardList},
]

const BUDGET_FILTERS = [
  { key: 'all',   label: 'All Budgets'    },
  { key: 'u25',   label: 'Under ₹25,000' },
  { key: 'u75',   label: '₹25k – ₹75k'  },
  { key: 'u200',  label: '₹75k – ₹2L'   },
  { key: 'above', label: 'Above ₹2L'     },
]

const SORT_OPTIONS = [
  { key: 'popular',  label: 'Most Popular' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'rating',   label: 'Highest Rated' },
]

/* ── Featured package card (large, 2-up) ────────────────────── */
function FeaturedCard({ svc, tag, navigate }) {
  const TagIcon = tag.icon
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/vendor/${svc.vendorId?._id}`)}
      className="relative overflow-hidden rounded-3xl cursor-pointer group"
      style={{ minHeight: 280 }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        {svc.images?.[0] ? (
          <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #3d1a0a 0%, #8B4332 100%)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)' }} />
      </div>

      {/* Deal tag */}
      <div className="absolute top-4 left-4">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-lato font-bold" style={{ background: tag.bg, color: tag.color, border: `1px solid ${tag.border}` }}>
          <TagIcon size={11} /> {tag.label}
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin size={11} className="text-white/70" />
          <span className="font-lato text-white/70 text-[11px]">{svc.vendorId?.city}</span>
          {svc.vendorId?.rating > 0 && (
            <>
              <span className="text-white/40">·</span>
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="font-lato text-white/90 text-[11px] font-semibold">{svc.vendorId?.rating?.toFixed(1)}</span>
            </>
          )}
        </div>
        <h3 className="font-filson font-black text-white text-lg leading-snug mb-0.5">{svc.title}</h3>
        <p className="font-lato text-white/65 text-xs mb-3 line-clamp-2">{svc.description}</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-lato text-white/50 text-[10px] mb-0.5">by {svc.vendorId?.businessName}</p>
            <div className="flex items-center gap-0.5 font-filson font-black text-white text-2xl">
              <IndianRupee size={17} />
              {fmt(svc.price)}
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={(e) => { e.stopPropagation(); navigate(`/book/${svc.vendorId?._id}/${svc._id}`) }}
            className="px-5 py-2.5 rounded-xl font-lato font-bold text-sm hover:opacity-90 transition-opacity"
            style={{ background: '#F06138', color: '#FDFAD6' }}
          >
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Regular package card ────────────────────────────────────── */
function PackageCard({ svc, idx, navigate }) {
  const tag = DEAL_TAGS[idx % DEAL_TAGS.length]
  const TagIcon = tag.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (idx % 6) * 0.05 }}
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col"
      onClick={() => navigate(`/vendor/${svc.vendorId?._id}`)}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-44">
        {svc.images?.[0] ? (
          <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#FFF3EF' }}>
            <Tag size={28} className="text-[#F06138] opacity-30" />
          </div>
        )}
        {/* Rating overlay */}
        {svc.vendorId?.rating > 0 && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="font-lato font-bold text-white text-[10px]">{svc.vendorId?.rating?.toFixed(1)}</span>
          </div>
        )}
        {/* Deal tag */}
        <div className="absolute top-2.5 left-2.5">
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-lato font-bold" style={{ background: tag.bg, color: tag.color }}>
            <TagIcon size={9} /> {tag.label}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="font-lato font-bold text-[#101828] text-sm mb-0.5 line-clamp-1">{svc.title}</p>
        <p className="font-lato text-[#6A6A6A] text-xs mb-3 line-clamp-2 flex-1">{svc.description}</p>

        <div className="flex items-center gap-3 mb-3">
          {svc.duration && (
            <span className="flex items-center gap-1 text-[11px] font-lato text-[#6A6A6A]">
              <Clock size={10} /> {svc.duration}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] font-lato text-[#6A6A6A]">
            <MapPin size={10} /> {svc.vendorId?.city}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-black/5">
          <div>
            <p className="font-lato text-[10px] text-[#9CA3AF]">by {svc.vendorId?.businessName}</p>
            <div className="flex items-center gap-0.5 font-filson font-black text-[#8B4332] text-lg leading-none mt-0.5">
              <IndianRupee size={13} />
              {fmt(svc.price)}
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={(e) => { e.stopPropagation(); navigate(`/book/${svc.vendorId?._id}/${svc._id}`) }}
            className="px-3.5 py-2 rounded-xl font-lato font-bold text-xs hover:opacity-90 transition-opacity"
            style={{ background: '#F06138', color: '#FDFAD6' }}
          >
            Book
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function Offers() {
  const { city } = useCityStore()
  const navigate = useNavigate()

  const [search, setSearch]           = useState('')
  const [eventFilter, setEventFilter] = useState('all')
  const [budgetFilter, setBudgetFilter] = useState('all')
  const [sortBy, setSortBy]           = useState('popular')
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['all-services'],
    queryFn: () => getServices({ limit: 100 }),
  })

  const allServices = data?.data?.services || []

  /* ── Filter & sort ── */
  const filtered = useMemo(() => {
    let list = [...allServices]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.vendorId?.businessName?.toLowerCase().includes(q) ||
          s.vendorId?.city?.toLowerCase().includes(q)
      )
    }

    // Event / category filter
    if (eventFilter !== 'all') {
      list = list.filter(
        (s) =>
          s.title?.toLowerCase().includes(eventFilter) ||
          s.description?.toLowerCase().includes(eventFilter) ||
          s.vendorId?.category?.name?.toLowerCase().includes(eventFilter) ||
          (typeof s.vendorId?.category === 'string' && s.vendorId.category.toLowerCase().includes(eventFilter))
      )
    }

    // Budget
    if (budgetFilter === 'u25')   list = list.filter((s) => s.price < 25000)
    if (budgetFilter === 'u75')   list = list.filter((s) => s.price >= 25000 && s.price < 75000)
    if (budgetFilter === 'u200')  list = list.filter((s) => s.price >= 75000 && s.price < 200000)
    if (budgetFilter === 'above') list = list.filter((s) => s.price >= 200000)

    // Sort
    if (sortBy === 'price_asc')  list.sort((a, b) => a.price - b.price)
    if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price)
    if (sortBy === 'rating')     list.sort((a, b) => (b.vendorId?.rating || 0) - (a.vendorId?.rating || 0))

    return list
  }, [allServices, search, eventFilter, budgetFilter, sortBy])

  const featured = filtered.slice(0, 2)
  const rest     = filtered.slice(2)

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(155deg, #3d1a0a 0%, #8B4332 60%, #F06138 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 50%, rgba(240,97,56,0.3) 0%, transparent 60%)' }} />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-14 sm:py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-lato font-bold"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
              >
                <BadgePercent size={13} /> Exclusive Packages & Deals
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="font-filson font-black text-white leading-[1.06] mb-4"
                style={{ fontSize: 'clamp(28px, 5vw, 56px)' }}
              >
                Handpicked packages<br />
                <span style={{ color: '#FDFAD6' }}>for every occasion</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="font-lato text-white/65 text-base max-w-md mb-6"
              >
                From intimate birthdays to grand weddings — browse curated service packages from verified vendors and book instantly.
              </motion.p>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                className="flex items-center flex-wrap gap-6"
              >
                {[
                  { val: `${allServices.length || '100'}+`, label: 'Packages' },
                  { val: '4.8★',  label: 'Avg. Rating' },
                  { val: '100%',  label: 'Verified Vendors' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-filson font-black text-white text-2xl leading-none">{s.val}</p>
                    <p className="font-lato text-white/50 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Search box */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="w-full lg:w-80 shrink-0"
            >
              <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)' }}>
                <p className="font-lato font-bold text-white text-sm mb-3">Find your package</p>
                <div className="relative mb-3">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by service or vendor…"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-lato text-[#101828] placeholder:text-[#9CA3AF] bg-white outline-none focus:ring-2 focus:ring-[#F06138]/20"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-lato text-white/60">
                  <span className="flex items-center gap-1"><CheckCircle size={11} className="text-[#FDFAD6]" /> Instant confirmation</span>
                  <span className="flex items-center gap-1"><CheckCircle size={11} className="text-[#FDFAD6]" /> No hidden fees</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">

        {/* ── FILTER BAR ───────────────────────────────────────── */}
        <div className="space-y-4 mb-8">
          {/* Event type tabs — horizontal scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {EVENT_FILTERS.map((f) => {
              const Icon = f.icon
              const active = eventFilter === f.key
              return (
                <button
                  key={f.key}
                  onClick={() => setEventFilter(f.key)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-lato font-semibold text-sm shrink-0 transition-all border"
                  style={active
                    ? { background: '#F06138', color: '#FDFAD6', borderColor: '#F06138' }
                    : { background: 'white', color: '#6A6A6A', borderColor: 'rgba(0,0,0,0.08)' }
                  }
                >
                  <Icon size={13} />
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Budget + Sort row */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Budget pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {BUDGET_FILTERS.map((b) => {
                const active = budgetFilter === b.key
                return (
                  <button
                    key={b.key}
                    onClick={() => setBudgetFilter(b.key)}
                    className="px-3 py-1.5 rounded-lg font-lato text-xs font-semibold shrink-0 transition-all border"
                    style={active
                      ? { background: '#101828', color: 'white', borderColor: '#101828' }
                      : { background: 'white', color: '#6A6A6A', borderColor: 'rgba(0,0,0,0.08)' }
                    }
                  >
                    {b.label}
                  </button>
                )
              })}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal size={14} className="text-[#6A6A6A]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-lato text-sm text-[#101828] border border-black/10 rounded-xl px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-[#F06138]/20 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── RESULTS COUNT ────────────────────────────────────── */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-6">
            <p className="font-lato text-sm text-[#6A6A6A]">
              <span className="font-bold text-[#101828]">{filtered.length}</span> packages found
              {eventFilter !== 'all' && <span> · <button onClick={() => { setEventFilter('all'); setBudgetFilter('all'); setSearch('') }} className="text-[#F06138] font-semibold hover:underline">Clear filters</button></span>}
            </p>
            {search && <p className="font-lato text-xs text-[#6A6A6A]">Searching for "{search}"</p>}
          </div>
        )}

        {isLoading ? (
          /* Skeleton */
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[1, 2].map((i) => <div key={i} className="h-72 bg-gray-100 rounded-3xl animate-pulse" />)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="h-44 bg-gray-100 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                    <div className="h-8 bg-gray-100 rounded animate-pulse w-full mt-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="py-24 text-center rounded-3xl" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#FFF3EF' }}>
              <Tag size={28} className="text-[#F06138] opacity-50" />
            </div>
            <p className="font-filson font-bold text-[#101828] text-lg mb-1">No packages found</p>
            <p className="font-lato text-[#6A6A6A] text-sm mb-5">Try adjusting your filters or search term</p>
            <button
              onClick={() => { setEventFilter('all'); setBudgetFilter('all'); setSearch('') }}
              className="px-6 py-2.5 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ background: '#F06138', color: '#FDFAD6' }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-10">

            {/* ── FEATURED (top 2) ────────────────────────────── */}
            {featured.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <Flame size={18} className="text-[#F06138]" />
                  <h2 className="font-filson font-bold text-[#101828] text-xl">Featured Packages</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {featured.map((svc, i) => (
                    <FeaturedCard key={svc._id} svc={svc} tag={DEAL_TAGS[i]} navigate={navigate} />
                  ))}
                </div>
              </section>
            )}

            {/* ── REST ────────────────────────────────────────── */}
            {rest.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-filson font-bold text-[#101828] text-xl">All Packages</h2>
                  <span className="font-lato text-xs text-[#6A6A6A]">{rest.length} packages</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rest.map((svc, i) => (
                    <PackageCard key={svc._id} svc={svc} idx={i} navigate={navigate} />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

        {/* ── BOTTOM BANNER ────────────────────────────────────── */}
        {!isLoading && filtered.length > 0 && (
          <div className="mt-14 rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #101828 0%, #1a2d40 100%)' }}>
            <div className="absolute right-0 top-0 w-80 h-80 rounded-full pointer-events-none opacity-15" style={{ background: 'radial-gradient(circle, #F06138 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 sm:p-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-[#F06138]" />
                  <span className="font-lato font-bold text-[#F06138] text-sm">Can't find what you need?</span>
                </div>
                <h3 className="font-filson font-black text-white text-2xl leading-snug mb-2">
                  Get a custom package<br />
                  <span style={{ color: '#FDFAD6' }}>tailored for your event</span>
                </h3>
                <p className="font-lato text-white/55 text-sm max-w-sm">
                  Browse all vendors and message them directly to create a package that fits your budget perfectly.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <Link
                  to="/explore"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-lato font-bold text-sm hover:opacity-90 transition-opacity"
                  style={{ background: '#F06138', color: '#FDFAD6' }}
                >
                  Browse All Vendors <ChevronRight size={16} />
                </Link>
                <Link
                  to="/chat"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-lato font-semibold text-sm border border-white/20 text-white/80 hover:bg-white/5 transition-colors"
                >
                  Chat with a Vendor
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>

      <Footer />
    </motion.div>
  )
}

import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Search, SlidersHorizontal, X, MapPin, Star,
  ChevronLeft, ChevronRight, Filter,
} from 'lucide-react'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import Skeleton from '../../components/shared/Skeleton'
import { getVendors } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'

/* ─── Constants ──────────────────────────────────────────── */
const CATEGORIES = [
  'All', 'Weddings', 'Photography', 'Catering', 'Entertainment',
  'Decoration', 'Transportation', 'Venues', 'Makeup & Beauty',
]

const CITIES = ['All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad']

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
]

const PRICE_RANGES = [
  { label: 'Any Budget', min: 0, max: Infinity },
  { label: 'Under ₹10,000', min: 0, max: 10000 },
  { label: '₹10,000 – ₹30,000', min: 10000, max: 30000 },
  { label: '₹30,000 – ₹75,000', min: 30000, max: 75000 },
  { label: '₹75,000+', min: 75000, max: Infinity },
]

/* ─── Mock vendor data (used when API returns empty) ─────── */
const MOCK_VENDORS = Array.from({ length: 12 }, (_, i) => ({
  _id: String(i + 1),
  businessName: [
    'Royal Events & Décor', 'Lens & Light Studio', 'Flavours of India',
    'Rhythm & Beats', 'Dream Weddings', 'Candid Moments Photography',
    'Spice Garden Catering', 'Party Planners Pro', 'Sky High Events',
    'Golden Memories Studio', 'Fresh Bloom Florists', 'Sound & Stage',
  ][i],
  category: CATEGORIES.slice(1)[i % (CATEGORIES.length - 1)],
  city: CITIES.slice(1)[i % (CITIES.length - 1)],
  rating: (4 + Math.random()).toFixed(1),
  totalReviews: Math.floor(20 + Math.random() * 200),
  startingPrice: Math.floor(10 + Math.random() * 80) * 1000,
  coverImage: [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80',
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80',
    'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80',
    'https://images.unsplash.com/photo-1501386761578-eaa54522def9?w=400&q=80',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&q=80',
  ][i % 6],
  isVerified: Math.random() > 0.3,
}))

/* ─── Vendor card ────────────────────────────────────────── */
function VendorCard({ vendor, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -3 }}
    >
      <Link
        to={`/vendors/${vendor._id}`}
        className="block rounded-2xl overflow-hidden border border-black/5 hover:shadow-lg transition-all"
        style={{ background: '#FFFEF5' }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: 200 }}>
          <img
            src={vendor.coverImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80'}
            alt={vendor.businessName}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          {vendor.isVerified && (
            <span
              className="absolute top-3 right-3 text-xs font-lato font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(1,102,48,0.9)', color: '#fff' }}
            >
              ✓ Verified
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-lato font-semibold text-[#101828] text-sm truncate">{vendor.businessName}</h3>
              <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{vendor.category}</p>
            </div>
            <span
              className="shrink-0 text-xs font-lato font-semibold px-2 py-0.5 rounded-full"
              style={{ background: '#FFF3EF', color: '#F06138' }}
            >
              {vendor.category}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-2">
            <MapPin size={12} className="text-[#6A6A6A] shrink-0" />
            <span className="font-lato text-xs text-[#6A6A6A]">{vendor.city}</span>
          </div>

          <div className="flex items-center gap-1.5 mt-1.5">
            <Star size={13} className="text-[#F06138] fill-[#F06138]" />
            <span className="font-lato text-sm font-semibold text-[#101828]">{vendor.rating}</span>
            <span className="font-lato text-xs text-[#6A6A6A]">({vendor.totalReviews} reviews)</span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
            <div>
              <span className="font-lato text-xs text-[#6A6A6A]">Starting from</span>
              <p className="font-lato font-bold text-[#8B4332] text-sm">
                ₹{new Intl.NumberFormat('en-IN').format(vendor.startingPrice)}
              </p>
            </div>
            <span
              className="px-3 py-1.5 rounded-lg text-xs font-lato font-semibold transition-colors"
              style={{ background: '#F06138', color: '#FDFAD6' }}
            >
              View Profile
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ─── Skeleton card ──────────────────────────────────────── */
function VendorSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-black/5" style={{ background: '#FFFEF5' }}>
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-8 w-full rounded-lg mt-3" />
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────── */
export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [city, setCity] = useState('All Cities')
  const [sort, setSort] = useState('rating')
  const [priceRange, setPriceRange] = useState(0)
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', { search, category, city, sort, page }],
    queryFn: () =>
      getVendors({
        q: search || undefined,
        category: category !== 'All' ? category : undefined,
        city: city !== 'All Cities' ? city : undefined,
        sort,
        page,
        limit: 12,
      }),
    placeholderData: (prev) => prev,
  })

  const vendors = data?.data?.vendors || MOCK_VENDORS
  const total = data?.data?.total || MOCK_VENDORS.length
  const totalPages = Math.ceil(total / 12) || 1

  useEffect(() => {
    const q = searchParams.get('q')
    const cat = searchParams.get('category')
    if (q) setSearch(q)
    if (cat) setCategory(cat)
  }, [searchParams])

  function applySearch(val) {
    setSearch(val)
    setPage(1)
    setSearchParams((p) => {
      if (val) p.set('q', val)
      else p.delete('q')
      return p
    })
  }

  const FilterPanel = (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h4 className="font-lato font-semibold text-[#101828] text-sm mb-3">Category</h4>
        <div className="space-y-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setPage(1) }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-lato transition-colors"
              style={
                category === c
                  ? { background: '#FFF3EF', color: '#F06138', fontWeight: 600 }
                  : { color: '#364153' }
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* City */}
      <div>
        <h4 className="font-lato font-semibold text-[#101828] text-sm mb-3">City</h4>
        <select
          value={city}
          onChange={(e) => { setCity(e.target.value); setPage(1) }}
          className="w-full px-3 py-2.5 rounded-lg text-sm font-lato border border-[rgba(139,67,50,0.2)] bg-[#FFFEED] text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#F06138]/30"
        >
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Price range */}
      <div>
        <h4 className="font-lato font-semibold text-[#101828] text-sm mb-3">Budget</h4>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => { setPriceRange(i); setPage(1) }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-lato transition-colors"
              style={
                priceRange === i
                  ? { background: '#FFF3EF', color: '#F06138', fontWeight: 600 }
                  : { color: '#364153' }
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-[#FFFDFC]"
    >
      <Navbar />

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="border-b border-black/5" style={{ background: '#FEFDEB' }}>
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <h1 className="font-filson font-black text-[#101828] text-3xl mb-4">Browse Vendors</h1>

          {/* Search bar */}
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
              <input
                type="text"
                value={search}
                onChange={(e) => applySearch(e.target.value)}
                placeholder="Search vendors, services…"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-[rgba(139,67,50,0.2)] bg-[#FFFEED] text-sm text-[#101828] placeholder:text-[#6A6A6A] focus:outline-none focus:ring-2 focus:ring-[#F06138]/30"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[rgba(139,67,50,0.2)] bg-[#FFFEED] text-sm font-lato text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#F06138]/30 hidden sm:block"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-xl border border-[rgba(139,67,50,0.2)] text-sm font-lato text-[#364153]"
              style={{ background: '#FFFEED' }}
            >
              <Filter size={16} /> Filters
            </button>
          </div>

          {/* Active filters */}
          <div className="flex flex-wrap gap-2 mt-3">
            {category !== 'All' && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-lato font-medium"
                style={{ background: '#FFF3EF', color: '#F06138' }}
              >
                {category}
                <button onClick={() => setCategory('All')}><X size={12} /></button>
              </span>
            )}
            {city !== 'All Cities' && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-lato font-medium"
                style={{ background: '#FFF3EF', color: '#F06138' }}
              >
                {city}
                <button onClick={() => setCity('All Cities')}><X size={12} /></button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <SlidersHorizontal size={16} className="text-[#F06138]" />
                <h3 className="font-lato font-bold text-[#101828] text-sm">Filters</h3>
              </div>
              {FilterPanel}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="font-lato text-sm text-[#6A6A6A]">
                {isLoading ? 'Loading…' : `${total} vendors found`}
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {isLoading
                ? Array.from({ length: 9 }).map((_, i) => <VendorSkeleton key={i} />)
                : vendors.map((v, i) => <VendorCard key={v._id} vendor={v} index={i} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-[rgba(139,67,50,0.2)] disabled:opacity-40 hover:bg-[#FFF3EF] transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-9 h-9 rounded-lg border text-sm font-lato font-medium transition-colors"
                    style={
                      page === p
                        ? { background: '#F06138', color: '#FDFAD6', borderColor: '#F06138' }
                        : { borderColor: 'rgba(139,67,50,0.2)', color: '#364153' }
                    }
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-[rgba(139,67,50,0.2)] disabled:opacity-40 hover:bg-[#FFF3EF] transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ──────────────────────────────── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-72 z-50 overflow-y-auto"
              style={{ background: '#FFFEF5' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
                <h3 className="font-lato font-bold text-[#101828]">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5">{FilterPanel}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </motion.div>
  )
}

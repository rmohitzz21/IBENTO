import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, X, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { SkeletonCard } from '../../components/shared/Skeleton'
import { getVendors } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'

const CATEGORIES = ['All', 'Weddings', 'Photography', 'Catering', 'Entertainment', 'Decoration', 'Transportation', 'Venues', 'Makeup & Beauty']
const CITIES = ['All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Kolkata']
const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

const MOCK_VENDORS = Array.from({ length: 12 }, (_, i) => ({
  _id: String(i + 1),
  businessName: ['Royal Events', 'Lens Studio', 'Flavours India', 'Rhythm Beats', 'Dream Weddings', 'Candid Moments', 'Spice Garden', 'Party Planners', 'Sky High Events', 'Golden Memories', 'Fresh Bloom', 'Sound Stage'][i],
  category: CATEGORIES.slice(1)[i % 8],
  city: CITIES.slice(1)[i % 8],
  rating: (4 + Math.random()).toFixed(1),
  totalReviews: Math.floor(20 + Math.random() * 200),
  startingPrice: Math.floor(10 + Math.random() * 80) * 1000,
  coverImage: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80','https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80','https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80','https://images.unsplash.com/photo-1501386761578-eaa54522def9?w=400&q=80','https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80','https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&q=80'][i % 6],
  isVerified: Math.random() > 0.3,
}))

function VendorCard({ vendor, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -3 }}>
      <Link to={`/vendor/${vendor._id}`} className="block rounded-2xl overflow-hidden border border-black/5 hover:shadow-lg transition-all" style={{ background: '#FFFEF5' }}>
        <div className="relative overflow-hidden h-48">
          <img src={vendor.coverImage} alt={vendor.businessName} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
          {vendor.isVerified && (
            <span className="absolute top-2 right-2 text-xs font-lato font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(1,102,48,0.9)', color: '#fff' }}>✓ Verified</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-lato font-semibold text-[#101828] text-sm truncate">{vendor.businessName}</h3>
          <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{vendor.category}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={12} className="text-[#6A6A6A]" />
            <span className="font-lato text-xs text-[#6A6A6A]">{vendor.city}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Star size={13} className="text-[#F06138] fill-[#F06138]" />
            <span className="font-lato text-sm font-semibold text-[#101828]">{vendor.rating}</span>
            <span className="font-lato text-xs text-[#6A6A6A]">({vendor.totalReviews})</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
            <div>
              <span className="font-lato text-xs text-[#6A6A6A]">From</span>
              <p className="font-lato font-bold text-[#8B4332] text-sm">₹{new Intl.NumberFormat('en-IN').format(vendor.startingPrice)}</p>
            </div>
            <span className="px-3 py-1.5 rounded-lg text-xs font-lato font-semibold" style={{ background: '#F06138', color: '#FDFAD6' }}>View</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [city, setCity] = useState('All Cities')
  const [sort, setSort] = useState('rating')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', { search, category, city, sort, page }],
    queryFn: () => getVendors({ q: search || undefined, category: category !== 'All' ? category : undefined, city: city !== 'All Cities' ? city : undefined, sort, page, limit: 12 }),
    placeholderData: (p) => p,
  })

  const vendors = data?.data?.vendors || MOCK_VENDORS
  const total = data?.data?.total || MOCK_VENDORS.length
  const totalPages = Math.ceil(total / 12) || 1

  useEffect(() => {
    const q = searchParams.get('q'); const cat = searchParams.get('category')
    if (q) setSearch(q); if (cat) setCategory(cat)
  }, [searchParams])

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      {/* Header */}
      <div className="border-b border-black/5" style={{ background: '#FEFDEB' }}>
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          <h1 className="font-filson font-black text-[#101828] text-2xl mb-4">Explore Vendors</h1>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search vendors, services…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[rgba(139,67,50,0.2)] bg-[#FFFEED] text-sm text-[#101828] placeholder:text-[#6A6A6A] focus:outline-none focus:ring-2 focus:ring-[#F06138]/30"
              />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="hidden sm:block px-3 py-2.5 rounded-xl border border-[rgba(139,67,50,0.2)] bg-[#FFFEED] text-sm font-lato text-[#101828] focus:outline-none">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => setFiltersOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(139,67,50,0.2)] text-sm font-lato" style={{ background: '#FFFEED' }}>
              <SlidersHorizontal size={15} /> Filters
            </button>
          </div>
          {/* Active filters */}
          <div className="flex flex-wrap gap-2 mt-2">
            {category !== 'All' && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-lato font-medium" style={{ background: '#FFF3EF', color: '#F06138' }}>
                {category} <button onClick={() => setCategory('All')}><X size={11} /></button>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-52 shrink-0 sticky top-24 self-start">
          <p className="font-lato font-bold text-[#101828] text-sm mb-4">Category</p>
          <div className="space-y-1">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => { setCategory(c); setPage(1) }} className="w-full text-left px-3 py-2 rounded-lg text-sm font-lato transition-colors" style={category === c ? { background: '#FFF3EF', color: '#F06138', fontWeight: 600 } : { color: '#364153' }}>
                {c}
              </button>
            ))}
          </div>
          <p className="font-lato font-bold text-[#101828] text-sm mt-6 mb-3">City</p>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm font-lato border border-[rgba(139,67,50,0.2)] bg-[#FFFEED] text-[#101828] focus:outline-none">
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <p className="font-lato text-sm text-[#6A6A6A] mb-5">{isLoading ? 'Loading…' : `${total} vendors found`}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {isLoading ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />) : vendors.map((v, i) => <VendorCard key={v._id} vendor={v} index={i} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-[rgba(139,67,50,0.2)] disabled:opacity-40 hover:bg-[#FFF3EF]"><ChevronLeft size={18} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className="w-9 h-9 rounded-lg border text-sm font-lato font-medium transition-colors" style={page === p ? { background: '#F06138', color: '#FDFAD6', borderColor: '#F06138' } : { borderColor: 'rgba(139,67,50,0.2)', color: '#364153' }}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-[rgba(139,67,50,0.2)] disabled:opacity-40 hover:bg-[#FFF3EF]"><ChevronRight size={18} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-40" onClick={() => setFiltersOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.25 }} className="fixed top-0 left-0 h-full w-64 z-50 overflow-y-auto" style={{ background: '#FFFEF5' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
                <span className="font-lato font-bold text-[#101828]">Filters</span>
                <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-2">
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => { setCategory(c); setFiltersOpen(false) }} className="w-full text-left px-3 py-2 rounded-lg text-sm font-lato" style={category === c ? { background: '#FFF3EF', color: '#F06138', fontWeight: 600 } : { color: '#364153' }}>{c}</button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </motion.div>
  )
}

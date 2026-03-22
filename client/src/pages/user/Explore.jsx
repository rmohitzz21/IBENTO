import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Search, SlidersHorizontal, X, MapPin, Star,
  ChevronLeft, ChevronRight, LayoutGrid, List,
  BadgeCheck, ArrowUpDown,
} from 'lucide-react'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { SkeletonCard } from '../../components/shared/Skeleton'
import { getVendors } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'
import { useCityStore } from '../../stores/cityStore'

const CATEGORIES = ['All', 'Weddings', 'Photography', 'Catering', 'Entertainment', 'Decoration', 'Transportation', 'Venues', 'Makeup & Beauty']
const CITIES = ['All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Kolkata']
const SORT_OPTIONS = [
  { value: 'rating',     label: 'Top Rated' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
]

function GridCard({ vendor, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link
        to={`/vendor/${vendor._id}`}
        className="block rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl"
        style={{ background: '#fff', border: '1px solid rgba(139,67,50,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <div className="relative overflow-hidden h-52">
          <img
            src={vendor.coverImage}
            alt={vendor.businessName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {vendor.isVerified && (
            <span className="absolute top-3 left-3 flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm" style={{ background: 'rgba(1,102,48,0.85)', color: '#fff' }}>
              <BadgeCheck size={11} /> Verified
            </span>
          )}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="font-lato font-bold text-[#101828] text-xs">{vendor.rating}</span>
            <span className="font-lato text-[#6A6A6A] text-[11px]">({vendor.totalReviews})</span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-lato font-bold text-[#101828] text-sm truncate group-hover:text-[#F06138] transition-colors">{vendor.businessName}</h3>
              <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{vendor.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <MapPin size={11} className="text-[#6A6A6A] shrink-0" />
            <span className="font-lato text-xs text-[#6A6A6A] truncate">{vendor.city}</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
            <div>
              <span className="font-lato text-[11px] text-[#6A6A6A]">Starting from</span>
              <p className="font-filson font-black text-[#8B4332] text-sm">₹{new Intl.NumberFormat('en-IN').format(vendor.startingPrice)}</p>
            </div>
            <span className="px-3 py-1.5 rounded-lg text-xs font-lato font-bold transition-colors" style={{ background: '#F06138', color: '#FDFAD6' }}>
              View →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function ListCard({ vendor, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        to={`/vendor/${vendor._id}`}
        className="flex gap-4 p-4 rounded-2xl transition-all duration-200 hover:shadow-lg group"
        style={{ background: '#fff', border: '1px solid rgba(139,67,50,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <div className="relative rounded-xl overflow-hidden shrink-0 w-28 h-24">
          <img
            src={vendor.coverImage}
            alt={vendor.businessName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {vendor.isVerified && (
            <span className="absolute top-1.5 left-1.5 flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(1,102,48,0.85)', color: '#fff' }}>
              <BadgeCheck size={10} />
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-lato font-bold text-[#101828] text-sm group-hover:text-[#F06138] transition-colors">{vendor.businessName}</h3>
              <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{vendor.category}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 bg-amber-50 rounded-lg px-2 py-0.5">
              <Star size={12} className="text-amber-500 fill-amber-500" />
              <span className="font-lato font-bold text-[#101828] text-xs">{vendor.rating}</span>
              <span className="font-lato text-[#6A6A6A] text-[11px]">({vendor.totalReviews})</span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <MapPin size={11} className="text-[#6A6A6A]" />
            <span className="font-lato text-xs text-[#6A6A6A]">{vendor.city}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-lato text-[11px] text-[#6A6A6A]">Starting from </span>
              <span className="font-filson font-black text-[#8B4332] text-sm">₹{new Intl.NumberFormat('en-IN').format(vendor.startingPrice)}</span>
            </div>
            <span className="text-xs font-lato font-bold text-[#F06138] group-hover:underline">View profile →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { city: userCity } = useCityStore()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [city, setCity] = useState(userCity || 'All Cities')
  const [sort, setSort] = useState('rating')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', { search, category, city, sort, page }],
    queryFn: () => getVendors({ q: search || undefined, category: category !== 'All' ? category : undefined, city: city !== 'All Cities' ? city : undefined, sort, page, limit: 12 }),
    placeholderData: (p) => p,
  })

  const vendors = data?.data?.vendors || []
  const total = data?.data?.total || 0
  const totalPages = Math.ceil(total / 12) || 1

  useEffect(() => {
    const q = searchParams.get('q'); const cat = searchParams.get('category')
    if (q) setSearch(q); if (cat) setCategory(cat)
  }, [searchParams])

  const activeFilterCount = [category !== 'All', city !== 'All Cities'].filter(Boolean).length

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      {/* Header */}
      <div className="border-b border-black/5" style={{ background: '#FEFDEB' }}>
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-filson font-black text-[#101828] text-2xl">Explore Vendors</h1>
              <p className="font-lato text-[#6A6A6A] text-sm mt-0.5">
                {isLoading ? 'Searching…' : <><span className="font-semibold text-[#101828]">{total}</span> vendors available</>}
              </p>
            </div>
            {/* View toggle */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(139,67,50,0.08)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className="p-2 rounded-lg transition-all"
                style={viewMode === 'grid' ? { background: '#F06138', color: '#fff' } : { color: '#6A6A6A' }}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-2 rounded-lg transition-all"
                style={viewMode === 'list' ? { background: '#F06138', color: '#fff' } : { color: '#6A6A6A' }}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search vendors, services, categories…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[rgba(139,67,50,0.2)] bg-white text-sm text-[#101828] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F06138]/20 focus:border-[#F06138]/40 transition-all"
              />
            </div>
            <div className="relative hidden sm:block">
              <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="pl-8 pr-4 py-2.5 rounded-xl border border-[rgba(139,67,50,0.2)] bg-white text-sm font-lato text-[#101828] focus:outline-none appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(139,67,50,0.2)] text-sm font-lato relative"
              style={{ background: '#fff', color: activeFilterCount > 0 ? '#F06138' : '#364153' }}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: '#F06138' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active filters */}
          <AnimatePresence>
            {(category !== 'All' || city !== 'All Cities') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mt-3"
              >
                {category !== 'All' && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-lato font-semibold" style={{ background: '#FFF3EF', color: '#F06138', border: '1px solid rgba(240,97,56,0.2)' }}>
                    {category}
                    <button onClick={() => setCategory('All')} className="hover:text-red-500 transition-colors"><X size={11} /></button>
                  </span>
                )}
                {city !== 'All Cities' && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-lato font-semibold" style={{ background: '#FFF3EF', color: '#F06138', border: '1px solid rgba(240,97,56,0.2)' }}>
                    <MapPin size={10} /> {city}
                    <button onClick={() => setCity('All Cities')} className="hover:text-red-500 transition-colors"><X size={11} /></button>
                  </span>
                )}
                {activeFilterCount > 1 && (
                  <button
                    onClick={() => { setCategory('All'); setCity('All Cities') }}
                    className="px-3 py-1 rounded-full text-xs font-lato font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(139,67,50,0.1)', background: '#fff' }}>
            <div className="px-4 pt-4 pb-2 border-b border-black/5">
              <p className="font-lato font-bold text-[#101828] text-sm">Category</p>
            </div>
            <div className="p-2 space-y-0.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); setPage(1) }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-lato transition-all"
                  style={category === c
                    ? { background: '#FFF3EF', color: '#F06138', fontWeight: 700 }
                    : { color: '#4C4C4C' }
                  }
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-black/5">
              <p className="font-lato font-bold text-[#101828] text-sm mb-2">City</p>
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); setPage(1) }}
                className="w-full px-3 py-2.5 rounded-lg text-sm font-lato border border-[rgba(139,67,50,0.2)] bg-[#FFFEED] text-[#101828] focus:outline-none"
              >
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </aside>

        {/* Grid / List */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : vendors.length === 0 ? (
            <div className="py-20 text-center rounded-2xl" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
              <Search size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="font-lato font-semibold text-[#101828] text-sm mb-1">No vendors found</p>
              <p className="font-lato text-[#6A6A6A] text-xs mb-4">Try different search terms or filters</p>
              <button
                onClick={() => { setSearch(''); setCategory('All'); setCity('All Cities') }}
                className="px-5 py-2.5 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ background: '#F06138', color: '#FDFAD6' }}
              >
                Clear filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {vendors.map((v, i) => <GridCard key={v._id} vendor={v} index={i} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {vendors.map((v, i) => <ListCard key={v._id} vendor={v} index={i} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border font-lato text-sm disabled:opacity-40 hover:bg-[#FFF3EF] transition-colors"
                style={{ borderColor: 'rgba(139,67,50,0.2)', color: '#364153' }}
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-9 h-9 rounded-lg border text-sm font-lato font-medium transition-all"
                    style={page === p
                      ? { background: '#F06138', color: '#FDFAD6', borderColor: '#F06138', boxShadow: '0 2px 8px rgba(240,97,56,0.3)' }
                      : { borderColor: 'rgba(139,67,50,0.2)', color: '#364153' }
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border font-lato text-sm disabled:opacity-40 hover:bg-[#FFF3EF] transition-colors"
                style={{ borderColor: 'rgba(139,67,50,0.2)', color: '#364153' }}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-72 z-50 overflow-y-auto"
              style={{ background: '#fff' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
                <span className="font-lato font-bold text-[#101828]">Filters</span>
                <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
              </div>
              <div className="p-5">
                <p className="font-lato font-bold text-[#101828] text-sm mb-3">Category</p>
                <div className="space-y-1 mb-6">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCategory(c); setFiltersOpen(false); setPage(1) }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-lato transition-all"
                      style={category === c ? { background: '#FFF3EF', color: '#F06138', fontWeight: 700 } : { color: '#4C4C4C' }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <p className="font-lato font-bold text-[#101828] text-sm mb-2">City</p>
                <select
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setPage(1) }}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-lato border border-[rgba(139,67,50,0.2)] bg-[#FFFEED] text-[#101828] focus:outline-none"
                >
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </motion.div>
  )
}

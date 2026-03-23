import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MapPin, Star, ChevronLeft, ChevronRight, Heart, Share2,
  CheckCircle, Clock, MessageSquare, IndianRupee, Phone, Mail,
  X, Wifi, WifiOff, Users, ImageIcon, Loader2, Calendar,
  Award, Camera, Sparkles, Quote,
} from 'lucide-react'
import toast from 'react-hot-toast'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { getVendor, getVendorServices, getVendorReviews, toggleWishlist, getWishlist } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'
import api from '../../services/api'

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(Math.round(n || 0))
}
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS  = ['Mo','Tu','We','Th','Fr','Sa','Su']

/* ── Stars ───────────────────────────────────────────────── */
function Stars({ rating, size = 14 }) {
  const r = Math.round(rating || 0)
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} className={i < r ? 'text-[#F06138] fill-[#F06138]' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  )
}

/* ── Gallery ─────────────────────────────────────────────── */
function Gallery({ images }) {
  const [lightbox, setLightbox] = useState(false)
  const [active, setActive]     = useState(0)
  const imgs = images || []

  if (imgs.length === 0) {
    return (
      <div className="h-[55vh] flex flex-col items-center justify-center gap-3 rounded-b-3xl"
        style={{ background: 'linear-gradient(135deg, #FFF3EF 0%, #FEFDEB 100%)' }}>
        <Camera size={40} className="text-[#F06138] opacity-25" />
        <p className="font-lato text-sm text-[#9CA3AF]">No photos yet</p>
      </div>
    )
  }

  const main   = imgs[0]
  const thumbs = imgs.slice(1, 5)

  return (
    <>
      {/* Mosaic layout */}
      <div className="rounded-b-3xl overflow-hidden" style={{ display: 'grid', gridTemplateColumns: thumbs.length ? '2fr 1fr' : '1fr', gap: '3px', height: 'clamp(280px, 55vh, 520px)' }}>
        {/* Main image */}
        <button
          onClick={() => { setActive(0); setLightbox(true) }}
          className="relative overflow-hidden group"
          style={{ gridRow: '1 / 3' }}
        >
          <img src={main} alt="cover" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Thumbnails */}
        {thumbs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateRows: `repeat(${Math.min(thumbs.length, 2)}, 1fr)`, gap: '3px' }}>
            {thumbs.slice(0, 2).map((src, i) => {
              const isLast = i === 1 && imgs.length > 3
              return (
                <button key={i} onClick={() => { setActive(i + 1); setLightbox(true) }} className="relative overflow-hidden group">
                  <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500" />
                  {isLast && (
                    <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-1">
                      <ImageIcon size={20} className="text-white opacity-80" />
                      <span className="font-filson font-black text-white text-base">+{imgs.length - 3} more</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* View all strip */}
      {imgs.length > 3 && (
        <button
          onClick={() => { setActive(0); setLightbox(true) }}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl font-lato font-semibold text-sm transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', color: '#101828', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}
        >
          <Camera size={14} className="text-[#F06138]" /> View all {imgs.length} photos
        </button>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/96 flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >
            <button className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors" onClick={() => setLightbox(false)}>
              <X size={18} className="text-white" />
            </button>
            <button className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + imgs.length) % imgs.length) }}>
              <ChevronLeft size={22} className="text-white" />
            </button>
            <motion.img
              key={active}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              src={imgs[active]} alt="" className="max-w-5xl max-h-[88vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()} />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % imgs.length) }}>
              <ChevronRight size={22} className="text-white" />
            </button>
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-lato text-white/50 text-sm">{active + 1} / {imgs.length}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Availability Calendar ───────────────────────────────── */
function AvailabilityCalendar({ blockedDates = [], selectedDate, onSelectDate }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [view, setView] = useState(() => { const d = new Date(); d.setDate(1); return d })

  const year  = view.getFullYear()
  const month = view.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay() // 0=Sun
  const startOffset     = (firstDayOfMonth + 6) % 7        // shift so Mon=0
  const daysInMonth     = new Date(year, month + 1, 0).getDate()

  const blockedSet = new Set(
    blockedDates.map((d) => new Date(d).toDateString())
  )

  const canGoPrev = new Date(year, month, 1) > today // don't go before current month

  function cellState(dayNum) {
    const date = new Date(year, month, dayNum)
    if (date < today)                          return 'past'
    if (date.toDateString() === today.toDateString()) return 'today'
    if (blockedSet.has(date.toDateString()))   return 'blocked'
    if (selectedDate?.toDateString() === date.toDateString()) return 'selected'
    return 'available'
  }

  const CELL_STYLE = {
    past:      { bg: 'transparent', color: '#D1D5DB', cursor: 'default' },
    today:     { bg: 'transparent', color: '#F06138', cursor: 'pointer', ring: true },
    blocked:   { bg: '#FEE2E2',     color: '#EF4444', cursor: 'not-allowed' },
    selected:  { bg: '#F06138',     color: '#FDFAD6', cursor: 'pointer' },
    available: { bg: 'transparent', color: '#101828', cursor: 'pointer', hover: true },
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFEF5', border: '1px solid rgba(139,67,50,0.1)' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(139,67,50,0.08)' }}>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#F06138]" />
          <h3 className="font-lato font-bold text-[#101828] text-sm">Availability</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={!canGoPrev}
            onClick={() => setView(new Date(year, month - 1, 1))}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#FFF3EF] transition-colors disabled:opacity-30"
          >
            <ChevronLeft size={15} className="text-[#6A6A6A]" />
          </button>
          <span className="font-lato font-semibold text-[#101828] text-sm min-w-[130px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={() => setView(new Date(year, month + 1, 1))}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#FFF3EF] transition-colors"
          >
            <ChevronRight size={15} className="text-[#6A6A6A]" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center font-lato text-[11px] font-bold text-[#9CA3AF] py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {/* Offset empty cells */}
          {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} />)}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1
            const state  = cellState(dayNum)
            const style  = CELL_STYLE[state]
            const date   = new Date(year, month, dayNum)

            return (
              <button
                key={dayNum}
                disabled={state === 'past' || state === 'blocked'}
                onClick={() => {
                  if (state === 'today' || state === 'available' || state === 'selected') {
                    onSelectDate(state === 'selected' ? null : date)
                  }
                }}
                className="relative flex items-center justify-center rounded-xl h-9 font-lato text-sm font-medium transition-all"
                style={{
                  background: style.bg,
                  color: style.color,
                  cursor: style.cursor,
                  outline: style.ring ? `2px solid #F06138` : 'none',
                  outlineOffset: '-2px',
                }}
              >
                {/* Available hover effect */}
                {(state === 'available' || state === 'today') && (
                  <span
                    className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(240,97,56,0.08)' }}
                  />
                )}
                {/* Blocked X overlay */}
                {state === 'blocked' ? (
                  <span className="relative flex flex-col items-center leading-none">
                    <span className="text-[11px] font-bold line-through opacity-50">{dayNum}</span>
                  </span>
                ) : (
                  <span className="relative">{dayNum}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center flex-wrap gap-4 mt-4 pt-3" style={{ borderTop: '1px solid rgba(139,67,50,0.06)' }}>
          {[
            { color: '#F06138', label: 'Available', style: 'ring' },
            { color: '#EF4444', label: 'Unavailable', bg: '#FEE2E2' },
            { color: '#F06138', label: 'Selected', bg: '#F06138', textColor: '#FDFAD6' },
          ].map(({ color, label, bg, textColor, style: s }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                style={{ background: bg || 'transparent', color: textColor || color, outline: s === 'ring' ? `2px solid ${color}` : 'none', outlineOffset: s === 'ring' ? '-2px' : '0' }}
              >
                {label === 'Selected' ? '7' : label === 'Unavailable' ? '—' : '5'}
              </span>
              <span className="font-lato text-[11px] text-[#6A6A6A]">{label}</span>
            </div>
          ))}
        </div>

        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center justify-between px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(240,97,56,0.08)', border: '1px solid rgba(240,97,56,0.2)' }}
          >
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-[#F06138]" />
              <span className="font-lato text-sm font-semibold text-[#101828]">
                {selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <button onClick={() => onSelectDate(null)} className="text-[#6A6A6A] hover:text-[#F06138] transition-colors">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

/* ── Service card ────────────────────────────────────────── */
function ServiceCard({ svc, selected, onSelect, onBook }) {
  return (
    <motion.div
      layout
      onClick={() => onSelect(svc)}
      whileHover={{ scale: 1.01 }}
      className="flex gap-4 p-5 rounded-2xl cursor-pointer transition-all border-2 group"
      style={{
        background: selected ? '#FFF3EF' : '#FFFEF5',
        borderColor: selected ? '#F06138' : 'rgba(139,67,50,0.07)',
        boxShadow: selected ? '0 4px 20px rgba(240,97,56,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Thumbnail */}
      {svc.images?.length > 0 ? (
        <div className="w-[72px] h-[72px] shrink-0 rounded-xl overflow-hidden">
          <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ) : (
        <div className="w-[72px] h-[72px] shrink-0 rounded-xl flex items-center justify-center" style={{ background: selected ? 'rgba(240,97,56,0.1)' : '#FFF0EB' }}>
          <Sparkles size={20} className="text-[#F06138] opacity-50" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-lato font-bold text-[#101828] text-sm leading-snug">{svc.title}</h3>
          <p className="font-filson font-black text-[#8B4332] text-lg leading-none shrink-0">₹{fmt(svc.price)}</p>
        </div>
        <p className="font-lato text-[#6A6A6A] text-xs leading-relaxed line-clamp-2 mb-2.5">{svc.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {svc.duration && (
              <span className="flex items-center gap-1 text-[11px] font-lato text-[#6A6A6A] bg-white/80 px-2 py-0.5 rounded-full border border-black/5">
                <Clock size={10} /> {svc.duration}
              </span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onBook(svc) }}
            className="px-4 py-1.5 rounded-lg text-xs font-lato font-bold transition-all"
            style={selected
              ? { background: '#F06138', color: '#FDFAD6' }
              : { background: '#FFF0EB', color: '#F06138' }
            }
          >
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Review card ─────────────────────────────────────────── */
function ReviewCard({ r, i }) {
  const name = r.userId?.name || '—'
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.06 }}
      className="p-5 rounded-2xl relative"
      style={{ background: '#FFFEF5', border: '1px solid rgba(139,67,50,0.07)' }}
    >
      <Quote size={20} className="absolute top-4 right-4 text-[#F06138] opacity-10" />
      <div className="flex items-start gap-3">
        {r.userId?.avatar
          ? <img src={r.userId.avatar} alt={name} className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm" />
          : <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-filson font-black text-sm" style={{ background: 'linear-gradient(135deg, #F06138, #8B4332)', color: 'white' }}>{name.charAt(0).toUpperCase()}</div>
        }
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="font-lato font-bold text-[#101828] text-sm">{name}</p>
            <span className="font-lato text-[11px] text-[#9CA3AF]">{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
          </div>
          <Stars rating={r.rating} size={12} />
          <p className="font-lato text-[#364153] text-sm mt-2 leading-relaxed">{r.comment}</p>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Skeleton ─────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div>
      <div className="h-[55vh] bg-gray-100 animate-pulse rounded-b-3xl" />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 bg-gray-100 rounded-xl w-2/3 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
        <div className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function VendorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [selectedService, setSelectedService] = useState(null)
  const [reviewsOpen, setReviewsOpen]         = useState(false)
  const [wishlisted, setWishlisted]           = useState(false)
  const [messagingVendor, setMessagingVendor] = useState(false)
  const [selectedDate, setSelectedDate]       = useState(null)

  /* Sticky header visibility */
  const heroRef = useRef(null)
  const [stickyVisible, setStickyVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => setStickyVisible(!e.isIntersecting),
      { threshold: 0 }
    )
    if (heroRef.current) observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [])

  /* Queries */
  const { data: vendorData, isLoading: loadingVendor } = useQuery({
    queryKey: ['vendor', id], queryFn: () => getVendor(id), enabled: !!id,
  })
  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ['vendor-services', id], queryFn: () => getVendorServices(id), enabled: !!id,
  })
  const { data: reviewsData, isLoading: loadingReviews } = useQuery({
    queryKey: ['vendor-reviews', id], queryFn: () => getVendorReviews(id), enabled: !!id && reviewsOpen,
  })
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'], queryFn: getWishlist,
  })

  /* Sync wishlist */
  useEffect(() => {
    const list = wishlistData?.data?.wishlist || []
    setWishlisted(list.some((v) => v._id === id || v === id))
  }, [wishlistData, id])

  const wishlistMutation = useMutation({
    mutationFn: () => toggleWishlist(id),
    onSuccess: () => {
      const next = !wishlisted
      setWishlisted(next)
      toast.success(next ? 'Saved to wishlist' : 'Removed from wishlist')
      qc.invalidateQueries(['wishlist'])
    },
    onError: () => toast.error('Could not update wishlist.'),
  })

  /* Derived */
  const vendor       = vendorData?.data?.vendor || {}
  const services     = servicesData?.data?.services || []
  const reviews      = reviewsData?.data?.reviews || []
  const galleryImages = (vendor.portfolio || []).map((p) => p.url).filter(Boolean)
  const blockedDates  = vendor.blockedDates || []
  const minPrice      = services.length > 0 ? Math.min(...services.map((s) => s.price)) : null
  const active        = selectedService || services[0] || null

  function handleBook(svc) {
    if (!svc) return
    const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : undefined
    navigate(`/book/${id}/${svc._id}`, { state: { eventDate: dateStr } })
  }

  async function handleMessageVendor() {
    setMessagingVendor(true)
    try {
      const vendorUserId = vendor.userId?._id || vendor.userId
      if (!vendorUserId) { toast.error('Vendor contact not available.'); return }
      await api.post('/messages/send', {
        receiverId: vendorUserId,
        content: `Hi! I'm interested in your services. Could you tell me more?`,
      })
      navigate('/chat', { state: { userId: vendorUserId, vendorName: vendor.businessName } })
    } catch {
      toast.error('Could not open chat.')
    } finally {
      setMessagingVendor(false)
    }
  }

  if (loadingVendor) return (
    <div className="min-h-screen bg-[#FFFDFC]"><UserNavbar /><PageSkeleton /></div>
  )

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      {/* ── Sticky mini-header ──────────────────────────────── */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ y: -64, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -64, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3"
            style={{ background: 'rgba(255,253,252,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(139,67,50,0.1)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-[#FFF3EF] transition-colors">
                <ChevronLeft size={18} className="text-[#6A6A6A]" />
              </button>
              <div>
                <p className="font-lato font-bold text-[#101828] text-sm">{vendor.businessName}</p>
                <div className="flex items-center gap-1.5">
                  {vendor.rating > 0 && <><Star size={11} className="fill-[#F06138] text-[#F06138]" /><span className="font-lato text-xs text-[#6A6A6A]">{vendor.rating?.toFixed(1)}</span></>}
                  <span className="text-[#9CA3AF]">·</span>
                  <span className="font-lato text-xs text-[#6A6A6A]">{vendor.city}</span>
                </div>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => handleBook(active)}
              disabled={!active}
              className="px-5 py-2 rounded-xl font-lato font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
              style={{ background: '#F06138', color: '#FDFAD6' }}
            >
              {active ? `Book — ₹${fmt(active.price)}` : 'Book Now'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gallery hero ────────────────────────────────────── */}
      <div className="relative" ref={heroRef}>
        <Gallery images={galleryImages} />

        {/* Back + action buttons over gallery */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 pl-3 pr-4 py-2 rounded-xl font-lato text-sm font-semibold transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', color: '#101828', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => wishlistMutation.mutate()}
              disabled={wishlistMutation.isPending}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-60"
              style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
            >
              <Heart size={17} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-[#6A6A6A]'} />
            </button>
            <button
              onClick={() => navigator.share?.({ title: vendor.businessName, url: window.location.href })}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
            >
              <Share2 size={17} className="text-[#6A6A6A]" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ───────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Vendor header */}
            <div>
              {/* Badges */}
              <div className="flex items-center flex-wrap gap-2 mb-3">
                {vendor.status === 'approved' && (
                  <span className="flex items-center gap-1 text-[11px] font-lato font-bold px-2.5 py-1 rounded-full" style={{ background: '#DCFCE7', color: '#016630' }}>
                    <CheckCircle size={11} /> Verified
                  </span>
                )}
                <span className={`flex items-center gap-1 text-[11px] font-lato font-bold px-2.5 py-1 rounded-full`}
                  style={{ background: vendor.isAvailable ? '#DCFCE7' : '#F3F4F6', color: vendor.isAvailable ? '#016630' : '#6B7280' }}>
                  {vendor.isAvailable ? <Wifi size={10} /> : <WifiOff size={10} />}
                  {vendor.isAvailable ? 'Available now' : 'Currently busy'}
                </span>
              </div>

              <h1 className="font-filson font-black text-[#101828] leading-tight mb-1.5" style={{ fontSize: 'clamp(22px, 4vw, 36px)' }}>
                {vendor.businessName || '—'}
              </h1>

              <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5">
                <span className="font-lato text-[#F06138] text-sm font-semibold">
                  {vendor.category?.name || vendor.category}
                </span>
                <span className="flex items-center gap-1 font-lato text-sm text-[#6A6A6A]">
                  <MapPin size={13} /> {vendor.city}{vendor.state ? `, ${vendor.state}` : ''}
                </span>
                {vendor.rating > 0 && (
                  <span className="flex items-center gap-1 font-lato text-sm text-[#6A6A6A]">
                    <Star size={13} className="fill-[#F06138] text-[#F06138]" />
                    <span className="font-bold text-[#101828]">{vendor.rating?.toFixed(1)}</span>
                    <span>({vendor.totalReviews || 0} reviews)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Award,    val: `${vendor.totalBookings || 0}`, sub: 'Events done', color: '#F06138' },
                { icon: Users,    val: `${vendor.yearsInBusiness || 0}+`, sub: 'Years active', color: '#193CB8' },
                { icon: Star,     val: vendor.rating?.toFixed(1) || '—', sub: 'Avg. rating', color: '#016630' },
              ].map((s) => (
                <div key={s.sub}
                  className="flex flex-col items-center py-5 px-3 rounded-2xl text-center"
                  style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.08)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: s.color + '14' }}>
                    <s.icon size={17} style={{ color: s.color }} />
                  </div>
                  <p className="font-filson font-black text-[#101828] text-2xl leading-none mb-0.5">{s.val}</p>
                  <p className="font-lato text-[#9CA3AF] text-[11px]">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* About */}
            {vendor.description && (
              <div>
                <h2 className="font-lato font-bold text-[#101828] text-base mb-3">About</h2>
                <p className="font-lato text-[#364153] text-sm leading-[1.8]">{vendor.description}</p>
              </div>
            )}

            {/* Packages */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-lato font-bold text-[#101828] text-base">Packages & Pricing</h2>
                  {minPrice && <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">Starting from ₹{fmt(minPrice)}</p>}
                </div>
                {services.length > 0 && (
                  <span className="font-lato text-xs text-[#6A6A6A] bg-[#FEFDEB] px-2.5 py-1 rounded-full border border-[rgba(139,67,50,0.1)]">
                    {services.length} package{services.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {loadingServices ? (
                <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
              ) : services.length === 0 ? (
                <div className="py-10 text-center rounded-2xl" style={{ background: '#FFFEF5', border: '1px dashed rgba(139,67,50,0.15)' }}>
                  <p className="font-lato text-sm text-[#9CA3AF]">No packages listed yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((svc) => (
                    <ServiceCard key={svc._id} svc={svc} selected={active?._id === svc._id}
                      onSelect={setSelectedService} onBook={handleBook} />
                  ))}
                </div>
              )}
            </div>

            {/* ── AVAILABILITY CALENDAR ───────────────────────── */}
            <div>
              <h2 className="font-lato font-bold text-[#101828] text-base mb-4">Check Availability</h2>
              <AvailabilityCalendar
                blockedDates={blockedDates}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
              {!vendor.isAvailable && (
                <p className="mt-3 flex items-center gap-1.5 font-lato text-xs text-[#6B7280]">
                  <WifiOff size={12} /> This vendor is currently marked as busy. Contact them to confirm.
                </p>
              )}
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-lato font-bold text-[#101828] text-base">
                    Reviews {vendor.totalReviews > 0 && <span className="text-sm font-normal text-[#6A6A6A] ml-1">({vendor.totalReviews})</span>}
                  </h2>
                  {vendor.rating > 0 && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Stars rating={vendor.rating} size={12} />
                      <span className="font-lato text-xs text-[#6A6A6A]">{vendor.rating?.toFixed(1)} out of 5</span>
                    </div>
                  )}
                </div>
                {!reviewsOpen && vendor.totalReviews > 0 && (
                  <button onClick={() => setReviewsOpen(true)} className="font-lato text-sm text-[#F06138] font-semibold hover:underline">
                    Show all
                  </button>
                )}
              </div>

              {!reviewsOpen && (
                <button
                  onClick={() => setReviewsOpen(true)}
                  className="w-full py-4 rounded-2xl font-lato text-sm font-semibold transition-all hover:bg-[#FFF3EF] hover:border-[#F06138]"
                  style={{ border: '1.5px solid rgba(240,97,56,0.2)', color: '#F06138' }}
                >
                  {vendor.totalReviews > 0 ? `Read ${vendor.totalReviews} review${vendor.totalReviews > 1 ? 's' : ''}` : 'No reviews yet'}
                </button>
              )}

              {reviewsOpen && (
                <div className="space-y-3">
                  {loadingReviews && <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}</div>}
                  {!loadingReviews && reviews.length === 0 && (
                    <div className="py-8 text-center rounded-2xl" style={{ background: '#FFFEF5', border: '1px solid rgba(139,67,50,0.08)' }}>
                      <p className="font-lato text-sm text-[#9CA3AF]">No reviews yet — be the first to book!</p>
                    </div>
                  )}
                  {reviews.map((r, i) => <ReviewCard key={r._id} r={r} i={i} />)}
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT: STICKY BOOKING CARD ─────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-3">
              <div className="rounded-2xl overflow-hidden" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>

                {/* Price header */}
                <div className="p-5" style={{ borderBottom: '1px solid rgba(139,67,50,0.08)' }}>
                  {active ? (
                    <>
                      <p className="font-lato text-xs text-[#9CA3AF] mb-0.5">{selectedService ? 'Selected package' : 'Starting from'}</p>
                      <div className="flex items-baseline gap-1.5 mb-0.5">
                        <span className="font-filson font-black text-[#8B4332]" style={{ fontSize: 'clamp(28px, 4vw, 36px)' }}>₹{fmt(active.price)}</span>
                      </div>
                      <p className="font-lato text-xs text-[#6A6A6A] truncate">{active.title}</p>
                    </>
                  ) : (
                    <p className="font-lato text-sm text-[#6A6A6A]">Select a package below</p>
                  )}
                  {vendor.rating > 0 && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <Stars rating={vendor.rating} size={13} />
                      <span className="font-lato text-xs text-[#6A6A6A]">{vendor.rating?.toFixed(1)} ({vendor.totalReviews})</span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  {/* Package selector pills */}
                  {services.length > 1 && (
                    <div>
                      <p className="font-lato text-xs font-semibold text-[#364153] mb-2">Choose package</p>
                      <div className="flex flex-wrap gap-1.5">
                        {services.map((svc) => (
                          <button
                            key={svc._id}
                            onClick={() => setSelectedService(svc)}
                            className="px-2.5 py-1 rounded-lg text-xs font-lato font-semibold transition-all border"
                            style={active?._id === svc._id
                              ? { background: '#F06138', color: '#FDFAD6', borderColor: '#F06138' }
                              : { background: 'white', color: '#6A6A6A', borderColor: 'rgba(139,67,50,0.2)' }
                            }
                          >
                            ₹{fmt(svc.price)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected date from calendar */}
                  {selectedDate && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(240,97,56,0.08)', border: '1px solid rgba(240,97,56,0.18)' }}>
                      <Calendar size={13} className="text-[#F06138] shrink-0" />
                      <span className="font-lato text-xs font-semibold text-[#101828] flex-1">
                        {selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <button onClick={() => setSelectedDate(null)}><X size={13} className="text-[#6A6A6A] hover:text-[#F06138]" /></button>
                    </div>
                  )}

                  {/* Book CTA */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBook(active)}
                    disabled={!active}
                    className="w-full py-3.5 rounded-xl font-lato font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #F06138 0%, #d9461f 100%)', color: '#FDFAD6', boxShadow: '0 4px 14px rgba(240,97,56,0.35)' }}
                  >
                    {active ? `Book — ₹${fmt(active.price)}` : 'Select a package'}
                  </motion.button>

                  {/* Message vendor */}
                  <button
                    onClick={handleMessageVendor}
                    disabled={messagingVendor}
                    className="w-full py-3 rounded-xl font-lato font-semibold text-sm border-2 transition-all hover:bg-[#FFF3EF] flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ borderColor: 'rgba(240,97,56,0.3)', color: '#F06138' }}
                  >
                    {messagingVendor
                      ? <><Loader2 size={14} className="animate-spin" /> Opening chat…</>
                      : <><MessageSquare size={14} /> Message Vendor</>
                    }
                  </button>

                  {/* Contact */}
                  {(vendor.phone || vendor.userId?.email) && (
                    <div className="space-y-2 pt-3" style={{ borderTop: '1px solid rgba(139,67,50,0.08)' }}>
                      {vendor.phone && (
                        <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 text-sm font-lato text-[#364153] hover:text-[#F06138] transition-colors">
                          <Phone size={13} className="text-[#F06138] shrink-0" /> {vendor.phone}
                        </a>
                      )}
                      {vendor.userId?.email && (
                        <a href={`mailto:${vendor.userId.email}`} className="flex items-center gap-2 text-sm font-lato text-[#364153] hover:text-[#F06138] transition-colors truncate">
                          <Mail size={13} className="text-[#F06138] shrink-0" /> {vendor.userId.email}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Trust */}
              <div className="flex items-center justify-center gap-4 px-2">
                {['Verified vendor', 'Secure booking', 'Free to enquire'].map((t) => (
                  <div key={t} className="flex items-center gap-1">
                    <CheckCircle size={10} className="text-[#016630]" />
                    <span className="font-lato text-[10px] text-[#9CA3AF]">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </motion.div>
  )
}

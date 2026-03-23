import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  MapPin, Star, ChevronLeft, ChevronRight, Heart, Share2,
  CheckCircle, Calendar, Clock, MessageSquare, IndianRupee,
  Phone, Mail, X, Wifi, WifiOff, Users, ImageIcon,
} from 'lucide-react'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import { getVendor, getVendorServices, getVendorReviews } from '../../services/vendors'
import { useAuthStore } from '../../stores/authStore'
import { pageVariants } from '../../animations/pageTransitions'

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(Math.round(n || 0))
}

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
  const [active, setActive] = useState(0)
  const imgs = images || []

  if (imgs.length === 0) {
    return (
      <div className="h-64 lg:h-80 rounded-2xl flex flex-col items-center justify-center gap-2" style={{ background: '#FFF3EF' }}>
        <ImageIcon size={32} className="text-[#F06138] opacity-30" />
        <p className="font-lato text-sm text-[#9CA3AF]">No photos added yet</p>
      </div>
    )
  }

  const main = imgs[0]
  const thumbs = imgs.slice(1, 5)

  return (
    <>
      <div className="rounded-2xl overflow-hidden" style={{ display: 'grid', gridTemplateColumns: thumbs.length > 0 ? '2fr 1fr' : '1fr', gap: '6px', height: '360px' }}>
        {/* Main image */}
        <button
          onClick={() => { setActive(0); setLightbox(true) }}
          className="relative overflow-hidden hover:brightness-95 transition-all"
          style={{ gridRow: '1 / 3' }}
        >
          <img src={main} alt="Main" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        </button>

        {/* Thumbnails */}
        <div style={{ display: 'grid', gridTemplateRows: `repeat(${Math.min(thumbs.length, 2)}, 1fr)`, gap: '6px' }}>
          {thumbs.slice(0, 2).map((src, i) => {
            const isLast = i === 1 && imgs.length > 4
            return (
              <button
                key={i}
                onClick={() => { setActive(i + 1); setLightbox(true) }}
                className="relative overflow-hidden hover:brightness-95 transition-all"
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
                {isLast && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="font-lato font-bold text-white text-lg">+{imgs.length - 4} more</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >
            <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" onClick={() => setLightbox(false)}>
              <X size={20} className="text-white" />
            </button>
            <button className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors" onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + imgs.length) % imgs.length) }}>
              <ChevronLeft size={24} className="text-white" />
            </button>
            <img src={imgs[active]} alt="" className="max-w-5xl max-h-[85vh] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors" onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % imgs.length) }}>
              <ChevronRight size={24} className="text-white" />
            </button>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-lato text-white/60 text-sm">{active + 1} / {imgs.length}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Service card ────────────────────────────────────────── */
function ServiceCard({ svc, selected, onSelect, onBook }) {
  return (
    <motion.div
      layout
      onClick={() => onSelect(svc)}
      className="flex gap-4 p-5 rounded-2xl cursor-pointer transition-all border-2"
      style={{
        background: selected ? '#FFF3EF' : '#FFFEF5',
        borderColor: selected ? '#F06138' : 'rgba(139,67,50,0.08)',
        boxShadow: selected ? '0 0 0 1px rgba(240,97,56,0.2)' : 'none',
      }}
    >
      {/* Thumbnail */}
      {svc.images?.length > 0 ? (
        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden">
          <img src={svc.images[0]} alt={svc.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-20 h-20 shrink-0 rounded-xl flex items-center justify-center" style={{ background: '#FFF0EB' }}>
          <IndianRupee size={22} className="text-[#F06138] opacity-50" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-lato font-bold text-[#101828] text-sm leading-snug">{svc.title}</h3>
          <div className="shrink-0 text-right">
            <p className="font-filson font-black text-[#8B4332] text-xl leading-none">₹{fmt(svc.price)}</p>
          </div>
        </div>
        <p className="font-lato text-[#6A6A6A] text-xs mt-1 leading-relaxed line-clamp-2">{svc.description}</p>
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-3">
            {svc.duration && (
              <span className="flex items-center gap-1 text-xs font-lato text-[#6A6A6A]">
                <Clock size={11} /> {svc.duration}
              </span>
            )}
            {svc.minAdvancePercent > 0 && (
              <span className="text-xs font-lato text-[#6A6A6A]">
                {svc.minAdvancePercent}% advance
              </span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={(e) => { e.stopPropagation(); onBook(svc) }}
            className="px-4 py-1.5 rounded-lg text-xs font-lato font-bold transition-all hover:opacity-90"
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
function ReviewCard({ r }) {
  const name = r.userId?.name || '—'
  return (
    <div className="p-5 rounded-2xl" style={{ background: '#FFFEF5', border: '1px solid rgba(139,67,50,0.07)' }}>
      <div className="flex items-start gap-3">
        {r.userId?.avatar
          ? <img src={r.userId.avatar} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" />
          : <div className="w-10 h-10 rounded-full bg-[#F06138] text-white text-sm font-bold flex items-center justify-center shrink-0">{name.charAt(0).toUpperCase()}</div>
        }
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="font-lato font-semibold text-[#101828] text-sm">{name}</p>
            <span className="font-lato text-xs text-[#9CA3AF]">{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
          </div>
          <Stars rating={r.rating} size={12} />
          <p className="font-lato text-[#364153] text-sm mt-2 leading-relaxed">{r.comment}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Skeleton ─────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6">
      <div className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 bg-gray-100 rounded-lg w-2/3 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
          <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
        <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function VendorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [selectedService, setSelectedService] = useState(null)
  const [reviewsOpen, setReviewsOpen] = useState(false)

  const { data: vendorData, isLoading: loadingVendor } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => getVendor(id),
    enabled: !!id,
  })
  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ['vendor-services', id],
    queryFn: () => getVendorServices(id),
    enabled: !!id,
  })
  const { data: reviewsData, isLoading: loadingReviews } = useQuery({
    queryKey: ['vendor-reviews', id],
    queryFn: () => getVendorReviews(id),
    enabled: !!id && reviewsOpen,
  })

  const vendor = vendorData?.data?.vendor || {}
  const services = servicesData?.data?.services || []
  const reviews = reviewsData?.data?.reviews || []
  const galleryImages = (vendor.portfolio || []).map((p) => p.url).filter(Boolean)
  const minPrice = services.length > 0 ? Math.min(...services.map((s) => s.price)) : null
  const active = selectedService || services[0] || null

  function handleBook(svc) {
    if (!svc) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/vendor/${id}` } })
      return
    }
    navigate(`/book/${id}/${svc._id}`)
  }

  if (loadingVendor) {
    return (
      <div className="min-h-screen bg-[#FFFDFC]">
        <Navbar />
        <PageSkeleton />
      </div>
    )
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <Navbar />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 font-lato text-sm text-[#6A6A6A] hover:text-[#F06138] mb-5 transition-colors"
        >
          <ChevronLeft size={15} /> Back to results
        </button>

        {/* Gallery */}
        <div className="mb-6">
          <Gallery images={galleryImages} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left column ───────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Vendor header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h1 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(20px,3vw,30px)' }}>
                    {vendor.businessName || '—'}
                  </h1>
                  {vendor.status === 'approved' && (
                    <span className="flex items-center gap-1 text-[11px] font-lato font-semibold px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#016630' }}>
                      <CheckCircle size={11} /> Verified
                    </span>
                  )}
                  <span className={`flex items-center gap-1 text-[11px] font-lato font-semibold px-2 py-0.5 rounded-full ${vendor.isAvailable ? 'text-emerald-700' : 'text-gray-500'}`} style={{ background: vendor.isAvailable ? '#DCFCE7' : '#F3F4F6' }}>
                    {vendor.isAvailable ? <Wifi size={10} /> : <WifiOff size={10} />}
                    {vendor.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>

                <p className="font-lato text-[#F06138] text-sm font-semibold mb-1">
                  {vendor.category?.name || vendor.category}
                </p>

                <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1.5 font-lato text-sm text-[#6A6A6A]">
                    <MapPin size={13} /> {vendor.city}{vendor.state ? `, ${vendor.state}` : ''}
                  </span>
                  {(vendor.rating > 0) && (
                    <span className="flex items-center gap-1.5 font-lato text-sm text-[#6A6A6A]">
                      <Star size={13} className="text-[#F06138] fill-[#F06138]" />
                      <span className="font-semibold text-[#101828]">{vendor.rating?.toFixed(1)}</span>
                      <span>({vendor.totalReviews || 0} reviews)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    if (navigator.share) navigator.share({ title: vendor.businessName, url: window.location.href })
                  }}
                  className="p-2.5 rounded-xl border border-[rgba(139,67,50,0.15)] hover:bg-[#FFF3EF] transition-colors"
                >
                  <Share2 size={17} className="text-[#6A6A6A]" />
                </button>
              </div>
            </div>

            {/* Trust stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Calendar, val: `${vendor.totalBookings || 0}`, label: 'Bookings done' },
                { icon: Users, val: `${vendor.yearsInBusiness || 0}+`, label: 'Years active' },
                { icon: Star, val: vendor.rating?.toFixed(1) || '—', label: 'Avg. rating' },
              ].map((s) => (
                <div key={s.label} className="text-center py-4 px-3 rounded-2xl" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.08)' }}>
                  <s.icon size={17} className="text-[#F06138] mx-auto mb-1.5" />
                  <p className="font-filson font-black text-[#101828] text-xl leading-none mb-0.5">{s.val}</p>
                  <p className="font-lato text-[#9CA3AF] text-[11px]">{s.label}</p>
                </div>
              ))}
            </div>

            {/* About */}
            {vendor.description && (
              <div>
                <h2 className="font-lato font-bold text-[#101828] text-base mb-2">About</h2>
                <p className="font-lato text-[#364153] text-sm leading-relaxed">{vendor.description}</p>
              </div>
            )}

            {/* Services */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-lato font-bold text-[#101828] text-base">Packages & Pricing</h2>
                  {minPrice && (
                    <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">Starting from ₹{fmt(minPrice)}</p>
                  )}
                </div>
                {services.length > 0 && (
                  <span className="font-lato text-xs text-[#6A6A6A]">{services.length} package{services.length !== 1 ? 's' : ''}</span>
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
                    <ServiceCard
                      key={svc._id}
                      svc={svc}
                      selected={active?._id === svc._id}
                      onSelect={setSelectedService}
                      onBook={handleBook}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-lato font-bold text-[#101828] text-base">
                    Reviews
                    {vendor.totalReviews > 0 && (
                      <span className="ml-2 text-sm font-normal text-[#6A6A6A]">({vendor.totalReviews})</span>
                    )}
                  </h2>
                  {vendor.rating > 0 && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Stars rating={vendor.rating} size={13} />
                      <span className="font-lato text-xs text-[#6A6A6A]">{vendor.rating?.toFixed(1)} out of 5</span>
                    </div>
                  )}
                </div>
                {!reviewsOpen && vendor.totalReviews > 0 && (
                  <button
                    onClick={() => setReviewsOpen(true)}
                    className="font-lato text-sm text-[#F06138] font-semibold hover:underline"
                  >
                    Show all
                  </button>
                )}
              </div>

              {!reviewsOpen && !loadingReviews && (
                <button
                  onClick={() => setReviewsOpen(true)}
                  className="w-full py-4 rounded-2xl font-lato text-sm font-semibold transition-colors hover:bg-[#FFF3EF]"
                  style={{ border: '1.5px solid rgba(240,97,56,0.25)', color: '#F06138' }}
                >
                  {vendor.totalReviews > 0 ? `See ${vendor.totalReviews} review${vendor.totalReviews > 1 ? 's' : ''}` : 'No reviews yet'}
                </button>
              )}

              {reviewsOpen && (
                <div className="space-y-3">
                  {loadingReviews && <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>}
                  {!loadingReviews && reviews.length === 0 && (
                    <div className="py-8 text-center rounded-2xl" style={{ background: '#FFFEF5', border: '1px solid rgba(139,67,50,0.08)' }}>
                      <p className="font-lato text-sm text-[#9CA3AF]">No reviews yet</p>
                    </div>
                  )}
                  {reviews.map((r) => <ReviewCard key={r._id} r={r} />)}
                </div>
              )}
            </div>

          </div>

          {/* ── Right: sticky booking card ─────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-3">
              <div className="rounded-2xl p-5" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

                {/* Price */}
                {active ? (
                  <>
                    <p className="font-lato text-xs text-[#6A6A6A] mb-0.5">
                      {selectedService ? 'Selected package' : 'Starting from'}
                    </p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="font-filson font-black text-[#8B4332] text-3xl">₹{fmt(active.price)}</span>
                    </div>
                    <p className="font-lato text-xs text-[#6A6A6A] mb-3 truncate">{active.title}</p>
                  </>
                ) : (
                  <p className="font-lato text-sm text-[#6A6A6A] mb-3">Choose a package below</p>
                )}

                {/* Rating */}
                {vendor.rating > 0 && (
                  <div className="flex items-center gap-1.5 mb-4">
                    <Stars rating={vendor.rating} size={13} />
                    <span className="font-lato text-xs text-[#6A6A6A]">{vendor.rating?.toFixed(1)} ({vendor.totalReviews})</span>
                  </div>
                )}

                {/* Service picker pills */}
                {services.length > 1 && (
                  <div className="mb-4">
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

                {/* Book button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBook(active)}
                  disabled={!active}
                  className="w-full py-3.5 rounded-xl font-lato font-bold text-sm transition-opacity hover:opacity-90 mb-2.5 disabled:opacity-40"
                  style={{ background: '#F06138', color: '#FDFAD6' }}
                >
                  {active ? `Book — ₹${fmt(active.price)}` : 'Select a package'}
                </motion.button>

                {/* Message */}
                <button
                  onClick={() => navigate('/login', { state: { from: `/vendors/${id}` } })}
                  className="w-full py-3 rounded-xl font-lato font-semibold text-sm border-2 transition-colors hover:bg-[#FFF3EF] flex items-center justify-center gap-2"
                  style={{ borderColor: 'rgba(240,97,56,0.35)', color: '#F06138' }}
                >
                  <MessageSquare size={15} /> Message Vendor
                </button>

                {/* Contact info */}
                {(vendor.phone || vendor.userId?.email) && (
                  <div className="mt-4 pt-4 border-t border-black/5 space-y-2.5">
                    {vendor.phone && (
                      <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 text-sm font-lato text-[#364153] hover:text-[#F06138] transition-colors">
                        <Phone size={14} className="text-[#F06138] shrink-0" /> {vendor.phone}
                      </a>
                    )}
                    {vendor.userId?.email && (
                      <a href={`mailto:${vendor.userId.email}`} className="flex items-center gap-2 text-sm font-lato text-[#364153] hover:text-[#F06138] transition-colors">
                        <Mail size={14} className="text-[#F06138] shrink-0" /> {vendor.userId.email}
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Trust note */}
              <p className="text-center font-lato text-[11px] text-[#9CA3AF] leading-relaxed px-2">
                Secure booking · Free cancellation policy applies · Verified vendor
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}

import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  MapPin, Star, Phone, Mail, ChevronLeft, ChevronRight,
  Heart, Share2, CheckCircle, Calendar, IndianRupee,
  MessageSquare, Clock,
} from 'lucide-react'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import Skeleton from '../../components/shared/Skeleton'
import { getVendor, getVendorServices, getVendorReviews } from '../../services/vendors'
import { useAuthStore } from '../../stores/authStore'
import { pageVariants } from '../../animations/pageTransitions'

/* ─── Mock data (fallback) ───────────────────────────────── */
const MOCK_VENDOR = {
  _id: '1',
  businessName: 'Royal Events & Décor',
  category: 'Wedding Decoration',
  city: 'Mumbai',
  state: 'Maharashtra',
  bio: 'We are a premium wedding decoration company with over 10 years of experience creating magical moments. Our team of expert decorators transforms every venue into a stunning space tailored to your dream vision.',
  rating: 4.9,
  totalReviews: 128,
  yearsOfExperience: 10,
  eventsCompleted: 450,
  isVerified: true,
  phone: '+91 98765 43210',
  email: 'royal.events@example.com',
  gallery: [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80',
  ],
}

const MOCK_SERVICES = [
  { _id: 's1', name: 'Basic Wedding Package', price: 45000, description: 'Full hall decoration with flowers, drapes, and lighting for up to 200 guests.', duration: '1 day' },
  { _id: 's2', name: 'Premium Wedding Package', price: 95000, description: 'Luxury decoration with floral arch, stage setup, entrance decor, and ambient lighting.', duration: '2 days' },
  { _id: 's3', name: 'Birthday Decoration', price: 8000, description: 'Balloon art, cake table setup, photo booth backdrop, and themed props.', duration: 'Half day' },
  { _id: 's4', name: 'Corporate Event Setup', price: 35000, description: 'Professional stage, backdrop, banners, table centerpieces, and branding installations.', duration: '1 day' },
]

const MOCK_REVIEWS = [
  { _id: 'r1', user: { name: 'Priya Sharma', avatar: 'https://i.pravatar.cc/60?img=47' }, rating: 5, comment: 'Absolutely stunning work! Every detail was perfect for our wedding.', createdAt: '2025-01-15' },
  { _id: 'r2', user: { name: 'Amit Verma', avatar: 'https://i.pravatar.cc/60?img=12' }, rating: 5, comment: 'Professional team, on time, and the venue looked magical. Highly recommended!', createdAt: '2024-12-20' },
  { _id: 'r3', user: { name: 'Sneha Kapoor', avatar: 'https://i.pravatar.cc/60?img=44' }, rating: 4, comment: 'Great work overall. The floral decorations were exactly what we envisioned.', createdAt: '2024-11-10' },
]

/* ─── Star display ───────────────────────────────────────── */
function Stars({ rating, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? 'text-[#F06138] fill-[#F06138]' : 'text-gray-300'}
        />
      ))}
    </div>
  )
}

/* ─── Gallery lightbox ───────────────────────────────────── */
function Gallery({ images }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {images.slice(0, 6).map((src, i) => (
          <motion.button
            key={i}
            onClick={() => { setActive(i); setLightbox(true) }}
            whileHover={{ scale: 1.02 }}
            className={`relative overflow-hidden rounded-xl ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
            style={{ height: i === 0 ? 300 : 145 }}
          >
            <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
            {i === 5 && images.length > 6 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                <span className="text-white font-lato font-bold text-lg">+{images.length - 6}</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + images.length) % images.length) }}
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <img
              src={images[active]}
              alt="Gallery"
              className="max-w-4xl max-h-[80vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % images.length) }}
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── Page ───────────────────────────────────────────────── */
export default function VendorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [wishlisted, setWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('services')

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
    enabled: !!id && activeTab === 'reviews',
  })

  const vendor = vendorData?.data?.vendor || MOCK_VENDOR
  const services = servicesData?.data?.services || MOCK_SERVICES
  const reviews = reviewsData?.data?.reviews || MOCK_REVIEWS

  function handleBook(serviceId) {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/book/${id}/${serviceId}` } })
      return
    }
    navigate(`/book/${id}/${serviceId}`)
  }

  if (loadingVendor) {
    return (
      <div className="min-h-screen bg-[#FFFDFC]">
        <Navbar />
        <div className="max-w-[1280px] mx-auto px-6 py-10 space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-8 w-1/3 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-[#FFFDFC]"
    >
      <Navbar />

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 font-lato text-sm text-[#6A6A6A] hover:text-[#F06138] mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: main info ────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Gallery */}
            <Gallery images={vendor.gallery || [vendor.coverImage]} />

            {/* Vendor header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(22px,3vw,32px)' }}>
                    {vendor.businessName}
                  </h1>
                  {vendor.isVerified && (
                    <span className="flex items-center gap-1 text-xs font-lato font-semibold px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#016630' }}>
                      <CheckCircle size={12} /> Verified
                    </span>
                  )}
                </div>
                <p className="font-lato text-[#6A6A6A] text-sm">{vendor.category}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={14} className="text-[#6A6A6A]" />
                  <span className="font-lato text-sm text-[#6A6A6A]">{vendor.city}, {vendor.state}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWishlisted((w) => !w)}
                  className="p-2.5 rounded-xl border border-[rgba(139,67,50,0.15)] hover:bg-[#FFF3EF] transition-colors"
                >
                  <Heart size={18} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-[#6A6A6A]'} />
                </button>
                <button className="p-2.5 rounded-xl border border-[rgba(139,67,50,0.15)] hover:bg-[#FFF3EF] transition-colors">
                  <Share2 size={18} className="text-[#6A6A6A]" />
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Star, val: `${vendor.rating}★`, label: `${vendor.totalReviews} Reviews` },
                { icon: Calendar, val: `${vendor.eventsCompleted}+`, label: 'Events Done' },
                { icon: Clock, val: `${vendor.yearsOfExperience}+`, label: 'Years Exp.' },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="text-center p-4 rounded-xl"
                    style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}
                  >
                    <Icon size={18} className="text-[#F06138] mx-auto mb-1" />
                    <p className="font-filson font-bold text-[#101828] text-lg">{stat.val}</p>
                    <p className="font-lato text-[#6A6A6A] text-xs">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            {/* About */}
            <div>
              <h2 className="font-lato font-bold text-[#101828] text-base mb-3">About</h2>
              <p className="font-lato text-[#364153] text-sm leading-relaxed">{vendor.bio}</p>
            </div>

            {/* Tabs */}
            <div>
              <div className="flex gap-1 border-b border-black/5 mb-6">
                {['services', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-5 py-2.5 font-lato font-medium text-sm capitalize border-b-2 transition-colors"
                    style={
                      activeTab === tab
                        ? { borderColor: '#F06138', color: '#F06138' }
                        : { borderColor: 'transparent', color: '#6A6A6A' }
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Services tab */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  {(loadingServices ? [] : services).map((svc) => (
                    <motion.div
                      key={svc._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start justify-between gap-4 p-5 rounded-2xl"
                      style={{ background: '#FFFEF5', border: '1px solid rgba(139,67,50,0.08)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-lato font-semibold text-[#101828] text-sm">{svc.name}</h3>
                        <p className="font-lato text-[#6A6A6A] text-xs mt-1 leading-relaxed">{svc.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs font-lato text-[#6A6A6A]">
                            <Clock size={12} /> {svc.duration}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-filson font-bold text-[#8B4332] text-lg">
                          ₹{new Intl.NumberFormat('en-IN').format(svc.price)}
                        </p>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleBook(svc._id)}
                          className="mt-2 px-4 py-2 rounded-lg text-xs font-lato font-semibold transition-colors hover:opacity-90"
                          style={{ background: '#F06138', color: '#FDFAD6' }}
                        >
                          Book Now
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Reviews tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div
                      key={r._id}
                      className="p-5 rounded-2xl"
                      style={{ background: '#FFFEF5', border: '1px solid rgba(139,67,50,0.08)' }}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={r.user?.avatar || `https://i.pravatar.cc/40?u=${r._id}`}
                          alt={r.user?.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-lato font-semibold text-[#101828] text-sm">{r.user?.name}</p>
                            <span className="font-lato text-xs text-[#6A6A6A]">
                              {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <Stars rating={r.rating} size={13} />
                          <p className="font-lato text-[#364153] text-sm mt-2 leading-relaxed">{r.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: sticky CTA card ──────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div
                className="rounded-2xl p-6"
                style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.12)' }}
              >
                <p className="font-lato text-[#6A6A6A] text-xs mb-1">Starting from</p>
                <p className="font-filson font-black text-[#8B4332] text-3xl mb-1">
                  ₹{new Intl.NumberFormat('en-IN').format(services[0]?.price || 8000)}
                </p>
                <div className="flex items-center gap-1.5 mb-5">
                  <Stars rating={vendor.rating} size={14} />
                  <span className="font-lato text-sm text-[#6A6A6A]">({vendor.totalReviews} reviews)</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBook(services[0]?._id)}
                  className="w-full py-3.5 rounded-xl font-lato font-semibold text-sm transition-colors hover:opacity-90 mb-3"
                  style={{ background: '#F06138', color: '#FDFAD6' }}
                >
                  Book Now
                </motion.button>

                <Link
                  to={isAuthenticated ? `/chat?vendorId=${id}` : '/login'}
                  className="w-full py-3 rounded-xl font-lato font-semibold text-sm border border-[#F06138] text-[#F06138] hover:bg-[#FFF3EF] transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} /> Message Vendor
                </Link>

                <div className="mt-5 pt-5 border-t border-black/5 space-y-3">
                  {vendor.phone && (
                    <a
                      href={`tel:${vendor.phone}`}
                      className="flex items-center gap-3 text-sm font-lato text-[#364153] hover:text-[#F06138] transition-colors"
                    >
                      <Phone size={16} className="text-[#F06138]" /> {vendor.phone}
                    </a>
                  )}
                  {vendor.email && (
                    <a
                      href={`mailto:${vendor.email}`}
                      className="flex items-center gap-3 text-sm font-lato text-[#364153] hover:text-[#F06138] transition-colors"
                    >
                      <Mail size={16} className="text-[#F06138]" /> {vendor.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}

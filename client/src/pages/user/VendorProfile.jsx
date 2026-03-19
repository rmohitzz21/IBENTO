// Authenticated user's detailed vendor view — same data as public VendorDetail
// but uses UserNavbar, shows wishlist toggle, and routes to /book/:vendorId/:serviceId
import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MapPin, Star, ChevronLeft, ChevronRight, Heart, Share2,
  CheckCircle, Calendar, Clock, MessageSquare,
} from 'lucide-react'
import toast from 'react-hot-toast'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { getVendor, getVendorServices, getVendorReviews, toggleWishlist } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'

const MOCK_VENDOR = { _id: '1', businessName: 'Royal Events & Décor', category: 'Wedding Decoration', city: 'Mumbai', state: 'Maharashtra', bio: 'Premium wedding decoration with 10+ years experience creating magical moments for your special day.', rating: 4.9, totalReviews: 128, yearsOfExperience: 10, eventsCompleted: 450, isVerified: true, gallery: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80','https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80','https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80','https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80'] }
const MOCK_SERVICES = [
  { _id: 's1', name: 'Basic Wedding Package', price: 45000, description: 'Full hall decoration with flowers, drapes, and lighting for up to 200 guests.', duration: '1 day' },
  { _id: 's2', name: 'Premium Wedding Package', price: 95000, description: 'Luxury decoration with floral arch, stage setup, entrance decor, and ambient lighting.', duration: '2 days' },
  { _id: 's3', name: 'Birthday Decoration', price: 8000, description: 'Balloon art, cake table setup, photo booth backdrop, and themed props.', duration: 'Half day' },
]
const MOCK_REVIEWS = [
  { _id: 'r1', user: { name: 'Priya S.', avatar: 'https://i.pravatar.cc/60?img=47' }, rating: 5, comment: 'Absolutely stunning work! Every detail was perfect.', createdAt: '2025-01-15' },
  { _id: 'r2', user: { name: 'Amit V.', avatar: 'https://i.pravatar.cc/60?img=12' }, rating: 5, comment: 'Professional and punctual. The venue looked magical.', createdAt: '2024-12-20' },
]

function Stars({ rating, size = 15 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} className={i < Math.round(rating) ? 'text-[#F06138] fill-[#F06138]' : 'text-gray-300'} />
      ))}
    </div>
  )
}

function Gallery({ images }) {
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const imgs = images || []
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {imgs.slice(0, 4).map((src, i) => (
          <button key={i} onClick={() => { setActive(i); setOpen(true) }} className={`relative overflow-hidden rounded-xl ${i === 0 ? 'col-span-2 row-span-2' : ''}`} style={{ height: i === 0 ? 280 : 135 }}>
            <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </button>
        ))}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setOpen(false)}>
            <button className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setActive(a => (a - 1 + imgs.length) % imgs.length) }}><ChevronLeft size={24} className="text-white" /></button>
            <img src={imgs[active]} alt="" className="max-w-4xl max-h-[80vh] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setActive(a => (a + 1) % imgs.length) }}><ChevronRight size={24} className="text-white" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function VendorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('services')
  const [wishlisted, setWishlisted] = useState(false)
  const qc = useQueryClient()

  const { data: vData } = useQuery({ queryKey: ['vendor', id], queryFn: () => getVendor(id), enabled: !!id })
  const { data: sData } = useQuery({ queryKey: ['vendor-services', id], queryFn: () => getVendorServices(id), enabled: !!id })
  const { data: rData } = useQuery({ queryKey: ['vendor-reviews', id], queryFn: () => getVendorReviews(id), enabled: !!id && activeTab === 'reviews' })

  const wishlistMutation = useMutation({
    mutationFn: () => toggleWishlist(id),
    onSuccess: () => {
      setWishlisted(w => !w)
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
    },
  })

  const vendor = vData?.data?.vendor || MOCK_VENDOR
  const services = sData?.data?.services || MOCK_SERVICES
  const reviews = rData?.data?.reviews || MOCK_REVIEWS

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 font-lato text-sm text-[#6A6A6A] hover:text-[#F06138] mb-6 transition-colors">
          <ChevronLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <Gallery images={vendor.gallery} />

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(20px,3vw,30px)' }}>{vendor.businessName}</h1>
                  {vendor.isVerified && <span className="flex items-center gap-1 text-xs font-lato font-semibold px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#016630' }}><CheckCircle size={11} /> Verified</span>}
                </div>
                <p className="font-lato text-[#6A6A6A] text-sm">{vendor.category}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={13} className="text-[#6A6A6A]" />
                  <span className="font-lato text-sm text-[#6A6A6A]">{vendor.city}, {vendor.state}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => wishlistMutation.mutate()} className="p-2.5 rounded-xl border border-[rgba(139,67,50,0.15)] hover:bg-[#FFF3EF] transition-colors">
                  <Heart size={18} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-[#6A6A6A]'} />
                </button>
                <button className="p-2.5 rounded-xl border border-[rgba(139,67,50,0.15)] hover:bg-[#FFF3EF] transition-colors">
                  <Share2 size={18} className="text-[#6A6A6A]" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Star,     val: `${vendor.rating}★`, label: `${vendor.totalReviews} Reviews` },
                { icon: Calendar, val: `${vendor.eventsCompleted}+`, label: 'Events Done' },
                { icon: Clock,    val: `${vendor.yearsOfExperience}+`, label: 'Years Exp.' },
              ].map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="text-center p-4 rounded-xl" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
                    <Icon size={18} className="text-[#F06138] mx-auto mb-1" />
                    <p className="font-filson font-bold text-[#101828] text-lg">{s.val}</p>
                    <p className="font-lato text-[#6A6A6A] text-xs">{s.label}</p>
                  </div>
                )
              })}
            </div>

            <p className="font-lato text-[#364153] text-sm leading-relaxed">{vendor.bio}</p>

            {/* Tabs */}
            <div>
              <div className="flex gap-1 border-b border-black/5 mb-5">
                {['services', 'reviews'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className="px-5 py-2.5 font-lato font-medium text-sm capitalize border-b-2 transition-colors" style={activeTab === tab ? { borderColor: '#F06138', color: '#F06138' } : { borderColor: 'transparent', color: '#6A6A6A' }}>
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'services' && (
                <div className="space-y-4">
                  {services.map((svc) => (
                    <div key={svc._id} className="flex items-start justify-between gap-4 p-5 rounded-2xl" style={{ background: '#FFFEF5', border: '1px solid rgba(139,67,50,0.08)' }}>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-lato font-semibold text-[#101828] text-sm">{svc.name}</h3>
                        <p className="font-lato text-[#6A6A6A] text-xs mt-1 leading-relaxed">{svc.description}</p>
                        <span className="inline-flex items-center gap-1 text-xs font-lato text-[#6A6A6A] mt-2"><Clock size={11} /> {svc.duration}</span>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-filson font-bold text-[#8B4332] text-xl">₹{new Intl.NumberFormat('en-IN').format(svc.price)}</p>
                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate(`/book/${id}/${svc._id}`)} className="mt-2 px-4 py-2 rounded-lg text-xs font-lato font-semibold hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
                          Book Now
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="p-5 rounded-2xl" style={{ background: '#FFFEF5', border: '1px solid rgba(139,67,50,0.08)' }}>
                      <div className="flex items-start gap-3">
                        <img src={r.user?.avatar || `https://i.pravatar.cc/40?u=${r._id}`} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-lato font-semibold text-[#101828] text-sm">{r.user?.name}</p>
                            <span className="font-lato text-xs text-[#6A6A6A]">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
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

          {/* Sticky CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl p-6" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.12)' }}>
              <p className="font-lato text-[#6A6A6A] text-xs mb-1">Starting from</p>
              <p className="font-filson font-black text-[#8B4332] text-3xl mb-1">₹{new Intl.NumberFormat('en-IN').format(services[0]?.price || 8000)}</p>
              <div className="flex items-center gap-1.5 mb-5">
                <Stars rating={vendor.rating} size={14} />
                <span className="font-lato text-sm text-[#6A6A6A]">({vendor.totalReviews})</span>
              </div>
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate(`/book/${id}/${services[0]?._id}`)} className="w-full py-3.5 rounded-xl font-lato font-semibold text-sm mb-3 hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
                Book Now
              </motion.button>
              <Link to={`/chat?vendorId=${id}`} className="w-full py-3 rounded-xl font-lato font-semibold text-sm border border-[#F06138] text-[#F06138] hover:bg-[#FFF3EF] transition-colors flex items-center justify-center gap-2">
                <MessageSquare size={16} /> Message Vendor
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}

import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, MapPin, Star, HeartOff, BadgeCheck, Compass } from 'lucide-react'
import toast from 'react-hot-toast'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { SkeletonCard } from '../../components/shared/Skeleton'
import { getWishlist, toggleWishlist } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'

export default function Wishlist() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: getWishlist })
  const vendors = data?.data?.wishlist || []

  const removeMutation = useMutation({
    mutationFn: (id) => toggleWishlist(id),
    onSuccess: () => {
      toast.success('Removed from wishlist')
      qc.invalidateQueries(['wishlist'])
    },
  })

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      {/* Header */}
      <div className="border-b border-black/5" style={{ background: '#FEFDEB' }}>
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFF3EF' }}>
                <Heart size={20} className="text-[#F06138] fill-[#F06138]" />
              </div>
              <div>
                <h1 className="font-filson font-black text-[#101828] text-2xl">My Wishlist</h1>
                <p className="font-lato text-[#6A6A6A] text-sm">
                  {isLoading ? '…' : <><span className="font-semibold text-[#101828]">{vendors.length}</span> saved vendors</>}
                </p>
              </div>
            </div>
            <Link
              to="/explore"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ background: '#F06138', color: '#FDFAD6' }}
            >
              <Compass size={14} /> Explore More
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : vendors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 text-center rounded-3xl"
            style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFF3EF, #FEFDEB)', border: '1px solid rgba(240,97,56,0.15)' }}
            >
              <HeartOff size={36} className="text-gray-300" />
            </motion.div>
            <h2 className="font-filson font-black text-[#101828] text-xl mb-2">Your wishlist is empty</h2>
            <p className="font-lato text-[#6A6A6A] text-sm mb-6 max-w-xs mx-auto">
              Browse vendors and tap the heart icon to save your favorites here
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ background: '#F06138', color: '#FDFAD6' }}
            >
              <Compass size={15} /> Explore Vendors
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {vendors.map((vendor, i) => (
                <motion.div
                  key={vendor._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06 }}
                  layout
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <div
                    className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl"
                    style={{ background: '#fff', border: '1px solid rgba(139,67,50,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  >
                    <div className="relative overflow-hidden h-48">
                      <Link to={`/vendor/${vendor._id}`}>
                        <img
                          src={vendor.coverImage}
                          alt={vendor.businessName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

                      {/* Remove from wishlist */}
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => removeMutation.mutate(vendor._id)}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.95)' }}
                        disabled={removeMutation.isPending}
                        title="Remove from wishlist"
                      >
                        <Heart size={16} className="fill-red-500 text-red-500" />
                      </motion.button>

                      {/* Verified badge */}
                      {vendor.isVerified && (
                        <span className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(1,102,48,0.85)', color: '#fff' }}>
                          <BadgeCheck size={10} /> Verified
                        </span>
                      )}

                      {/* Rating */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <Star size={11} className="text-amber-500 fill-amber-500" />
                        <span className="font-lato font-bold text-[#101828] text-xs">{vendor.rating}</span>
                        <span className="font-lato text-[#6A6A6A] text-[11px]">({vendor.totalReviews})</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <Link to={`/vendor/${vendor._id}`}>
                        <h3 className="font-lato font-bold text-[#101828] text-sm hover:text-[#F06138] transition-colors truncate">{vendor.businessName}</h3>
                      </Link>
                      <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{vendor.category}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <MapPin size={11} className="text-[#6A6A6A] shrink-0" />
                        <span className="font-lato text-xs text-[#6A6A6A] truncate">{vendor.city}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
                        <div>
                          <span className="font-lato text-[11px] text-[#6A6A6A]">From</span>
                          <p className="font-filson font-black text-[#8B4332] text-sm">₹{new Intl.NumberFormat('en-IN').format(vendor.startingPrice)}</p>
                        </div>
                        <Link
                          to={`/vendor/${vendor._id}`}
                          className="text-xs font-lato font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                          style={{ background: '#F06138', color: '#FDFAD6' }}
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      <Footer />
    </motion.div>
  )
}

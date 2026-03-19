import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, MapPin, Star, HeartOff } from 'lucide-react'
import toast from 'react-hot-toast'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { SkeletonCard } from '../../components/shared/Skeleton'
import { getWishlist, toggleWishlist } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'

const MOCK_WISHLIST = [
  { _id: '1', businessName: 'Royal Events & Décor', category: 'Decoration', city: 'Mumbai', rating: 4.9, totalReviews: 128, startingPrice: 45000, coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80' },
  { _id: '2', businessName: 'Lens & Light Studio',   category: 'Photography', city: 'Bangalore', rating: 4.8, totalReviews: 94, startingPrice: 25000, coverImage: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80' },
  { _id: '3', businessName: 'Flavours of India',     category: 'Catering', city: 'Delhi', rating: 4.7, totalReviews: 213, startingPrice: 800, coverImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80' },
]

export default function Wishlist() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['wishlist'], queryFn: getWishlist })
  const vendors = data?.data?.vendors || MOCK_WISHLIST

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

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFF3EF' }}>
            <Heart size={20} className="text-[#F06138] fill-[#F06138]" />
          </div>
          <div>
            <h1 className="font-filson font-black text-[#101828] text-2xl">My Wishlist</h1>
            <p className="font-lato text-[#6A6A6A] text-sm">{isLoading ? '…' : `${vendors.length} saved vendors`}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : vendors.length === 0 ? (
          <div className="py-20 text-center rounded-2xl" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
            <HeartOff size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="font-lato font-semibold text-[#101828] text-sm mb-1">Your wishlist is empty</p>
            <p className="font-lato text-[#6A6A6A] text-xs mb-5">Save vendors you like while browsing!</p>
            <Link to="/explore" className="inline-block px-6 py-2.5 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
              Explore Vendors
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {vendors.map((vendor, i) => (
              <motion.div
                key={vendor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                layout
              >
                <div className="rounded-2xl overflow-hidden border border-black/5 hover:shadow-lg transition-all" style={{ background: '#FFFEF5' }}>
                  <div className="relative overflow-hidden h-44">
                    <Link to={`/vendor/${vendor._id}`}>
                      <img src={vendor.coverImage} alt={vendor.businessName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </Link>
                    <button
                      onClick={() => removeMutation.mutate(vendor._id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow"
                      disabled={removeMutation.isPending}
                    >
                      <Heart size={16} className="fill-red-500 text-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <Link to={`/vendor/${vendor._id}`}>
                      <h3 className="font-lato font-semibold text-[#101828] text-sm hover:text-[#F06138] transition-colors truncate">{vendor.businessName}</h3>
                    </Link>
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
                      <p className="font-lato font-bold text-[#8B4332] text-sm">
                        from ₹{new Intl.NumberFormat('en-IN').format(vendor.startingPrice)}
                      </p>
                      <Link to={`/vendor/${vendor._id}`} className="text-xs font-lato font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </motion.div>
  )
}

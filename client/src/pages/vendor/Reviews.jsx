import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Star, MessageSquare } from 'lucide-react'
import VendorSidebar from '../../components/shared/VendorSidebar'
import { pageVariants } from '../../animations/pageTransitions'
import api from '../../services/api'

const MOCK_REVIEWS = [
  { _id: 'r1', rating: 5, comment: 'Absolutely stunning decoration! The team was professional, punctual, and delivered beyond our expectations.', customer: { name: 'Priya Sharma' }, service: 'Basic Wedding Package', createdAt: '2025-03-10T10:00:00Z', reply: null },
  { _id: 'r2', rating: 4, comment: 'Great work overall. The flowers were fresh and the layout was beautiful. Minor delay in setup but everything looked perfect.', customer: { name: 'Ananya Singh' }, service: 'Premium Decoration', createdAt: '2025-02-20T10:00:00Z', reply: 'Thank you Ananya! We apologize for the slight delay and are glad you loved the final setup.' },
  { _id: 'r3', rating: 5, comment: 'Second time booking Royal Events and they never disappoint! Highly recommend.', customer: { name: 'Vikram Nair' }, service: 'Engagement Ceremony', createdAt: '2025-01-15T10:00:00Z', reply: null },
]

function StarRow({ rating, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={14} className={i < rating ? 'fill-[#F06138] text-[#F06138]' : 'text-gray-200'} />
      ))}
    </div>
  )
}

export default function VendorReviews() {
  const { data } = useQuery({
    queryKey: ['vendor-reviews-all'],
    queryFn: () => api.get('/vendors/reviews'),
  })
  const reviews = data?.data?.reviews || MOCK_REVIEWS

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  const dist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
    pct: reviews.length ? Math.round((reviews.filter((r) => r.rating === n).length / reviews.length) * 100) : 0,
  }))

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex min-h-screen bg-[#F8F8F4]">
      <VendorSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="font-filson font-black text-[#101828] text-2xl mb-8">Reviews</h1>

        {/* Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-black/5 p-6 flex flex-col items-center justify-center text-center">
            <p className="font-filson font-black text-[#101828] text-5xl">{avgRating}</p>
            <StarRow rating={Math.round(Number(avgRating))} />
            <p className="font-lato text-xs text-[#6A6A6A] mt-2">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-black/5 p-6">
            <h3 className="font-lato font-bold text-[#101828] text-sm mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {dist.map(({ n, count, pct }) => (
                <div key={n} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-10 shrink-0">
                    <span className="font-lato text-sm font-medium text-[#364153]">{n}</span>
                    <Star size={12} className="fill-[#F06138] text-[#F06138]" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: '#F06138' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    />
                  </div>
                  <span className="font-lato text-xs text-[#6A6A6A] w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Review list */}
        {reviews.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white border border-black/5">
            <MessageSquare size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="font-lato font-semibold text-[#101828] text-sm">No reviews yet</p>
            <p className="font-lato text-xs text-[#6A6A6A] mt-1">Complete bookings to start collecting reviews</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-black/5 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-lato font-bold text-[#101828] text-sm">{r.customer?.name}</p>
                    <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">{r.service}</p>
                  </div>
                  <div className="text-right">
                    <StarRow rating={r.rating} />
                    <p className="font-lato text-[10px] text-[#6A6A6A] mt-1">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <p className="font-lato text-sm text-[#364153] leading-relaxed">{r.comment}</p>

                {r.reply && (
                  <div className="mt-3 pl-4 border-l-2 border-[#F06138]/30">
                    <p className="font-lato text-xs font-semibold text-[#F06138] mb-1">Your Reply</p>
                    <p className="font-lato text-xs text-[#6A6A6A]">{r.reply}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </motion.div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, MessageSquare, X, Loader2, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import VendorSidebar from '../../components/shared/VendorSidebar'
import { pageVariants } from '../../animations/pageTransitions'
import { getMyReviews, replyToReview } from '../../services/vendors'

function StarRow({ rating, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={14} className={i < rating ? 'fill-[#F06138] text-[#F06138]' : 'text-gray-200'} />
      ))}
    </div>
  )
}

function normalizeReview(r) {
  const serviceName =
    r.bookingId?.serviceId?.title ||
    r.bookingId?.serviceId?.name ||
    '—'
  return {
    ...r,
    customerName: r.userId?.name || 'Customer',
    customerAvatar: r.userId?.avatar || null,
    serviceName,
    reply: r.vendorReply || null,
  }
}

function ReplyModal({ review, onClose, onSaved }) {
  const [text, setText] = useState(review.reply || '')
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => replyToReview(review._id, text),
    onSuccess: () => {
      toast.success('Reply saved!')
      qc.invalidateQueries(['vendor-reviews'])
      onSaved()
    },
    onError: () => toast.error('Could not save reply.'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-2xl p-6 shadow-xl"
        style={{ background: '#FEFDEB' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-filson font-black text-[#101828] text-lg">
            {review.reply ? 'Edit Reply' : 'Reply to Review'}
          </h2>
          <button onClick={onClose} className="text-[#6A6A6A] hover:text-[#101828]"><X size={20} /></button>
        </div>

        {/* Original review */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-black/5">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-lato font-semibold text-sm text-[#101828]">{review.customerName}</p>
            <StarRow rating={review.rating} />
          </div>
          <p className="font-lato text-sm text-[#364153]">{review.comment}</p>
        </div>

        <div className="mb-4">
          <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Your Response</label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a professional, courteous reply…"
            className="input-field resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-lato font-semibold text-sm border border-[rgba(139,67,50,0.2)] text-[#364153] hover:bg-[#FFF3EF] transition-colors">
            Cancel
          </button>
          <button
            onClick={() => text.trim() && mutation.mutate()}
            disabled={mutation.isPending || !text.trim()}
            className="flex-1 py-3 rounded-xl font-lato font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ background: '#F06138', color: '#FDFAD6' }}
          >
            {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {mutation.isPending ? 'Saving…' : 'Post Reply'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function VendorReviews() {
  const [replyTarget, setReplyTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-reviews'],
    queryFn: () => getMyReviews(),
  })

  const rawReviews = data?.data?.reviews || []
  const reviews = rawReviews.map(normalizeReview)
  const avgRating = data?.data?.avgRating || 0
  const totalReviews = data?.data?.totalReviews || reviews.length

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

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl border border-black/5 p-6 flex flex-col items-center justify-center text-center">
                <p className="font-filson font-black text-[#101828] text-5xl">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</p>
                <StarRow rating={Math.round(avgRating)} />
                <p className="font-lato text-xs text-[#6A6A6A] mt-2">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
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
                <AnimatePresence>
                  {reviews.map((r, i) => (
                    <motion.div
                      key={r._id}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="bg-white rounded-2xl border border-black/5 p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          {r.customerAvatar ? (
                            <img src={r.customerAvatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm" style={{ background: '#F06138' }}>
                              {r.customerName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-lato font-bold text-[#101828] text-sm">{r.customerName}</p>
                            <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">{r.serviceName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <StarRow rating={r.rating} />
                          <p className="font-lato text-[10px] text-[#6A6A6A] mt-1">
                            {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {r.title && (
                        <p className="font-lato font-semibold text-sm text-[#101828] mb-1">{r.title}</p>
                      )}
                      <p className="font-lato text-sm text-[#364153] leading-relaxed">{r.comment}</p>

                      {r.reply ? (
                        <div className="mt-3 pl-4 border-l-2 border-[#F06138]/30">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-lato text-xs font-semibold text-[#F06138]">Your Reply</p>
                            <button
                              onClick={() => setReplyTarget(r)}
                              className="font-lato text-[10px] text-[#6A6A6A] hover:text-[#F06138] transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                          <p className="font-lato text-xs text-[#6A6A6A]">{r.reply}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyTarget(r)}
                          className="mt-3 flex items-center gap-1.5 font-lato text-xs font-semibold text-[#F06138] hover:text-[#8B4332] transition-colors"
                        >
                          <MessageSquare size={13} /> Reply to review
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </main>

      {replyTarget && (
        <ReplyModal
          review={replyTarget}
          onClose={() => setReplyTarget(null)}
          onSaved={() => setReplyTarget(null)}
        />
      )}
    </motion.div>
  )
}

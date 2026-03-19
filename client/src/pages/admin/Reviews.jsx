import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Eye, EyeOff, Trash2, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminSidebar from '../../components/shared/AdminSidebar'
import api from '../../services/api'

const MOCK = [
  { _id: '1', userName: 'Arjun Mehta', vendorName: 'Royal Caterers', rating: 5, comment: 'Absolutely fantastic service! The food was delicious and the team was very professional.', isVisible: true, createdAt: '2025-06-10' },
  { _id: '2', userName: 'Priya Singh', vendorName: 'DJ Beats', rating: 3, comment: 'Sound quality was okay but could be better. Equipment seemed outdated.', isVisible: true, createdAt: '2025-06-08' },
  { _id: '3', userName: 'Ravi Kumar', vendorName: 'Click Studios', rating: 1, comment: 'Very disappointed. Spam and inappropriate content here.', isVisible: false, createdAt: '2025-06-05' },
  { _id: '4', userName: 'Neha Joshi', vendorName: 'Bloom Decor', rating: 4, comment: 'Beautiful decorations and very responsive team. Would hire again!', isVisible: true, createdAt: '2025-06-01' },
]

const StarRating = ({ value }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={13} className={i <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
    ))}
  </div>
)

export default function AdminReviews() {
  const [search, setSearch] = useState('')
  const [deleteModal, setDeleteModal] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => { const { data } = await api.get('/admin/reviews'); return data.reviews },
  })

  const reviews = data || MOCK

  const toggleVis = useMutation({
    mutationFn: (id) => api.put(`/admin/reviews/${id}/visibility`),
    onSuccess: () => { qc.invalidateQueries(['admin-reviews']); toast.success('Visibility updated') },
    onError: () => toast.error('Action failed'),
  })

  const deleteReview = useMutation({
    mutationFn: (id) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => { qc.invalidateQueries(['admin-reviews']); toast.success('Review deleted'); setDeleteModal(null) },
    onError: () => toast.error('Delete failed'),
  })

  const filtered = reviews.filter(r => {
    const q = search.toLowerCase()
    return !search || r.userName?.toLowerCase().includes(q) || r.vendorName?.toLowerCase().includes(q) || r.comment?.toLowerCase().includes(q)
  })

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFDFC' }}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="font-filson text-3xl font-bold" style={{ color: '#1A1A1A' }}>Reviews</h1>
            <p className="text-[#6A6A6A] text-sm mt-1 font-lato">Moderate user reviews across the platform</p>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm font-lato border border-gray-200 focus:outline-none focus:border-[#F06138]" style={{ background: '#FAFAFA' }} />
              </div>
            </div>

            {isLoading ? (
              <div className="py-20 text-center text-[#6A6A6A] text-sm font-lato">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-[#6A6A6A] text-sm font-lato">No reviews found</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map(r => (
                  <motion.div key={r._id} layout className={`p-6 transition-colors ${!r.isVisible ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: '#8B4332' }}>
                            {r.userName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-[#1A1A1A] font-lato">{r.userId?.name || r.userName}</p>
                            <p className="text-xs text-[#6A6A6A] font-lato">reviewed <span className="text-[#F06138]">{r.vendorId?.businessName || r.vendorName}</span></p>
                          </div>
                          <StarRating value={r.rating} />
                          <span className="text-xs text-[#6A6A6A] font-lato ml-auto">
                            {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm text-[#4C4C4C] font-lato mt-2 leading-relaxed">{r.comment}</p>
                        {!r.isVisible && (
                          <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#FEE2E2', color: '#991B1B' }}>Hidden</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => toggleVis.mutate(r._id)} disabled={toggleVis.isPending}
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" title={r.isVisible ? 'Hide' : 'Show'}>
                          {r.isVisible ? <EyeOff size={15} className="text-[#6A6A6A]" /> : <Eye size={15} className="text-[#6A6A6A]" />}
                        </button>
                        <button onClick={() => setDeleteModal(r._id)}
                          className="p-2 rounded-lg border border-red-100 hover:bg-red-50 transition-colors" title="Delete">
                          <Trash2 size={15} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {deleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={() => setDeleteModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="font-filson text-lg font-bold text-[#1A1A1A] mb-2">Delete Review?</h3>
              <p className="text-sm text-[#6A6A6A] mb-5 font-lato">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[#6A6A6A] hover:bg-gray-50">Cancel</button>
                <button onClick={() => deleteReview.mutate(deleteModal)} disabled={deleteReview.isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#DC2626' }}>
                  {deleteReview.isPending ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

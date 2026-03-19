import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle, XCircle, Ban } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminSidebar from '../../components/shared/AdminSidebar'
import api from '../../services/api'

const MOCK = [
  { _id: '1', businessName: 'Royal Caterers', email: 'royal@example.com', category: 'Catering', city: 'Mumbai', status: 'pending', createdAt: '2025-06-01' },
  { _id: '2', businessName: 'Pixel Frames', email: 'pixel@example.com', category: 'Photography', city: 'Delhi', status: 'approved', createdAt: '2025-05-20' },
  { _id: '3', businessName: 'Sound Waves DJ', email: 'sound@example.com', category: 'DJ', city: 'Pune', status: 'pending', createdAt: '2025-06-03' },
  { _id: '4', businessName: 'Bloom Decor', email: 'bloom@example.com', category: 'Decoration', city: 'Bangalore', status: 'approved', createdAt: '2025-05-15' },
  { _id: '5', businessName: 'Sky Mandap', email: 'sky@example.com', category: 'Venue', city: 'Hyderabad', status: 'suspended', createdAt: '2025-04-28' },
]

const TABS = ['all', 'pending', 'approved', 'suspended', 'rejected']

const badge = {
  pending:   { bg: '#FEF9C3', color: '#854D0E', label: 'Pending' },
  approved:  { bg: '#DCFCE7', color: '#166534', label: 'Approved' },
  rejected:  { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
  suspended: { bg: '#F3F4F6', color: '#374151', label: 'Suspended' },
}

export default function AdminVendors() {
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: async () => { const { data } = await api.get('/admin/vendors'); return data.vendors },
  })

  const vendors = data || MOCK
  const pendingCount = vendors.filter(v => v.status === 'pending').length

  const approve = useMutation({
    mutationFn: (id) => api.put(`/admin/vendors/${id}/approve`),
    onSuccess: () => { qc.invalidateQueries(['admin-vendors']); toast.success('Vendor approved') },
    onError: () => toast.error('Failed to approve'),
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }) => api.put(`/admin/vendors/${id}/reject`, { reason }),
    onSuccess: () => { qc.invalidateQueries(['admin-vendors']); toast.success('Vendor rejected'); setRejectModal(null); setRejectReason('') },
    onError: () => toast.error('Failed to reject'),
  })

  const suspend = useMutation({
    mutationFn: (id) => api.put(`/admin/vendors/${id}/suspend`),
    onSuccess: () => { qc.invalidateQueries(['admin-vendors']); toast.success('Vendor suspended') },
    onError: () => toast.error('Failed to suspend'),
  })

  const filtered = vendors.filter(v => {
    const matchTab = tab === 'all' || v.status === tab
    const q = search.toLowerCase()
    const matchSearch = !search || v.businessName?.toLowerCase().includes(q) || v.email?.toLowerCase().includes(q) || v.city?.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFDFC' }}>
      <AdminSidebar pendingApprovals={pendingCount} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="font-filson text-3xl font-bold" style={{ color: '#1A1A1A' }}>Vendors</h1>
            <p className="text-[#6A6A6A] text-sm mt-1 font-lato">Manage vendor accounts and approvals</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or city…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm font-lato border border-gray-200 focus:outline-none focus:border-[#F06138]" style={{ background: '#FAFAFA' }} />
              </div>
            </div>

            <div className="flex gap-1 px-4 pt-3 pb-1 overflow-x-auto">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all font-lato"
                  style={tab === t ? { background: '#F06138', color: '#fff' } : { background: '#F5F5F5', color: '#6A6A6A' }}>
                  {t}{t === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="py-20 text-center text-[#6A6A6A] font-lato text-sm">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center text-[#6A6A6A] font-lato text-sm">No vendors found</div>
              ) : (
                <table className="w-full text-sm font-lato">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Business', 'Category', 'City', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-[#6A6A6A] font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(v => {
                      const b = badge[v.status] || badge.pending
                      return (
                        <tr key={v._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: '#F06138' }}>
                                {v.businessName?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-[#1A1A1A]">{v.businessName}</p>
                                <p className="text-xs text-[#6A6A6A]">{v.userId?.email || v.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#4C4C4C]">{v.category?.name || v.category}</td>
                          <td className="px-6 py-4 text-[#4C4C4C]">{v.city}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: b.bg, color: b.color }}>{b.label}</span>
                          </td>
                          <td className="px-6 py-4 text-[#6A6A6A] text-xs">
                            {new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {v.status === 'pending' && (
                                <>
                                  <button onClick={() => approve.mutate(v._id)} disabled={approve.isPending}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90" style={{ background: '#16A34A' }}>
                                    <CheckCircle size={12} /> Approve
                                  </button>
                                  <button onClick={() => setRejectModal(v._id)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90" style={{ background: '#DC2626' }}>
                                    <XCircle size={12} /> Reject
                                  </button>
                                </>
                              )}
                              {v.status === 'approved' && (
                                <button onClick={() => suspend.mutate(v._id)} disabled={suspend.isPending}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-100" style={{ color: '#6A6A6A' }}>
                                  <Ban size={12} /> Suspend
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {rejectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={() => setRejectModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="font-filson text-lg font-bold text-[#1A1A1A] mb-1">Reject Vendor</h3>
              <p className="text-sm text-[#6A6A6A] mb-4 font-lato">Provide a reason for rejection (optional).</p>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for rejection…" rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-lato focus:outline-none focus:border-[#F06138] resize-none" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[#6A6A6A] hover:bg-gray-50">Cancel</button>
                <button onClick={() => reject.mutate({ id: rejectModal, reason: rejectReason })} disabled={reject.isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#DC2626' }}>
                  {reject.isPending ? 'Rejecting…' : 'Confirm Reject'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

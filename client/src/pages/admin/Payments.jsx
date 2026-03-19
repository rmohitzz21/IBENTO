import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle, XCircle, IndianRupee } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminSidebar from '../../components/shared/AdminSidebar'
import api from '../../services/api'

const MOCK = [
  { _id: '1', vendorName: 'Royal Caterers', vendorEmail: 'royal@example.com', amount: 35000, status: 'pending', requestedAt: '2025-06-10', bankAccount: '****1234', ifsc: 'SBIN0001234' },
  { _id: '2', vendorName: 'Pixel Frames', vendorEmail: 'pixel@example.com', amount: 18500, status: 'paid', requestedAt: '2025-05-28', bankAccount: '****5678', ifsc: 'HDFC0005678' },
  { _id: '3', vendorName: 'Sound Waves DJ', vendorEmail: 'sound@example.com', amount: 9000, status: 'pending', requestedAt: '2025-06-12', bankAccount: '****9012', ifsc: 'ICIC0009012' },
  { _id: '4', vendorName: 'Bloom Decor', vendorEmail: 'bloom@example.com', amount: 22000, status: 'approved', requestedAt: '2025-06-08', bankAccount: '****3456', ifsc: 'AXIS0003456' },
  { _id: '5', vendorName: 'Sky Mandap', vendorEmail: 'sky@example.com', amount: 60000, status: 'rejected', requestedAt: '2025-05-20', bankAccount: '****7890', ifsc: 'KOTAK007890' },
]

const badge = {
  pending:  { bg: '#FEF9C3', color: '#854D0E', label: 'Pending' },
  approved: { bg: '#DBEAFE', color: '#1E40AF', label: 'Approved' },
  paid:     { bg: '#DCFCE7', color: '#166534', label: 'Paid' },
  rejected: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
}

const TABS = ['all', 'pending', 'approved', 'paid', 'rejected']

export default function AdminPayments() {
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectNote, setRejectNote] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: async () => { const { data } = await api.get('/admin/withdrawals'); return data.withdrawals },
  })

  const withdrawals = data || MOCK
  const pendingCount = withdrawals.filter(w => w.status === 'pending').length


  const approveW = useMutation({
    mutationFn: (id) => api.put(`/admin/withdrawals/${id}/approve`),
    onSuccess: () => { qc.invalidateQueries(['admin-withdrawals']); toast.success('Withdrawal approved') },
    onError: () => toast.error('Failed to approve'),
  })

  const rejectW = useMutation({
    mutationFn: ({ id, note }) => api.put(`/admin/withdrawals/${id}/reject`, { note }),
    onSuccess: () => { qc.invalidateQueries(['admin-withdrawals']); toast.success('Withdrawal rejected'); setRejectModal(null); setRejectNote('') },
    onError: () => toast.error('Failed to reject'),
  })

  // Normalise API data shape
  const normalised = withdrawals.map(w => ({
    ...w,
    vendorName:  w.vendorId?.businessName || w.vendorName || '—',
    vendorEmail: w.vendorId?.userId?.email || w.vendorEmail || '—',
    bankAccount: w.bankAccount?.accountNumber ? `****${w.bankAccount.accountNumber.slice(-4)}` : (w.bankAccount || '—'),
    ifsc:        w.bankAccount?.ifsc || w.ifsc || '—',
    requestedAt: w.requestedAt || w.createdAt,
  }))

  const filtered = normalised.filter(w => {
    const matchTab = tab === 'all' || w.status === tab
    const q = search.toLowerCase()
    const matchSearch = !search || w.vendorName?.toLowerCase().includes(q) || w.vendorEmail?.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  const totalPending = normalised.filter(w => w.status === 'pending').reduce((s, w) => s + (w.amount || 0), 0)

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFDFC' }}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="font-filson text-3xl font-bold" style={{ color: '#1A1A1A' }}>Withdrawals</h1>
            <p className="text-[#6A6A6A] text-sm mt-1 font-lato">Manage vendor withdrawal requests</p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm text-[#6A6A6A] font-lato">Pending Requests</p>
              <p className="text-2xl font-bold font-filson mt-1" style={{ color: '#854D0E' }}>{pendingCount}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm text-[#6A6A6A] font-lato">Pending Amount</p>
              <p className="text-2xl font-bold font-filson mt-1" style={{ color: '#1A1A1A' }}>₹{totalPending.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendor…"
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
                <div className="py-20 text-center text-[#6A6A6A] text-sm font-lato">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center text-[#6A6A6A] text-sm font-lato">No withdrawals found</div>
              ) : (
                <table className="w-full text-sm font-lato">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Vendor', 'Amount', 'Bank', 'Requested', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-[#6A6A6A] font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(w => {
                      const b = badge[w.status] || badge.pending
                      return (
                        <tr key={w._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-[#1A1A1A]">{w.vendorName}</p>
                            <p className="text-xs text-[#6A6A6A]">{w.vendorEmail}</p>
                          </td>
                          <td className="px-6 py-4 font-bold text-[#1A1A1A]">₹{w.amount?.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4">
                            <p className="text-[#4C4C4C]">{w.bankAccount}</p>
                            <p className="text-xs text-[#6A6A6A]">{w.ifsc}</p>
                          </td>
                          <td className="px-6 py-4 text-[#6A6A6A] text-xs">
                            {new Date(w.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: b.bg, color: b.color }}>{b.label}</span>
                          </td>
                          <td className="px-6 py-4">
                            {w.status === 'pending' && (
                              <div className="flex items-center gap-2">
                                <button onClick={() => approveW.mutate(w._id)} disabled={approveW.isPending}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90" style={{ background: '#16A34A' }}>
                                  <CheckCircle size={12} /> Approve
                                </button>
                                <button onClick={() => setRejectModal(w._id)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90" style={{ background: '#DC2626' }}>
                                  <XCircle size={12} /> Reject
                                </button>
                              </div>
                            )}
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
              <h3 className="font-filson text-lg font-bold text-[#1A1A1A] mb-1">Reject Withdrawal</h3>
              <p className="text-sm text-[#6A6A6A] mb-4 font-lato">Provide a reason (optional).</p>
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Reason…" rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-lato focus:outline-none focus:border-[#F06138] resize-none" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[#6A6A6A] hover:bg-gray-50">Cancel</button>
                <button onClick={() => rejectW.mutate({ id: rejectModal, note: rejectNote })} disabled={rejectW.isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#DC2626' }}>
                  {rejectW.isPending ? 'Rejecting…' : 'Confirm Reject'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

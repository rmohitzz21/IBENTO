import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import AdminSidebar from '../../components/shared/AdminSidebar'
import api from '../../services/api'

const MOCK = [
  { _id: '1', bookingNumber: 'IBK-0001', userName: 'Arjun Mehta', vendorName: 'Royal Caterers', eventType: 'Wedding', eventDate: '2025-06-15', totalAmount: 45000, status: 'confirmed', paymentStatus: 'advance-paid' },
  { _id: '2', bookingNumber: 'IBK-0002', userName: 'Priya Singh', vendorName: 'DJ Beats', eventType: 'Birthday', eventDate: '2025-06-20', totalAmount: 12000, status: 'pending', paymentStatus: 'pending' },
  { _id: '3', bookingNumber: 'IBK-0003', userName: 'Ravi Kumar', vendorName: 'Click Studios', eventType: 'Corporate', eventDate: '2025-06-22', totalAmount: 30000, status: 'cancelled', paymentStatus: 'refunded' },
  { _id: '4', bookingNumber: 'IBK-0004', userName: 'Neha Joshi', vendorName: 'Bloom Decor', eventType: 'Anniversary', eventDate: '2025-06-10', totalAmount: 18000, status: 'completed', paymentStatus: 'fully-paid' },
  { _id: '5', bookingNumber: 'IBK-0005', userName: 'Karan Patel', vendorName: 'Sky Venue', eventType: 'Engagement', eventDate: '2025-07-05', totalAmount: 80000, status: 'confirmed', paymentStatus: 'advance-paid' },
]

const STATUS_TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

const statusBadge = {
  pending:   { bg: '#FEF9C3', color: '#854D0E' },
  confirmed: { bg: '#DCFCE7', color: '#166534' },
  completed: { bg: '#DBEAFE', color: '#1E40AF' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B' },
}

export default function AdminBookings() {
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => { const { data } = await api.get('/admin/bookings'); return data.bookings },
  })

  const bookings = data || MOCK

  const filtered = bookings.filter(b => {
    const matchTab = tab === 'all' || b.status === tab
    const q = search.toLowerCase()
    const matchSearch = !search || b.bookingNumber?.toLowerCase().includes(q) || b.userName?.toLowerCase().includes(q) || b.vendorName?.toLowerCase().includes(q)
    return matchTab && matchSearch
  })

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFDFC' }}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="font-filson text-3xl font-bold" style={{ color: '#1A1A1A' }}>Bookings</h1>
            <p className="text-[#6A6A6A] text-sm mt-1 font-lato">All platform bookings</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookings, customer or vendor…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm font-lato border border-gray-200 focus:outline-none focus:border-[#F06138]" style={{ background: '#FAFAFA' }} />
              </div>
            </div>

            <div className="flex gap-1 px-4 pt-3 pb-1 overflow-x-auto">
              {STATUS_TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all font-lato"
                  style={tab === t ? { background: '#F06138', color: '#fff' } : { background: '#F5F5F5', color: '#6A6A6A' }}>
                  {t}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="py-20 text-center text-[#6A6A6A] font-lato text-sm">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center text-[#6A6A6A] font-lato text-sm">No bookings found</div>
              ) : (
                <table className="w-full text-sm font-lato">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Booking', 'Customer', 'Vendor', 'Event', 'Date', 'Amount', 'Status'].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-[#6A6A6A] font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => {
                      const sb = statusBadge[b.status] || statusBadge.pending
                      return (
                        <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-[#1A1A1A]">{b.bookingNumber}</td>
                          <td className="px-6 py-4 text-[#4C4C4C]">{b.userId?.name || b.userName}</td>
                          <td className="px-6 py-4 text-[#4C4C4C]">{b.vendorId?.businessName || b.vendorName}</td>
                          <td className="px-6 py-4 text-[#4C4C4C]">{b.eventType}</td>
                          <td className="px-6 py-4 text-[#6A6A6A] text-xs">
                            {new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 font-medium text-[#1A1A1A]">₹{b.totalAmount?.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: sb.bg, color: sb.color }}>
                              {b.status}
                            </span>
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
    </div>
  )
}

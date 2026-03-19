import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, ShieldOff, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminSidebar from '../../components/shared/AdminSidebar'
import api from '../../services/api'

const MOCK = [
  { _id: '1', name: 'Arjun Mehta', email: 'arjun@example.com', phone: '9876543210', role: 'user', isBlocked: false, createdAt: '2025-05-01', bookingsCount: 4 },
  { _id: '2', name: 'Priya Singh', email: 'priya@example.com', phone: '9123456780', role: 'user', isBlocked: false, createdAt: '2025-04-15', bookingsCount: 2 },
  { _id: '3', name: 'Ravi Kumar', email: 'ravi@example.com', phone: '9012345678', role: 'user', isBlocked: true, createdAt: '2025-03-22', bookingsCount: 0 },
  { _id: '4', name: 'Neha Joshi', email: 'neha@example.com', phone: '9234567890', role: 'vendor', isBlocked: false, createdAt: '2025-05-10', bookingsCount: 7 },
  { _id: '5', name: 'Karan Patel', email: 'karan@example.com', phone: '9345678901', role: 'user', isBlocked: false, createdAt: '2025-06-01', bookingsCount: 1 },
]

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => { const { data } = await api.get('/admin/users'); return data.users },
  })

  const users = data || MOCK

  const blockUser = useMutation({
    mutationFn: ({ id, block }) => api.put(`/admin/users/${id}/block`, { block }),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('User status updated') },
    onError: () => toast.error('Action failed'),
  })

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const q = search.toLowerCase()
    const matchSearch = !search || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    return matchRole && matchSearch
  })

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFDFC' }}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="font-filson text-3xl font-bold" style={{ color: '#1A1A1A' }}>Users</h1>
            <p className="text-[#6A6A6A] text-sm mt-1 font-lato">Manage all user accounts</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm font-lato border border-gray-200 focus:outline-none focus:border-[#F06138]" style={{ background: '#FAFAFA' }} />
              </div>
              <div className="flex gap-1">
                {['all', 'user', 'vendor'].map(r => (
                  <button key={r} onClick={() => setRoleFilter(r)}
                    className="px-4 py-2 rounded-lg text-sm font-medium capitalize font-lato transition-all"
                    style={roleFilter === r ? { background: '#F06138', color: '#fff' } : { background: '#F5F5F5', color: '#6A6A6A' }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="py-20 text-center text-[#6A6A6A] font-lato text-sm">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center text-[#6A6A6A] font-lato text-sm">No users found</div>
              ) : (
                <table className="w-full text-sm font-lato">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['User', 'Phone', 'Role', 'Bookings', 'Joined', 'Status', 'Action'].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-[#6A6A6A] font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ background: '#8B4332' }}>
                              {u.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-[#1A1A1A]">{u.name}</p>
                              <p className="text-xs text-[#6A6A6A]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#4C4C4C]">{u.phone || '—'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                            style={u.role === 'vendor' ? { background: '#FFF7ED', color: '#C2410C' } : { background: '#EFF6FF', color: '#1D4ED8' }}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#4C4C4C]">{u.bookingsCount ?? 0}</td>
                        <td className="px-6 py-4 text-[#6A6A6A] text-xs">
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          {u.isBlocked
                            ? <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#FEE2E2', color: '#991B1B' }}>Blocked</span>
                            : <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#DCFCE7', color: '#166534' }}>Active</span>
                          }
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => blockUser.mutate({ id: u._id, block: !u.isBlocked })} disabled={blockUser.isPending}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-100 transition-colors"
                            style={{ color: '#6A6A6A' }}>
                            {u.isBlocked ? <><ShieldCheck size={12} /> Unblock</> : <><ShieldOff size={12} /> Block</>}
                          </button>
                        </td>
                      </tr>
                    ))}
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

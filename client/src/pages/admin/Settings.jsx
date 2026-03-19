import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminSidebar from '../../components/shared/AdminSidebar'
import api from '../../services/api'

const DEFAULTS = {
  platformFeePercent: 10,
  minWithdrawalAmount: 1000,
  maxWithdrawalAmount: 500000,
  bookingCancellationHours: 48,
  supportEmail: 'support@ibento.in',
  maintenanceMode: false,
}

export default function AdminSettings() {
  const [form, setForm] = useState(null)

  const { isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data } = await api.get('/admin/settings')
      setForm(data.settings || DEFAULTS)
      return data.settings
    },
    onError: () => setForm(DEFAULTS),
  })

  const save = useMutation({
    mutationFn: (body) => api.put('/admin/settings', body),
    onSuccess: () => toast.success('Settings saved'),
    onError: () => toast.error('Failed to save settings'),
  })

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const fields = [
    { key: 'platformFeePercent', label: 'Platform Fee (%)', type: 'number', hint: 'Percentage deducted from each booking.' },
    { key: 'minWithdrawalAmount', label: 'Min Withdrawal (₹)', type: 'number', hint: 'Minimum amount vendors can withdraw.' },
    { key: 'maxWithdrawalAmount', label: 'Max Withdrawal (₹)', type: 'number', hint: 'Maximum per withdrawal request.' },
    { key: 'bookingCancellationHours', label: 'Cancellation Window (hours)', type: 'number', hint: 'Hours before event when free cancellation is allowed.' },
    { key: 'supportEmail', label: 'Support Email', type: 'email', hint: 'Shown to users when they need help.' },
  ]

  if (isLoading || !form) {
    return (
      <div className="flex min-h-screen" style={{ background: '#FFFDFC' }}>
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-[#6A6A6A] font-lato text-sm">Loading…</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFDFC' }}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="font-filson text-3xl font-bold" style={{ color: '#1A1A1A' }}>Settings</h1>
            <p className="text-[#6A6A6A] text-sm mt-1 font-lato">Configure platform-wide settings</p>
          </div>

          <form onSubmit={e => { e.preventDefault(); save.mutate(form) }} className="space-y-4">
            {/* Numeric + text fields */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="font-filson font-semibold text-lg" style={{ color: '#1A1A1A' }}>Platform Configuration</h2>
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium mb-1.5 font-lato" style={{ color: '#364153' }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key] ?? ''}
                    onChange={e => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-lato focus:outline-none focus:border-[#F06138]"
                    style={{ background: '#FAFAFA' }}
                  />
                  {f.hint && <p className="mt-1 text-xs text-[#6A6A6A] font-lato">{f.hint}</p>}
                </div>
              ))}
            </div>

            {/* Maintenance Mode */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm font-lato" style={{ color: '#1A1A1A' }}>Maintenance Mode</h3>
                  <p className="text-xs text-[#6A6A6A] font-lato mt-0.5">Temporarily disable the platform for users</p>
                </div>
                <button
                  type="button"
                  onClick={() => set('maintenanceMode', !form.maintenanceMode)}
                  className="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none"
                  style={{ background: form.maintenanceMode ? '#F06138' : '#D1D5DB' }}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.maintenanceMode ? 'translate-x-6' : ''}`} />
                </button>
              </div>
              {form.maintenanceMode && (
                <div className="mt-3 p-3 rounded-xl text-xs font-lato" style={{ background: '#FEF9C3', color: '#854D0E' }}>
                  Maintenance mode is ON — users will see a maintenance page.
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={save.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-filson font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: save.isPending ? '#c0956b' : '#F06138' }}
            >
              <Save size={16} />
              {save.isPending ? 'Saving…' : 'Save Settings'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

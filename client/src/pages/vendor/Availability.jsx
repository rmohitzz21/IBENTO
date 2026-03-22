import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarOff, Check, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import VendorSidebar from '../../components/shared/VendorSidebar'
import { updateAvailability, getVendorDashboard } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function toDateKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function VendorAvailability() {
  const today = new Date()
  const qc = useQueryClient()

  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [blockedDates, setBlockedDates] = useState(new Set())
  const [isAvailable, setIsAvailable] = useState(true)
  const [saved, setSaved] = useState(false)

  // Load vendor data (including current blockedDates and isAvailable)
  const { data: dashData, isLoading } = useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: getVendorDashboard,
  })

  // Populate state once data arrives
  useEffect(() => {
    const vendor = dashData?.data?.vendor
    if (!vendor) return
    setIsAvailable(vendor.isAvailable ?? true)
    const blocked = (vendor.blockedDates || []).map(toDateKey)
    setBlockedDates(new Set(blocked))
  }, [dashData])

  const mutation = useMutation({
    mutationFn: (payload) => updateAvailability(payload),
    onSuccess: () => {
      toast.success('Availability saved!')
      setSaved(true)
      qc.invalidateQueries(['vendor-dashboard'])
      setTimeout(() => setSaved(false), 2000)
    },
    onError: () => toast.error('Could not save availability. Please try again.'),
  })

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)

  function toggleDate(day) {
    const key = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setBlockedDates((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11) }
    else setCalMonth((m) => m - 1)
  }

  function nextMonth() {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0) }
    else setCalMonth((m) => m + 1)
  }

  function handleSave() {
    mutation.mutate({
      isAvailable,
      blockedDates: Array.from(blockedDates),
    })
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex min-h-screen bg-[#F8F8F4]">
      <VendorSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="font-filson font-black text-[#101828] text-2xl mb-8">Availability</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#F06138]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-black/5 p-6">
              {/* Nav */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#FFF3EF] transition-colors font-lato font-bold text-[#6A6A6A]">‹</button>
                <h2 className="font-filson font-black text-[#101828] text-lg">{MONTHS[calMonth]} {calYear}</h2>
                <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#FFF3EF] transition-colors font-lato font-bold text-[#6A6A6A]">›</button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} className="text-center font-lato font-semibold text-xs text-[#6A6A6A] py-1">{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const key = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const isBlocked = blockedDates.has(key)
                  const isPast = new Date(calYear, calMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                  const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate()
                  return (
                    <button
                      key={day}
                      onClick={() => !isPast && toggleDate(day)}
                      disabled={isPast}
                      title={isBlocked ? 'Click to unblock' : 'Click to block'}
                      className={`h-9 w-full rounded-lg font-lato text-sm transition-all ${isPast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                      style={isBlocked
                        ? { background: '#FFE2E2', color: '#9F0712', fontWeight: 600 }
                        : isToday
                        ? { background: '#F06138', color: '#fff', fontWeight: 700 }
                        : { background: 'transparent', color: '#364153' }
                      }
                    >
                      {day}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-black/5 text-xs font-lato text-[#6A6A6A]">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#F06138]" /> Today</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: '#FFE2E2' }} /> Blocked</div>
                <p className="ml-auto text-[10px] text-[#6A6A6A]">Click a date to block/unblock it</p>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-5">
              {/* Global toggle */}
              <div className="bg-white rounded-2xl border border-black/5 p-5">
                <h3 className="font-lato font-bold text-[#101828] text-sm mb-4">Booking Status</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-lato font-semibold text-[#101828] text-sm">{isAvailable ? 'Open for Bookings' : 'Closed'}</p>
                    <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">
                      {isAvailable ? 'Customers can book you' : 'No new bookings accepted'}
                    </p>
                  </div>
                  <button onClick={() => setIsAvailable((p) => !p)}>
                    {isAvailable
                      ? <ToggleRight size={36} className="text-[#F06138]" />
                      : <ToggleLeft size={36} className="text-gray-300" />
                    }
                  </button>
                </div>
              </div>

              {/* Blocked dates list */}
              <div className="bg-white rounded-2xl border border-black/5 p-5">
                <h3 className="font-lato font-bold text-[#101828] text-sm mb-3">
                  Blocked Dates
                  {blockedDates.size > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-lato" style={{ background: '#FFE2E2', color: '#9F0712' }}>
                      {blockedDates.size}
                    </span>
                  )}
                </h3>
                {blockedDates.size === 0 ? (
                  <div className="text-center py-6">
                    <CalendarOff size={28} className="text-gray-300 mx-auto mb-2" />
                    <p className="font-lato text-xs text-[#6A6A6A]">No dates blocked yet</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {Array.from(blockedDates).sort().map((d) => (
                      <div key={d} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: '#FFE2E2' }}>
                        <span className="font-lato text-xs text-[#9F0712] font-semibold">{d}</span>
                        <button
                          onClick={() => setBlockedDates((p) => { const n = new Set(p); n.delete(d); return n })}
                          className="text-[#9F0712] hover:text-red-700"
                          title="Unblock"
                        >
                          <CalendarOff size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={mutation.isPending}
                className="w-full py-3.5 rounded-xl font-lato font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ background: saved ? '#016630' : '#F06138', color: '#fff' }}
              >
                {saved
                  ? <><Check size={16} /> Saved!</>
                  : mutation.isPending
                  ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                  : 'Save Availability'
                }
              </motion.button>
            </div>
          </div>
        )}
      </main>
    </motion.div>
  )
}

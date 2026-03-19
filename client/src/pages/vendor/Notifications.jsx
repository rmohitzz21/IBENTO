import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, CheckCheck, CalendarCheck, IndianRupee, Star, Info } from 'lucide-react'
import VendorSidebar from '../../components/shared/VendorSidebar'
import { useNotificationStore } from '../../stores/notificationStore'
import { pageVariants } from '../../animations/pageTransitions'
import api from '../../services/api'

const MOCK = [
  { _id: 'n1', type: 'booking',  title: 'New Booking Request',  message: 'Priya Sharma requested the Basic Wedding Package for April 15.', isRead: false, createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
  { _id: 'n2', type: 'payment',  title: 'Payment Received',     message: '₹15,000 deposit received from Rahul Mehta.', isRead: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { _id: 'n3', type: 'review',   title: 'New 5-Star Review',    message: 'Ananya Singh left you a glowing review.', isRead: true, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { _id: 'n4', type: 'info',     title: 'Profile Incomplete',   message: 'Add portfolio images to attract more customers.', isRead: true, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
]

const TYPE_CONFIG = {
  booking: { icon: CalendarCheck, bg: '#DBEAFE', color: '#193CB8' },
  payment: { icon: IndianRupee,   bg: '#DCFCE7', color: '#016630' },
  review:  { icon: Star,          bg: '#FEF9C2', color: '#894B00' },
  info:    { icon: Info,          bg: '#F3F4F6', color: '#6A6A6A' },
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function VendorNotifications() {
  const { notifications, unreadCount, markAllRead, markOneRead } = useNotificationStore()

  const displayed = notifications.length > 0 ? notifications : MOCK

  function handleMarkAllRead() {
    markAllRead()
    api.put('/notifications/mark-all-read').catch(() => {})
  }

  function handleMarkOneRead(id) {
    markOneRead(id)
    api.put(`/notifications/${id}/read`).catch(() => {})
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex min-h-screen bg-[#F8F8F4]">
      <VendorSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFF3EF' }}>
              <Bell size={20} className="text-[#F06138]" />
            </div>
            <div>
              <h1 className="font-filson font-black text-[#101828] text-2xl">Notifications</h1>
              <p className="font-lato text-[#6A6A6A] text-sm">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleMarkAllRead} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-lato font-medium text-sm border border-[rgba(139,67,50,0.2)] text-[#364153] hover:bg-[#FFF3EF] transition-colors bg-white">
              <CheckCheck size={15} /> Mark all read
            </motion.button>
          )}
        </div>

        <div className="max-w-[760px]">
          {displayed.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-white border border-black/5">
              <BellOff size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="font-lato font-semibold text-[#101828] text-sm">No notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {displayed.map((n, i) => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
                  const Icon = cfg.icon
                  return (
                    <motion.div
                      key={n._id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      onClick={() => !n.isRead && handleMarkOneRead(n._id)}
                      className="flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer bg-white"
                      style={{ borderColor: n.isRead ? 'rgba(0,0,0,0.05)' : 'rgba(240,97,56,0.2)', background: n.isRead ? 'white' : '#FEFDEB' }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: cfg.bg }}>
                        <Icon size={18} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-lato text-sm ${n.isRead ? 'font-medium text-[#364153]' : 'font-bold text-[#101828]'}`}>{n.title}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-lato text-xs text-[#6A6A6A]">{timeAgo(n.createdAt)}</span>
                            {!n.isRead && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#F06138' }} />}
                          </div>
                        </div>
                        <p className="font-lato text-xs text-[#6A6A6A] mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </motion.div>
  )
}

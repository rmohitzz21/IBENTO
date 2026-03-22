import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Wrench,
  CalendarCheck,
  MessageSquare,
  Calendar,
  DollarSign,
  Star,
  BarChart2,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useNotificationStore } from '../../stores/notificationStore'

const NAV_ITEMS = [
  { label: 'Dashboard',     icon: LayoutDashboard, to: '/vendor/dashboard' },
  { label: 'Services',      icon: Wrench,          to: '/vendor/services' },
  { label: 'Bookings',      icon: CalendarCheck,   to: '/vendor/bookings' },
  { label: 'Messages',      icon: MessageSquare,   to: '/vendor/chat', badge: true },
  { label: 'Availability',  icon: Calendar,        to: '/vendor/availability' },
  { label: 'Earnings',      icon: DollarSign,      to: '/vendor/earnings' },
  { label: 'Reviews',       icon: Star,            to: '/vendor/reviews' },
  { label: 'Profile',       icon: Settings,        to: '/vendor/profile' },
  { label: 'Notifications', icon: BarChart2,       to: '/vendor/notifications' },
]

function computeProgress(vendor, user) {
  if (!vendor?._id) return 0
  let score = 0
  if (user?.avatar) score += 15
  if ((vendor.description || '').length >= 20) score += 20
  if (vendor.phone) score += 10
  if (vendor.category) score += 10
  if ((vendor.portfolio || []).length >= 3) score += 20
  if (vendor.bankAccount?.accountNumber) score += 15
  if (vendor.pan || vendor.aadhaar) score += 10
  return score
}

export default function VendorSidebar({ className = '' }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const unreadMessages = useNotificationStore?.((s) => s.unreadMessages) ?? 0

  const dashData = qc.getQueryData(['vendor-dashboard'])
  const vendor = dashData?.vendor || {}
  const profileProgress = computeProgress(vendor, user)

  const vendorName = vendor.businessName || user?.businessName || user?.name || 'Your Business'
  const vendorInitial = vendorName.charAt(0).toUpperCase()

  return (
    <aside
      className={[
        'flex flex-col bg-white h-screen sticky top-0 overflow-y-auto',
        'w-[336px] shrink-0',
        className,
      ].join(' ')}
      style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.06)' }}
    >
      {/* Logo */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <Link
          to="/vendor/dashboard"
          className="font-filson font-black text-2xl"
          style={{ color: '#8A4432', letterSpacing: '-0.04em' }}
        >
          ibento
        </Link>
        <p className="text-xs text-[#6A6A6A] mt-0.5 font-lato">Vendor Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group',
                  isActive
                    ? 'text-orange bg-orange-light border-l-[3px] border-orange pl-[calc(0.75rem-3px)]'
                    : 'text-[#4C4C4C] hover:bg-gray-50 border-l-[3px] border-transparent',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-orange' : 'text-[#6A6A6A] group-hover:text-[#4C4C4C]'
                    }`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && unreadMessages > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="min-w-[18px] h-[18px] rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1"
                      style={{ background: '#FB2C36' }}
                    >
                      {unreadMessages > 99 ? '99+' : unreadMessages}
                    </motion.span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="mx-4 mb-2">
        <button
          onClick={() => { logout(); navigate('/') }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Setup widget */}
      <div className="mx-4 mb-6 rounded-xl p-4" style={{ background: '#FEFDEB' }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden text-white font-bold text-sm"
            style={{ background: '#F06138' }}
          >
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : vendorInitial
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#424242] truncate font-filson">
              {vendorName}
            </p>
            <p className="text-xs text-[#6A6A6A]">Profile Setup</p>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#6A6A6A]">Completion</span>
            <span className="text-xs font-semibold text-orange">{profileProgress}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profileProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full"
              style={{ background: profileProgress === 100 ? '#016630' : '#F06138' }}
            />
          </div>
        </div>

        {profileProgress < 100 ? (
          <Link
            to="/vendor/profile"
            className="text-xs font-semibold text-orange hover:underline transition-colors"
          >
            Complete Profile →
          </Link>
        ) : (
          <p className="text-xs font-semibold text-[#016630]">Profile Complete!</p>
        )}
      </div>
    </aside>
  )
}

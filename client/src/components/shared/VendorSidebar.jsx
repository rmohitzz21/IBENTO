import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Wrench,
  CalendarCheck,
  MessageSquare,
  Calendar,
  IndianRupee,
  Star,
  Settings,
  LogOut,
  Bell,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useNotificationStore } from '../../stores/notificationStore'

const NAV_ITEMS = [
  { label: 'Dashboard',     icon: LayoutDashboard, to: '/vendor/dashboard' },
  { label: 'Services',      icon: Wrench,          to: '/vendor/services' },
  { label: 'Bookings',      icon: CalendarCheck,   to: '/vendor/bookings' },
  { label: 'Messages',      icon: MessageSquare,   to: '/vendor/chat',         badge: 'messages' },
  { label: 'Availability',  icon: Calendar,        to: '/vendor/availability' },
  { label: 'Earnings',      icon: IndianRupee,     to: '/vendor/earnings' },
  { label: 'Reviews',       icon: Star,            to: '/vendor/reviews' },
  { label: 'Notifications', icon: Bell,            to: '/vendor/notifications' },
  { label: 'Profile',       icon: Settings,        to: '/vendor/profile' },
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
      className={['flex flex-col h-screen sticky top-0 overflow-y-auto w-[252px] shrink-0', className].join(' ')}
      style={{
        background: '#FFFFFF',
        boxShadow: '4px 0 32px rgba(0,0,0,0.06)',
        borderRight: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-5">
        <Link to="/vendor/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #F06138 0%, #8A4432 100%)' }}
          >
            <Zap size={14} color="#FDFAD6" strokeWidth={2.5} fill="#FDFAD6" />
          </div>
          <span
            className="font-filson font-black text-[22px]"
            style={{ color: '#8A4432', letterSpacing: '-0.05em' }}
          >
            ibento
          </span>
        </Link>
        <span
          className="mt-2.5 inline-flex text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: '#FFF0EB', color: '#F06138' }}
        >
          Vendor Portal
        </span>
      </div>

      <div className="mx-5 h-px mb-1" style={{ background: 'rgba(0,0,0,0.05)' }} />

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 pt-3 pb-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'relative flex items-center gap-3 px-3 py-[9px] rounded-xl text-sm font-medium transition-colors duration-150 group',
                  isActive ? 'text-white' : 'text-[#4C4C4C] hover:bg-[#FFF5F2] hover:text-[#F06138]',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="vendor-nav-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(135deg, #F06138 0%, #C94B27 100%)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative flex items-center gap-3 flex-1">
                    <Icon
                      size={17}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-[#ADADAD] group-hover:text-[#F06138]'
                      }`}
                    />
                    <span className="flex-1 leading-none">{item.label}</span>
                    {item.badge === 'messages' && unreadMessages > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1"
                        style={{
                          background: isActive ? 'rgba(255,255,255,0.3)' : '#FB2C36',
                          color: '#fff',
                        }}
                      >
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                      </motion.span>
                    )}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* ── Sign Out ── */}
      <div className="px-3 pb-1">
        <button
          onClick={() => { logout(); navigate('/') }}
          className="flex items-center gap-3 w-full px-3 py-[9px] rounded-xl text-sm font-medium transition-colors duration-150 text-[#ADADAD] hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={17} strokeWidth={2} className="shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="mx-5 h-px my-3" style={{ background: 'rgba(0,0,0,0.05)' }} />

      {/* ── Profile Card ── */}
      <div
        className="mx-3 mb-5 rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(240,97,56,0.1)', boxShadow: '0 2px 12px rgba(240,97,56,0.06)' }}
      >
        <div
          className="px-4 pt-4 pb-3"
          style={{ background: 'linear-gradient(160deg, #FFF8F5 0%, #FFFEF9 100%)' }}
        >
          <div className="flex items-center gap-3">
            {/* Avatar with ring */}
            <div className="relative shrink-0">
              <div
                className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm"
                style={{
                  background: user?.avatar ? 'transparent' : 'linear-gradient(135deg, #F06138, #8A4432)',
                  boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px rgba(240,97,56,0.3)',
                }}
              >
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  : vendorInitial
                }
              </div>
              {profileProgress === 100 && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: '#016630', border: '2px solid #fff' }}
                >
                  <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                    <path d="M1 3L2.8 5L6 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate font-filson" style={{ color: '#1A1A1A', lineHeight: 1.2 }}>
                {vendorName}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                {profileProgress < 100 ? `${profileProgress}% profile done` : 'Profile complete'}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="h-[5px] w-full rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profileProgress}%` }}
                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
                className="h-full rounded-full"
                style={{
                  background: profileProgress === 100
                    ? 'linear-gradient(90deg, #016630 0%, #22C55E 100%)'
                    : 'linear-gradient(90deg, #F06138 0%, #D9552E 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        {profileProgress < 100 ? (
          <Link
            to="/vendor/profile"
            className="flex items-center justify-between px-4 py-2.5 text-[11px] font-semibold tracking-wide transition-colors hover:opacity-80"
            style={{
              background: '#FFF2EE',
              color: '#F06138',
              borderTop: '1px solid rgba(240,97,56,0.08)',
            }}
          >
            <span>Complete your profile</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="#F06138" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ) : (
          <div
            className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-semibold"
            style={{ background: '#F0FDF4', color: '#016630', borderTop: '1px solid rgba(1,102,48,0.08)' }}
          >
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4.5L4 7.5L10 1" stroke="#016630" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>All set — profile complete!</span>
          </div>
        )}
      </div>
    </aside>
  )
}

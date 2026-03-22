import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Store,
  Users,
  CalendarCheck,
  Wallet,
  Star,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const NAV_ITEMS = [
  { label: 'Dashboard',    icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Vendors',      icon: Store,           to: '/admin/vendors',  badge: true },
  { label: 'Users',        icon: Users,           to: '/admin/users' },
  { label: 'Bookings',     icon: CalendarCheck,   to: '/admin/bookings' },
  { label: 'Withdrawals',  icon: Wallet,          to: '/admin/payments' },
  { label: 'Reviews',      icon: Star,            to: '/admin/reviews' },
  { label: 'Settings',     icon: Settings,        to: '/admin/settings' },
]

/**
 * AdminSidebar — cream-styled sidebar for the admin dashboard.
 *
 * @param {number}  pendingApprovals  - count shown on "Vendor Approvals" badge
 * @param {string}  className         - extra classes
 */
export default function AdminSidebar({ pendingApprovals = 0, className = '' }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const adminName = user?.name ?? 'Admin'
  const adminInitial = adminName.charAt(0).toUpperCase()

  return (
    <aside
      className={[
        'flex flex-col bg-white h-screen sticky top-0 overflow-y-auto',
        'w-[280px] shrink-0',
        className,
      ].join(' ')}
      style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.06)' }}
    >
      {/* Logo + Admin badge */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Link
            to="/admin/dashboard"
            className="font-filson font-black text-2xl"
            style={{ color: '#8A4432', letterSpacing: '-0.04em' }}
          >
            ibento
          </Link>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ background: '#F06138', color: '#fff' }}
          >
            Admin
          </span>
        </div>
        <p className="text-xs text-[#6A6A6A] mt-0.5">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const showBadge = item.badge && pendingApprovals > 0

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
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

                  {showBadge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="min-w-[18px] h-[18px] rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1"
                      style={{ background: '#F06138' }}
                    >
                      {pendingApprovals > 99 ? '99+' : pendingApprovals}
                    </motion.span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Admin profile footer */}
      <div className="mx-4 mb-2 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm"
            style={{ background: '#8A4432' }}
          >
            {adminInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#424242] truncate">{adminName}</p>
            <p className="text-xs text-[#6A6A6A]">Administrator</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="mx-4 mb-6">
        <button
          onClick={() => { logout(); navigate('/') }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={17} className="shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

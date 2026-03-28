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
  ShieldCheck,
  Zap,
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

export default function AdminSidebar({ pendingApprovals = 0, className = '' }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const adminName = user?.name ?? 'Admin'
  const adminInitial = adminName.charAt(0).toUpperCase()

  return (
    <aside
      className={['flex flex-col h-screen sticky top-0 overflow-y-auto w-[252px] shrink-0', className].join(' ')}
      style={{
        background: '#1A1008',
        boxShadow: '4px 0 32px rgba(0,0,0,0.2)',
      }}
    >
      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-5">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #F06138 0%, #8A4432 100%)' }}
          >
            <Zap size={14} color="#FDFAD6" strokeWidth={2.5} fill="#FDFAD6" />
          </div>
          <span
            className="font-filson font-black text-[22px]"
            style={{ color: '#FDFAD6', letterSpacing: '-0.05em' }}
          >
            ibento
          </span>
        </Link>
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(240,97,56,0.2)', color: '#F06138' }}
          >
            <ShieldCheck size={9} strokeWidth={2.5} />
            Admin Panel
          </span>
        </div>
      </div>

      <div className="mx-5 h-px mb-1" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 pt-3 pb-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const showBadge = item.badge && pendingApprovals > 0

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'relative flex items-center gap-3 px-3 py-[9px] rounded-xl text-sm font-medium transition-colors duration-150 group',
                  isActive
                    ? 'text-white'
                    : 'text-[rgba(253,250,214,0.5)] hover:bg-white/5 hover:text-[#FDFAD6]',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="admin-nav-pill"
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
                        isActive ? 'text-white' : 'opacity-60 group-hover:opacity-100'
                      }`}
                    />
                    <span className="flex-1 leading-none">{item.label}</span>
                    {showBadge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1"
                        style={{
                          background: isActive ? 'rgba(255,255,255,0.25)' : '#F06138',
                          color: '#fff',
                        }}
                      >
                        {pendingApprovals > 99 ? '99+' : pendingApprovals}
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
          className="flex items-center gap-3 w-full px-3 py-[9px] rounded-xl text-sm font-medium transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400"
          style={{ color: 'rgba(253,250,214,0.35)' }}
        >
          <LogOut size={17} strokeWidth={2} className="shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="mx-5 h-px my-3" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* ── Admin Profile Card ── */}
      <div
        className="mx-3 mb-5 rounded-2xl p-4"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
            style={{
              background: 'linear-gradient(135deg, #F06138, #8A4432)',
              color: '#FDFAD6',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.08), 0 0 0 4px rgba(240,97,56,0.15)',
            }}
          >
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              : adminInitial
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate font-filson" style={{ color: '#FDFAD6', lineHeight: 1.2 }}>
              {adminName}
            </p>
            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'rgba(253,250,214,0.45)' }}>
              <ShieldCheck size={10} />
              Administrator
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

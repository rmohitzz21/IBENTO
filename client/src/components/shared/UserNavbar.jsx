import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  ChevronDown,
  MapPin,
  User,
  Menu,
  X,
  Plus,
  LogOut,
  Bell,
  CalendarCheck,
  BadgePercent,
  Settings,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useCityStore } from '../../stores/cityStore'
import { useNotificationStore } from '../../stores/notificationStore'

const CITIES = ['Ahmedabad', 'Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata']

const NAV_LINKS = [
  { label: 'My Bookings', to: '/bookings' },
  { label: 'Offers',      to: '/offers' },
  { label: 'Explore',     to: '/explore' },
]

const PROFILE_ITEMS = [
  { label: 'My Profile',   to: '/profile',    icon: User },
  { label: 'My Bookings',  to: '/bookings',   icon: CalendarCheck },
  { label: 'Wishlist',     to: '/wishlist',   icon: Heart },
  { label: 'Offers',       to: '/offers',     icon: BadgePercent },
]

export default function UserNavbar() {
  const { user } = useAuthStore()
  const items = useCartStore((s) => s.items)
  const { city, setCity } = useCityStore()
  const unreadNotifs = useNotificationStore?.((s) => s.unreadCount) ?? 0

  const [cityOpen, setCityOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const cityRef = useRef(null)
  const profileRef = useRef(null)
  const navigate = useNavigate()

  const wishlistCount = useCartStore((s) => s.items?.length ?? 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setCityOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const displayName = user?.name?.split(' ')[0] ?? 'You'
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={
        scrolled
          ? { background: 'rgba(255,253,252,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }
          : { background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.05)' }
      }
    >
      {/* ── Main Row ── */}
      <div className="max-w-[1280px] mx-auto px-5 h-[60px] flex items-center gap-5">

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F06138 0%, #8A4432 100%)' }}
          >
            <Zap size={13} color="#FDFAD6" strokeWidth={2.5} fill="#FDFAD6" />
          </div>
          <span
            className="font-filson font-black text-xl"
            style={{ color: '#8A4432', letterSpacing: '-0.05em' }}
          >
            ibento
          </span>
        </Link>

        {/* City Selector */}
        <div className="relative hidden md:block" ref={cityRef}>
          <button
            onClick={() => setCityOpen((p) => !p)}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors rounded-lg px-2.5 py-1.5 hover:bg-[#FFF5F2]"
            style={{ color: '#4C4C4C' }}
          >
            <MapPin size={13} style={{ color: '#F06138' }} />
            <span>{city}</span>
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${cityOpen ? 'rotate-180' : ''}`}
              style={{ color: '#9CA3AF' }}
            />
          </button>

          <AnimatePresence>
            {cityOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute top-full left-0 mt-1.5 w-44 bg-white rounded-xl py-1.5 z-50"
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)' }}
              >
                {CITIES.map((c) => (
                  <li key={c}>
                    <button
                      onClick={() => { setCity(c); setCityOpen(false) }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
                      style={
                        c === city
                          ? { color: '#F06138', background: '#FFF0EB', fontWeight: 600 }
                          : { color: '#4C4C4C' }
                      }
                      onMouseEnter={(e) => { if (c !== city) e.currentTarget.style.background = '#FAFAFA' }}
                      onMouseLeave={(e) => { if (c !== city) e.currentTarget.style.background = 'transparent' }}
                    >
                      {c === city && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#F06138' }} />}
                      {c}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1" />

        {/* Wishlist */}
        <Link
          to="/wishlist"
          className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl transition-colors relative"
          aria-label="Wishlist"
          style={{ color: '#F06138' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#FFF0EB'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Heart size={19} fill="#F06138" />
          {wishlistCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
              style={{ background: '#FB2C36' }}
            >
              {wishlistCount > 9 ? '9+' : wishlistCount}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl transition-colors relative"
          aria-label="Notifications"
          onMouseEnter={(e) => e.currentTarget.style.background = '#FFF0EB'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Bell size={19} style={{ color: '#4C4C4C' }} />
          {unreadNotifs > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
              style={{ background: '#FB2C36' }}
            >
              {unreadNotifs > 9 ? '9+' : unreadNotifs}
            </motion.span>
          )}
        </Link>

        {/* Profile Button */}
        <div className="hidden md:block relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl transition-all"
            style={profileOpen ? { background: '#FFF0EB' } : { background: 'transparent' }}
            onMouseEnter={(e) => { if (!profileOpen) e.currentTarget.style.background = '#FFF5F2' }}
            onMouseLeave={(e) => { if (!profileOpen) e.currentTarget.style.background = 'transparent' }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #F06138, #8A4432)' }}
            >
              {user?.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                : userInitial
              }
            </div>
            <span className="text-sm font-semibold font-filson" style={{ color: '#1A1A1A' }}>
              {displayName}
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
              style={{ color: '#9CA3AF' }}
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl py-1.5 z-50 overflow-hidden"
                style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)' }}
              >
                {/* User info header */}
                <div className="px-4 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <p className="text-sm font-semibold font-filson" style={{ color: '#101828' }}>{user?.name || displayName}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#9CA3AF' }}>{user?.email}</p>
                </div>

                <div className="py-1">
                  {PROFILE_ITEMS.map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: '#364153' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF5F2'; e.currentTarget.style.color = '#F06138' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#364153' }}
                      >
                        <ItemIcon size={15} strokeWidth={2} />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>

                <div style={{ borderTop: '1px solid #F3F4F6' }}>
                  <button
                    onClick={() => { useAuthStore.getState().logout(); navigate('/') }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors"
                    style={{ color: '#EF4444' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={15} strokeWidth={2} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-xl transition-colors"
          onClick={() => setMobileOpen((p) => !p)}
          style={{ color: '#4C4C4C' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Secondary Nav ── */}
      <div
        className="hidden md:block"
        style={{
          background: scrolled ? 'transparent' : '#FFF8F5',
          borderTop: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-5 h-9 flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-[13px] font-medium transition-colors pb-[1px] ${
                  isActive ? 'text-[#F06138] border-b-2 border-[#F06138]' : 'text-[#4C4C4C] hover:text-[#F06138]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="flex-1" />

          <NavLink
            to="/create-event"
            className={({ isActive }) =>
              `flex items-center gap-1 text-[13px] font-semibold transition-colors ${
                isActive ? 'text-[#F06138]' : 'text-[#F06138] hover:text-[#D9552E]'
              }`
            }
          >
            <Plus size={13} strokeWidth={2.5} /> Create Event
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `text-[13px] font-medium transition-colors ${
                isActive ? 'text-[#F06138]' : 'text-[#4C4C4C] hover:text-[#F06138]'
              }`
            }
          >
            Contact us
          </NavLink>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white overflow-hidden"
            style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
          >
            <div className="px-5 py-4 space-y-1">
              {/* City */}
              <div className="flex items-center gap-2 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
                <MapPin size={15} style={{ color: '#F06138' }} />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="text-sm bg-transparent border-none outline-none font-medium"
                  style={{ color: '#4C4C4C' }}
                >
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {[...NAV_LINKS, { label: '+ Create Event', to: '/create-event' }, { label: 'Contact us', to: '/contact' }].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'text-[#F06138]' : 'text-[#4C4C4C]'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-[#4C4C4C]">
                  <Heart size={17} style={{ color: '#F06138' }} fill="#F06138" /> Wishlist
                </Link>
                <Link to="/notifications" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-[#4C4C4C]">
                  <Bell size={17} style={{ color: '#4C4C4C' }} /> Notifications
                </Link>
              </div>

              <div className="pt-3 space-y-1" style={{ borderTop: '1px solid #F3F4F6' }}>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-2.5"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #F06138, #8A4432)' }}
                  >
                    {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : userInitial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#101828' }}>{user?.name || displayName}</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>View profile</p>
                  </div>
                </Link>
                <button
                  onClick={() => { useAuthStore.getState().logout(); navigate('/') }}
                  className="flex items-center gap-3 w-full py-2.5 text-sm font-medium text-red-500"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50">
                    <LogOut size={16} className="text-red-500" />
                  </div>
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

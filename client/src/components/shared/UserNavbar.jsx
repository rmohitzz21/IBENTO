import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Heart,
  ChevronDown,
  MapPin,
  User,
  Menu,
  X,
  Plus,
  Phone,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'

const CITIES = [
  'Ahmedabad',
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
]

const secondaryLinks = [
  { label: 'My Bookings', to: '/bookings' },
  { label: 'Offers', to: '/offers' },
  { label: 'Services', to: '/services' },
]

const rightLinks = [
  { label: '+ Create Events', to: '/create-event', highlight: true },
  { label: 'Contact us', to: '/contact' },
]

export default function UserNavbar() {
  const { user } = useAuthStore()
  const items = useCartStore((s) => s.items)
  const cartCount = items.length

  const [city, setCity] = useState('Ahmedabad')
  const [cityOpen, setCityOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const cityRef = useRef(null)
  const profileRef = useRef(null)
  const navigate = useNavigate()

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setCityOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const displayName = user?.name?.split(' ')[0] ?? 'Aradhya'

  return (
    <header className={`sticky top-0 z-50 ${scrolled ? 'shadow-md' : ''}`}>
      {/* ── Strip 1: Main ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link
            to="/"
            className="font-filson font-black text-2xl text-brown shrink-0"
            style={{ letterSpacing: '-0.04em' }}
          >
            ibento
          </Link>

          {/* Location dropdown */}
          <div className="relative hidden md:block" ref={cityRef}>
            <button
              onClick={() => setCityOpen((p) => !p)}
              className="flex items-center gap-1.5 text-[#4C4C4C] text-sm font-medium border-b border-[#4C4C4C] pb-0.5 hover:border-orange transition-colors"
            >
              <MapPin size={14} className="text-orange" />
              <span>{city}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${cityOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {cityOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-modal border border-gray-100 py-1 z-50"
                >
                  {CITIES.map((c) => (
                    <li key={c}>
                      <button
                        onClick={() => { setCity(c); setCityOpen(false) }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors
                          ${c === city
                            ? 'text-orange font-semibold bg-orange-light'
                            : 'text-[#4C4C4C] hover:bg-gray-50'
                          }`}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-full hover:bg-orange-light transition-colors"
            aria-label="Wishlist"
          >
            <Heart size={20} className="text-orange fill-orange" />
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="hidden md:flex items-center justify-center relative w-9 h-9 rounded-full hover:bg-orange-light transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart size={20} className="text-orange" />
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                style={{ background: '#FB2C36' }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </motion.span>
            )}
          </Link>

          {/* Profile button */}
          <div className="hidden md:block relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className="flex items-center gap-2 px-3 py-2 rounded-[8px] text-[#FDFAD6]"
              style={{ background: '#F06138', width: 115, fontSize: 14 }}
            >
              <User size={16} className="shrink-0" />
              <span className="font-filson font-medium truncate">{displayName}</span>
              <ChevronDown
                size={14}
                className={`ml-auto shrink-0 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-modal border border-gray-100 py-1 z-50"
                >
                  {[
                    { label: 'My Profile', to: '/profile' },
                    { label: 'My Bookings', to: '/bookings' },
                    { label: 'Wishlist', to: '/wishlist' },
                    { label: 'Settings', to: '/settings' },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#4C4C4C] hover:bg-orange-light hover:text-orange transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => { useAuthStore.getState().logout(); navigate('/') }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Strip 2: Secondary ── */}
      <div className="hidden md:block" style={{ background: '#FFF3EF' }}>
        <div className="max-w-[1280px] mx-auto px-6 h-10 flex items-center">
          {/* Left links */}
          <div className="flex items-center gap-6">
            {secondaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors pb-0.5
                  ${isActive
                    ? 'text-orange border-b-2 border-orange'
                    : 'text-[#4C4C4C] hover:text-orange'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex-1" />

          {/* Right links */}
          <div className="flex items-center gap-6">
            {rightLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors pb-0.5 flex items-center gap-1
                  ${isActive
                    ? 'text-orange border-b-2 border-orange'
                    : link.highlight
                    ? 'text-orange hover:text-orange-dark'
                    : 'text-[#4C4C4C] hover:text-orange'
                  }`
                }
              >
                {link.highlight && <Plus size={13} />}
                {link.label}
              </NavLink>
            ))}
          </div>
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
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {/* City selector */}
              <div className="flex items-center gap-2 py-3 border-b border-gray-100">
                <MapPin size={16} className="text-orange" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="text-sm text-[#4C4C4C] bg-transparent border-none outline-none font-medium"
                >
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {[...secondaryLinks, ...rightLinks].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block py-2.5 text-sm font-medium transition-colors
                    ${isActive ? 'text-orange' : 'text-[#4C4C4C]'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Mobile cart/wishlist */}
              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm text-[#4C4C4C]"
                >
                  <Heart size={18} className="text-orange fill-orange" /> Wishlist
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm text-[#4C4C4C]"
                >
                  <ShoppingCart size={18} className="text-orange" />
                  Cart {cartCount > 0 && <span className="text-orange font-bold">({cartCount})</span>}
                </Link>
              </div>

              {/* Profile */}
              <div className="pt-3 border-t border-gray-100">
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-2"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: '#F06138' }}
                  >
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-[#4C4C4C]">{displayName}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Packages', to: '/packages' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_2px_16px_rgba(0,0,0,0.08)]' : ''
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center gap-8">
        {/* Logo */}
        <Link
          to="/"
          className="font-filson font-black text-2xl shrink-0"
          style={{ color: '#8A4432', letterSpacing: '-0.04em' }}
        >
          ibento
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 flex-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors pb-0.5
                ${
                  isActive
                    ? 'text-orange border-b-2 border-orange'
                    : 'text-[#4C4C4C] hover:text-orange'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <Link
            to="/vendor"
            className="px-5 py-2 rounded-lg text-sm font-semibold border border-orange text-orange hover:bg-orange-light transition-colors"
          >
            Join as Vendor
          </Link>
          <Link
            to="/sign-in"
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ background: '#F06138' }}
          >
            Sign In
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-modal flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
                <span
                  className="font-filson font-black text-xl"
                  style={{ color: '#8A4432', letterSpacing: '-0.04em' }}
                >
                  ibento
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 px-6 py-6 space-y-1 overflow-y-auto">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <NavLink
                      to={link.to}
                      end={link.to === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `block py-3 text-base font-medium border-b border-gray-50 transition-colors
                        ${isActive ? 'text-orange' : 'text-[#4C4C4C]'}`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* CTA buttons */}
              <div className="px-6 pb-8 space-y-3">
                <Link
                  to="/vendor"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full py-3 rounded-lg text-sm font-semibold text-center border border-orange text-orange hover:bg-orange-light transition-colors"
                >
                  Join as Vendor
                </Link>
                <Link
                  to="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full py-3 rounded-lg text-sm font-semibold text-center text-white transition-colors hover:opacity-90"
                  style={{ background: '#F06138' }}
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

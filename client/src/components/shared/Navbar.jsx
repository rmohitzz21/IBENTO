import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const NAV_LINKS = [
  { label: 'Home',           to: '/'               },
  { label: 'Browse',         to: '/browse'         },
  { label: 'Become a Vendor', to: '/become-vendor' },
  { label: 'About',          to: '/about'          },
  { label: 'Contact',        to: '/contact'        },
]

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled]     = useState(false)

  const dashboardHref =
    user?.role === 'vendor' ? '/vendor/dashboard' :
    user?.role === 'admin'  ? '/admin/dashboard'  : '/home'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-xl shadow-[0_4px_32px_rgba(0,0,0,0.05)] border-b border-white/50' : 'bg-white border-b border-black/5'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center gap-8">
        {/* Logo — goes to dashboard if signed in, else landing */}
        <Link
          to={isAuthenticated ? dashboardHref : '/'}
          className="font-filson font-black text-2xl shrink-0 hover:opacity-80 transition-opacity"
          style={{ color: '#8A4432', letterSpacing: '-0.04em' }}
        >
          ibento
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 flex-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium font-lato transition-colors pb-0.5 ${
                  isActive
                    ? 'text-[#F06138] border-b-2 border-[#F06138]'
                    : 'text-[#4C4C4C] hover:text-[#F06138]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => { logout(); navigate('/') }}
                className="px-4 py-2 rounded-lg text-sm font-semibold font-lato text-[#364153] hover:text-red-500 transition-colors"
              >
                Sign Out
              </button>
              <Link
                to={dashboardHref}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold font-lato text-white transition-colors hover:opacity-90"
                style={{ background: '#F06138' }}
              >
                <LayoutDashboard size={15} /> Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 rounded-lg text-sm font-semibold font-lato text-[#364153] hover:text-[#F06138] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 rounded-xl text-sm font-semibold font-lato text-white transition-all hover:scale-105 shadow-[0_4px_12px_rgba(240,97,56,0.3)]"
                style={{ background: 'linear-gradient(135deg, #F06138, #8B4332)' }}
              >
                Get Started
              </Link>
            </>
          )}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 h-full w-72 bg-white z-50 flex flex-col"
              style={{ boxShadow: '0 0 40px rgba(0,0,0,0.15)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
                <span
                  className="font-filson font-black text-xl"
                  style={{ color: '#8A4432', letterSpacing: '-0.04em' }}
                >
                  ibento
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
                        `block py-3 text-base font-medium font-lato border-b border-gray-50 transition-colors ${
                          isActive ? 'text-[#F06138]' : 'text-[#4C4C4C]'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* CTA buttons */}
              <div className="px-6 pb-8 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={dashboardHref}
                      onClick={() => setMobileOpen(false)}
                      className="block w-full py-3 rounded-lg text-sm font-semibold font-lato text-center text-white transition-colors hover:opacity-90"
                      style={{ background: '#F06138' }}
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={() => { logout(); navigate('/'); setMobileOpen(false) }}
                      className="block w-full py-3 rounded-lg text-sm font-semibold font-lato text-center border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full py-3 rounded-lg text-sm font-semibold font-lato text-center border border-[#F06138] text-[#F06138] hover:bg-[#FFF3EF] transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full py-3 rounded-lg text-sm font-semibold font-lato text-center text-white transition-colors hover:opacity-90"
                      style={{ background: '#F06138' }}
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

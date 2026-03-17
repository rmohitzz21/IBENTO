import { Link } from 'react-router-dom'
import { Mail, Phone, Facebook, Instagram, Youtube, Twitter } from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Packages', to: '/packages' },
]

const SUPPORT_LINKS = [
  { label: 'Contact Us', to: '/contact' },
  { label: 'FAQs', to: '/faqs' },
]

const SOCIAL = [
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Youtube, label: 'YouTube', href: 'https://youtube.com' },
  { icon: Twitter, label: 'X (Twitter)', href: 'https://x.com' },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* ── Watermark text (outside / behind card) ── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col items-center pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <span
          className="font-filson font-black whitespace-nowrap leading-none"
          style={{
            fontSize: 'clamp(64px, 10vw, 128px)',
            color: '#8A4432',
            opacity: 0.07,
          }}
        >
          MAKE IT WITH
        </span>
      </div>

      {/* ── Brown card ── */}
      <div
        className="relative z-10 mx-auto max-w-[1280px] px-4"
        style={{ paddingBottom: '80px' }}
      >
        <div
          className="rounded-t-[16px] px-12 py-12"
          style={{ background: '#8A4432' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* ── Left column: contact + socials ── */}
            <div className="space-y-5">
              <h3
                className="text-white font-lato font-extrabold text-2xl leading-tight"
              >
                Drop us a hello!!
              </h3>

              <a
                href="mailto:hello@ibento.in"
                className="flex items-center gap-3 text-white text-sm hover:opacity-80 transition-opacity"
              >
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Mail size={15} />
                </span>
                hello@ibento.in
              </a>

              <a
                href="tel:+919876543210"
                className="flex items-center gap-3 text-white text-sm hover:opacity-80 transition-opacity"
              >
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Phone size={15} />
                </span>
                +91 98765 43210
              </a>

              {/* Social icons */}
              <div className="flex items-center gap-3 pt-1">
                {SOCIAL.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* ── Center column: brand + tagline ── */}
            <div className="flex flex-col items-center text-center space-y-3">
              <span
                className="font-filson font-black text-white"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-0.04em' }}
              >
                ibento
              </span>
              <p className="font-filson font-bold text-2xl text-white leading-snug">
                Seamless Events,
              </p>
              <p className="font-filson font-bold text-2xl text-white leading-snug">
                Transparent Pricing.
              </p>
              <p
                className="text-sm font-lato text-white leading-relaxed max-w-[220px]"
                style={{ opacity: 0.8 }}
              >
                Plan unforgettable moments with trusted vendors and clear pricing — all in one place.
              </p>
            </div>

            {/* ── Right column: quick links + support ── */}
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-lato font-semibold text-sm uppercase tracking-wider mb-3">
                  Quick Links
                </h4>
                <ul className="space-y-2">
                  {QUICK_LINKS.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-sm font-lato text-white transition-opacity hover:opacity-100"
                        style={{ opacity: 0.8 }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-lato font-semibold text-sm uppercase tracking-wider mb-3">
                  Support
                </h4>
                <ul className="space-y-2">
                  {SUPPORT_LINKS.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-sm font-lato text-white transition-opacity hover:opacity-100"
                        style={{ opacity: 0.8 }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div
            className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm font-lato text-white"
            style={{ borderTop: '1px solid rgba(255,255,255,0.2)', opacity: 0.85 }}
          >
            <p>© 2025 iBento. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
              <span className="opacity-40">|</span>
              <Link to="/security" className="hover:opacity-100 transition-opacity">Security</Link>
              <span className="opacity-40">|</span>
              <Link to="/terms" className="hover:opacity-100 transition-opacity">Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>

        {/* ── Japanese tagline below card ── */}
        <div className="relative z-10 flex flex-col items-center mt-6 gap-1 pb-4">
          <div className="flex items-center gap-2">
            <span
              className="font-filson font-black text-3xl"
              style={{ color: '#8A4432' }}
            >
              iBento
            </span>
            <span
              className="font-lato text-xl"
              style={{ color: '#8A4432' }}
            >
              (イベント)
            </span>
            <button
              aria-label="Pronounce iBento"
              title="How to pronounce"
              className="text-[#8A4432] hover:opacity-70 transition-opacity"
            >
              🔊
            </button>
          </div>
          <p
            className="text-xs font-lato text-center max-w-xs"
            style={{ color: '#8A4432', opacity: 0.65 }}
          >
            イベントは日本語で「イベント」という意味です。
            私たちはシームレスなイベント体験をお届けします。
          </p>
        </div>
      </div>
    </footer>
  )
}

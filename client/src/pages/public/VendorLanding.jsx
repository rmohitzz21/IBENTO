import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Star, MapPin, ChevronRight, ArrowRight,
  Camera, Utensils, Music, Flower2, Video, Car,
  CheckCircle, TrendingUp, Shield, Zap,
} from 'lucide-react'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import SearchBar from '../../components/shared/SearchBar'
import { pageVariants, fadeInUp, staggerContainer } from '../../animations/pageTransitions'

/* ─── Data ───────────────────────────────────────────────── */
const STATS = [
  { value: '500+', label: 'Verified Vendors' },
  { value: '12,000+', label: 'Events Planned' },
  { value: '40+', label: 'Cities Covered' },
  { value: '4.8★', label: 'Average Rating' },
]

const CATEGORIES = [
  { icon: Flower2,   label: 'Weddings',       color: '#FFF3EF', accent: '#F06138', img: 'photo-1519167758481-83f550bb49b3' },
  { icon: Camera,    label: 'Photography',     color: '#FFF9F8', accent: '#8B4332', img: 'photo-1606216794074-735e91aa2c92' },
  { icon: Utensils,  label: 'Catering',        color: '#FDFAD6', accent: '#894B00', img: 'photo-1555244162-803834f70033' },
  { icon: Music,     label: 'Entertainment',   color: '#F0FDF4', accent: '#016630', img: 'photo-1501386761578-eaa54522def9' },
  { icon: Video,     label: 'Decoration',      color: '#EFF6FF', accent: '#193CB8', img: 'photo-1530103862676-de8c9debad1d' },
  { icon: Car,       label: 'Transportation',  color: '#F5F3FF', accent: '#6B21A8', img: 'photo-1544620347-c4fd4a3d5957' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Browse & Discover',
    desc: 'Search from 500+ verified event vendors across weddings, catering, decor, photography and more.',
  },
  {
    step: '02',
    title: 'Compare & Choose',
    desc: 'View portfolios, read real reviews, compare transparent pricing — no hidden charges.',
  },
  {
    step: '03',
    title: 'Book & Celebrate',
    desc: 'Book in minutes, pay securely via Razorpay, and focus on enjoying your event.',
  },
]

const VENDOR_PERKS = [
  { icon: TrendingUp, title: 'Grow Your Reach', desc: 'Get discovered by thousands of customers looking for event services in your city.' },
  { icon: Shield,     title: 'Secure Payments',  desc: 'Receive payments directly to your account with full Razorpay protection.' },
  { icon: Zap,        title: 'Smart Dashboard',  desc: 'Manage bookings, availability, earnings and reviews from one clean dashboard.' },
  { icon: CheckCircle, title: 'Verified Badge',  desc: 'Build trust with a verified vendor badge after a quick document check.' },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    role: 'Bride',
    quote: 'Found our wedding photographer and decorator within an hour. Transparent pricing made it stress-free!',
    rating: 5,
    avatar: 'https://i.pravatar.cc/80?img=47',
  },
  {
    name: 'Rohit Mehta',
    location: 'Bangalore',
    role: 'Corporate Event Manager',
    quote: 'Managed our annual company event entirely through iBento. The vendor coordination tools saved us days of work.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/80?img=12',
  },
  {
    name: 'Anjali Kapoor',
    location: 'Delhi',
    role: 'Birthday Party Host',
    quote: 'Booked catering and entertainment for 150 guests in under 20 minutes. Will use again for sure!',
    rating: 5,
    avatar: 'https://i.pravatar.cc/80?img=44',
  },
]

/* ─── Section fade-in wrapper ────────────────────────────── */
function Section({ children, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Star rating ────────────────────────────────────────── */
function Stars({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} className="text-[#F06138] fill-[#F06138]" />
      ))}
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────── */
export default function VendorLanding() {
  const navigate = useNavigate()

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-[#FFFDFC]"
    >
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=80"
            alt="Wedding celebration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-28 md:py-36">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-2xl"
          >
            <motion.span
              variants={fadeInUp}
              className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-semibold font-lato tracking-wider uppercase"
              style={{ background: 'rgba(240,97,56,0.2)', color: '#F06138', border: '1px solid rgba(240,97,56,0.4)' }}
            >
              India's #1 Event Marketplace
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              className="font-filson font-black text-white mb-4 leading-tight"
              style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
            >
              Seamless Events,<br />
              <span style={{ color: '#F06138' }}>Transparent Pricing.</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="font-lato text-white/80 mb-8 text-lg max-w-xl"
            >
              Discover 500+ verified vendors for weddings, birthdays, corporate events and more — all in one place across India.
            </motion.p>

            {/* Search */}
            <motion.div variants={fadeInUp} className="mb-6">
              <SearchBar
                hero
                placeholder="Search vendors, services, cities…"
                buttonLabel="Find Vendors"
                onSubmit={(q) => navigate(`/browse?q=${encodeURIComponent(q)}`)}
                className="max-w-xl"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-lato font-semibold text-sm text-white border border-white/40 hover:bg-white/10 transition-colors"
              >
                Browse All Vendors <ArrowRight size={16} />
              </Link>
              <Link
                to="/vendor/apply"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-lato font-semibold text-sm transition-colors hover:opacity-90"
                style={{ background: '#F06138', color: '#FDFAD6' }}
              >
                Join as Vendor <ChevronRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <section style={{ background: '#8B4332' }}>
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-filson font-black text-white text-3xl">{s.value}</p>
                <p className="font-lato text-white/70 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <Section>
            <div className="text-center mb-12">
              <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-wider mb-2">Explore By Category</p>
              <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
                Every event, covered.
              </h2>
            </div>
          </Section>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon
              return (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <Link
                    to={`/browse?category=${encodeURIComponent(cat.label)}`}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-black/5 hover:border-[#F06138]/30 transition-all cursor-pointer"
                    style={{ background: cat.color }}
                  >
                    <span
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: cat.accent + '18' }}
                    >
                      <Icon size={22} style={{ color: cat.accent }} />
                    </span>
                    <span className="font-lato font-semibold text-sm text-[#101828] text-center">{cat.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: '#FFFEF5' }}>
        <div className="max-w-[1280px] mx-auto">
          <Section>
            <div className="text-center mb-14">
              <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-wider mb-2">Simple Process</p>
              <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
                How iBento works
              </h2>
              <p className="font-lato text-[#6A6A6A] mt-3 max-w-lg mx-auto">
                Plan your entire event in three simple steps — no calls, no confusion.
              </p>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-[#F06138]/20" />

            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 font-filson font-black text-xl"
                  style={{ background: '#F06138', color: '#FDFAD6' }}
                >
                  {step.step}
                </div>
                <h3 className="font-filson font-bold text-[#101828] text-xl mb-2">{step.title}</h3>
                <p className="font-lato text-[#6A6A6A] text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VENDOR PERKS ─────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Section>
              <div>
                <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-wider mb-2">For Vendors</p>
                <h2 className="font-filson font-black text-[#101828] mb-4" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
                  Grow your business<br />with iBento
                </h2>
                <p className="font-lato text-[#6A6A6A] mb-8 leading-relaxed">
                  Join India's fastest growing event marketplace. List your services, manage bookings, and get paid — all from one smart dashboard.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {VENDOR_PERKS.map((perk) => {
                    const Icon = perk.icon
                    return (
                      <div key={perk.title} className="flex gap-3">
                        <span
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: '#FFF3EF' }}
                        >
                          <Icon size={18} style={{ color: '#F06138' }} />
                        </span>
                        <div>
                          <p className="font-lato font-semibold text-[#101828] text-sm">{perk.title}</p>
                          <p className="font-lato text-[#6A6A6A] text-xs mt-0.5 leading-relaxed">{perk.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <Link
                  to="/vendor/apply"
                  className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 rounded-lg font-lato font-semibold text-sm transition-colors hover:opacity-90"
                  style={{ background: '#F06138', color: '#FDFAD6' }}
                >
                  Apply as Vendor <ArrowRight size={16} />
                </Link>
              </div>
            </Section>

            <Section>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80"
                  alt="Event vendor working"
                  className="w-full rounded-3xl object-cover"
                  style={{ height: 420 }}
                />
                {/* Floating card */}
                <div
                  className="absolute -bottom-6 -left-6 rounded-2xl px-5 py-4 shadow-xl"
                  style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.15)' }}
                >
                  <p className="font-lato font-semibold text-[#101828] text-sm">Average Monthly Earnings</p>
                  <p className="font-filson font-black text-[#F06138] text-3xl mt-0.5">₹85,000+</p>
                  <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">for active vendors on iBento</p>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: '#FFFEF5' }}>
        <div className="max-w-[1280px] mx-auto">
          <Section>
            <div className="text-center mb-12">
              <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-wider mb-2">Loved by Customers</p>
              <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
                Real stories, real smiles
              </h2>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-2xl p-6"
                style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}
              >
                <Stars count={t.rating} />
                <p className="font-lato text-[#364153] text-sm leading-relaxed mt-4 mb-5">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-lato font-semibold text-[#101828] text-sm">{t.name}</p>
                    <p className="font-lato text-[#6A6A6A] text-xs">{t.role} · {t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <Section>
            <div
              className="rounded-3xl px-10 py-16 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #F06138 0%, #8B4332 100%)' }}
            >
              {/* Decorative circles */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />

              <div className="relative z-10">
                <p className="font-lato text-white/70 text-sm font-semibold uppercase tracking-wider mb-3">Get Started Today</p>
                <h2
                  className="font-filson font-black text-white mb-4"
                  style={{ fontSize: 'clamp(28px,4vw,48px)' }}
                >
                  Your perfect event is<br />one click away.
                </h2>
                <p className="font-lato text-white/80 mb-8 max-w-md mx-auto">
                  Join thousands of happy customers who planned unforgettable events with iBento.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link
                    to="/browse"
                    className="px-8 py-3.5 rounded-xl font-lato font-semibold text-sm transition-all hover:scale-[1.02]"
                    style={{ background: '#FDFAD6', color: '#8B4332' }}
                  >
                    Explore Vendors
                  </Link>
                  <Link
                    to="/signup"
                    className="px-8 py-3.5 rounded-xl font-lato font-semibold text-sm border border-white/40 text-white hover:bg-white/10 transition-all"
                  >
                    Create Free Account
                  </Link>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </section>

      <Footer />
    </motion.div>
  )
}

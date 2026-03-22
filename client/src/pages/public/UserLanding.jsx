import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, ArrowRight, Star, MapPin, CheckCircle,
  Sparkles, ChevronRight,
} from 'lucide-react'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import { pageVariants, fadeInUp, staggerContainer } from '../../animations/pageTransitions'

/* ─── Static data ─────────────────────────────────────────── */
const CATEGORIES = [
  { label: 'Weddings',       img: 'photo-1519167758481-83f550bb49b3', color: '#FFF3EF' },
  { label: 'Photography',    img: 'photo-1606216794074-735e91aa2c92', color: '#F0FDF4' },
  { label: 'Catering',       img: 'photo-1555244162-803834f70033',    color: '#FDFAD6' },
  { label: 'Entertainment',  img: 'photo-1501386761578-eaa54522def9', color: '#EFF6FF' },
  { label: 'Decoration',     img: 'photo-1530103862676-de8c9debad1d', color: '#F5F3FF' },
  { label: 'Transportation', img: 'photo-1544620347-c4fd4a3d5957',    color: '#F0FDF4' },
]

const FEATURED_VENDORS = [
  { id: '1', name: 'Royal Events & Décor', category: 'Wedding Decoration', city: 'Mumbai',    rating: 4.9, reviews: 128, price: '₹45,000',    img: 'photo-1530103862676-de8c9debad1d', badge: 'Top Rated' },
  { id: '2', name: 'Lens & Light Studio',  category: 'Photography',        city: 'Bangalore', rating: 4.8, reviews: 94,  price: '₹25,000',    img: 'photo-1606216794074-735e91aa2c92', badge: 'Popular'   },
  { id: '3', name: 'Flavours of India',    category: 'Catering',           city: 'Delhi',     rating: 4.7, reviews: 213, price: '₹800/plate', img: 'photo-1555244162-803834f70033',    badge: 'Trending'  },
  { id: '4', name: 'Rhythm & Beats',       category: 'Entertainment',      city: 'Hyderabad', rating: 4.9, reviews: 76,  price: '₹30,000',    img: 'photo-1501386761578-eaa54522def9', badge: 'New'       },
]

const STEPS = [
  { num: '01', title: 'Browse & Discover', desc: 'Search vendors by category, city, and event type from 500+ verified professionals across India.' },
  { num: '02', title: 'Compare & Choose',  desc: 'View portfolios, read verified reviews, and compare transparent pricing — zero hidden charges.' },
  { num: '03', title: 'Sign In & Book',    desc: 'Create your free account, book securely via Razorpay, and track everything in real time.' },
]

const TRUST_BADGES = [
  'Zero hidden charges',
  'Verified vendors only',
  'Secure Razorpay payments',
  '24/7 customer support',
  'Easy cancellation policy',
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    role: 'Bride',
    quote: 'Found our wedding photographer and decorator within an hour. Transparent pricing made planning completely stress-free!',
    avatar: 'https://i.pravatar.cc/80?img=47',
  },
  {
    name: 'Rohit Mehta',
    location: 'Bangalore',
    role: 'Corporate Event Manager',
    quote: 'Managed our annual company event entirely through iBento. The vendor coordination tools saved us days of work.',
    avatar: 'https://i.pravatar.cc/80?img=12',
  },
  {
    name: 'Anjali Kapoor',
    location: 'Delhi',
    role: 'Birthday Party Host',
    quote: 'Booked catering and entertainment for 150 guests in under 20 minutes. The platform is incredibly easy to use!',
    avatar: 'https://i.pravatar.cc/80?img=44',
  },
]

/* ─── Page ───────────────────────────────────────────────── */
export default function UserLanding() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    navigate(query.trim() ? `/browse?q=${encodeURIComponent(query.trim())}` : '/browse')
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-white"
    >
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1800&q=85"
            alt="Beautiful event"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.68) 100%)' }}
          />
        </div>

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 py-28 text-center">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.span
              variants={fadeInUp}
              className="inline-block mb-5 px-4 py-1.5 rounded-full text-xs font-semibold font-lato tracking-widest uppercase"
              style={{ background: 'rgba(240,97,56,0.22)', color: '#F06138', border: '1px solid rgba(240,97,56,0.5)' }}
            >
              India's #1 Event Marketplace
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              className="font-filson font-black text-white leading-[1.08] mb-6"
              style={{ fontSize: 'clamp(44px, 7.5vw, 84px)' }}
            >
              Plan Your<br />
              <span style={{ color: '#F06138' }}>Perfect Event.</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="font-lato text-white/75 text-lg mb-10 max-w-xl mx-auto leading-relaxed"
            >
              Discover 500+ verified vendors for weddings, birthdays, corporate events and more — transparent pricing, zero surprises.
            </motion.p>

            {/* Search */}
            <motion.form
              variants={fadeInUp}
              onSubmit={handleSearch}
              className="flex items-center max-w-2xl mx-auto rounded-2xl overflow-hidden mb-5"
              style={{ background: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
            >
              <div className="flex items-center gap-3 flex-1 px-5">
                <Search size={20} className="text-gray-400 shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for vendors, services, cities…"
                  className="flex-1 py-4 font-lato text-[#101828] placeholder-gray-400 focus:outline-none text-sm bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 px-8 py-4 font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ background: '#F06138', color: '#FDFAD6' }}
              >
                Search
              </button>
            </motion.form>

            {/* Quick category chips */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 justify-center">
              {['Weddings', 'Photography', 'Catering', 'Decoration', 'Entertainment'].map((tag) => (
                <Link
                  key={tag}
                  to={`/browse?category=${encodeURIComponent(tag)}`}
                  className="px-4 py-1.5 rounded-full text-xs font-lato font-medium text-white border border-white/30 hover:border-white/70 hover:bg-white/10 transition-all"
                >
                  {tag}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-white/35 flex items-start justify-center pt-2"
          >
            <div className="w-1 h-2 rounded-full bg-white/55" />
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <section style={{ background: '#101828' }}>
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: '500+',    label: 'Verified Vendors'  },
              { val: '12,000+', label: 'Events Planned'     },
              { val: '40+',     label: 'Cities Covered'     },
              { val: '4.8★',    label: 'Average Rating'     },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-filson font-black text-[#F06138] text-3xl">{s.val}</p>
                <p className="font-lato text-white/55 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────── */}
      <section className="py-5 px-6 border-b border-black/5" style={{ background: '#FFFDFC' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {TRUST_BADGES.map((t) => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle size={14} className="text-[#016630] shrink-0" />
                <span className="font-lato text-sm text-[#364153]">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY GRID ────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: '#FFFDFC' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-14">
            <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-widest mb-2">Browse by Category</p>
            <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
              Every event, covered.
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                whileHover={{ y: -5 }}
              >
                <Link
                  to={`/browse?category=${encodeURIComponent(cat.label)}`}
                  className="block rounded-2xl overflow-hidden border border-black/5 hover:shadow-lg transition-all group"
                >
                  <div className="relative h-28 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/${cat.img}?w=320&q=75`}
                      alt={cat.label}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="py-3 text-center" style={{ background: cat.color }}>
                    <p className="font-lato font-semibold text-[#101828] text-sm">{cat.label}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED VENDORS ─────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: '#FFFEF5' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-widest mb-1">Handpicked for you</p>
              <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(24px, 3.5vw, 38px)' }}>
                Top Rated Vendors
              </h2>
            </div>
            <Link
              to="/browse"
              className="hidden sm:flex items-center gap-1.5 font-lato text-sm font-semibold text-[#F06138] hover:underline"
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_VENDORS.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                whileHover={{ y: -5 }}
              >
                <div className="rounded-2xl overflow-hidden border border-black/5 bg-white shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden shrink-0">
                    <img
                      src={`https://images.unsplash.com/${v.img}?w=400&q=80`}
                      alt={v.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <span
                      className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-lato font-semibold"
                      style={{ background: '#F06138', color: '#FDFAD6' }}
                    >
                      {v.badge}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-lato font-semibold text-[#101828] text-sm truncate">{v.name}</h3>
                    <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{v.category}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <MapPin size={12} className="text-[#6A6A6A] shrink-0" />
                      <span className="font-lato text-xs text-[#6A6A6A]">{v.city}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-1.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={12}
                          className={idx < Math.round(v.rating) ? 'text-[#F06138] fill-[#F06138]' : 'text-gray-200 fill-gray-200'}
                        />
                      ))}
                      <span className="font-lato text-xs text-[#6A6A6A] ml-1">{v.rating} ({v.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-black/5 mt-3">
                      <span className="font-lato font-bold text-[#8B4332] text-sm">from {v.price}</span>
                      <Link
                        to="/login"
                        state={{ from: `/vendors/${v.id}` }}
                        className="text-xs font-lato font-semibold text-[#F06138] hover:underline"
                      >
                        Sign in to book →
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-lato font-semibold text-sm border-2 border-[#F06138] text-[#F06138] hover:bg-[#FFF3EF] transition-colors"
            >
              Browse All Vendors <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: '#FFFDFC' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
              Plan your event in 3 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto font-filson font-black text-2xl"
                  style={{ background: 'linear-gradient(135deg, #F06138, #F54900)', color: 'white' }}
                >
                  {s.num}
                </div>
                <h3 className="font-filson font-bold text-[#101828] text-xl mb-3">{s.title}</h3>
                <p className="font-lato text-[#6A6A6A] text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI EVENT CREATION TEASER ─────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #101828 0%, #1a2d40 100%)' }}
          >
            <div
              className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #F06138, transparent 70%)' }}
            />
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 px-10 py-16 md:px-16">
              {/* Text */}
              <div className="flex-1">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold font-lato"
                  style={{ background: 'rgba(240,97,56,0.18)', color: '#F06138', border: '1px solid rgba(240,97,56,0.4)' }}
                >
                  <Sparkles size={12} /> New Feature
                </div>
                <h2
                  className="font-filson font-black text-white mb-4 leading-[1.1]"
                  style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
                >
                  Create Your Event<br />
                  with <span style={{ color: '#F06138' }}>AI Assistance</span>
                </h2>
                <p className="font-lato text-white/70 mb-8 leading-relaxed max-w-lg">
                  Tell our AI your event type, budget, and guest count — get curated vendor recommendations, instant quotes, and a complete event plan in minutes.
                </p>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
                  style={{ background: '#F06138', color: '#FDFAD6' }}
                >
                  Try it free — it's quick <Sparkles size={15} />
                </Link>
              </div>

              {/* Mock chat UI */}
              <div
                className="shrink-0 w-full lg:w-80 rounded-2xl overflow-hidden border border-white/10"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="font-lato text-white/40 text-xs ml-1">AI Event Planner</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex gap-2 flex-row-reverse">
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold bg-white/20 text-white">U</div>
                    <div className="flex-1 rounded-xl px-3 py-2 text-xs font-lato text-white/80" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      Plan a wedding for 200 guests in Mumbai, budget ₹5 lakhs
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: '#F06138', color: 'white' }}>✦</div>
                    <div className="flex-1 rounded-xl px-3 py-2 text-xs font-lato" style={{ background: 'rgba(240,97,56,0.15)', color: '#ffd4c8' }}>
                      Found 12 vendors matching your budget! Here's your curated plan with photographer, caterer, decorator & more…
                    </div>
                  </div>
                  <div className="pt-1 border-t border-white/10 text-center">
                    <p className="font-lato text-white/30 text-xs">Sign in to use AI event planning →</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: '#FFFEF5' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-14">
            <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-widest mb-2">Loved by Customers</p>
            <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
              Real stories, real smiles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-2xl p-6 bg-white shadow-sm border border-black/5 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} size={14} className="text-[#F06138] fill-[#F06138]" />
                  ))}
                </div>
                <p className="font-lato text-[#364153] text-sm leading-relaxed mb-5">"{t.quote}"</p>
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

      {/* ── VENDOR JOIN BANNER ───────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl relative overflow-hidden"
            style={{ background: '#8B4332' }}
          >
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/8" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-white/6" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 px-10 md:px-16 py-14">
              <div className="flex-1 text-center md:text-left">
                <p className="font-lato text-white/55 text-xs font-semibold uppercase tracking-widest mb-3">For Event Professionals</p>
                <h2
                  className="font-filson font-black text-white mb-3"
                  style={{ fontSize: 'clamp(26px, 3.5vw, 38px)' }}
                >
                  Are you an event vendor?<br />Join iBento today.
                </h2>
                <p className="font-lato text-white/65 max-w-md">
                  List your services, reach thousands of active event planners, and get paid securely. 500+ vendors are already growing with us.
                </p>
              </div>
              <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
                <Link
                  to="/become-vendor"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
                  style={{ background: '#F06138', color: '#FDFAD6' }}
                >
                  See How It Works <ChevronRight size={16} />
                </Link>
                <Link
                  to="/vendor/apply"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-lato font-semibold text-sm border border-white/30 text-white hover:bg-white/10 transition-colors"
                >
                  Apply Now <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden relative text-center py-16 px-8"
            style={{ background: 'linear-gradient(135deg, #F06138 0%, #F54900 100%)' }}
          >
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-white/5" />
            <div className="relative z-10">
              <h2
                className="font-filson font-black text-white mb-3"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
              >
                Ready to plan your<br />dream event?
              </h2>
              <p className="font-lato text-white/80 mb-8 max-w-md mx-auto">
                Join over 10,000 happy customers who trusted iBento for their most special moments.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/signup"
                  className="px-8 py-3.5 rounded-xl font-lato font-semibold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: '#FDFAD6', color: '#8B4332' }}
                >
                  Create Free Account
                </Link>
                <Link
                  to="/browse"
                  className="px-8 py-3.5 rounded-xl font-lato font-semibold text-sm border border-white/40 text-white hover:bg-white/10 transition-all"
                >
                  Browse Vendors
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </motion.div>
  )
}

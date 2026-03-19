import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Star, MapPin, CheckCircle } from 'lucide-react'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import SearchBar from '../../components/shared/SearchBar'
import { pageVariants, fadeInUp, staggerContainer } from '../../animations/pageTransitions'

/* ─── Data ───────────────────────────────────────────────── */
const FEATURED_VENDORS = [
  {
    id: '1',
    name: 'Royal Events & Décor',
    category: 'Wedding Decoration',
    city: 'Mumbai',
    rating: 4.9,
    reviews: 128,
    price: '₹45,000',
    img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80',
    badge: 'Top Rated',
  },
  {
    id: '2',
    name: 'Lens & Light Studio',
    category: 'Photography',
    city: 'Bangalore',
    rating: 4.8,
    reviews: 94,
    price: '₹25,000',
    img: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80',
    badge: 'Popular',
  },
  {
    id: '3',
    name: 'Flavours of India',
    category: 'Catering',
    city: 'Delhi',
    rating: 4.7,
    reviews: 213,
    price: '₹800/plate',
    img: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80',
    badge: 'Trending',
  },
  {
    id: '4',
    name: 'Rhythm & Beats',
    category: 'Entertainment',
    city: 'Hyderabad',
    rating: 4.9,
    reviews: 76,
    price: '₹30,000',
    img: 'https://images.unsplash.com/photo-1501386761578-eaa54522def9?w=400&q=80',
    badge: 'New',
  },
]

const STEPS = [
  { num: '01', title: 'Search & Filter', desc: 'Find vendors by category, city, budget, and event type in seconds.' },
  { num: '02', title: 'Compare Quotes',  desc: 'View transparent pricing, portfolios, and real customer reviews.' },
  { num: '03', title: 'Book & Pay',      desc: 'Book securely with Razorpay and track your booking in real time.' },
]

const TRUST = [
  'Zero hidden charges',
  'Verified vendors only',
  'Secure Razorpay payments',
  '24/7 customer support',
  'Easy cancellation',
  'Real customer reviews',
]

function StarRow({ rating, reviews }) {
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            className={i < Math.round(rating) ? 'text-[#F06138] fill-[#F06138]' : 'text-gray-300'}
          />
        ))}
      </div>
      <span className="font-lato text-xs text-[#6A6A6A]">{rating} ({reviews})</span>
    </div>
  )
}

export default function UserLanding() {
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
      <section className="relative overflow-hidden py-20 md:py-28 px-6" style={{ background: '#FEFDEB' }}>
        <div
          className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F06138 0%, transparent 70%)' }}
        />

        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              <motion.span
                variants={fadeInUp}
                className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold font-lato tracking-wider uppercase"
                style={{ background: '#FFF3EF', color: '#F06138' }}
              >
                Plan Your Event in Minutes
              </motion.span>
              <motion.h1
                variants={fadeInUp}
                className="font-filson font-black text-[#101828] mb-4 leading-tight"
                style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
              >
                Your perfect event<br />
                <span style={{ color: '#F06138' }}>starts here.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="font-lato text-[#6A6A6A] text-lg mb-8 max-w-lg leading-relaxed">
                Discover trusted vendors for weddings, birthdays, corporate events and more — transparent pricing, no surprises.
              </motion.p>

              <motion.div variants={fadeInUp} className="mb-6">
                <SearchBar
                  hero
                  placeholder="What are you planning? (e.g. Wedding, Birthday…)"
                  buttonLabel="Search"
                  onSubmit={(q) => navigate(`/browse?q=${encodeURIComponent(q)}`)}
                />
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
                {['Weddings', 'Birthdays', 'Corporate', 'Catering', 'Photography'].map((tag) => (
                  <Link
                    key={tag}
                    to={`/browse?category=${tag}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-lato font-medium text-[#364153] border border-[rgba(139,67,50,0.15)] hover:border-[#F06138]/40 hover:text-[#F06138] transition-colors"
                    style={{ background: '#FFFEF5' }}
                  >
                    {tag}
                  </Link>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              <img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80" alt="Wedding" className="rounded-2xl object-cover w-full h-48 mt-8" />
              <img src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80" alt="Decoration" className="rounded-2xl object-cover w-full h-48" />
              <img src="https://images.unsplash.com/photo-1555244162-803834f70033?w=400&q=80" alt="Catering" className="rounded-2xl object-cover w-full h-48" />
              <img src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&q=80" alt="Photography" className="rounded-2xl object-cover w-full h-48 mt-8" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ─────────────────────────────────────── */}
      <section className="py-8 px-6 border-y border-black/5">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {TRUST.map((t) => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle size={15} className="text-[#016630] shrink-0" />
                <span className="font-lato text-sm text-[#364153]">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED VENDORS ─────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-wider mb-1">Hand-picked for you</p>
              <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(24px,3.5vw,38px)' }}>
                Top rated vendors
              </h2>
            </div>
            <Link to="/browse" className="hidden sm:flex items-center gap-1.5 font-lato font-semibold text-sm text-[#F06138] hover:underline">
              View all <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_VENDORS.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                whileHover={{ y: -3 }}
              >
                <Link
                  to={`/vendors/${v.id}`}
                  className="block rounded-2xl overflow-hidden border border-black/5 hover:shadow-lg transition-all"
                  style={{ background: '#FFFEF5' }}
                >
                  <div className="relative overflow-hidden" style={{ height: 180 }}>
                    <img src={v.img} alt={v.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    <span
                      className="absolute top-3 left-3 text-xs font-lato font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: '#F06138', color: '#FDFAD6' }}
                    >
                      {v.badge}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-lato font-semibold text-[#101828] text-sm truncate">{v.name}</h3>
                    <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{v.category}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-[#6A6A6A] shrink-0" />
                      <span className="font-lato text-xs text-[#6A6A6A]">{v.city}</span>
                    </div>
                    <StarRow rating={v.rating} reviews={v.reviews} />
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
                      <span className="font-lato font-bold text-[#8B4332] text-sm">from {v.price}</span>
                      <span className="text-xs font-lato text-[#F06138] font-semibold">View →</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: '#FFFEF5' }}>
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-wider mb-2">Easy as 1-2-3</p>
            <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
              Plan your event, effortlessly
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto font-filson font-black text-xl"
                  style={{ background: '#F06138', color: '#FDFAD6' }}
                >
                  {s.num}
                </div>
                <h3 className="font-filson font-bold text-[#101828] text-xl mb-2">{s.title}</h3>
                <p className="font-lato text-[#6A6A6A] text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden relative text-center py-16 px-8"
            style={{ background: 'linear-gradient(135deg, #F06138 0%, #8B4332 100%)' }}
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-filson font-black text-white mb-3" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
                Ready to plan your dream event?
              </h2>
              <p className="font-lato text-white/80 mb-8 max-w-md mx-auto">
                Join over 10,000 happy customers who trusted iBento for their special moments.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/signup"
                  className="px-8 py-3.5 rounded-xl font-lato font-semibold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: '#FDFAD6', color: '#8B4332' }}
                >
                  Get Started Free
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

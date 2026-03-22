import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, CheckCircle, TrendingUp, Shield, Zap,
  Star, ChevronDown, BarChart3, HeadphonesIcon,
} from 'lucide-react'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import { pageVariants, fadeInUp, staggerContainer } from '../../animations/pageTransitions'

/* ─── Data ───────────────────────────────────────────────── */
const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Massive Reach',
    desc: 'Get discovered by thousands of event planners across 40+ Indian cities actively searching for vendors like you.',
    color: '#FFF3EF',
    accent: '#F06138',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    desc: 'All payments go through Razorpay. Funds are released to your bank account within 2–3 business days after event completion.',
    color: '#F0FDF4',
    accent: '#016630',
  },
  {
    icon: Zap,
    title: 'Smart Dashboard',
    desc: 'Manage bookings, track earnings, set availability, and chat with customers — all from one clean, fast interface.',
    color: '#EFF6FF',
    accent: '#193CB8',
  },
  {
    icon: BarChart3,
    title: 'Powerful Analytics',
    desc: 'Track profile views, booking rates, and revenue trends. Know exactly what works and grow your business with data.',
    color: '#F5F3FF',
    accent: '#6B21A8',
  },
]

const PACKAGES = [
  {
    name: 'Starter',
    price: 'Free',
    subtitle: 'Perfect to get started',
    commission: '10%',
    features: [
      'List up to 3 services',
      'Basic vendor profile page',
      'Standard search ranking',
      'Email support',
      'Razorpay payouts (3 days)',
      'Basic analytics dashboard',
    ],
    notIncluded: ['Priority listing', 'AI event planning tools', 'Dedicated manager', 'Featured placement'],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '₹999',
    period: '/month',
    subtitle: 'Best for growing businesses',
    commission: '7%',
    features: [
      'List up to 15 services',
      'Enhanced profile with portfolio',
      'Priority search ranking',
      'Live chat support',
      'Fast payouts (2 days)',
      'Advanced analytics & insights',
      'Customer review highlights',
    ],
    notIncluded: ['AI event planning tools', 'Featured placement'],
    cta: 'Start Growth Plan',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Pro',
    price: '₹2,499',
    period: '/month',
    subtitle: 'For established businesses',
    commission: '5%',
    features: [
      'Unlimited services',
      'Premium profile with video',
      'Featured homepage placement',
      'Dedicated account manager',
      'Instant payouts',
      'Full analytics suite',
      'AI event planning tools',
      'Gold verified badge',
    ],
    notIncluded: [],
    cta: 'Go Pro',
    highlighted: false,
  },
]

const REGISTRATION_STEPS = [
  {
    num: '01',
    title: 'Submit Application',
    desc: 'Fill in your business details, services, pricing, and upload your KYC documents (PAN, Aadhaar). Takes less than 10 minutes.',
  },
  {
    num: '02',
    title: 'Verification & Review',
    desc: 'Our team reviews your application within 2–3 business days. We may reach out for additional documents or clarifications.',
  },
  {
    num: '03',
    title: 'Go Live & Earn',
    desc: "Once approved, your profile goes live instantly. Start receiving booking requests and growing your business from day one.",
  },
]

const VENDOR_TESTIMONIALS = [
  {
    name: 'Karan Malhotra',
    business: 'Karan Photography Studio',
    city: 'Mumbai',
    revenue: '₹1.2L/month',
    quote: 'Joining iBento doubled my bookings in 3 months. The dashboard is incredibly easy to use and payments are always on time.',
    avatar: 'https://i.pravatar.cc/80?img=33',
  },
  {
    name: 'Sunita Joshi',
    business: 'Royal Catering Services',
    city: 'Pune',
    revenue: '₹85K/month',
    quote: "I was skeptical at first but the platform's reach is incredible. Got my first booking within a week of listing my services.",
    avatar: 'https://i.pravatar.cc/80?img=45',
  },
  {
    name: 'Vikram Nair',
    business: 'Vikram Décor & Events',
    city: 'Bangalore',
    revenue: '₹2.3L/month',
    quote: "The best investment for my decoration business. The verified badge alone tripled my enquiries in the first month.",
    avatar: 'https://i.pravatar.cc/80?img=14',
  },
]

const FAQS = [
  {
    q: 'How long does the verification process take?',
    a: 'Our team typically reviews vendor applications within 2–3 business days. You will be notified via email and SMS once your application is approved or if additional documents are needed. Your account remains frozen until approval is complete.',
  },
  {
    q: 'What documents do I need to apply?',
    a: 'You will need: (1) PAN card number, (2) Aadhaar card number, and (3) Bank account details for receiving payouts. GST registration is optional but recommended for vendors with higher-value bookings.',
  },
  {
    q: 'When and how do I receive payments?',
    a: 'Payments are processed securely through Razorpay. After event completion and customer confirmation, funds are released to your bank account: within 3 days (Starter), 2 days (Growth), or instantly (Pro).',
  },
  {
    q: 'Can I change my package later?',
    a: 'Yes! You can upgrade or downgrade your plan at any time from your vendor dashboard. Changes take effect from the next billing cycle.',
  },
  {
    q: 'What is the platform commission and are there hidden fees?',
    a: 'iBento charges a transparent commission on each booking value: 10% (Starter), 7% (Growth), or 5% (Pro). There are absolutely zero hidden fees — you see your exact earnings before confirming any booking.',
  },
  {
    q: 'Can I pause or deactivate my listing?',
    a: 'Yes. You can toggle your listing visibility from your dashboard at any time. Your profile, reviews, and booking history are fully preserved when you reactivate.',
  },
]

/* ─── FAQ accordion item ─────────────────────────────────── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-black/8 last:border-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-lato font-semibold text-[#101828] text-sm group-hover:text-[#F06138] transition-colors pr-4">
          {q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className={open ? 'text-[#F06138]' : 'text-[#6A6A6A]'} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="font-lato text-[#6A6A6A] text-sm leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────── */
export default function BecomeVendor() {
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
      <section
        className="relative overflow-hidden py-24 md:py-32 px-6"
        style={{ background: 'linear-gradient(135deg, #101828 0%, #1a2d40 100%)' }}
      >
        <div
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F06138, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-6 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8B4332, transparent 70%)' }}
        />

        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div variants={staggerContainer} initial="initial" animate="animate">
              <motion.span
                variants={fadeInUp}
                className="inline-block mb-5 px-4 py-1.5 rounded-full text-xs font-semibold font-lato tracking-widest uppercase"
                style={{ background: 'rgba(240,97,56,0.2)', color: '#F06138', border: '1px solid rgba(240,97,56,0.4)' }}
              >
                For Event Professionals
              </motion.span>

              <motion.h1
                variants={fadeInUp}
                className="font-filson font-black text-white leading-[1.08] mb-5"
                style={{ fontSize: 'clamp(40px, 6vw, 68px)' }}
              >
                Grow your business<br />
                <span style={{ color: '#F06138' }}>with iBento.</span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="font-lato text-white/70 text-lg mb-8 max-w-lg leading-relaxed"
              >
                India's fastest-growing event marketplace. List your services, manage bookings, and receive secure payments — all from one smart dashboard.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 mb-10">
                <Link
                  to="/vendor/apply"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
                  style={{ background: '#F06138', color: '#FDFAD6' }}
                >
                  Start Your Application <ArrowRight size={16} />
                </Link>
                <a
                  href="#packages"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-lato font-semibold text-sm border border-white/30 text-white hover:bg-white/10 transition-colors"
                >
                  View Packages <ChevronDown size={16} />
                </a>
              </motion.div>

              {/* Quick stats */}
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-8">
                {[
                  { val: '500+',  label: 'Active Vendors'        },
                  { val: '₹85K+', label: 'Avg Monthly Earnings'  },
                  { val: '98%',   label: 'Vendor Satisfaction'   },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-filson font-black text-[#F06138] text-2xl">{s.val}</p>
                    <p className="font-lato text-white/45 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — image with floating cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=700&q=85"
                  alt="Vendor working at event"
                  className="w-full rounded-3xl object-cover"
                  style={{ height: 460 }}
                />
                {/* Earnings card */}
                <div
                  className="absolute -bottom-6 -left-6 rounded-2xl px-5 py-4 shadow-2xl"
                  style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.15)' }}
                >
                  <p className="font-lato text-[#6A6A6A] text-xs">Monthly Earnings</p>
                  <p className="font-filson font-black text-[#F06138] text-3xl mt-0.5">₹1.2L+</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp size={12} className="text-[#016630]" />
                    <span className="font-lato text-xs text-[#016630] font-semibold">+24% vs last month</span>
                  </div>
                </div>
                {/* New booking alert */}
                <div
                  className="absolute -top-4 -right-4 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3"
                  style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)' }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#DCFCE7' }}>
                    <CheckCircle size={16} className="text-[#016630]" />
                  </div>
                  <div>
                    <p className="font-lato font-semibold text-[#101828] text-xs">New Booking!</p>
                    <p className="font-lato text-[#6A6A6A] text-xs">Wedding · ₹85,000</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-widest mb-2">Why iBento</p>
            <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
              Everything you need to succeed
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl p-6 border border-black/5 hover:shadow-lg transition-all"
                  style={{ background: b.color }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: b.accent + '20' }}
                  >
                    <Icon size={22} style={{ color: b.accent }} />
                  </div>
                  <h3 className="font-lato font-bold text-[#101828] text-base mb-2">{b.title}</h3>
                  <p className="font-lato text-[#6A6A6A] text-sm leading-relaxed">{b.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PACKAGES ─────────────────────────────────────────── */}
      <section id="packages" className="py-24 px-6" style={{ background: '#FFFEF5' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-widest mb-2">Simple Pricing</p>
            <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
              Choose your plan
            </h2>
            <p className="font-lato text-[#6A6A6A] mt-3 max-w-lg mx-auto">
              Start free and scale as your business grows. All plans include Razorpay payouts and a verified vendor badge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PACKAGES.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`rounded-2xl p-7 border-2 relative flex flex-col transition-all ${
                  pkg.highlighted
                    ? 'border-[#F06138] shadow-2xl'
                    : 'border-black/8 hover:border-[#F06138]/40 hover:shadow-md'
                }`}
                style={{
                  background: pkg.highlighted ? 'white' : '#FEFDEB',
                  transform: pkg.highlighted ? 'scale(1.02)' : undefined,
                }}
              >
                {pkg.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-lato font-bold whitespace-nowrap"
                    style={{ background: '#F06138', color: '#FDFAD6' }}
                  >
                    {pkg.badge}
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <h3 className="font-filson font-black text-[#101828] text-xl mb-1">{pkg.name}</h3>
                  <p className="font-lato text-[#6A6A6A] text-xs mb-4">{pkg.subtitle}</p>
                  <div className="flex items-end gap-1 mb-3">
                    <span className="font-filson font-black text-[#101828] text-4xl">{pkg.price}</span>
                    {pkg.period && <span className="font-lato text-[#6A6A6A] text-sm mb-1">{pkg.period}</span>}
                  </div>
                  <div
                    className="inline-block px-3 py-1.5 rounded-lg"
                    style={{ background: '#FFF3EF' }}
                  >
                    <p className="font-lato text-xs font-semibold text-[#F06138]">
                      {pkg.commission} commission per booking
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="flex-1 space-y-2.5 mb-7">
                  {pkg.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <CheckCircle size={14} className="text-[#016630] mt-0.5 shrink-0" />
                      <span className="font-lato text-sm text-[#364153]">{f}</span>
                    </div>
                  ))}
                  {pkg.notIncluded.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 opacity-35">
                      <div className="w-3.5 h-0.5 bg-gray-400 mt-2 shrink-0" />
                      <span className="font-lato text-sm text-[#6A6A6A] line-through">{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/vendor/apply"
                  className="block w-full py-3.5 rounded-xl font-lato font-semibold text-sm text-center transition-all hover:opacity-90"
                  style={
                    pkg.highlighted
                      ? { background: '#F06138', color: '#FDFAD6' }
                      : { background: 'transparent', color: '#F06138', border: '2px solid #F06138' }
                  }
                >
                  {pkg.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center font-lato text-[#6A6A6A] text-xs mt-8">
            All prices exclusive of GST. Commission is charged on booking value only. No hidden fees ever.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-widest mb-2">Registration Process</p>
            <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
              Get started in 3 simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {REGISTRATION_STEPS.map((s, i) => (
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
                  style={{ background: '#F06138', color: '#FDFAD6' }}
                >
                  {s.num}
                </div>
                <h3 className="font-filson font-bold text-[#101828] text-xl mb-3">{s.title}</h3>
                <p className="font-lato text-[#6A6A6A] text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              to="/vendor/apply"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ background: '#F06138', color: '#FDFAD6' }}
            >
              Start Your Application <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── VENDOR TESTIMONIALS ──────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: '#FFFEF5' }}>
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-14">
            <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-widest mb-2">Vendor Stories</p>
            <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
              Vendors love iBento
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VENDOR_TESTIMONIALS.map((t, i) => (
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
                    <Star key={idx} size={13} className="text-[#F06138] fill-[#F06138]" />
                  ))}
                </div>
                <p className="font-lato text-[#364153] text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-lato font-semibold text-[#101828] text-sm">{t.name}</p>
                      <p className="font-lato text-[#6A6A6A] text-xs">{t.business} · {t.city}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-filson font-black text-[#F06138] text-sm">{t.revenue}</p>
                    <p className="font-lato text-[#6A6A6A] text-xs">avg/month</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-14">
            <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-widest mb-2">FAQ</p>
            <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
              Frequently asked questions
            </h2>
          </div>

          <div className="rounded-2xl border border-black/8 overflow-hidden bg-white">
            <div className="px-6 divide-y divide-black/8">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>

          <p className="text-center font-lato text-[#6A6A6A] text-sm mt-8">
            Still have questions?{' '}
            <Link to="/contact" className="text-[#F06138] font-semibold hover:underline">
              Contact our team
            </Link>
          </p>
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
            style={{ background: 'linear-gradient(135deg, #F06138 0%, #8B4332 100%)' }}
          >
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-white/5" />
            <div className="relative z-10">
              <h2
                className="font-filson font-black text-white mb-3"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}
              >
                Ready to grow<br />your business?
              </h2>
              <p className="font-lato text-white/80 mb-8 max-w-md mx-auto">
                Join 500+ vendors already earning on iBento. Start your free application today — takes less than 10 minutes.
              </p>
              <Link
                to="/vendor/apply"
                className="inline-flex items-center gap-2 px-9 py-4 rounded-xl font-lato font-semibold text-sm hover:scale-[1.02] transition-transform"
                style={{ background: '#FDFAD6', color: '#8B4332' }}
              >
                Apply as a Vendor <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </motion.div>
  )
}

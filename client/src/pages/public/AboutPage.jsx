import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, Target, Zap, Users, TrendingUp, Globe } from 'lucide-react'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import { pageVariants, fadeInUp, staggerContainer } from '../../animations/pageTransitions'

/* ─── Data ───────────────────────────────────────────────── */
const STATS = [
  { value: '500+', label: 'Verified Vendors' },
  { value: '12,000+', label: 'Events Planned' },
  { value: '40+', label: 'Cities' },
  { value: '98%', label: 'Satisfaction Rate' },
]

const VALUES = [
  { icon: Heart, title: 'Customer First', desc: 'Every decision we make starts with what is best for the people planning their events and the vendors who serve them.' },
  { icon: Target, title: 'Transparency', desc: 'No hidden costs. No vague pricing. Every vendor on iBento shows clear, upfront pricing so you can plan with confidence.' },
  { icon: Zap, title: 'Speed & Simplicity', desc: 'Event planning should be exciting, not exhausting. We cut the back-and-forth and bring everything into one smooth experience.' },
  { icon: Users, title: 'Trust & Vetting', desc: "Every vendor is manually verified before listing. We check documents, quality, and past work so you don't have to." },
  { icon: TrendingUp, title: 'Vendor Growth', desc: "We're as invested in vendor success as customer satisfaction. More bookings, better tools, faster payments." },
  { icon: Globe, title: 'Made for India', desc: 'Built with Indian celebrations in mind — GST invoices, UPI payments, regional vendors, and events that matter to you.' },
]

const TEAM = [
  { name: 'Arjun Mehta', role: 'Co-Founder & CEO', avatar: 'https://i.pravatar.cc/120?img=11' },
  { name: 'Kavya Rao', role: 'Co-Founder & CTO', avatar: 'https://i.pravatar.cc/120?img=48' },
  { name: 'Ravi Shankar', role: 'Head of Vendor Success', avatar: 'https://i.pravatar.cc/120?img=15' },
  { name: 'Neha Gupta', role: 'Head of Design', avatar: 'https://i.pravatar.cc/120?img=45' },
]

export default function AboutPage() {
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
      <section className="relative overflow-hidden py-24 px-6" style={{ background: '#FEFDEB' }}>
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F06138 0%, transparent 70%)' }}
        />
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-3xl"
          >
            <motion.p
              variants={fadeInUp}
              className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-wider mb-3"
            >
              Our Story
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              className="font-filson font-black text-[#101828] mb-6 leading-tight"
              style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
            >
              We're building India's most trusted event marketplace.
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="font-lato text-[#6A6A6A] text-lg leading-relaxed max-w-2xl"
            >
              iBento was born out of frustration with hidden vendor costs and endless phone calls while planning a wedding. We set out to make event planning transparent, fast, and genuinely enjoyable — for both customers and vendors.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section style={{ background: '#8B4332' }}>
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <p className="font-filson font-black text-white text-4xl">{s.value}</p>
                <p className="font-lato text-white/70 text-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80"
                alt="Event"
                className="w-full rounded-3xl object-cover"
                style={{ height: 420 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-wider mb-3">Our Mission</p>
              <h2 className="font-filson font-black text-[#101828] mb-5" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
                Seamless events,<br />transparent pricing.
              </h2>
              <p className="font-lato text-[#364153] leading-relaxed mb-4">
                In India, event planning often means weeks of research, dozens of calls, and surprise bills. iBento changes that. We connect customers with pre-vetted, transparent vendors — from wedding photographers to caterers — so you can plan faster and celebrate harder.
              </p>
              <p className="font-lato text-[#364153] leading-relaxed">
                For vendors, we offer a powerful platform to grow their business, manage bookings, and get paid on time — with zero complexity.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: '#FFFEF5' }}>
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-wider mb-2">What We Stand For</p>
            <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
              Our values
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-2xl"
                  style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.08)' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: '#FFF3EF' }}
                  >
                    <Icon size={20} style={{ color: '#F06138' }} />
                  </div>
                  <h3 className="font-lato font-bold text-[#101828] text-base mb-2">{v.title}</h3>
                  <p className="font-lato text-[#6A6A6A] text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-wider mb-2">The People Behind iBento</p>
            <h2 className="font-filson font-black text-[#101828]" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
              Meet the team
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-white shadow-md"
                />
                <h3 className="font-lato font-semibold text-[#101828] text-sm">{member.name}</h3>
                <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl text-center py-14 px-8"
            style={{ background: 'linear-gradient(135deg, #F06138 0%, #8B4332 100%)' }}
          >
            <h2 className="font-filson font-black text-white mb-3" style={{ fontSize: 'clamp(26px,4vw,42px)' }}>
              Ready to be part of the story?
            </h2>
            <p className="font-lato text-white/80 mb-8 max-w-md mx-auto">
              Whether you're planning an event or running a vendor business, iBento is built for you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/browse"
                className="px-8 py-3.5 rounded-xl font-lato font-semibold text-sm"
                style={{ background: '#FDFAD6', color: '#8B4332' }}
              >
                Find Vendors
              </Link>
              <Link
                to="/vendor/apply"
                className="px-8 py-3.5 rounded-xl font-lato font-semibold text-sm border border-white/40 text-white hover:bg-white/10 transition-all"
              >
                Join as Vendor
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </motion.div>
  )
}

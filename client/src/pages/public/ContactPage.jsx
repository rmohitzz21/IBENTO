import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import { pageVariants, fadeInUp, staggerContainer } from '../../animations/pageTransitions'

/* ─── Validation ─────────────────────────────────────────── */
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  type: z.enum(['general', 'vendor', 'support', 'partnership']),
})

const CONTACT_INFO = [
  { icon: Mail,   label: 'Email Us',      value: 'hello@ibento.in',       href: 'mailto:hello@ibento.in' },
  { icon: Phone,  label: 'Call Us',       value: '+91 98765 43210',       href: 'tel:+919876543210' },
  { icon: MapPin, label: 'Our Office',    value: 'Bangalore, Karnataka, India', href: null },
]

const INQUIRY_TYPES = [
  { value: 'general',     label: 'General Inquiry' },
  { value: 'vendor',      label: 'Vendor Support' },
  { value: 'support',     label: 'Customer Support' },
  { value: 'partnership', label: 'Partnership' },
]

const FAQS = [
  { q: 'How do I book a vendor?', a: 'Browse vendors, click on a service you like, and click "Book Now". You\'ll need to create a free account to complete the booking.' },
  { q: 'How does payment work?', a: 'Payments are processed securely via Razorpay. We support UPI, credit/debit cards, and net banking.' },
  { q: 'How do I become a vendor?', a: 'Click "Join as Vendor", fill out your business details, submit your documents, and our team will verify and approve your listing within 48 hours.' },
  { q: 'What if I need to cancel?', a: 'Cancellation policies vary by vendor. Each vendor\'s page shows their policy. Contact the vendor or our support team for assistance.' },
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: 'general' },
  })

  async function onSubmit(data) {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800))
    console.log('Contact form:', data)
    setSubmitted(true)
    reset()
  }

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
      <section className="py-20 px-6" style={{ background: '#FEFDEB' }}>
        <div className="max-w-[1280px] mx-auto">
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-2xl">
            <motion.p variants={fadeInUp} className="font-lato text-[#F06138] font-semibold text-sm uppercase tracking-wider mb-3">
              Get in Touch
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              className="font-filson font-black text-[#101828] mb-4 leading-tight"
              style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
            >
              We'd love to hear from you.
            </motion.h1>
            <motion.p variants={fadeInUp} className="font-lato text-[#6A6A6A] text-lg leading-relaxed">
              Have a question, need support, or want to partner with us? Drop us a message and we'll get back to you within 24 hours.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact info + FAQ */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact cards */}
              <div className="space-y-4">
                {CONTACT_INFO.map((info) => {
                  const Icon = info.icon
                  const inner = (
                    <div
                      className="flex items-start gap-4 p-5 rounded-2xl"
                      style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: '#FFF3EF' }}
                      >
                        <Icon size={20} style={{ color: '#F06138' }} />
                      </div>
                      <div>
                        <p className="font-lato font-semibold text-[#101828] text-sm">{info.label}</p>
                        <p className="font-lato text-[#6A6A6A] text-sm mt-0.5">{info.value}</p>
                      </div>
                    </div>
                  )
                  return info.href ? (
                    <a key={info.label} href={info.href} className="block hover:opacity-90 transition-opacity">{inner}</a>
                  ) : (
                    <div key={info.label}>{inner}</div>
                  )
                })}
              </div>

              {/* FAQ */}
              <div>
                <h3 className="font-lato font-bold text-[#101828] text-base mb-4">Frequently asked questions</h3>
                <div className="space-y-2">
                  {FAQS.map((faq, i) => (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden"
                      style={{ border: '1px solid rgba(139,67,50,0.1)' }}
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full text-left px-4 py-3.5 font-lato font-medium text-sm text-[#101828] flex items-center justify-between gap-3"
                        style={{ background: openFaq === i ? '#FFF3EF' : '#FFFEF5' }}
                      >
                        {faq.q}
                        <span className="text-[#F06138] text-lg shrink-0">{openFaq === i ? '−' : '+'}</span>
                      </button>
                      <AnimatePresence>
                        {openFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 py-3 font-lato text-[#6A6A6A] text-sm leading-relaxed" style={{ background: '#FFFEF5' }}>
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3">
              <div
                className="rounded-3xl p-8"
                style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}
              >
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ background: '#DCFCE7' }}
                      >
                        <CheckCircle size={28} className="text-[#016630]" />
                      </div>
                      <h3 className="font-filson font-bold text-[#101828] text-2xl mb-2">Message Sent!</h3>
                      <p className="font-lato text-[#6A6A6A] mb-6">We've received your message and will get back to you within 24 hours.</p>
                      <motion.button
                        onClick={() => setSubmitted(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-6 py-2.5 rounded-xl font-lato font-bold text-sm hover:opacity-90 transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #F06138 0%, #d9461f 100%)',
                          color: '#FDFAD6',
                          boxShadow: '0 4px 14px rgba(240,97,56,0.35)',
                        }}
                      >
                        Send Another
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-5"
                      noValidate
                    >
                      <div>
                        <h2 className="font-filson font-bold text-[#101828] text-2xl mb-1">Send us a message</h2>
                        <p className="font-lato text-[#6A6A6A] text-sm">We typically respond within 24 hours.</p>
                      </div>

                      {/* Inquiry type */}
                      <div>
                        <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">
                          What's this about?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {INQUIRY_TYPES.map((t) => (
                            <label
                              key={t.value}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors"
                              style={{ borderColor: 'rgba(139,67,50,0.2)', background: '#FFFEED' }}
                            >
                              <input
                                type="radio"
                                value={t.value}
                                {...register('type')}
                                className="accent-[#F06138]"
                              />
                              <span className="font-lato text-sm text-[#364153]">{t.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Name + Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Full Name</label>
                          <input
                            type="text"
                            placeholder="Your name"
                            className="input-field"
                            style={errors.name ? { borderColor: '#EF4444' } : {}}
                            {...register('name')}
                          />
                          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                        </div>
                        <div>
                          <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Email Address</label>
                          <input
                            type="email"
                            placeholder="you@example.com"
                            className="input-field"
                            style={errors.email ? { borderColor: '#EF4444' } : {}}
                            {...register('email')}
                          />
                          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                        </div>
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Subject</label>
                        <input
                          type="text"
                          placeholder="How can we help?"
                          className="input-field"
                          style={errors.subject ? { borderColor: '#EF4444' } : {}}
                          {...register('subject')}
                        />
                        {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Message</label>
                        <textarea
                          rows={5}
                          placeholder="Tell us more…"
                          className="input-field resize-none"
                          style={errors.message ? { borderColor: '#EF4444' } : {}}
                          {...register('message')}
                        />
                        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-lato font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                        style={{
                          background: 'linear-gradient(135deg, #F06138 0%, #d9461f 100%)',
                          color: '#FDFAD6',
                          boxShadow: '0 4px 14px rgba(240,97,56,0.35)',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Sending…
                          </>
                        ) : (
                          <><Send size={16} /> Send Message</>
                        )}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </motion.div>
  )
}

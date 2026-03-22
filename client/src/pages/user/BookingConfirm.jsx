import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle, Calendar, MapPin, Users, IndianRupee,
  ArrowRight, Bell, MessageSquare, Sparkles,
} from 'lucide-react'
import UserNavbar from '../../components/shared/UserNavbar'
import { getBooking } from '../../services/bookings'
import { pageVariants } from '../../animations/pageTransitions'

// Confetti particle component
function Particle({ delay, x, color }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ background: color, left: `${x}%`, top: '-8px' }}
      initial={{ y: 0, opacity: 1, rotate: 0 }}
      animate={{ y: 300, opacity: 0, rotate: 720, x: (Math.random() - 0.5) * 80 }}
      transition={{ duration: 2 + Math.random() * 1.5, delay, ease: 'easeIn' }}
    />
  )
}

const CONFETTI_COLORS = ['#F06138', '#8B4332', '#FDFAD6', '#F59E0B', '#22C55E', '#3B82F6', '#EC4899']

const WHAT_NEXT = [
  { icon: Bell,         title: 'Wait for confirmation',    desc: 'The vendor will confirm your booking within 24 hours' },
  { icon: IndianRupee,  title: 'Complete the payment',     desc: 'Once confirmed, secure your slot by completing the payment' },
  { icon: MessageSquare, title: 'Connect with the vendor', desc: 'Chat with the vendor to discuss special requirements' },
]

export default function BookingConfirm() {
  const { bookingId } = useParams()

  const { data } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: !!bookingId,
  })

  const booking = data?.data?.booking || {
    _id: bookingId,
    status: 'pending',
    totalAmount: 45000,
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    guestCount: 100,
    eventAddress: 'Mumbai, Maharashtra',
    vendor: { businessName: 'Royal Events & Décor', coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80' },
    service: { name: 'Basic Wedding Package' },
  }

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    delay: i * 0.08,
    x: 5 + (i * 5.5) % 90,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }))

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      <div className="max-w-[600px] mx-auto px-6 py-12">
        {/* Confetti burst */}
        <div className="relative h-0 overflow-visible">
          {particles.map((p) => (
            <Particle key={p.id} delay={p.delay} x={p.x} color={p.color} />
          ))}
        </div>

        {/* Success icon */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="relative inline-block"
          >
            <div
              className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F06138, #8B4332)', boxShadow: '0 8px 32px rgba(240,97,56,0.35)' }}
            >
              <CheckCircle size={44} className="text-white" />
            </div>
            {/* Pulse rings */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{ border: '2px solid #F06138' }}
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 1.6 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="flex items-center justify-center gap-2 mt-5 mb-2">
              <Sparkles size={16} className="text-amber-400" />
              <h1 className="font-filson font-black text-[#101828] text-3xl">Booking Sent!</h1>
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <p className="font-lato text-[#6A6A6A] text-sm">
              Your request has been sent to{' '}
              <strong className="text-[#101828]">{booking.vendor?.businessName}</strong>.
              <br />They will confirm within 24 hours.
            </p>
          </motion.div>
        </div>

        {/* Booking summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl overflow-hidden mb-6"
          style={{ border: '1px solid rgba(139,67,50,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
        >
          {/* Vendor banner */}
          <div className="relative h-28 overflow-hidden">
            <img src={booking.vendor?.coverImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <div>
                <p className="font-lato font-bold text-white text-sm">{booking.vendor?.businessName}</p>
                <p className="font-lato text-white/80 text-xs">{booking.service?.name}</p>
              </div>
              <span className="text-xs font-lato font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(254,249,194,0.9)', color: '#894B00' }}>
                Pending
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-5" style={{ background: '#FEFDEB' }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FFF3EF' }}>
                  <Calendar size={14} style={{ color: '#F06138' }} />
                </div>
                <div>
                  <p className="font-lato text-[11px] text-[#6A6A6A]">Event Date</p>
                  <p className="font-lato font-semibold text-[#101828] text-xs">
                    {new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FFF3EF' }}>
                  <Users size={14} style={{ color: '#F06138' }} />
                </div>
                <div>
                  <p className="font-lato text-[11px] text-[#6A6A6A]">Guests</p>
                  <p className="font-lato font-semibold text-[#101828] text-xs">{booking.guestCount || booking.guests} people</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FFF3EF' }}>
                  <MapPin size={14} style={{ color: '#F06138' }} />
                </div>
                <div>
                  <p className="font-lato text-[11px] text-[#6A6A6A]">Venue</p>
                  <p className="font-lato font-semibold text-[#101828] text-xs line-clamp-1">{booking.eventAddress}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-black/5">
              <span className="font-lato font-semibold text-[#101828] text-sm">Total Amount</span>
              <span className="font-filson font-black text-[#8B4332] text-2xl">
                ₹{new Intl.NumberFormat('en-IN').format(booking.totalAmount)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Booking ID */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-lato text-xs text-[#6A6A6A] text-center mb-6"
        >
          Booking ID: <span className="font-bold text-[#101828]">#{bookingId?.slice(-8).toUpperCase()}</span>
        </motion.p>

        {/* What happens next */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl p-5 mb-6"
          style={{ background: '#fff', border: '1px solid rgba(139,67,50,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <p className="font-lato font-bold text-[#101828] text-sm mb-4">What happens next?</p>
          <div className="space-y-4">
            {WHAT_NEXT.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-filson font-black text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #F06138, #8B4332)' }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-lato font-semibold text-[#101828] text-sm">{step.title}</p>
                    <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            to={`/payment/${bookingId}`}
            className="flex-1 py-3.5 rounded-xl font-lato font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #F06138, #8B4332)', color: '#FDFAD6', boxShadow: '0 4px 16px rgba(240,97,56,0.3)' }}
          >
            Pay Now <ArrowRight size={15} />
          </Link>
          <Link
            to="/bookings"
            className="flex-1 py-3.5 rounded-xl font-lato font-semibold text-sm border text-[#364153] hover:bg-[#FFF3EF] hover:border-[#F06138]/30 transition-all flex items-center justify-center"
            style={{ borderColor: 'rgba(139,67,50,0.2)' }}
          >
            My Bookings
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

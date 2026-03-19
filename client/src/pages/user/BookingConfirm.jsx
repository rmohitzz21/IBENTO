import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Calendar, MapPin, Users, IndianRupee, ArrowRight } from 'lucide-react'
import UserNavbar from '../../components/shared/UserNavbar'
import { getBooking } from '../../services/bookings'
import { pageVariants } from '../../animations/pageTransitions'

export default function BookingConfirm() {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: !!bookingId,
  })

  const booking = data?.data?.booking || {
    _id: bookingId,
    status: 'pending',
    totalAmount: 45000,
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    guests: 100,
    eventAddress: 'Mumbai, Maharashtra',
    vendor: { businessName: 'Royal Events & Décor', coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80' },
    service: { name: 'Basic Wedding Package' },
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      <div className="max-w-[560px] mx-auto px-6 py-12 text-center">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: '#DCFCE7' }}
        >
          <CheckCircle size={38} className="text-[#016630]" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="font-filson font-black text-[#101828] text-3xl mb-2">Booking Sent!</h1>
          <p className="font-lato text-[#6A6A6A] text-sm mb-8">
            Your booking request has been sent to <strong className="text-[#101828]">{booking.vendor?.businessName}</strong>.
            They will confirm within 24 hours.
          </p>
        </motion.div>

        {/* Booking card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 text-left mb-8"
          style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.12)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <img src={booking.vendor?.coverImage} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
            <div>
              <p className="font-lato font-semibold text-[#101828] text-sm">{booking.vendor?.businessName}</p>
              <p className="font-lato text-[#6A6A6A] text-xs">{booking.service?.name}</p>
            </div>
            <span className="ml-auto text-xs font-lato font-semibold px-2.5 py-1 rounded-full" style={{ background: '#FEF9C2', color: '#894B00' }}>
              Pending
            </span>
          </div>

          <div className="space-y-3 text-sm font-lato">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FFF3EF' }}>
                <Calendar size={15} style={{ color: '#F06138' }} />
              </div>
              <div>
                <p className="text-[#6A6A6A] text-xs">Event Date</p>
                <p className="font-semibold text-[#101828]">
                  {new Date(booking.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FFF3EF' }}>
                <Users size={15} style={{ color: '#F06138' }} />
              </div>
              <div>
                <p className="text-[#6A6A6A] text-xs">Guests</p>
                <p className="font-semibold text-[#101828]">{booking.guests} people</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FFF3EF' }}>
                <MapPin size={15} style={{ color: '#F06138' }} />
              </div>
              <div>
                <p className="text-[#6A6A6A] text-xs">Venue</p>
                <p className="font-semibold text-[#101828]">{booking.eventAddress}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pt-5 border-t border-black/5">
            <span className="font-lato font-bold text-[#101828] text-sm">Total Amount</span>
            <span className="font-filson font-black text-[#8B4332] text-2xl">
              ₹{new Intl.NumberFormat('en-IN').format(booking.totalAmount)}
            </span>
          </div>
        </motion.div>

        {/* Booking ID */}
        <p className="font-lato text-xs text-[#6A6A6A] mb-8">
          Booking ID: <span className="font-semibold text-[#101828]">#{bookingId?.slice(-8).toUpperCase()}</span>
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/payment/${bookingId}`}
            className="flex-1 py-3.5 rounded-xl font-lato font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: '#F06138', color: '#FDFAD6' }}
          >
            Pay Now <ArrowRight size={16} />
          </Link>
          <Link
            to="/bookings"
            className="flex-1 py-3.5 rounded-xl font-lato font-semibold text-sm border border-[rgba(139,67,50,0.2)] text-[#364153] hover:bg-[#FFF3EF] transition-colors flex items-center justify-center"
          >
            My Bookings
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

import { useState } from 'react'
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { IndianRupee, Calendar, Users, MapPin, Loader2, Clock, ArrowLeft } from 'lucide-react'
import UserNavbar from '../../components/shared/UserNavbar'
import { getBooking } from '../../services/bookings'
import { pageVariants } from '../../animations/pageTransitions'

// ─── Payments are temporarily disabled (will be enabled in final phase) ───────
const PAYMENTS_ENABLED = false

const PAYMENT_OPTIONS = [
  { key: 'deposit', label: 'Pay Deposit (30%)',  desc: 'Advance to confirm booking',  getAmount: (b) => b.advanceAmount || Math.round(b.totalAmount * 0.3) },
  { key: 'full',    label: 'Pay Full Amount',     desc: 'Complete payment upfront',     getAmount: (b) => b.totalAmount - (b.paidAmount || 0) },
]

export default function PaymentPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [selectedOption, setSelectedOption] = useState('deposit')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: !!bookingId,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDFC] flex flex-col">
        <UserNavbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#F06138]" />
        </div>
      </div>
    )
  }

  const booking = data?.data?.booking
  if (isError || !booking) return <Navigate to="/bookings" replace />

  const paidAmount = booking.paidAmount || 0
  const payAmount = selectedOption === 'full'
    ? booking.totalAmount - paidAmount
    : (booking.advanceAmount || Math.round(booking.totalAmount * 0.3))

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      <div className="max-w-[900px] mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-[#FFF3EF] transition-colors">
            <ArrowLeft size={18} className="text-[#6A6A6A]" />
          </button>
          <h1 className="font-filson font-black text-[#101828] text-2xl">Complete Payment</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: booking summary + options */}
          <div className="lg:col-span-3 space-y-6">

            {/* Booking summary */}
            <div className="p-5 rounded-2xl" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
              <h2 className="font-lato font-bold text-[#101828] text-sm mb-4">Booking Summary</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF3EF' }}>
                  <IndianRupee size={20} className="text-[#F06138]" />
                </div>
                <div>
                  <p className="font-lato font-semibold text-[#101828] text-sm">{booking.vendorId?.businessName}</p>
                  <p className="font-lato text-[#6A6A6A] text-xs">{booking.serviceId?.title}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs font-lato">
                {[
                  { icon: Calendar, val: new Date(booking.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) },
                  { icon: Users,    val: `${booking.guestCount || 0} guests` },
                  { icon: MapPin,   val: booking.eventAddress },
                ].map(({ icon: Icon, val }) => (
                  <div key={val} className="flex items-center gap-2">
                    <Icon size={12} className="text-[#F06138] shrink-0" />
                    <span className="text-[#364153]">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment options */}
            <div>
              <h2 className="font-lato font-bold text-[#101828] text-sm mb-3">Choose Payment Amount</h2>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((opt) => {
                  const amt = opt.getAmount(booking)
                  const isSelected = selectedOption === opt.key
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedOption(opt.key)}
                      className="w-full text-left p-4 rounded-xl border-2 transition-all"
                      style={isSelected
                        ? { borderColor: '#F06138', background: '#FFF3EF' }
                        : { borderColor: 'rgba(139,67,50,0.15)', background: '#FFFEF5' }
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-lato font-semibold text-sm ${isSelected ? 'text-[#F06138]' : 'text-[#101828]'}`}>
                            {opt.label}
                          </p>
                          <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">{opt.desc}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-filson font-black text-[#8B4332] text-lg">
                            ₹{new Intl.NumberFormat('en-IN').format(amt)}
                          </p>
                          <div
                            className="w-5 h-5 rounded-full border-2 ml-auto mt-1 flex items-center justify-center"
                            style={{ borderColor: isSelected ? '#F06138' : '#d1d5db' }}
                          >
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#F06138' }} />}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Coming-soon notice (visible only when payments are disabled) */}
            {!PAYMENTS_ENABLED && (
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#FEF9C3', border: '1px solid rgba(161,139,0,0.2)' }}>
                <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-lato font-semibold text-sm text-amber-800">Payment integration coming soon</p>
                  <p className="font-lato text-xs text-amber-700 mt-0.5 leading-relaxed">
                    Razorpay payment is being set up. Your booking is already placed — the vendor will confirm it directly. You can pay once the feature is live.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: order card */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 p-5 rounded-2xl" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.12)' }}>
              <h2 className="font-lato font-bold text-[#101828] text-sm mb-4">Order Total</h2>

              <div className="space-y-2 text-sm font-lato mb-4">
                <div className="flex justify-between">
                  <span className="text-[#6A6A6A]">Service Amount</span>
                  <span className="text-[#101828] font-semibold">₹{new Intl.NumberFormat('en-IN').format(booking.totalAmount)}</span>
                </div>
                {paidAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#6A6A6A]">Already Paid</span>
                    <span className="text-[#016630] font-semibold">-₹{new Intl.NumberFormat('en-IN').format(paidAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-black/5">
                  <span className="font-bold text-[#101828]">Amount Due</span>
                  <span className="font-bold text-[#8B4332] text-xl">₹{new Intl.NumberFormat('en-IN').format(payAmount)}</span>
                </div>
              </div>

              {PAYMENTS_ENABLED ? (
                /* Active pay button — wired once Razorpay is enabled */
                <button
                  disabled
                  className="w-full py-3.5 rounded-xl font-lato font-bold text-sm flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                  style={{ background: '#F06138', color: '#FDFAD6' }}
                >
                  <IndianRupee size={16} /> Pay ₹{new Intl.NumberFormat('en-IN').format(payAmount)}
                </button>
              ) : (
                /* Coming-soon placeholder button */
                <div>
                  <div
                    className="w-full py-3.5 rounded-xl font-lato font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed select-none"
                    style={{ background: '#E5E7EB', color: '#9CA3AF' }}
                  >
                    <Clock size={16} /> Payment Coming Soon
                  </div>
                  <Link
                    to={`/bookings/${bookingId}`}
                    className="mt-3 flex items-center justify-center gap-1.5 font-lato text-sm font-semibold text-[#F06138] hover:underline"
                  >
                    <ArrowLeft size={14} /> View Booking Details
                  </Link>
                </div>
              )}

              <p className="font-lato text-[10px] text-[#6A6A6A] text-center mt-3 leading-relaxed">
                Booking #{booking.bookingNumber} · Status: <strong className="capitalize">{booking.status}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

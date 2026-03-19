import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation } from '@tanstack/react-query'
import { IndianRupee, ShieldCheck, Calendar, Users, MapPin, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import UserNavbar from '../../components/shared/UserNavbar'
import { useRazorpay } from '../../hooks/useRazorpay'
import { createOrder, verifyPayment } from '../../services/payments'
import { getBooking } from '../../services/bookings'
import { pageVariants } from '../../animations/pageTransitions'

const MOCK_BOOKING = {
  _id: 'b1',
  status: 'confirmed',
  totalAmount: 45000,
  paidAmount: 0,
  depositAmount: 15000,
  eventDate: '2025-04-15T10:00:00.000Z',
  guests: 150,
  eventAddress: 'Taj Mahal Palace Hotel, Mumbai',
  vendor: { businessName: 'Royal Events & Décor', coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80', category: 'Decoration' },
  service: { name: 'Basic Wedding Package' },
}

const PAYMENT_OPTIONS = [
  { key: 'deposit', label: 'Pay Deposit', desc: '30% advance to confirm booking', getAmount: (b) => b.depositAmount || Math.round(b.totalAmount * 0.3) },
  { key: 'full',    label: 'Pay Full Amount', desc: 'Complete payment upfront', getAmount: (b) => b.totalAmount - (b.paidAmount || 0) },
]

export default function PaymentPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { openCheckout } = useRazorpay()
  const [selectedOption, setSelectedOption] = useState('deposit')
  const [paymentState, setPaymentState] = useState('idle') // idle | processing | success | failed

  const { data, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: !!bookingId,
  })

  const booking = data?.data?.booking || MOCK_BOOKING
  const balance = booking.totalAmount - (booking.paidAmount || 0)
  const payAmount = selectedOption === 'full'
    ? balance
    : (booking.depositAmount || Math.round(booking.totalAmount * 0.3))

  const verifyMutation = useMutation({
    mutationFn: (paymentData) => verifyPayment({ bookingId, ...paymentData }),
    onSuccess: () => {
      setPaymentState('success')
      toast.success('Payment successful!')
      setTimeout(() => navigate(`/bookings/${bookingId}`), 2500)
    },
    onError: () => {
      setPaymentState('failed')
      toast.error('Payment verification failed. Contact support.')
    },
  })

  async function handlePay() {
    if (paymentState === 'processing') return
    setPaymentState('processing')

    try {
      const { data: orderData } = await createOrder({
        bookingId,
        amount: payAmount,
        currency: 'INR',
      })

      await openCheckout({
        order: orderData.order,
        serviceName: booking.service?.name || 'Event Service',
        onSuccess: (response) => {
          verifyMutation.mutate({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
        },
        onFailure: (reason) => {
          setPaymentState('idle')
          if (reason !== 'Payment cancelled') toast.error(reason)
        },
      })
    } catch {
      setPaymentState('idle')
      toast.error('Could not initiate payment. Please try again.')
    }
  }

  if (paymentState === 'success') {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
        <UserNavbar />
        <div className="max-w-[480px] mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: '#DCFCE7' }}
          >
            <CheckCircle size={40} className="text-[#016630]" />
          </motion.div>
          <h1 className="font-filson font-black text-[#101828] text-3xl mb-2">Payment Successful!</h1>
          <p className="font-lato text-[#6A6A6A] text-sm">
            ₹{new Intl.NumberFormat('en-IN').format(payAmount)} paid to{' '}
            <strong className="text-[#101828]">{booking.vendor?.businessName}</strong>.
          </p>
          <p className="font-lato text-xs text-[#6A6A6A] mt-2">Redirecting to booking details…</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      <div className="max-w-[900px] mx-auto px-6 py-8">
        <h1 className="font-filson font-black text-[#101828] text-2xl mb-8">Complete Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: options */}
          <div className="lg:col-span-3 space-y-6">

            {/* Booking summary */}
            <div className="p-5 rounded-2xl" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
              <h2 className="font-lato font-bold text-[#101828] text-sm mb-4">Booking Summary</h2>
              <div className="flex items-center gap-3 mb-4">
                <img src={booking.vendor?.coverImage} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div>
                  <p className="font-lato font-semibold text-[#101828] text-sm">{booking.vendor?.businessName}</p>
                  <p className="font-lato text-[#6A6A6A] text-xs">{booking.service?.name}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs font-lato">
                {[
                  { icon: Calendar, val: new Date(booking.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) },
                  { icon: Users,    val: `${booking.guests} guests` },
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

            {/* Security note */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl" style={{ background: '#DCFCE7', border: '1px solid rgba(1,102,48,0.15)' }}>
              <ShieldCheck size={16} className="text-[#016630] mt-0.5 shrink-0" />
              <p className="font-lato text-xs text-[#016630]">
                Your payment is secured by Razorpay. iBento never stores your card details.
              </p>
            </div>

            {paymentState === 'failed' && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl" style={{ background: '#FFE2E2', border: '1px solid rgba(159,7,18,0.15)' }}>
                <AlertCircle size={16} className="text-[#9F0712] mt-0.5 shrink-0" />
                <p className="font-lato text-xs text-[#9F0712]">
                  Payment verification failed. Please contact support at support@ibento.in
                </p>
              </div>
            )}
          </div>

          {/* Right: pay card */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 p-5 rounded-2xl" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.12)' }}>
              <h2 className="font-lato font-bold text-[#101828] text-sm mb-4">Order Total</h2>

              <div className="space-y-2 text-sm font-lato mb-4">
                <div className="flex justify-between">
                  <span className="text-[#6A6A6A]">Service Amount</span>
                  <span className="text-[#101828] font-semibold">₹{new Intl.NumberFormat('en-IN').format(booking.totalAmount)}</span>
                </div>
                {booking.paidAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#6A6A6A]">Already Paid</span>
                    <span className="text-[#016630] font-semibold">-₹{new Intl.NumberFormat('en-IN').format(booking.paidAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-black/5">
                  <span className="font-bold text-[#101828]">Paying Now</span>
                  <span className="font-bold text-[#8B4332] text-xl">₹{new Intl.NumberFormat('en-IN').format(payAmount)}</span>
                </div>
              </div>

              <motion.button
                onClick={handlePay}
                disabled={paymentState === 'processing' || isLoading}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-lato font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ background: '#F06138', color: '#FDFAD6' }}
              >
                <IndianRupee size={16} />
                {paymentState === 'processing' ? 'Opening Razorpay…' : `Pay ₹${new Intl.NumberFormat('en-IN').format(payAmount)}`}
              </motion.button>

              <p className="font-lato text-[10px] text-[#6A6A6A] text-center mt-3 leading-relaxed">
                By paying, you agree to iBento&apos;s refund policy. Deposits are non-refundable within 48h of event.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

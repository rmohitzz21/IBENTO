import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft, Calendar, Users, MapPin, FileText,
  Download, MessageSquare, XCircle, CheckCircle,
  Clock, IndianRupee, Phone, Share2, BadgeCheck, Star
} from 'lucide-react'
import toast from 'react-hot-toast'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { getBooking, cancelBooking, getInvoice, createReview } from '../../services/bookings'
import { pageVariants } from '../../animations/pageTransitions'

const STATUS_CONFIG = {
  pending:   { bg: '#FEF9C2', color: '#894B00', label: 'Pending Confirmation', dot: '#F59E0B' },
  confirmed: { bg: '#DBEAFE', color: '#193CB8', label: 'Confirmed',           dot: '#3B82F6' },
  completed: { bg: '#DCFCE7', color: '#016630', label: 'Completed',           dot: '#22C55E' },
  cancelled: { bg: '#FFE2E2', color: '#9F0712', label: 'Cancelled',           dot: '#EF4444' },
  rejected:  { bg: '#FFE2E2', color: '#9F0712', label: 'Rejected',            dot: '#EF4444' },
}

const MOCK_BOOKING = {
  _id: 'b1',
  status: 'confirmed',
  totalAmount: 45000,
  depositAmount: 15000,
  paidAmount: 15000,
  eventDate: '2025-04-15T10:00:00.000Z',
  eventTime: '10:00',
  eventType: 'Wedding',
  guestCount: 150,
  eventAddress: 'Taj Mahal Palace Hotel, Apollo Bunder, Mumbai, Maharashtra 400001',
  specialRequests: 'Prefer pastel floral theme. Bride favorite color is blush pink.',
  createdAt: '2025-03-01T09:00:00.000Z',
  vendor: { businessName: 'Royal Events & Décor', coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80', category: 'Decoration', city: 'Mumbai', phone: '+91 98765 43210', isVerified: true },
  service: { name: 'Basic Wedding Package', price: 45000 },
}

const TIMELINE_STEPS = [
  { key: 'requested', icon: CheckCircle,  label: 'Booking Requested',   desc: 'Your request was sent to the vendor' },
  { key: 'confirmed', icon: Clock,        label: 'Vendor Confirmation',  desc: 'Vendor reviews and confirms the booking' },
  { key: 'payment',   icon: IndianRupee,  label: 'Payment',             desc: 'Complete the payment to secure your booking' },
  { key: 'event',     icon: Calendar,     label: 'Event Day',           desc: 'Your event takes place on this date' },
]

function getStepActive(stepKey, booking) {
  const s = booking.status
  if (stepKey === 'requested') return true
  if (stepKey === 'confirmed') return ['confirmed', 'completed'].includes(s)
  if (stepKey === 'payment')   return booking.paidAmount > 0 || s === 'completed'
  if (stepKey === 'event')     return s === 'completed'
  return false
}

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [reviewModal, setReviewModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBooking(id),
    enabled: !!id,
  })
  const booking = data?.data?.booking || MOCK_BOOKING
  const st = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(id, { reason: 'Customer requested cancellation' }),
    onSuccess: () => {
      toast.success('Booking cancelled.')
      qc.invalidateQueries(['booking', id])
      qc.invalidateQueries(['my-bookings'])
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Cancellation failed.'),
  })

  const reviewMutation = useMutation({
    mutationFn: () => createReview({ bookingId: id, rating, comment }),
    onSuccess: () => {
      toast.success('Review submitted successfully!')
      setReviewModal(false)
      qc.invalidateQueries(['booking', id])
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to submit review.'),
  })

  async function downloadInvoice() {
    try {
      const res = await getInvoice(id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url; a.download = `invoice-${id}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Could not download invoice.')
    }
  }

  const canCancel = ['pending', 'confirmed'].includes(booking.status)
  const balanceDue = booking.totalAmount - (booking.paidAmount || 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDFC]">
        <UserNavbar />
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="h-8 w-32 rounded-lg animate-pulse bg-gray-100 mb-6" />
          <div className="h-64 rounded-2xl animate-pulse bg-gray-100 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl animate-pulse bg-gray-100" />)}
            </div>
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl animate-pulse bg-gray-100" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      {/* Hero vendor banner */}
      <div className="relative h-52 overflow-hidden">
        <img src={booking.vendor?.coverImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-6 max-w-[1280px] mx-auto" style={{ left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {booking.vendor?.isVerified && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(1,102,48,0.85)', color: '#fff' }}>
                    <BadgeCheck size={11} /> Verified
                  </span>
                )}
              </div>
              <h1 className="font-filson font-black text-white text-2xl leading-tight">{booking.vendor?.businessName}</h1>
              <p className="font-lato text-white/80 text-sm">{booking.service?.name} · {booking.vendor?.city}</p>
            </div>
            <span
              className="flex items-center gap-1.5 text-sm font-lato font-bold px-4 py-2 rounded-full backdrop-blur-sm"
              style={{ background: `${st.bg}E6`, color: st.color }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: st.dot }} />
              {st.label}
            </span>
          </div>
        </div>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-6 flex items-center gap-1.5 font-lato text-sm text-white/90 hover:text-white bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all hover:bg-black/50"
        >
          <ChevronLeft size={15} /> My Bookings
        </button>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Booking ID */}
        <p className="font-lato text-xs text-[#6A6A6A] mb-6">
          Booking ID: <span className="font-semibold text-[#101828]">#{id?.slice(-8).toUpperCase()}</span>
          <span className="mx-2 text-[#6A6A6A]">·</span>
          Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main details */}
          <div className="lg:col-span-2 space-y-5">

            {/* Event info */}
            <div className="p-5 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(139,67,50,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h2 className="font-lato font-bold text-[#101828] text-sm mb-4">Event Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Calendar,  label: 'Event Date', val: new Date(booking.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                  { icon: Clock,     label: 'Event Time', val: booking.eventTime || 'Not specified' },
                  { icon: Users,     label: 'Guest Count', val: `${booking.guestCount || booking.guests || '—'} guests` },
                  { icon: FileText,  label: 'Event Type', val: booking.eventType || 'Not specified' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF3EF' }}>
                        <Icon size={15} style={{ color: '#F06138' }} />
                      </div>
                      <div>
                        <p className="font-lato text-xs text-[#6A6A6A]">{item.label}</p>
                        <p className="font-lato text-sm text-[#101828] font-semibold mt-0.5">{item.val}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-black/5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF3EF' }}>
                  <MapPin size={15} style={{ color: '#F06138' }} />
                </div>
                <div>
                  <p className="font-lato text-xs text-[#6A6A6A]">Venue Address</p>
                  <p className="font-lato text-sm text-[#101828] font-semibold mt-0.5 leading-relaxed">{booking.eventAddress}</p>
                </div>
              </div>
              {booking.specialRequests && (
                <div className="mt-4 pt-4 border-t border-black/5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FFF3EF' }}>
                    <FileText size={15} style={{ color: '#F06138' }} />
                  </div>
                  <div>
                    <p className="font-lato text-xs text-[#6A6A6A]">Special Requirements</p>
                    <p className="font-lato text-sm text-[#101828] mt-0.5 leading-relaxed">{booking.specialRequests}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment summary */}
            <div className="p-5 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(139,67,50,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h2 className="font-lato font-bold text-[#101828] text-sm mb-4">Payment Summary</h2>
              <div className="space-y-3 text-sm font-lato">
                <div className="flex justify-between items-center">
                  <span className="text-[#6A6A6A]">Service Amount</span>
                  <span className="font-semibold text-[#101828]">₹{new Intl.NumberFormat('en-IN').format(booking.totalAmount)}</span>
                </div>
                {booking.depositAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#6A6A6A]">Amount Paid</span>
                    <span className="font-semibold text-[#016630]">- ₹{new Intl.NumberFormat('en-IN').format(booking.paidAmount || booking.depositAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-black/5">
                  <span className="font-bold text-[#101828]">Balance Due</span>
                  <span className="font-filson font-black text-[#8B4332] text-xl">
                    ₹{new Intl.NumberFormat('en-IN').format(balanceDue)}
                  </span>
                </div>
              </div>
              {balanceDue > 0 && booking.status === 'confirmed' && (
                <div className="mt-4 p-3 rounded-xl" style={{ background: '#FFF3EF', border: '1px solid rgba(240,97,56,0.15)' }}>
                  <p className="font-lato text-xs text-[#F06138] font-semibold">💡 Complete the payment to secure your booking slot</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="p-5 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(139,67,50,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h2 className="font-lato font-bold text-[#101828] text-sm mb-5">Booking Progress</h2>
              <div className="space-y-0">
                {TIMELINE_STEPS.map((step, i) => {
                  const Icon = step.icon
                  const active = getStepActive(step.key, booking)
                  const isLast = i === TIMELINE_STEPS.length - 1
                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <motion.div
                          initial={false}
                          animate={active ? { scale: [1, 1.15, 1] } : {}}
                          transition={{ duration: 0.3 }}
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                          style={active
                            ? { background: 'linear-gradient(135deg, #F06138, #8B4332)', boxShadow: '0 4px 12px rgba(240,97,56,0.3)' }
                            : { background: '#F3F4F6' }
                          }
                        >
                          <Icon size={16} className={active ? 'text-white' : 'text-gray-400'} />
                        </motion.div>
                        {!isLast && (
                          <div
                            className="w-0.5 h-8 mt-1 rounded-full transition-all duration-500"
                            style={{ background: active ? 'linear-gradient(to bottom, #F06138, rgba(240,97,56,0.2))' : '#E5E7EB' }}
                          />
                        )}
                      </div>
                      <div className={`pt-1 ${!isLast ? 'pb-6' : ''}`}>
                        <p className={`font-lato font-semibold text-sm ${active ? 'text-[#101828]' : 'text-[#6A6A6A]'}`}>{step.label}</p>
                        <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">{step.desc}</p>
                        {step.key === 'requested' && (
                          <p className="font-lato text-xs text-[#F06138] mt-0.5">
                            {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                        {step.key === 'event' && booking.status !== 'cancelled' && (
                          <p className="font-lato text-xs text-[#F06138] mt-0.5">
                            {new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Action sidebar */}
          <div className="lg:col-span-1 space-y-3">
            {/* Primary: Pay Now */}
            {booking.status === 'confirmed' && balanceDue > 0 && (
              <Link
                to={`/payment/${id}`}
                className="w-full py-4 rounded-xl font-lato font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #F06138, #8B4332)', color: '#FDFAD6', boxShadow: '0 4px 16px rgba(240,97,56,0.35)' }}
              >
                <IndianRupee size={16} /> Pay ₹{new Intl.NumberFormat('en-IN').format(balanceDue)}
              </Link>
            )}

            <button
              onClick={downloadInvoice}
              className="w-full py-3 rounded-xl font-lato font-semibold text-sm border text-[#364153] hover:bg-[#FFF3EF] hover:border-[#F06138]/30 transition-all flex items-center justify-center gap-2"
              style={{ borderColor: 'rgba(139,67,50,0.2)' }}
            >
              <Download size={15} /> Download Invoice
            </button>

            <Link
              to="/chat"
              className="w-full py-3 rounded-xl font-lato font-semibold text-sm border text-[#364153] hover:bg-[#FFF3EF] hover:border-[#F06138]/30 transition-all flex items-center justify-center gap-2 block text-center"
              style={{ borderColor: 'rgba(139,67,50,0.2)' }}
            >
              <MessageSquare size={15} /> Message Vendor
            </Link>

            {booking.status === 'completed' && !booking.review && (
              <button
                onClick={() => setReviewModal(true)}
                className="w-full py-3 rounded-xl font-lato font-semibold text-sm transition-all flex items-center justify-center gap-2 text-center"
                style={{ background: '#F06138', color: '#FDFAD6' }}
              >
                <Star size={15} /> Write a Review
              </button>
            )}

            {canCancel && (
              <button
                onClick={() => { if (window.confirm('Are you sure you want to cancel this booking?')) cancelMutation.mutate() }}
                disabled={cancelMutation.isPending}
                className="w-full py-3 rounded-xl font-lato font-semibold text-sm border border-red-200 text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={15} /> {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Booking'}
              </button>
            )}

            {/* Vendor contact */}
            <div className="p-4 rounded-2xl" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
              <p className="font-lato font-bold text-[#101828] text-xs mb-3">Vendor Contact</p>
              <p className="font-lato font-semibold text-[#101828] text-sm">{booking.vendor?.businessName}</p>
              {booking.vendor?.phone && (
                <a href={`tel:${booking.vendor.phone}`} className="flex items-center gap-2 mt-2 font-lato text-xs text-[#6A6A6A] hover:text-[#F06138] transition-colors">
                  <Phone size={12} /> {booking.vendor.phone}
                </a>
              )}
            </div>

            {/* Help */}
            <div className="p-4 rounded-2xl text-xs font-lato text-[#6A6A6A]" style={{ background: '#fff', border: '1px solid rgba(139,67,50,0.08)' }}>
              <p className="font-semibold text-[#101828] mb-1">Need help?</p>
              <p>Contact support at <a href="mailto:support@ibento.in" className="text-[#F06138] hover:underline">support@ibento.in</a></p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg p-6 overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-filson font-bold text-xl text-[#101828]">Write a Review</h2>
              <button onClick={() => setReviewModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
            </div>
            
            <div className="mb-5">
              <p className="font-lato font-semibold text-sm text-[#364153] mb-2">Rating</p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((starEl) => (
                  <button key={starEl} onClick={() => setRating(starEl)} className="focus:outline-none">
                    <Star size={24} className={starEl <= rating ? 'text-[#F06138] fill-[#F06138]' : 'text-gray-200 fill-gray-200'} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="font-lato font-semibold text-sm text-[#364153] mb-2">Comment (Optional)</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience working with this vendor..."
                className="w-full p-3 rounded-xl border border-gray-200 text-sm font-lato focus:border-[#F06138] focus:outline-none focus:ring-1 focus:ring-[#F06138] resize-none h-28"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReviewModal(false)}
                className="px-5 py-2.5 rounded-xl font-lato font-semibold text-sm text-[#364153] bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={reviewMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={() => reviewMutation.mutate()}
                disabled={reviewMutation.isPending}
                className="px-5 py-2.5 rounded-xl font-lato font-semibold text-sm transition-all"
                style={{ background: '#F06138', color: '#FDFAD6' }}
              >
                {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </motion.div>
  )
}

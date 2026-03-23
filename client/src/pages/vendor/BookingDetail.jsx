import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft, Calendar, Users, MapPin, FileText,
  Phone, Mail, CheckCircle2, XCircle, IndianRupee, MessageSquare, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import VendorSidebar from '../../components/shared/VendorSidebar'
import { pageVariants } from '../../animations/pageTransitions'
import api from '../../services/api'

const STATUS_STYLE = {
  pending:   { bg: '#FEF9C2', color: '#894B00', label: 'Pending Confirmation' },
  confirmed: { bg: '#DBEAFE', color: '#193CB8', label: 'Confirmed' },
  completed: { bg: '#DCFCE7', color: '#016630', label: 'Completed' },
  cancelled: { bg: '#FFE2E2', color: '#9F0712', label: 'Cancelled' },
  rejected:  { bg: '#FFE2E2', color: '#9F0712', label: 'Rejected' },
}

const MOCK = {
  _id: 'b1',
  status: 'pending',
  totalAmount: 45000,
  depositAmount: 15000,
  paidAmount: 0,
  eventDate: '2025-04-15T10:00:00.000Z',
  guests: 150,
  eventAddress: 'Taj Mahal Palace Hotel, Apollo Bunder, Mumbai',
  notes: 'Prefer pastel floral theme. Bride favourite color is blush pink.',
  createdAt: new Date().toISOString(),
  customer: { name: 'Priya Sharma', email: 'priya@example.com', phone: '9812345678' },
  service: { name: 'Basic Wedding Package', price: 45000 },
}

export default function VendorBookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-booking', id],
    queryFn: () => api.get(`/bookings/${id}`),
    enabled: !!id,
  })
  const rawBooking = data?.data?.booking
  // Normalise API shape → component shape
  const booking = rawBooking ? {
    ...rawBooking,
    customer: rawBooking.userId ? {
      name:  rawBooking.userId.name,
      email: rawBooking.userId.email,
      phone: rawBooking.userId.phone,
    } : MOCK.customer,
    service: rawBooking.serviceId ? {
      name:  rawBooking.serviceId.title,
      price: rawBooking.serviceId.price,
    } : MOCK.service,
    guests:       rawBooking.guestCount,
    notes:        rawBooking.specialRequests,
    paidAmount:   rawBooking.paymentStatus === 'advance-paid' ? rawBooking.advanceAmount : rawBooking.paymentStatus === 'fully-paid' ? rawBooking.totalAmount : 0,
    depositAmount: rawBooking.advanceAmount,
  } : MOCK
  const st = STATUS_STYLE[booking.status] || STATUS_STYLE.pending

  const confirmMutation = useMutation({
    mutationFn: () => api.put(`/bookings/${id}/accept`),
    onSuccess: () => { toast.success('Booking confirmed!'); qc.invalidateQueries(['vendor-booking', id]) },
    onError: () => toast.error('Could not confirm booking.'),
  })

  const rejectMutation = useMutation({
    mutationFn: () => api.put(`/bookings/${id}/reject`, { reason: 'Vendor rejected' }),
    onSuccess: () => { toast.success('Booking rejected.'); qc.invalidateQueries(['vendor-booking', id]) },
    onError: () => toast.error('Could not reject booking.'),
  })

  const messageMutation = useMutation({
    mutationFn: () => api.post('/messages/send', {
      receiverId: rawBooking?.userId?._id,
      content: `Hi! I'd like to discuss your booking (${booking.bookingNumber ? '#' + booking.bookingNumber : ''}).`,
    }),
    onSuccess: () => {
      navigate('/vendor/chat', {
        state: {
          userId: rawBooking?.userId?._id,
          customerName: booking.customer?.name,
        },
      })
    },
    onError: () => toast.error('Could not open chat.'),
  })

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex min-h-screen bg-[#F8F8F4]">
      <VendorSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 font-lato text-sm text-[#6A6A6A] hover:text-[#F06138] mb-6 transition-colors">
          <ChevronLeft size={16} /> All Bookings
        </button>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="font-filson font-black text-[#101828] text-2xl">Booking Details</h1>
            <p className="font-lato text-xs text-[#6A6A6A] mt-1">ID: #{id?.slice(-8).toUpperCase()}</p>
          </div>
          <span className="text-sm font-lato font-semibold px-3 py-1.5 rounded-full" style={{ background: st.bg, color: st.color }}>
            {st.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Customer */}
            <div className="p-5 rounded-2xl bg-white border border-black/5">
              <h2 className="font-lato font-bold text-[#101828] text-sm mb-4">Customer</h2>
              <div className="space-y-2.5">
                <p className="font-lato font-semibold text-[#101828]">{booking.customer?.name}</p>
                <div className="flex items-center gap-2 text-sm font-lato text-[#6A6A6A]">
                  <Mail size={13} className="text-[#F06138]" /> {booking.customer?.email}
                </div>
                <div className="flex items-center gap-2 text-sm font-lato text-[#6A6A6A]">
                  <Phone size={13} className="text-[#F06138]" /> +91 {booking.customer?.phone}
                </div>
              </div>
            </div>

            {/* Event info */}
            <div className="p-5 rounded-2xl bg-white border border-black/5 space-y-4">
              <h2 className="font-lato font-bold text-[#101828] text-sm">Event Details</h2>
              {[
                { icon: Calendar,  label: 'Event Date',    val: new Date(booking.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                { icon: Users,     label: 'Guest Count',   val: `${booking.guests} people` },
                { icon: MapPin,    label: 'Venue',         val: booking.eventAddress },
                ...(booking.notes ? [{ icon: FileText, label: 'Special Notes', val: booking.notes }] : []),
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FFF3EF' }}>
                    <Icon size={14} style={{ color: '#F06138' }} />
                  </div>
                  <div>
                    <p className="font-lato text-xs text-[#6A6A6A]">{label}</p>
                    <p className="font-lato text-sm text-[#101828] font-medium">{val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment */}
            <div className="p-5 rounded-2xl bg-white border border-black/5">
              <h2 className="font-lato font-bold text-[#101828] text-sm mb-4">Payment</h2>
              <div className="space-y-2 text-sm font-lato">
                <div className="flex justify-between">
                  <span className="text-[#6A6A6A]">Service</span>
                  <span className="font-semibold text-[#101828]">{booking.service?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6A6A6A]">Total Amount</span>
                  <span className="font-semibold text-[#101828]">₹{new Intl.NumberFormat('en-IN').format(booking.totalAmount)}</span>
                </div>
                {booking.paidAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#6A6A6A]">Received</span>
                    <span className="font-semibold text-[#016630]">₹{new Intl.NumberFormat('en-IN').format(booking.paidAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-black/5">
                  <span className="font-bold text-[#101828]">Balance</span>
                  <span className="font-bold text-[#8B4332] text-lg">
                    ₹{new Intl.NumberFormat('en-IN').format(booking.totalAmount - (booking.paidAmount || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar actions */}
          <div className="space-y-4">
            {booking.status === 'pending' && (
              <>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => confirmMutation.mutate()}
                  disabled={confirmMutation.isPending}
                  className="w-full py-3.5 rounded-xl font-lato font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ background: '#016630', color: '#fff' }}
                >
                  <CheckCircle2 size={16} /> {confirmMutation.isPending ? 'Confirming…' : 'Confirm Booking'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { if (confirm('Reject this booking?')) rejectMutation.mutate() }}
                  disabled={rejectMutation.isPending}
                  className="w-full py-3.5 rounded-xl font-lato font-semibold text-sm flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  <XCircle size={16} /> {rejectMutation.isPending ? 'Rejecting…' : 'Reject'}
                </motion.button>
              </>
            )}

            <button
              onClick={() => !messageMutation.isPending && messageMutation.mutate()}
              disabled={messageMutation.isPending || !rawBooking?.userId?._id}
              className="w-full py-3 rounded-xl font-lato font-semibold text-sm border border-[rgba(139,67,50,0.2)] text-[#364153] hover:bg-[#FFF3EF] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {messageMutation.isPending
                ? <Loader2 size={15} className="animate-spin" />
                : <MessageSquare size={15} />
              }
              {messageMutation.isPending ? 'Opening chat…' : 'Message Customer'}
            </button>

            <div className="p-4 rounded-xl text-xs font-lato text-[#6A6A6A] bg-white border border-black/5">
              <p className="font-semibold text-[#101828] mb-1">Booking Date</p>
              <p>{new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  )
}

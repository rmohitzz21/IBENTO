import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft, Calendar, Users, MapPin, FileText,
  Download, MessageSquare, XCircle, CheckCircle,
  Clock, IndianRupee,
} from 'lucide-react'
import toast from 'react-hot-toast'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { getBooking, cancelBooking, getInvoice } from '../../services/bookings'
import { pageVariants } from '../../animations/pageTransitions'

const STATUS_STYLE = {
  pending:   { bg: '#FEF9C2', color: '#894B00', label: 'Pending Confirmation' },
  confirmed: { bg: '#DBEAFE', color: '#193CB8', label: 'Confirmed' },
  completed: { bg: '#DCFCE7', color: '#016630', label: 'Completed' },
  cancelled: { bg: '#FFE2E2', color: '#9F0712', label: 'Cancelled' },
  rejected:  { bg: '#FFE2E2', color: '#9F0712', label: 'Rejected' },
}

const MOCK_BOOKING = {
  _id: 'b1',
  status: 'confirmed',
  totalAmount: 45000,
  depositAmount: 15000,
  paidAmount: 15000,
  eventDate: '2025-04-15T10:00:00.000Z',
  guests: 150,
  eventAddress: 'Taj Mahal Palace Hotel, Apollo Bunder, Mumbai, Maharashtra 400001',
  notes: 'Prefer pastel floral theme. Bride favorite color is blush pink.',
  createdAt: '2025-03-01T09:00:00.000Z',
  vendor: { businessName: 'Royal Events & Décor', coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80', category: 'Decoration', city: 'Mumbai' },
  service: { name: 'Basic Wedding Package', price: 45000 },
}

function TimelineStep({ icon: Icon, label, date, active, last }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? 'bg-[#F06138]' : 'bg-gray-100'}`}>
          <Icon size={15} className={active ? 'text-white' : 'text-gray-400'} />
        </div>
        {!last && <div className="w-0.5 h-6 bg-gray-200 mt-1" />}
      </div>
      <div className="pt-1 pb-6">
        <p className={`font-lato font-semibold text-sm ${active ? 'text-[#101828]' : 'text-[#6A6A6A]'}`}>{label}</p>
        {date && <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">{date}</p>}
      </div>
    </div>
  )
}

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['booking', id], queryFn: () => getBooking(id), enabled: !!id })
  const booking = data?.data?.booking || MOCK_BOOKING
  const st = STATUS_STYLE[booking.status] || STATUS_STYLE.pending

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(id, { reason: 'Customer requested cancellation' }),
    onSuccess: () => {
      toast.success('Booking cancelled.')
      qc.invalidateQueries(['booking', id])
      qc.invalidateQueries(['my-bookings'])
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Cancellation failed.'),
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

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 font-lato text-sm text-[#6A6A6A] hover:text-[#F06138] mb-6 transition-colors">
          <ChevronLeft size={16} /> My Bookings
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vendor */}
            <div className="flex items-center gap-4 p-5 rounded-2xl" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
              <img src={booking.vendor?.coverImage} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div>
                <p className="font-lato font-bold text-[#101828]">{booking.vendor?.businessName}</p>
                <p className="font-lato text-[#6A6A6A] text-sm">{booking.service?.name}</p>
                <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{booking.vendor?.city}</p>
              </div>
            </div>

            {/* Event info */}
            <div className="p-5 rounded-2xl space-y-4" style={{ background: '#FFFEF5', border: '1px solid rgba(139,67,50,0.08)' }}>
              <h2 className="font-lato font-bold text-[#101828] text-sm">Event Information</h2>
              {[
                { icon: Calendar, label: 'Event Date', val: new Date(booking.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                { icon: Users,    label: 'Guests', val: `${booking.guests} people` },
                { icon: MapPin,   label: 'Venue', val: booking.eventAddress },
                ...(booking.notes ? [{ icon: FileText, label: 'Special Notes', val: booking.notes }] : []),
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: '#FFF3EF' }}>
                      <Icon size={14} style={{ color: '#F06138' }} />
                    </div>
                    <div>
                      <p className="font-lato text-xs text-[#6A6A6A]">{item.label}</p>
                      <p className="font-lato text-sm text-[#101828] font-medium">{item.val}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Payment summary */}
            <div className="p-5 rounded-2xl" style={{ background: '#FFFEF5', border: '1px solid rgba(139,67,50,0.08)' }}>
              <h2 className="font-lato font-bold text-[#101828] text-sm mb-4">Payment Summary</h2>
              <div className="space-y-2 text-sm font-lato">
                <div className="flex justify-between">
                  <span className="text-[#6A6A6A]">Service Amount</span>
                  <span className="font-semibold text-[#101828]">₹{new Intl.NumberFormat('en-IN').format(booking.totalAmount)}</span>
                </div>
                {booking.depositAmount && (
                  <div className="flex justify-between">
                    <span className="text-[#6A6A6A]">Deposit Paid</span>
                    <span className="font-semibold text-[#016630]">-₹{new Intl.NumberFormat('en-IN').format(booking.depositAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-black/5">
                  <span className="font-bold text-[#101828]">Balance Due</span>
                  <span className="font-bold text-[#8B4332] text-lg">
                    ₹{new Intl.NumberFormat('en-IN').format(booking.totalAmount - (booking.paidAmount || 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-5 rounded-2xl" style={{ background: '#FFFEF5', border: '1px solid rgba(139,67,50,0.08)' }}>
              <h2 className="font-lato font-bold text-[#101828] text-sm mb-5">Booking Timeline</h2>
              <TimelineStep icon={CheckCircle} label="Booking Requested" date={new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} active />
              <TimelineStep icon={Clock} label="Vendor Confirmation" date={booking.status !== 'pending' ? 'Confirmed' : 'Awaiting…'} active={booking.status !== 'pending'} />
              <TimelineStep icon={IndianRupee} label="Payment" active={booking.paidAmount > 0} />
              <TimelineStep icon={Calendar} label="Event Day" date={new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} active={booking.status === 'completed'} last />
            </div>
          </div>

          {/* Action sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {booking.status === 'confirmed' && (
              <Link to={`/payment/${id}`} className="w-full py-3.5 rounded-xl font-lato font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
                <IndianRupee size={16} /> Complete Payment
              </Link>
            )}

            <button onClick={downloadInvoice} className="w-full py-3 rounded-xl font-lato font-semibold text-sm border border-[rgba(139,67,50,0.2)] text-[#364153] hover:bg-[#FFF3EF] transition-colors flex items-center justify-center gap-2">
              <Download size={16} /> Download Invoice
            </button>

            <Link to="/chat" className="w-full py-3 rounded-xl font-lato font-semibold text-sm border border-[rgba(139,67,50,0.2)] text-[#364153] hover:bg-[#FFF3EF] transition-colors flex items-center justify-center gap-2 block text-center">
              <MessageSquare size={16} /> Message Vendor
            </Link>

            {canCancel && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this booking?')) cancelMutation.mutate()
                }}
                disabled={cancelMutation.isPending}
                className="w-full py-3 rounded-xl font-lato font-semibold text-sm border border-red-200 text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={16} /> {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Booking'}
              </button>
            )}

            <div className="p-4 rounded-xl text-xs font-lato text-[#6A6A6A]" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.08)' }}>
              <p className="font-semibold text-[#101828] mb-1">Need help?</p>
              <p>Contact our support team at <a href="mailto:support@ibento.in" className="text-[#F06138]">support@ibento.in</a></p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}

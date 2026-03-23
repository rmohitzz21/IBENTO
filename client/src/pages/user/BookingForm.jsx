import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, Users, MapPin, FileText, ChevronLeft, IndianRupee } from 'lucide-react'
import toast from 'react-hot-toast'
import UserNavbar from '../../components/shared/UserNavbar'
import { getVendor, getVendorServices } from '../../services/vendors'
import { createBooking } from '../../services/bookings'
import { pageVariants } from '../../animations/pageTransitions'

const schema = z.object({
  eventDate: z.string().min(1, 'Please select an event date'),
  eventTime: z.string().min(1, 'Please select a time'),
  eventType: z.string().min(1, 'Please select an event type'),
  guestCount: z.coerce.number().min(1, 'At least 1 guest').max(10000, 'Maximum 10,000 guests'),
  eventAddress: z.string().min(5, 'Please enter the event address'),
  specialRequests: z.string().optional(),
})

const MOCK_VENDOR = { businessName: 'Royal Events & Décor', city: 'Mumbai', coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80', isVerified: true }
const MOCK_SERVICE = { _id: 's1', name: 'Basic Wedding Package', price: 45000, description: 'Full hall decoration with flowers, drapes, and lighting.', duration: '1 day' }

export default function BookingForm() {
  const { vendorId, serviceId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const { data: vData } = useQuery({ queryKey: ['vendor', vendorId], queryFn: () => getVendor(vendorId), enabled: !!vendorId })
  const { data: sData } = useQuery({ queryKey: ['vendor-services', vendorId], queryFn: () => getVendorServices(vendorId), enabled: !!vendorId })

  const vendor = vData?.data?.vendor || MOCK_VENDOR
  const services = sData?.data?.services || [MOCK_SERVICE]
  const service = services.find((s) => s._id === serviceId) || services[0] || MOCK_SERVICE

  const prefilledDate = location.state?.eventDate

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { guestCount: 50, eventDate: prefilledDate || '' },
  })

  const guestCount = watch('guestCount') || 50

  const mutation = useMutation({
    mutationFn: (data) =>
      createBooking({
        serviceId: service._id,
        vendorId,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        eventType: data.eventType,
        guestCount: data.guestCount,
        eventAddress: data.eventAddress,
        specialRequests: data.specialRequests || '',
      }),
    onSuccess: ({ data }) => {
      toast.success('Booking request sent!')
      navigate(`/booking/confirm/${data.booking._id}`)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Booking failed. Please try again.'),
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 font-lato text-sm text-[#6A6A6A] hover:text-[#F06138] mb-6 transition-colors">
          <ChevronLeft size={16} /> Back
        </button>

        <h1 className="font-filson font-black text-[#101828] text-3xl mb-8">Book Service</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">

              {/* Event Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">
                    <Calendar size={14} className="inline mr-1.5" />Event Date
                  </label>
                  <input type="date" min={today} className="input-field" style={errors.eventDate ? { borderColor: '#EF4444' } : {}} {...register('eventDate')} />
                  {errors.eventDate && <p className="mt-1 text-xs text-red-500">{errors.eventDate.message}</p>}
                </div>
                <div>
                  <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Event Time</label>
                  <input type="time" className="input-field" style={errors.eventTime ? { borderColor: '#EF4444' } : {}} {...register('eventTime')} />
                  {errors.eventTime && <p className="mt-1 text-xs text-red-500">{errors.eventTime.message}</p>}
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Event Type</label>
                <select className="input-field" style={errors.eventType ? { borderColor: '#EF4444' } : {}} {...register('eventType')}>
                  <option value="">Select event type</option>
                  {['Wedding', 'Engagement', 'Birthday', 'Anniversary', 'Corporate', 'Baby Shower', 'Farewell', 'Other'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.eventType && <p className="mt-1 text-xs text-red-500">{errors.eventType.message}</p>}
              </div>

              {/* Guests */}
              <div>
                <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">
                  <Users size={14} className="inline mr-1.5" />Number of Guests
                </label>
                <input type="number" min={1} placeholder="50" className="input-field" style={errors.guestCount ? { borderColor: '#EF4444' } : {}} {...register('guestCount')} />
                {errors.guestCount && <p className="mt-1 text-xs text-red-500">{errors.guestCount.message}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">
                  <MapPin size={14} className="inline mr-1.5" />Event Address
                </label>
                <textarea rows={3} placeholder="Full venue address including city…" className="input-field resize-none" style={errors.eventAddress ? { borderColor: '#EF4444' } : {}} {...register('eventAddress')} />
                {errors.eventAddress && <p className="mt-1 text-xs text-red-500">{errors.eventAddress.message}</p>}
              </div>

              {/* Special Requests */}
              <div>
                <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">
                  <FileText size={14} className="inline mr-1.5" />Special Requirements (optional)
                </label>
                <textarea rows={3} placeholder="Any special requests, theme preferences, dietary restrictions…" className="input-field resize-none" {...register('specialRequests')} />
              </div>

              <motion.button
                type="submit"
                disabled={mutation.isPending}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-lato font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: mutation.isPending ? '#c0956b' : '#F06138', color: '#FDFAD6', cursor: mutation.isPending ? 'not-allowed' : 'pointer' }}
              >
                {mutation.isPending
                  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Sending Request…</>
                  : 'Send Booking Request'
                }
              </motion.button>

              <p className="font-lato text-xs text-[#6A6A6A] text-center">
                You won't be charged yet. The vendor will confirm within 24 hours.
              </p>
            </form>
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(139,67,50,0.12)' }}>
              {/* Vendor */}
              <div className="relative h-36 overflow-hidden">
                <img src={vendor.coverImage} alt={vendor.businessName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="font-filson font-black text-white text-lg leading-tight">{vendor.businessName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-white/80" />
                    <span className="font-lato text-white/80 text-xs">{vendor.city}</span>
                  </div>
                </div>
              </div>

              {/* Service details */}
              <div className="p-5" style={{ background: '#FEFDEB' }}>
                <h3 className="font-lato font-bold text-[#101828] text-sm mb-1">{service.title}</h3>
                <p className="font-lato text-[#6A6A6A] text-xs leading-relaxed mb-4">{service.description}</p>

                <div className="space-y-2 text-sm font-lato mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#6A6A6A]">Service Price</span>
                    <span className="font-semibold text-[#101828]">₹{new Intl.NumberFormat('en-IN').format(service.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6A6A6A]">Duration</span>
                    <span className="font-semibold text-[#101828]">{service.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6A6A6A]">Guests</span>
                    <span className="font-semibold text-[#101828]">{guestCount} pax</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-black/5">
                  <span className="font-lato font-bold text-[#101828] text-sm">Total</span>
                  <div className="text-right">
                    <p className="font-filson font-black text-[#8B4332] text-2xl">
                      ₹{new Intl.NumberFormat('en-IN').format(service.price)}
                    </p>
                    <p className="font-lato text-xs text-[#6A6A6A]">incl. taxes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

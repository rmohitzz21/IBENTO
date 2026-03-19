import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ChevronRight, ChevronLeft, CheckCircle, Store, MapPin, Phone, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../../components/shared/Navbar'
import Footer from '../../components/shared/Footer'
import { applyAsVendor } from '../../services/vendors'
import { useAuthStore } from '../../stores/authStore'
import { pageVariants } from '../../animations/pageTransitions'

const CATEGORIES = ['Decoration', 'Photography', 'Videography', 'Catering', 'Entertainment', 'Venue', 'Makeup & Beauty', 'Planning & Coordination', 'Music & DJ', 'Florist']
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat']

const step1Schema = z.object({
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  category: z.string().min(1, 'Select a category'),
  city: z.string().min(1, 'Select a city'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
})

const step2Schema = z.object({
  description: z.string().min(50, 'Tell us more — at least 50 characters'),
  yearsInBusiness: z.coerce.number().min(0).max(50),
  startingPrice: z.coerce.number().min(1000, 'Minimum starting price is ₹1,000'),
})

const STEPS = [
  { label: 'Business Info', icon: Store },
  { label: 'Details', icon: FileText },
  { label: 'Review', icon: CheckCircle },
]

export default function VendorApply() {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const form1 = useForm({ resolver: zodResolver(step1Schema) })
  const form2 = useForm({ resolver: zodResolver(step2Schema) })

  const mutation = useMutation({
    mutationFn: (data) => applyAsVendor(data),
    onSuccess: ({ data }) => {
      // Server returns a fresh token with role:'vendor' — update the store
      if (data.accessToken) setToken(data.accessToken)
      if (data.user) setUser(data.user)
      setSubmitted(true)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Application failed. Please try again.'),
  })

  function onStep1(data) {
    setFormData((p) => ({ ...p, ...data }))
    setStep(1)
  }

  function onStep2(data) {
    setFormData((p) => ({ ...p, ...data }))
    setStep(2)
  }

  function handleSubmit() {
    mutation.mutate(formData)
  }

  if (submitted) {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
        <Navbar />
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
          <h1 className="font-filson font-black text-[#101828] text-3xl mb-3">Application Sent!</h1>
          <p className="font-lato text-[#6A6A6A] text-sm mb-8 leading-relaxed">
            Thank you for applying to join iBento as a vendor. Our team will review your application and get back within 2–3 business days.
          </p>
          <button
            onClick={() => navigate('/vendor/dashboard')}
            className="px-8 py-3 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ background: '#F06138', color: '#FDFAD6' }}
          >
            View Application Status
          </button>
        </div>
        <Footer />
      </motion.div>
    )
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <Navbar />

      <div className="max-w-[640px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-filson font-black text-[#101828] text-4xl mb-2">Join iBento</h1>
          <p className="font-lato text-[#6A6A6A] text-sm">List your business and reach thousands of event planners</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const done = i < step
            const active = i === step
            return (
              <div key={s.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{ background: done ? '#016630' : active ? '#F06138' : '#E5E7EB' }}
                  >
                    <Icon size={18} className={done || active ? 'text-white' : 'text-gray-400'} />
                  </div>
                  <span className={`font-lato text-xs mt-1 ${active ? 'text-[#F06138] font-semibold' : 'text-[#6A6A6A]'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-16 h-0.5 mb-5 mx-1" style={{ background: i < step ? '#016630' : '#E5E7EB' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step card */}
        <div className="rounded-2xl p-8" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.12)' }}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={form1.handleSubmit(onStep1)}
                className="space-y-5"
              >
                <h2 className="font-filson font-black text-[#101828] text-xl mb-4">Business Information</h2>

                <div>
                  <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Business Name</label>
                  <input type="text" placeholder="e.g. Royal Events & Décor" className="input-field" {...form1.register('businessName')} />
                  {form1.formState.errors.businessName && <p className="mt-1 text-xs text-red-500">{form1.formState.errors.businessName.message}</p>}
                </div>

                <div>
                  <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Category</label>
                  <select className="input-field" {...form1.register('category')}>
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {form1.formState.errors.category && <p className="mt-1 text-xs text-red-500">{form1.formState.errors.category.message}</p>}
                </div>

                <div>
                  <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">City</label>
                  <select className="input-field" {...form1.register('city')}>
                    <option value="">Select a city</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {form1.formState.errors.city && <p className="mt-1 text-xs text-red-500">{form1.formState.errors.city.message}</p>}
                </div>

                <div>
                  <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-lato text-sm text-[#6A6A6A]">+91</span>
                    <input type="tel" maxLength={10} className="input-field pl-12" placeholder="98XXXXXXXX" {...form1.register('phone')} />
                  </div>
                  {form1.formState.errors.phone && <p className="mt-1 text-xs text-red-500">{form1.formState.errors.phone.message}</p>}
                </div>

                <button type="submit" className="w-full py-3.5 rounded-xl font-lato font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
                  Continue <ChevronRight size={16} />
                </button>
              </motion.form>
            )}

            {step === 1 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={form2.handleSubmit(onStep2)}
                className="space-y-5"
              >
                <h2 className="font-filson font-black text-[#101828] text-xl mb-4">Business Details</h2>

                <div>
                  <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Business Description</label>
                  <textarea rows={4} placeholder="Describe your services, experience, specialties…" className="input-field resize-none" {...form2.register('description')} />
                  {form2.formState.errors.description && <p className="mt-1 text-xs text-red-500">{form2.formState.errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Years in Business</label>
                    <input type="number" min={0} max={50} placeholder="3" className="input-field" {...form2.register('yearsInBusiness')} />
                  </div>
                  <div>
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Starting Price (₹)</label>
                    <input type="number" min={1000} placeholder="25000" className="input-field" {...form2.register('startingPrice')} />
                    {form2.formState.errors.startingPrice && <p className="mt-1 text-xs text-red-500">{form2.formState.errors.startingPrice.message}</p>}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(0)} className="flex-1 py-3.5 rounded-xl font-lato font-semibold text-sm border border-[rgba(139,67,50,0.2)] text-[#364153] hover:bg-[#FFF3EF] transition-colors flex items-center justify-center gap-2">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button type="submit" className="flex-1 py-3.5 rounded-xl font-lato font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-filson font-black text-[#101828] text-xl mb-5">Review Your Application</h2>

                <div className="space-y-3 mb-6">
                  {[
                    { label: 'Business Name', val: formData.businessName },
                    { label: 'Category',      val: formData.category },
                    { label: 'City',          val: formData.city },
                    { label: 'Phone',         val: `+91 ${formData.phone}` },
                    { label: 'Description',   val: formData.description },
                    { label: 'Years Active',  val: `${formData.yearsInBusiness} years` },
                    { label: 'Starting From', val: `₹${new Intl.NumberFormat('en-IN').format(formData.startingPrice)}` },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex gap-3 text-sm font-lato">
                      <span className="text-[#6A6A6A] w-32 shrink-0">{label}</span>
                      <span className="text-[#101828] font-medium">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl font-lato font-semibold text-sm border border-[rgba(139,67,50,0.2)] text-[#364153] hover:bg-[#FFF3EF] transition-colors flex items-center justify-center gap-2">
                    <ChevronLeft size={16} /> Edit
                  </button>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={mutation.isPending}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3.5 rounded-xl font-lato font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
                    style={{ background: '#F06138', color: '#FDFAD6' }}
                  >
                    <CheckCircle size={16} /> {mutation.isPending ? 'Submitting…' : 'Submit Application'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}

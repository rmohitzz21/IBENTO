import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ChevronRight, ChevronLeft, CheckCircle, Store, FileText, ShieldCheck, Clock, Lock, Mail, Phone } from 'lucide-react'
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

const step3Schema = z.object({
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Enter a valid PAN number (e.g. ABCDE1234F)')
    .optional()
    .or(z.literal('')),
  aadhaar: z
    .string()
    .regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits')
    .optional()
    .or(z.literal('')),
  gst: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Enter a valid GST number')
    .optional()
    .or(z.literal('')),
  bankAccountNumber: z
    .string()
    .min(9, 'Account number must be at least 9 digits')
    .max(18, 'Account number must be at most 18 digits')
    .regex(/^\d+$/, 'Account number must be numeric')
    .optional()
    .or(z.literal('')),
  ifsc: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code (e.g. SBIN0001234)')
    .optional()
    .or(z.literal('')),
  accountName: z.string().optional().or(z.literal('')),
})

const STEPS = [
  { label: 'Business Info', icon: Store },
  { label: 'Details', icon: FileText },
  { label: 'KYC & Bank', icon: ShieldCheck },
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
  const form3 = useForm({ resolver: zodResolver(step3Schema) })

  const mutation = useMutation({
    mutationFn: (data) => applyAsVendor(data),
    onSuccess: ({ data }) => {
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

  function onStep3(data) {
    const kycData = {
      pan: data.pan?.toUpperCase() || undefined,
      aadhaar: data.aadhaar || undefined,
      gst: data.gst?.toUpperCase() || undefined,
      bankAccount: (data.bankAccountNumber || data.ifsc || data.accountName)
        ? {
            accountNumber: data.bankAccountNumber || undefined,
            ifsc: data.ifsc?.toUpperCase() || undefined,
            accountName: data.accountName || undefined,
          }
        : undefined,
    }
    setFormData((p) => ({ ...p, ...kycData }))
    setStep(3)
  }

  function handleSubmit() {
    mutation.mutate(formData)
  }

  if (submitted) {
    const APPROVAL_STAGES = [
      { label: 'Application Submitted',   done: true,  active: false },
      { label: 'Under Review',            done: false, active: true  },
      { label: 'Admin Approval Pending',  done: false, active: false },
      { label: 'Account Activated',       done: false, active: false },
    ]

    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
        <Navbar />

        <div className="max-w-[600px] mx-auto px-6 py-16">
          {/* Status icon */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 180, delay: 0.1 }}
              className="relative w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{ background: '#FEF9C2' }}
            >
              <Clock size={38} className="text-[#894B00]" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-[#894B00]/30"
              />
            </motion.div>
            <h1 className="font-filson font-black text-[#101828] text-3xl mb-2">Application Received!</h1>
            <p className="font-lato text-[#6A6A6A] text-sm">
              Your application is now under review. We'll notify you once it's processed.
            </p>
          </div>

          {/* Frozen state warning */}
          <div
            className="rounded-2xl p-5 mb-8 flex items-start gap-4"
            style={{ background: '#FFF3EF', border: '1px solid rgba(240,97,56,0.25)' }}
          >
            <Lock size={20} className="text-[#F06138] shrink-0 mt-0.5" />
            <div>
              <p className="font-lato font-semibold text-[#8B4332] text-sm mb-1">Account Temporarily Frozen</p>
              <p className="font-lato text-[#6A6A6A] text-xs leading-relaxed">
                Your vendor account is frozen until our admin team reviews and approves your application. You cannot access vendor features, list services, or receive bookings until your account is fully activated.
              </p>
            </div>
          </div>

          {/* Approval stage tracker */}
          <div
            className="rounded-2xl p-6 mb-8"
            style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.12)' }}
          >
            <p className="font-lato font-semibold text-[#101828] text-sm mb-5">Application Progress</p>
            <div className="space-y-4">
              {APPROVAL_STAGES.map((stage, i) => (
                <div key={stage.label} className="flex items-center gap-4">
                  {/* Indicator */}
                  <div className="relative shrink-0">
                    {stage.done ? (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: '#DCFCE7' }}
                      >
                        <CheckCircle size={16} className="text-[#016630]" />
                      </div>
                    ) : stage.active ? (
                      <motion.div
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: '#FEF9C2', border: '2px solid #894B00' }}
                      >
                        <Clock size={14} className="text-[#894B00]" />
                      </motion.div>
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full border-2 border-dashed border-gray-200"
                        style={{ background: '#F3F4F6' }}
                      />
                    )}
                    {/* Connector line */}
                    {i < APPROVAL_STAGES.length - 1 && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 top-8 w-0.5 h-4"
                        style={{ background: stage.done ? '#016630' : '#E5E7EB' }}
                      />
                    )}
                  </div>
                  {/* Label */}
                  <div className={`pb-3 ${i < APPROVAL_STAGES.length - 1 ? '' : ''}`}>
                    <p
                      className={`font-lato font-semibold text-sm ${
                        stage.done
                          ? 'text-[#016630]'
                          : stage.active
                          ? 'text-[#894B00]'
                          : 'text-[#9CA3AF]'
                      }`}
                    >
                      {stage.label}
                    </p>
                    {stage.active && (
                      <p className="font-lato text-xs text-[#894B00] mt-0.5">
                        Estimated: 2–3 business days
                      </p>
                    )}
                    {stage.done && (
                      <p className="font-lato text-xs text-[#016630] mt-0.5">Completed</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What happens next */}
          <div
            className="rounded-2xl p-5 mb-8"
            style={{ background: '#F0F9FF', border: '1px solid rgba(25,60,184,0.15)' }}
          >
            <p className="font-lato font-semibold text-[#193CB8] text-sm mb-3">What happens next?</p>
            <ul className="space-y-2">
              {[
                'Our team will verify your submitted documents (PAN, Aadhaar, bank details).',
                'You will receive an email & SMS notification with the decision.',
                'If additional information is needed, we will contact you directly.',
                'Once approved, your vendor dashboard will unlock automatically.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold text-white" style={{ background: '#193CB8', fontSize: '10px' }}>
                    {i + 1}
                  </span>
                  <span className="font-lato text-xs text-[#364153] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact support */}
          <div className="rounded-2xl p-5 border border-black/8 bg-white">
            <p className="font-lato font-semibold text-[#101828] text-sm mb-3">Need help?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:vendor@ibento.in"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-black/10 hover:border-[#F06138]/40 hover:bg-[#FFF3EF] transition-colors flex-1"
              >
                <Mail size={15} className="text-[#F06138] shrink-0" />
                <div>
                  <p className="font-lato font-semibold text-[#101828] text-xs">Email Support</p>
                  <p className="font-lato text-[#6A6A6A] text-xs">vendor@ibento.in</p>
                </div>
              </a>
              <a
                href="tel:+918000000000"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-black/10 hover:border-[#F06138]/40 hover:bg-[#FFF3EF] transition-colors flex-1"
              >
                <Phone size={15} className="text-[#F06138] shrink-0" />
                <div>
                  <p className="font-lato font-semibold text-[#101828] text-xs">Phone Support</p>
                  <p className="font-lato text-[#6A6A6A] text-xs">+91 80000 00000</p>
                </div>
              </a>
            </div>
          </div>

          <p className="text-center font-lato text-[#6A6A6A] text-xs mt-8">
            <Link to="/" className="text-[#F06138] hover:underline font-semibold">← Back to Home</Link>
          </p>
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
                  <div className="w-12 h-0.5 mb-5 mx-1" style={{ background: i < step ? '#016630' : '#E5E7EB' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step card */}
        <div className="rounded-2xl p-8" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.12)' }}>
          <AnimatePresence mode="wait">
            {/* STEP 0: Business Info */}
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

            {/* STEP 1: Business Details */}
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

            {/* STEP 2: KYC & Bank Details */}
            {step === 2 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={form3.handleSubmit(onStep3)}
                className="space-y-5"
              >
                <div>
                  <h2 className="font-filson font-black text-[#101828] text-xl mb-1">KYC & Bank Details</h2>
                  <p className="font-lato text-xs text-[#6A6A6A] mb-4">
                    Optional but required for payouts. All details are encrypted and stored securely.
                  </p>
                </div>

                <div className="p-4 rounded-xl" style={{ background: '#FFF3EF', border: '1px solid rgba(240,97,56,0.2)' }}>
                  <p className="font-lato text-xs font-semibold text-[#8B4332] mb-1">Identity Verification</p>

                  <div className="space-y-4 mt-3">
                    <div>
                      <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">PAN Number</label>
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        className="input-field uppercase"
                        style={{ textTransform: 'uppercase' }}
                        {...form3.register('pan')}
                      />
                      {form3.formState.errors.pan && <p className="mt-1 text-xs text-red-500">{form3.formState.errors.pan.message}</p>}
                    </div>

                    <div>
                      <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Aadhaar Number</label>
                      <input
                        type="text"
                        placeholder="12 digit Aadhaar number"
                        maxLength={12}
                        inputMode="numeric"
                        className="input-field"
                        {...form3.register('aadhaar')}
                      />
                      {form3.formState.errors.aadhaar && <p className="mt-1 text-xs text-red-500">{form3.formState.errors.aadhaar.message}</p>}
                    </div>

                    <div>
                      <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">GST Number <span className="text-[#6A6A6A] font-normal">(if registered)</span></label>
                      <input
                        type="text"
                        placeholder="22AAAAA0000A1Z5"
                        maxLength={15}
                        className="input-field uppercase"
                        style={{ textTransform: 'uppercase' }}
                        {...form3.register('gst')}
                      />
                      {form3.formState.errors.gst && <p className="mt-1 text-xs text-red-500">{form3.formState.errors.gst.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ background: '#F0F9FF', border: '1px solid rgba(25,60,184,0.15)' }}>
                  <p className="font-lato text-xs font-semibold text-[#193CB8] mb-3">Bank Account for Payouts</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Account Holder Name</label>
                      <input type="text" placeholder="Name as on bank account" className="input-field" {...form3.register('accountName')} />
                    </div>

                    <div>
                      <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Account Number</label>
                      <input type="text" placeholder="Enter account number" inputMode="numeric" className="input-field" {...form3.register('bankAccountNumber')} />
                      {form3.formState.errors.bankAccountNumber && <p className="mt-1 text-xs text-red-500">{form3.formState.errors.bankAccountNumber.message}</p>}
                    </div>

                    <div>
                      <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">IFSC Code</label>
                      <input
                        type="text"
                        placeholder="SBIN0001234"
                        maxLength={11}
                        className="input-field uppercase"
                        style={{ textTransform: 'uppercase' }}
                        {...form3.register('ifsc')}
                      />
                      {form3.formState.errors.ifsc && <p className="mt-1 text-xs text-red-500">{form3.formState.errors.ifsc.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl font-lato font-semibold text-sm border border-[rgba(139,67,50,0.2)] text-[#364153] hover:bg-[#FFF3EF] transition-colors flex items-center justify-center gap-2">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button type="submit" className="flex-1 py-3.5 rounded-xl font-lato font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ background: '#F06138', color: '#FDFAD6' }}>
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 3: Review */}
            {step === 3 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-filson font-black text-[#101828] text-xl mb-5">Review Your Application</h2>

                <div className="space-y-3 mb-6">
                  {[
                    { label: 'Business Name', val: formData.businessName },
                    { label: 'Category', val: formData.category },
                    { label: 'City', val: formData.city },
                    { label: 'Phone', val: `+91 ${formData.phone}` },
                    { label: 'Description', val: formData.description },
                    { label: 'Years Active', val: `${formData.yearsInBusiness} years` },
                    { label: 'Starting From', val: `₹${new Intl.NumberFormat('en-IN').format(formData.startingPrice)}` },
                    formData.pan && { label: 'PAN', val: formData.pan },
                    formData.gst && { label: 'GST', val: formData.gst },
                    formData.bankAccount?.accountNumber && {
                      label: 'Bank Account',
                      val: `****${formData.bankAccount.accountNumber.slice(-4)} (${formData.bankAccount.ifsc || 'IFSC not provided'})`,
                    },
                  ]
                    .filter(Boolean)
                    .map(({ label, val }) => (
                      <div key={label} className="flex gap-3 text-sm font-lato">
                        <span className="text-[#6A6A6A] w-36 shrink-0">{label}</span>
                        <span className="text-[#101828] font-medium break-all">{val}</span>
                      </div>
                    ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-xl font-lato font-semibold text-sm border border-[rgba(139,67,50,0.2)] text-[#364153] hover:bg-[#FFF3EF] transition-colors flex items-center justify-center gap-2">
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

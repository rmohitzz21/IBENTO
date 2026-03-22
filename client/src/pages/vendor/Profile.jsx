import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Save, Camera, Loader2, CheckCircle2, Circle, ImagePlus, X, ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import VendorSidebar from '../../components/shared/VendorSidebar'
import { useAuthStore } from '../../stores/authStore'
import { updateVendorProfile, getVendorDashboard } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'
import api from '../../services/api'

const CATEGORIES = ['Decoration', 'Photography', 'Videography', 'Catering', 'Entertainment', 'Venue', 'Makeup & Beauty', 'Planning & Coordination', 'Music & DJ', 'Florist']
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat']

const profileSchema = z.object({
  businessName: z.string().min(3, 'Business name required'),
  category: z.string().min(1, 'Select a category'),
  city: z.string().min(1, 'Select a city'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number').or(z.literal('')),
  description: z.string().min(20, 'Add a description (min 20 characters)'),
  startingPrice: z.coerce.number().min(500, 'Minimum ₹500').or(z.literal('')),
  yearsInBusiness: z.coerce.number().min(0).max(50),
  website: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
})

const kycSchema = z.object({
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Enter a valid PAN').or(z.literal('')),
  aadhaar: z.string().regex(/^\d{12}$/, 'Must be 12 digits').or(z.literal('')),
  gst: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST').or(z.literal('')),
  bankAccountNumber: z.string().min(9).max(18).regex(/^\d+$/).or(z.literal('')),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC').or(z.literal('')),
  accountName: z.string().optional().or(z.literal('')),
})

const TABS = ['Business Info', 'About', 'Portfolio', 'KYC & Bank']

function CompletionBanner({ vendor, user, onTabChange }) {
  const items = [
    { label: 'Profile Photo',         done: !!user?.avatar,                          tab: null },
    { label: 'Business Description',   done: (vendor?.description || '').length >= 20, tab: 'About' },
    { label: 'Phone Number',           done: !!vendor?.phone,                          tab: 'Business Info' },
    { label: 'Category',               done: !!(vendor?.category),                     tab: 'Business Info' },
    { label: 'Portfolio (3+ photos)',  done: (vendor?.portfolio || []).length >= 3,    tab: 'Portfolio' },
    { label: 'Bank Account',           done: !!vendor?.bankAccount?.accountNumber,     tab: 'KYC & Bank' },
    { label: 'KYC Document',           done: !!(vendor?.pan || vendor?.aadhaar),       tab: 'KYC & Bank' },
  ]

  const doneCount = items.filter((i) => i.done).length
  const pct = Math.round((doneCount / items.length) * 100)

  if (pct === 100) {
    return (
      <div className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{ background: '#DCFCE7', border: '1px solid rgba(1,102,48,0.2)' }}>
        <CheckCircle2 size={20} className="text-[#016630] shrink-0" />
        <p className="font-lato font-semibold text-sm text-[#016630]">Your profile is 100% complete! You'll rank higher in search results.</p>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-2xl p-5" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.15)' }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-lato font-bold text-sm text-[#101828]">Complete your profile — {pct}%</p>
          <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">A complete profile gets 3x more bookings</p>
        </div>
        <span className="font-filson font-black text-2xl" style={{ color: '#F06138' }}>{pct}%</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full"
          style={{ background: '#F06138' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => item.tab && onTabChange(item.tab)}
            className={`flex items-center gap-2 text-left ${item.tab && !item.done ? 'hover:opacity-80' : ''}`}
            disabled={!item.tab || item.done}
          >
            {item.done
              ? <CheckCircle2 size={15} className="text-[#016630] shrink-0" />
              : <Circle size={15} className="text-[#F06138] shrink-0" />
            }
            <span className={`font-lato text-xs ${item.done ? 'text-[#6A6A6A] line-through' : item.tab ? 'text-[#F06138] font-semibold underline-offset-2 hover:underline' : 'text-[#6A6A6A]'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function VendorProfile() {
  const { user, updateUser } = useAuthStore()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('Business Info')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false)
  const avatarInputRef = useRef(null)
  const portfolioInputRef = useRef(null)

  // Load vendor data from cached dashboard or fetch fresh
  const { data: dashData } = useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: () => getVendorDashboard().then((r) => r.data),
    staleTime: 30_000,
  })
  const vendor = dashData?.vendor || {}

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: '',
      category: '',
      city: '',
      phone: '',
      description: '',
      startingPrice: '',
      yearsInBusiness: 0,
      website: '',
    },
  })

  const kycForm = useForm({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      pan: '',
      aadhaar: '',
      gst: '',
      bankAccountNumber: '',
      ifsc: '',
      accountName: '',
    },
  })

  // Sync form when vendor data loads
  useEffect(() => {
    if (vendor._id) {
      form.reset({
        businessName: vendor.businessName || '',
        category: vendor.category?.name || vendor.category || '',
        city: vendor.city || '',
        phone: vendor.phone || '',
        description: vendor.description || '',
        startingPrice: vendor.startingPrice || '',
        yearsInBusiness: vendor.yearsInBusiness || 0,
        website: vendor.website || '',
      })
      kycForm.reset({
        pan: vendor.pan || '',
        aadhaar: vendor.aadhaar || '',
        gst: vendor.gst || '',
        bankAccountNumber: vendor.bankAccount?.accountNumber || '',
        ifsc: vendor.bankAccount?.ifsc || '',
        accountName: vendor.bankAccount?.accountName || '',
      })
    }
  }, [vendor._id])

  const mutation = useMutation({
    mutationFn: (data) => updateVendorProfile(data),
    onSuccess: () => {
      toast.success('Profile updated!')
      qc.invalidateQueries(['vendor-dashboard'])
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Update failed.'),
  })

  const kycMutation = useMutation({
    mutationFn: (data) => updateVendorProfile(data),
    onSuccess: () => {
      toast.success('KYC & Bank details saved!')
      qc.invalidateQueries(['vendor-dashboard'])
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Update failed.'),
  })

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': undefined },
      })
      updateUser({ avatar: data.avatar })
      toast.success('Profile photo updated!')
    } catch {
      toast.error('Failed to upload photo.')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const handlePortfolioUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const currentPortfolio = vendor.portfolio || []
    if (currentPortfolio.length + files.length > 15) {
      toast.error('Maximum 15 portfolio photos')
      return
    }
    setUploadingPortfolio(true)
    try {
      const uploads = await Promise.all(
        files.map((file) => {
          const formData = new FormData()
          formData.append('file', file)
          return api.post('/uploads/single?folder=ibento/portfolio', formData, {
            headers: { 'Content-Type': undefined },
          })
        })
      )
      const newPhotos = uploads.map((res) => ({ url: res.data.file.url, caption: '' }))
      const updatedPortfolio = [...currentPortfolio, ...newPhotos]
      await updateVendorProfile({ portfolio: updatedPortfolio })
      toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} added!`)
      qc.invalidateQueries(['vendor-dashboard'])
    } catch {
      toast.error('Upload failed. Check Cloudinary config.')
    } finally {
      setUploadingPortfolio(false)
      e.target.value = ''
    }
  }

  const removePortfolioPhoto = async (idx) => {
    const updated = (vendor.portfolio || []).filter((_, i) => i !== idx)
    try {
      await updateVendorProfile({ portfolio: updated })
      toast.success('Photo removed.')
      qc.invalidateQueries(['vendor-dashboard'])
    } catch {
      toast.error('Could not remove photo.')
    }
  }

  function onKycSubmit(data) {
    kycMutation.mutate({
      pan: data.pan?.toUpperCase() || undefined,
      aadhaar: data.aadhaar || undefined,
      gst: data.gst?.toUpperCase() || undefined,
      bankAccount: {
        accountNumber: data.bankAccountNumber || undefined,
        ifsc: data.ifsc?.toUpperCase() || undefined,
        accountName: data.accountName || undefined,
      },
    })
  }

  const initials = (vendor.businessName || user?.name || 'V').charAt(0).toUpperCase()
  const portfolio = vendor.portfolio || []

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex min-h-screen bg-[#F8F8F4]">
      <VendorSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="font-filson font-black text-[#101828] text-2xl mb-6">Business Profile</h1>

        {/* Profile completion banner */}
        <CompletionBanner vendor={vendor} user={user} onTabChange={setActiveTab} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: avatar */}
          <div className="lg:col-span-1">
            <div className="text-center p-6 rounded-2xl bg-white border border-black/5">
              <div className="relative inline-block mb-4">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto font-filson font-black text-3xl text-white overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #F06138, #8B4332)' }}
                >
                  {user?.avatar
                    ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    : initials
                  }
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#F06138] flex items-center justify-center border-2 border-white disabled:opacity-60"
                >
                  {uploadingAvatar
                    ? <Loader2 size={12} className="text-white animate-spin" />
                    : <Camera size={14} className="text-white" />
                  }
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <p className="font-lato font-bold text-[#101828] text-sm">{vendor.businessName || user?.name}</p>
              <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{user?.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-lato font-semibold" style={{ background: '#FFF3EF', color: '#F06138' }}>
                Vendor
              </span>
              {vendor.status === 'approved' && (
                <div className="mt-3 flex items-center justify-center gap-1">
                  <ShieldCheck size={13} className="text-[#016630]" />
                  <span className="font-lato text-xs font-semibold text-[#016630]">Verified</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-black/5 mb-6 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-5 py-2.5 font-lato font-medium text-sm border-b-2 transition-colors whitespace-nowrap"
                  style={activeTab === tab
                    ? { borderColor: '#F06138', color: '#F06138' }
                    : { borderColor: 'transparent', color: '#6A6A6A' }
                  }
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Business Info tab */}
            {activeTab === 'Business Info' && (
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
                <div>
                  <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Business Name</label>
                  <input type="text" className="input-field" {...form.register('businessName')} />
                  {form.formState.errors.businessName && <p className="mt-1 text-xs text-red-500">{form.formState.errors.businessName.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Category</label>
                    <select className="input-field" {...form.register('category')}>
                      <option value="">Select</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {form.formState.errors.category && <p className="mt-1 text-xs text-red-500">{form.formState.errors.category.message}</p>}
                  </div>
                  <div>
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">City</label>
                    <select className="input-field" {...form.register('city')}>
                      <option value="">Select</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Business Phone</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-lato text-sm text-[#6A6A6A]">+91</span>
                    <input type="tel" maxLength={10} className="input-field pl-12" placeholder="98XXXXXXXX" {...form.register('phone')} />
                  </div>
                  {form.formState.errors.phone && <p className="mt-1 text-xs text-red-500">{form.formState.errors.phone.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Starting Price (₹)</label>
                    <input type="number" min={500} className="input-field" placeholder="e.g. 25000" {...form.register('startingPrice')} />
                    {form.formState.errors.startingPrice && <p className="mt-1 text-xs text-red-500">{form.formState.errors.startingPrice.message}</p>}
                  </div>
                  <div>
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Years in Business</label>
                    <input type="number" min={0} max={50} className="input-field" {...form.register('yearsInBusiness')} />
                  </div>
                </div>

                <div>
                  <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Website (optional)</label>
                  <input type="url" placeholder="https://yourbusiness.com" className="input-field" {...form.register('website')} />
                </div>

                <motion.button
                  type="submit"
                  disabled={mutation.isPending}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ background: '#F06138', color: '#FDFAD6' }}
                >
                  <Save size={16} /> {mutation.isPending ? 'Saving…' : 'Save Changes'}
                </motion.button>
              </form>
            )}

            {/* About tab */}
            {activeTab === 'About' && (
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
                <div>
                  <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Business Description</label>
                  <textarea
                    rows={8}
                    placeholder="Describe your services, experience, specialties, and what makes you unique…"
                    className="input-field resize-none"
                    {...form.register('description')}
                  />
                  {form.formState.errors.description && <p className="mt-1 text-xs text-red-500">{form.formState.errors.description.message}</p>}
                </div>
                <motion.button
                  type="submit"
                  disabled={mutation.isPending}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ background: '#F06138', color: '#FDFAD6' }}
                >
                  <Save size={16} /> {mutation.isPending ? 'Saving…' : 'Save Description'}
                </motion.button>
              </form>
            )}

            {/* Portfolio tab */}
            {activeTab === 'Portfolio' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-lato font-bold text-sm text-[#101828]">Portfolio Photos</p>
                    <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">{portfolio.length}/15 photos — Add at least 3 to complete your profile</p>
                  </div>
                  {portfolio.length < 15 && (
                    <button
                      onClick={() => portfolioInputRef.current?.click()}
                      disabled={uploadingPortfolio}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                      style={{ background: '#F06138', color: '#FDFAD6' }}
                    >
                      {uploadingPortfolio
                        ? <Loader2 size={14} className="animate-spin" />
                        : <ImagePlus size={14} />
                      }
                      {uploadingPortfolio ? 'Uploading…' : 'Add Photos'}
                    </button>
                  )}
                </div>

                <input
                  ref={portfolioInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePortfolioUpload}
                />

                {portfolio.length === 0 ? (
                  <button
                    onClick={() => portfolioInputRef.current?.click()}
                    className="w-full py-16 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors hover:border-[#F06138]/50 hover:bg-[#FFF3EF]/30"
                    style={{ borderColor: 'rgba(139,67,50,0.25)' }}
                  >
                    <ImagePlus size={32} className="text-[#F06138] opacity-60" />
                    <div className="text-center">
                      <p className="font-lato font-semibold text-sm text-[#364153]">Add portfolio photos</p>
                      <p className="font-lato text-xs text-[#6A6A6A] mt-1">Show your best work — weddings, events, setups</p>
                    </div>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {portfolio.map((photo, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-black/5">
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePortfolioPhoto(i)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {portfolio.length < 15 && (
                      <button
                        onClick={() => portfolioInputRef.current?.click()}
                        disabled={uploadingPortfolio}
                        className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors hover:border-[#F06138]/50 disabled:opacity-60"
                        style={{ borderColor: 'rgba(139,67,50,0.2)' }}
                      >
                        {uploadingPortfolio
                          ? <Loader2 size={20} className="text-[#F06138] animate-spin" />
                          : <><ImagePlus size={20} className="text-[#F06138]" /><span className="font-lato text-[10px] text-[#F06138] font-medium">Add</span></>
                        }
                      </button>
                    )}
                  </div>
                )}

                {portfolio.length > 0 && portfolio.length < 3 && (
                  <p className="mt-3 font-lato text-xs text-amber-600">
                    Add {3 - portfolio.length} more photo{3 - portfolio.length > 1 ? 's' : ''} to complete this checklist item
                  </p>
                )}
              </div>
            )}

            {/* KYC & Bank tab */}
            {activeTab === 'KYC & Bank' && (
              <form onSubmit={kycForm.handleSubmit(onKycSubmit)} className="space-y-5">
                <div className="p-4 rounded-xl mb-2" style={{ background: '#FFF3EF', border: '1px solid rgba(240,97,56,0.2)' }}>
                  <p className="font-lato text-xs font-semibold text-[#8B4332] mb-1">Identity Verification</p>
                  <p className="font-lato text-xs text-[#6A6A6A]">Required for account verification. All details are encrypted.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">PAN Number</label>
                    <input
                      type="text"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className="input-field uppercase"
                      style={{ textTransform: 'uppercase' }}
                      {...kycForm.register('pan')}
                    />
                    {kycForm.formState.errors.pan && <p className="mt-1 text-xs text-red-500">{kycForm.formState.errors.pan.message}</p>}
                  </div>
                  <div>
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Aadhaar Number</label>
                    <input
                      type="text"
                      placeholder="12 digit number"
                      maxLength={12}
                      inputMode="numeric"
                      className="input-field"
                      {...kycForm.register('aadhaar')}
                    />
                    {kycForm.formState.errors.aadhaar && <p className="mt-1 text-xs text-red-500">{kycForm.formState.errors.aadhaar.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">GST Number <span className="text-[#6A6A6A] font-normal">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                    className="input-field uppercase"
                    style={{ textTransform: 'uppercase' }}
                    {...kycForm.register('gst')}
                  />
                  {kycForm.formState.errors.gst && <p className="mt-1 text-xs text-red-500">{kycForm.formState.errors.gst.message}</p>}
                </div>

                <div className="pt-2">
                  <div className="p-4 rounded-xl mb-4" style={{ background: '#F0F9FF', border: '1px solid rgba(25,60,184,0.15)' }}>
                    <p className="font-lato text-xs font-semibold text-[#193CB8] mb-1">Bank Account for Payouts</p>
                    <p className="font-lato text-xs text-[#6A6A6A]">Earnings will be transferred to this account.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Account Holder Name</label>
                      <input type="text" placeholder="Name as on bank account" className="input-field" {...kycForm.register('accountName')} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Account Number</label>
                        <input type="text" placeholder="Enter account number" inputMode="numeric" className="input-field" {...kycForm.register('bankAccountNumber')} />
                        {kycForm.formState.errors.bankAccountNumber && <p className="mt-1 text-xs text-red-500">{kycForm.formState.errors.bankAccountNumber.message}</p>}
                      </div>
                      <div>
                        <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">IFSC Code</label>
                        <input
                          type="text"
                          placeholder="SBIN0001234"
                          maxLength={11}
                          className="input-field uppercase"
                          style={{ textTransform: 'uppercase' }}
                          {...kycForm.register('ifsc')}
                        />
                        {kycForm.formState.errors.ifsc && <p className="mt-1 text-xs text-red-500">{kycForm.formState.errors.ifsc.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={kycMutation.isPending}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ background: '#F06138', color: '#FDFAD6' }}
                >
                  <Save size={16} /> {kycMutation.isPending ? 'Saving…' : 'Save KYC & Bank Details'}
                </motion.button>
              </form>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  )
}

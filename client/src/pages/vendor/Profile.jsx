import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Save, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import VendorSidebar from '../../components/shared/VendorSidebar'
import { useAuthStore } from '../../stores/authStore'
import { updateVendorProfile } from '../../services/vendors'
import { pageVariants } from '../../animations/pageTransitions'

const CATEGORIES = ['Decoration', 'Photography', 'Videography', 'Catering', 'Entertainment', 'Venue', 'Makeup & Beauty', 'Planning & Coordination', 'Music & DJ', 'Florist']
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat']

const profileSchema = z.object({
  businessName: z.string().min(3, 'Business name required'),
  category: z.string().min(1, 'Select a category'),
  city: z.string().min(1, 'Select a city'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  description: z.string().min(20, 'Add a description (min 20 characters)'),
  startingPrice: z.coerce.number().min(500, 'Minimum ₹500'),
  yearsInBusiness: z.coerce.number().min(0).max(50),
  website: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
})

const TABS = ['Business Info', 'About']

export default function VendorProfile() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('Business Info')

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: user?.businessName || user?.name || '',
      category: user?.category || '',
      city: user?.city || '',
      phone: user?.phone || '',
      description: user?.description || '',
      startingPrice: user?.startingPrice || '',
      yearsInBusiness: user?.yearsInBusiness || 0,
      website: user?.website || '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data) => updateVendorProfile(data),
    onSuccess: ({ data }) => {
      updateUser(data.vendor)
      toast.success('Profile updated!')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Update failed.'),
  })

  const initials = (user?.businessName || user?.name || 'V').charAt(0).toUpperCase()

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex min-h-screen bg-[#F8F8F4]">
      <VendorSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="font-filson font-black text-[#101828] text-2xl mb-8">Business Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: avatar */}
          <div className="lg:col-span-1">
            <div className="text-center p-6 rounded-2xl bg-white border border-black/5">
              <div className="relative inline-block mb-4">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto font-filson font-black text-3xl text-white"
                  style={{ background: 'linear-gradient(135deg, #F06138, #8B4332)' }}
                >
                  {user?.avatar
                    ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    : initials
                  }
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#F06138] flex items-center justify-center border-2 border-white">
                  <Camera size={14} className="text-white" />
                </button>
              </div>
              <p className="font-lato font-bold text-[#101828] text-sm">{user?.businessName || user?.name}</p>
              <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{user?.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-lato font-semibold capitalize" style={{ background: '#FFF3EF', color: '#F06138' }}>
                Vendor
              </span>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-black/5 mb-6">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className="px-5 py-2.5 font-lato font-medium text-sm border-b-2 transition-colors" style={activeTab === tab ? { borderColor: '#F06138', color: '#F06138' } : { borderColor: 'transparent', color: '#6A6A6A' }}>
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
              {activeTab === 'Business Info' && (
                <>
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
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-lato text-sm text-[#6A6A6A]">+91</span>
                      <input type="tel" maxLength={10} className="input-field pl-12" {...form.register('phone')} />
                    </div>
                    {form.formState.errors.phone && <p className="mt-1 text-xs text-red-500">{form.formState.errors.phone.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Starting Price (₹)</label>
                      <input type="number" min={500} className="input-field" {...form.register('startingPrice')} />
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
                </>
              )}

              {activeTab === 'About' && (
                <div>
                  <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Business Description</label>
                  <textarea rows={8} placeholder="Describe your services, experience, unique selling points…" className="input-field resize-none" {...form.register('description')} />
                  {form.formState.errors.description && <p className="mt-1 text-xs text-red-500">{form.formState.errors.description.message}</p>}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={mutation.isPending}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ background: '#F06138', color: '#FDFAD6' }}
              >
                <Save size={16} /> {mutation.isPending ? 'Saving…' : 'Save Changes'}
              </motion.button>
            </form>
          </div>
        </div>
      </main>
    </motion.div>
  )
}

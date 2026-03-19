import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Camera, Eye, EyeOff, Save, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { useAuthStore } from '../../stores/authStore'
import { pageVariants } from '../../animations/pageTransitions'
import api from '../../services/api'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const TABS = ['Profile', 'Security']

export default function UserProfile() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('Profile')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', phone: user?.phone || '' },
  })

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) })

  const profileMutation = useMutation({
    mutationFn: (data) => api.put('/users/profile', data),
    onSuccess: ({ data }) => {
      updateUser(data.user)
      toast.success('Profile updated!')
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Update failed.'),
  })

  const passwordMutation = useMutation({
    mutationFn: (data) => api.put('/users/change-password', data),
    onSuccess: () => {
      toast.success('Password changed!')
      passwordForm.reset()
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Password change failed.'),
  })

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <h1 className="font-filson font-black text-[#101828] text-3xl mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Avatar + quick info */}
          <div className="lg:col-span-1">
            <div className="text-center p-6 rounded-2xl" style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.1)' }}>
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
              <p className="font-lato font-bold text-[#101828]">{user?.name}</p>
              <p className="font-lato text-[#6A6A6A] text-xs mt-0.5">{user?.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-lato font-semibold capitalize" style={{ background: '#FFF3EF', color: '#F06138' }}>
                {user?.role || 'Customer'}
              </span>
            </div>
          </div>

          {/* Right: tabs */}
          <div className="lg:col-span-3">
            {/* Tab bar */}
            <div className="flex gap-1 border-b border-black/5 mb-6">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className="px-5 py-2.5 font-lato font-medium text-sm border-b-2 transition-colors" style={activeTab === tab ? { borderColor: '#F06138', color: '#F06138' } : { borderColor: 'transparent', color: '#6A6A6A' }}>
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'Profile' && (
                <motion.form
                  key="profile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))}
                  className="space-y-5"
                >
                  {/* Name */}
                  <div>
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Full Name</label>
                    <input type="text" className="input-field" style={profileForm.formState.errors.name ? { borderColor: '#EF4444' } : {}} {...profileForm.register('name')} />
                    {profileForm.formState.errors.name && <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.name.message}</p>}
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Email Address</label>
                    <input type="email" value={user?.email || ''} readOnly className="input-field opacity-60 cursor-not-allowed" />
                    <p className="mt-1 text-xs text-[#6A6A6A]">Email cannot be changed. Contact support if needed.</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-lato text-sm text-[#6A6A6A]">+91</span>
                      <input type="tel" maxLength={10} className="input-field pl-12" style={profileForm.formState.errors.phone ? { borderColor: '#EF4444' } : {}} {...profileForm.register('phone')} />
                    </div>
                    {profileForm.formState.errors.phone && <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.phone.message}</p>}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={profileMutation.isPending}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
                    style={{ background: '#F06138', color: '#FDFAD6' }}
                  >
                    <Save size={16} /> {profileMutation.isPending ? 'Saving…' : 'Save Changes'}
                  </motion.button>
                </motion.form>
              )}

              {activeTab === 'Security' && (
                <motion.form
                  key="security"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))}
                  className="space-y-5 max-w-md"
                >
                  {/* Current password */}
                  <div>
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Current Password</label>
                    <div className="relative">
                      <input type={showCurrent ? 'text' : 'password'} placeholder="••••••••" className="input-field pr-11" style={passwordForm.formState.errors.currentPassword ? { borderColor: '#EF4444' } : {}} {...passwordForm.register('currentPassword')} />
                      <button type="button" onClick={() => setShowCurrent(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.currentPassword && <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>}
                  </div>

                  {/* New password */}
                  <div>
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">New Password</label>
                    <div className="relative">
                      <input type={showNew ? 'text' : 'password'} placeholder="At least 6 characters" className="input-field pr-11" style={passwordForm.formState.errors.newPassword ? { borderColor: '#EF4444' } : {}} {...passwordForm.register('newPassword')} />
                      <button type="button" onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.newPassword && <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>}
                  </div>

                  {/* Confirm */}
                  <div>
                    <label className="block font-lato font-medium text-sm text-[#364153] mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" className="input-field pr-11" style={passwordForm.formState.errors.confirmPassword ? { borderColor: '#EF4444' } : {}} {...passwordForm.register('confirmPassword')} />
                      <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={passwordMutation.isPending}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
                    style={{ background: '#F06138', color: '#FDFAD6' }}
                  >
                    <CheckCircle size={16} /> {passwordMutation.isPending ? 'Updating…' : 'Update Password'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}

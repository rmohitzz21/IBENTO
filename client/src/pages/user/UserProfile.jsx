import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Camera, Eye, EyeOff, Save, CheckCircle,
  CalendarCheck2, Heart, Star, ShieldCheck, Mail,
  Phone as PhoneIcon, Bell, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import UserNavbar from '../../components/shared/UserNavbar'
import Footer from '../../components/shared/Footer'
import { useAuthStore } from '../../stores/authStore'
import { pageVariants } from '../../animations/pageTransitions'
import api from '../../services/api'
import { getMyBookings } from '../../services/bookings'
import { getWishlist } from '../../services/vendors'

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

const TABS = [
  { id: 'Profile',       icon: User,       label: 'Profile' },
  { id: 'Security',      icon: ShieldCheck, label: 'Security' },
  { id: 'Notifications', icon: Bell,        label: 'Notifications' },
]

function StatItem({ icon: Icon, value, label, color }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-0.5" style={{ background: `${color}15` }}>
        <Icon size={17} style={{ color }} />
      </div>
      <span className="font-filson font-black text-xl text-[#101828] leading-none">{value}</span>
      <span className="font-lato text-xs text-[#6A6A6A]">{label}</span>
    </div>
  )
}

export default function UserProfile() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('Profile')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef(null)

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

  const { data: bookingsData } = useQuery({ queryKey: ['my-bookings', 'all'], queryFn: () => getMyBookings() })
  const { data: wishlistData } = useQuery({ queryKey: ['wishlist'], queryFn: getWishlist })

  const bookingCount  = bookingsData?.data?.bookings?.length || 0
  const wishlistCount = wishlistData?.data?.wishlist?.length || 0
  const completedCount = bookingsData?.data?.bookings?.filter(b => b.status === 'completed').length || 0

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
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'Recently joined'

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-[#FFFDFC]">
      <UserNavbar />

      {/* Profile hero */}
      <div className="border-b border-black/5" style={{ background: 'linear-gradient(135deg, #FEFDEB 0%, #FFF3EF 100%)' }}>
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center font-filson font-black text-3xl text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #F06138, #8B4332)' }}
              >
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
                  : initials
                }
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center border-2 border-white shadow-md transition-transform hover:scale-110 disabled:opacity-60"
                style={{ background: '#F06138' }}
              >
                {uploadingAvatar
                  ? <Loader2 size={12} className="text-white animate-spin" />
                  : <Camera size={13} className="text-white" />
                }
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Name + info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="font-filson font-black text-[#101828] text-2xl">{user?.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 justify-center sm:justify-start">
                <span className="flex items-center gap-1.5 font-lato text-xs text-[#6A6A6A]">
                  <Mail size={11} /> {user?.email}
                </span>
                {user?.phone && (
                  <span className="flex items-center gap-1.5 font-lato text-xs text-[#6A6A6A]">
                    <PhoneIcon size={11} /> +91 {user.phone}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-lato font-semibold capitalize" style={{ background: '#FFF3EF', color: '#F06138' }}>
                  <User size={10} /> {user?.role || 'Customer'}
                </span>
                <span className="font-lato text-xs text-[#6A6A6A]">Member since {memberSince}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid rgba(139,67,50,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="flex items-stretch divide-x divide-black/5">
              <StatItem icon={CalendarCheck2} value={bookingCount}  label="Total Bookings" color="#F06138" />
              <StatItem icon={CheckCircle}    value={completedCount} label="Completed"      color="#016630" />
              <StatItem icon={Heart}          value={wishlistCount}  label="Wishlist"       color="#EF4444" />
              <StatItem icon={Star}           value="4.8"            label="Avg Rating"     color="#F59E0B" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Tab sidebar */}
          <div className="hidden lg:block w-52 shrink-0 sticky top-24 self-start">
            <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(139,67,50,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-lato font-semibold transition-all text-left border-l-[3px]"
                    style={isActive
                      ? { borderColor: '#F06138', color: '#F06138', background: '#FFF3EF' }
                      : { borderColor: 'transparent', color: '#4C4C4C' }
                    }
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="lg:hidden w-full">
            <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-lato font-semibold text-sm whitespace-nowrap transition-all"
                    style={isActive
                      ? { background: '#F06138', color: '#FDFAD6' }
                      : { background: '#fff', color: '#6A6A6A', border: '1px solid rgba(139,67,50,0.15)' }
                    }
                  >
                    <Icon size={14} /> {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'Profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(139,67,50,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h2 className="font-lato font-bold text-[#101828] text-base mb-5">Personal Information</h2>
                    <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">Full Name</label>
                          <input
                            type="text"
                            className="input-field"
                            style={profileForm.formState.errors.name ? { borderColor: '#EF4444' } : {}}
                            {...profileForm.register('name')}
                          />
                          {profileForm.formState.errors.name && (
                            <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.name.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">Mobile Number</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-lato text-sm text-[#6A6A6A] font-semibold">+91</span>
                            <input
                              type="tel"
                              maxLength={10}
                              className="input-field pl-12"
                              style={profileForm.formState.errors.phone ? { borderColor: '#EF4444' } : {}}
                              {...profileForm.register('phone')}
                            />
                          </div>
                          {profileForm.formState.errors.phone && (
                            <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.phone.message}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">
                          Email Address
                          <span className="ml-2 text-[11px] font-normal text-[#6A6A6A] bg-gray-100 px-2 py-0.5 rounded-full">Read-only</span>
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="input-field opacity-60 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-[#6A6A6A]">Email cannot be changed. Contact support if needed.</p>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={profileMutation.isPending}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
                        style={{ background: '#F06138', color: '#FDFAD6' }}
                      >
                        <Save size={15} /> {profileMutation.isPending ? 'Saving…' : 'Save Changes'}
                      </motion.button>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === 'Security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(139,67,50,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h2 className="font-lato font-bold text-[#101828] text-base mb-1">Change Password</h2>
                    <p className="font-lato text-xs text-[#6A6A6A] mb-5">Use a strong password with at least 6 characters.</p>
                    <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))} className="space-y-5 max-w-md">
                      {[
                        { name: 'currentPassword', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(p => !p), placeholder: '••••••••' },
                        { name: 'newPassword',      label: 'New Password',     show: showNew,     toggle: () => setShowNew(p => !p),     placeholder: 'At least 6 characters' },
                        { name: 'confirmPassword',  label: 'Confirm Password', show: showConfirm, toggle: () => setShowConfirm(p => !p), placeholder: '••••••••' },
                      ].map((field) => (
                        <div key={field.name}>
                          <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">{field.label}</label>
                          <div className="relative">
                            <input
                              type={field.show ? 'text' : 'password'}
                              placeholder={field.placeholder}
                              className="input-field pr-11"
                              style={passwordForm.formState.errors[field.name] ? { borderColor: '#EF4444' } : {}}
                              {...passwordForm.register(field.name)}
                            />
                            <button
                              type="button"
                              onClick={field.toggle}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              tabIndex={-1}
                            >
                              {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {passwordForm.formState.errors[field.name] && (
                            <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors[field.name].message}</p>
                          )}
                        </div>
                      ))}
                      <motion.button
                        type="submit"
                        disabled={passwordMutation.isPending}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
                        style={{ background: '#F06138', color: '#FDFAD6' }}
                      >
                        <CheckCircle size={15} /> {passwordMutation.isPending ? 'Updating…' : 'Update Password'}
                      </motion.button>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === 'Notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(139,67,50,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h2 className="font-lato font-bold text-[#101828] text-base mb-1">Notification Preferences</h2>
                    <p className="font-lato text-xs text-[#6A6A6A] mb-5">Choose what updates you receive from iBento.</p>
                    <div className="space-y-4">
                      {[
                        { label: 'Booking Confirmations', desc: 'When a vendor confirms or rejects your booking', default: true },
                        { label: 'Payment Reminders',     desc: 'Reminders to complete pending payments',        default: true },
                        { label: 'Vendor Messages',       desc: 'New messages from vendors',                     default: true },
                        { label: 'Event Reminders',       desc: '24 hours before your event',                    default: true },
                        { label: 'Promotional Offers',    desc: 'Exclusive deals and discounts',                 default: false },
                        { label: 'New Vendor Alerts',     desc: 'When new vendors join your city',               default: false },
                      ].map((item) => (
                        <label key={item.label} className="flex items-center justify-between gap-4 cursor-pointer group">
                          <div>
                            <p className="font-lato font-semibold text-[#101828] text-sm">{item.label}</p>
                            <p className="font-lato text-xs text-[#6A6A6A] mt-0.5">{item.desc}</p>
                          </div>
                          <div className="relative shrink-0 w-11 h-6">
                            <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                            <div className="w-11 h-6 rounded-full peer-checked:bg-[#F06138] bg-gray-200 transition-colors duration-200" />
                            <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5" />
                          </div>
                        </label>
                      ))}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl font-lato font-semibold text-sm hover:opacity-90 transition-opacity"
                      style={{ background: '#F06138', color: '#FDFAD6' }}
                      onClick={() => toast.success('Notification preferences saved!')}
                    >
                      <Save size={15} /> Save Preferences
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  )
}

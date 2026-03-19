import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { User, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import { register as registerUser } from '../../services/auth'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  role: z.enum(['user', 'vendor']),
})

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
    <path d="M47.532 24.552c0-1.636-.147-3.2-.418-4.704H24v9.023h13.18c-.569 3.058-2.29 5.649-4.876 7.393v6.14h7.89c4.617-4.253 7.338-10.514 7.338-17.852z" fill="#4285F4"/>
    <path d="M24 48c6.624 0 12.182-2.196 16.243-5.956l-7.89-6.14c-2.19 1.468-4.99 2.336-8.353 2.336-6.424 0-11.865-4.337-13.808-10.17H1.964v6.34C6.003 42.612 14.404 48 24 48z" fill="#34A853"/>
    <path d="M10.192 28.07A14.4 14.4 0 019.6 24c0-1.41.241-2.778.592-4.07v-6.34H1.964A23.94 23.94 0 000 24c0 3.864.927 7.517 2.573 10.748l7.619-6.678z" fill="#FBBC05"/>
    <path d="M24 9.58c3.618 0 6.869 1.242 9.42 3.68l7.065-7.065C36.163 2.19 30.623 0 24 0 14.404 0 6.003 5.388 1.964 13.25l8.228 6.68C12.135 13.918 17.576 9.58 24 9.58z" fill="#EA4335"/>
  </svg>
)

export default function Signup() {
  const navigate = useNavigate()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'user' },
  })

  const role = watch('role')

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (_, vars) => {
      toast.success('Account created! Please verify your email.')
      navigate('/verify-otp', { state: { email: vars.email, purpose: 'register', role: vars.role } })
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Registration failed. Try again.'),
  })

  const onSubmit = (data) => mutation.mutate(data)

  return (
    <div className="min-h-screen flex" style={{ background: '#FFFDFC' }}>
      {/* Left image */}
      <div className="hidden lg:block w-1/2 h-screen relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80"
          alt="Event"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="font-filson text-3xl font-bold mb-2">Plan unforgettable events.</p>
          <p className="font-filson text-3xl font-bold" style={{ color: '#F06138' }}>Join iBento today.</p>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-10 min-h-screen overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-[560px]"
          style={{
            background: '#FEFDEB',
            borderRadius: 8,
            padding: '44px 48px',
            boxShadow: '0 4px 32px rgba(139,67,50,0.12)',
          }}
        >
          <div className="text-center mb-2">
            <span className="font-filson" style={{ fontSize: 32, fontWeight: 900, color: '#8A4432', letterSpacing: '-0.04em' }}>
              ibento
            </span>
          </div>
          <h1 className="font-filson text-center mb-1" style={{ fontSize: 42, fontWeight: 900, color: '#8B4332', lineHeight: 1.1 }}>
            Create Account
          </h1>
          <p className="text-center mb-6 font-lato text-sm" style={{ color: '#6A6A6A' }}>
            Join thousands planning amazing events.
          </p>

          {/* Role toggle */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: '#FFFEED', border: '1px solid rgba(139,67,50,0.15)' }}>
            {[
              { value: 'user', label: 'Customer', icon: User },
              { value: 'vendor', label: 'Vendor', icon: Store },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('role', value)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-lato font-semibold text-sm transition-all duration-200"
                style={role === value ? { background: '#F06138', color: '#FDFAD6' } : { color: '#6A6A6A' }}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5 font-lato" style={{ color: '#364153' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Arjun Mehta"
                className="input-field"
                style={errors.name ? { borderColor: '#EF4444' } : {}}
                {...register('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5 font-lato" style={{ color: '#364153' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="input-field"
                style={errors.email ? { borderColor: '#EF4444' } : {}}
                {...register('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1.5 font-lato" style={{ color: '#364153' }}>
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-lato text-sm" style={{ color: '#6A6A6A' }}>
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  maxLength={10}
                  className="input-field pl-12"
                  style={errors.phone ? { borderColor: '#EF4444' } : {}}
                  {...register('phone')}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <p className="font-lato text-xs" style={{ color: '#6A6A6A' }}>
              By signing up you agree to our{' '}
              <Link to="/terms" className="underline" style={{ color: '#F06138' }}>Terms</Link> and{' '}
              <Link to="/privacy" className="underline" style={{ color: '#F06138' }}>Privacy Policy</Link>.
            </p>

            <motion.button
              type="submit"
              disabled={mutation.isPending}
              whileHover={{ scale: mutation.isPending ? 1 : 1.01 }}
              whileTap={{ scale: mutation.isPending ? 1 : 0.98 }}
              className="w-full font-filson font-medium text-base rounded flex items-center justify-center gap-2 transition-all"
              style={{
                background: mutation.isPending ? '#c0956b' : '#F06138',
                color: '#FDFAD6',
                height: 52,
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {mutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating...
                </>
              ) : (
                `Create ${role === 'vendor' ? 'Vendor ' : ''}Account`
              )}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-lato">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-lg border font-lato font-medium text-sm hover:bg-gray-50 transition-all"
            style={{ background: '#fff', borderColor: '#E5E7EB', height: 48, color: '#364153' }}
          >
            <GoogleIcon /> Continue with Google
          </button>

          <p className="text-center mt-5 text-sm font-lato" style={{ color: '#6A6A6A' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold underline" style={{ color: '#F06138' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

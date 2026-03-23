import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { register as registerUser } from '../../services/auth'

const schema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
})

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
    <path d="M47.532 24.552c0-1.636-.147-3.2-.418-4.704H24v9.023h13.18c-.569 3.058-2.29 5.649-4.876 7.393v6.14h7.89c4.617-4.253 7.338-10.514 7.338-17.852z" fill="#4285F4"/>
    <path d="M24 48c6.624 0 12.182-2.196 16.243-5.956l-7.89-6.14c-2.19 1.468-4.99 2.336-8.353 2.336-6.424 0-11.865-4.337-13.808-10.17H1.964v6.34C6.003 42.612 14.404 48 24 48z" fill="#34A853"/>
    <path d="M10.192 28.07A14.4 14.4 0 019.6 24c0-1.41.241-2.778.592-4.07v-6.34H1.964A23.94 23.94 0 000 24c0 3.864.927 7.517 2.573 10.748l7.619-6.678z" fill="#FBBC05"/>
    <path d="M24 9.58c3.618 0 6.869 1.242 9.42 3.68l7.065-7.065C36.163 2.19 30.623 0 24 0 14.404 0 6.003 5.388 1.964 13.25l8.228 6.68C12.135 13.918 17.576 9.58 24 9.58z" fill="#EA4335"/>
  </svg>
)

export default function Signup() {
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data) => registerUser({ ...data, role: 'user' }),
    onSuccess: (_, vars) => {
      toast.success('Account created! Check your email for the OTP.')
      navigate('/verify-otp', { state: { email: vars.email, purpose: 'register', role: 'user' } })
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Registration failed. Try again.'),
  })

  const onSubmit = (data) => mutation.mutate(data)

  return (
    <div className="min-h-screen flex" style={{ background: '#FFFDFC' }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 h-screen relative overflow-hidden flex-col">
        <img
          src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(240,97,56,0.75) 0%, rgba(139,67,50,0.6) 100%)' }} />
        <div className="relative z-10 flex flex-col h-full p-12">
          <Link to="/" className="font-filson font-black text-white text-2xl" style={{ letterSpacing: '-0.04em' }}>
            ibento
          </Link>
          <div className="flex-1 flex flex-col justify-center">
            <p className="font-filson font-black text-white text-4xl leading-tight mb-4">
              Plan unforgettable<br />
              <span style={{ color: '#FDFAD6' }}>events with ease.</span>
            </p>
            <p className="font-lato text-white/75 text-base leading-relaxed max-w-sm mb-8">
              Join thousands of customers and vendors creating extraordinary experiences across India.
            </p>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '2,000+', label: 'Vendors' },
                { value: '15K+',  label: 'Events' },
                { value: '4.9★',  label: 'Rating' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                  <p className="font-filson font-black text-white text-xl">{s.value}</p>
                  <p className="font-lato text-white/70 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="font-filson font-black text-2xl" style={{ color: '#8A4432', letterSpacing: '-0.04em' }}>
              ibento
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-filson font-black text-[#101828]" style={{ fontSize: 32 }}>
              Create your account
            </h1>
            <p className="font-lato text-[#6A6A6A] text-sm mt-1.5">
              Join thousands planning amazing events
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Arjun Mehta"
                autoComplete="name"
                className="input-field"
                style={errors.name ? { borderColor: '#EF4444' } : {}}
                {...register('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">Email Address</label>
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
              <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-lato text-sm font-semibold" style={{ color: '#6A6A6A' }}>
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  maxLength={10}
                  autoComplete="tel"
                  className="input-field pl-12"
                  style={errors.phone ? { borderColor: '#EF4444' } : {}}
                  {...register('phone')}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <p className="font-lato text-xs" style={{ color: '#6A6A6A' }}>
              By signing up you agree to our{' '}
              <Link to="/terms" className="font-semibold underline" style={{ color: '#F06138' }}>Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="font-semibold underline" style={{ color: '#F06138' }}>Privacy Policy</Link>.
            </p>

            <motion.button
              type="submit"
              disabled={mutation.isPending}
              whileTap={{ scale: mutation.isPending ? 1 : 0.98 }}
              className="w-full font-lato font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{
                background: mutation.isPending ? '#c0956b' : '#F06138',
                color: '#FDFAD6',
                height: 48,
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                boxShadow: mutation.isPending ? 'none' : '0 4px 14px rgba(240,97,56,0.3)',
              }}
            >
              {mutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(139,67,50,0.12)' }} />
            <span className="text-xs text-[#6A6A6A] font-lato">or continue with</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(139,67,50,0.12)' }} />
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-xl border font-lato font-semibold text-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
            style={{ background: '#fff', borderColor: '#E5E7EB', height: 46, color: '#364153' }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-center mt-6 text-sm font-lato" style={{ color: '#6A6A6A' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-bold hover:underline" style={{ color: '#F06138' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

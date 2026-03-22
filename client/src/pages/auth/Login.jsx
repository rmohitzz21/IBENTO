import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { login } from '../../services/auth'
import { useAuthStore } from '../../stores/authStore'

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const passwordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
    <path d="M47.532 24.552c0-1.636-.147-3.2-.418-4.704H24v9.023h13.18c-.569 3.058-2.29 5.649-4.876 7.393v6.14h7.89c4.617-4.253 7.338-10.514 7.338-17.852z" fill="#4285F4"/>
    <path d="M24 48c6.624 0 12.182-2.196 16.243-5.956l-7.89-6.14c-2.19 1.468-4.99 2.336-8.353 2.336-6.424 0-11.865-4.337-13.808-10.17H1.964v6.34C6.003 42.612 14.404 48 24 48z" fill="#34A853"/>
    <path d="M10.192 28.07A14.4 14.4 0 019.6 24c0-1.41.241-2.778.592-4.07v-6.34H1.964A23.94 23.94 0 000 24c0 3.864.927 7.517 2.573 10.748l7.619-6.678z" fill="#FBBC05"/>
    <path d="M24 9.58c3.618 0 6.869 1.242 9.42 3.68l7.065-7.065C36.163 2.19 30.623 0 24 0 14.404 0 6.003 5.388 1.964 13.25l8.228 6.68C12.135 13.918 17.576 9.58 24 9.58z" fill="#EA4335"/>
  </svg>
)

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, setToken } = useAuthStore()
  const [step, setStep] = useState('email')
  const [emailValue, setEmailValue] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm({
    resolver: zodResolver(step === 'email' ? emailSchema : passwordSchema),
    defaultValues: { email: '' },
  })

  const mutation = useMutation({
    mutationFn: (data) => login(data),
    onSuccess: ({ data }) => {
      if (data.requiresOTP) {
        navigate('/verify-otp', {
          state: { email: emailValue, purpose: 'login', role: data.role, from: location.state?.from },
        })
        return
      }
      if (data.requiresPassword) {
        setStep('password')
        return
      }
      const { user, accessToken } = data
      setUser(user)
      setToken(accessToken)
      toast.success(`Welcome back, ${user.name?.split(' ')[0] || 'there'}!`)
      if (user.role === 'vendor') navigate('/vendor/dashboard')
      else if (user.role === 'admin') navigate('/admin/dashboard')
      else navigate('/home')
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Invalid credentials. Please try again.'
      toast.error(msg)
      setError('root', { message: msg })
    },
  })

  const onSubmit = (data) => {
    if (step === 'email') {
      setEmailValue(data.email)
      mutation.mutate({ email: data.email })
    } else {
      mutation.mutate({ email: emailValue, password: data.password })
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#FFFDFC' }}>
      {/* Left: decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 h-screen relative overflow-hidden flex-col">
        <img
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(139,67,50,0.7) 0%, rgba(16,24,40,0.5) 100%)' }} />
        <div className="relative z-10 flex flex-col h-full p-12">
          <Link to="/" className="font-filson font-black text-white text-2xl" style={{ letterSpacing: '-0.04em' }}>
            ibento
          </Link>
          <div className="flex-1 flex flex-col justify-center">
            <p className="font-filson font-black text-white text-4xl leading-tight mb-4">
              Your celebrations,<br />
              <span style={{ color: '#FDFAD6' }}>perfectly planned.</span>
            </p>
            <p className="font-lato text-white/70 text-base leading-relaxed max-w-sm">
              Connect with the best event vendors in your city and create memories that last a lifetime.
            </p>
          </div>
          {/* Testimonial */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <p className="font-lato text-white/90 text-sm italic leading-relaxed">
              "iBento made planning our wedding so easy. Found the perfect decorator and caterer in one place!"
            </p>
            <p className="font-lato font-semibold text-white/70 text-xs mt-3">— Priya & Rahul, Mumbai</p>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-[420px]"
        >
          {/* Logo (mobile only) */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="font-filson font-black text-2xl" style={{ color: '#8A4432', letterSpacing: '-0.04em' }}>
              ibento
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-filson font-black text-[#101828]" style={{ fontSize: 32 }}>
              {step === 'email' ? 'Welcome back' : 'Enter your password'}
            </h1>
            <p className="font-lato text-[#6A6A6A] text-sm mt-1.5">
              {step === 'email'
                ? 'Sign in to your iBento account'
                : `Signing in as ${emailValue}`
              }
            </p>
          </div>

          {/* Step indicator for admin */}
          {step === 'password' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6 p-3.5 rounded-xl"
              style={{ background: '#FEFDEB', border: '1px solid rgba(139,67,50,0.15)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FFF3EF' }}>
                <Mail size={14} style={{ color: '#F06138' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-lato text-xs text-[#6A6A6A]">Signing in as</p>
                <p className="font-lato font-semibold text-[#101828] text-sm truncate">{emailValue}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="font-lato text-xs font-semibold shrink-0 hover:underline"
                style={{ color: '#F06138' }}
              >
                Change
              </button>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email field (step 1 only) */}
            <AnimatePresence mode="wait">
              {step === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    className="input-field"
                    style={errors.email ? { borderColor: '#EF4444' } : {}}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </motion.div>
              )}

              {step === 'password' && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-lato font-semibold text-sm text-[#364153]">Password</label>
                    <Link to="/forgot-password" className="font-lato text-xs font-semibold hover:underline" style={{ color: '#F06138' }}>
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      autoFocus
                      className="input-field pr-11"
                      style={errors.password ? { borderColor: '#EF4444' } : {}}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Root error */}
            <AnimatePresence>
              {errors.root && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                >
                  {errors.root.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
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
                  {step === 'email' ? 'Sending OTP…' : 'Signing in…'}
                </>
              ) : (
                <>
                  {step === 'email' ? 'Continue' : 'Sign In'}
                  <ArrowRight size={15} />
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

          {/* Google */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-xl border font-lato font-semibold text-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
            style={{ background: '#fff', borderColor: '#E5E7EB', height: 46, color: '#364153' }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-center mt-6 text-sm font-lato" style={{ color: '#6A6A6A' }}>
            New to iBento?{' '}
            <Link to="/signup" className="font-bold hover:underline" style={{ color: '#F06138' }}>
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

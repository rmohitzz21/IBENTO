import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { login } from '../../services/auth'
import { useAuthStore } from '../../stores/authStore'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const cardVariants = {
  initial: { opacity: 0, y: 32, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
  shake: {
    x: [0, -12, 12, -10, 10, -6, 6, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
    <path d="M47.532 24.552c0-1.636-.147-3.2-.418-4.704H24v9.023h13.18c-.569 3.058-2.29 5.649-4.876 7.393v6.14h7.89c4.617-4.253 7.338-10.514 7.338-17.852z" fill="#4285F4"/>
    <path d="M24 48c6.624 0 12.182-2.196 16.243-5.956l-7.89-6.14c-2.19 1.468-4.99 2.336-8.353 2.336-6.424 0-11.865-4.337-13.808-10.17H1.964v6.34C6.003 42.612 14.404 48 24 48z" fill="#34A853"/>
    <path d="M10.192 28.07A14.4 14.4 0 019.6 24c0-1.41.241-2.778.592-4.07v-6.34H1.964A23.94 23.94 0 000 24c0 3.864.927 7.517 2.573 10.748l7.619-6.678z" fill="#FBBC05"/>
    <path d="M24 9.58c3.618 0 6.869 1.242 9.42 3.68l7.065-7.065C36.163 2.19 30.623 0 24 0 14.404 0 6.003 5.388 1.964 13.25l8.228 6.68C12.135 13.918 17.576 9.58 24 9.58z" fill="#EA4335"/>
  </svg>
)

export default function Login() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [shake, setShake] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(loginSchema) })

  const mutation = useMutation({
    mutationFn: (data) => login(data),
    onSuccess: ({ data }) => {
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
      setShake(true)
      setTimeout(() => setShake(false), 600)
    },
  })

  const onSubmit = (data) => mutation.mutate(data)

  return (
    <div className="min-h-screen flex" style={{ background: '#FFFDFC' }}>
      {/* Left: photo */}
      <div className="hidden lg:block w-1/2 h-screen relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80"
          alt="Wedding hall"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="font-filson text-3xl font-bold mb-2">Your celebrations,</p>
          <p className="font-filson text-3xl font-bold text-[#F06138]">perfectly planned.</p>
        </div>
      </div>

      {/* Right: card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-10 min-h-screen">
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate={shake ? 'shake' : 'animate'}
          className="w-full max-w-[608px]"
          style={{
            background: '#FEFDEB',
            borderRadius: 8,
            padding: '48px',
            boxShadow: '0 4px 32px rgba(139,67,50,0.12), 0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          {/* Logo */}
          <div className="text-center mb-2">
            <span
              className="font-filson"
              style={{ fontSize: 32, fontWeight: 900, color: '#8A4432', letterSpacing: '-0.04em' }}
            >
              ibento
            </span>
          </div>

          {/* Heading */}
          <h1
            className="font-filson text-center mb-2"
            style={{ fontSize: 56, fontWeight: 900, color: '#8B4332', lineHeight: 1.1 }}
          >
            Sign In
          </h1>
          <p className="text-center mb-8 font-lato" style={{ fontSize: 16, color: '#6A6A6A' }}>
            Welcome back! Please sign in to continue.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#364153', fontFamily: 'Lato, sans-serif' }}>
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
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1 text-xs text-red-500"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium" style={{ color: '#364153', fontFamily: 'Lato, sans-serif' }}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium transition-colors hover:underline"
                  style={{ color: '#F06138', fontFamily: 'Lato, sans-serif' }}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1 text-xs text-red-500"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Root error */}
            <AnimatePresence>
              {errors.root && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
                >
                  {errors.root.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={mutation.isPending}
              whileHover={{ scale: mutation.isPending ? 1 : 1.01 }}
              whileTap={{ scale: mutation.isPending ? 1 : 0.98 }}
              className="w-full font-filson font-medium text-base rounded transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: mutation.isPending ? '#c0956b' : '#F06138',
                color: '#FDFAD6',
                height: 52,
                fontSize: 16,
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {mutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-lato whitespace-nowrap">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-lg border transition-all duration-200 hover:bg-gray-50 active:scale-98 font-lato font-medium text-sm"
            style={{
              background: '#FFFFFF',
              borderColor: '#E5E7EB',
              height: 48,
              color: '#364153',
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-center mt-6 text-sm font-lato" style={{ color: '#6A6A6A' }}>
            New to iBento?{' '}
            <Link
              to="/signup"
              className="font-semibold underline transition-colors hover:text-orange-dark"
              style={{ color: '#F06138' }}
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

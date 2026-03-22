import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { resetPassword } from '../../services/auth'

const schema = z
  .object({
    email: z.string().email('Please enter a valid email'),
    otp: z
      .string()
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d+$/, 'OTP must be numeric'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const prefillEmail = location.state?.email || ''

  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: prefillEmail },
  })

  const mutation = useMutation({
    mutationFn: (data) =>
      resetPassword({ email: data.email, otp: data.otp, newPassword: data.password }),
    onSuccess: () => {
      setDone(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 2500)
    },
    onError: (err) =>
      toast.error(
        err?.response?.data?.message || 'Failed to reset password. The OTP may have expired.'
      ),
  })

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: '#FFFDFC' }}>
      {/* Top logo */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <Link to="/" className="font-filson font-black text-2xl" style={{ color: '#8A4432', letterSpacing: '-0.04em' }}>
          ibento
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-[420px]"
      >
        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Success ring animation */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(34,197,94,0.2)' }}
              />
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #DCFCE7, #F0FDF4)', border: '1px solid rgba(34,197,94,0.3)' }}
              >
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
            </div>

            <h2 className="font-filson font-black text-[#101828] mb-2" style={{ fontSize: 32 }}>
              Password Updated!
            </h2>
            <p className="font-lato text-[#6A6A6A] text-sm mb-6">
              Redirecting you to sign in…
            </p>
            <Link
              to="/login"
              className="font-lato font-semibold text-sm hover:underline"
              style={{ color: '#F06138' }}
            >
              Go to Sign In →
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFF3EF, #FEFDEB)', border: '1px solid rgba(240,97,56,0.2)' }}
            >
              <KeyRound size={32} style={{ color: '#F06138' }} />
            </div>

            <div className="text-center mb-8">
              <h1 className="font-filson font-black text-[#101828] mb-2" style={{ fontSize: 32 }}>
                Reset Password
              </h1>
              <p className="font-lato text-[#6A6A6A] text-sm">
                Enter the OTP sent to your email and choose a new password.
              </p>
            </div>

            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">
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

              {/* OTP */}
              <div>
                <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  className="input-field tracking-widest text-center text-lg font-bold"
                  style={errors.otp ? { borderColor: '#EF4444' } : {}}
                  {...register('otp')}
                />
                {errors.otp && <p className="mt-1 text-xs text-red-500">{errors.otp.message}</p>}
              </div>

              {/* New Password */}
              <div>
                <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    className="input-field pr-11"
                    style={errors.password ? { borderColor: '#EF4444' } : {}}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block font-lato font-semibold text-sm text-[#364153] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-field pr-11"
                    style={errors.confirmPassword ? { borderColor: '#EF4444' } : {}}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

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
                    Updating…
                  </>
                ) : (
                  'Update Password'
                )}
              </motion.button>
            </form>

            <p className="font-lato text-xs text-center text-[#6A6A6A] mt-4">
              Didn't get an OTP?{' '}
              <Link to="/forgot-password" className="font-semibold hover:underline" style={{ color: '#F06138' }}>
                Request again
              </Link>
            </p>

            <Link
              to="/login"
              className="mt-4 flex items-center justify-center gap-2 font-lato font-semibold text-sm transition-colors"
              style={{ color: '#6A6A6A' }}
            >
              <ArrowLeft size={15} /> Back to Sign In
            </Link>
          </>
        )}
      </motion.div>
    </div>
  )
}

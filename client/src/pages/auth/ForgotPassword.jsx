import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, KeyRound, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { forgotPassword } from '../../services/auth'

const schema = z.object({ email: z.string().email('Please enter a valid email') })

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [sentEmail, setSentEmail] = useState('')
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (_, vars) => {
      setSentEmail(vars.email)
      setSent(true)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Something went wrong. Please try again.'),
  })

  function goToReset() {
    navigate('/reset-password', { state: { email: sentEmail } })
  }

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
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Success icon */}
              <div
                className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FFF3EF, #FEFDEB)', border: '1px solid rgba(240,97,56,0.2)' }}
              >
                <Mail size={32} style={{ color: '#F06138' }} />
              </div>

              <h1 className="font-filson font-black text-[#101828] mb-2" style={{ fontSize: 32 }}>Check your inbox</h1>
              <p className="font-lato text-[#6A6A6A] text-sm leading-relaxed mb-1">
                We sent a 6-digit reset code to
              </p>
              <p className="font-lato font-semibold text-[#101828] text-sm mb-8">{sentEmail}</p>

              <motion.button
                onClick={goToReset}
                whileTap={{ scale: 0.98 }}
                className="w-full font-lato font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all mb-4"
                style={{
                  background: '#F06138',
                  color: '#FDFAD6',
                  height: 48,
                  boxShadow: '0 4px 14px rgba(240,97,56,0.3)',
                }}
              >
                <KeyRound size={15} /> Enter Reset Code <ArrowRight size={15} />
              </motion.button>

              <p className="font-lato text-xs text-[#6A6A6A] mb-6">
                Didn't receive it? Check spam or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="font-semibold hover:underline"
                  style={{ color: '#F06138' }}
                >
                  try again
                </button>.
              </p>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-lato font-semibold text-sm transition-colors"
                style={{ color: '#6A6A6A' }}
              >
                <ArrowLeft size={15} /> Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Icon */}
              <div
                className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FFF3EF, #FEFDEB)', border: '1px solid rgba(240,97,56,0.2)' }}
              >
                <Mail size={32} style={{ color: '#F06138' }} />
              </div>

              <div className="text-center mb-8">
                <h1 className="font-filson font-black text-[#101828] mb-2" style={{ fontSize: 32 }}>
                  Forgot Password?
                </h1>
                <p className="font-lato text-[#6A6A6A] text-sm leading-relaxed">
                  Enter your registered email and we'll send a 6-digit OTP to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate className="space-y-4">
                <div>
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
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
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
                      Sending…
                    </>
                  ) : (
                    <>Send Reset OTP <ArrowRight size={15} /></>
                  )}
                </motion.button>
              </form>

              <Link
                to="/login"
                className="mt-6 flex items-center justify-center gap-2 font-lato font-semibold text-sm transition-colors"
                style={{ color: '#6A6A6A' }}
              >
                <ArrowLeft size={15} /> Back to Sign In
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { forgotPassword } from '../../services/auth'

const schema = z.object({ email: z.string().email('Please enter a valid email') })

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (_, vars) => {
      setSentEmail(vars.email)
      setSent(true)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Something went wrong. Please try again.'),
  })

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FFFDFC' }}>
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-[480px]"
        style={{ background: '#FEFDEB', borderRadius: 8, padding: '52px 48px', boxShadow: '0 4px 32px rgba(139,67,50,0.12)' }}
      >
        <div className="text-center mb-6">
          <span className="font-filson block mb-4" style={{ fontSize: 32, fontWeight: 900, color: '#8A4432', letterSpacing: '-0.04em' }}>ibento</span>
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: '#DCFCE7' }}>
                <CheckCircle size={28} className="text-[#016630]" />
              </div>
              <h1 className="font-filson font-black text-[#8B4332] mb-3" style={{ fontSize: 34 }}>Check your inbox</h1>
              <p className="font-lato text-[#6A6A6A] text-sm leading-relaxed mb-2">
                We sent a password reset link to
              </p>
              <p className="font-lato font-semibold text-[#101828] text-sm mb-6">{sentEmail}</p>
              <p className="font-lato text-xs text-[#6A6A6A] mb-6">
                Didn't receive it? Check spam or{' '}
                <button onClick={() => setSent(false)} className="text-[#F06138] underline font-semibold">try again</button>.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-lato font-semibold text-sm text-[#6A6A6A] hover:text-[#F06138] transition-colors"
              >
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: '#FFF3EF' }}>
                  <Mail size={26} style={{ color: '#F06138' }} />
                </div>
                <h1 className="font-filson font-black text-[#8B4332] mb-2" style={{ fontSize: 36 }}>Forgot Password?</h1>
                <p className="font-lato text-[#6A6A6A] text-sm leading-relaxed">
                  Enter your registered email and we'll send a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
                <label className="block text-sm font-medium mb-1.5 font-lato" style={{ color: '#364153' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="input-field mb-1"
                  style={errors.email ? { borderColor: '#EF4444' } : {}}
                  {...register('email')}
                />
                {errors.email && <p className="mb-4 text-xs text-red-500">{errors.email.message}</p>}

                <motion.button
                  type="submit"
                  disabled={mutation.isPending}
                  whileTap={{ scale: mutation.isPending ? 1 : 0.98 }}
                  className="w-full mt-5 font-lato font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
                  style={{ background: mutation.isPending ? '#c0956b' : '#F06138', color: '#FDFAD6', height: 52, cursor: mutation.isPending ? 'not-allowed' : 'pointer' }}
                >
                  {mutation.isPending
                    ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Sending…</>
                    : 'Send Reset Link'
                  }
                </motion.button>
              </form>

              <Link
                to="/login"
                className="mt-6 flex items-center justify-center gap-2 font-lato text-sm text-[#6A6A6A] hover:text-[#F06138] transition-colors"
              >
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

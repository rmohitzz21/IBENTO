import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { resetPassword } from '../../services/auth'

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (data) => resetPassword({ token, newPassword: data.password }),
    onSuccess: () => {
      setDone(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 2000)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Reset link expired. Please request a new one.'),
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

        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: '#DCFCE7' }}>
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="font-filson font-black text-[#8B4332] text-3xl mb-3">Password Updated!</h2>
            <p className="font-lato text-[#6A6A6A] text-sm mb-6">Redirecting you to sign in…</p>
            <Link to="/login" className="font-lato font-semibold text-sm text-[#F06138] underline">Go to Sign In</Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: '#FFF3EF' }}>
                <span className="text-3xl">🔐</span>
              </div>
              <h1 className="font-filson font-black text-[#8B4332] mb-2" style={{ fontSize: 36 }}>Set New Password</h1>
              <p className="font-lato text-[#6A6A6A] text-sm">Choose a strong password for your iBento account.</p>
            </div>

            {!token && (
              <div className="mb-4 p-4 rounded-xl text-sm font-lato text-red-600 bg-red-50 border border-red-200">
                Invalid or expired reset link. <Link to="/forgot-password" className="font-semibold underline">Request a new one.</Link>
              </div>
            )}

            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium mb-1.5 font-lato" style={{ color: '#364153' }}>New Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    className="input-field pr-11"
                    style={errors.password ? { borderColor: '#EF4444' } : {}}
                    {...register('password')}
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 font-lato" style={{ color: '#364153' }}>Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-field pr-11"
                    style={errors.confirmPassword ? { borderColor: '#EF4444' } : {}}
                    {...register('confirmPassword')}
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={mutation.isPending || !token}
                whileTap={{ scale: mutation.isPending ? 1 : 0.98 }}
                className="w-full font-lato font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{ background: mutation.isPending || !token ? '#c0956b' : '#F06138', color: '#FDFAD6', height: 52, cursor: mutation.isPending || !token ? 'not-allowed' : 'pointer' }}
              >
                {mutation.isPending
                  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Updating…</>
                  : 'Update Password'
                }
              </motion.button>
            </form>

            <Link to="/login" className="mt-6 flex items-center justify-center gap-2 font-lato text-sm text-[#6A6A6A] hover:text-[#F06138] transition-colors">
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </>
        )}
      </motion.div>
    </div>
  )
}

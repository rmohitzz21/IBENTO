import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { verifyOTP, resendOTP } from '../../services/auth'
import { useAuthStore } from '../../stores/authStore'

const RESEND_COOLDOWN = 60

export default function VerifyOTP() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const email = location.state?.email || ''
  const role = location.state?.role || 'user'
  const purpose = location.state?.purpose || 'register'
  const from = location.state?.from

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) navigate('/signup')
    inputRefs.current[0]?.focus()
  }, [email, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const verifyMutation = useMutation({
    mutationFn: () => verifyOTP({ email, otp: otp.join(''), purpose }),
    onSuccess: ({ data }) => {
      const { user, accessToken } = data
      setUser(user)
      setToken(accessToken)
      if (purpose === 'login') {
        toast.success(`Welcome back, ${user.name?.split(' ')[0] || 'there'}!`)
        if (user.role === 'vendor') navigate(from || '/vendor/dashboard', { replace: true })
        else navigate(from || '/home', { replace: true })
      } else {
        toast.success('Email verified! Welcome to iBento.')
        if (user.role === 'vendor') navigate('/vendor/apply')
        else navigate(from || '/home', { replace: true })
      }
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => resendOTP({ email, purpose }),
    onSuccess: () => {
      toast.success('OTP resent to your email.')
      setCooldown(RESEND_COOLDOWN)
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to resend OTP.'),
  })

  function handleChange(i, val) {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
    if (next.every((d) => d !== '') && val) {
      verifyMutation.mutate()
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
      setTimeout(() => verifyMutation.mutate(), 0)
    }
    e.preventDefault()
  }

  const filled = otp.every((d) => d !== '')

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
        className="w-full max-w-[420px] text-center"
      >
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FFF3EF, #FEFDEB)', border: '1px solid rgba(240,97,56,0.2)' }}
        >
          <ShieldCheck size={32} style={{ color: '#F06138' }} />
        </div>

        <h1 className="font-filson font-black text-[#101828] mb-2" style={{ fontSize: 32 }}>
          Verify your email
        </h1>
        <p className="font-lato text-[#6A6A6A] text-sm mb-1">
          We sent a 6-digit code to
        </p>
        <p className="font-lato font-semibold text-[#101828] text-sm mb-8">{email}</p>

        {/* OTP inputs */}
        <div className="flex items-center justify-center gap-3 mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-150 font-lato"
              style={{
                background: digit ? '#FFF3EF' : '#fff',
                borderColor: digit ? '#F06138' : 'rgba(139,67,50,0.2)',
                color: '#101828',
                boxShadow: digit ? '0 0 0 3px rgba(240,97,56,0.12)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Verify button */}
        <motion.button
          onClick={() => verifyMutation.mutate()}
          disabled={!filled || verifyMutation.isPending}
          whileTap={{ scale: 0.98 }}
          className="w-full font-lato font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all mb-5"
          style={{
            background: filled && !verifyMutation.isPending ? '#F06138' : '#c0956b',
            color: '#FDFAD6',
            height: 48,
            cursor: !filled || verifyMutation.isPending ? 'not-allowed' : 'pointer',
            boxShadow: filled && !verifyMutation.isPending ? '0 4px 14px rgba(240,97,56,0.3)' : 'none',
          }}
        >
          {verifyMutation.isPending ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Verifying…
            </>
          ) : (
            'Verify Email'
          )}
        </motion.button>

        {/* Resend */}
        <div className="font-lato text-sm text-[#6A6A6A] mb-6">
          {cooldown > 0 ? (
            <span>Resend code in <span className="font-semibold" style={{ color: '#F06138' }}>{cooldown}s</span></span>
          ) : (
            <span>
              Didn't receive it?{' '}
              <button
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="font-semibold hover:underline disabled:opacity-60"
                style={{ color: '#F06138' }}
              >
                {resendMutation.isPending ? 'Sending…' : 'Resend code'}
              </button>
            </span>
          )}
        </div>

        <Link
          to={purpose === 'login' ? '/login' : '/signup'}
          className="inline-flex items-center gap-2 font-lato font-semibold text-sm transition-colors"
          style={{ color: '#6A6A6A' }}
        >
          <ArrowLeft size={15} /> {purpose === 'login' ? 'Back to Sign In' : 'Wrong email? Go back'}
        </Link>
      </motion.div>
    </div>
  )
}

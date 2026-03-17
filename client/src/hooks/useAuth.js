import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import * as authService from '../services/auth'

export const useAuth = () => {
  const { user, isAuthenticated, setUser, setToken, logout: clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ data }) => {
      setUser(data.user)
      setToken(data.accessToken)
      toast.success(`Welcome back, ${data.user.name}!`)
      const role = data.user.role
      if (role === 'vendor') navigate('/vendor/dashboard')
      else if (role === 'admin') navigate('/admin/dashboard')
      else navigate('/home')
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Login failed'),
  })

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: ({ data }, variables) => {
      toast.success('Account created! Please verify your OTP.')
      navigate('/verify-otp', { state: { email: variables.email } })
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Registration failed'),
  })

  const verifyOTPMutation = useMutation({
    mutationFn: authService.verifyOTP,
    onSuccess: ({ data }) => {
      setUser(data.user)
      setToken(data.accessToken)
      toast.success('Email verified successfully!')
      navigate('/home')
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'OTP verification failed'),
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () =>
      toast.success('Password reset email sent. Check your inbox.'),
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Failed to send reset email'),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully!')
      navigate('/login')
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || 'Failed to reset password'),
  })

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {}
    clearAuth()
    queryClient.clear()
    navigate('/login')
    toast.success('Logged out successfully')
  }, [clearAuth, navigate, queryClient])

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    verifyOTP: verifyOTPMutation.mutate,
    isVerifyingOTP: verifyOTPMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutate,
    isSendingReset: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutate,
    isResettingPassword: resetPasswordMutation.isPending,
    logout,
  }
}

import { useCallback } from 'react'
import { useAuthStore } from '../stores/authStore'

export const useRazorpay = () => {
  const { user } = useAuthStore()

  const loadScript = useCallback(() => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src*="razorpay"]')) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }, [])

  const openCheckout = useCallback(
    async ({ order, serviceName, onSuccess, onFailure }) => {
      const loaded = await loadScript()
      if (!loaded) {
        onFailure?.('Failed to load payment gateway')
        return
      }

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'iBento',
        description: `Payment for ${serviceName}`,
        order_id: order.id,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: { color: '#F06138' },
        handler: (response) => onSuccess?.(response),
        modal: { ondismiss: () => onFailure?.('Payment cancelled') },
      })
      rzp.open()
    },
    [user, loadScript]
  )

  return { openCheckout }
}

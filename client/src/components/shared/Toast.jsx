// Toast configuration for react-hot-toast
export const toastConfig = {
  position: 'top-right',
  toastOptions: {
    duration: 4000,
    style: {
      background: '#FFFEF5',
      color: '#8B4332',
      border: '1px solid rgba(139,67,50,0.2)',
      fontFamily: 'Lato, sans-serif',
      fontSize: '14px',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    },
    success: {
      iconTheme: { primary: '#F06138', secondary: '#FDFAD6' },
    },
    error: {
      iconTheme: { primary: '#9F0712', secondary: '#FFE2E2' },
      style: {
        background: '#FFF5F5',
        color: '#9F0712',
        border: '1px solid rgba(159,7,18,0.2)',
      },
    },
    loading: {
      iconTheme: { primary: '#F06138', secondary: '#FFFEED' },
    },
  },
}

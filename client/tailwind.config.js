/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#F06138',
          dark: '#F54900',
          light: '#FFF3EF',
        },
        brown: {
          DEFAULT: '#8B4332',
          dark: '#870D0D',
          footer: '#8A4432',
        },
        cream: {
          page: '#FFFDFC',
          form: '#FEFDEB',
          input: '#FFFEED',
          card: '#FFFEF5',
          yellow: '#FDFAD6',
          alt: '#FFF9F8',
        },
        text: {
          dark: '#101828',
          body: '#364153',
          mid: '#4C4C4C',
          light: '#6A7282',
          muted: '#6A6A6A',
          vendor: '#424242',
          price: '#8B4332',
        },
        status: {
          'success-bg': '#DCFCE7',
          'success-text': '#016630',
          'confirm-bg': '#DBEAFE',
          'confirm-text': '#193CB8',
          'pending-bg': '#FEF9C2',
          'pending-text': '#894B00',
          'danger-bg': '#FFE2E2',
          'danger-text': '#9F0712',
          'deposit-bg': '#FFEDD4',
          'deposit-text': '#9F2D00',
        },
        stat: {
          purple: '#F5F3FF',
          green: '#F0FDF4',
          yellow: '#FEFCE8',
          blue: '#EFF6FF',
        },
        notif: { red: '#FB2C36' },
      },
      fontFamily: {
        filson: ['"Filson Pro"', 'Georgia', 'serif'],
        lato: ['Lato', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        dmsans: ['"DM Sans"', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        hero: ['120px', '1.05'],
        hero2: ['80px', '1.1'],
        display: ['56px', '1.15'],
        title: ['36px', '1.2'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.04)',
        modal: '0 4px 24px rgba(0,0,0,0.16)',
        sidebar: '4px 0 24px rgba(0,0,0,0.06)',
        stat: '0 1px 3px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #F06138 0%, #F54900 100%)',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'pulse-badge': 'pulseBadge 2s ease-in-out infinite',
        wiggle: 'wiggle 0.3s ease-in-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        pulseBadge: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(0.95)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
      },
      spacing: {
        18: '72px',
        22: '88px',
        30: '120px',
        84: '336px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      })
    },
  ],
}

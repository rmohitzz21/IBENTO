import { motion } from 'framer-motion'

const variantClasses = {
  primary:
    'bg-[#F06138] hover:bg-[#F54900] text-[#FDFAD6] border-transparent',
  outline:
    'bg-transparent border-[#F06138] text-[#F06138] hover:bg-[#F06138] hover:text-[#FDFAD6]',
  ghost:
    'bg-transparent border-transparent text-[#364153] hover:bg-gray-100',
  danger:
    'bg-[#FFE2E2] border-[#9F0712] text-[#9F0712] hover:bg-red-200',
  dark: 'bg-[#313035] text-white hover:bg-[#1a191d] border-transparent',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

/**
 * Reusable Button component
 *
 * @param {'primary'|'outline'|'ghost'|'danger'|'dark'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading - shows spinner and disables interaction
 * @param {boolean} disabled
 * @param {string} className - extra tailwind classes
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: 0.95 }}
      className={[
        'font-[Georgia] font-medium rounded border transition-all duration-200',
        'inline-flex items-center justify-center gap-2',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F06138]/50',
        variantClasses[variant] ?? variantClasses.primary,
        sizeClasses[size] ?? sizeClasses.md,
        isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}

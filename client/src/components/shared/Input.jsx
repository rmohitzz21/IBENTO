import { forwardRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { shakeVariants } from '../../animations/microInteractions'

/**
 * Input / Textarea component with floating label, error state, and icon slots.
 *
 * @param {string}  label         - floating label text
 * @param {string}  error         - error message (triggers red border + shake)
 * @param {boolean} textarea      - render as <textarea> instead of <input>
 * @param {number}  rows          - textarea rows (default 4)
 * @param {React.ReactNode} leftIcon  - icon rendered on the left
 * @param {React.ReactNode} rightIcon - icon rendered on the right
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    textarea = false,
    rows = 4,
    leftIcon,
    rightIcon,
    id,
    className = '',
    value,
    defaultValue,
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false)
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  // Determine if label should float
  const isFloated = focused || !!value || !!defaultValue || !!props.placeholder

  const baseClass = [
    'w-full bg-[#FFFEED] rounded px-4 py-3 text-[#101828]',
    'placeholder:text-[#6A6A6A] placeholder:text-sm',
    'transition-all duration-200 outline-none',
    'border focus:ring-2 focus:ring-[#F06138]/20',
    error
      ? 'border-[#9F0712] focus:border-[#9F0712]'
      : 'border-[rgba(139,67,50,0.2)] focus:border-[#F06138]',
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const Tag = textarea ? 'textarea' : 'input'

  return (
    <motion.div
      className="relative w-full"
      variants={shakeVariants}
      animate={error ? 'shake' : 'rest'}
    >
      {/* Left icon */}
      {leftIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A] pointer-events-none z-10">
          {leftIcon}
        </span>
      )}

      {/* Floating label */}
      {label && (
        <label
          htmlFor={inputId}
          className={[
            'absolute left-4 transition-all duration-200 pointer-events-none z-10 origin-left',
            leftIcon ? 'left-10' : 'left-4',
            isFloated
              ? '-top-2.5 text-xs bg-[#FFFEED] px-1 text-[#F06138] scale-90'
              : 'top-3 text-sm text-[#6A6A6A]',
          ].join(' ')}
        >
          {label}
        </label>
      )}

      <Tag
        ref={ref}
        id={inputId}
        className={baseClass}
        value={value}
        defaultValue={defaultValue}
        rows={textarea ? rows : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />

      {/* Right icon */}
      {rightIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A6A6A] z-10">
          {rightIcon}
        </span>
      )}

      {/* Error message */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-1 text-xs text-[#9F0712]"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

export default Input

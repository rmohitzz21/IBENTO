import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const modalVariants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full mx-4',
}

/**
 * Accessible Modal component
 *
 * @param {boolean} isOpen          - controls visibility
 * @param {function} onClose        - called on Escape / backdrop click
 * @param {string} title            - modal header title
 * @param {'sm'|'md'|'lg'|'xl'|'2xl'|'full'} size
 * @param {boolean} hideCloseButton - hides the X button
 * @param {React.ReactNode} footer  - optional footer slot
 * @param {React.ReactNode} children
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  hideCloseButton = false,
  footer,
  children,
  className = '',
}) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            className={[
              'relative w-full bg-[#FFFEF5] rounded-xl shadow-2xl',
              'border border-black/10 z-10',
              sizeClasses[size] ?? sizeClasses.md,
              className,
            ].join(' ')}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Header */}
            {(title || !hideCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold text-[#101828] font-[Georgia]"
                  >
                    {title}
                  </h2>
                )}
                {!hideCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-1.5 rounded-full text-[#6A7282] hover:bg-gray-100 hover:text-[#101828] transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-black/10 flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

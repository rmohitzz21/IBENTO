import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

/**
 * Vendor dashboard stat card with animated count-up value.
 *
 * @param {React.ElementType} icon      - Lucide icon component
 * @param {string}  iconBg              - tailwind/hex bg class for icon circle
 * @param {number}  value               - numeric value to count up to
 * @param {string}  valuePrefix         - e.g. "₹"
 * @param {string}  valueSuffix         - e.g. "+" or "k"
 * @param {string}  label               - stat label
 * @param {string}  trend               - trend text (green)
 * @param {string}  className           - extra classes
 */
export default function StatCard({
  icon: Icon,
  iconBg = '#EDE9FE',
  iconColor = '#7C3AED',
  value = 0,
  valuePrefix = '',
  valueSuffix = '',
  label = '',
  trend = '',
  className = '',
}) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString('en-IN'))

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.4,
      ease: 'easeOut',
    })
    return controls.stop
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={[
        'bg-white rounded-2xl border border-[#F3F4F6] p-5',
        'flex items-start gap-4 shadow-sm',
        className,
      ].join(' ')}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        {Icon && <Icon size={20} color={iconColor} strokeWidth={2} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-0.5">
          {valuePrefix && (
            <span className="text-sm font-medium text-[#364153]">
              {valuePrefix}
            </span>
          )}
          <motion.span className="text-2xl font-bold text-[#101828] font-[Georgia] leading-none">
            {rounded}
          </motion.span>
          {valueSuffix && (
            <span className="text-sm font-medium text-[#364153] ml-0.5">
              {valueSuffix}
            </span>
          )}
        </div>

        <p className="text-sm text-[#6A7282] mt-0.5 truncate">{label}</p>

        {trend && (
          <p className="text-xs font-medium text-emerald-600 mt-1">{trend}</p>
        )}
      </div>
    </motion.div>
  )
}

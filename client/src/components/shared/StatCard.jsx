import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * Premium stat card with animated count-up, trend indicator, and glow icon.
 *
 * @param {React.ElementType} icon        - Lucide icon component
 * @param {string}  iconBg               - hex background for icon circle
 * @param {string}  iconColor            - icon stroke color
 * @param {number}  value                - numeric value to count up to
 * @param {string}  valuePrefix          - e.g. "₹"
 * @param {string}  valueSuffix          - e.g. "+" or "/ 5"
 * @param {string}  label                - stat label
 * @param {string}  trend                - trend label text (e.g. "All time", "+12%")
 * @param {boolean} trendUp              - true = green up, false = red down, undefined = neutral
 * @param {string}  accent               - optional hex to tint the card top border
 * @param {string}  className            - extra classes
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
  trendUp,
  accent,
  className = '',
}) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => {
    if (valueSuffix === '/ 5' || valueSuffix === '/ 5.0') {
      return v.toFixed(1)
    }
    return Math.round(v).toLocaleString('en-IN')
  })

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    })
    return controls.stop
  }, [value])

  const trendColor =
    trendUp === true ? '#16A34A' :
    trendUp === false ? '#DC2626' :
    '#9CA3AF'

  const TrendIcon =
    trendUp === true ? TrendingUp :
    trendUp === false ? TrendingDown :
    Minus

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)' }}
      className={['bg-white rounded-2xl p-5 flex flex-col gap-3 cursor-default', className].join(' ')}
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        borderTop: accent ? `3px solid ${accent}` : '3px solid transparent',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      {/* Icon + trend row */}
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: iconBg,
            boxShadow: `0 4px 14px ${iconColor}22`,
          }}
        >
          {Icon && <Icon size={20} color={iconColor} strokeWidth={2} />}
        </div>

        {trend && (
          <div
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: trendUp === true ? '#F0FDF4' : trendUp === false ? '#FEF2F2' : '#F9FAFB',
              color: trendColor,
            }}
          >
            <TrendIcon size={11} strokeWidth={2.5} />
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <div className="flex items-baseline gap-0.5 leading-none">
          {valuePrefix && (
            <span className="text-base font-semibold" style={{ color: '#364153' }}>
              {valuePrefix}
            </span>
          )}
          <motion.span
            className="text-[28px] font-bold tracking-tight"
            style={{ color: '#101828', fontFamily: '"DM Sans", sans-serif' }}
          >
            {rounded}
          </motion.span>
          {valueSuffix && (
            <span className="text-sm font-medium ml-0.5" style={{ color: '#9CA3AF' }}>
              {valueSuffix}
            </span>
          )}
        </div>

        <p className="text-sm mt-1.5" style={{ color: '#6A7282' }}>
          {label}
        </p>
      </div>
    </motion.div>
  )
}

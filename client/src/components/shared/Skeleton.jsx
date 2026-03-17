/**
 * Skeleton loading components with shimmer animation.
 *
 * Usage:
 *   <SkeletonCard />
 *   <SkeletonText lines={3} />
 *   <SkeletonAvatar size={40} />
 *   <SkeletonTable rows={5} cols={4} />
 */

const shimmerBase = [
  'rounded',
  'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
  'bg-[length:400%_100%]',
  'animate-[shimmer_1.5s_ease-in-out_infinite]',
].join(' ')

/* ─── Primitive ───────────────────────────────────────────────── */
function Shimmer({ className = '', style }) {
  return <div className={`${shimmerBase} ${className}`} style={style} />
}

/* ─── SkeletonText ────────────────────────────────────────────── */
export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  )
}

/* ─── SkeletonAvatar ──────────────────────────────────────────── */
export function SkeletonAvatar({ size = 40, className = '' }) {
  return (
    <div
      className={`${shimmerBase} rounded-full flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

/* ─── SkeletonCard ────────────────────────────────────────────── */
export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`bg-[#FFFEF5] rounded-lg border border-black/10 overflow-hidden ${className}`}
    >
      {/* Image placeholder */}
      <Shimmer className="w-full h-44" style={{ borderRadius: 0 }} />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Shimmer className="h-5 w-3/4" />

        {/* Subtitle line */}
        <Shimmer className="h-3.5 w-1/2" />

        {/* Tags row */}
        <div className="flex gap-2">
          <Shimmer className="h-6 w-16 rounded-full" />
          <Shimmer className="h-6 w-20 rounded-full" />
        </div>

        {/* Price + button row */}
        <div className="flex items-center justify-between pt-1">
          <Shimmer className="h-5 w-24" />
          <Shimmer className="h-9 w-28 rounded" />
        </div>
      </div>
    </div>
  )
}

/* ─── SkeletonTable ───────────────────────────────────────────── */
export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`w-full overflow-hidden rounded-lg border border-black/10 ${className}`}>
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 bg-gray-50 border-b border-black/10">
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 px-4 py-3 border-b border-black/5 last:border-none"
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Shimmer
              key={colIdx}
              className="h-4 flex-1"
              style={{ opacity: 1 - rowIdx * 0.1 }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ─── Default export (generic card) ─────────────────────────────*/
export default SkeletonCard

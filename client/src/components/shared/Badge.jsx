/**
 * Status badge component
 *
 * @param {'confirmed'|'pending'|'completed'|'rejected'|'cancelled'|'deposit'|'paid'} status
 * @param {string} className - extra classes
 */

const statusConfig = {
  confirmed: {
    label: 'Confirmed',
    bg: '#DBEAFE',
    color: '#193CB8',
    pulse: false,
  },
  pending: {
    label: 'Pending',
    bg: '#FEF9C2',
    color: '#894B00',
    pulse: true,
  },
  completed: {
    label: 'Completed',
    bg: '#DCFCE7',
    color: '#016630',
    pulse: false,
  },
  rejected: {
    label: 'Rejected',
    bg: '#FFE2E2',
    color: '#9F0712',
    pulse: false,
  },
  cancelled: {
    label: 'Cancelled',
    bg: '#FFE2E2',
    color: '#9F0712',
    pulse: false,
  },
  deposit: {
    label: 'Deposit Paid',
    bg: '#FFEDD4',
    color: '#9F2D00',
    pulse: false,
  },
  paid: {
    label: 'Paid',
    bg: '#DCFCE7',
    color: '#016630',
    pulse: false,
  },
}

export default function Badge({ status, label: overrideLabel, className = '' }) {
  const config = statusConfig[status] ?? {
    label: status ?? 'Unknown',
    bg: '#F3F4F6',
    color: '#374151',
    pulse: false,
  }

  const displayLabel = overrideLabel ?? config.label

  return (
    <span
      className={[
        'inline-flex items-center text-xs font-medium px-2 py-1 rounded',
        config.pulse ? 'animate-[pulseBadge_2s_ease-in-out_infinite]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ background: config.bg, color: config.color }}
    >
      {config.pulse && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse"
          style={{ background: config.color }}
          aria-hidden="true"
        />
      )}
      {displayLabel}
    </span>
  )
}

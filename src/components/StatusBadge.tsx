import { AppointmentStatus } from '@/lib/types'

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string; dot: string }> = {
    pending: { label: 'Pending', className: 'badge badge-pending', dot: '#eab308' },
    approved: { label: 'Approved', className: 'badge badge-approved', dot: '#22c55e' },
    rejected: { label: 'Rejected', className: 'badge badge-rejected', dot: '#ef4444' },
    cancelled: { label: 'Cancelled', className: 'badge badge-cancelled', dot: '#f97316' },
    completed: { label: 'Completed', className: 'badge badge-completed', dot: '#10b981' },
    archived: { label: 'Archived', className: 'badge badge-archived', dot: '#6b7280' },
}

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
    const config = STATUS_CONFIG[status]
    return (
        <span className={config.className}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: config.dot, display: 'inline-block' }} />
            {config.label}
        </span>
    )
}

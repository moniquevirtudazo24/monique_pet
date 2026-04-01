/** Inline styles for email clients — matches app status semantics (pending / approved / rejected). */

const STATUS_EMAIL: Record<
    string,
    { label: string; bg: string; color: string; border: string }
> = {
    pending: { label: 'Pending', bg: '#fef9c3', color: '#a16207', border: '#eab308' },
    approved: { label: 'Approved', bg: '#dcfce7', color: '#166534', border: '#22c55e' },
    rejected: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b', border: '#ef4444' },
    completed: { label: 'Completed', bg: '#d1fae5', color: '#065f46', border: '#10b981' },
    cancelled: { label: 'Cancelled', bg: '#ffedd5', color: '#9a3412', border: '#f97316' },
    reminder: { label: 'Reminder', bg: '#e0f2fe', color: '#075985', border: '#0284c7' },
    rescheduled: { label: 'Rescheduled', bg: '#e0e7ff', color: '#3730a3', border: '#6366f1' },
}

function normalizeStatusKey(status: string): keyof typeof STATUS_EMAIL {
    const s = status.toLowerCase()
    if (s.includes('reject')) return 'rejected'
    if (s.includes('approv')) return 'approved'
    if (s.includes('complet')) return 'completed'
    if (s.includes('cancel')) return 'cancelled'
    if (s.includes('remind')) return 'reminder'
    if (s.includes('resched')) return 'rescheduled'
    if (s.includes('pending')) return 'pending'
    return 'pending'
}

export function buildAppointmentEmailSubject(params: {
    pet_name: string
    status: string
}): string {
    const key = normalizeStatusKey(params.status)
    const label = STATUS_EMAIL[key].label
    return `Pet appointment: ${label} — ${params.pet_name}`
}

export function buildAppointmentNotificationHtml(params: {
    to_name: string
    pet_name: string
    service: string
    date_time: string
    status: string
    message: string
    admin_notes?: string
}): string {
    const key = normalizeStatusKey(params.status)
    const st = STATUS_EMAIL[key]
    const notes =
        params.admin_notes && params.admin_notes.trim() && params.admin_notes !== 'None'
            ? `<tr><td colspan="2" style="padding:12px 0 0;border-top:1px solid #e5e7eb;"><strong>Notes</strong><br/><span style="color:#374151;">${escapeHtml(params.admin_notes)}</span></td></tr>`
            : ''

    const badge = `<span style="display:inline-block;padding:6px 14px;border-radius:999px;font-weight:700;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;background:${st.bg};color:${st.color};border:1px solid ${st.border};">${escapeHtml(st.label)}</span>`

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:24px;background:#f4f4f5;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
    <tr>
      <td style="padding:28px 28px 8px;">
        <p style="margin:0 0 16px;">Hi ${escapeHtml(params.to_name)},</p>
        <p style="margin:0 0 20px;">${escapeHtml(params.message)}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:15px;">
          <tr><td style="padding:10px 0;color:#6b7280;width:140px;">Pet</td><td style="padding:10px 0;font-weight:600;">${escapeHtml(params.pet_name)}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7280;border-top:1px solid #f3f4f6;">Service</td><td style="padding:10px 0;border-top:1px solid #f3f4f6;">${escapeHtml(params.service)}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7280;border-top:1px solid #f3f4f6;">Date &amp; time</td><td style="padding:10px 0;border-top:1px solid #f3f4f6;">${escapeHtml(params.date_time)}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7280;border-top:1px solid #f3f4f6;vertical-align:middle;">Status</td><td style="padding:10px 0;border-top:1px solid #f3f4f6;">${badge}</td></tr>
          ${notes}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

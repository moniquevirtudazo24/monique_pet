export interface EmailParams {
    to_email: string
    to_name: string
    pet_name: string
    pet_type?: string
    service: string
    date_time: string
    status: string
    message: string
    admin_notes?: string
}

async function sendViaSmtpApi(params: EmailParams): Promise<{ success: boolean; result?: unknown; error?: unknown }> {
    const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok) {
        return { success: true, result: data }
    }

    console.error('Email API error:', data)
    return {
        success: false,
        error: data.error || 'Failed to send email via API',
    }
}

/**
 * Sends appointment mail. Uses /api/send-email (Nodemailer) strictly.
 */
export async function sendAppointmentEmail(params: EmailParams) {
    if (!params.to_email?.trim()) {
        return { success: false, error: 'Missing recipient email' }
    }

    try {
        return await sendViaSmtpApi(params)
    } catch (error: unknown) {
        console.error('Email send error:', error)
        return { success: false, error }
    }
}

export function buildApprovalEmail(params: {
    to_email: string
    to_name: string
    pet_name: string
    pet_type?: string
    service: string
    date_time: string
    admin_notes?: string
}): EmailParams {
    const { service, pet_name, pet_type, date_time } = params
    const petLabel = pet_type ? `${pet_name} (${pet_type})` : pet_name
    return {
        ...params,
        status: 'Approved',
        message: `Your ${service} appointment for ${petLabel} on ${date_time} has been approved.`,
        admin_notes: params.admin_notes,
    }
}

export function buildRejectionEmail(params: {
    to_email: string
    to_name: string
    pet_name: string
    pet_type?: string
    service: string
    date_time: string
    admin_notes?: string
}): EmailParams {
    const { service, pet_name, pet_type, date_time } = params
    const petLabel = pet_type ? `${pet_name} (${pet_type})` : pet_name
    return {
        ...params,
        status: 'Rejected',
        message: `Your ${service} appointment for ${petLabel} on ${date_time} has been rejected. Please contact us if you would like to reschedule.`,
        admin_notes: params.admin_notes,
    }
}

export function buildReminderEmail(params: {
    to_email: string
    to_name: string
    pet_name: string
    service: string
    date_time: string
}): EmailParams {
    const { service, pet_name, date_time } = params
    return {
        ...params,
        status: 'Reminder',
        message: `Reminder: your ${service} appointment for ${pet_name} is scheduled for ${date_time}.`,
    }
}

export function buildRescheduledEmail(params: {
    to_email: string
    to_name: string
    pet_name: string
    pet_type?: string
    service: string
    date_time: string
    admin_notes?: string
}): EmailParams {
    const { service, pet_name, pet_type, date_time } = params
    const petLabel = pet_type ? `${pet_name} (${pet_type})` : pet_name
    return {
        ...params,
        status: 'Rescheduled',
        message: `Your ${service} appointment for ${petLabel} has been rescheduled to ${date_time}.`,
        admin_notes: params.admin_notes,
    }
}

export function buildCompletionEmail(params: {
    to_email: string
    to_name: string
    pet_name: string
    pet_type?: string
    service: string
    date_time: string
    admin_notes?: string
}): EmailParams {
    const { service, pet_name, pet_type, date_time } = params
    const petLabel = pet_type ? `${pet_name} (${pet_type})` : pet_name
    return {
        ...params,
        status: 'Completed',
        message: `Your ${service} appointment for ${petLabel} on ${date_time} has been completed. Thank you for choosing PawCare!`,
        admin_notes: params.admin_notes,
    }
}

export function buildCancellationEmail(params: {
    to_email: string
    to_name: string
    pet_name: string
    service: string
    date_time: string
}): EmailParams {
    const { service, pet_name, date_time } = params
    return {
        ...params,
        status: 'Cancelled',
        message: `Your ${service} appointment for ${pet_name} on ${date_time} has been cancelled.`,
    }
}

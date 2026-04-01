export interface EmailParams {
    to_email: string
    to_name: string
    pet_name: string
    service: string
    date_time: string
    status: string
    message: string
    admin_notes?: string
}

function hasEmailJsEnv(): boolean {
    return !!(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID &&
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID &&
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    )
}

async function sendViaEmailJsBrowser(params: EmailParams): Promise<{ success: boolean; error?: unknown }> {
    const emailjs = (await import('@emailjs/browser')).default
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!

    try {
        await emailjs.send(
            serviceId,
            templateId,
            {
                to_email: params.to_email,
                email: params.to_email,
                user_email: params.to_email,
                reply_to: params.to_email,
                to: params.to_email,
                to_name: params.to_name,
                pet_name: params.pet_name,
                service: params.service,
                date_time: params.date_time,
                status: params.status,
                message: params.message,
                admin_notes: params.admin_notes?.trim() || 'None',
            },
            { publicKey }
        )
        return { success: true }
    } catch (err: any) {
        const text = err?.text || err?.message || String(err)
        return { success: false, error: text }
    }
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
 * Sends appointment mail. Uses the browser EmailJS SDK when EmailJS env vars exist
 * (server-side EmailJS REST calls are often blocked). Uses /api/send-email (Nodemailer)
 * when SMTP is preferred: set NEXT_PUBLIC_SMTP_ENABLED=true and SMTP_* on the server.
 */
export async function sendAppointmentEmail(params: EmailParams) {
    if (!params.to_email?.trim()) {
        return { success: false, error: 'Missing recipient email' }
    }

    try {
        const useSmtp =
            process.env.NEXT_PUBLIC_SMTP_ENABLED === 'true' ||
            process.env.NEXT_PUBLIC_SMTP_ENABLED === '1'

        if (useSmtp) {
            return await sendViaSmtpApi(params)
        }

        if (hasEmailJsEnv()) {
            return await sendViaEmailJsBrowser(params)
        }

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
    service: string
    date_time: string
}): EmailParams {
    const { service, pet_name, date_time } = params
    return {
        ...params,
        status: 'Approved',
        message: `Your ${service} appointment for ${pet_name} on ${date_time} has been approved.`,
    }
}

export function buildRejectionEmail(params: {
    to_email: string
    to_name: string
    pet_name: string
    service: string
    date_time: string
    admin_notes?: string
}): EmailParams {
    const { service, pet_name, date_time } = params
    return {
        ...params,
        status: 'Rejected',
        message: `Your ${service} appointment for ${pet_name} on ${date_time} has been rejected. Please contact us if you would like to reschedule.`,
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
    service: string
    date_time: string
    admin_notes?: string
}): EmailParams {
    const { service, pet_name, date_time } = params
    return {
        ...params,
        status: 'Rescheduled',
        message: `Your ${service} appointment for ${pet_name} has been rescheduled to ${date_time}.`,
        admin_notes: params.admin_notes,
    }
}

export function buildCompletionEmail(params: {
    to_email: string
    to_name: string
    pet_name: string
    service: string
    date_time: string
}): EmailParams {
    const { service, pet_name, date_time } = params
    return {
        ...params,
        status: 'Completed',
        message: `Your ${service} appointment for ${pet_name} on ${date_time} has been completed. Thank you for choosing us!`,
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

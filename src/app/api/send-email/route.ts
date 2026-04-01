import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import {
    buildAppointmentEmailSubject,
    buildAppointmentNotificationHtml,
} from '@/lib/mail-templates'

function smtpConfigured(): boolean {
    return !!(process.env.SMTP_HOST?.trim() && process.env.SMTP_FROM?.trim())
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { to_email, to_name, pet_name, service, date_time, status, message, admin_notes } =
            body

        if (!to_email) {
            return NextResponse.json({ error: 'Missing recipient email' }, { status: 400 })
        }

        if (!smtpConfigured()) {
            return NextResponse.json(
                {
                    code: 'NO_SMTP',
                    error: 'SMTP is not configured. Set SMTP_HOST and SMTP_FROM in .env.local, or emails will be sent via EmailJS from the browser if configured.',
                },
                { status: 503 }
            )
        }

        const port = parseInt(process.env.SMTP_PORT || '587', 10)
        const secure = process.env.SMTP_SECURE === 'true' || port === 465

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port,
            secure,
            auth:
                process.env.SMTP_USER && process.env.SMTP_PASS
                    ? {
                          user: process.env.SMTP_USER,
                          pass: process.env.SMTP_PASS,
                      }
                    : undefined,
            tls: {
                rejectUnauthorized: false
            }
        })

        const html = buildAppointmentNotificationHtml({
            to_name: to_name || 'Customer',
            pet_name: pet_name || 'your pet',
            service: service || 'Grooming',
            date_time: date_time || '',
            status: status || 'Update',
            message: message || '',
            admin_notes,
        })

        const subject = buildAppointmentEmailSubject({
            pet_name: pet_name || 'your pet',
            status: status || 'Update',
        })

        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: to_email,
            subject,
            text: `${message}\n\nPet: ${pet_name}\nService: ${service}\nWhen: ${date_time}\nStatus: ${status}`,
            html,
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Email send error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to send email' },
            { status: 500 }
        )
    }
}

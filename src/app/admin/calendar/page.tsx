'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function AdminCalendarPage() {
    const router = useRouter()
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<any>(null)

    useEffect(() => {
        async function load() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/admin/login'); return }

            const { data } = await supabase
                .from('appointments')
                .select('*, pets(name, type), profiles(full_name, email, phone)')
                .order('scheduled_at')

            const mapped = (data || []).map((appt: any) => ({
                id: appt.id,
                title: `${appt.pets?.name} — ${appt.service}`,
                start: appt.scheduled_at,
                classNames: [appt.status],
                extendedProps: { appt },
            }))

            setEvents(mapped)
            setLoading(false)
        }
        load()
    }, [router])

    if (loading) {
        return (
            <>
                <Navbar role="admin" />
                <div className="admin-layout">
                    <AdminSidebar />
                    <div className="admin-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Navbar role="admin" />
            <div className="admin-layout">
                <AdminSidebar />
                <div className="admin-content">
                    <div className="page-header">
                        <h2>Calendar</h2>
                        <p>Visual overview of all scheduled appointments.</p>
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Pending',   color: 'var(--yellow)' },
                            { label: 'Approved',  color: 'var(--green)' },
                            { label: 'Rejected',  color: 'var(--red)' },
                            { label: 'Completed', color: '#10b981' },
                            { label: 'Cancelled', color: '#f97316' },
                            { label: 'Archived',  color: '#6b7280' },
                        ].map(l => (
                            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, display: 'inline-block' }} />
                                {l.label}
                            </div>
                        ))}
                    </div>

                    <div className="card" style={{ padding: '1.25rem' }}>
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={events}
                            height="auto"
                            eventClick={(info) => setSelected(info.event.extendedProps.appt)}
                            headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                        />
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selected && (
                <div className="modal-backdrop" onClick={() => setSelected(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
                        <div className="modal-header">
                            <div className="modal-title">Appointment Details</div>
                            <button className="modal-close" onClick={() => setSelected(null)}>X</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                            {[
                                { label: 'Customer', value: selected.profiles?.full_name },
                                { label: 'Email', value: selected.profiles?.email },
                                { label: 'Phone', value: selected.profiles?.phone },
                                { label: 'Pet', value: `${selected.pets?.name} (${selected.pets?.type})` },
                                { label: 'Service', value: selected.service },
                                { label: 'Scheduled', value: format(new Date(selected.scheduled_at), 'MMMM d, yyyy h:mm a') },
                                { label: 'Status', value: selected.status },
                                { label: 'Notes', value: selected.admin_notes || '—' },
                            ].map(row => (
                                <div key={row.label} style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-muted)', minWidth: 90, fontSize: '0.8rem', paddingTop: 1 }}>{row.label}</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                        {row.label === 'Status' ? (
                                            <span className={`badge badge-${row.value}`}>
                                                {row.value ? row.value.charAt(0).toUpperCase() + row.value.slice(1) : '—'}
                                            </span>
                                        ) : row.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="modal-footer" style={{ marginTop: '1rem' }}>
                            <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
                            <a href="/admin/appointments" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>Manage</a>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

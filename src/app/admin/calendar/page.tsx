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
    const [selectedDate, setSelectedDate] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user && !document.cookie.includes('demo_admin=true')) { router.push('/admin/login'); return }

            const { data } = await supabase
                .from('appointments')
                .select('*, pets(name, type), profiles(full_name, email, phone)')
                .order('scheduled_at')
            let finalData = data || [];
            if (!user && document.cookie.includes('demo_admin=true') && finalData.length === 0) {
                try {
                    const stored = localStorage.getItem('demo_sync_appointments');
                    if (stored) {
                        finalData = JSON.parse(stored);
                    }
                } catch (e) {}
            }

            const mapped = finalData.map((appt: any) => ({
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
                            dateClick={(info) => setSelectedDate(info.dateStr)}
                            headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                        />
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selected && (
                <div className="modal-backdrop" onClick={() => setSelected(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--navy-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                            <div>
                                <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue)' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                                    Appointment Details
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>Full record for this calendar event.</p>
                            </div>
                            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.9rem', backgroundColor: 'var(--navy-light)', padding: '1.25rem', borderRadius: '8px' }}>
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

                        <div className="modal-footer" style={{ borderTop: '1px solid var(--navy-border)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
                            <a href="/admin/appointments" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>Manage Appointment</a>
                        </div>
                    </div>
                </div>
            )}

            {/* Date Modal */}
            {selectedDate && (
                <div className="modal-backdrop" onClick={() => setSelectedDate(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--navy-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                            <div>
                                <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue)' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    Appointments on {format(new Date(selectedDate), 'MMMM d, yyyy')}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>All schedule entries for this date.</p>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedDate(null)}>✕</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '50vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {events.filter(e => e.start.startsWith(selectedDate)).length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    No appointments scheduled for this date.
                                </div>
                            ) : (
                                events.filter(e => e.start.startsWith(selectedDate)).map(e => {
                                    const appt = e.extendedProps.appt;
                                    return (
                                        <div key={e.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'var(--navy-light)', padding: '1rem', borderRadius: '8px', borderLeft: `3px solid var(--${appt.status === 'pending' ? 'yellow' : appt.status === 'approved' ? 'green' : appt.status === 'rejected' ? 'red' : appt.status === 'completed' ? 'emerald-500' : appt.status === 'cancelled' ? 'orange-500' : 'gray-500'})` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{format(new Date(appt.scheduled_at), 'h:mm a')} — {appt.service}</div>
                                                <span className={`badge badge-${appt.status}`} style={{ fontSize: '0.7rem' }}>
                                                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>Customer:</span> {appt.profiles?.full_name}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <span style={{ color: 'var(--text-muted)' }}>Pet:</span> {appt.pets?.name} ({appt.pets?.type})
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <div className="modal-footer" style={{ borderTop: '1px solid var(--navy-border)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-ghost" onClick={() => setSelectedDate(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

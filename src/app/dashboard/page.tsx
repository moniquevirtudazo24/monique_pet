'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { sendAppointmentEmail, buildCancellationEmail } from '@/lib/emailjs'
import Navbar from '@/components/Navbar'
import StatusBadge from '@/components/StatusBadge'
import { Appointment } from '@/lib/types'
import { format } from 'date-fns'

export default function DashboardPage() {
    const router = useRouter()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [profile, setProfile] = useState<{ full_name: string; email: string; phone: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [cancelAppt, setCancelAppt] = useState<Appointment | null>(null)
    const [cancelLoading, setCancelLoading] = useState(false)

    // Edit Profile state
    const [editProfileModal, setEditProfileModal] = useState(false)
    const [editForm, setEditForm] = useState({ full_name: '', phone: '' })
    const [editLoading, setEditLoading] = useState(false)
    const [editToast, setEditToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        async function load() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            const [{ data: prof }, { data: appts }] = await Promise.all([
                supabase.from('profiles').select('full_name, email, phone').eq('id', user.id).single(),
                supabase
                    .from('appointments')
                    .select('*, pets(name, type)')
                    .eq('owner_id', user.id)
                    .order('scheduled_at', { ascending: false }),
            ])

            setProfile(prof)
            setAppointments(appts || [])
            setLoading(false)
        }
        load()
    }, [router])

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                    <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                </div>
            </>
        )
    }

    const pending = appointments.filter(a => a.status === 'pending').length
    const approved = appointments.filter(a => a.status === 'approved').length

    async function handleCancel() {
        if (!cancelAppt) return
        setCancelLoading(true)
        const supabase = createClient()

        const { error } = await supabase
            .from('appointments')
            .update({ status: 'cancelled' })
            .eq('id', cancelAppt.id)

        if (!error && profile?.email) {
            const dtStr = format(new Date(cancelAppt.scheduled_at), 'MMMM d, yyyy \'at\' h:mm a')
            const petName = (cancelAppt.pets as any)?.name || 'your pet'
            await sendAppointmentEmail(buildCancellationEmail({
                to_email: profile.email,
                to_name: profile.full_name,
                pet_name: petName,
                service: cancelAppt.service,
                date_time: dtStr
            }))
        }

        // reload data
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: appts } = await supabase
                .from('appointments')
                .select('*, pets(name, type)')
                .eq('owner_id', user.id)
                .order('scheduled_at', { ascending: false })
            setAppointments(appts || [])
        }
        
        setCancelLoading(false)
        setCancelAppt(null)
    }

    return (
        <>
            <Navbar />
            <div className="page-container">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2>Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}</h2>
                        <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Track and manage all your grooming appointments here.</p>
                        <button className="btn btn-ghost" style={{ padding: '0.35rem 0', fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--gold)' }}
                            onClick={() => {
                                setEditForm({ full_name: profile?.full_name || '', phone: profile?.phone || '' })
                                setEditProfileModal(true)
                            }}>
                            Edit Profile
                        </button>
                    </div>
                    <Link href="/book" className="btn btn-primary">
                        Book New Appointment
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid-3" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card gold">
                        <div className="stat-number">{appointments.length}</div>
                        <div className="stat-label">Total Appointments</div>
                    </div>
                    <div className="stat-card yellow">
                        <div className="stat-number">{pending}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-number">{approved}</div>
                        <div className="stat-label">Approved</div>
                    </div>
                </div>

                {/* Table */}
                <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--navy-border)' }}>
                        <h3>My Appointments</h3>
                    </div>
                    {appointments.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', width: 56, height: 56 }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    <line x1="8" y1="14" x2="8" y2="14" /><line x1="12" y1="14" x2="16" y2="14" />
                                    <line x1="8" y1="18" x2="8" y2="18" /><line x1="12" y1="18" x2="16" y2="18" />
                                </svg>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No appointments yet. Book your first one!</p>
                            <Link href="/book" className="btn btn-primary" style={{ marginTop: '1rem' }}>Book Now</Link>
                        </div>
                    ) : (
                        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Pet</th>
                                        <th>Service</th>
                                        <th>Date &amp; Time</th>
                                        <th>Status</th>
                                        <th>Notes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map(appt => (
                                        <tr key={appt.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{(appt.pets as any)?.name || '—'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(appt.pets as any)?.type}</div>
                                            </td>
                                            <td>{appt.service}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {format(new Date(appt.scheduled_at), 'MMM d, yyyy')}<br />
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{format(new Date(appt.scheduled_at), 'h:mm a')}</span>
                                            </td>
                                            <td><StatusBadge status={appt.status} /></td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 200 }}>
                                                {appt.admin_notes || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                            </td>
                                            <td>
                                                {(appt.status === 'pending' || appt.status === 'approved') && (
                                                    <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: 'var(--red)', borderColor: 'var(--red)' }}
                                                        onClick={() => setCancelAppt(appt)}>
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Cancel Modal */}
            {cancelAppt && (
                <div className="modal-backdrop" onClick={() => setCancelAppt(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Cancel Appointment</div>
                            <button className="modal-close" onClick={() => setCancelAppt(null)}>✕</button>
                        </div>
                        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                            Are you sure you want to cancel your appointment for {(cancelAppt.pets as any)?.name} on {format(new Date(cancelAppt.scheduled_at), 'MMM d, yyyy')}? This action cannot be undone.
                        </p>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setCancelAppt(null)} disabled={cancelLoading}>Keep Appointment</button>
                            <button className="btn btn-danger" onClick={handleCancel} disabled={cancelLoading}>
                                {cancelLoading ? <span className="spinner" /> : 'Yes, Cancel Appointment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {editProfileModal && (
                <div className="modal-backdrop" onClick={() => setEditProfileModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Edit Profile</div>
                            <button className="modal-close" onClick={() => setEditProfileModal(false)}>✕</button>
                        </div>
                        
                        {editToast && (
                            <div className={`alert alert-${editToast.type}`} style={{ marginBottom: '1rem' }}>
                                {editToast.msg}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" className="form-input" value={editForm.full_name}
                                onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-input" value={(profile as any)?.email || ''} disabled style={{ backgroundColor: 'var(--navy-light)', color: 'var(--text-muted)' }} />
                            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Email cannot be changed here.</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input type="tel" className="form-input" value={editForm.phone}
                                onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setEditProfileModal(false)} disabled={editLoading}>Cancel</button>
                            <button className="btn btn-primary" onClick={async () => {
                                setEditLoading(true)
                                setEditToast(null)
                                const supabase = createClient()
                                const { data: { user } } = await supabase.auth.getUser()
                                if (user) {
                                    const { error } = await supabase.from('profiles').update({
                                        full_name: editForm.full_name,
                                        phone: editForm.phone
                                    }).eq('id', user.id)
                                    
                                    if (error) {
                                        setEditToast({ msg: 'Failed to update profile.', type: 'error' })
                                    } else {
                                        setProfile((prev: any) => ({ ...prev, full_name: editForm.full_name, phone: editForm.phone }))
                                        setEditProfileModal(false)
                                    }
                                }
                                setEditLoading(false)
                            }} disabled={editLoading}>
                                {editLoading ? <span className="spinner" /> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

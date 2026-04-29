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
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    useEffect(() => {
        async function load() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user && !document.cookie.includes('demo_admin=true')) { router.push('/login'); return }

            const userId = user?.id || 'demo-user-id';

            const [{ data: prof }, { data: appts }] = await Promise.all([
                supabase.from('profiles').select('full_name, email, phone').eq('id', userId).single(),
                supabase
                    .from('appointments')
                    .select('*, pets(name, type, breed, notes)')
                    .eq('owner_id', userId)
                    .order('created_at', { ascending: false }),
            ])

            const apptsWithProfile = (appts || []).map(a => ({
                ...a,
                profiles: prof
            }));

            setProfile(prof)
            setAppointments(apptsWithProfile)
            if (apptsWithProfile.length > 0) {
                try {
                    const existingStr = localStorage.getItem('demo_sync_appointments');
                    let allAppts = existingStr ? JSON.parse(existingStr) : [];
                    
                    // Remove old ones from this user to prevent duplicates
                    allAppts = allAppts.filter((a: any) => a.owner_id !== userId);
                    allAppts = [...allAppts, ...apptsWithProfile];
                    
                    localStorage.setItem('demo_sync_appointments', JSON.stringify(allAppts));
                } catch (e) {}
            }
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

    const filteredAppts = appointments.filter(a => {
        if (filter === 'all') return true
        return a.status === filter
    })

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
        const uid = user?.id || 'demo-user-id';
        if (user || document.cookie.includes('demo_admin=true')) {
            const { data: appts } = await supabase
                .from('appointments')
                .select('*, pets(name, type, breed, notes)')
                .eq('owner_id', uid)
                .order('scheduled_at', { ascending: false })
            const apptsWithProfile = (appts || []).map(a => ({
                ...a,
                profiles: profile
            }));
            setAppointments(apptsWithProfile)
            if (apptsWithProfile.length > 0) {
                try {
                    const existingStr = localStorage.getItem('demo_sync_appointments');
                    let allAppts = existingStr ? JSON.parse(existingStr) : [];
                    
                    // Remove old ones from this user to prevent duplicates
                    allAppts = allAppts.filter((a: any) => a.owner_id !== uid);
                    allAppts = [...allAppts, ...apptsWithProfile];
                    
                    localStorage.setItem('demo_sync_appointments', JSON.stringify(allAppts));
                } catch (e) {}
            }
        }
        
        setCancelLoading(false)
        setCancelAppt(null)
    }

    return (
        <>
            <Navbar />
            <div className="page-container">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.75rem', fontWeight: 700, flexShrink: 0, boxShadow: '0 4px 10px rgba(29, 78, 216, 0.2)' }}>
                            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h2 style={{ marginBottom: '0.25rem' }}>Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <p style={{ fontSize: '0.9rem' }}>Track and manage all your grooming appointments here.</p>
                                <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', borderRadius: 100, gap: '0.35rem' }}
                                    onClick={() => {
                                        setEditForm({ full_name: profile?.full_name || '', phone: profile?.phone || '' })
                                        setEditProfileModal(true)
                                    }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                    <Link href="/book" className="btn btn-primary">
                        Book New Appointment
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid-3" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card gold" 
                         style={{ cursor: 'pointer', outline: filter === 'all' ? '2px solid var(--gold)' : 'none' }}
                         onClick={() => setFilter('all')}>
                        <div className="stat-number">{appointments.length}</div>
                        <div className="stat-label">Total Appointments</div>
                    </div>
                    <div className="stat-card yellow"
                         style={{ cursor: 'pointer', outline: filter === 'pending' ? '2px solid var(--yellow)' : 'none' }}
                         onClick={() => setFilter('pending')}>
                        <div className="stat-number">{pending}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                    <div className="stat-card green"
                         style={{ cursor: 'pointer', outline: filter === 'approved' ? '2px solid var(--green)' : 'none' }}
                         onClick={() => setFilter('approved')}>
                        <div className="stat-number">{approved}</div>
                        <div className="stat-label">Approved</div>
                    </div>
                </div>

                {/* Table */}
                <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--navy-border)' }}>
                        <h3>{filter === 'all' ? 'My Appointments' : filter === 'pending' ? 'Pending Appointments' : 'Approved Appointments'}</h3>
                    </div>
                    {filteredAppts.length === 0 ? (
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
                                    {filteredAppts.map(appt => (
                                        <tr key={appt.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{(appt.pets as any)?.name || '—'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {(appt.pets as any)?.type}{(appt.pets as any)?.breed ? ` - ${(appt.pets as any).breed}` : ''}
                                                </div>
                                            </td>
                                            <td>{appt.service}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {format(new Date(appt.scheduled_at), 'MMM d, yyyy')}<br />
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{format(new Date(appt.scheduled_at), 'h:mm a')}</span>
                                            </td>
                                            <td><StatusBadge status={appt.status} /></td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 200 }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    {(appt.pets as any)?.notes && <div><strong style={{ color: 'var(--text-primary)' }}>You:</strong> {(appt.pets as any).notes}</div>}
                                                    {appt.admin_notes && <div><strong style={{ color: 'var(--text-primary)' }}>PawCare:</strong> {appt.admin_notes}</div>}
                                                    {!(appt.pets as any)?.notes && !appt.admin_notes && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                                </div>
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
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--navy-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                            <div>
                                <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--red)' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                    Cancel Appointment
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>This action cannot be undone.</p>
                            </div>
                            <button className="modal-close" onClick={() => setCancelAppt(null)}>✕</button>
                        </div>
                        <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', marginTop: 0, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                            Are you sure you want to cancel your appointment for <span style={{ fontWeight: 600 }}>{(cancelAppt.pets as any)?.name}</span> on <span style={{ fontWeight: 600 }}>{format(new Date(cancelAppt.scheduled_at), 'MMM d, yyyy')}</span>?
                        </p>
                        <div className="modal-footer" style={{ borderTop: '1px solid var(--navy-border)', paddingTop: '1.25rem', marginTop: 0 }}>
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
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--navy-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                            <div>
                                <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold)' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    Edit Your Profile
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Update your personal details below. This will be used when booking.</p>
                            </div>
                            <button className="modal-close" onClick={() => setEditProfileModal(false)}>✕</button>
                        </div>
                        
                        {editToast && (
                            <div className={`alert alert-${editToast.type}`} style={{ marginBottom: '1.5rem' }}>
                                {editToast.msg}
                            </div>
                        )}

                        <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    <input type="text" className="form-input" style={{ paddingLeft: '2.75rem' }} value={editForm.full_name}
                                        onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} />
                                </div>
                            </div>
                            
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    <input type="tel" className="form-input" style={{ paddingLeft: '2.75rem' }} value={editForm.phone}
                                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                <input type="email" className="form-input" value={(profile as any)?.email || ''} disabled style={{ backgroundColor: 'var(--navy-light)', color: 'var(--text-muted)', paddingLeft: '2.75rem' }} />
                            </div>
                            <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                Your email address serves as your primary login and cannot be modified here.
                            </div>
                        </div>

                        <div className="modal-footer" style={{ borderTop: '1px solid var(--navy-border)', paddingTop: '1.25rem', marginTop: 0 }}>
                            <button className="btn btn-ghost" onClick={() => setEditProfileModal(false)} disabled={editLoading}>Cancel</button>
                            <button className="btn btn-primary" onClick={async () => {
                                setEditLoading(true)
                                setEditToast(null)
                                const supabase = createClient()
                                const { data: { user } } = await supabase.auth.getUser()
                                const uid = user?.id || 'demo-user-id';
                                
                                const { error } = await supabase.from('profiles').update({
                                    full_name: editForm.full_name,
                                    phone: editForm.phone
                                }).eq('id', uid)
                                
                                if (error) {
                                    setEditToast({ msg: 'Failed to update profile.', type: 'error' })
                                } else {
                                    setProfile((prev: any) => ({ ...prev, full_name: editForm.full_name, phone: editForm.phone }))
                                    setEditProfileModal(false)
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

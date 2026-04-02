'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import Navbar from '@/components/Navbar'
import StatusBadge from '@/components/StatusBadge'
import { createClient } from '@/lib/supabase'
import { sendAppointmentEmail, buildApprovalEmail, buildRejectionEmail, buildCompletionEmail, buildRescheduledEmail } from '@/lib/emailjs'
import { Appointment, AppointmentStatus } from '@/lib/types'
import { format } from 'date-fns'

type ActionType = 'approve' | 'reject' | 'complete' | 'archive' | 'unarchive' | 'delete' | 'reschedule' | null

export default function AdminAppointmentsPage() {
    const router = useRouter()
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all')

    // Modal state
    const [modalAction, setModalAction] = useState<ActionType>(null)
    const [modalAppt, setModalAppt] = useState<any>(null)
    const [adminNotes, setAdminNotes] = useState('')
    const [actionLoading, setActionLoading] = useState(false)
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
    const [newDate, setNewDate] = useState('')
    const [newTime, setNewTime] = useState('')

    useEffect(() => {
        async function load() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/admin/login'); return }
            await fetchAppointments()
        }
        load()
    }, [router])

    async function fetchAppointments() {
        const supabase = createClient()
        const { data } = await supabase
            .from('appointments')
            .select('*, pets(name, type, breed, notes), profiles(full_name, email, phone)')
            .order('scheduled_at', { ascending: true })
        setAppointments(data || [])
        setLoading(false)
    }

    function showToast(msg: string, type: 'success' | 'error') {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 4000)
    }

    function openModal(action: ActionType, appt: any) {
        setModalAction(action)
        setModalAppt(appt)
        setAdminNotes(appt.admin_notes || '')
        
        if (action === 'reschedule') {
            const d = new Date(appt.scheduled_at)
            setNewDate(format(d, 'yyyy-MM-dd'))
            setNewTime(format(d, 'HH:mm'))
        } else {
            setNewDate('')
            setNewTime('')
        }
    }

    function closeModal() { setModalAction(null); setModalAppt(null) }

    async function handleAction() {
        if (!modalAppt || !modalAction) return
        setActionLoading(true)

        const supabase = createClient()
        
        if (modalAction === 'delete') {
            const { error: deleteError } = await supabase
                .from('appointments')
                .delete()
                .eq('id', modalAppt.id)

            if (deleteError) {
                showToast('Failed to delete appointment.', 'error')
                setActionLoading(false)
                return
            }

            showToast('Appointment deleted.', 'success')
            await fetchAppointments()
            setActionLoading(false)
            closeModal()
            return
        }

        if (modalAction === 'reschedule') {
            if (!newDate || !newTime) {
                showToast('Please select a new date and time.', 'error')
                setActionLoading(false)
                return
            }
        }

        const newStatus: AppointmentStatus = 
            modalAction === 'approve' ? 'approved' : 
            modalAction === 'reject' ? 'rejected' : 
            modalAction === 'complete' ? 'completed' : 
            modalAction === 'archive' ? 'archived' : 
            modalAction === 'unarchive' ? 'pending' : 
            modalAction === 'reschedule' ? 'pending' : 'pending' // Or 'approved', let's stick to pending so they can approve it later, or it stays its current status. Actually, we'll keep the current status for reschedule.

        let statusToSet = newStatus
        if (modalAction === 'reschedule') {
            statusToSet = modalAppt.status // Keep its original status when rescheduling
        }

        const updatePayload: any = { status: statusToSet, admin_notes: adminNotes }
        if (modalAction === 'reschedule') {
            updatePayload.scheduled_at = new Date(`${newDate}T${newTime}:00`).toISOString()
        }

        const { error: updateError } = await supabase
            .from('appointments')
            .update(updatePayload)
            .eq('id', modalAppt.id)

        if (updateError) {
            showToast('Failed to update appointment.', 'error')
            setActionLoading(false)
            return
        }

        // Send email
        if (modalAction === 'approve' || modalAction === 'reject' || modalAction === 'reschedule') {
            const dateObj = modalAction === 'reschedule' ? new Date(`${newDate}T${newTime}:00`) : new Date(modalAppt.scheduled_at)
            const dtStr = format(dateObj, 'MMMM d, yyyy \'at\' h:mm a')
            const ownerEmail: string = modalAppt.profiles?.email || ''
            const ownerName: string = modalAppt.profiles?.full_name || 'Customer'
            const petName: string = modalAppt.pets?.name || 'your pet'

            const actionVerb = modalAction === 'approve' ? 'approved' : modalAction === 'reject' ? 'rejected' : 'rescheduled'

            if (!ownerEmail) {
                showToast(`Appointment ${actionVerb}. (No email address for customer)`, 'error')
                await fetchAppointments()
                setActionLoading(false)
                closeModal()
                return
            }

            const emailParams = modalAction === 'approve'
                ? buildApprovalEmail({ to_email: ownerEmail, to_name: ownerName, pet_name: petName, service: modalAppt.service, date_time: dtStr, admin_notes: adminNotes })
                : modalAction === 'reschedule'
                ? buildRescheduledEmail({ to_email: ownerEmail, to_name: ownerName, pet_name: petName, service: modalAppt.service, date_time: dtStr, admin_notes: adminNotes })
                : buildRejectionEmail({ to_email: ownerEmail, to_name: ownerName, pet_name: petName, service: modalAppt.service, date_time: dtStr, admin_notes: adminNotes })

            const emailResult = await sendAppointmentEmail(emailParams)

            if (emailResult.success) {
                showToast(`Appointment ${actionVerb}. Email sent to ${ownerEmail}.`, 'success')
            } else {
                const errDetail = typeof emailResult.error === 'string' ? emailResult.error : ((emailResult.error as any)?.text || (emailResult.error as any)?.message || 'check API keys')
                showToast(`Appointment ${actionVerb}. (Email failed: ${errDetail})`, 'error')
            }
        } else {
            showToast(`Appointment updated.`, 'success')
        }

        await fetchAppointments()
        setActionLoading(false)
        closeModal()
    }

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

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
                    {/* Toast */}
                    {toast && (
                        <div className={`alert alert-${toast.type === 'success' ? 'success' : 'error'}`} style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 200, minWidth: 300, maxWidth: 420, boxShadow: 'var(--shadow-lg)' }}>
                            {toast.msg}
                        </div>
                    )}

                    <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2>Appointments</h2>
                            <p>Review and manage all customer appointment requests.</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        {(['all', 'pending', 'approved', 'rejected', 'completed', 'archived'] as const).map(f => (
                            <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', textTransform: 'capitalize' }}
                                onClick={() => setFilter(f)}>
                                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                                <span style={{ marginLeft: '0.375rem', opacity: 0.7 }}>
                                    ({f === 'all' ? appointments.length : appointments.filter(a => a.status === f).length})
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="card" style={{ padding: 0 }}>
                        {filtered.length === 0 ? (
                            <div className="empty-state">
                                <p style={{ fontSize: '0.875rem' }}>No appointments found.</p>
                            </div>
                        ) : (
                            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Pet</th>
                                            <th>Breed</th>
                                            <th>Service</th>
                                            <th>Scheduled</th>
                                            <th>Status</th>
                                            <th>Special Notes</th>
                                            <th>Admin Notes</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(appt => (
                                            <tr key={appt.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{appt.profiles?.full_name || <span style={{ color: 'var(--text-muted)' }}>No name provided</span>}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{appt.pets?.name}</div>
                                                    <div style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                                                        {appt.pets?.type}
                                                    </div>
                                                </td>
                                                <td>
                                                    {appt.pets?.breed || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                                </td>
                                                <td>{appt.service}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    {format(new Date(appt.scheduled_at), 'MMM d, yyyy')}<br />
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85em' }}>{format(new Date(appt.scheduled_at), 'h:mm a')}</span>
                                                </td>
                                                <td><StatusBadge status={appt.status} /></td>
                                                <td style={{ color: 'var(--text-secondary)', maxWidth: 220 }}>
                                                    {appt.pets?.notes || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)', maxWidth: 220 }}>
                                                    {appt.admin_notes || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                                </td>
                                                <td>
                                                    {appt.status === 'pending' ? (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button className="btn btn-success" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                                                                onClick={() => openModal('approve', appt)}>
                                                                Approve
                                                            </button>
                                                            <button className="btn btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                                                                onClick={() => openModal('reject', appt)}>
                                                                Reject
                                                            </button>
                                                            <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                                                                onClick={() => openModal('reschedule', appt)}>
                                                                Reschedule
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                            {appt.status === 'approved' && (
                                                                <button className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', background: 'var(--green)', borderColor: 'var(--green)', color: 'white' }}
                                                                    onClick={() => openModal('complete', appt)}>
                                                                    Complete
                                                                </button>
                                                            )}
                                                            {appt.status !== 'archived' && appt.status !== 'completed' && appt.status !== 'rejected' && (
                                                                <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                                                                    onClick={() => openModal('reschedule', appt)}>
                                                                    Reschedule
                                                                </button>
                                                            )}
                                                            {appt.status !== 'archived' && (
                                                                <button className="btn btn-ghost" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                                                                    onClick={() => openModal('archive', appt)}>
                                                                    Archive
                                                                </button>
                                                            )}
                                                            {appt.status === 'archived' && (
                                                                <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: 'var(--gold)', borderColor: 'var(--gold)' }}
                                                                    onClick={() => openModal('unarchive', appt)}>
                                                                    Unarchive
                                                                </button>
                                                            )}
                                                            <button className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: 'var(--red)', borderColor: 'var(--red)' }}
                                                                onClick={() => openModal('delete', appt)}>
                                                                Delete
                                                            </button>
                                                        </div>
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
            </div>

            {/* Modal */}
            {modalAction && modalAppt && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ borderBottom: '1px solid var(--navy-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                            <div>
                                <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', 
                                    color: modalAction === 'approve' ? 'var(--green)' : 
                                           modalAction === 'reject' || modalAction === 'delete' ? 'var(--red)' : 
                                           modalAction === 'complete' ? 'var(--green)' : 
                                           modalAction === 'archive' ? 'var(--text-secondary)' : 
                                           modalAction === 'unarchive' ? 'var(--gold)' : 
                                           modalAction === 'reschedule' ? 'var(--blue)' : 'var(--text-primary)' 
                                }}>
                                    {/* Dynamic Icon */}
                                    {modalAction === 'approve' || modalAction === 'complete' ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    ) : modalAction === 'reject' || modalAction === 'delete' ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                    ) : modalAction === 'reschedule' ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m9 16 2 2 4-4" /></svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8v13H3V8" /><path d="M1 3h22v5H1z" /><path d="M10 12h4" /></svg>
                                    )}
                                    {modalAction === 'approve' ? 'Approve Appointment' : 
                                     modalAction === 'reject' ? 'Reject Appointment' : 
                                     modalAction === 'complete' ? 'Complete Appointment' : 
                                     modalAction === 'archive' ? 'Archive Appointment' : 
                                     modalAction === 'unarchive' ? 'Unarchive Appointment' : 
                                     modalAction === 'reschedule' ? 'Reschedule Appointment' : 
                                     'Delete Appointment'}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{modalAppt.pets?.name}</span> • {modalAppt.service} • {format(new Date(modalAppt.scheduled_at), 'MMM d, yyyy h:mm a')}
                                </p>
                            </div>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>

                        {modalAction === 'reschedule' && (
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">New Date</label>
                                <input type="date" className="form-input" style={{ marginBottom: '0.5rem' }} value={newDate} onChange={e => setNewDate(e.target.value)} />
                                <label className="form-label">New Time</label>
                                <input type="time" className="form-input" style={{ marginBottom: '0.5rem' }} value={newTime} onChange={e => setNewTime(e.target.value)} />
                                <label className="form-label">Notes for Customer (optional)</label>
                                <textarea className="form-textarea" value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    placeholder='e.g. Can we move this one hour later?' />
                            </div>
                        )}

                        {modalAction !== 'delete' && modalAction !== 'archive' && modalAction !== 'unarchive' && modalAction !== 'complete' && modalAction !== 'reschedule' && (
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">
                                    {modalAction === 'approve' ? 'Notes for Customer (optional)' : 'Reason for Rejection'}
                                </label>
                                <textarea className="form-textarea" value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    placeholder={modalAction === 'approve' ? 'e.g. Please arrive 10 minutes early.' : 'e.g. Fully booked on this date.'} />
                            </div>
                        )}
                        {modalAction === 'delete' && (
                            <div className="alert alert-error" style={{ marginBottom: '1.5rem', marginTop: 0 }}>
                                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Warning</strong>
                                Are you sure you want to permanently delete this appointment? This action cannot be undone.
                            </div>
                        )}
                        {modalAction === 'archive' && (
                            <p style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Are you sure you want to archive this appointment?</p>
                        )}
                        {modalAction === 'unarchive' && (
                            <p style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Are you sure you want to restore this appointment to <span style={{ fontWeight: 600 }}>pending</span> status?</p>
                        )}
                        {modalAction === 'complete' && (
                            <p style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Has this grooming session been successfully completed?</p>
                        )}

                        <div className="modal-footer" style={{ borderTop: '1px solid var(--navy-border)', paddingTop: '1.25rem', marginTop: 0 }}>
                            <button className="btn btn-ghost" onClick={closeModal} disabled={actionLoading}>Cancel</button>
                            <button className={`btn ${modalAction === 'approve' || modalAction === 'complete' ? 'btn-success' : modalAction === 'delete' || modalAction === 'reject' ? 'btn-danger' : 'btn-primary'}`}
                                onClick={handleAction} disabled={actionLoading}>
                                {actionLoading ? <span className="spinner" /> : 
                                 modalAction === 'approve' ? 'Confirm & Approve' : 
                                 modalAction === 'reject' ? 'Confirm & Reject' : 
                                 modalAction === 'complete' ? 'Confirm & Complete' : 
                                 modalAction === 'archive' ? 'Confirm & Archive' : 
                                 modalAction === 'unarchive' ? 'Confirm & Unarchive' : 
                                 modalAction === 'reschedule' ? 'Confirm & Reschedule' : 
                                 'Confirm & Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

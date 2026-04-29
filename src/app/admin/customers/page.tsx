'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'

interface CustomerRow {
    id: string
    full_name: string
    email: string
    phone: string
    created_at: string
    appointment_count: number
    last_appointment: string | null
}

export default function AdminCustomersPage() {
    const router = useRouter()
    const [customers, setCustomers] = useState<CustomerRow[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function load() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user && !document.cookie.includes('demo_admin=true')) { router.push('/admin/login'); return }

            // Fetch all customer profiles
            let { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email, phone, created_at')
                .eq('role', 'customer')
                .order('created_at', { ascending: false })

            // Fetch appointment counts per customer
            let { data: appts } = await supabase
                .from('appointments')
                .select('owner_id, scheduled_at')
                .order('scheduled_at', { ascending: false })

            if (!user && document.cookie.includes('demo_admin=true') && (!profiles || profiles.length === 0)) {
                try {
                    const stored = localStorage.getItem('demo_sync_appointments');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        appts = parsed;
                        
                        // Extract unique profiles from the stored appointments
                        const profMap: Record<string, any> = {};
                        for (const a of parsed) {
                            if (a.profiles) {
                                profMap[a.profiles.email] = {
                                    id: a.owner_id,
                                    full_name: a.profiles.full_name,
                                    email: a.profiles.email,
                                    phone: a.profiles.phone || '',
                                    created_at: a.created_at || new Date().toISOString()
                                };
                            }
                        }
                        profiles = Object.values(profMap);
                    }
                } catch (e) {}
            }

            if (!profiles) { setLoading(false); return }

            const apptMap: Record<string, { count: number; last: string | null }> = {}
            for (const appt of appts || []) {
                if (!apptMap[appt.owner_id]) {
                    apptMap[appt.owner_id] = { count: 0, last: appt.scheduled_at }
                }
                apptMap[appt.owner_id].count += 1
            }

            setCustomers(profiles.map(p => ({
                ...p,
                appointment_count: apptMap[p.id]?.count || 0,
                last_appointment: apptMap[p.id]?.last || null,
            })))
            setLoading(false)
        }
        load()
    }, [router])

    const filtered = customers.filter(c =>
        c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
    )

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
                    <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2>Customers</h2>
                            <p>All registered customer accounts and their appointment history.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {/* Search */}
                    <div style={{ marginBottom: '1.5rem', maxWidth: 360 }}>
                        <div style={{ position: 'relative' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by name, email or phone…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                    </div>

                    {/* Customer Table */}
                    <div className="card" style={{ padding: 0 }}>
                        {filtered.length === 0 ? (
                            <div className="empty-state">
                                <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <p style={{ fontSize: '0.875rem' }}>
                                    {search ? 'No customers match your search.' : 'No customers registered yet.'}
                                </p>
                            </div>
                        ) : (
                            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Appointments</th>
                                            <th>Last Appointment</th>
                                            <th>Registered</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(c => (
                                            <tr key={c.id}>
                                                <td style={{ fontWeight: 600 }}>{c.full_name || '—'}</td>
                                                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.email}</td>
                                                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.phone || '—'}</td>
                                                <td>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        minWidth: 28, height: 24, borderRadius: 100,
                                                        background: c.appointment_count > 0 ? 'var(--gold-muted)' : 'var(--navy-light)',
                                                        color: c.appointment_count > 0 ? 'var(--gold)' : 'var(--text-muted)',
                                                        fontSize: '0.75rem', fontWeight: 700,
                                                        border: `1px solid ${c.appointment_count > 0 ? 'rgba(201,168,76,0.3)' : 'var(--navy-border)'}`,
                                                        padding: '0 0.5rem',
                                                    }}>
                                                        {c.appointment_count}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                                    {c.last_appointment
                                                        ? format(new Date(c.last_appointment), 'MMM d, yyyy')
                                                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                                </td>
                                                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                    {format(new Date(c.created_at || new Date().toISOString()), 'MMM d, yyyy')}
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
        </>
    )
}

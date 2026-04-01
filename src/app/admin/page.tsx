'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'
import { format, startOfDay, endOfDay } from 'date-fns'

export default function AdminDashboardPage() {
    const router = useRouter()
    const [stats, setStats] = useState({ total: 0, pendingToday: 0, approvedToday: 0, rejectedToday: 0 })
    const [loading, setLoading] = useState(true)
    const [recent, setRecent] = useState<any[]>([])

    useEffect(() => {
        async function load() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/admin/login'); return }

            const today = new Date()
            const todayStart = startOfDay(today).toISOString()
            const todayEnd = endOfDay(today).toISOString()

            const [
                { count: total },
                { count: pendingToday },
                { count: approvedToday },
                { count: rejectedToday },
                { data: recentAppts },
            ] = await Promise.all([
                supabase.from('appointments').select('*', { count: 'exact', head: true }),
                supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending').gte('scheduled_at', todayStart).lte('scheduled_at', todayEnd),
                supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'approved').gte('scheduled_at', todayStart).lte('scheduled_at', todayEnd),
                supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'rejected').gte('scheduled_at', todayStart).lte('scheduled_at', todayEnd),
                supabase.from('appointments').select('*, pets(name, type), profiles(full_name, email)').order('created_at', { ascending: false }).limit(5),
            ])

            setStats({ total: total || 0, pendingToday: pendingToday || 0, approvedToday: approvedToday || 0, rejectedToday: rejectedToday || 0 })
            setRecent(recentAppts || [])
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
                        <h2>Dashboard</h2>
                        <p>Overview of today&apos;s appointment activity.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid-4" style={{ marginBottom: '2rem' }}>
                        <div className="stat-card gold">
                            <div className="stat-number">{stats.total}</div>
                            <div className="stat-label">Total Appointments</div>
                        </div>
                        <div className="stat-card yellow">
                            <div className="stat-number">{stats.pendingToday}</div>
                            <div className="stat-label">Pending Today</div>
                        </div>
                        <div className="stat-card green">
                            <div className="stat-number">{stats.approvedToday}</div>
                            <div className="stat-label">Approved Today</div>
                        </div>
                        <div className="stat-card red">
                            <div className="stat-number">{stats.rejectedToday}</div>
                            <div className="stat-label">Rejected Today</div>
                        </div>
                    </div>

                    {/* Recent Appointments */}
                    <div className="card" style={{ padding: 0 }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--navy-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3>Recent Appointments</h3>
                            <a href="/admin/appointments" style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600 }}>View All</a>
                        </div>
                        {recent.length === 0 ? (
                            <div className="empty-state">
                                <p style={{ fontSize: '0.875rem' }}>No appointments yet.</p>
                            </div>
                        ) : (
                            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Pet</th>
                                            <th>Service</th>
                                            <th>Scheduled</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recent.map(appt => (
                                            <tr key={appt.id}>
                                                <td style={{ fontWeight: 500 }}>{appt.profiles?.full_name || <span style={{ color: 'var(--text-muted)' }}>No name provided</span>}</td>
                                                <td>{appt.pets?.name}</td>
                                                <td>{appt.service}</td>
                                                <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{format(new Date(appt.scheduled_at), 'MMM d, yyyy h:mm a')}</td>
                                                <td>
                                                    <span className={`badge badge-${appt.status}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: appt.status === 'approved' ? 'var(--green)' : appt.status === 'rejected' ? 'var(--red)' : 'var(--yellow)', display: 'inline-block' }} />
                                                        {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                                                    </span>
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

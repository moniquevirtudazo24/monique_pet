'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'
import { format } from 'date-fns'

interface PetProfileRow {
    id: string
    name: string
    type: string
    breed: string
    notes: string
    created_at: string
    owner_name: string
}

export default function AdminPetProfilesPage() {
    const router = useRouter()
    const [pets, setPets] = useState<PetProfileRow[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function load() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/admin/login'); return }

            const { data } = await supabase
                .from('pets')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false })

            if (data) {
                setPets(data.map((p: any) => ({
                    ...p,
                    owner_name: p.profiles?.full_name || 'Unknown Owner'
                })))
            }
            setLoading(false)
        }
        load()
    }, [router])

    const filtered = pets.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) || 
        (p.breed && p.breed.toLowerCase().includes(search.toLowerCase())) ||
        p.owner_name.toLowerCase().includes(search.toLowerCase())
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
                            <h2>Pet Profiles</h2>
                            <p>Directory of all registered pets, including their breeds and special medical or behavioral notes.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{filtered.length} pet{filtered.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem', maxWidth: 360 }}>
                        <div style={{ position: 'relative' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                                style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Search by pet name, breed, or owner…" 
                                value={search} 
                                onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                    </div>

                    <div className="card" style={{ padding: 0 }}>
                        {filtered.length === 0 ? (
                            <div className="empty-state">
                                <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="4" r="2" />
                                        <circle cx="18" cy="8" r="2" />
                                        <circle cx="20" cy="16" r="2" />
                                        <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
                                    </svg>
                                </div>
                                <p style={{ fontSize: '0.875rem' }}>
                                    {search ? 'No pets match your search.' : 'No pets registered yet.'}
                                </p>
                            </div>
                        ) : (
                            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Pet Identity</th>
                                            <th>Breed</th>
                                            <th>Special Notes</th>
                                            <th>Owner</th>
                                            <th>Added</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(p => (
                                            <tr key={p.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                                                    <div style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>{p.type}</div>
                                                </td>
                                                <td>{p.breed || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                                <td style={{ color: 'var(--text-secondary)', maxWidth: 350 }}>
                                                    {p.notes ? (
                                                        <span style={{ display: 'inline-block', background: 'var(--navy)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--navy-border)', fontSize: '0.9em', width: '100%' }}>
                                                            {p.notes}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)' }}>None</span>
                                                    )}
                                                </td>
                                                <td style={{ fontWeight: 500 }}>{p.owner_name}</td>
                                                <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{format(new Date(p.created_at), 'MMM d, yyyy')}</td>
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

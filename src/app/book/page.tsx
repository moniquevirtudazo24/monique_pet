'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'
import { SERVICES, PET_TYPES, Pet } from '@/lib/types'

type Step = 1 | 2 | 3

export default function BookPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>(1)
    const [pets, setPets] = useState<Pet[]>([])
    const [userId, setUserId] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    // Step 1 - Pet selection or new pet
    const [selectedPetId, setSelectedPetId] = useState<string | 'new'>('new')
    const [newPet, setNewPet] = useState({ name: '', type: 'Dog', breed: '', notes: '' })

    // Step 2 - Service
    const [service, setService] = useState(SERVICES[0])

    // Step 3 - Date/Time
    const [date, setDate] = useState('')
    const [time, setTime] = useState('10:00')

    useEffect(() => {
        async function load() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }
            setUserId(user.id)
            const { data: petsData } = await supabase.from('pets').select('*').eq('owner_id', user.id)
            setPets(petsData || [])
            if (petsData && petsData.length > 0) setSelectedPetId(petsData[0].id)
        }
        load()
    }, [router])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const supabase = createClient()
        let petId = selectedPetId

        if (selectedPetId === 'new') {
            if (!newPet.name) { setError('Please enter a pet name.'); setLoading(false); return }
            const { data: createdPet, error: petErr } = await supabase
                .from('pets')
                .insert({ owner_id: userId, ...newPet })
                .select()
                .single()
            if (petErr || !createdPet) { setError(`Failed to save pet information: ${petErr?.message || 'Unknown'}`); setLoading(false); return }
            petId = createdPet.id
        }

        const scheduledAt = new Date(`${date}T${time}:00`).toISOString()

        const { error: apptErr } = await supabase.from('appointments').insert({
            pet_id: petId,
            owner_id: userId,
            service,
            scheduled_at: scheduledAt,
            status: 'pending',
            admin_notes: '',
        })

        if (apptErr) { setError('Failed to book appointment. Please try again.'); setLoading(false); return }

        setSuccess(true)
        setLoading(false)
    }

    if (success) {
        return (
            <>
                <Navbar />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem' }}>
                    <div style={{ textAlign: 'center', maxWidth: 400 }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-bg)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--green)' }}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Appointment Booked!</h2>
                        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Your appointment is pending admin confirmation. You will receive an email notification once it is reviewed.</p>
                        <Link href="/dashboard" className="btn btn-primary">View My Appointments</Link>
                    </div>
                </div>
            </>
        )
    }

    const minDate = new Date().toISOString().split('T')[0]

    return (
        <>
            <Navbar />
            <div className="page-container" style={{ maxWidth: 640 }}>
                {/* Progress */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2rem' }}>
                    {([1, 2, 3] as Step[]).map((s, i) => (
                        <>
                            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', flex: 1 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.3s',
                                    background: step >= s ? 'var(--gold)' : 'var(--navy-border)',
                                    color: step >= s ? 'var(--navy)' : 'var(--text-muted)',
                                }}>
                                    {step > s ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    ) : s}
                                </div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: step >= s ? 'var(--gold)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {['Pet Info', 'Service', 'Schedule'][i]}
                                </span>
                            </div>
                            {i < 2 && <div key={`line-${s}`} style={{ height: 1, flex: 2, background: step > s ? 'var(--gold)' : 'var(--navy-border)', marginTop: -20, transition: 'background 0.3s' }} />}
                        </>
                    ))}
                </div>

                <div className="card">
                    {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}

                    {/* Step 1 - Pet */}
                    {step === 1 && (
                        <div>
                            <h3 style={{ marginBottom: '1.25rem' }}>Pet Information</h3>
                            {pets.length > 0 && (
                                <div className="form-group">
                                    <label className="form-label">Select a Pet</label>
                                    <select className="form-select" value={selectedPetId} onChange={e => setSelectedPetId(e.target.value as string | 'new')}>
                                        {pets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
                                        <option value="new">+ Add a new pet</option>
                                    </select>
                                </div>
                            )}

                            {(selectedPetId === 'new' || pets.length === 0) && (
                                <>
                                    <div className="grid-2">
                                        <div className="form-group">
                                            <label className="form-label">Pet Name</label>
                                            <input className="form-input" placeholder="Max" value={newPet.name}
                                                onChange={e => setNewPet(p => ({ ...p, name: e.target.value }))} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Pet Type</label>
                                            <select className="form-select" value={newPet.type} onChange={e => setNewPet(p => ({ ...p, type: e.target.value }))}>
                                                {PET_TYPES.map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Breed (optional)</label>
                                        <input className="form-input" placeholder="Golden Retriever" value={newPet.breed}
                                            onChange={e => setNewPet(p => ({ ...p, breed: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Special Notes (optional)</label>
                                        <textarea className="form-textarea" placeholder="Allergies, temperament, etc." value={newPet.notes}
                                            onChange={e => setNewPet(p => ({ ...p, notes: e.target.value }))} />
                                    </div>
                                </>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button className="btn btn-primary" onClick={() => setStep(2)}>
                                    Next: Choose Service
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2 - Service */}
                    {step === 2 && (
                        <div>
                            <h3 style={{ marginBottom: '1.25rem' }}>Choose a Service</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {SERVICES.map(s => (
                                    <button key={s} onClick={() => setService(s)} style={{
                                        padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: `2px solid ${service === s ? 'var(--gold)' : 'var(--navy-border)'}`,
                                        background: service === s ? 'var(--gold-muted)' : 'var(--navy-light)',
                                        color: service === s ? 'var(--gold)' : 'var(--text-secondary)',
                                        cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', textAlign: 'center', transition: 'all 0.2s',
                                    }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
                                <button className="btn btn-primary" onClick={() => setStep(3)}>Next: Schedule</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3 - Date/Time */}
                    {step === 3 && (
                        <form onSubmit={handleSubmit}>
                            <h3 style={{ marginBottom: '1.25rem' }}>Select Date &amp; Time</h3>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Preferred Date</label>
                                    <input type="date" className="form-input" min={minDate} value={date}
                                        onChange={e => setDate(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Preferred Time</label>
                                    <select className="form-select" value={time} onChange={e => setTime(e.target.value)} required>
                                        {['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map(t => (
                                            <option key={t} value={t}>{new Date(`2000-01-01T${t}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Summary */}
                            <div style={{ background: 'var(--navy-light)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginTop: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Appointment Summary</p>
                                <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {(() => {
                                        const p = selectedPetId === 'new' ? newPet : pets.find(x => x.id === selectedPetId)
                                        return p ? (
                                            <>
                                                <span>Pet: <strong style={{ color: 'var(--text-primary)' }}>{p.name}</strong> ({p.type}{p.breed ? ` - ${p.breed}` : ''})</span>
                                                {p.notes && <span>Notes: <strong style={{ color: 'var(--text-primary)' }}>{p.notes}</strong></span>}
                                            </>
                                        ) : null
                                    })()}
                                    <span>Service: <strong style={{ color: 'var(--text-primary)' }}>{service}</strong></span>
                                    {date && <span>Date: <strong style={{ color: 'var(--text-primary)' }}>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(`2000-01-01T${time}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
                                <button type="submit" className="btn btn-primary" disabled={loading || !date}>
                                    {loading ? <span className="spinner" /> : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}

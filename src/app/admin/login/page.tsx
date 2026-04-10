'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AdminLoginPage() {
    const router = useRouter()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const supabase = createClient()
        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
        })

        if (authError || !data.user) {
            setError(authError?.message || 'Invalid credentials.')
            setLoading(false)
            return
        }

        // Verify admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            await supabase.auth.signOut()
            setError('Access denied. This login is for staff only.')
            setLoading(false)
            return
        }

        router.push('/admin')
        router.refresh()
    }

    return (
        <div className="auth-container" style={{ background: '#0a0a0a' }}>
            <div className="auth-box">
                <div className="card" style={{ padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', borderRadius: '16px', border: '1px solid #262626', background: '#121212' }}>
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <img src="/logo.png" alt="PawCare Admin" style={{ height: '80px', width: 'auto', display: 'block', margin: '0 auto 1.5rem', filter: 'invert(1) hue-rotate(180deg)', mixBlendMode: 'screen' }} />
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#fafafa', margin: 0, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Welcome, Admin</h1>
                        <p style={{ color: '#a3a3a3', fontSize: '0.95rem', margin: 0 }}>Secure portal access</p>
                    </div>

                    {error && <div className="alert alert-error" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <input id="admin-email" type="email" className="form-input" placeholder="Admin Email" value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                                style={{ borderRadius: '8px', padding: '1rem', background: '#fafafa', border: 'none', color: '#171717', fontSize: '1rem' }} />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                            <div style={{ position: 'relative' }}>
                                <input id="admin-password" type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Password" value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
                                    style={{ borderRadius: '8px', padding: '1rem', paddingRight: '3rem', background: '#fafafa', border: 'none', color: '#171717', fontSize: '1rem' }} />
                                <button type="button" onClick={() => setShowPassword(v => !v)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#737373' }}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                    {showPassword
                                        ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                        : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    }
                                </button>
                            </div>
                        </div>
                        <button id="admin-submit" type="submit" className="btn" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', borderRadius: '8px', fontWeight: 600, background: '#c9a84c', color: '#171717', border: 'none' }} disabled={loading}>
                            {loading ? <span className="spinner" style={{ borderTopColor: '#171717', borderColor: 'rgba(23,23,23,0.3)' }} /> : 'Log In'}
                        </button>
                    </form>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem' }}>
                    <Link href="/login" className="auth-link" style={{ color: '#64748b', textDecoration: 'none' }}>Customer Login</Link>
                </div>
            </div>
        </div>
    )
}

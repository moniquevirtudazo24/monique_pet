'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (form.password !== form.confirm) {
            setError('Passwords do not match.')
            return
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }

        setLoading(true)
        const supabase = createClient()

        const { data, error: authError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: { data: { full_name: form.full_name, phone: form.phone } },
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        if (data.user) {
            await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: form.full_name,
                email: form.email,
                phone: form.phone,
                role: 'customer',
            })
        }

        router.push('/dashboard')
        router.refresh()
    }

    return (
        <div className="auth-container">
            <div className="auth-box" style={{ maxWidth: 480 }}>
                <div className="auth-logo">
                    <img src="/logo.png" alt="PawCare" style={{ height: '96px', width: 'auto', marginBottom: '1.25rem', margin: '0 auto', display: 'block', mixBlendMode: 'multiply', opacity: 0.9 }} />
                    <div className="auth-title">Create your account</div>
                    <div className="auth-subtitle">Start booking grooming appointments today</div>
                </div>

                <div className="card">
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input id="reg-name" type="text" className="form-input" placeholder="Maria Santos" value={form.full_name}
                                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com" value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input id="reg-phone" type="tel" className="form-input" placeholder="+63 900 000 0000" value={form.phone}
                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
                        </div>
                        <div className="grid-2" style={{ gap: '0.75rem' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input id="reg-password" type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Min. 6 characters" value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required style={{ paddingRight: '2.75rem' }} />
                                    <button type="button" onClick={() => setShowPassword(v => !v)}
                                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                        {showPassword
                                            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        }
                                    </button>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input id="reg-confirm" type={showConfirm ? 'text' : 'password'} className="form-input" placeholder="Repeat password" value={form.confirm}
                                        onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required style={{ paddingRight: '2.75rem' }} />
                                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', alignItems: 'center' }}
                                        aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                                        {showConfirm
                                            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button id="reg-submit" type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', marginTop: '1.25rem' }} disabled={loading}>
                            {loading ? <span className="spinner" /> : 'Create Account'}
                        </button>
                    </form>
                    <hr className="divider" />
                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link href="/login" className="auth-link">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

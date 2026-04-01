'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
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
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        router.push('/dashboard')
        router.refresh()
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-logo">
                    <div className="auth-logo-icon" style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                            <ellipse cx="6" cy="6.5" rx="2" ry="2.5" /><ellipse cx="10.5" cy="4" rx="2" ry="2.5" />
                            <ellipse cx="15" cy="6.5" rx="2" ry="2.5" /><ellipse cx="18.5" cy="10.5" rx="1.8" ry="2.2" />
                            <path d="M12 10c-3 0-6 2.5-6 5 0 2 1.5 4 3 4.5.8.3 1.8 0 3 0s2.2.3 3 0c1.5-.5 3-2.5 3-4.5 0-2.5-3-5-6-5z" />
                        </svg>
                    </div>
                    <div className="auth-title">Welcome back</div>
                    <div className="auth-subtitle">Sign in to manage your appointments</div>
                </div>

                <div className="card">
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                id="login-email"
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    required
                                    style={{ paddingRight: '2.75rem' }}
                                />
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
                        <button id="login-submit" type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', marginTop: '0.5rem' }} disabled={loading}>
                            {loading ? <span className="spinner" /> : 'Sign In'}
                        </button>
                    </form>

                    <hr className="divider" />
                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Do not have an account?{' '}
                        <Link href="/register" className="auth-link">Create one</Link>
                    </p>
                </div>

                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Staff?{' '}
                    <Link href="/admin/login" className="auth-link" style={{ fontSize: '0.8rem' }}>Admin Login</Link>
                </p>
            </div>
        </div>
    )
}

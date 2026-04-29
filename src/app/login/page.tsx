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

        // BYPASS FOR TESTING
        if (form.email === 'user@pawcare.com' || form.email === 'user2@pawcare.com') {
            document.cookie = "demo_admin=true; path=/; max-age=3600";
            router.push('/dashboard')
            return;
        }

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
        <div className="auth-container" style={{ background: '#f8fafc' }}>
            <div className="auth-box">
                <div className="card" style={{ padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', borderRadius: '16px', border: 'none', background: '#ffffff' }}>
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <img src="/logo.png" alt="PawCare" style={{ height: '70px', width: 'auto', margin: '0 auto 1.5rem', display: 'block' }} />
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Welcome back</h1>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem' }}>Please enter your details</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <input
                                id="login-email"
                                type="email"
                                className="form-input"
                                placeholder="Email"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                required
                                style={{ borderRadius: '8px', padding: '0.875rem 1rem' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    required
                                    style={{ borderRadius: '8px', padding: '0.875rem 1rem', paddingRight: '2.75rem' }}
                                />
                                <button type="button" onClick={() => setShowPassword(v => !v)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                    {showPassword
                                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    }
                                </button>
                            </div>
                        </div>
                        <button id="login-submit" type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem', borderRadius: '8px', fontWeight: 600 }} disabled={loading}>
                            {loading ? <span className="spinner" /> : 'Log In'}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                        <Link href="/register" className="auth-link" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Create Account</Link>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem' }}>
                    <Link href="/admin/login" className="auth-link" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin Login</Link>
                </div>
            </div>
        </div>
    )
}

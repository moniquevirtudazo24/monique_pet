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
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-logo">
                    <div className="auth-logo-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <polyline points="9 12 11 14 15 10" />
                        </svg>
                    </div>
                    <div className="auth-title">Staff Portal</div>
                    <div className="auth-subtitle">Sign in with your administrator credentials</div>
                </div>

                <div className="card">
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input id="admin-email" type="email" className="form-input" placeholder="admin@pawcare.com" value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input id="admin-password" type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Enter your password" value={form.password}
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
                        <button id="admin-submit" type="submit" className="btn" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', marginTop: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff' }} disabled={loading}>
                            {loading ? <span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> : 'Sign In to Staff Portal'}
                        </button>
                    </form>
                    <hr className="divider" />
                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Are you a customer?{' '}
                        <Link href="/login" className="auth-link">Customer Login</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

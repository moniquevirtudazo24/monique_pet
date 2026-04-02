'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const PawIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="6" cy="6.5" rx="2" ry="2.5" />
        <ellipse cx="10.5" cy="4" rx="2" ry="2.5" />
        <ellipse cx="15" cy="6.5" rx="2" ry="2.5" />
        <ellipse cx="18.5" cy="10.5" rx="1.8" ry="2.2" />
        <path d="M12 10c-3 0-6 2.5-6 5 0 2 1.5 4 3 4.5.8.3 1.8 0 3 0s2.2.3 3 0c1.5-.5 3-2.5 3-4.5 0-2.5-3-5-6-5z" />
    </svg>
)
const AppointmentsNavIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
)
const BookNavIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
)
const SignOutNavIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
)

export default function Navbar({ role }: { role?: string }) {
    const router = useRouter()
    const pathname = usePathname()

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    if (role === 'admin') {
        return (
            <nav className="navbar">
                <div className="navbar-brand" style={{ gap: '0.875rem', alignItems: 'center' }}>
                    <img src="/logo.png" alt="PawCare" style={{ height: '64px', width: 'auto', mixBlendMode: 'multiply' }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>Admin Portal</span>
                </div>
            </nav>
        )
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand" style={{ gap: '0.875rem', alignItems: 'center' }}>
                <img src="/logo.png" alt="PawCare" style={{ height: '64px', width: 'auto', mixBlendMode: 'multiply' }} />
            </div>
            <div className="navbar-spacer" />
            <div className="navbar-links">
                <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AppointmentsNavIcon /> My Appointments
                </Link>
                <Link href="/book" className={`nav-link ${pathname === '/book' ? 'active' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <BookNavIcon /> Book Now
                </Link>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.375rem 0.875rem', marginLeft: '0.5rem', gap: '0.4rem' }} onClick={handleLogout}>
                <SignOutNavIcon /> Sign Out
            </button>
        </nav>
    )
}

import Link from 'next/link'

const PawIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="6" cy="6.5" rx="2" ry="2.5" />
    <ellipse cx="10.5" cy="4" rx="2" ry="2.5" />
    <ellipse cx="15" cy="6.5" rx="2" ry="2.5" />
    <ellipse cx="18.5" cy="10.5" rx="1.8" ry="2.2" />
    <path d="M12 10c-3 0-6 2.5-6 5 0 2 1.5 4 3 4.5.8.3 1.8 0 3 0s2.2.3 3 0c1.5-.5 3-2.5 3-4.5 0-2.5-3-5-6-5z" />
  </svg>
)

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--navy)', overflowX: 'hidden' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-brand-icon" style={{ color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PawIcon /></div>
          PawCare
        </div>
        <div className="navbar-spacer" />
        <div className="navbar-links">
          <Link href="/login" className="nav-link">Sign In</Link>
          <Link href="/register" className="btn btn-primary" style={{ marginLeft: '0.5rem', padding: '0.5rem 1.125rem' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '6rem 1.5rem 4rem',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%), var(--navy)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(201,168,76,0.03)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '0', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(59,130,246,0.03)', filter: 'blur(100px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--gold-muted)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 100, padding: '0.375rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold)', marginBottom: '1.5rem' }}>
            Professional Pet Grooming Services
          </div>
          <h1 style={{ marginBottom: '1.25rem', background: 'linear-gradient(135deg, #fff 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Premium Grooming for<br />Your Beloved Pet
          </h1>
          <p style={{ fontSize: '1.1rem', maxWidth: 520, margin: '0 auto 2.5rem' }}>
            Book professional grooming appointments online. Receive real-time status updates and email confirmations.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              Book an Appointment
            </Link>
            <Link href="/login" className="btn btn-outline" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div className="grid-3" style={{ gap: '1.25rem' }}>
          {[
            { icon: 'S', title: 'Easy Scheduling', desc: 'Choose your preferred date, time, and service in just a few clicks.' },
            { icon: 'E', title: 'Email Notifications', desc: 'Receive instant email updates when your appointment is approved, rejected, or rescheduled.' },
            { icon: 'R', title: 'Real-Time Status', desc: 'Track your appointment status — pending, approved, or rejected — at any time.' },
          ].map(f => (
            <div key={f.title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gold-muted)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontWeight: 800, fontSize: '1rem' }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ marginBottom: '0.375rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section style={{ padding: '2rem 1.5rem 5rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Our Services</h2>
        <p style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>Tailored grooming options for every breed and coat type.</p>
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {['Full Grooming', 'Bath & Dry', 'Haircut Only', 'Nail Trimming', 'Teeth Cleaning', 'Ear Cleaning', 'De-shedding Treatment'].map(s => (
            <div key={s} style={{ background: 'var(--navy-card)', border: '1px solid var(--navy-border)', borderRadius: 'var(--radius-sm)', padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {s}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--navy-border)', padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        &copy; {new Date().getFullYear()} PawCare. All rights reserved.
      </footer>
    </main>
  )
}

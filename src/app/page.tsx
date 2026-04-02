import Link from 'next/link'
import { Leaf, Bath, Scissors, Citrus, Smile, Ear, Waves } from 'lucide-react'

// A stylized low-poly dog graphic similar to the mockup
const GeometricDog = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', maxWidth: '500px' }}>
    <g stroke="#cbd5e1" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.6">
      {/* Head and Ears */}
      <path d="M140 50 L150 40 L160 55 L170 65 L175 75 L165 85 L145 75 Z" />
      <path d="M140 50 L145 35 L155 45" />
      <path d="M160 55 L165 45 L175 60 Z" />
      
      {/* Body */}
      <path d="M145 75 L150 110 L160 160 L145 160 L135 120 L110 120 L105 160 L90 160 L95 110 L70 90 L40 90 L30 85 L45 75 L70 80 L100 80 L140 50 Z" />
      
      {/* Inner geometric lines */}
      <path d="M100 80 L110 120" />
      <path d="M135 120 L150 110" />
      <path d="M70 80 L95 110" />
      <path d="M70 90 L105 160" />
      <path d="M135 120 L145 160" />
      <path d="M145 75 L135 120" />
      <path d="M100 80 L135 120" />
      <path d="M45 75 L70 90" />
      
      {/* Back legs detail */}
      <path d="M95 110 L85 140" />
      <path d="M85 140 L90 160" />
      <path d="M105 160 L115 140" />
      <path d="M115 140 L110 120" />

      {/* Front legs detail */}
      <path d="M135 120 L130 145" />
      <path d="M130 145 L145 160" />
      <path d="M150 110 L155 135" />
      <path d="M155 135 L160 160" />
      
      {/* Tail */}
      <path d="M45 75 L30 65 L40 90" />
    </g>
  </svg>
)

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 3rem', maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 800, textDecoration: 'none', color: '#0f172a' }}>
            PawCare
          </Link>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#services" style={{ fontSize: '0.85rem', color: '#475569', textDecoration: 'none' }}>Services</a>
            <a href="#about" style={{ fontSize: '0.85rem', color: '#475569', textDecoration: 'none' }}>About</a>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/login" style={{ fontSize: '0.85rem', color: '#475569', textDecoration: 'none', fontWeight: 500 }}>
            Log In
          </Link>
          <Link href="/register" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '0.5rem 1.25rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textDecoration: 'none' }}>
            SIGN UP
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ display: 'flex', alignItems: 'center', padding: '4rem 3rem 6rem', maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ flex: 1, paddingRight: '2rem' }}>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em', color: '#0f172a' }}>
            Exceptional Care<br />
            for Your<br />
            <span style={{ color: '#64748b' }}>Exceptional</span><br />
            Companions.
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#334155', maxWidth: '480px', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Simple, elegant appointment booking for grooming, vaccinations, and wellness checks.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/register" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '0.875rem 2rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textDecoration: 'none' }}>
              GET STARTED
            </Link>
            <Link href="#services" style={{ backgroundColor: '#e2e8f0', color: '#64748b', padding: '0.875rem 2rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textDecoration: 'none' }}>
              VIEW SERVICES
            </Link>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <GeometricDog />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{ backgroundColor: '#f8fafc', padding: '6rem 3rem' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Our Services</h2>
          <p style={{ fontSize: '1rem', color: '#475569', marginBottom: '3rem' }}>Tailored grooming options for every breed and coat type.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            
            {/* Cards */}
            <ServiceCard 
              icon={<Leaf size={24} color="#7dd3fc" />} 
              title="Full Grooming" 
              desc="Comprehensive care including bath, haircut, nail trimming, and ear cleaning for total rejuvenation." 
            />
            <ServiceCard 
              icon={<Bath size={24} color="#7dd3fc" />} 
              title="Bath & Dry" 
              desc="Gentle cleaning with premium organic shampoos followed by a stress-free blow dry." 
            />
            <ServiceCard 
              icon={<Scissors size={24} color="#7dd3fc" />} 
              title="Haircut Only" 
              desc="Precision styling and trimming to maintain your pet's architectural silhouette." 
            />
            <ServiceCard 
              icon={<Citrus size={24} color="#7dd3fc" />} 
              title="Nail Trimming" 
              desc="Safe and precise clipping or grinding to ensure comfort and healthy posture." 
            />
            <ServiceCard 
              icon={<Smile size={24} color="#7dd3fc" />} 
              title="Teeth Cleaning" 
              desc="Professional plaque removal and oral hygiene checks for a healthy, vibrant smile." 
            />
            <ServiceCard 
              icon={<Ear size={24} color="#7dd3fc" />} 
              title="Ear Cleaning" 
              desc="Meticulous cleaning of the ear canal to prevent infections and maintain comfort." 
            />
            <ServiceCard 
              icon={<Waves size={24} color="#7dd3fc" />} 
              title="De-shedding Treatment" 
              desc="Specialized technique to remove loose undercoat, significantly reducing home shedding." 
            />
            
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{ backgroundColor: '#ffffff', padding: '6rem 3rem' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', gap: '4rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>About PawCare</h2>
            <p style={{ fontSize: '1.125rem', color: '#475569', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              At PawCare, we believe every pet deserves to be treated with love, patience, and the highest standard of grooming care. Founded by passionate animal lovers, our facility is designed to be a stress-free, luxurious environment for your furry companions.
            </p>
            <p style={{ fontSize: '1.125rem', color: '#475569', lineHeight: 1.8 }}>
              From organic shampoos to precision styling, our experienced groomers are dedicated to enhancing both the health and happiness of your pets. We take pride in building trusting relationships with every animal that walks through our doors.
            </p>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '500px', height: '400px', backgroundColor: '#f8fafc', borderRadius: '24px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <img src="/pets_cartoon.png" alt="Happy Cat and Dog" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f172a', padding: '3rem', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>PawCare</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>&copy; 2024 PawCare. Architectural Pet Excellence.</div>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
            <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link>
            <Link href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Cookies</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

function ServiceCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>{title}</h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, flex: 1 }}>{desc}</p>
      <div style={{ marginTop: '2rem', width: '2rem', height: '3px', backgroundColor: '#e0f2fe' }}></div>
    </div>
  )
}

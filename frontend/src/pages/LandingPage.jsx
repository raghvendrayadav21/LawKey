import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  Scale, Users, ShieldCheck, ChevronRight, Star,
  Search, MessageSquare, CheckCircle, Award, Clock, Building2,
  Briefcase, Home, Shield, FileText, Heart, Globe
} from 'lucide-react';

const TYPING_WORDS = ['Criminal Defense', 'Corporate Law', 'Family Disputes', 'Property Law', 'Civil Rights'];

function useTyping(words, speed = 80, pause = 1800) {
  const [display, setDisplay] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wordIdx % words.length];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(word.slice(0, display.length + 1));
        if (display.length + 1 === word.length) setTimeout(() => setDeleting(true), pause);
      } else {
        setDisplay(word.slice(0, display.length - 1));
        if (display.length - 1 === 0) { setDeleting(false); setWordIdx(i => i + 1); }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [display, deleting, wordIdx]);
  return display;
}

function useCountUp(target, duration = 1800, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const t = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [active, target]);
  return count;
}

const SPECIALIZATIONS = [
  { icon: <Shield size={24}/>, label: 'Criminal Law', color: '#EF4444' },
  { icon: <Briefcase size={24}/>, label: 'Corporate Law', color: '#5B4AE8' },
  { icon: <Home size={24}/>, label: 'Property Law', color: '#10B981' },
  { icon: <Heart size={24}/>, label: 'Family Law', color: '#EC4899' },
  { icon: <FileText size={24}/>, label: 'Civil Rights', color: '#F59E0B' },
  { icon: <Globe size={24}/>, label: 'Immigration', color: '#0EA5E9' },
];

const FAQ_ITEMS = [
  { q: 'How do I hire a lawyer on LawKey?', a: 'Search by specialization, view lawyer profiles, then click "Hire Lawyer" to propose a deal. The lawyer reviews and accepts your proposal.' },
  { q: 'Are the lawyers on LawKey verified?', a: 'Yes! All lawyers go through a registration process and provide their credentials before being listed on the platform.' },
  { q: 'Can I chat with the lawyer after hiring?', a: 'Absolutely! Once a deal is accepted, a private chat opens between you and your lawyer directly on the platform.' },
  { q: 'Is my personal information secure?', a: 'Yes. We use industry-standard encryption to protect all your data, communications, and legal documents.' },
  { q: 'What if I want to cancel a deal?', a: 'You can discuss cancellation terms with your lawyer through the chat. Deal status changes are managed transparently on the platform.' },
];

const FEATURES = [
  {
    icon: <Users size={28} />,
    iconClass: 'icon-primary',
    title: 'Top Professionals',
    desc: 'Browse through hundreds of highly qualified, vetted legal experts across various practice areas.',
  },
  {
    icon: <Scale size={28} />,
    iconClass: 'icon-secondary',
    title: 'Secure Deals',
    desc: 'Propose, negotiate, and confirm hiring contracts directly inside the platform with full transparency.',
  },
  {
    icon: <ShieldCheck size={28} />,
    iconClass: 'icon-gold',
    title: 'Privacy Guaranteed',
    desc: 'Your data, communications, and legal inquiries are protected with industry-standard encryption.',
  },
];

const STEPS = [
  {
    n: '1',
    icon: <Search size={20} />,
    title: 'Search',
    desc: 'Use our advanced filters to find lawyers by specialization, location, and fees.',
  },
  {
    n: '2',
    icon: <MessageSquare size={20} />,
    title: 'Connect',
    desc: 'Send a detailed case description and propose a deal directly through their profile.',
  },
  {
    n: '3',
    icon: <CheckCircle size={20} />,
    title: 'Hire & Resolve',
    desc: 'Once accepted, your deal is formalized and you can begin resolving your legal matters.',
  },
];

const TESTIMONIALS = [
  {
    stars: 5,
    text: '"LawKey helped me find an exceptional corporate attorney in under 48 hours. The process was seamless and professional."',
    name: 'Sarah M.',
    role: 'Business Owner',
  },
  {
    stars: 5,
    text: '"As a lawyer, this platform has connected me with clients I would never have reached otherwise. Highly recommend!"',
    name: 'James K., Esq.',
    role: 'Criminal Defense Attorney',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(o => !o)} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', padding: '1.1rem 0' }}>
      <div className="flex justify-between items-center">
        <span style={{ fontWeight: 600, fontSize: '0.975rem', color: 'var(--text-main)' }}>{q}</span>
        <span style={{ fontSize: '1.2rem', color: 'var(--primary)', transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </div>
      {open && <p style={{ margin: '0.6rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{a}</p>}
    </div>
  );
}

export default function LandingPage() {
  const typedWord = useTyping(TYPING_WORDS);
  const [statsActive, setStatsActive] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const statsRef = useRef(null);
  const c1 = useCountUp(5000, 1800, statsActive);
  const c2 = useCountUp(98, 1400, statsActive);
  const c3 = useCountUp(10, 1600, statsActive);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsActive(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--background)', overflowX: 'hidden' }}>

      {/* ── HERO ─────────────────────────────────────── */}
      <section
        style={{
          padding: '6rem 0 4rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, var(--background) 0%, var(--background-alt) 100%)',
        }}
      >
        {/* Floating blobs */}
        <div className="blob blob-primary" style={{ width: 500, height: 500, top: '-15%', left: '-10%' }} />
        <div className="blob blob-secondary" style={{ width: 400, height: 400, bottom: '-10%', right: '-8%', animationDelay: '4s' }} />
        <div className="blob blob-accent" style={{ width: 300, height: 300, top: '30%', left: '55%', animationDelay: '2s' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="flex items-center gap-8 flex-wrap"
            style={{ flexDirection: 'row' }}
          >
            {/* Text Column */}
            <div style={{ flex: '1 1 480px', minWidth: 280 }}>
              <div className="animate-slide-up">
                <div className="section-label">
                  ⚖️ Trusted Legal Platform
                </div>
                <h1
                  className="display-title"
                  style={{ fontSize: 'clamp(2.4rem, 5vw, 3.75rem)', letterSpacing: '-1.5px', lineHeight: 1.08, marginBottom: '1.5rem' }}
                >
                  Find the Right{' '}
                  <span className="text-gradient" style={{ display: 'inline-block', minWidth: '2ch' }}>
                    {typedWord}<span style={{ borderRight: '3px solid var(--primary)', marginLeft: 2, animation: 'blink 0.8s step-end infinite' }}></span>
                  </span>
                  <br />Without the Hassle
                </h1>
                <p
                  style={{
                    fontSize: '1.175rem',
                    maxWidth: 520,
                    marginBottom: '2.5rem',
                    lineHeight: 1.7,
                    color: 'var(--text-muted)',
                  }}
                >
                  Connect with verified, highly-experienced lawyers, organize remote
                  consultations, and secure your legal future on one trusted platform.
                </p>

                <div className="flex gap-3 flex-wrap" style={{ marginBottom: '2rem' }}>
                  <Link to="/signup" className="btn btn-primary btn-lg">
                    Find a Lawyer <ChevronRight size={18} />
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-outline btn-lg"
                    style={{ backgroundColor: 'var(--surface)' }}
                  >
                    Join as a Lawyer
                  </Link>
                </div>

                <div className="flex gap-4 flex-wrap" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {['No hidden fees', 'Vetted Professionals', 'Secure Platform'].map(t => (
                    <div key={t} className="flex items-center gap-1">
                      <CheckCircle size={15} color="var(--secondary)" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero visual column */}
            <div
              className="animate-pop-in delay-300"
              style={{ flex: '1 1 380px', minWidth: 280, position: 'relative' }}
            >
              <div className="hero-image-wrapper" style={{ aspectRatio: '4/3' }}>
                <img
                  src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80"
                  alt="Professional lawyers in a modern office"
                  loading="lazy"
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(91,74,232,0.35) 0%, transparent 60%)',
                  }}
                />
              </div>

              {/* Floating badge — top left */}
              <div
                className="hero-image-badge animate-slide-up delay-500"
                style={{ position: 'absolute', top: '1rem', left: '-1rem' }}
              >
                <span style={{ fontSize: '1.5rem' }}>⭐</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    4.9/5 Rating
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    From 2,400+ clients
                  </div>
                </div>
              </div>

              {/* Floating badge — bottom right */}
              <div
                className="hero-image-badge animate-slide-up delay-600"
                style={{ position: 'absolute', bottom: '1rem', right: '-1rem' }}
              >
                <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    100% Secure
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    End-to-end encrypted
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} className="animate-fade-in delay-300" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '3.5rem 0' }}>
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 0 }}>
            {[
              { value: `${c1.toLocaleString()}+`, label: 'Verified Lawyers', icon: <Award size={20} color="var(--primary)" /> },
              { value: `${c2}%`, label: 'Success Rate', icon: <Star size={20} color="var(--gold)" /> },
              { value: `₹${c3}M+`, label: 'Secured in Deals', icon: <Building2 size={20} color="var(--secondary-hover)" /> },
              { value: '24/7', label: 'Platform Support', icon: <Clock size={20} color="var(--accent)" /> },
            ].map((s, i) => (
              <div key={s.label} className="stat-card" style={{ borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div className="flex justify-center items-center gap-2" style={{ marginBottom: '0.5rem' }}>{s.icon}</div>
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALIZATIONS ── */}
      <section style={{ padding: '5rem 0', background: 'var(--background)' }}>
        <div className="container">
          <div className="text-center mb-12">
            <div className="section-label" style={{ justifyContent: 'center' }}>Practice Areas</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', letterSpacing: '-0.5px' }}>Find a Lawyer by <span className="text-gradient">Specialization</span></h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem' }}>
            {SPECIALIZATIONS.map(s => (
              <Link to="/signup" key={s.label} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ textAlign: 'center', padding: '1.75rem 1rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.875rem', color: s.color }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{s.label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────── */}
      <section id="features" className="section">
        <div className="container">
          <div className="text-center mb-12">
            <div className="section-label" style={{ justifyContent: 'center' }}>
              Our Advantages
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
                letterSpacing: '-0.5px',
                marginBottom: '1rem',
              }}
            >
              Why Choose <span className="text-gradient">LawKey?</span>
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                maxWidth: 560,
                margin: '0 auto',
                color: 'var(--text-muted)',
              }}
            >
              We provide the tools and security you need to resolve legal matters
              effectively and efficiently.
            </p>
          </div>

          <div className="grid grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`card animate-slide-up delay-${(i + 1) * 100}`}
                style={{ textAlign: 'center', padding: '2.5rem 2rem' }}
              >
                <div className="flex justify-center">
                  <div className={`feature-icon-box ${f.iconClass}`}>{f.icon}</div>
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          background: 'linear-gradient(160deg, var(--background-alt) 0%, var(--background) 100%)',
          borderTop: '1px solid var(--border)',
          padding: '5rem 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="blob blob-primary" style={{ width: 350, height: 350, top: '-10%', right: '-5%', opacity: 0.07 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center mb-12">
            <div className="section-label" style={{ justifyContent: 'center' }}>
              Simple Process
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
                letterSpacing: '-0.5px',
                marginBottom: '1rem',
              }}
            >
              How It Works
            </h2>
            <p style={{ fontSize: '1.1rem', maxWidth: 500, margin: '0 auto', color: 'var(--text-muted)' }}>
              A simple, 3-step process to get the legal help you deserve.
            </p>
          </div>

          <div
            className="grid grid-cols-3"
            style={{ position: 'relative', gap: '2rem' }}
          >
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className={`text-center card animate-slide-up delay-${(i + 1) * 150}`}
                style={{ padding: '2.5rem 2rem', background: 'var(--surface)' }}
              >
                <div className="step-circle">{step.n}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                  {step.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS CAROUSEL ── */}
      <section style={{ padding: '5rem 0', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="text-center mb-12">
            <div className="section-label" style={{ justifyContent: 'center' }}>Testimonials</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', letterSpacing: '-0.5px' }}>Trusted by Thousands</h2>
          </div>
          <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
            <div className="card animate-fade-in" key={testimonialIdx} style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div className="flex gap-1 mb-4" style={{ justifyContent: 'center' }}>
                {Array.from({ length: TESTIMONIALS[testimonialIdx].stars }).map((_, j) => <Star key={j} size={18} fill="var(--gold)" color="var(--gold)" />)}
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-sub)', fontStyle: 'italic', marginBottom: '1.5rem' }}>{TESTIMONIALS[testimonialIdx].text}</p>
              <div className="flex items-center gap-3" style={{ justifyContent: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #7B68EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>{TESTIMONIALS[testimonialIdx].name[0]}</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{TESTIMONIALS[testimonialIdx].name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{TESTIMONIALS[testimonialIdx].role}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
              {TESTIMONIALS.map((_, i) => <button key={i} onClick={() => setTestimonialIdx(i)} style={{ width: i === testimonialIdx ? 24 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === testimonialIdx ? 'var(--primary)' : 'var(--border)', transition: 'all 0.3s' }} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '5rem 0', background: 'var(--background)', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="text-center mb-12">
            <div className="section-label" style={{ justifyContent: 'center' }}>FAQ</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', letterSpacing: '-0.5px' }}>Common <span className="text-gradient">Questions</span></h2>
          </div>
          <div className="card" style={{ padding: '1rem 2rem' }}>
            {FAQ_ITEMS.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #7B68EE 50%, #A855F7 100%)',
          color: 'white',
          padding: '5.5rem 0',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)',
          }}
        />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 'var(--radius-full)',
              padding: '0.4rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              color: 'white',
            }}
          >
            🚀 Join 10,000+ users today
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              color: 'white',
              marginBottom: '1rem',
              fontFamily: "'Playfair Display', serif",
              letterSpacing: '-0.5px',
            }}
          >
            Ready to get started?
          </h2>
          <p
            style={{
              fontSize: '1.175rem',
              opacity: 0.88,
              maxWidth: 540,
              margin: '0 auto 2.5rem auto',
              lineHeight: 1.6,
            }}
          >
            Create an account today and connect with thousands of legal professionals
            worldwide.
          </p>
          <Link
            to="/signup"
            className="btn"
            style={{
              background: 'white',
              color: 'var(--primary)',
              padding: '1rem 3rem',
              fontSize: '1.05rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            }}
          >
            Create Free Account <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer
        style={{
          background: 'var(--background)',
          borderTop: '1px solid var(--border)',
          padding: '3.5rem 0 2rem',
        }}
      >
        <div className="container">
          <div
            className="flex justify-between items-center flex-wrap gap-4"
            style={{ marginBottom: '2rem' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="navbar-brand-icon"
                style={{ width: 32, height: 32, borderRadius: 8 }}
              >
                <Scale size={16} color="white" />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                LawKey
              </span>
            </div>
            <div
              className="flex gap-6"
              style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}
            >
              {['Privacy Policy', 'Terms of Service', 'Contact Us'].map(l => (
                <a
                  key={l}
                  href="#"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.target.style.color = 'var(--primary)')}
                  onMouseLeave={e => (e.target.style.color = 'var(--text-muted)')}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>

          <div className="divider" />

          <div className="text-center" style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} LawKey. All rights reserved. Built with ⚖️ and ❤️
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import {
  Scale,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Layers,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe2,
  Users2,
  DollarSign,
} from 'lucide-react';

/* ─── tiny inline styles (no new CSS file needed) ─── */
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-14px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99,102,241,0.5); }
    70%  { transform: scale(1);    box-shadow: 0 0 0 18px rgba(99,102,241,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99,102,241,0); }
  }
  .anim-float      { animation: float 5s ease-in-out infinite; }
  .anim-fade-up    { animation: fadeUp 0.7s ease both; }
  .anim-delay-1    { animation-delay: 0.15s; }
  .anim-delay-2    { animation-delay: 0.30s; }
  .anim-delay-3    { animation-delay: 0.45s; }
  .anim-delay-4    { animation-delay: 0.60s; }
  .anim-pulse-ring { animation: pulse-ring 2.5s infinite; }
  .gradient-text {
    background: linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #38bdf8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .card-hover {
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  }
  .card-hover:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 60px -12px rgba(99,102,241,0.25);
    border-color: rgba(99,102,241,0.4);
  }
  .btn-primary {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    transition: all 0.25s ease;
    box-shadow: 0 8px 32px -4px rgba(99,102,241,0.45);
  }
  .btn-primary:hover {
    background: linear-gradient(135deg, #4338ca, #6d28d9);
    box-shadow: 0 12px 40px -4px rgba(99,102,241,0.6);
    transform: translateY(-2px);
  }
  .btn-secondary {
    transition: all 0.25s ease;
    border: 1px solid rgba(99,102,241,0.3);
  }
  .btn-secondary:hover {
    background: rgba(99,102,241,0.12);
    border-color: rgba(99,102,241,0.6);
    transform: translateY(-2px);
  }
  .glow-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    opacity: 0.18;
    pointer-events: none;
  }
  .hero-grid {
    background-image: linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px);
    background-size: 50px 50px;
  }
  .stat-card {
    background: rgba(15,23,42,0.7);
    border: 1px solid rgba(255,255,255,0.06);
    backdrop-filter: blur(12px);
  }
`;

const FEATURES = [
  {
    icon: Layers,
    color: 'indigo',
    title: 'Double-Entry Accounting',
    desc: 'Every transaction balanced to the penny. Full debit/credit ledger with real-time reconciliation.',
  },
  {
    icon: BarChart3,
    color: 'violet',
    title: 'Balance Sheet & P&L',
    desc: 'Auto-generated financial statements — Assets, Liabilities, Equity, Revenue, and Expenses.',
  },
  {
    icon: TrendingUp,
    color: 'sky',
    title: 'Cash Flow Analysis',
    desc: 'Track operating, investing, and financing activities with dynamic charts and drill-down reports.',
  },
  {
    icon: FileSpreadsheet,
    color: 'emerald',
    title: 'Ledger Management',
    desc: 'Complete audit trail for every account. Filter, search, and export your full transaction history.',
  },
  {
    icon: ShieldCheck,
    color: 'rose',
    title: 'Role-Based Access',
    desc: 'Admin, Accountant, and User roles. Fine-grained permissions keep sensitive data secure.',
  },
  {
    icon: Zap,
    color: 'amber',
    title: 'Real-Time Updates',
    desc: 'Dashboards refresh instantly. Always see your latest financial position without a page reload.',
  },
];

const STATS = [
  { icon: DollarSign, value: '₹0 Hidden Fees', label: 'Open & transparent pricing' },
  { icon: Users2,     value: 'Multi-User',      label: 'Team collaboration built-in' },
  { icon: Globe2,     value: '100% Secure',     label: 'JWT-authenticated API' },
  { icon: CheckCircle2, value: 'GAAP Ready',    label: 'Standards-compliant reports' },
];

const colorMap = {
  indigo:  { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)',  text: '#818cf8' },
  violet:  { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', text: '#a78bfa' },
  sky:     { bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.25)',  text: '#38bdf8' },
  emerald: { bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.25)',  text: '#34d399' },
  rose:    { bg: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.25)', text: '#fb7185' },
  amber:   { bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)',  text: '#fbbf24' },
};

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <style>{styles}</style>

      <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', fontFamily: 'inherit', overflowX: 'hidden' }}>

        {/* ── Navbar ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '64px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="anim-pulse-ring" style={{
              padding: '6px', borderRadius: '10px',
              background: 'rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Scale size={22} color="#818cf8" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#f1f5f9' }}>
              Equi<span style={{ color: '#818cf8' }}>Balance</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {user ? (
              <Link to="/dashboard" className="btn-primary" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 20px', borderRadius: '10px',
                color: '#fff', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
              }}>
                Dashboard <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" style={{
                  padding: '8px 18px', borderRadius: '10px',
                  color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
                }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 20px', borderRadius: '10px',
                  color: '#fff', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
                }}>
                  Get Started <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="hero-grid" style={{ position: 'relative', padding: '6rem 2rem 5rem', textAlign: 'center', overflow: 'hidden' }}>
          {/* background orbs */}
          <div className="glow-orb" style={{ width: 500, height: 500, background: '#4f46e5', top: '-100px', left: '-150px' }} />
          <div className="glow-orb" style={{ width: 400, height: 400, background: '#7c3aed', bottom: '-80px', right: '-100px' }} />
          <div className="glow-orb" style={{ width: 300, height: 300, background: '#0ea5e9', top: '60%', left: '50%', transform: 'translate(-50%,-50%)' }} />

          {/* badge */}
          <div className="anim-fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '999px', padding: '5px 16px',
            fontSize: '0.75rem', fontWeight: 600, color: '#a5b4fc', marginBottom: '1.5rem',
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            <Zap size={12} /> Enterprise Accounting Platform
          </div>

          <h1 className="anim-fade-up anim-delay-1 gradient-text" style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', fontWeight: 900,
            lineHeight: 1.08, letterSpacing: '-0.04em',
            marginBottom: '1.25rem', position: 'relative',
          }}>
            Your Finances,<br />Crystal Clear.
          </h1>

          <p className="anim-fade-up anim-delay-2" style={{
            maxWidth: '560px', margin: '0 auto 2.5rem',
            fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.7,
          }}>
            EquiBalance is a full-stack double-entry accounting system — Balance Sheets, P&amp;L,
            Cash Flow, and Ledgers, all in one beautifully integrated dashboard.
          </p>

          <div className="anim-fade-up anim-delay-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link to="/dashboard" className="btn-primary" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px', borderRadius: '12px',
                color: '#fff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
              }}>
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 32px', borderRadius: '12px',
                  color: '#fff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                }}>
                  Start Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 28px', borderRadius: '12px',
                  color: '#94a3b8', fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
                  background: 'rgba(30,41,59,0.5)',
                }}>
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* floating dashboard preview card */}
          <div className="anim-float anim-delay-4" style={{ marginTop: '4rem', position: 'relative', display: 'inline-block' }}>
            <div style={{
              background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '20px', padding: '1.5rem 2rem',
              maxWidth: '480px', margin: '0 auto',
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8), 0 0 60px -10px rgba(99,102,241,0.2)',
            }}>
              {/* mini bar chart bars */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px', marginBottom: '1rem' }}>
                {[55, 70, 48, 85, 62, 90, 72].map((h, i) => (
                  <div key={i} style={{
                    flex: 1,
                    height: `${h}%`,
                    borderRadius: '6px 6px 0 0',
                    background: i === 5
                      ? 'linear-gradient(to top, #4f46e5, #818cf8)'
                      : 'rgba(99,102,241,0.25)',
                    transition: 'height 0.3s ease',
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Net Profit</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>₹4,82,350</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Assets</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818cf8' }}>₹12,60,000</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Strip ── */}
        <section style={{ padding: '3rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={value} className="stat-card" style={{ borderRadius: '16px', padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                <Icon size={22} color="#818cf8" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '2px' }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section style={{ padding: '5rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f1f5f9', marginBottom: '0.75rem' }}>
              Everything you need to manage your books
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
              Purpose-built for accountants and business owners who want clarity, not complexity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map(({ icon: Icon, color, title, desc }) => {
              const c = colorMap[color];
              return (
                <div key={title} className="card-hover" style={{
                  background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(10px)',
                  border: `1px solid rgba(255,255,255,0.06)`,
                  borderRadius: '18px', padding: '1.75rem',
                }}>
                  <div style={{
                    display: 'inline-flex', padding: '10px',
                    borderRadius: '12px', background: c.bg, border: `1px solid ${c.border}`,
                    marginBottom: '1rem',
                  }}>
                    <Icon size={22} color={c.text} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', marginBottom: '0.5rem' }}>{title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.65 }}>{desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{
            maxWidth: '680px', margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(79,70,229,0.18) 0%, rgba(124,58,237,0.12) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '24px', padding: '3.5rem 2rem',
            boxShadow: '0 0 60px -20px rgba(99,102,241,0.3)',
          }}>
            <Scale size={40} color="#818cf8" style={{ margin: '0 auto 1.25rem' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
              Ready to balance your books?
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.7 }}>
              Join EquiBalance today and get instant access to all financial tools — no credit card required.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {user ? (
                <Link to="/dashboard" className="btn-primary" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 32px', borderRadius: '12px',
                  color: '#fff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                }}>
                  Open Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '14px 32px', borderRadius: '12px',
                    color: '#fff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                  }}>
                    Create Free Account <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn-secondary" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '14px 24px', borderRadius: '12px',
                    color: '#94a3b8', fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
                    background: 'rgba(30,41,59,0.5)',
                  }}>
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

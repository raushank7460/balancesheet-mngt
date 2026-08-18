import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  Mail,
  Phone,
  MapPin,
  X,
  GitBranch,
  ExternalLink,
  Shield,
  FileText,
  BookOpen,
  BarChart3,
  Layers,
} from 'lucide-react';

const FOOTER_LINKS = [
  {
    heading: 'Product',
    links: [
      { label: 'Dashboard',      to: '/dashboard' },
      { label: 'Balance Sheet',  to: '/dashboard/balance-sheet' },
      { label: 'Profit & Loss',  to: '/dashboard/profit-loss' },
      { label: 'Cash Flow',      to: '/dashboard/cash-flow' },
      { label: 'Account Ledger', to: '/dashboard/ledger' },
      { label: 'Reports',        to: '/dashboard/reports' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us',    href: '#' },
      { label: 'Blog',        href: '#' },
      { label: 'Careers',     href: '#' },
      { label: 'Press Kit',   href: '#' },
      { label: 'Contact Us',  href: '#' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Center',       href: '#' },
      { label: 'Documentation',     href: '#' },
      { label: 'API Reference',     href: '#' },
      { label: 'Release Notes',     href: '#' },
      { label: 'System Status',     href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy',    href: '#' },
      { label: 'Terms of Service',  href: '#' },
      { label: 'Cookie Policy',     href: '#' },
      { label: 'Data Processing',   href: '#' },
      { label: 'Security',          href: '#' },
    ],
  },
];

const BADGES = [
  { icon: Shield,    text: 'SOC 2 Type II' },
  { icon: FileText,  text: 'GAAP Compliant' },
  { icon: BookOpen,  text: 'Double-Entry' },
  { icon: BarChart3, text: 'Real-Time Reports' },
];

const SOCIALS = [
  { icon: ExternalLink, href: '#', label: 'LinkedIn' },
  { icon: X,           href: '#', label: 'Twitter'  },
  { icon: GitBranch,   href: '#', label: 'GitHub'   },
  

];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: '#020617',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      color: '#94a3b8',
      fontFamily: 'inherit',
    }}>

      {/* ── Main Footer Grid ── */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '3.5rem 2rem 2rem',
        display: 'grid',
        gridTemplateColumns: '1.6fr repeat(4, 1fr)',
        gap: '2.5rem',
      }}
        className="footer-grid"
      >
        {/* Brand column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{
              padding: '7px',
              borderRadius: '10px',
              background: 'rgba(99,102,241,0.2)',
              border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Scale size={20} color="#818cf8" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              Equi<span style={{ color: '#818cf8' }}>Balance</span>
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', lineHeight: 1.75, marginBottom: '1.5rem', color: '#64748b', maxWidth: '220px' }}>
            Enterprise-grade double-entry accounting and financial reporting — built for modern businesses.
          </p>
{/* support@equibalance.in */}
          {/* Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {[
              { icon: Mail,   text: 'raushank7460@gmail.com' },
              { icon: Phone,  text: '+91 82525 54564' },
              { icon: MapPin, text: 'Samastipur, Bihar, India' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
                <Icon size={13} color="#4f46e5" style={{ flexShrink: 0 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                style={{
                  width: '34px', height: '34px',
                  borderRadius: '8px',
                  background: 'rgba(30,41,59,0.8)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748b',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                  e.currentTarget.style.color = '#818cf8';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(30,41,59,0.8)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_LINKS.map(({ heading, links }) => (
          <div key={heading}>
            <h4 style={{
              fontSize: '0.7rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: '#f1f5f9', marginBottom: '1rem',
            }}>
              {heading}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {links.map(({ label, to, href }) => {
                const style = {
                  fontSize: '0.8rem', color: '#64748b',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  display: 'inline-block',
                };
                return (
                  <li key={label}>
                    {to ? (
                      <Link
                        to={to}
                        style={style}
                        onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
                        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        style={style}
                        onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
                        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                      >
                        {label}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Trust Badges Strip ── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '1rem 2rem',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', gap: '1rem',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {BADGES.map(({ icon: Icon, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(30,41,59,0.6)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '999px',
              padding: '5px 14px',
              fontSize: '0.72rem', fontWeight: 600,
              color: '#64748b',
            }}>
              <Icon size={12} color="#4f46e5" />
              {text}
            </div>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#334155' }}>
            <Layers size={12} color="#334155" />
            ISO/IEC 27001 Security Standards
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '1.25rem 2rem',
        display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between',
        gap: '0.75rem',
      }}>
        <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0 }}>
          © {year} EquiBalance Technologies Pvt. Ltd. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Settings', 'Sitemap'].map((text) => (
            <a
              key={text}
              href="#"
              style={{ fontSize: '0.72rem', color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#64748b'}
              onMouseLeave={e => e.currentTarget.style.color = '#334155'}
            >
              {text}
            </a>
          ))}
        </div>
      </div>

      {/* responsive grid style */}
      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 540px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}

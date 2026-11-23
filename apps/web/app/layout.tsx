import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthNav } from '@/components/auth-nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'KIKI Platform',
  description: 'Merchant SaaS platform foundation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
            <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#111827', textDecoration: 'none' }}>
              KIKI
            </Link>
            <nav style={{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/" style={{ color: '#374151', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
              <Link href="/demo" style={{ color: '#374151', textDecoration: 'none', fontWeight: 600 }}>Demo</Link>
              <Link href="/about" style={{ color: '#374151', textDecoration: 'none', fontWeight: 600 }}>About</Link>
              <AuthNav />
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'CopyrightStellar — Decentralized IP & Copyright Registry',
  description: 'Register, license, and protect your creative works on Stellar Soroban with cryptographic proof-of-existence, fractional co-ownership, and community-driven dispute resolution.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface-950 text-slate-100 antialiased">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#16162a',
              color: '#e0e7ff',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '0.75rem',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}

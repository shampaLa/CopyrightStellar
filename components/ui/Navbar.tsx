'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiOutlineDocumentText, HiOutlineShieldCheck, HiOutlineScale, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import { IoFingerPrintOutline } from 'react-icons/io5';
import { MdOutlineDashboard } from 'react-icons/md';
import { RiGroupLine } from 'react-icons/ri';
import WalletButton from '@/components/wallet/WalletButton';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: MdOutlineDashboard },
  { href: '/register', label: 'Register', icon: IoFingerPrintOutline },
  { href: '/verify', label: 'Verify', icon: HiOutlineShieldCheck },
  { href: '/portfolio', label: 'Portfolio', icon: HiOutlineDocumentText },
  { href: '/split', label: 'Split Sheet', icon: RiGroupLine },
  { href: '/licenses', label: 'Licenses', icon: HiOutlineScale },
  { href: '/disputes', label: 'Disputes', icon: HiOutlineScale },
  { href: '/transfer', label: 'Transfer', icon: HiOutlineCurrencyDollar },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-900/30 bg-surface-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-sm transition-transform group-hover:scale-110">
            ©
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="gradient-text">Copyright</span>
            <span className="text-slate-300">Stellar</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Wallet */}
        <WalletButton />
      </div>
    </nav>
  );
}

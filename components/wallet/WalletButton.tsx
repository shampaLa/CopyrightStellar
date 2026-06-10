'use client';

import { useState, useRef, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import { HiOutlineWallet } from 'react-icons/hi2';

export default function WalletButton() {
  const { publicKey, isConnected, balance, loading, error, connect, disconnect } = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isConnected) {
    return (
      <button
        id="wallet-connect-btn"
        onClick={() => connect()}
        disabled={loading}
        className="btn-primary flex items-center gap-2 text-sm"
      >
        <HiOutlineWallet className="w-4 h-4" />
        {loading ? 'Connecting…' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        id="wallet-dropdown-btn"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="btn-secondary flex items-center gap-2 text-sm"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-xs">{stellar.formatAddress(publicKey, 6, 4)}</span>
        <span className="text-xs text-brand-300 font-semibold">{balance} XLM</span>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-brand-900/30 bg-surface-900 p-2 shadow-xl shadow-black/40 animate-slide-up">
          <div className="px-3 py-2 border-b border-brand-900/20 mb-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Connected</p>
            <p className="text-xs text-slate-300 font-mono break-all mt-0.5">
              {publicKey}
            </p>
          </div>
          <button
            id="wallet-disconnect-btn"
            onClick={() => { disconnect(); setDropdownOpen(false); }}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}

      {error && !dropdownOpen && (
        <p className="absolute right-0 top-12 mt-1 max-w-xs text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

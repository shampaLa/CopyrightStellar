'use client';

import { useCallback, useEffect, useState } from 'react';
import { stellar } from '@/lib/stellar';

export function useWallet() {
  const [publicKey, setPublicKey] = useState('');
  const [walletId, setWalletId] = useState('freighter');
  const [balance, setBalance] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = useCallback(async (address: string) => {
    try {
      const { xlm } = await stellar.getBalance(address);
      setBalance(Number(xlm).toFixed(4));
    } catch {
      setBalance('0.00');
    }
  }, []);

  /* Restore from session on mount */
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('cs_wallet') : null;
    if (stored) {
      setPublicKey(stored);
      refreshBalance(stored);
    }
  }, [refreshBalance]);

  const connect = useCallback(async (id?: string) => {
    try {
      setLoading(true);
      setError(null);
      if (id) setWalletId(id);
      const key = await stellar.connectWallet(id);
      setPublicKey(key);
      sessionStorage.setItem('cs_wallet', key);
      await refreshBalance(key);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [refreshBalance]);

  const disconnect = useCallback(() => {
    stellar.disconnect();
    setPublicKey('');
    setBalance('0.00');
    setError(null);
    sessionStorage.removeItem('cs_wallet');
  }, []);

  // Poll balance every 10 seconds
  useEffect(() => {
    if (!publicKey) return;
    const interval = setInterval(() => {
      refreshBalance(publicKey);
    }, 10000);
    return () => clearInterval(interval);
  }, [publicKey, refreshBalance]);

  return {
    publicKey,
    isConnected: !!publicKey,
    walletId,
    balance,
    loading,
    error,
    connect,
    disconnect,
    refreshBalance: () => refreshBalance(publicKey),
  };
}

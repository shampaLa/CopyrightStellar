'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/layout/Footer';
import DropZone from '@/components/ui/DropZone';
import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import { COOWNERSHIP_CONTRACT_ID } from '@/lib/constants';
import * as StellarSdk from '@stellar/stellar-sdk';
import toast from 'react-hot-toast';
import { HiOutlinePlusCircle, HiOutlineMinusCircle, HiOutlineArrowPath } from 'react-icons/hi2';
import { RiGroupLine } from 'react-icons/ri';

interface Creator {
  address: string;
  share: number; // basis points (0-10000)
}

type TxStatus = 'idle' | 'signing' | 'polling' | 'success' | 'failed';

export default function SplitPage() {
  const { publicKey, isConnected } = useWallet();
  const [fileHash, setFileHash] = useState('');
  const [title, setTitle] = useState('');
  const [creators, setCreators] = useState<Creator[]>([
    { address: '', share: 6000 },
    { address: '', share: 4000 },
  ]);
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');

  const totalShares = creators.reduce((sum, c) => sum + c.share, 0);
  const isValid = fileHash && title && totalShares === 10000 && creators.every((c) => c.address && c.share > 0);

  const handleFileHashed = useCallback((hash: string) => {
    setFileHash(hash);
  }, []);

  const addCreator = useCallback(() => {
    setCreators((prev) => [...prev, { address: '', share: 0 }]);
  }, []);

  const removeCreator = useCallback((index: number) => {
    setCreators((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateCreator = useCallback((index: number, field: 'address' | 'share', value: string | number) => {
    setCreators((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: field === 'share' ? Number(value) : value } : c))
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isConnected || !isValid) return;

    try {
      setTxStatus('signing');

      const hashBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        hashBytes[i] = parseInt(fileHash.substring(i * 2, i * 2 + 2), 16);
      }

      const creatorAddresses = creators.map((c) =>
        StellarSdk.nativeToScVal(c.address, { type: 'address' })
      );
      const creatorShares = creators.map((c) =>
        StellarSdk.nativeToScVal(c.share, { type: 'u32' })
      );

      const args = [
        StellarSdk.xdr.ScVal.scvVec(creatorAddresses),
        StellarSdk.xdr.ScVal.scvVec(creatorShares),
        StellarSdk.xdr.ScVal.scvBytes(Buffer.from(hashBytes)),
        StellarSdk.nativeToScVal(title, { type: 'string' }),
      ];

      const { hash } = await stellar.buildAndSignTx({
        publicKey,
        contractId: COOWNERSHIP_CONTRACT_ID,
        method: 'register_work',
        args,
      });

      setTxHash(hash);
      setTxStatus('polling');
      toast.loading('Registering co-owned work…', { id: 'split' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          setTxStatus('success');
          toast.success('Co-owned work registered!', { id: 'split' });
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          setTxStatus('failed');
          toast.error('Registration failed.', { id: 'split' });
        }
      }, 2000);
    } catch (err: unknown) {
      setTxStatus('failed');
      toast.error(err instanceof Error ? err.message : 'Registration failed', { id: 'split' });
    }
  }, [isConnected, isValid, fileHash, title, creators, publicKey]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Split Sheet</span>
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          Register a work with multiple co-creators and custom ownership splits. Shares must total 100%.
        </p>

        {!isConnected ? (
          <div className="glass-card p-8 text-center">
            <p className="text-slate-400">Connect your wallet to create split sheets.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Hash */}
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Step 1 — Hash the Work</h2>
              <DropZone onFileHashed={handleFileHashed} disabled={txStatus !== 'idle'} />
            </div>

            {/* Title */}
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Step 2 — Work Title</h2>
              <input
                id="split-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Collaborative Album v3"
                className="input-field text-sm"
              />
            </div>

            {/* Co-Creators */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-300">Step 3 — Co-Creators & Shares</h2>
                <button onClick={addCreator} className="text-brand-400 hover:text-brand-300 transition-colors">
                  <HiOutlinePlusCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {creators.map((creator, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={creator.address}
                      onChange={(e) => updateCreator(i, 'address', e.target.value)}
                      placeholder="G... Stellar address"
                      className="input-field font-mono text-xs flex-1"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={creator.share}
                        onChange={(e) => updateCreator(i, 'share', e.target.value)}
                        className="input-field text-sm w-24 text-center"
                        min="0"
                        max="10000"
                      />
                      <span className="text-xs text-slate-500 w-12">
                        {(creator.share / 100).toFixed(1)}%
                      </span>
                    </div>
                    {creators.length > 2 && (
                      <button onClick={() => removeCreator(i)} className="text-red-400 hover:text-red-300">
                        <HiOutlineMinusCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Total Indicator */}
              <div className={`mt-4 flex items-center justify-between rounded-lg px-4 py-2 ${
                totalShares === 10000
                  ? 'bg-emerald-900/20 border border-emerald-800/30'
                  : 'bg-red-900/20 border border-red-800/30'
              }`}>
                <span className="text-xs text-slate-400">Total</span>
                <span className={`text-sm font-bold ${totalShares === 10000 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(totalShares / 100).toFixed(1)}% / 100%
                </span>
              </div>

              {/* Visual Pie representation */}
              <div className="mt-4 flex h-3 rounded-full overflow-hidden bg-surface-800">
                {creators.map((c, i) => {
                  const colors = ['bg-brand-500', 'bg-teal-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500'];
                  return (
                    <div
                      key={i}
                      className={`${colors[i % colors.length]} transition-all duration-300`}
                      style={{ width: `${(c.share / 10000) * 100}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              id="split-submit-btn"
              onClick={handleSubmit}
              disabled={!isValid || txStatus === 'signing' || txStatus === 'polling'}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3"
            >
              {txStatus === 'signing' || txStatus === 'polling' ? (
                <>
                  <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                  {txStatus === 'signing' ? 'Signing…' : 'Registering…'}
                </>
              ) : (
                <>
                  <RiGroupLine className="h-4 w-4" />
                  Register Co-Owned Work
                </>
              )}
            </button>

            {/* Success */}
            {txStatus === 'success' && txHash && (
              <div className="glass-card p-6 border-emerald-800/30">
                <h3 className="text-sm font-semibold text-emerald-400 mb-3">✓ Co-Owned Work Registered</h3>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Transaction</p>
                  <a
                    href={stellar.getExplorerLink(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-300 hover:text-brand-200 font-mono break-all"
                  >
                    {txHash}
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

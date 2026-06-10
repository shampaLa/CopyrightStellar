'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/layout/Footer';
import DropZone from '@/components/ui/DropZone';
import Badge from '@/components/ui/Badge';
import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import { REGISTRY_CONTRACT_ID } from '@/lib/constants';
import * as StellarSdk from '@stellar/stellar-sdk';
import { HiOutlineMagnifyingGlass, HiOutlineArrowPath } from 'react-icons/hi2';

interface VerifyResult {
  found: boolean;
  id?: string;
  creator?: string;
  title?: string;
  timestamp?: string;
}

export default function VerifyPage() {
  const { publicKey, isConnected } = useWallet();
  const [fileHash, setFileHash] = useState('');
  const [manualHash, setManualHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleFileHashed = useCallback((hash: string) => {
    setFileHash(hash);
    setManualHash(hash);
    setResult(null);
  }, []);

  const handleVerify = useCallback(async () => {
    const hashToCheck = manualHash || fileHash;
    if (!isConnected || !hashToCheck) return;

    try {
      setVerifying(true);
      setResult(null);

      const hashBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        hashBytes[i] = parseInt(hashToCheck.substring(i * 2, i * 2 + 2), 16);
      }

      const args = [StellarSdk.xdr.ScVal.scvBytes(Buffer.from(hashBytes))];

      const retval = await stellar.simulateRead({
        publicKey,
        contractId: REGISTRY_CONTRACT_ID,
        method: 'verify',
        args,
      });

      if (retval) {
        const native = StellarSdk.scValToNative(retval);
        if (native && typeof native === 'object') {
          setResult({
            found: true,
            id: String(native.id || ''),
            creator: String(native.creator || ''),
            title: String(native.title || ''),
            timestamp: native.timestamp ? new Date(Number(native.timestamp) * 1000).toLocaleString() : '',
          });
        } else {
          setResult({ found: false });
        }
      } else {
        setResult({ found: false });
      }
    } catch {
      setResult({ found: false });
    } finally {
      setVerifying(false);
    }
  }, [isConnected, publicKey, fileHash, manualHash]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Verify a Work</span>
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          Re-hash a file or paste a SHA-256 hash to check if it exists in the on-chain registry.
        </p>

        {!isConnected ? (
          <div className="glass-card p-8 text-center">
            <p className="text-slate-400">Connect your wallet to verify works.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Drop Zone */}
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Option A — Hash a File</h2>
              <DropZone onFileHashed={handleFileHashed} />
            </div>

            {/* Manual Hash Input */}
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Option B — Paste a Hash</h2>
              <input
                id="verify-manual-hash"
                type="text"
                value={manualHash}
                onChange={(e) => { setManualHash(e.target.value); setResult(null); }}
                placeholder="Enter 64-character SHA-256 hex hash…"
                className="input-field font-mono text-sm"
              />
            </div>

            {/* Verify Button */}
            <button
              id="verify-submit-btn"
              onClick={handleVerify}
              disabled={verifying || (!manualHash && !fileHash)}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3"
            >
              {verifying ? (
                <>
                  <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <HiOutlineMagnifyingGlass className="h-4 w-4" />
                  Verify On-Chain
                </>
              )}
            </button>

            {/* Result */}
            {result && (
              <div className={`glass-card p-6 ${result.found ? 'border-emerald-800/30' : 'border-amber-800/30'}`}>
                {result.found ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge label="Registered" />
                      <span className="text-sm font-semibold text-emerald-400">✓ This file is registered</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Registration ID</p>
                        <p className="text-sm text-brand-300 font-mono">#{result.id}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Title</p>
                        <p className="text-sm text-slate-300">{result.title}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Creator</p>
                        <p className="text-xs text-slate-400 font-mono break-all">{result.creator}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Registered At</p>
                        <p className="text-sm text-slate-300">{result.timestamp}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-amber-400 font-semibold mb-2">✗ Not Found</p>
                    <p className="text-sm text-slate-400">
                      This file hash has not been registered on the CopyrightStellar registry.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

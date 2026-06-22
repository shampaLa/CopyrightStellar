'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/layout/Footer';
import DropZone from '@/components/ui/DropZone';
import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import { REGISTRY_CONTRACT_ID } from '@/lib/constants';
import * as StellarSdk from '@stellar/stellar-sdk';
import toast from 'react-hot-toast';
import { HiOutlineArrowPath, HiOutlineFingerPrint } from 'react-icons/hi2';

type TxStatus = 'idle' | 'signing' | 'polling' | 'success' | 'failed';

export default function RegisterPage() {
  const { publicKey, isConnected } = useWallet();
  const [fileHash, setFileHash] = useState('');
  const [fileName, setFileName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const handleFileHashed = useCallback((hash: string, name: string) => {
    setFileHash(hash);
    setFileName(name);
  }, []);

  const handleRegister = useCallback(async () => {
    if (!isConnected || !fileHash || !title) return;

    try {
      setTxStatus('signing');

      // Convert hex hash to bytes for contract
      const hashBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        hashBytes[i] = parseInt(fileHash.substring(i * 2, i * 2 + 2), 16);
      }

      // Pre-check if hash already exists to show a clean error message
      try {
        const verifyVal = await stellar.simulateRead({
          publicKey,
          contractId: REGISTRY_CONTRACT_ID,
          method: 'verify',
          args: [StellarSdk.xdr.ScVal.scvBytes(Buffer.from(hashBytes))],
        });
        if (verifyVal) {
          throw new Error('This file hash has already been registered on-chain.');
        }
      } catch (readErr: any) {
        if (readErr.message.includes('already been registered')) {
          throw readErr;
        }
      }

      const args = [
        StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
        StellarSdk.xdr.ScVal.scvBytes(Buffer.from(hashBytes)),
        StellarSdk.nativeToScVal(title, { type: 'string' }),
        StellarSdk.nativeToScVal(description || 'No description', { type: 'string' }),
      ];

      const { hash } = await stellar.buildAndSignTx({
        publicKey,
        contractId: REGISTRY_CONTRACT_ID,
        method: 'register',
        args,
      });

      setTxHash(hash);
      setTxStatus('polling');
      toast.loading('Registering on-chain…', { id: 'register' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          setTxStatus('success');
          setRegistrationId(result.returnValue || null);
          toast.success('Work registered on-chain!', { id: 'register' });
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          setTxStatus('failed');
          toast.error('Registration failed.', { id: 'register' });
        }
      }, 2000);
    } catch (err: unknown) {
      setTxStatus('failed');
      toast.error(err instanceof Error ? err.message : 'Registration failed', { id: 'register' });
    }
  }, [isConnected, publicKey, fileHash, title, description]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Register a Work</span>
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          Hash your file locally and register the SHA-256 fingerprint on-chain as immutable proof-of-existence.
        </p>

        {!isConnected ? (
          <div className="glass-card p-8 text-center">
            <p className="text-slate-400">Connect your wallet to register works.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Drop Zone */}
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Step 1 — Hash Your File</h2>
              <DropZone onFileHashed={handleFileHashed} disabled={txStatus === 'signing' || txStatus === 'polling'} />
            </div>

            {/* Metadata */}
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-300 mb-2">Step 2 — Work Details</h2>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">Title *</label>
                <input
                  id="register-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. My Original Song v2.1"
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">Description</label>
                <textarea
                  id="register-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your work…"
                  rows={3}
                  className="input-field text-sm resize-none"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="register-submit-btn"
              onClick={handleRegister}
              disabled={!fileHash || !title || txStatus === 'signing' || txStatus === 'polling'}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3"
            >
              {txStatus === 'signing' || txStatus === 'polling' ? (
                <>
                  <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                  {txStatus === 'signing' ? 'Signing…' : 'Registering…'}
                </>
              ) : (
                <>
                  <HiOutlineFingerPrint className="h-4 w-4" />
                  Register On-Chain
                </>
              )}
            </button>

            {/* Success Result */}
            {txStatus === 'success' && txHash && (
              <div className="glass-card p-6 border-emerald-800/30">
                <h3 className="text-sm font-semibold text-emerald-400 mb-3">✓ Registration Successful</h3>
                <div className="space-y-3">
                  {registrationId && (
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Registration ID</p>
                      <p className="text-sm text-brand-300 font-mono">#{registrationId}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">File</p>
                    <p className="text-sm text-slate-300">{fileName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">SHA-256 Hash</p>
                    <p className="text-xs text-slate-400 font-mono break-all">{fileHash}</p>
                  </div>
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
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/layout/Footer';
import Badge from '@/components/ui/Badge';
import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import { LICENSE_DAO_CONTRACT_ID } from '@/lib/constants';
import * as StellarSdk from '@stellar/stellar-sdk';
import toast from 'react-hot-toast';
import { HiOutlineArrowPath, HiOutlinePlusCircle, HiOutlineKey, HiOutlineXCircle } from 'react-icons/hi2';

const LICENSE_TYPES = [
  { value: 0, label: 'Creative Commons', desc: 'Open, sharable license with attribution' },
  { value: 1, label: 'MIT License', desc: 'Permissive open-source license' },
  { value: 2, label: 'Proprietary', desc: 'All rights reserved' },
  { value: 3, label: 'Custom', desc: 'Custom terms defined by the creator' },
];

type TxStatus = 'idle' | 'signing' | 'polling' | 'success' | 'failed';

export default function LicensesPage() {
  const { publicKey, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');

  // Create license form
  const [workId, setWorkId] = useState('');
  const [licenseType, setLicenseType] = useState(0);
  const [termsHash, setTermsHash] = useState('');
  const [txHash, setTxHash] = useState('');

  // Grant access
  const [grantLicenseId, setGrantLicenseId] = useState('');
  const [grantAddress, setGrantAddress] = useState('');
  const [granting, setGranting] = useState(false);

  const handleCreateLicense = useCallback(async () => {
    if (!isConnected || !workId) return;

    try {
      setTxStatus('signing');

      const hashBytes = new Uint8Array(32);
      if (termsHash) {
        for (let i = 0; i < 32; i++) {
          hashBytes[i] = parseInt(termsHash.substring(i * 2, i * 2 + 2), 16) || 0;
        }
      }

      const args = [
        StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(Number(workId), { type: 'u32' }),
        StellarSdk.nativeToScVal(licenseType, { type: 'u32' }),
        StellarSdk.xdr.ScVal.scvBytes(Buffer.from(hashBytes)),
      ];

      const { hash } = await stellar.buildAndSignTx({
        publicKey,
        contractId: LICENSE_DAO_CONTRACT_ID,
        method: 'create_license',
        args,
      });

      setTxHash(hash);
      setTxStatus('polling');
      toast.loading('Creating license on-chain…', { id: 'license' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          setTxStatus('success');
          toast.success('License created!', { id: 'license' });
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          setTxStatus('failed');
          toast.error('License creation failed.', { id: 'license' });
        }
      }, 2000);
    } catch (err: unknown) {
      setTxStatus('failed');
      toast.error(err instanceof Error ? err.message : 'Failed', { id: 'license' });
    }
  }, [isConnected, publicKey, workId, licenseType, termsHash]);

  const handleGrantAccess = useCallback(async () => {
    if (!isConnected || !grantLicenseId || !grantAddress) return;

    try {
      setGranting(true);

      const args = [
        StellarSdk.nativeToScVal(Number(grantLicenseId), { type: 'u32' }),
        StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(grantAddress, { type: 'address' }),
      ];

      const { hash } = await stellar.buildAndSignTx({
        publicKey,
        contractId: LICENSE_DAO_CONTRACT_ID,
        method: 'grant_access',
        args,
      });

      toast.loading('Granting access…', { id: 'grant' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          toast.success('Access granted!', { id: 'grant' });
          setGrantAddress('');
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          toast.error('Grant failed.', { id: 'grant' });
        }
      }, 2000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Grant failed');
    } finally {
      setGranting(false);
    }
  }, [isConnected, publicKey, grantLicenseId, grantAddress]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">License Management</span>
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          Define license templates for your works and grant/revoke access keys to other addresses.
        </p>

        {!isConnected ? (
          <div className="glass-card p-8 text-center">
            <p className="text-slate-400">Connect your wallet to manage licenses.</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-8">
              {['create', 'manage'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'create' | 'manage')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800 border border-transparent'
                  }`}
                >
                  {tab === 'create' ? 'Create License' : 'Grant Access'}
                </button>
              ))}
            </div>

            {activeTab === 'create' ? (
              <div className="space-y-6">
                {/* License Type Selector */}
                <div className="glass-card p-6">
                  <h2 className="text-sm font-semibold text-slate-300 mb-4">License Type</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {LICENSE_TYPES.map((lt) => (
                      <button
                        key={lt.value}
                        onClick={() => setLicenseType(lt.value)}
                        className={`rounded-xl p-4 text-left transition-all border ${
                          licenseType === lt.value
                            ? 'bg-brand-600/20 border-brand-600/40 text-brand-300'
                            : 'bg-surface-800/50 border-surface-600/30 text-slate-400 hover:border-brand-600/20'
                        }`}
                      >
                        <p className="font-semibold text-sm">{lt.label}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{lt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Work ID + Terms */}
                <div className="glass-card p-6 space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">Work ID *</label>
                    <input
                      id="license-work-id"
                      type="number"
                      value={workId}
                      onChange={(e) => setWorkId(e.target.value)}
                      placeholder="Registration ID of the work"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">Terms Hash (optional)</label>
                    <input
                      type="text"
                      value={termsHash}
                      onChange={(e) => setTermsHash(e.target.value)}
                      placeholder="SHA-256 hash of your license terms document"
                      className="input-field font-mono text-xs"
                    />
                  </div>
                </div>

                <button
                  id="license-create-btn"
                  onClick={handleCreateLicense}
                  disabled={!workId || txStatus === 'signing' || txStatus === 'polling'}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3"
                >
                  {txStatus === 'signing' || txStatus === 'polling' ? (
                    <>
                      <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                      {txStatus === 'signing' ? 'Signing…' : 'Creating…'}
                    </>
                  ) : (
                    <>
                      <HiOutlinePlusCircle className="h-4 w-4" />
                      Create License
                    </>
                  )}
                </button>

                {txStatus === 'success' && txHash && (
                  <div className="glass-card p-6 border-emerald-800/30">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-3">✓ License Created</h3>
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
            ) : (
              <div className="space-y-6">
                <div className="glass-card p-6 space-y-4">
                  <h2 className="text-sm font-semibold text-slate-300 mb-2">Grant Access Key</h2>

                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">License ID</label>
                    <input
                      type="number"
                      value={grantLicenseId}
                      onChange={(e) => setGrantLicenseId(e.target.value)}
                      placeholder="License ID"
                      className="input-field text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">Grantee Address</label>
                    <input
                      type="text"
                      value={grantAddress}
                      onChange={(e) => setGrantAddress(e.target.value)}
                      placeholder="G... address to grant access"
                      className="input-field font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      id="license-grant-btn"
                      onClick={handleGrantAccess}
                      disabled={granting || !grantLicenseId || !grantAddress}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                    >
                      <HiOutlineKey className="h-4 w-4" />
                      {granting ? 'Granting…' : 'Grant Access'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

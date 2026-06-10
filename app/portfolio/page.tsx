'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/layout/Footer';
import Badge from '@/components/ui/Badge';
import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import { COOWNERSHIP_CONTRACT_ID, REGISTRY_CONTRACT_ID } from '@/lib/constants';
import * as StellarSdk from '@stellar/stellar-sdk';
import toast from 'react-hot-toast';
import { HiOutlineDocumentText, HiOutlineArrowsRightLeft, HiOutlineArrowPath } from 'react-icons/hi2';

interface OwnedWork {
  id: string;
  title: string;
  fileHash: string;
  myShare: number;
  totalShares: number;
  createdAt: string;
}

export default function PortfolioPage() {
  const { publicKey, isConnected } = useWallet();
  const [works, setWorks] = useState<OwnedWork[]>([]);
  const [loading, setLoading] = useState(false);
  const [transferModal, setTransferModal] = useState<{ workId: string; share: number } | null>(null);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferring, setTransferring] = useState(false);

  const loadPortfolio = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      // Query contract for works owned by this address
      const countVal = await stellar.simulateRead({
        publicKey,
        contractId: COOWNERSHIP_CONTRACT_ID,
        method: 'get_work_count',
      });

      const count = countVal ? Number(StellarSdk.scValToNative(countVal)) : 0;
      const owned: OwnedWork[] = [];

      for (let i = 1; i <= count; i++) {
        try {
          const shareVal = await stellar.simulateRead({
            publicKey,
            contractId: COOWNERSHIP_CONTRACT_ID,
            method: 'get_share',
            args: [
              StellarSdk.nativeToScVal(i, { type: 'u32' }),
              StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
            ],
          });

          if (shareVal) {
            const share = Number(StellarSdk.scValToNative(shareVal));
            if (share > 0) {
              const workVal = await stellar.simulateRead({
                publicKey,
                contractId: COOWNERSHIP_CONTRACT_ID,
                method: 'get_work',
                args: [StellarSdk.nativeToScVal(i, { type: 'u32' })],
              });

              if (workVal) {
                const work = StellarSdk.scValToNative(workVal);
                owned.push({
                  id: String(work.id || i),
                  title: String(work.title || `Work #${i}`),
                  fileHash: String(work.file_hash || ''),
                  myShare: share,
                  totalShares: Number(work.total_shares || 10000),
                  createdAt: work.created_at ? new Date(Number(work.created_at) * 1000).toLocaleDateString() : '',
                });
              }
            }
          }
        } catch {
          // Work doesn't exist or user has no share
        }
      }

      setWorks(owned);
    } catch {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [isConnected, publicKey]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  const handleTransfer = useCallback(async () => {
    if (!transferModal || !transferTo || !transferAmount) return;
    setTransferring(true);
    try {
      const args = [
        StellarSdk.nativeToScVal(Number(transferModal.workId), { type: 'u32' }),
        StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(transferTo, { type: 'address' }),
        StellarSdk.nativeToScVal(Number(transferAmount), { type: 'u32' }),
      ];

      const { hash } = await stellar.buildAndSignTx({
        publicKey,
        contractId: COOWNERSHIP_CONTRACT_ID,
        method: 'transfer_share',
        args,
      });

      toast.loading('Transferring share…', { id: 'transfer-share' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          toast.success('Share transferred!', { id: 'transfer-share' });
          setTransferModal(null);
          setTransferTo('');
          setTransferAmount('');
          loadPortfolio();
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          toast.error('Transfer failed', { id: 'transfer-share' });
        }
      }, 2000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setTransferring(false);
    }
  }, [transferModal, transferTo, transferAmount, publicKey, loadPortfolio]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">IP Portfolio</span>
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          View all works where you hold ownership shares. Transfer shares to other addresses.
        </p>

        {!isConnected ? (
          <div className="glass-card p-8 text-center">
            <p className="text-slate-400">Connect your wallet to view your portfolio.</p>
          </div>
        ) : loading ? (
          <div className="glass-card p-8 text-center">
            <HiOutlineArrowPath className="h-6 w-6 animate-spin text-brand-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Loading portfolio…</p>
          </div>
        ) : works.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <HiOutlineDocumentText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-2">No works in your portfolio yet.</p>
            <p className="text-xs text-slate-500">Register a work or get co-ownership shares to see them here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {works.map((work) => (
              <div key={work.id} className="glass-card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-200">{work.title}</h3>
                      <Badge label="Registered" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Your Share</p>
                        <p className="text-lg font-bold text-brand-300">
                          {(work.myShare / 100).toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Work ID</p>
                        <p className="text-sm text-slate-400 font-mono">#{work.id}</p>
                      </div>
                    </div>
                    {work.fileHash && (
                      <div className="mt-3">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">File Hash</p>
                        <p className="text-xs text-slate-500 font-mono truncate">{work.fileHash}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setTransferModal({ workId: work.id, share: work.myShare })}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    <HiOutlineArrowsRightLeft className="h-3.5 w-3.5" />
                    Transfer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transfer Modal */}
        {transferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Transfer Ownership Share</h3>
              <p className="text-xs text-slate-400">
                Work #{transferModal.workId} • Your share: {(transferModal.share / 100).toFixed(2)}%
              </p>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">Recipient Address</label>
                <input
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="G... Stellar address"
                  className="input-field font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">
                  Basis Points to Transfer (max {transferModal.share})
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="e.g. 2500 = 25%"
                  className="input-field text-sm"
                  min="1"
                  max={transferModal.share}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={handleTransfer} disabled={transferring} className="btn-primary flex-1 text-sm">
                  {transferring ? 'Transferring…' : 'Confirm Transfer'}
                </button>
                <button onClick={() => setTransferModal(null)} className="btn-secondary flex-1 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

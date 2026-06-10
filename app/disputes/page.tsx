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
import { HiOutlineScale, HiOutlineArrowPath, HiOutlineHandRaised } from 'react-icons/hi2';

type TxStatus = 'idle' | 'signing' | 'polling' | 'success' | 'failed';

interface Dispute {
  id: number;
  plaintiff: string;
  defendant: string;
  workId: number;
  yesVotes: number;
  noVotes: number;
  status: number; // 0 = Active, 1 = Upheld, 2 = Dismissed
  endTime: number;
}

const STATUS_LABELS: Record<number, string> = {
  0: 'Active',
  1: 'Upheld',
  2: 'Dismissed',
};

export default function DisputesPage() {
  const { publicKey, isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<'file' | 'vote' | 'history'>('file');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);

  // File dispute form
  const [defendant, setDefendant] = useState('');
  const [disputeWorkId, setDisputeWorkId] = useState('');
  const [evidenceHash, setEvidenceHash] = useState('');
  const [txHash, setTxHash] = useState('');

  // Vote form
  const [voteDisputeId, setVoteDisputeId] = useState('');
  const [voteCount, setVoteCount] = useState('');
  const [supportPlaintiff, setSupportPlaintiff] = useState(true);
  const [voting, setVoting] = useState(false);

  const quadraticCost = voteCount ? Number(voteCount) * Number(voteCount) : 0;

  const loadDisputes = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const countVal = await stellar.simulateRead({
        publicKey,
        contractId: LICENSE_DAO_CONTRACT_ID,
        method: 'get_dispute_count',
      });

      const count = countVal ? Number(StellarSdk.scValToNative(countVal)) : 0;
      const items: Dispute[] = [];

      for (let i = 1; i <= count; i++) {
        try {
          const val = await stellar.simulateRead({
            publicKey,
            contractId: LICENSE_DAO_CONTRACT_ID,
            method: 'get_dispute',
            args: [StellarSdk.nativeToScVal(i, { type: 'u32' })],
          });
          if (val) {
            const d = StellarSdk.scValToNative(val);
            items.push({
              id: Number(d.id || i),
              plaintiff: String(d.plaintiff || ''),
              defendant: String(d.defendant || ''),
              workId: Number(d.work_id || 0),
              yesVotes: Number(d.yes_votes || 0),
              noVotes: Number(d.no_votes || 0),
              status: Number(d.status || 0),
              endTime: Number(d.end_time || 0),
            });
          }
        } catch {
          // dispute doesn't exist
        }
      }

      setDisputes(items);
    } catch {
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  }, [isConnected, publicKey]);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const handleFileDispute = useCallback(async () => {
    if (!isConnected || !defendant || !disputeWorkId) return;

    try {
      setTxStatus('signing');

      const hashBytes = new Uint8Array(32);
      if (evidenceHash) {
        for (let i = 0; i < 32; i++) {
          hashBytes[i] = parseInt(evidenceHash.substring(i * 2, i * 2 + 2), 16) || 0;
        }
      }

      const args = [
        StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(defendant, { type: 'address' }),
        StellarSdk.nativeToScVal(Number(disputeWorkId), { type: 'u32' }),
        StellarSdk.xdr.ScVal.scvBytes(Buffer.from(hashBytes)),
      ];

      const { hash } = await stellar.buildAndSignTx({
        publicKey,
        contractId: LICENSE_DAO_CONTRACT_ID,
        method: 'file_dispute',
        args,
      });

      setTxHash(hash);
      setTxStatus('polling');
      toast.loading('Filing dispute…', { id: 'dispute' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          setTxStatus('success');
          toast.success('Dispute filed!', { id: 'dispute' });
          loadDisputes();
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          setTxStatus('failed');
          toast.error('Dispute filing failed.', { id: 'dispute' });
        }
      }, 2000);
    } catch (err: unknown) {
      setTxStatus('failed');
      toast.error(err instanceof Error ? err.message : 'Failed', { id: 'dispute' });
    }
  }, [isConnected, publicKey, defendant, disputeWorkId, evidenceHash, loadDisputes]);

  const handleVote = useCallback(async () => {
    if (!isConnected || !voteDisputeId || !voteCount) return;

    try {
      setVoting(true);

      const args = [
        StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(Number(voteDisputeId), { type: 'u32' }),
        StellarSdk.nativeToScVal(BigInt(voteCount), { type: 'i128' }),
        StellarSdk.nativeToScVal(supportPlaintiff, { type: 'bool' }),
      ];

      const { hash } = await stellar.buildAndSignTx({
        publicKey,
        contractId: LICENSE_DAO_CONTRACT_ID,
        method: 'vote_dispute',
        args,
      });

      toast.loading('Casting quadratic vote…', { id: 'vote' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          toast.success('Vote cast!', { id: 'vote' });
          loadDisputes();
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          toast.error('Vote failed.', { id: 'vote' });
        }
      }, 2000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Vote failed');
    } finally {
      setVoting(false);
    }
  }, [isConnected, publicKey, voteDisputeId, voteCount, supportPlaintiff, loadDisputes]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Dispute Courtroom</span>
        </h1>
        <p className="text-sm text-slate-400 mb-8">
          File plagiarism claims, submit evidence, and resolve disputes through Quadratic Voting ($cost = votes²$).
        </p>

        {!isConnected ? (
          <div className="glass-card p-8 text-center">
            <p className="text-slate-400">Connect your wallet to participate in disputes.</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-8">
              {[
                { id: 'file', label: 'File Dispute' },
                { id: 'vote', label: 'Vote' },
                { id: 'history', label: 'History' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'file' | 'vote' | 'history')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* File Dispute */}
            {activeTab === 'file' && (
              <div className="space-y-6">
                <div className="glass-card p-6 space-y-4">
                  <h2 className="text-sm font-semibold text-slate-300 mb-2">File a Plagiarism Dispute</h2>

                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">Defendant Address *</label>
                    <input
                      type="text"
                      value={defendant}
                      onChange={(e) => setDefendant(e.target.value)}
                      placeholder="G... address of the alleged infringer"
                      className="input-field font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">Work ID *</label>
                    <input
                      type="number"
                      value={disputeWorkId}
                      onChange={(e) => setDisputeWorkId(e.target.value)}
                      placeholder="ID of the disputed work"
                      className="input-field text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">Evidence Hash</label>
                    <input
                      type="text"
                      value={evidenceHash}
                      onChange={(e) => setEvidenceHash(e.target.value)}
                      placeholder="SHA-256 hash of your evidence file"
                      className="input-field font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Hash your evidence file using the Register page first</p>
                  </div>

                  <button
                    id="dispute-file-btn"
                    onClick={handleFileDispute}
                    disabled={!defendant || !disputeWorkId || txStatus === 'signing' || txStatus === 'polling'}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3"
                  >
                    {txStatus === 'signing' || txStatus === 'polling' ? (
                      <>
                        <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                        {txStatus === 'signing' ? 'Signing…' : 'Filing…'}
                      </>
                    ) : (
                      <>
                        <HiOutlineScale className="h-4 w-4" />
                        File Dispute
                      </>
                    )}
                  </button>

                  {txStatus === 'success' && txHash && (
                    <div className="glass-card p-4 border-emerald-800/30 mt-4">
                      <h3 className="text-sm font-semibold text-emerald-400 mb-2">✓ Dispute Filed</h3>
                      <a
                        href={stellar.getExplorerLink(txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-300 hover:text-brand-200 font-mono break-all"
                      >
                        {txHash}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vote */}
            {activeTab === 'vote' && (
              <div className="space-y-6">
                <div className="glass-card p-6 space-y-4">
                  <h2 className="text-sm font-semibold text-slate-300 mb-2">Cast a Quadratic Vote</h2>

                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">Dispute ID</label>
                    <input
                      type="number"
                      value={voteDisputeId}
                      onChange={(e) => setVoteDisputeId(e.target.value)}
                      placeholder="Dispute ID to vote on"
                      className="input-field text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">
                      Number of Votes
                    </label>
                    <input
                      type="number"
                      value={voteCount}
                      onChange={(e) => setVoteCount(e.target.value)}
                      placeholder="e.g. 5"
                      className="input-field text-sm"
                      min="1"
                    />
                  </div>

                  {/* Quadratic Cost Calculator */}
                  <div className="rounded-xl bg-surface-800/60 border border-brand-900/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">Quadratic Cost Formula</span>
                      <span className="text-xs text-slate-500 font-mono">cost = votes²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">
                        {voteCount || '0'} votes × {voteCount || '0'} votes
                      </span>
                      <span className="text-lg font-bold text-brand-300">
                        = {quadraticCost} tokens
                      </span>
                    </div>
                  </div>

                  {/* Vote Direction */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSupportPlaintiff(true)}
                      className={`flex-1 rounded-xl p-4 text-center transition-all border ${
                        supportPlaintiff
                          ? 'bg-emerald-900/30 border-emerald-700/40 text-emerald-300'
                          : 'bg-surface-800/50 border-surface-600/30 text-slate-400'
                      }`}
                    >
                      <p className="font-semibold text-sm">Support Plaintiff</p>
                      <p className="text-[10px] mt-1 opacity-70">Uphold the claim</p>
                    </button>
                    <button
                      onClick={() => setSupportPlaintiff(false)}
                      className={`flex-1 rounded-xl p-4 text-center transition-all border ${
                        !supportPlaintiff
                          ? 'bg-red-900/30 border-red-700/40 text-red-300'
                          : 'bg-surface-800/50 border-surface-600/30 text-slate-400'
                      }`}
                    >
                      <p className="font-semibold text-sm">Support Defendant</p>
                      <p className="text-[10px] mt-1 opacity-70">Dismiss the claim</p>
                    </button>
                  </div>

                  <button
                    id="dispute-vote-btn"
                    onClick={handleVote}
                    disabled={voting || !voteDisputeId || !voteCount}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3"
                  >
                    {voting ? (
                      <>
                        <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                        Voting…
                      </>
                    ) : (
                      <>
                        <HiOutlineHandRaised className="h-4 w-4" />
                        Cast {voteCount || '0'} Votes ({quadraticCost} tokens)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* History */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="glass-card p-8 text-center">
                    <HiOutlineArrowPath className="h-6 w-6 animate-spin text-brand-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Loading disputes…</p>
                  </div>
                ) : disputes.length === 0 ? (
                  <div className="glass-card p-8 text-center">
                    <HiOutlineScale className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No disputes have been filed yet.</p>
                  </div>
                ) : (
                  disputes.map((d) => (
                    <div key={d.id} className="glass-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-slate-200">Dispute #{d.id}</span>
                        <Badge label={STATUS_LABELS[d.status] || 'Active'} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Plaintiff</p>
                          <p className="text-xs text-slate-400 font-mono truncate">{d.plaintiff}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Defendant</p>
                          <p className="text-xs text-slate-400 font-mono truncate">{d.defendant}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Work ID</p>
                          <p className="text-xs text-slate-300">#{d.workId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Votes</p>
                          <p className="text-xs">
                            <span className="text-emerald-400">✓ {d.yesVotes}</span>
                            <span className="text-slate-600 mx-1">|</span>
                            <span className="text-red-400">✗ {d.noVotes}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

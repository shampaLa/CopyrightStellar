'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/layout/Footer';
import { useWallet } from '@/hooks/useWallet';
import { stellar } from '@/lib/stellar';
import toast from 'react-hot-toast';
import { HiOutlineArrowPath, HiOutlinePaperAirplane } from 'react-icons/hi2';

type TxStatus = 'idle' | 'signing' | 'polling' | 'success' | 'failed';

export default function TransferPage() {
  const { publicKey, isConnected, balance } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');

  const handleSend = useCallback(async () => {
    if (!isConnected || !recipient || !amount) return;

    try {
      setTxStatus('signing');
      const { hash } = await stellar.sendXlmTransaction(publicKey, recipient, amount);
      setTxHash(hash);
      setTxStatus('polling');
      toast.loading('Confirming transaction…', { id: 'tx' });

      const poll = setInterval(async () => {
        const result = await stellar.pollTransaction(hash);
        if (result.status === 'SUCCESS') {
          clearInterval(poll);
          setTxStatus('success');
          toast.success('Transfer successful!', { id: 'tx' });
        } else if (result.status === 'FAILED') {
          clearInterval(poll);
          setTxStatus('failed');
          toast.error('Transfer failed.', { id: 'tx' });
        }
      }, 2000);
    } catch (err: unknown) {
      setTxStatus('failed');
      toast.error(err instanceof Error ? err.message : 'Transfer failed', { id: 'tx' });
    }
  }, [isConnected, publicKey, recipient, amount]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Send XLM</span>
        </h1>
        <p className="text-sm text-slate-400 mb-8">Transfer native XLM to any Stellar address on Testnet.</p>

        {!isConnected ? (
          <div className="glass-card p-8 text-center">
            <p className="text-slate-400">Connect your wallet to send XLM.</p>
          </div>
        ) : (
          <div className="glass-card p-6 space-y-5">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">From</label>
              <div className="input-field bg-surface-900/50 text-xs text-slate-400 font-mono truncate">
                {publicKey}
              </div>
              <p className="text-xs text-slate-500 mt-1">Balance: {balance} XLM</p>
            </div>

            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">Recipient Address</label>
              <input
                id="transfer-recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="G... Stellar address"
                className="input-field font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1 block">Amount (XLM)</label>
              <input
                id="transfer-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-field text-sm"
                min="0"
                step="0.01"
              />
            </div>

            <button
              id="transfer-send-btn"
              onClick={handleSend}
              disabled={txStatus === 'signing' || txStatus === 'polling' || !recipient || !amount}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {txStatus === 'signing' || txStatus === 'polling' ? (
                <>
                  <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                  {txStatus === 'signing' ? 'Signing…' : 'Confirming…'}
                </>
              ) : (
                <>
                  <HiOutlinePaperAirplane className="h-4 w-4" />
                  Send XLM
                </>
              )}
            </button>

            {txHash && (
              <div className="rounded-lg bg-surface-800/50 border border-brand-900/20 p-4 mt-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Transaction Hash</p>
                <a
                  href={stellar.getExplorerLink(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-300 hover:text-brand-200 font-mono break-all transition-colors"
                >
                  {txHash}
                </a>
                <p className={`text-xs mt-2 font-medium ${
                  txStatus === 'success' ? 'text-emerald-400' : txStatus === 'failed' ? 'text-red-400' : 'text-amber-400'
                }`}>
                  Status: {txStatus.toUpperCase()}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

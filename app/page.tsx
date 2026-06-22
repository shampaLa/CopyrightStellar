'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/layout/Footer';
import { IoFingerPrintOutline } from 'react-icons/io5';
import { HiOutlineShieldCheck, HiOutlineDocumentText, HiOutlineScale, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import { RiGroupLine } from 'react-icons/ri';

const FEATURES = [
  {
    icon: IoFingerPrintOutline,
    title: 'Proof-of-Existence',
    desc: 'Register a cryptographic SHA-256 hash of any file on-chain to prove you owned it at a specific timestamp.',
    level: 'L1',
    href: '/register',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Instant Verification',
    desc: 'Verify any file against the on-chain registry. Re-hash locally and check if the hash was previously registered.',
    level: 'L1',
    href: '/verify',
  },
  {
    icon: HiOutlineCurrencyDollar,
    title: 'XLM Transfers',
    desc: 'Send XLM directly to any Stellar address with full transaction tracking and explorer integration.',
    level: 'L1',
    href: '/transfer',
  },
  {
    icon: RiGroupLine,
    title: 'Split Sheets',
    desc: 'Register works with multiple co-creators and custom ownership percentages. Transfer shares freely.',
    level: 'L2',
    href: '/split',
  },
  {
    icon: HiOutlineDocumentText,
    title: 'License Templates',
    desc: 'Define Creative Commons, MIT, or proprietary licenses on-chain. Grant and revoke access keys to users.',
    level: 'L3',
    href: '/licenses',
  },
  {
    icon: HiOutlineScale,
    title: 'Dispute DAO',
    desc: 'Community-driven plagiarism resolution with Quadratic Voting. File claims, submit evidence, vote fairly.',
    level: 'L3',
    href: '/disputes',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        {/* Hero Glow Effects */}
        <div className="hero-glow top-[-200px] left-[20%]" />
        <div className="hero-glow top-[100px] right-[-100px]" style={{ background: 'radial-gradient(circle, rgba(81,218,217,0.1), transparent 70%)' }} />

        {/* Hero Section */}
        <section className="relative mx-auto max-w-7xl px-4 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-600/10 border border-brand-600/20 px-4 py-1.5 text-xs font-medium text-brand-300 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
              Built on Stellar Soroban • Testnet
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="gradient-text">Protect</span> Your Creative Works
              <br />
              <span className="text-slate-300">On-Chain, Forever.</span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
              CopyrightStellar is a decentralized intellectual property registry.
              Register file hashes as proof-of-existence, create fractional co-ownership splits,
              define license templates, and resolve plagiarism disputes through community governance.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register" className="btn-primary text-sm px-6 py-3">
                Register a Work
              </Link>
              <Link href="/verify" className="btn-secondary text-sm px-6 py-3">
                Verify a File
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Levels Overview */}
        <section className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-16">
            {[
              { level: 'L1', label: 'Proof-of-Existence', color: 'from-brand-400 to-brand-600' },
              { level: 'L2', label: 'Co-Ownership', color: 'from-amber-400 to-amber-600' },
              { level: 'L3', label: 'Licensing & DAO', color: 'from-orange-400 to-orange-600' },
            ].map((item) => (
              <div key={item.level} className="rounded-lg border border-surface-600 p-4 bg-surface-900/20 text-center">
                <div className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                  {item.level}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Cards */}
        <section className="mx-auto max-w-7xl px-4 pb-20">
          <h2 className="text-2xl font-bold text-center mb-10">
            <span className="gradient-text">Everything You Need</span>{' '}
            <span className="text-slate-400">to Protect IP</span>
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link href={f.href} className="glass-card block p-6 h-full group transition-all hover:translate-y-[-2px]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600/15 text-brand-400 group-hover:bg-brand-600/25 transition-colors">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-surface-700 px-2 py-0.5 rounded-full">
                      {f.level}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mx-auto max-w-4xl px-4 pb-20">
          <h2 className="text-2xl font-bold text-center mb-10">
            <span className="gradient-text">How It Works</span>
          </h2>

          <div className="space-y-6">
            {[
              { step: '01', title: 'Hash Your File Locally', desc: 'Drop any file into the browser. A SHA-256 hash is computed locally — your file never leaves your machine.' },
              { step: '02', title: 'Register On-Chain', desc: 'Submit the hash to the Soroban smart contract. The ledger timestamp becomes your immutable proof of creation.' },
              { step: '03', title: 'Verify Anytime', desc: 'Anyone can re-hash the same file and check the registry to confirm when and by whom it was first registered.' },
              { step: '04', title: 'License & Protect', desc: 'Create license templates, grant access keys, and resolve plagiarism disputes through community quadratic voting.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-5 items-start glass-card p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600/20 text-brand-300 font-bold text-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">{item.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

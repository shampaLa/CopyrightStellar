export default function Footer() {
  return (
    <footer className="border-t border-brand-900/20 bg-surface-950/60 py-8 mt-20">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} CopyrightStellar — Decentralized IP & Copyright Registry on Stellar Soroban
        </p>
        <p className="text-[10px] text-slate-600 mt-1">
          Built for RiseIn Bootcamp • Level 3 Advanced Project
        </p>
      </div>
    </footer>
  );
}

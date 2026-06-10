'use client';

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  registered: { bg: 'bg-emerald-900/40 border border-emerald-800/40', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  verified:   { bg: 'bg-teal-900/40 border border-teal-800/40', text: 'text-teal-300', dot: 'bg-teal-400' },
  pending:    { bg: 'bg-amber-900/40 border border-amber-800/40', text: 'text-amber-300', dot: 'bg-amber-400' },
  active:     { bg: 'bg-teal-900/40 border border-teal-800/40', text: 'text-teal-300', dot: 'bg-teal-400' },
  upheld:     { bg: 'bg-green-900/40 border border-green-800/40', text: 'text-green-300', dot: 'bg-green-400' },
  dismissed:  { bg: 'bg-red-900/40 border border-red-800/40', text: 'text-red-300', dot: 'bg-red-400' },
  revoked:    { bg: 'bg-rose-900/40 border border-rose-800/40', text: 'text-rose-300', dot: 'bg-rose-400' },
  granted:    { bg: 'bg-teal-900/40 border border-teal-800/40', text: 'text-teal-300', dot: 'bg-teal-400' },
};

export default function Badge({ label }: { label: string }) {
  const norm = label.toLowerCase().trim();
  const colors = STATUS_COLORS[norm] || {
    bg: 'bg-zinc-800 border border-zinc-700',
    text: 'text-zinc-300',
    dot: 'bg-zinc-500',
  };

  return (
    <span className={`status-badge ${colors.bg} ${colors.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {label}
    </span>
  );
}

type BadgeTone = 'green' | 'yellow' | 'blue' | 'red' | 'gold' | 'neutral';

const TONE_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-green-500/20 text-green-400',
  yellow: 'bg-yellow-500/20 text-yellow-500',
  blue: 'bg-blue-500/20 text-blue-400',
  red: 'bg-red-500/20 text-red-400',
  gold: 'bg-[#f5c518] text-[#0a1628]',
  neutral: 'bg-white/10 text-white',
};

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
}

export default function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wide ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}

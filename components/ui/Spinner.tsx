interface SpinnerProps {
  label?: string;
}

export default function Spinner({ label }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-[#b0bec5]">
      <span className="w-5 h-5 border-2 border-[#f5c518] border-t-transparent rounded-full animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

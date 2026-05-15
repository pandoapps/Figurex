interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export default function EmptyState({ icon = '📭', title, description }: EmptyStateProps) {
  return (
    <div className="glass p-16 text-center flex flex-col items-center gap-3">
      <span className="text-5xl">{icon}</span>
      <h3 className="text-lg font-bold">{title}</h3>
      {description && <p className="text-sm text-[#b0bec5] max-w-md">{description}</p>}
    </div>
  );
}

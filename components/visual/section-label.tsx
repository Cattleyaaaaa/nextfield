export function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="mb-12 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-muted">
      <span>{label}</span>
      <span className="font-medium text-accent">({index})</span>
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  status: string;
}

export default function ProgressBar({ progress, status }: ProgressBarProps) {
  const color =
    status === "completed"
      ? "var(--success)"
      : status === "failed"
      ? "var(--danger)"
      : "var(--primary)";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-[var(--secondary)]">
        <span className="capitalize">{status}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

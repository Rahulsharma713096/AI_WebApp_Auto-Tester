import type { Issue } from "@/types";

const severityColors: Record<string, { bg: string; text: string }> = {
  critical: { bg: "#ef444420", text: "#ef4444" },
  high: { bg: "#f59e0b20", text: "#f59e0b" },
  medium: { bg: "#3b82f620", text: "#3b82f6" },
  low: { bg: "#22c55e20", text: "#22c55e" },
  info: { bg: "#94a3b820", text: "#94a3b8" },
};

export default function IssueCard({ issue }: { issue: Issue }) {
  const colors = severityColors[issue.severity] || severityColors.info;

  return (
    <div
      className="rounded-lg border border-[var(--border)] p-4 space-y-2"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase px-2 py-0.5 rounded"
          style={{ backgroundColor: colors.text + "30", color: colors.text }}
        >
          {issue.severity}
        </span>
        <span className="text-xs text-[var(--muted)]">{issue.category}</span>
      </div>
      <p className="font-medium text-sm">{issue.title}</p>
      {issue.description && (
        <p className="text-sm text-[var(--secondary)]">{issue.description}</p>
      )}
      {issue.recommendation && (
        <div className="text-xs text-[var(--success)]">
          <span className="font-medium">Fix: </span>
          {issue.recommendation}
        </div>
      )}
    </div>
  );
}

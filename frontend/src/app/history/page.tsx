"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listTestRuns, deleteTestRun } from "@/lib/api";
import type { TestRun } from "@/types";

export default function HistoryPage() {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = async (p: number) => {
    setLoading(true);
    try {
      const data = await listTestRuns(p);
      setRuns(data.items);
      setTotal(data.total);
      setPage(data.page);
    } catch (e) {
      console.error("Failed to load runs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this test run?")) return;
    await deleteTestRun(id);
    load(page);
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-[var(--success)]/10 text-[var(--success)]",
      running: "bg-[var(--info)]/10 text-[var(--info)]",
      pending: "bg-[var(--muted)]/10 text-[var(--muted)]",
      failed: "bg-[var(--danger)]/10 text-[var(--danger)]",
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Test Run History</h1>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
        >
          New Test
        </button>
      </div>

      <div className="rounded-lg border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--card)] border-b border-[var(--border)]">
              <th className="text-left p-3 font-medium">URL</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Score</th>
              <th className="text-left p-3 font-medium">Duration</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-[var(--muted)]">
                  Loading...
                </td>
              </tr>
            ) : runs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-[var(--muted)]">
                  No test runs yet.{" "}
                  <a href="/" className="text-[var(--primary)] hover:underline">
                    Start one now
                  </a>
                </td>
              </tr>
            ) : (
              runs.map((run) => (
                <tr
                  key={run.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--card)]/50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/${run.id}`)}
                >
                  <td className="p-3 truncate max-w-xs">{run.url}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(run.status)}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="p-3">{run.score ?? "-"}</td>
                  <td className="p-3">{run.duration ? `${run.duration.toFixed(1)}s` : "-"}</td>
                  <td className="p-3 text-[var(--secondary)]">
                    {new Date(run.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(run.id);
                      }}
                      className="text-xs text-[var(--danger)] hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => load(page - 1)}
            className="px-3 py-1 rounded border border-[var(--border)] text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-[var(--secondary)]">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => load(page + 1)}
            className="px-3 py-1 rounded border border-[var(--border)] text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

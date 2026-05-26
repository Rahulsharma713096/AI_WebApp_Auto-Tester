"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTestRun, getTestRunIssues, getTestRunPages, getTestRunTestCases } from "@/lib/api";
import { connectTestRunWs } from "@/lib/websocket";
import LiveLogStream from "@/components/LiveLogStream";
import ProgressBar from "@/components/ProgressBar";
import IssueCard from "@/components/IssueCard";
import type { TestRun, Issue, Page, TestCase, WsMessage } from "@/types";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const testRunId = params.id as string;

  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<WsMessage[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("starting");

  useEffect(() => {
    getTestRun(testRunId).then(setTestRun).catch(() => router.push("/"));
    getTestRunIssues(testRunId).then(setIssues);
    getTestRunPages(testRunId).then(setPages);
    getTestRunTestCases(testRunId).then(setTestCases);

    const socket = connectTestRunWs(
      testRunId,
      (msg) => {
        setMessages((prev) => [...prev, msg]);
        if (msg.type === "progress" && msg.progress !== undefined) {
          setProgress(msg.progress);
          if (msg.status) setStatus(msg.status);
          if (msg.status === "completed" || msg.status === "failed") {
            getTestRun(testRunId).then(setTestRun);
            getTestRunIssues(testRunId).then(setIssues);
            getTestRunPages(testRunId).then(setPages);
            getTestRunTestCases(testRunId).then(setTestCases);
          }
        }
        if (msg.type === "issue" && msg.issue) {
          setIssues((prev) => [...prev, msg.issue!]);
        }
      },
      () => {},
      () => {}
    );
    setWs(socket);

    return () => socket.close();
  }, [testRunId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test Execution Dashboard</h1>
          <p className="text-sm text-[var(--secondary)] truncate max-w-lg">
            Target: {testRun?.url || "Loading..."}
          </p>
        </div>
        {testRun?.status === "completed" && (
          <button
            onClick={() => router.push(`/report/${testRunId}`)}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            View Report
          </button>
        )}
      </div>

      <ProgressBar progress={progress} status={status} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <LiveLogStream testRunId={testRunId} ws={ws} messages={messages} />

          {issues.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-semibold">Issues Found ({issues.length})</h2>
              <div className="space-y-2">
                {issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--border)] p-4 space-y-3">
            <h2 className="font-semibold">Summary</h2>
            {testRun?.summary && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--secondary)]">Checks</span>
                  <span>{testRun.summary.total_checks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--secondary)]">Passed</span>
                  <span className="text-[var(--success)]">{testRun.summary.passed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--secondary)]">Failed</span>
                  <span className="text-[var(--danger)]">{testRun.summary.failed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--secondary)]">Issues</span>
                  <span>{testRun.summary.total_issues}</span>
                </div>
                <div className="pt-2 border-t border-[var(--border)]">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Score</span>
                    <span className={testRun.score !== null && testRun.score >= 80 ? "text-[var(--success)]" : testRun.score !== null && testRun.score >= 50 ? "text-[var(--warning)]" : "text-[var(--danger)]"}>
                      {testRun.score ?? "-"}/100
                    </span>
                  </div>
                </div>
              </>
            )}
            {testRun?.duration !== null && testRun?.duration !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--secondary)]">Duration</span>
                <span>{testRun.duration.toFixed(1)}s</span>
              </div>
            )}
          </div>

          {testCases.length > 0 && (
            <div className="rounded-lg border border-[var(--border)] p-4 space-y-2">
              <h2 className="font-semibold text-sm">Test Cases</h2>
              {testCases.map((tc) => (
                <div key={tc.id} className="flex items-center gap-2 text-xs">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      tc.status === "passed"
                        ? "bg-[var(--success)]"
                        : tc.status === "failed"
                        ? "bg-[var(--danger)]"
                        : "bg-[var(--muted)]"
                    }`}
                  />
                  <span className="truncate">{tc.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

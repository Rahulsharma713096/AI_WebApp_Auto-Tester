"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTestRun, getTestRunIssues, getTestRunPages, getTestRunTestCases } from "@/lib/api";
import IssueCard from "@/components/IssueCard";
import type { TestRun, Issue, Page, TestCase } from "@/types";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const testRunId = params.id as string;

  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  useEffect(() => {
    getTestRun(testRunId).then(setTestRun).catch(() => router.push("/"));
    getTestRunIssues(testRunId).then(setIssues);
    getTestRunPages(testRunId).then(setPages);
    getTestRunTestCases(testRunId).then(setTestCases);
  }, [testRunId]);

  if (!testRun) return <div className="text-center py-12 text-[var(--muted)]">Loading report...</div>;

  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  issues.forEach((i) => { severityCounts[i.severity as keyof typeof severityCounts]++; });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test Report</h1>
          <p className="text-sm text-[var(--secondary)]">Test Run: {testRunId.slice(0, 8)}...</p>
        </div>
        <button
          onClick={() => router.push(`/dashboard/${testRunId}`)}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm hover:bg-[var(--card)] transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-[var(--border)]">
          <div className="text-2xl font-bold text-[var(--primary)]">{testRun.score ?? "-"}</div>
          <div className="text-sm text-[var(--secondary)]">Overall Score</div>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border)]">
          <div className="text-2xl font-bold">{testCases.length}</div>
          <div className="text-sm text-[var(--secondary)]">Test Cases</div>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border)]">
          <div className="text-2xl font-bold">{issues.length}</div>
          <div className="text-sm text-[var(--secondary)]">Issues Found</div>
        </div>
        <div className="p-4 rounded-lg border border-[var(--border)]">
          <div className="text-2xl font-bold">{pages.length}</div>
          <div className="text-sm text-[var(--secondary)]">Pages Scanned</div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Executive Summary</h2>
        <p className="text-sm text-[var(--secondary)]">
          Test of <strong>{testRun.url}</strong> completed in{" "}
          {testRun.duration?.toFixed(1)}s with a score of <strong>{testRun.score}/100</strong>.
          {issues.length > 0
            ? ` Found ${issues.length} issues: ${severityCounts.critical} critical, ${severityCounts.high} high, ${severityCounts.medium} medium, ${severityCounts.low} low.`
            : " No issues detected."}
        </p>
        {testRun.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-[var(--secondary)]">Checks: </span>
              {testRun.summary.total_checks}
            </div>
            <div>
              <span className="text-[var(--success)]">Passed: </span>
              {testRun.summary.passed}
            </div>
            <div>
              <span className="text-[var(--danger)]">Failed: </span>
              {testRun.summary.failed}
            </div>
            <div>
              <span className="text-[var(--warning)]">Warnings: </span>
              {testRun.summary.warnings}
            </div>
          </div>
        )}
      </div>

      {issues.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Issues ({issues.length})</h2>
          <div className="space-y-2">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {testCases.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] p-4 space-y-3">
          <h2 className="text-lg font-semibold">Test Cases ({testCases.length})</h2>
          <div className="space-y-1">
            {testCases.map((tc) => (
              <div key={tc.id} className="flex items-center gap-2 text-sm py-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    tc.status === "passed" ? "bg-[var(--success)]" : tc.status === "failed" ? "bg-[var(--danger)]" : "bg-[var(--muted)]"
                  }`}
                />
                <span>{tc.title}</span>
                <span className="text-xs text-[var(--secondary)] ml-auto">
                  {tc.status} {tc.duration ? `(${tc.duration.toFixed(1)}s)` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-[var(--border)] p-4 text-xs text-[var(--muted)] space-y-1">
        <p>Report generated: {new Date().toLocaleString()}</p>
        <p>Test Run ID: {testRunId}</p>
        <p>Target URL: {testRun.url}</p>
        <p>Profile: {testRun.profile}</p>
      </div>
    </div>
  );
}

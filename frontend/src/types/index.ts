export interface TestRun {
  id: string;
  url: string;
  status: "pending" | "running" | "completed" | "failed";
  profile: string;
  score: number | null;
  duration: number | null;
  summary: TestSummary | null;
  created_at: string;
  completed_at: string | null;
}

export interface TestSummary {
  total_checks: number;
  passed: number;
  failed: number;
  warnings: number;
  total_issues: number;
}

export interface Page {
  id: string;
  test_run_id: string;
  url: string;
  title: string | null;
  screenshot_url: string | null;
  console_logs: string[];
  network_requests: NetworkRequest[];
  created_at: string;
}

export interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  duration: number;
}

export interface Issue {
  id: string;
  test_run_id: string;
  page_id: string | null;
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  title: string;
  description: string | null;
  recommendation: string | null;
  element_selector: string | null;
  created_at: string;
}

export interface TestCase {
  id: string;
  test_run_id: string;
  title: string;
  status: "passed" | "failed" | "pending" | "skipped";
  type: string;
  duration: number | null;
  logs: string | null;
  error: string | null;
  created_at: string;
}

export interface WsMessage {
  type: "progress" | "issue" | "pong";
  progress?: number;
  status?: string;
  message?: string;
  issue?: Issue;
}

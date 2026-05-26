const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function createTestRun(url: string, profile: string = "basic") {
  const res = await fetch(`${API_BASE}/api/test-runs?url=${encodeURIComponent(url)}&profile=${profile}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Failed to create test run: ${res.statusText}`);
  return res.json();
}

export async function getTestRun(id: string) {
  const res = await fetch(`${API_BASE}/api/test-runs/${id}`);
  if (!res.ok) throw new Error("Test run not found");
  return res.json();
}

export async function listTestRuns(page = 1, perPage = 20) {
  const res = await fetch(`${API_BASE}/api/test-runs?page=${page}&per_page=${perPage}`);
  if (!res.ok) throw new Error("Failed to fetch test runs");
  return res.json();
}

export async function getTestRunIssues(id: string) {
  const res = await fetch(`${API_BASE}/api/test-runs/${id}/issues`);
  return res.json();
}

export async function getTestRunPages(id: string) {
  const res = await fetch(`${API_BASE}/api/test-runs/${id}/pages`);
  return res.json();
}

export async function getTestRunTestCases(id: string) {
  const res = await fetch(`${API_BASE}/api/test-runs/${id}/test-cases`);
  return res.json();
}

export async function deleteTestRun(id: string) {
  const res = await fetch(`${API_BASE}/api/test-runs/${id}`, { method: "DELETE" });
  return res.json();
}

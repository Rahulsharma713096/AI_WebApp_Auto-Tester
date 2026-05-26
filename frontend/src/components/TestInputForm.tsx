"use client";

import { useState } from "react";
import { createTestRun } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function TestInputForm() {
  const [url, setUrl] = useState("");
  const [profile, setProfile] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isValidUrl = (u: string) => {
    try {
      new URL(u.startsWith("http") ? u : `https://${u}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const targetUrl = url.startsWith("http") ? url : `https://${url}`;
    if (!isValidUrl(targetUrl)) {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    try {
      const testRun = await createTestRun(targetUrl, profile);
      router.push(`/dashboard/${testRun.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
      <div>
        <label htmlFor="url" className="block text-sm font-medium mb-1">
          Website URL
        </label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="profile" className="block text-sm font-medium mb-1">
          Test Profile
        </label>
        <select
          id="profile"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors"
          disabled={loading}
        >
          <option value="basic">Basic - Quick check</option>
          <option value="full">Full - Comprehensive audit</option>
          <option value="security">Security - OWASP scan only</option>
          <option value="accessibility">Accessibility - WCAG audit</option>
        </select>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="w-full py-3 px-6 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            Starting Test...
          </>
        ) : (
          "Run Test"
        )}
      </button>
    </form>
  );
}

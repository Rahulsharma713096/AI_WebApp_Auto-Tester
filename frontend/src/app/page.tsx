import TestInputForm from "@/components/TestInputForm";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">AI Web App Auto-Tester</h1>
        <p className="text-lg text-[var(--secondary)] max-w-2xl mx-auto">
          Enter a URL to run an AI-powered automated test suite. Get detailed reports on
          functionality, accessibility, security, and visual quality.
        </p>
      </div>
      <TestInputForm />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        {[
          { label: "Functional Tests", value: "9+", desc: "Automated checks" },
          { label: "AI Agents", value: "5", desc: "Parallel analysis" },
          { label: "Report Sections", value: "14", desc: "Comprehensive" },
          { label: "Test Types", value: "9", desc: "Full coverage" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-lg border border-[var(--border)]">
            <div className="text-2xl font-bold text-[var(--primary)]">{stat.value}</div>
            <div className="font-medium text-sm">{stat.label}</div>
            <div className="text-xs text-[var(--muted)]">{stat.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

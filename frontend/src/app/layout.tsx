import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Web App Auto-Tester",
  description: "AI-powered web application testing platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-lg font-bold text-[var(--primary)]">
              AI Tester
            </a>
            <div className="flex gap-4 text-sm">
              <a href="/" className="hover:text-[var(--primary)] transition-colors">
                New Test
              </a>
              <a href="/history" className="hover:text-[var(--primary)] transition-colors">
                History
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { WsMessage } from "@/types";

interface LiveLogStreamProps {
  testRunId: string;
  ws: WebSocket | null;
  messages: WsMessage[];
}

export default function LiveLogStream({ testRunId, ws, messages }: LiveLogStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <div className="px-4 py-2 border-b border-[var(--border)] font-mono text-xs text-[var(--secondary)] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
        Live Log Stream
      </div>
      <div className="h-64 overflow-y-auto p-4 font-mono text-xs space-y-1">
        {messages.length === 0 && (
          <div className="text-[var(--muted)] italic">Waiting for logs...</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-[var(--muted)] shrink-0">
              {new Date().toLocaleTimeString()}
            </span>
            <span
              className={
                msg.type === "progress"
                  ? "text-[var(--info)]"
                  : msg.type === "issue"
                  ? "text-[var(--warning)]"
                  : "text-[var(--muted)]"
              }
            >
              [{msg.status || msg.type}]
            </span>
            <span>{msg.message || JSON.stringify(msg.issue || "")}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

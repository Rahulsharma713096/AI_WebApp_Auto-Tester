import type { WsMessage } from "@/types";

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export function connectTestRunWs(
  testRunId: string,
  onMessage: (msg: WsMessage) => void,
  onError?: (err: Event) => void,
  onClose?: () => void
): WebSocket {
  const ws = new WebSocket(`${WS_BASE}/ws/test-run/${testRunId}`);

  ws.onopen = () => {
    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      } else {
        clearInterval(ping);
      }
    }, 30000);
  };

  ws.onmessage = (event) => {
    try {
      const msg: WsMessage = JSON.parse(event.data);
      onMessage(msg);
    } catch {
      console.warn("Failed to parse WS message", event.data);
    }
  };

  ws.onerror = (err) => onError?.(err);
  ws.onclose = () => onClose?.();

  return ws;
}

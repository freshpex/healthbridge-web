import { useState } from "react";
import { AppShell } from "../../components/layout/app-shell";
import { useAuth } from "../auth/hooks/use-auth";
import { healthbridgeService } from "../../services/healthbridge-service";

export function PatientAiChatPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<{ id: string; role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || !token) return;
    setMessages((m) => [...m, { id: String(Date.now()), role: "user", text: input }]);
    const next = input;
    setInput("");
    setLoading(true);
    try {
      const res = await healthbridgeService.aiChat(token, [{ role: "user", content: next }]);
      setMessages((m) => [...m, { id: res.id, role: "assistant", text: res.reply }]);
    } catch {
      setMessages((m) => [...m, { id: String(Date.now() + 1), role: "assistant", text: "Assistant unavailable." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="AI assistant" subtitle="Ask about your records, appointments, or general health questions.">
      <div>
        <div style={{ marginBottom: 12 }}>
          {messages.map((m) => (
            <div key={m.id} style={{ padding: 10, marginBottom: 8, borderRadius: 8, background: m.role === "user" ? "#F7FBFF" : "#FFFFFF", border: "1px solid #E6EEF9" }}>
              <strong>{m.role === "user" ? "You" : "Assistant"}</strong>
              <div>{m.text}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #E6EEF9" }} />
          <button className="primary-button" onClick={send} disabled={loading}>{loading ? "Sending..." : "Send"}</button>
        </div>
      </div>
    </AppShell>
  );
}

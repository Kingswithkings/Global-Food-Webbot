"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sendChat } from "../lib/api";
import CartPanel from "./CartPanel";
import ProductList from "./ProductList";

type Msg = { role: "user" | "assistant"; text: string };

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  const k = "gfm_session_id";
  let v = localStorage.getItem(k);
  if (!v) {
    v = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(k, v);
  }
  return v;
}

export default function ChatWindow() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text:
        "Hi 👋\n" +
        "Welcome to Global Food Market Doncaster.\n" +
        "Contact: 07466600834\n\n" +
        "Tell me what you want to buy. Example: '2 indomie onion and rice 5kg'.",
    },
  ]);

  const [input, setInput] = useState("");
  const [cart, setCart] = useState<{ items: any[]; total: number; status: string } | null>({
    items: [],
    total: 0,
    status: "draft",
  });

  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !busy && !!sessionId,
    [input, busy, sessionId]
  );

  async function sendText(text: string) {
    const clean = (text || "").trim();
    if (!clean || !sessionId) return;

    setMessages((m) => [...m, { role: "user", text: clean }]);
    setBusy(true);

    try {
      const res = await sendChat(sessionId, clean);
      setMessages((m) => [...m, { role: "assistant", text: res.reply }]);
      if (res.cart) setCart(res.cart);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Sorry — API error. Check backend is running on http://localhost:8000.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function onSend() {
    if (!canSend) return;
    const text = input.trim();
    setInput("");
    await sendText(text);
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 900 }}>Global Food Market — Chat Order</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Session: {sessionId ? sessionId.slice(0, 8) : "..."}
        </div>
      </div>

      {/* OUTER 2 columns: LEFT products, RIGHT chat+cart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14 }}>
        {/* LEFT: Products */}
        <div
          style={{
            background: "#111a2e",
            borderRadius: 14,
            padding: 16,
            border: "1px solid #1d2b4a",
            minHeight: 560,
          }}
        >
          <ProductList
            busy={busy}
            height={470}
            onPlus={(name: string) => {
              if (!busy && sessionId) sendText(`1 ${name}`);
            }}
            onMinus={(name: string) => {
              if (!busy && sessionId) sendText(`remove ${name}`);
            }}
          />
        </div>

        {/* RIGHT: Chat + Cart together */}
        <div
          style={{
            background: "#111a2e",
            borderRadius: 14,
            padding: 16,
            border: "1px solid #1d2b4a",
            minHeight: 560,
          }}
        >
          {/* INNER grid: chat (wide) + cart (narrow) */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            {/* Chat */}
            <div
              style={{
                background: "#0b1324",
                borderRadius: 14,
                padding: 14,
                border: "1px solid #1d2b4a",
                minHeight: 520,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 10, color: "#e8eefc" }}>Chat</div>

              {/* Messages */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  flex: 1,
                  overflow: "auto",
                  paddingRight: 6,
                }}
              >
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      padding: "10px 12px",
                      borderRadius: 14,
                      background: m.role === "user" ? "#1b3a78" : "#111a2e",
                      border: "1px solid #1d2b4a",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.35,
                      color: "#e8eefc",
                    }}
                  >
                    {m.text}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => (e.key === "Enter" ? onSend() : null)}
                  placeholder="Type your order… (e.g., 2 indomie onion and rice 5kg)"
                  style={{
                    flex: 1,
                    padding: "12px 12px",
                    borderRadius: 12,
                    border: "1px solid #1d2b4a",
                    background: "#0b1324",
                    color: "#e8eefc",
                    outline: "none",
                  }}
                />
                <button
                  onClick={onSend}
                  disabled={!canSend}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid #1d2b4a",
                    background: canSend ? "#1b3a78" : "#0b1324",
                    color: "#e8eefc",
                    cursor: canSend ? "pointer" : "not-allowed",
                    fontWeight: 800,
                  }}
                >
                  {busy ? "..." : "Send"}
                </button>
              </div>

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75, color: "#e8eefc" }}>
                Tips: <b>show cart</b> • <b>remove rice</b> • <b>checkout</b>
              </div>
            </div>

            {/* Cart */}
            <div style={{ minHeight: 520 }}>
              <CartPanel
                items={cart?.items || []}
                total={cart?.total || 0}
                status={cart?.status || "draft"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
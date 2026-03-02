export type CartItem = {
  sku: string;
  name: string;
  qty: number;
  unit: string;
  unit_price: number;
  line_total: number;
};

export type ChatResponse = {
  reply: string;
  cart: null | { items: CartItem[]; total: number; status: string };
  needs_admin: boolean;
  order_id: number;
};

export async function sendChat(sessionId: string, message: string): Promise<ChatResponse> {
  const res = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
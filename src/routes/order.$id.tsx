import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type OrderItem = {
  name: string;
  qty: number;
  price: number;
  img?: string | null;
  options?: string | null;
  variant?: string | null;
  notes?: string | null;
};

type Order = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  items: OrderItem[];
  total: number;
  created_at: string;
  delivery_date?: string | null;
  notes?: string | null;
};

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [
      { title: "Order Summary — Selam Cake & Arts" },
      { name: "robots", content: "noindex" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div style={{ padding: 24, fontFamily: "system-ui", color: "#7a6a58" }}>
      Could not load this order. {error?.message ?? ""}
    </div>
  ),
  component: OrderSummary,
});

function OrderSummary() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  function decodeOrderSummaryToken(token: string): Order | null {
    try {
      const normalized = token.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
      return JSON.parse(decodeURIComponent(escape(atob(padded)))) as Order;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadFailed(false);

    if (typeof window !== "undefined") {
      const token = new URLSearchParams(window.location.search).get("summary");
      const linkedOrder = token ? decodeOrderSummaryToken(token) : null;
      if (linkedOrder?.id === id) {
        setOrder(linkedOrder);
        setLoading(false);
        return () => {
          alive = false;
        };
      }
    }

    if (alive) {
      setOrder(null);
      setLoadFailed(true);
      setLoading(false);
    }

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!order || typeof window === "undefined") return;
    if (window.location.hash === "#ordered-items") {
      requestAnimationFrame(() => {
        const el = document.getElementById("ordered-items");
        if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }
  }, [order]);

  if (loading || !order) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#faf7f2",
          padding: "48px 16px",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          color: "#2b2118",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontSize: 13, letterSpacing: 1, color: "#a97a4a", textTransform: "uppercase" }}>
            Selam Cake & Arts
          </div>
          <h1 style={{ fontSize: 24, margin: "10px 0 8px" }}>
            {loading ? "Loading order summary" : "Order not available"}
          </h1>
          <p style={{ color: "#7a6a58", fontSize: 14 }}>
            {loadFailed
              ? "We couldn't open this order link. Please ask the customer to resend the Telegram message."
              : "Please wait while we open the saved order details."}
          </p>
          {!loading && (
            <p style={{ marginTop: 8, fontSize: 12, color: "#a97a4a" }}>
              Reference: {id.slice(0, 8).toUpperCase()}
            </p>
          )}
        </div>
      </div>
    );
  }

  const items: OrderItem[] = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
  const shortId = order.id.slice(0, 8).toUpperCase();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf7f2",
        padding: "24px 16px",
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        color: "#2b2118",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(80, 45, 20, 0.08)",
          padding: 24,
        }}
      >
        <header style={{ borderBottom: "1px solid #efe6d9", paddingBottom: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, letterSpacing: 1, color: "#a97a4a", textTransform: "uppercase" }}>
            Selam Cake & Arts
          </div>
          <h1 style={{ fontSize: 26, margin: "6px 0 4px" }}>Order #{shortId}</h1>
          <div style={{ fontSize: 13, color: "#7a6a58" }}>
            {new Date(order.created_at).toLocaleString()}
          </div>
        </header>

        <section id="ordered-items" style={{ marginBottom: 20, scrollMarginTop: 16 }}>
          <h2 style={{ fontSize: 16, margin: "0 0 8px" }}>Ordered Items</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map((it, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid #f2eadd",
                  alignItems: "center",
                }}
              >
                {it.img ? (
                  <img
                    src={it.img}
                    alt={it.name}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 10,
                      objectFit: "cover",
                      flexShrink: 0,
                      background: "#f4ecdf",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 10,
                      background: "#f4ecdf",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{it.name}</div>
                  {(it.variant || it.options) && (
                    <div style={{ fontSize: 13, color: "#7a6a58" }}>
                      {[it.variant, it.options].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: "#7a6a58" }}>
                    Qty {it.qty} × ETB {it.price}
                  </div>
                  {it.notes && (
                    <div style={{ fontSize: 12, color: "#7a6a58", marginTop: 2 }}>
                      Note: {it.notes}
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  ETB {it.price * it.qty}
                </div>
              </li>
            ))}
          </ul>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "14px 0 0",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            <span>Total</span>
            <span>ETB {order.total}</span>
          </div>
        </section>

        <section style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 16, margin: "0 0 8px" }}>Customer</h2>
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>
            {order.customer_name && (
              <div>
                <strong>Name:</strong> {order.customer_name}
              </div>
            )}
            {order.customer_phone && (
              <div>
                <strong>Phone:</strong> {order.customer_phone}
              </div>
            )}
            {order.customer_address && (
              <div>
                <strong>Delivery Address:</strong> {order.customer_address}
              </div>
            )}
            {!order.customer_name && !order.customer_phone && !order.customer_address && (
              <div style={{ color: "#7a6a58" }}>No customer details provided.</div>
            )}
          </div>
        </section>

        {order.notes && (
          <section style={{ marginTop: 16 }}>
            <h2 style={{ fontSize: 16, margin: "0 0 6px" }}>Notes</h2>
            <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{order.notes}</div>
          </section>
        )}
      </div>
    </div>
  );
}

import React from "react";
import { Sparkles, ChevronRight } from "lucide-react";

export default function Hero({ onShop }) {
  return (
    <section style={{ textAlign: "center", padding: "60px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <span style={{ fontSize: 14, fontWeight: "bold", color: "#E63946", textTransform: "uppercase", letterSpacing: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}>
          <Sparkles size={14} /> Fresh stock, everyday
        </span>
        <h1 style={{ fontSize: 48, fontWeight: 800, margin: "0 0 16px 0", lineHeight: 1.1 }}>Siyasital Store,<br />minus the wait.</h1>
        <p style={{ fontSize: 18, color: "#666", marginBottom: 32 }}>Order online, skip the line & pick up ready from the store counter.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="mm-btn-primary" onClick={onShop}>Start shopping <ChevronRight size={16} /></button>
        </div>
      </div>
    </section>
  );
}

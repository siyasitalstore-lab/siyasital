import React from "react";
import { X, Minus, Plus, ChevronRight, MessageSquare, Store } from "lucide-react";
import { money, STORE_CONFIG, getWhatsAppUrl } from "../data/store";

export default function CartDrawer({ items, subtotal, onChange, onClose, onCheckout }) {
  const handleQuickWhatsApp = () => {
    let msg = `🛍️ *Order Query from Siyasital Store Basket*\n\n`;
    items.forEach((i, idx) => {
      msg += `${idx + 1}. ${i.name} x ${i.qty} = ${money(i.price * i.qty)}\n`;
    });
    msg += `\n*Total Amount:* ${money(subtotal)}\n`;
    msg += `Hello, are these items available in store? I would like to place an order for store pickup.`;
    
    const url = getWhatsAppUrl(STORE_CONFIG.whatsappNumber, msg);
    window.open(url, "_blank");
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", justifyContent: "flex-end", animation: "fadeIn 0.2s" }} onClick={onClose}>
      <div style={{ background: "var(--surface)", width: "100%", maxWidth: 420, height: "100%", display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", animation: "scaleIn 0.2s" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, color: "var(--text-dark)", fontWeight: 800 }}>Your Basket</h3>
            <span style={{ fontSize: 12, color: "var(--text-gray)" }}>{items.reduce((s, i) => s + i.qty, 0)} items selected</span>
          </div>
          <button className="mm-iconbtn" style={{ background: "#f1f5f9", padding: 8 }} onClick={onClose}><X size={18} /></button>
        </div>

        {/* Store Pickup Banner */}
        {items.length > 0 && (
          <div style={{ 
            background: "#ecfdf5", 
            padding: "10px 20px", 
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10, fontSize: 13,
            color: "#065f46"
          }}>
            <Store size={16} />
            <span>
              <strong>Store Counter Pickup • Ready in {STORE_CONFIG.pickupTime}</strong> (Fast Checkout)
            </span>
          </div>
        )}

        {items.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--text-gray)" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
            <h4 style={{ fontSize: 18, color: "var(--text-dark)", marginBottom: 8 }}>Your basket is empty</h4>
            <p style={{ fontSize: 14 }}>Add daily essentials, snacks, and sweets for instant store pickup.</p>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            {items.map((i) => (
              <div key={i.id} style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18, background: "white", padding: 12, borderRadius: 12, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 28, background: "#f8fafc", width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10 }}>{i.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-dark)", marginBottom: 2 }}>{i.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-gray)", fontWeight: 600 }}>{money(i.price)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--primary)', borderRadius: 'var(--radius-sm)', padding: '4px', width: 76, justifyContent: 'space-between', color: 'white' }}>
                  <button onClick={() => onChange(i.id, -1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}><Minus size={14} /></button>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{i.qty}</span>
                  <button onClick={() => onChange(i.id, 1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}><Plus size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div style={{ padding: 20, borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
            <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-dark)" }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Total Amount</span>
              <strong style={{ fontSize: 20, fontWeight: 800 }}>{money(subtotal)}</strong>
            </div>

            <button 
              className="mm-btn-primary" 
              style={{ width: "100%", padding: "14px", fontSize: 15, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 10, fontWeight: 700 }} 
              onClick={onCheckout}
            >
              Order for Store Pickup <ChevronRight size={18} />
            </button>

            <button 
              type="button"
              onClick={handleQuickWhatsApp}
              style={{ 
                width: "100%", padding: "12px", fontSize: 14, fontWeight: 700,
                background: "#25D366", color: "white", border: "none", borderRadius: "var(--radius-sm)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}
            >
              <MessageSquare size={16} />
              <span>Ask Shopkeeper on WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

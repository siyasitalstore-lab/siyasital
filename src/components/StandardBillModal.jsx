import React from "react";
import { 
  Store, Printer, MessageSquare, X, CheckCircle, 
  Clock, Phone, User, QrCode, FileText, Check, ShieldCheck 
} from "lucide-react";
import { money, orderTotal, STORE_CONFIG } from "../data/store";

function numberToWordsIN(num) {
  const n = Math.floor(Number(num) || 0);
  if (n <= 0) return "Zero Rupees Only";
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  try {
    const numStr = ('000000000' + n).substr(-9);
    const parts = numStr.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!parts) return `${n} Rupees Only`;

    let str = '';
    str += (parts[1] !== '00') ? (a[Number(parts[1])] || b[parts[1][0]] + ' ' + a[parts[1][1]]) + 'Crore ' : '';
    str += (parts[2] !== '00') ? (a[Number(parts[2])] || b[parts[2][0]] + ' ' + a[parts[2][1]]) + 'Lakh ' : '';
    str += (parts[3] !== '00') ? (a[Number(parts[3])] || b[parts[3][0]] + ' ' + a[parts[3][1]]) + 'Thousand ' : '';
    str += (parts[4] !== '0') ? a[Number(parts[4])] + 'Hundred ' : '';
    str += (parts[5] !== '00') ? ((str !== '') ? 'and ' : '') + (a[Number(parts[5])] || b[parts[5][0]] + ' ' + a[parts[5][1]]) : '';
    return (str.trim() || `${n}`) + " Rupees Only";
  } catch {
    return `${n} Rupees Only`;
  }
}

export default function StandardBillModal({ order, onClose }) {
  if (!order) return null;

  const total = order.total || orderTotal(order);
  const totalItemsCount = (order.items || []).length;
  const totalUnitsCount = (order.items || []).reduce((s, i) => s + (i.qty || 1), 0);
  const isKhata = (order.payment || "").toLowerCase() === "khata";
  const isUpi = (order.payment || "").toLowerCase() === "upi";
  const isCash = !isKhata && !isUpi;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = (order.phone || "").replace(/[^0-9]/g, "");
    let text = `🧾 *Tax Invoice / Cash Memo - ${STORE_CONFIG.name}*\n`;
    text += `*Bill No:* #${order.id}\n`;
    text += `*Date & Time:* ${order.date || "Today"} • ${order.time || ""}\n`;
    text += `*Customer:* ${order.customer} (${order.phone || "-"})\n`;
    text += `*Store Pickup:* ${STORE_CONFIG.address}\n\n`;
    text += `📦 *Items List:*\n`;

    if (order.isParchi) {
      text += `📝 Grocery List / Slip: ${order.parchiText || "Handwritten Grocery List"}\n`;
    } else {
      (order.items || []).forEach((item, idx) => {
        text += `${idx + 1}. ${item.name} x ${item.qty} = ${money(item.price * item.qty)}\n`;
      });
    }

    text += `\n*Total Bill Amount: ${money(total)}*\n`;
    text += `(${numberToWordsIN(total)})\n\n`;
    text += `*Payment Mode:* ${isUpi ? "📱 Direct UPI QR" : isKhata ? "📒 Store Credit / Ledger Account" : "💵 Cash at Counter"}\n`;
    text += `*Status:* ${order.status || "Completed"}\n\n`;
    text += `*Pickup Notice:* Please verify items at the pickup counter.\n`;
    text += `Thank you for shopping with us! Have a great day 🙏\n${STORE_CONFIG.name}`;

    if (cleanPhone && cleanPhone !== "-") {
      window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  return (
    <div 
      className="standard-bill-overlay"
      style={{ 
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
        background: "rgba(15, 23, 42, 0.75)", zIndex: 1200, 
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16 
      }}
      onClick={onClose}
    >
      <div 
        className="standard-bill-container"
        style={{ 
          width: "100%", maxWidth: 620, maxHeight: "92vh", overflowY: "auto", 
          background: "white", borderRadius: 16, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          animation: "scaleIn 0.2s ease", position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Screen Action Bar (Hidden during Print) */}
        <div 
          className="no-print"
          style={{ 
            display: "flex", justifyContent: "space-between", alignItems: "center", 
            padding: "14px 24px", background: "#f8fafc", borderBottom: "1px solid var(--border)" 
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-gray)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Standard Store Receipt
            </span>
            <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 800 }}>
              Official Bill
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: "white", border: "1px solid var(--border)", padding: "7px 14px",
                borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, color: "var(--text-dark)"
              }}
            >
              <Printer size={15} /> Print Bill
            </button>
            <button
              type="button"
              onClick={handleWhatsAppShare}
              style={{
                background: "#25d366", border: "none", color: "white", padding: "7px 14px",
                borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6
              }}
            >
              <MessageSquare size={15} /> WhatsApp
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#f1f5f9", border: "none", width: 34, height: 34,
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-gray)"
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINTABLE BILL CANVAS */}
        <div 
          id="printable-bill"
          style={{ 
            padding: "28px 32px", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            color: "#0f172a", background: "white"
          }}
        >
          {/* 1. Store Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: 18, marginBottom: 18 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
              <span style={{ fontSize: 24 }}>🏪</span>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#0f172a", letterSpacing: -0.5 }}>
                {STORE_CONFIG.name}
              </h1>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginTop: 2 }}>
              {STORE_CONFIG.tagline}
            </div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
              📍 <strong>Counter Pickup Store:</strong> {STORE_CONFIG.address}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              📞 Helpline: {STORE_CONFIG.whatsappNumber} • UPI ID: {STORE_CONFIG.upiId}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
              <span>FSSAI / SHOP REG: MM/2026/DL-4928</span>
              <span>•</span>
              <span>GSTIN: 07AAAAA0000A1Z5</span>
            </div>
          </div>

          {/* 2. Bill Meta Strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#f8fafc", padding: "12px 16px", borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 18, fontSize: 13 }}>
            <div>
              <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", fontWeight: 700 }}>Invoice / Bill No.</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>#{order.id}</div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                📅 <strong>Date:</strong> {order.date || "Today"} • {order.time || ""}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", fontWeight: 700 }}>Customer Name & Phone</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{order.customer}</div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                📞 {order.phone || "Store Walk-in"}
              </div>
            </div>
          </div>

          {/* 3. Fulfillment Notice */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "8px 14px", borderRadius: 8, marginBottom: 18, fontSize: 12, color: "#166534" }}>
            <span><strong>Fulfillment:</strong> 🏬 Store Pickup (Counter Click & Collect)</span>
            <span style={{ fontWeight: 700 }}>No Delivery Fee (₹0)</span>
          </div>

          {/* 4. Samaan Items Table (Exact Items Breakdown) */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Purchased Items Breakdown
            </div>

            {order.isParchi ? (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: 14 }}>
                <div style={{ fontWeight: 800, color: "#92400e", fontSize: 13, marginBottom: 4 }}>
                  📝 Grocery List / Handwritten Slip Order
                </div>
                <div style={{ fontSize: 13, color: "#78350f", whiteSpace: "pre-wrap" }}>
                  {order.parchiText || "Handwritten Grocery List"}
                </div>
                {order.parchiImage && (
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    <a href={order.parchiImage} target="_blank" rel="noreferrer" style={{ color: "#b45309", fontWeight: 700, textDecoration: "underline" }}>
                      View Uploaded Slip Photo ↗
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #0f172a", borderTop: "1px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "8px 6px", width: 30, textAlign: "center" }}>#</th>
                    <th style={{ padding: "8px 6px" }}>Item Description & Size</th>
                    <th style={{ padding: "8px 6px", textAlign: "center", width: 60 }}>Qty</th>
                    <th style={{ padding: "8px 6px", textAlign: "right", width: 80 }}>Rate</th>
                    <th style={{ padding: "8px 6px", textAlign: "right", width: 90 }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "10px 6px", textAlign: "center", color: "#64748b", fontSize: 12 }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "10px 6px", fontWeight: 600, color: "#0f172a" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span>{item.emoji || "•"}</span>
                          <span>{item.name}</span>
                        </div>
                        {item.unit && (
                          <div style={{ fontSize: 11, color: "#64748b", paddingLeft: 22 }}>
                            {item.unit}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "10px 6px", textAlign: "center", fontWeight: 700 }}>
                        {item.qty}
                      </td>
                      <td style={{ padding: "10px 6px", textAlign: "right", color: "#475569" }}>
                        {money(item.price)}
                      </td>
                      <td style={{ padding: "10px 6px", textAlign: "right", fontWeight: 800, color: "#0f172a" }}>
                        {money(item.price * item.qty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 5. Financial Summary Breakdown */}
          <div style={{ borderTop: "2px solid #0f172a", paddingTop: 14, marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569", marginBottom: 6 }}>
              <span>Total Items / Total Units:</span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{totalItemsCount} items ({totalUnitsCount} units)</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569", marginBottom: 6 }}>
              <span>Subtotal Amount:</span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>{money(order.subtotal || total)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569", marginBottom: 8 }}>
              <span>Store Pickup Handling:</span>
              <span style={{ fontWeight: 700, color: "#16a34a" }}>FREE (₹0)</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 900, color: "#0f172a", borderTop: "1px dashed #cbd5e1", paddingTop: 10, marginBottom: 6 }}>
              <span>Grand Total Payable:</span>
              <span style={{ color: "var(--brand)" }}>{money(total)}</span>
            </div>

            <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", textAlign: "right" }}>
              Amount in words: <strong>{numberToWordsIN(total)}</strong>
            </div>
          </div>

          {/* 6. Payment & Settlement Status */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 16px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Payment Method</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
                {isUpi && "📱 Direct UPI QR (PhonePe / GPay / Paytm)"}
                {isCash && "💵 Cash at Store Counter"}
                {isKhata && "📒 Store Credit / Ledger Account"}
              </div>
              {order.utr && (
                <div style={{ fontSize: 11, color: "#2563eb", marginTop: 2 }}>
                  UTR / Ref: <strong>{order.utr}</strong>
                </div>
              )}
            </div>

            <div>
              <span style={{ 
                padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 800,
                background: isKhata ? "#fee2e2" : "#dcfce7",
                color: isKhata ? "#991b1b" : "#166534",
                border: isKhata ? "1px solid #fca5a5" : "1px solid #86efac",
                display: "inline-flex", alignItems: "center", gap: 6
              }}>
                <CheckCircle size={15} />
                {isKhata ? "CHARGED TO STORE CREDIT" : "PAID IN FULL"}
              </span>
            </div>
          </div>

          {/* 7. Store Terms & Footer */}
          <div style={{ textAlign: "center", borderTop: "1px dashed #cbd5e1", paddingTop: 14, fontSize: 11, color: "#64748b" }}>
            <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>
              * Please inspect items at the pickup counter. Returns or exchanges accepted within 24 hours with this receipt.
            </p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#0f172a" }}>
              🙏 Thank you for shopping with Siyasital Store! Have a great day! 🙏
            </p>
          </div>
        </div>

        {/* Bottom Actions Bar (Hidden during Print) */}
        <div 
          className="no-print"
          style={{ 
            display: "flex", gap: 12, padding: "16px 28px", 
            background: "#f8fafc", borderTop: "1px solid var(--border)" 
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="mm-btn"
            style={{ flex: 1, padding: 12, background: "white", color: "var(--text-dark)", fontWeight: 700 }}
          >
            Close Bill
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="mm-btn"
            style={{ flex: 1, padding: 12, background: "#0f172a", color: "white", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <Printer size={16} /> Print Receipt (Thermal / A4)
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="mm-btn-primary"
            style={{ flex: 1, padding: 12, background: "#25d366", color: "white", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <MessageSquare size={16} /> Send via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}


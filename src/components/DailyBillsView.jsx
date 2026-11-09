import React, { useState, useMemo } from "react";
import { 
  Receipt, Search, Calendar, Filter, Clock, User, Phone, CheckCircle, 
  ChevronRight, Eye, Printer, MessageSquare, ArrowUpRight, DollarSign,
  ShoppingBag, X, FileText, Check, AlertCircle, Sparkles, Store
} from "lucide-react";
import { money, orderTotal, STORE_CONFIG, normalizeDate } from "../data/store";
import StandardBillModal from "./StandardBillModal";

export default function DailyBillsView({ orders = [], products = [], updateOrders, isManager = false }) {
  const [selectedDateFilter, setSelectedDateFilter] = useState("TODAY"); // "TODAY", "ALL", "CUSTOM"
  const [customDate, setCustomDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL"); // "ALL", "upi", "cod", "khata"
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeBillModal, setActiveBillModal] = useState(null);

  // Today formatted string
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }, []);

  // Filter orders by date, search, payment mode
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Date filter
      if (selectedDateFilter === "TODAY") {
        const oNorm = normalizeDate(o.date);
        const tNorm = normalizeDate(todayFormatted);
        // Also match if date is today or matches todayFormatted
        if (oNorm !== tNorm && o.date !== "Today" && o.date !== todayFormatted) {
          return false;
        }
      } else if (selectedDateFilter === "CUSTOM") {
        const oNorm = normalizeDate(o.date);
        const cNorm = normalizeDate(customDate);
        if (oNorm !== cNorm) return false;
      }

      // Payment filter
      if (paymentFilter !== "ALL") {
        const p = (o.payment || "").toLowerCase();
        if (paymentFilter === "cod" && p !== "cod" && p !== "cash") return false;
        if (paymentFilter === "upi" && p !== "upi") return false;
        if (paymentFilter === "khata" && p !== "khata") return false;
      }

      // Status filter
      if (statusFilter !== "ALL" && o.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = (o.id || "").toLowerCase().includes(q);
        const matchCust = (o.customer || "").toLowerCase().includes(q);
        const matchPhone = (o.phone || "").includes(q);
        const matchItem = (o.items || []).some(i => (i.name || "").toLowerCase().includes(q));
        if (!matchId && !matchCust && !matchPhone && !matchItem) return false;
      }

      return true;
    });
  }, [orders, selectedDateFilter, customDate, todayFormatted, paymentFilter, statusFilter, searchQuery]);

  // Aggregate stats for currently filtered view
  const stats = useMemo(() => {
    let totalAmount = 0;
    let cashTotal = 0;
    let cashCount = 0;
    let upiTotal = 0;
    let upiCount = 0;
    let khataTotal = 0;
    let khataCount = 0;

    filteredOrders.forEach(o => {
      if (o.status !== "Cancelled") {
        const amt = o.total || orderTotal(o);
        totalAmount += amt;

        const p = (o.payment || "").toLowerCase();
        if (p === "cash" || p === "cod") {
          cashTotal += amt;
          cashCount++;
        } else if (p === "upi") {
          upiTotal += amt;
          upiCount++;
        } else if (p === "khata") {
          khataTotal += amt;
          khataCount++;
        }
      }
    });

    return {
      totalBills: filteredOrders.length,
      totalAmount,
      cashTotal,
      cashCount,
      upiTotal,
      upiCount,
      khataTotal,
      khataCount
    };
  }, [filteredOrders]);

  const sendInvoiceWhatsApp = (order) => {
    const cleanPhone = (order.phone || "").replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone === "-") {
      alert("Customer phone number not available.");
      return;
    }
    const amt = order.total || orderTotal(order);
    let text = `🧾 *Bill Receipt - ${STORE_CONFIG.name}*\n`;
    text += `*Bill No:* #${order.id}\n`;
    text += `*Date & Time:* ${order.date || todayFormatted} • ${order.time || ""}\n`;
    text += `*Customer:* ${order.customer} (${order.phone})\n`;
    text += `*Pickup Store:* ${STORE_CONFIG.address}\n\n`;
    text += `📦 *Purchased Items:*\n`;

    if (order.isParchi) {
      text += `📝 Grocery List Slip: ${order.parchiText || "Handwritten Grocery Slip"}\n`;
    } else {
      (order.items || []).forEach((item, idx) => {
        text += `${idx + 1}. ${item.name} x ${item.qty} = ${money(item.price * item.qty)}\n`;
      });
    }

    text += `\n*Total Bill Amount: ${money(amt)}*\n`;
    text += `*Payment Mode:* ${
      order.payment === "upi" ? "📱 Direct UPI QR" :
      order.payment === "khata" ? "📒 Store Credit (Ledger)" : "💵 Cash at Counter"
    }\n`;
    text += `*Status:* ${order.status || "Completed"}\n\n`;
    text += `Thank you for shopping with us! Visit again 🙏`;

    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const printBill = (order) => {
    window.print();
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h2 style={{ fontSize: 28, margin: 0, color: "var(--text-dark)", fontWeight: 800 }}>
              Daily Bills & Invoices Register
            </h2>
            <span style={{ background: "#fef3c7", color: "#b45309", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              Live Register
            </span>
          </div>
          <p style={{ margin: 0, color: "var(--text-gray)", fontSize: 14 }}>
            Complete register of all daily store invoices, sales summaries, and item-level breakdowns.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", padding: 6, borderRadius: 10, border: "1px solid var(--border)" }}>
          <button
            type="button"
            onClick={() => setSelectedDateFilter("TODAY")}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: selectedDateFilter === "TODAY" ? "var(--brand)" : "transparent",
              color: selectedDateFilter === "TODAY" ? "white" : "var(--text-dark)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            Today ({todayFormatted})
          </button>
          <button
            type="button"
            onClick={() => setSelectedDateFilter("ALL")}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: selectedDateFilter === "ALL" ? "var(--brand)" : "transparent",
              color: selectedDateFilter === "ALL" ? "white" : "var(--text-dark)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            All Dates
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, borderLeft: "1px solid var(--border)", paddingLeft: 8 }}>
            <Calendar size={16} color="var(--text-gray)" />
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setSelectedDateFilter("CUSTOM");
              }}
              style={{
                border: "none",
                background: selectedDateFilter === "CUSTOM" ? "#fef3c7" : "transparent",
                padding: "6px 10px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-dark)",
                cursor: "pointer"
              }}
            />
          </div>
        </div>
      </div>

      {/* Daily Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginBottom: 26 }}>
        {/* Total Billed */}
        <div className="mm-card" style={{ padding: 20, borderLeft: "4px solid var(--brand)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-gray)", textTransform: "uppercase" }}>Total Billed</span>
            <Receipt size={18} color="var(--brand)" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-dark)", marginBottom: 4 }}>
            {money(stats.totalAmount)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
            {stats.totalBills} bills generated
          </div>
        </div>

        {/* Cash Drawer */}
        <div className="mm-card" style={{ padding: 20, borderLeft: "4px solid #16a34a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-gray)", textTransform: "uppercase" }}>Cash Counter</span>
            <span style={{ fontSize: 16 }}>💵</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#16a34a", marginBottom: 4 }}>
            {money(stats.cashTotal)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
            {stats.cashCount} cash bills
          </div>
        </div>

        {/* UPI Payments */}
        <div className="mm-card" style={{ padding: 20, borderLeft: "4px solid #2563eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-gray)", textTransform: "uppercase" }}>Direct UPI QR</span>
            <span style={{ fontSize: 16 }}>📱</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#2563eb", marginBottom: 4 }}>
            {money(stats.upiTotal)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
            {stats.upiCount} digital bank receipts
          </div>
        </div>

        {/* Store Credit Dues */}
        <div className="mm-card" style={{ padding: 20, borderLeft: "4px solid #ea580c" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-gray)", textTransform: "uppercase" }}>Store Credit (Due)</span>
            <span style={{ fontSize: 16 }}>📒</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#ea580c", marginBottom: 4 }}>
            {money(stats.khataTotal)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
            {stats.khataCount} ledger credit bills
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mm-block" style={{ padding: 18, marginBottom: 24, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-gray)" }} />
          <input
            type="text"
            className="mm-input"
            style={{ paddingLeft: 42, background: "#f8fafc" }}
            placeholder="Search by Bill #ID, Customer Name, Phone, or Item name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Payment Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-gray)" }}>Payment:</span>
          <select
            className="mm-input"
            style={{ padding: "8px 12px", width: "auto", background: "#f8fafc" }}
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="ALL">All Payment Modes</option>
            <option value="upi">📱 UPI QR</option>
            <option value="cod">💵 Cash Counter</option>
            <option value="khata">📒 Store Credit (Due)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-gray)" }}>Status:</span>
          <select
            className="mm-input"
            style={{ padding: "8px 12px", width: "auto", background: "#f8fafc" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Ready">Ready for Pickup</option>
            <option value="Preparing">Preparing</option>
            <option value="New">New</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      {filteredOrders.length === 0 ? (
        <div className="mm-block" style={{ textAlign: "center", padding: 60, color: "var(--text-gray)" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🧾</div>
          <h3 style={{ margin: "0 0 6px 0", color: "var(--text-dark)", fontSize: 18 }}>No bills found for the selected filter.</h3>
          <p style={{ margin: 0, fontSize: 14 }}>Try selecting "All Dates" or changing search query.</p>
        </div>
      ) : (
        <div className="mm-block" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)", color: "var(--text-gray)", fontSize: 13 }}>
                  <th style={{ padding: "16px 20px", fontWeight: 700 }}>Bill # ID</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700 }}>Date & Time</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700 }}>Customer</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700 }}>Items Sold</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700 }}>Payment Mode</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700 }}>Total Bill</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const billTotal = order.total || orderTotal(order);
                  const itemCount = (order.items || []).reduce((s, i) => s + (i.qty || 1), 0);

                  return (
                    <tr 
                      key={order.id} 
                      style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s ease" }}
                      className="table-row-hover"
                    >
                      {/* Bill ID */}
                      <td style={{ padding: "16px 20px", fontWeight: 800, color: "var(--text-dark)", fontSize: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span>#{order.id}</span>
                          {order.isParchi && (
                            <span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 800 }}>
                              GROCERY SLIP
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--text-gray)" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-dark)" }}>{order.date || todayFormatted}</div>
                        <div style={{ fontSize: 12 }}>{order.time || "Pickup"}</div>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: "16px 20px", fontSize: 13 }}>
                        <div style={{ fontWeight: 700, color: "var(--text-dark)" }}>{order.customer}</div>
                        <div style={{ color: "var(--text-gray)", fontSize: 12 }}>{order.phone || "-"}</div>
                      </td>

                      {/* Samaan Items Breakdown Preview */}
                      <td style={{ padding: "16px 20px", fontSize: 13 }}>
                        {order.isParchi ? (
                          <div style={{ color: "#b45309", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            📝 {order.parchiText ? (order.parchiText.length > 30 ? order.parchiText.substring(0, 30) + "..." : order.parchiText) : "Handwritten Grocery Slip"}
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: 280 }}>
                              {(order.items || []).slice(0, 2).map((item, idx) => (
                                <span 
                                  key={idx} 
                                  style={{ background: "#f1f5f9", padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "var(--text-dark)", display: "inline-flex", alignItems: "center", gap: 4 }}
                                >
                                  <span>{item.emoji || "📦"}</span>
                                  <span>{item.name}</span>
                                  <strong style={{ color: "var(--brand)" }}>x{item.qty}</strong>
                                </span>
                              ))}
                              {(order.items || []).length > 2 && (
                                <span style={{ background: "#e2e8f0", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "var(--text-gray)" }}>
                                  +{(order.items || []).length - 2} more
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-gray)", marginTop: 4 }}>
                              {itemCount} total units
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Payment Mode */}
                      <td style={{ padding: "16px 20px", fontSize: 13 }}>
                        <span style={{ 
                          display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: order.payment === "upi" ? "#eff6ff" : order.payment === "khata" ? "#fff7ed" : "#f0fdf4",
                          color: order.payment === "upi" ? "#1d4ed8" : order.payment === "khata" ? "#c2410c" : "#15803d"
                        }}>
                          {order.payment === "upi" && "📱 UPI QR"}
                          {order.payment === "khata" && "📒 Store Credit"}
                          {(order.payment === "cod" || order.payment === "cash") && "💵 Cash Counter"}
                        </span>
                      </td>

                      {/* Total */}
                      <td style={{ padding: "16px 20px", fontSize: 16, fontWeight: 800, color: "var(--text-dark)" }}>
                        {money(billTotal)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{ 
                          padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: order.status === "Completed" ? "#f1f5f9" : order.status === "Ready" ? "#dcfce7" : order.status === "Preparing" ? "#fef3c7" : "#fee2e2",
                          color: order.status === "Completed" ? "#475569" : order.status === "Ready" ? "#15803d" : order.status === "Preparing" ? "#b45309" : "#dc2626"
                        }}>
                          {order.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "16px 20px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => setActiveBillModal(order)}
                            className="mm-btn"
                            style={{ 
                              background: "#f1f5f9", 
                              color: "var(--text-dark)", 
                              padding: "6px 12px", 
                              fontSize: 12, 
                              fontWeight: 700, 
                              display: "flex", 
                              alignItems: "center", 
                              gap: 4 
                            }}
                            title="View itemized receipt breakdown"
                          >
                            <Eye size={14} /> View Items
                          </button>

                          <button
                            type="button"
                            onClick={() => sendInvoiceWhatsApp(order)}
                            className="mm-btn"
                            style={{ 
                              background: "#dcfce7", 
                              color: "#166534", 
                              padding: "6px 10px", 
                              fontSize: 12, 
                              fontWeight: 700, 
                              border: "1px solid #bbf7d0" 
                            }}
                            title="Share Receipt on WhatsApp"
                          >
                            <MessageSquare size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STANDARDIZED BILL MODAL */}
      {activeBillModal && (
        <StandardBillModal 
          order={activeBillModal} 
          onClose={() => setActiveBillModal(null)} 
        />
      )}
    </div>
  );
}


import React, { useState, useMemo } from "react";
import { 
  Receipt, Search, Calendar, Filter, Clock, User, Phone, CheckCircle, 
  ChevronRight, Eye, Printer, MessageSquare, ArrowUpRight, DollarSign,
  ShoppingBag, X, FileText, Check, AlertCircle, Sparkles, Store,
  Edit3, Trash2, Plus, Minus, Save, AlertTriangle
} from "lucide-react";
import { money, orderTotal, STORE_CONFIG, normalizeDate } from "../data/store";
import StandardBillModal from "./StandardBillModal";

export default function DailyBillsView({ 
  orders = [], 
  products = [], 
  updateOrders, 
  isManager = false, 
  isAdmin = false, 
  user = null 
}) {
  const canAdminManage = Boolean(isAdmin && !isManager);

  const [selectedDateFilter, setSelectedDateFilter] = useState("TODAY"); // "TODAY", "ALL", "CUSTOM"
  const [customDate, setCustomDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL"); // "ALL", "upi", "cod", "khata"
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeBillModal, setActiveBillModal] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [selectedAddProductId, setSelectedAddProductId] = useState("");

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

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const startEditOrder = (order) => {
    setEditingOrder(order);
    setEditForm({
      id: order.id,
      customer: order.customer || "",
      phone: order.phone || "",
      payment: (order.payment || "cash").toLowerCase(),
      status: order.status || "Completed",
      date: order.date || todayFormatted,
      time: order.time || "",
      notes: order.notes || "",
      isParchi: Boolean(order.isParchi),
      parchiText: order.parchiText || "",
      items: (order.items || []).map(i => ({
        name: i.name || "Item",
        qty: Number(i.qty) || 1,
        price: Number(i.price) || 0,
        unit: i.unit || "",
        emoji: i.emoji || "📦"
      })),
      manualTotal: Number(order.total) || orderTotal(order)
    });
  };

  const handleUpdateItem = (index, field, value) => {
    if (!editForm) return;
    const updatedItems = [...editForm.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === "qty" || field === "price" ? Math.max(0, Number(value) || 0) : value
    };
    setEditForm({ ...editForm, items: updatedItems });
  };

  const handleRemoveItem = (index) => {
    if (!editForm) return;
    const updatedItems = editForm.items.filter((_, idx) => idx !== index);
    setEditForm({ ...editForm, items: updatedItems });
  };

  const handleAddItem = (productId) => {
    if (!productId || !editForm) return;
    const prod = products.find(p => String(p.id) === String(productId));
    if (!prod) return;
    const newItem = {
      name: prod.name,
      qty: 1,
      price: Number(prod.price) || 0,
      unit: prod.unit || "",
      emoji: prod.emoji || "📦"
    };
    setEditForm({ ...editForm, items: [...editForm.items, newItem] });
    setSelectedAddProductId("");
  };

  const handleAddCustomItem = () => {
    if (!editForm) return;
    const newItem = {
      name: "Custom Grocery Item",
      qty: 1,
      price: 10,
      unit: "pc",
      emoji: "📦"
    };
    setEditForm({ ...editForm, items: [...editForm.items, newItem] });
  };

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    if (!canAdminManage || !editForm || !editingOrder) return;
    if (!editForm.customer.trim()) {
      alert("Customer name is required.");
      return;
    }

    const calculatedTotal = editForm.isParchi
      ? Number(editForm.manualTotal) || 0
      : editForm.items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);

    const updatedOrder = {
      ...editingOrder,
      customer: editForm.customer.trim(),
      phone: editForm.phone.trim(),
      payment: editForm.payment,
      status: editForm.status,
      date: editForm.date,
      time: editForm.time,
      notes: editForm.notes,
      items: editForm.items,
      isParchi: editForm.isParchi,
      parchiText: editForm.parchiText,
      total: calculatedTotal,
      subtotal: calculatedTotal
    };

    const next = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    await updateOrders(next);
    setEditingOrder(null);
    setEditForm(null);
    if (activeBillModal?.id === updatedOrder.id) {
      setActiveBillModal(updatedOrder);
    }
    showToast(`✅ Bill #${updatedOrder.id} updated successfully!`);
  };

  const handleConfirmDelete = async () => {
    if (!canAdminManage || !deletingOrder) return;
    const id = deletingOrder.id;
    const next = orders.filter(o => o.id !== id);
    await updateOrders(next);
    setDeletingOrder(null);
    if (activeBillModal?.id === id) {
      setActiveBillModal(null);
    }
    showToast(`🗑️ Bill #${id} deleted permanently.`);
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
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
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
                            <Eye size={14} /> View
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

                          {canAdminManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => startEditOrder(order)}
                                className="mm-btn"
                                style={{ 
                                  background: "#eff6ff", 
                                  color: "#1d4ed8", 
                                  padding: "6px 10px", 
                                  fontSize: 12, 
                                  fontWeight: 700, 
                                  border: "1px solid #bfdbfe",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4
                                }}
                                title="Edit Bill Details (Admin Only)"
                              >
                                <Edit3 size={13} /> Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingOrder(order)}
                                className="mm-btn"
                                style={{ 
                                  background: "#fef2f2", 
                                  color: "#dc2626", 
                                  padding: "6px 10px", 
                                  fontSize: 12, 
                                  fontWeight: 700, 
                                  border: "1px solid #fecaca",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4
                                }}
                                title="Delete Bill Permanently (Admin Only)"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </>
                          )}
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
          isAdmin={canAdminManage}
          onEdit={(ord) => {
            setActiveBillModal(null);
            startEditOrder(ord);
          }}
          onDelete={(ord) => {
            setActiveBillModal(null);
            setDeletingOrder(ord);
          }}
        />
      )}

      {/* EDIT BILL MODAL (ADMIN ONLY) */}
      {editingOrder && editForm && canAdminManage && (
        <div 
          className="standard-bill-overlay"
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(15, 23, 42, 0.75)", zIndex: 1250,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16
          }}
          onClick={() => { setEditingOrder(null); setEditForm(null); }}
        >
          <div 
            className="standard-bill-container"
            style={{
              width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto",
              background: "white", borderRadius: 16, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
              position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>✏️</span>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text-dark)" }}>
                    Edit Bill #{editingOrder.id}
                  </h3>
                  <span style={{ background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 800 }}>
                    Admin Only
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-gray)", marginTop: 2 }}>
                  Modify customer name, phone, payment mode, items, or status.
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setEditingOrder(null); setEditForm(null); }}
                style={{ background: "#f1f5f9", border: "none", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} style={{ padding: "20px 24px" }}>
              {/* Customer & Phone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-dark)", marginBottom: 6 }}>
                    Customer Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    className="mm-input"
                    value={editForm.customer}
                    onChange={e => setEditForm({ ...editForm, customer: e.target.value })}
                    placeholder="e.g. Rakesh Sharma"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-dark)", marginBottom: 6 }}>
                    Phone Number
                  </label>
                  <input 
                    type="text" 
                    className="mm-input"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="e.g. 9811223344"
                  />
                </div>
              </div>

              {/* Payment & Status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-dark)", marginBottom: 6 }}>
                    Payment Mode
                  </label>
                  <select
                    className="mm-input"
                    value={editForm.payment}
                    onChange={e => setEditForm({ ...editForm, payment: e.target.value })}
                  >
                    <option value="cash">💵 Cash at Counter</option>
                    <option value="upi">📱 Direct UPI QR</option>
                    <option value="khata">📒 Store Credit (Khata Ledger)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-dark)", marginBottom: 6 }}>
                    Order Status
                  </label>
                  <select
                    className="mm-input"
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="Completed">✅ Completed</option>
                    <option value="Ready">🟢 Ready for Pickup</option>
                    <option value="Preparing">🟡 Preparing</option>
                    <option value="Cancelled">🔴 Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-dark)", marginBottom: 6 }}>
                    Date
                  </label>
                  <input 
                    type="text" 
                    className="mm-input"
                    value={editForm.date}
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                    placeholder="DD/MM/YYYY or Today"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-dark)", marginBottom: 6 }}>
                    Time
                  </label>
                  <input 
                    type="text" 
                    className="mm-input"
                    value={editForm.time}
                    onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                    placeholder="e.g. 10:45 AM"
                  />
                </div>
              </div>

              {/* Items Breakdown Editor */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Bill Items ({editForm.items.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    style={{ background: "#f1f5f9", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Plus size={13} /> Add Custom Item
                  </button>
                </div>

                {/* Quick Add Product from store catalogue */}
                {products && products.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <select
                      className="mm-input"
                      style={{ flex: 1, fontSize: 12, padding: "8px 12px" }}
                      value={selectedAddProductId}
                      onChange={e => setSelectedAddProductId(e.target.value)}
                    >
                      <option value="">-- Add product from store catalogue --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.unit || ""}) - {money(p.price)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAddItem(selectedAddProductId)}
                      disabled={!selectedAddProductId}
                      className="mm-btn-primary"
                      style={{ padding: "8px 14px", fontSize: 12, fontWeight: 700, opacity: selectedAddProductId ? 1 : 0.5 }}
                    >
                      Add Item
                    </button>
                  </div>
                )}

                {/* Items Table in Edit Form */}
                {editForm.items.length === 0 ? (
                  <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8, textAlign: "center", color: "var(--text-gray)", fontSize: 13 }}>
                    No items in this bill. Click "Add Custom Item" or select from store catalogue above.
                  </div>
                ) : (
                  <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)", color: "var(--text-gray)", textAlign: "left" }}>
                          <th style={{ padding: "8px 10px" }}>Item Name</th>
                          <th style={{ padding: "8px 10px", width: 85, textAlign: "right" }}>Rate (₹)</th>
                          <th style={{ padding: "8px 10px", width: 95, textAlign: "center" }}>Qty</th>
                          <th style={{ padding: "8px 10px", width: 85, textAlign: "right" }}>Total</th>
                          <th style={{ padding: "8px 10px", width: 40, textAlign: "center" }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {editForm.items.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "8px 10px" }}>
                              <input
                                type="text"
                                value={item.name}
                                onChange={e => handleUpdateItem(idx, "name", e.target.value)}
                                style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 8px", fontSize: 12, fontWeight: 600 }}
                              />
                            </td>
                            <td style={{ padding: "8px 10px" }}>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={item.price}
                                onChange={e => handleUpdateItem(idx, "price", e.target.value)}
                                style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 6px", fontSize: 12, textAlign: "right" }}
                              />
                            </td>
                            <td style={{ padding: "8px 10px", textAlign: "center" }}>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(idx, "qty", Math.max(1, (Number(item.qty) || 1) - 1))}
                                  style={{ width: 22, height: 22, borderRadius: 4, border: "1px solid #cbd5e1", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.qty}
                                  onChange={e => handleUpdateItem(idx, "qty", Math.max(1, Number(e.target.value) || 1))}
                                  style={{ width: 34, border: "1px solid #e2e8f0", borderRadius: 4, padding: "3px 2px", textAlign: "center", fontSize: 12, fontWeight: 700 }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(idx, "qty", (Number(item.qty) || 1) + 1)}
                                  style={{ width: 22, height: 22, borderRadius: 4, border: "1px solid #cbd5e1", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "var(--text-dark)" }}>
                              {money((Number(item.price) || 0) * (Number(item.qty) || 1))}
                            </td>
                            <td style={{ padding: "8px 10px", textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", padding: 4 }}
                                title="Remove item"
                              >
                                <X size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Grand Total Display */}
              <div style={{ background: "#f8fafc", padding: "14px 18px", borderRadius: 10, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-gray)", textTransform: "uppercase", fontWeight: 700 }}>
                    Updated Grand Total
                  </div>
                  <div style={{ fontSize: 12, color: editForm.payment === "khata" ? "#c2410c" : "#15803d", fontWeight: 600, marginTop: 2 }}>
                    {editForm.payment === "khata" ? "📒 Store Credit (Customer Khata Due)" : "💵 Paid in Full"}
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "var(--brand)" }}>
                  {money(
                    editForm.isParchi 
                      ? Number(editForm.manualTotal) || 0 
                      : editForm.items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0)
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => { setEditingOrder(null); setEditForm(null); }}
                  className="mm-btn"
                  style={{ flex: 1, padding: 12, background: "white", color: "var(--text-dark)", fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mm-btn-primary"
                  style={{ flex: 2, padding: 12, background: "var(--brand)", color: "white", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <Save size={16} /> Save Bill Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE BILL MODAL (ADMIN ONLY) */}
      {deletingOrder && canAdminManage && (
        <div 
          className="standard-bill-overlay"
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(15, 23, 42, 0.75)", zIndex: 1300,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16
          }}
          onClick={() => setDeletingOrder(null)}
        >
          <div 
            className="standard-bill-container"
            style={{
              width: "100%", maxWidth: 460,
              background: "white", borderRadius: 16, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
              padding: 24, position: "relative"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                  Delete Bill #{deletingOrder.id}?
                </h3>
                <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}>
                  👑 Admin Action • Permanent Deletion
                </div>
              </div>
            </div>

            <div style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--text-gray)" }}>Customer:</span>
                <strong>{deletingOrder.customer} ({deletingOrder.phone || "-"})</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--text-gray)" }}>Total Amount:</span>
                <strong style={{ color: "var(--brand)" }}>{money(deletingOrder.total || orderTotal(deletingOrder))}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--text-gray)" }}>Payment Mode:</span>
                <span style={{ textTransform: "capitalize", fontWeight: 700 }}>{deletingOrder.payment}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-gray)" }}>Date:</span>
                <span>{deletingOrder.date || "Today"}</span>
              </div>
            </div>

            {deletingOrder.payment === "khata" && (
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 12, color: "#c2410c" }}>
                ⚠️ <strong>Store Credit (Khata) Notice:</strong> This bill was charged to <strong>{deletingOrder.customer}</strong>'s ledger. Deleting it will reduce their outstanding due by <strong>{money(deletingOrder.total || orderTotal(deletingOrder))}</strong>.
              </div>
            )}

            <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "var(--text-gray)" }}>
              Are you sure you want to permanently delete this bill? This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="mm-btn"
                style={{ flex: 1, padding: 12, background: "white", color: "var(--text-dark)", fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="mm-btn-danger"
                style={{ flex: 1, padding: 12, background: "#dc2626", color: "white", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <Trash2 size={16} /> Yes, Delete Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION TOAST */}
      {toastMsg && (
        <div 
          style={{ 
            position: "fixed", bottom: 24, right: 24,
            background: "#0f172a", color: "white", padding: "12px 20px", borderRadius: 12,
            fontSize: 13, fontWeight: 700, zIndex: 1400, boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", gap: 8, animation: "fadeIn 0.2s ease"
          }}
        >
          <CheckCircle size={16} color="#4ade80" /> {toastMsg}
        </div>
      )}
    </div>
  );
}


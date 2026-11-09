import React, { useState, useMemo } from "react";
import { 
  BookOpen, Search, Plus, User, Phone, MapPin, IndianRupee, 
  AlertCircle, CheckCircle2, Clock, MessageSquare, ArrowUpRight, 
  ArrowDownLeft, ShoppingBag, X, Calendar, Wallet, QrCode, FileText, ChevronRight
} from "lucide-react";
import { money, getCustomerKhataStatement, STORE_CONFIG } from "../data/store";
import StandardBillModal from "./StandardBillModal";

export default function CustomerKhataView({ customers = [], updateCustomers, orders = [], updateOrders }) {
  const [filterMode, setFilterMode] = useState("ALL"); // "ALL", "DUES_ONLY", "CLEAR_ONLY"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewBillOrder, setViewBillOrder] = useState(null);

  // Modals
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [showAddDueModal, setShowAddDueModal] = useState(false);

  // Add Customer Form
  const [newCustForm, setNewCustForm] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    khataLimit: "3000",
    notes: ""
  });

  // Record Payment Form (Paise Jama Karein)
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: new Date().toLocaleDateString("en-IN"),
    mode: "Cash", // "Cash", "UPI"
    note: "",
    ref: ""
  });

  // Add Due Bill Form (Udhar Saman Likhayein)
  const [dueForm, setDueForm] = useState({
    amount: "",
    note: "",
    date: new Date().toLocaleDateString("en-IN"),
    itemName: "",
    itemQty: "1"
  });

  // Calculate statements for all customers
  const customerStatements = useMemo(() => {
    const map = new Map();
    customers.forEach(c => {
      const stmt = getCustomerKhataStatement(c, orders);
      map.set(c.id, stmt);
    });
    return map;
  }, [customers, orders]);

  // Overall Dues & Khata KPIs
  const kpiStats = useMemo(() => {
    let totalMarketDues = 0;
    let dueCustomersCount = 0;
    let totalCollected = 0;

    customers.forEach(c => {
      const stmt = customerStatements.get(c.id);
      if (stmt) {
        totalMarketDues += stmt.currentDue;
        if (stmt.currentDue > 0) dueCustomersCount++;
        totalCollected += stmt.totalPaid;
      }
    });

    return {
      totalMarketDues,
      dueCustomersCount,
      totalCollected,
      totalCustomers: customers.length
    };
  }, [customers, customerStatements]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const stmt = customerStatements.get(c.id) || { currentDue: 0 };

      if (filterMode === "DUES_ONLY" && stmt.currentDue <= 0) return false;
      if (filterMode === "CLEAR_ONLY" && stmt.currentDue > 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (c.name || "").toLowerCase().includes(q);
        const matchPhone = (c.phone || "").includes(q);
        const matchAddress = (c.address || "").toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchAddress) return false;
      }

      return true;
    });
  }, [customers, customerStatements, filterMode, searchQuery]);

  // Save New Customer
  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustForm.name.trim()) return;

    const newCustomer = {
      id: `c_${Date.now()}`,
      name: newCustForm.name.trim(),
      phone: newCustForm.phone.trim() || "-",
      address: newCustForm.address.trim() || "Local Resident",
      email: newCustForm.email.trim() || "",
      khataLimit: Number(newCustForm.khataLimit) || 3000,
      notes: newCustForm.notes.trim() || "Regular customer",
      paymentHistory: [],
      manualEntries: []
    };

    updateCustomers([newCustomer, ...customers]);
    setShowAddCustomerModal(false);
    setNewCustForm({ name: "", phone: "", address: "", email: "", khataLimit: "3000", notes: "" });
  };

  // Record Payment Received (Jama Karein)
  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const val = Number(paymentForm.amount);
    if (!val || val <= 0) {
      alert("Kripya valid payment amount daalein.");
      return;
    }

    const newPaymentEntry = {
      id: `pay_${Date.now()}`,
      date: paymentForm.date || new Date().toLocaleDateString("en-IN"),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      amount: val,
      mode: paymentForm.mode,
      note: paymentForm.note || "Khata payment received at counter",
      ref: paymentForm.ref || ""
    };

    const nextCustomers = customers.map(c => {
      if (c.id === selectedCustomer.id) {
        return {
          ...c,
          paymentHistory: [newPaymentEntry, ...(c.paymentHistory || [])]
        };
      }
      return c;
    });

    updateCustomers(nextCustomers);
    setShowRecordPaymentModal(false);
    setPaymentForm({ amount: "", date: new Date().toLocaleDateString("en-IN"), mode: "Cash", note: "", ref: "" });

    // Update active view
    const updatedCustomer = nextCustomers.find(c => c.id === selectedCustomer.id);
    setSelectedCustomer(updatedCustomer);
  };

  // Add Manual Due Bill (Udhar Saman Likhayein)
  const handleAddDue = (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const val = Number(dueForm.amount);
    if (!val || val <= 0) {
      alert("Kripya valid bill amount daalein.");
      return;
    }

    const items = [];
    if (dueForm.itemName.trim()) {
      items.push({
        name: dueForm.itemName.trim(),
        qty: Number(dueForm.itemQty) || 1,
        price: val,
        emoji: "📦"
      });
    }

    const newDueEntry = {
      id: `due_${Date.now()}`,
      date: dueForm.date || new Date().toLocaleDateString("en-IN"),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      amount: val,
      note: dueForm.note || dueForm.itemName || "Counter Credit Bill",
      items
    };

    const nextCustomers = customers.map(c => {
      if (c.id === selectedCustomer.id) {
        return {
          ...c,
          manualEntries: [newDueEntry, ...(c.manualEntries || [])]
        };
      }
      return c;
    });

    updateCustomers(nextCustomers);
    setShowAddDueModal(false);
    setDueForm({ amount: "", note: "", date: new Date().toLocaleDateString("en-IN"), itemName: "", itemQty: "1" });

    // Update active view
    const updatedCustomer = nextCustomers.find(c => c.id === selectedCustomer.id);
    setSelectedCustomer(updatedCustomer);
  };

  // Send WhatsApp Due Reminder
  const sendWhatsAppReminder = (customer) => {
    const stmt = customerStatements.get(customer.id);
    const due = stmt ? stmt.currentDue : 0;
    const cleanPhone = (customer.phone || "").replace(/[^0-9]/g, "");

    if (!cleanPhone || cleanPhone === "-") {
      alert("Customer phone number not available.");
      return;
    }

    let msg = `Hello ${customer.name}! 🙏\n\n`;
    msg += `This is a friendly reminder from *${STORE_CONFIG.name}* (${STORE_CONFIG.address}).\n\n`;
    msg += `*Outstanding Due Balance: ${money(due)}*\n\n`;
    msg += `You can settle via cash at the counter or scan/pay directly to our UPI ID:\n`;
    msg += `*UPI ID:* \`${STORE_CONFIG.upiId}\`\n\n`;
    msg += `Thank you!\n${STORE_CONFIG.name}`;

    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const activeStatement = selectedCustomer ? customerStatements.get(selectedCustomer.id) : null;

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h2 style={{ fontSize: 28, margin: 0, color: "var(--text-dark)", fontWeight: 800 }}>
              Customer Credit & Due Ledger
            </h2>
            <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              Credit Register
            </span>
          </div>
          <p style={{ margin: 0, color: "var(--text-gray)", fontSize: 14 }}>
            Track customer store credit, purchase dates, itemized bills, and payment settlements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddCustomerModal(true)}
          className="mm-btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: 14, fontWeight: 700 }}
        >
          <Plus size={16} /> + Add New Customer
        </button>
      </div>

      {/* Top KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginBottom: 26 }}>
        {/* Total Market Dues */}
        <div className="mm-card" style={{ padding: 20, borderLeft: "4px solid #ef4444" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#991b1b", textTransform: "uppercase" }}>Total Outstanding Dues</span>
            <AlertCircle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#b91c1c", marginBottom: 4 }}>
            {money(kpiStats.totalMarketDues)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
            Receivables across registered customers
          </div>
        </div>

        {/* Due Customers Count */}
        <div className="mm-card" style={{ padding: 20, borderLeft: "4px solid #f97316" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#9a3412", textTransform: "uppercase" }}>Active Credit Customers</span>
            <span style={{ fontSize: 16 }}>👥</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#c2410c", marginBottom: 4 }}>
            {kpiStats.dueCustomersCount} Customers
          </div>
          <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
            Customers with pending balance
          </div>
        </div>

        {/* Total Collected */}
        <div className="mm-card" style={{ padding: 20, borderLeft: "4px solid #16a34a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Total Payments Received</span>
            <CheckCircle2 size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#15803d", marginBottom: 4 }}>
            {money(kpiStats.totalCollected)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
            Collected via Cash & UPI
          </div>
        </div>

        {/* Total Registered */}
        <div className="mm-card" style={{ padding: 20, borderLeft: "4px solid var(--brand)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-gray)", textTransform: "uppercase" }}>Total Registered</span>
            <BookOpen size={18} color="var(--brand)" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-dark)", marginBottom: 4 }}>
            {kpiStats.totalCustomers} Accounts
          </div>
          <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
            In store directory
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
            placeholder="Search by Name, Phone, Customer ID, or Address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setFilterMode("ALL")}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: filterMode === "ALL" ? "1px solid var(--brand)" : "1px solid var(--border)",
              background: filterMode === "ALL" ? "#fef3c7" : "white",
              color: filterMode === "ALL" ? "#92400e" : "var(--text-dark)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            All Accounts ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("DUES_ONLY")}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: filterMode === "DUES_ONLY" ? "1px solid #f87171" : "1px solid var(--border)",
              background: filterMode === "DUES_ONLY" ? "#fee2e2" : "white",
              color: filterMode === "DUES_ONLY" ? "#991b1b" : "var(--text-dark)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            🔴 Balance Due ({kpiStats.dueCustomersCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("CLEAR_ONLY")}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: filterMode === "CLEAR_ONLY" ? "1px solid #86efac" : "1px solid var(--border)",
              background: filterMode === "CLEAR_ONLY" ? "#dcfce7" : "white",
              color: filterMode === "CLEAR_ONLY" ? "#166534" : "var(--text-dark)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            🟢 Zero Balance ({customers.length - kpiStats.dueCustomersCount})
          </button>
        </div>
      </div>

      {/* Customer Directory Table */}
      {filteredCustomers.length === 0 ? (
        <div className="mm-block" style={{ textAlign: "center", padding: 60, color: "var(--text-gray)" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📒</div>
          <h3 style={{ margin: "0 0 6px 0", color: "var(--text-dark)", fontSize: 18 }}>No customers found in this filter.</h3>
          <p style={{ margin: 0, fontSize: 14 }}>Try clearing the search or filter query.</p>
        </div>
      ) : (
        <div className="mm-block" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)", color: "var(--text-gray)", fontSize: 13 }}>
                  <th style={{ padding: "16px 20px", fontWeight: 700 }}>Customer Name</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700 }}>Phone</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700 }}>Address / Area</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700 }}>Credit Limit</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700 }}>Current Balance Due</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => {
                  const stmt = customerStatements.get(customer.id) || { currentDue: 0, transactions: [] };
                  const hasDue = stmt.currentDue > 0;

                  return (
                    <tr 
                      key={customer.id} 
                      style={{ borderBottom: "1px solid var(--border)" }}
                      className="table-row-hover"
                    >
                      {/* Name */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ 
                            width: 38, height: 38, borderRadius: "50%", 
                            background: hasDue ? "#fee2e2" : "#f1f5f9", 
                            color: hasDue ? "#b91c1c" : "var(--brand)", 
                            display: "flex", alignItems: "center", justifyContent: "center", 
                            fontWeight: 800, fontSize: 15 
                          }}>
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: "var(--text-dark)", fontSize: 14 }}>{customer.name}</div>
                            <div style={{ fontSize: 11, color: "var(--text-gray)" }}>{customer.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--text-dark)", fontWeight: 600 }}>
                        {customer.phone || "-"}
                      </td>

                      {/* Address */}
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--text-gray)", maxWidth: 220 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={13} color="var(--text-gray)" />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {customer.address || "Local Area"}
                          </span>
                        </div>
                      </td>

                      {/* Credit Limit */}
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--text-gray)" }}>
                        {money(customer.khataLimit || 3000)}
                      </td>

                      {/* Current Due */}
                      <td style={{ padding: "16px 20px" }}>
                        {hasDue ? (
                          <div>
                            <span style={{ 
                              background: "#fee2e2", color: "#991b1b", padding: "4px 10px", 
                              borderRadius: 20, fontSize: 13, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 
                            }}>
                              <AlertCircle size={13} /> {money(stmt.currentDue)} Due
                            </span>
                          </div>
                        ) : (
                          <span style={{ 
                            background: "#dcfce7", color: "#166534", padding: "4px 10px", 
                            borderRadius: 20, fontSize: 12, fontWeight: 700 
                          }}>
                            ✓ Cleared (₹0)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "16px 20px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(customer)}
                            className="mm-btn"
                            style={{ 
                              background: "var(--brand)", 
                              color: "white", 
                              padding: "6px 14px", 
                              fontSize: 12, 
                              fontWeight: 700, 
                              display: "flex", 
                              alignItems: "center", 
                              gap: 4 
                            }}
                          >
                            <BookOpen size={13} /> Open Passbook
                          </button>

                          {hasDue && (
                            <button
                              type="button"
                              onClick={() => sendWhatsAppReminder(customer)}
                              className="mm-btn"
                              style={{ 
                                background: "#dcfce7", 
                                color: "#166534", 
                                padding: "6px 10px", 
                                fontSize: 12, 
                                fontWeight: 700, 
                                border: "1px solid #bbf7d0" 
                              }}
                              title="Send Due Reminder on WhatsApp"
                            >
                              <MessageSquare size={13} />
                            </button>
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

      {/* FULL CUSTOMER CREDIT PASSBOOK MODAL */}
      {selectedCustomer && activeStatement && (
        <div 
          style={{ 
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
            background: "rgba(0,0,0,0.65)", zIndex: 1000, 
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20 
          }}
          onClick={() => setSelectedCustomer(null)}
        >
          <div 
            className="mm-block" 
            style={{ 
              width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto", 
              padding: 0, background: "white", borderRadius: 16, animation: "scaleIn 0.2s ease" 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Strip */}
            <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "white", padding: "24px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--brand)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18 }}>
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "white" }}>
                        {selectedCustomer.name}
                      </h3>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                        📞 {selectedCustomer.phone} • 🏠 {selectedCustomer.address}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => setSelectedCustomer(null)} 
                  className="mm-iconbtn" 
                  style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "none" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Current Outstanding Due Meter */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, background: "rgba(255,255,255,0.1)", padding: "14px 18px", borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", fontWeight: 700 }}>
                    Outstanding Balance Due
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: activeStatement.currentDue > 0 ? "#fca5a5" : "#86efac" }}>
                    {money(activeStatement.currentDue)}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Credit Limit: <strong>{money(selectedCustomer.khataLimit || 3000)}</strong></div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                    Total Purchases: {money(activeStatement.totalPurchases)} • Paid: {money(activeStatement.totalPaid)}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons for Shopkeeper */}
            <div style={{ padding: "16px 28px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10, background: "#f8fafc", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setShowRecordPaymentModal(true)}
                className="mm-btn"
                style={{ flex: 1, padding: "10px 14px", background: "#16a34a", color: "white", fontWeight: 700, fontSize: 13, border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <ArrowDownLeft size={16} /> + Record Payment Received
              </button>

              <button
                type="button"
                onClick={() => setShowAddDueModal(true)}
                className="mm-btn"
                style={{ flex: 1, padding: "10px 14px", background: "#dc2626", color: "white", fontWeight: 700, fontSize: 13, border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <ArrowUpRight size={16} /> + Add Store Credit Bill
              </button>

              {activeStatement.currentDue > 0 && (
                <button
                  type="button"
                  onClick={() => sendWhatsAppReminder(selectedCustomer)}
                  className="mm-btn"
                  style={{ padding: "10px 14px", background: "#25d366", color: "white", fontWeight: 700, fontSize: 13, border: "none", display: "flex", alignItems: "center", gap: 6 }}
                  title="Send WhatsApp Due Reminder"
                >
                  <MessageSquare size={16} /> WhatsApp Reminder
                </button>
              )}
            </div>

            {/* Khata Ledger Timeline ("Kis date pe wo kya le rahe hn") */}
            <div style={{ padding: "20px 28px" }}>
              <h4 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 800, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={16} color="var(--brand)" /> 
                Credit Passbook Timeline & Itemized Details
              </h4>

              {activeStatement.transactions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-gray)", fontSize: 14 }}>
                  No transaction history recorded for this customer account.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {activeStatement.transactions.map((tx, idx) => {
                    const isPurchase = tx.type === "purchase";

                    return (
                      <div 
                        key={idx}
                        style={{ 
                          border: `1px solid ${isPurchase ? "#fecaca" : "#bbf7d0"}`, 
                          background: isPurchase ? "#fffafb" : "#f0fdf4", 
                          borderRadius: 12, 
                          padding: 16 
                        }}
                      >
                        {/* Transaction Top Bar */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ 
                                padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800,
                                background: isPurchase ? "#fee2e2" : "#dcfce7",
                                color: isPurchase ? "#991b1b" : "#166534"
                              }}>
                                {isPurchase ? "🛍️ STORE CREDIT PURCHASE" : "💰 PAYMENT RECEIVED"}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark)" }}>
                                {tx.date} {tx.time ? `• ${tx.time}` : ""}
                              </span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark)" }}>
                              {tx.title}
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <div style={{ 
                              fontSize: 18, fontWeight: 900, 
                              color: isPurchase ? "#dc2626" : "#16a34a" 
                            }}>
                              {isPurchase ? `+${money(tx.amount)}` : `-${money(tx.amount)}`}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-gray)" }}>
                              {isPurchase ? "Charged to Credit" : `via ${tx.mode || "Cash"}`}
                            </div>
                          </div>
                        </div>

                        {/* Exact Samaan Items Taken Breakdown */}
                        {isPurchase && tx.items && tx.items.length > 0 && (
                          <div style={{ background: "white", padding: "10px 14px", borderRadius: 8, border: "1px solid #f1f5f9", marginTop: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-gray)", marginBottom: 6 }}>
                              📦 Purchased Items Breakdown:
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {tx.items.map((item, itemIdx) => (
                                <div key={itemIdx} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-dark)" }}>
                                  <span>{item.emoji || "•"} {item.name} <strong>x{item.qty}</strong></span>
                                  <span style={{ fontWeight: 700 }}>{money(item.price * item.qty)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Parchi Note if Parchi */}
                        {tx.isParchi && tx.parchiText && (
                          <div style={{ background: "#fef3c7", padding: "8px 12px", borderRadius: 6, fontSize: 12, color: "#78350f", marginTop: 6 }}>
                            📝 Handwritten Grocery Slip: {tx.parchiText}
                          </div>
                        )}

                        {/* View Official Bill Button */}
                        {isPurchase && (
                          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                            <button
                              type="button"
                              onClick={() => {
                                const match = orders.find(o => o.id === tx.orderId) || {
                                  id: tx.orderId || `MM_${Date.now().toString().slice(-4)}`,
                                  customer: selectedCustomer.name,
                                  phone: selectedCustomer.phone,
                                  date: tx.date,
                                  time: tx.time,
                                  items: tx.items || [],
                                  total: tx.amount,
                                  subtotal: tx.amount,
                                  payment: "khata",
                                  status: "Completed",
                                  isParchi: tx.isParchi,
                                  parchiText: tx.parchiText
                                };
                                setViewBillOrder(match);
                              }}
                              style={{ 
                                background: "#ffffff", border: "1px solid var(--border)", borderRadius: 6, 
                                padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", 
                                display: "flex", alignItems: "center", gap: 5, color: "var(--text-dark)" 
                              }}
                            >
                              <FileText size={12} color="var(--brand)" /> View Official Bill
                            </button>
                          </div>
                        )}

                        {/* Payment Note/Ref */}
                        {!isPurchase && tx.notes && (
                          <div style={{ fontSize: 12, color: "var(--text-gray)", marginTop: 4 }}>
                            Note: {tx.notes} {tx.ref ? `(Ref: ${tx.ref})` : ""}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW CUSTOMER */}
      {showAddCustomerModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="mm-block" style={{ width: "100%", maxWidth: 480, padding: 28, animation: "scaleIn 0.2s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>+ Register Customer to Credit Ledger</h3>
              <button type="button" onClick={() => setShowAddCustomerModal(false)} className="mm-iconbtn"><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateCustomer} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Customer Full Name *</label>
                <input required className="mm-input" placeholder="e.g. Ramesh Chandra Sharma" value={newCustForm.name} onChange={e => setNewCustForm({...newCustForm, name: e.target.value})} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Phone Number (WhatsApp) *</label>
                <input required type="tel" className="mm-input" placeholder="e.g. 9812345678" value={newCustForm.phone} onChange={e => setNewCustForm({...newCustForm, phone: e.target.value})} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Address / Area / Landmark</label>
                <input className="mm-input" placeholder="e.g. House 42, Lane 3, Near City Park" value={newCustForm.address} onChange={e => setNewCustForm({...newCustForm, address: e.target.value})} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Credit Limit (₹)</label>
                  <input type="number" min="500" className="mm-input" placeholder="3000" value={newCustForm.khataLimit} onChange={e => setNewCustForm({...newCustForm, khataLimit: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Email (Optional)</label>
                  <input type="email" className="mm-input" placeholder="user@gmail.com" value={newCustForm.email} onChange={e => setNewCustForm({...newCustForm, email: e.target.value})} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAddCustomerModal(false)} className="mm-btn" style={{ flex: 1, background: "#f1f5f9" }}>Cancel</button>
                <button type="submit" className="mm-btn-primary" style={{ flex: 1 }}>Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT */}
      {showRecordPaymentModal && selectedCustomer && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="mm-block" style={{ width: "100%", maxWidth: 460, padding: 28, animation: "scaleIn 0.2s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#166534" }}>💰 Record Payment Received</h3>
                <div style={{ fontSize: 13, color: "var(--text-gray)" }}>Customer: <strong>{selectedCustomer.name}</strong></div>
              </div>
              <button type="button" onClick={() => setShowRecordPaymentModal(false)} className="mm-iconbtn"><X size={18} /></button>
            </div>

            <form onSubmit={handleRecordPayment} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Payment Amount (₹) *</label>
                <input required type="number" min="1" autoFocus className="mm-input" placeholder="e.g. 500" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Payment Mode</label>
                  <select className="mm-input" value={paymentForm.mode} onChange={e => setPaymentForm({...paymentForm, mode: e.target.value})}>
                    <option value="Cash">💵 Cash at Counter</option>
                    <option value="UPI">📱 Direct UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Bank">🏦 Bank Transfer</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Date</label>
                  <input className="mm-input" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Notes / Reference (Optional)</label>
                <input className="mm-input" placeholder="e.g. Cleared via UPI / Ref #4928" value={paymentForm.note} onChange={e => setPaymentForm({...paymentForm, note: e.target.value})} />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowRecordPaymentModal(false)} className="mm-btn" style={{ flex: 1, background: "#f1f5f9" }}>Cancel</button>
                <button type="submit" className="mm-btn-primary" style={{ flex: 1, background: "#16a34a" }}>Confirm & Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD CREDIT BILL */}
      {showAddDueModal && selectedCustomer && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="mm-block" style={{ width: "100%", maxWidth: 460, padding: 28, animation: "scaleIn 0.2s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#dc2626" }}>🛍️ Record Store Credit Purchase</h3>
                <div style={{ fontSize: 13, color: "var(--text-gray)" }}>Customer: <strong>{selectedCustomer.name}</strong></div>
              </div>
              <button type="button" onClick={() => setShowAddDueModal(false)} className="mm-iconbtn"><X size={18} /></button>
            </div>

            <form onSubmit={handleAddDue} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Items Purchased / Description *</label>
                <input required className="mm-input" placeholder="e.g. Wheat Flour 10kg + Pure Ghee 1L" value={dueForm.itemName} onChange={e => setDueForm({...dueForm, itemName: e.target.value})} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Bill Total (₹) *</label>
                  <input required type="number" min="1" className="mm-input" placeholder="e.g. 640" value={dueForm.amount} onChange={e => setDueForm({...dueForm, amount: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Date</label>
                  <input className="mm-input" value={dueForm.date} onChange={e => setDueForm({...dueForm, date: e.target.value})} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Notes / Remarks (Optional)</label>
                <input className="mm-input" placeholder="e.g. Taken by family member" value={dueForm.note} onChange={e => setDueForm({...dueForm, note: e.target.value})} />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAddDueModal(false)} className="mm-btn" style={{ flex: 1, background: "#f1f5f9" }}>Cancel</button>
                <button type="submit" className="mm-btn-primary" style={{ flex: 1, background: "#dc2626" }}>Charge to Credit Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STANDARDIZED OFFICIAL BILL MODAL */}
      {viewBillOrder && (
        <StandardBillModal 
          order={viewBillOrder} 
          onClose={() => setViewBillOrder(null)} 
        />
      )}
    </div>
  );
}


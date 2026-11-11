import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  ListOrdered, User, Clock, Store, Check, X, Printer, 
  Calculator, Search, Plus, Minus, CheckCircle, Package, 
  Bell, BellOff, MessageSquare, ExternalLink, Image as ImageIcon, Eye, FileText,
  BarChart3, TrendingUp, Wallet, QrCode, BookOpen, AlertTriangle, ArrowUpRight, CheckCircle2, Receipt,
  UserPlus, UserCheck, AlertCircle, Phone as PhoneIcon, MapPin, Database
} from "lucide-react";
import { statusStyle, nextStatus, orderTotal, money, STORE_CONFIG, playOrderChime, getCustomerKhataStatement } from "../../data/store";
import { isSupabaseConfigured } from "../../lib/supabase";
import DashboardLayout from "../../components/DashboardLayout";
import DailyBillsView from "../../components/DailyBillsView";
import CustomerKhataView from "../../components/CustomerKhataView";
import StandardBillModal from "../../components/StandardBillModal";

export default function ManagerView({ 
  theme, toggleTheme,
  customers = [], updateCustomers, orders = [], updateOrders, 
  products, updateProducts, user, onLogout, expenses = [] 
}) {
  const [activeTab, setActiveTab] = useState("orders-active");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [previewSlipImage, setPreviewSlipImage] = useState(null);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);
  const [lastPosOrder, setLastPosOrder] = useState(null);
  const prevOrderCountRef = useRef(orders.length);

  // Audio trigger on new orders
  useEffect(() => {
    if (orders.length > prevOrderCountRef.current) {
      const hasNewOrder = orders.some(o => o.status === "New");
      if (hasNewOrder && soundEnabled) {
        playOrderChime();
      }
    }
    prevOrderCountRef.current = orders.length;
  }, [orders, soundEnabled]);
  
  // POS State
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState("");
  
  const [posFulfillment, setPosFulfillment] = useState("pickup");
  const [posAddress, setPosAddress] = useState("");
  const [posPayment, setPosPayment] = useState("cash");

  // POS Customer Search & Khata State
  const [posCustomerQuery, setPosCustomerQuery] = useState("");
  const [selectedPosCustomer, setSelectedPosCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showQuickAddCustModal, setShowQuickAddCustModal] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({ name: "", phone: "", address: "", khataLimit: "3000" });

  // Filter matching customers by Name, Phone, or ID
  const matchingPosCustomers = useMemo(() => {
    const q = posCustomerQuery.toLowerCase().trim();
    if (!q) return customers.slice(0, 6);
    return customers.filter(c => 
      (c.name || "").toLowerCase().includes(q) ||
      (c.phone || "").includes(q) ||
      (c.id || "").toLowerCase().includes(q) ||
      (c.address || "").toLowerCase().includes(q)
    ).slice(0, 8);
  }, [customers, posCustomerQuery]);

  // Selected customer's live Khata statement & due
  const selectedPosCustomerStatement = useMemo(() => {
    if (!selectedPosCustomer) return null;
    return getCustomerKhataStatement(selectedPosCustomer, orders);
  }, [selectedPosCustomer, orders]);

  const updateOrderStatus = (id, newStatus) => {
    const nextOrders = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    updateOrders(nextOrders);
  };

  const updateParchiBill = (id, newAmount) => {
    const val = parseFloat(newAmount) || 0;
    const nextOrders = orders.map(o => o.id === id ? { ...o, total: val, subtotal: val } : o);
    updateOrders(nextOrders);
  };

  const sendCustomerWhatsApp = (order) => {
    const cleanPhone = (order.phone || "").replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone === "-") {
      alert("Customer phone number not available.");
      return;
    }
    let text = `Namaste ${order.customer}! 🏪\n`;
    if (order.status === "New") {
      text += `Your order #${order.id} has been received at ${STORE_CONFIG.name}. We are preparing and packing your items.`;
    } else if (order.status === "Preparing") {
      text += `Your order #${order.id} is currently being packed. Total Bill: ${money(order.total || orderTotal(order))}.`;
    } else if (order.status === "Ready") {
      text += `Your order #${order.id} is packed and ready for pickup at our store counter 🏬.\nTotal Bill: ${money(order.total || orderTotal(order))}.\nPlease collect it from the store counter.`;
    } else {
      text += `Your order #${order.id} update: Status is ${order.status}. Total Bill: ${money(order.total || orderTotal(order))}.`;
    }
    text += `\nThank you! - ${STORE_CONFIG.name}`;

    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const getFilteredOrders = () => {
    if (activeTab === "orders-pending") return orders.filter(o => o.status === "New" || o.status === "Pending");
    if (activeTab === "orders-active") return orders.filter(o => o.status === "Preparing" || o.status === "Ready");
    if (activeTab === "orders-completed") return orders.filter(o => o.status === "Completed" || o.status === "Cancelled");
    return [];
  };

  const filteredOrders = getFilteredOrders();

  // POS Functions
  const handlePOSChange = (id, delta) => {
    let maxStock = 0;
    if (id.includes("__")) {
      const [pId, vId] = id.split("__");
      const p = products.find((x) => x.id === pId);
      const v = p?.variants?.find((vx) => vx.id === vId);
      maxStock = v ? v.stock : 0;
    } else {
      const p = products.find((x) => x.id === id);
      maxStock = p ? p.stock : 0;
    }

    setCart((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: Math.min(next, maxStock) };
    });
  };

  const cartItems = Object.keys(cart).map((id) => {
    if (id.includes("__")) {
      const [pId, vId] = id.split("__");
      const p = products.find((x) => x.id === pId);
      const v = p?.variants?.find((vx) => vx.id === vId);
      return {
        id,
        productId: pId,
        variantId: vId,
        name: p ? `${p.name} (${v?.unit || v?.name})` : "Item",
        price: v?.price || 0,
        emoji: p?.emoji || "📦",
        qty: cart[id]
      };
    }
    const p = products.find((x) => x.id === id);
    return { ...p, qty: cart[id] };
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);

  const handleQuickAddCustomer = (e) => {
    e.preventDefault();
    if (!quickAddForm.name.trim()) return;
    const newCust = {
      id: `c_${Date.now()}`,
      name: quickAddForm.name.trim(),
      phone: quickAddForm.phone.trim() || "-",
      address: quickAddForm.address.trim() || "Local Resident",
      email: "",
      khataLimit: Number(quickAddForm.khataLimit) || 3000,
      notes: "Quick registered via POS counter",
      paymentHistory: [],
      manualEntries: []
    };
    if (updateCustomers) {
      updateCustomers([newCust, ...customers]);
    }
    setSelectedPosCustomer(newCust);
    setPosCustomerQuery("");
    setShowCustomerDropdown(false);
    setShowQuickAddCustModal(false);
    setQuickAddForm({ name: "", phone: "", address: "", khataLimit: "3000" });
  };

  const processPOSOrder = async () => {
    if (cartItems.length === 0) return;
    const id = `MM${Math.floor(1000 + Math.random() * 9000)}`;

    const paymentMode = (posPayment === "due" || posPayment === "khata") ? "khata" : posPayment;
    const finalCustName = selectedPosCustomer ? selectedPosCustomer.name : (customerName.trim() || (posCustomerQuery.trim() || "Walk-in Customer"));
    const finalCustPhone = selectedPosCustomer ? selectedPosCustomer.phone : (customerPhone.trim() || "-");
    const finalCustId = selectedPosCustomer ? selectedPosCustomer.id : null;

    const newOrder = {
      id, 
      customer: finalCustName, 
      phone: finalCustPhone, 
      customerId: finalCustId,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toLocaleDateString("en-IN"),
      fulfillment: "pickup", 
      address: `Store Counter (${STORE_CONFIG.address})`, 
      payment: paymentMode, 
      status: "Completed", // POS orders are instantly completed
      total: subtotal,
      subtotal,
      items: cartItems.map(({ id, name, price, qty, emoji }) => ({ id, name, price, qty, emoji })),
    };
    
    await updateOrders([newOrder, ...orders]);
    setLastPosOrder(newOrder);

    // If payment is Khata / Due, ensure customer exists in customers list
    if (paymentMode === "khata" && updateCustomers) {
      if (!selectedPosCustomer && finalCustName !== "Walk-in Customer" && finalCustPhone !== "-") {
        const newCustId = `c_${Date.now()}`;
        const newCustomer = {
          id: newCustId,
          name: finalCustName,
          phone: finalCustPhone,
          address: "Local Resident",
          email: "",
          khataLimit: 3000,
          notes: "Registered via POS Credit Billing",
          paymentHistory: [],
          manualEntries: []
        };
        await updateCustomers([newCustomer, ...customers]);
      }
    }
    
    // Decrement stock supporting variants
    const nextProducts = products.map((p) => {
      let updated = { ...p };
      cartItems.forEach((item) => {
        if (item.productId === p.id || item.id === p.id) {
          if (item.variantId && Array.isArray(updated.variants)) {
            updated.variants = updated.variants.map((v) =>
              v.id === item.variantId ? { ...v, stock: Math.max(0, v.stock - item.qty) } : v
            );
            updated.stock = updated.variants.reduce((s, v) => s + v.stock, 0);
          } else {
            updated.stock = Math.max(0, updated.stock - item.qty);
          }
        }
      });
      return updated;
    });
    await updateProducts(nextProducts);
    
    setGeneratedOrderId(id);
    setCart({});
    setCustomerName("");
    setCustomerPhone("");
    setPosCustomerQuery("");
    setSelectedPosCustomer(null);
    setCheckoutComplete(true);
  };

  // Shift & Sales Analytics Calculations
  const validOrders = orders.filter((o) => o.status !== "Cancelled");
  const totalShiftSales = validOrders.reduce((sum, o) => sum + (o.total || orderTotal(o)), 0);

  const cashOrders = validOrders.filter((o) => {
    const p = (o.payment || "").toLowerCase();
    return p === "cash" || p === "cod";
  });
  const cashSales = cashOrders.reduce((sum, o) => sum + (o.total || orderTotal(o)), 0);

  const upiOrders = validOrders.filter((o) => (o.payment || "").toLowerCase() === "upi");
  const upiSales = upiOrders.reduce((sum, o) => sum + (o.total || orderTotal(o)), 0);

  const khataOrders = validOrders.filter((o) => (o.payment || "").toLowerCase() === "khata");
  const khataSales = khataOrders.reduce((sum, o) => sum + (o.total || orderTotal(o)), 0);

  const pendingCount = orders.filter((o) => o.status === "New" || o.status === "Pending").length;
  const preparingCount = orders.filter((o) => o.status === "Preparing").length;
  const readyCount = orders.filter((o) => o.status === "Ready").length;
  const completedCount = orders.filter((o) => o.status === "Completed").length;

  // Item sales tally
  const itemMap = {};
  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const name = item.name || "Item";
      if (!itemMap[name]) {
        itemMap[name] = { name, qty: 0, revenue: 0, emoji: item.emoji || "📦" };
      }
      itemMap[name].qty += item.qty || 1;
      itemMap[name].revenue += (item.price || 0) * (item.qty || 1);
    });
  });
  const fastMovingItems = Object.values(itemMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Low stock inventory warning
  const lowStockItems = [];
  products.forEach((p) => {
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      p.variants.forEach((v) => {
        if (v.stock <= 5) {
          lowStockItems.push({
            id: `${p.id}-${v.id}`,
            name: `${p.name} (${v.unit || v.name})`,
            stock: v.stock,
            emoji: p.emoji || "📦",
          });
        }
      });
    } else if (p.stock <= 5) {
      lowStockItems.push({
        id: p.id,
        name: p.name,
        stock: p.stock,
        emoji: p.emoji || "📦",
      });
    }
  });

  const sidebarItems = [
    { id: 'analytics', label: 'Shift & Sales Analytics', icon: <BarChart3 size={18} /> },
    { id: 'daily-bills', label: 'Daily Bills & Invoices', icon: <Receipt size={18} /> },
    { id: 'customers', label: 'Customer Credit Ledger', icon: <BookOpen size={18} /> },
    { id: 'orders-pending', label: 'Pending Orders', icon: <Clock size={18} /> },
    { id: 'orders-active', label: 'Active Orders', icon: <ListOrdered size={18} /> },
    { id: 'orders-completed', label: 'Completed Orders', icon: <CheckCircle size={18} /> },
    { id: 'pos', label: 'Point of Sale (POS)', icon: <Calculator size={18} /> },
  ];

  return (
    <DashboardLayout theme={theme} toggleTheme={toggleTheme} user={user} onLogout={onLogout} title="Manager" sidebarItems={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="dashboard-content-pad" style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {activeTab === "analytics" && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <h2 style={{ fontSize: 28, margin: 0, color: 'var(--text-dark)', fontWeight: 800 }}>
                    Shift & Sales Analytics
                  </h2>
                  <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                    Counter Active
                  </span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-gray)', fontSize: 14 }}>
                  Real-time cash drawer tally, UPI collections, pickup speed, and shelf inventory alerts.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('pos')}
                  style={{
                    background: "var(--brand)",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Calculator size={16} /> Open POS Billing
                </button>
              </div>
            </div>

            {/* Shift Drawer & Payment Tally Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
              {/* Cash in Drawer */}
              <div className="mm-block" style={{ padding: 22, margin: 0, borderLeft: "5px solid #16a34a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-gray)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Cash Drawer Counter
                  </span>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
                    <Wallet size={20} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#15803d", marginBottom: 6 }}>
                  {money(cashSales)}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
                  {cashOrders.length} cash orders collected at counter
                </div>
              </div>

              {/* UPI Digital Payments */}
              <div className="mm-block" style={{ padding: 22, margin: 0, borderLeft: "5px solid #2563eb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-gray)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    UPI Collections
                  </span>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                    <QrCode size={20} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#1d4ed8", marginBottom: 6 }}>
                  {money(upiSales)}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
                  {upiOrders.length} online QR payments credited
                </div>
              </div>

              {/* Store Credit (Due) */}
              <div className="mm-block" style={{ padding: 22, margin: 0, borderLeft: "5px solid #ea580c" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-gray)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Store Credit (Ledger Dues)
                  </span>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", color: "#ea580c" }}>
                    <BookOpen size={20} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#c2410c", marginBottom: 6 }}>
                  {money(khataSales)}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
                  {khataOrders.length} neighborhood credit bills
                </div>
              </div>

              {/* Total Shift Volume */}
              <div className="mm-block" style={{ padding: 22, margin: 0, borderLeft: "5px solid var(--brand)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-gray)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Total Shift Sales
                  </span>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)" }}>
                    <TrendingUp size={20} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-dark)", marginBottom: 6 }}>
                  {money(totalShiftSales)}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
                  Across {validOrders.length} customer pickup orders
                </div>
              </div>
            </div>

            {/* Store Pickup Operational Status Pipeline */}
            <div className="mm-block" style={{ padding: 24, marginBottom: 32 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-dark)", margin: "0 0 16px 0" }}>
                Store Counter Order Pipeline
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                <div 
                  onClick={() => setActiveTab("orders-pending")}
                  style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 18, cursor: "pointer", transition: "transform 0.15s ease" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#b45309" }}>⏳ New / Needs Packing</span>
                    <Clock size={16} color="#b45309" />
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#92400e" }}>{pendingCount}</div>
                  <div style={{ fontSize: 11, color: "#b45309", marginTop: 4 }}>Requires shopkeeper packing</div>
                </div>

                <div 
                  onClick={() => setActiveTab("orders-active")}
                  style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: 18, cursor: "pointer" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>📦 Packing In Progress</span>
                    <Package size={16} color="#1d4ed8" />
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#1e40af" }}>{preparingCount}</div>
                  <div style={{ fontSize: 11, color: "#1d4ed8", marginTop: 4 }}>Staff currently packaging</div>
                </div>

                <div 
                  onClick={() => setActiveTab("orders-active")}
                  style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 18, cursor: "pointer" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>🏬 Ready for Pickup</span>
                    <Store size={16} color="#15803d" />
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#166534" }}>{readyCount}</div>
                  <div style={{ fontSize: 11, color: "#15803d", marginTop: 4 }}>Waiting at front counter</div>
                </div>

                <div 
                  onClick={() => setActiveTab("orders-completed")}
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, cursor: "pointer" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>✅ Handed Over / Done</span>
                    <CheckCircle2 size={16} color="#475569" />
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>{completedCount}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Delivered to customer at counter</div>
                </div>
              </div>
            </div>

            {/* Split Grid: Fast Moving Items & Low Stock Alerts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
              {/* Fast Moving Items */}
              <div className="mm-block" style={{ padding: 24, margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-dark)", margin: 0 }}>
                    🔥 Fast Moving Products
                  </h3>
                  <span style={{ fontSize: 12, color: "var(--text-gray)" }}>This Shift</span>
                </div>

                {fastMovingItems.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-gray)", fontSize: 14 }}>
                    No items sold yet in this shift.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {fastMovingItems.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 20 }}>{item.emoji}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-dark)" }}>{item.name}</div>
                            <div style={{ fontSize: 12, color: "var(--text-gray)" }}>{item.qty} units sold</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 800, fontSize: 14, color: "var(--brand)" }}>{money(item.revenue)}</div>
                          <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>Top {idx + 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock Shelf Warning */}
              <div className="mm-block" style={{ padding: 24, margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-dark)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertTriangle size={18} color="#eab308" />
                    Shelf Refill Alerts (Low Stock)
                  </h3>
                  <span style={{ fontSize: 12, fontWeight: 700, color: lowStockItems.length > 0 ? "#dc2626" : "#16a34a" }}>
                    {lowStockItems.length} items critical
                  </span>
                </div>

                {lowStockItems.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 0", color: "#16a34a", fontSize: 14, fontWeight: 600 }}>
                    ✅ All shelves are sufficiently stocked!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 275, overflowY: "auto" }}>
                    {lowStockItems.map((item) => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: item.stock === 0 ? "#fef2f2" : "#fffbeb", borderRadius: 8, border: item.stock === 0 ? "1px solid #fecaca" : "1px solid #fef08a" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 20 }}>{item.emoji}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-dark)" }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: item.stock === 0 ? "#b91c1c" : "#b45309" }}>
                              {item.stock === 0 ? "Out of Stock at Counter" : "Low Stock Alert"}
                            </div>
                          </div>
                        </div>
                        <span style={{ 
                          padding: "4px 10px", 
                          borderRadius: 20, 
                          fontSize: 12, 
                          fontWeight: 800, 
                          background: item.stock === 0 ? "#fee2e2" : "#fef3c7", 
                          color: item.stock === 0 ? "#991b1b" : "#92400e" 
                        }}>
                          {item.stock === 0 ? "Empty" : `${item.stock} left`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Reconciliation Progress */}
            <div className="mm-block" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-dark)", margin: "0 0 16px 0" }}>
                Shift Payment Settlement Breakdown
              </h3>
              <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden", marginBottom: 16, background: "#f1f5f9" }}>
                <div 
                  style={{ 
                    width: `${totalShiftSales ? ((cashSales / totalShiftSales) * 100).toFixed(1) : 0}%`, 
                    background: "#16a34a" 
                  }} 
                  title={`Cash: ${money(cashSales)}`} 
                />
                <div 
                  style={{ 
                    width: `${totalShiftSales ? ((upiSales / totalShiftSales) * 100).toFixed(1) : 0}%`, 
                    background: "#2563eb" 
                  }} 
                  title={`UPI: ${money(upiSales)}`} 
                />
                <div 
                  style={{ 
                    width: `${totalShiftSales ? ((khataSales / totalShiftSales) * 100).toFixed(1) : 0}%`, 
                    background: "#ea580c" 
                  }} 
                  title={`Store Credit: ${money(khataSales)}`} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: "#16a34a" }}></div>
                  <span style={{ fontSize: 13, color: "var(--text-dark)" }}>
                    <strong>Cash Drawer:</strong> {money(cashSales)} ({totalShiftSales ? Math.round((cashSales / totalShiftSales) * 100) : 0}%)
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: "#2563eb" }}></div>
                  <span style={{ fontSize: 13, color: "var(--text-dark)" }}>
                    <strong>UPI QR:</strong> {money(upiSales)} ({totalShiftSales ? Math.round((upiSales / totalShiftSales) * 100) : 0}%)
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: "#ea580c" }}></div>
                  <span style={{ fontSize: 13, color: "var(--text-dark)" }}>
                    <strong>Store Credit (Due):</strong> {money(khataSales)} ({totalShiftSales ? Math.round((khataSales / totalShiftSales) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab.startsWith("orders") && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ fontSize: 28, margin: 0, color: 'var(--text-dark)', fontWeight: 800 }}>
                {sidebarItems.find(s => s.id === activeTab)?.label}
              </h2>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button 
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  style={{ 
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                    border: soundEnabled ? "1px solid #bbf7d0" : "1px solid var(--border)",
                    background: soundEnabled ? "#f0fdf4" : "#f8fafc",
                    color: soundEnabled ? "#15803d" : "var(--text-gray)",
                    fontSize: 13, fontWeight: 600, cursor: "pointer"
                  }}
                  title="Toggle Audio Bell on New Orders"
                >
                  {soundEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                  <span>{soundEnabled ? "Audio Bell ON" : "Bell Muted"}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => playOrderChime()}
                  style={{ background: "#f1f5f9", border: "1px solid var(--border)", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  title="Test Sound"
                >
                  🔔 Test Bell
                </button>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ background: "white", padding: 80, textAlign: "center", borderRadius: 'var(--radius-lg)', color: "var(--text-gray)", border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <h3 style={{ fontSize: 20, margin: '0 0 8px 0', color: 'var(--text-dark)' }}>No orders found in this section.</h3>
                <p>Great job! You're all caught up.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
                {filteredOrders.map(o => (
                  <div key={o.id} className="mm-block" style={{ padding: 24, display: 'flex', flexDirection: 'column', margin: 0, border: o.status === 'New' ? '2px solid #f59e0b' : '1px solid var(--border)' }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "var(--text-dark)" }}>#{o.id}</h3>
                          <span style={{ 
                            padding: "3px 10px", 
                            borderRadius: 20, 
                            fontSize: 12, 
                            fontWeight: 700,
                            background: statusStyle[o.status]?.bg || '#f1f5f9', 
                            color: statusStyle[o.status]?.fg || '#333' 
                          }}>
                            {o.status}
                          </span>
                          {o.isParchi && (
                            <span style={{ background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                              📝 GROCERY SLIP
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: 13, color: "var(--text-gray)", display: "flex", flexDirection: "column", gap: 6 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={15}/> <strong style={{ color: 'var(--text-dark)' }}>{o.customer}</strong> • {o.phone}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={15}/> {o.time} {o.date ? `(${o.date})` : ""}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600 }}>
                            <Store size={15}/> Store Pickup Counter
                          </span>
                        </div>
                      </div>

                      {/* WhatsApp Quick Chat Button */}
                      <button 
                        type="button" 
                        onClick={() => sendCustomerWhatsApp(o)}
                        style={{ 
                          background: "#25D366", color: "white", border: "none", borderRadius: 8,
                          padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                          fontSize: 12, fontWeight: 700, boxShadow: "0 2px 6px rgba(37, 211, 102, 0.3)"
                        }}
                        title="Ping Customer on WhatsApp"
                      >
                        <MessageSquare size={14} />
                        <span>WhatsApp</span>
                      </button>
                    </div>

                    {/* Payment Mode Indicator */}
                    <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 12, background: "#f8fafc", padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--text-gray)", fontWeight: 600 }}>Payment:</span>
                      <strong style={{ color: "var(--text-dark)" }}>
                        {o.payment === "cod" ? "💵 Cash at Counter" :
                         o.payment === "upi" ? `📱 Direct UPI${o.utr ? ` (UTR: ${o.utr})` : ""}` :
                         o.payment === "khata" ? "📒 Store Credit" : "Online"}
                      </strong>
                    </div>

                    {o.notes && (
                      <div style={{ marginBottom: 12, fontSize: 12, color: "#b45309", background: "#fffbeb", padding: "6px 10px", borderRadius: 6, border: "1px solid #fde68a" }}>
                        <strong>Note:</strong> {o.notes}
                      </div>
                    )}
                    
                    {/* Items / Grocery Slip Details */}
                    <div style={{ background: "#f8fafc", padding: 14, borderRadius: 'var(--radius-sm)', flex: 1, marginBottom: 16, border: '1px solid var(--border)' }}>
                      {o.isParchi ? (
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                            <FileText size={15} color="#d97706" />
                            <span>Customer's Uploaded Grocery Slip:</span>
                          </div>
                          
                          {o.parchiText && (
                            <div style={{ background: "white", padding: 10, borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, whiteSpace: "pre-line", marginBottom: 10, color: "#334155" }}>
                              {o.parchiText}
                            </div>
                          )}

                          {o.parchiImage && (
                            <div style={{ marginBottom: 10 }}>
                              <button 
                                type="button" 
                                onClick={() => setPreviewSlipImage(o.parchiImage)}
                                style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "1px solid var(--border)", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "var(--primary)", cursor: "pointer" }}
                              >
                                <Eye size={14} />
                                <span>View Grocery Slip Image</span>
                              </button>
                            </div>
                          )}

                          {/* Editable Bill Input for Parchi */}
                          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, background: "#fef3c7", padding: "8px 12px", borderRadius: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#78350f" }}>Final Bill (₹):</span>
                            <input 
                              type="number"
                              className="mm-input"
                              style={{ width: 100, padding: "4px 8px", background: "white", fontWeight: 800, fontSize: 14 }}
                              value={o.total || ""}
                              placeholder="0"
                              onChange={(e) => updateParchiBill(o.id, e.target.value)}
                            />
                            <span style={{ fontSize: 11, color: "#92400e" }}>Pack karke bill likho</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {o.items.map((i, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: 'var(--text-dark)' }}>
                              <span>{i.qty}x {i.name}</span>
                              <span style={{ fontWeight: 600 }}>{money(i.price * i.qty)}</span>
                            </div>
                          ))}
                          <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "10px 0" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 15, color: 'var(--text-dark)' }}>
                            <span>Total</span>
                            <span>{money(o.total || orderTotal(o))}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {nextStatus[o.status] && (
                        <button 
                          className="mm-btn-primary"
                          style={{ flex: 1, padding: "10px 14px", fontSize: 13 }}
                          onClick={() => updateOrderStatus(o.id, nextStatus[o.status])}
                        >
                          <Check size={16}/> Mark {nextStatus[o.status]}
                        </button>
                      )}
                      {o.status !== "Cancelled" && o.status !== "Completed" && (
                        <button 
                          className="mm-iconbtn"
                          title="Cancel Order"
                          style={{ background: "#fef2f2", color: "#ef4444", border: '1px solid #fecaca', width: 40, height: 40 }}
                          onClick={() => updateOrderStatus(o.id, "Cancelled")}
                        >
                          <X size={16} />
                        </button>
                      )}
                      <button className="mm-iconbtn" title="View & Print Official Bill" style={{ background: '#f1f5f9', border: '1px solid var(--border)', width: 40, height: 40 }} onClick={() => setActiveReceiptOrder(o)}>
                        <Printer size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "pos" && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ fontSize: 28, margin: "0 0 24px 0", color: 'var(--text-dark)', fontWeight: 800 }}>Point of Sale (Billing)</h2>
            {checkoutComplete ? (
              <div className="mm-block" style={{ textAlign: "center", padding: "80px 20px", maxWidth: 600, margin: "40px auto" }}>
                <CheckCircle size={80} color="var(--primary)" style={{ margin: "0 auto 24px" }} />
                <h2 style={{ fontSize: 32, margin: "0 0 16px 0", color: 'var(--text-dark)' }}>Bill Generated!</h2>
                <p style={{ fontSize: 16, color: "var(--text-gray)", marginBottom: 32 }}>
                  Order <strong>#{generatedOrderId}</strong> counter billing complete. Stock and customer records updated.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: "wrap" }}>
                  <button 
                    className="mm-btn-primary" 
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: 15 }} 
                    onClick={() => setActiveReceiptOrder(lastPosOrder || orders.find(o => o.id === generatedOrderId))}
                  >
                    <Printer size={18} /> View & Print Official Bill
                  </button>
                  <button 
                    className="mm-btn" 
                    style={{ padding: '12px 24px', fontSize: 15, background: "#f1f5f9" }} 
                    onClick={() => setCheckoutComplete(false)}
                  >
                    + Next Customer Bill
                  </button>
                </div>
              </div>
            ) : (
              <div className="pos-grid" style={{ alignItems: 'start' }}>
                
                {/* Product Selection */}
                <div className="mm-block" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center', background: '#f8fafc' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
                      <input 
                        type="text" 
                        placeholder="Search products by name or category..." 
                        className="mm-input"
                        style={{ paddingLeft: 44, background: 'white' }}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, maxHeight: '65vh', overflowY: 'auto' }}>
                    {products
                      .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
                      .flatMap(p => {
                        if (p.hasVariants && p.variants && p.variants.length > 0) {
                          return p.variants.map(v => ({
                            key: `${p.id}__${v.id}`,
                            displayName: `${p.name} (${v.name || v.unit})`,
                            price: v.price,
                            stock: v.stock,
                            emoji: p.emoji,
                            image: p.image,
                            category: p.category
                          }));
                        }
                        return [{
                          key: p.id,
                          displayName: p.name,
                          price: p.price,
                          stock: p.stock,
                          emoji: p.emoji,
                          image: p.image,
                          category: p.category
                        }];
                      })
                      .map(item => (
                      <div key={item.key} onClick={() => handlePOSChange(item.key, 1)} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, cursor: item.stock > 0 ? 'pointer' : 'not-allowed', background: 'white', opacity: item.stock > 0 ? 1 : 0.5, transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }} onMouseOver={e => { if(item.stock > 0) e.currentTarget.style.borderColor = 'var(--primary)' }} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>{item.emoji}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, lineHeight: 1.2 }}>{item.displayName}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-dark)', marginTop: 'auto' }}>{money(item.price)}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-gray)', marginTop: 4 }}>Stock: {item.stock}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing Cart */}
                <div className="mm-block" style={{ padding: 0, position: 'sticky', top: 20, overflow: 'hidden' }}>
                  <div style={{ padding: 20, borderBottom: '1px solid var(--border)', background: 'var(--primary)', color: 'white' }}>
                    <h3 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}><Calculator size={20} /> Current Bill</h3>
                  </div>
                  
                  {/* Customer Details & Smart Credit Ledger Search */}
                  <div style={{ padding: 18, borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Customer & Credit Account
                      </span>
                      {selectedPosCustomer && (
                        <button 
                          type="button" 
                          onClick={() => { setSelectedPosCustomer(null); setPosCustomerQuery(""); }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                        >
                          <X size={13} /> Change
                        </button>
                      )}
                    </div>

                    {/* IF CUSTOMER IS SELECTED */}
                    {selectedPosCustomer ? (
                      <div style={{ background: 'white', borderRadius: 10, border: '1px solid var(--border)', padding: 12, marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                            {selectedPosCustomer.name.charAt(0)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {selectedPosCustomer.name}
                              </span>
                              <span style={{ background: '#f1f5f9', color: 'var(--text-gray)', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 4 }}>
                                {selectedPosCustomer.id}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-gray)' }}>
                              📞 {selectedPosCustomer.phone || '-'}
                            </div>
                          </div>
                        </div>

                        {/* Customer Due & Limit Metrics */}
                        <div style={{ background: (selectedPosCustomerStatement?.currentDue || 0) > 0 ? '#fff7ed' : '#f0fdf4', border: `1px solid ${(selectedPosCustomerStatement?.currentDue || 0) > 0 ? '#fed7aa' : '#bbf7d0'}`, borderRadius: 8, padding: '8px 10px', fontSize: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ color: 'var(--text-gray)' }}>Current Balance Due:</span>
                            <strong style={{ color: (selectedPosCustomerStatement?.currentDue || 0) > 0 ? '#c2410c' : '#15803d' }}>
                              {money(selectedPosCustomerStatement?.currentDue || 0)}
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-gray)' }}>Credit Limit:</span>
                            <span>{money(selectedPosCustomer.khataLimit || 3000)}</span>
                          </div>

                          {/* Projected Due if paying via Khata */}
                          {(posPayment === 'khata' || posPayment === 'due') && (
                            <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                              <span>New Total Due:</span>
                              <span style={{ color: '#dc2626' }}>
                                {money((selectedPosCustomerStatement?.currentDue || 0) + subtotal)}
                              </span>
                            </div>
                          )}

                          {/* Overlimit Warning */}
                          {(posPayment === 'khata' || posPayment === 'due') && ((selectedPosCustomerStatement?.currentDue || 0) + subtotal > (selectedPosCustomer.khataLimit || 3000)) && (
                            <div style={{ marginTop: 6, background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <AlertCircle size={13} /> Credit Limit Exceeded!
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* CUSTOMER SEARCH BY NAME, PHONE, OR ID */
                      <div style={{ position: 'relative', marginBottom: 14 }}>
                        <div style={{ position: 'relative' }}>
                          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
                          <input 
                            type="text" 
                            placeholder="Search by Name, Phone, or ID..." 
                            className="mm-input" 
                            style={{ paddingLeft: 36, paddingRight: 32, fontSize: 13, background: 'white' }} 
                            value={posCustomerQuery} 
                            onFocus={() => setShowCustomerDropdown(true)}
                            onChange={e => {
                              setPosCustomerQuery(e.target.value);
                              setShowCustomerDropdown(true);
                            }} 
                          />
                          {posCustomerQuery && (
                            <button 
                              type="button"
                              onClick={() => setPosCustomerQuery("")}
                              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)' }}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        {/* DROPDOWN RESULTS */}
                        {showCustomerDropdown && (
                          <div 
                            style={{ 
                              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, 
                              background: 'white', border: '1px solid var(--border)', borderRadius: 10, 
                              boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 50, maxHeight: 220, overflowY: 'auto' 
                            }}
                          >
                            {matchingPosCustomers.length > 0 ? (
                              matchingPosCustomers.map(cust => {
                                const stmt = getCustomerKhataStatement(cust, orders);
                                const due = stmt.currentDue;

                                return (
                                  <div 
                                    key={cust.id} 
                                    onClick={() => {
                                      setSelectedPosCustomer(cust);
                                      setShowCustomerDropdown(false);
                                      setPosCustomerQuery("");
                                    }}
                                    style={{ 
                                      padding: '10px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', 
                                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>
                                        {cust.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                          <span>{cust.name}</span>
                                          <span style={{ fontSize: 10, color: 'var(--text-gray)', background: '#f8fafc', padding: '1px 5px', borderRadius: 4 }}>
                                            {cust.id}
                                          </span>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-gray)' }}>{cust.phone}</div>
                                      </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                      {due > 0 ? (
                                        <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: 10, fontSize: 11, fontWeight: 800 }}>
                                          {money(due)} Due
                                        </span>
                                      ) : (
                                        <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                                          Clear
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-gray)', textAlign: 'center' }}>
                                No customer found matching "{posCustomerQuery}".
                              </div>
                            )}

                            {/* Quick Add Option */}
                            <div 
                              onClick={() => {
                                setQuickAddForm({ name: posCustomerQuery || "", phone: "", address: "", khataLimit: "3000" });
                                setShowQuickAddCustModal(true);
                                setShowCustomerDropdown(false);
                              }}
                              style={{ 
                                padding: '10px 14px', background: '#f8fafc', borderTop: '1px solid var(--border)', 
                                color: 'var(--brand)', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 
                              }}
                            >
                              <UserPlus size={14} /> + Register "{posCustomerQuery || 'New Customer'}" to Credit Ledger
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* PAYMENT MODE SELECTOR (CASH, UPI, STORE CREDIT DUE) */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-gray)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                        Select Payment Method
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setPosPayment('cash')}
                          style={{
                            padding: '8px 4px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            border: posPayment === 'cash' ? '2px solid #16a34a' : '1px solid var(--border)',
                            background: posPayment === 'cash' ? '#f0fdf4' : 'white',
                            color: posPayment === 'cash' ? '#15803d' : 'var(--text-dark)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
                          }}
                        >
                          <span>💵</span>
                          <span>Cash</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPosPayment('upi')}
                          style={{
                            padding: '8px 4px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            border: posPayment === 'upi' ? '2px solid #2563eb' : '1px solid var(--border)',
                            background: posPayment === 'upi' ? '#eff6ff' : 'white',
                            color: posPayment === 'upi' ? '#1d4ed8' : 'var(--text-dark)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
                          }}
                        >
                          <span>📱</span>
                          <span>UPI QR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPosPayment('khata')}
                          style={{
                            padding: '8px 4px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            border: (posPayment === 'khata' || posPayment === 'due') ? '2px solid #ea580c' : '1px solid var(--border)',
                            background: (posPayment === 'khata' || posPayment === 'due') ? '#fff7ed' : 'white',
                            color: (posPayment === 'khata' || posPayment === 'due') ? '#c2410c' : 'var(--text-dark)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
                          }}
                        >
                          <span>📒</span>
                          <span>Store Credit</span>
                        </button>
                      </div>
                    </div>

                    {/* Store Credit Confirmation Banner */}
                    {(posPayment === 'khata' || posPayment === 'due') && (
                      <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#9a3412', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>📒</span>
                        {selectedPosCustomer ? (
                          <span>Bill of <strong>{money(subtotal)}</strong> will be charged to <strong>{selectedPosCustomer.name}</strong>'s credit account.</span>
                        ) : (
                          <span>Please select a customer above to charge to Store Credit.</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ minHeight: 200, maxHeight: 300, overflowY: 'auto' }}>
                    {cartItems.length === 0 ? (
                      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-gray)' }}>
                        No items added to bill.
                      </div>
                    ) : (
                      <div>
                        {cartItems.map(i => (
                          <div key={i.id} style={{ display: 'flex', padding: '16px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-dark)' }}>{i.name}</div>
                              <div style={{ fontSize: 13, color: 'var(--text-gray)' }}>{money(i.price)}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: 'var(--radius-sm)', padding: 4, width: 80, justifyContent: 'space-between', color: 'var(--text-dark)' }}>
                              <button onClick={() => handlePOSChange(i.id, -1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center' }}><Minus size={14} /></button>
                              <span style={{ fontWeight: 600, fontSize: 14 }}>{i.qty}</span>
                              <button onClick={() => handlePOSChange(i.id, 1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center' }}><Plus size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 20, background: 'white', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: 'var(--text-dark)', marginBottom: 20 }}>
                      <span>Total Amount</span>
                      <span>{money(subtotal)}</span>
                    </div>
                    <button 
                      className="mm-btn-primary" 
                      style={{ 
                        width: '100%', padding: 16, fontSize: 16,
                        background: (posPayment === 'khata' || posPayment === 'due') ? '#ea580c' : 'var(--brand)'
                      }}
                      disabled={cartItems.length === 0 || ((posPayment === 'khata' || posPayment === 'due') && !selectedPosCustomer && !posCustomerQuery.trim())}
                      onClick={processPOSOrder}
                    >
                      {(posPayment === 'khata' || posPayment === 'due') 
                        ? `Generate Bill & Charge to Credit (${money(subtotal)})` 
                        : `Generate Bill (${money(subtotal)})`
                      }
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {activeTab === "daily-bills" && (
          <DailyBillsView 
            orders={orders} 
            products={products} 
            updateOrders={updateOrders} 
            isManager={true}
          />
        )}

        {activeTab === "customers" && (
          <CustomerKhataView 
            customers={customers} 
            updateCustomers={updateCustomers} 
            orders={orders} 
            updateOrders={updateOrders} 
          />
        )}

        {/* Parchi Slip Photo Modal */}
        {previewSlipImage && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setPreviewSlipImage(null)}>
            <div style={{ position: "relative", maxWidth: 650, maxHeight: "90vh", background: "white", padding: 12, borderRadius: 12 }} onClick={e => e.stopPropagation()}>
              <button 
                type="button" 
                onClick={() => setPreviewSlipImage(null)}
                style={{ position: "absolute", top: -16, right: -16, background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: "bold" }}
              >
                <X size={20} />
              </button>
              <img src={previewSlipImage} alt="Grocery Slip Full View" style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", display: "block", borderRadius: 8 }} />
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 13, color: "var(--text-gray)" }}>
                Grocery List Slip • Click anywhere outside to close
              </div>
            </div>
          </div>
        )}

        {/* QUICK REGISTER NEW CUSTOMER FOR POS CREDIT */}
        {showQuickAddCustModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div className="mm-block modal-dialog-responsive" style={{ width: "100%", maxWidth: 460, padding: 24, animation: "scaleIn 0.2s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--brand)" }}>
                  + Register Customer to Credit Ledger
                </h3>
                <button type="button" onClick={() => setShowQuickAddCustModal(false)} className="mm-iconbtn"><X size={18} /></button>
              </div>

              <form onSubmit={handleQuickAddCustomer} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Customer Name *</label>
                  <input required className="mm-input" placeholder="e.g. Anjali Gupta" value={quickAddForm.name} onChange={e => setQuickAddForm({...quickAddForm, name: e.target.value})} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Phone Number (WhatsApp) *</label>
                  <input required type="tel" className="mm-input" placeholder="e.g. 9823456789" value={quickAddForm.phone} onChange={e => setQuickAddForm({...quickAddForm, phone: e.target.value})} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Area / Address</label>
                  <input className="mm-input" placeholder="e.g. Lane 3, Near City Park" value={quickAddForm.address} onChange={e => setQuickAddForm({...quickAddForm, address: e.target.value})} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Credit Limit (₹)</label>
                  <input type="number" min="500" className="mm-input" placeholder="3000" value={quickAddForm.khataLimit} onChange={e => setQuickAddForm({...quickAddForm, khataLimit: e.target.value})} />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button type="button" onClick={() => setShowQuickAddCustModal(false)} className="mm-btn" style={{ flex: 1, background: "#f1f5f9" }}>Cancel</button>
                  <button type="submit" className="mm-btn-primary" style={{ flex: 1 }}>Save & Select</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STANDARDIZED OFFICIAL BILL MODAL */}
        {activeReceiptOrder && (
          <StandardBillModal 
            order={activeReceiptOrder} 
            onClose={() => setActiveReceiptOrder(null)} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}

import React, { useState, useMemo } from "react";
import { 
  BarChart3, Calendar, Download, Printer, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, Package, Search, DollarSign, 
  ShoppingBag, ArrowUpRight, ArrowDownRight, Filter, RefreshCw,
  FileText, Store, ChevronRight, Layers, PieChart
} from "lucide-react";
import { money, orderTotal, STORE_CONFIG, parseDateToMidnight } from "../data/store";

export default function DateRangeReportsView({ 
  orders = [], 
  products = [], 
  expenses = [], 
  customers = [],
  theme = "light"
}) {
  const [selectedPreset, setSelectedPreset] = useState("7D"); // "TODAY", "YESTERDAY", "7D", "THIS_MONTH", "LAST_MONTH", "ALL", "CUSTOM"
  
  // Custom Date range pickers (defaults to last 7 days)
  const [startDateStr, setStartDateStr] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split("T")[0];
  });
  const [endDateStr, setEndDateStr] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [activeReportTab, setActiveReportTab] = useState("items"); // "items" | "stock" | "pnl"
  const [searchItemQuery, setSearchItemQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL"); // "ALL" | "OVER" | "LOW" | "OK"

  // Compute start and end timestamps for the selected range
  const dateBounds = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    let start = new Date(0);
    let label = "All Time Record";

    if (selectedPreset === "TODAY") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      label = `Today (${now.toLocaleDateString("en-IN")})`;
    } else if (selectedPreset === "YESTERDAY") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      label = `Yesterday (${start.toLocaleDateString("en-IN")})`;
    } else if (selectedPreset === "7D") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
      label = `Last 7 Days (${start.toLocaleDateString("en-IN")} - ${now.toLocaleDateString("en-IN")})`;
    } else if (selectedPreset === "THIS_MONTH") {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      label = `This Month (${now.toLocaleString("en-IN", { month: "long", year: "numeric" })})`;
    } else if (selectedPreset === "LAST_MONTH") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end.setFullYear(now.getFullYear(), now.getMonth(), 0);
      label = `Last Month (${start.toLocaleString("en-IN", { month: "long", year: "numeric" })})`;
    } else if (selectedPreset === "CUSTOM") {
      if (startDateStr) {
        const [sy, sm, sd] = startDateStr.split("-").map(Number);
        start = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
      }
      if (endDateStr) {
        const [ey, em, ed] = endDateStr.split("-").map(Number);
        end.setFullYear(ey, em - 1, ed);
        end.setHours(23, 59, 59, 999);
      }
      label = `Custom Range: ${startDateStr} to ${endDateStr}`;
    }

    return { start, end, label };
  }, [selectedPreset, startDateStr, endDateStr]);

  // Date Check Helper
  const isInRange = (dateStr, createdAt) => {
    if (selectedPreset === "ALL") return true;
    const d = parseDateToMidnight(dateStr, createdAt);
    return d >= dateBounds.start && d <= dateBounds.end;
  };

  // Filtered Orders & Expenses
  const periodOrders = useMemo(() => {
    return orders.filter(o => isInRange(o.date, o.created_at));
  }, [orders, dateBounds, selectedPreset]);

  const completedOrders = useMemo(() => {
    return periodOrders.filter(o => o.status !== "Cancelled");
  }, [periodOrders]);

  const periodExpenses = useMemo(() => {
    return expenses.filter(e => isInRange(e.date, e.created_at));
  }, [expenses, dateBounds, selectedPreset]);

  // 1. FINANCIAL SUMMARY (Profit / Loss & Revenue)
  const financials = useMemo(() => {
    const grossSales = completedOrders.reduce((sum, o) => sum + (o.total || orderTotal(o)), 0);
    const totalExp = periodExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const netProfit = grossSales - totalExp;
    const marginPercent = grossSales > 0 ? ((netProfit / grossSales) * 100).toFixed(1) : 0;

    let cashTotal = 0, cashCount = 0;
    let upiTotal = 0, upiCount = 0;
    let khataTotal = 0, khataCount = 0;

    completedOrders.forEach(o => {
      const amt = o.total || orderTotal(o);
      const p = (o.payment || "").toLowerCase();
      if (p === "cash" || p === "cod") {
        cashTotal += amt;
        cashCount++;
      } else if (p === "khata") {
        khataTotal += amt;
        khataCount++;
      } else {
        upiTotal += amt;
        upiCount++;
      }
    });

    return {
      grossSales,
      totalExpenses: totalExp,
      netProfit,
      isProfit: netProfit >= 0,
      marginPercent,
      completedOrdersCount: completedOrders.length,
      avgOrderValue: completedOrders.length > 0 ? Math.round(grossSales / completedOrders.length) : 0,
      cashTotal,
      cashCount,
      upiTotal,
      upiCount,
      khataTotal,
      khataCount
    };
  }, [completedOrders, periodExpenses]);

  // 2. ITEM-WISE SALES BREAKDOWN (Kya Bika & Kitne Ka Bika)
  const itemSales = useMemo(() => {
    const map = {};
    let totalUnits = 0;
    let parchiCount = 0;
    let parchiRevenue = 0;

    completedOrders.forEach(order => {
      if (order.isParchi) {
        parchiCount++;
        parchiRevenue += (order.total || orderTotal(order));
      }

      (order.items || []).forEach(item => {
        const key = (item.name || "Item").trim();
        const qty = Number(item.qty) || 1;
        const price = Number(item.price) || 0;
        const total = qty * price;
        totalUnits += qty;

        if (!map[key]) {
          const matchedProd = products.find(p => p.name.toLowerCase().trim() === key.toLowerCase());
          map[key] = {
            name: key,
            emoji: item.emoji || matchedProd?.emoji || "📦",
            category: matchedProd?.category || "General Grocery",
            currentStock: matchedProd ? matchedProd.stock : null,
            unitsSold: 0,
            totalSales: 0,
            price: price
          };
        }

        map[key].unitsSold += qty;
        map[key].totalSales += total;
      });
    });

    let list = Object.values(map);
    list.sort((a, b) => b.totalSales - a.totalSales);

    if (searchItemQuery.trim()) {
      const q = searchItemQuery.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }

    return {
      itemsList: list,
      totalUnits,
      parchiCount,
      parchiRevenue
    };
  }, [completedOrders, products, searchItemQuery]);

  // 3. INVENTORY & STOCK HEALTH (Kya Stock Over Hua & Kya Low Hai)
  const stockReports = useMemo(() => {
    const outOfStock = products.filter(p => Number(p.stock) === 0);
    const lowStock = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5);
    const healthyStock = products.filter(p => Number(p.stock) > 5);

    const totalStockUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const totalStockValuation = products.reduce((sum, p) => sum + (Number(p.stock) || 0) * (Number(p.price) || 0), 0);

    let displayList = products;
    if (stockFilter === "OVER") displayList = outOfStock;
    else if (stockFilter === "LOW") displayList = lowStock;
    else if (stockFilter === "OK") displayList = healthyStock;

    return {
      outOfStock,
      lowStock,
      healthyStock,
      totalStockUnits,
      totalStockValuation,
      totalProductsCount: products.length,
      displayList
    };
  }, [products, stockFilter]);

  // Export to CSV Function
  const handleExportCSV = () => {
    const lines = [];
    lines.push(`"SIYASITAL STORE - BUSINESS & INVENTORY AUDIT REPORT"`);
    lines.push(`"Report Period","${dateBounds.label}"`);
    lines.push(`"Generated On","${new Date().toLocaleString("en-IN")}"`);
    lines.push("");

    // 1. Financial Summary
    lines.push(`"--- 1. FINANCIAL SUMMARY (PROFIT / LOSS & SALES) ---"`);
    lines.push(`"Metric","Amount (INR)","Details"`);
    lines.push(`"Gross Sales (Kul Bikri)","${financials.grossSales}","${financials.completedOrdersCount} orders completed"`);
    lines.push(`"Store Expenses (Kul Kharcha)","${financials.totalExpenses}","${periodExpenses.length} expense entries"`);
    lines.push(`"Net Result (Munafa / Ghata)","${financials.netProfit}","${financials.isProfit ? 'PROFIT' : 'LOSS'} (${financials.marginPercent}% margin)"`);
    lines.push(`"Cash Payments Collected","${financials.cashTotal}","${financials.cashCount} cash bills"`);
    lines.push(`"UPI Payments Collected","${financials.upiTotal}","${financials.upiCount} UPI QR transactions"`);
    lines.push(`"Store Credit (Khata Sales)","${financials.khataTotal}","${financials.khataCount} credit orders"`);
    lines.push("");

    // 2. Item-Wise Sales Breakdown
    lines.push(`"--- 2. PRODUCTS SOLD IN THIS PERIOD (KYA BIKA) ---"`);
    lines.push(`"Product Name","Category","Units Sold","Total Sales (INR)","Current In-Store Stock"`);
    itemSales.itemsList.forEach(item => {
      lines.push(`"${item.name}","${item.category}","${item.unitsSold}","${item.totalSales}","${item.currentStock !== null ? item.currentStock : 'N/A'}"`);
    });
    if (itemSales.parchiCount > 0) {
      lines.push(`"Handwritten Grocery Slip Orders (Parchi)","Parchi Slip","${itemSales.parchiCount} slips","${itemSales.parchiRevenue}","-"`);
    }
    lines.push("");

    // 3. Stock Over (Out of Stock)
    lines.push(`"--- 3. OUT OF STOCK ITEMS (STOCK OVER - KHATAM HO CHUKA) ---"`);
    lines.push(`"Product Name","Category","Rate (INR)","Stock Level"`);
    stockReports.outOfStock.forEach(p => {
      lines.push(`"${p.name}","${p.category || 'General'}","${p.price}","OUT OF STOCK (0 Units)"`);
    });
    lines.push("");

    // 4. Low Stock Alerts
    lines.push(`"--- 4. LOW STOCK ALERTS (KHATAM HONE WALA SAMAAN) ---"`);
    lines.push(`"Product Name","Category","Units Left","Rate (INR)"`);
    stockReports.lowStock.forEach(p => {
      lines.push(`"${p.name}","${p.category || 'General'}","${p.stock} units left","${p.price}"`);
    });

    const csvContent = lines.join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SiyasitalStore-Report-${selectedPreset}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Printable Business Report Container */}
      <div id="printable-business-report">
        
        {/* Top Header & Extractor Controls (Hidden in Print) */}
        <div className="no-print" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 18 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h2 style={{ fontSize: 26, margin: 0, fontWeight: 800, color: "var(--text-dark)" }}>
                  Date-Range Business & Stock Data Reports
                </h2>
                <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                  Live Data Extractor
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-gray)" }}>
                Kisi bhi date se kisi bhi date tak ka kya bika, kitne ka bika, profit/loss, aur stock over/low status dekhein aur download karein.
              </p>
            </div>

            {/* Export & Print Buttons */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleExportCSV}
                className="mm-btn-primary"
                style={{ 
                  background: "#059669", color: "white", padding: "10px 18px", 
                  borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(5, 150, 105, 0.25)"
                }}
                title="Download complete report in CSV / Excel format"
              >
                <Download size={16} /> Download CSV / Excel Report
              </button>

              <button
                type="button"
                onClick={handlePrintReport}
                className="mm-btn"
                style={{ 
                  background: "white", border: "1px solid var(--border)", padding: "10px 16px", 
                  borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, color: "var(--text-dark)"
                }}
                title="Print clean A4 executive business report"
              >
                <Printer size={16} /> Print Report
              </button>
            </div>
          </div>

          {/* Date Range Selection Bar */}
          <div style={{ background: "white", padding: "14px 18px", borderRadius: 14, border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            {/* Quick Presets */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                { id: "TODAY", label: "Aaj (Today)" },
                { id: "YESTERDAY", label: "Kal (Yesterday)" },
                { id: "7D", label: "Pichle 7 Din" },
                { id: "THIS_MONTH", label: "Is Mahine" },
                { id: "LAST_MONTH", label: "Pichla Mahina" },
                { id: "ALL", label: "All Time" },
                { id: "CUSTOM", label: "📅 Custom Dates" },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPreset(p.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: selectedPreset === p.id ? "var(--brand)" : "#f1f5f9",
                    color: selectedPreset === p.id ? "white" : "var(--text-dark)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom Range Date Pickers */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-gray)" }}>From:</span>
              <input
                type="date"
                className="mm-input"
                style={{ padding: "6px 10px", fontSize: 12, width: 135 }}
                value={startDateStr}
                onChange={e => {
                  setStartDateStr(e.target.value);
                  setSelectedPreset("CUSTOM");
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-gray)" }}>To:</span>
              <input
                type="date"
                className="mm-input"
                style={{ padding: "6px 10px", fontSize: 12, width: 135 }}
                value={endDateStr}
                onChange={e => {
                  setEndDateStr(e.target.value);
                  setSelectedPreset("CUSTOM");
                }}
              />
            </div>
          </div>
        </div>

        {/* Print Header (Visible during Print only) */}
        <div style={{ display: "none" }} className="print-only">
          <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: 14, marginBottom: 16 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>{STORE_CONFIG.name} — Business & Inventory Audit</h1>
            <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>📍 {STORE_CONFIG.address} • Helpline: {STORE_CONFIG.whatsappNumber}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
              Report Period: {dateBounds.label} (Generated: {new Date().toLocaleString("en-IN")})
            </div>
          </div>
        </div>

        {/* Active Period Badge */}
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--text-gray)" }}>Active Period Filter:</span>
          <strong style={{ fontSize: 14, color: "var(--text-dark)", background: "#fef3c7", padding: "4px 12px", borderRadius: 8, border: "1px solid #fde68a" }}>
            📅 {dateBounds.label}
          </strong>
        </div>

        {/* 1. TOP SNAPSHOT METRIC CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
          {/* Gross Sales */}
          <div className="mm-card" style={{ padding: 20, background: "white", borderRadius: 14, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-gray)", textTransform: "uppercase" }}>Kul Bikri (Gross Sales)</span>
              <span style={{ background: "#dbeafe", color: "#1e40af", padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                {financials.completedOrdersCount} Bills
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-dark)", marginBottom: 4 }}>
              {money(financials.grossSales)}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
              Avg Bill: <strong>{money(financials.avgOrderValue)}</strong> • Total {itemSales.totalUnits} items sold
            </div>
          </div>

          {/* Store Expenses */}
          <div className="mm-card" style={{ padding: 20, background: "white", borderRadius: 14, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-gray)", textTransform: "uppercase" }}>Kul Kharcha (Expenses)</span>
              <span style={{ background: "#fee2e2", color: "#dc2626", padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                {periodExpenses.length} Entries
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#dc2626", marginBottom: 4 }}>
              {money(financials.totalExpenses)}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
              Rent, Electricity, Supplies & Operations
            </div>
          </div>

          {/* Net Profit / Loss */}
          <div className="mm-card" style={{ padding: 20, background: financials.isProfit ? "#f0fdf4" : "#fef2f2", borderRadius: 14, border: financials.isProfit ? "1px solid #bbf7d0" : "1px solid #fecaca" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: financials.isProfit ? "#166534" : "#991b1b", textTransform: "uppercase" }}>
                {financials.isProfit ? "🟢 Net Munafa (Profit)" : "🔴 Net Ghata (Loss)"}
              </span>
              <span style={{ background: financials.isProfit ? "#dcfce7" : "#fee2e2", color: financials.isProfit ? "#15803d" : "#b91c1c", padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                {financials.marginPercent}% Margin
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: financials.isProfit ? "#15803d" : "#b91c1c", marginBottom: 4 }}>
              {financials.isProfit ? `+${money(financials.netProfit)}` : money(financials.netProfit)}
            </div>
            <div style={{ fontSize: 12, color: financials.isProfit ? "#166534" : "#991b1b" }}>
              Bikri me se saara kharcha nikalne ke baad
            </div>
          </div>

          {/* Stock Alerts Overview */}
          <div className="mm-card" style={{ padding: 20, background: "white", borderRadius: 14, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-gray)", textTransform: "uppercase" }}>Stock Warnings</span>
              <span style={{ background: "#ffedd5", color: "#c2410c", padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                Live Inventory
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: stockReports.outOfStock.length > 0 ? "#dc2626" : "#16a34a" }}>
                {stockReports.outOfStock.length} Over
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#d97706" }}>
                • {stockReports.lowStock.length} Low
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
              Total Catalogue: {stockReports.totalProductsCount} items ({stockReports.totalStockUnits} units in shop)
            </div>
          </div>
        </div>

        {/* Payment Modes Strip */}
        <div style={{ background: "#f8fafc", padding: "14px 20px", borderRadius: 12, border: "1px solid var(--border)", marginBottom: 24, display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 14 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-gray)", fontWeight: 700, textTransform: "uppercase" }}>💵 Cash at Counter</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#15803d", marginTop: 2 }}>{money(financials.cashTotal)}</div>
            <div style={{ fontSize: 11, color: "var(--text-gray)" }}>{financials.cashCount} transactions</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--border)", height: 35, alignSelf: "center" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-gray)", fontWeight: 700, textTransform: "uppercase" }}>📱 UPI QR Payments</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#1d4ed8", marginTop: 2 }}>{money(financials.upiTotal)}</div>
            <div style={{ fontSize: 11, color: "var(--text-gray)" }}>{financials.upiCount} transactions</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--border)", height: 35, alignSelf: "center" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-gray)", fontWeight: 700, textTransform: "uppercase" }}>📒 Udhaar / Khata Credit</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#c2410c", marginTop: 2 }}>{money(financials.khataTotal)}</div>
            <div style={{ fontSize: 11, color: "var(--text-gray)" }}>{financials.khataCount} ledger bills</div>
          </div>
        </div>

        {/* Navigation Tabs (Items Sold vs Stock vs P&L) */}
        <div className="no-print" style={{ display: "flex", borderBottom: "2px solid var(--border)", marginBottom: 20, gap: 10 }}>
          <button
            type="button"
            onClick={() => setActiveReportTab("items")}
            style={{
              padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 800,
              color: activeReportTab === "items" ? "var(--brand)" : "var(--text-gray)",
              borderBottom: activeReportTab === "items" ? "3px solid var(--brand)" : "3px solid transparent",
              display: "flex", alignItems: "center", gap: 6
            }}
          >
            <ShoppingBag size={16} /> 1. Kya Bika (Item-Wise Sales Breakdown) ({itemSales.itemsList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveReportTab("stock")}
            style={{
              padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 800,
              color: activeReportTab === "stock" ? "var(--brand)" : "var(--text-gray)",
              borderBottom: activeReportTab === "stock" ? "3px solid var(--brand)" : "3px solid transparent",
              display: "flex", alignItems: "center", gap: 6
            }}
          >
            <Package size={16} /> 2. Kya Stock Over / Low Hua (Inventory Health) ({stockReports.outOfStock.length + stockReports.lowStock.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveReportTab("pnl")}
            style={{
              padding: "10px 18px", border: "none", background: "none", cursor: "pointer",
              fontSize: 14, fontWeight: 800,
              color: activeReportTab === "pnl" ? "var(--brand)" : "var(--text-gray)",
              borderBottom: activeReportTab === "pnl" ? "3px solid var(--brand)" : "3px solid transparent",
              display: "flex", alignItems: "center", gap: 6
            }}
          >
            <DollarSign size={16} /> 3. Kya Profit / Lose Hua (Detailed Ledger)
          </button>
        </div>

        {/* TAB 1: KYA BIKA (ITEM-WISE SALES) */}
        {activeReportTab === "items" && (
          <div className="mm-card" style={{ background: "white", padding: 24, borderRadius: 14, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text-dark)" }}>
                  Itemized Sales Report (Is Date Range Me Kya Bika)
                </h3>
                <span style={{ fontSize: 12, color: "var(--text-gray)" }}>
                  Total {itemSales.totalUnits} units sold across {itemSales.itemsList.length} distinct grocery items.
                </span>
              </div>

              {/* Search Box */}
              <div style={{ position: "relative", minWidth: 240 }}>
                <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-gray)" }} />
                <input
                  type="text"
                  placeholder="Search sold items..."
                  className="mm-input"
                  style={{ paddingLeft: 34, fontSize: 12 }}
                  value={searchItemQuery}
                  onChange={e => setSearchItemQuery(e.target.value)}
                />
              </div>
            </div>

            {itemSales.itemsList.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-gray)" }}>
                <ShoppingBag size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>No items were sold in this selected date range.</p>
                <span style={{ fontSize: 13 }}>Try selecting a broader date range above (e.g. Last 7 Days or All Time).</span>
              </div>
            ) : (
              <div className="table-responsive">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid var(--border)", color: "var(--text-gray)", textAlign: "left" }}>
                      <th style={{ padding: "10px 14px", width: 40, textAlign: "center" }}>#</th>
                      <th style={{ padding: "10px 14px" }}>Item Name & Category</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", width: 100 }}>Units Sold</th>
                      <th style={{ padding: "10px 14px", textAlign: "right", width: 110 }}>Rate (₹)</th>
                      <th style={{ padding: "10px 14px", textAlign: "right", width: 140 }}>Total Sale Amount (₹)</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", width: 130 }}>Current Shop Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemSales.itemsList.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 14px", textAlign: "center", color: "var(--text-gray)", fontWeight: 700 }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 18 }}>{item.emoji}</span>
                            <div>
                              <div style={{ fontWeight: 800, color: "var(--text-dark)" }}>{item.name}</div>
                              <div style={{ fontSize: 11, color: "var(--text-gray)" }}>{item.category}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <span style={{ background: "#ecfdf5", color: "#065f46", padding: "4px 10px", borderRadius: 20, fontWeight: 800, fontSize: 12 }}>
                            {item.unitsSold} units
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--text-gray)" }}>
                          {money(item.price)}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 900, color: "var(--brand)", fontSize: 14 }}>
                          {money(item.totalSales)}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          {item.currentStock === null ? (
                            <span style={{ color: "var(--text-gray)", fontSize: 11 }}>-</span>
                          ) : item.currentStock === 0 ? (
                            <span style={{ background: "#fee2e2", color: "#dc2626", padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 800 }}>
                              🚨 Stock Over (0)
                            </span>
                          ) : item.currentStock <= 5 ? (
                            <span style={{ background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 800 }}>
                              ⚠️ Low ({item.currentStock})
                            </span>
                          ) : (
                            <span style={{ background: "#f0fdf4", color: "#166534", padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                              {item.currentStock} in stock
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Handwritten Parchi Orders Row */}
                    {itemSales.parchiCount > 0 && (
                      <tr style={{ background: "#fffbeb", borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700 }}>•</td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 18 }}>📝</span>
                            <div>
                              <div style={{ fontWeight: 800, color: "#92400e" }}>Handwritten Grocery Slip Orders (Parchi)</div>
                              <div style={{ fontSize: 11, color: "#b45309" }}>Combined manual list orders</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <span style={{ background: "#fef3c7", color: "#b45309", padding: "4px 10px", borderRadius: 20, fontWeight: 800, fontSize: 12 }}>
                            {itemSales.parchiCount} slips
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--text-gray)" }}>-</td>
                        <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 900, color: "#92400e", fontSize: 14 }}>
                          {money(itemSales.parchiRevenue)}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", color: "var(--text-gray)" }}>-</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "#f8fafc", fontWeight: 900, borderTop: "2px solid var(--text-dark)", fontSize: 14 }}>
                      <td colSpan={2} style={{ padding: "14px", color: "var(--text-dark)" }}>
                        Total Sold in Period:
                      </td>
                      <td style={{ padding: "14px", textAlign: "center", color: "var(--brand)" }}>
                        {itemSales.totalUnits} Units
                      </td>
                      <td></td>
                      <td style={{ padding: "14px", textAlign: "right", color: "var(--brand)", fontSize: 16 }}>
                        {money(financials.grossSales)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KYA STOCK OVER / LOW HUA */}
        {activeReportTab === "stock" && (
          <div className="mm-card" style={{ background: "white", padding: 24, borderRadius: 14, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text-dark)" }}>
                  Inventory Health & Stock Depletion Report
                </h3>
                <span style={{ fontSize: 12, color: "var(--text-gray)" }}>
                  Kaunsa samaan khatam ho chuka hai (Stock Over), kaunsa khatam hone wala hai, aur total stock valuation.
                </span>
              </div>

              {/* Stock Filter Pills */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setStockFilter("ALL")}
                  style={{
                    padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: stockFilter === "ALL" ? "var(--brand)" : "#f1f5f9",
                    color: stockFilter === "ALL" ? "white" : "var(--text-dark)",
                    border: "none", cursor: "pointer"
                  }}
                >
                  All ({stockReports.totalProductsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilter("OVER")}
                  style={{
                    padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: stockFilter === "OVER" ? "#dc2626" : "#fee2e2",
                    color: stockFilter === "OVER" ? "white" : "#dc2626",
                    border: "none", cursor: "pointer"
                  }}
                >
                  🚨 Stock Over ({stockReports.outOfStock.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilter("LOW")}
                  style={{
                    padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: stockFilter === "LOW" ? "#d97706" : "#fef3c7",
                    color: stockFilter === "LOW" ? "white" : "#b45309",
                    border: "none", cursor: "pointer"
                  }}
                >
                  ⚠️ Low Stock ({stockReports.lowStock.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilter("OK")}
                  style={{
                    padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                    background: stockFilter === "OK" ? "#16a34a" : "#f0fdf4",
                    color: stockFilter === "OK" ? "white" : "#166534",
                    border: "none", cursor: "pointer"
                  }}
                >
                  🟢 In Stock ({stockReports.healthyStock.length})
                </button>
              </div>
            </div>

            {/* Inventory Valuation Header Strip */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20, background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-gray)", textTransform: "uppercase", fontWeight: 700 }}>Total Store Inventory</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text-dark)", marginTop: 2 }}>{stockReports.totalStockUnits} Units</div>
                <div style={{ fontSize: 11, color: "var(--text-gray)" }}>Across {stockReports.totalProductsCount} store items</div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "var(--text-gray)", textTransform: "uppercase", fontWeight: 700 }}>Total Inventory Valuation</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "var(--brand)", marginTop: 2 }}>{money(stockReports.totalStockValuation)}</div>
                <div style={{ fontSize: 11, color: "var(--text-gray)" }}>Retail value of all items in stock</div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "var(--text-gray)", textTransform: "uppercase", fontWeight: 700 }}>Reorder Priority</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: stockReports.outOfStock.length > 0 ? "#dc2626" : "#16a34a", marginTop: 2 }}>
                  {stockReports.outOfStock.length + stockReports.lowStock.length} Items
                </div>
                <div style={{ fontSize: 11, color: "var(--text-gray)" }}>Need immediate restocking</div>
              </div>
            </div>

            {/* Stock List Table */}
            {stockReports.displayList.length === 0 ? (
              <div style={{ padding: 36, textAlign: "center", color: "var(--text-gray)" }}>
                <CheckCircle size={36} color="#16a34a" style={{ margin: "0 auto 10px" }} />
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>No products found in this stock filter.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid var(--border)", color: "var(--text-gray)", textAlign: "left" }}>
                      <th style={{ padding: "10px 14px", width: 40, textAlign: "center" }}>#</th>
                      <th style={{ padding: "10px 14px" }}>Product Name & Category</th>
                      <th style={{ padding: "10px 14px", textAlign: "right", width: 110 }}>Rate (₹)</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", width: 140 }}>Units In Stock</th>
                      <th style={{ padding: "10px 14px", textAlign: "right", width: 140 }}>Stock Valuation</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", width: 150 }}>Stock Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockReports.displayList.map((p, idx) => {
                      const st = Number(p.stock) || 0;
                      const val = st * (Number(p.price) || 0);
                      const isOver = st === 0;
                      const isLow = st > 0 && st <= 5;

                      return (
                        <tr key={p.id || idx} style={{ borderBottom: "1px solid var(--border)", background: isOver ? "#fff5f5" : "transparent" }}>
                          <td style={{ padding: "12px 14px", textAlign: "center", color: "var(--text-gray)", fontWeight: 700 }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 18 }}>{p.emoji || "📦"}</span>
                              <div>
                                <div style={{ fontWeight: 800, color: "var(--text-dark)" }}>{p.name}</div>
                                <div style={{ fontSize: 11, color: "var(--text-gray)" }}>{p.category || "General"} • {p.unit || "unit"}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--text-gray)" }}>
                            {money(p.price)}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <strong style={{ fontSize: 14, color: isOver ? "#dc2626" : isLow ? "#d97706" : "var(--text-dark)" }}>
                              {st} {p.unit || "units"}
                            </strong>
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "var(--text-dark)" }}>
                            {money(val)}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            {isOver ? (
                              <span style={{ background: "#fee2e2", color: "#dc2626", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800, border: "1px solid #fca5a5" }}>
                                🚨 STOCK OVER (0)
                              </span>
                            ) : isLow ? (
                              <span style={{ background: "#fef3c7", color: "#b45309", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800, border: "1px solid #fde68a" }}>
                                ⚠️ LOW ({st} Left)
                              </span>
                            ) : (
                              <span style={{ background: "#f0fdf4", color: "#166534", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: "1px solid #bbf7d0" }}>
                                🟢 Available ({st})
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: KYA PROFIT / LOSE HUA (DETAILED LEDGER) */}
        {activeReportTab === "pnl" && (
          <div className="mm-card" style={{ background: "white", padding: 24, borderRadius: 14, border: "1px solid var(--border)" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: 18, fontWeight: 800, color: "var(--text-dark)" }}>
              Detailed Profit & Loss Statement (Is Date Range Ka Munafa / Ghata)
            </h3>
            <p style={{ margin: "0 0 20px 0", fontSize: 12, color: "var(--text-gray)" }}>
              Total revenue from sales compared against store operational expenses in {dateBounds.label}.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {/* Sales Column */}
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#166534" }}>🟢 INFLOW: Gross Sales Revenue</h4>
                  <strong style={{ fontSize: 18, color: "#15803d" }}>+{money(financials.grossSales)}</strong>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>💵 Cash Collected at Counter:</span>
                    <strong>{money(financials.cashTotal)} ({financials.cashCount} bills)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>📱 UPI QR Direct Payments:</span>
                    <strong>{money(financials.upiTotal)} ({financials.upiCount} bills)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>📒 Store Credit (Khata Sales):</span>
                    <strong>{money(financials.khataTotal)} ({financials.khataCount} bills)</strong>
                  </div>
                  <div style={{ borderTop: "1px dashed #86efac", paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span>Total Orders Completed:</span>
                    <span>{financials.completedOrdersCount} orders</span>
                  </div>
                </div>
              </div>

              {/* Expenses Column */}
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#991b1b" }}>🔴 OUTFLOW: Operating Expenses</h4>
                  <strong style={{ fontSize: 18, color: "#dc2626" }}>-{money(financials.totalExpenses)}</strong>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Total Expense Entries:</span>
                    <strong>{periodExpenses.length} vouchers</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Average Expense per Entry:</span>
                    <strong>{periodExpenses.length > 0 ? money(Math.round(financials.totalExpenses / periodExpenses.length)) : "₹0"}</strong>
                  </div>
                  <div style={{ borderTop: "1px dashed #fca5a5", paddingTop: 8, fontSize: 12, color: "#7f1d1d" }}>
                    Includes shop rent, electricity bills, staff payouts, transport & supplies.
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Net Result Box */}
            <div style={{ 
              background: financials.isProfit ? "#f0fdf4" : "#fef2f2",
              border: financials.isProfit ? "2px solid #86efac" : "2px solid #fca5a5",
              borderRadius: 14, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: financials.isProfit ? "#166534" : "#991b1b", textTransform: "uppercase" }}>
                  Net Profit / Loss for Period ({dateBounds.label})
                </div>
                <div style={{ fontSize: 13, color: financials.isProfit ? "#15803d" : "#dc2626", marginTop: 4 }}>
                  Calculation: Gross Revenue ({money(financials.grossSales)}) - Store Expenses ({money(financials.totalExpenses)})
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: financials.isProfit ? "#15803d" : "#dc2626" }}>
                  {financials.isProfit ? `+${money(financials.netProfit)}` : money(financials.netProfit)}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: financials.isProfit ? "#166534" : "#991b1b" }}>
                  {financials.isProfit ? "🟢 NET PROFIT (MUNAFA)" : "🔴 NET LOSS (GHATA)"} • {financials.marginPercent}% Margin
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

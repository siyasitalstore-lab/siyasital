import React, { useState, useMemo } from "react";
import { 
  LayoutGrid, Package, Users, BarChart3, Plus, Pencil, Trash2, 
  IndianRupee, Clock, ShoppingCart, Image as ImageIcon, User, Search, X, 
  Receipt, TrendingUp, TrendingDown, Wallet, CreditCard, PieChart, 
  ArrowUpRight, CheckCircle, AlertTriangle, Layers, Calendar, Filter, BookOpen, FileText,
  ShieldCheck, Key, Lock, Eye, EyeOff, UserCheck, UserX
} from "lucide-react";
import { LOW_STOCK, money, orderTotal, CATEGORIES, EXPENSE_CATEGORIES } from "../../data/store";
import DashboardLayout from "../../components/DashboardLayout";
import DailyBillsView from "../../components/DailyBillsView";
import CustomerKhataView from "../../components/CustomerKhataView";

export default function AdminView({ 
  theme, toggleTheme,
  customers = [], updateCustomers, products = [], updateProducts, 
  staff = [], updateStaff, orders = [], updateOrders,
  banners = [], updateBanners, 
  expenses = [], updateExpenses,
  adminAuth = {}, updateAdminAuth,
  user, onLogout 
}) {
  const [tab, setTab] = useState("stats");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [expenseSearchQuery, setExpenseSearchQuery] = useState("");
  const [selectedExpenseCat, setSelectedExpenseCat] = useState("ALL");
  
  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [showAdminCredModal, setShowAdminCredModal] = useState(false);
  const [showStaffPasswords, setShowStaffPasswords] = useState({});
  const [staffError, setStaffError] = useState("");

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Manager",
    active: true
  });

  const [adminCredForm, setAdminCredForm] = useState({
    email: adminAuth?.email || "",
    password: adminAuth?.password || "",
    name: adminAuth?.name || "Master Admin"
  });
  const [adminCredMsg, setAdminCredMsg] = useState("");

  // Deep Analytics Calculations
  const completedOrders = useMemo(() => orders.filter(o => o.status === 'Completed'), [orders]);
  
  const totalRevenue = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + (o.total || orderTotal(o)), 0);
  }, [completedOrders]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
  
  const activeOrders = useMemo(() => orders.filter(o => o.status === 'New' || o.status === 'Preparing' || o.status === 'Ready').length, [orders]);
  const lowStockCount = useMemo(() => products.filter(p => p.stock <= LOW_STOCK).length, [products]);
  const averageOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;

  // Payment Breakdown
  const paymentAnalytics = useMemo(() => {
    let upiTotal = 0, upiCount = 0;
    let cashTotal = 0, cashCount = 0;
    let khataTotal = 0, khataCount = 0;

    completedOrders.forEach(o => {
      const amt = o.total || orderTotal(o);
      if (o.payment === 'upi') {
        upiTotal += amt;
        upiCount++;
      } else if (o.payment === 'cod' || o.payment === 'cash') {
        cashTotal += amt;
        cashCount++;
      } else if (o.payment === 'khata') {
        khataTotal += amt;
        khataCount++;
      } else {
        upiTotal += amt;
        upiCount++;
      }
    });

    return {
      upi: { total: upiTotal, count: upiCount, percent: totalRevenue > 0 ? Math.round((upiTotal / totalRevenue) * 100) : 0 },
      cash: { total: cashTotal, count: cashCount, percent: totalRevenue > 0 ? Math.round((cashTotal / totalRevenue) * 100) : 0 },
      khata: { total: khataTotal, count: khataCount, percent: totalRevenue > 0 ? Math.round((khataTotal / totalRevenue) * 100) : 0 },
    };
  }, [completedOrders, totalRevenue]);

  // Category-wise Revenue Breakdown
  const categoryAnalytics = useMemo(() => {
    const map = {};
    completedOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const prod = products.find(p => p.id === (item.productId || item.id));
        const cat = prod?.category || "Other";
        const amt = (item.price || 0) * (item.qty || 1);
        map[cat] = (map[cat] || 0) + amt;
      });
    });

    const arr = Object.entries(map).map(([name, revenue]) => ({
      name,
      revenue,
      percent: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0
    })).sort((a, b) => b.revenue - a.revenue);

    return arr;
  }, [completedOrders, products, totalRevenue]);

  // Top Selling Products Leaderboard
  const topProducts = useMemo(() => {
    const map = {};
    completedOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const key = item.baseName || item.name;
        if (!map[key]) {
          map[key] = { name: key, emoji: item.emoji || "📦", unitsSold: 0, revenue: 0 };
        }
        map[key].unitsSold += (item.qty || 1);
        map[key].revenue += (item.price || 0) * (item.qty || 1);
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [completedOrders]);

  // Order Fulfillment Stats
  const parchiOrderCount = useMemo(() => orders.filter(o => o.isParchi).length, [orders]);
  const regularOrderCount = orders.length - parchiOrderCount;

  // Product Form State
  const [productForm, setProductForm] = useState({ 
    name: '', category: '', price: '', stock: '', unit: '', emoji: '📦', image: '',
    hasVariants: false, variants: []
  });
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'Utilities (Bijli/Pani)',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    notes: ''
  });

  const allCategories = useMemo(() => {
    const cats = new Set(CATEGORIES);
    products.forEach(p => cats.add(p.category));
    return Array.from(cats);
  }, [products]);

  const openProductModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      const isVar = Boolean(product.hasVariants && product.variants && product.variants.length > 0);
      setProductForm({
        ...product,
        hasVariants: isVar,
        variants: isVar ? product.variants.map(v => ({ ...v, price: String(v.price), stock: String(v.stock) })) : [
          { id: `v1`, name: 'Small', unit: '10g pack', price: '5', stock: '50' }
        ]
      });
      setIsCustomCategory(!CATEGORIES.includes(product.category) && !allCategories.includes(product.category));
    } else {
      setProductForm({ 
        name: '', category: '', price: '', stock: '', unit: '', emoji: '📦', image: '',
        hasVariants: false, 
        variants: [
          { id: `v1`, name: 'Small', unit: '10g pack', price: '5', stock: '50' },
          { id: `v2`, name: 'Regular', unit: '20g pack', price: '10', stock: '40' }
        ]
      });
      setIsCustomCategory(false);
    }
    setShowProductModal(true);
  };

  const addVariantRow = () => {
    setProductForm(prev => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        { id: `v_${Date.now()}`, name: '', unit: '', price: '', stock: '' }
      ]
    }));
  };

  const updateVariantRow = (index, field, value) => {
    setProductForm(prev => {
      const next = [...(prev.variants || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, variants: next };
    });
  };

  const removeVariantRow = (index) => {
    setProductForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const saveProduct = (e) => {
    e.preventDefault();
    let newProduct = { ...productForm };

    if (productForm.hasVariants && productForm.variants && productForm.variants.length > 0) {
      const cleanedVariants = productForm.variants
        .filter(v => (v.name || v.unit) && (v.price !== '' || v.stock !== ''))
        .map(v => ({
          id: v.id || `v_${Date.now()}_${Math.random()}`,
          name: v.name || v.unit || 'Standard',
          unit: v.unit || v.name || '',
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
        }));

      if (cleanedVariants.length === 0) {
        alert("Please enter at least one valid variant with size and price!");
        return;
      }

      const minPrice = Math.min(...cleanedVariants.map(v => v.price));
      const totalStock = cleanedVariants.reduce((s, v) => s + v.stock, 0);

      newProduct = {
        ...newProduct,
        price: minPrice,
        stock: totalStock,
        unit: `${cleanedVariants.length} Sizes available`,
        hasVariants: true,
        variants: cleanedVariants
      };
    } else {
      newProduct = {
        ...newProduct,
        price: Number(productForm.price) || 0,
        stock: Number(productForm.stock) || 0,
        hasVariants: false,
        variants: []
      };
    }

    if (editingProduct) {
      updateProducts(products.map(p => p.id === editingProduct.id ? { ...newProduct, id: p.id } : p));
    } else {
      updateProducts([{ ...newProduct, id: `p_${Date.now()}` }, ...products]);
    }
    setShowProductModal(false);
  };

  // Expense Management
  const openAddExpenseModal = () => {
    setExpenseForm({
      title: '',
      category: 'Utilities (Electricity/Water)',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI',
      notes: ''
    });
    setShowExpenseModal(true);
  };

  const saveExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.title.trim() || !expenseForm.amount) return;

    const newExp = {
      id: `exp_${Date.now()}`,
      title: expenseForm.title.trim(),
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      date: expenseForm.date || new Date().toLocaleDateString('en-IN'),
      paymentMethod: expenseForm.paymentMethod,
      notes: expenseForm.notes.trim()
    };

    updateExpenses([newExp, ...expenses]);
    setShowExpenseModal(false);
  };

  const deleteExpense = (id) => {
    if (window.confirm("Are you sure you want to delete this expense entry?")) {
      updateExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchQuery = !expenseSearchQuery || 
        e.title.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(expenseSearchQuery.toLowerCase()));
      const matchCat = selectedExpenseCat === "ALL" || e.category === selectedExpenseCat;
      return matchQuery && matchCat;
    });
  }, [expenses, expenseSearchQuery, selectedExpenseCat]);

  // Banner Form State
  const [bannerForm, setBannerForm] = useState({ title: '', image: '', link: '' });

  const openBannerModal = (banner = null) => {
    setEditingBanner(banner);
    if (banner) setBannerForm(banner);
    else setBannerForm({ title: '', image: '', link: '' });
    setShowBannerModal(true);
  };

  const saveBanner = (e) => {
    e.preventDefault();
    if (editingBanner) {
      updateBanners(banners.map(b => b.id === editingBanner.id ? { ...bannerForm, id: b.id } : b));
    } else {
      updateBanners([...banners, { ...bannerForm, id: `b_${Date.now()}` }]);
    }
    setShowBannerModal(false);
  };

  const deleteBanner = (id) => updateBanners(banners.filter(b => b.id !== id));
  const deleteProduct = (id) => updateProducts(products.filter(p => p.id !== id));

  // Staff & Manager Management
  const openStaffModal = (member = null) => {
    setEditingStaff(member);
    setStaffError("");
    if (member) {
      setStaffForm({
        name: member.name || "",
        email: member.email || "",
        phone: member.phone || "",
        password: member.password || "",
        role: member.role || "Manager",
        active: member.active !== false
      });
    } else {
      setStaffForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "Manager",
        active: true
      });
    }
    setShowStaffModal(true);
  };

  const saveStaffMember = (e) => {
    e.preventDefault();
    setStaffError("");
    const cleanEmail = staffForm.email.trim().toLowerCase();
    const cleanPass = staffForm.password.trim();

    if (!staffForm.name.trim() || !cleanEmail || !cleanPass) {
      setStaffError("Name, Email and Password are required.");
      return;
    }

    if (cleanPass.length < 6) {
      setStaffError("Password must be at least 6 characters.");
      return;
    }

    // Check duplicate email
    const duplicate = staff.find(s => (s.email || "").toLowerCase() === cleanEmail && s.id !== editingStaff?.id);
    if (duplicate || cleanEmail === (adminAuth?.email || "admin@siyasitalstore.com").toLowerCase()) {
      setStaffError("A manager or admin account with this email already exists.");
      return;
    }

    if (editingStaff) {
      const nextStaff = staff.map(s => s.id === editingStaff.id ? {
        ...s,
        name: staffForm.name.trim(),
        email: cleanEmail,
        phone: staffForm.phone.trim(),
        password: cleanPass,
        role: staffForm.role,
        active: staffForm.active
      } : s);
      updateStaff(nextStaff);
    } else {
      const newMember = {
        id: `m_${Date.now()}`,
        name: staffForm.name.trim(),
        email: cleanEmail,
        phone: staffForm.phone.trim(),
        password: cleanPass,
        role: staffForm.role,
        active: staffForm.active,
        createdAt: new Date().toLocaleDateString("en-IN")
      };
      updateStaff([...staff, newMember]);
    }
    setShowStaffModal(false);
  };

  const deleteStaffMember = (id) => {
    if (window.confirm("Are you sure you want to remove this manager account? They will no longer be able to log in.")) {
      updateStaff(staff.filter(s => s.id !== id));
    }
  };

  const toggleStaffActive = (member) => {
    const nextStaff = staff.map(s => s.id === member.id ? { ...s, active: !s.active } : s);
    updateStaff(nextStaff);
  };

  const saveAdminCredentials = (e) => {
    e.preventDefault();
    if (!adminCredForm.email.trim() || !adminCredForm.password.trim()) {
      setAdminCredMsg("Email and password cannot be empty.");
      return;
    }
    if (adminCredForm.password.trim().length < 6) {
      setAdminCredMsg("Password must be at least 6 characters.");
      return;
    }
    if (updateAdminAuth) {
      updateAdminAuth({
        email: adminCredForm.email.trim().toLowerCase(),
        password: adminCredForm.password.trim(),
        name: adminCredForm.name.trim() || "Master Admin"
      });
      setAdminCredMsg("Admin credentials updated successfully!");
      setTimeout(() => {
        setShowAdminCredModal(false);
        setAdminCredMsg("");
      }, 1500);
    }
  };

  const sidebarItems = [
    { id: 'stats', label: 'Sales & Analytics', icon: <BarChart3 size={18} /> },
    { id: 'daily-bills', label: 'Daily Bills & Invoices', icon: <Receipt size={18} /> },
    { id: 'customers', label: 'Customer Credit Ledger', icon: <BookOpen size={18} /> },
    { id: 'expenses', label: 'Store Expenses', icon: <FileText size={18} /> },
    { id: 'products', label: 'Inventory Management', icon: <Package size={18} /> },
    { id: 'banners', label: 'Store Banners', icon: <ImageIcon size={18} /> },
    { id: 'staff', label: 'Staff & Team', icon: <Users size={18} /> },
  ];

  return (
    <DashboardLayout theme={theme} toggleTheme={toggleTheme} user={user} onLogout={onLogout} title="Admin Portal" sidebarItems={sidebarItems} activeTab={tab} onTabChange={setTab}>
      <div className="dashboard-content-pad" style={{ maxWidth: 1240, margin: '0 auto' }}>
      
      {/* 1. SALES & ANALYTICS TAB */}
      {tab === "stats" && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ fontSize: 28, margin: '0 0 6px 0', color: 'var(--text-dark)', fontWeight: 800 }}>Store Financials & Analytics</h2>
              <span style={{ fontSize: 14, color: 'var(--text-gray)' }}>Complete sales report, revenue, expenses and net profit overview</span>
            </div>
            <button 
              type="button" 
              onClick={() => setTab("expenses")}
              style={{ background: '#f8fafc', border: '1px solid var(--border)', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-dark)' }}
            >
              <Receipt size={16} color="var(--primary)" /> Record Store Expense
            </button>
          </div>

          {/* Key 4 Hero Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
            
            {/* 1. Gross Revenue */}
            <div className="mm-card" style={{ padding: 24, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
              <div style={{ color: "rgba(255,255,255,0.85)", marginBottom: 10, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><IndianRupee size={18}/> Gross Sales Revenue</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 99, fontSize: 11 }}>{completedOrders.length} Paid</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>{money(totalRevenue)}</div>
              <div style={{ fontSize: 12, marginTop: 8, opacity: 0.9 }}>Avg Order Value: <strong>{money(averageOrderValue)}</strong></div>
            </div>

            {/* 2. Total Expenses */}
            <div className="mm-card" style={{ padding: 24, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none' }}>
              <div style={{ color: "rgba(255,255,255,0.85)", marginBottom: 10, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Receipt size={18}/> Total Store Expenses</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 99, fontSize: 11 }}>{expenses.length} Records</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>{money(totalExpenses)}</div>
              <div style={{ fontSize: 12, marginTop: 8, opacity: 0.9 }}>Rent, Bills, Staff & Supplies</div>
            </div>

            {/* 3. Net Profit */}
            <div className="mm-card" style={{ padding: 24, background: netProfit >= 0 ? '#f0fdf4' : '#fef2f2', border: `2px solid ${netProfit >= 0 ? '#86efac' : '#fca5a5'}` }}>
              <div style={{ color: netProfit >= 0 ? '#15803d' : '#b91c1c', marginBottom: 10, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {netProfit >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />} 
                  Net Profit (After Expenses)
                </span>
                <span style={{ background: netProfit >= 0 ? '#dcfce7' : '#fee2e2', color: netProfit >= 0 ? '#166534' : '#991b1b', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 800 }}>
                  {profitMargin}% Margin
                </span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: netProfit >= 0 ? '#15803d' : '#b91c1c' }}>
                {money(netProfit)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-gray)', marginTop: 8 }}>
                Gross Revenue minus Store Expenses
              </div>
            </div>

            {/* 4. Total Orders & Fulfillment */}
            <div className="mm-card" style={{ padding: 24 }}>
              <div style={{ color: "var(--text-gray)", marginBottom: 10, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><ShoppingCart size={18} color="#4f46e5"/> All Orders</span>
                <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                  {activeOrders} Active Now
                </span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-dark)' }}>{orders.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-gray)', marginTop: 8 }}>
                Online Catalog: <strong>{regularOrderCount}</strong> • Grocery Slips: <strong>{parchiOrderCount}</strong>
              </div>
            </div>

          </div>

          {/* Middle Row: Payment Mode Breakdown & Category Performance */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 24 }}>
            
            {/* Payment Mode Analytics */}
            <div className="mm-block" style={{ padding: 24, margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Wallet size={18} color="var(--primary)" /> Payment Method Split
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-gray)', fontWeight: 600 }}>Completed Orders</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* UPI */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                    <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                      📱 Direct UPI (GPay/PhonePe)
                    </span>
                    <span>{money(paymentAnalytics.upi.total)} ({paymentAnalytics.upi.percent}%) • {paymentAnalytics.upi.count} orders</span>
                  </div>
                  <div style={{ width: '100%', height: 10, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${paymentAnalytics.upi.percent}%`, height: '100%', background: '#10b981', borderRadius: 99 }}></div>
                  </div>
                </div>

                {/* Cash */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                    <span style={{ color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 6 }}>
                      💵 Cash at Counter (Store Pay)
                    </span>
                    <span>{money(paymentAnalytics.cash.total)} ({paymentAnalytics.cash.percent}%) • {paymentAnalytics.cash.count} orders</span>
                  </div>
                  <div style={{ width: '100%', height: 10, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${paymentAnalytics.cash.percent}%`, height: '100%', background: '#4f46e5', borderRadius: 99 }}></div>
                  </div>
                </div>

                {/* Store Credit */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                    <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: 6 }}>
                      📒 Store Credit Ledger (Due)
                    </span>
                    <span>{money(paymentAnalytics.khata.total)} ({paymentAnalytics.khata.percent}%) • {paymentAnalytics.khata.count} orders</span>
                  </div>
                  <div style={{ width: '100%', height: 10, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${paymentAnalytics.khata.percent}%`, height: '100%', background: '#f59e0b', borderRadius: 99 }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Performance */}
            <div className="mm-block" style={{ padding: 24, margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PieChart size={18} color="#8b5cf6" /> Category Sales Revenue
                </h3>
                <span style={{ fontSize: 12, color: 'var(--text-gray)', fontWeight: 600 }}>By Contribution</span>
              </div>

              {categoryAnalytics.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-gray)' }}>No sales recorded in categories yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {categoryAnalytics.slice(0, 4).map((cat, idx) => {
                    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
                    const color = colors[idx % colors.length];
                    return (
                      <div key={cat.name}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                          <span>{cat.name}</span>
                          <span style={{ color: 'var(--text-dark)' }}>{money(cat.revenue)} ({cat.percent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ width: `${cat.percent}%`, height: '100%', background: color, borderRadius: 99 }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Bottom Row: Top Selling Products Leaderboard & Inventory Alert */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            
            {/* Top Selling Products */}
            <div className="mm-block" style={{ padding: 0, overflow: 'hidden', margin: 0 }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>🏆 Top Selling Products (Leaderboard)</h3>
                <span style={{ fontSize: 12, color: 'var(--text-gray)', fontWeight: 600 }}>By Revenue Generated</span>
              </div>
              
              {topProducts.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-gray)' }}>Orders will populate top products automatically.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'white', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-gray)' }}>
                        <th style={{ padding: '12px 20px', fontWeight: 700 }}>Rank & Item</th>
                        <th style={{ padding: '12px 20px', fontWeight: 700, textAlign: 'center' }}>Units Sold</th>
                        <th style={{ padding: '12px 20px', fontWeight: 700, textAlign: 'right' }}>Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ width: 24, height: 24, borderRadius: '50%', background: idx === 0 ? '#fef3c7' : '#f1f5f9', color: idx === 0 ? '#b45309' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                              {idx + 1}
                            </span>
                            <span style={{ fontSize: 20 }}>{p.emoji}</span>
                            <strong style={{ fontSize: 14, color: 'var(--text-dark)' }}>{p.name}</strong>
                          </td>
                          <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700, fontSize: 14 }}>
                            {p.unitsSold}
                          </td>
                          <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 800, fontSize: 14, color: 'var(--primary)' }}>
                            {money(p.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Inventory Alerts Card */}
            <div className="mm-block" style={{ padding: 24, margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={18} color={lowStockCount > 0 ? "#ef4444" : "#10b981"} /> Stock & Store Health
                </h3>

                <div style={{ background: lowStockCount > 0 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${lowStockCount > 0 ? '#fecaca' : '#bbf7d0'}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <strong style={{ fontSize: 15, color: lowStockCount > 0 ? '#991b1b' : '#14532d', display: 'block', marginBottom: 4 }}>
                    {lowStockCount > 0 ? `${lowStockCount} Products Low on Stock!` : "All Stock Levels Healthy"}
                  </strong>
                  <span style={{ fontSize: 13, color: lowStockCount > 0 ? '#b91c1c' : '#166534' }}>
                    {lowStockCount > 0 ? "These items have fewer than 10 units left. Reorder from supplier soon." : "All items have sufficient stock."}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--text-gray)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Active Catalog Items:</span>
                    <strong style={{ color: 'var(--text-dark)' }}>{products.length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Store Staff Registered:</span>
                    <strong style={{ color: 'var(--text-dark)' }}>{staff.length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Store Pickup Window:</span>
                    <strong style={{ color: '#10b981' }}>10–15 Mins</strong>
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setTab("products")}
                className="mm-btn-primary" 
                style={{ width: '100%', marginTop: 20, padding: 12, fontSize: 13, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
              >
                <span>Manage Inventory & Stocks</span>
                <ArrowUpRight size={16} />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* 2. EXPENSES TAB */}
      {tab === "expenses" && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 28, margin: '0 0 6px 0', color: 'var(--text-dark)', fontWeight: 800 }}>Store Operating Expenses</h2>
              <span style={{ fontSize: 14, color: 'var(--text-gray)' }}>Track all daily and monthly operational costs to monitor real-time Net Profit</span>
            </div>

            <button 
              type="button"
              className="mm-btn-primary" 
              style={{ padding: "12px 20px", display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}
              onClick={openAddExpenseModal}
            >
              <Plus size={18} /> + Record New Expense
            </button>
          </div>

          {/* Expense Stat Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 28 }}>
            
            <div className="mm-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text-gray)', fontWeight: 600, marginBottom: 8 }}>Total Expenses Recorded</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#ef4444' }}>{money(totalExpenses)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-gray)', marginTop: 4 }}>Across {expenses.length} entries</div>
            </div>

            <div className="mm-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text-gray)', fontWeight: 600, marginBottom: 8 }}>Store Sales Revenue</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>{money(totalRevenue)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-gray)', marginTop: 4 }}>Completed customer orders</div>
            </div>

            <div className="mm-card" style={{ padding: 20, background: netProfit >= 0 ? '#f0fdf4' : '#fef2f2', border: `1px solid ${netProfit >= 0 ? '#bbf7d0' : '#fecaca'}` }}>
              <div style={{ fontSize: 13, color: netProfit >= 0 ? '#15803d' : '#991b1b', fontWeight: 700, marginBottom: 8 }}>Net Profit</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: netProfit >= 0 ? '#15803d' : '#991b1b' }}>{money(netProfit)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-gray)', marginTop: 4 }}>Revenue minus Expenses</div>
            </div>

          </div>

          {/* Filter Bar */}
          <div className="mm-block" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
              <input 
                type="text" 
                placeholder="Search expense by title, category, or notes..." 
                className="mm-input"
                style={{ paddingLeft: 42, background: 'white' }}
                value={expenseSearchQuery}
                onChange={e => setExpenseSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={16} color="var(--text-gray)" />
              <select 
                className="mm-input" 
                style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, minWidth: 160 }}
                value={selectedExpenseCat}
                onChange={e => setSelectedExpenseCat(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="mm-block" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "2px solid var(--border)", color: "var(--text-gray)", fontSize: 13 }}>
                    <th style={{ padding: "16px 24px", fontWeight: 700 }}>Date</th>
                    <th style={{ padding: "16px 24px", fontWeight: 700 }}>Expense Title</th>
                    <th style={{ padding: "16px 24px", fontWeight: 700 }}>Category</th>
                    <th style={{ padding: "16px 24px", fontWeight: 700 }}>Payment Mode</th>
                    <th style={{ padding: "16px 24px", fontWeight: 700 }}>Amount</th>
                    <th style={{ padding: "16px 24px", fontWeight: 700 }}>Notes</th>
                    <th style={{ padding: "16px 24px", fontWeight: 700, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map(e => (
                    <tr key={e.id} style={{ borderBottom: "1px solid var(--border)", background: 'white' }}>
                      <td style={{ padding: "16px 24px", fontSize: 13, color: 'var(--text-gray)', fontWeight: 600 }}>
                        {e.date}
                      </td>
                      <td style={{ padding: "16px 24px", fontWeight: 700, color: 'var(--text-dark)', fontSize: 15 }}>
                        {e.title}
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{ 
                          background: '#f1f5f9', color: '#334155', padding: '4px 10px', 
                          borderRadius: 6, fontSize: 12, fontWeight: 700 
                        }}>
                          {e.category}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: 13, color: 'var(--text-dark)', fontWeight: 600 }}>
                        {e.paymentMethod}
                      </td>
                      <td style={{ padding: "16px 24px", fontWeight: 800, color: '#ef4444', fontSize: 15 }}>
                        -{money(e.amount)}
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: 13, color: 'var(--text-gray)', maxWidth: 200 }}>
                        {e.notes || "-"}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: 'right' }}>
                        <button 
                          className="mm-iconbtn" 
                          onClick={() => deleteExpense(e.id)} 
                          style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
                          title="Delete Expense Entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: 60, textAlign: 'center', color: 'var(--text-gray)' }}>
                        No expense records found. Click "+ Record New Expense" to add store expenditures!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 3. BANNERS TAB */}
      {tab === "banners" && (
        <div className="mm-block" style={{ padding: 0, overflow: "hidden", animation: 'fadeIn 0.3s ease' }}>
          <div style={{ padding: 30, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>Homepage Banners</h3>
            <button className="mm-btn-primary" style={{ padding: "10px 20px" }} onClick={() => openBannerModal()}><Plus size={18}/> Add Banner</button>
          </div>
          <div style={{ padding: 20 }}>
            {banners.map(b => (
              <div key={b.id} style={{ display: 'flex', gap: 20, padding: 20, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 20, alignItems: 'center' }}>
                <img src={b.image} alt={b.title} style={{ width: 160, height: 90, objectFit: 'cover', borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 18 }}>{b.title}</h4>
                  <p style={{ margin: 0, color: 'var(--text-gray)' }}>Links to: <strong>{b.link}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="mm-iconbtn" onClick={() => openBannerModal(b)} style={{ background: '#f1f5f9' }}><Pencil size={18} /></button>
                  <button className="mm-iconbtn" onClick={() => deleteBanner(b.id)} style={{ background: '#fef2f2', color: '#ef4444' }}><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PRODUCTS / INVENTORY TAB */}
      {tab === "products" && (
        <div className="mm-block" style={{ padding: 0, overflow: "hidden", animation: 'fadeIn 0.3s ease' }}>
          <div style={{ padding: 30, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>Inventory Management</h3>
            <button className="mm-btn-primary" style={{ padding: "10px 20px" }} onClick={() => openProductModal()}><Plus size={18}/> Add Product</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "white", borderBottom: "2px solid var(--border)", color: "var(--text-gray)", fontSize: 14 }}>
                  <th style={{ padding: "16px 30px", fontWeight: 600 }}>Product</th>
                  <th style={{ padding: "16px 30px", fontWeight: 600 }}>Category</th>
                  <th style={{ padding: "16px 30px", fontWeight: 600 }}>Price</th>
                  <th style={{ padding: "16px 30px", fontWeight: 600 }}>Stock</th>
                  <th style={{ padding: "16px 30px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const hasVariants = Boolean(p.hasVariants && p.variants && p.variants.length > 0);
                  const minPrice = hasVariants ? Math.min(...p.variants.map(v => v.price)) : p.price;
                  const maxPrice = hasVariants ? Math.max(...p.variants.map(v => v.price)) : p.price;

                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border)", background: 'white', transition: 'background 0.2s' }}>
                      <td style={{ padding: "20px 30px", display: "flex", alignItems: "flex-start", gap: 16 }}>
                        <div style={{ width: 48, height: 48, background: '#f1f5f9', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                          {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.emoji}
                        </div> 
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {p.name}
                            {hasVariants && (
                              <span style={{ background: '#fef3c7', color: '#b45309', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6 }}>
                                {p.variants.length} Variants
                              </span>
                            )}
                          </div>
                          
                          {hasVariants ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                              {p.variants.map((v) => (
                                <span key={v.id} style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                                  {v.name || v.unit}: {money(v.price)} ({v.stock} in stock)
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: 13, color: "var(--text-gray)", marginTop: 4 }}>{p.unit}</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "20px 30px", fontWeight: 500, color: 'var(--text-gray)' }}>{p.category}</td>
                      <td style={{ padding: "20px 30px", fontWeight: 700, color: 'var(--text-dark)' }}>
                        {hasVariants ? (minPrice === maxPrice ? money(minPrice) : `${money(minPrice)} – ${money(maxPrice)}`) : money(p.price)}
                      </td>
                      <td style={{ padding: "20px 30px" }}>
                        <span style={{ 
                          background: p.stock <= LOW_STOCK ? "#fef2f2" : "#f0fdf4",
                          color: p.stock <= LOW_STOCK ? "#ef4444" : "#16a34a",
                          border: `1px solid ${p.stock <= LOW_STOCK ? '#fca5a5' : '#bbf7d0'}`,
                          padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700
                        }}>
                          {p.stock} units {hasVariants ? "(total)" : ""}
                        </span>
                      </td>
                      <td style={{ padding: "20px 30px", textAlign: "right" }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button className="mm-iconbtn" onClick={() => openProductModal(p)} title="Edit Product & Variants" style={{ background: '#f1f5f9' }}><Pencil size={16} /></button>
                          <button className="mm-iconbtn" onClick={() => deleteProduct(p.id)} title="Delete Product" style={{ background: '#fef2f2', color: '#ef4444' }}><Trash2 size={16} /></button>
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

      {/* 5. STAFF & MANAGER MANAGEMENT TAB */}
      {tab === "staff" && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h2 style={{ fontSize: 28, margin: 0, color: 'var(--text-dark)', fontWeight: 800 }}>Manager & Staff Access</h2>
                <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                  {staff.length} Authorized Managers
                </span>
              </div>
              <span style={{ fontSize: 14, color: 'var(--text-gray)' }}>
                Only Master Admin can create, activate, or revoke store managers. Managers can log in to Shift Analytics, POS Billing, and Orders.
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                type="button" 
                onClick={() => {
                  setAdminCredForm({
                    email: adminAuth?.email || "",
                    password: adminAuth?.password || "",
                    name: adminAuth?.name || "Master Admin"
                  });
                  setAdminCredMsg("");
                  setShowAdminCredModal(true);
                }}
                style={{ 
                  background: 'white', border: '1px solid var(--border)', 
                  padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-dark)' 
                }}
              >
                <ShieldCheck size={16} color="var(--primary)" /> Master Admin Settings
              </button>

              <button 
                type="button" 
                className="mm-btn-primary" 
                onClick={() => openStaffModal(null)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10 }}
              >
                <Plus size={18}/> Create New Manager
              </button>
            </div>
          </div>

          {/* Master Admin Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
            borderRadius: 16, padding: '24px 28px', color: 'white', marginBottom: 28,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ 
                width: 52, height: 52, borderRadius: 14, background: 'var(--primary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 
              }}>
                👑
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{adminAuth?.name || "Master Admin"}</h3>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                    PRIMARY OWNER
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span><strong>Login Email:</strong> {adminAuth?.email || "Configured in Database"}</span>
                  <span><strong>Access:</strong> Full Store, Financials, Inventory & Managers</span>
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => {
                setAdminCredForm({
                  email: adminAuth?.email || "",
                  password: adminAuth?.password || "",
                  name: adminAuth?.name || "Master Admin"
                });
                setAdminCredMsg("");
                setShowAdminCredModal(true);
              }}
              style={{ 
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', 
                color: 'white', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, 
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 
              }}
            >
              <Key size={14} /> Change Admin Password
            </button>
          </div>

          {/* Managers List Table */}
          <div className="mm-block" style={{ padding: 0, overflow: "hidden", borderRadius: 16 }}>
            <div style={{ padding: '20px 28px', borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: '#f8fafc' }}>
              <strong style={{ fontSize: 16, color: 'var(--text-dark)' }}>Store Managers Directory</strong>
              <span style={{ fontSize: 13, color: 'var(--text-gray)' }}>Only accounts listed here can log in to the Manager Portal</span>
            </div>

            {staff.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-gray)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👔</div>
                <h3 style={{ fontSize: 18, color: 'var(--text-dark)', margin: '0 0 6px 0' }}>No Managers Added Yet</h3>
                <p style={{ maxWidth: 440, margin: '0 auto 20px', fontSize: 14 }}>
                  Currently only the Master Admin has access. Click "Create New Manager" to create an authorized manager account with email and password.
                </p>
                <button 
                  type="button" 
                  className="mm-btn-primary" 
                  onClick={() => openStaffModal(null)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10 }}
                >
                  <Plus size={16} /> Create First Manager
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "white", borderBottom: "2px solid var(--border)", color: "var(--text-gray)", fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      <th style={{ padding: "16px 28px", fontWeight: 700 }}>Manager</th>
                      <th style={{ padding: "16px 20px", fontWeight: 700 }}>Login Email</th>
                      <th style={{ padding: "16px 20px", fontWeight: 700 }}>Phone</th>
                      <th style={{ padding: "16px 20px", fontWeight: 700 }}>Login Password</th>
                      <th style={{ padding: "16px 20px", fontWeight: 700 }}>Status</th>
                      <th style={{ padding: "16px 28px", fontWeight: 700, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map(s => {
                      const isRevealed = Boolean(showStaffPasswords[s.id]);
                      return (
                        <tr key={s.id} style={{ borderBottom: "1px solid var(--border)", background: 'white' }}>
                          <td style={{ padding: "18px 28px", fontWeight: 700, color: 'var(--text-dark)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#f1f5f9', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
                                {s.name.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontSize: 14 }}>{s.name}</div>
                                <span style={{ fontSize: 11, background: '#f1f5f9', color: 'var(--text-gray)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                                  {s.role || "Manager"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "18px 20px", fontSize: 14, color: 'var(--text-dark)', fontWeight: 600 }}>
                            {s.email || "No email set"}
                          </td>
                          <td style={{ padding: "18px 20px", fontSize: 14, color: 'var(--text-gray)' }}>
                            {s.phone || "—"}
                          </td>
                          <td style={{ padding: "18px 20px" }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: isRevealed ? 'normal' : 2, fontWeight: 700 }}>
                                {isRevealed ? (s.password || "••••••••") : "••••••••"}
                              </span>
                              <button 
                                type="button"
                                onClick={() => setShowStaffPasswords(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, display: 'flex' }}
                                title={isRevealed ? "Hide Password" : "Show Password"}
                              >
                                {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: "18px 20px" }}>
                            <button
                              type="button"
                              onClick={() => toggleStaffActive(s)}
                              style={{ 
                                display: 'inline-flex', alignItems: 'center', gap: 6, 
                                background: s.active !== false ? "#f0fdf4" : "#fef2f2",
                                color: s.active !== false ? "#16a34a" : "#ef4444", 
                                border: `1px solid ${s.active !== false ? '#bbf7d0' : '#fca5a5'}`,
                                padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer' 
                              }}
                              title="Click to Toggle Active/Inactive"
                            >
                              <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.active !== false ? '#16a34a' : '#ef4444' }}></div>
                              {s.active !== false ? "Active" : "Suspended"}
                            </button>
                          </td>
                          <td style={{ padding: "18px 28px", textAlign: "right" }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button 
                                type="button" 
                                className="mm-iconbtn" 
                                onClick={() => openStaffModal(s)} 
                                title="Edit Manager & Password" 
                                style={{ background: '#f1f5f9' }}
                              >
                                <Pencil size={15} />
                              </button>
                              <button 
                                type="button" 
                                className="mm-iconbtn" 
                                onClick={() => deleteStaffMember(s.id)} 
                                title="Revoke Manager Access" 
                                style={{ background: '#fef2f2', color: '#ef4444' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 6. DAILY BILLS & INVOICES TAB */}
      {tab === "daily-bills" && (
        <DailyBillsView 
          orders={orders} 
          products={products} 
          updateOrders={updateOrders} 
        />
      )}

      {/* 7. CUSTOMER KHATA & DUES LEDGER */}
      {tab === "customers" && (
        <CustomerKhataView 
          customers={customers} 
          updateCustomers={updateCustomers} 
          orders={orders} 
          updateOrders={updateOrders} 
        />
      )}

      {/* MODALS OVERLAY */}
      {(showProductModal || showBannerModal || showExpenseModal) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Product Modal */}
          {showProductModal && (
            <div className="mm-block modal-dialog-responsive" style={{ width: '100%', maxWidth: 680, padding: 24, maxHeight: '90vh', overflowY: 'auto', animation: 'scaleIn 0.2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
                </h3>
                <button type="button" onClick={() => setShowProductModal(false)} className="mm-iconbtn" style={{ background: '#f1f5f9' }}><X size={18} /></button>
              </div>

              <form onSubmit={saveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Product Name *</label>
                  <input required className="mm-input" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="e.g. Cadbury 5 Star Chocolate" />
                </div>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Category *</label>
                    {!isCustomCategory ? (
                      <select required className="mm-input" value={productForm.category} onChange={e => {
                        if (e.target.value === "ADD_NEW") {
                          setIsCustomCategory(true);
                          setProductForm({...productForm, category: ''});
                        } else {
                          setProductForm({...productForm, category: e.target.value});
                        }
                      }}>
                        <option value="" disabled>Select Category</option>
                        {allCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="ADD_NEW" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>+ Add New Category...</option>
                      </select>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input autoFocus required className="mm-input" style={{ flex: 1 }} placeholder="Type new category..." value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} />
                        <button type="button" className="mm-btn" onClick={() => { setIsCustomCategory(false); setProductForm({...productForm, category: ''}); }}>Cancel</button>
                      </div>
                    )}
                  </div>

                  <div style={{ width: 140 }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Emoji Icon</label>
                    <input className="mm-input" value={productForm.emoji} onChange={e => setProductForm({...productForm, emoji: e.target.value})} placeholder="🍫" />
                  </div>
                </div>

                {/* Multiple Variants Toggle */}
                <div style={{ background: productForm.hasVariants ? '#fffbeb' : '#f8fafc', padding: '14px 18px', borderRadius: 10, border: productForm.hasVariants ? '2px solid #f59e0b' : '1px solid var(--border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'var(--text-dark)' }}>
                    <input 
                      type="checkbox" 
                      checked={productForm.hasVariants} 
                      onChange={e => setProductForm({ ...productForm, hasVariants: e.target.checked })} 
                      style={{ width: 18, height: 18, accentColor: '#d97706', cursor: 'pointer' }}
                    />
                    <span>This product has multiple pack sizes / variants (e.g. 5 Star ₹5, ₹10, ₹20, 3D)</span>
                  </label>
                  {productForm.hasVariants && (
                    <div style={{ fontSize: 12, color: '#92400e', marginTop: 6, marginLeft: 28 }}>
                      Manage distinct sizes, packings, prices and stocks for each variant. Easily add or update variants anytime!
                    </div>
                  )}
                </div>

                {/* Variants List Section */}
                {productForm.hasVariants ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dark)' }}>
                        Variants & Pricing List ({productForm.variants?.length || 0})
                      </label>
                      <button 
                        type="button" 
                        onClick={addVariantRow}
                        style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Plus size={14} /> + Add New Variant
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 90px 90px 36px', gap: 8, padding: '0 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-gray)', textTransform: 'uppercase' }}>
                      <span>Size / Variant Name</span>
                      <span>Unit / Pack Label</span>
                      <span>Price (₹)</span>
                      <span>Stock</span>
                      <span></span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto', paddingRight: 4 }}>
                      {productForm.variants.map((v, idx) => (
                        <div key={v.id || idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 90px 90px 36px', gap: 8, alignItems: 'center', background: '#f8fafc', padding: 8, borderRadius: 8, border: '1px solid var(--border)' }}>
                          <div>
                            <input 
                              className="mm-input" 
                              style={{ padding: '7px 10px', fontSize: 13 }}
                              placeholder="e.g. Small (10g)"
                              value={v.name}
                              onChange={e => updateVariantRow(idx, 'name', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <input 
                              className="mm-input" 
                              style={{ padding: '7px 10px', fontSize: 13 }}
                              placeholder="e.g. 10g pack"
                              value={v.unit}
                              onChange={e => updateVariantRow(idx, 'unit', e.target.value)}
                            />
                          </div>
                          <div>
                            <input 
                              type="number"
                              min="0"
                              className="mm-input" 
                              style={{ padding: '7px 10px', fontSize: 13, fontWeight: 700 }}
                              placeholder="₹ Price"
                              value={v.price}
                              onChange={e => updateVariantRow(idx, 'price', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <input 
                              type="number"
                              min="0"
                              className="mm-input" 
                              style={{ padding: '7px 10px', fontSize: 13 }}
                              placeholder="Stock"
                              value={v.stock}
                              onChange={e => updateVariantRow(idx, 'stock', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <button 
                              type="button" 
                              onClick={() => removeVariantRow(idx)}
                              disabled={productForm.variants.length <= 1}
                              style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: productForm.variants.length <= 1 ? 'not-allowed' : 'pointer', opacity: productForm.variants.length <= 1 ? 0.3 : 1 }}
                              title="Delete Variant"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Single Product Price & Stock */
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Single Price (₹) *</label>
                      <input required type="number" min="0" className="mm-input" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="e.g. 20" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Stock Count *</label>
                      <input required type="number" min="0" className="mm-input" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} placeholder="e.g. 40" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Unit (e.g. 52g pack)</label>
                      <input className="mm-input" value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} placeholder="e.g. 1 piece / 500g" />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Product Image URL (Optional)</label>
                  <input className="mm-input" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} placeholder="https://images.unsplash.com/..." />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <button type="button" className="mm-btn" onClick={() => setShowProductModal(false)} style={{ flex: 1, background: '#f1f5f9', color: 'var(--text-dark)' }}>Cancel</button>
                  <button type="submit" className="mm-btn-primary" style={{ flex: 1 }}>Save Product</button>
                </div>
              </form>
            </div>
          )}

          {/* Banner Modal */}
          {showBannerModal && (
            <div className="mm-block modal-dialog-responsive" style={{ width: '100%', maxWidth: 500, padding: 24, animation: 'scaleIn 0.2s ease' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: 24 }}>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h3>
              <form onSubmit={saveBanner} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Banner Title</label>
                  <input required className="mm-input" value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} placeholder="E.g. Mega Sale 50% Off" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Image URL</label>
                  <input required className="mm-input" value={bannerForm.image} onChange={e => setBannerForm({...bannerForm, image: e.target.value})} placeholder="https://..." />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Link (Category Name)</label>
                  <input required className="mm-input" value={bannerForm.link} onChange={e => setBannerForm({...bannerForm, link: e.target.value})} placeholder="E.g. Chips & Namkeen" />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button type="button" className="mm-btn" onClick={() => setShowBannerModal(false)} style={{ flex: 1, background: '#f1f5f9', color: 'var(--text-dark)' }}>Cancel</button>
                  <button type="submit" className="mm-btn-primary" style={{ flex: 1 }}>Save Banner</button>
                </div>
              </form>
            </div>
          )}

          {/* Expense Modal (Store Expense Record) */}
          {showExpenseModal && (
            <div className="mm-block modal-dialog-responsive" style={{ width: '100%', maxWidth: 520, padding: 24, animation: 'scaleIn 0.2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Receipt size={22} color="var(--primary)" /> Record Store Expense
                </h3>
                <button type="button" onClick={() => setShowExpenseModal(false)} className="mm-iconbtn" style={{ background: '#f1f5f9' }}><X size={18} /></button>
              </div>

              <form onSubmit={saveExpense} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Expense Description *</label>
                  <input 
                    required 
                    className="mm-input" 
                    placeholder="e.g. Electricity Bill / Shopping Carry Bags / Staff Wages / Tea & Refreshments" 
                    value={expenseForm.title} 
                    onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value })} 
                  />
                </div>

                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Amount (₹) *</label>
                    <input 
                      required 
                      type="number"
                      min="1" 
                      className="mm-input" 
                      placeholder="e.g. 1200" 
                      value={expenseForm.amount} 
                      onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} 
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Date</label>
                    <input 
                      type="date" 
                      className="mm-input" 
                      value={expenseForm.date} 
                      onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Category *</label>
                    <select 
                      className="mm-input"
                      value={expenseForm.category}
                      onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    >
                      {EXPENSE_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Payment Method</label>
                    <select 
                      className="mm-input"
                      value={expenseForm.paymentMethod}
                      onChange={e => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                    >
                      <option value="Cash">Cash (Counter Cash)</option>
                      <option value="UPI">UPI (GPay / PhonePe)</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Notes / Bill Number (Optional)</label>
                  <input 
                    className="mm-input" 
                    placeholder="e.g. Bill no. 492 / Paid to Sharma ji" 
                    value={expenseForm.notes} 
                    onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })} 
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <button type="button" className="mm-btn" onClick={() => setShowExpenseModal(false)} style={{ flex: 1, background: '#f1f5f9', color: 'var(--text-dark)' }}>Cancel</button>
                  <button type="submit" className="mm-btn-primary" style={{ flex: 1 }}>Save Expense Entry</button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

      {/* CREATE / EDIT MANAGER MODAL */}
      {showStaffModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)",
          zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowStaffModal(false)}>
          <div 
            className="mm-block modal-dialog-responsive" 
            style={{ width: "100%", maxWidth: 520, padding: 24, borderRadius: 16, background: "white", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#e0e7ff', color: '#4338ca', padding: 8, borderRadius: 10 }}>
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-dark)' }}>
                    {editingStaff ? "Edit Store Manager" : "Create New Store Manager"}
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--text-gray)' }}>
                    Manager credentials allow logging into POS billing & shift analytics
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowStaffModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)' }}
              >
                <X size={20} />
              </button>
            </div>

            {staffError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {staffError}
              </div>
            )}

            <form onSubmit={saveStaffMember} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-dark)' }}>
                  Manager Full Name *
                </label>
                <input 
                  type="text" 
                  className="mm-input" 
                  placeholder="e.g. Ramesh Kumar" 
                  value={staffForm.name} 
                  onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} 
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-dark)' }}>
                  Manager Login Email *
                </label>
                <input 
                  type="email" 
                  className="mm-input" 
                  placeholder="e.g. manager@siyasitalstore.com" 
                  value={staffForm.email} 
                  onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} 
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-dark)' }}>
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    className="mm-input" 
                    placeholder="9876543210" 
                    value={staffForm.phone} 
                    onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })} 
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-dark)' }}>
                    Assigned Role
                  </label>
                  <select 
                    className="mm-input"
                    value={staffForm.role}
                    onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}
                  >
                    <option value="Manager">Manager (Full POS & Shift)</option>
                    <option value="Staff">Counter Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-dark)' }}>
                  Manager Login Password *
                </label>
                <input 
                  type="text" 
                  className="mm-input" 
                  placeholder="Set login password (min 6 chars)" 
                  value={staffForm.password} 
                  onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} 
                  required
                />
                <span style={{ fontSize: 11, color: 'var(--text-gray)', marginTop: 4, display: 'block' }}>
                  The manager will use this password along with their email to log in to the portal.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <input 
                  type="checkbox" 
                  id="staffActiveCheck"
                  checked={staffForm.active}
                  onChange={e => setStaffForm({ ...staffForm, active: e.target.checked })}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="staffActiveCheck" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', cursor: 'pointer' }}>
                  Account Active (Uncheck to temporarily suspend login access)
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <button 
                  type="button" 
                  className="mm-btn" 
                  onClick={() => setShowStaffModal(false)} 
                  style={{ flex: 1, background: '#f1f5f9', color: 'var(--text-dark)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="mm-btn-primary" 
                  style={{ flex: 1 }}
                >
                  {editingStaff ? "Update Manager" : "Create Manager Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MASTER ADMIN CREDENTIALS MODAL */}
      {showAdminCredModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)",
          zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowAdminCredModal(false)}>
          <div 
            className="mm-block modal-dialog-responsive" 
            style={{ width: "100%", maxWidth: 480, padding: 24, borderRadius: 16, background: "white", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: '#fef3c7', color: '#d97706', padding: 8, borderRadius: 10 }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-dark)' }}>
                    Master Admin Credentials
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--text-gray)' }}>
                    Update your primary store owner login credentials
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAdminCredModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)' }}
              >
                <X size={20} />
              </button>
            </div>

            {adminCredMsg && (
              <div style={{ 
                background: adminCredMsg.includes("success") ? '#f0fdf4' : '#fef2f2', 
                border: `1px solid ${adminCredMsg.includes("success") ? '#bbf7d0' : '#fecaca'}`,
                color: adminCredMsg.includes("success") ? '#16a34a' : '#b91c1c', 
                padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 
              }}>
                {adminCredMsg}
              </div>
            )}

            <form onSubmit={saveAdminCredentials} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-dark)' }}>
                  Admin Owner Name
                </label>
                <input 
                  type="text" 
                  className="mm-input" 
                  value={adminCredForm.name} 
                  onChange={e => setAdminCredForm({ ...adminCredForm, name: e.target.value })} 
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-dark)' }}>
                  Master Admin Login ID / Email *
                </label>
                <input 
                  type="text" 
                  className="mm-input" 
                  value={adminCredForm.email} 
                  onChange={e => setAdminCredForm({ ...adminCredForm, email: e.target.value })} 
                  placeholder="e.g. admin or admin@siyasitalstore.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--text-dark)' }}>
                  Master Admin Password *
                </label>
                <input 
                  type="text" 
                  className="mm-input" 
                  value={adminCredForm.password} 
                  onChange={e => setAdminCredForm({ ...adminCredForm, password: e.target.value })} 
                  required
                />
                <span style={{ fontSize: 11, color: 'var(--text-gray)', marginTop: 4, display: 'block' }}>
                  Minimum 6 characters. Remember to keep this password secure.
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <button 
                  type="button" 
                  className="mm-btn" 
                  onClick={() => setShowAdminCredModal(false)} 
                  style={{ flex: 1, background: '#f1f5f9', color: 'var(--text-dark)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="mm-btn-primary" 
                  style={{ flex: 1 }}
                >
                  Update Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </DashboardLayout>
  );
}

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { KEYS, DEFAULT_PRODUCTS, DEFAULT_STAFF, DEFAULT_BANNERS, DEFAULT_EXPENSES, DEFAULT_ORDERS, DEFAULT_CUSTOMERS, loadOrSeed, persist } from "./data/store";
import { 
  getSupabaseConfig,
  fetchSupabaseProducts, upsertSupabaseProduct,
  fetchSupabaseOrders, upsertSupabaseOrder,
  fetchSupabaseCustomers, upsertSupabaseCustomer,
  fetchSupabaseExpenses, upsertSupabaseExpense
} from "./lib/supabase";
import SupabaseSyncModal from "./components/SupabaseSyncModal";

import Layout from "./components/Layout";
import Login from "./pages/Auth/Login";
import CustomerView from "./pages/Customer/CustomerView";
import UserDashboard from "./pages/Customer/UserDashboard";
import Checkout from "./pages/Customer/Checkout";
import ManagerView from "./pages/Manager/ManagerView";
import AdminView from "./pages/Admin/AdminView";
import PolicyPage from "./pages/Info/PolicyPage";
import Feedback from "./pages/Info/Feedback";
import ContactSupport from "./pages/Info/ContactSupport";

export default function App() {
  const [user, setUser] = useState(null); // null = guest
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('mm-theme') || 'light');
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [banners, setBanners] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [cart, setCart] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const loadAll = useCallback(async () => {
    setLoading(true);
    const { isConfigured } = getSupabaseConfig();

    let sbProducts = null;
    let sbOrders = null;
    let sbCustomers = null;
    let sbExpenses = null;

    if (isConfigured) {
      try {
        [sbProducts, sbOrders, sbCustomers, sbExpenses] = await Promise.all([
          fetchSupabaseProducts(),
          fetchSupabaseOrders(),
          fetchSupabaseCustomers(),
          fetchSupabaseExpenses()
        ]);
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to local store:", err);
      }
    }

    // Determine final values (use Supabase if configured & available, else local storage)
    const finalProducts = (sbProducts && sbProducts.length > 0) 
      ? sbProducts 
      : await loadOrSeed(KEYS.products, DEFAULT_PRODUCTS);

    const finalOrders = (sbOrders !== null) 
      ? sbOrders 
      : await loadOrSeed(KEYS.orders, DEFAULT_ORDERS);

    const finalCustomers = (sbCustomers && sbCustomers.length > 0) 
      ? sbCustomers 
      : await loadOrSeed(KEYS.customers, DEFAULT_CUSTOMERS);

    const finalExpenses = (sbExpenses !== null) 
      ? sbExpenses 
      : await loadOrSeed(KEYS.expenses, DEFAULT_EXPENSES);

    const finalStaff = await loadOrSeed(KEYS.staff, DEFAULT_STAFF);
    const finalBanners = await loadOrSeed(KEYS.banners, DEFAULT_BANNERS);

    setProducts(finalProducts);
    setOrders(finalOrders);
    setStaff(finalStaff);
    setBanners(finalBanners);
    setCustomers(finalCustomers);
    setExpenses(finalExpenses);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mm-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const updateProducts = async (next) => {
    setProducts(next);
    if (!(await persist(KEYS.products, next))) setSyncError(true);
    if (getSupabaseConfig().isConfigured) {
      next.forEach(p => upsertSupabaseProduct(p).catch(console.error));
    }
  };

  const updateOrders = async (next) => {
    setOrders(next);
    if (!(await persist(KEYS.orders, next))) setSyncError(true);
    if (getSupabaseConfig().isConfigured && next.length > 0) {
      next.slice(0, 5).forEach(o => upsertSupabaseOrder(o).catch(console.error));
    }
  };

  const updateStaff = async (next) => {
    setStaff(next);
    if (!(await persist(KEYS.staff, next))) setSyncError(true);
  };

  const updateBanners = async (next) => {
    setBanners(next);
    if (!(await persist(KEYS.banners, next))) setSyncError(true);
  };

  const updateCustomers = async (next) => {
    setCustomers(next);
    if (!(await persist(KEYS.customers, next))) setSyncError(true);
    if (getSupabaseConfig().isConfigured) {
      next.forEach(c => upsertSupabaseCustomer(c).catch(console.error));
    }
  };

  const updateExpenses = async (next) => {
    setExpenses(next);
    if (!(await persist(KEYS.expenses, next))) setSyncError(true);
    if (getSupabaseConfig().isConfigured) {
      next.forEach(e => upsertSupabaseExpense(e).catch(console.error));
    }
  };

  const changeQty = (key, d) => {
    setCart((prev) => {
      let maxStock = 0;
      if (key.includes("__")) {
        const [pId, vId] = key.split("__");
        const prod = products.find((p) => p.id === pId);
        const variant = prod?.variants?.find((v) => v.id === vId);
        maxStock = variant ? variant.stock : 0;
      } else {
        const prod = products.find((p) => p.id === key);
        maxStock = prod ? prod.stock : 0;
      }
      const current = prev[key] || 0;
      const next = Math.max(0, Math.min(current + d, maxStock));
      return { ...prev, [key]: next };
    });
  };

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, q]) => q > 0)
      .map(([key, qty]) => {
        if (key.includes("__")) {
          const [pId, vId] = key.split("__");
          const product = products.find((p) => p.id === pId);
          if (!product) return null;
          const variant = (product.variants || []).find((v) => v.id === vId);
          if (!variant) return null;
          return {
            id: key,
            productId: product.id,
            variantId: variant.id,
            name: `${product.name} (${variant.unit || variant.name})`,
            baseName: product.name,
            variantName: variant.name,
            unit: variant.unit || variant.name,
            price: variant.price,
            stock: variant.stock,
            emoji: product.emoji,
            image: product.image,
            qty,
          };
        } else {
          const product = products.find((p) => p.id === key);
          if (!product) return null;
          return {
            ...product,
            id: key,
            productId: product.id,
            qty,
          };
        }
      })
      .filter(Boolean);
  }, [cart, products]);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 18, color: 'var(--text-gray)' }}>Loading store data...</div>;
  }

  return (
    <>
      {syncError && (
        <div style={{ background: '#ef4444', color: 'white', padding: '8px 20px', textAlign: 'center', fontSize: 14 }}>
          <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
          Sync issue — data might not be saved permanently.
        </div>
      )}
      
      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} customers={customers} updateCustomers={updateCustomers} />} />
        
        <Route element={<Layout theme={theme} toggleTheme={toggleTheme} user={user} products={products} onLogout={() => { setUser(null); navigate('/'); }} cartItems={cartItems} cartCount={cartCount} subtotal={subtotal} changeQty={changeQty} onCheckoutClick={handleCheckoutClick} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}>
          {/* Public / Customer Routes */}
          <Route path="/" element={<CustomerView products={products} cart={cart} changeQty={changeQty} banners={banners} searchQuery={searchQuery} user={user} onParchiOrder={async (newOrder) => await updateOrders([newOrder, ...orders])} />} />
          <Route path="/checkout" element={<Checkout cartItems={cartItems} subtotal={subtotal} products={products} updateProducts={updateProducts} orders={orders} updateOrders={updateOrders} setCart={setCart} user={user} />} />
          <Route path="/dashboard" element={<UserDashboard user={user || { name: "Guest User", phone: "" }} updateUser={setUser} customers={customers} updateCustomers={updateCustomers} orders={user ? orders.filter(o => o.customer === user.name || o.customerEmail === user.email || (user.phone && o.phone === user.phone)) : orders} />} />
          
          {/* Info Routes */}
          <Route path="/policy/:policyId" element={<PolicyPage />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/contact" element={<ContactSupport />} />

        </Route>

        {/* Manager Route */}
        <Route path="/manager" element={
          user?.role === 'manager' || user?.role === 'admin' ? 
            <ManagerView theme={theme} toggleTheme={toggleTheme} customers={customers} updateCustomers={updateCustomers} orders={orders} updateOrders={updateOrders} products={products} updateProducts={updateProducts} expenses={expenses} updateExpenses={updateExpenses} user={user} onLogout={() => { setUser(null); navigate('/'); }} /> : <Navigate to="/login" />
        } />

        {/* Admin Route */}
        <Route path="/admin" element={
          user?.role === 'admin' ? 
            <AdminView theme={theme} toggleTheme={toggleTheme} customers={customers} updateCustomers={updateCustomers} products={products} updateProducts={updateProducts} staff={staff} updateStaff={updateStaff} orders={orders} updateOrders={updateOrders} banners={banners} updateBanners={updateBanners} expenses={expenses} updateExpenses={updateExpenses} user={user} onLogout={() => { setUser(null); navigate('/'); }} onOpenSupabase={() => setShowSupabaseModal(true)} /> : <Navigate to="/login" />
        } />
      </Routes>

      {/* Supabase Connection & Real Data Sync Modal */}
      <SupabaseSyncModal 
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
        onDataReload={loadAll}
      />
    </>
  );
}

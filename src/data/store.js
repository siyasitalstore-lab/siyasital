export const CATEGORIES = ["Chips & Namkeen", "Bakery & Cakes", "Cold Drinks", "Ice Cream", "Festival Specials", "Daily Essentials & Dairy"];

export const STORE_CONFIG = {
  name: "Siyasital Store",
  tagline: "Your Trusted Neighbourhood Grocery Store 🛍️",
  whatsappNumber: "919876543210",
  displayPhone: "+91 98765 43210",
  upiId: "siyasitalstore@upi",
  address: "Shop No. 12, Main Market Road, Siyasital",
  pickupTime: "10-15 Mins",
};

export const DEFAULT_PRODUCTS = [];

export const DEFAULT_BANNERS = [
  { id: "b1", title: "Fresh Daily Essentials & Dairy Packed in 10 Mins", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop", link: "Daily Essentials & Dairy" },
  { id: "b2", title: "Crispy Snacks, Biscuits & Cold Drinks for Quick Pickup", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=1200&auto=format&fit=crop", link: "Chips & Namkeen" },
  { id: "b3", title: "Cool Refreshing Soft Drinks & Ice Creams", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1200&auto=format&fit=crop", link: "Cold Drinks" },
];

// Clean empty staff - only Master Admin exists by default, who creates and manages genuine Managers
export const DEFAULT_STAFF = [];

const envAdminEmail = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_EMAIL) || "";
const envAdminPass = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PASSWORD) || "";

export const DEFAULT_ADMIN_CREDENTIALS = {
  email: envAdminEmail || "admin@siyasitalstore.com",
  password: envAdminPass || "admin@siyasital123",
  name: "Master Admin"
};

export const POLICIES = {
  privacy: { title: "Privacy Policy", body: "We collect only what's needed to prepare your pickup order — name and phone number. Your data is never sold." },
  returns: { title: "Refund & Return Policy", body: "Items can be checked at the pickup counter. Any damaged or expired items will be replaced or refunded instantly." },
  terms: { title: "Terms of Service", body: "By placing an order you confirm the details provided are accurate. Prices and stock are subject to change without notice." },
  shipping: { title: "Store Pickup Policy", body: "All orders are for store pickup only. Orders are packed within 10-15 minutes and held at the counter for 4 hours." },
};

export const KEYS = { 
  products: "products-catalog-v3", 
  orders: "orders-list-v3", 
  staff: "staff-list-v3", 
  banners: "banners-list-v2", 
  customers: "customers-list-v3",
  expenses: "expenses-list-v3",
  adminAuth: "admin-auth-v3"
};

export function getAdminAuth() {
  try {
    const raw = localStorage.getItem(KEYS.adminAuth);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_ADMIN_CREDENTIALS;
}

export function saveAdminAuth(auth) {
  try {
    localStorage.setItem(KEYS.adminAuth, JSON.stringify(auth));
  } catch (err) {
    console.error("Failed to save admin credentials:", err);
  }
}

export const EXPENSE_CATEGORIES = [
  "Rent", 
  "Utilities (Electricity/Water)", 
  "Staff Salary", 
  "Packaging & Carry Bags", 
  "Supplier / Stock Refill", 
  "Maintenance & Cleaning", 
  "Tea & Refreshments", 
  "Other Expenses"
];

// Clean real neighborhood credit accounts
export const DEFAULT_CUSTOMERS = [
  {
    id: "c1",
    name: "Anjali Gupta",
    phone: "9823456789",
    email: "anjali.gupta@example.com",
    address: "House 14, Street 3, Near City Temple, Main Market Area",
    khataLimit: 3000,
    notes: "Regular family customer, clears account monthly",
    paymentHistory: [],
    manualEntries: []
  },
  {
    id: "c2",
    name: "Rakesh Sharma",
    phone: "9811224466",
    email: "rakesh.sharma@example.com",
    address: "House 28, Main Market Road, Main Market Area",
    khataLimit: 5000,
    notes: "Sweet shop owner, monthly credit ledger",
    paymentHistory: [],
    manualEntries: []
  }
];

// Empty fresh orders and expenses (no fake data!)
export const DEFAULT_EXPENSES = [];
export const DEFAULT_ORDERS = [];

export const LOW_STOCK = 10;
export const STATUSES = ["New", "Preparing", "Ready", "Completed", "Cancelled"];
export const nextStatus = { New: "Preparing", Preparing: "Ready", Ready: "Completed" };
export const statusStyle = {
  New: { bg: "#FBEDEA", fg: "#D64541" }, Preparing: { bg: "#FDF2D6", fg: "#B4880A" },
  Ready: { bg: "#E4F1E6", fg: "#3C6E47" }, Completed: { bg: "#EAE7E0", fg: "#79705F" },
  Cancelled: { bg: "#EFEFEF", fg: "#9A9284" },
};

export const money = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
export const orderTotal = (o) => (o.items || []).reduce((s, i) => s + (i.qty || 1) * (i.price || 0), 0);

/**
 * Generate formatted WhatsApp message for order
 */
export function formatWhatsAppOrderMessage({ id, customer, phone, items = [], subtotal, total, payment, utr, isParchi, parchiText, parchiImage }) {
  let msg = `🛍️ *Store Pickup Order - ${STORE_CONFIG.name}*\n`;
  msg += `*Order ID:* #${id}\n`;
  msg += `*Customer:* ${customer || "Customer"} (${phone || "-"})\n`;
  msg += `*Fulfillment:* 🏬 Counter Pickup (Store: ${STORE_CONFIG.address})\n`;
  msg += `\n📦 *Order Items:*\n`;

  if (isParchi) {
    msg += `📝 *Grocery List / Slip:*\n`;
    if (parchiText) msg += `${parchiText}\n`;
    if (parchiImage) msg += `[Photo Attached in Store System]\n`;
    msg += `(Total bill will be confirmed when packed at the counter)\n`;
  } else {
    items.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.name} x ${item.qty} = ${money(item.price * item.qty)}\n`;
    });
    msg += `\n*Bill Summary:*\n`;
    msg += `*• Total Amount: ${money(total || subtotal)}*\n`;
  }

  msg += `\n*Payment Mode:* ${
    payment === "cod" ? "💵 Cash at Store Counter" :
    payment === "upi" ? `📱 Direct UPI QR${utr ? ` (Ref: ${utr})` : ""}` :
    payment === "khata" ? "📒 Store Credit / Khata Ledger" : "💳 Online"
  }\n`;

  msg += `\nPlease keep this packed for counter pickup. Thank you! 🙏`;
  return msg;
}

export function getWhatsAppUrl(phone, text) {
  const cleanPhone = (phone || STORE_CONFIG.whatsappNumber).replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function generateUpiUrl(upiId, name, amount, orderId) {
  const id = upiId || STORE_CONFIG.upiId;
  const payeeName = encodeURIComponent(name || STORE_CONFIG.name);
  return `upi://pay?pa=${id}&pn=${payeeName}&am=${amount}&cu=INR&tn=Order-${orderId || "SiyasitalStore"}`;
}

/**
 * Web Audio API synthesized order chime (offline, zero external files)
 */
export function playOrderChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.35);
    });
  } catch (err) {
    console.warn("Audio notification failed:", err);
  }
}

// Stub storage if running outside environment
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) { return { value: localStorage.getItem(key) }; },
    async set(key, value) { localStorage.setItem(key, value); }
  };
}

export function normalizeDate(d) {
  if (!d) return "";
  const str = String(d).trim();
  // If ISO YYYY-MM-DD
  if (str.includes("-")) {
    const parts = str.split("-");
    if (parts.length === 3) {
      const [y, m, day] = parts;
      return `${String(day).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
    }
  }
  // If DD/MM/YYYY
  if (str.includes("/")) {
    const parts = str.split("/");
    if (parts.length === 3) {
      const [day, m, y] = parts;
      return `${String(day).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
    }
  }
  return str;
}

/**
 * Calculate full statement for a customer from linked orders, manual entries, and payments
 */
export function getCustomerKhataStatement(customer, orders = []) {
  if (!customer) return { transactions: [], totalPurchases: 0, totalPaid: 0, currentDue: 0 };

  const transactions = [];

  // 1. Linked Khata orders from orders list
  const cleanPhone = (customer.phone || "").replace(/[^0-9]/g, "");
  orders.forEach((o) => {
    const oPayment = (o.payment || "").toLowerCase();
    const oPhone = (o.phone || "").replace(/[^0-9]/g, "");
    const matchId = o.customerId && customer.id && o.customerId === customer.id;
    const matchPhone = cleanPhone && oPhone && cleanPhone === oPhone;
    const matchName = o.customer && customer.name && o.customer.toLowerCase().trim() === customer.name.toLowerCase().trim();

    if (oPayment === "khata" && (matchId || matchPhone || matchName)) {
      const orderAmount = o.total || orderTotal(o);
      transactions.push({
        id: `ord_${o.id}`,
        orderId: o.id,
        date: o.date || "Today",
        time: o.time || "",
        type: "purchase", // Samaan liya (Due increase)
        title: `Store Pickup Order #${o.id}`,
        amount: orderAmount,
        items: o.items || [],
        isParchi: o.isParchi || false,
        parchiText: o.parchiText || "",
        notes: o.status ? `Status: ${o.status}` : "Counter Pickup"
      });
    }
  });

  // 2. Manual due bills added directly
  (customer.manualEntries || []).forEach((m) => {
    transactions.push({
      id: m.id || `man_${Math.random()}`,
      orderId: m.billNo || "MANUAL",
      date: m.date || "Today",
      time: m.time || "",
      type: "purchase",
      title: m.note || "Counter Credit Purchase",
      amount: Number(m.amount) || 0,
      items: m.items || [],
      notes: m.notes || "Shop Register"
    });
  });

  // 3. Payment history (Jama kiye)
  (customer.paymentHistory || []).forEach((p) => {
    transactions.push({
      id: p.id || `pay_${Math.random()}`,
      date: p.date || "Today",
      time: p.time || "",
      type: "payment", // Paise jama kiye (Due decrease)
      title: `Payment Received (${p.mode || "Cash"})`,
      amount: Number(p.amount) || 0,
      mode: p.mode || "Cash",
      notes: p.note || "Khata Payment",
      ref: p.ref || ""
    });
  });

  // Sort transactions
  transactions.sort((a, b) => (b.id > a.id ? 1 : -1));

  const totalPurchases = transactions
    .filter((t) => t.type === "purchase")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPaid = transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentDue = Math.max(0, totalPurchases - totalPaid);

  return {
    transactions,
    totalPurchases,
    totalPaid,
    currentDue
  };
}

export async function loadOrSeed(key, fallback) {
  try {
    const res = await window.storage.get(key, true);
    if (res && res.value) {
      let data = JSON.parse(res.value);
      if (key === KEYS.products && Array.isArray(data)) {
        // Merge missing default items such as multi-variant 5 Star
        const missing = fallback.filter(fb => !data.some(d => d.id === fb.id));
        if (missing.length > 0) {
          data = [...missing, ...data];
          await window.storage.set(key, JSON.stringify(data), true);
        }
      }
      if (key === KEYS.customers && Array.isArray(data) && data.length === 0) {
        data = fallback;
        await window.storage.set(key, JSON.stringify(data), true);
      }
      return data;
    } else {
      await window.storage.set(key, JSON.stringify(fallback), true);
      return fallback;
    }
  } catch {
    try {
      await window.storage.set(key, JSON.stringify(fallback), true);
    } catch {}
    return fallback;
  }
}

export async function persist(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), true);
    return true;
  } catch {
    return false;
  }
}

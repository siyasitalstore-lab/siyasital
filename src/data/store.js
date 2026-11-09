export const CATEGORIES = ["Chips & Namkeen", "Bakery & Cakes", "Cold Drinks", "Ice Cream", "Festival Specials", "Daily Essentials & Dairy"];

export const STORE_CONFIG = {
  name: "Mohalla Mart",
  tagline: "Your Trusted Neighbourhood Grocery Store 🛍️",
  whatsappNumber: "919876543210",
  displayPhone: "+91 98765 43210",
  upiId: "mohallamart@upi",
  address: "Shop No. 12, Main Market Road, Near City Park",
  pickupTime: "10-15 Mins",
};

export const DEFAULT_PRODUCTS = [
  // 1. Chocolates with Multi-Variants
  { 
    id: "p_5star", 
    name: "Cadbury 5 Star Chocolate", 
    category: "Chips & Namkeen", 
    unit: "Multiple sizes available", 
    price: 5, 
    stock: 120, 
    emoji: "🍫",
    hasVariants: true,
    variants: [
      { id: "v1", name: "Small (10g)", unit: "10g pack", price: 5, stock: 45 },
      { id: "v2", name: "Regular (20g)", unit: "20g pack", price: 10, stock: 40 },
      { id: "v3", name: "Medium (40g)", unit: "40g pack", price: 20, stock: 25 },
      { id: "v4", name: "5 Star 3D", unit: "42g bar", price: 35, stock: 10 }
    ]
  },

  // 2. Daily Essentials & Dairy
  {
    id: "p_atta",
    name: "Aashirvaad Shudh Chakki Atta",
    category: "Daily Essentials & Dairy",
    unit: "Available in 5kg & 10kg",
    price: 235,
    stock: 60,
    emoji: "🌾",
    hasVariants: true,
    variants: [
      { id: "v_att_5", name: "5 kg Bag", unit: "5 kg bag", price: 235, stock: 35 },
      { id: "v_att_10", name: "10 kg Bag", unit: "10 kg bag", price: 455, stock: 25 }
    ]
  },
  {
    id: "p_oil",
    name: "Fortune Sunlite Refined Sunflower Oil",
    category: "Daily Essentials & Dairy",
    unit: "Available in 1L & 5L",
    price: 135,
    stock: 45,
    emoji: "🫒",
    hasVariants: true,
    variants: [
      { id: "v_oil_1", name: "1 Litre Pouch", unit: "1L pouch", price: 135, stock: 35 },
      { id: "v_oil_5", name: "5 Litre Can", unit: "5L can", price: 680, stock: 10 }
    ]
  },
  { id: "p_milk_taaza", name: "Amul Taaza Homogenised Toned Milk", category: "Daily Essentials & Dairy", unit: "500ml pouch", price: 27, stock: 50, emoji: "🥛" },
  { id: "p_milk_gold", name: "Amul Gold Full Cream Milk", category: "Daily Essentials & Dairy", unit: "500ml pouch", price: 33, stock: 40, emoji: "🥛" },
  { id: "p_butter", name: "Amul Pasteurized Salted Butter", category: "Daily Essentials & Dairy", unit: "100g pack", price: 58, stock: 30, emoji: "🧈" },
  { id: "p_paneer", name: "Fresh Malai Paneer", category: "Daily Essentials & Dairy", unit: "200g pack", price: 90, stock: 25, emoji: "🧀" },
  { id: "p_curd", name: "Mother Dairy Classic Dahi", category: "Daily Essentials & Dairy", unit: "400g tub", price: 35, stock: 20, emoji: "🥣" },
  { id: "p_salt", name: "Tata Salt Vacuum Evaporated Iodized Salt", category: "Daily Essentials & Dairy", unit: "1 kg packet", price: 28, stock: 80, emoji: "🧂" },
  {
    id: "p_rice",
    name: "India Gate Feast Rozzana Basmati Rice",
    category: "Daily Essentials & Dairy",
    unit: "Available in 1kg & 5kg",
    price: 115,
    stock: 30,
    emoji: "🍚",
    hasVariants: true,
    variants: [
      { id: "v_rice_1", name: "1 kg Pack", unit: "1 kg pack", price: 115, stock: 20 },
      { id: "v_rice_5", name: "5 kg Bag", unit: "5 kg bag", price: 540, stock: 10 }
    ]
  },
  { id: "p_dal", name: "Tata Sampann Unpolished Toor Dal", category: "Daily Essentials & Dairy", unit: "1 kg packet", price: 185, stock: 25, emoji: "🍲" },

  // 3. Chips & Namkeen
  {
    id: "p_lays_magic",
    name: "Lay's India's Magic Masala",
    category: "Chips & Namkeen",
    unit: "Available in ₹10, ₹20, ₹40",
    price: 10,
    stock: 75,
    emoji: "🌶️",
    hasVariants: true,
    variants: [
      { id: "v_lay_1", name: "Small (30g)", unit: "30g pack", price: 10, stock: 25 },
      { id: "v_lay_2", name: "Regular (50g)", unit: "50g pack", price: 20, stock: 35 },
      { id: "v_lay_3", name: "Party Pack (90g)", unit: "90g pack", price: 40, stock: 15 }
    ]
  },
  { id: "p_lays_salted", name: "Lay's Classic Salted Chips", category: "Chips & Namkeen", unit: "50g pack", price: 20, stock: 40, emoji: "🍟" },
  {
    id: "p_kurkure",
    name: "Kurkure Masala Munch",
    category: "Chips & Namkeen",
    unit: "Available in ₹10 & ₹20",
    price: 10,
    stock: 60,
    emoji: "🌽",
    hasVariants: true,
    variants: [
      { id: "v_kur_1", name: "Small (45g)", unit: "45g pack", price: 10, stock: 40 },
      { id: "v_kur_2", name: "Regular (85g)", unit: "85g pack", price: 20, stock: 20 }
    ]
  },
  { id: "p_aloo_bhujia", name: "Haldiram's Nagpur Aloo Bhujia", category: "Chips & Namkeen", unit: "150g pack", price: 45, stock: 30, emoji: "🥨" },
  { id: "p_namkeen_mix", name: "Haldiram's All-In-One Mixture", category: "Chips & Namkeen", unit: "200g pack", price: 55, stock: 25, emoji: "🥜" },
  { id: "p_maggi", name: "Maggi 2-Minute Masala Instant Noodles", category: "Chips & Namkeen", unit: "Pack of 4 (280g)", price: 56, stock: 45, emoji: "🍜" },

  // 4. Cold Drinks & Beverages
  {
    id: "p_coke",
    name: "Coca-Cola Soft Drink",
    category: "Cold Drinks",
    unit: "Available in Can, 750ml, 2L",
    price: 35,
    stock: 65,
    emoji: "🥤",
    hasVariants: true,
    variants: [
      { id: "v_coke_can", name: "Can (250ml)", unit: "250ml can", price: 35, stock: 20 },
      { id: "v_coke_750", name: "Bottle (750ml)", unit: "750ml bottle", price: 40, stock: 30 },
      { id: "v_coke_2l", name: "Party Bottle (2L)", unit: "2L bottle", price: 95, stock: 15 }
    ]
  },
  { id: "p_thumsup", name: "Thums Up Charged Soft Drink", category: "Cold Drinks", unit: "750ml bottle", price: 40, stock: 35, emoji: "⚡" },
  { id: "p_sprite", name: "Sprite Refreshing Lemon Drink", category: "Cold Drinks", unit: "750ml bottle", price: 40, stock: 30, emoji: "🍋" },
  { id: "p_juice", name: "Real Fruit Power Mixed Fruit Juice", category: "Cold Drinks", unit: "1 Litre Tetra Pack", price: 120, stock: 20, emoji: "🧃" },
  {
    id: "p_tea",
    name: "Tata Tea Gold Leaf Tea",
    category: "Cold Drinks",
    unit: "Available in 250g & 500g",
    price: 160,
    stock: 30,
    emoji: "☕",
    hasVariants: true,
    variants: [
      { id: "v_tea_250", name: "250g Pack", unit: "250g pack", price: 160, stock: 20 },
      { id: "v_tea_500", name: "500g Pack", unit: "500g pack", price: 310, stock: 10 }
    ]
  },
  { id: "p_coffee", name: "Nescafe Classic Instant Coffee", category: "Cold Drinks", unit: "50g Glass Jar", price: 190, stock: 15, emoji: "☕" },

  // 5. Bakery & Cakes
  {
    id: "p_parleg",
    name: "Parle-G Original Glucose Biscuits",
    category: "Bakery & Cakes",
    unit: "Available in ₹5, ₹25, ₹80",
    price: 5,
    stock: 95,
    emoji: "🍪",
    hasVariants: true,
    variants: [
      { id: "v_pg_1", name: "Mini (80g)", unit: "80g pack", price: 5, stock: 50 },
      { id: "v_pg_2", name: "Family Pack (250g)", unit: "250g pack", price: 25, stock: 30 },
      { id: "v_pg_3", name: "Jumbo (800g)", unit: "800g pack", price: 80, stock: 15 }
    ]
  },
  { id: "p_goodday", name: "Britannia Good Day Butter Cookies", category: "Bakery & Cakes", unit: "100g pack", price: 20, stock: 45, emoji: "🍪" },
  { id: "p_oreo", name: "Oreo Original Vanilla Cream Biscuits", category: "Bakery & Cakes", unit: "120g pack", price: 35, stock: 30, emoji: "🍪" },
  { id: "p_bread", name: "Harvest Gold White Sandwich Bread", category: "Bakery & Cakes", unit: "400g loaf", price: 30, stock: 20, emoji: "🍞" },
  { id: "p_pastry", name: "Fresh Eggless Chocolate Truffle Pastry", category: "Bakery & Cakes", unit: "1 Piece", price: 60, stock: 15, emoji: "🍰" },

  // 6. Ice Cream
  { id: "p_cornetto", name: "Kwality Wall's Cornetto Double Chocolate", category: "Ice Cream", unit: "105ml cone", price: 40, stock: 25, emoji: "🍦" },
  { id: "p_vanilla_tub", name: "Amul Vanilla Magic Ice Cream Tub", category: "Ice Cream", unit: "1 Litre Tub", price: 180, stock: 12, emoji: "🍨" },

  // 7. Festival Specials & Household
  { id: "p_gulabjamun", name: "Haldiram's Gulab Jamun Sweet Tin", category: "Festival Specials", unit: "1 kg can", price: 240, stock: 15, emoji: "🪔" },
  { id: "p_surf", name: "Surf Excel Easy Wash Detergent Powder", category: "Daily Essentials & Dairy", unit: "1 kg packet", price: 145, stock: 25, emoji: "🫧" },
  { id: "p_dettol", name: "Dettol Original Liquid Handwash Refill", category: "Daily Essentials & Dairy", unit: "675ml refill pack", price: 99, stock: 20, emoji: "🧼" }
];

export const DEFAULT_BANNERS = [
  { id: "b1", title: "Fresh Daily Essentials & Dairy Packed in 10 Mins", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop", link: "Daily Essentials & Dairy" },
  { id: "b2", title: "Crispy Snacks, Biscuits & Cold Drinks for Quick Pickup", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=1200&auto=format&fit=crop", link: "Chips & Namkeen" },
  { id: "b3", title: "Cool Refreshing Soft Drinks & Ice Creams", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1200&auto=format&fit=crop", link: "Cold Drinks" },
];

export const DEFAULT_STAFF = [
  { id: "u1", name: "Ramesh Yadav", role: "Manager", phone: "98765 43210", active: true },
  { id: "u3", name: "Store Owner (Admin)", role: "Admin", phone: "99999 00000", active: true },
];

export const POLICIES = {
  privacy: { title: "Privacy Policy", body: "We collect only what's needed to prepare your pickup order — name and phone number. Your data is never sold." },
  returns: { title: "Refund & Return Policy", body: "Items can be checked at the pickup counter. Any damaged or expired items will be replaced or refunded instantly." },
  terms: { title: "Terms of Service", body: "By placing an order you confirm the details provided are accurate. Prices and stock are subject to change without notice." },
  shipping: { title: "Store Pickup Policy", body: "All orders are for store pickup only. Orders are packed within 10-15 minutes and held at the counter for 4 hours." },
};

export const KEYS = { 
  products: "products-catalog-v2", 
  orders: "orders-list-v2", 
  staff: "staff-list-v2", 
  banners: "banners-list-v2", 
  customers: "customers-list-v2",
  expenses: "expenses-list-v2"
};

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
    address: "House 14, Street 3, Near City Temple, Mohalla Colony",
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
    address: "House 28, Main Market Road, Mohalla Colony",
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
  return `upi://pay?pa=${id}&pn=${payeeName}&am=${amount}&cu=INR&tn=Order-${orderId || "MohallaMart"}`;
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

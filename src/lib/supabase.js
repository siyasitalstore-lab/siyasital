import { createClient } from "@supabase/supabase-js";

// Retrieve URL & Key from Vite env variables or localStorage fallback
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

  const localUrl = localStorage.getItem("mm_supabase_url") || "";
  const localKey = localStorage.getItem("mm_supabase_anon_key") || "";

  const url = (localUrl || envUrl).trim();
  const anonKey = (localKey || envKey).trim();

  return {
    url,
    anonKey,
    isConfigured: Boolean(
      url &&
      anonKey &&
      url.startsWith("http") &&
      !url.includes("your-project-id") &&
      !anonKey.includes("your-anon-key")
    )
  };
};

export const isSupabaseConfigured = () => getSupabaseConfig().isConfigured;

export const saveSupabaseConfig = (url, anonKey) => {
  if (url) localStorage.setItem("mm_supabase_url", url.trim());
  if (anonKey) localStorage.setItem("mm_supabase_anon_key", anonKey.trim());
  // Re-instantiate
  initSupabaseClient();
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem("mm_supabase_url");
  localStorage.removeItem("mm_supabase_anon_key");
  initSupabaseClient();
};

let supabaseInstance = null;

export const initSupabaseClient = () => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (isConfigured) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err);
      supabaseInstance = null;
    }
  } else {
    supabaseInstance = null;
  }
  return supabaseInstance;
};

// Initial startup instantiation
initSupabaseClient();

export const supabase = () => supabaseInstance;

/**
 * Diagnostic test connection to Supabase
 */
export async function testSupabaseConnection() {
  const client = supabase();
  const config = getSupabaseConfig();

  if (!config.isConfigured || !client) {
    return {
      connected: false,
      message: "Supabase URL and Anon Key are missing or not configured yet."
    };
  }

  try {
    const { data, error } = await client.from("products").select("id").limit(1);
    if (error) {
      if (error.code === "PGRST204" || error.code === "42P01" || error.message?.includes("does not exist")) {
        return {
          connected: true,
          tablesMissing: true,
          message: "Connected to Supabase! However, the database tables have not been created yet. Please run the SQL schema migration in Supabase SQL Editor."
        };
      }
      return {
        connected: false,
        message: `Supabase Error (${error.code || "unknown"}): ${error.message}`
      };
    }
    return {
      connected: true,
      tablesMissing: false,
      message: "Successfully connected to live Supabase database!"
    };
  } catch (err) {
    return {
      connected: false,
      message: `Connection failed: ${err.message}`
    };
  }
}

// ==========================================
// SUPABASE DATABASE DATA SERVICES
// ==========================================

// 1. PRODUCTS
export async function fetchSupabaseProducts() {
  const client = supabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(p => ({
      ...p,
      hasVariants: Boolean(p.has_variants),
      variants: Array.isArray(p.variants) ? p.variants : []
    }));
  } catch (err) {
    console.warn("fetchSupabaseProducts error:", err.message);
    return null;
  }
}

export async function upsertSupabaseProduct(prod) {
  const client = supabase();
  if (!client) return false;

  try {
    const payload = {
      id: prod.id,
      name: prod.name,
      category: prod.category,
      unit: prod.unit || "",
      price: Number(prod.price) || 0,
      stock: Number(prod.stock) || 0,
      emoji: prod.emoji || "🛍️",
      has_variants: Boolean(prod.hasVariants),
      variants: prod.variants || []
    };

    const { error } = await client.from("products").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("upsertSupabaseProduct error:", err.message);
    return false;
  }
}

export async function deleteSupabaseProduct(id) {
  const client = supabase();
  if (!client) return false;

  try {
    const { error } = await client.from("products").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("deleteSupabaseProduct error:", err.message);
    return false;
  }
}

// 2. ORDERS
export async function fetchSupabaseOrders() {
  const client = supabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(o => ({
      ...o,
      isParchi: Boolean(o.is_parchi),
      parchiText: o.parchi_text || "",
      parchiImage: o.parchi_image || null,
      items: Array.isArray(o.items) ? o.items : []
    }));
  } catch (err) {
    console.warn("fetchSupabaseOrders error:", err.message);
    return null;
  }
}

export async function upsertSupabaseOrder(order) {
  const client = supabase();
  if (!client) return false;

  try {
    const payload = {
      id: order.id,
      customer: order.customer,
      phone: order.phone,
      time: order.time,
      date: order.date,
      fulfillment: order.fulfillment || "pickup",
      address: order.address,
      payment: order.payment,
      utr: order.utr || null,
      notes: order.notes || "",
      status: order.status || "New",
      total: Number(order.total) || 0,
      subtotal: Number(order.subtotal) || 0,
      is_parchi: Boolean(order.isParchi),
      parchi_text: order.parchiText || "",
      parchi_image: order.parchiImage || null,
      items: order.items || []
    };

    const { error } = await client.from("orders").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("upsertSupabaseOrder error:", err.message);
    return false;
  }
}

export async function deleteSupabaseOrder(id) {
  const client = supabase();
  if (!client) return false;

  try {
    const { error } = await client.from("orders").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("deleteSupabaseOrder error:", err.message);
    return false;
  }
}

// 3. CUSTOMERS & CREDIT LEDGER
export async function fetchSupabaseCustomers() {
  const client = supabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(c => ({
      ...c,
      khataLimit: Number(c.khata_limit) || 3000,
      paymentHistory: Array.isArray(c.payment_history) ? c.payment_history : [],
      manualEntries: Array.isArray(c.manual_entries) ? c.manual_entries : []
    }));
  } catch (err) {
    console.warn("fetchSupabaseCustomers error:", err.message);
    return null;
  }
}

export async function upsertSupabaseCustomer(cust) {
  const client = supabase();
  if (!client) return false;

  try {
    const payload = {
      id: cust.id,
      name: cust.name,
      phone: cust.phone,
      email: cust.email || "",
      address: cust.address || "",
      khata_limit: Number(cust.khataLimit) || 3000,
      notes: cust.notes || "",
      payment_history: cust.paymentHistory || [],
      manual_entries: cust.manualEntries || []
    };

    const { error } = await client.from("customers").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("upsertSupabaseCustomer error:", err.message);
    return false;
  }
}

export async function deleteSupabaseCustomer(id) {
  const client = supabase();
  if (!client) return false;

  try {
    const { error } = await client.from("customers").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("deleteSupabaseCustomer error:", err.message);
    return false;
  }
}

// 4. EXPENSES
export async function fetchSupabaseExpenses() {
  const client = supabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("expenses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(e => ({
      ...e,
      paymentMethod: e.payment_method || "UPI",
      amount: Number(e.amount) || 0
    }));
  } catch (err) {
    console.warn("fetchSupabaseExpenses error:", err.message);
    return null;
  }
}

export async function upsertSupabaseExpense(exp) {
  const client = supabase();
  if (!client) return false;

  try {
    const payload = {
      id: exp.id,
      title: exp.title,
      category: exp.category,
      amount: Number(exp.amount),
      date: exp.date,
      payment_method: exp.paymentMethod || "UPI",
      notes: exp.notes || ""
    };

    const { error } = await client.from("expenses").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("upsertSupabaseExpense error:", err.message);
    return false;
  }
}

export async function deleteSupabaseExpense(id) {
  const client = supabase();
  if (!client) return false;

  try {
    const { error } = await client.from("expenses").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("deleteSupabaseExpense error:", err.message);
    return false;
  }
}

// 5. STAFF & ADMIN CREDENTIALS
export async function fetchSupabaseStaff() {
  const client = supabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(s => ({
      id: s.id,
      name: s.name,
      email: s.email || "",
      password: s.password || "",
      role: s.role || "Manager",
      phone: s.phone || "",
      active: s.active !== false
    }));
  } catch (err) {
    console.warn("fetchSupabaseStaff error:", err.message);
    return null;
  }
}

export async function upsertSupabaseStaff(member) {
  const client = supabase();
  if (!client) return false;

  try {
    const payload = {
      id: member.id,
      name: member.name,
      email: member.email || "",
      password: member.password || "",
      role: member.role || "Manager",
      phone: member.phone || "",
      active: member.active !== false
    };

    const { error } = await client.from("staff").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("upsertSupabaseStaff error:", err.message);
    return false;
  }
}

export async function deleteSupabaseStaff(id) {
  const client = supabase();
  if (!client) return false;

  try {
    const { error } = await client.from("staff").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("deleteSupabaseStaff error:", err.message);
    return false;
  }
}

// 6. BULK SYNC / SEED REAL DATA TO SUPABASE
export async function seedRealDataToSupabase(realProducts, realBanners, realStaff) {
  const client = supabase();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const results = { products: 0, banners: 0, staff: 0 };

  // 1. Seed Products
  if (Array.isArray(realProducts) && realProducts.length > 0) {
    const formatted = realProducts.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      unit: p.unit || "",
      price: Number(p.price) || 0,
      stock: Number(p.stock) || 0,
      emoji: p.emoji || "🛍️",
      has_variants: Boolean(p.hasVariants),
      variants: p.variants || []
    }));

    const { error } = await client.from("products").upsert(formatted, { onConflict: "id" });
    if (error) throw new Error(`Products seed failed: ${error.message}`);
    results.products = formatted.length;
  }

  // 2. Seed Banners
  if (Array.isArray(realBanners) && realBanners.length > 0) {
    const formatted = realBanners.map(b => ({
      id: b.id,
      title: b.title,
      image: b.image,
      link: b.link
    }));
    const { error } = await client.from("banners").upsert(formatted, { onConflict: "id" });
    if (!error) results.banners = formatted.length;
  }

  // 3. Seed Staff
  if (Array.isArray(realStaff) && realStaff.length > 0) {
    const formatted = realStaff.map(s => ({
      id: s.id,
      name: s.name,
      role: s.role,
      phone: s.phone,
      active: Boolean(s.active)
    }));
    const { error } = await client.from("staff").upsert(formatted, { onConflict: "id" });
    if (!error) results.staff = formatted.length;
  }

  return results;
}

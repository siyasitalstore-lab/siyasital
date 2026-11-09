# Mohalla Mart 🏬

> A modern, hyper-local neighborhood grocery store web application featuring rapid 10–15 minute store pickups, POS counter billing, multi-variant products, customer credit ledger (Khata), daily bills register, store expense tracking, and Supabase cloud synchronization.

---

## 🚀 Features

- **🛒 100% Store Pickup Model**: Streamlined for counter pickup without delivery friction.
- **📦 Multi-Variant Products**: Supports packaging sizes, weights, and variant-level pricing (e.g., 5 Star ₹5/₹10/₹20, Atta 1kg/5kg/10kg, Oil 1L/5L).
- **🧾 Instant Counter POS Billing**: High-speed Point of Sale system for walk-in and credit customers with automated barcode/phone lookup.
- **📖 Customer Credit Ledger (Khata)**: Tracks customer dues, limits, repayment history, and WhatsApp statement sharing.
- **📄 Daily Invoices & Bills Register**: Detailed log of every daily transaction with itemized print/download receipts.
- **📊 Sales & Store Financial Analytics**: Tracks gross revenue, categorized store expenses (utilities, inventory, staff), and net profit margin.
- **⚡ Dual Storage (Supabase + Local)**: Built-in Supabase PostgreSQL integration with instant offline fallback.
- **🎙️ Voice Search**: Integrated Hindi & English speech-to-text search for fast product finding.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router 7
- **Styling & UI**: Modern Clean CSS, Lucide React Icons
- **Database & Cloud**: Supabase (@supabase/supabase-js) + PostgreSQL
- **Deployment**: Vercel (Configured with `vercel.json` SPA rewrites)

---

## 🌐 Deploy to Vercel via GitHub

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **"Add New..."** → **"Project"**.
3. Import the repository **`siyasitalstore-lab/siyasital`**.
4. Configure Project:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
5. *(Optional)* Add Environment Variables for Supabase:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Public Anon Key
6. Click **Deploy**. Your site will be live on a `*.vercel.app` domain in seconds!

---

## 🗄️ Supabase Cloud Database Setup

1. Open your project on **[supabase.com](https://supabase.com)**.
2. Go to **SQL Editor** and run the contents of [`supabase-schema.sql`](./supabase-schema.sql).
3. In your live Mohalla Mart website:
   - Click the **"Connect DB"** button in the top navbar.
   - Enter your Project URL and Anon Key.
   - Click **"Push Real Grocery Catalog to Supabase"** to populate 30+ authentic grocery products immediately.

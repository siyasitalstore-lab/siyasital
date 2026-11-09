import React, { useState, useEffect } from "react";
import { 
  Database, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, 
  ExternalLink, Key, Globe, Shield, Sparkles, X, ArrowUpRight 
} from "lucide-react";
import { 
  getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, 
  testSupabaseConnection, seedRealDataToSupabase 
} from "../lib/supabase";
import { DEFAULT_PRODUCTS, DEFAULT_BANNERS, DEFAULT_STAFF } from "../data/store";

export default function SupabaseSyncModal({ isOpen, onClose, onDataReload }) {
  const [config, setConfig] = useState({ url: "", anonKey: "" });
  const [status, setStatus] = useState({ testing: false, connected: false, message: "" });
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getSupabaseConfig();
      setConfig({ url: current.url, anonKey: current.anonKey });
      runConnectionCheck();
    }
  }, [isOpen]);

  const runConnectionCheck = async () => {
    setStatus({ testing: true, connected: false, message: "Testing connection to Supabase..." });
    const res = await testSupabaseConnection();
    setStatus({ testing: false, connected: res.connected, tablesMissing: res.tablesMissing, message: res.message });
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveSupabaseConfig(config.url, config.anonKey);
    runConnectionCheck();
    if (onDataReload) onDataReload();
  };

  const handleDisconnect = () => {
    if (window.confirm("Disconnect from Supabase and revert to local storage?")) {
      clearSupabaseConfig();
      setConfig({ url: "", anonKey: "" });
      setStatus({ testing: false, connected: false, message: "Supabase disconnected. Running in Local Mode." });
      if (onDataReload) onDataReload();
    }
  };

  const handleSeedRealData = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedRealDataToSupabase(DEFAULT_PRODUCTS, DEFAULT_BANNERS, DEFAULT_STAFF);
      setSeedResult({
        success: true,
        message: `Successfully seeded ${res.products} real products, ${res.banners} banners and staff to Supabase!`
      });
      if (onDataReload) onDataReload();
    } catch (err) {
      setSeedResult({
        success: false,
        message: `Failed to seed data: ${err.message}`
      });
    } finally {
      setSeeding(false);
    }
  };

  const copySqlSchema = async () => {
    try {
      const response = await fetch("/supabase-schema.sql");
      const sqlText = await response.text();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(sqlText);
      } else {
        const ta = document.createElement("textarea");
        ta.value = sqlText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)",
      zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={onClose}>
      <div 
        className="mm-block" 
        style={{
          width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto",
          padding: 0, borderRadius: 16, background: "white", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", color: "white", padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Database size={24} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "white" }}>
                  Supabase Cloud Database
                </h3>
                <span style={{ fontSize: 13, opacity: 0.9 }}>
                  Connect your real database and sync authentic store inventory
                </span>
              </div>
            </div>
            <button type="button" onClick={onClose} className="mm-iconbtn" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
              <X size={18} />
            </button>
          </div>

          {/* Connection Status Pill */}
          <div style={{ marginTop: 18, background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              {status.testing ? (
                <RefreshCw size={16} className="spin" />
              ) : status.connected ? (
                <CheckCircle2 size={16} color="#86efac" />
              ) : (
                <AlertCircle size={16} color="#fca5a5" />
              )}
              <span style={{ fontWeight: 700 }}>
                {status.testing ? "Testing Connection..." : status.connected ? (status.tablesMissing ? "Connected (Tables Pending)" : "Live & Connected to Supabase") : "Offline / Using Local Storage"}
              </span>
            </div>

            <button 
              type="button" 
              onClick={runConnectionCheck} 
              disabled={status.testing}
              style={{ background: "white", color: "#065f46", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              Test Connection
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px 28px" }}>
          {status.message && (
            <div style={{ 
              background: status.connected ? (status.tablesMissing ? "#fef3c7" : "#ecfdf5") : "#fff1f2", 
              border: `1px solid ${status.connected ? (status.tablesMissing ? "#fde68a" : "#a7f3d0") : "#fecdd3"}`, 
              color: status.connected ? (status.tablesMissing ? "#92400e" : "#065f46") : "#9f1239", 
              padding: "12px 16px", borderRadius: 10, fontSize: 13, marginBottom: 20 
            }}>
              {status.message}
            </div>
          )}

          {/* Step 1: SQL Schema Instructions */}
          <div style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: "#e2e8f0", color: "#334155", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>1</span>
                <strong style={{ fontSize: 14, color: "var(--text-dark)" }}>Run SQL Migration in Supabase</strong>
              </div>
              <a 
                href="https://supabase.com/dashboard/project/_/sql" 
                target="_blank" 
                rel="noreferrer" 
                style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
              >
                <span>Open SQL Editor</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
            <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "var(--text-gray)", lineHeight: 1.5 }}>
              The schema file <code>supabase-schema.sql</code> is prepared in your project root with all tables (<code>products</code>, <code>orders</code>, <code>customers</code>, <code>expenses</code>, <code>staff</code>, <code>banners</code>) and initial real grocery data.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                type="button" 
                onClick={copySqlSchema}
                className="mm-btn"
                style={{ fontSize: 12, padding: "8px 14px", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
              >
                {copiedSql ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                <span>{copiedSql ? "SQL Schema Copied!" : "Copy SQL Schema Script"}</span>
              </button>
            </div>
          </div>

          {/* Step 2: Connection Credentials */}
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "#e2e8f0", color: "#334155", width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>2</span>
              <strong style={{ fontSize: 14, color: "var(--text-dark)" }}>Enter Supabase API Credentials</strong>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-dark)" }}>
                Supabase Project URL (VITE_SUPABASE_URL) *
              </label>
              <div style={{ position: "relative" }}>
                <Globe size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-gray)" }} />
                <input 
                  type="url"
                  required
                  className="mm-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="https://xyzabcdefghijklm.supabase.co"
                  value={config.url}
                  onChange={(e) => setConfig({ ...config, url: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-dark)" }}>
                Supabase Anon Public API Key (VITE_SUPABASE_ANON_KEY) *
              </label>
              <div style={{ position: "relative" }}>
                <Key size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-gray)" }} />
                <input 
                  type="password"
                  required
                  className="mm-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={config.anonKey}
                  onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button 
                type="submit" 
                className="mm-btn-primary" 
                style={{ flex: 1, padding: 12, background: "#059669" }}
              >
                Save & Connect Database
              </button>

              {getSupabaseConfig().isConfigured && (
                <button 
                  type="button" 
                  onClick={handleDisconnect}
                  className="mm-btn" 
                  style={{ padding: "12px 18px", color: "#dc2626", borderColor: "#fca5a5" }}
                >
                  Disconnect
                </button>
              )}
            </div>
          </form>

          {/* Step 3: 1-Click Sync Real Catalog to Supabase */}
          {status.connected && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <strong style={{ fontSize: 14, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={16} color="#d97706" /> Push Real Grocery Catalog to Supabase
                  </strong>
                  <span style={{ fontSize: 12, color: "var(--text-gray)" }}>
                    Instantly upload 30+ real products (Atta, Oil, Dairy, 5 Star variants) to your database.
                  </span>
                </div>

                <button 
                  type="button" 
                  onClick={handleSeedRealData}
                  disabled={seeding}
                  className="mm-btn"
                  style={{ background: "#fef3c7", border: "1px solid #fde68a", color: "#92400e", fontWeight: 700, fontSize: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}
                >
                  {seeding ? <RefreshCw size={14} className="spin" /> : <Database size={14} />}
                  <span>{seeding ? "Uploading..." : "Sync Real Catalog"}</span>
                </button>
              </div>

              {seedResult && (
                <div style={{ background: seedResult.success ? "#dcfce7" : "#fee2e2", color: seedResult.success ? "#166534" : "#991b1b", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                  {seedResult.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

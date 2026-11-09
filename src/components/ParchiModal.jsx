import React, { useState } from "react";
import { X, Camera, FileText, Upload, MessageSquare, CheckCircle, Store } from "lucide-react";
import { 
  STORE_CONFIG, formatWhatsAppOrderMessage, 
  getWhatsAppUrl, playOrderChime 
} from "../data/store";

export default function ParchiModal({ isOpen, onClose, user, onOrderSubmitted }) {
  const [activeTab, setActiveTab] = useState("text"); // 'text' or 'photo'
  const [listText, setListText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    payment: "cod",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (viaWhatsApp = false) => {
    if (!form.name.trim() || form.phone.length < 10) return;
    if (activeTab === "text" && !listText.trim()) return;
    if (activeTab === "photo" && !imagePreview) return;

    setSubmitting(true);
    const id = `PARCHI-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id,
      customer: form.name,
      phone: form.phone,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toLocaleDateString("en-IN"),
      fulfillment: "pickup",
      address: `Store Pickup (${STORE_CONFIG.address})`,
      payment: form.payment,
      status: "New",
      isParchi: true,
      parchiText: activeTab === "text" ? listText : "Handwritten Slip Photo Attached",
      parchiImage: activeTab === "photo" ? imagePreview : null,
      notes: form.notes,
      total: 0, // Store manager will calculate total after packaging
      subtotal: 0,
      items: [{ id: "custom-parchi", name: "Custom Grocery List Slip", price: 0, qty: 1, emoji: "📝" }]
    };

    if (onOrderSubmitted) {
      await onOrderSubmitted(newOrder);
    }

    playOrderChime();
    setSuccessOrder(newOrder);
    setSubmitting(false);

    if (viaWhatsApp) {
      const msg = formatWhatsAppOrderMessage({
        ...newOrder,
        isParchi: true,
        parchiText: listText
      });
      const url = getWhatsAppUrl(STORE_CONFIG.whatsappNumber, msg);
      window.open(url, "_blank");
    }
  };

  const resetAndClose = () => {
    setSuccessOrder(null);
    setListText("");
    setImagePreview(null);
    onClose();
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "var(--surface)", width: "100%", maxWidth: 540, borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        
        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>📝</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, color: "var(--text-dark)", fontWeight: 800 }}>Upload Grocery List Slip (Store Pickup)</h3>
              <span style={{ fontSize: 12, color: "var(--text-gray)" }}>Upload slip photo or type your list — packed and ready for counter pickup</span>
            </div>
          </div>
          <button onClick={resetAndClose} className="mm-iconbtn" style={{ padding: 6, background: "white" }}><X size={18} /></button>
        </div>

        {/* Success View */}
        {successOrder ? (
          <div style={{ padding: "40px 24px", textAlign: "center", overflowY: "auto" }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: 24, color: "var(--text-dark)", marginBottom: 8 }}>Grocery List Slip Submitted!</h2>
            <p style={{ color: "var(--text-gray)", fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
              Your pickup order <strong>#{successOrder.id}</strong> has been received by our store team. We will pack your items for quick counter collection.
            </p>

            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid var(--border)", marginBottom: 20, textAlign: "left", fontSize: 13 }}>
              <strong>🏬 Pickup Store:</strong> {STORE_CONFIG.name} — {STORE_CONFIG.address}
              <div style={{ color: "#10b981", fontWeight: 600, marginTop: 4 }}>Ready in {STORE_CONFIG.pickupTime}</div>
            </div>

            <a 
              href={getWhatsAppUrl(STORE_CONFIG.whatsappNumber, formatWhatsAppOrderMessage({ ...successOrder, isParchi: true, parchiText: listText }))}
              target="_blank"
              rel="noreferrer"
              style={{ 
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "#25D366", color: "white", padding: "12px 24px", borderRadius: 10,
                textDecoration: "none", fontWeight: 700, fontSize: 15, marginBottom: 16, width: "100%", maxWidth: 360
              }}
            >
              <MessageSquare size={18} />
              <span>Notify Store via WhatsApp</span>
            </a>

            <div>
              <button onClick={resetAndClose} className="mm-btn-primary" style={{ padding: "10px 24px" }}>
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
            
            {/* Tabs: Text List vs Photo */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              <button 
                type="button" 
                onClick={() => setActiveTab("text")}
                style={{ 
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 14px",
                  borderRadius: 10, border: activeTab === "text" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: activeTab === "text" ? "#f5f3ff" : "white", fontWeight: 700, fontSize: 14,
                  color: activeTab === "text" ? "var(--primary)" : "var(--text-dark)", cursor: "pointer"
                }}
              >
                <FileText size={18} />
                <span>Type Item List</span>
              </button>

              <button 
                type="button" 
                onClick={() => setActiveTab("photo")}
                style={{ 
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 14px",
                  borderRadius: 10, border: activeTab === "photo" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: activeTab === "photo" ? "#f5f3ff" : "white", fontWeight: 700, fontSize: 14,
                  color: activeTab === "photo" ? "var(--primary)" : "var(--text-dark)", cursor: "pointer"
                }}
              >
                <Camera size={18} />
                <span>Upload Slip Photo</span>
              </button>
            </div>

            {/* Input by Tab */}
            {activeTab === "text" ? (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-dark)" }}>
                  Type your grocery items list here *
                </label>
                <textarea 
                  className="mm-input"
                  rows={4}
                  placeholder={`e.g.:\n- 1 kg Aashirvaad Whole Wheat Flour\n- 1 packet Fresh Toned Milk\n- 2 Maggi Noodles\n- 250g Premium Tea`}
                  value={listText}
                  onChange={(e) => setListText(e.target.value)}
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text-dark)" }}>
                  Upload a clear photo of your grocery list *
                </label>
                {imagePreview ? (
                  <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", maxHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
                    <img src={imagePreview} alt="Slip Preview" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }} />
                    <button 
                      type="button" 
                      onClick={() => setImagePreview(null)}
                      style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", border: "2px dashed var(--border)", borderRadius: 12, cursor: "pointer", background: "#f8fafc" }}>
                    <Upload size={32} color="var(--primary)" style={{ marginBottom: 8 }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)" }}>Click to take photo / upload file</span>
                    <span style={{ fontSize: 12, color: "var(--text-gray)", marginTop: 2 }}>JPG, PNG up to 5MB</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: "none" }} />
                  </label>
                )}
              </div>
            )}

            {/* Customer Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4, color: "var(--text-dark)" }}>Your Full Name *</label>
                <input 
                  className="mm-input"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4, color: "var(--text-dark)" }}>Phone / WhatsApp *</label>
                <input 
                  className="mm-input"
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, "") })}
                />
              </div>
            </div>

            {/* Store Pickup Notice */}
            <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid var(--border)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <Store size={20} color="var(--primary)" />
              <div style={{ fontSize: 12, color: "var(--text-gray)" }}>
                <strong>Pickup Counter:</strong> {STORE_CONFIG.name} ({STORE_CONFIG.address}) • Packed and ready in {STORE_CONFIG.pickupTime}.
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              <button 
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={submitting || !form.name || form.phone.length < 10 || (activeTab === "text" ? !listText.trim() : !imagePreview)}
                style={{ 
                  background: "#25D366", color: "white", padding: "13px", borderRadius: "var(--radius-sm)",
                  border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 8,
                  opacity: (!form.name || form.phone.length < 10 || (activeTab === "text" ? !listText.trim() : !imagePreview)) ? 0.6 : 1
                }}
              >
                <MessageSquare size={18} />
                <span>Send Grocery Slip via WhatsApp (Store Pickup)</span>
              </button>

              <button 
                type="button"
                className="mm-btn-primary"
                onClick={() => handleSubmit(false)}
                disabled={submitting || !form.name || form.phone.length < 10 || (activeTab === "text" ? !listText.trim() : !imagePreview)}
                style={{ padding: "12px", fontSize: 14, fontWeight: 700 }}
              >
                Submit Store Pickup Order Directly
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

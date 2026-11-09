import React, { useState } from "react";
import { 
  ArrowLeft, Clock, User, MapPin, Printer, Receipt, 
  MessageSquare, CheckCircle, Store, FileText, ChevronRight 
} from "lucide-react";
import { money, statusStyle, orderTotal, STORE_CONFIG, getWhatsAppUrl } from "../../data/store";
import StandardBillModal from "../../components/StandardBillModal";

export default function UserDashboard({ user, updateUser, customers, updateCustomers, orders = [] }) {
  const [tab, setTab] = useState("orders");
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);

  const [addressForm, setAddressForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine1: user?.addressLine1 || '',
    addressLine2: user?.addressLine2 || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  });

  const [saveMessage, setSaveMessage] = useState("");

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, ...addressForm };
    updateUser(updatedUser);
    
    // Also update in customers DB
    if (updateCustomers && customers) {
      const nextCustomers = customers.map(c => c.id === user.id ? updatedUser : c);
      updateCustomers(nextCustomers);
    }
    
    setSaveMessage("Profile saved successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const askStatusOnWhatsApp = (order) => {
    const msg = `Hello ${STORE_CONFIG.name}! I would like to check the status of my pickup order #${order.id}. Is it ready at the counter?`;
    window.open(getWhatsAppUrl(STORE_CONFIG.whatsappNumber, msg), "_blank");
  };

  const getStepIndex = (status) => {
    switch (status) {
      case "New": return 1;
      case "Preparing": return 2;
      case "Ready": return 3;
      case "Completed": return 4;
      default: return 1;
    }
  };

  if (!user) return (
    <div style={{ padding: 60, textAlign: 'center', color: "var(--text-gray)" }}>
      <h3>Please log in to view your orders and dashboard.</h3>
    </div>
  );

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px", minHeight: "60vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 30, margin: 0, color: 'var(--text-dark)', fontWeight: 800 }}>My Account</h1>
          <span style={{ fontSize: 14, color: "var(--text-gray)" }}>Welcome, {user.name} ({user.phone || user.email})</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 20, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <button className={`mm-navlink ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')} style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Receipt size={18} /> Order History ({orders.length})
        </button>
        <button className={`mm-navlink ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')} style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={18} /> Address & Profile
        </button>
      </div>

      {tab === 'profile' && (
        <div className="mm-block" style={{ animation: 'fadeIn 0.3s', maxWidth: 600 }}>
          <h3 style={{ margin: "0 0 24px 0", fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={20} color="var(--primary)" /> Profile Details</h3>
          
          {saveMessage && <div style={{ background: '#dcfce7', color: '#16a34a', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14, fontWeight: 600 }}>{saveMessage}</div>}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Full Name</label>
                <input required className="mm-input" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} placeholder="Full Name" />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Phone Number</label>
                <input required className="mm-input" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} placeholder="9876543210" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Delivery Address (Flat / House / Gali)</label>
              <input required className="mm-input" value={addressForm.addressLine1} onChange={e => setAddressForm({...addressForm, addressLine1: e.target.value})} placeholder="House/Flat No., Building Name" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Landmark / Colony</label>
              <input className="mm-input" value={addressForm.addressLine2} onChange={e => setAddressForm({...addressForm, addressLine2: e.target.value})} placeholder="Near Shiv Mandir, Main Road" />
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>City</label>
                <input required className="mm-input" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} placeholder="City" />
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Pincode</label>
                <input required className="mm-input" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} placeholder="Pincode" />
              </div>
            </div>

            <button type="submit" className="mm-btn-primary" style={{ marginTop: 16, padding: '14px 24px', alignSelf: 'flex-start' }}>Save Address</button>
          </form>
        </div>
      )}

      {tab === 'orders' && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          {orders.length === 0 ? (
            <div style={{ background: "white", padding: 80, textAlign: "center", borderRadius: 'var(--radius-lg)', color: "var(--text-gray)", border: '1px dashed var(--border)' }}>
              <Receipt size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <h3 style={{ fontSize: 20, margin: '0 0 8px 0', color: 'var(--text-dark)' }}>No orders found yet.</h3>
              <p>Order fresh snacks, groceries, and daily essentials for quick store pickup!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {orders.map(o => {
                const step = getStepIndex(o.status);
                return (
                  <div key={o.id} className="mm-block" style={{ display: 'flex', flexDirection: 'column', padding: 24, margin: 0, border: '1px solid var(--border)' }}>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 16, flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Order #{o.id}</h3>
                          <span style={{ 
                            padding: "3px 12px", 
                            borderRadius: 20, 
                            fontSize: 12, 
                            fontWeight: 700,
                            background: statusStyle[o.status]?.bg || '#eee', 
                            color: statusStyle[o.status]?.fg || '#333' 
                          }}>
                            {o.status}
                          </span>
                          {o.isParchi && (
                            <span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                              📝 GROCERY SLIP
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: 13, color: "var(--text-gray)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {o.time} {o.date ? `(${o.date})` : ""}</span>
                          <span>•</span>
                          <span style={{ fontWeight: 600, color: '#10b981' }}>
                            Store Pickup 🏬
                          </span>
                          <span>•</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                            Payment: {o.payment === "cod" ? "Cash at Counter" : o.payment === "upi" ? "UPI Paid" : "Store Credit Ledger"}
                          </span>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", gap: 8 }}>
                        <button 
                          onClick={() => askStatusOnWhatsApp(o)} 
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: 6, background: '#25D366', color: 'white',
                            border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' 
                          }}
                        >
                          <MessageSquare size={16} /> Track on WhatsApp
                        </button>
                        <button 
                          onClick={() => setActiveReceiptOrder(o)} 
                          className="mm-btn" 
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13, fontWeight: 700 }}
                        >
                          <Printer size={16} /> Official Bill
                        </button>
                      </div>
                    </div>

                    {/* Visual Order Progress Bar */}
                    <div style={{ margin: "10px 0 20px 0", background: "#f8fafc", padding: "14px 20px", borderRadius: 12, border: "1px solid var(--border)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", position: "relative", textAlign: "center" }}>
                        <div style={{ color: step >= 1 ? "var(--primary)" : "var(--text-gray)", fontWeight: step >= 1 ? 700 : 500, fontSize: 12 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: step >= 1 ? "var(--primary)" : "#e2e8f0", color: "white", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>1</div>
                          Order Placed
                        </div>
                        <div style={{ color: step >= 2 ? "var(--primary)" : "var(--text-gray)", fontWeight: step >= 2 ? 700 : 500, fontSize: 12 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: step >= 2 ? "var(--primary)" : "#e2e8f0", color: "white", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>2</div>
                          Packing
                        </div>
                        <div style={{ color: step >= 3 ? "var(--primary)" : "var(--text-gray)", fontWeight: step >= 3 ? 700 : 500, fontSize: 12 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: step >= 3 ? "var(--primary)" : "#e2e8f0", color: "white", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>3</div>
                          Ready for Pickup
                        </div>
                        <div style={{ color: step >= 4 ? "#10b981" : "var(--text-gray)", fontWeight: step >= 4 ? 700 : 500, fontSize: 12 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: step >= 4 ? "#10b981" : "#e2e8f0", color: "white", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>4</div>
                          Picked Up
                        </div>
                      </div>
                    </div>
                    
                    {/* Items Details */}
                    <div style={{ background: "#f8fafc", padding: 16, borderRadius: 'var(--radius-sm)' }}>
                      {o.isParchi ? (
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-dark)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                            <FileText size={16} color="#d97706" />
                            <span>Uploaded Grocery List Slip:</span>
                          </div>
                          {o.parchiText && (
                            <div style={{ background: "white", padding: 12, borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, whiteSpace: "pre-line", marginBottom: 10 }}>
                              {o.parchiText}
                            </div>
                          )}
                          {o.total > 0 ? (
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, color: "var(--text-dark)", borderTop: "1px dashed var(--border)", paddingTop: 10 }}>
                              <span>Final Billed Total</span>
                              <span>{money(o.total)}</span>
                            </div>
                          ) : (
                            <div style={{ fontSize: 13, color: "#d97706", fontWeight: 600 }}>
                              ⏳ Store manager is packing your items and will update the final bill.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          {o.items.map((i, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8, color: 'var(--text-dark)' }}>
                              <span>{i.qty}x {i.name}</span>
                              <span style={{ fontWeight: 600 }}>{money(i.price * i.qty)}</span>
                            </div>
                          ))}
                          <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "12px 0" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, color: 'var(--text-dark)' }}>
                            <span>Total Payable</span>
                            <span>{money(o.total || orderTotal(o))}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
  );
}

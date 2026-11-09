import React, { useState } from "react";
import { 
  Store, Banknote, QrCode, BookOpen, 
  CheckCircle, Copy, Check, MessageSquare, ExternalLink, ShieldCheck, Clock, Printer, Receipt
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { 
  money, STORE_CONFIG, formatWhatsAppOrderMessage, 
  getWhatsAppUrl, generateUpiUrl, playOrderChime 
} from "../../data/store";
import StandardBillModal from "../../components/StandardBillModal";

export default function Checkout({ cartItems, subtotal, products, updateProducts, orders, updateOrders, setCart, user }) {
  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState("cod");
  const [utrNumber, setUtrNumber] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showBillReceipt, setShowBillReceipt] = useState(false);
  
  const [form, setForm] = useState({ 
    name: user?.name || "", 
    phone: user?.phone || ""
  });
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  
  const navigate = useNavigate();
  const total = subtotal;

  const upiPayUrl = generateUpiUrl(STORE_CONFIG.upiId, STORE_CONFIG.name, total, placedOrder?.id || "temp");

  const copyUpiId = () => {
    navigator.clipboard?.writeText(STORE_CONFIG.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const placeOrder = async (viaWhatsApp = false) => {
    setPlacing(true);
    const id = `MM${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id, 
      customer: form.name, 
      phone: form.phone, 
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toLocaleDateString("en-IN"),
      fulfillment: "pickup", 
      address: `Store Pickup (${STORE_CONFIG.address})`, 
      payment,
      utr: payment === "upi" ? utrNumber : null,
      notes: orderNotes,
      status: "New",
      total,
      subtotal,
      items: cartItems.map(({ id, name, price, qty, emoji }) => ({ id, name, price, qty, emoji })),
    };

    // Update store state
    await updateOrders([newOrder, ...orders]);
    
    // Decrement stock (supporting variants & base products)
    const nextProducts = products.map((p) => {
      let updated = { ...p };
      cartItems.forEach((item) => {
        if (item.productId === p.id || item.id === p.id) {
          if (item.variantId && Array.isArray(updated.variants)) {
            updated.variants = updated.variants.map((v) =>
              v.id === item.variantId ? { ...v, stock: Math.max(0, v.stock - item.qty) } : v
            );
            updated.stock = updated.variants.reduce((s, v) => s + v.stock, 0);
          } else {
            updated.stock = Math.max(0, updated.stock - item.qty);
          }
        }
      });
      return updated;
    });
    await updateProducts(nextProducts);
    
    // Trigger audio notification
    playOrderChime();

    setPlacedOrder(newOrder);
    setCart({});
    setPlacing(false);

    // If placed directly via WhatsApp, launch WhatsApp chat
    if (viaWhatsApp) {
      const message = formatWhatsAppOrderMessage(newOrder);
      const url = getWhatsAppUrl(STORE_CONFIG.whatsappNumber, message);
      window.open(url, "_blank");
    }
  };

  if (placedOrder) {
    const waMessage = formatWhatsAppOrderMessage(placedOrder);
    const waUrl = getWhatsAppUrl(STORE_CONFIG.whatsappNumber, waMessage);

    return (
      <div style={{ textAlign: "center", padding: "60px 20px", maxWidth: 650, margin: "0 auto", minHeight: '65vh' }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#10b981" }}>
          <CheckCircle size={52} />
        </div>
        
        <span style={{ background: "#d1fae5", color: "#065f46", fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: 99, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Pickup Order Confirmed
        </span>
        
        <h1 style={{ fontSize: 32, margin: "14px 0 8px 0", color: 'var(--text-dark)' }}>Thank you! Order Placed Successfully</h1>
        <p style={{ fontSize: 16, color: "var(--text-gray)", marginBottom: 24 }}>
          Order <strong>#{placedOrder.id}</strong> has been received by our store team. 
          Your items will be packed and ready at the counter in <strong>{STORE_CONFIG.pickupTime}</strong>.
        </p>

        {/* Pickup Location Info Box */}
        <div style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 24, textAlign: "left" }}>
          <strong style={{ color: "var(--text-dark)", display: "flex", alignItems: "center", gap: 8, fontSize: 15, marginBottom: 4 }}>
            <Store size={18} color="var(--primary)" /> Pickup Location:
          </strong>
          <div style={{ color: "#334155", fontSize: 14 }}>{STORE_CONFIG.name} — {STORE_CONFIG.address}</div>
          <div style={{ fontSize: 13, color: "#10b981", fontWeight: 600, marginTop: 4 }}>
            Show Order ID #{placedOrder.id} at the counter to collect your pre-packed items.
          </div>
        </div>

        {/* Highlight Card: WhatsApp Order Sync */}
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 16, padding: 24, marginBottom: 30, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ background: "#25D366", color: "white", padding: 8, borderRadius: 10, display: "flex" }}>
              <MessageSquare size={22} />
            </div>
            <div>
              <strong style={{ fontSize: 16, color: "#14532d", display: "block" }}>Notify Store on WhatsApp</strong>
              <span style={{ fontSize: 13, color: "#166534" }}>Alert our store team to expedite packing and have your order ready for pickup.</span>
            </div>
          </div>
          
          <a 
            href={waUrl} 
            target="_blank" 
            rel="noreferrer" 
            style={{ 
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, 
              background: "#25D366", color: "white", textDecoration: "none", 
              fontWeight: 700, padding: "12px 20px", borderRadius: 10, fontSize: 15,
              boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)"
            }}
          >
            <span>Send Details on WhatsApp</span>
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Order Quick Summary */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, textAlign: "left", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10, marginBottom: 10 }}>
            <span style={{ color: "var(--text-gray)" }}>Payment Mode:</span>
            <strong style={{ color: "var(--text-dark)" }}>
              {placedOrder.payment === "cod" ? "Cash at Store Counter" : placedOrder.payment === "upi" ? "Direct UPI Paid" : "Store Credit Ledger"}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10, marginBottom: 10 }}>
            <span style={{ color: "var(--text-gray)" }}>Total Amount:</span>
            <strong style={{ color: "var(--text-dark)", fontSize: 18 }}>{money(placedOrder.total)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-gray)" }}>Pickup Time:</span>
            <strong style={{ color: "#10b981" }}>Ready in {STORE_CONFIG.pickupTime}</strong>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <button 
            type="button"
            onClick={() => setShowBillReceipt(true)}
            style={{ 
              display: "flex", alignItems: "center", gap: 8, background: "#0f172a", color: "white", 
              border: "none", borderRadius: "var(--radius-sm)", padding: "12px 24px", fontWeight: 700, 
              fontSize: 15, cursor: "pointer" 
            }}
          >
            <Printer size={18} /> View / Print Official Bill
          </button>
          <Link to="/" className="mm-btn-primary" style={{ textDecoration: 'none', padding: "12px 24px" }}>
            Continue Shopping
          </Link>
          <Link to="/dashboard" style={{ textDecoration: 'none', background: "#f1f5f9", color: "var(--text-dark)", fontWeight: 600, padding: "12px 24px", borderRadius: "var(--radius-sm)" }}>
            View in My Orders
          </Link>
        </div>

        {/* Standard Official Bill Modal */}
        {showBillReceipt && (
          <StandardBillModal 
            order={placedOrder} 
            onClose={() => setShowBillReceipt(false)} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="checkout-grid" style={{ maxWidth: 1200, margin: "24px auto", padding: "0 16px", minHeight: '60vh' }}>
      
      {/* Left Column - Stepper */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Step 1: Contact Info */}
        <div className="mm-block" style={{ padding: 0, overflow: 'hidden', border: step === 1 ? '1px solid var(--primary)' : '1px solid var(--border)', boxShadow: step === 1 ? '0 4px 12px rgba(79, 70, 229, 0.1)' : 'none' }}>
          <div className="fk-stepper-header">
            <div className="fk-stepper-number" style={{ background: step === 1 ? 'var(--primary)' : '#f1f5f9', color: step === 1 ? 'white' : 'var(--text-gray)' }}>1</div>
            <div style={{ flex: 1, fontWeight: 700 }}>Contact Information</div>
            {step > 1 && <CheckCircle size={20} color="var(--primary)" />}
          </div>
          {step === 1 && (
            <div style={{ padding: 24, background: 'var(--surface)' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-dark)" }}>Your Full Name *</label>
                <input 
                  className="mm-input" 
                  placeholder="e.g. Ramesh Kumar" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-dark)" }}>Mobile / WhatsApp Number *</label>
                <input 
                  className="mm-input" 
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit phone number" 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, "") })} 
                />
                <span style={{ fontSize: 12, color: "var(--text-gray)", marginTop: 4, display: "block" }}>Our store team will notify you once your order is packed.</span>
              </div>
              <button 
                className="mm-btn-primary" 
                disabled={!form.name.trim() || form.phone.length < 10} 
                onClick={() => setStep(2)}
              >
                Continue to Pickup Details
              </button>
            </div>
          )}
          {step > 1 && (
            <div style={{ padding: '0 24px 20px 68px', fontSize: 14, color: 'var(--text-gray)' }}>
              <strong style={{ color: 'var(--text-dark)' }}>{form.name}</strong> • +91 {form.phone}
            </div>
          )}
        </div>

        {/* Step 2: Store Pickup Details */}
        <div className="mm-block" style={{ padding: 0, overflow: 'hidden', border: step === 2 ? '1px solid var(--primary)' : '1px solid var(--border)', boxShadow: step === 2 ? '0 4px 12px rgba(79, 70, 229, 0.1)' : 'none' }}>
          <div className="fk-stepper-header">
            <div className="fk-stepper-number" style={{ background: step === 2 ? 'var(--primary)' : '#f1f5f9', color: step === 2 ? 'white' : 'var(--text-gray)' }}>2</div>
            <div style={{ flex: 1, fontWeight: 700 }}>Store Pickup Counter</div>
            {step > 2 && <CheckCircle size={20} color="var(--primary)" />}
          </div>
          {step === 2 && (
            <div style={{ padding: 24, background: 'var(--surface)' }}>
              <div style={{ padding: 18, background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Store size={22} color="var(--primary)" />
                  <strong style={{ fontSize: 16, color: "var(--text-dark)" }}>{STORE_CONFIG.name}</strong>
                </div>
                <div style={{ color: "var(--text-gray)", fontSize: 14, marginBottom: 8 }}>{STORE_CONFIG.address}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: "#10b981", fontSize: 13, fontWeight: 700 }}>
                  <Clock size={16} />
                  <span>Ready for pickup in {STORE_CONFIG.pickupTime}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-gray)", marginTop: 6 }}>
                  Skip the lines! Collect your pre-packed items directly from our store pickup counter.
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-dark)" }}>Pickup Note (Optional)</label>
                <input 
                  className="mm-input" 
                  placeholder="e.g. Will pick up around 6:00 PM" 
                  value={orderNotes} 
                  onChange={(e) => setOrderNotes(e.target.value)} 
                />
              </div>

              <button 
                className="mm-btn-primary" 
                onClick={() => setStep(3)}
              >
                Continue to Payment
              </button>
            </div>
          )}
          {step > 2 && (
            <div style={{ padding: '0 24px 20px 68px', fontSize: 14, color: 'var(--text-gray)' }}>
              Store Pickup • {STORE_CONFIG.name} ({STORE_CONFIG.address})
            </div>
          )}
        </div>

        {/* Step 3: Payment Options */}
        <div className="mm-block" style={{ padding: 0, overflow: 'hidden', border: step === 3 ? '1px solid var(--primary)' : '1px solid var(--border)', boxShadow: step === 3 ? '0 4px 12px rgba(79, 70, 229, 0.1)' : 'none' }}>
          <div className="fk-stepper-header">
            <div className="fk-stepper-number" style={{ background: step === 3 ? 'var(--primary)' : '#f1f5f9', color: step === 3 ? 'white' : 'var(--text-gray)' }}>3</div>
            <div style={{ flex: 1, fontWeight: 700 }}>Choose Payment Method</div>
          </div>
          {step === 3 && (
            <div style={{ padding: 24, background: 'var(--surface)' }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                
                {/* 1. Cash on Pickup / Counter Pay */}
                <label style={{ 
                  display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, cursor: 'pointer', 
                  border: payment === 'cod' ? '2px solid var(--primary)' : '1px solid var(--border)', 
                  borderRadius: 12, background: payment === 'cod' ? '#f5f3ff' : 'var(--surface)' 
                }}>
                  <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} style={{ marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Banknote size={18} color="var(--primary)" />
                      <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>Cash at Store Counter</span>
                    </div>
                    <span style={{ fontSize: 13, color: "var(--text-gray)", display: "block", marginTop: 4 }}>
                      Pay in cash at the store counter while collecting your order.
                    </span>
                  </div>
                </label>

                {/* 2. Direct Shopkeeper UPI (Instant QR) */}
                <label style={{ 
                  display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, cursor: 'pointer', 
                  border: payment === 'upi' ? '2px solid var(--primary)' : '1px solid var(--border)', 
                  borderRadius: 12, background: payment === 'upi' ? '#f5f3ff' : 'var(--surface)' 
                }}>
                  <input type="radio" name="payment" checked={payment === "upi"} onChange={() => setPayment("upi")} style={{ marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <QrCode size={18} color="#10b981" />
                        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>Scan & Pay via UPI (GPay / PhonePe / Paytm)</span>
                      </div>
                      <span style={{ background: "#d1fae5", color: "#065f46", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>0% Fee</span>
                    </div>
                    <span style={{ fontSize: 13, color: "var(--text-gray)", display: "block", marginTop: 4 }}>
                      Pay directly to the store UPI QR. Instant confirmation with zero extra fees.
                    </span>

                    {/* Expandable UPI Box */}
                    {payment === "upi" && (
                      <div style={{ marginTop: 16, padding: 16, background: "white", borderRadius: 10, border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-gray)", textTransform: "uppercase" }}>Scan with Any UPI App</span>
                          
                          {/* Live Dynamic QR code image */}
                          <div style={{ padding: 8, background: "white", borderRadius: 10, border: "2px solid #e2e8f0", display: "inline-block" }}>
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayUrl)}`} 
                              alt="UPI QR Code" 
                              style={{ width: 180, height: 180, display: "block" }} 
                            />
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>UPI ID: {STORE_CONFIG.upiId}</span>
                            <button 
                              type="button" 
                              onClick={copyUpiId} 
                              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--primary)", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700 }}
                            >
                              {copiedUpi ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                              {copiedUpi ? "Copied!" : "Copy"}
                            </button>
                          </div>

                          {/* Direct mobile UPI Intent Button */}
                          <a 
                            href={upiPayUrl} 
                            style={{ 
                              display: "inline-flex", alignItems: "center", gap: 6, 
                              background: "#4f46e5", color: "white", textDecoration: "none", 
                              fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 8 
                            }}
                          >
                            <span>Open GPay / PhonePe App</span>
                            <ExternalLink size={14} />
                          </a>

                          <div style={{ width: "100%", marginTop: 8 }}>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-gray)", marginBottom: 4, textAlign: "left" }}>
                              UPI Transaction ID / UTR (Optional)
                            </label>
                            <input 
                              className="mm-input" 
                              placeholder="e.g. 4392XXXXXXXX" 
                              value={utrNumber} 
                              onChange={(e) => setUtrNumber(e.target.value)} 
                              style={{ fontSize: 13 }} 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* 3. Store Credit / Khata */}
                <label style={{ 
                  display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, cursor: 'pointer', 
                  border: payment === 'khata' ? '2px solid var(--primary)' : '1px solid var(--border)', 
                  borderRadius: 12, background: payment === 'khata' ? '#f5f3ff' : 'var(--surface)' 
                }}>
                  <input type="radio" name="payment" checked={payment === "khata"} onChange={() => setPayment("khata")} style={{ marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <BookOpen size={18} color="#d97706" />
                        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-dark)" }}>Store Credit Ledger (Monthly Account)</span>
                      </div>
                      <span style={{ background: "#fef3c7", color: "#b45309", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>Trust Based</span>
                    </div>
                    <span style={{ fontSize: 13, color: "var(--text-gray)", display: "block", marginTop: 4 }}>
                      For registered neighborhood families. Charged directly to your store credit ledger account.
                    </span>
                  </div>
                </label>

              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                <button 
                  type="button"
                  className="mm-btn-primary" 
                  style={{ width: '100%', padding: '16px', fontSize: 16, fontWeight: 700 }} 
                  disabled={placing} 
                  onClick={() => placeOrder(false)}
                >
                  {placing ? "Placing Pickup Order..." : `Confirm Pickup Order • ${money(total)}`}
                </button>

                <button 
                  type="button"
                  onClick={() => placeOrder(true)}
                  disabled={placing}
                  style={{ 
                    width: '100%', padding: '14px', fontSize: 15, fontWeight: 700,
                    background: "#25D366", color: "white", border: "none", borderRadius: "var(--radius-sm)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 2px 8px rgba(37, 211, 102, 0.25)"
                  }}
                >
                  <MessageSquare size={18} />
                  <span>Order & Send on WhatsApp directly</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Right Column - Price Details */}
      <div>
        <div className="mm-block" style={{ position: "sticky", top: 100, padding: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 16, color: "var(--text-dark)" }}>Order Summary</h3>
          
          <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 16, paddingRight: 4 }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, fontSize: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{item.emoji}</span>
                  <span style={{ color: "var(--text-dark)", fontWeight: 500 }}>{item.name} <span style={{ color: "var(--text-gray)", fontSize: 12 }}>x{item.qty}</span></span>
                </div>
                <span style={{ fontWeight: 600, color: "var(--text-dark)" }}>{money(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: "var(--text-gray)" }}>
            <span>Total Items</span>
            <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{cartItems.reduce((s, i) => s + i.qty, 0)}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: "var(--text-gray)" }}>
            <span>Pickup Service</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>FREE (No Fee)</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 20, color: 'var(--text-dark)', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
            <span>Total Payable</span>
            <span>{money(total)}</span>
          </div>

          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-gray)", justifyContent: "center" }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>Store Pickup • Pack & Ready in {STORE_CONFIG.pickupTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

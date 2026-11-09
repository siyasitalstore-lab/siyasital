import React, { useMemo, useState } from "react";
import { FileText, Camera, Zap, ShieldCheck, ArrowRight, Clock, MessageSquare } from "lucide-react";
import { CATEGORIES, STORE_CONFIG, getWhatsAppUrl } from "../../data/store";
import Carousel from "../../components/Carousel";
import ProductCard from "../../components/ProductCard";
import ParchiModal from "../../components/ParchiModal";

export default function CustomerView({ products, cart, changeQty, banners, searchQuery, user, onParchiOrder }) {
  const [parchiOpen, setParchiOpen] = useState(false);

  const allCategories = useMemo(() => {
    const cats = new Set(CATEGORIES);
    products.forEach(p => cats.add(p.category));
    return Array.from(cats);
  }, [products]);

  const filteredCategories = allCategories.filter(cat => {
    if (!searchQuery) return true;
    const catProducts = products.filter(p => p.category === cat && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return catProducts.length > 0;
  });

  return (
    <div style={{ padding: '24px 20px' }}>
      
      <div style={{ maxWidth: 1248, margin: "0 auto", paddingBottom: 60 }}>
        
        {/* Top Trust Bar */}
        <div style={{ 
          background: "linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)", 
          color: "white", padding: "12px 20px", borderRadius: 12, marginBottom: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🏪</span>
            <div>
              <strong style={{ fontSize: 15, display: "block" }}>{STORE_CONFIG.name} — {STORE_CONFIG.tagline}</strong>
              <span style={{ fontSize: 12, opacity: 0.9 }}>Order online & pick up ready in {STORE_CONFIG.pickupTime} • No waiting in line at counter</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a 
              href={getWhatsAppUrl(STORE_CONFIG.whatsappNumber, `Hello! I would like to order groceries from ${STORE_CONFIG.name} for store pickup.`)} 
              target="_blank" 
              rel="noreferrer"
              style={{ 
                background: "#25D366", color: "white", textDecoration: "none", 
                fontSize: 13, fontWeight: 700, padding: "8px 14px", borderRadius: 8,
                display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}
            >
              <MessageSquare size={16} />
              <span>WhatsApp Store</span>
            </a>
          </div>
        </div>

        <Carousel banners={banners} />

        {/* Highlight Banner: Grocery List Slip Order */}
        <div style={{ 
          margin: "28px 0", 
          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", 
          border: "2px dashed #f59e0b", 
          borderRadius: 16, 
          padding: "24px 28px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          flexWrap: "wrap", 
          gap: 20,
          boxShadow: "0 4px 16px rgba(245, 158, 11, 0.12)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, maxWidth: 680 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "#fef3c7", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
              📝
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ background: "#f59e0b", color: "white", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6, textTransform: "uppercase" }}>Quick Order</span>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#78350f" }}>No time to browse? Upload your Grocery Slip!</h3>
              </div>
              <p style={{ margin: 0, color: "#92400e", fontSize: 14, lineHeight: 1.5 }}>
                Take a photo of your handwritten grocery list or type items directly. Our store team will pack it ready for counter pickup in 10–15 minutes.
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setParchiOpen(true)}
            style={{ 
              background: "#d97706", color: "white", border: "none", borderRadius: 12,
              padding: "14px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)"
            }}
          >
            <Camera size={18} />
            <span>Upload Grocery Slip</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Empty Catalog or Search Results Section */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px 24px', color: 'var(--text-gray)', background: 'var(--surface)', marginTop: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 28 }}>
              📦
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 8px 0' }}>Store Catalog is Ready</h2>
            <p style={{ maxWidth: 460, margin: '0 auto 24px', fontSize: 15, lineHeight: 1.5 }}>
              All sample items have been removed. The store owner can now add real grocery items and multi-variants from the Admin Panel.
            </p>
            <button 
              type="button" 
              onClick={() => setParchiOpen(true)}
              className="mm-btn-primary" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, fontSize: 14 }}
            >
              <Camera size={16} /> Place Order via Grocery Slip
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-gray)', background: 'var(--surface)', marginTop: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 24, color: 'var(--text-dark)', marginBottom: 8 }}>Sorry, no results found!</h2>
            <p>Please check the spelling or try searching for something else</p>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const categoryProducts = products.filter((p) => p.category === cat && p.name.toLowerCase().includes((searchQuery || "").toLowerCase()));
            if (categoryProducts.length === 0) return null;
            
            return (
              <section key={cat} id={cat} style={{ margin: '32px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 24, color: 'var(--text-dark)', margin: 0 }}>{cat}</h2>
                  <button style={{ background: 'transparent', color: 'var(--primary)', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>See all →</button>
                </div>
                
                <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', margin: '0 -10px', padding: '0 10px 20px 10px' }}>
                  {categoryProducts.map((p) => (
                    <div key={p.id} style={{ minWidth: 200, width: 200 }}>
                      <ProductCard 
                        product={p} 
                        cart={cart}
                        onChange={(cartKey, d) => changeQty(cartKey, d)} 
                      />
                    </div>
                  ))}
                </div>
              </section>
            )
          })
        )}

        {/* Floating Quick Action Button for Parchi Order */}
        <button 
          type="button"
          onClick={() => setParchiOpen(true)}
          style={{ 
            position: "fixed", bottom: 24, right: 24, zIndex: 90,
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            color: "white", border: "none", borderRadius: 99, padding: "12px 20px",
            fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 6px 20px rgba(217, 119, 6, 0.4)", cursor: "pointer",
            transition: "transform 0.2s"
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: 18 }}>📝</span>
          <span>Upload Slip</span>
        </button>

      </div>

      {/* Parchi Modal */}
      <ParchiModal 
        isOpen={parchiOpen} 
        onClose={() => setParchiOpen(false)} 
        user={user} 
        onOrderSubmitted={onParchiOrder} 
      />

    </div>
  );
}

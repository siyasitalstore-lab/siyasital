import React, { useState } from "react";
import { Plus, Minus, Layers } from "lucide-react";
import { LOW_STOCK, money } from "../data/store";

export default function ProductCard({ product, cart = {}, onChange }) {
  const hasVariants = Boolean(product.hasVariants && product.variants && product.variants.length > 0);
  
  const [selectedVariantId, setSelectedVariantId] = useState(
    hasVariants ? product.variants[0].id : null
  );

  const selectedVariant = hasVariants
    ? product.variants.find((v) => v.id === selectedVariantId) || product.variants[0]
    : null;

  const currentPrice = hasVariants ? selectedVariant.price : product.price;
  const currentStock = hasVariants ? selectedVariant.stock : product.stock;
  const currentUnit = hasVariants ? (selectedVariant.unit || selectedVariant.name) : product.unit;

  const cartKey = hasVariants ? `${product.id}__${selectedVariant.id}` : product.id;
  const currentQty = cart[cartKey] || 0;
  const outOfStock = currentStock <= 0;

  return (
    <div className="fk-card" style={{ opacity: outOfStock ? 0.65 : 1, filter: outOfStock ? 'grayscale(0.4)' : 'none', position: 'relative' }}>
      
      {outOfStock && (
        <div style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, zIndex: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Out of Stock
        </div>
      )}

      {hasVariants && (
        <div style={{ position: 'absolute', top: 10, left: 10, background: '#f59e0b', color: 'white', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4, zIndex: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Layers size={10} />
          <span>{product.variants.length} Sizes</span>
        </div>
      )}

      <div className="fk-card-image-wrap">
        {product.image ? (
          <img src={product.image} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <div style={{ fontSize: 60 }}>{product.emoji || "📦"}</div>
        )}
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="fk-card-name" title={product.name}>{product.name}</div>
        
        {/* Variant Selector or Standard Unit */}
        {hasVariants ? (
          <div style={{ margin: "6px 0 10px 0" }}>
            <select 
              value={selectedVariant.id}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              style={{
                width: "100%", padding: "5px 8px", fontSize: 12, fontWeight: 700,
                border: "1px solid var(--border)", borderRadius: 6,
                background: "#f8fafc", color: "var(--text-dark)", cursor: "pointer", outline: "none"
              }}
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name || v.unit} — {money(v.price)} {v.stock <= 0 ? "(Out of Stock)" : ""}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="fk-card-unit">{currentUnit}</div>
        )}
        
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 8 }}>
          <div>
            <div className="fk-card-price">{money(currentPrice)}</div>
            {currentStock <= LOW_STOCK && !outOfStock && (
              <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2, fontWeight: 600 }}>
                Only {currentStock} left
              </div>
            )}
            {outOfStock && (
              <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2, fontWeight: 600 }}>
                Out of stock
              </div>
            )}
          </div>
          
          <div style={{ width: 80 }}>
            {currentQty === 0 ? (
              <button 
                type="button"
                style={{ 
                  width: '100%', background: 'var(--primary)', color: 'white', border: 'none', 
                  padding: '6px 0', fontWeight: 700, fontSize: 13, borderRadius: 'var(--radius-sm)', cursor: outOfStock ? 'not-allowed' : 'pointer',
                  opacity: outOfStock ? 0.5 : 1, transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
                }} 
                disabled={outOfStock} 
                onClick={() => onChange(cartKey, 1)}
              >
                ADD
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--primary)', borderRadius: 'var(--radius-sm)', padding: '4px', width: '100%', justifyContent: 'space-between', color: 'white', boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)' }}>
                <button 
                  type="button" 
                  onClick={() => onChange(cartKey, -1)} 
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}
                >
                  <Minus size={15} />
                </button>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{currentQty}</span>
                <button 
                  type="button" 
                  onClick={() => onChange(cartKey, 1)} 
                  disabled={currentQty >= currentStock} 
                  style={{ background: 'transparent', border: 'none', cursor: currentQty >= currentStock ? 'not-allowed' : 'pointer', color: 'white', display: 'flex', alignItems: 'center', opacity: currentQty >= currentStock ? 0.5 : 1 }}
                >
                  <Plus size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

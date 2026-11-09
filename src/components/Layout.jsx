import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, ChevronDown, User, Store, LogIn, LayoutGrid, ShieldCheck, Moon, Sun, Mic, MicOff, MessageSquare } from 'lucide-react';
import { CATEGORIES, POLICIES, STORE_CONFIG, getWhatsAppUrl } from '../data/store';
import CartDrawer from './CartDrawer';

export default function Layout({ 
  theme, toggleTheme, user, products = [], onLogout, 
  cartItems, cartCount, subtotal, changeQty, onCheckoutClick, 
  searchQuery, setSearchQuery 
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported by your browser. Please use Google Chrome.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "hi-IN"; // Supports Hindi & Indian accents
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleCategoryClick = (cat) => {
    if (location.pathname !== "/") {
      navigate("/");
    }
    setTimeout(() => {
      document.getElementById(cat)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const allCategories = React.useMemo(() => {
    const cats = new Set(CATEGORIES);
    products.forEach(p => cats.add(p.category));
    return Array.from(cats);
  }, [products]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Modern Navbar */}
      <nav className="fk-navbar">
        <div style={{ maxWidth: 1248, width: '100%', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 32 }}>
          
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: 8, borderRadius: 12 }}>
              <ShoppingCart size={20} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>MohallaMart</span>
          </Link>

          <div style={{ flex: 1, maxWidth: 600, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              className="fk-search-input" 
              placeholder={isListening ? "Listening... Speak your grocery items..." : "Search for groceries, milk, snacks, flour..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingRight: 48, borderColor: isListening ? '#ef4444' : undefined }}
            />
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
            
            <button 
              type="button"
              onClick={handleVoiceSearch}
              title="Speak to Search (Voice Search)"
              style={{ 
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: isListening ? '#fee2e2' : '#f1f5f9', border: 'none', borderRadius: '50%',
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: isListening ? '#ef4444' : 'var(--primary)',
                animation: isListening ? 'pulse 1.5s infinite' : 'none'
              }}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'center', color: 'var(--text-dark)' }}>
            
            <button onClick={toggleTheme} className="mm-iconbtn" title="Toggle Theme" style={{ width: 36, height: 36 }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {!user ? (
              <Link to="/login"><button className="fk-login-btn">Log In</button></Link>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  {user.name.charAt(0)}
                </div>
                {user.name}
              </div>
            )}

            {(!user || user.role === 'customer') && (
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, background: '#f1f5f9', padding: '8px 16px', borderRadius: 99 }} onClick={() => setCartOpen(true)}>
                <div style={{ position: 'relative' }}>
                  <ShoppingCart size={20} style={{ color: 'var(--primary)' }} />
                  {cartCount > 0 && (
                    <span style={{ position: 'absolute', top: -6, right: -10, background: 'var(--secondary)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>
                      {cartCount}
                    </span>
                  )}
                </div>
                Cart
              </div>
            )}

            {user?.role === 'manager' && <Link to="/manager" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}><LayoutGrid size={18}/> Manager</Link>}
            {user?.role === 'admin' && <Link to="/admin" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}><ShieldCheck size={18}/> Admin</Link>}
            {user && <button onClick={onLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-gray)' }}>Logout</button>}

          </div>
        </div>
      </nav>

      {/* Modern Category Bubbles */}
      {location.pathname === '/' && (
        <div style={{ background: 'white', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ maxWidth: 1248, margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '0 20px', overflowX: 'auto', gap: 16, scrollbarWidth: 'none' }}>
            {allCategories.map((cat, i) => {
              const colors = ['#fee2e2', '#dbeafe', '#fef3c7', '#e0e7ff', '#fce7f3'];
              const color = colors[i % colors.length];
              return (
                <div key={cat} onClick={() => handleCategoryClick(cat)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: 8, minWidth: 70 }}>
                  <div style={{ width: 56, height: 56, background: color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                    {cat === 'Chips & Namkeen' ? '🥔' : cat === 'Cold Drinks' ? '🥤' : cat === 'Bakery & Cakes' ? '🍰' : cat === 'Ice Cream' ? '🍦' : '🛍️'}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', textAlign: 'center', lineHeight: 1.2 }}>{cat}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '60px 20px', marginTop: 'auto' }}>
        <div style={{ maxWidth: 1248, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: 6, borderRadius: 8 }}>
                <ShoppingCart size={16} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>MohallaMart</span>
            </div>
            <p style={{ color: 'var(--text-gray)', fontSize: 14 }}>Your neighborhood grocery store, packed and ready for pickup in 10–15 minutes.</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-dark)', fontSize: 16, marginBottom: 16 }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <Link to="/about" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>About Us</Link>
              <Link to="/contact" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>Contact</Link>
              <Link to="/feedback" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>Feedback</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-dark)', fontSize: 16, marginBottom: 16 }}>Legal Policies</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              {Object.keys(POLICIES).map(p => (
                <Link key={p} to={`/policy/${p}`} style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>{POLICIES[p].title}</Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1248, margin: '40px auto 0', borderTop: '1px solid var(--border)', paddingTop: 24, fontSize: 14, textAlign: 'center', color: 'var(--text-gray)' }}>
          © 2026 MohallaMart Technologies
        </div>
      </footer>

      {cartOpen && (
        <CartDrawer 
          items={cartItems} 
          subtotal={subtotal} 
          onClose={() => setCartOpen(false)} 
          onChange={changeQty} 
          onCheckout={() => {
            setCartOpen(false);
            onCheckoutClick();
          }} 
        />
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Search, ChevronDown, User, Store, LogIn, 
  LayoutGrid, ShieldCheck, Moon, Sun, Mic, MicOff, MessageSquare, 
  Home, FileText, Menu, X, Sparkles, LogOut
} from 'lucide-react';
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
      
      {/* Desktop Navbar */}
      <nav className="fk-navbar desktop-only">
        <div style={{ maxWidth: 1248, width: '100%', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 32 }}>
          
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: 8, borderRadius: 12 }}>
              <ShoppingCart size={20} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>SiyasitalStore</span>
          </Link>

          <div style={{ flex: 1, maxWidth: 600, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              className="fk-search-input" 
              placeholder={isListening ? "Listening... Speak your grocery items..." : "Search groceries, milk, snacks, flour..."} 
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

          <div style={{ display: 'flex', gap: 20, alignItems: 'center', color: 'var(--text-dark)' }}>
            
            <button onClick={toggleTheme} className="mm-iconbtn" title="Toggle Theme" style={{ width: 36, height: 36 }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {!user ? (
              <Link to="/login"><button className="fk-login-btn">Log In</button></Link>
            ) : (
              <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  {user.name.charAt(0)}
                </div>
                {user.name}
              </Link>
            )}

            {(!user || user.role === 'customer') && (
              <div 
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, background: '#f1f5f9', padding: '8px 16px', borderRadius: 99 }} 
                onClick={() => setCartOpen(true)}
              >
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

            {user?.role === 'manager' && (
              <Link to="/manager" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}>
                <LayoutGrid size={18}/> Manager
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}>
                <ShieldCheck size={18}/> Admin
              </Link>
            )}
            {user && (
              <button onClick={onLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-gray)' }}>
                Logout
              </button>
            )}

          </div>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header className="mobile-only" style={{ flexDirection: 'column', background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, padding: '10px 14px', gap: 10 }}>
        {/* Top Row: Brand & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: 6, borderRadius: 10, display: 'flex' }}>
              <ShoppingCart size={18} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>SiyasitalStore</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={toggleTheme} className="mm-iconbtn" title="Toggle Theme" style={{ width: 34, height: 34, background: 'var(--bg-color)' }}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {(!user || user.role === 'customer') && (
              <div 
                style={{ position: 'relative', cursor: 'pointer', background: 'var(--bg-color)', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart size={18} style={{ color: 'var(--primary)' }} />
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--secondary)', color: 'white', fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cartCount}
                  </span>
                )}
              </div>
            )}

            {!user ? (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button className="fk-login-btn" style={{ padding: '6px 14px', fontSize: 13 }}>Login</button>
              </Link>
            ) : (
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                  {user.name.charAt(0)}
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Bottom Row: Full-width Mobile Search Bar with Voice */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
          <input 
            type="text" 
            className="fk-search-input" 
            placeholder={isListening ? "Listening... Speak items..." : "Search groceries, milk, snacks..."} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              paddingLeft: 38, 
              paddingRight: 42, 
              height: 40, 
              fontSize: 14,
              borderColor: isListening ? '#ef4444' : undefined 
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
          
          <button 
            type="button"
            onClick={handleVoiceSearch}
            title="Speak to Search"
            style={{ 
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: isListening ? '#fee2e2' : '#f1f5f9', border: 'none', borderRadius: '50%',
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: isListening ? '#ef4444' : 'var(--primary)',
              animation: isListening ? 'pulse 1.5s infinite' : 'none'
            }}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
        </div>
      </header>

      {/* Modern Category Bubbles */}
      {location.pathname === '/' && (
        <div style={{ background: 'var(--surface)', padding: '12px 0', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          <div style={{ maxWidth: 1248, margin: '0 auto', display: 'flex', padding: '0 16px', overflowX: 'auto', gap: 14, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {allCategories.map((cat, i) => {
              const colors = ['#fee2e2', '#dbeafe', '#fef3c7', '#e0e7ff', '#fce7f3'];
              const color = colors[i % colors.length];
              return (
                <div key={cat} onClick={() => handleCategoryClick(cat)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: 6, minWidth: 64, flexShrink: 0 }}>
                  <div style={{ width: 50, height: 50, background: color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, transition: 'transform 0.2s' }}>
                    {cat === 'Chips & Namkeen' ? '🥔' : cat === 'Cold Drinks' ? '🥤' : cat === 'Bakery & Cakes' ? '🍰' : cat === 'Ice Cream' ? '🍦' : '🛍️'}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dark)', textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{cat}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '40px 20px', marginTop: 'auto' }}>
        <div style={{ maxWidth: 1248, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: 6, borderRadius: 8 }}>
                <ShoppingCart size={16} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>SiyasitalStore</span>
            </div>
            <p style={{ color: 'var(--text-gray)', fontSize: 13, lineHeight: 1.5 }}>
              Your friendly neighborhood grocery store. Order items or grocery slips for fast counter pickup in 10–15 minutes.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-dark)', fontSize: 15, marginBottom: 12 }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <Link to="/" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>Home Store</Link>
              <Link to="/dashboard" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>Order History & Account</Link>
              <Link to="/feedback" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>Feedback & Ratings</Link>
              <Link to="/contact" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>Contact & Store Hours</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-dark)', fontSize: 15, marginBottom: 12 }}>Store Policies</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              {Object.keys(POLICIES).map(p => (
                <Link key={p} to={`/policy/${p}`} style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>{POLICIES[p].title}</Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1248, margin: '30px auto 0', borderTop: '1px solid var(--border)', paddingTop: 18, fontSize: 13, textAlign: 'center', color: 'var(--text-gray)' }}>
          © 2026 SiyasitalStore Technologies • 100% Store Counter Pickup
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </Link>

        {(!user || user.role === 'customer') && (
          <button 
            type="button" 
            className="mobile-nav-item" 
            onClick={() => setCartOpen(true)}
            style={{ position: 'relative' }}
          >
            <div style={{ position: 'relative' }}>
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span style={{ 
                  position: 'absolute', top: -5, right: -10, 
                  background: 'var(--secondary)', color: 'white', 
                  fontSize: 10, fontWeight: 700, padding: '1px 5px', 
                  borderRadius: 10 
                }}>
                  {cartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </button>
        )}

        <Link to="/dashboard" className={`mobile-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <User size={20} />
          <span>{user ? "My Orders" : "Account"}</span>
        </Link>

        {user?.role === 'manager' && (
          <Link to="/manager" className={`mobile-nav-item ${location.pathname === '/manager' ? 'active' : ''}`}>
            <LayoutGrid size={20} />
            <span>Manager</span>
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link to="/admin" className={`mobile-nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
            <ShieldCheck size={20} />
            <span>Admin</span>
          </Link>
        )}

        {!user ? (
          <Link to="/login" className={`mobile-nav-item ${location.pathname === '/login' ? 'active' : ''}`}>
            <LogIn size={20} />
            <span>Login</span>
          </Link>
        ) : (
          <button 
            type="button" 
            className="mobile-nav-item" 
            onClick={onLogout}
            style={{ color: '#ef4444' }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        )}
      </nav>

      {/* Slide-in Cart Drawer */}
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

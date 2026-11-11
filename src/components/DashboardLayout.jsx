import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LayoutGrid, LogOut, Store, Sun, Moon, Menu, X } from 'lucide-react';

export default function DashboardLayout({ 
  theme, toggleTheme, user, onLogout, title, children, 
  sidebarItems, activeTab, onTabChange 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleTabClick = (id) => {
    onTabChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-color)' }}>
      
      {/* Mobile Top Header */}
      <div 
        className="mobile-only" 
        style={{ 
          background: '#0f172a', 
          color: 'white', 
          padding: '12px 16px', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 90,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button 
            type="button" 
            onClick={() => setMobileMenuOpen(true)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Open Menu"
          >
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: 6, borderRadius: 8, display: 'flex' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>SiyasitalStore</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{title} Panel</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button 
            onClick={toggleTheme}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button 
            onClick={() => navigate('/')}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Back to Store"
          >
            <Store size={16} />
          </button>

          <button 
            onClick={onLogout}
            style={{ background: '#ef4444', border: 'none', color: 'white', borderRadius: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        
        {/* Desktop Sidebar */}
        <aside 
          className="desktop-only" 
          style={{ 
            width: 270, 
            background: '#0f172a', 
            color: 'white', 
            flexDirection: 'column',
            flexShrink: 0
          }}
        >
          {/* Brand */}
          <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: 8, borderRadius: 12, display: 'flex' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>SiyasitalStore</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{title} Panel</div>
            </div>
          </div>

          {/* User Info */}
          <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>Logged In As</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', textTransform: 'capitalize' }}>{user?.role}</div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ padding: '20px 16px', flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 8 }}>Menu</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                    color: activeTab === item.id ? 'white' : '#cbd5e1',
                    fontWeight: 600, fontSize: 14, transition: 'all 0.15s',
                    textAlign: 'left'
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button 
              onClick={toggleTheme}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} Toggle Theme
            </button>
            <button 
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              <Store size={16} /> Back to Store
            </button>
            <button 
              onClick={onLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        {/* Mobile Off-Canvas Drawer Backdrop */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(3px)',
              zIndex: 998
            }}
          />
        )}

        {/* Mobile Off-Canvas Drawer */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            width: '82%',
            maxWidth: 320,
            background: '#0f172a',
            color: 'white',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.25s ease-in-out',
            pointerEvents: mobileMenuOpen ? 'auto' : 'none',
            boxShadow: mobileMenuOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none'
          }}
        >
          {/* Drawer Header */}
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: 6, borderRadius: 8, display: 'flex' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>SiyasitalStore</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{title} Menu</div>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: 8, padding: 6, display: 'flex', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* User Details */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Signed In</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', textTransform: 'capitalize' }}>{user?.role}</div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                    color: activeTab === item.id ? 'white' : '#cbd5e1',
                    fontWeight: 600, fontSize: 14, textAlign: 'left', width: '100%'
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button 
              onClick={() => { setMobileMenuOpen(false); navigate('/'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              <Store size={16} /> Back to Store
            </button>
            <button 
              onClick={onLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: '#f8fafc' }}>
          {children}
        </main>

      </div>
    </div>
  );
}

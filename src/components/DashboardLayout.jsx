import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LayoutGrid, LogOut, Store, Sun, Moon } from 'lucide-react';

export default function DashboardLayout({ theme, toggleTheme, user, onLogout, title, children, sidebarItems, activeTab, onTabChange }) {
  const navigate = useNavigate();
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <div style={{ width: 280, background: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column' }}>
        
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
        <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>Logged In As</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: '#cbd5e1' }}>{user?.role}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ padding: 24, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>Menu</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: activeTab === item.id ? 'var(--primary)' : 'transparent',
                  color: activeTab === item.id ? 'white' : '#cbd5e1',
                  fontWeight: 600, fontSize: 15, transition: 'all 0.2s',
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
        <div style={{ padding: 24, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button 
            onClick={toggleTheme}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} Toggle Theme
          </button>
          <button 
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            <Store size={18} /> Back to Store
          </button>
          <button 
            onClick={onLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
        {children}
      </div>
    </div>
  );
}

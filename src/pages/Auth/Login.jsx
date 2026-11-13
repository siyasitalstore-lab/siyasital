import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, Shield, Lock, Mail, Phone, User, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { getSupabaseConfig, fetchSupabaseStaff } from '../../lib/supabase';

export default function Login({ user, onLogin, customers = [], updateCustomers, staff = [], adminAuth = {} }) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanId = loginId.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass || (isSignUp && !name.trim())) {
      setError("Please fill in all required fields.");
      return;
    }

    // ----------------------------------------------------
    // 1. SIGN IN FLOW (Strict Authentication from Database)
    // ----------------------------------------------------
    if (!isSignUp) {
      let currentStaff = staff;
      let currentAdmin = adminAuth;

      // When Supabase is connected, check real-time cloud credentials from database
      if (getSupabaseConfig().isConfigured) {
        try {
          const freshStaff = await fetchSupabaseStaff();
          if (freshStaff && freshStaff.length > 0) {
            const freshAdmin = freshStaff.find(s => s.id === 'admin_master' || (s.role || '').toLowerCase() === 'admin');
            if (freshAdmin && freshAdmin.email && freshAdmin.password) {
              currentAdmin = {
                email: freshAdmin.email,
                password: freshAdmin.password,
                name: freshAdmin.name || "Master Admin"
              };
            }
            currentStaff = freshStaff.filter(s => s.id !== 'admin_master' && (s.role || '').toLowerCase() !== 'admin');
          }
        } catch (err) {
          console.warn("Supabase auth sync:", err);
        }
      }

      const activeEmail = ((currentAdmin?.email || "").trim() || "admin@siyasitalstore.com").toLowerCase();
      const activePassword = (currentAdmin?.password || "").trim();

      // A. Check Master Admin Credentials strictly from Database
      const isAdminIdentifier = 
        cleanId === activeEmail ||
        cleanId === "admin" ||
        (currentAdmin?.email && cleanId === currentAdmin.email.toLowerCase().trim()) ||
        (currentAdmin?.name && cleanId === currentAdmin.name.toLowerCase().trim());

      if (isAdminIdentifier) {
        // STRICT DATABASE CHECK: Only the password stored in database/adminAuth is accepted!
        if (!activePassword || cleanPass !== activePassword) {
          setError("Invalid username, email or password.");
          return;
        }
        const adminUser = {
          id: "admin_master",
          name: (currentAdmin?.name || "").trim() || "Master Admin",
          email: activeEmail,
          role: "admin"
        };
        onLogin(adminUser);
        setTimeout(() => {
          navigate('/admin');
        }, 60);
        return;
      }

      // B. Check Manager Credentials strictly from Database
      const cleanPhoneDigits = cleanId.replace(/\D/g, '');
      const manager = currentStaff.find(s => {
        const sEmail = (s.email || "").toLowerCase().trim();
        const sPhoneDigits = (s.phone || "").replace(/\D/g, '');
        return sEmail === cleanId || (cleanPhoneDigits.length >= 10 && sPhoneDigits === cleanPhoneDigits);
      });

      if (manager) {
        if (manager.active === false) {
          setError("This account has been deactivated. Please contact the administrator.");
          return;
        }
        if (cleanPass !== (manager.password || "").trim()) {
          setError("Invalid username, email or password.");
          return;
        }
        const managerUser = {
          id: manager.id,
          name: manager.name,
          email: manager.email,
          phone: manager.phone,
          role: (manager.role || "Manager").toLowerCase()
        };
        onLogin(managerUser);
        setTimeout(() => {
          navigate('/manager');
        }, 60);
        return;
      }

      // C. Check Customer Credentials
      const customer = customers.find(c => {
        const cEmail = (c.email || "").toLowerCase().trim();
        const cPhoneDigits = (c.phone || "").replace(/\D/g, '');
        return cEmail === cleanId || (cleanPhoneDigits.length >= 10 && cPhoneDigits === cleanPhoneDigits);
      });

      if (customer) {
        if (cleanPass !== (customer.password || "").trim()) {
          setError("Invalid username, email or password.");
          return;
        }
        onLogin(customer);
        setTimeout(() => {
          navigate('/');
        }, 60);
        return;
      }

      setError("Invalid username, email or password.");
      return;
    }

    // ----------------------------------------------------
    // 2. SIGN UP FLOW (Customer registration)
    // ----------------------------------------------------
    if (isSignUp) {
      if (cleanPass.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      if (cleanId === "admin" || cleanId.includes("admin@")) {
        setError("This identifier is reserved for store staff. Please sign in instead.");
        return;
      }

      if (customers.some(c => (c.email || "").toLowerCase().trim() === cleanId)) {
        setError("An account with this email already exists. Please sign in.");
        return;
      }

      const newCustomer = {
        id: `c_${Date.now()}`,
        name: name.trim(),
        email: cleanId,
        phone: phone.trim(),
        password: cleanPass,
        role: "customer",
        address: "",
        khataLimit: 3000,
        paymentHistory: [],
        manualEntries: []
      };

      if (updateCustomers) {
        updateCustomers([...customers, newCustomer]);
      }
      onLogin(newCustomer);
      setTimeout(() => {
        navigate('/');
      }, 60);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px 14px', background: 'var(--bg-color)' }}>
      
      {/* Back to Store Link */}
      <div style={{ width: '100%', maxWidth: 440, marginBottom: 14 }}>
        <Link 
          to="/" 
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 6, 
            color: 'var(--text-gray)', textDecoration: 'none', 
            fontSize: 14, fontWeight: 600, padding: '6px 4px' 
          }}
        >
          <ArrowLeft size={16} /> Back to Store
        </Link>
      </div>

      <div style={{ 
        maxWidth: 440, width: '100%', 
        background: 'var(--surface)', 
        borderRadius: 20, 
        border: '1px solid var(--border)',
        padding: 'clamp(24px, 5vw, 36px)', 
        textAlign: 'center', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)' 
      }}>
        
        {/* Header Icon */}
        <div style={{ 
          background: 'rgba(79, 70, 229, 0.1)', 
          width: 56, height: 56, borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 16px', color: 'var(--primary)' 
        }}>
          {isSignUp ? <UserPlus size={26} /> : <Shield size={26} />}
        </div>

        {/* If user is ALREADY signed in, show clean account portal shortcut instead of exposing credentials */}
        {user ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-dark)' }}>
              Already Signed In
            </h1>
            <p style={{ color: 'var(--text-gray)', fontSize: 14, margin: '0 0 20px 0' }}>
              You are currently signed in as <strong>{user.name}</strong> ({user.role?.toUpperCase()})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                type="button" 
                className="mm-btn-primary"
                onClick={() => navigate(user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/')}
                style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, borderRadius: 10, minHeight: 48 }}
              >
                Go to {user.role === 'admin' ? 'Admin Portal' : user.role === 'manager' ? 'Manager Counter' : 'Store'} →
              </button>
              <button 
                type="button" 
                onClick={() => {
                  try {
                    localStorage.removeItem('siyasital-active-user-v3');
                  } catch {}
                  window.location.reload();
                }}
                style={{ 
                  background: 'none', border: '1px solid var(--border)', borderRadius: 10, 
                  padding: '12px', fontSize: 13, fontWeight: 600, color: 'var(--text-gray)', cursor: 'pointer' 
                }}
              >
                Sign Out / Switch Account
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-dark)' }}>
              {isSignUp ? "Create Customer Account" : "Secure Sign In"}
            </h1>
            <p style={{ color: 'var(--text-gray)', fontSize: 14, margin: '0 0 22px 0' }}>
              {isSignUp 
                ? "Sign up for quick pickup orders and customer account" 
                : "Enter your credentials to access your account"}
            </p>

            {error && (
              <div style={{ 
                background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', 
                padding: '12px 14px', borderRadius: 10, marginBottom: 18, fontSize: 13, 
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Full Name (Sign Up only) */}
              {isSignUp && (
                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: 6, fontSize: 13, color: 'var(--text-dark)' }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      className="mm-input" 
                      placeholder="e.g. Ramesh Kumar" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={{ paddingLeft: 40 }}
                      required
                    />
                    <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                </div>
              )}

              {/* Username, Email or Phone */}
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: 6, fontSize: 13, color: 'var(--text-dark)' }}>
                  {isSignUp ? "Email Address *" : "Username, Email or Phone *"}
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={isSignUp ? "email" : "text"}
                    inputMode={isSignUp ? "email" : "text"}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete="username"
                    className="mm-input" 
                    placeholder={isSignUp ? "you@example.com" : "Enter username, email or mobile"} 
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                    style={{ paddingLeft: 40 }}
                    required
                  />
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>

              {/* Phone (Sign Up only) */}
              {isSignUp && (
                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: 6, fontSize: 13, color: 'var(--text-dark)' }}>
                    Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="tel" 
                      inputMode="numeric"
                      className="mm-input" 
                      placeholder="10-digit mobile number" 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      style={{ paddingLeft: 40 }}
                    />
                    <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                </div>
              )}

              {/* Password */}
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: 6, fontSize: 13, color: 'var(--text-dark)' }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    className="mm-input" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingLeft: 40, paddingRight: 44 }}
                    required
                  />
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ 
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 6 
                    }}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="mm-btn-primary" 
                style={{ marginTop: 8, width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, borderRadius: 10, minHeight: 48 }}
              >
                {isSignUp ? "Create Customer Account" : "Sign In to Portal"}
              </button>
            </form>

            {/* Switch between Sign In / Sign Up */}
            <div style={{ marginTop: 20, fontSize: 14, color: 'var(--text-gray)' }}>
              {isSignUp ? (
                <>Already have an account? <button type="button" onClick={() => { setIsSignUp(false); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Sign In</button></>
              ) : (
                <>Are you a customer? <button type="button" onClick={() => { setIsSignUp(true); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Create Account</button></>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

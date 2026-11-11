import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, Shield, Lock, Mail, Phone, User, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

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

  const adminEmail = ((adminAuth?.email || "").trim() || "admin@siyasitalstore.com").toLowerCase();
  const adminPassword = (adminAuth?.password || "").trim() || "admin@siyasital123";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanId = loginId.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass || (isSignUp && !name.trim())) {
      setError("Please fill in all required fields.");
      return;
    }

    // ----------------------------------------------------
    // 1. SIGN IN FLOW (Strict Authentication)
    // ----------------------------------------------------
    if (!isSignUp) {
      // A. Check Master Admin Credentials
      if (cleanId === adminEmail) {
        if (cleanPass !== adminPassword) {
          setError("Incorrect password for Master Admin account. (Check uppercase/lowercase letters)");
          return;
        }
        const adminUser = {
          id: "admin_master",
          name: (adminAuth?.name || "").trim() || "Master Admin",
          email: adminEmail,
          role: "admin"
        };
        onLogin(adminUser);
        navigate('/admin');
        return;
      }

      // B. Check Manager Credentials (only genuine managers created by Admin)
      const cleanPhoneDigits = cleanId.replace(/\D/g, '');
      const manager = staff.find(s => {
        const sEmail = (s.email || "").toLowerCase().trim();
        const sPhoneDigits = (s.phone || "").replace(/\D/g, '');
        return sEmail === cleanId || (cleanPhoneDigits.length >= 10 && sPhoneDigits === cleanPhoneDigits);
      });

      if (manager) {
        if (manager.active === false) {
          setError("This manager account has been deactivated by the Admin.");
          return;
        }
        if (cleanPass !== (manager.password || "").trim()) {
          setError("Incorrect password for Manager account.");
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
        navigate('/manager');
        return;
      }

      // C. Check Customer Credentials
      const customer = customers.find(c => {
        const cEmail = (c.email || "").toLowerCase().trim();
        const cPhoneDigits = (c.phone || "").replace(/\D/g, '');
        return cEmail === cleanId || (cleanPhoneDigits.length >= 10 && cPhoneDigits === cleanPhoneDigits);
      });

      if (customer) {
        if (customer.password && customer.password.trim() !== cleanPass) {
          setError("Incorrect password for customer account.");
          return;
        }
        onLogin({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: "customer"
        });
        navigate('/');
        return;
      }

      // D. Not recognized
      setError("Invalid credentials. Account not found with this email or phone.");
      return;
    }

    // ----------------------------------------------------
    // 2. SIGN UP FLOW (Customer Registration Only)
    // ----------------------------------------------------
    if (isSignUp) {
      if (cleanPass.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }

      // Disallow signing up with Admin or Manager emails
      if (cleanId === adminEmail || staff.some(s => (s.email || "").toLowerCase().trim() === cleanId)) {
        setError("This email is reserved for store staff. Please sign in instead.");
        return;
      }

      // Check if email already registered as customer
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
      navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px 14px', background: 'var(--bg-color)' }}>
      
      {/* Back to Store Link */}
      <div style={{ width: '100%', maxWidth: 460, marginBottom: 14 }}>
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
        maxWidth: 460, width: '100%', 
        background: 'var(--surface)', 
        borderRadius: 20, 
        border: '1px solid var(--border)',
        padding: 'clamp(22px, 5vw, 38px)', 
        textAlign: 'center', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)' 
      }}>
        
        {/* Header Icon */}
        <div style={{ 
          background: 'rgba(79, 70, 229, 0.1)', 
          width: 60, height: 60, borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 16px', color: 'var(--primary)' 
        }}>
          {isSignUp ? <UserPlus size={28} /> : <Shield size={28} />}
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-dark)' }}>
          {isSignUp ? "Create Customer Account" : "Store Sign In"}
        </h1>
        <p style={{ color: 'var(--text-gray)', fontSize: 14, margin: '0 0 24px 0' }}>
          {isSignUp 
            ? "Sign up for quick pickup orders and customer credit ledger" 
            : "Sign in with your Admin, Manager, or Customer credentials"}
        </p>

        {user && (user.role === 'admin' || user.role === 'manager') && (
          <div style={{ 
            background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', 
            padding: '12px 14px', borderRadius: 12, marginBottom: 18, fontSize: 13, 
            textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 
          }}>
            <span>Signed in as <strong>{user.name}</strong> ({user.role})</span>
            <button 
              type="button" 
              onClick={() => navigate(user.role === 'admin' ? '/admin' : '/manager')}
              style={{ 
                background: '#10b981', color: 'white', border: 'none', borderRadius: 8, 
                padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 
              }}
            >
              Open Panel →
            </button>
          </div>
        )}

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

          {/* Email or Phone */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: 6, fontSize: 13, color: 'var(--text-dark)' }}>
              {isSignUp ? "Email Address *" : "Email Address or Phone *"}
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={isSignUp ? "email" : "text"}
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="username"
                className="mm-input" 
                placeholder={isSignUp ? "you@example.com" : "admin@... or manager email / phone"} 
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
                Phone Number (for pickup SMS/WhatsApp)
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
                placeholder="Enter your password" 
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
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {isSignUp && (
              <span style={{ fontSize: 12, color: 'var(--text-gray)', marginTop: 4, display: 'block' }}>
                Minimum 6 characters
              </span>
            )}
          </div>

          <button 
            type="submit" 
            className="mm-btn-primary" 
            style={{ marginTop: 6, width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, borderRadius: 10, minHeight: 48 }}
          >
            {isSignUp ? "Create Customer Account" : "Sign In to Portal"}
          </button>
        </form>

        {/* Switch between Sign In / Sign Up */}
        <div style={{ marginTop: 22, fontSize: 14, color: 'var(--text-gray)' }}>
          {isSignUp ? (
            <>Already have an account? <button type="button" onClick={() => { setIsSignUp(false); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Sign In</button></>
          ) : (
            <>Are you a customer? <button type="button" onClick={() => { setIsSignUp(true); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Create Account</button></>
          )}
        </div>

      </div>
    </div>
  );
}

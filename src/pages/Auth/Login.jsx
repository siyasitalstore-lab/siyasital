import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login({ onLogin, customers = [], updateCustomers }) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all required fields.");
      return;
    }

    let user;
    if (!isSignUp && email.toLowerCase() === 'admin@mohallamart.com') {
      user = { id: 'u3', name: 'Admin User', role: 'admin', email };
      onLogin(user);
      navigate('/admin');
    } else if (!isSignUp && email.toLowerCase() === 'manager@mohallamart.com') {
      user = { id: 'u1', name: 'Ramesh Yadav', role: 'manager', email };
      onLogin(user);
      navigate('/manager');
    } else {
      if (isSignUp) {
        // Check if user already exists
        if (customers.find(c => c.email.toLowerCase() === email.toLowerCase())) {
          setError("User already exists with this email. Please sign in.");
          return;
        }
        user = { id: `c_${Date.now()}`, name, role: 'customer', email, phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' };
        if (updateCustomers) updateCustomers([...customers, user]);
      } else {
        // Find existing user
        user = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
        if (!user) {
          // Allow transient login for backward compatibility/demo
          user = { id: `c_${Date.now()}`, name: email.split('@')[0], role: 'customer', email, phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' };
          if (updateCustomers) updateCustomers([...customers, user]);
        }
      }
      onLogin(user);
      navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: 20 }}>
      <div className="mm-card" style={{ maxWidth: 450, width: '100%', padding: 40, textAlign: 'center' }}>
        <div style={{ background: '#f1f5f9', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
          {isSignUp ? <UserPlus size={32} /> : <LogIn size={32} />}
        </div>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>{isSignUp ? "Create an Account" : "Welcome back"}</h1>
        <p style={{ color: 'var(--text-gray)', marginBottom: 32 }}>
          {isSignUp ? "Enter your details to get started" : "Enter your details to continue"}
        </p>

        {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isSignUp && (
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Full Name</label>
              <input 
                type="text" 
                className="mm-input" 
                placeholder="John Doe" 
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Email Address</label>
            <input 
              type="email" 
              className="mm-input" 
              placeholder="you@example.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Password</label>
            <input 
              type="password" 
              className="mm-input" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="mm-btn-primary" style={{ marginTop: 8, width: '100%', padding: 16, fontSize: 16 }}>
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: 24, fontSize: 14, color: 'var(--text-gray)' }}>
          {isSignUp ? (
            <>Already have an account? <button onClick={() => setIsSignUp(false)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Sign In</button></>
          ) : (
            <>Don't have an account? <button onClick={() => setIsSignUp(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Sign Up</button></>
          )}
        </div>

        {!isSignUp && (
          <div style={{ marginTop: 24, fontSize: 13, color: 'var(--text-gray)', background: '#f8fafc', padding: 16, borderRadius: 8 }}>
            <strong>Demo Accounts:</strong><br/>
            Admin: <code>admin@mohallamart.com</code><br/>
            Manager: <code>manager@mohallamart.com</code><br/>
            Customer: <i>Any other email</i>
          </div>
        )}
      </div>
    </div>
  );
}

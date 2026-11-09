import React, { useState } from 'react';
import { MessageSquare, CheckCircle } from 'lucide-react';

export default function Feedback() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
        <CheckCircle size={64} color="var(--primary)" style={{ margin: '0 auto 24px' }} />
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>Thank You!</h1>
        <p style={{ color: 'var(--text-gray)', fontSize: 16 }}>Your feedback helps us improve Siyasital Store for everyone.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px' }}>
      <div className="mm-block" style={{ padding: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
          <div style={{ background: '#fef2f2', padding: 16, borderRadius: '50%', color: 'var(--primary)' }}>
            <MessageSquare size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: 28, margin: 0 }}>Feedback</h1>
            <p style={{ color: 'var(--text-gray)', margin: '4px 0 0 0' }}>Tell us what you love or what we can improve.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Rating</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" className="mm-option" style={{ padding: 12 }}>{n} ⭐</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Your Message</label>
            <textarea 
              className="mm-input" 
              rows="5" 
              placeholder="Write your feedback here..." 
              required 
              style={{ fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <button type="submit" className="mm-btn-primary" style={{ marginTop: 10 }}>Submit Feedback</button>
        </form>
      </div>
    </div>
  );
}

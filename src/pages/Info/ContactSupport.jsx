import React from 'react';
import { Phone, Mail, MapPin, LifeBuoy } from 'lucide-react';
import { STORE_CONFIG } from '../../data/store';

export default function ContactSupport() {
  return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <LifeBuoy size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: 36, margin: '0 0 12px 0' }}>Contact Support</h1>
        <p style={{ fontSize: 16, color: 'var(--text-gray)' }}>We're here to help you 7 days a week.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 40 }}>
        <div className="mm-card" style={{ textAlign: 'center', padding: 32 }}>
          <Phone size={32} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>Call & WhatsApp</h3>
          <p style={{ color: 'var(--text-gray)', margin: '0 0 16px 0', fontSize: 14 }}>Mon - Sun, 8am to 10pm</p>
          <a href={`tel:+${STORE_CONFIG.whatsappNumber}`} style={{ fontWeight: 700, color: 'var(--text-dark)', textDecoration: 'none', fontSize: 18 }}>{STORE_CONFIG.displayPhone}</a>
        </div>

        <div className="mm-card" style={{ textAlign: 'center', padding: 32 }}>
          <Mail size={32} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>Email Us</h3>
          <p style={{ color: 'var(--text-gray)', margin: '0 0 16px 0', fontSize: 14 }}>We reply within 2 hours</p>
          <a href="mailto:support@siyasitalstore.com" style={{ fontWeight: 700, color: 'var(--text-dark)', textDecoration: 'none', fontSize: 18 }}>support@siyasitalstore.com</a>
        </div>

        <div className="mm-card" style={{ textAlign: 'center', padding: 32 }}>
          <MapPin size={32} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>Visit Store</h3>
          <p style={{ color: 'var(--text-gray)', margin: '0 0 16px 0', fontSize: 14 }}>Pickups & Walk-ins</p>
          <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Shop 12, Main Market Road</div>
        </div>
      </div>
    </div>
  );
}

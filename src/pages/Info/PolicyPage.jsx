import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { POLICIES } from '../../data/store';

export default function PolicyPage() {
  const { policyId } = useParams();
  const policy = POLICIES[policyId];

  if (!policy) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <h2>Policy not found</h2>
        <Link to="/" className="mm-btn-secondary" style={{ display: 'inline-block', marginTop: 20, textDecoration: 'none' }}>Return Home</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-gray)', textDecoration: 'none', marginBottom: 24, fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back
      </Link>
      <div className="mm-block" style={{ padding: 50 }}>
        <h1 style={{ fontSize: 36, marginBottom: 30, color: 'var(--text-dark)' }}>{policy.title}</h1>
        <div style={{ fontSize: 16, lineHeight: 1.8, color: '#475569', whiteSpace: 'pre-wrap' }}>
          {policy.body}
          {'\n\n'}
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

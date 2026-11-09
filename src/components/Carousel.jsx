import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Carousel({ banners }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 4000); // Auto change every 4 seconds
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const nextSlide = () => setCurrent(current === banners.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? banners.length - 1 : current - 1);

  const activeBanner = banners[current];

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 1200, margin: '0 auto 16px', overflow: 'hidden', borderRadius: 'var(--radius-lg)', height: 300, background: '#0F172A', boxShadow: 'var(--shadow-md)' }}>
      {banners.map((b, i) => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            opacity: i === current ? 1 : 0,
            transition: 'opacity 0.6s ease-in-out',
            cursor: 'pointer'
          }}
          onClick={() => {
            const catEl = document.getElementById(b.link);
            if (catEl) catEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          <img src={b.image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
          <div style={{ position: 'absolute', bottom: 40, left: 40, color: 'white', maxWidth: '60%' }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{b.title}</h2>
            <span style={{ background: 'var(--primary)', padding: '8px 16px', borderRadius: 20, fontWeight: 600, fontSize: 14 }}>Shop Now →</span>
          </div>
        </div>
      ))}
      
      {banners.length > 1 && (
        <>
          <button className="mm-iconbtn" onClick={(e) => { e.stopPropagation(); prevSlide(); }} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', padding: 12 }}>
            <ChevronLeft size={24} />
          </button>
          <button className="mm-iconbtn" onClick={(e) => { e.stopPropagation(); nextSlide(); }} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', padding: 12 }}>
            <ChevronRight size={24} />
          </button>
          
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
            {banners.map((_, i) => (
              <div 
                key={i} 
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                style={{ 
                  width: i === current ? 24 : 8, height: 8, borderRadius: 4, 
                  background: i === current ? 'var(--primary)' : 'rgba(255,255,255,0.5)', 
                  transition: 'all 0.3s', cursor: 'pointer' 
                }} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

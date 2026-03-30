export default function CertifiedBadge({ size = 40 }) {
  return (
    <div
      title="Certifié MarchéduRoi — Vérifié / Verified by MarchéduRoi team"
      style={{ display:"inline-flex",flexDirection:"column",alignItems:"center",flexShrink:0,cursor:"help",gap:2 }}>
      <div style={{ filter:"drop-shadow(0 2px 6px rgba(67,198,172,0.5))" }}>
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hexagone fond vert */}
          <path d="M40 3 L70 20 L70 54 L40 71 L10 54 L10 20 Z"
            fill="url(#certGrad)" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="certGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#43C6AC"/>
              <stop offset="100%" stopColor="#1A8F7A"/>
            </linearGradient>
          </defs>
          {/* Coche blanche */}
          <polyline points="22,40 35,53 58,28"
            fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {size >= 32 && (
        <div style={{ textAlign:"center",lineHeight:1.2 }}>
          <div style={{ fontSize:Math.max(8, size*0.18),fontWeight:800,color:"#43C6AC",letterSpacing:0.5 }}>Vérifié</div>
          <div style={{ fontSize:Math.max(7, size*0.15),fontWeight:600,color:"#43C6AC",opacity:0.8,letterSpacing:0.3 }}>Verified</div>
        </div>
      )}
    </div>
  );
}

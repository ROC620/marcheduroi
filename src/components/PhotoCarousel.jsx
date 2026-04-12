import { useState } from "react";

export default function PhotoCarousel({ photos }) {
  const [current, setCurrent] = useState(0);
  if (!photos || photos.length === 0) return null;
  return (
    <div style={{ position:"relative",width:"100%",height:200,overflow:"hidden",borderRadius:0 }}>
      <img src={photos[current]} alt="photo" style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}/>

      {photos.length > 1 && (
        <>
          {/* Bouton précédent */}
          <button
            onClick={e=>{ e.stopPropagation(); setCurrent(c=>(c-1+photos.length)%photos.length); }}
            style={{
              position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",
              background:"rgba(255,255,255,0.18)",
              backdropFilter:"blur(8px)",
              WebkitBackdropFilter:"blur(8px)",
              border:"1px solid rgba(255,255,255,0.35)",
              color:"#fff",
              borderRadius:"50%",
              width:32,height:32,
              display:"flex",alignItems:"center",justifyContent:"center",
              cursor:"pointer",
              boxShadow:"0 2px 8px rgba(0,0,0,0.25)",
              fontSize:16,fontWeight:700,
              transition:"background 0.2s",
            }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.32)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.18)"}
          >‹</button>

          {/* Bouton suivant */}
          <button
            onClick={e=>{ e.stopPropagation(); setCurrent(c=>(c+1)%photos.length); }}
            style={{
              position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",
              background:"rgba(255,255,255,0.18)",
              backdropFilter:"blur(8px)",
              WebkitBackdropFilter:"blur(8px)",
              border:"1px solid rgba(255,255,255,0.35)",
              color:"#fff",
              borderRadius:"50%",
              width:32,height:32,
              display:"flex",alignItems:"center",justifyContent:"center",
              cursor:"pointer",
              boxShadow:"0 2px 8px rgba(0,0,0,0.25)",
              fontSize:16,fontWeight:700,
              transition:"background 0.2s",
            }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.32)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.18)"}
          >›</button>

          {/* Indicateurs — dots avec compteur */}
          <div style={{
            position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",
            display:"flex",alignItems:"center",gap:5,
            background:"rgba(0,0,0,0.35)",
            backdropFilter:"blur(6px)",
            WebkitBackdropFilter:"blur(6px)",
            borderRadius:20,
            padding:"4px 10px",
          }}>
            {photos.map((_, i) => (
              <div key={i} onClick={e=>{ e.stopPropagation(); setCurrent(i); }}
                style={{
                  width: i===current ? 18 : 6,
                  height:6,
                  borderRadius:3,
                  background: i===current ? "#fff" : "rgba(255,255,255,0.45)",
                  cursor:"pointer",
                  transition:"all 0.25s ease",
                }}/>
            ))}
          </div>

          {/* Compteur discret */}
          <div style={{
            position:"absolute",top:8,right:8,
            background:"rgba(0,0,0,0.45)",
            backdropFilter:"blur(6px)",
            WebkitBackdropFilter:"blur(6px)",
            borderRadius:20,
            padding:"2px 8px",
            fontSize:11,
            color:"#fff",
            fontWeight:600,
          }}>{current+1}/{photos.length}</div>
        </>
      )}
    </div>
  );
}

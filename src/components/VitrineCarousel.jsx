import React, { useState, useEffect, useRef } from "react";

function VitrineCarousel({ photos, borderColor }) {
  const COLOR = "#10B981";
  const [current,   setCurrent]   = React.useState(0);
  const [lightbox,  setLightbox]  = React.useState(false);
  const touchStartRef = React.useRef(null);
  const touchEndRef   = React.useRef(null);
  const total = photos.length;

  const prev = () => setCurrent(c => (c - 1 + total) % total);
  const next = () => setCurrent(c => (c + 1) % total);

  // Swipe tactile
  const onTouchStart = e => { touchStartRef.current = e.targetTouches[0].clientX; touchEndRef.current = null; };
  const onTouchMove  = e => { touchEndRef.current   = e.targetTouches[0].clientX; };
  const onTouchEnd   = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const diff = touchStartRef.current - touchEndRef.current;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
  };

  // Clavier
  React.useEffect(() => {
    const handler = e => {
      if (!lightbox) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "Escape")     setLightbox(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, current]);

  if (total === 0) return null;

  return (
    <>
      {/* Carousel principal */}
      <div style={{ position:"relative",borderRadius:14,overflow:"hidden",border:`1px solid ${borderColor||"#2A2D45"}`,background:"#0D0F1A",userSelect:"none" }}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>

        {/* Image */}
        <div style={{ position:"relative",width:"100%",paddingBottom:"60%",background:"#1A1D30" }}>
          <img src={photos[current]} alt={`photo ${current+1}`}
            style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",cursor:"zoom-in" }}
            onClick={()=>setLightbox(true)}
            onError={e=>e.target.style.opacity="0"}/>

          {/* Flèche gauche */}
          {total > 1 && (
            <button onClick={e=>{e.stopPropagation();prev();}}
              style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",border:"none",color:"#fff",width:36,height:36,borderRadius:"50%",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2 }}>
              ‹
            </button>
          )}

          {/* Flèche droite */}
          {total > 1 && (
            <button onClick={e=>{e.stopPropagation();next();}}
              style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",border:"none",color:"#fff",width:36,height:36,borderRadius:"50%",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2 }}>
              ›
            </button>
          )}

          {/* Compteur */}
          <div style={{ position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",borderRadius:20,padding:"3px 10px",fontSize:12,color:"#fff",fontFamily:"Sora,sans-serif",fontWeight:600 }}>
            {current+1} / {total}
          </div>

          {/* Icône zoom */}
          <div style={{ position:"absolute",bottom:10,right:10,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",borderRadius:8,padding:"4px 8px",fontSize:11,color:"#fff",fontFamily:"Sora,sans-serif" }}>
            🔍 Agrandir
          </div>
        </div>

        {/* Points indicateurs */}
        {total > 1 && (
          <div style={{ display:"flex",justifyContent:"center",gap:6,padding:"10px 0",background:"rgba(0,0,0,0.3)" }}>
            {photos.map((_,i) => (
              <div key={i} onClick={()=>setCurrent(i)}
                style={{ width:i===current?20:8,height:8,borderRadius:4,background:i===current?COLOR:"rgba(255,255,255,0.3)",cursor:"pointer",transition:"all 0.2s" }}/>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox plein écran */}
      {lightbox && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column" }}
          onClick={()=>setLightbox(false)}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={()=>{ onTouchEnd(); }}>

          {/* Bouton fermer */}
          <button onClick={()=>setLightbox(false)}
            style={{ position:"absolute",top:20,right:20,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",width:44,height:44,borderRadius:"50%",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1 }}>
            ✕
          </button>

          {/* Compteur */}
          <div style={{ position:"absolute",top:24,left:"50%",transform:"translateX(-50%)",color:"rgba(255,255,255,0.7)",fontSize:13,fontFamily:"Sora,sans-serif" }}>
            {current+1} / {total}
          </div>

          {/* Image plein écran */}
          <img src={photos[current]} alt={`photo ${current+1}`}
            style={{ maxWidth:"92vw",maxHeight:"82vh",objectFit:"contain",borderRadius:8 }}
            onClick={e=>e.stopPropagation()}/>

          {/* Flèches lightbox */}
          {total > 1 && (
            <>
              <button onClick={e=>{e.stopPropagation();prev();}}
                style={{ position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",width:48,height:48,borderRadius:"50%",fontSize:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                ‹
              </button>
              <button onClick={e=>{e.stopPropagation();next();}}
                style={{ position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",width:48,height:48,borderRadius:"50%",fontSize:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                ›
              </button>
            </>
          )}

          {/* Miniatures */}
          {total > 1 && (
            <div style={{ display:"flex",gap:8,marginTop:16,padding:"0 16px",overflowX:"auto",maxWidth:"100vw" }}>
              {photos.map((url,i) => (
                <img key={i} src={url} alt={`miniature ${i+1}`}
                  onClick={e=>{e.stopPropagation();setCurrent(i);}}
                  style={{ width:60,height:45,objectFit:"cover",borderRadius:6,cursor:"pointer",border:i===current?`2px solid ${COLOR}`:"2px solid transparent",opacity:i===current?1:0.6,flexShrink:0,transition:"all 0.2s" }}/>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}


function VitrineSection({ id, icon, title, children, openSection, setOpenSection, COLOR, T }) {
  const open = openSection === id;
  return (
    <div style={{ border:`1px solid ${open ? COLOR+"55" : T.border}`,borderRadius:14,marginBottom:10,overflow:"hidden",transition:"all 0.2s" }}>
      <div onClick={()=>setOpenSection(open ? null : id)}
        style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",cursor:"pointer",background:open?`rgba(16,185,129,0.06)`:T.card }}>
        <span style={{ fontWeight:700,color:open?COLOR:T.text,fontSize:14 }}>{icon} {title}</span>
        <span style={{ color:T.sub,fontSize:18,fontWeight:300 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"4px 16px 16px",background:T.bg }}>
          {children}
        </div>
      )}
    </div>
  );
}


export { VitrineCarousel, VitrineSection };

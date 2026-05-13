import React from "react";

function EstablishmentUrgentBanner({ boutiques, ateliers, restos, beaute, theme, navigate, windowWidth, sessionSeed }) {
  const [groupIdx, setGroupIdx] = React.useState(0);
  const [slide, setSlide]       = React.useState("idle");
  const timerRef  = React.useRef(null);
  const initDone  = React.useRef(false);

  // Tous les établissements urgents
  const allUrgent = [
    ...boutiques.filter(b => b.urgent && b.urgentUntil && new Date(b.urgentUntil) > new Date()).map(b => ({...b, title:b.name, _type:"boutique", _icon:"🛍️", _label:"Boutique"})),
    ...ateliers.filter(a => a.urgent && a.urgentUntil && new Date(a.urgentUntil) > new Date()).map(a => ({...a, title:a.name, _type:"atelier", _icon:"🔧", _label:"Atelier"})),
    ...restos.filter(r => r.urgent && r.urgentUntil && new Date(r.urgentUntil) > new Date()).map(r => ({...r, title:r.name, _type:"resto", _icon:"🍽️", _label:"Restaurant"})),
    ...beaute.filter(b => b.urgent && b.urgentUntil && new Date(b.urgentUntil) > new Date()).map(b => ({...b, title:b.name, _type:"beaute", _icon:"💇", _label:"Beauté"})),
  ].sort((a, b) => new Date(b.urgentActivatedAt || b.urgentUntil) - new Date(a.urgentActivatedAt || a.urgentUntil));

  if (allUrgent.length === 0) return null;

  // Position de départ aléatoire par session
  React.useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    setGroupIdx(Math.floor(sessionSeed * allUrgent.length) % allUrgent.length);
  }, [allUrgent.length]);

  const advance = (nextIdx) => {
    setSlide("out");
    setTimeout(() => {
      setGroupIdx(((nextIdx % allUrgent.length) + allUrgent.length) % allUrgent.length);
      setSlide("in");
      setTimeout(() => setSlide("idle"), 500);
    }, 350);
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setGroupIdx(prev => { advance(prev + 1); return prev; });
    }, 5000);
  };

  React.useEffect(() => {
    if (allUrgent.length <= 1) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [allUrgent.length]);

  const item = allUrgent[groupIdx];
  if (!item) return null;

  const slideStyle = {
    idle: { transform:"translateX(0)",     opacity:1, transition:"transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s" },
    out:  { transform:"translateX(-40px)", opacity:0, transition:"transform 0.35s ease-in, opacity 0.35s ease-in" },
    in:   { transform:"translateX(0)",     opacity:1, transition:"transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s" },
  };

  return (
    <div style={{ width:"100%", marginBottom:20 }}>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:18 }}>🔥</span>
          <p style={{ fontWeight:800,fontSize:14,color:"#FF4757",letterSpacing:0.5 }}>ÉTABLISSEMENTS EN CE MOMENT</p>
          <span style={{ background:"rgba(255,71,87,0.15)",color:"#FF4757",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700 }}>{allUrgent.length}</span>
        </div>
        {allUrgent.length > 1 && (
          <div style={{ display:"flex",gap:6,alignItems:"center" }}>
            <button onClick={()=>{ clearInterval(timerRef.current); advance(groupIdx-1); startTimer(); }}
              style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757",width:26,height:26,borderRadius:"50%",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>‹</button>
            <span style={{ fontSize:11,color:theme.sub }}>{groupIdx+1}/{allUrgent.length}</span>
            <button onClick={()=>{ clearInterval(timerRef.current); advance(groupIdx+1); startTimer(); }}
              style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757",width:26,height:26,borderRadius:"50%",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>›</button>
          </div>
        )}
      </div>

      {/* Carte pleine largeur — glissement gauche→droite */}
      <div style={{ overflow:"hidden",width:"100%",borderRadius:18 }}>
        <div style={{ ...slideStyle[slide] }}>
          <div onClick={() => navigate(`/${item._type}/${item.id}`)}
            style={{ width:"100%",borderRadius:18,overflow:"hidden",cursor:"pointer",
              border:"2.5px solid #FF4757",background:theme.card,
              boxShadow:"0 4px 24px rgba(255,71,87,0.2)",display:"flex",
              flexDirection:windowWidth<=600?"column":"row",minHeight:windowWidth<=600?220:160 }}>

            {/* Photo */}
            <div style={{ width:windowWidth<=600?"100%":260,height:windowWidth<=600?180:160,flexShrink:0,position:"relative",overflow:"hidden",background:"linear-gradient(135deg,#1a1d30,#2a2d45)" }}>
              {item.photos&&item.photos[0]
                ? <img src={item.photos[0]} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48 }}>{item._icon}</div>}
              <div style={{ position:"absolute",top:10,left:10,background:"#FF4757",color:"#fff",borderRadius:8,padding:"3px 10px",fontSize:11,fontWeight:800,letterSpacing:0.5 }}>🔥 URGENT</div>
              <div style={{ position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.6)",color:"#fff",borderRadius:8,padding:"3px 8px",fontSize:10,fontWeight:700 }}>{item._icon} {item._label}</div>
            </div>

            {/* Contenu */}
            <div style={{ padding:"16px 20px",flex:1,display:"flex",flexDirection:"column",justifyContent:"center" }}>
              <p style={{ fontWeight:800,fontSize:17,color:theme.text,marginBottom:6 }}>{item.title}</p>
              {item.description&&<p style={{ color:theme.sub,fontSize:13,marginBottom:8,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{item.description}</p>}
              {(item.ville||item.quartier)&&<p style={{ fontSize:12,color:theme.sub,marginBottom:8 }}>📍 {[item.ville,item.quartier].filter(Boolean).join(", ")}</p>}
              {item.phone&&<p style={{ fontSize:13,color:"#43C6AC",fontWeight:600 }}>📞 {item.phone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      {allUrgent.length > 1 && (
        <div style={{ display:"flex",justifyContent:"center",gap:5,marginTop:8 }}>
          {allUrgent.map((_,i)=>(
            <div key={i} onClick={()=>{ clearInterval(timerRef.current); advance(i); startTimer(); }}
              style={{ width:i===groupIdx?16:6,height:6,borderRadius:3,background:i===groupIdx?"#FF4757":"rgba(255,71,87,0.25)",transition:"all 0.3s",cursor:"pointer" }}/>
          ))}
        </div>
      )}

      <div style={{ borderBottom:`1px solid ${theme.border}`,marginTop:14 }}/>
    </div>
  );
}


export default EstablishmentUrgentBanner;

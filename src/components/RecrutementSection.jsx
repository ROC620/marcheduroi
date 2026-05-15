import React, { useState } from "react";

export default function RecrutementSection({ theme, user, setModal, windowWidth, posts, view }) {
  const [recrutTab, setRecrutTab] = useState("offres");

  return (
    <>
{view==="recrutement"&&(
  <div style={{ animation:"fadeIn 0.4s ease",padding:"24px 20px",maxWidth:820,margin:"0 auto",width:"100%" }}>
    <div style={{ textAlign:"center",marginBottom:28 }}>
      <h1 style={{ fontSize:windowWidth<=600?28:40,fontWeight:800,color:theme.text,marginBottom:8 }}>
        {"💼 "}
        <span style={{ background:"linear-gradient(135deg,#43C6AC,#6C63FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Recrutement</span>
      </h1>
      <p style={{ color:theme.sub,fontSize:14 }}>Offres d\'emploi et profils de candidats</p>
    </div>
    <div style={{ display:"flex",gap:8,marginBottom:24,background:theme.card,padding:4,borderRadius:14 }}>
      {[{key:"offres",label:"💼 Offres d\'emploi"},{key:"cvs",label:"👤 Profils / CV"}].map(tab=>(
        <button key={tab.key} onClick={()=>setRecrutTab(tab.key)}
          style={{ flex:1,padding:"10px 16px",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer",border:"none",
            background:recrutTab===tab.key?"linear-gradient(135deg,#43C6AC,#6C63FF)":"transparent",
            color:recrutTab===tab.key?"#fff":theme.sub,transition:"all 0.2s" }}>
          {tab.label}
        </button>
      ))}
    </div>
    <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:20 }}>
      {user && recrutTab==="offres" && (
        <button onClick={()=>setModal({type:"addOffre"})} className="btn-glow"
          style={{ background:"linear-gradient(135deg,#43C6AC,#6C63FF)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer" }}>
          + Publier une offre
        </button>
      )}
      {user && recrutTab==="cvs" && (
        <button onClick={()=>setModal({type:"addCV"})} className="btn-glow"
          style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer" }}>
          + Publier mon CV
        </button>
      )}
    </div>
    {recrutTab==="offres" && (()=>{
      const offres = posts.filter(p=>p.category==="Offre d\'emploi").sort((a,b)=>new Date(b.date)-new Date(a.date));
      if (offres.length===0) return (
        <div style={{ textAlign:"center",padding:"60px 0",color:theme.sub }}>
          <p style={{ fontSize:40,marginBottom:12 }}>{"💼"}</p>
          <p style={{ fontWeight:600,marginBottom:8 }}>Aucune offre pour le moment</p>
          <p style={{ fontSize:13 }}>1 500 FCFA / 30 jours · 3 500 FCFA / 90 jours</p>
        </div>
      );
      return (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {offres.map(o=>(
            <div key={o.id} style={{ ...cardStyle,borderRadius:16,padding:20,border:`1px solid ${theme.border}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,flexWrap:"wrap",gap:8 }}>
                <div>
                  <p style={{ fontWeight:800,fontSize:16,color:theme.text,marginBottom:4 }}>{o.title}</p>
                  <p style={{ fontWeight:700,fontSize:13,color:"#43C6AC" }}>{"🏢 "}{o.contact}</p>
                </div>
                {o.price&&<span style={{ background:"rgba(67,198,172,0.12)",color:"#43C6AC",borderRadius:8,padding:"4px 12px",fontSize:13,fontWeight:700 }}>{"💰 "}{o.price} FCFA</span>}
              </div>
              <p style={{ color:theme.sub,fontSize:13,lineHeight:1.6,marginBottom:10 }}>{o.description}</p>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
                {o.ville&&<span style={{ fontSize:12,color:theme.sub }}>{"📍 "}{o.ville}</span>}
                <span style={{ fontSize:12,color:theme.sub }}>{"📅 "}{o.date}</span>
                {o.phone&&user&&user.id!==o.authorId&&(
                  <a href={"https://wa.me/"+o.phone.replace(/[\s+()]/g,"")} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                    <div style={{ background:"rgba(37,211,102,0.15)",color:"#25D366",padding:"4px 10px",borderRadius:8,fontSize:12,fontWeight:700 }}>WA</div>
                  </a>
                )}
                {user&&user.id!==o.authorId&&(
                  <button onClick={()=>{ setActiveConv({postId:o.id,postTitle:o.title,postPrice:"",postPhoto:null,receiverId:o.authorId,receiverName:o.contact,messages:messages.filter(m=>(m.post_id===o.id)&&((m.sender_id===user.id&&m.receiver_id===o.authorId)||(m.receiver_id===user.id&&m.sender_id===o.authorId)))}); setShowMessages(true); }}
                    style={{ background:"rgba(108,99,255,0.1)",border:"none",color:"#6C63FF",padding:"4px 10px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer" }}>{"💬 Postuler"}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    })()}
    {recrutTab==="cvs" && (()=>{
      const cvs = posts.filter(p=>p.category==="Profil CV").sort((a,b)=>new Date(b.date)-new Date(a.date));
      if (cvs.length===0) return (
        <div style={{ textAlign:"center",padding:"60px 0",color:theme.sub }}>
          <p style={{ fontSize:40,marginBottom:12 }}>{"👤"}</p>
          <p style={{ fontWeight:600,marginBottom:8 }}>Aucun profil pour le moment</p>
          <p style={{ fontSize:13 }}>Publication gratuite</p>
        </div>
      );
      return (
        <div style={{ display:"grid",gridTemplateColumns:windowWidth<=600?"1fr":windowWidth<=900?"1fr 1fr":"1fr 1fr 1fr",gap:14 }}>
          {cvs.map(cv=>(
            <div key={cv.id} style={{ ...cardStyle,borderRadius:16,padding:18,border:`1px solid ${theme.border}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                <div style={{ width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#43C6AC)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#fff",flexShrink:0 }}>{cv.contact?.[0]||"?"}</div>
                <div>
                  <p style={{ fontWeight:800,fontSize:14,color:theme.text }}>{cv.contact}</p>
                  <p style={{ fontSize:12,color:"#43C6AC",fontWeight:600 }}>{cv.title.split(" — ")[0]}</p>
                </div>
              </div>
              <p style={{ color:theme.sub,fontSize:12,lineHeight:1.6,marginBottom:10,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{cv.description}</p>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                {cv.ville&&<span style={{ fontSize:11,color:theme.sub }}>{"📍 "}{cv.ville}</span>}
                {user&&user.id!==cv.authorId&&(
                  <button onClick={()=>{ setActiveConv({postId:cv.id,postTitle:cv.title,postPrice:"",postPhoto:null,receiverId:cv.authorId,receiverName:cv.contact,messages:messages.filter(m=>(m.post_id===cv.id)&&((m.sender_id===user.id&&m.receiver_id===cv.authorId)||(m.receiver_id===user.id&&m.sender_id===cv.authorId)))}); setShowMessages(true); }}
                    style={{ background:"rgba(108,99,255,0.1)",border:"none",color:"#6C63FF",padding:"3px 8px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer" }}>{"💬 Contacter"}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    })()}
  </div>
)}

    </>
  );
}

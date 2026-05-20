import React from "react";
import { normalizeText, isUrgentActive, getPhonePrefix } from "../utils";

export default function ParrainageSection({ theme, user, setView, setModal, notify, t, boutiques, ateliers, restos, view, inputStyle, cardStyle, referralStats }) {
  return (
    <>
{view==="parrainage"&&(
  <div style={{ width:"100%",maxWidth:700,margin:"0 auto",padding:"48px 40px",animation:"fadeIn 0.4s ease" }}>
    <div style={{ textAlign:"center",marginBottom:40 }}>
      <p style={{ fontSize:48,marginBottom:12 }}>🎁</p>
      <h1 style={{ fontSize:38,fontWeight:800,marginBottom:12,color:theme.text }}>Programme de <span style={{ background:"linear-gradient(135deg,#FFD700,#FFA500)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Parrainage</span></h1>
      <p style={{ color:theme.sub,fontSize:16,lineHeight:1.7 }}>Invitez <strong style={{ color:"#FFD700" }}>10 amis</strong> sur MarchéduRoi et gagnez <strong style={{ color:"#FFD700" }}>1 mois de publication gratuit</strong> !</p>
      <div style={{ background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.3)",borderRadius:12,padding:"12px 20px",marginTop:12,display:"inline-block" }}>
        <p style={{ color:"#FFD700",fontSize:13,fontWeight:600 }}>🎁 10 parrainages = 1 annonce simple gratuite (valeur 1 000 FCFA)</p>
        <p style={{ color:theme.sub,fontSize:12,marginTop:4 }}>⚠️ Valable uniquement pour les annonces simples · Non applicable aux boutiques, ateliers, restos et salons</p>
      </div>
    </div>
    {/* Règles claires */}
    <div style={{ ...cardStyle,borderRadius:16,padding:24,marginBottom:24 }}>
      <h3 style={{ fontWeight:800,fontSize:16,color:theme.text,marginBottom:16 }}>📋 Comment ça marche ?</h3>
      {[
        { num:"1", text:"Partagez votre lien unique à vos amis et contacts" },
        { num:"2", text:"Chaque ami qui s'inscrit via votre lien compte comme 1 parrainage" },
        { num:"3", text:"Après 10 parrainages confirmés, vous gagnez 1 annonce simple gratuite (30 jours)" },
        { num:"4", text:"Valable uniquement pour 1 annonce simple (valeur 1 000 FCFA)" },
        { num:"5", text:"Non applicable aux boutiques, ateliers, restos et salons de beauté" },
        { num:"6", text:"Les crédits ne sont pas transférables ni remboursables en argent" },
      ].map(r=>(
        <div key={r.num} style={{ display:"flex",gap:12,marginBottom:12,alignItems:"flex-start" }}>
          <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#FFD700,#FFA500)",display:"flex",alignItems:"center",justifyContent:"center",color:"#000",fontWeight:800,fontSize:13,flexShrink:0 }}>{r.num}</div>
          <p style={{ color:theme.sub,fontSize:14,lineHeight:1.5,paddingTop:4 }}>{r.text}</p>
        </div>
      ))}
      <div style={{ background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.3)",borderRadius:10,padding:"12px 16px",marginTop:8,textAlign:"center" }}>
        <p style={{ color:"#FFD700",fontWeight:800,fontSize:16 }}>🎯 10 parrainages = 1 annonce gratuite (valeur 1 000 FCFA)</p>
      </div>
    </div>
    {user ? (
      <div style={{ ...cardStyle,borderRadius:20,padding:32 }}>
        <p style={{ fontWeight:700,fontSize:16,color:theme.text,marginBottom:8 }}>Votre lien de parrainage :</p>
        <div style={{ display:"flex",gap:8,marginBottom:20 }}>
          <input readOnly value={`https://marcheduroi.com?ref=${user.id}`} style={{ ...inputStyle,flex:1,background:theme.bg }} onClick={e=>e.target.select()}/>
          <button onClick={()=>{ navigator.clipboard.writeText(`https://marcheduroi.com?ref=${user.id}`); notify("Lien copié ! 📋"); }} style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"12px 16px",borderRadius:10,fontWeight:700,cursor:"pointer" }}>Copier</button>
        </div>
        <a href={`https://wa.me/?text=${encodeURIComponent("Rejoins-moi sur MarcheduRoi, la plateforme multipolaire pour booster ton business !\nInscris-toi gratuitement ici : https://marcheduroi.com?ref="+user.id)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none",display:"block" }}>
          <button style={{ width:"100%",padding:"14px",background:"#25D366",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            Partager sur WhatsApp
          </button>
        </a>
        <div style={{ marginTop:24,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,textAlign:"center" }}>
          {[
            {icon:"👥", val:referralStats.count, label:"Filleuls"},
            {icon:"🎁", val:referralStats.credits, label:"Crédits dispo"},
            {icon:"💰", val:referralStats.saved.toLocaleString()+" FCFA", label:"Économisé"},
          ].map(s=>(
            <div key={s.label} style={{ background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:12,padding:16 }}>
              <p style={{ fontSize:24 }}>{s.icon}</p>
              <p style={{ fontWeight:800,color:"#FFD700",fontSize:20 }}>{s.val}</p>
              <p style={{ color:theme.sub,fontSize:11 }}>{s.label}</p>
            </div>
          ))}
        </div>
        {referralStats.count > 0 && (
          <div style={{ marginTop:16,background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.3)",borderRadius:10,padding:"10px 16px",textAlign:"center" }}>
            <p style={{ color:"#FFD700",fontSize:13,fontWeight:600 }}>
              🎯 Plus que {10 - (referralStats.count % 10)} parrainage{10-(referralStats.count%10)>1?"s":""} pour gagner 1 mois gratuit !
            </p>
          </div>
        )}
      </div>
    ) : (
      <div style={{ textAlign:"center" }}>
        <p style={{ color:theme.sub,marginBottom:20 }}>Connectez-vous pour accéder à votre lien de parrainage</p>
        <button onClick={()=>setView("register")} className="btn-glow" style={{ background:"linear-gradient(135deg,#FFD700,#FFA500)",border:"none",color:"#000",padding:"14px 32px",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer" }}>Créer un compte</button>
      </div>
    )}
  </div>
)}

    </>
  );
}

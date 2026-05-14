import React from "react";
import { normalizeText, isUrgentActive, getPhonePrefix } from "../utils";
import { CATEGORIES } from "../constants";

export default function StatsSection({ theme, user, setView, setModal, notify, posts, boutiques, ateliers, restos, beaute, view, cardStyle }) {
  return (
    <>
{view==="stats"&&(
  <div style={{ width:"100%",maxWidth:900,margin:"0 auto",padding:"48px 40px",animation:"fadeIn 0.4s ease" }}>
    <div style={{ textAlign:"center",marginBottom:48 }}>
      <h1 style={{ fontSize:42,fontWeight:800,marginBottom:12,color:theme.text }}>📊 MarchéduRoi en <span style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>chiffres</span></h1>
      <p style={{ color:theme.sub,fontSize:16 }}>La plateforme qui grandit chaque jour au Bénin et en Afrique</p>
    </div>
    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:20,marginBottom:40 }}>
      {[
        { val:posts.length, label:"Annonces publiées", icon:"📋", color:"#6C63FF" },
        { val:boutiques.length, label:"Boutiques", icon:"🛍️", color:"#FF6584" },
        { val:ateliers.length, label:"Ateliers", icon:"🔧", color:"#43C6AC" },
        { val:restos.length, label:"Restaurants & Bars", icon:"🍽️", color:"#FF8C00" },
        { val:beaute.length, label:"Salons Beauté", icon:"💇", color:"#FF69B4" },
        { val:posts.reduce((a,p)=>a+p.likes,0), label:"Likes totaux", icon:"❤️", color:"#FF6584" },
        { val:CATEGORIES.length-1, label:"Catégories", icon:"🗂️", color:"#FFD700" },
        { val:"18 pays 🌍", label:"Couverture Afrique", icon:"🌐", color:"#43C6AC" },
      ].map(s=>(
        <div key={s.label} className="card-hover" style={{ ...cardStyle,borderRadius:16,padding:28,textAlign:"center" }}>
          <p style={{ fontSize:36,marginBottom:8 }}>{s.icon}</p>
          <p style={{ fontSize:36,fontWeight:800,color:s.color,marginBottom:4 }}>{s.val}</p>
          <p style={{ color:theme.sub,fontSize:13,fontWeight:600 }}>{s.label}</p>
        </div>
      ))}
    </div>

    {/* Carte Google Maps des annonces */}
    <div style={{ ...cardStyle,borderRadius:16,marginBottom:24,overflow:"hidden" }}>
      <div style={{ padding:"16px 20px",borderBottom:`1px solid ${theme.border}`,display:"flex",alignItems:"center",gap:8 }}>
        <span style={{ fontSize:20 }}>🗺️</span>
        <p style={{ fontWeight:700,fontSize:16,color:theme.text }}>Carte des annonces</p>
        <span style={{ color:theme.sub,fontSize:13 }}>— Bénin & Afrique</span>
      </div>
      <div style={{ height:320,position:"relative" }}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1014574!2d2.3158!3d6.3654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2sbj!4v1"
          width="100%" height="320" style={{ border:0 }} allowFullScreen loading="lazy"
          referrerPolicy="no-referrer-when-downgrade" title="Carte MarchéduRoi"/>
        <div style={{ position:"absolute",bottom:0,left:0,right:0,background:`linear-gradient(to top,${theme.bg}CC,transparent)`,padding:"16px 20px" }}>
          <p style={{ color:theme.text,fontSize:13,fontWeight:600 }}>
            📍 {posts.filter(p=>p.lat&&p.lng).length} annonce{posts.filter(p=>p.lat&&p.lng).length>1?"s":""} géolocalisée{posts.filter(p=>p.lat&&p.lng).length>1?"s":""}
          </p>
        </div>
      </div>
    </div>

    {/* Activer les notifications push */}
    {user && "Notification" in window && Notification.permission !== "granted" && (
      <div style={{ ...cardStyle,borderRadius:16,padding:24,marginBottom:24,display:"flex",gap:16,alignItems:"center",flexWrap:"wrap" }}>
        <span style={{ fontSize:36 }}>🔔</span>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:700,fontSize:16,color:theme.text,marginBottom:4 }}>Activer les notifications</p>
          <p style={{ color:theme.sub,fontSize:13 }}>Soyez alerté en temps réel — nouveaux messages, likes, expiration d'annonces.</p>
        </div>
        <button onClick={()=>{
          Notification.requestPermission().then(perm=>{
            if (perm==="granted") notify("🔔 Notifications activées ! Vous serez alerté en temps réel.");
            else notify("Notifications refusées — vous pouvez les activer dans les paramètres du navigateur.","error");
          });
        }} style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"12px 24px",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer",flexShrink:0 }}>
          🔔 Activer
        </button>
      </div>
    )}

    <div style={{ ...cardStyle,borderRadius:16,padding:28,textAlign:"center" }}>
      <p style={{ fontSize:18,fontWeight:700,color:theme.text,marginBottom:8 }}>🚀 Rejoignez la communauté MarchéduRoi</p>
      <p style={{ color:theme.sub,marginBottom:20 }}>Publiez vos annonces et rejoignez des milliers de commerçants au Bénin</p>
      <button onClick={()=>user?setModal({type:"add"}):setView("register")} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"14px 32px",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer",transition:"box-shadow 0.2s" }}>
        {user?"Publier une annonce →":"Créer mon compte gratuitement →"}
      </button>
    </div>
  </div>
)}

    </>
  );
}

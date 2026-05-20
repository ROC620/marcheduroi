import React from "react";
import { normalizeText, isUrgentActive, getPhonePrefix } from "../utils";

export default function AboutSection({ theme, user, setView, setModal, notify, navigate, windowWidth, t, boutiques, ateliers, restos, beaute, view, search, setSearch, featuredPosts, likedPosts, likePost, isCertified }) {
  return (
    <>
{view==="about"&&(
  <div style={{ width:"100%",animation:"fadeIn 0.4s ease" }}>
    <div style={{ textAlign:"center",padding:"80px 40px 48px",background:`linear-gradient(180deg,${theme.card},transparent)` }}>
      <img src="/marcheduRoi-icon.svg" alt="MarcheduRoi" style={{ width:120,height:120,borderRadius:20,boxShadow:"0 8px 32px rgba(108,99,255,0.4)",margin:"0 auto 20px",display:"block" }}/>
      <h1 style={{ fontSize:windowWidth<=600?"clamp(28px,8vw,38px)":48,fontWeight:800,marginBottom:16,color:theme.text,textAlign:"center",wordBreak:"break-word" }}>À propos de <span style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>MarchéduRoi</span></h1>
      <p style={{ color:theme.sub,fontSize:18,maxWidth:700,margin:"0 auto 12px",lineHeight:1.7 }}>La plateforme de petites annonces qui connecte commerçants, entreprises et particuliers au Bénin et au-delà des frontières.</p>
      <p style={{ fontWeight:800,fontSize:20,color:"#FFD700",textAlign:"center",letterSpacing:0.5,fontStyle:"italic" }}>"Sur MarchéduRoi, vous êtes le Roi du Marché" 👑</p>
    </div>

    {/* Mission */}
    <div style={{ maxWidth:900,margin:"0 auto 48px",display:"flex",flexDirection:windowWidth<=600?"column":"row",gap:24 }}>
      <div style={{ ...{background:theme.card,border:`1px solid ${theme.border}`},borderRadius:20,padding:windowWidth<=600?20:32,flex:1 }}>
        <div style={{ fontSize:40,marginBottom:16 }}>🎯</div>
        <h2 style={{ fontWeight:800,fontSize:22,marginBottom:16,color:theme.text }}>Notre Mission</h2>
        <p style={{ color:theme.sub,fontSize:15,lineHeight:1.8 }}>
          Assister tous les commerçants formels et informels, ainsi que toutes personnes physiques et morales, à consulter et prendre des renseignements sur tous les produits, biens et services disponibles dans leur pays et au-delà de leurs frontières.
        </p>
      </div>
      <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:20,padding:windowWidth<=600?20:32,flex:1 }}>
        <div style={{ fontSize:40,marginBottom:16 }}>🌍</div>
        <h2 style={{ fontWeight:800,fontSize:22,marginBottom:16,color:theme.text }}>Notre Vision</h2>
        <p style={{ color:theme.sub,fontSize:15,lineHeight:1.8 }}>
          Permettre à toute personne intéressée de publier n'importe quel produit, bien ou service pour le bonheur du monde. Une plateforme ouverte, accessible et utile à tous, partout en Afrique et dans le monde.
        </p>
      </div>
    </div>

    {/* Valeurs */}
    <div style={{ maxWidth:900,margin:"0 auto 48px" }}>
      <h2 style={{ fontWeight:800,fontSize:28,marginBottom:24,color:theme.text,textAlign:"center" }}>Nos Valeurs</h2>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16 }}>
        {[
          { icon:"🤝", title:"Confiance", desc:"Des annonceurs vérifiés et des vendeurs respectables" },
          { icon:"💡", title:"Simplicité", desc:"Une interface claire et facile à utiliser pour tous" },
          { icon:"🚀", title:"Innovation", desc:"Des fonctionnalités modernes adaptées à l'Afrique" },
          { icon:"❤️", title:"Communauté", desc:"Relier les gens et favoriser les échanges locaux" },
        ].map(v=>(
          <div key={v.title} style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:16,padding:24,textAlign:"center" }}>
            <div style={{ fontSize:32,marginBottom:12 }}>{v.icon}</div>
            <h3 style={{ fontWeight:700,fontSize:16,marginBottom:8,color:theme.text }}>{v.title}</h3>
            <p style={{ color:theme.sub,fontSize:13,lineHeight:1.6 }}>{v.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Entreprise */}
    <div style={{ maxWidth:600,margin:"0 auto 48px" }}>
      <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:20,padding:32,textAlign:"center" }}>
        <div style={{ width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#FF6584)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:32,fontWeight:800,color:"#fff" }}>M</div>
        <h2 style={{ fontWeight:800,fontSize:22,marginBottom:4,color:theme.text }}>MarchéduRoi</h2>
        <p style={{ color:"#6C63FF",fontWeight:600,fontSize:14,marginBottom:16 }}>Ouidah, Bénin</p>
        <p style={{ color:theme.sub,fontSize:14,lineHeight:1.7,marginBottom:20 }}>MarchéduRoi est une plateforme numérique multipolaire de petites annonces, créée et exploitée par EDENPORTAIL, établissement spécialisé dans la création et le référencement de sites internet, dont le siège social est établi à Ouidah, République du Bénin.</p>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <a href="mailto:contact@marcheduroi.com" style={{ textDecoration:"none",display:"flex",alignItems:"center",gap:10,background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.3)",borderRadius:10,padding:"10px 16px" }}>
            <span style={{ fontSize:16,flexShrink:0 }}>✉️</span>
            <span style={{ color:"#43C6AC",fontWeight:600,fontSize:14 }}>contact@marcheduroi.com</span>
          </a>
          <a href="mailto:support@marcheduroi.com" style={{ textDecoration:"none",display:"flex",alignItems:"center",gap:10,background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",borderRadius:10,padding:"10px 16px" }}>
            <span style={{ fontSize:16,flexShrink:0 }}>📧</span>
            <span style={{ color:"#6C63FF",fontWeight:600,fontSize:14 }}>support@marcheduroi.com</span>
          </a>
          <a href="https://wa.me/2290147562640" target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none",display:"flex",alignItems:"center",gap:10,background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",borderRadius:10,padding:"10px 16px" }}>
            <span style={{ fontSize:18,flexShrink:0 }}>💬</span>
            <span style={{ color:"#25D366",fontWeight:600,fontSize:14 }}>+229 01 47 56 26 40</span>
          </a>
          <div style={{ display:"flex",alignItems:"center",gap:10,background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:10,padding:"10px 16px" }}>
            <span style={{ fontSize:16,flexShrink:0 }}>📍</span>
            <span style={{ color:theme.sub,fontSize:14 }}>Ouidah, Bénin 🇧🇯</span>
          </div>
        </div>
      </div>
    </div>

    {/* Bloc légal RCCM + IFU */}
    <div style={{ maxWidth:700,margin:"0 auto 48px",padding:"0 16px" }}>
      <div style={{ background:`linear-gradient(135deg,rgba(108,99,255,0.06),rgba(67,198,172,0.06))`,border:`2px solid rgba(108,99,255,0.25)`,borderRadius:20,padding:windowWidth<=600?24:36,position:"relative",overflow:"hidden" }}>
        {/* Filigrane décoratif */}
        <div style={{ position:"absolute",right:-20,top:-20,width:120,height:120,borderRadius:"50%",background:"rgba(108,99,255,0.06)",pointerEvents:"none" }}/>
        <div style={{ position:"absolute",left:-30,bottom:-30,width:160,height:160,borderRadius:"50%",background:"rgba(67,198,172,0.05)",pointerEvents:"none" }}/>

        {/* En-tête */}
        <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:24 }}>
          <div style={{ width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#6C63FF,#43C6AC)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:24 }}>🏛️</div>
          <div>
            <p style={{ fontWeight:800,fontSize:18,color:theme.text,marginBottom:2 }}>Entreprise légalement enregistrée</p>
            <p style={{ color:theme.sub,fontSize:13 }}>République du Bénin · Afrique de l'Ouest</p>
          </div>
        </div>

        {/* Séparateur */}
        <div style={{ height:1,background:`linear-gradient(to right,rgba(108,99,255,0.3),transparent)`,marginBottom:20 }}/>

        {/* Informations légales */}
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {/* Raison sociale */}
          <div style={{ display:"flex",alignItems:"center",gap:12,flexWrap:"wrap" }}>
            <span style={{ fontSize:11,fontWeight:700,color:theme.sub,textTransform:"uppercase",letterSpacing:1,minWidth:130 }}>Raison sociale</span>
            <span style={{ fontWeight:800,fontSize:15,color:theme.text }}>EDENPORTAIL</span>
          </div>

          {/* RCCM */}
          <div style={{ display:"flex",alignItems:"center",gap:12,flexWrap:"wrap" }}>
            <span style={{ fontSize:11,fontWeight:700,color:theme.sub,textTransform:"uppercase",letterSpacing:1,minWidth:130 }}>N° RCCM</span>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontWeight:800,fontSize:15,color:"#6C63FF",fontFamily:"monospace",letterSpacing:0.5 }}>RB/ABC/26 A 139457</span>
              <span style={{ background:"rgba(67,198,172,0.15)",color:"#43C6AC",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700 }}>✅ Vérifié</span>
            </div>
          </div>

          {/* IFU */}
          <div style={{ display:"flex",alignItems:"center",gap:12,flexWrap:"wrap" }}>
            <span style={{ fontSize:11,fontWeight:700,color:theme.sub,textTransform:"uppercase",letterSpacing:1,minWidth:130 }}>N° IFU</span>
            <span style={{ fontWeight:800,fontSize:15,color:"#43C6AC",fontFamily:"monospace",letterSpacing:0.5 }}>0202656155829</span>
          </div>

          {/* Siège */}
          <div style={{ display:"flex",alignItems:"center",gap:12,flexWrap:"wrap" }}>
            <span style={{ fontSize:11,fontWeight:700,color:theme.sub,textTransform:"uppercase",letterSpacing:1,minWidth:130 }}>Siège social</span>
            <span style={{ fontWeight:600,fontSize:14,color:theme.text }}>Ouidah, République du Bénin 🇧🇯</span>
          </div>
        </div>

        {/* Séparateur */}
        <div style={{ height:1,background:`linear-gradient(to right,rgba(67,198,172,0.3),transparent)`,margin:"20px 0" }}/>

        {/* Mention de confiance */}
        <p style={{ color:theme.sub,fontSize:12,lineHeight:1.7,fontStyle:"italic" }}>
          EDENPORTAIL est un établissement spécialisé dans la création et le référencement de sites internet, 
          légalement reconnu et enregistré auprès des autorités commerciales de la République du Bénin. 
          MarchéduRoi est exploitée conformément aux lois et règlements en vigueur au Bénin et dans l'espace UEMOA.
        </p>
      </div>
    </div>

    {/* Footer about */}
    <div style={{ textAlign:"center",padding:"32px 0",borderTop:`1px solid ${theme.border}` }}>
      <p style={{ color:theme.sub,fontSize:14,marginBottom:16 }}>© 2026 MarchéduRoi · Tous droits réservés · Ouidah, Bénin</p>
      <button onClick={()=>setView("home")} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"12px 32px",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
        Voir les annonces →
      </button>
    </div>
  </div>
)}

    </>
  );
}

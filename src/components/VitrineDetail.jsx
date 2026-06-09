import React, { useState, useEffect } from "react";
import { useVitrineStats } from "../hooks/useVitrineStats";
import { usePresence } from "../hooks/usePresence.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import { VITRINE_THEMES, VITRINE_TYPES, NEWS_TYPES, getVitrineTheme, toSlug } from "../vitrineConstants";
import { VitrineCarousel, VitrineSection } from "./VitrineCarousel";

import VitrineEdit from "./VitrineEdit";
import VitrineDashboard from "./VitrineDashboard";
import VitrinePayment from "./VitrinePayment";
import VitrineRenewal from "./VitrineRenewal";

function VitrineDetail() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const pathname  = window.location.pathname;
  const segments  = pathname.split("/").filter(Boolean);

  // Détection sous-domaine : complexe-scolaire.vitrine.marcheduroi.com
  const hostname      = window.location.hostname;
  const isSubdomain   = hostname.includes(".vitrine.marcheduroi.com");
  const subdomainSlug = isSubdomain ? hostname.split(".vitrine.marcheduroi.com")[0] : null;

  // segments[0] = "vitrine", segments[1] = slug, segments[2] = "modifier", "payer" ou "renouveler" (optionnel)
  const slug         = subdomainSlug || segments[1];
  const isEditMode   = !isSubdomain && segments[2] === "modifier";
  const isPayMode    = !isSubdomain && segments[2] === "payer";
  const isRenewMode  = !isSubdomain && segments[2] === "renouveler";
  const tokenFromUrl = new URLSearchParams(location.search).get("token");

  const [structure, setStructure] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const { stats, liked, track, toggleLike } = useVitrineStats(structure?.id);
  const onlineCount = usePresence(slug ? `vitrine:${slug}` : null);
  const [notFound,  setNotFound]  = useState(false);
  const [isOwner,   setIsOwner]   = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [ratings,   setRatings]   = useState([]);
  const [userRating,setUserRating]= useState(0);
  const [ratingComment,setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Vérifier si l'utilisateur connecté est le propriétaire
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id && structure?.owner_id) {
        setIsOwner(session.user.id === structure.owner_id);
      }
      if (session?.user?.id) setCurrentUserId(session.user.id);
    });
  }, [structure]);

  // Charger les notations et incrémenter les vues
  useEffect(() => {
    if (!structure?.id) return;
    // Incrémenter les vues (silencieux)
    supabase.rpc("increment_vitrine_views", { structure_id: structure.id }).then(()=>{}).catch(()=>{});
    // Charger les notations
    supabase.from("vitrine_ratings").select("*").eq("structure_id", structure.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setRatings(data); });
  }, [structure?.id]);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      let query = supabase.from("structures").select("*").eq("slug", slug);
      if (!isEditMode && !isPayMode && !isRenewMode) query = query.eq("active", true);
      const { data, error } = await query.single();
      if (error || !data) setNotFound(true);
      else {
        setStructure(data);
        // ---- SEO dynamique ----
        const pageUrl = data.domain_active && data.custom_domain
          ? "https://" + data.custom_domain
          : window.location.origin + "/vitrine/" + data.slug;
        const image = data.cover_url || data.logo_url || data.photos?.[0] || window.location.origin + "/icons/icon-512x512.png";
        const desc  = (data.description || `${data.type} à ${data.ville||"Bénin"} — ${data.slogan||""}`)?.slice(0,160);

        // Title + meta
        document.title = `${data.name} — ${data.type} à ${data.ville||"Bénin"} | MarchéduRoi`;
        const setMeta = (sel, attr, val) => { const el = document.querySelector(sel); if(el) el.setAttribute(attr, val); };
        setMeta('meta[name="description"]',          "content", desc);
        setMeta('meta[property="og:title"]',         "content", `${data.name} | MarchéduRoi`);
        setMeta('meta[property="og:description"]',   "content", desc);
        setMeta('meta[property="og:image"]',         "content", image);
        setMeta('meta[property="og:url"]',           "content", pageUrl);
        setMeta('meta[property="og:type"]',          "content", "local.business");
        setMeta('meta[name="twitter:title"]',        "content", `${data.name} | MarchéduRoi`);
        setMeta('meta[name="twitter:description"]',  "content", desc);
        setMeta('meta[name="twitter:image"]',        "content", image);

        // JSON-LD structuré pour Google
        let ld = document.getElementById("vitrine-jsonld");
        if (!ld) { ld = document.createElement("script"); ld.id = "vitrine-jsonld"; ld.type = "application/ld+json"; document.head.appendChild(ld); }
        ld.textContent = JSON.stringify({
          "@context": "https://schema.org",
          "@type":    "LocalBusiness",
          "name":     data.name,
          "description": data.description || data.slogan || "",
          "url":      pageUrl,
          "image":    image,
          "telephone": data.phone || "",
          "email":    data.email  || "",
          "address":  {
            "@type":           "PostalAddress",
            "streetAddress":   data.address  || "",
            "addressLocality": data.quartier || "",
            "addressRegion":   data.ville    || "",
            "addressCountry":  "BJ"
          },
          ...(data.gps_lat && data.gps_lng ? {
            "geo": { "@type":"GeoCoordinates", "latitude": data.gps_lat, "longitude": data.gps_lng }
          } : {}),
          ...(data.hours ? { "openingHours": data.hours } : {}),
          "sameAs": [data.facebook, data.website, data.instagram].filter(Boolean),
          "priceRange": "FCFA",
          "servesCuisine": data.type === "Restaurant" ? (data.services || "") : undefined,
        });
      }
      setLoading(false);
    };
    load();
  }, [slug, isEditMode, isPayMode]);

  const handleShare = () => {
    track("partage");
    const ogUrl = `https://marcheduroi.com/vitrine/${slug}`;
    const text  = (structure?.name || "Structure") + " est sur MarchéduRoi 👑";
    if (navigator.share) navigator.share({ title: structure?.name, text, url: ogUrl });
    else { navigator.clipboard.writeText(ogUrl); alert("Lien copié !"); }
  };

  /* ---- États de chargement / erreur ---- */
  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#0D0F1A",fontFamily:"Sora,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:48,height:48,border:"4px solid #2A2D45",borderTop:`4px solid #10B981`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color:"#9A9AB0",fontSize:14 }}>Chargement de la vitrine…</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ textAlign:"center",padding:"80px 24px",fontFamily:"Sora,sans-serif",background:"#0D0F1A",minHeight:"100vh",color:"#E8E8F0" }}>
      <p style={{ fontSize:48,marginBottom:16 }}>🏗️</p>
      <h2 style={{ fontSize:24,fontWeight:700,marginBottom:12 }}>Vitrine introuvable</h2>
      <p style={{ color:"#9A9AB0",marginBottom:24 }}>Cette structure n'existe pas ou n'est plus active sur MarchéduRoi.</p>
      <button onClick={()=>navigate("/")} style={{ background:`linear-gradient(135deg,#10B981,#059669)`,border:"none",color:"#fff",padding:"12px 28px",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer" }}>
        ← Retour à l'accueil
      </button>
    </div>
  );

  /* ---- Mode modification ---- */
  if (isEditMode) return (
    <VitrineEdit
      structure={structure}
      token={tokenFromUrl}
      tokenPreValidated={true}
      onDone={() => navigate("/vitrine/" + slug)}
    />
  );

  /* ---- Mode paiement ---- */
  if (isPayMode) {
    if (!structure) return (
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#0D0F1A" }}>
        <div style={{ width:48,height:48,border:"4px solid #2A2D45",borderTop:"4px solid #10B981",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
    return (
      <VitrinePayment
        structure={structure}
        token={tokenFromUrl}
        onDone={() => navigate("/vitrine/" + slug)}
      />
    );
  }

  /* ---- Mode renouvellement ---- */
  if (isRenewMode) return (
    <VitrineRenewal
      structure={structure}
      token={tokenFromUrl}
      onDone={() => navigate("/vitrine/" + slug)}
    />
  );

  /* ---- Page publique ---- */
  const VT     = getVitrineTheme(structure);
  const COLOR  = VT.accent;
  const photos = structure.photos || [];
  const news   = structure.news   || [];

  // Extraire l'ID YouTube si présent
  const ytMatch = structure.video
    ? structure.video.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    : null;

  return (
    <div style={{ background: structure.bg_image ? `linear-gradient(${VT.bg}CC,${VT.bg}CC), url(${structure.bg_image}) center/cover fixed` : VT.bg, minHeight:"100vh",fontFamily:"Sora,sans-serif",color:VT.text }}>

      {/* ---- Navbar ---- */}
      <div style={{ background:VT.bg+"EE",borderBottom:`1px solid ${VT.border}`,padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(8px)" }}>
        <div style={{ cursor:"pointer" }} onClick={()=>navigate("/")}>
          <img src="/marcheduRoi-icon.svg" alt="MarcheduRoi" style={{ height:52,objectFit:"contain" }}/>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={toggleLike}
            style={{ background:liked?"rgba(255,101,132,0.15)":"rgba(255,101,132,0.08)", border:`1px solid ${liked?"#FF6584":"rgba(255,101,132,0.3)"}`, color:"#FF6584", padding:"8px 14px", borderRadius:8, fontWeight:600, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
            {liked?"❤️":"🤍"} {stats.likes > 0 ? stats.likes : ""}
          </button>
          <button onClick={handleShare} style={{ background:`rgba(16,185,129,0.12)`,border:`1px solid rgba(16,185,129,0.3)`,color:COLOR,padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>
            🔗 Partager
          </button>
          <button onClick={()=>navigate("/")} style={{ background:"transparent",border:`1px solid ${VT.border}`,color:VT.sub,padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>
            ← Retour
          </button>
        </div>
      </div>

      {/* ---- Bannière de couverture ---- */}
      {structure.cover_url && (
        <div style={{ width:"100%",height:220,overflow:"hidden",position:"relative" }}>
          <img src={structure.cover_url} alt="couverture" style={{ width:"100%",height:"100%",objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>
          <div style={{ position:"absolute",inset:0,background:"linear-gradient(to bottom, transparent 40%, #0D0F1A)" }}/>
        </div>
      )}

      <div style={{ maxWidth:750,margin:"0 auto",padding:`0 24px 48px` }}>

        {/* ---- Logo + Identité ---- */}
        <div style={{ display:"flex",alignItems:"flex-end",gap:16,marginTop:structure.cover_url ? -40 : 28,marginBottom:20,position:"relative",zIndex:1 }}>
          {structure.logo_url ? (
            <img src={structure.logo_url} alt="logo"
              style={{ width:84,height:84,borderRadius:18,objectFit:"cover",border:"3px solid #2A2D45",background:VT.card,flexShrink:0 }}
              onError={e=>{e.target.style.display="none";}}/>
          ) : (
            <div style={{ width:84,height:84,borderRadius:18,background:`linear-gradient(135deg,${COLOR},#059669)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,flexShrink:0,border:"3px solid #2A2D45" }}>
              🏛️
            </div>
          )}
          <div style={{ flex:1,paddingBottom:4 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6 }}>
              <span style={{ background:`rgba(16,185,129,0.15)`,color:COLOR,padding:"3px 12px",borderRadius:20,fontSize:12,fontWeight:700 }}>
                {structure.type}
              </span>
              {structure.verified && (
                <span style={{ background:"rgba(255,215,0,0.12)",color:"#FFD700",padding:"3px 12px",borderRadius:20,fontSize:12,fontWeight:700 }}>
                  ✅ Vérifié EDENPORTAIL
                </span>
              )}
            </div>
            <h1 style={{ fontSize:22,fontWeight:800,margin:0,lineHeight:1.2,color:VT.text }}>{structure.name}</h1>
            {structure.slogan && (
              <p style={{ color:VT.sub,fontSize:13,margin:"5px 0 0",fontStyle:"italic" }}>"{structure.slogan}"</p>
            )}
            {/* Stats : vues + note */}
            <div style={{ display:"flex",gap:12,marginTop:8,flexWrap:"wrap" }}>
              {structure.views_count > 0 && (
                <span style={{ color:VT.sub,fontSize:12 }}>👁️ {structure.views_count.toLocaleString("fr-FR")} vue{structure.views_count>1?"s":""}</span>
              )}
              {ratings.length > 0 && (
                <span style={{ color:"#FFD700",fontSize:12,fontWeight:700 }}>
                  ⭐ {(ratings.reduce((s,r)=>s+r.rating,0)/ratings.length).toFixed(1)} · {ratings.length} avis
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ---- Description ---- */}
        {structure.description && (
          <p style={{ color:"#B8B8CC",lineHeight:1.85,marginBottom:24,fontSize:15 }}>{structure.description}</p>
        )}

        {/* ---- Services ---- */}
        {structure.services && (
          <div style={{ background:VT.card,border:`1px solid ${VT.border}`,borderRadius:14,padding:16,marginBottom:16 }}>
            <p style={{ fontWeight:700,marginBottom:8,color:VT.text,margin:"0 0 8px" }}>✅ Services proposés</p>
            <p style={{ color:VT.sub,lineHeight:1.75,margin:0 }}>{structure.services}</p>
          </div>
        )}

        {/* ---- Stats vitrine ---- */}
        <div style={{ display:"flex",gap:16,flexWrap:"wrap",padding:"10px 0",borderTop:`1px solid ${VT.border}`,borderBottom:`1px solid ${VT.border}`,marginBottom:16 }}>
          <span style={{ color:VT.sub,fontSize:13,display:"flex",alignItems:"center",gap:4 }}>👁️ {stats.vues} vue{stats.vues>1?"s":""}</span>
          <span style={{ color:"#FF6584",fontSize:13,display:"flex",alignItems:"center",gap:4 }}>❤️ {stats.likes} j'aime</span>
          {stats.whatsapp > 0 && <span style={{ color:"#25D366",fontSize:13,display:"flex",alignItems:"center",gap:4 }}>💬 {stats.whatsapp} contact{stats.whatsapp>1?"s":""} WA</span>}
          {stats.partage > 0 && <span style={{ color:VT.sub,fontSize:13,display:"flex",alignItems:"center",gap:4 }}>📤 {stats.partage} partage{stats.partage>1?"s":""}</span>}
        </div>

        {/* ---- Contacts ---- */}
        <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:20 }}>
          {structure.phone && (
            <a href={"tel:"+structure.phone} onClick={()=>track("appel")} style={{ display:"flex",alignItems:"center",gap:12,background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",borderRadius:12,padding:16,color:"#6C63FF",textDecoration:"none",fontWeight:600,fontSize:15 }}>
              📞 {structure.phone}
            </a>
          )}
          {structure.phone2 && (
            <a href={"tel:"+structure.phone2} style={{ display:"flex",alignItems:"center",gap:12,background:"rgba(108,99,255,0.07)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:12,padding:16,color:"#6C63FF",textDecoration:"none",fontWeight:600,fontSize:15 }}>
              📞 {structure.phone2}
            </a>
          )}
          {structure.whatsapp && (
            <a href={"https://wa.me/"+structure.whatsapp.replace(/[^\d]/g,"")} target="_blank" rel="noopener noreferrer" onClick={()=>track("whatsapp")}
              style={{ display:"flex",alignItems:"center",gap:12,background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",borderRadius:12,padding:16,color:"#25D366",textDecoration:"none",fontWeight:600,fontSize:15 }}>
              💬 WhatsApp : {structure.whatsapp}
            </a>
          )}
          {structure.email && (
            <a href={"mailto:"+structure.email} style={{ display:"flex",alignItems:"center",gap:12,background:`rgba(16,185,129,0.08)`,border:`1px solid rgba(16,185,129,0.25)`,borderRadius:12,padding:16,color:COLOR,textDecoration:"none",fontWeight:600,fontSize:15 }}>
              📧 {structure.email}
            </a>
          )}
          {structure.facebook && (
            <a href={structure.facebook.startsWith("http")?structure.facebook:"https://facebook.com/"+structure.facebook} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex",alignItems:"center",gap:12,background:"rgba(24,119,242,0.1)",border:"1px solid rgba(24,119,242,0.3)",borderRadius:12,padding:16,color:"#1877F2",textDecoration:"none",fontWeight:600,fontSize:15 }}>
              📘 Page Facebook
            </a>
          )}
          {structure.website && (
            <a href={structure.website.startsWith("http")?structure.website:"https://"+structure.website} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex",alignItems:"center",gap:12,background:"rgba(255,215,0,0.07)",border:"1px solid rgba(255,215,0,0.2)",borderRadius:12,padding:16,color:"#FFD700",textDecoration:"none",fontWeight:600,fontSize:15 }}>
              🌐 Site web
            </a>
          )}
        </div>

        {/* ---- Localisation ---- */}
        {(structure.ville || structure.quartier || structure.address) && (
          <div style={{ background:VT.card,border:`1px solid ${VT.border}`,borderRadius:14,padding:16,marginBottom:16 }}>
            <p style={{ fontWeight:700,marginBottom:8,color:VT.text,margin:"0 0 8px" }}>📍 Localisation</p>
            <p style={{ color:VT.sub,margin:structure.gps_lat?"0 0 4px":"0",lineHeight:1.6 }}>
              {[structure.address, structure.quartier, structure.ville].filter(Boolean).join(", ")}
            </p>
            {structure.von && (
              <p style={{ color:VT.sub,fontSize:13,margin:`${structure.gps_lat?"0 0 8px":"0"}` }}>📌 {structure.von}</p>
            )}
            {structure.gps_lat && structure.gps_lng && (
              <a href={`https://www.google.com/maps?q=${structure.gps_lat},${structure.gps_lng}`} target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-flex",alignItems:"center",gap:6,color:"#4285F4",fontWeight:600,fontSize:14,textDecoration:"none",marginTop:4 }}>
                🗺️ Voir sur Google Maps →
              </a>
            )}
          </div>
        )}

        {/* ---- Horaires ---- */}
        {structure.hours && (
          <div style={{ background:VT.card,border:`1px solid ${VT.border}`,borderRadius:14,padding:16,marginBottom:16 }}>
            <p style={{ fontWeight:700,color:VT.text,margin:"0 0 8px" }}>🕐 Horaires d'ouverture</p>
            <p style={{ color:VT.sub,margin:0,lineHeight:1.8,whiteSpace:"pre-line",fontSize:14 }}>{structure.hours}</p>
          </div>
        )}

        {/* ---- FAQ ---- */}
        {structure.faq && structure.faq.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <p style={{ fontWeight:700,color:VT.text,marginBottom:12 }}>❓ Questions fréquentes</p>
            {structure.faq.map((item,i) => (
              <details key={i} style={{ background:VT.card,border:`1px solid ${VT.border}`,borderRadius:10,marginBottom:8,overflow:"hidden" }}>
                <summary style={{ padding:"12px 16px",cursor:"pointer",fontWeight:700,color:VT.text,fontSize:14,listStyle:"none",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <span>{item.question}</span>
                  <span style={{ color:VT.sub,fontSize:16,flexShrink:0,marginLeft:8 }}>＋</span>
                </summary>
                <div style={{ padding:"0 16px 12px",color:VT.sub,fontSize:13,lineHeight:1.7,borderTop:`1px solid ${VT.border}` }}>
                  <p style={{ margin:"10px 0 0" }}>{item.reponse}</p>
                </div>
              </details>
            ))}
          </div>
        )}

        {/* ---- Galerie photos ---- */}
        {photos.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <p style={{ fontWeight:700,marginBottom:12,color:VT.text }}>🖼️ Galerie</p>
            <VitrineCarousel photos={photos} borderColor={VT.border}/>
          </div>
        )}

        {/* ---- Vidéo YouTube ---- */}
        {ytMatch && (
          <div style={{ marginBottom:24 }}>
            <p style={{ fontWeight:700,marginBottom:12,color:VT.text }}>🎬 Vidéo de présentation</p>
            <div style={{ borderRadius:14,overflow:"hidden",aspectRatio:"16/9",border:`1px solid ${VT.border}` }}>
              <iframe
                width="100%" height="100%"
                src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                title="Vidéo de présentation" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen style={{ display:"block" }}/>
            </div>
          </div>
        )}

        {/* ---- Champs personnalisés ---- */}
        {(structure.custom_fields || []).length > 0 && (
          <div style={{ marginBottom:24 }}>
            {(structure.custom_fields || []).map((f, i) => f.label && (
              <div key={i} style={{ background:VT.card,border:`1px solid ${VT.border}`,borderRadius:14,padding:16,marginBottom:12 }}>
                <p style={{ fontWeight:700,color:VT.text,margin:"0 0 8px",fontSize:15 }}>{f.label}</p>
                <p style={{ color:VT.sub,margin:0,lineHeight:1.8,fontSize:14,whiteSpace:"pre-line" }}>{f.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ---- Actualités ---- */}
        {news.length > 0 && (
          <div style={{ marginBottom:28 }}>
            <p style={{ fontWeight:700,marginBottom:14,color:VT.text }}>📰 Actualités & Promotions</p>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              {news.map((item, i) => {
                // Couleur selon le type
                const typeColors = {
                  "Promotion":  { bg:"rgba(255,71,87,0.08)",  border:"rgba(255,71,87,0.3)",  text:"#FF4757", icon:"🔥" },
                  "Nouveauté":  { bg:"rgba(16,185,129,0.08)", border:"rgba(16,185,129,0.3)", text:COLOR,     icon:"🆕" },
                  "Événement":  { bg:"rgba(108,99,255,0.08)", border:"rgba(108,99,255,0.3)", text:"#6C63FF", icon:"🎉" },
                  "Offre d'emploi": { bg:"rgba(255,215,0,0.06)", border:"rgba(255,215,0,0.25)", text:"#FFD700", icon:"💼" },
                  "Actualité":  { bg:"rgba(255,255,255,0.03)", border:VT.border,             text:VT.sub, icon:"📢" },
                };
                const style = typeColors[item.type] || typeColors["Actualité"];
                return (
                  <div key={i} style={{ background:style.bg, border:`1px solid ${style.border}`, borderRadius:12, padding:16 }}>
                    {/* Ligne 1 : Badge type (gauche) + Date (droite) */}
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                      {item.type ? (
                        <span style={{ background:style.bg,border:`1px solid ${style.border}`,color:style.text,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700 }}>
                          {style.icon} {item.type}
                        </span>
                      ) : <span/>}
                      {item.date && <span style={{ color:VT.sub,fontSize:12 }}>{item.date}</span>}
                    </div>
                    {/* Ligne 2 : Titre */}
                    <p style={{ fontWeight:700,color:VT.text,margin:"0 0 8px",fontSize:15,lineHeight:1.4 }}>{item.title}</p>
                    {/* Ligne 3 : Contenu */}
                    {item.content && <p style={{ color:"#B8B8CC",margin:0,lineHeight:1.75,fontSize:14,whiteSpace:"pre-line" }}>{item.content}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- Vous gérez cette structure ? ---- */}
        {isOwner ? (
          <div style={{ background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:14,padding:16,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
            <div>
              <p style={{ fontWeight:700,color:COLOR,margin:"0 0 4px",fontSize:14 }}>✅ Vous gérez cette vitrine</p>
              <p style={{ color:VT.sub,fontSize:13,margin:0 }}>Modifiez vos infos, ajoutez une actualité, mettez à jour vos photos…</p>
            </div>
            <a href={`/vitrine/${slug}/modifier?token=${structure.edit_token}&section=contacts`}
              style={{ background:`linear-gradient(135deg,${COLOR},#059669)`,border:"none",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:13,textDecoration:"none",flexShrink:0,whiteSpace:"nowrap" }}>
              ✏️ Modifier ma vitrine
            </a>
            <button onClick={()=>setShowDashboard(true)}
              style={{ background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", color:"#10B981", padding:"10px 16px", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer" }}>
              📊 Mes stats
            </button>
          </div>
        ) : (
          <div style={{ background:"rgba(108,99,255,0.06)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:14,padding:16,marginBottom:20 }}>
            <p style={{ fontWeight:700,color:"#6C63FF",margin:"0 0 4px",fontSize:14 }}>🔑 Vous gérez cette structure ?</p>
            <p style={{ color:VT.sub,fontSize:13,margin:0,lineHeight:1.7 }}>
              Connectez-vous avec le compte utilisé lors de la création pour accéder aux options de modification.
            </p>
          </div>
        )}

        {/* ---- Partage ---- */}
        <div style={{ display:"flex",gap:10,marginBottom:24,flexWrap:"wrap" }}>
          {/* Suggérer à un ami via WhatsApp */}
          <a href={"https://wa.me/?text="+encodeURIComponent(`👋 Hé ! J'ai pensé à toi en voyant cette vitrine sur MarchéduRoi 👑\n🏛️ ${structure.name}\n📍 ${structure.ville||""}\n👉 https://marcheduroi.com/vitrine/${slug}`)}
              onClick={()=>track("suggestion")}
            target="_blank" rel="noopener noreferrer"
            style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",borderRadius:12,padding:12,color:"#25D366",textDecoration:"none",fontWeight:700,fontSize:14,minWidth:140 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            📤 Suggérer à un ami
          </a>
          {/* Facebook — utilise vitrine-og pour avoir la bonne image */}
          <a href={"https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(`https://marcheduroi.com/vitrine/${slug}`)}
            target="_blank" rel="noopener noreferrer"
            style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"rgba(24,119,242,0.1)",border:"1px solid rgba(24,119,242,0.3)",borderRadius:12,padding:12,color:"#1877F2",textDecoration:"none",fontWeight:700,fontSize:14,minWidth:100 }}>
            📘 Facebook
          </a>
          {/* Copier le lien — même résultat que le bouton partage en haut */}
          <button onClick={handleShare}
            style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:`rgba(16,185,129,0.1)`,border:`1px solid rgba(16,185,129,0.3)`,borderRadius:12,padding:12,color:COLOR,fontWeight:700,fontSize:14,cursor:"pointer",minWidth:100 }}>
            🔗 Partager
          </button>
        </div>

        {/* ---- Notations ---- */}
        <div style={{ background:VT.card,border:`1px solid ${VT.border}`,borderRadius:14,padding:20,marginBottom:20 }}>
          <p style={{ fontWeight:700,color:VT.text,marginBottom:16,fontSize:15 }}>
            ⭐ Avis clients
            {ratings.length > 0 && <span style={{ color:"#FFD700",marginLeft:8,fontSize:14 }}>
              {(ratings.reduce((s,r)=>s+r.rating,0)/ratings.length).toFixed(1)} / 5 · {ratings.length} avis
            </span>}
          </p>

          {/* Formulaire de notation */}
          {currentUserId && !isOwner && !ratings.find(r=>r.user_id===currentUserId) && (
            <div style={{ background:`rgba(16,185,129,0.06)`,border:`1px solid rgba(16,185,129,0.2)`,borderRadius:12,padding:14,marginBottom:16 }}>
              <p style={{ color:VT.sub,fontSize:13,marginBottom:10 }}>Donnez votre avis :</p>
              <div style={{ display:"flex",gap:4,marginBottom:10,flexWrap:"wrap",alignItems:"center" }}>
                {[1,2,3,4,5].map(n=>(
                  <button key={n} onClick={()=>setUserRating(n)}
                    style={{ fontSize:24,background:"none",border:"none",cursor:"pointer",opacity:n<=userRating?1:0.3,transition:"all 0.15s",padding:"2px",WebkitTapHighlightColor:"transparent" }}>
                    ⭐
                  </button>
                ))}
                {userRating > 0 && <span style={{ color:VT.sub,fontSize:12,alignSelf:"center" }}>{userRating}/5</span>}
              </div>
              <textarea style={{ width:"100%",background:VT.bg,border:`1px solid ${VT.border}`,borderRadius:8,padding:"10px 12px",color:VT.text,fontSize:13,fontFamily:"Sora,sans-serif",resize:"vertical",minHeight:60,boxSizing:"border-box",outline:"none" }}
                value={ratingComment} onChange={e=>setRatingComment(e.target.value)}
                placeholder="Commentaire optionnel…"/>
              <button disabled={userRating===0||submittingRating} onClick={async()=>{
                if (!userRating) return;
                setSubmittingRating(true);
                const { error } = await supabase.from("vitrine_ratings").insert({
                  structure_id: structure.id, user_id: currentUserId,
                  rating: userRating, comment: ratingComment.trim()||null,
                });
                if (!error) {
                  const newR = { structure_id:structure.id, user_id:currentUserId, rating:userRating, comment:ratingComment.trim()||null, created_at:new Date().toISOString() };
                  setRatings(prev=>[newR,...prev]);
                  setUserRating(0); setRatingComment("");
                }
                setSubmittingRating(false);
              }} style={{ marginTop:10,background:userRating?`linear-gradient(135deg,${COLOR},#059669)`:"#2A2D45",border:"none",color:userRating?"#fff":VT.sub,padding:"9px 20px",borderRadius:8,fontWeight:700,fontSize:13,cursor:userRating?"pointer":"not-allowed" }}>
                {submittingRating?"Envoi…":"✅ Publier mon avis"}
              </button>
            </div>
          )}

          {/* Liste des avis */}
          {ratings.length === 0 && (
            <p style={{ color:VT.sub,fontSize:13,textAlign:"center",padding:"8px 0" }}>Aucun avis pour l'instant. Soyez le premier !</p>
          )}
          {ratings.slice(0,5).map((r,i)=>(
            <div key={i} style={{ borderBottom:i<Math.min(ratings.length,5)-1?`1px solid ${VT.border}`:"none",paddingBottom:12,marginBottom:12 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                <span style={{ color:"#FFD700",fontSize:16 }}>{"⭐".repeat(r.rating)}</span>
                <span style={{ color:VT.sub,fontSize:11 }}>{r.created_at?.slice(0,10)}</span>
              </div>
              {r.comment && <p style={{ color:VT.sub,fontSize:13,margin:0,lineHeight:1.6 }}>{r.comment}</p>}
            </div>
          ))}
        </div>

        {/* ---- QR Code ---- */}
        <div style={{ background:VT.card,border:`1px solid ${VT.border}`,borderRadius:14,padding:20,marginBottom:20,textAlign:"center" }}>
          <p style={{ fontWeight:700,color:VT.text,marginBottom:12,fontSize:14 }}>📱 QR Code de cette vitrine</p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent((structure.domain_active&&structure.custom_domain)?"https://"+structure.custom_domain:window.location.origin+"/vitrine/"+slug)}&bgcolor=1A1D30&color=10B981&margin=10`}
            alt="QR Code"
            style={{ borderRadius:10,width:160,height:160,display:"block",margin:"0 auto 12px" }}/>
          <p style={{ color:VT.sub,fontSize:12,marginBottom:12 }}>Imprimez-le sur vos cartes de visite, affiches et menus</p>
          <a href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent((structure.domain_active&&structure.custom_domain)?"https://"+structure.custom_domain:window.location.origin+"/vitrine/"+slug)}&bgcolor=ffffff&color=059669&margin=20`}
            download={`qrcode-${slug}.png`} target="_blank" rel="noopener noreferrer"
            style={{ display:"inline-flex",alignItems:"center",gap:6,background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",color:COLOR,padding:"8px 18px",borderRadius:10,fontWeight:700,fontSize:13,textDecoration:"none" }}>
            ⬇️ Télécharger le QR Code
          </a>
        </div>

        <button onClick={()=>navigate("/")}
          style={{ width:"100%",padding:15,background:`linear-gradient(135deg,${COLOR},#059669)`,border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer" }}>
          ← Retour à MarchéduRoi
        </button>

      </div>
    </div>
  );
}


// -----------------------------------------------
// VitrineDirectory — Annuaire public /vitrines
// -----------------------------------------------

export default VitrineDetail;

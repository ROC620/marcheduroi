import React, { useState, useEffect } from "react";
import { getThemeFromStorage, getDistance, formatDistance } from "../utils";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import { VITRINE_THEMES, VITRINE_TYPES, NEWS_TYPES, getVitrineTheme, toSlug } from "../vitrineConstants";




function VitrineDirectory() {
  const navigate  = useNavigate();
  const COLOR     = "#10B981";
  const T         = getThemeFromStorage();

  const [structures,  setStructures]  = React.useState([]);
  const [loading,     setLoading]     = React.useState(true);
  const [search,      setSearch]      = React.useState("");
  const [filterType,  setFilterType]  = React.useState("Tous");
  const [filterVille, setFilterVille] = React.useState("Toutes");
  const [userPos,     setUserPos]     = React.useState(null);  // {lat, lng}
  const [gpsLoading,  setGpsLoading]  = React.useState(false);
  const [gpsError,    setGpsError]    = React.useState(null);
  const [radius,      setRadius]      = React.useState(20);    // km
  const [nearbyMode,  setNearbyMode]  = React.useState(false);

  React.useEffect(() => {
    document.title = "Annuaire VitrineWeb — Structures & Établissements | MarchéduRoi";
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", "Découvrez restaurants, écoles, cliniques et commerces près de chez vous au Bénin et en Afrique.");
    supabase.from("structures")
      .select("id,slug,name,type,ville,quartier,slogan,logo_url,cover_url,verified,phone,whatsapp,services,gps_lat,gps_lng")
      .eq("active", true).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setStructures(data); setLoading(false); });
  }, []);

  // Formule Haversine — distance en km entre deux points GPS
  const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLng = (lng2-lng1) * Math.PI/180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
              Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
              Math.sin(dLng/2)*Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // Activer le mode "Près de moi"
  const handleNearby = () => {
    if (!navigator.geolocation) { setGpsError("GPS non disponible sur cet appareil."); return; }
    setGpsLoading(true); setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearbyMode(true);
        setFilterVille("Toutes"); // Désactiver filtre ville
        setGpsLoading(false);
      },
      () => { setGpsError("Impossible d'accéder à votre position. Vérifiez les permissions."); setGpsLoading(false); }
    );
  };

  // Filtres dynamiques
  const types  = ["Tous",  ...new Set(structures.map(s=>s.type).filter(Boolean))];
  const villes = ["Toutes",...new Set(structures.map(s=>s.ville).filter(Boolean))];

  // Structures avec distance calculée
  const structuresWithDist = structures.map(s => {
    if (userPos && s.gps_lat && s.gps_lng) {
      return { ...s, distance: haversine(userPos.lat, userPos.lng, parseFloat(s.gps_lat), parseFloat(s.gps_lng)) };
    }
    return { ...s, distance: null };
  });

  const filtered = structuresWithDist.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.type?.toLowerCase().includes(q) || s.ville?.toLowerCase().includes(q) || s.services?.toLowerCase().includes(q);
    const matchType   = filterType  === "Tous"   || s.type  === filterType;
    const matchVille  = !nearbyMode && (filterVille === "Toutes" || s.ville === filterVille);
    const matchNearby = !nearbyMode || (s.distance !== null && s.distance <= radius);
    return matchSearch && matchType && (nearbyMode ? matchNearby : matchVille);
  }).sort((a,b) => {
    if (nearbyMode && a.distance !== null && b.distance !== null) return a.distance - b.distance;
    return 0;
  });

  const inp = { background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"11px 14px", color:T.text, fontSize:14, fontFamily:"Sora,sans-serif", outline:"none" };

  return (
    <div style={{ background:T.bg, minHeight:"100vh", fontFamily:"Sora,sans-serif", color:T.text }}>

      {/* Navbar */}
      <div style={{ background:T.bg+"EE", borderBottom:`1px solid ${T.border}`, padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, backdropFilter:"blur(8px)" }}>
        <div style={{ cursor:"pointer" }} onClick={()=>navigate("/")}>
          <img src="/marcheduRoi-icon.svg" alt="MarcheduRoi" style={{ height:52, objectFit:"contain" }}/>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>navigate("/vitrine")}
            style={{ background:`rgba(16,185,129,0.12)`, border:`1px solid rgba(16,185,129,0.3)`, color:COLOR, padding:"8px 14px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer" }}>
            + Créer ma vitrine
          </button>
          <button onClick={()=>navigate("/")}
            style={{ background:"transparent", border:`1px solid ${T.border}`, color:T.sub, padding:"8px 14px", borderRadius:8, fontWeight:600, fontSize:13, cursor:"pointer" }}>
            ← Retour
          </button>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 24px 64px" }}>

        {/* En-tête */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>🏛️ Annuaire VitrineWeb</h1>
          <p style={{ color:T.sub, fontSize:15 }}>Toutes les structures référencées sur MarchéduRoi au Bénin et en Afrique</p>
          <p style={{ color:COLOR, fontWeight:700, fontSize:18, margin:"12px 0 0" }}>{structures.length} structure{structures.length>1?"s":""} référencée{structures.length>1?"s":""}</p>
        </div>

        {/* Bouton GPS + rayon */}
        <div style={{ display:"flex",gap:10,marginBottom:12,flexWrap:"wrap",alignItems:"center" }}>
          <button onClick={nearbyMode ? ()=>{setNearbyMode(false);setUserPos(null);} : handleNearby}
            disabled={gpsLoading}
            style={{ display:"flex",alignItems:"center",gap:8,padding:"11px 18px",borderRadius:10,fontWeight:700,fontSize:14,cursor:gpsLoading?"wait":"pointer",border:"none",background:nearbyMode?`linear-gradient(135deg,${COLOR},#059669)`:"rgba(16,185,129,0.12)",color:nearbyMode?"#fff":COLOR,transition:"all 0.2s" }}>
            {gpsLoading ? "⏳ Localisation…" : nearbyMode ? "📍 Près de moi (actif)" : "📍 Près de moi"}
          </button>
          {nearbyMode && (
            <select value={radius} onChange={e=>setRadius(Number(e.target.value))}
              style={{...inp,padding:"10px 14px",cursor:"pointer",width:"auto"}}>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
          )}
          {nearbyMode && userPos && (
            <span style={{ color:T.sub,fontSize:13 }}>
              📌 {filtered.length} résultat{filtered.length>1?"s":""} dans un rayon de {radius} km
            </span>
          )}
        </div>

        {/* Message erreur GPS */}
        {gpsError && (
          <div style={{ background:"rgba(255,71,87,0.08)",border:"1px solid rgba(255,71,87,0.25)",borderRadius:10,padding:12,marginBottom:12 }}>
            <p style={{ margin:0,color:"#FF4757",fontSize:13 }}>⚠️ {gpsError}</p>
          </div>
        )}

        {/* Barre de recherche + filtres */}
        <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
          <input style={{ ...inp, flex:2, minWidth:200 }} value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="🔍 Rechercher par nom, type, ville…"/>
          <select style={{ ...inp, cursor:"pointer", flex:1, minWidth:140 }} value={filterType} onChange={e=>setFilterType(e.target.value)}>
            {types.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          {!nearbyMode && (
            <select style={{ ...inp, cursor:"pointer", flex:1, minWidth:140 }} value={filterVille} onChange={e=>setFilterVille(e.target.value)}>
              {villes.map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          )}
        </div>

        {/* Résultats */}
        {loading && <p style={{ color:T.sub, textAlign:"center", padding:32 }}>Chargement…</p>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:48 }}>
            <p style={{ fontSize:32, marginBottom:8 }}>🔍</p>
            <p style={{ color:T.sub }}>
              {nearbyMode ? `Aucune structure trouvée dans un rayon de ${radius} km.` : "Aucune structure trouvée pour cette recherche."}
            </p>
            {nearbyMode && <button onClick={()=>setRadius(r=>Math.min(r*2,200))} style={{ marginTop:12,background:`rgba(16,185,129,0.12)`,border:`1px solid rgba(16,185,129,0.3)`,color:COLOR,padding:"10px 20px",borderRadius:10,fontWeight:700,cursor:"pointer" }}>Élargir à {Math.min(radius*2,200)} km</button>}
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px,1fr))", gap:16 }}>
          {filtered.map(s => (
            <div key={s.id} onClick={()=>navigate("/vitrine/"+s.slug)}
              style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden", cursor:"pointer", transition:"transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.3)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>

              {/* Couverture */}
              <div style={{ height:90, background: s.cover_url ? `url(${s.cover_url}) center/cover` : `linear-gradient(135deg, rgba(16,185,129,0.3), rgba(108,99,255,0.3))`, position:"relative" }}>
                <div style={{ position:"absolute", bottom:-24, left:16 }}>
                  {s.logo_url ? (
                    <img src={s.logo_url} alt={s.name} style={{ width:48, height:48, borderRadius:12, objectFit:"cover", border:`3px solid ${T.card}`, background:T.card }} onError={e=>e.target.style.display="none"}/>
                  ) : (
                    <div style={{ width:48, height:48, borderRadius:12, background:`linear-gradient(135deg,${COLOR},#059669)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, border:`3px solid ${T.card}` }}>🏛️</div>
                  )}
                </div>
                {s.verified && (
                  <div style={{ position:"absolute", top:8, right:8, background:"rgba(255,215,0,0.9)", borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:700, color:"#000" }}>✅ Vérifié</div>
                )}
                {/* Badge distance */}
                {nearbyMode && s.distance !== null && (
                  <div style={{ position:"absolute", top:8, left:8, background:"rgba(16,185,129,0.9)", borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:700, color:"#fff" }}>
                    📍 {s.distance < 1 ? Math.round(s.distance*1000)+"m" : s.distance.toFixed(1)+"km"}
                  </div>
                )}
              </div>

              {/* Contenu */}
              <div style={{ padding:"28px 14px 14px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, flexWrap:"wrap" }}>
                  <span style={{ background:`rgba(16,185,129,0.1)`, color:COLOR, padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700 }}>{s.type}</span>
                  {s.ville && <span style={{ color:T.sub, fontSize:11 }}>📍 {s.ville}{s.quartier?", "+s.quartier:""}</span>}
                </div>
                <p style={{ fontWeight:700, fontSize:15, color:T.text, margin:"0 0 4px" }}>{s.name}</p>
                {s.slogan && <p style={{ color:T.sub, fontSize:12, margin:0, lineHeight:1.5, fontStyle:"italic" }}>"{s.slogan}"</p>}

                {/* Contact rapide */}
                {(s.phone || s.whatsapp) && (
                  <div style={{ marginTop:10, display:"flex", gap:6 }}>
                    {s.phone && (
                      <a href={"tel:"+s.phone} onClick={e=>e.stopPropagation()}
                        style={{ flex:1, textAlign:"center", background:"rgba(108,99,255,0.1)", border:"1px solid rgba(108,99,255,0.2)", borderRadius:8, padding:"6px 4px", color:"#6C63FF", fontSize:11, fontWeight:700, textDecoration:"none" }}>
                        📞 Appeler
                      </a>
                    )}
                    {s.whatsapp && (
                      <a href={"https://wa.me/"+s.whatsapp.replace(/[^\d]/g,"")} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
                        style={{ flex:1, textAlign:"center", background:"rgba(37,211,102,0.1)", border:"1px solid rgba(37,211,102,0.2)", borderRadius:8, padding:"6px 4px", color:"#25D366", fontSize:11, fontWeight:700, textDecoration:"none" }}>
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA bas de page */}
        <div style={{ textAlign:"center", marginTop:48, padding:32, background:`rgba(16,185,129,0.06)`, border:`1px solid rgba(16,185,129,0.2)`, borderRadius:16 }}>
          <p style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>Votre structure n'est pas encore référencée ?</p>
          <p style={{ color:T.sub, marginBottom:20 }}>Créez votre VitrineWeb dès aujourd'hui pour 15 000 FCFA.</p>
          <button onClick={()=>navigate("/vitrine")}
            style={{ background:`linear-gradient(135deg,${COLOR},#059669)`, border:"none", color:"#fff", padding:"14px 36px", borderRadius:12, fontWeight:800, fontSize:16, cursor:"pointer" }}>
            🏛️ Créer ma vitrine
          </button>
        </div>
      </div>
    </div>
  );
}



export default VitrineDirectory;

// src/components/CarteVisite.jsx
// Carte de visite numérique pour les vitrines MarchéduRoi
// Modes : modal (structure passée en prop) ou page autonome (charge depuis Supabase)

import React, { useRef, useState, useEffect } from "react";
import { supabase } from "../supabase";
import { getVitrineTheme } from "../vitrineConstants";

const DOMAIN = "https://marcheduroi.com";

function CarteVisite({ structure: structureProp, slug: slugProp, onClose }) {
  const cardRef   = useRef();
  const [structure,    setStructure]    = useState(structureProp || null);
  const [loading,      setLoading]      = useState(!structureProp);
  const [downloading,  setDownloading]  = useState(false);
  const [copied,       setCopied]       = useState(false);

  // Charger la structure si pas passée en prop (mode page)
  useEffect(() => {
    if (structureProp) { setStructure(structureProp); return; }
    const slug = slugProp || window.location.pathname.split("/")[2];
    if (!slug) return;
    supabase.from("structures")
      .select("id,slug,name,type,ville,quartier,phone,whatsapp,logo_url,theme,slogan")
      .eq("slug", slug).eq("active", true).maybeSingle()
      .then(({ data }) => { setStructure(data); setLoading(false); });
  }, [structureProp, slugProp]);

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#0D0F1A",color:"#9A9AB0",fontFamily:"Sora,sans-serif" }}>
      Chargement…
    </div>
  );

  if (!structure) return null;

  const VT      = getVitrineTheme(structure);
  const COLOR   = VT.accent || "#10B981";
  const pageUrl = `${DOMAIN}/vitrine/${structure.slug}`;
  const carteUrl= `${DOMAIN}/vitrine/${structure.slug}/carte`;
  const qrUrl   = `https://quickchart.io/qr?text=${encodeURIComponent(pageUrl)}&size=140&dark=${COLOR.replace("#","")}&light=ffffff&margin=2`;

  // ── Téléchargement PNG ────────────────────────────────────────
  const downloadPNG = async () => {
    setDownloading(true);
    try {
      const h2c = (await import("html2canvas")).default;
      const canvas = await h2c(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `carte-${structure.slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      alert("Erreur lors de la génération de l'image. Réessayez.");
    } finally {
      setDownloading(false);
    }
  };

  // ── Partage du lien ───────────────────────────────────────────
  const shareLink = async () => {
    const text = `🏛️ ${structure.name}\n📍 ${structure.ville || ""}${structure.quartier ? ", "+structure.quartier : ""}\n🔗 ${carteUrl}`;
    if (navigator.share) {
      navigator.share({ title: structure.name, text, url: carteUrl });
    } else {
      await navigator.clipboard.writeText(carteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ── Carte visuelle ────────────────────────────────────────────
  const Card = (
    <div ref={cardRef} style={{
      width: 360,
      background: VT.bg || "#0D0F1A",
      borderRadius: 20,
      overflow: "hidden",
      fontFamily: "Sora, system-ui, sans-serif",
      position: "relative",
      boxShadow: `0 0 0 1.5px ${COLOR}44`,
    }}>
      {/* Bandeau couleur thème */}
      <div style={{ height: 8, background: `linear-gradient(90deg, ${COLOR}, ${COLOR}99)` }}/>

      {/* Corps */}
      <div style={{ padding: "28px 28px 20px" }}>

        {/* Logo + type */}
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
          {structure.logo_url ? (
            <img src={structure.logo_url} alt={structure.name}
              crossOrigin="anonymous"
              style={{ width:72, height:72, borderRadius:14, objectFit:"cover", border:`2px solid ${COLOR}55`, flexShrink:0 }}/>
          ) : (
            <div style={{ width:72, height:72, borderRadius:14, background:`linear-gradient(135deg,${COLOR},${COLOR}88)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>
              🏛️
            </div>
          )}
          <div>
            <span style={{ display:"inline-block", background:`${COLOR}22`, color:COLOR, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, marginBottom:6 }}>
              {structure.type}
            </span>
            <p style={{ margin:0, fontSize:18, fontWeight:800, color:VT.text||"#E8E8F0", lineHeight:1.2 }}>
              {structure.name}
            </p>
          </div>
        </div>

        {/* Slogan */}
        {structure.slogan && (
          <p style={{ margin:"0 0 16px", fontSize:12, color:VT.sub||"#9A9AB0", fontStyle:"italic", lineHeight:1.5 }}>
            "{structure.slogan}"
          </p>
        )}

        {/* Séparateur */}
        <div style={{ height:1, background:`${COLOR}33`, marginBottom:16 }}/>

        {/* Localisation */}
        {(structure.ville || structure.quartier) && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <span style={{ fontSize:16 }}>📍</span>
            <span style={{ fontSize:13, color:VT.text||"#E8E8F0", fontWeight:600 }}>
              {[structure.ville, structure.quartier].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* Téléphone */}
        {structure.phone && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <span style={{ fontSize:16 }}>📞</span>
            <span style={{ fontSize:13, color:VT.text||"#E8E8F0", fontWeight:600 }}>{structure.phone}</span>
          </div>
        )}

        {/* WhatsApp */}
        {structure.whatsapp && structure.whatsapp !== structure.phone && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <span style={{ fontSize:16 }}>💬</span>
            <span style={{ fontSize:13, color:VT.text||"#E8E8F0", fontWeight:600 }}>{structure.whatsapp}</span>
          </div>
        )}

        {/* Séparateur */}
        <div style={{ height:1, background:`${COLOR}33`, margin:"16px 0" }}/>

        {/* QR Code + invitation */}
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <img src={qrUrl} alt="QR Code" crossOrigin="anonymous"
            style={{ width:90, height:90, borderRadius:10, border:`1px solid ${COLOR}44` }}/>
          <div>
            <p style={{ margin:"0 0 4px", fontSize:12, color:VT.sub||"#9A9AB0", fontWeight:600 }}>
              Scannez pour visiter
            </p>
            <p style={{ margin:0, fontSize:11, color:COLOR, wordBreak:"break-all", lineHeight:1.4 }}>
              marcheduroi.com/vitrine/{structure.slug}
            </p>
          </div>
        </div>
      </div>

      {/* Footer MarchéduRoi */}
      <div style={{ background:`${COLOR}18`, borderTop:`1px solid ${COLOR}33`, padding:"10px 28px", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        <img src="/marcheduRoi-icon.svg" alt="MarchéduRoi"
          style={{ height:20, opacity:0.7 }}
          crossOrigin="anonymous"/>
        <span style={{ fontSize:11, color:VT.sub||"#9A9AB0", fontWeight:600 }}>marcheduroi.com</span>
      </div>
    </div>
  );

  // ── Rendu modal ou page ───────────────────────────────────────
  const isPage = !onClose; // mode page si pas de onClose

  return (
    <div style={{
      position: isPage ? "relative" : "fixed",
      inset: isPage ? "auto" : 0,
      background: isPage ? VT.bg : "rgba(0,0,0,0.85)",
      zIndex: isPage ? "auto" : 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      minHeight: isPage ? "100vh" : "auto",
      padding: isPage ? "40px 16px" : "24px 16px",
      fontFamily: "Sora, sans-serif",
    }}>

      {/* Bouton fermer (mode modal) */}
      {onClose && (
        <button onClick={onClose}
          style={{ position:"absolute", top:20, right:20, background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", width:40, height:40, borderRadius:"50%", fontSize:18, cursor:"pointer" }}>
          ✕
        </button>
      )}

      {/* Titre */}
      <p style={{ color: VT.sub||"#9A9AB0", fontSize:13, marginBottom:20, textAlign:"center" }}>
        🪪 Carte de visite numérique
      </p>

      {/* La carte */}
      {Card}

      {/* Boutons d'action */}
      <div style={{ display:"flex", gap:10, marginTop:24, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={downloadPNG} disabled={downloading}
          style={{ background:`linear-gradient(135deg,${COLOR},${COLOR}CC)`, border:"none", color:"#fff", padding:"12px 22px", borderRadius:10, fontWeight:700, fontSize:14, cursor:downloading?"wait":"pointer" }}>
          {downloading ? "⏳ Génération..." : "⬇️ Télécharger PNG"}
        </button>
        <button onClick={shareLink}
          style={{ background:"transparent", border:`1px solid ${COLOR}`, color:COLOR, padding:"12px 22px", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer" }}>
          {copied ? "✅ Lien copié !" : "🔗 Partager le lien"}
        </button>
      </div>

      {isPage && (
        <a href={`/vitrine/${structure.slug}`}
          style={{ marginTop:16, color:VT.sub||"#9A9AB0", fontSize:13, textDecoration:"none" }}>
          ← Retour à la vitrine
        </a>
      )}
    </div>
  );
}

export default CarteVisite;

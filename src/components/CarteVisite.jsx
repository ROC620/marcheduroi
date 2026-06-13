// src/components/CarteVisite.jsx
// Carte de visite numérique — format paysage imprimable (85×55mm)
// Modes : modal (structure passée en prop) ou page autonome (charge depuis Supabase)

import React, { useRef, useState, useEffect } from "react";
import { supabase } from "../supabase";
import { getVitrineTheme } from "../vitrineConstants";

const DOMAIN = "https://marcheduroi.com";
const DARK   = "#0D1117";

// Formate +229XXXXXXXXXX -> +229 XX XX XX XX XX
const formatPhone = (phone) => {
  if (!phone) return phone;
  const match = phone.match(/^(\+\d{1,4})(\d+)$/);
  if (!match) return phone;
  const [, prefix, digits] = match;
  const pairs = digits.match(/.{1,2}/g) || [];
  return `${prefix} ${pairs.join(" ")}`;
};

function CarteVisite({ structure: structureProp, slug: slugProp, onClose }) {
  const cardRef   = useRef();
  const [structure,    setStructure]    = useState(structureProp || null);
  const [loading,      setLoading]      = useState(!structureProp);
  const [downloading,  setDownloading]  = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [showEditor,   setShowEditor]   = useState(false);
  const [custom, setCustom] = useState({
    name: "", slogan: "", note: "",
    showQuartier: true, showWhatsapp: true, showSlogan: true,
    color: "",
  });

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
  const COLOR   = custom.color || VT.accent || "#10B981";
  const displayName   = custom.name   || structure.name;
  const displaySlogan = custom.slogan || structure.slogan;
  const pageUrl = `${DOMAIN}/vitrine/${structure.slug}`;
  const carteUrl= `${DOMAIN}/vitrine/${structure.slug}/carte`;
  const qrUrl   = `https://quickchart.io/qr?text=${encodeURIComponent(pageUrl)}&size=300&dark=${COLOR.replace("#","")}&light=ffffff&margin=1`;

  // ── Téléchargement PNG haute résolution ───────────────────────
  const downloadPNG = async () => {
    setDownloading(true);
    try {
      const h2c = (await import("html2canvas")).default;
      const canvas = await h2c(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `carte-visite-${structure.slug}.png`;
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

  // ── Ligne info (icône + label + valeur) ───────────────────────
  const InfoRow = ({ icon, label, value }) => !value ? null : (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:11 }}>
      <div style={{ width:30, height:30, borderRadius:"50%", border:`1.5px solid ${COLOR}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0, color:COLOR }}>
        {icon}
      </div>
      <div style={{ lineHeight:1.25 }}>
        {label && <div style={{ fontSize:9, fontWeight:800, color:COLOR, letterSpacing:0.5, textTransform:"uppercase" }}>{label}</div>}
        <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{value}</div>
      </div>
    </div>
  );

  // ── Carte visuelle — format paysage 85×55mm (680×440px) ────────
  const Card = (
    <div ref={cardRef} style={{
      width: 680,
      height: 440,
      borderRadius: 22,
      overflow: "hidden",
      position: "relative",
      display: "flex",
      fontFamily: "Sora, system-ui, sans-serif",
      background: "#fff",
      boxShadow: "0 4px 30px rgba(0,0,0,0.15)",
    }}>
      {/* Panneau gauche (sombre) */}
      <div style={{ width: "60%", background: DARK, position:"relative", padding: "28px 26px", display:"flex", flexDirection:"column", overflow:"hidden" }}>

        <div style={{ position:"absolute", top:0, right:-46, width:90, height:"140%", background:COLOR, transform:"skewX(-12deg)" }}/>

        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14, position:"relative", zIndex:1 }}>
          {structure.logo_url ? (
            <img src={structure.logo_url} alt={structure.name} crossOrigin="anonymous"
              style={{ width:58, height:58, borderRadius:14, objectFit:"cover", border:`2px solid ${COLOR}`, flexShrink:0, background:"#fff" }}/>
          ) : (
            <div style={{ width:58, height:58, borderRadius:14, background:COLOR, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>
              🏛️
            </div>
          )}
          <div>
            <p style={{ margin:0, fontSize:21, fontWeight:800, color:"#fff", lineHeight:1.15 }}>{displayName}</p>
            <p style={{ margin:"3px 0 0", fontSize:11, fontWeight:700, color:COLOR, textTransform:"uppercase", letterSpacing:0.5 }}>{structure.type}</p>
          </div>
        </div>

        {custom.showSlogan && displaySlogan && (
          <p style={{ margin:"0 0 14px", fontSize:11, color:"rgba(255,255,255,0.55)", fontStyle:"italic", lineHeight:1.5, position:"relative", zIndex:1 }}>
            « {displaySlogan} »
          </p>
        )}

        <div style={{ height:1, background:`${COLOR}55`, marginBottom:14, position:"relative", zIndex:1, width:"85%" }}/>

        <div style={{ position:"relative", zIndex:1 }}>
          <InfoRow icon="📍" label="Ville"     value={structure.ville}/>
          {custom.showQuartier && <InfoRow icon="🏠" label="Quartier"  value={structure.quartier}/>}
          <InfoRow icon="📞" label="Téléphone" value={formatPhone(structure.phone)}/>
          {custom.showWhatsapp && structure.whatsapp && (
            <InfoRow icon="💬" label="WhatsApp" value={formatPhone(structure.whatsapp)}/>
          )}
          {custom.note && (
            <p style={{ marginTop:10, fontSize:11, color:"rgba(255,255,255,0.7)", lineHeight:1.5, fontStyle:"italic" }}>{custom.note}</p>
          )}
        </div>
      </div>

      {/* Panneau droit (QR code) */}
      <div style={{ width: "40%", background:"#fff", position:"relative", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 18px", overflow:"hidden" }}>

        <div style={{ position:"absolute", top:0, right:0, width:90, height:18, background:COLOR, transform:"translate(20px,-6px) rotate(-12deg)" }}/>

        <img src={qrUrl} alt="QR Code" crossOrigin="anonymous"
          style={{ width:150, height:150, borderRadius:12, border:`2px solid ${COLOR}`, padding:6, background:"#fff" }}/>

        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:14 }}>
          <span style={{ fontSize:16 }}>📱</span>
          <p style={{ margin:0, fontSize:11, fontWeight:800, color:DARK, textAlign:"center", lineHeight:1.4 }}>
            SCANNEZ POUR<br/>VISITER NOTRE VITRINE
          </p>
        </div>

        <div style={{ height:1, background:`${COLOR}55`, width:"70%", margin:"12px 0 8px" }}/>
        <p style={{ margin:0, fontSize:10, color:"#9A9AB0", fontWeight:600 }}>marcheduroi.com</p>
      </div>
    </div>
  );

  const isPage = !onClose;

  return (
    <div style={{
      position: isPage ? "relative" : "fixed",
      inset: isPage ? "auto" : 0,
      background: isPage ? (VT.bg||"#0D0F1A") : "rgba(0,0,0,0.85)",
      zIndex: isPage ? "auto" : 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      minHeight: isPage ? "100vh" : "auto",
      padding: isPage ? "40px 16px" : "24px 16px",
      fontFamily: "Sora, sans-serif",
      overflowX: "auto",
    }}>

      {onClose && (
        <button onClick={onClose}
          style={{ position:"absolute", top:20, right:20, background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", width:40, height:40, borderRadius:"50%", fontSize:18, cursor:"pointer", zIndex:10 }}>
          ✕
        </button>
      )}

      <p style={{ color: VT.sub||"#9A9AB0", fontSize:13, marginBottom:20, textAlign:"center" }}>
        🪪 Carte de visite numérique — format imprimable 85×55mm
      </p>

      <div style={{ maxWidth: "100%", overflow:"auto", display:"flex", justifyContent:"center" }}>
        <div style={{ transform: "scale(min(1, calc((100vw - 32px) / 680)))", transformOrigin:"top center" }}>
          {Card}
        </div>
      </div>

      <div style={{ display:"flex", gap:10, marginTop:24, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={downloadPNG} disabled={downloading}
          style={{ background:`linear-gradient(135deg,${COLOR},${COLOR}CC)`, border:"none", color:"#fff", padding:"12px 22px", borderRadius:10, fontWeight:700, fontSize:14, cursor:downloading?"wait":"pointer" }}>
          {downloading ? "⏳ Génération..." : "⬇️ Télécharger PNG"}
        </button>
        <button onClick={shareLink}
          style={{ background:"transparent", border:`1px solid ${COLOR}`, color:COLOR, padding:"12px 22px", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer" }}>
          {copied ? "✅ Lien copié !" : "🔗 Partager le lien"}
        </button>
        <button onClick={()=>setShowEditor(s=>!s)}
          style={{ background:"transparent", border:`1px solid ${VT.border||"#2A2D45"}`, color:VT.sub||"#9A9AB0", padding:"12px 22px", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer" }}>
          {showEditor ? "✕ Fermer l'édition" : "✏️ Personnaliser"}
        </button>
      </div>

      {/* Panneau de personnalisation */}
      {showEditor && (
        <div style={{ marginTop:20, width:"100%", maxWidth:420, background:VT.card||"#1A1D30", border:`1px solid ${VT.border||"#2A2D45"}`, borderRadius:14, padding:18 }}>
          <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:700, color:VT.text||"#E8E8F0" }}>✏️ Personnaliser cette carte</p>

          <label style={{ fontSize:11, fontWeight:600, color:VT.sub||"#9A9AB0", display:"block", marginBottom:4 }}>Nom affiché</label>
          <input value={custom.name} onChange={e=>setCustom(c=>({...c,name:e.target.value}))}
            placeholder={structure.name}
            style={{ width:"100%", boxSizing:"border-box", background:VT.bg||"#0D0F1A", border:`1px solid ${VT.border||"#2A2D45"}`, borderRadius:8, padding:"8px 12px", color:VT.text||"#E8E8F0", fontSize:13, marginBottom:10, outline:"none" }}/>

          <label style={{ fontSize:11, fontWeight:600, color:VT.sub||"#9A9AB0", display:"block", marginBottom:4 }}>Slogan affiché</label>
          <input value={custom.slogan} onChange={e=>setCustom(c=>({...c,slogan:e.target.value}))}
            placeholder={structure.slogan || "Ex: Innover aujourd'hui, réussir demain"}
            style={{ width:"100%", boxSizing:"border-box", background:VT.bg||"#0D0F1A", border:`1px solid ${VT.border||"#2A2D45"}`, borderRadius:8, padding:"8px 12px", color:VT.text||"#E8E8F0", fontSize:13, marginBottom:10, outline:"none" }}/>

          <label style={{ fontSize:11, fontWeight:600, color:VT.sub||"#9A9AB0", display:"block", marginBottom:4 }}>Note personnalisée (optionnel)</label>
          <input value={custom.note} onChange={e=>setCustom(c=>({...c,note:e.target.value}))}
            placeholder="Ex: Livraison gratuite à Cotonou"
            maxLength={60}
            style={{ width:"100%", boxSizing:"border-box", background:VT.bg||"#0D0F1A", border:`1px solid ${VT.border||"#2A2D45"}`, borderRadius:8, padding:"8px 12px", color:VT.text||"#E8E8F0", fontSize:13, marginBottom:12, outline:"none" }}/>

          <label style={{ fontSize:11, fontWeight:600, color:VT.sub||"#9A9AB0", display:"block", marginBottom:6 }}>Couleur accent</label>
          <div style={{ display:"flex", gap:8, marginBottom:12, alignItems:"center" }}>
            <input type="color" value={custom.color || VT.accent || "#10B981"} onChange={e=>setCustom(c=>({...c,color:e.target.value}))}
              style={{ width:40, height:32, border:"none", borderRadius:6, cursor:"pointer", background:"none" }}/>
            {custom.color && (
              <button onClick={()=>setCustom(c=>({...c,color:""}))}
                style={{ fontSize:11, color:VT.sub||"#9A9AB0", background:"transparent", border:`1px solid ${VT.border||"#2A2D45"}`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>
                ↺ Couleur d'origine
              </button>
            )}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:VT.text||"#E8E8F0", cursor:"pointer" }}>
              <input type="checkbox" checked={custom.showSlogan} onChange={e=>setCustom(c=>({...c,showSlogan:e.target.checked}))}/>
              Afficher le slogan
            </label>
            <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:VT.text||"#E8E8F0", cursor:"pointer" }}>
              <input type="checkbox" checked={custom.showQuartier} onChange={e=>setCustom(c=>({...c,showQuartier:e.target.checked}))}/>
              Afficher le quartier
            </label>
            <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:VT.text||"#E8E8F0", cursor:"pointer" }}>
              <input type="checkbox" checked={custom.showWhatsapp} onChange={e=>setCustom(c=>({...c,showWhatsapp:e.target.checked}))}/>
              Afficher le WhatsApp
            </label>
          </div>

          <p style={{ margin:"12px 0 0", fontSize:10, color:VT.sub||"#9A9AB0", lineHeight:1.5 }}>
            💡 Ces modifications n'affectent que cette carte — votre vitrine reste inchangée.
          </p>
        </div>
      )}

      <p style={{ marginTop:14, color:VT.sub||"#9A9AB0", fontSize:11, textAlign:"center", maxWidth:360 }}>
        💡 Imprimez ce visuel chez un imprimeur (format carte de visite standard 85×55mm) ou partagez-le directement sur WhatsApp.
      </p>

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

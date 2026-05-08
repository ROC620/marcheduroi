import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import { VITRINE_THEMES, VITRINE_TYPES, NEWS_TYPES, getVitrineTheme, toSlug } from "../vitrineConstants";

function VitrineRenewal({ structure, token, onDone }) {
  const COLOR = "#10B981";
  const [tokenValid, setTokenValid] = React.useState(false);
  const [checking,   setChecking]   = React.useState(true);
  const [paying,     setPaying]     = React.useState(false);
  const [done,       setDone]       = React.useState(false);
  const [error,      setError]      = React.useState(null);

  React.useEffect(() => {
    if (!token || !structure) { setChecking(false); return; }
    const storedToken = structure.edit_token ?? structure.editToken ?? "";
    setTokenValid(String(storedToken).toLowerCase().trim() === String(token).toLowerCase().trim());
    setChecking(false);
  }, [token, structure]);

  const handleSuccess = async () => {
    setPaying(true);
    const now = new Date();
    // Renouveler depuis today ou depuis expires_at (si pas encore expirée)
    const base = structure.expires_at && new Date(structure.expires_at) > now
      ? new Date(structure.expires_at)
      : now;
    const newExpiry = new Date(base);
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    const { error } = await supabase.from("structures").update({
      active:     true,
      expires_at: newExpiry.toISOString(),
      paid_at:    now.toISOString(),
    }).eq("id", structure.id);
    if (error) setError("Paiement reçu mais erreur d'activation. Contactez contact@marcheduroi.com");
    else { setDone(true); setTimeout(onDone, 2500); }
    setPaying(false);
  };

  const launchPayment = async () => {
    setError(null);
    try {
      if (!window.FedaPay) {
        const s = document.createElement("script");
        s.src = "https://cdn.fedapay.com/checkout.js?v=1.1.7";
        await new Promise((res,rej) => { s.onload=res; s.onerror=rej; document.head.appendChild(s); });
      }
      window.FedaPay.init({
        public_key: import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || "pk_sandbox_VOTRE_CLE_ICI",
        transaction: { amount: structure.renewal_amount || 18000, description: `Renouvellement vitrine — ${structure.name}` },
        customer:    { email: structure.email || "client@marcheduroi.com" },
        onComplete(resp, reason) {
          const ok = reason === window.FedaPay.TRANSACTION_APPROVED || reason === "transaction_approved" || reason === "approved";
          if (ok) handleSuccess();
          else setError("Paiement annulé. Réessayez.");
        }
      }).open();
    } catch { setError("Module de paiement non chargé. Vérifiez votre connexion."); }
  };

  if (checking) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#0D0F1A",fontFamily:"Sora,sans-serif",color:"#9A9AB0" }}>Vérification…</div>
  );

  if (!tokenValid) return (
    <div style={{ textAlign:"center",padding:"80px 24px",fontFamily:"Sora,sans-serif",background:"#0D0F1A",minHeight:"100vh",color:"#E8E8F0" }}>
      <p style={{ fontSize:48,marginBottom:16 }}>🔒</p>
      <h2 style={{ fontSize:22,fontWeight:700 }}>Lien non valide</h2>
      <p style={{ color:"#9A9AB0" }}>Contactez EDENPORTAIL pour obtenir un nouveau lien.</p>
    </div>
  );

  if (done) return (
    <div style={{ textAlign:"center",padding:"80px 24px",fontFamily:"Sora,sans-serif",background:"#0D0F1A",minHeight:"100vh",color:"#E8E8F0" }}>
      <p style={{ fontSize:56,marginBottom:16 }}>🎉</p>
      <h2 style={{ fontSize:24,fontWeight:800,color:COLOR,marginBottom:12 }}>Renouvellement confirmé !</h2>
      <p style={{ color:"#9A9AB0" }}>Votre vitrine <strong style={{ color:"#E8E8F0" }}>{structure.name}</strong> est active pour une nouvelle année.</p>
    </div>
  );

  const isExpired  = structure.expires_at && new Date(structure.expires_at) <= new Date();
  const base       = structure.expires_at && !isExpired ? new Date(structure.expires_at) : new Date();
  const newExpiry  = new Date(base); newExpiry.setFullYear(newExpiry.getFullYear()+1);

  return (
    <div style={{ background:"#0D0F1A",minHeight:"100vh",fontFamily:"Sora,sans-serif",color:"#E8E8F0" }}>
      <div style={{ background:"#0D0F1AEE",borderBottom:"1px solid #2A2D45",padding:"0 24px",height:64,display:"flex",alignItems:"center",position:"sticky",top:0,zIndex:100 }}>
        <img src="/marcheduRoi-icon.svg" alt="MarcheduRoi" style={{ height:52,objectFit:"contain" }}/>
      </div>
      <div style={{ maxWidth:480,margin:"0 auto",padding:"40px 24px" }}>
        <div style={{ textAlign:"center",marginBottom:32 }}>
          <div style={{ width:72,height:72,borderRadius:18,background:`linear-gradient(135deg,${COLOR},#059669)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 16px" }}>🔄</div>
          <h1 style={{ fontSize:24,fontWeight:800,marginBottom:8 }}>Renouveler votre vitrine</h1>
          <p style={{ color:"#9A9AB0",fontSize:15 }}>{structure.name}</p>
        </div>

        {/* Statut actuel */}
        <div style={{ background:isExpired?"rgba(255,71,87,0.08)":"rgba(255,140,0,0.08)", border:`1px solid ${isExpired?"rgba(255,71,87,0.3)":"rgba(255,140,0,0.3)"}`, borderRadius:12,padding:16,marginBottom:20,textAlign:"center" }}>
          <p style={{ fontWeight:700,color:isExpired?"#FF4757":"#FF8C00",margin:"0 0 4px" }}>
            {isExpired ? "⛔ Vitrine expirée" : "⚠️ Vitrine expirant bientôt"}
          </p>
          <p style={{ color:"#9A9AB0",fontSize:13,margin:0 }}>
            {isExpired
              ? `Expirée le ${new Date(structure.expires_at).toLocaleDateString("fr-FR")}`
              : `Expire le ${new Date(structure.expires_at).toLocaleDateString("fr-FR")}`}
          </p>
        </div>

        {/* Récapitulatif */}
        <div style={{ background:"#1A1D30",border:"1px solid #2A2D45",borderRadius:16,padding:20,marginBottom:24 }}>
          <p style={{ fontWeight:700,color:"#E8E8F0",marginBottom:14 }}>📋 Récapitulatif</p>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
            <span style={{ color:"#9A9AB0" }}>Renouvellement annuel</span>
            <span style={{ fontWeight:700,color:COLOR,fontSize:16 }}>{(structure.renewal_amount||18000).toLocaleString("fr-FR")} FCFA</span>
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",borderTop:"1px solid #2A2D45",paddingTop:10,marginTop:6 }}>
            <span style={{ color:"#9A9AB0",fontSize:13 }}>Nouvelle expiration</span>
            <span style={{ color:COLOR,fontWeight:700,fontSize:13 }}>{newExpiry.toLocaleDateString("fr-FR")}</span>
          </div>
        </div>

        {error && (
          <div style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:12,padding:14,marginBottom:16 }}>
            <p style={{ margin:0,color:"#FF4757",fontWeight:600 }}>❌ {error}</p>
          </div>
        )}

        <button onClick={launchPayment} disabled={paying}
          style={{ width:"100%",padding:18,background:paying?"#1A1D30":`linear-gradient(135deg,${COLOR},#059669)`,border:paying?"1px solid #2A2D45":"none",color:paying?"#9A9AB0":"#fff",borderRadius:14,fontWeight:800,fontSize:17,cursor:paying?"not-allowed":"pointer" }}>
          {paying ? "Activation…" : `💳 Payer ${(structure.renewal_amount||18000).toLocaleString("fr-FR")} FCFA`}
        </button>
        <p style={{ textAlign:"center",color:"#9A9AB0",fontSize:11,marginTop:12 }}>Paiement sécurisé · EDENPORTAIL</p>
      </div>
    </div>
  );
}



export default VitrineRenewal;

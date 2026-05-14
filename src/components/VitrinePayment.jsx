import React, { useState, useEffect } from "react";
import { usePromo } from "../hooks/usePromo";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import { VITRINE_THEMES, VITRINE_TYPES, NEWS_TYPES, getVitrineTheme, toSlug } from "../vitrineConstants";

function VitrinePayment({ structure, token, onDone }) {
  const COLOR = "#10B981";
  const { applyPromo, promoLabel } = usePromo();
  const [tokenValid,  setTokenValid]  = React.useState(false);
  const [checking,    setChecking]    = React.useState(true);
  const [paying,      setPaying]      = React.useState(false);
  const [paid,        setPaid]        = React.useState(false);
  const [error,       setError]       = React.useState(null);

  React.useEffect(() => {
    if (!token || !structure) { setChecking(false); return; }
    supabase.from("structures")
      .select("id")
      .eq("id", structure.id)
      .eq("edit_token", token)
      .single()
      .then(({ data }) => {
        setTokenValid(!!data);
        setChecking(false);
      });
  }, [token, structure]);

  // Charger FedaPay
  const loadFedaPay = () => new Promise((resolve, reject) => {
    if (window.FedaPay) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.fedapay.com/checkout.js?v=1.1.7";
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

  // Charger Flutterwave
  const loadFlutterwave = () => new Promise((resolve, reject) => {
    if (window.FlutterwaveCheckout) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

  const handleSuccess = async () => {
    setPaying(true);
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    const { error } = await supabase.from("structures").update({
      active:     true,
      paid_at:    now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }).eq("id", structure.id).eq("edit_token", token);
    if (error) {
      setError("Paiement reçu mais activation échouée. Contactez EDENPORTAIL : contact@marcheduroi.com");
    } else {
      // Envoyer l'email de confirmation
      if (structure.email) {
        fetch("/api/send-vitrine-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:      structure.name,
            type:      structure.type,
            email:     structure.email,
            slug:      structure.slug,
            token:     token,
            expiresAt: expiresAt.toISOString(),
          }),
        }).catch(() => {}); // Silencieux — ne pas bloquer si email échoue
      }
      setPaid(true);
      setTimeout(onDone, 3000);
    }
    setPaying(false);
  };

  const launchPayment = async () => {
    setError(null);
    const isBenin = true; // Toujours FedaPay pour le Bénin
    try {
      if (isBenin) {
        await loadFedaPay();
        const FedaPay = window.FedaPay;
        FedaPay.init({
          public_key: import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || "pk_sandbox_VOTRE_CLE_ICI",
          transaction: { amount: applyPromo(structure.creation_amount || 15000, "vitrine").prixFinal, description: `VitrineWeb — Création de vitrine pour ${structure.name}` },
          customer:    { email: structure.email || "client@marcheduroi.com" },
          onComplete(resp, reason) {
            const approved = reason === FedaPay.TRANSACTION_APPROVED || reason === "transaction_approved" || reason === "approved";
            if (approved) handleSuccess();
            else setError("Paiement annulé ou échoué. Réessayez.");
          }
        }).open();
      } else {
        await loadFlutterwave();
        window.FlutterwaveCheckout({
          public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-VOTRE_CLE_ICI-X",
          tx_ref:     "vitrine-" + structure.id + "-" + Date.now(),
          amount:     applyPromo(structure.creation_amount || 15000, "vitrine").prixFinal,
          currency:   "XOF",
          payment_options: "mobilemoney,card,ussd",
          customer:   { email: structure.email || "client@marcheduroi.com", name: structure.name },
          customizations: { title: "VitrineWeb MarchéduRoi", description: `Création de vitrine — ${structure.name}`, logo: window.location.origin + "/marcheduRoi-icon.svg" },
          callback(resp) { if (resp.status === "successful") handleSuccess(); else setError("Paiement échoué. Réessayez."); },
          onclose()     { },
        });
      }
    } catch (e) {
      setError("Module de paiement non chargé. Vérifiez votre connexion et réessayez.");
    }
  };

  if (checking) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#0D0F1A",fontFamily:"Sora,sans-serif",color:"#9A9AB0" }}>
      Vérification…
    </div>
  );

  if (!tokenValid) return (
    <div style={{ textAlign:"center",padding:"80px 24px",fontFamily:"Sora,sans-serif",background:"#0D0F1A",minHeight:"100vh",color:"#E8E8F0" }}>
      <p style={{ fontSize:48,marginBottom:16 }}>🔒</p>
      <h2 style={{ fontSize:22,fontWeight:700,marginBottom:12 }}>Lien non valide</h2>
      <p style={{ color:"#9A9AB0" }}>Ce lien de paiement est incorrect. Contactez EDENPORTAIL.</p>
    </div>
  );

  if (structure.active && structure.paid_at) return (
    <div style={{ textAlign:"center",padding:"80px 24px",fontFamily:"Sora,sans-serif",background:"#0D0F1A",minHeight:"100vh",color:"#E8E8F0" }}>
      <p style={{ fontSize:48,marginBottom:16 }}>✅</p>
      <h2 style={{ fontSize:22,fontWeight:700,marginBottom:12 }}>Vitrine déjà active !</h2>
      <p style={{ color:"#9A9AB0",marginBottom:24 }}>Votre vitrine est en ligne depuis le {new Date(structure.paid_at).toLocaleDateString("fr-FR")}.</p>
      <button onClick={onDone} style={{ background:`linear-gradient(135deg,${COLOR},#059669)`,border:"none",color:"#fff",padding:"12px 28px",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer" }}>
        Voir ma vitrine →
      </button>
    </div>
  );

  if (paid) return (
    <div style={{ textAlign:"center",padding:"80px 24px",fontFamily:"Sora,sans-serif",background:"#0D0F1A",minHeight:"100vh",color:"#E8E8F0" }}>
      <p style={{ fontSize:56,marginBottom:16 }}>🎉</p>
      <h2 style={{ fontSize:24,fontWeight:800,marginBottom:12,color:COLOR }}>Paiement confirmé !</h2>
      <p style={{ color:"#9A9AB0",marginBottom:8 }}>Votre vitrine <strong style={{ color:"#E8E8F0" }}>{structure.name}</strong> est maintenant en ligne.</p>
      <p style={{ color:"#9A9AB0",fontSize:13 }}>Redirection vers votre vitrine…</p>
    </div>
  );

  return (
    <div style={{ background:"#0D0F1A",minHeight:"100vh",fontFamily:"Sora,sans-serif",color:"#E8E8F0" }}>
      {/* Navbar */}
      <div style={{ background:"#0D0F1AEE",borderBottom:"1px solid #2A2D45",padding:"0 24px",height:64,display:"flex",alignItems:"center",position:"sticky",top:0,zIndex:100 }}>
        <img src="/marcheduRoi-icon.svg" alt="MarcheduRoi" style={{ height:52,objectFit:"contain" }}/>
      </div>

      <div style={{ maxWidth:480,margin:"0 auto",padding:"40px 24px" }}>

        {/* En-tête */}
        <div style={{ textAlign:"center",marginBottom:32 }}>
          <div style={{ width:72,height:72,borderRadius:18,background:`linear-gradient(135deg,${COLOR},#059669)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 16px" }}>
            🏛️
          </div>
          <h1 style={{ fontSize:24,fontWeight:800,marginBottom:8 }}>Activer votre VitrineWeb</h1>
          <p style={{ color:"#9A9AB0",fontSize:15 }}>{structure.name}</p>
        </div>

        {/* Récapitulatif */}
        <div style={{ background:"#1A1D30",border:"1px solid #2A2D45",borderRadius:16,padding:24,marginBottom:24 }}>
          <p style={{ fontWeight:700,color:"#E8E8F0",marginBottom:16,fontSize:15 }}>📋 Récapitulatif</p>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
            <span style={{ color:"#9A9AB0",fontSize:14 }}>Création de la vitrine</span>
            <span style={{ display:"flex", alignItems:"center", gap:8 }}>
              {applyPromo(structure.creation_amount||15000, "vitrine").prixOriginal && (
                <span style={{ color:"#9A9AB0", fontSize:14, textDecoration:"line-through" }}>
                  {(structure.creation_amount||15000).toLocaleString("fr-FR")} F
                </span>
              )}
              <span style={{ fontWeight:800, color:COLOR, fontSize:18 }}>
                {applyPromo(structure.creation_amount||15000, "vitrine").prixFinal.toLocaleString("fr-FR")} FCFA
              </span>
              {promoLabel("vitrine") && (
                <span style={{ background:"#10B981", color:"#fff", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>
                  {promoLabel("vitrine")}
                </span>
              )}
            </span>
          </div>
          <div style={{ borderTop:"1px solid #2A2D45",paddingTop:12,marginTop:4 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ color:"#9A9AB0",fontSize:13 }}>Renouvellement annuel (dans 12 mois)</span>
              <span style={{ color:"#9A9AB0",fontSize:13 }}>{(structure.renewal_amount||18000).toLocaleString("fr-FR")} FCFA/an</span>
            </div>
          </div>
          <div style={{ background:`rgba(16,185,129,0.08)`,border:`1px solid rgba(16,185,129,0.2)`,borderRadius:10,padding:12,marginTop:16 }}>
            <p style={{ margin:0,color:COLOR,fontSize:13,lineHeight:1.6 }}>
              ✅ Paiement unique aujourd'hui : <strong>{applyPromo(structure.creation_amount||15000, "vitrine").prixFinal.toLocaleString("fr-FR")} FCFA</strong><br/>
              {applyPromo(structure.creation_amount||15000, "vitrine").promo?.message && (
                <span style={{ color:"#FFD700", fontWeight:700 }}>{applyPromo(structure.creation_amount||15000, "vitrine").promo.message}</span>
              )}<br/>
              Votre vitrine sera mise en ligne immédiatement après confirmation.
            </p>
          </div>
        </div>

        {/* Moyens de paiement */}
        <div style={{ background:"#1A1D30",border:"1px solid #2A2D45",borderRadius:16,padding:20,marginBottom:24 }}>
          <p style={{ fontWeight:700,color:"#E8E8F0",marginBottom:12,fontSize:14 }}>💳 Moyens de paiement acceptés</p>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {["MTN Money","Moov Money","Carte bancaire","USSD"].map(m=>(
              <span key={m} style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.2)",color:"#9A9AB0",padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600 }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:12,padding:14,marginBottom:16 }}>
            <p style={{ margin:0,color:"#FF4757",fontSize:14,fontWeight:600 }}>❌ {error}</p>
          </div>
        )}

        {/* Bouton payer */}
        <button onClick={launchPayment} disabled={paying}
          style={{ width:"100%",padding:18,background:paying?"#1A1D30":`linear-gradient(135deg,${COLOR},#059669)`,border:paying?"1px solid #2A2D45":"none",color:paying?"#9A9AB0":"#fff",borderRadius:14,fontWeight:800,fontSize:17,cursor:paying?"not-allowed":"pointer",transition:"all 0.2s" }}>
          {paying ? "Activation en cours…" : `💳 Payer ${applyPromo(structure.creation_amount||15000, "vitrine").prixFinal.toLocaleString("fr-FR")} FCFA`}
        </button>

        <p style={{ textAlign:"center",color:"#9A9AB0",fontSize:12,marginTop:16,lineHeight:1.7 }}>
          Paiement sécurisé · MarchéduRoi par EDENPORTAIL<br/>
          En payant, vous acceptez les <span style={{ color:COLOR }}>CGU de MarchéduRoi</span>
        </p>
      </div>
    </div>
  );
}


// Section accordéon pour VitrineEdit — défini HORS du composant pour éviter les re-renders
// -----------------------------------------------
// VitrineCarousel — Galerie photos avec swipe et lightbox
// -----------------------------------------------

export default VitrinePayment;

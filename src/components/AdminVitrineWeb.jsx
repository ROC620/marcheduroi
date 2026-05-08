import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { VITRINE_TYPES, toSlug } from "../vitrineConstants";

function AdminVitrineWeb({ theme, notify }) {
  const COLOR = "#10B981";

  // ---- Onglet actif : "liste", "creer" ou "modifier" ----
  const [tab, setTab] = React.useState("liste");

  // ---- Liste des structures ----
  const [structures, setStructures] = React.useState([]);
  const [loadingList, setLoadingList] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState(null);

  // ---- Structure en cours d'édition ----
  const [editingId, setEditingId] = React.useState(null);

  // ---- Formulaire création / modification ----
  const emptyForm = {
    slug:"", name:"", type:"Restaurant", slogan:"", description:"",
    logo_url:"", cover_url:"", photos:"", video:"",
    address:"", ville:"", quartier:"", von:"",
    gps_lat:"", gps_lng:"",
    phone:"", phone2:"", whatsapp:"", email:"",
    website:"", facebook:"", instagram:"",
    hours:"", languages:"", services:"",
    verified: false, active: true, free_activation: false,
  };
  const [form,    setForm]    = React.useState(emptyForm);
  const [saving,  setSaving]  = React.useState(false);
  const [saveMsg, setSaveMsg] = React.useState(null);

  // ---- Ouvrir le formulaire de modification ----
  const openEdit = async (s) => {
    setSaveMsg(null);
    // Charger la structure complète
    const { data } = await supabase.from("structures").select("*").eq("id", s.id).single();
    if (!data) return;
    setEditingId(data.id);
    setForm({
      slug:       data.slug       || "",
      name:       data.name       || "",
      type:       data.type       || "Restaurant",
      slogan:     data.slogan     || "",
      description:data.description|| "",
      logo_url:   data.logo_url   || "",
      cover_url:  data.cover_url  || "",
      photos:     (data.photos    || []).join("\n"),
      video:      data.video      || "",
      address:    data.address    || "",
      ville:      data.ville      || "",
      quartier:   data.quartier   || "",
      von:        data.von        || "",
      gps_lat:    data.gps_lat    ? String(data.gps_lat) : "",
      gps_lng:    data.gps_lng    ? String(data.gps_lng) : "",
      phone:      data.phone      || "",
      phone2:     data.phone2     || "",
      whatsapp:   data.whatsapp   || "",
      email:      data.email      || "",
      website:    data.website    || "",
      facebook:   data.facebook   || "",
      instagram:  data.instagram  || "",
      hours:      data.hours      || "",
      languages:  data.languages  || "",
      services:   data.services   || "",
      verified:   data.verified   || false,
      active:     data.active     || false,
      free_activation: false,
    });
    setTab("modifier");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---- Enregistrer les modifications admin ----
  const handleUpdate = async () => {
    if (!form.name.trim()) { setSaveMsg({ type:"error", text:"Le nom est obligatoire." }); return; }
    if (!form.slug.trim()) { setSaveMsg({ type:"error", text:"Le slug est obligatoire." }); return; }
    setSaving(true); setSaveMsg(null);
    const photosArray = form.photos.split("\n").map(l => l.trim()).filter(Boolean).slice(0,10);
    const { error } = await supabase.from("structures").update({
      slug:        form.slug.trim(),
      name:        form.name.trim(),
      type:        form.type,
      slogan:      form.slogan     || null,
      description: form.description|| null,
      logo_url:    form.logo_url   || null,
      cover_url:   form.cover_url  || null,
      photos:      photosArray,
      video:       form.video      || null,
      address:     form.address    || null,
      ville:       form.ville      || null,
      quartier:    form.quartier   || null,
      von:         form.von        || null,
      gps_lat:     form.gps_lat    ? parseFloat(form.gps_lat)  : null,
      gps_lng:     form.gps_lng    ? parseFloat(form.gps_lng)  : null,
      phone:       form.phone      || null,
      phone2:      form.phone2     || null,
      whatsapp:    form.whatsapp   || null,
      email:       form.email      || null,
      website:     form.website    || null,
      facebook:    form.facebook   || null,
      instagram:   form.instagram  || null,
      hours:       form.hours      || null,
      languages:   form.languages  || null,
      services:    form.services   || null,
      verified:    form.verified,
      active:      form.active,
      updated_at:  new Date().toISOString(),
    }).eq("id", editingId);
    if (error) {
      setSaveMsg({ type:"error", text: error.code === "23505" ? "Ce slug existe déjà." : "Erreur : " + error.message });
    } else {
      setSaveMsg({ type:"success", text:"✅ Vitrine mise à jour avec succès !" });
      await loadStructures();
      setTimeout(() => { setTab("liste"); setSaveMsg(null); setEditingId(null); }, 2000);
    }
    setSaving(false);
  };

  // ---- Chargement de la liste ----
  const loadStructures = React.useCallback(async () => {
    setLoadingList(true);
    const { data, error } = await supabase
      .from("structures")
      .select("id, slug, name, type, verified, active, created_at, edit_token, ville, phone, owner_id, paid_at, expires_at, domain_active, custom_domain")
      .order("created_at", { ascending: false });
    if (!error && data) setStructures(data);
    setLoadingList(false);
  }, []);

  React.useEffect(() => { loadStructures(); }, [loadStructures]);

  // ---- Auto-génération du slug depuis le nom ----
  const toSlug = (str) =>
    str.toLowerCase()
       .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
       .replace(/[^a-z0-9\s-]/g,"")
       .trim().replace(/\s+/g,"-");

  const handleNameChange = (val) => {
    setForm(f => ({ ...f, name: val, slug: toSlug(val) }));
  };

  // ---- Copier le lien de paiement ----
  const copyPayLink = (structure) => {
    const url = window.location.origin + "/vitrine/" + structure.slug + "/payer?token=" + structure.edit_token;
    navigator.clipboard.writeText(url);
    notify("💳 Lien de paiement copié !");
  };
  const copyEditLink = (structure) => {
    const url = window.location.origin + "/vitrine/" + structure.slug + "/modifier?token=" + structure.edit_token;
    navigator.clipboard.writeText(url);
    notify("🔗 Lien de modification copié !");
  };

  // ---- Copier le lien public ----
  const copyPublicLink = (structure) => {
    const url = window.location.origin + "/vitrine/" + structure.slug;
    navigator.clipboard.writeText(url);
    notify("🔗 Lien public copié !");
  };

  // ---- Se définir propriétaire de la vitrine ----
  const setAsOwner = async (s) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.from("structures").update({ owner_id: session.user.id }).eq("id", s.id);
    if (!error) {
      setStructures(prev => prev.map(x => x.id === s.id ? { ...x, owner_id: session.user.id } : x));
      notify("✅ Vous êtes maintenant propriétaire de cette vitrine !");
    }
  };

  // ---- Activer / Désactiver ----
  const toggleActive = async (s) => {
    const { error } = await supabase.from("structures").update({ active: !s.active }).eq("id", s.id);
    if (!error) {
      setStructures(prev => prev.map(x => x.id === s.id ? { ...x, active: !s.active } : x));
      notify(s.active ? "⛔ Vitrine désactivée" : "✅ Vitrine activée");
    }
  };

  // ---- Toggler Vérifié ----
  const toggleVerified = async (s) => {
    const { error } = await supabase.from("structures").update({ verified: !s.verified }).eq("id", s.id);
    if (!error) {
      setStructures(prev => prev.map(x => x.id === s.id ? { ...x, verified: !s.verified } : x));
      notify(s.verified ? "Badge Vérifié retiré" : "✅ Badge Vérifié ajouté !");
    }
  };

  // ---- Supprimer ----
  const deleteStructure = async (s) => {
    if (!window.confirm(`Supprimer définitivement "${s.name}" ? Cette action est irréversible.`)) return;
    const { error } = await supabase.from("structures").delete().eq("id", s.id);
    if (!error) {
      setStructures(prev => prev.filter(x => x.id !== s.id));
      notify("🗑️ Vitrine supprimée");
    }
  };

  // ---- Créer une nouvelle structure ----
  const handleCreate = async () => {
    // Validations basiques
    if (!form.name.trim()) { setSaveMsg({ type:"error", text:"Le nom est obligatoire." }); return; }
    if (!form.slug.trim()) { setSaveMsg({ type:"error", text:"Le slug est obligatoire." }); return; }
    if (!form.type.trim()) { setSaveMsg({ type:"error", text:"Le type est obligatoire." }); return; }

    setSaving(true); setSaveMsg(null);

    const photosArray = form.photos.split("\n").map(l => l.trim()).filter(Boolean).slice(0,10);

    const payload = {
      slug:        form.slug.trim(),
      name:        form.name.trim(),
      type:        form.type.trim(),
      slogan:      form.slogan   || null,
      description: form.description || null,
      logo_url:    form.logo_url || null,
      cover_url:   form.cover_url || null,
      photos:      photosArray,
      video:       form.video    || null,
      address:     form.address  || null,
      ville:       form.ville    || null,
      quartier:    form.quartier || null,
      von:         form.von      || null,
      gps_lat:     form.gps_lat  ? parseFloat(form.gps_lat)  : null,
      gps_lng:     form.gps_lng  ? parseFloat(form.gps_lng)  : null,
      phone:       form.phone    || null,
      phone2:      form.phone2   || null,
      whatsapp:    form.whatsapp || null,
      email:       form.email    || null,
      website:     form.website  || null,
      facebook:    form.facebook || null,
      instagram:   form.instagram || null,
      hours:       form.hours    || null,
      languages:   form.languages || null,
      services:    form.services || null,
      news:        [],
      verified:    form.verified,
      active:      form.free_activation ? true : form.active,
      paid_at:     form.free_activation ? new Date().toISOString() : null,
      expires_at:  form.free_activation ? new Date(Date.now() + 365*24*60*60*1000).toISOString() : null,
      owner_id:    (await supabase.auth.getSession()).data?.session?.user?.id || null,
    };

    const { data, error } = await supabase.from("structures").insert(payload).select().single();

    if (error) {
      const msg = error.code === "23505"
        ? "Ce slug existe déjà. Modifie le slug pour le rendre unique."
        : "Erreur : " + error.message;
      setSaveMsg({ type:"error", text: msg });
    } else {
      setSaveMsg({ type:"success", text:"✅ Vitrine créée ! Copie le lien de modification à envoyer au client." });
      setStructures(prev => [data, ...prev]);
      // Garder le formulaire visible pour copier le lien
      setForm(emptyForm);
      // Basculer sur la liste après 2 secondes
      setTimeout(() => { setTab("liste"); setSaveMsg(null); }, 3000);
    }
    setSaving(false);
  };

  // ---- Styles réutilisables ----
  const inputStyle = {
    width:"100%", background: theme.card || "#1A1D30",
    border:`1px solid ${theme.border || "#2A2D45"}`,
    borderRadius:10, padding:"11px 14px",
    color: theme.text || "#E8E8F0", fontSize:14,
    fontFamily:"Sora,sans-serif", outline:"none", boxSizing:"border-box",
  };
  const labelStyle = {
    display:"block", color: theme.sub || "#9A9AB0",
    fontSize:12, fontWeight:600, marginBottom:5, marginTop:14,
  };
  const sectionTitleStyle = {
    fontWeight:700, color: theme.text || "#E8E8F0",
    fontSize:14, margin:"22px 0 2px",
    paddingBottom:8, borderBottom:`1px solid ${theme.border || "#2A2D45"}`,
  };

  const TYPES = ["Restaurant","Maquis / Buvette","Fast-food","Pâtisserie / Boulangerie","Bar / Lounge","École maternelle","École primaire","Collège","Lycée","Complexe scolaire","Université / Institut","Centre de formation","Crèche / Garderie","Clinique","Cabinet médical","Pharmacie","Cabinet dentaire","Cabinet ophtalmologique","Maternité","Centre de kinésithérapie","Laboratoire d'analyses","Hôtel","Auberge / Maison d'hôtes","Boutique / Magasin","Supermarché","Agence immobilière","Station-service","Garage / Mécanique","Salon de coiffure","Spa / Beauté","Pressing / Laverie","Imprimerie / Copie","Cabinet d'avocats","Notaire","Huissier","Bureau d'expertise comptable","Architecte","Bureau d'études","Agence de communication","Mairie","ONG","Association","Fondation","Paroisse / Église","Mosquée","Temple","Autre"];

  return (
    <div id="admin-vitrines" style={{ scrollMarginTop:80, marginBottom:32 }}>

      {/* En-tête section */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
        <h3 style={{ fontWeight:800,fontSize:18,color:COLOR,margin:0,display:"flex",alignItems:"center",gap:8 }}>
          🏛️ VitrineWeb
          <span style={{ background:`rgba(16,185,129,0.12)`,color:COLOR,borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:700 }}>
            {structures.length}
          </span>
        </h3>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={()=>{ setTab("liste"); setSaveMsg(null); }}
            style={{ background:tab==="liste"?`rgba(16,185,129,0.15)`:"transparent", border:`1px solid ${tab==="liste"?COLOR:theme.border||"#2A2D45"}`, color:tab==="liste"?COLOR:theme.sub||"#9A9AB0", padding:"7px 16px",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer" }}>
            📋 Liste
          </button>
          <button onClick={()=>{ setTab("creer"); setSaveMsg(null); setEditingId(null); setForm(emptyForm); }}
            style={{ background:tab==="creer"?`rgba(16,185,129,0.15)`:"transparent", border:`1px solid ${tab==="creer"?COLOR:theme.border||"#2A2D45"}`, color:tab==="creer"?COLOR:theme.sub||"#9A9AB0", padding:"7px 16px",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer" }}>
            + Créer une vitrine
          </button>
          {tab==="modifier" && (
            <button style={{ background:"rgba(255,140,0,0.15)",border:"1px solid rgba(255,140,0,0.4)",color:"#FF8C00",padding:"7px 16px",borderRadius:8,fontWeight:700,fontSize:13,cursor:"default" }}>
              ✏️ Modification en cours
            </button>
          )}
        </div>
      </div>

      {/* ========== ALERTES : EN ATTENTE / EXPIRANT / EXPIRÉES ========== */}
      {tab === "liste" && (() => {
        const now      = new Date();
        const in30     = new Date(now.getTime() + 30*24*60*60*1000);
        const pending  = structures.filter(s => s.paid_at && !s.active);
        const expiring = structures.filter(s => s.active && s.expires_at && new Date(s.expires_at) > now && new Date(s.expires_at) <= in30);
        const expired  = structures.filter(s => s.active && s.expires_at && new Date(s.expires_at) <= now);
        if (!pending.length && !expiring.length && !expired.length) return null;
        return (
          <>
            {/* En attente */}
            {pending.length > 0 && (
              <div style={{ background:"rgba(255,215,0,0.05)",border:"2px solid rgba(255,215,0,0.3)",borderRadius:14,padding:16,marginBottom:20 }}>
                <p style={{ fontWeight:800,color:"#FFD700",fontSize:14,marginBottom:12,display:"flex",alignItems:"center",gap:8 }}>
                  ⏳ En attente de validation
                  <span style={{ background:"#FF4757",color:"#fff",borderRadius:"50%",width:20,height:20,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700 }}>{pending.length}</span>
                </p>
                {pending.map(s => (
                  <div key={s.id} style={{ background:theme.card||"#1A1D30",border:"1px solid rgba(255,215,0,0.2)",borderRadius:12,padding:14,marginBottom:10 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap" }}>
                      <div>
                        <p style={{ fontWeight:700,color:theme.text||"#E8E8F0",margin:"0 0 4px",fontSize:15 }}>{s.name}</p>
                        <p style={{ color:theme.sub||"#9A9AB0",fontSize:12,margin:0 }}>{s.type} · {s.ville||"—"} · Payé le {s.paid_at ? new Date(s.paid_at).toLocaleDateString("fr-FR") : "—"}</p>
                        <p style={{ color:theme.sub||"#9A9AB0",fontSize:11,margin:"4px 0 0",fontFamily:"monospace" }}>/{s.slug}</p>
                      </div>
                      <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                        <button onClick={async()=>{
                          const exp = new Date(); exp.setFullYear(exp.getFullYear()+1);
                          const { error } = await supabase.from("structures").update({ active:true, expires_at:exp.toISOString() }).eq("id",s.id);
                          if (!error) { setStructures(prev=>prev.map(x=>x.id===s.id?{...x,active:true,expires_at:exp.toISOString()}:x)); notify("✅ Vitrine validée !"); }
                        }} style={{ background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.4)",color:"#10B981",padding:"8px 16px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer" }}>
                          ✅ Valider
                        </button>
                        <a href={"https://wa.me/"+(s.phone||s.whatsapp||"").replace(/[^\d]/g,"")+"?text="+encodeURIComponent(`Bonjour ! 👋\nVotre vitrine *${s.name}* est maintenant en ligne sur MarchéduRoi.\n\n🔗 ${window.location.origin}/vitrine/${s.slug}\n\nMerci — EDENPORTAIL 👑`)}
                          target="_blank" rel="noopener noreferrer"
                          style={{ background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",color:"#25D366",padding:"8px 16px",borderRadius:10,fontWeight:700,fontSize:13,textDecoration:"none" }}>
                          📱 WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Expirant bientôt */}
            {expiring.length > 0 && (
              <div style={{ background:"rgba(255,140,0,0.05)",border:"2px solid rgba(255,140,0,0.3)",borderRadius:14,padding:16,marginBottom:20 }}>
                <p style={{ fontWeight:800,color:"#FF8C00",fontSize:14,marginBottom:12,display:"flex",alignItems:"center",gap:8 }}>
                  ⚠️ Expirant dans 30 jours
                  <span style={{ background:"#FF8C00",color:"#fff",borderRadius:"50%",width:20,height:20,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700 }}>{expiring.length}</span>
                </p>
                {expiring.map(s => (
                  <div key={s.id} style={{ background:theme.card||"#1A1D30",border:"1px solid rgba(255,140,0,0.2)",borderRadius:12,padding:14,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                    <div>
                      <p style={{ fontWeight:700,color:theme.text||"#E8E8F0",margin:"0 0 4px",fontSize:14 }}>{s.name}</p>
                      <p style={{ color:"#FF8C00",fontSize:12,margin:0,fontWeight:600 }}>Expire le {new Date(s.expires_at).toLocaleDateString("fr-FR")} · {Math.ceil((new Date(s.expires_at)-now)/(24*60*60*1000))} jours</p>
                    </div>
                    <div style={{ display:"flex",gap:8 }}>
                      <a href={"https://wa.me/"+(s.phone||s.whatsapp||"").replace(/[^\d]/g,"")+"?text="+encodeURIComponent(`Bonjour ! 👋\nVotre vitrine *${s.name}* expire le ${new Date(s.expires_at).toLocaleDateString("fr-FR")}.\n\nPour renouveler (18 000 FCFA/an) :\n${window.location.origin}/vitrine/${s.slug}/renouveler?token=${s.edit_token}\n\nMerci — EDENPORTAIL 👑`)}
                        target="_blank" rel="noopener noreferrer"
                        style={{ background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",color:"#25D366",padding:"7px 12px",borderRadius:8,fontWeight:700,fontSize:12,textDecoration:"none" }}>
                        📱 Rappel WhatsApp
                      </a>
                      <button onClick={()=>{ navigator.clipboard.writeText(window.location.origin+"/vitrine/"+s.slug+"/renouveler?token="+s.edit_token); notify("🔗 Lien renouvellement copié !"); }}
                        style={{ background:"rgba(255,140,0,0.1)",border:"1px solid rgba(255,140,0,0.3)",color:"#FF8C00",padding:"7px 12px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                        🔗 Lien renouvellement
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Expirées */}
            {expired.length > 0 && (
              <div style={{ background:"rgba(255,71,87,0.05)",border:"2px solid rgba(255,71,87,0.25)",borderRadius:14,padding:16,marginBottom:20 }}>
                <p style={{ fontWeight:800,color:"#FF4757",fontSize:14,marginBottom:12,display:"flex",alignItems:"center",gap:8 }}>
                  🔴 Vitrines expirées
                  <span style={{ background:"#FF4757",color:"#fff",borderRadius:"50%",width:20,height:20,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700 }}>{expired.length}</span>
                </p>
                {expired.map(s => (
                  <div key={s.id} style={{ background:theme.card||"#1A1D30",border:"1px solid rgba(255,71,87,0.2)",borderRadius:12,padding:14,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                    <div>
                      <p style={{ fontWeight:700,color:theme.text||"#E8E8F0",margin:"0 0 4px",fontSize:14 }}>{s.name}</p>
                      <p style={{ color:"#FF4757",fontSize:12,margin:0,fontWeight:600 }}>Expirée le {new Date(s.expires_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={()=>{ navigator.clipboard.writeText(window.location.origin+"/vitrine/"+s.slug+"/renouveler?token="+s.edit_token); notify("🔗 Lien renouvellement copié !"); }}
                        style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757",padding:"7px 12px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                        🔗 Renouveler
                      </button>
                      <button onClick={async()=>{ const { error } = await supabase.from("structures").update({ active:false }).eq("id",s.id); if (!error) { setStructures(prev=>prev.map(x=>x.id===s.id?{...x,active:false}:x)); notify("Vitrine désactivée"); } }}
                        style={{ background:"transparent",border:`1px solid ${theme.border||"#2A2D45"}`,color:theme.sub||"#9A9AB0",padding:"7px 12px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                        ⛔ Désactiver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      })()}


      {/* ========== ONGLET LISTE ========== */}
      {tab === "liste" && (
        <div>
          {loadingList && (
            <p style={{ color:theme.sub||"#9A9AB0",fontSize:13,padding:"16px 0" }}>Chargement…</p>
          )}
          {!loadingList && structures.length === 0 && (
            <div style={{ background:theme.card||"#1A1D30",border:`1px solid ${theme.border||"#2A2D45"}`,borderRadius:14,padding:32,textAlign:"center" }}>
              <p style={{ fontSize:32,marginBottom:8 }}>🏗️</p>
              <p style={{ color:theme.sub||"#9A9AB0",fontSize:14 }}>Aucune vitrine créée pour l'instant.</p>
              <button onClick={()=>setTab("creer")} style={{ marginTop:12,background:`linear-gradient(135deg,${COLOR},#059669)`,border:"none",color:"#fff",padding:"10px 24px",borderRadius:10,fontWeight:700,cursor:"pointer" }}>
                Créer la première vitrine
              </button>
            </div>
          )}
          {!loadingList && structures.map(s => (
            <div key={s.id} style={{ background:theme.card||"#1A1D30",border:`1px solid ${theme.border||"#2A2D45"}`,borderRadius:14,marginBottom:10,overflow:"hidden" }}>

              {/* Ligne principale */}
              <div style={{ padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap" }}>
                <div style={{ display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0 }}>
                  {/* Icône type */}
                  <div style={{ width:40,height:40,borderRadius:10,background:`rgba(16,185,129,0.12)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>
                    🏛️
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                      <p style={{ fontWeight:700,color:theme.text||"#E8E8F0",margin:0,fontSize:14 }}>{s.name}</p>
                      {s.verified && <span style={{ background:"rgba(255,215,0,0.12)",color:"#FFD700",padding:"1px 8px",borderRadius:10,fontSize:10,fontWeight:700 }}>✅ Vérifié</span>}
                      {!s.active  && <span style={{ background:"rgba(255,71,87,0.12)", color:"#FF4757", padding:"1px 8px",borderRadius:10,fontSize:10,fontWeight:700 }}>⛔ Inactif</span>}
                    </div>
                    <p style={{ color:theme.sub||"#9A9AB0",fontSize:12,margin:"2px 0 0" }}>
                      {s.type} · {s.ville||"—"} · <span style={{ fontFamily:"monospace" }}>/{s.slug}</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",flexShrink:0 }}>
                  <button onClick={()=>openEdit(s)}
                    style={{ background:"rgba(255,140,0,0.1)",border:"1px solid rgba(255,140,0,0.3)",color:"#FF8C00",padding:"6px 10px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}
                    title="Modifier la vitrine">✏️</button>
                  {!s.active && !s.paid_at && (
                    <button onClick={()=>copyPayLink(s)}
                      style={{ background:"rgba(255,215,0,0.12)",border:"1px solid rgba(255,215,0,0.4)",color:"#FFD700",padding:"6px 10px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer" }}
                      title="Envoyer le lien de paiement au client">💳</button>
                  )}
                  <button onClick={()=>copyPublicLink(s)}
                    style={{ background:`rgba(16,185,129,0.1)`,border:`1px solid rgba(16,185,129,0.3)`,color:COLOR,padding:"6px 10px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}
                    title="Lien public">🔗</button>
                  <button onClick={()=>copyEditLink(s)}
                    style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"6px 10px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}
                    title="Lien de modification client">🔑</button>
                  <button onClick={()=>toggleVerified(s)}
                    style={{ background:s.verified?"rgba(255,215,0,0.15)":"rgba(255,215,0,0.05)",border:`1px solid ${s.verified?"#FFD70044":"rgba(255,215,0,0.15)"}`,color:"#FFD700",padding:"6px 10px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}
                    title={s.verified?"Retirer le badge Vérifié":"Ajouter le badge Vérifié"}>
                    {s.verified ? "✅" : "☑️"}
                  </button>
                  <button onClick={()=>toggleActive(s)}
                    style={{ background:s.active?"rgba(67,198,172,0.1)":"rgba(255,71,87,0.1)",border:`1px solid ${s.active?"rgba(67,198,172,0.3)":"rgba(255,71,87,0.3)"}`,color:s.active?"#43C6AC":"#FF4757",padding:"6px 10px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}
                    title={s.active?"Désactiver la vitrine":"Activer la vitrine"}>
                    {s.active ? "👁️" : "🚫"}
                  </button>
                  <button onClick={()=>setExpandedId(expandedId===s.id?null:s.id)}
                    style={{ background:"transparent",border:`1px solid ${theme.border||"#2A2D45"}`,color:theme.sub||"#9A9AB0",padding:"6px 10px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>
                    {expandedId===s.id ? "▲" : "▼"}
                  </button>
                  <button onClick={()=>deleteStructure(s)}
                    style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757",padding:"6px 10px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}
                    title="Supprimer">🗑️</button>
                </div>
              </div>

              {/* Détails dépliés */}
              {expandedId === s.id && (
                <div style={{ borderTop:`1px solid ${theme.border||"#2A2D45"}`,padding:"14px 16px",background:"rgba(16,185,129,0.03)" }}>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12,fontSize:13 }}>
                    <div>
                      <span style={{ color:theme.sub||"#9A9AB0" }}>📞 Téléphone : </span>
                      <span style={{ color:theme.text||"#E8E8F0",fontWeight:600 }}>{s.phone||"—"}</span>
                    </div>
                    <div>
                      <span style={{ color:theme.sub||"#9A9AB0" }}>📅 Créée le : </span>
                      <span style={{ color:theme.text||"#E8E8F0",fontWeight:600 }}>{s.created_at?.slice(0,10)||"—"}</span>
                    </div>
                  </div>

                  {/* Instructions sous-domaine */}
                  <div style={{ background:"rgba(108,99,255,0.05)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:10,padding:14,marginBottom:8 }}>
                    <p style={{ color:"#6C63FF",fontSize:12,fontWeight:700,margin:"0 0 10px" }}>🌐 SOUS-DOMAINE VITRINE</p>
                    <p style={{ color:"#9A9AB0",fontSize:12,margin:"0 0 8px" }}>
                      URL finale : <code style={{ color:"#E8E8F0",fontFamily:"monospace" }}>{s.slug}.vitrine.marcheduroi.com</code>
                    </p>
                    <p style={{ color:"#9A9AB0",fontSize:11,fontWeight:700,margin:"8px 0 4px" }}>1. Dans Namecheap → Advanced DNS :</p>
                    <div style={{ background:"#0D0F1A",borderRadius:8,padding:"8px 12px",marginBottom:8,fontFamily:"monospace",fontSize:11 }}>
                      <p style={{ color:"#10B981",margin:"2px 0" }}>Type : CNAME</p>
                      <p style={{ color:"#10B981",margin:"2px 0" }}>Host : <strong style={{ color:"#E8E8F0" }}>{s.slug}.vitrine</strong></p>
                      <p style={{ color:"#10B981",margin:"2px 0" }}>Value : <strong style={{ color:"#E8E8F0" }}>cname.vercel-dns.com</strong></p>
                    </div>
                    <p style={{ color:"#9A9AB0",fontSize:11,fontWeight:700,margin:"8px 0 4px" }}>2. Dans Vercel → Settings → Domains :</p>
                    <div style={{ background:"#0D0F1A",borderRadius:8,padding:"8px 12px",marginBottom:10,fontFamily:"monospace",fontSize:11 }}>
                      <p style={{ color:"#E8E8F0",margin:0 }}>{s.slug}.vitrine.marcheduroi.com</p>
                    </div>
                    <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
                      <button onClick={()=>{ navigator.clipboard.writeText(s.slug+".vitrine"); notify("Host CNAME copié !"); }}
                        style={{ background:"rgba(108,99,255,0.12)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"5px 10px",borderRadius:7,fontSize:11,fontWeight:700,cursor:"pointer" }}>
                        Copier le Host
                      </button>
                      <button onClick={()=>{ navigator.clipboard.writeText(s.slug+".vitrine.marcheduroi.com"); notify("Domaine Vercel copié !"); }}
                        style={{ background:"rgba(108,99,255,0.12)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"5px 10px",borderRadius:7,fontSize:11,fontWeight:700,cursor:"pointer" }}>
                        Copier le domaine Vercel
                      </button>
                      {/* Bouton activer/désactiver le sous-domaine */}
                      <button onClick={async()=>{
                        const newDomain = s.domain_active ? null : s.slug+".vitrine.marcheduroi.com";
                        const { error } = await supabase.from("structures").update({
                          custom_domain: newDomain,
                          domain_active: !s.domain_active
                        }).eq("id", s.id);
                        if (!error) {
                          setStructures(prev => prev.map(x => x.id===s.id ? {...x, domain_active:!s.domain_active, custom_domain:newDomain} : x));
                          notify(s.domain_active ? "Sous-domaine désactivé" : "✅ Sous-domaine activé !");
                        }
                      }} style={{ background:s.domain_active?"rgba(16,185,129,0.15)":"rgba(255,215,0,0.1)",border:`1px solid ${s.domain_active?"rgba(16,185,129,0.4)":"rgba(255,215,0,0.3)"}`,color:s.domain_active?"#10B981":"#FFD700",padding:"5px 12px",borderRadius:7,fontSize:11,fontWeight:700,cursor:"pointer" }}>
                        {s.domain_active ? "✅ Sous-domaine actif" : "⚡ Marquer comme actif"}
                      </button>
                    </div>
                  </div>

                  {/* Propriétaire */}
                  <div style={{ background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.15)",borderRadius:10,padding:12,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap" }}>
                    <p style={{ color:"#9A9AB0",fontSize:11,margin:0 }}>
                      👤 Propriétaire : <span style={{ color: s.owner_id ? "#10B981" : "#FF4757",fontWeight:700 }}>{s.owner_id ? "Défini" : "Non défini"}</span>
                    </p>
                    {!s.owner_id && (
                      <button onClick={()=>setAsOwner(s)}
                        style={{ background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",color:"#10B981",padding:"5px 12px",borderRadius:7,fontSize:11,fontWeight:700,cursor:"pointer" }}>
                        👤 Me définir propriétaire
                      </button>
                    )}
                  </div>

                  {/* Lien de paiement */}
                  {!s.paid_at && (
                    <div style={{ background:"rgba(255,215,0,0.05)",border:"1px solid rgba(255,215,0,0.2)",borderRadius:10,padding:12,marginBottom:8 }}>
                      <p style={{ color:"#9A9AB0",fontSize:11,fontWeight:700,margin:"0 0 4px" }}>💳 LIEN DE PAIEMENT (à envoyer au client pour activer la vitrine)</p>
                      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                        <code style={{ color:"#FFD700",fontSize:11,flex:1,wordBreak:"break-all",background:"transparent",fontFamily:"monospace" }}>
                          {window.location.origin}/vitrine/{s.slug}/payer?token={s.edit_token}
                        </code>
                        <button onClick={()=>copyPayLink(s)} style={{ background:"rgba(255,215,0,0.12)",border:"1px solid rgba(255,215,0,0.3)",color:"#FFD700",padding:"5px 10px",borderRadius:7,fontWeight:700,fontSize:11,cursor:"pointer",flexShrink:0 }}>
                          Copier
                        </button>
                      </div>
                      <p style={{ color:"#9A9AB0",fontSize:11,margin:"6px 0 0" }}>Montant : {((s.creation_amount)||15000).toLocaleString("fr-FR")} FCFA · Paiement via FedaPay / Flutterwave</p>
                    </div>
                  )}
                  {s.paid_at && (
                    <div style={{ background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,padding:12,marginBottom:8 }}>
                      <p style={{ color:"#10B981",fontSize:12,fontWeight:700,margin:0 }}>✅ Payée le {new Date(s.paid_at).toLocaleDateString("fr-FR")} · Expire le {s.expires_at ? new Date(s.expires_at).toLocaleDateString("fr-FR") : "—"}</p>
                    </div>
                  )}

                  {/* Lien public */}
                  <div style={{ background:theme.card||"#1A1D30",border:`1px solid ${theme.border||"#2A2D45"}`,borderRadius:10,padding:12,marginBottom:8 }}>
                    <p style={{ color:theme.sub||"#9A9AB0",fontSize:11,fontWeight:700,margin:"0 0 4px" }}>🔗 LIEN PUBLIC (à partager)</p>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <code style={{ color:COLOR,fontSize:12,flex:1,wordBreak:"break-all",background:"transparent",fontFamily:"monospace" }}>
                        {window.location.origin}/vitrine/{s.slug}
                      </code>
                      <button onClick={()=>copyPublicLink(s)} style={{ background:`rgba(16,185,129,0.12)`,border:`1px solid rgba(16,185,129,0.3)`,color:COLOR,padding:"5px 10px",borderRadius:7,fontWeight:700,fontSize:11,cursor:"pointer",flexShrink:0 }}>
                        Copier
                      </button>
                    </div>
                  </div>

                  {/* Lien de modification */}
                  <div style={{ background:"rgba(108,99,255,0.06)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:10,padding:12 }}>
                    <p style={{ color:"#9A9AB0",fontSize:11,fontWeight:700,margin:"0 0 4px" }}>✏️ LIEN DE MODIFICATION (à envoyer au client)</p>
                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                      <code style={{ color:"#6C63FF",fontSize:11,flex:1,wordBreak:"break-all",background:"transparent",fontFamily:"monospace" }}>
                        {window.location.origin}/vitrine/{s.slug}/modifier?token={s.edit_token}
                      </code>
                      <button onClick={()=>copyEditLink(s)} style={{ background:"rgba(108,99,255,0.12)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"5px 10px",borderRadius:7,fontWeight:700,fontSize:11,cursor:"pointer",flexShrink:0 }}>
                        Copier
                      </button>
                    </div>
                    <p style={{ color:"#9A9AB0",fontSize:11,margin:"6px 0 0" }}>⚠️ Garde ce lien confidentiel — il permet au client de modifier sa vitrine.</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ========== ONGLET CRÉER / MODIFIER ========== */}
      {(tab === "creer" || tab === "modifier") && (
        <div style={{ background:theme.card||"#1A1D30",border:`1px solid ${tab==="modifier"?"rgba(255,140,0,0.3)":theme.border||"#2A2D45"}`,borderRadius:16,padding:24 }}>

          {/* Bandeau mode modification */}
          {tab === "modifier" && (
            <div style={{ background:"rgba(255,140,0,0.08)",border:"1px solid rgba(255,140,0,0.25)",borderRadius:12,padding:14,marginBottom:20 }}>
              <p style={{ margin:0,fontWeight:700,color:"#FF8C00",fontSize:14 }}>✏️ Modification de la vitrine</p>
              <p style={{ margin:"4px 0 0",color:theme.sub||"#9A9AB0",fontSize:13 }}>Tous les champs sont modifiables. Les modifications sont appliquées immédiatement.</p>
            </div>
          )}

          {/* IDENTITÉ */}
          <p style={sectionTitleStyle}>🏛️ Identité de la structure</p>

          <label style={labelStyle}>Nom officiel *</label>
          <input style={inputStyle} value={form.name}
            onChange={e=>handleNameChange(e.target.value)}
            placeholder="École Sainte-Marie de Cotonou"/>

          <label style={labelStyle}>Slug (URL) *</label>
          <div style={{ position:"relative" }}>
            <input style={{...inputStyle,fontFamily:"monospace",fontSize:13}} value={form.slug}
              onChange={e=>setForm(f=>({...f,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"")}))}
              placeholder="ecole-sainte-marie-cotonou"/>
          </div>
          <p style={{ color:theme.sub||"#9A9AB0",fontSize:11,margin:"4px 0 0" }}>
            URL finale : <code style={{ color:COLOR }}>{window.location.origin}/vitrine/{form.slug||"..."}</code>
          </p>

          <label style={labelStyle}>Type *</label>
          <select style={{...inputStyle,cursor:"pointer"}} value={form.type}
            onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
            {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>

          <label style={labelStyle}>Slogan / Mission</label>
          <input style={inputStyle} value={form.slogan}
            onChange={e=>setForm(f=>({...f,slogan:e.target.value}))}
            placeholder="Former les leaders de demain"/>

          <label style={labelStyle}>Description</label>
          <textarea style={{...inputStyle,minHeight:80,resize:"vertical"}} value={form.description}
            onChange={e=>setForm(f=>({...f,description:e.target.value}))}
            placeholder="Présentation complète de la structure…"/>

          {/* MÉDIAS */}
          <p style={sectionTitleStyle}>🖼️ Médias</p>

          <label style={labelStyle}>Logo (lien URL)</label>
          <input style={inputStyle} value={form.logo_url}
            onChange={e=>setForm(f=>({...f,logo_url:e.target.value}))}
            placeholder="https://i.ibb.co/.../logo.png"/>

          <label style={labelStyle}>Photo de couverture / bannière (lien URL)</label>
          <input style={inputStyle} value={form.cover_url}
            onChange={e=>setForm(f=>({...f,cover_url:e.target.value}))}
            placeholder="https://i.ibb.co/.../banniere.jpg"/>

          <label style={labelStyle}>Photos galerie — un lien par ligne (max 10)</label>
          <div style={{ background:"rgba(108,99,255,0.06)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:10,padding:12,marginTop:-4,marginBottom:8 }}>
            <p style={{ color:"#6C63FF",fontWeight:700,fontSize:12,margin:"0 0 4px" }}>📐 Dimensions recommandées</p>
            <p style={{ color:"#9A9AB0",fontSize:11,margin:0,lineHeight:1.7 }}>
              • Photo couverture boutique : <strong style={{color:"#E8E8F0"}}>1200×800px</strong> (ratio 3:2)<br/>
              • Photos galerie : <strong style={{color:"#E8E8F0"}}>1200×900px</strong> (ratio 4:3)<br/>
              • Hébergez vos photos sur <strong style={{color:"#E8E8F0"}}>ImgBB.com</strong> (gratuit) puis copiez le lien direct
            </p>
          </div>
          <textarea style={{...inputStyle,minHeight:90,resize:"vertical",fontFamily:"monospace",fontSize:12}}
            value={form.photos} onChange={e=>setForm(f=>({...f,photos:e.target.value}))}
            placeholder={"https://i.ibb.co/.../photo1.jpg\nhttps://i.ibb.co/.../photo2.jpg"}/>

          <label style={labelStyle}>Vidéo YouTube (lien)</label>
          <input style={inputStyle} value={form.video}
            onChange={e=>setForm(f=>({...f,video:e.target.value}))}
            placeholder="https://www.youtube.com/watch?v=..."/>

          {/* CONTACTS */}
          <p style={sectionTitleStyle}>📞 Contacts</p>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={labelStyle}>Téléphone principal</label>
              <input style={inputStyle} value={form.phone}
                onChange={e=>setForm(f=>({...f,phone:e.target.value}))}
                placeholder={getPhonePlaceholder()}/>
            </div>
            <div>
              <label style={labelStyle}>Téléphone secondaire</label>
              <input style={inputStyle} value={form.phone2}
                onChange={e=>setForm(f=>({...f,phone2:e.target.value}))}
                placeholder={getPhonePlaceholder()}/>
            </div>
            <div>
              <label style={labelStyle}>WhatsApp</label>
              <input style={inputStyle} value={form.whatsapp}
                onChange={e=>setForm(f=>({...f,whatsapp:e.target.value}))}
                placeholder={getPhonePlaceholder()}/>
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email}
                onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                placeholder="contact@structure.bj"/>
            </div>
            <div>
              <label style={labelStyle}>Site web</label>
              <input style={inputStyle} value={form.website}
                onChange={e=>setForm(f=>({...f,website:e.target.value}))}
                placeholder="https://www.mastructure.bj"/>
            </div>
            <div>
              <label style={labelStyle}>Facebook</label>
              <input style={inputStyle} value={form.facebook}
                onChange={e=>setForm(f=>({...f,facebook:e.target.value}))}
                placeholder="https://facebook.com/mastructure"/>
            </div>
          </div>

          {/* LOCALISATION */}
          <p style={sectionTitleStyle}>📍 Localisation</p>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={labelStyle}>Ville</label>
              <input style={inputStyle} value={form.ville}
                onChange={e=>setForm(f=>({...f,ville:e.target.value}))}
                placeholder="Cotonou"/>
            </div>
            <div>
              <label style={labelStyle}>Quartier</label>
              <input style={inputStyle} value={form.quartier}
                onChange={e=>setForm(f=>({...f,quartier:e.target.value}))}
                placeholder="Akpakpa"/>
            </div>
          </div>
          <label style={labelStyle}>Von (point de repère)</label>
          <input style={inputStyle} value={form.von}
            onChange={e=>setForm(f=>({...f,von:e.target.value}))}
            placeholder="Von de la cathédrale Notre-Dame"/>
          <label style={labelStyle}>Adresse complète</label>
          <input style={inputStyle} value={form.address}
            onChange={e=>setForm(f=>({...f,address:e.target.value}))}
            placeholder="123 rue de l'Indépendance"/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label style={labelStyle}>GPS — Latitude</label>
              <input style={inputStyle} type="number" step="any" value={form.gps_lat}
                onChange={e=>setForm(f=>({...f,gps_lat:e.target.value}))}
                placeholder="6.3654"/>
            </div>
            <div>
              <label style={labelStyle}>GPS — Longitude</label>
              <input style={inputStyle} type="number" step="any" value={form.gps_lng}
                onChange={e=>setForm(f=>({...f,gps_lng:e.target.value}))}
                placeholder="2.4183"/>
            </div>
          </div>
          <p style={{ color:theme.sub||"#9A9AB0",fontSize:11,margin:"4px 0 0" }}>
            💡 Pour obtenir les coordonnées GPS : Google Maps → clic droit sur le lieu → copie latitude/longitude
          </p>

          {/* INFOS PRATIQUES */}
          <p style={sectionTitleStyle}>🕐 Infos pratiques</p>
          <label style={labelStyle}>Horaires d'ouverture</label>
          <textarea style={{...inputStyle,minHeight:70,resize:"vertical"}} value={form.hours}
            onChange={e=>setForm(f=>({...f,hours:e.target.value}))}
            placeholder={"Lun–Ven : 7h30–17h00\nSam : 8h00–12h00"}/>
          <label style={labelStyle}>Services proposés</label>
          <textarea style={{...inputStyle,minHeight:70,resize:"vertical"}} value={form.services}
            onChange={e=>setForm(f=>({...f,services:e.target.value}))}
            placeholder="Consultations, urgences 24h/24, maternité, pédiatrie…"/>
          <label style={labelStyle}>Langues parlées</label>
          <input style={inputStyle} value={form.languages}
            onChange={e=>setForm(f=>({...f,languages:e.target.value}))}
            placeholder="Français, Fon, Yoruba, Anglais"/>

          {/* OPTIONS */}
          <p style={sectionTitleStyle}>⚙️ Options</p>
          <div style={{ display:"flex",gap:20,flexWrap:"wrap",marginTop:8 }}>
            <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",color:theme.text||"#E8E8F0",fontSize:14 }}>
              <input type="checkbox" checked={form.free_activation} onChange={e=>setForm(f=>({...f,free_activation:e.target.checked}))}
                style={{ width:16,height:16,accentColor:"#FFD700" }}/>
              ⚡ Activer sans paiement (vitrine offerte / partenaire / démo)
            </label>
            <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",color:theme.text||"#E8E8F0",fontSize:14 }}>
              <input type="checkbox" checked={form.verified} onChange={e=>setForm(f=>({...f,verified:e.target.checked}))}
                style={{ width:16,height:16,accentColor:COLOR }}/>
              ✅ Marquer comme Vérifié EDENPORTAIL
            </label>
            <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",color:theme.text||"#E8E8F0",fontSize:14 }}>
              <input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))}
                style={{ width:16,height:16,accentColor:COLOR }}/>
              👁️ Vitrine active (visible publiquement)
            </label>
          </div>

          {/* Messages d'état */}
          {saveMsg && (
            <div style={{ marginTop:20,background:saveMsg.type==="error"?"rgba(255,71,87,0.1)":"rgba(16,185,129,0.1)",border:`1px solid ${saveMsg.type==="error"?"rgba(255,71,87,0.3)":"rgba(16,185,129,0.3)"}`,borderRadius:10,padding:14 }}>
              <p style={{ margin:0,color:saveMsg.type==="error"?"#FF4757":COLOR,fontWeight:600,fontSize:14 }}>{saveMsg.text}</p>
            </div>
          )}

          {/* Boutons créer / modifier */}
          <div style={{ display:"flex",gap:12,marginTop:24 }}>
            <button onClick={()=>{ setForm(emptyForm); setSaveMsg(null); setEditingId(null); setTab("liste"); }}
              style={{ flex:1,padding:14,background:"transparent",border:`1px solid ${theme.border||"#2A2D45"}`,color:theme.sub||"#9A9AB0",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer" }}>
              Annuler
            </button>
            <button onClick={tab==="modifier" ? handleUpdate : handleCreate} disabled={saving}
              style={{ flex:2,padding:14,background:saving?"#1A1D30":tab==="modifier"?"linear-gradient(135deg,#FF8C00,#e67e00)":`linear-gradient(135deg,${COLOR},#059669)`,border:saving?`1px solid ${theme.border||"#2A2D45"}`:"none",color:saving?theme.sub||"#9A9AB0":"#fff",borderRadius:12,fontWeight:700,fontSize:15,cursor:saving?"not-allowed":"pointer",transition:"all 0.2s" }}>
              {saving ? (tab==="modifier"?"Enregistrement…":"Création en cours…") : tab==="modifier" ? "✏️ Enregistrer les modifications" : "🏛️ Créer la vitrine"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// -----------------------------------------------
// VitrineEdit — Page de modification client
// (rendu depuis VitrineDetail si isEditMode=true)
// -----------------------------------------------
// -----------------------------------------------
// VitrinePayment — Page de paiement client
// Route : /vitrine/:slug/payer?token=XXX
// -----------------------------------------------
// -----------------------------------------------
// VitrineRequest — Formulaire public de création
// Route : /vitrine
// -----------------------------------------------

export default AdminVitrineWeb;

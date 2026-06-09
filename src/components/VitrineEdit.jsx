import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import { VITRINE_THEMES, VITRINE_TYPES, NEWS_TYPES, getVitrineTheme, toSlug } from "../vitrineConstants";
import { VitrineCarousel, VitrineSection } from "./VitrineCarousel";
import { SingleUploader, GalleryUploader } from "./ImgBBUploader";

const getThemeFromStorage = () => {
  const t = localStorage.getItem("mdr_theme");
  const themes = { dark:{bg:"#0D0F1A",card:"#1A1D30",text:"#E8E8F0",sub:"#9A9AB0",border:"#2A2D45"}, light:{bg:"#F8FAFC",card:"#FFFFFF",text:"#1A1D30",sub:"#6B7280",border:"#E2E8F0"} };
  return themes[t] || themes.dark;
};

function VitrineEdit({ structure, token, tokenPreValidated, onDone }) {
  const T = getThemeFromStorage();
  const COLOR = "#10B981";

  const [form, setForm] = React.useState({
    slogan:   structure.slogan      || "",
    description: structure.description || "",
    phone:    structure.phone    || "",
    phone2:   structure.phone2   || "",
    whatsapp: structure.whatsapp || "",
    email:    structure.email    || "",
    facebook: structure.facebook || "",
    instagram: structure.instagram || "",
    website:  structure.website  || "",
    hours:    structure.hours    || "",
    logo_url: structure.logo_url  || "",
    cover_url: structure.cover_url || "",
    video:    structure.video    || "",
    photos:   (structure.photos  || []).join("\n"),
    services: structure.services || "",
    news_title:"", news_content:"", news_type:"Actualité",
    faq: structure.faq || [],
    theme:    structure.theme    || "dark",
    bg_image: structure.bg_image || "",
  });

  const [customFields, setCustomFields] = React.useState(structure.custom_fields || []);
  const [newField, setNewField]         = React.useState({ label:"", value:"" });

  const [news,        setNews]        = React.useState(structure.news || []);
  const [saving,      setSaving]      = React.useState(false);
  const [saved,       setSaved]       = React.useState(false);
  const [saveError,   setSaveError]   = React.useState(null);
  const [tokenValid,  setTokenValid]  = React.useState(false);
  const [checkingTok, setCheckingTok] = React.useState(true);
  const defaultSection = new URLSearchParams(window.location.search).get("section") || "contacts";
  const [openSection, setOpenSection] = React.useState(defaultSection);
  const [editBlocked, setEditBlocked] = React.useState(false); // Bloqué après 1ère modif
  const [payingEdit,  setPayingEdit]  = React.useState(false); // Paiement en cours

  React.useEffect(() => {
    if (!token || !structure) { setCheckingTok(false); return; }
    // Si token déjà validé par VitrineDetail, on bypass la comparaison
    if (tokenPreValidated) {
      setTokenValid(true);
      if (structure.last_edit_date || structure.lastEditDate) {
        const today = new Date().toISOString().slice(0,10);
        const lastEdit = structure.last_edit_date || structure.lastEditDate;
        if (lastEdit === today) setEditBlocked(true);
      }
      setCheckingTok(false);
      return;
    }
    // Supabase peut retourner edit_token ou editToken selon la config client
    const storedToken = structure.edit_token ?? structure.editToken ?? "";
    const isValid = String(storedToken).toLowerCase().trim() === String(token).toLowerCase().trim();
    setTokenValid(isValid);
    if (isValid && (structure.last_edit_date || structure.lastEditDate)) {
      const today = new Date().toISOString().slice(0,10);
      const lastEdit = structure.last_edit_date || structure.lastEditDate;
      if (lastEdit === today) setEditBlocked(true);
    }
    setCheckingTok(false);
  }, [token, structure, tokenPreValidated]);

  const handleSave = async () => {
    setSaving(true); setSaveError(null);
    const photosArray = form.photos.split("\n").map(l => l.trim()).filter(Boolean).slice(0,10);
    const today = new Date().toISOString().slice(0,10);
    const { error } = await supabase.from("structures").update({
      slogan: form.slogan || null, description: form.description || null,
      phone: form.phone, phone2: form.phone2, whatsapp: form.whatsapp,
      email: form.email, facebook: form.facebook, instagram: form.instagram || null,
      website: form.website || null, hours: form.hours,
      logo_url: form.logo_url || null, cover_url: form.cover_url || null,
      video: form.video, photos: photosArray, services: form.services,
      news, updated_at: new Date().toISOString(),
      theme:         form.theme    || "dark",
      bg_image:      form.bg_image || null,
      custom_fields: customFields,
      faq: form.faq || [],
      last_edit_date: today,
    }).eq("id", structure.id).eq("edit_token", token);
    if (error) setSaveError("Erreur lors de la sauvegarde. Réessayez.");
    else { setSaved(true); setTimeout(onDone, 1800); }
    setSaving(false);
  };

  // Paiement 200 FCFA pour modifier une 2ème fois
  const handlePayEdit = async () => {
    setPayingEdit(true);
    try {
      const loadFP = () => new Promise((res,rej)=>{ if(window.FedaPay){res();return;} const s=document.createElement("script"); s.src="https://cdn.fedapay.com/checkout.js?v=1.1.7"; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
      await loadFP();
      window.FedaPay.init({
        public_key: import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || "pk_sandbox_VOTRE_CLE_ICI",
        transaction: { amount: 200, description: `Modification supplémentaire — ${structure.name}` },
        customer: { email: structure.email || "client@marcheduroi.com" },
        onComplete(resp, reason) {
          const ok = reason === window.FedaPay.TRANSACTION_APPROVED || reason === "transaction_approved" || reason === "approved";
          if (ok) { setEditBlocked(false); }
          else setSaveError("Paiement annulé.");
        }
      }).open();
    } catch { setSaveError("Module de paiement non chargé."); }
    setPayingEdit(false);
  };

  const addNews = () => {
    if (!form.news_title.trim()) return;
    const entry = {
      title:   form.news_title,
      content: form.news_content,
      date:    new Date().toLocaleDateString("fr-FR"),
      type:    form.news_type || "Actualité",
    };
    setNews(prev => [entry, ...prev]);
    setForm(f => ({ ...f, news_title:"", news_content:"", news_type:"Actualité" }));
  };

  if (checkingTok) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:T.bg,fontFamily:"Sora,sans-serif",color:T.sub }}>Vérification…</div>
  );

  if (!tokenValid) return (
    <div style={{ textAlign:"center",padding:"80px 24px",fontFamily:"Sora,sans-serif",background:T.bg,minHeight:"100vh",color:T.text }}>
      <p style={{ fontSize:48,marginBottom:16 }}>🔒</p>
      <h2 style={{ fontSize:22,fontWeight:700,marginBottom:12 }}>Lien non valide</h2>
      <p style={{ color:T.sub }}>Contactez EDENPORTAIL pour obtenir un nouveau lien.</p>
    </div>
  );

  const inp = { width:"100%",background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",color:T.text,fontSize:14,fontFamily:"Sora,sans-serif",outline:"none",boxSizing:"border-box" };
  const lbl = { display:"block",color:T.sub,fontSize:12,fontWeight:600,marginBottom:5,marginTop:14 };

  return (
    <div style={{ background:T.bg,minHeight:"100vh",fontFamily:"Sora,sans-serif",color:T.text }}>
      {/* Navbar */}
      <div style={{ background:T.bg+"EE",borderBottom:`1px solid ${T.border}`,padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100 }}>
        <img src="/marcheduRoi-icon.svg" alt="MarcheduRoi" style={{ height:52,objectFit:"contain" }}/>
        <span style={{ color:COLOR,fontWeight:700,fontSize:14 }}>✏️ Modifier ma vitrine</span>
      </div>

      <div style={{ maxWidth:620,margin:"0 auto",padding:"24px 24px 48px" }}>

        {/* Bandeau info */}
        <div style={{ background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:12,padding:16,marginBottom:20 }}>
          <p style={{ margin:0,fontWeight:700,color:COLOR }}>✏️ {structure.name}</p>
          <p style={{ margin:"6px 0 0",color:T.sub,fontSize:13,lineHeight:1.6 }}>
            Cliquez sur une section pour la modifier. Pour changer le nom ou l'adresse, contactez <strong style={{ color:T.text }}>EDENPORTAIL</strong>.
          </p>
        </div>

        {/* Blocage 2ème modification */}
        {editBlocked && (
          <div style={{ background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.3)",borderRadius:12,padding:16,marginBottom:20 }}>
            <p style={{ margin:"0 0 8px",fontWeight:700,color:"#FFD700" }}>⚠️ Modification du jour déjà effectuée</p>
            <p style={{ margin:"0 0 12px",color:T.sub,fontSize:13,lineHeight:1.6 }}>
              Vous avez déjà modifié votre vitrine aujourd'hui. Une modification supplémentaire coûte <strong style={{ color:"#FFD700" }}>200 FCFA</strong>.
            </p>
            <button onClick={handlePayEdit} disabled={payingEdit}
              style={{ background:"rgba(255,215,0,0.15)",border:"1px solid rgba(255,215,0,0.4)",color:"#FFD700",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer" }}>
              {payingEdit ? "Chargement…" : "💳 Payer 200 FCFA pour modifier à nouveau"}
            </button>
          </div>
        )}

        {/* Sections accordéon */}
        <VitrineSection id="apparence" icon="🎨" title="Apparence de la vitrine" openSection={openSection} setOpenSection={setOpenSection} COLOR={COLOR} T={T}>
          <label style={lbl}>Thème de couleur</label>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16 }}>
            {Object.entries(VITRINE_THEMES).map(([key, val]) => (
              <div key={key} onClick={()=>!editBlocked&&setForm(f=>({...f,theme:key}))}
                style={{ borderRadius:12,padding:"10px 8px",textAlign:"center",cursor:editBlocked?"not-allowed":"pointer",border:`2px solid ${form.theme===key?val.accent:T.border}`,background:val.bg,transition:"all 0.2s",opacity:editBlocked?0.5:1 }}>
                <div style={{ width:24,height:24,borderRadius:"50%",background:val.accent,margin:"0 auto 6px" }}/>
                <p style={{ margin:0,fontSize:11,fontWeight:700,color:val.text }}>{val.label}</p>
              </div>
            ))}
          </div>
          <label style={lbl}>Image de fond (lien URL) — optionnel</label>
          <input style={inp} value={form.bg_image}
            onChange={e=>setForm(f=>({...f,bg_image:e.target.value}))}
            placeholder="https://i.ibb.co/.../fond.jpg" disabled={editBlocked}/>
          <p style={{ color:T.sub,fontSize:11,margin:"6px 0 0",lineHeight:1.6 }}>
            💡 L'image de fond s'affiche en arrière-plan avec le thème sélectionné. Utilisez une image haute résolution (min. 1920x1080px).
          </p>
          {/* Aperçu du thème */}
          {form.theme && (
            <div style={{ marginTop:14,borderRadius:12,padding:16,background:VITRINE_THEMES[form.theme]?.bg,border:`1px solid ${VITRINE_THEMES[form.theme]?.border}` }}>
              <p style={{ margin:0,fontWeight:700,color:VITRINE_THEMES[form.theme]?.accent,fontSize:13 }}>
                Aperçu — {VITRINE_THEMES[form.theme]?.label}
              </p>
              <p style={{ margin:"4px 0 0",color:VITRINE_THEMES[form.theme]?.text,fontSize:12 }}>Voici à quoi ressemblera le fond de votre vitrine.</p>
            </div>
          )}
        </VitrineSection>

        {/* ---- Section Identité ---- */}
        <VitrineSection id="identite" icon="✏️" title="Présentation" openSection={openSection} setOpenSection={setOpenSection} COLOR={COLOR} T={T}>
          <label style={lbl}>Slogan / Mission en une phrase</label>
          <input style={inp} value={form.slogan}
            onChange={e=>setForm(f=>({...f,slogan:e.target.value}))}
            placeholder="Ex: La vraie cuisine béninoise, comme à la maison"
            disabled={editBlocked} maxLength={120}/>

          <label style={lbl}>Description complète</label>
          <textarea style={{...inp,minHeight:100,resize:"vertical"}} value={form.description}
            onChange={e=>setForm(f=>({...f,description:e.target.value}))}
            placeholder="Décrivez votre structure, votre histoire, vos spécialités…"
            disabled={editBlocked}/>

          <label style={lbl}>Site web</label>
          <input style={inp} value={form.website}
            onChange={e=>setForm(f=>({...f,website:e.target.value}))}
            placeholder="https://www.votresite.com"
            disabled={editBlocked}/>

          <label style={lbl}>Instagram</label>
          <input style={inp} value={form.instagram}
            onChange={e=>setForm(f=>({...f,instagram:e.target.value}))}
            placeholder="https://www.instagram.com/votre_compte"
            disabled={editBlocked}/>
        </VitrineSection>

        <VitrineSection id="contacts" icon="📞" title="Contacts" openSection={openSection} setOpenSection={setOpenSection} COLOR={COLOR} T={T}>
          <label style={lbl}>Téléphone principal</label>
          <input style={inp} value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+229 0100000000" disabled={editBlocked}/>
          <label style={lbl}>Téléphone secondaire</label>
          <input style={inp} value={form.phone2} onChange={e=>setForm(f=>({...f,phone2:e.target.value}))} placeholder="+229 0100000000" disabled={editBlocked}/>
          <label style={lbl}>WhatsApp</label>
          <input style={inp} value={form.whatsapp} onChange={e=>setForm(f=>({...f,whatsapp:e.target.value}))} placeholder="+229 0100000000" disabled={editBlocked}/>
          <label style={lbl}>Email</label>
          <input style={inp} type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="contact@mastructure.bj" disabled={editBlocked}/>
          <label style={lbl}>Facebook</label>
          <input style={inp} value={form.facebook} onChange={e=>setForm(f=>({...f,facebook:e.target.value}))} placeholder="https://facebook.com/mastructure" disabled={editBlocked}/>
        </VitrineSection>

        <VitrineSection id="horaires" icon="🕐" title="Horaires d'ouverture" openSection={openSection} setOpenSection={setOpenSection} COLOR={COLOR} T={T}>
          <label style={lbl}>Horaires (Entrée pour retour à la ligne)</label>
          <textarea style={{...inp,minHeight:90,resize:"vertical"}} value={form.hours}
            onChange={e=>setForm(f=>({...f,hours:e.target.value}))}
            placeholder={"Lun–Ven : 7h30–17h00\nSam : 8h00–12h00\nDim : Fermé"} disabled={editBlocked}/>
        </VitrineSection>

        <VitrineSection id="services" icon="✅" title="Services proposés" openSection={openSection} setOpenSection={setOpenSection} COLOR={COLOR} T={T}>
          <textarea style={{...inp,minHeight:80,resize:"vertical"}} value={form.services}
            onChange={e=>setForm(f=>({...f,services:e.target.value}))}
            placeholder="Consultations générales, urgences 24h/24…" disabled={editBlocked}/>
        </VitrineSection>

        <VitrineSection id="photos" icon="🖼️" title="Photos & Logo" openSection={openSection} setOpenSection={setOpenSection} COLOR={COLOR} T={T}>
          <SingleUploader
            value={form.logo_url||""}
            onChange={url=>setForm(f=>({...f,logo_url:url}))}
            label="Logo"
            hint="Format idéal : 400×400px, carré, fond opaque."
            placeholder="https://i.ibb.co/.../logo.png"
            theme={T}
          />
          <SingleUploader
            value={form.cover_url||""}
            onChange={url=>setForm(f=>({...f,cover_url:url}))}
            label="Photo de couverture"
            hint="Format idéal : 1920×600px. Aussi affichée lors du partage WhatsApp."
            placeholder="https://i.ibb.co/.../banniere.jpg"
            theme={T}
          />
          <GalleryUploader
            value={form.photos||""}
            onChange={val=>setForm(f=>({...f,photos:val}))}
            max={20}
            theme={T}
            disabled={editBlocked}
          />
        </VitrineSection>

        <VitrineSection id="faq" icon="❓" title="FAQ — Questions fréquentes" openSection={openSection} setOpenSection={setOpenSection} COLOR={COLOR} T={T}>
          <p style={{ fontSize:12,color:T.sub,margin:"0 0 12px",lineHeight:1.6 }}>
            Ajoutez les questions que vos clients posent souvent. Bon pour Google et pratique pour vos visiteurs.
          </p>
          {(form.faq||[]).map((item,i) => (
            <div key={i} style={{ background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:12,marginBottom:8 }}>
              <input
                value={item.question}
                onChange={e=>setForm(f=>({...f,faq:f.faq.map((q,j)=>j===i?{...q,question:e.target.value}:q)}))}
                placeholder={`Question ${i+1} — Ex: Acceptez-vous les paiements MTN Money ?`}
                maxLength={120}
                disabled={editBlocked}
                style={{...inp,marginBottom:6,fontWeight:600}}
              />
              <textarea
                value={item.reponse}
                onChange={e=>setForm(f=>({...f,faq:f.faq.map((q,j)=>j===i?{...q,reponse:e.target.value}:q)}))}
                placeholder="Votre réponse..."
                maxLength={300}
                rows={2}
                disabled={editBlocked}
                style={{...inp,resize:"none",fontSize:13}}
              />
              {!editBlocked && (
                <button type="button" onClick={()=>setForm(f=>({...f,faq:f.faq.filter((_,j)=>j!==i)}))}
                  style={{background:"transparent",border:"1px solid rgba(255,71,87,0.4)",color:"#FF4757",padding:"4px 12px",borderRadius:6,fontSize:12,cursor:"pointer",marginTop:6,fontWeight:600}}>
                  🗑️ Supprimer
                </button>
              )}
            </div>
          ))}
          {(form.faq||[]).length < 10 && !editBlocked && (
            <button type="button"
              onClick={()=>setForm(f=>({...f,faq:[...(f.faq||[]),{question:"",reponse:""}]}))}
              style={{background:`rgba(16,185,129,0.12)`,border:`1px solid rgba(16,185,129,0.4)`,color:COLOR,padding:"10px 20px",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",width:"100%"}}>
              + Ajouter une question ({(form.faq||[]).length}/10)
            </button>
          )}
        </VitrineSection>

        <VitrineSection id="video" icon="🎬" title="Vidéo YouTube" openSection={openSection} setOpenSection={setOpenSection} COLOR={COLOR} T={T}>
          <label style={lbl}>Lien YouTube</label>
          <input style={inp} value={form.video}
            onChange={e=>setForm(f=>({...f,video:e.target.value}))}
            placeholder="https://www.youtube.com/watch?v=..." disabled={editBlocked}/>
        </VitrineSection>

        <VitrineSection id="news" icon="📰" title="Actualités & Promotions" openSection={openSection} setOpenSection={setOpenSection} COLOR={COLOR} T={T}>
          <label style={lbl}>Type</label>
          <input style={inp} list="vitrine-edit-news-types" value={form.news_type||"Actualité"}
            onChange={e=>setForm(f=>({...f,news_type:e.target.value}))}
            placeholder="Type d'actualité…" disabled={editBlocked}/>
          <datalist id="vitrine-edit-news-types">
            {["Actualité","Promotion","Nouveauté","Événement","Offre d'emploi","Menu du jour","Spécialité","Annonce"].map(t=><option key={t} value={t}/>)}
          </datalist>
          <label style={lbl}>Titre</label>
          <input style={inp} value={form.news_title}
            onChange={e=>setForm(f=>({...f,news_title:e.target.value}))}
            placeholder="Menu du jour · Nouvelle recette · Promotion…" disabled={editBlocked}/>
          <label style={lbl}>Contenu</label>
          <textarea style={{...inp,minHeight:70,resize:"vertical"}} value={form.news_content}
            onChange={e=>setForm(f=>({...f,news_content:e.target.value}))}
            placeholder="Détails de l'actualité…" disabled={editBlocked}/>
          <button onClick={addNews} disabled={editBlocked}
            style={{ marginTop:10,background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.3)",color:COLOR,padding:"10px 20px",borderRadius:10,fontWeight:600,cursor:editBlocked?"not-allowed":"pointer",fontSize:14 }}>
            + Ajouter
          </button>

          {news.length > 0 && (
            <div style={{ marginTop:12,display:"flex",flexDirection:"column",gap:8 }}>
              {news.map((n,i) => (
                <div key={i} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:12,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8 }}>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0,fontWeight:700,fontSize:14,color:T.text }}>{n.title}</p>
                    <p style={{ margin:"2px 0 0",color:T.sub,fontSize:12 }}>{n.type} · {n.date}</p>
                    {n.content && <p style={{ margin:"4px 0 0",color:T.sub,fontSize:13,lineHeight:1.5 }}>{n.content}</p>}
                  </div>
                  <button onClick={()=>setNews(prev=>prev.filter((_,j)=>j!==i))} disabled={editBlocked}
                    style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757",padding:"6px 12px",borderRadius:8,cursor:editBlocked?"not-allowed":"pointer",fontSize:12,fontWeight:600,flexShrink:0 }}>
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </VitrineSection>

        {/* ---- Champs personnalisés ---- */}
        <VitrineSection id="custom" icon="⚙️" title="Champs personnalisés" openSection={openSection} setOpenSection={setOpenSection} COLOR={COLOR} T={T}>
          <p style={{ color:T.sub,fontSize:13,marginBottom:14,lineHeight:1.6 }}>
            Ajoutez vos propres rubriques : Tarifs, Équipe, Témoignages, Conditions, Partenaires…
          </p>

          {/* Champs existants */}
          {customFields.length > 0 && (
            <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:16 }}>
              {customFields.map((f,i) => (
                <div key={i} style={{ background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:12 }}>
                  {/* Label modifiable */}
                  <input style={{...inp,marginBottom:6,fontWeight:700}}
                    value={f.label}
                    onChange={e=>{ const updated=[...customFields]; updated[i]={...updated[i],label:e.target.value}; setCustomFields(updated); }}
                    placeholder="Nom du champ (ex: Tarifs)" disabled={editBlocked}/>
                  {/* Valeur modifiable */}
                  <div style={{ display:"flex",gap:8 }}>
                    <textarea style={{...inp,minHeight:60,resize:"vertical",flex:1}}
                      value={f.value}
                      onChange={e=>{ const updated=[...customFields]; updated[i]={...updated[i],value:e.target.value}; setCustomFields(updated); }}
                      placeholder="Contenu du champ…" disabled={editBlocked}/>
                    <button onClick={()=>!editBlocked&&setCustomFields(prev=>prev.filter((_,j)=>j!==i))}
                      disabled={editBlocked}
                      style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757",padding:"8px 12px",borderRadius:8,cursor:editBlocked?"not-allowed":"pointer",fontWeight:700,fontSize:13,flexShrink:0,alignSelf:"flex-start" }}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ajouter un nouveau champ */}
          {!editBlocked && (
            <div style={{ background:`rgba(16,185,129,0.05)`,border:`1px solid rgba(16,185,129,0.2)`,borderRadius:12,padding:14 }}>
              <p style={{ color:COLOR,fontWeight:700,fontSize:13,margin:"0 0 10px" }}>+ Nouveau champ</p>
              <input style={{...inp,marginBottom:8}}
                value={newField.label}
                onChange={e=>setNewField(f=>({...f,label:e.target.value}))}
                placeholder="Nom du champ (ex: Spécialités, Équipe, Témoignages…)"/>
              <textarea style={{...inp,minHeight:70,resize:"vertical",marginBottom:10}}
                value={newField.value}
                onChange={e=>setNewField(f=>({...f,value:e.target.value}))}
                placeholder="Contenu…"/>
              <button onClick={()=>{
                if (!newField.label.trim()) return;
                setCustomFields(prev=>[...prev,{label:newField.label.trim(),value:newField.value.trim()}]);
                setNewField({label:"",value:""});
              }} style={{ background:`rgba(16,185,129,0.15)`,border:`1px solid rgba(16,185,129,0.3)`,color:COLOR,padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer" }}>
                + Ajouter ce champ
              </button>
            </div>
          )}
        </VitrineSection>

        {saveError && (
          <div style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:10,padding:14,marginTop:16 }}>
            <p style={{ margin:0,color:"#FF4757",fontWeight:600 }}>❌ {saveError}</p>
          </div>
        )}
        {saved && (
          <div style={{ background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:10,padding:14,marginTop:16 }}>
            <p style={{ margin:0,color:COLOR,fontWeight:600 }}>✅ Vitrine mise à jour ! Redirection…</p>
          </div>
        )}

        <button onClick={handleSave} disabled={saving || editBlocked}
          style={{ width:"100%",marginTop:24,padding:16,background:(saving||editBlocked)?"#1A1D30":`linear-gradient(135deg,${COLOR},#059669)`,border:(saving||editBlocked)?`1px solid ${T.border}`:"none",color:(saving||editBlocked)?T.sub:"#fff",borderRadius:12,fontWeight:700,fontSize:16,cursor:(saving||editBlocked)?"not-allowed":"pointer" }}>
          {saving ? "Enregistrement…" : editBlocked ? "Modification du jour déjà utilisée" : "💾 Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}
// -----------------------------------------------
// VitrineDetail — Page publique d'une structure



export default VitrineEdit;

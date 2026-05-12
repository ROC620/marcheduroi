import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import AdminVitrineWeb from "./AdminVitrineWeb";
import CertifiedBadge from "./CertifiedBadge";
import Icon from "./Icon";

export default function AdminPanel({ theme, notify, posts, setPosts, boutiques, setBoutiques, ateliers, setAteliers, restos, setRestos, beaute, setBeaute, user, windowWidth, t, setView, setModal, view, adRequests, setAdRequests, ads, setAds, openEditPost }) {
  const [adminSearch,    setAdminSearch]    = useState("");
  const [reports,        setReports]        = useState([]);
  const [adForm,         setAdForm]         = useState({ entreprise:"", slogan:"", logo_url:"", lien:"", couleur1:"#6C63FF", couleur2:"#8B84FF", fin:"" });
  const [adSaving,       setAdSaving]       = useState(false);
  const [adEditing,      setAdEditing]      = useState(null);
  const [showAdForm,     setShowAdForm]     = useState(false);
  const [suggestions,    setSuggestions]    = useState([]);
  const [featuredPosts,  setFeaturedPosts]  = useState(() => { try { return JSON.parse(localStorage.getItem("mf_featured")||"[]"); } catch { return []; } });
  const [certifiedUsers, setCertifiedUsers] = useState(() => { try { return JSON.parse(localStorage.getItem("mf_certified")||"[]"); } catch { return []; } });

  // Styles locaux
  const cardStyle  = { background:theme.card, border:`1px solid ${theme.border}` };
  const inputStyle = { background:theme.card, border:`1px solid ${theme.border}`, borderRadius:10, padding:"10px 14px", color:theme.text, fontSize:14, fontFamily:"Sora,sans-serif", outline:"none", width:"100%", boxSizing:"border-box" };

  // Fonctions admin
  const isCertified    = (authorId) => certifiedUsers.includes(authorId);
  const toggleFeatured = (itemId) => {
    setFeaturedPosts(f => {
      const updated = f.includes(itemId) ? f.filter(id=>id!==itemId) : [...f, itemId];
      localStorage.setItem("mf_featured", JSON.stringify(updated));
      notify(f.includes(itemId) ? "Retiré des vedettes" : "Ajouté en vedette 🏆 !");
      return updated;
    });
  };
  const toggleCertified = (authorId, authorName) => {
    setCertifiedUsers(prev => {
      const updated = prev.includes(authorId) ? prev.filter(id=>id!==authorId) : [...prev, authorId];
      localStorage.setItem("mf_certified", JSON.stringify(updated));
      notify(prev.includes(authorId) ? `Certification retirée à ${authorName}` : `${authorName} est maintenant Certifié MarchéduRoi 🏅 !`);
      return updated;
    });
  };
  const unsponsorPost = async (postId) => {
    setPosts(p => p.map(x => x.id===postId ? {...x, sponsored:false, sponsoredUntil:null} : x));
    setBoutiques(b => b.map(x => x.id===postId ? {...x, sponsored:false, sponsoredUntil:null} : x));
    setAteliers(a => a.map(x => x.id===postId ? {...x, sponsored:false, sponsoredUntil:null} : x));
    setRestos(r => r.map(x => x.id===postId ? {...x, sponsored:false, sponsoredUntil:null} : x));
    setBeaute(b => b.map(x => x.id===postId ? {...x, sponsored:false, sponsoredUntil:null} : x));
    await Promise.all([
      supabase.from("posts").update({sponsored:false,sponsored_until:null}).eq("id",postId),
      supabase.from("boutiques").update({sponsored:false,sponsored_until:null}).eq("id",postId),
      supabase.from("ateliers").update({sponsored:false,sponsored_until:null}).eq("id",postId),
      supabase.from("restos").update({sponsored:false,sponsored_until:null}).eq("id",postId),
      supabase.from("beaute").update({sponsored:false,sponsored_until:null}).eq("id",postId),
    ]).catch(()=>{});
    notify("Sponsoring retiré ✅");
  };
  const removeUrgent = async (postId) => {
    await supabase.from("posts").update({urgent:false,urgent_until:null}).eq("id",postId);
    setPosts(p => p.map(x => x.id===postId ? {...x, urgent:false, urgentUntil:null} : x));
    notify("🔥 Badge Urgent retiré ✅");
  };
  const openEdit = (post) => {
    if (openEditPost) { openEditPost(post); return; }
    setModal({ type:"edit", data:post });
  };
  const openEditShop = (item, shopType) => {
    const modalType = shopType==="resto"?"addresto":shopType==="beaute"?"addbeaute":"addshop";
    setModal({ type:modalType, data:{...item, editing:true} });
  };
  const editShop   = (item) => openEditShop(item, "boutique");
  const editResto  = (item) => openEditShop(item, "resto");
  const editBeaute = (item) => openEditShop(item, "beaute");

  return (
<div style={{ width:"100%",padding:"16px 12px",animation:"fadeIn 0.4s ease" }}>
  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8 }}>
    <h2 style={{ fontWeight:800,fontSize:28,color:theme.text }}>Panneau Admin</h2>
    <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
      <button onClick={async()=>{
        const { data } = await supabase.from("newsletter").select("*").order("created_at", { ascending: false });
        if (!data || data.length === 0) { notify("Aucun abonné pour le moment","error"); return; }
        const csv = "\uFEFF" + "Email;Date inscription\n" + data.map(r => r.email + ";" + (r.created_at?.slice(0,10)||"")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `newsletter_abonnes_${new Date().toISOString().slice(0,10)}.csv`; a.click();
        URL.revokeObjectURL(url);
        notify(`✅ ${data.length} abonné(s) exportés !`);
      }} style={{ background:"linear-gradient(135deg,#FF6584,#FF8C00)",border:"none",color:"#fff",padding:"8px 16px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
        📧 Exporter newsletter
      </button>
      <button onClick={async()=>{
        // Charger toutes les données
        const [pData, bData, aData, rData, beData, prData] = await Promise.all([
          supabase.from("posts").select("author,author_id,phone,contact,likes,views,created_at,sponsored,urgent,expires_at").then(r=>r.data||[]),
          supabase.from("boutiques").select("author,author_id,phone,likes,created_at,sponsored").then(r=>r.data||[]),
          supabase.from("ateliers").select("author,author_id,phone,likes,created_at,sponsored").then(r=>r.data||[]),
          supabase.from("restos").select("author,author_id,phone,likes,created_at,sponsored").then(r=>r.data||[]),
          supabase.from("beaute").select("author,author_id,phone,likes,created_at,sponsored").then(r=>r.data||[]),
          supabase.from("profiles").select("id,name,role,country,created_at").then(r=>r.data||[]),
        ]);
        // Regrouper par vendeur
        const allItems = [
          ...pData.map(x=>({...x,_type:"Annonce"})),
          ...bData.map(x=>({...x,_type:"Boutique"})),
          ...aData.map(x=>({...x,_type:"Atelier"})),
          ...rData.map(x=>({...x,_type:"Restaurant"})),
          ...beData.map(x=>({...x,_type:"Beauté"})),
        ];
        const vendeurs = {};
        allItems.forEach(item => {
          const id = item.author_id || "inconnu";
          if (!vendeurs[id]) {
            const profile = prData.find(p=>p.id===id);
            vendeurs[id] = {
              nom: item.author || "Inconnu",
              telephone: item.phone || "",
              email: item.contact || "",
              pays: profile?.country || "",
              dateInscription: profile?.created_at ? profile.created_at.slice(0,10) : "",
              role: profile?.role || "user",
              annonces:0, boutiques:0, ateliers:0, restos:0, beaute:0,
              totalVues:0, totalLikes:0, sponsorisations:0, urgents:0,
              derniereActivite:"",
            };
          }
          const v = vendeurs[id];
          if (item._type==="Annonce") v.annonces++;
          if (item._type==="Boutique") v.boutiques++;
          if (item._type==="Atelier") v.ateliers++;
          if (item._type==="Restaurant") v.restos++;
          if (item._type==="Beauté") v.beaute++;
          v.totalVues += item.views||0;
          v.totalLikes += item.likes||0;
          if (item.sponsored) v.sponsorisations++;
          if (item.urgent) v.urgents++;
          const dat = item.created_at?.slice(0,10)||"";
          if (dat > v.derniereActivite) v.derniereActivite = dat;
          if (!v.telephone && item.phone) v.telephone = item.phone;
          if (!v.email && item.contact) v.email = item.contact;
        });
        // Générer CSV
        const headers = ["Nom","Téléphone","Email","Pays","Date inscription","Rôle","Annonces","Boutiques","Ateliers","Restaurants","Beauté","Total publications","Total vues","Total likes","Sponsorisations","Urgents","Dernière activité"];
        const rows = Object.values(vendeurs).sort((a,b)=>(b.annonces+b.boutiques+b.ateliers+b.restos+b.beaute)-(a.annonces+a.boutiques+a.ateliers+a.restos+a.beaute));
        const csvRows = [headers.join(";")];
        rows.forEach(v => {
          const total = v.annonces+v.boutiques+v.ateliers+v.restos+v.beaute;
          csvRows.push([
            v.nom, v.telephone, v.email, v.pays, v.dateInscription, v.role,
            v.annonces, v.boutiques, v.ateliers, v.restos, v.beaute, total,
            v.totalVues, v.totalLikes, v.sponsorisations, v.urgents, v.derniereActivite
          ].join(";"));
        });
        const csv = "\uFEFF" + csvRows.join("\n"); // BOM pour Excel
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `marcheduroi_vendeurs_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        notify("✅ Export vendeurs téléchargé !");
      }} style={{ background:"linear-gradient(135deg,#43C6AC,#6C63FF)",border:"none",color:"#fff",padding:"8px 16px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
        📊 Exporter vendeurs
      </button>
      <button onClick={()=>{ const el=document.getElementById("admin-bannières"); if(el) el.scrollIntoView({behavior:"smooth"}); }} style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"8px 16px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
        📢 Gérer les bannières
      </button>
    </div>
  </div>

  {/* ── DEMANDES BANNIÈRES — toujours visible pour l'admin ── */}
  {user?.role==="admin" && (
    <div style={{ background:"rgba(108,99,255,0.08)",border:"2px solid rgba(108,99,255,0.4)",borderRadius:16,padding:20,marginBottom:24 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
        <p style={{ fontWeight:800,fontSize:15,color:"#6C63FF",display:"flex",alignItems:"center",gap:8 }}>
          📢 Demandes de bannières en attente
          {adRequests.filter(r=>r.status==="en_attente").length > 0 && (
            <span style={{ background:"#FF4757",color:"#fff",borderRadius:"50%",width:22,height:22,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700 }}>
              {adRequests.filter(r=>r.status==="en_attente").length}
            </span>
          )}
        </p>
        <button onClick={()=>{ supabase.from("ad_requests").select("*").order("created_at",{ascending:false}).then(({data})=>{ if(data) setAdRequests(data); notify("Actualisé ✅"); }); }}
          style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"5px 12px",borderRadius:8,fontWeight:700,fontSize:11,cursor:"pointer" }}>
          🔄 Actualiser
        </button>
      </div>
      {adRequests.filter(r=>r.status==="en_attente").length===0 && (
        <p style={{ color:theme.sub,fontSize:13,padding:"12px 0" }}>✅ Aucune demande en attente</p>
      )}
      {adRequests.filter(r=>r.status==="en_attente").map(req=>(
        <div key={req.id} style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:12,padding:16,marginBottom:10 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap" }}>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700,color:theme.text,fontSize:14,marginBottom:4 }}>{req.entreprise}</p>
              {req.slogan && <p style={{ color:theme.sub,fontSize:12,marginBottom:4 }}>{req.slogan}</p>}
              <div style={{ display:"flex",gap:8,flexWrap:"wrap",fontSize:12,color:theme.sub }}>
                <span>👤 {req.user_name}</span>
                <span>📅 {req.duree} jours</span>
                <span>💰 {(req.prix||0).toLocaleString()} FCFA</span>
                <span>📆 Expire le {req.expires_at}</span>
              </div>
            </div>
            <div style={{ display:"flex",gap:8,flexShrink:0 }}>
              <button onClick={async()=>{
                const { error } = await supabase.from("ads").insert({
                  entreprise:req.entreprise, slogan:req.slogan||"",
                  logo_url:req.logo_url||"", lien:req.lien||"",
                  couleur1:req.couleur1||"#6C63FF", couleur2:req.couleur2||"#8B84FF",
                  fin:req.expires_at, actif:true,
                });
                if (error) { notify("Erreur activation","error"); return; }
                await supabase.from("ad_requests").update({status:"approuve"}).eq("id",req.id);
                setAdRequests(prev=>prev.map(r=>r.id===req.id?{...r,status:"approuve"}:r));
                const today = new Date().toISOString().slice(0,10);
                const { data } = await supabase.from("ads").select("*").eq("actif",true).or(`fin.is.null,fin.gte.${today}`);
                if (data) setAds(data);
                notify("✅ Bannière activée !");
              }} style={{ background:"rgba(67,198,172,0.15)",border:"1px solid #43C6AC",color:"#43C6AC",padding:"8px 14px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                ✅ Activer
              </button>
              <button onClick={async()=>{
                await supabase.from("ad_requests").update({status:"refuse"}).eq("id",req.id);
                setAdRequests(prev=>prev.map(r=>r.id===req.id?{...r,status:"refuse"}:r));
                notify("Demande refusée");
              }} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"8px 14px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                ✕ Refuser
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Signalements en attente */}
  {(()=>{
    const pendingReports = reports.filter(r=>r.status==="En attente");
    if (pendingReports.length === 0) return null;
    return (
      <div style={{ background:"rgba(255,71,87,0.06)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:16,padding:20,marginBottom:24 }}>
        <p style={{ fontWeight:800,fontSize:14,color:"#FF4757",marginBottom:14,display:"flex",alignItems:"center",gap:8 }}>
          🚩 Signalements en attente
          <span style={{ background:"#FF4757",color:"#fff",borderRadius:"50%",width:22,height:22,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700 }}>{pendingReports.length}</span>
        </p>
        {pendingReports.slice(0,5).map((r,i)=>(
          <div key={i} style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:10,padding:12,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap" }}>
            <div>
              <p style={{ fontWeight:700,fontSize:13,color:theme.text,marginBottom:2 }}>🚩 {r.postTitle||"Annonce inconnue"}</p>
              <p style={{ fontSize:12,color:theme.sub }}>Motif : {r.motif} · Par : {r.reporter} · {r.date}</p>
            </div>
            <div style={{ display:"flex",gap:6 }}>
              <button onClick={async()=>{
                await supabase.from("reports").update({status:"Traité"}).eq("post_id",r.postId);
                setReports(prev=>prev.map(x=>x.id===r.id?{...x,status:"Traité"}:x));
                notify("Signalement marqué comme traité");
              }} style={{ background:"rgba(67,198,172,0.15)",border:"1px solid #43C6AC",color:"#43C6AC",padding:"6px 12px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                ✅ Traité
              </button>
              <button onClick={async()=>{
                const r2 = reports.find(x=>x.id===r.id);
                if (r2?.postId) {
                  for (const t of ["posts","boutiques","ateliers","restos","beaute"]) {
                    await supabase.from(t).delete().eq("id",r2.postId);
                  }
                  setPosts(p=>p.filter(x=>x.id!==r2.postId));
                  await supabase.from("reports").update({status:"Supprimé"}).eq("post_id",r2.postId);
                  setReports(prev=>prev.filter(x=>x.id!==r.id));
                  notify("Annonce supprimée !");
                }
              }} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"6px 12px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  })()}

  {/* Statistiques mensuelles */}
  {(()=>{
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
    const postsMonth = posts.filter(p=>p.created_at&&p.created_at>=monthStart).length;
    const sponsoredActive = posts.filter(p=>p.sponsored&&p.sponsoredUntil&&new Date(p.sponsoredUntil)>now).length;
    // Revenus estimés : annonces × 1000 + boutiques × 2500 + sponsorisés × 500
    const revEst = postsMonth*1000 + boutiques.filter(b=>b.created_at&&b.created_at>=monthStart).length*2500 + sponsoredActive*500;
    return (
      <div style={{ background:`linear-gradient(135deg,rgba(108,99,255,0.08),rgba(255,101,132,0.05))`,border:`1px solid rgba(108,99,255,0.2)`,borderRadius:16,padding:20,marginBottom:24 }}>
        <p style={{ fontWeight:800,fontSize:14,color:"#6C63FF",marginBottom:14,textTransform:"uppercase",letterSpacing:1 }}>📊 Ce mois-ci — {now.toLocaleString("fr",{month:"long",year:"numeric"})}</p>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12 }}>
          {[
            {icon:"📋",label:"Nouvelles annonces",val:postsMonth,color:"#6C63FF"},
            {icon:"🌟",label:"Sponsorisées actives",val:sponsoredActive,color:"#FFD700"},
            {icon:"🚩",label:"Signalements",val:reports.filter(r=>r.status==="En attente").length,color:"#FF4757"},
            {icon:"💰",label:"Revenus estimés",val:revEst.toLocaleString()+" F",color:"#43C6AC"},
          ].map(s=>(
            <div key={s.label} style={{ background:theme.card,borderRadius:12,padding:"12px 16px",textAlign:"center" }}>
              <p style={{ fontSize:22,marginBottom:4 }}>{s.icon}</p>
              <p style={{ fontWeight:800,fontSize:20,color:s.color,marginBottom:2 }}>{s.val}</p>
              <p style={{ color:theme.sub,fontSize:11 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  })()}

  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16,marginBottom:32,maxWidth:700 }}>
    {[{label:"Annonces",val:posts.length,color:"#6C63FF"},{label:"Boutiques",val:boutiques.length,color:"#FF6584"},{label:"Ateliers",val:ateliers.length,color:"#43C6AC"},{label:"Restos & Bars",val:restos.length,color:"#FF8C00"},{label:"Beauté",val:beaute.length,color:"#FF69B4"},{label:"Signalements",val:reports.filter(r=>r.status==="En attente").length,color:"#FF4757"},{label:"Suggestions",val:suggestions.length,color:"#9A78CF"}].map(s=>(
      <div key={s.label} style={{ ...cardStyle,borderRadius:14,padding:20,textAlign:"center" }}><p style={{ fontSize:36,fontWeight:800,color:s.color }}>{s.val}</p><p style={{ color:theme.sub,fontSize:13 }}>{s.label}</p></div>
    ))}
  </div>
  <h3 style={{ fontWeight:700,fontSize:18,marginBottom:16,color:theme.text }}>
    💬 Suggestions ({suggestions.length})
    {suggestions.filter(s=>s.status==="en attente").length > 0 && <span style={{ background:"#FF8C00",color:"#fff",borderRadius:"50%",width:22,height:22,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,marginLeft:8 }}>{suggestions.filter(s=>s.status==="en attente").length}</span>}
  </h3>
  {suggestions.length===0 && <p style={{ color:theme.sub,fontSize:13,marginBottom:24 }}>Aucune suggestion pour le moment.</p>}
  {suggestions.map(s=>(
    <div key={s.id} style={{ ...cardStyle,borderRadius:12,padding:16,marginBottom:10 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap",marginBottom:s.reply?8:0 }}>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:600,color:theme.text,marginBottom:4 }}>{s.text}</p>
          <p style={{ color:theme.sub,fontSize:12 }}>Par {s.author} · {s.date}</p>
          {s.reply && (
            <div style={{ marginTop:8,padding:"8px 12px",background:"rgba(108,99,255,0.08)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:8 }}>
              <p style={{ fontSize:12,color:"#6C63FF",fontWeight:600,marginBottom:2 }}>↩️ Réponse admin :</p>
              <p style={{ fontSize:12,color:theme.text }}>{s.reply}</p>
            </div>
          )}
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center",flexShrink:0 }}>
          <span style={{ background:s.status==="résolu"?"rgba(67,198,172,0.15)":"rgba(255,140,0,0.15)", color:s.status==="résolu"?"#43C6AC":"#FF8C00", padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:600 }}>
            {s.status==="résolu"?"✅ Résolu":"⏳ En attente"}
          </span>
          {s.status!=="résolu" && (
            <button onClick={()=>setSuggestions(prev=>prev.map(x=>x.id===s.id?{...x,status:"résolu"}:x))} style={{ background:"rgba(67,198,172,0.15)",border:"none",color:"#43C6AC",padding:"6px 12px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>
              ✅ Résoudre
            </button>
          )}
          <button onClick={()=>setSuggestions(prev=>prev.filter(x=>x.id!==s.id))} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"6px 10px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>
            🗑️
          </button>
        </div>
      </div>
      {/* Zone de réponse admin */}
      {s.status!=="résolu" && (
        <div style={{ display:"flex",gap:8,marginTop:8 }}>
          <input
            placeholder="Répondre à cette suggestion..."
            defaultValue={s.reply||""}
            id={`reply-${s.id}`}
            style={{ ...{background:theme.bg,border:`1px solid ${theme.border}`,color:theme.text,borderRadius:8,padding:"7px 12px",fontSize:12,fontFamily:"inherit",outline:"none",width:"100%",flex:1} }}
          />
          <button onClick={()=>{
            const val = document.getElementById(`reply-${s.id}`)?.value;
            if (!val?.trim()) return;
            setSuggestions(prev=>prev.map(x=>x.id===s.id?{...x,reply:val.trim(),status:"résolu"}:x));
          }} style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"7px 14px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0 }}>
            ↩️ Répondre
          </button>
        </div>
      )}
    </div>
  ))}
  {/* Signalements */}
  {reports.length > 0 && (
    <div style={{ marginBottom:32 }}>
      <h3 style={{ fontWeight:700,fontSize:18,marginBottom:16,color:"#FF4757",display:"flex",alignItems:"center",gap:8 }}>
        🚩 Signalements ({reports.length})
        {reports.filter(r=>r.status==="En attente").length > 0 && <span style={{ background:"#FF4757",color:"#fff",borderRadius:"50%",width:22,height:22,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700 }}>{reports.filter(r=>r.status==="En attente").length}</span>}
      </h3>
      {reports.map(r=>(
        <div key={r.id} style={{ ...cardStyle,borderRadius:12,padding:16,marginBottom:10 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap" }}>
            <div>
              <p style={{ fontWeight:700,color:theme.text,marginBottom:4 }}>🚩 {r.motif}</p>
              <p style={{ color:theme.sub,fontSize:13 }}>Annonce : "{r.postTitle}"</p>
              <p style={{ color:theme.sub,fontSize:12,marginTop:4 }}>Signalé par {r.reporter} · {r.date}</p>
            </div>
            <div style={{ display:"flex",gap:8,flexShrink:0 }}>
              <button onClick={()=>{
                const post = posts.find(p=>p.id===r.postId);
                if (post) setModal({type:"delete",data:post});
              }} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>
                Supprimer
              </button>
              <button onClick={()=>setReports(rep=>rep.map(x=>x.id===r.id?{...x,status:"Traité"}:x))} style={{ background:"rgba(67,198,172,0.1)",border:"none",color:"#43C6AC",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>
                ✅ Traité
              </button>
            </div>
          </div>
          <span style={{ background:r.status==="En attente"?"rgba(255,71,87,0.1)":"rgba(67,198,172,0.1)",color:r.status==="En attente"?"#FF4757":"#43C6AC",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,marginTop:8,display:"inline-block" }}>{r.status}</span>
        </div>
      ))}
    </div>
  )}

  {/* VitrineWeb — section admin */}
  <AdminVitrineWeb theme={theme} notify={notify} />

  {/* Barre de recherche unifiée + boutons navigation rapide */}
  <div style={{ ...cardStyle,borderRadius:14,padding:16,marginBottom:24 }}>
    <div style={{ position:"relative",marginBottom:12 }}>
      <div style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:theme.sub,pointerEvents:"none" }}><Icon name="search" size={15}/></div>
      <input value={adminSearch} onChange={e=>setAdminSearch(e.target.value)} placeholder="Rechercher dans toutes les sections..." style={{ ...inputStyle,padding:"11px 16px 11px 40px",borderRadius:10,fontSize:13,width:"100%" }}/>
      {adminSearch && <button onClick={()=>setAdminSearch("")} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:theme.sub,cursor:"pointer",fontSize:16 }}>✕</button>}
    </div>
    <p style={{ color:theme.sub,fontSize:12,marginBottom:10,fontWeight:600 }}>Navigation rapide :</p>
    <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
      {[
        { label:"📋 Annonces", id:"admin-annonces", color:"#6C63FF", count:posts.length },
        { label:"🛍️ Boutiques", id:"admin-boutiques", color:"#FF6584", count:boutiques.length },
        { label:"🔧 Ateliers", id:"admin-ateliers", color:"#43C6AC", count:ateliers.length },
        { label:"🍽️ Restos", id:"admin-restos", color:"#FF8C00", count:restos.length },
        { label:"💇 Beauté", id:"admin-beaute", color:"#FF69B4", count:beaute.length },
        { label:"🏛️ VitrineWeb", id:"admin-vitrines", color:"#10B981", count:0 },
      ].map(s=>(
        <button key={s.id} onClick={()=>document.getElementById(s.id)?.scrollIntoView({behavior:"smooth",block:"start"})} style={{ background:`rgba(${s.color.replace("#","").match(/.{2}/g).map(h=>parseInt(h,16)).join(",")},0.1)`,border:`1px solid ${s.color}44`,color:s.color,padding:"6px 14px",borderRadius:20,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
          {s.label} <span style={{ background:`${s.color}22`,borderRadius:10,padding:"1px 6px",fontSize:11 }}>{s.count}</span>
        </button>
      ))}
    </div>
  </div>

  <h3 id="admin-annonces" style={{ fontWeight:700,fontSize:18,margin:"24px 0 16px",color:theme.text,scrollMarginTop:80 }}>📋 Toutes les annonces ({posts.length})</h3>
  {adminSearch && <p style={{ color:theme.sub,fontSize:12,marginBottom:12 }}>{posts.filter(p=>(p.title+p.author+p.category).toLowerCase().includes(adminSearch.toLowerCase())).length} résultat(s)</p>}
  {posts.filter(p=>!adminSearch||(p.title+p.author+p.category).toLowerCase().includes(adminSearch.toLowerCase())).map(post=>(
    <div key={post.id} className="admin-row" style={{ ...cardStyle,borderRadius:12,padding:12,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap" }}>
      <div style={{ display:"flex",gap:12,alignItems:"center" }}>
        {post.photos&&post.photos.length>0&&<img src={post.photos[0]} alt="" style={{ width:40,height:40,borderRadius:6,objectFit:"cover" }}/>}
        <div><p style={{ fontWeight:700,color:theme.text }}>{post.title}</p><p style={{ color:theme.sub,fontSize:12 }}>Par {post.author} · {post.category}</p></div>
      </div>
      <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
        {!post.sponsored
          ? <button onClick={e=>{e.stopPropagation();setModal({type:"sponsor",data:post});}} style={{ background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.3)",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:6 }}>🌟 Sponsoriser</button>
          : <button onClick={()=>unsponsorPost(post.id)} style={{ background:"rgba(255,215,0,0.2)",border:"2px solid #FFD700",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6 }}>✅ Sponsorisé jusqu'au {post.sponsoredUntil} · Retirer</button>
        }
        {!(post.urgent&&new Date(post.urgentUntil)>new Date())
          ? <button onClick={async()=>{ const until=new Date(); until.setDate(until.getDate()+7); const u=until.toISOString().slice(0,10); await supabase.from("posts").update({urgent:true,urgent_until:u}).eq("id",post.id); setPosts(p=>p.map(x=>x.id===post.id?{...x,urgent:true,urgentUntil:u}:x)); notify("🔥 Badge Urgent activé 7j !"); }} style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>🔥 Mettre Urgent</button>
          : <button onClick={()=>removeUrgent(post.id)} style={{ background:"rgba(255,71,87,0.2)",border:"2px solid #FF4757",color:"#FF4757",padding:"8px 14px",borderRadius:8,fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6 }}>✅ Urgent jusqu'au {post.urgentUntil} · Retirer</button>
        }
        <button onClick={()=>toggleFeatured(post.id)} style={{ background:featuredPosts.includes(post.id)?"rgba(255,215,0,0.2)":"rgba(255,215,0,0.05)",border:"none",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>{featuredPosts.includes(post.id)?"🏆 Vedette ✓":"🏆 Vedette"}</button>
        <button onClick={()=>toggleCertified(post.authorId||post.author_id, post.author)} style={{ background:isCertified(post.authorId||post.author_id)?"rgba(108,99,255,0.2)":"rgba(108,99,255,0.05)",border:"none",color:"#6C63FF",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:6 }}>
          <CertifiedBadge size={16}/>{isCertified(post.authorId||post.author_id)?"Certifié ✓":"Certifier"}
        </button>
        <button onClick={e=>{e.stopPropagation();openEdit(post);}} style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>✏️ Modifier</button>
        <button onClick={e=>{e.stopPropagation();setModal({type:"delete",data:post});}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"8px 16px",borderRadius:8,fontWeight:600,fontSize:13 }}>Supprimer</button>
      </div>
    </div>
  ))}
  {/* Boutiques */}
  <h3 id="admin-boutiques" style={{ fontWeight:700,fontSize:18,margin:"32px 0 16px",color:theme.text,scrollMarginTop:80 }}>🛍️ Boutiques ({boutiques.length})</h3>
  {boutiques.filter(b=>!adminSearch||(b.name+b.author+(b.type||"")).toLowerCase().includes(adminSearch.toLowerCase())).map(b=>(
    <div key={b.id} style={{ ...cardStyle,borderRadius:12,padding:16,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12 }}>
      <div style={{ display:"flex",gap:12,alignItems:"center" }}>
        {b.photos&&b.photos.length>0&&<img src={b.photos[0]} alt="" style={{ width:40,height:40,borderRadius:6,objectFit:"cover" }}/>}
        <div><p style={{ fontWeight:700,color:theme.text }}>{b.name}</p><p style={{ color:theme.sub,fontSize:12 }}>Par {b.author} · {b.sousType||b.type}</p></div>
      </div>
      <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
        <button onClick={()=>toggleCertified(b.authorId, b.author)} style={{ background:isCertified(b.authorId)?"rgba(108,99,255,0.2)":"rgba(108,99,255,0.05)",border:"none",color:"#6C63FF",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>{isCertified(b.authorId)?"✅ Certifié":"Certifier"}</button>
        <button onClick={()=>toggleFeatured(b.id)} style={{ background:featuredPosts.includes(b.id)?"rgba(255,215,0,0.2)":"rgba(255,215,0,0.05)",border:"none",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>{featuredPosts.includes(b.id)?"🏆 Vedette ✓":"🏆 Vedette"}</button>
        {!b.sponsored ? <button onClick={()=>setModal({type:"sponsor",data:{...b,title:b.name}})} style={{ background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.3)",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>🌟 Sponsoriser</button> : <button onClick={()=>unsponsorPost(b.id)} style={{ background:"rgba(255,215,0,0.2)",border:"2px solid #FFD700",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer" }}>✅ Sponsorisé · Retirer</button>}
        <button onClick={()=>{ openEditShop(b,"boutique", editShop); }} style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>✏️ Modifier</button>
        <button onClick={e=>{e.stopPropagation();setModal({type:"deleteshop",data:b,shopType:"boutique"});}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>Supprimer</button>
      </div>
    </div>
  ))}

  {/* Ateliers */}
  <h3 id="admin-ateliers" style={{ fontWeight:700,fontSize:18,margin:"32px 0 16px",color:theme.text,scrollMarginTop:80 }}>🔧 Ateliers ({ateliers.length})</h3>
  {ateliers.filter(a=>!adminSearch||(a.name+a.author+(a.type||"")).toLowerCase().includes(adminSearch.toLowerCase())).map(a=>(
    <div key={a.id} style={{ ...cardStyle,borderRadius:12,padding:16,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12 }}>
      <div style={{ display:"flex",gap:12,alignItems:"center" }}>
        {a.photos&&a.photos.length>0&&<img src={a.photos[0]} alt="" style={{ width:40,height:40,borderRadius:6,objectFit:"cover" }}/>}
        <div><p style={{ fontWeight:700,color:theme.text }}>{a.name}</p><p style={{ color:theme.sub,fontSize:12 }}>Par {a.author} · {a.type}</p></div>
      </div>
      <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
        <button onClick={()=>toggleCertified(a.authorId, a.author)} style={{ background:isCertified(a.authorId)?"rgba(108,99,255,0.2)":"rgba(108,99,255,0.05)",border:"none",color:"#6C63FF",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>{isCertified(a.authorId)?"✅ Certifié":"Certifier"}</button>
        <button onClick={()=>toggleFeatured(a.id)} style={{ background:featuredPosts.includes(a.id)?"rgba(255,215,0,0.2)":"rgba(255,215,0,0.05)",border:"none",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>{featuredPosts.includes(a.id)?"🏆 Vedette ✓":"🏆 Vedette"}</button>
        {!a.sponsored ? <button onClick={()=>setModal({type:"sponsor",data:{...a,title:a.name}})} style={{ background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.3)",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>🌟 Sponsoriser</button> : <button onClick={()=>unsponsorPost(a.id)} style={{ background:"rgba(255,215,0,0.2)",border:"2px solid #FFD700",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer" }}>✅ Sponsorisé · Retirer</button>}
        <button onClick={()=>{ openEditShop(a,"atelier", editShop); }} style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>✏️ Modifier</button>
        <button onClick={e=>{e.stopPropagation();setModal({type:"deleteshop",data:a,shopType:"atelier"});}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>Supprimer</button>
      </div>
    </div>
  ))}

  {/* Restos */}
  <h3 id="admin-restos" style={{ fontWeight:700,fontSize:18,margin:"32px 0 16px",color:theme.text,scrollMarginTop:80 }}>🍽️ Restaurants & Bars ({restos.length})</h3>
  {restos.filter(r=>!adminSearch||(r.name+r.author+(r.type||"")).toLowerCase().includes(adminSearch.toLowerCase())).map(r=>(
    <div key={r.id} style={{ ...cardStyle,borderRadius:12,padding:16,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12 }}>
      <div style={{ display:"flex",gap:12,alignItems:"center" }}>
        {r.photos&&r.photos.length>0&&<img src={r.photos[0]} alt="" style={{ width:40,height:40,borderRadius:6,objectFit:"cover" }}/>}
        <div><p style={{ fontWeight:700,color:theme.text }}>{r.name}</p><p style={{ color:theme.sub,fontSize:12 }}>Par {r.author} · {r.type}</p></div>
      </div>
      <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
        <button onClick={()=>toggleCertified(r.authorId, r.author)} style={{ background:isCertified(r.authorId)?"rgba(108,99,255,0.2)":"rgba(108,99,255,0.05)",border:"none",color:"#6C63FF",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>{isCertified(r.authorId)?"✅ Certifié":"Certifier"}</button>
        <button onClick={()=>toggleFeatured(r.id)} style={{ background:featuredPosts.includes(r.id)?"rgba(255,215,0,0.2)":"rgba(255,215,0,0.05)",border:"none",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>{featuredPosts.includes(r.id)?"🏆 Vedette ✓":"🏆 Vedette"}</button>
        {!r.sponsored ? <button onClick={()=>setModal({type:"sponsor",data:{...r,title:r.name}})} style={{ background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.3)",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>🌟 Sponsoriser</button> : <button onClick={()=>unsponsorPost(r.id)} style={{ background:"rgba(255,215,0,0.2)",border:"2px solid #FFD700",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer" }}>✅ Sponsorisé · Retirer</button>}
        <button onClick={()=>{ openEditShop(r,"resto", editResto); }} style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>✏️ Modifier</button>
        <button onClick={e=>{e.stopPropagation();setModal({type:"deleteshop",data:r,shopType:"resto"});}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>Supprimer</button>
      </div>
    </div>
  ))}

  {/* Beauté */}
  <h3 id="admin-beaute" style={{ fontWeight:700,fontSize:18,margin:"32px 0 16px",color:theme.text,scrollMarginTop:80 }}>💇 Beauté & Coiffure ({beaute.length})</h3>
  {beaute.filter(b=>!adminSearch||(b.name+b.author+(b.type||"")).toLowerCase().includes(adminSearch.toLowerCase())).map(b=>(
    <div key={b.id} style={{ ...cardStyle,borderRadius:12,padding:16,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12 }}>
      <div style={{ display:"flex",gap:12,alignItems:"center" }}>
        {b.photos&&b.photos.length>0&&<img src={b.photos[0]} alt="" style={{ width:40,height:40,borderRadius:6,objectFit:"cover" }}/>}
        <div><p style={{ fontWeight:700,color:theme.text }}>{b.name}</p><p style={{ color:theme.sub,fontSize:12 }}>Par {b.author} · {b.sousType||b.type}</p></div>
      </div>
      <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
        <button onClick={()=>toggleCertified(b.authorId, b.author)} style={{ background:isCertified(b.authorId)?"rgba(108,99,255,0.2)":"rgba(108,99,255,0.05)",border:"none",color:"#6C63FF",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>{isCertified(b.authorId)?"✅ Certifié":"Certifier"}</button>
        <button onClick={()=>toggleFeatured(b.id)} style={{ background:featuredPosts.includes(b.id)?"rgba(255,215,0,0.2)":"rgba(255,215,0,0.05)",border:"none",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>{featuredPosts.includes(b.id)?"🏆 Vedette ✓":"🏆 Vedette"}</button>
        {!b.sponsored ? <button onClick={()=>setModal({type:"sponsor",data:{...b,title:b.name}})} style={{ background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.3)",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>🌟 Sponsoriser</button> : <button onClick={()=>unsponsorPost(b.id)} style={{ background:"rgba(255,215,0,0.2)",border:"2px solid #FFD700",color:"#FFD700",padding:"8px 14px",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer" }}>✅ Sponsorisé · Retirer</button>}
        <button onClick={()=>{ openEditShop(b,"beaute", editBeaute); }} style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>✏️ Modifier</button>
        <button onClick={e=>{e.stopPropagation();setModal({type:"deleteshop",data:b,shopType:"beaute"});}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>Supprimer</button>
      </div>
    </div>
  ))}

  {/* ── GESTION BANNIÈRES PUBLICITAIRES ── */}
  <div id="admin-bannières" style={{ marginTop:40 }}>
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
      <h3 style={{ fontWeight:700,fontSize:18,color:theme.text,display:"flex",alignItems:"center",gap:8 }}>
        📢 Bannières publicitaires
        <span style={{ background:"rgba(108,99,255,0.15)",color:"#6C63FF",borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:600 }}>{ads.length} active{ads.length>1?"s":""}</span>
        {adRequests.filter(r=>r.status==="en_attente").length > 0 && (
          <span style={{ background:"#FF4757",color:"#fff",borderRadius:"50%",width:22,height:22,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700 }}>
            {adRequests.filter(r=>r.status==="en_attente").length}
          </span>
        )}
      </h3>
      <button onClick={()=>{ supabase.from("ad_requests").select("*").order("created_at",{ascending:false}).then(({data})=>{ if(data) setAdRequests(data); notify("Actualisé ✅"); }); }}
        style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"6px 14px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer" }}>
        🔄 Actualiser
      </button>
    </div>
    {adRequests.filter(r=>r.status==="en_attente").length > 0 && (
      <div style={{ marginBottom:24 }}>
        <h4 style={{ fontWeight:700,fontSize:15,color:"#FF8C00",marginBottom:12 }}>⏳ Demandes en attente ({adRequests.filter(r=>r.status==="en_attente").length})</h4>
        {adRequests.filter(r=>r.status==="en_attente").map(req=>(
          <div key={req.id} style={{ ...cardStyle,borderRadius:12,padding:16,marginBottom:10,border:"1px solid rgba(255,140,0,0.3)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap" }}>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700,color:theme.text,fontSize:14,marginBottom:4 }}>{req.entreprise}</p>
                {req.slogan && <p style={{ color:theme.sub,fontSize:12,marginBottom:4 }}>{req.slogan}</p>}
                <div style={{ display:"flex",gap:8,flexWrap:"wrap",fontSize:12,color:theme.sub }}>
                  <span>👤 {req.user_name}</span>
                  <span>📅 {req.duree} jours</span>
                  <span>💰 {(req.prix||0).toLocaleString()} FCFA</span>
                  <span>📆 Expire le {req.expires_at}</span>
                </div>
              </div>
              <div style={{ display:"flex",gap:8,flexShrink:0 }}>
                <button onClick={async()=>{
                  const { error } = await supabase.from("ads").insert({
                    entreprise:req.entreprise, slogan:req.slogan||"",
                    logo_url:req.logo_url||"", lien:req.lien||"",
                    couleur1:req.couleur1||"#6C63FF", couleur2:req.couleur2||"#8B84FF",
                    fin:req.expires_at, actif:true,
                  });
                  if (error) { notify("Erreur activation","error"); return; }
                  await supabase.from("ad_requests").update({status:"approuve"}).eq("id",req.id);
                  setAdRequests(prev=>prev.map(r=>r.id===req.id?{...r,status:"approuve"}:r));
                  const today = new Date().toISOString().slice(0,10);
                  const { data } = await supabase.from("ads").select("*").eq("actif",true).or(`fin.is.null,fin.gte.${today}`);
                  if (data) setAds(data);
                  notify("✅ Bannière activée !");
                }} style={{ background:"rgba(67,198,172,0.15)",border:"1px solid #43C6AC",color:"#43C6AC",padding:"8px 14px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                  ✅ Activer
                </button>
                <button onClick={async()=>{
                  await supabase.from("ad_requests").update({status:"refuse"}).eq("id",req.id);
                  setAdRequests(prev=>prev.map(r=>r.id===req.id?{...r,status:"refuse"}:r));
                  notify("Demande refusée");
                }} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"8px 14px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                  ✕ Refuser
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Formulaire nouvelle pub — replié par défaut */}
    <div style={{ ...cardStyle,borderRadius:16,marginBottom:24,overflow:"hidden" }}>
          <button onClick={()=>{ setShowAdForm(s=>!s); setAdEditing(null); setAdForm({ entreprise:"", slogan:"", logo_url:"", lien:"", couleur1:"#6C63FF", couleur2:"#8B84FF", fin:"" }); }}
            style={{ width:"100%",padding:"16px 24px",background:"transparent",border:"none",color:theme.text,fontWeight:700,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",WebkitTapHighlightColor:"transparent" }}>
            <span>➕ Ajouter une bannière</span>
            <span style={{ fontSize:18,transition:"transform 0.3s",transform:showAdForm?"rotate(45deg)":"rotate(0deg)" }}>+</span>
          </button>
          {(showAdForm || adEditing) && (
          <div style={{ padding:"0 24px 24px" }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
            <div>
              <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Nom entreprise *</label>
              <input value={adForm.entreprise} onChange={e=>setAdForm(f=>({...f,entreprise:e.target.value}))} placeholder="Ex: Boulangerie Dorée" style={{ ...inputStyle,fontSize:13 }}/>
            </div>
            <div>
              <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Slogan</label>
              <input value={adForm.slogan} onChange={e=>setAdForm(f=>({...f,slogan:e.target.value}))} placeholder="Ex: Les meilleurs pains de Cotonou" style={{ ...inputStyle,fontSize:13 }}/>
            </div>
            <div>
              <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>URL Logo (optionnel)</label>
              <input value={adForm.logo_url} onChange={e=>setAdForm(f=>({...f,logo_url:e.target.value}))} placeholder="https://..." style={{ ...inputStyle,fontSize:13 }}/>
            </div>
            <div>
              <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Lien (clic sur bannière)</label>
              <input value={adForm.lien} onChange={e=>setAdForm(f=>({...f,lien:e.target.value}))} placeholder="https://..." style={{ ...inputStyle,fontSize:13 }}/>
            </div>
            <div>
              <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Couleur 1</label>
              <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                <input type="color" value={adForm.couleur1} onChange={e=>setAdForm(f=>({...f,couleur1:e.target.value}))} style={{ width:40,height:36,border:"none",borderRadius:8,cursor:"pointer",background:"transparent" }}/>
                <input value={adForm.couleur1} onChange={e=>setAdForm(f=>({...f,couleur1:e.target.value}))} style={{ ...inputStyle,fontSize:13,flex:1 }}/>
              </div>
            </div>
            <div>
              <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Couleur 2</label>
              <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                <input type="color" value={adForm.couleur2} onChange={e=>setAdForm(f=>({...f,couleur2:e.target.value}))} style={{ width:40,height:36,border:"none",borderRadius:8,cursor:"pointer",background:"transparent" }}/>
                <input value={adForm.couleur2} onChange={e=>setAdForm(f=>({...f,couleur2:e.target.value}))} style={{ ...inputStyle,fontSize:13,flex:1 }}/>
              </div>
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Date de fin de campagne (optionnel)</label>
              <input type="date" value={adForm.fin} onChange={e=>setAdForm(f=>({...f,fin:e.target.value}))} style={{ ...inputStyle,fontSize:13 }}/>
            </div>
          </div>
          {/* Aperçu */}
          {adForm.entreprise && (
            <div style={{ borderRadius:12,overflow:"hidden",border:`1px solid ${theme.border}`,background:`linear-gradient(135deg,${adForm.couleur1}22,${adForm.couleur2}22)`,marginBottom:16 }}>
              <div style={{ padding:"12px 16px",display:"flex",alignItems:"center",gap:12 }}>
                {adForm.logo_url
                  ? <img src={adForm.logo_url} alt="" style={{ width:40,height:40,borderRadius:8,objectFit:"cover" }}/>
                  : <div style={{ width:40,height:40,borderRadius:8,background:`linear-gradient(135deg,${adForm.couleur1},${adForm.couleur2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🏢</div>
                }
                <div>
                  <p style={{ fontWeight:800,fontSize:14,color:theme.text }}>{adForm.entreprise}</p>
                  {adForm.slogan && <p style={{ color:theme.sub,fontSize:12 }}>{adForm.slogan}</p>}
                </div>
                <div style={{ marginLeft:"auto",background:`linear-gradient(135deg,${adForm.couleur1},${adForm.couleur2})`,color:"#fff",padding:"6px 14px",borderRadius:8,fontWeight:700,fontSize:12 }}>Aperçu</div>
              </div>
              <div style={{ height:3,background:`linear-gradient(90deg,${adForm.couleur1},${adForm.couleur2})`,opacity:0.6 }}/>
            </div>
          )}
          <button onClick={async()=>{
            if (!adForm.entreprise) { notify("Le nom de l'entreprise est requis","error"); return; }
            setAdSaving(true);
            if (adEditing) {
              // Mise à jour
              const { error } = await supabase.from("ads").update({
                entreprise: adForm.entreprise,
                slogan: adForm.slogan || null,
                logo_url: adForm.logo_url || null,
                lien: adForm.lien || null,
                couleur1: adForm.couleur1 || "#6C63FF",
                couleur2: adForm.couleur2 || "#8B84FF",
                fin: adForm.fin || null,
              }).eq("id", adEditing);
              setAdSaving(false);
              if (error) { notify("Erreur : "+error.message,"error"); return; }
              setAds(prev => prev.map(a => a.id===adEditing ? {...a,...adForm} : a));
              setAdEditing(null);
              setAdForm({ entreprise:"", slogan:"", logo_url:"", lien:"", couleur1:"#6C63FF", couleur2:"#8B84FF", fin:"" });
              notify("✅ Bannière mise à jour !");
            } else {
              // Nouvelle bannière
              const { data, error } = await supabase.from("ads").insert({
                entreprise: adForm.entreprise,
                slogan: adForm.slogan || null,
                logo_url: adForm.logo_url || null,
                lien: adForm.lien || null,
                couleur1: adForm.couleur1 || "#6C63FF",
                couleur2: adForm.couleur2 || "#8B84FF",
                actif: true,
                fin: adForm.fin || null,
              }).select().single();
              setAdSaving(false);
              if (error) { notify("Erreur : "+error.message,"error"); return; }
              setAds(prev => [data, ...prev]);
              setAdForm({ entreprise:"", slogan:"", logo_url:"", lien:"", couleur1:"#6C63FF", couleur2:"#8B84FF", fin:"" });
              setShowAdForm(false);
              notify("✅ Bannière publiée avec succès !");
            }
          }} disabled={adSaving} style={{ width:"100%",padding:"13px",background:adSaving?"rgba(108,99,255,0.3)":"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,cursor:adSaving?"not-allowed":"pointer" }}>
            {adSaving ? "⏳ En cours..." : adEditing ? "✏️ Mettre à jour la bannière" : "✅ Valider et publier la bannière"}
          </button>
          {adEditing && (
            <button onClick={()=>{ setAdEditing(null); setAdForm({ entreprise:"", slogan:"", logo_url:"", lien:"", couleur1:"#6C63FF", couleur2:"#8B84FF", fin:"" }); setShowAdForm(false); }} style={{ width:"100%",marginTop:8,padding:"10px",background:"transparent",border:`1px solid ${theme.border}`,color:theme.sub,borderRadius:12,fontWeight:600,fontSize:14,cursor:"pointer" }}>
              Annuler la modification
            </button>
          )}
          </div>
          )}
    </div>

    {/* Liste des pubs actives */}
    {ads.length === 0 && <p style={{ color:theme.sub,fontSize:13,marginBottom:24 }}>Aucune bannière active pour le moment.</p>}
    {ads.map(ad=>(
      <div key={ad.id} style={{ ...cardStyle,borderRadius:14,padding:16,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          {ad.logo_url
            ? <img src={ad.logo_url} alt="" style={{ width:40,height:40,borderRadius:8,objectFit:"cover",flexShrink:0 }}/>
            : <div style={{ width:40,height:40,borderRadius:8,background:`linear-gradient(135deg,${ad.couleur1||"#6C63FF"},${ad.couleur2||"#8B84FF"})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>🏢</div>
          }
          <div>
            <p style={{ fontWeight:700,color:theme.text,fontSize:14 }}>{ad.entreprise}</p>
            {ad.slogan && <p style={{ color:theme.sub,fontSize:12 }}>{ad.slogan}</p>}
            {ad.fin && <p style={{ color:"#FF8C00",fontSize:11,marginTop:2 }}>⏳ Expire le {ad.fin}</p>}
          </div>
        </div>
        <div style={{ display:"flex",gap:8,flexShrink:0,flexWrap:"wrap" }}>
          <button onClick={()=>{ setAdEditing(ad.id); setAdForm({ entreprise:ad.entreprise||"", slogan:ad.slogan||"", logo_url:ad.logo_url||"", lien:ad.lien||"", couleur1:ad.couleur1||"#6C63FF", couleur2:ad.couleur2||"#8B84FF", fin:ad.fin||"" }); setShowAdForm(true); }} style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"7px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>✏️ Modifier</button>
          <button onClick={async()=>{
            await supabase.from("ads").update({actif:!ad.actif}).eq("id",ad.id);
            setAds(prev=>prev.map(a=>a.id===ad.id?{...a,actif:!a.actif}:a));
            notify(ad.actif?"Bannière désactivée":"Bannière réactivée ✅");
          }} style={{ background:ad.actif?"rgba(67,198,172,0.15)":"rgba(255,71,87,0.1)",border:"none",color:ad.actif?"#43C6AC":"#FF4757",padding:"7px 12px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>
            {ad.actif?"✅ Active":"⏸ Inactive"}
          </button>
          <button onClick={async()=>{
            await supabase.from("ads").delete().eq("id",ad.id);
            setAds(prev=>prev.filter(a=>a.id!==ad.id));
            notify("Bannière supprimée.");
          }} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"7px 10px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>
            🗑️
          </button>
        </div>
      </div>
    ))}
  </div>
</div>
  );
}

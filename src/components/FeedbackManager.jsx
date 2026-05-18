// src/components/FeedbackManager.jsx
// Panel admin — voir et répondre aux feedbacks

import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

const STATUT_COLORS = {
  nouveau:  "#EF4444",
  lu:       "#F59E0B",
  repondu:  "#10B981",
  archive:  "#6B7280",
};

const CAT_LABELS = {
  bug:        "🐛 Bug",
  suggestion: "💡 Suggestion",
  compliment: "❤️ Compliment",
  autre:      "💬 Autre",
};

export default function FeedbackManager({ theme, notify }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("nouveau");
  const [selected,  setSelected]  = useState(null);
  const [reponse,   setReponse]   = useState("");
  const [sending,   setSending]   = useState(false);

  const inp = {
    background:theme.bg, border:`1px solid ${theme.border}`,
    color:theme.text, borderRadius:10, padding:"10px 14px",
    fontSize:14, fontFamily:"inherit", outline:"none", width:"100%", boxSizing:"border-box"
  };

  const load = async () => {
    setLoading(true);
    const q = supabase.from("feedbacks").select("*").order("created_at", { ascending: false });
    if (filter !== "tous") q.eq("statut", filter);
    const { data } = await q;
    setFeedbacks(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const markLu = async (id) => {
    await supabase.from("feedbacks").update({ statut:"lu" }).eq("id", id).eq("statut","nouveau");
    setFeedbacks(f => f.map(x => x.id===id && x.statut==="nouveau" ? {...x,statut:"lu"} : x));
  };

  const handleRepondre = async () => {
    if (!reponse.trim()) { notify("Écrivez votre réponse","error"); return; }
    setSending(true);

    const { error } = await supabase.from("feedbacks").update({
      reponse:    reponse.trim(),
      statut:     "repondu",
      repondu_at: new Date().toISOString(),
    }).eq("id", selected.id);

    if (error) { notify("Erreur","error"); setSending(false); return; }

    // Envoyer email si l'utilisateur a un email
    if (selected.user_email) {
      fetch("/api/send-feedback-reply", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          email:   selected.user_email,
          name:    selected.user_name || "Utilisateur",
          message: selected.message,
          reponse: reponse.trim(),
        })
      }).catch(()=>{});
    }

    notify("✅ Réponse envoyée !");
    setSending(false);
    setSelected(null);
    setReponse("");
    load();
  };

  const handleArchive = async (id) => {
    await supabase.from("feedbacks").update({ statut:"archive" }).eq("id", id);
    setFeedbacks(f => f.filter(x => x.id !== id));
    notify("Feedback archivé");
  };

  const counts = feedbacks.reduce((acc, f) => { acc[f.statut] = (acc[f.statut]||0)+1; return acc; }, {});

  return (
    <div style={{ padding:"24px 0" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
        <h2 style={{ color:theme.text,fontSize:18,fontWeight:800,margin:0 }}>💬 Feedbacks clients</h2>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          {["nouveau","lu","repondu","tous"].map(s=>(
            <button key={s} onClick={()=>setFilter(s)}
              style={{ padding:"6px 12px",borderRadius:8,border:`1px solid ${filter===s?STATUT_COLORS[s]||"#6C63FF":theme.border}`,background:filter===s?`${STATUT_COLORS[s]||"#6C63FF"}18`:"transparent",color:filter===s?STATUT_COLORS[s]||"#6C63FF":theme.sub,fontWeight:filter===s?700:400,cursor:"pointer",fontSize:12 }}>
              {s.charAt(0).toUpperCase()+s.slice(1)}{s!=="tous"&&counts[s]?` (${counts[s]})`:""} 
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {loading ? <p style={{ color:theme.sub,textAlign:"center",padding:32 }}>Chargement...</p> :
       feedbacks.length === 0 ? (
        <div style={{ textAlign:"center",padding:48,color:theme.sub }}>
          <p style={{ fontSize:32 }}>📭</p>
          <p>Aucun feedback {filter !== "tous" ? `"${filter}"` : ""}</p>
        </div>
       ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {feedbacks.map(f => (
            <div key={f.id}
              onClick={()=>{ setSelected(f); setReponse(f.reponse||""); markLu(f.id); }}
              style={{ background:theme.card,border:`1px solid ${f.statut==="nouveau"?"#EF4444":theme.border}`,borderRadius:12,padding:16,cursor:"pointer",transition:"border 0.2s" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap" }}>
                    <span style={{ fontWeight:700,color:theme.text,fontSize:14 }}>{f.user_name||"Anonyme"}</span>
                    <span style={{ background:`${STATUT_COLORS[f.statut]}18`,color:STATUT_COLORS[f.statut],fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20 }}>{f.statut}</span>
                    <span style={{ color:theme.sub,fontSize:11 }}>{CAT_LABELS[f.categorie]}</span>
                    {f.note && <span style={{ fontSize:12 }}>{"⭐".repeat(f.note)}</span>}
                  </div>
                  <p style={{ color:theme.sub,fontSize:13,margin:0,lineHeight:1.5 }}>{f.message.slice(0,120)}{f.message.length>120?"...":""}</p>
                  <p style={{ color:theme.sub,fontSize:11,margin:"4px 0 0" }}>{new Date(f.created_at).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</p>
                </div>
                <button onClick={e=>{e.stopPropagation();handleArchive(f.id)}}
                  style={{ background:"rgba(107,114,128,0.1)",border:"none",color:"#6B7280",padding:"4px 8px",borderRadius:6,cursor:"pointer",fontSize:11 }}>
                  Archiver
                </button>
              </div>
            </div>
          ))}
        </div>
       )}

      {/* Modal réponse */}
      {selected && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:20,padding:28,width:"100%",maxWidth:520 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <h3 style={{ color:theme.text,fontWeight:800,fontSize:16,margin:0 }}>💬 Répondre au feedback</h3>
              <button onClick={()=>setSelected(null)} style={{ background:"transparent",border:`1px solid ${theme.border}`,color:theme.sub,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:13 }}>✕</button>
            </div>
            <div style={{ background:theme.bg,borderRadius:10,padding:14,marginBottom:16 }}>
              <div style={{ display:"flex",gap:8,marginBottom:6,flexWrap:"wrap" }}>
                <span style={{ fontWeight:700,color:theme.text,fontSize:13 }}>{selected.user_name}</span>
                <span style={{ color:theme.sub,fontSize:13 }}>{CAT_LABELS[selected.categorie]}</span>
                {selected.note && <span style={{ fontSize:12 }}>{"⭐".repeat(selected.note)}</span>}
              </div>
              <p style={{ color:theme.sub,fontSize:13,margin:0,lineHeight:1.6 }}>{selected.message}</p>
            </div>
            <label style={{ fontSize:13,color:theme.sub,display:"block",marginBottom:6 }}>Votre réponse</label>
            <textarea style={{ ...inp,resize:"vertical",minHeight:100,marginBottom:16 }}
              placeholder="Répondez au client..."
              value={reponse} onChange={e=>setReponse(e.target.value)}/>
            {selected.user_email && (
              <p style={{ color:theme.sub,fontSize:12,marginBottom:12 }}>📧 La réponse sera envoyée par email à {selected.user_email}</p>
            )}
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={handleRepondre} disabled={sending}
                style={{ flex:1,background:"linear-gradient(135deg,#10B981,#059669)",border:"none",color:"#fff",padding:"12px",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer" }}>
                {sending?"⏳ Envoi...":"✅ Envoyer la réponse"}
              </button>
              <button onClick={()=>setSelected(null)}
                style={{ background:"transparent",border:`1px solid ${theme.border}`,color:theme.sub,padding:"12px 20px",borderRadius:10,fontWeight:600,fontSize:14,cursor:"pointer" }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

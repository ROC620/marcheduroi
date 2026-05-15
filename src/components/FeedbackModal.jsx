// src/components/FeedbackModal.jsx
// Formulaire pour soumettre un avis/suggestion sur MarchéduRoi

import React, { useState } from "react";
import { supabase } from "../supabase";

const CATEGORIES = [
  { value:"bug",         label:"🐛 Signaler un bug",       color:"#EF4444" },
  { value:"suggestion",  label:"💡 Faire une suggestion",  color:"#F59E0B" },
  { value:"compliment",  label:"❤️ Compliment",            color:"#10B981" },
  { value:"autre",       label:"💬 Autre",                 color:"#6C63FF" },
];

export default function FeedbackModal({ user, theme, onClose, notify }) {
  const [note,      setNote]      = useState(0);
  const [categorie, setCategorie] = useState("");
  const [message,   setMessage]   = useState("");
  const [sending,   setSending]   = useState(false);
  const [sent,      setSent]      = useState(false);

  const inp = {
    background: theme.bg, border:`1px solid ${theme.border}`,
    color: theme.text, borderRadius:10, padding:"10px 14px",
    fontSize:14, fontFamily:"inherit", outline:"none", width:"100%", boxSizing:"border-box"
  };

  const handleSend = async () => {
    if (!categorie) { notify("Choisissez une catégorie","error"); return; }
    if (!message.trim()) { notify("Écrivez votre message","error"); return; }
    setSending(true);
    const { error } = await supabase.from("feedbacks").insert({
      user_id:    user?.id || null,
      user_name:  user?.name || "Anonyme",
      user_email: user?.email || null,
      note:       note || null,
      categorie,
      message: message.trim(),
    });
    setSending(false);
    if (error) { notify("Erreur envoi","error"); return; }
    setSent(true);
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:20,padding:28,width:"100%",maxWidth:480,fontFamily:"inherit" }}>

        {sent ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🙏</div>
            <h3 style={{ color:theme.text, fontWeight:800, fontSize:20, marginBottom:8 }}>Merci pour votre avis !</h3>
            <p style={{ color:theme.sub, fontSize:14, marginBottom:24 }}>Votre message a bien été envoyé à l'équipe MarchéduRoi. Nous y répondrons dans les meilleurs délais.</p>
            <button onClick={onClose}
              style={{ background:"linear-gradient(135deg,#10B981,#059669)",border:"none",color:"#fff",padding:"12px 32px",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer" }}>
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <h3 style={{ color:theme.text,fontWeight:800,fontSize:18,margin:0 }}>💬 Donnez votre avis</h3>
              <button onClick={onClose} style={{ background:"transparent",border:`1px solid ${theme.border}`,color:theme.sub,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:13 }}>✕</button>
            </div>

            {/* Note étoiles */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13,color:theme.sub,display:"block",marginBottom:6 }}>Note globale (optionnel)</label>
              <div style={{ display:"flex",gap:6 }}>
                {[1,2,3,4,5].map(n=>(
                  <button key={n} onClick={()=>setNote(n===note?0:n)}
                    style={{ background:"none",border:"none",fontSize:28,cursor:"pointer",opacity:n<=note?1:0.3,transition:"all 0.15s",padding:2 }}>
                    ⭐
                  </button>
                ))}
                {note > 0 && <span style={{ color:theme.sub,fontSize:13,alignSelf:"center" }}>{note}/5</span>}
              </div>
            </div>

            {/* Catégorie */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13,color:theme.sub,display:"block",marginBottom:6 }}>Catégorie *</label>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                {CATEGORIES.map(c=>(
                  <button key={c.value} onClick={()=>setCategorie(c.value)}
                    style={{ padding:"10px 8px",borderRadius:10,border:`2px solid ${categorie===c.value?c.color:theme.border}`,background:categorie===c.value?`${c.color}18`:"transparent",color:categorie===c.value?c.color:theme.sub,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all 0.15s",textAlign:"left" }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13,color:theme.sub,display:"block",marginBottom:6 }}>Votre message *</label>
              <textarea style={{ ...inp,resize:"vertical",minHeight:100 }}
                placeholder="Décrivez votre expérience, votre suggestion ou le problème rencontré..."
                value={message} onChange={e=>setMessage(e.target.value)} maxLength={1000}/>
              <div style={{ textAlign:"right",color:theme.sub,fontSize:11,marginTop:4 }}>{message.length}/1000</div>
            </div>

            <button onClick={handleSend} disabled={sending}
              style={{ width:"100%",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"13px",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer" }}>
              {sending ? "⏳ Envoi..." : "📤 Envoyer mon avis"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

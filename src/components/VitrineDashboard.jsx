// src/components/VitrineDashboard.jsx
// Dashboard statistiques pour le propriétaire de la vitrine

import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

const T = (() => {
  try {
    const t = localStorage.getItem("mdr_theme");
    const themes = {
      dark:  { bg:"#0D0F1A", card:"#1A1D30", text:"#E8E8F0", sub:"#9A9AB0", border:"#2A2D45" },
      light: { bg:"#F8FAFC", card:"#FFFFFF",  text:"#1A1D30", sub:"#6B7280", border:"#E2E8F0" },
    };
    return themes[t] || themes.dark;
  } catch { return { bg:"#0D0F1A", card:"#1A1D30", text:"#E8E8F0", sub:"#9A9AB0", border:"#2A2D45" }; }
})();

const COLOR = "#10B981";

export default function VitrineDashboard({ structureId, structureName, onClose }) {
  const [period,  setPeriod]  = useState(7);    // 7 ou 30 jours
  const [stats,   setStats]   = useState(null);
  const [daily,   setDaily]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!structureId) return;
    loadStats();
  }, [structureId, period]);

  const loadStats = async () => {
    setLoading(true);
    const since = new Date(Date.now() - period * 24 * 3600 * 1000).toISOString();

    const { data } = await supabase
      .from("vitrine_stats")
      .select("type, created_at")
      .eq("structure_id", structureId)
      .gte("created_at", since)
      .order("created_at", { ascending: true });

    if (!data) { setLoading(false); return; }

    // Compteurs globaux
    const counts = { vue:0, like:0, whatsapp:0, appel:0, partage:0, suggestion:0 };
    data.forEach(r => { if (counts[r.type] !== undefined) counts[r.type]++; });
    setStats(counts);

    // Stats par jour
    const byDay = {};
    data.forEach(r => {
      const day = r.created_at.slice(0, 10);
      if (!byDay[day]) byDay[day] = { vue:0, like:0, whatsapp:0, appel:0, partage:0, suggestion:0 };
      byDay[day][r.type] = (byDay[day][r.type] || 0) + 1;
    });

    // Générer tous les jours de la période
    const days = [];
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("fr-FR", { day:"numeric", month:"short" });
      days.push({ key, label, ...(byDay[key] || { vue:0, like:0, whatsapp:0, appel:0, partage:0, suggestion:0 }) });
    }
    setDaily(days);
    setLoading(false);
  };

  const maxVues = Math.max(...daily.map(d => d.vue), 1);

  const StatCard = ({ icon, label, value, color }) => (
    <div style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px", flex:1, minWidth:100 }}>
      <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
      <div style={{ fontSize:22, fontWeight:800, color: color || T.text }}>{value}</div>
      <div style={{ fontSize:12, color:T.sub }}>{label}</div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:300, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"20px 16px", overflowY:"auto" }}>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:24, width:"100%", maxWidth:600, fontFamily:"Sora,sans-serif" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <h2 style={{ color:T.text, fontWeight:800, fontSize:18, margin:0 }}>📊 Mes statistiques</h2>
            <p style={{ color:T.sub, fontSize:13, margin:"4px 0 0" }}>{structureName}</p>
          </div>
          <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${T.border}`, color:T.sub, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>✕ Fermer</button>
        </div>

        {/* Sélecteur période */}
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {[7, 30].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding:"8px 16px", borderRadius:8, border:`1px solid ${period===p?COLOR:T.border}`, background:period===p?`rgba(16,185,129,0.1)`:"transparent", color:period===p?COLOR:T.sub, fontWeight:period===p?700:400, cursor:"pointer", fontSize:13 }}>
              {p} jours
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:40, color:T.sub }}>Chargement…</div>
        ) : (
          <>
            {/* Cartes stats */}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
              <StatCard icon="👁️" label="Vues"         value={stats.vue}        color={COLOR}     />
              <StatCard icon="❤️" label="J'aime"        value={stats.like}       color="#FF6584"   />
              <StatCard icon="💬" label="Contacts WA"   value={stats.whatsapp}   color="#25D366"   />
              <StatCard icon="📞" label="Appels"        value={stats.appel}      color="#6C63FF"   />
              <StatCard icon="📤" label="Partages"      value={stats.partage}    color="#FFD700"   />
              <StatCard icon="🤝" label="Suggestions"   value={stats.suggestion} color="#FB923C"   />
            </div>

            {/* Graphique vues par jour */}
            <div style={{ background:T.bg, borderRadius:12, padding:16, border:`1px solid ${T.border}` }}>
              <p style={{ color:T.text, fontWeight:700, fontSize:14, marginBottom:12 }}>👁️ Vues par jour</p>
              {daily.every(d => d.vue === 0) ? (
                <p style={{ color:T.sub, fontSize:13, textAlign:"center", padding:"20px 0" }}>Aucune vue sur cette période</p>
              ) : (
                <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:80 }}>
                  {daily.map(d => (
                    <div key={d.key} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                      <div style={{ fontSize:9, color:T.sub, fontWeight:d.vue>0?700:400 }}>
                        {d.vue > 0 ? d.vue : ""}
                      </div>
                      <div style={{
                        width:"100%",
                        height: Math.max(4, Math.round((d.vue / maxVues) * 60)),
                        background: d.vue > 0 ? `linear-gradient(180deg,${COLOR},#059669)` : T.border,
                        borderRadius:4,
                        transition:"height 0.3s"
                      }}/>
                      <div style={{ fontSize:9, color:T.sub, whiteSpace:"nowrap", overflow:"hidden", maxWidth:24, textOverflow:"ellipsis" }}>
                        {d.label.split(" ")[0]}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Résumé engagement */}
            <div style={{ marginTop:12, background:`rgba(16,185,129,0.06)`, border:`1px solid rgba(16,185,129,0.2)`, borderRadius:12, padding:14 }}>
              <p style={{ color:COLOR, fontWeight:700, fontSize:13, margin:"0 0 6px" }}>📈 Taux d'engagement</p>
              <p style={{ color:T.sub, fontSize:12, margin:0 }}>
                {stats.vue > 0
                  ? `${Math.round(((stats.like + stats.whatsapp + stats.appel) / stats.vue) * 100)}% des visiteurs ont interagi avec votre vitrine`
                  : "Pas encore de données suffisantes"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

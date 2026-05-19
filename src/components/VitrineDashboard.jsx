// src/components/VitrineDashboard.jsx
// Dashboard statistiques pour le propriétaire de la vitrine

import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

const getTheme = () => {
  try {
    const t = localStorage.getItem("mdr_theme");
    const themes = {
      dark:  { bg:"#0D0F1A", card:"#1A1D30", text:"#E8E8F0", sub:"#9A9AB0", border:"#2A2D45" },
      light: { bg:"#F8FAFC", card:"#FFFFFF",  text:"#1A1D30", sub:"#6B7280", border:"#E2E8F0" },
    };
    return themes[t] || themes.dark;
  } catch { return { bg:"#0D0F1A", card:"#1A1D30", text:"#E8E8F0", sub:"#9A9AB0", border:"#2A2D45" }; }
};

const COLOR = "#10B981";

const SERIES = [
  { key:"vue",      label:"Vues",        color:"#10B981" },
  { key:"like",     label:"J'aime",      color:"#FF6584" },
  { key:"whatsapp", label:"WA",          color:"#25D366" },
  { key:"appel",    label:"Appels",      color:"#6C63FF" },
];

export default function VitrineDashboard({ structureId, structureName, onClose }) {
  const T = getTheme();
  const [period,     setPeriod]     = useState(7);
  const [stats,      setStats]      = useState(null);
  const [chartData,  setChartData]  = useState([]);
  const [activeSerie, setActiveSerie] = useState("vue");
  const [loading,    setLoading]    = useState(true);

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

    // Pour 30 jours → regrouper par semaine (4 groupes)
    // Pour 7 jours → par jour
    if (period === 7) {
      const byDay = {};
      data.forEach(r => {
        const day = r.created_at.slice(0, 10);
        if (!byDay[day]) byDay[day] = { vue:0, like:0, whatsapp:0, appel:0 };
        if (byDay[day][r.type] !== undefined) byDay[day][r.type]++;
      });
      const days = [];
      for (let i = period - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 3600 * 1000);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString("fr-FR", { day:"numeric", month:"short" });
        days.push({ label, ...(byDay[key] || { vue:0, like:0, whatsapp:0, appel:0 }) });
      }
      setChartData(days);
    } else {
      // 30 jours → 4 semaines
      const weeks = [
        { label:"S-4", vue:0, like:0, whatsapp:0, appel:0 },
        { label:"S-3", vue:0, like:0, whatsapp:0, appel:0 },
        { label:"S-2", vue:0, like:0, whatsapp:0, appel:0 },
        { label:"Cette sem.", vue:0, like:0, whatsapp:0, appel:0 },
      ];
      const now = Date.now();
      data.forEach(r => {
        const daysAgo = Math.floor((now - new Date(r.created_at).getTime()) / (24*3600*1000));
        const weekIdx = daysAgo >= 21 ? 0 : daysAgo >= 14 ? 1 : daysAgo >= 7 ? 2 : 3;
        if (weeks[weekIdx][r.type] !== undefined) weeks[weekIdx][r.type]++;
      });
      setChartData(weeks);
    }

    setLoading(false);
  };

  const maxVal = Math.max(...chartData.map(d => d[activeSerie] || 0), 1);
  const activeSerieMeta = SERIES.find(s => s.key === activeSerie);

  const StatCard = ({ icon, label, value, color, serieKey }) => (
    <div onClick={() => setActiveSerie(serieKey || "")}
      style={{ background: activeSerie===serieKey ? `${color}15` : T.bg,
        border:`1px solid ${activeSerie===serieKey ? color : T.border}`,
        borderRadius:12, padding:"12px 14px", flex:1, minWidth:90,
        cursor: serieKey ? "pointer" : "default", transition:"all 0.2s" }}>
      <div style={{ fontSize:20, marginBottom:2 }}>{icon}</div>
      <div style={{ fontSize:20, fontWeight:800, color }}>{value}</div>
      <div style={{ fontSize:11, color:T.sub }}>{label}</div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:300,
      display:"flex", alignItems:"flex-start", justifyContent:"center",
      padding:"20px 16px", overflowY:"auto" }}>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20,
        padding:24, width:"100%", maxWidth:600, fontFamily:"Sora,sans-serif" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <h2 style={{ color:T.text, fontWeight:800, fontSize:18, margin:0 }}>📊 Mes statistiques</h2>
            <p style={{ color:T.sub, fontSize:13, margin:"4px 0 0" }}>{structureName}</p>
          </div>
          <button onClick={onClose}
            style={{ background:"transparent", border:`1px solid ${T.border}`, color:T.sub,
              borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>✕</button>
        </div>

        {/* Sélecteur période */}
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {[7, 30].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding:"8px 16px", borderRadius:8,
                border:`1px solid ${period===p ? COLOR : T.border}`,
                background: period===p ? `rgba(16,185,129,0.1)` : "transparent",
                color: period===p ? COLOR : T.sub,
                fontWeight: period===p ? 700 : 400, cursor:"pointer", fontSize:13 }}>
              {p === 7 ? "7 derniers jours" : "30 derniers jours"}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:40, color:T.sub }}>Chargement…</div>
        ) : (
          <>
            {/* Cartes stats — cliquables pour changer la série du graphique */}
            <p style={{ color:T.sub, fontSize:11, margin:"0 0 8px", fontWeight:600 }}>
              CLIQUEZ SUR UNE CARTE POUR AFFICHER SES DONNÉES
            </p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
              <StatCard icon="👁️" label="Vues"       value={stats.vue}        color={COLOR}     serieKey="vue"      />
              <StatCard icon="❤️" label="J'aime"      value={stats.like}       color="#FF6584"   serieKey="like"     />
              <StatCard icon="💬" label="WA"          value={stats.whatsapp}   color="#25D366"   serieKey="whatsapp" />
              <StatCard icon="📞" label="Appels"      value={stats.appel}      color="#6C63FF"   serieKey="appel"    />
              <StatCard icon="📤" label="Partages"    value={stats.partage}    color="#FFD700"   />
              <StatCard icon="🤝" label="Suggestions" value={stats.suggestion} color="#FB923C"   />
            </div>

            {/* Graphique */}
            <div style={{ background:T.bg, borderRadius:12, padding:16, border:`1px solid ${T.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <p style={{ color:T.text, fontWeight:700, fontSize:14, margin:0 }}>
                  {activeSerieMeta?.icon || "👁️"} {activeSerieMeta?.label || "Vues"} — {period === 7 ? "par jour" : "par semaine"}
                </p>
                {/* Légende */}
                <div style={{ display:"flex", gap:12 }}>
                  {SERIES.map(s => (
                    <div key={s.key} onClick={() => setActiveSerie(s.key)}
                      style={{ display:"flex", alignItems:"center", gap:4, cursor:"pointer", opacity: activeSerie===s.key ? 1 : 0.4, transition:"opacity 0.2s" }}>
                      <div style={{ width:10, height:10, borderRadius:3, background:s.color }}/>
                      <span style={{ fontSize:11, color:T.sub }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {chartData.every(d => (d[activeSerie] || 0) === 0) ? (
                <p style={{ color:T.sub, fontSize:13, textAlign:"center", padding:"20px 0" }}>
                  Aucune donnée sur cette période
                </p>
              ) : (
                <div style={{ display:"flex", alignItems:"flex-end", gap: period===30 ? 12 : 4, height:100 }}>
                  {chartData.map((d, i) => {
                    const val = d[activeSerie] || 0;
                    const h = Math.max(val > 0 ? 8 : 3, Math.round((val / maxVal) * 80));
                    return (
                      <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                        {val > 0 && (
                          <span style={{ fontSize:10, color:activeSerieMeta?.color || COLOR, fontWeight:700 }}>{val}</span>
                        )}
                        <div style={{ width:"100%", height:h,
                          background: val > 0
                            ? `linear-gradient(180deg,${activeSerieMeta?.color || COLOR},${activeSerieMeta?.color || COLOR}88)`
                            : T.border,
                          borderRadius:6, transition:"height 0.4s" }}/>
                        <span style={{ fontSize:period===30 ? 11 : 9, color:T.sub, textAlign:"center",
                          whiteSpace:"nowrap", overflow:"hidden", maxWidth: period===30 ? 80 : 28 }}>
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Taux d'engagement */}
            <div style={{ marginTop:12, background:`rgba(16,185,129,0.06)`,
              border:`1px solid rgba(16,185,129,0.2)`, borderRadius:12, padding:14 }}>
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

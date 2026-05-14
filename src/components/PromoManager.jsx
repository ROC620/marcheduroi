// src/components/PromoManager.jsx
// Composant admin — créer, modifier, supprimer les promotions

import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

const CIBLES = [
  { value: "all",        label: "🌐 Tout (tous les paiements)" },
  { value: "vitrine",    label: "🏪 VitrineWeb" },
  { value: "sponsoring", label: "⭐ Sponsoring" },
  { value: "urgent",     label: "🔴 Badge URGENT" },
  { value: "pro",        label: "👑 Badge PRO" },
  { value: "demande",    label: "📢 Publication demande" },
];

export default function PromoManager({ theme, notify }) {
  const [promos,   setPromos]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [editing,  setEditing]  = useState(null);

  const emptyForm = {
    label: "", type: "pourcentage", valeur: "", cible: "vitrine",
    debut: new Date().toISOString().slice(0,16),
    fin:   new Date(Date.now() + 30*24*3600*1000).toISOString().slice(0,16),
    actif: true, message: ""
  };
  const [form, setForm] = useState(emptyForm);

  const inp = {
    background: theme.bg, border: `1px solid ${theme.border}`,
    color: theme.text, padding: "10px 14px", borderRadius: 10,
    fontSize: 14, width: "100%", outline: "none", fontFamily: "inherit"
  };

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false });
    setPromos(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const isActive = (p) => {
    const now = new Date();
    return p.actif && new Date(p.debut) <= now && new Date(p.fin) >= now;
  };

  const handleSave = async () => {
    if (!form.label || !form.valeur || !form.fin) {
      notify("Remplissez tous les champs obligatoires", "error"); return;
    }
    setSaving(true);
    const payload = {
      ...form,
      valeur: parseInt(form.valeur),
      debut:  new Date(form.debut).toISOString(),
      fin:    new Date(form.fin).toISOString(),
    };
    let error;
    if (editing) {
      ({ error } = await supabase.from("promotions").update(payload).eq("id", editing));
    } else {
      ({ error } = await supabase.from("promotions").insert(payload));
    }
    setSaving(false);
    if (error) { notify("Erreur : " + error.message, "error"); return; }
    notify(editing ? "✅ Promo mise à jour !" : "✅ Promo créée !");
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    load();
  };

  const handleEdit = (p) => {
    setForm({
      label:   p.label,
      type:    p.type,
      valeur:  p.valeur,
      cible:   p.cible,
      debut:   new Date(p.debut).toISOString().slice(0,16),
      fin:     new Date(p.fin).toISOString().slice(0,16),
      actif:   p.actif,
      message: p.message || ""
    });
    setEditing(p.id);
    setShowForm(true);
  };

  const handleToggle = async (p) => {
    const { error } = await supabase.from("promotions").update({ actif: !p.actif }).eq("id", p.id);
    if (!error) { notify(p.actif ? "Promo désactivée" : "✅ Promo activée"); load(); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette promotion ?")) return;
    const { error } = await supabase.from("promotions").delete().eq("id", id);
    if (!error) { notify("Promotion supprimée"); load(); }
  };

  return (
    <div style={{ padding: "24px 0" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ color:theme.text, fontSize:20, fontWeight:800, margin:0 }}>🎁 Promotions</h2>
          <p style={{ color:theme.sub, fontSize:13, margin:"4px 0 0" }}>Gérez les réductions sur tous les paiements</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true); }}
          style={{ background:"linear-gradient(135deg,#10B981,#059669)", border:"none", color:"#fff",
            padding:"10px 20px", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer" }}>
          + Nouvelle promo
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{ background:theme.card, border:`1px solid ${theme.border}`, borderRadius:16, padding:24, marginBottom:24 }}>
          <h3 style={{ color:theme.text, fontWeight:800, marginBottom:20, fontSize:16 }}>
            {editing ? "✏️ Modifier la promotion" : "➕ Nouvelle promotion"}
          </h3>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {/* Label */}
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ fontSize:12, color:theme.sub, display:"block", marginBottom:4 }}>Nom de la promo *</label>
              <input style={inp} placeholder="Ex: Lancement VitrineWeb -40%"
                value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))}/>
            </div>

            {/* Cible */}
            <div>
              <label style={{ fontSize:12, color:theme.sub, display:"block", marginBottom:4 }}>S'applique à *</label>
              <select style={inp} value={form.cible} onChange={e=>setForm(f=>({...f,cible:e.target.value}))}>
                {CIBLES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Type */}
            <div>
              <label style={{ fontSize:12, color:theme.sub, display:"block", marginBottom:4 }}>Type de réduction *</label>
              <select style={inp} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                <option value="pourcentage">Pourcentage (%)</option>
                <option value="fixe">Montant fixe (FCFA)</option>
              </select>
            </div>

            {/* Valeur */}
            <div>
              <label style={{ fontSize:12, color:theme.sub, display:"block", marginBottom:4 }}>
                {form.type === "pourcentage" ? "Réduction (%) *" : "Réduction (FCFA) *"}
              </label>
              <input style={inp} type="number" min="1"
                placeholder={form.type === "pourcentage" ? "Ex: 40" : "Ex: 5000"}
                value={form.valeur} onChange={e=>setForm(f=>({...f,valeur:e.target.value}))}/>
            </div>

            {/* Dates */}
            <div>
              <label style={{ fontSize:12, color:theme.sub, display:"block", marginBottom:4 }}>Date de début *</label>
              <input style={inp} type="datetime-local"
                value={form.debut} onChange={e=>setForm(f=>({...f,debut:e.target.value}))}/>
            </div>
            <div>
              <label style={{ fontSize:12, color:theme.sub, display:"block", marginBottom:4 }}>Date de fin *</label>
              <input style={inp} type="datetime-local"
                value={form.fin} onChange={e=>setForm(f=>({...f,fin:e.target.value}))}/>
            </div>

            {/* Message */}
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ fontSize:12, color:theme.sub, display:"block", marginBottom:4 }}>Message affiché au client</label>
              <input style={inp} placeholder="Ex: 🔥 Offre de lancement -40% jusqu'au 30 juin !"
                value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}/>
            </div>

            {/* Actif */}
            <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:10 }}>
              <input type="checkbox" id="promo-actif" checked={form.actif}
                onChange={e=>setForm(f=>({...f,actif:e.target.checked}))}
                style={{ width:16, height:16, cursor:"pointer" }}/>
              <label htmlFor="promo-actif" style={{ color:theme.text, fontSize:14, cursor:"pointer" }}>
                Activer cette promotion immédiatement
              </label>
            </div>
          </div>

          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ flex:1, background:"linear-gradient(135deg,#10B981,#059669)", border:"none",
                color:"#fff", padding:"12px", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer" }}>
              {saving ? "⏳ Enregistrement..." : editing ? "✅ Mettre à jour" : "✅ Créer la promotion"}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm); }}
              style={{ background:"transparent", border:`1px solid ${theme.border}`, color:theme.sub,
                padding:"12px 20px", borderRadius:10, fontWeight:600, fontSize:14, cursor:"pointer" }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des promos */}
      {loading ? (
        <p style={{ color:theme.sub, textAlign:"center" }}>Chargement...</p>
      ) : promos.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px 0", color:theme.sub }}>
          <p style={{ fontSize:40 }}>🎁</p>
          <p>Aucune promotion créée</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {promos.map(p => {
            const active = isActive(p);
            const cibleLabel = CIBLES.find(c=>c.value===p.cible)?.label || p.cible;
            const debut = new Date(p.debut).toLocaleDateString("fr-FR");
            const fin   = new Date(p.fin).toLocaleDateString("fr-FR");
            return (
              <div key={p.id} style={{ background:theme.card, border:`1px solid ${active ? "#10B981" : theme.border}`,
                borderRadius:12, padding:16, opacity: p.actif ? 1 : 0.6 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontWeight:800, color:theme.text, fontSize:15 }}>{p.label}</span>
                      {active && <span style={{ background:"#10B981", color:"#fff", fontSize:10, fontWeight:700,
                        padding:"2px 8px", borderRadius:20 }}>EN COURS</span>}
                      {!p.actif && <span style={{ background:theme.border, color:theme.sub, fontSize:10,
                        fontWeight:700, padding:"2px 8px", borderRadius:20 }}>DÉSACTIVÉ</span>}
                    </div>
                    <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                      <span style={{ color:"#10B981", fontWeight:700, fontSize:14 }}>
                        {p.type === "pourcentage" ? `-${p.valeur}%` : `-${p.valeur.toLocaleString("fr-FR")} F`}
                      </span>
                      <span style={{ color:theme.sub, fontSize:13 }}>{cibleLabel}</span>
                      <span style={{ color:theme.sub, fontSize:13 }}>📅 {debut} → {fin}</span>
                    </div>
                    {p.message && <p style={{ color:theme.sub, fontSize:12, margin:"6px 0 0" }}>{p.message}</p>}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>handleToggle(p)}
                      style={{ background: p.actif ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                        border:"none", color: p.actif ? "#EF4444" : "#10B981",
                        padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}>
                      {p.actif ? "Désactiver" : "Activer"}
                    </button>
                    <button onClick={()=>handleEdit(p)}
                      style={{ background:"rgba(108,99,255,0.1)", border:"none", color:"#6C63FF",
                        padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}>
                      ✏️
                    </button>
                    <button onClick={()=>handleDelete(p.id)}
                      style={{ background:"rgba(239,68,68,0.1)", border:"none", color:"#EF4444",
                        padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

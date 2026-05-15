// src/hooks/useVitrineStats.js
// Hook pour enregistrer et lire les statistiques d'une vitrine

import { useState, useEffect } from "react";
import { supabase } from "../supabase";

// Générer un identifiant visiteur anonyme persistant
const getVisitorId = () => {
  let id = localStorage.getItem("mdr_visitor_id");
  if (!id) {
    id = "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("mdr_visitor_id", id);
  }
  return id;
};

export function useVitrineStats(structureId) {
  const [stats,   setStats]   = useState({ vues:0, likes:0, whatsapp:0, appel:0, partage:0, suggestion:0 });
  const [liked,   setLiked]   = useState(false);
  const [loading, setLoading] = useState(true);
  const visitorId = getVisitorId();

  // Charger les stats et vérifier si le visiteur a déjà liké
  useEffect(() => {
    if (!structureId) return;

    // Enregistrer la vue (une seule fois par session)
    const sessionKey = `mdr_vue_${structureId}`;
    if (!sessionStorage.getItem(sessionKey)) {
      supabase.from("vitrine_stats").insert({ structure_id: structureId, type: "vue", visitor_id: visitorId });
      sessionStorage.setItem(sessionKey, "1");
    }

    // Charger les compteurs
    Promise.all([
      supabase.from("vitrine_stats").select("type", { count:"exact" }).eq("structure_id", structureId).eq("type","vue"),
      supabase.from("vitrine_stats").select("type", { count:"exact" }).eq("structure_id", structureId).eq("type","like"),
      supabase.from("vitrine_stats").select("type", { count:"exact" }).eq("structure_id", structureId).eq("type","whatsapp"),
      supabase.from("vitrine_stats").select("type", { count:"exact" }).eq("structure_id", structureId).eq("type","appel"),
      supabase.from("vitrine_stats").select("type", { count:"exact" }).eq("structure_id", structureId).eq("type","partage"),
      supabase.from("vitrine_likes").select("visitor_id").eq("structure_id", structureId).eq("visitor_id", visitorId).maybeSingle(),
    ]).then(([vues, likes, wa, appel, partage, likeCheck]) => {
      setStats({
        vues:       vues.count       || 0,
        likes:      likes.count      || 0,
        whatsapp:   wa.count         || 0,
        appel:      appel.count      || 0,
        partage:    partage.count    || 0,
        suggestion: 0,
      });
      setLiked(!!likeCheck.data);
      setLoading(false);
    });
  }, [structureId]);

  // Enregistrer une interaction
  const track = async (type) => {
    await supabase.from("vitrine_stats").insert({ structure_id: structureId, type, visitor_id: visitorId });
    setStats(s => ({ ...s, [type]: (s[type] || 0) + 1 }));
  };

  // Liker / unliker
  const toggleLike = async () => {
    if (liked) {
      await supabase.from("vitrine_likes").delete().eq("structure_id", structureId).eq("visitor_id", visitorId);
      setLiked(false);
      setStats(s => ({ ...s, likes: Math.max(0, s.likes - 1) }));
    } else {
      await supabase.from("vitrine_likes").insert({ structure_id: structureId, visitor_id: visitorId });
      await track("like");
      setLiked(true);
    }
  };

  // Charger les stats détaillées pour le dashboard propriétaire (7 derniers jours)
  const loadDetailedStats = async () => {
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    const { data } = await supabase
      .from("vitrine_stats")
      .select("type, created_at")
      .eq("structure_id", structureId)
      .gte("created_at", since)
      .order("created_at", { ascending: true });
    return data || [];
  };

  return { stats, liked, loading, track, toggleLike, loadDetailedStats };
}

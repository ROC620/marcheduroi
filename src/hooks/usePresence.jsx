// src/hooks/usePresence.js
// Compteur temps réel via Supabase Realtime Presence
// Chaque visiteur s'annonce sur le channel de la page

import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";

export function usePresence(channelName) {
  const [count, setCount] = useState(0);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!channelName) return;

    // Identifiant unique pour ce visiteur dans cette session
    const visitorId = localStorage.getItem("mdr_visitor_id") ||
      "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("mdr_visitor_id", visitorId);

    const channel = supabase.channel(`presence:${channelName}`, {
      config: { presence: { key: visitorId } }
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
      })
      .on("presence", { event: "join" }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
      })
      .on("presence", { event: "leave" }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ visitor: visitorId, joined_at: Date.now() });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [channelName]);

  return count;
}

// Hook simplifié pour les cartes (liste d'annonces/boutiques)
// Ne s'abonne pas — juste affiche le count passé en prop
export function PresenceBadge({ count, theme }) {
  if (!count || count < 2) return null;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)",
      color:"#EF4444", borderRadius:20, padding:"2px 8px",
      fontSize:11, fontWeight:700
    }}>
      🔴 {count} en ligne
    </span>
  );
}

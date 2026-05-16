// src/hooks/usePresence.jsx
import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";

const getVisitorId = () => {
  let id = localStorage.getItem("mdr_visitor_id");
  if (!id) {
    id = "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("mdr_visitor_id", id);
  }
  return id;
};

export function usePresence(pageId) {
  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);
  const visitorId = getVisitorId();

  const fetchCount = async () => {
    const since = new Date(Date.now() - 90000).toISOString();
    const { count: c } = await supabase
      .from("presence_sessions")
      .select("*", { count: "exact", head: true })
      .eq("page_id", pageId)
      .gte("last_seen", since);
    if (c !== null) setCount(c);
  };

  const upsertSession = async () => {
    await supabase.from("presence_sessions")
      .delete()
      .eq("page_id", pageId)
      .eq("visitor_id", visitorId);
    await supabase.from("presence_sessions")
      .insert({ page_id: pageId, visitor_id: visitorId, last_seen: new Date().toISOString() });
    // Attendre 500ms pour que l'insert soit propagé avant de compter
    await new Promise(r => setTimeout(r, 500));
    await fetchCount();
  };

  const deleteSession = () => {
    supabase.from("presence_sessions")
      .delete()
      .eq("page_id", pageId)
      .eq("visitor_id", visitorId)
      .then(() => {});
  };

  useEffect(() => {
    if (!pageId) return;

    // Enregistrer et compter immédiatement
    upsertSession();

    // Rafraîchir toutes les 15 secondes (plus fréquent)
    intervalRef.current = setInterval(() => {
      upsertSession();
    }, 15000);

    window.addEventListener("beforeunload", deleteSession);

    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener("beforeunload", deleteSession);
      deleteSession();
    };
  }, [pageId]);

  return count;
}

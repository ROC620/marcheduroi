// src/hooks/usePresence.jsx
// Compteur visiteurs en temps réel via table presence_sessions

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

  const upsertSession = async () => {
    await supabase.from("presence_sessions").upsert(
      { page_id: pageId, visitor_id: visitorId, last_seen: new Date().toISOString() },
      { onConflict: "page_id,visitor_id" }
    );
  };

  const fetchCount = async () => {
    const since = new Date(Date.now() - 90000).toISOString();
    const { count: c } = await supabase
      .from("presence_sessions")
      .select("*", { count: "exact", head: true })
      .eq("page_id", pageId)
      .gte("last_seen", since);
    setCount(c || 0);
  };

  const deleteSession = async () => {
    await supabase.from("presence_sessions")
      .delete()
      .eq("page_id", pageId)
      .eq("visitor_id", visitorId);
  };

  useEffect(() => {
    if (!pageId) return;

    upsertSession();
    fetchCount();

    intervalRef.current = setInterval(() => {
      upsertSession();
      fetchCount();
    }, 30000);

    const handleUnload = () => deleteSession();
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener("beforeunload", handleUnload);
      deleteSession();
    };
  }, [pageId]);

  return count;
}

// src/components/LikeButton.jsx
// Like unique par utilisateur — fonctionne pour posts, boutiques, ateliers, restos, beaute, vitrines
// Usage : <LikeButton table="posts" itemId={post.id} likes={post.likes} user={user} theme={theme}/>

import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function LikeButton({ table, itemId, likes: initialLikes = 0, user, theme, size = "normal" }) {
  const [liked,    setLiked]    = useState(false);
  const [count,    setCount]    = useState(initialLikes);
  const [loading,  setLoading]  = useState(false);
  const [checked,  setChecked]  = useState(false);

  const T = theme || { sub: "#9A9AB0", border: "#2A2D45", card: "#1A1D30" };
  const isSmall = size === "small";

  // Vérifier si l'utilisateur a déjà liké cet item
  useEffect(() => {
    if (!user?.id) { setChecked(true); return; }
    supabase.from("user_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("table_name", table)
      .eq("item_id", itemId)
      .maybeSingle()
      .then(({ data }) => {
        setLiked(!!data);
        setChecked(true);
      });
  }, [user?.id, table, itemId]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user?.id) return; // non connecté → rien
    if (loading || !checked) return;
    setLoading(true);

    if (liked) {
      // Unlike
      const { error } = await supabase.from("user_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("table_name", table)
        .eq("item_id", itemId);

      if (!error) {
        // Décrémenter le compteur dans la table source
        await supabase.from(table)
          .update({ likes: Math.max(0, count - 1) })
          .eq("id", itemId);
        setLiked(false);
        setCount(c => Math.max(0, c - 1));
      }
    } else {
      // Like
      const { error } = await supabase.from("user_likes")
        .insert({ user_id: user.id, table_name: table, item_id: itemId });

      if (!error) {
        // Incrémenter le compteur dans la table source
        await supabase.from(table)
          .update({ likes: count + 1 })
          .eq("id", itemId);
        setLiked(true);
        setCount(c => c + 1);
      }
    }
    setLoading(false);
  };

  const color  = liked ? "#FF4757" : T.sub;
  const bg     = liked ? "rgba(255,71,87,0.12)" : "transparent";
  const border = liked ? "1px solid rgba(255,71,87,0.3)" : `1px solid ${T.border}`;

  return (
    <button
      onClick={handleLike}
      disabled={loading || !checked}
      title={!user?.id ? "Connectez-vous pour liker" : liked ? "Retirer votre like" : "Liker"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: isSmall ? 4 : 6,
        background: bg,
        border,
        borderRadius: isSmall ? 6 : 8,
        padding: isSmall ? "4px 8px" : "6px 12px",
        color,
        fontSize: isSmall ? 11 : 13,
        fontWeight: 600,
        cursor: user?.id ? "pointer" : "default",
        transition: "all 0.2s",
        opacity: loading ? 0.6 : 1,
        fontFamily: "inherit",
      }}
    >
      <span style={{ fontSize: isSmall ? 13 : 15 }}>
        {liked ? "❤️" : "🤍"}
      </span>
      <span>{count > 0 ? count : ""}</span>
    </button>
  );
}

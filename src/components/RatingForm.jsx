import { useState } from "react";

export default function RatingForm({ itemId, onRate, theme }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const labels = ["", "Mauvais 😕", "Passable 😐", "Bien 🙂", "Très bien 😊", "Excellent 🤩"];
  const active = hover || stars;

  return (
    <div style={{ background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16 }}>
      {/* Étoiles */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, justifyContent: "center" }}>
        {[1, 2, 3, 4, 5].map(s => (
          <span
            key={s}
            onClick={() => setStars(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onTouchStart={e => { e.preventDefault(); setStars(s); }}
            style={{
              fontSize: 36,
              cursor: "pointer",
              color: active >= s ? "#FFD700" : "#4A4A6A",
              transition: "color 0.15s, transform 0.15s",
              transform: active >= s ? "scale(1.2)" : "scale(1)",
              display: "inline-block",
              WebkitTapHighlightColor: "transparent",
              userSelect: "none",
            }}>
            ★
          </span>
        ))}
      </div>

      {/* Label */}
      <p style={{
        textAlign: "center",
        color: stars > 0 ? "#FFD700" : theme.sub,
        fontWeight: 700,
        fontSize: 13,
        marginBottom: 12,
        minHeight: 20,
        transition: "all 0.2s"
      }}>
        {stars > 0 ? labels[stars] : "Touchez une étoile pour noter"}
      </p>

      {/* Commentaire */}
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Laissez un commentaire (optionnel)..."
        rows={2}
        style={{
          width: "100%",
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: 8,
          color: theme.text,
          fontSize: 13,
          padding: "8px 12px",
          fontFamily: "inherit",
          outline: "none",
          resize: "none",
          marginBottom: 10,
          boxSizing: "border-box",
        }}
      />

      {/* Bouton */}
      <button
        onClick={() => { if (stars === 0) return; onRate(itemId, stars, comment); }}
        disabled={stars === 0}
        style={{
          width: "100%",
          padding: "10px",
          background: stars > 0 ? "linear-gradient(135deg,#FFD700,#FFA500)" : "rgba(255,255,255,0.1)",
          border: "none",
          color: stars > 0 ? "#000" : "#666",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 14,
          cursor: stars > 0 ? "pointer" : "not-allowed",
          transition: "all 0.2s",
        }}>
        {stars === 0 ? "Sélectionnez une note" : `Envoyer ma note — ${labels[stars]}`}
      </button>
    </div>
  );
}

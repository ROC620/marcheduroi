// src/components/ImgBBUploader.jsx
// Upload d'images vers Cloudinary — utilisé dans VitrineRequest et VitrineEdit
// mode="single"   → logo ou cover (1 image)
// mode="gallery"  → galerie (jusqu'à 20 images, stockées en newline-separated string)

import { useRef, useState } from "react";

const CLOUD_NAME   = "djx2gvcqp";
const UPLOAD_PRESET = "marcheduroi_vitrines";

async function uploadToImgBB(file) {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("folder", "vitrines");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form }
  );
  if (!res.ok) throw new Error("Erreur Cloudinary : " + res.status);
  const data = await res.json();
  if (data.error) throw new Error("Cloudinary : " + data.error.message);
  // URL optimisée : qualité auto + format auto
  return data.secure_url.replace("/upload/", "/upload/q_auto,f_auto/");
}

// ── Composant single (logo ou cover) ─────────────────────────────
function SingleUploader({ value, onChange, label, hint, placeholder, theme }) {
  const ref = useRef();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const T = theme || { sub: "#9A9AB0", border: "#2A2D45", card: "#1A1D30", text: "#E8E8F0" };

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 32 * 1024 * 1024) { setError("Fichier trop lourd (max 32 Mo)."); return; }
    setLoading(true); setError(null);
    try {
      const url = await uploadToImgBB(file);
      onChange(url);
    } catch (err) {
      setError("Erreur upload : " + err.message);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const inp = {
    background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
    padding: "10px 14px", color: T.text, fontSize: 13, width: "100%",
    boxSizing: "border-box", outline: "none", marginBottom: 6,
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: T.sub, display: "block", marginBottom: 6 }}>{label}</label>}
      {hint  && <p style={{ fontSize: 11, color: T.sub, margin: "0 0 8px", lineHeight: 1.6 }}>{hint}</p>}

      {/* Preview */}
      {value && (
        <div style={{ position: "relative", marginBottom: 8, display: "inline-block" }}>
          <img src={value} alt="preview" style={{ maxHeight: 100, maxWidth: "100%", borderRadius: 8, border: `1px solid ${T.border}`, objectFit: "cover" }}/>
          <button onClick={() => onChange("")}
            style={{ position: "absolute", top: 4, right: 4, background: "rgba(255,71,87,0.9)", border: "none", color: "#fff", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            ✕
          </button>
        </div>
      )}

      {/* Bouton upload */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button type="button" onClick={() => ref.current?.click()} disabled={loading}
          style={{ background: loading ? "transparent" : "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.4)", color: "#10B981", padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", flexShrink: 0 }}>
          {loading ? "⏳ Upload..." : value ? "🔄 Changer" : "📁 Choisir une image"}
        </button>
        <span style={{ color: T.sub, fontSize: 11 }}>ou collez un lien ↓</span>
      </div>

      {/* Input URL manuel (fallback) */}
      <input type="url" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder || "https://..."} style={{ ...inp, marginTop: 8 }}/>

      {error && <p style={{ color: "#FF4757", fontSize: 12, margin: "4px 0 0" }}>❌ {error}</p>}
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }} onChange={handle}/>
    </div>
  );
}

// ── Composant gallery (max 20) ────────────────────────────────────
function GalleryUploader({ value, onChange, max = 20, theme, disabled = false }) {
  const ref = useRef();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const T = theme || { sub: "#9A9AB0", border: "#2A2D45", card: "#1A1D30", text: "#E8E8F0" };

  // value est une string newline-separated
  const photos = value ? value.split("\n").map(l => l.trim()).filter(Boolean) : [];

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files).slice(0, max - photos.length);
    if (!files.length) return;
    setLoading(true); setError(null);
    const uploaded = [];
    for (const file of files) {
      if (file.size > 32 * 1024 * 1024) { setError("Fichier trop lourd (max 32 Mo)."); continue; }
      try {
        const url = await uploadToImgBB(file);
        uploaded.push(url);
      } catch (err) {
        setError("Erreur : " + err.message);
      }
    }
    if (uploaded.length) {
      const newVal = [...photos, ...uploaded].join("\n");
      onChange(newVal);
    }
    setLoading(false);
    e.target.value = "";
  };

  const remove = (index) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated.join("\n"));
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: T.sub, display: "block", marginBottom: 6 }}>
        Photos galerie ({photos.length}/{max})
      </label>

      {/* Grille de preview */}
      {photos.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {photos.map((url, i) => (
            <div key={i} style={{ position: "relative", width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}` }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              {!disabled && (
                <button onClick={() => remove(i)}
                  style={{ position: "absolute", top: 2, right: 2, background: "rgba(255,71,87,0.9)", border: "none", color: "#fff", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ✕
                </button>
              )}
            </div>
          ))}
          {/* Placeholder ajout */}
          {photos.length < max && !loading && !disabled && (
            <div onClick={() => ref.current?.click()}
              style={{ width: 80, height: 80, borderRadius: 8, border: `2px dashed ${T.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.sub, gap: 4 }}>
              <span style={{ fontSize: 20 }}>+</span>
              <span style={{ fontSize: 9, fontWeight: 600 }}>Ajouter</span>
            </div>
          )}
          {loading && (
            <div style={{ width: 80, height: 80, borderRadius: 8, border: "2px dashed #10B981", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
              ⏳
            </div>
          )}
        </div>
      )}

      {/* Bouton ajout si galerie vide */}
      {photos.length === 0 && (
        <button type="button" onClick={() => ref.current?.click()} disabled={loading || disabled}
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.4)", color: "#10B981", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 8 }}>
          {loading ? "⏳ Upload en cours..." : "📁 Choisir des photos"}
        </button>
      )}

      {/* Fallback textarea URL manuel */}
      <details style={{ marginTop: 8 }}>
        <summary style={{ fontSize: 11, color: T.sub, cursor: "pointer" }}>Coller des liens manuellement</summary>
        <textarea style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", color: T.text, fontSize: 12, width: "100%", boxSizing: "border-box", minHeight: 70, resize: "vertical", fontFamily: "monospace", marginTop: 6, outline: "none" }}
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={"https://i.ibb.co/.../photo1.jpg\nhttps://i.ibb.co/.../photo2.jpg"}
          disabled={disabled}/>
      </details>

      {error && <p style={{ color: "#FF4757", fontSize: 12, margin: "6px 0 0" }}>❌ {error}</p>}
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: "none" }} onChange={handleFiles}/>
    </div>
  );
}

export { SingleUploader, GalleryUploader };

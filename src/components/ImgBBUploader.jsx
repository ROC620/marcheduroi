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

// Helper : normalise un item photo en {url, caption}
const parsePhoto = (p) => (typeof p === "string" ? { url: p, caption: "" } : { url: p?.url || "", caption: p?.caption || "" });

// ── Composant gallery (max 20) ────────────────────────────────────
// value : tableau [{url, caption}] (ou strings pour compat anciens)
// onChange : (newArray) => void
function GalleryUploader({ value, onChange, max = 20, theme, disabled = false }) {
  const ref = useRef();
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [urlInput,    setUrlInput]    = useState("");
  const T = theme || { sub: "#9A9AB0", border: "#2A2D45", card: "#1A1D30", text: "#E8E8F0" };

  // Normaliser : toujours un tableau d'objets {url, caption}
  const photos = Array.isArray(value)
    ? value.map(parsePhoto).filter(p => p.url)
    : [];

  const update = (newPhotos) => onChange(newPhotos);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files).slice(0, max - photos.length);
    if (!files.length) return;
    setLoading(true); setError(null);
    const uploaded = [];
    for (const file of files) {
      if (file.size > 32 * 1024 * 1024) { setError("Fichier trop lourd (max 32 Mo)."); continue; }
      try {
        const url = await uploadToImgBB(file);
        uploaded.push({ url, caption: "" });
      } catch (err) {
        setError("Erreur : " + err.message);
      }
    }
    if (uploaded.length) update([...photos, ...uploaded]);
    setLoading(false);
    e.target.value = "";
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url || photos.length >= max) return;
    update([...photos, { url, caption: "" }]);
    setUrlInput("");
  };

  const remove = (index) => update(photos.filter((_, i) => i !== index));

  const setCaption = (index, caption) => {
    const updated = photos.map((p, i) => i === index ? { ...p, caption } : p);
    update(updated);
  };

  const changeUrl = (index, url) => {
    const updated = photos.map((p, i) => i === index ? { ...p, url } : p);
    update(updated);
  };

  const inp = { background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: T.sub, display: "block", marginBottom: 6 }}>
        Photos galerie ({photos.length}/{max})
      </label>

      {/* Cartes photos avec description */}
      {photos.map((photo, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 10, marginBottom: 8 }}>
          {/* Miniature */}
          <div style={{ position: "relative", flexShrink: 0, width: 120, height: 90 }}>
            <img src={photo.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: `1px solid ${T.border}` }} onError={e => e.target.style.opacity = "0.3"}/>
          </div>
          {/* Description + actions */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <textarea
              value={photo.caption}
              onChange={e => setCaption(i, e.target.value)}
              placeholder="Description de la photo (ex: Salle d'attente climatisée)"
              maxLength={120}
              disabled={disabled}
              rows={2}
              style={{ ...inp, width: "100%", resize: "none", fontSize: 12, lineHeight: 1.5 }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              {!disabled && (
                <button type="button" onClick={() => { const inp2 = document.createElement("input"); inp2.type="file"; inp2.accept="image/*"; inp2.onchange = async (ev) => { const file = ev.target.files[0]; if(!file) return; setLoading(true); try { const url = await uploadToImgBB(file); changeUrl(i, url); } catch(err) { setError(err.message); } setLoading(false); }; inp2.click(); }}
                  style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: "transparent", color: T.sub, cursor: "pointer", fontWeight: 600 }}>
                  🔄 Changer
                </button>
              )}
              {!disabled && (
                <button type="button" onClick={() => remove(i)}
                  style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,71,87,0.4)", background: "transparent", color: "#FF4757", cursor: "pointer", fontWeight: 600 }}>
                  🗑️ Supprimer
                </button>
              )}
              <span style={{ fontSize: 10, color: T.sub, alignSelf: "center", marginLeft: "auto" }}>#{i + 1}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Bouton ajouter */}
      {photos.length < max && !disabled && (
        <button type="button" onClick={() => ref.current?.click()} disabled={loading}
          style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.4)", color: "#10B981", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 8, width: "100%" }}>
          {loading ? "⏳ Upload en cours..." : `📁 Ajouter une photo (${photos.length}/${max})`}
        </button>
      )}

      {/* Ajout par URL */}
      {photos.length < max && !disabled && (
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
            placeholder="Ou coller un lien image..." style={{ ...inp, flex: 1 }}
            onKeyDown={e => e.key === "Enter" && addUrl()}/>
          <button type="button" onClick={addUrl}
            style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.sub, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            Ajouter
          </button>
        </div>
      )}

      {error && <p style={{ color: "#FF4757", fontSize: 12, margin: "6px 0 0" }}>❌ {error}</p>}
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: "none" }} onChange={handleFiles}/>
    </div>
  );
}

export { SingleUploader, GalleryUploader };

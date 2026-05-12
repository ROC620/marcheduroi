import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { supabase } from "../supabase";
import VideoCardPlayer from "./VideoCardPlayer";

// Données de fallback
const INITIAL_BEAUTE = [
  { id:"beau1", name:"Salon Beauté Divine", type:"Salon de coiffure", specialite:"Tresses africaines et coiffures modernes", services:"Tresses, Locks, Tissages, Lissage, Coloration, Coupe, Soins capillaires", tarifs:"2 000 - 25 000 FCFA", rendezvous:"Les deux", produits:"L'Oréal, Dark & Lovely, Cantu", description:"Salon de coiffure professionnel spécialisé en tresses africaines et coiffures modernes. Accueil chaleureux.", ville:"Cotonou", quartier:"Cadjehoun", von:"Von du supermarché Erevan", horaires:"Lun-Sam 8h-20h · Dim 10h-17h", contact:"contact@marcheduroi.com", phone:"+2290147562640", author:"Nadège K.", authorId:"beau_u1", date:"2026-03-01", likes:42, photos:[], video:null, keywords:"tresses coiffure africaine lissage", expiresAt:null },
  { id:"beau2", name:"Institut Glam & Style", type:"Institut de beauté", specialite:"Maquillage et soins du visage", services:"Maquillage, Manucure, Pédicure, Soins visage, Épilation", tarifs:"3 000 - 40 000 FCFA", rendezvous:"Oui", produits:"MAC, NYX, L'Oréal Paris", description:"Institut de beauté proposant des soins complets. Personnel professionnel certifié.", ville:"Cotonou", quartier:"Ganhi", von:"Von du marché Ganhi", horaires:"Lun-Sam 9h-19h", contact:"contact@marcheduroi.com", phone:"+2290147562640", author:"Christelle A.", authorId:"beau_u2", date:"2026-03-04", likes:31, photos:[], video:null, keywords:"maquillage manucure soins beauté", expiresAt:null },
];

const INITIAL_ATELIERS = [
  {
    id: "a1", name: "Atelier Couture Élégance", type: "Couture/Mode",
    description: "Confection de tenues sur mesure pour hommes, femmes et enfants. Spécialiste en tenues traditionnelles et modernes. Retouches et réparations acceptées.",
    services: "Couture sur mesure, Tenues de cérémonie, Retouches, Broderie, Formation couture",
    ville: "Cotonou", quartier: "Gbègamey", von: "Von du lycée technique",
    horaires: "Lun-Sam 8h-18h",
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
    author: "Rosine A.", authorId: "a_u1", date: "2026-03-02", likes: 20,
    photos: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80"
    ], video: null, expiresAt: null
  },
  {
    id: "a2", name: "Garage Auto Pro", type: "Mécanique",
    description: "Réparation et entretien de tous types de véhicules. Diagnostic électronique, vidange, freins, climatisation. Pièces détachées disponibles.",
    services: "Diagnostic, Vidange, Freinage, Climatisation, Carrosserie, Électricité auto",
    ville: "Abomey-Calavi", quartier: "Godomey", von: "Von du rond-point Erevan",
    horaires: "Lun-Sam 7h30-18h30",
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
    author: "Théodore M.", authorId: "a_u2", date: "2026-03-04", likes: 15,
    photos: [
      "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da12?w=600&q=80",
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80"
    ], video: null, expiresAt: null
  },
  {
    id: "a3", name: "Atelier Bois & Métal", type: "Menuiserie/Soudure",
    description: "Fabrication de meubles sur mesure, portes, fenêtres, grilles de sécurité. Travaux de soudure et serrurerie. Devis gratuit.",
    services: "Meubles sur mesure, Portes et fenêtres, Grilles, Soudure, Serrurerie",
    ville: "Parakou", quartier: "Banikanni", von: "Von du marché central",
    horaires: "Lun-Sam 7h-18h",
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
    author: "Justin F.", authorId: "a_u3", date: "2026-03-06", likes: 9,
    photos: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80"
    ], video: null, expiresAt: null
  },
];


function AnnonceDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = window.location.pathname;
  // Extraire l'id depuis l'URL directement (route /* ne fournit pas useParams)
  const id = pathname.split("/").pop();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Déterminer le type selon l'URL
  const type = pathname.startsWith("/boutique/") ? "boutique"
             : pathname.startsWith("/atelier/")  ? "atelier"
             : pathname.startsWith("/resto/")    ? "resto"
             : pathname.startsWith("/beaute/")   ? "beaute"
             : "annonce";

  const tableMap = { annonce:"posts", boutique:"boutiques", atelier:"ateliers", resto:"restos", beaute:"beaute" };

  useEffect(() => {
    // Ignorer si id n'est pas encore défini (transition de route)
    if (!id || id === "undefined") return;
    const load = async () => {
      setLoading(true);
      const table = tableMap[type];
      const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
      if (error || !data) {
        // Fallback sur données statiques
        let fallback = null;
        if (type === "boutique") fallback = INITIAL_BOUTIQUES.find(b => String(b.id) === String(id));
        else if (type === "atelier") fallback = INITIAL_ATELIERS.find(a => String(a.id) === String(id));
        else if (type === "resto") fallback = INITIAL_RESTOS.find(r => String(r.id) === String(id));
        else if (type === "beaute") fallback = INITIAL_BEAUTE.find(b => String(b.id) === String(id));
        else fallback = INITIAL_POSTS.find(p => String(p.id) === String(id));
        if (fallback) setItem(fallback);
        else setNotFound(true);
      } else {
        setItem(data);
      }
      setLoading(false);
    };
    load();
  }, [id, type]);

  const colorMap = { annonce:"#6C63FF", boutique:"#FF6584", atelier:"#43C6AC", resto:"#FF8C00", beaute:"#FF69B4" };
  const labelMap = { annonce:"Annonce", boutique:"Boutique", atelier:"Atelier", resto:"Restaurant & Bar", beaute:"Beauté & Coiffure" };
  const color = colorMap[type];

  // Partage Web Share API
  const handleShare = () => {
    const pageUrl = window.location.href.split('?')[0];
    const title = item?.title || item?.name || "MarchéduRoi";
    const price = item?.price ? " — " + item.price + (String(item.price).includes("FCFA") ? "" : " FCFA") : "";
    const slogan = "Sur MarchéduRoi, vous êtes le Roi du Marché 👑";
    const shareText = title + price + "\n" + pageUrl + "\n" + slogan;
    if (navigator.share) {
      navigator.share({ title: title + price, text: shareText });
    } else {
      navigator.clipboard.writeText(pageUrl);
      alert("Lien copié !");
    }
  };

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#0D0F1A",fontFamily:"Sora,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:48,height:48,border:"4px solid #2A2D45",borderTop:"4px solid #6C63FF",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 16px" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color:"#9A9AB0",fontSize:14 }}>Chargement…</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ textAlign:"center",padding:"80px 24px",fontFamily:"Sora,sans-serif",background:"#0D0F1A",minHeight:"100vh",color:"#E8E8F0" }}>
      <p style={{ fontSize:48,marginBottom:16 }}>😕</p>
      <h2 style={{ fontSize:24,fontWeight:700,marginBottom:12 }}>Contenu introuvable</h2>
      <p style={{ color:"#9A9AB0",marginBottom:24 }}>Ce lien n'est plus disponible ou a expiré.</p>
      <button onClick={()=>window.history.back()} style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"12px 28px",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer" }}>
        ← Retour
      </button>
    </div>
  );

  const title = item?.title || item?.name || "";
  const photos = item?.photos || [];

  return (
    <div style={{ background:"#0D0F1A",minHeight:"100vh",fontFamily:"Sora,sans-serif",color:"#E8E8F0" }}>
      {/* Navbar */}
      <div style={{ background:"#0D0F1AEE",borderBottom:"1px solid #2A2D45",padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100 }}>
        <div style={{ display:"flex",alignItems:"center",cursor:"pointer" }} onClick={()=>{
          const fromView = location.state?.fromView || sessionStorage.getItem("mdr_back_view") || "home";
          const scrollPos = location.state?.scrollPos || parseInt(sessionStorage.getItem("mdr_scroll_pos")||"0");
          navigate("/");
          setTimeout(() => window.dispatchEvent(new CustomEvent("mdr_restore_view", { detail: { view: fromView, scrollPos } })), 60);
        }}>
          <img src="/marcheduRoi-icon.svg" alt="MarcheduRoi" style={{ height:52,width:"auto",objectFit:"contain" }}/>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={handleShare} style={{ background:"rgba(108,99,255,0.15)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>
            🔗 Partager
          </button>
          <button onClick={()=>{
            const fromView = location.state?.fromView || sessionStorage.getItem("mdr_back_view") || "home";
            const scrollPos = location.state?.scrollPos || parseInt(sessionStorage.getItem("mdr_scroll_pos")||"0");
            navigate("/");
            setTimeout(() => window.dispatchEvent(new CustomEvent("mdr_restore_view", { detail: { view: fromView, scrollPos } })), 60);
          }} style={{ background:"transparent",border:"1px solid #2A2D45",color:"#9A9AB0",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>
            ← Retour
          </button>
        </div>
      </div>

      <div style={{ maxWidth:750,margin:"0 auto",padding:"24px" }}>

        {/* Photos / Vidéo */}
        {item.video && (
          <div style={{ borderRadius:16,overflow:"hidden",marginBottom:20 }}>
            <VideoCardPlayer video={item.video?.url||item.video} photos={photos} maxSeconds={type==="annonce"?60:120}/>
          </div>
        )}
        {!item.video && photos.length > 0 && (
          <div style={{ borderRadius:16,overflow:"hidden",marginBottom:20 }}>
            <img src={photos[0]} alt="" style={{ width:"100%",objectFit:"cover",maxHeight:360 }}/>
          </div>
        )}
        {!item.video && photos.length > 1 && (
          <div style={{ display:"flex",gap:8,marginBottom:20,overflowX:"auto" }}>
            {photos.slice(1).map((p,i)=>(
              <img key={i} src={p} alt="" style={{ width:90,height:70,borderRadius:10,objectFit:"cover",flexShrink:0 }}/>
            ))}
          </div>
        )}

        {/* Badge + titre */}
        <span style={{ background:`${color}22`,color,padding:"4px 14px",borderRadius:20,fontSize:12,fontWeight:700 }}>
          {labelMap[type]}{item.type?` · ${item.type}`:""}{item.category?` · ${item.category}`:""}
        </span>
        {(item.sponsored || item.urgent) && (
          <div style={{ display:"inline-flex",gap:8,marginLeft:8 }}>
            {item.sponsored && <span style={{ background:"rgba(255,215,0,0.2)",color:"#FFD700",padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700 }}>🌟 Sponsorisé</span>}
            {item.urgent && <span style={{ background:"rgba(255,71,87,0.2)",color:"#FF4757",padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700 }}>🔥 URGENT</span>}
          </div>
        )}

        <h1 style={{ fontSize:28,fontWeight:800,margin:"14px 0 8px" }}>{title}</h1>
        {item.price && <p style={{ fontSize:22,fontWeight:800,color:"#43C6AC",marginBottom:8 }}>{item.price}</p>}
        {item.prixMoyen && <p style={{ fontSize:16,color:"#FF8C00",fontWeight:600,marginBottom:8 }}>Prix moyen : {item.prixMoyen}</p>}
        <p style={{ color:"#9A9AB0",lineHeight:1.8,marginBottom:20,fontSize:15 }}>{item.description}</p>

        {/* Infos supplémentaires */}
        {item.specialite && <p style={{ color:"#FF8C00",fontWeight:600,marginBottom:8 }}>✨ Spécialité : {item.specialite}</p>}
        {item.plats && <p style={{ color:"#9A9AB0",marginBottom:8 }}>🍴 {item.plats}</p>}
        {item.services && <p style={{ color:"#9A9AB0",marginBottom:16 }}>✅ Services : {item.services}</p>}
        {item.tarifs && <p style={{ color:"#43C6AC",fontWeight:600,marginBottom:12 }}>💰 Tarifs : {item.tarifs}</p>}

        {/* Localisation */}
        {(item.ville||item.quartier||item.position) && (
          <div style={{ background:"#1A1D30",border:"1px solid #2A2D45",borderRadius:12,padding:16,marginBottom:16 }}>
            <p style={{ fontWeight:700,marginBottom:6,color:"#E8E8F0" }}>📍 Localisation</p>
            <p style={{ color:"#9A9AB0" }}>{[item.ville,item.quartier,item.position].filter(Boolean).join(", ")}</p>
            {item.lat && item.lng && (
              <a href={`https://www.google.com/maps?q=${item.lat},${item.lng}`} target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-block",marginTop:8,color:"#4285F4",fontWeight:600,fontSize:13,textDecoration:"none" }}>
                🗺️ Voir sur Google Maps →
              </a>
            )}
          </div>
        )}
        {item.horaires && <p style={{ color:"#43C6AC",fontWeight:600,marginBottom:16 }}>🕐 {item.horaires}</p>}

        {/* Contacts */}
        <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:24 }}>
          {item.contact && (
            <a href={"mailto:"+item.contact} style={{ display:"flex",alignItems:"center",gap:12,background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.3)",borderRadius:12,padding:16,color:"#43C6AC",textDecoration:"none",fontWeight:600 }}>
              📧 {item.contact}
            </a>
          )}
          {item.phone && (
            <>
              <a href={"tel:"+item.phone} style={{ display:"flex",alignItems:"center",gap:12,background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",borderRadius:12,padding:16,color:"#6C63FF",textDecoration:"none",fontWeight:600 }}>
                📞 Appeler : {item.phone}
              </a>
              <a href={"https://wa.me/"+item.phone.replace(/[\s+()-]/g,"")} target="_blank" rel="noopener noreferrer"
                style={{ display:"flex",alignItems:"center",gap:12,background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",borderRadius:12,padding:16,color:"#25D366",textDecoration:"none",fontWeight:600 }}>
                💬 WhatsApp : {item.phone}
              </a>
            </>
          )}
        </div>

        {/* Partage */}
        <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
          <a href={"https://wa.me/?text="+encodeURIComponent(title+" — MarchéduRoi\n"+window.location.href)} target="_blank" rel="noopener noreferrer"
            style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",borderRadius:12,padding:"12px",color:"#25D366",textDecoration:"none",fontWeight:700,fontSize:14,minWidth:120 }}>
            <svg width="16" height="16" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            WhatsApp
          </a>
          <a href={"https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(window.location.href)} target="_blank" rel="noopener noreferrer"
            style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(24,119,242,0.1)",border:"1px solid rgba(24,119,242,0.3)",borderRadius:12,padding:"12px",color:"#1877F2",textDecoration:"none",fontWeight:700,fontSize:14,minWidth:120 }}>
            <svg width="16" height="16" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </a>
          <button onClick={handleShare}
            style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",borderRadius:12,padding:"12px",color:"#6C63FF",fontWeight:700,fontSize:14,cursor:"pointer",minWidth:120 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Autres apps
          </button>
        </div>

        <button onClick={()=>{
            const fromView = location.state?.fromView || sessionStorage.getItem("mdr_back_view") || "home";
            const scrollPos = location.state?.scrollPos || parseInt(sessionStorage.getItem("mdr_scroll_pos")||"0");
            navigate("/");
            setTimeout(() => window.dispatchEvent(new CustomEvent("mdr_restore_view", { detail: { view: fromView, scrollPos } })), 60);
          }} style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer" }}>
          ← Retour
        </button>
      </div>
    </div>
  );
}

export default AnnonceDetail;

import React from "react";
import { usePromo } from "../hooks/usePromo";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import { VITRINE_THEMES, VITRINE_TYPES, NEWS_TYPES, getVitrineTheme, toSlug } from "../vitrineConstants";
import { VitrineCarousel, VitrineSection } from "./VitrineCarousel";
import { SingleUploader, GalleryUploader } from "./ImgBBUploader";

const PHONE_CODES = {"BJ":"+229","TG":"+228","CI":"+225","SN":"+221","ML":"+223","BF":"+226","NE":"+227","GN":"+224","NG":"+234","CM":"+237","CG":"+242","CD":"+243","GA":"+241","MG":"+261","RW":"+250","BI":"+257","TD":"+235","MR":"+222","FR":"+33","BE":"+32","CH":"+41","CA":"+1","US":"+1","GB":"+44"};
const PHONE_PLACEHOLDERS = {"BJ":"+229 0100000000","TG":"+228 90000000","CI":"+225 0100000000","SN":"+221 700000000","NG":"+234 8000000000","CM":"+237 600000000","FR":"+33 600000000","BE":"+32 470000000","GB":"+44 7000000000"};
const getPhonePrefix = () => { const c = localStorage.getItem("mdr_country")||"BJ"; return PHONE_CODES[c]||"+"; };
const getPhonePlaceholder = () => { const c = localStorage.getItem("mdr_country")||"BJ"; return PHONE_PLACEHOLDERS[c]||(PHONE_CODES[c]?PHONE_CODES[c]+" votre numéro":"+indicatif votre numéro"); };
const getThemeFromStorage = () => {
  const t = localStorage.getItem("mdr_theme");
  const themes = { dark:{bg:"#0D0F1A",card:"#1A1D30",text:"#E8E8F0",sub:"#9A9AB0",border:"#2A2D45"}, light:{bg:"#F8FAFC",card:"#FFFFFF",text:"#1A1D30",sub:"#6B7280",border:"#E2E8F0"} };
  return themes[t] || themes.dark;
};

function VitrineRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const COLOR    = "#10B981";
  const T        = getThemeFromStorage();

  // Détection pack pro
  const isPack   = new URLSearchParams(location.search).get("pack") === "pro";
  const PACK_PRICE = 20000; // Pack Pro + Vitrine
  const SOLO_PRICE = 15000; // Vitrine seule
  const { applyPromo, promoLabel } = usePromo();

  const TYPES = ["Restaurant","Maquis / Buvette","Fast-food","Pâtisserie / Boulangerie","Bar / Lounge","École maternelle","École primaire","Collège","Lycée","Complexe scolaire","Université / Institut","Centre de formation","Crèche / Garderie","Clinique","Cabinet médical","Pharmacie","Cabinet dentaire","Cabinet ophtalmologique","Maternité","Centre de kinésithérapie","Laboratoire d'analyses","Hôtel","Auberge / Maison d'hôtes","Boutique / Magasin","Supermarché","Agence immobilière","Station-service","Garage / Mécanique","Salon de coiffure","Spa / Beauté","Pressing / Laverie","Imprimerie / Copie","Cabinet d'avocats","Notaire","Huissier","Bureau d'expertise comptable","Architecte","Bureau d'études","Agence de communication","Mairie","ONG","Association","Fondation","Paroisse / Église","Mosquée","Temple","Autre"];

  const [form, setForm] = React.useState({
    name:"", type:"Restaurant", slogan:"", description:"",
    ville:"", quartier:"", von:"", address:"",
    gps_lat:"", gps_lng:"",
    phone:getPhonePrefix(), whatsapp:getPhonePrefix(), email:"", facebook:"",
    logo_url:"", cover_url:"", photos:"", video:"",
    hours:"", services:"",
  });

  const NEWS_TYPES = ["Actualité","Promotion","Nouveauté","Événement","Offre d'emploi"];
  const emptyNews  = { type:"Actualité", title:"", content:"" };
  const [initialNews, setInitialNews] = React.useState([
    { ...emptyNews },
    { ...emptyNews },
    { ...emptyNews },
    { ...emptyNews },
  ]);

  const updateNews = (i, field, val) => {
    setInitialNews(prev => prev.map((n,j) => j===i ? {...n,[field]:val} : n));
  };
  const [paying,  setPaying]  = React.useState(false);
  const [done,    setDone]    = React.useState(false);
  const [error,   setError]   = React.useState(null);
  const errorRef = React.useRef(null);
  const [slug,    setSlug]    = React.useState("");
  const [authChecked, setAuthChecked] = React.useState(false);
  const [isLoggedIn,  setIsLoggedIn]  = React.useState(false);
  const [isAdmin,     setIsAdmin]     = React.useState(false);

  // Vérifier si l'utilisateur est connecté et s'il est admin
  React.useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session) {
        const { data } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        setIsAdmin(data?.role === "admin");
      }
      setAuthChecked(true);
    });
  }, []);

  // Auto-slug depuis le nom
  const toSlug = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-");
  const handleName = (v) => { setForm(f=>({...f,name:v})); setSlug(toSlug(v)); };

  // Charger FedaPay
  const loadFedaPay = () => new Promise((res,rej)=>{
    if (window.FedaPay) { res(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.fedapay.com/checkout.js?v=1.1.7";
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

  // Charger Flutterwave
  const loadFlutterwave = () => new Promise((res,rej)=>{
    if (window.FlutterwaveCheckout) { res(); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

  const setErrorAndScroll = (msg) => {
    setError(msg);
    setTimeout(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  };

  const handlePaymentSuccess = async () => {
    setPaying(true);
    const finalSlug = slug || toSlug(form.name) + "-" + Date.now();
    // Protection doublon : vérifier que la vitrine n'existe pas déjà
    const { data: existing } = await supabase.from("structures").select("id").eq("slug", finalSlug).maybeSingle();
    if (existing) { setDone(true); setPaying(false); return; } // déjà enregistrée
    const photos = form.photos.split("\n").map(l=>l.trim()).filter(Boolean).slice(0,20);
    const now = new Date();
    // Récupérer l'ID de l'utilisateur connecté
    const { data: { session } } = await supabase.auth.getSession();
    const { error: dbErr } = await supabase.from("structures").insert({
      slug:        finalSlug,
      name:        form.name.trim(),
      type:        form.type,
      slogan:      form.slogan || null,
      description: form.description || null,
      ville:       form.ville || null,
      quartier:    form.quartier || null,
      von:         form.von || null,
      address:     form.address || null,
      gps_lat:     form.gps_lat ? parseFloat(form.gps_lat) : null,
      gps_lng:     form.gps_lng ? parseFloat(form.gps_lng) : null,
      phone:       form.phone || null,
      whatsapp:    form.whatsapp || null,
      email:       form.email || null,
      facebook:    form.facebook || null,
      logo_url:    form.logo_url || null,
      cover_url:   form.cover_url || null,
      photos,
      video:       form.video || null,
      hours:       form.hours || null,
      services:    form.services || null,
      news:        initialNews.filter(n => n.title.trim()).map(n => ({
        title:   n.title.trim(),
        content: n.content.trim(),
        type:    n.type,
        date:    new Date().toLocaleDateString("fr-FR"),
      })),
      active:      false,
      verified:    false,
      paid_at:     now.toISOString(),
      creation_amount: isPack ? PACK_PRICE : SOLO_PRICE,
      renewal_amount:  18000,
      owner_id:    session?.user?.id || null,
    });
    if (dbErr) {
      setError("Paiement reçu mais enregistrement échoué. Contactez-nous : contact@marcheduroi.com");
    } else {
      setDone(true);
    }
    setPaying(false);
  };

  const launchPayment = async () => {
    // Validation
    if (!form.name.trim()) { setErrorAndScroll("Le nom de la structure est obligatoire."); return; }
    if (!form.type) { setErrorAndScroll("Le type de structure est obligatoire."); return; }
    if (!form.ville) { setErrorAndScroll("La ville est obligatoire."); return; }
    if (!form.phone.trim()) { setErrorAndScroll("Le numéro de téléphone est obligatoire."); return; }
    setError(null);
    // Admin → activation directe sans paiement
    if (isAdmin) { handlePaymentSuccess(); return; }
    try {
      await loadFedaPay();
      const FP = window.FedaPay;
      FP.init({
        public_key: import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || "pk_sandbox_VOTRE_CLE_ICI",
        transaction: { amount: applyPromo(isPack ? PACK_PRICE : SOLO_PRICE, "vitrine").prixFinal, description: `VitrineWeb — Création de vitrine : ${form.name}` },
        customer:    { email: form.email || "client@marcheduroi.com" },
        onComplete(resp, reason) {
          console.log("[FedaPay] reason:", reason, "resp:", resp);
          const ok = reason === FP.TRANSACTION_APPROVED
            || reason === "transaction_approved"
            || reason === "approved"
            || resp?.transaction?.status === "approved";
          if (ok) handlePaymentSuccess();
          else setErrorAndScroll("Paiement annulé ou échoué. Réessayez quand vous voulez.");
        }
      }).open();
    } catch {
      // Fallback Flutterwave
      try {
        await loadFlutterwave();
        window.FlutterwaveCheckout({
          public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || "",
          tx_ref:     "vitrine-new-" + Date.now(),
          amount: applyPromo(isPack ? PACK_PRICE : SOLO_PRICE, "vitrine").prixFinal, currency: "XOF",
          payment_options: "mobilemoney,card,ussd",
          customer:   { email: form.email || "client@marcheduroi.com", name: form.name },
          customizations: { title:"VitrineWeb MarchéduRoi", description:`Création — ${form.name}`, logo: window.location.origin+"/marcheduRoi-icon.svg" },
          callback(r)  { if (r.status==="successful") handlePaymentSuccess(); else setError("Paiement échoué. Réessayez."); },
          onclose()    {},
        });
      } catch { setError("Module de paiement non chargé. Vérifiez votre connexion."); }
    }
  };

  const inp = {
    width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10,
    padding:"12px 14px", color:T.text, fontSize:14, fontFamily:"Sora,sans-serif",
    outline:"none", boxSizing:"border-box",
  };
  const lbl = { display:"block", color:T.sub, fontSize:12, fontWeight:600, marginBottom:5, marginTop:16 };
  const sec = { fontWeight:700, color:T.text, fontSize:15, margin:"28px 0 4px", paddingBottom:10, borderBottom:`1px solid ${T.border}` };

  if (!authChecked) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:T.bg,fontFamily:"Sora,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40,height:40,border:`4px solid ${T.border}`,borderTop:"4px solid #10B981",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color:T.sub,fontSize:14 }}>Vérification…</p>
      </div>
    </div>
  );

  if (!isLoggedIn) return (
    <div style={{ background:T.bg,minHeight:"100vh",fontFamily:"Sora,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
      <div style={{ maxWidth:420,textAlign:"center" }}>
        <div style={{ fontSize:56,marginBottom:16 }}>🔐</div>
        <h2 style={{ fontSize:22,fontWeight:800,color:T.text,marginBottom:12 }}>Connexion requise</h2>
        <p style={{ color:T.sub,lineHeight:1.75,marginBottom:28,fontSize:15 }}>
          Vous devez être inscrit et connecté à MarchéduRoi pour créer une VitrineWeb.
        </p>
        <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" }}>
          <button onClick={()=>navigate("/")} style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"12px 28px",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer" }}>
            Se connecter
          </button>
          <button onClick={()=>navigate("/")} style={{ background:"transparent",border:`1px solid ${T.border}`,color:T.sub,padding:"12px 28px",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer" }}>
            ← Retour
          </button>
        </div>
        <p style={{ color:T.sub,fontSize:12,marginTop:20 }}>
          Pas encore de compte ? L'inscription est <strong style={{ color:"#10B981" }}>gratuite</strong> sur MarchéduRoi.
        </p>
      </div>
    </div>
  );

  if (done) return (
    <div style={{ background:T.bg,minHeight:"100vh",fontFamily:"Sora,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
      <div style={{ maxWidth:480,textAlign:"center" }}>
        <div style={{ fontSize:64,marginBottom:20 }}>🎉</div>
        <h1 style={{ fontSize:26,fontWeight:800,color:T.text,marginBottom:12 }}>Demande enregistrée !</h1>
        <div style={{ background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:16,padding:24,marginBottom:28 }}>
          <p style={{ color:COLOR,fontWeight:700,fontSize:16,marginBottom:8 }}>✅ Paiement confirmé</p>
          <p style={{ color:"#B8B8CC",lineHeight:1.8,fontSize:15 }}>
            Votre vitrine <strong style={{ color:T.text }}>{form.name}</strong> sera visible sur MarchéduRoi en moins de <strong style={{ color:COLOR }}>3 heures</strong> après validation par notre équipe.
          </p>
          <p style={{ color:T.sub,fontSize:13,marginTop:12 }}>
            Vous recevrez un message WhatsApp avec le lien de votre vitrine dès qu'elle sera en ligne.
          </p>
        </div>
        <button onClick={()=>navigate("/")} style={{ background:`linear-gradient(135deg,${COLOR},#059669)`,border:"none",color:"#fff",padding:"14px 32px",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer" }}>
          ← Retour à MarchéduRoi
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background:T.bg,minHeight:"100vh",fontFamily:"Sora,sans-serif",color:T.text }}>

      {/* Navbar */}
      <div style={{ background:"#0D0F1AEE",borderBottom:"1px solid #2A2D45",padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(8px)" }}>
        <div style={{ cursor:"pointer" }} onClick={()=>navigate("/")}>
          <img src="/marcheduRoi-icon.svg" alt="MarcheduRoi" style={{ height:52,objectFit:"contain" }}/>
        </div>
        <button onClick={()=>navigate("/")} style={{ background:"transparent",border:`1px solid ${T.border}`,color:T.sub,padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>
          ← Retour
        </button>
      </div>

      <div style={{ maxWidth:620,margin:"0 auto",padding:"32px 24px 64px" }}>

        {/* Bandeau exemple */}
        <div style={{ background:"rgba(255,140,0,0.08)",border:"1px solid rgba(255,140,0,0.25)",borderRadius:14,padding:16,marginBottom:28,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
          <div>
            <p style={{ fontWeight:700,color:"#FF8C00",margin:"0 0 4px",fontSize:14 }}>👀 Vous voulez voir à quoi ressemble une vitrine ?</p>
            <p style={{ color:T.sub,fontSize:13,margin:0 }}>Consultez l'exemple de démonstration avant de vous lancer.</p>
          </div>
          <a href="/vitrine/restaurant-chez-tante-rosine-calavi" target="_blank" rel="noopener noreferrer"
            style={{ background:"rgba(255,140,0,0.15)",border:"1px solid rgba(255,140,0,0.4)",color:"#FF8C00",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:13,textDecoration:"none",flexShrink:0,whiteSpace:"nowrap" }}>
            Voir un exemple →
          </a>
        </div>

        {/* En-tête */}
        <div style={{ textAlign:"center",marginBottom:36 }}>
          <div style={{ width:72,height:72,borderRadius:18,background:`linear-gradient(135deg,${COLOR},#059669)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 16px" }}>🏛️</div>
          <h1 style={{ fontSize:26,fontWeight:800,marginBottom:8 }}>Créez votre VitrineWeb</h1>
          <p style={{ color:T.sub,fontSize:15,lineHeight:1.7 }}>Donnez une présence numérique à votre structure sur MarchéduRoi.</p>

          {/* Prix */}
          <div style={{ display:"inline-flex",gap:16,marginTop:16,flexWrap:"wrap",justifyContent:"center" }}>
            <div style={{ background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:12,padding:"10px 20px" }}>
              <p style={{ color:COLOR,fontWeight:800,fontSize:18,margin:0 }}>15 000 FCFA</p>
              <p style={{ color:T.sub,fontSize:12,margin:"2px 0 0" }}>Création (unique)</p>
            </div>
            <div style={{ background:"rgba(108,99,255,0.08)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:12,padding:"10px 20px" }}>
              <p style={{ color:"#6C63FF",fontWeight:800,fontSize:18,margin:0 }}>18 000 FCFA/an</p>
              <p style={{ color:T.sub,fontSize:12,margin:"2px 0 0" }}>Renouvellement annuel</p>
            </div>
          </div>
        </div>

        {/* IDENTITÉ */}
        <p style={sec}>🏛️ Identité de votre structure</p>
        <label style={lbl}>Nom officiel *</label>
        <input style={inp} value={form.name} onChange={e=>handleName(e.target.value)} placeholder="École Sainte-Marie de Cotonou"/>
        {slug && <p style={{ color:T.sub,fontSize:11,marginTop:4 }}>URL : <span style={{ color:COLOR }}>marcheduroi.com/vitrine/{slug}</span></p>}

        <label style={lbl}>Type de structure *</label>
        <select style={{...inp,cursor:"pointer"}} value={TYPES.includes(form.type)?form.type:"Autre"}
          onChange={e=>{ if(e.target.value==="Autre") setForm(f=>({...f,type:""})); else setForm(f=>({...f,type:e.target.value})); }}>
          {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          <option value="Autre">Autre (précisez ci-dessous)</option>
        </select>
        {(!TYPES.includes(form.type)) && (
          <input style={{...inp,marginTop:6}} value={form.type}
            onChange={e=>setForm(f=>({...f,type:e.target.value}))}
            placeholder="Ex: Pharmacie, Agence de voyage, Centre sportif..."
            maxLength={60}
            autoFocus/>
        )}

        <label style={lbl}>Slogan / Mission</label>
        <input style={inp} value={form.slogan} onChange={e=>setForm(f=>({...f,slogan:e.target.value}))} placeholder="Former les leaders de demain"/>

        <label style={lbl}>Description de votre structure</label>
        <textarea style={{...inp,minHeight:90,resize:"vertical"}} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Présentez votre structure en quelques phrases…"/>

        {/* LOCALISATION */}
        <p style={sec}>📍 Localisation</p>

        {/* Bouton GPS */}
        <button type="button" onClick={()=>{
          if (!navigator.geolocation) { setError("GPS non disponible sur cet appareil."); return; }
          navigator.geolocation.getCurrentPosition(
            pos => { setForm(f=>({...f, gps_lat:pos.coords.latitude.toString(), gps_lng:pos.coords.longitude.toString()})); },
            ()  => { setError("Impossible d'accéder au GPS. Vérifiez les permissions du navigateur."); }
          );
        }} style={{ width:"100%",padding:"12px",background:form.gps_lat?"rgba(16,185,129,0.12)":"rgba(255,105,180,0.08)",border:`1px solid ${form.gps_lat?"rgba(16,185,129,0.4)":"rgba(255,105,180,0.3)"}`,borderRadius:10,color:form.gps_lat?"#10B981":"#FF69B4",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
          {form.gps_lat ? "✅ Position GPS capturée !" : "📍 Capturer ma position GPS (fortement recommandé)"}
        </button>
        {!form.gps_lat && <p style={{ color:"#FF8C00",fontSize:11,marginBottom:12,textAlign:"center" }}>⚠️ Sans GPS votre vitrine n'apparaîtra pas dans les résultats "Près de moi"</p>}

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <div>
            <label style={lbl}>Ville *</label>
            <input style={inp} value={form.ville} onChange={e=>setForm(f=>({...f,ville:e.target.value}))} placeholder="Cotonou"/>
          </div>
          <div>
            <label style={lbl}>Quartier</label>
            <input style={inp} value={form.quartier} onChange={e=>setForm(f=>({...f,quartier:e.target.value}))} placeholder="Akpakpa"/>
          </div>
        </div>
        <label style={lbl}>Von (point de repère)</label>
        <input style={inp} value={form.von} onChange={e=>setForm(f=>({...f,von:e.target.value}))} placeholder="Von de la cathédrale"/>

        {/* CONTACTS */}
        <p style={sec}>📞 Contacts</p>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <div>
            <label style={lbl}>Téléphone principal *</label>
            <input style={inp} value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder={getPhonePlaceholder()}/>
          </div>
          <div>
            <label style={lbl}>WhatsApp</label>
            <input style={inp} value={form.whatsapp} onChange={e=>setForm(f=>({...f,whatsapp:e.target.value}))} placeholder={getPhonePlaceholder()}/>
          </div>
          <div>
            <label style={lbl}>Email</label>
            <input style={inp} type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="contact@mastructure.bj"/>
          </div>
          <div>
            <label style={lbl}>Facebook</label>
            <input style={inp} value={form.facebook} onChange={e=>setForm(f=>({...f,facebook:e.target.value}))} placeholder="https://facebook.com/mastructure"/>
          </div>
        </div>

        {/* INFOS PRATIQUES */}
        <p style={sec}>🕐 Infos pratiques</p>
        <label style={lbl}>Horaires d'ouverture</label>
        <textarea style={{...inp,minHeight:70,resize:"vertical"}} value={form.hours} onChange={e=>setForm(f=>({...f,hours:e.target.value}))} placeholder={"Lun–Ven : 7h30–17h00\nSam : 8h00–12h00"}/>
        <label style={lbl}>Services proposés</label>
        <textarea style={{...inp,minHeight:70,resize:"vertical"}} value={form.services} onChange={e=>setForm(f=>({...f,services:e.target.value}))} placeholder="Consultations, urgences 24h/24, maternité…"/>

        {/* MÉDIAS */}
        <p style={sec}>🖼️ Médias <span style={{ color:T.sub,fontSize:12,fontWeight:400 }}>(optionnel — modifiable après)</span></p>
        <SingleUploader
          value={form.logo_url}
          onChange={url=>setForm(f=>({...f,logo_url:url}))}
          label="Logo"
          hint="Format idéal : 400×400px, carré, fond opaque."
          placeholder="https://i.ibb.co/.../logo.png"
          theme={T}
        />
        <SingleUploader
          value={form.cover_url}
          onChange={url=>setForm(f=>({...f,cover_url:url}))}
          label="Photo de couverture"
          hint="Grande bannière en haut de votre vitrine. Format idéal : 1920×600px. Aussi affichée lors du partage WhatsApp."
          placeholder="https://i.ibb.co/.../banniere.jpg"
          theme={T}
        />
        <GalleryUploader
          value={form.photos}
          onChange={val=>setForm(f=>({...f,photos:val}))}
          max={20}
          theme={T}
        />
        <label style={lbl}>Vidéo YouTube (lien)</label>
        <input style={inp} value={form.video} onChange={e=>setForm(f=>({...f,video:e.target.value}))} placeholder="https://www.youtube.com/watch?v=..."/>

        {/* Erreur */}
        {error && (
          <div ref={errorRef} style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:12,padding:14,marginTop:20 }}>
            <p style={{ margin:0,color:"#FF4757",fontWeight:600,fontSize:14 }}>❌ {error}</p>
          </div>
        )}

        {/* Actualités initiales */}
        <p style={sec}>📰 Actualités & Promotions <span style={{ color:T.sub,fontSize:12,fontWeight:400 }}>(optionnel)</span></p>
        <p style={{ color:T.sub,fontSize:13,marginBottom:16,lineHeight:1.6 }}>
          Ajoutez jusqu'à 4 actualités visibles sur votre vitrine dès la mise en ligne : menu du jour, promotion, événement, nouveauté…
        </p>
        {initialNews.map((n, i) => (
          <div key={i} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:14,marginBottom:10 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
              <span style={{ background:`rgba(16,185,129,0.1)`,color:"#10B981",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,flexShrink:0 }}>
                #{i+1}
              </span>
              <input style={{...inp,padding:"8px 12px",fontSize:13}} list={`news-types-${i}`}
                value={n.type} onChange={e=>updateNews(i,"type",e.target.value)}
                placeholder="Type d'actualité…"/>
              <datalist id={`news-types-${i}`}>
                {NEWS_TYPES.map(t=><option key={t} value={t}/>)}
              </datalist>
            </div>
            <input style={{...inp,marginBottom:8}} value={n.title}
              onChange={e=>updateNews(i,"title",e.target.value)}
              placeholder={
                i===0 ? "Ex: Menu du jour — Amiwo sauce graine 1 500 FCFA" :
                i===1 ? "Ex: Promotion — -20% sur toutes les formules" :
                i===2 ? "Ex: Nouvelle spécialité disponible ce week-end" :
                        "Ex: Ouvert le dimanche de 8h à 20h"
              }/>
            <textarea style={{...inp,minHeight:60,resize:"vertical"}} value={n.content}
              onChange={e=>updateNews(i,"content",e.target.value)}
              placeholder="Détails supplémentaires (optionnel)…"/>
          </div>
        ))}

        {/* Récapitulatif + paiement */}
        <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,marginTop:28 }}>
          <p style={{ fontWeight:700,color:T.text,marginBottom:14,fontSize:15 }}>📋 Récapitulatif du paiement</p>
          {isPack && (
            <div style={{ background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.3)",borderRadius:10,padding:12,marginBottom:12 }}>
              <p style={{ color:"#FFD700",fontWeight:700,margin:"0 0 4px",fontSize:13 }}>🎁 Pack Pro + Vitrine</p>
              <p style={{ color:T.sub,fontSize:12,margin:0 }}>Abonnement établissement 360 jours + Vitrine 1 an — Économisez 5 000 FCFA</p>
            </div>
          )}
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
            <span style={{ color:T.sub }}>Création de la vitrine</span>
            <span style={{ fontWeight:700,color:COLOR }}>15 000 FCFA</span>
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:16,paddingBottom:16,borderBottom:"1px solid #2A2D45" }}>
            <span style={{ color:T.sub,fontSize:13 }}>Renouvellement (dans 12 mois)</span>
            <span style={{ color:T.sub,fontSize:13 }}>18 000 FCFA/an</span>
          </div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:16 }}>
            {["MTN Money","Moov Money","Carte bancaire"].map(m=>(
              <span key={m} style={{ background:"rgba(108,99,255,0.08)",border:"1px solid rgba(108,99,255,0.2)",color:T.sub,padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600 }}>{m}</span>
            ))}
          </div>
          <button onClick={launchPayment} disabled={paying}
            style={{ width:"100%",padding:16,background:paying?T.border:`linear-gradient(135deg,${COLOR},#059669)`,border:"none",color:paying?T.sub:"#fff",borderRadius:12,fontWeight:800,fontSize:16,cursor:paying?"not-allowed":"pointer",transition:"all 0.2s" }}>
            {paying ? "Enregistrement…" : isAdmin ? "⚡ Créer la vitrine (Admin — sans paiement)" : (
              <>
                {applyPromo(isPack?PACK_PRICE:SOLO_PRICE,"vitrine").prixOriginal && (
                  <span style={{ textDecoration:"line-through", opacity:0.6, marginRight:6, fontSize:13 }}>
                    {(isPack?PACK_PRICE:SOLO_PRICE).toLocaleString("fr-FR")} F
                  </span>
                )}
                💳 Payer {applyPromo(isPack?PACK_PRICE:SOLO_PRICE,"vitrine").prixFinal.toLocaleString("fr-FR")} FCFA et créer ma vitrine
                {promoLabel("vitrine") && <span style={{ background:"#10B981",color:"#fff",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,marginLeft:8 }}>{promoLabel("vitrine")}</span>}
              </>
            )}
          </button>
          <p style={{ textAlign:"center",color:T.sub,fontSize:11,marginTop:12,lineHeight:1.6 }}>
            Paiement sécurisé · En payant vous acceptez les CGU de MarchéduRoi<br/>
            Votre vitrine sera visible en moins de 3h après validation
          </p>
        </div>

      </div>
    </div>
  );
}


export default VitrineRequest;

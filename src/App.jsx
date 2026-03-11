import { useState, useEffect, useRef } from "react";
import { supabase } from"./supabase";

// ─── Simulated Storage ───────────────────────────────────────────────────────
const INITIAL_POSTS = [
  { id: 1, title: "Villa à louer - Côte d'Azur", category: "Immobilier", description: "Magnifique villa avec piscine, 4 chambres, vue mer. Disponible juillet-août.", author: "Sophie M.", authorId: "u2", price: "3 500€/sem", date: "2026-03-01", likes: 12, contact: "sophie@email.com" },
  { id: 2, title: "iPhone 15 Pro Max - Excellent état", category: "Électronique", description: "Vendu avec boîte originale, chargeur et coque. 256Go, couleur titane naturel.", author: "Karim B.", authorId: "u3", price: "950€", date: "2026-03-05", likes: 8, contact: "karim@email.com" },
  { id: 3, title: "Cours de guitare - Tous niveaux", category: "Services", description: "Professeur diplômé, 10 ans d'expérience. Cours à domicile ou en ligne.", author: "Léa P.", authorId: "u4", price: "40€/h", date: "2026-03-08", likes: 21, contact: "lea@email.com" },
  { id: 4, title: "Vélo électrique Decathlon", category: "Sport", description: "Vélo électrique Rockrider E-ST 900, batterie longue durée, parfait état.", author: "Marc D.", authorId: "u5", price: "1 200€", date: "2026-03-09", likes: 5, contact: "marc@email.com" },
];

const CATEGORIES = ["Toutes", "Immobilier", "Électronique", "Services", "Sport", "Mode", "Autre"];

const PLANS = [
  { id: "monthly", label: "Mensuel", price: "9,99€", period: "/mois", color: "#6C63FF", desc: "Idéal pour commencer" },
  { id: "yearly", label: "Annuel", price: "79€", period: "/an", color: "#FF6584", desc: "2 mois offerts ✨", popular: true },
  { id: "lifetime", label: "À vie", price: "149€", period: " unique", color: "#43C6AC", desc: "Accès illimité pour toujours" },
];

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    plus: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    edit: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    heart: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    search: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    x: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    crown: <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24"><path d="M2 19l3-10 5 5 2-9 2 9 5-5 3 10z"/></svg>,
    user: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    lock: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    mail: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    check: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    tag: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    eye: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    logout: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  };
  return icons[name] || null;
};

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [user, setUser] = useState(null); // null = visiteur
  const [view, setView] = useState("home"); // home | login | register | pricing | dashboard | admin
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [modal, setModal] = useState(null); // null | {type: 'add'|'edit'|'delete'|'contact'|'pay', data?}
  const [notification, setNotification] = useState(null);
  const [likedPosts, setLikedPosts] = useState([]);
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "" });
  const [postForm, setPostForm] = useState({ title: "", category: "Autre", description: "", price: "", contact: "" });
  const nextId = useRef(100);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  const USERS_DB = {
    "admin@app.com": { id: "u1", name: "Admin", role: "admin", isPremium: true, password: "admin123" },
    "user@app.com": { id: "u2", name: "Sophie M.", role: "user", isPremium: true, password: "user123" },
    "free@app.com": { id: "u6", name: "Jean Visiteur", role: "user", isPremium: false, password: "free123" },
  };

  const login = () => {
    const found = USERS_DB[authForm.email];
    if (found && found.password === authForm.password) {
      setUser(found);
      setView("home");
      notify(`Bienvenue, ${found.name} !`);
    } else {
      notify("Email ou mot de passe incorrect", "error");
    }
  };

  const register = () => {
    if (!authForm.name || !authForm.email || !authForm.password) { notify("Remplissez tous les champs", "error"); return; }
    const newUser = { id: "u" + Date.now(), name: authForm.name, role: "user", isPremium: false };
    setUser(newUser);
    setView("pricing");
    notify("Compte créé ! Choisissez votre abonnement.");
  };

  const logout = () => { setUser(null); setView("home"); notify("À bientôt !"); };

  const activatePremium = (plan) => {
    setUser(u => ({ ...u, isPremium: true, plan: plan.label }));
    setModal(null);
    setView("home");
    notify(`🎉 Abonnement ${plan.label} activé ! Vous pouvez maintenant publier.`);
  };

  // ── Posts CRUD ────────────────────────────────────────────────────────────
  const canEdit = user && user.isPremium;

  const addPost = () => {
    if (!postForm.title || !postForm.description) { notify("Titre et description requis", "error"); return; }
    const newPost = { ...postForm, id: nextId.current++, author: user.name, authorId: user.id, date: new Date().toISOString().slice(0, 10), likes: 0 };
    setPosts(p => [newPost, ...p]);
    setModal(null);
    setPostForm({ title: "", category: "Autre", description: "", price: "", contact: "" });
    notify("✅ Annonce publiée avec succès !");
  };

  const editPost = () => {
    setPosts(p => p.map(post => post.id === modal.data.id ? { ...post, ...postForm } : post));
    setModal(null);
    notify("✅ Annonce modifiée !");
  };

  const deletePost = (id) => {
    setPosts(p => p.filter(post => post.id !== id));
    setModal(null);
    notify("🗑️ Annonce supprimée.");
  };

  const likePost = (id) => {
    if (likedPosts.includes(id)) return;
    setLikedPosts(l => [...l, id]);
    setPosts(p => p.map(post => post.id === id ? { ...post, likes: post.likes + 1 } : post));
  };

  const openEdit = (post) => {
    setPostForm({ title: post.title, category: post.category, description: post.description, price: post.price || "", contact: post.contact || "" });
    setModal({ type: "edit", data: post });
  };

  // ── Filtered posts ────────────────────────────────────────────────────────
  const filtered = posts.filter(p => {
    const matchCat = category === "Toutes" || p.category === category;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const myPosts = user ? posts.filter(p => p.authorId === user.id) : [];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0D0F1A", color: "#E8E8F0", fontFamily: "'Sora', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0D0F1A; }
        ::-webkit-scrollbar-thumb { background: #2A2D45; border-radius: 3px; }
        input, textarea, select { outline: none; font-family: inherit; }
        button { cursor: pointer; font-family: inherit; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes notifIn { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
        .card-hover { transition: all 0.25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(108,99,255,0.2) !important; }
        .btn-glow:hover { box-shadow: 0 0 24px rgba(108,99,255,0.5); }
        .tag { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:0.5px; }
      `}</style>

      {/* ── Notification ── */}
      {notification && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:9999,animation:"notifIn 0.3s ease",background: notification.type==="error"?"#FF4757":"#43C6AC",color:"#fff",padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 8px 30px rgba(0,0,0,0.3)" }}>
          {notification.msg}
        </div>
      )}

      {/* ── Navbar ── */}
      <nav style={{ background:"rgba(13,15,26,0.95)",borderBottom:"1px solid #1E2035",padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer" }} onClick={()=>setView("home")}>
          <div style={{ width:32,height:32,background:"linear-gradient(135deg,#6C63FF,#FF6584)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Icon name="tag" size={16}/>
          </div>
          <span style={{ fontWeight:800,fontSize:18,background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>MarketFlow</span>
        </div>

        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          {["home","pricing"].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ background:view===v?"rgba(108,99,255,0.2)":"transparent",border:"none",color:view===v?"#6C63FF":"#9A9AB0",padding:"8px 16px",borderRadius:8,fontWeight:600,fontSize:13,transition:"all 0.2s" }}>
              {v==="home"?"Annonces":"Tarifs"}
            </button>
          ))}
          {user && user.role==="admin" && (
            <button onClick={()=>setView("admin")} style={{ background:view==="admin"?"rgba(255,101,132,0.2)":"transparent",border:"none",color:"#FF6584",padding:"8px 16px",borderRadius:8,fontWeight:600,fontSize:13 }}>Admin</button>
          )}
          {user ? (
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              {user.isPremium && <span style={{ background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#000",padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4 }}><Icon name="crown" size={10}/>PRO</span>}
              <button onClick={()=>setView("dashboard")} style={{ background:"#1A1D30",border:"1px solid #2A2D45",color:"#E8E8F0",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:6 }}><Icon name="user" size={14}/>{user.name.split(" ")[0]}</button>
              <button onClick={logout} style={{ background:"transparent",border:"none",color:"#9A9AB0",padding:"8px",borderRadius:8 }}><Icon name="logout" size={16}/></button>
            </div>
          ) : (
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>setView("login")} style={{ background:"transparent",border:"1px solid #2A2D45",color:"#E8E8F0",padding:"8px 16px",borderRadius:8,fontWeight:600,fontSize:13 }}>Connexion</button>
              <button onClick={()=>setView("register")} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"8px 16px",borderRadius:8,fontWeight:600,fontSize:13,transition:"box-shadow 0.2s" }}>S'inscrire</button>
            </div>
          )}
        </div>
      </nav>

      {/* ════════ HOME ════════ */}
      {view === "home" && (
        <div style={{ maxWidth:1100,margin:"0 auto",padding:"32px 24px",animation:"fadeIn 0.4s ease" }}>
          {/* Hero */}
          <div style={{ textAlign:"center",marginBottom:48 }}>
            <h1 style={{ fontSize:48,fontWeight:800,lineHeight:1.1,marginBottom:16 }}>
              Découvrez des{" "}
              <span style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>annonces uniques</span>
            </h1>
            <p style={{ color:"#9A9AB0",fontSize:17,marginBottom:28 }}>Consultez gratuitement · Publiez avec un abonnement</p>

            {/* Search */}
            <div style={{ maxWidth:520,margin:"0 auto",position:"relative" }}>
              <Icon name="search" size={16}/>
              <div style={{ position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:"#9A9AB0",pointerEvents:"none" }}><Icon name="search" size={16}/></div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une annonce..." style={{ width:"100%",padding:"14px 20px 14px 44px",background:"#1A1D30",border:"1px solid #2A2D45",borderRadius:12,color:"#E8E8F0",fontSize:15 }}/>
            </div>
          </div>

          {/* Categories */}
          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:28,justifyContent:"center" }}>
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setCategory(c)} style={{ background:category===c?"linear-gradient(135deg,#6C63FF,#8B84FF)":"#1A1D30",border:category===c?"none":"1px solid #2A2D45",color:category===c?"#fff":"#9A9AB0",padding:"8px 18px",borderRadius:24,fontWeight:600,fontSize:13,transition:"all 0.2s" }}>{c}</button>
            ))}
          </div>

          {/* Add button for premium */}
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
            <p style={{ color:"#9A9AB0",fontSize:14 }}>{filtered.length} annonce{filtered.length!==1?"s":""}</p>
            {canEdit ? (
              <button onClick={()=>{ setPostForm({ title:"",category:"Autre",description:"",price:"",contact:"" }); setModal({type:"add"}); }} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,transition:"box-shadow 0.2s" }}>
                <Icon name="plus" size={16}/>Publier une annonce
              </button>
            ) : (
              <button onClick={()=>user?setView("pricing"):setView("register")} style={{ background:"#1A1D30",border:"1px dashed #6C63FF",color:"#6C63FF",padding:"10px 20px",borderRadius:10,fontWeight:600,fontSize:14,display:"flex",alignItems:"center",gap:8 }}>
                <Icon name="lock" size={14}/>{user?"Passer PRO pour publier":"Créer un compte"}
              </button>
            )}
          </div>

          {/* Posts Grid */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20 }}>
            {filtered.map(post=>(
              <div key={post.id} className="card-hover" style={{ background:"#1A1D30",border:"1px solid #2A2D45",borderRadius:16,padding:24,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",animation:"fadeIn 0.4s ease" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                  <span className="tag" style={{ background:"rgba(108,99,255,0.15)",color:"#8B84FF" }}>{post.category}</span>
                  {post.price && <span style={{ fontWeight:700,color:"#43C6AC",fontSize:15 }}>{post.price}</span>}
                </div>
                <h3 style={{ fontWeight:700,fontSize:16,marginBottom:8,lineHeight:1.3 }}>{post.title}</h3>
                <p style={{ color:"#9A9AB0",fontSize:13,lineHeight:1.5,marginBottom:16 }}>{post.description.length>100?post.description.slice(0,100)+"...":post.description}</p>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#FF6584)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700 }}>{post.author[0]}</div>
                    <div>
                      <p style={{ fontSize:12,fontWeight:600 }}>{post.author}</p>
                      <p style={{ fontSize:11,color:"#9A9AB0" }}>{post.date}</p>
                    </div>
                  </div>
                  <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                    <button onClick={()=>likePost(post.id)} style={{ background:likedPosts.includes(post.id)?"rgba(255,101,132,0.2)":"transparent",border:"none",color:likedPosts.includes(post.id)?"#FF6584":"#9A9AB0",display:"flex",alignItems:"center",gap:4,padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600 }}><Icon name="heart" size={13}/>{post.likes}</button>
                    <button onClick={()=>setModal({type:"contact",data:post})} style={{ background:"rgba(67,198,172,0.1)",border:"none",color:"#43C6AC",padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}><Icon name="mail" size={13}/>Contact</button>
                    {(user && (user.id===post.authorId||user.role==="admin")) && canEdit && (
                      <>
                        <button onClick={()=>openEdit(post)} style={{ background:"transparent",border:"none",color:"#6C63FF",padding:6,borderRadius:6 }}><Icon name="edit" size={14}/></button>
                        <button onClick={()=>setModal({type:"delete",data:post})} style={{ background:"transparent",border:"none",color:"#FF4757",padding:6,borderRadius:6 }}><Icon name="trash" size={14}/></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length===0 && <div style={{ textAlign:"center",padding:"60px 0",color:"#9A9AB0" }}><p style={{ fontSize:40,marginBottom:12 }}>🔍</p><p>Aucune annonce trouvée</p></div>}
        </div>
      )}

      {/* ════════ PRICING ════════ */}
      {view === "pricing" && (
        <div style={{ maxWidth:900,margin:"0 auto",padding:"48px 24px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ textAlign:"center",marginBottom:48 }}>
            <h2 style={{ fontSize:40,fontWeight:800,marginBottom:12 }}>Choisissez votre <span style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>formule</span></h2>
            <p style={{ color:"#9A9AB0",fontSize:16 }}>Lecture gratuite · Publiez, modifiez, supprimez avec un abonnement</p>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }}>
            {PLANS.map(plan=>(
              <div key={plan.id} className="card-hover" style={{ background:"#1A1D30",border:`2px solid ${plan.popular?"#6C63FF":"#2A2D45"}`,borderRadius:20,padding:32,position:"relative",boxShadow:plan.popular?"0 0 40px rgba(108,99,255,0.15)":"none" }}>
                {plan.popular && <div style={{ position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",color:"#fff",padding:"4px 16px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap" }}>⭐ POPULAIRE</div>}
                <div style={{ width:48,height:48,borderRadius:14,background:`${plan.color}22`,border:`1px solid ${plan.color}44`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,color:plan.color }}>
                  <Icon name="crown" size={20}/>
                </div>
                <h3 style={{ fontWeight:700,fontSize:20,marginBottom:4 }}>{plan.label}</h3>
                <p style={{ color:"#9A9AB0",fontSize:13,marginBottom:24 }}>{plan.desc}</p>
                <div style={{ marginBottom:28 }}>
                  <span style={{ fontSize:36,fontWeight:800,color:plan.color }}>{plan.price}</span>
                  <span style={{ color:"#9A9AB0",fontSize:14 }}>{plan.period}</span>
                </div>
                {["Publier des annonces","Modifier vos annonces","Supprimer vos annonces","Contact visible","Badge PRO"].map(f=>(
                  <div key={f} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10,fontSize:13,color:"#C8C8D8" }}>
                    <span style={{ color:"#43C6AC" }}><Icon name="check" size={14}/></span>{f}
                  </div>
                ))}
                <button onClick={()=>user?activatePremium(plan):setView("register")} className="btn-glow" style={{ width:"100%",marginTop:24,padding:"14px",background:`linear-gradient(135deg,${plan.color},${plan.color}BB)`,border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
                  {user?"Choisir ce plan":"S'inscrire d'abord"}
                </button>
              </div>
            ))}
          </div>
          <p style={{ textAlign:"center",color:"#9A9AB0",fontSize:13,marginTop:32 }}>✨ Lecture et contact des annonces toujours gratuits · Paiement sécurisé simulé</p>
        </div>
      )}

      {/* ════════ DASHBOARD ════════ */}
      {view === "dashboard" && user && (
        <div style={{ maxWidth:800,margin:"0 auto",padding:"32px 24px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ background:"#1A1D30",border:"1px solid #2A2D45",borderRadius:20,padding:32,marginBottom:24 }}>
            <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:20 }}>
              <div style={{ width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#FF6584)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:800 }}>{user.name[0]}</div>
              <div>
                <h2 style={{ fontWeight:800,fontSize:22 }}>{user.name}</h2>
                <div style={{ display:"flex",gap:8,marginTop:4 }}>
                  {user.isPremium ? <span className="tag" style={{ background:"rgba(255,215,0,0.15)",color:"#FFD700" }}><Icon name="crown" size={10}/>PRO · {user.plan}</span> : <span className="tag" style={{ background:"rgba(154,154,176,0.15)",color:"#9A9AB0" }}><Icon name="eye" size={10}/>Visiteur</span>}
                  {user.role==="admin" && <span className="tag" style={{ background:"rgba(255,101,132,0.15)",color:"#FF6584" }}>Admin</span>}
                </div>
              </div>
            </div>
            {!user.isPremium && (
              <button onClick={()=>setView("pricing")} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"12px 24px",borderRadius:12,fontWeight:700,fontSize:14,transition:"box-shadow 0.2s" }}>
                🚀 Passer à l'abonnement PRO
              </button>
            )}
          </div>
          <h3 style={{ fontWeight:700,fontSize:18,marginBottom:16 }}>Mes annonces ({myPosts.length})</h3>
          {myPosts.length===0 ? (
            <div style={{ textAlign:"center",padding:"40px",background:"#1A1D30",borderRadius:16,border:"1px dashed #2A2D45",color:"#9A9AB0" }}>
              {canEdit ? <><p style={{ fontSize:32,marginBottom:8 }}>📝</p><p>Aucune annonce publiée</p><button onClick={()=>{ setView("home"); setModal({type:"add"}); }} style={{ marginTop:16,background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:600,cursor:"pointer" }}>Créer ma première annonce</button></> : <><p>Passez PRO pour publier des annonces</p><button onClick={()=>setView("pricing")} style={{ marginTop:12,background:"#6C63FF",border:"none",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:600,cursor:"pointer" }}>Voir les tarifs</button></>}
            </div>
          ) : myPosts.map(post=>(
            <div key={post.id} style={{ background:"#1A1D30",border:"1px solid #2A2D45",borderRadius:14,padding:20,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <p style={{ fontWeight:700,marginBottom:4 }}>{post.title}</p>
                <div style={{ display:"flex",gap:8 }}>
                  <span className="tag" style={{ background:"rgba(108,99,255,0.15)",color:"#8B84FF" }}>{post.category}</span>
                  <span style={{ color:"#9A9AB0",fontSize:12 }}>{post.likes} ♥ · {post.date}</span>
                </div>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={()=>openEdit(post)} style={{ background:"rgba(108,99,255,0.15)",border:"none",color:"#6C63FF",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:4 }}><Icon name="edit" size={13}/>Modifier</button>
                <button onClick={()=>setModal({type:"delete",data:post})} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:4 }}><Icon name="trash" size={13}/>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════ ADMIN ════════ */}
      {view === "admin" && user?.role === "admin" && (
        <div style={{ maxWidth:900,margin:"0 auto",padding:"32px 24px",animation:"fadeIn 0.4s ease" }}>
          <h2 style={{ fontWeight:800,fontSize:28,marginBottom:8 }}>🛡️ Panneau Admin</h2>
          <p style={{ color:"#9A9AB0",marginBottom:28 }}>Gérer toutes les annonces de la plateforme</p>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:32 }}>
            {[{label:"Total annonces",val:posts.length,color:"#6C63FF"},{label:"Annonces aujourd'hui",val:posts.filter(p=>p.date===new Date().toISOString().slice(0,10)).length,color:"#43C6AC"},{label:"Total likes",val:posts.reduce((a,p)=>a+p.likes,0),color:"#FF6584"}].map(s=>(
              <div key={s.label} style={{ background:"#1A1D30",border:"1px solid #2A2D45",borderRadius:14,padding:20,textAlign:"center" }}>
                <p style={{ fontSize:36,fontWeight:800,color:s.color }}>{s.val}</p>
                <p style={{ color:"#9A9AB0",fontSize:13 }}>{s.label}</p>
              </div>
            ))}
          </div>
          {posts.map(post=>(
            <div key={post.id} style={{ background:"#1A1D30",border:"1px solid #2A2D45",borderRadius:12,padding:16,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <p style={{ fontWeight:700,fontSize:15 }}>{post.title}</p>
                <p style={{ color:"#9A9AB0",fontSize:12 }}>Par {post.author} · {post.category} · {post.date}</p>
              </div>
              <button onClick={()=>setModal({type:"delete",data:post})} style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757",padding:"8px 16px",borderRadius:8,fontWeight:600,fontSize:13 }}>Supprimer</button>
            </div>
          ))}
        </div>
      )}

      {/* ════════ LOGIN ════════ */}
      {view === "login" && (
        <div style={{ maxWidth:420,margin:"60px auto",padding:"0 24px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ background:"#1A1D30",border:"1px solid #2A2D45",borderRadius:20,padding:36 }}>
            <h2 style={{ fontWeight:800,fontSize:26,marginBottom:6 }}>Connexion</h2>
            <p style={{ color:"#9A9AB0",fontSize:13,marginBottom:28 }}>Essayez: user@app.com / user123</p>
            {[{label:"Email",key:"email",type:"email"},{label:"Mot de passe",key:"password",type:"password"}].map(f=>(
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={{ fontSize:13,fontWeight:600,color:"#9A9AB0",display:"block",marginBottom:6 }}>{f.label}</label>
                <input type={f.type} value={authForm[f.key]} onChange={e=>setAuthForm(a=>({...a,[f.key]:e.target.value}))} style={{ width:"100%",padding:"12px 16px",background:"#0D0F1A",border:"1px solid #2A2D45",borderRadius:10,color:"#E8E8F0",fontSize:14 }}/>
              </div>
            ))}
            <button onClick={login} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,marginTop:8,transition:"box-shadow 0.2s" }}>Se connecter</button>
            <p style={{ textAlign:"center",marginTop:20,color:"#9A9AB0",fontSize:13 }}>Pas de compte ? <button onClick={()=>setView("register")} style={{ background:"none",border:"none",color:"#6C63FF",fontWeight:600,cursor:"pointer" }}>S'inscrire</button></p>
          </div>
        </div>
      )}

      {/* ════════ REGISTER ════════ */}
      {view === "register" && (
        <div style={{ maxWidth:420,margin:"60px auto",padding:"0 24px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ background:"#1A1D30",border:"1px solid #2A2D45",borderRadius:20,padding:36 }}>
            <h2 style={{ fontWeight:800,fontSize:26,marginBottom:6 }}>Créer un compte</h2>
            <p style={{ color:"#9A9AB0",fontSize:13,marginBottom:28 }}>Lecture toujours gratuite</p>
            {[{label:"Nom complet",key:"name",type:"text"},{label:"Email",key:"email",type:"email"},{label:"Mot de passe",key:"password",type:"password"}].map(f=>(
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={{ fontSize:13,fontWeight:600,color:"#9A9AB0",display:"block",marginBottom:6 }}>{f.label}</label>
                <input type={f.type} value={authForm[f.key]} onChange={e=>setAuthForm(a=>({...a,[f.key]:e.target.value}))} style={{ width:"100%",padding:"12px 16px",background:"#0D0F1A",border:"1px solid #2A2D45",borderRadius:10,color:"#E8E8F0",fontSize:14 }}/>
              </div>
            ))}
            <button onClick={register} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,marginTop:8,transition:"box-shadow 0.2s" }}>Créer mon compte</button>
            <p style={{ textAlign:"center",marginTop:20,color:"#9A9AB0",fontSize:13 }}>Déjà inscrit ? <button onClick={()=>setView("login")} style={{ background:"none",border:"none",color:"#6C63FF",fontWeight:600,cursor:"pointer" }}>Se connecter</button></p>
          </div>
        </div>
      )}

      {/* ════════ MODALS ════════ */}
      {modal && (
        <div onClick={e=>{if(e.target===e.currentTarget)setModal(null)}} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24,backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#1A1D30",border:"1px solid #2A2D45",borderRadius:20,padding:32,width:"100%",maxWidth:480,animation:"fadeIn 0.25s ease",maxHeight:"90vh",overflowY:"auto" }}>

            {/* Add / Edit Form */}
            {(modal.type==="add"||modal.type==="edit") && (
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
                  <h3 style={{ fontWeight:800,fontSize:20 }}>{modal.type==="add"?"📝 Nouvelle annonce":"✏️ Modifier l'annonce"}</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:"#9A9AB0",padding:4 }}><Icon name="x" size={20}/></button>
                </div>
                {[{label:"Titre",key:"title",type:"input"},{label:"Description",key:"description",type:"textarea"},{label:"Prix (optionnel)",key:"price",type:"input"},{label:"Contact email",key:"contact",type:"input"}].map(f=>(
                  <div key={f.key} style={{ marginBottom:16 }}>
                    <label style={{ fontSize:13,fontWeight:600,color:"#9A9AB0",display:"block",marginBottom:6 }}>{f.label}</label>
                    {f.type==="textarea" ? (
                      <textarea value={postForm[f.key]} onChange={e=>setPostForm(p=>({...p,[f.key]:e.target.value}))} rows={3} style={{ width:"100%",padding:"12px 16px",background:"#0D0F1A",border:"1px solid #2A2D45",borderRadius:10,color:"#E8E8F0",fontSize:14,resize:"vertical" }}/>
                    ) : (
                      <input value={postForm[f.key]} onChange={e=>setPostForm(p=>({...p,[f.key]:e.target.value}))} style={{ width:"100%",padding:"12px 16px",background:"#0D0F1A",border:"1px solid #2A2D45",borderRadius:10,color:"#E8E8F0",fontSize:14 }}/>
                    )}
                  </div>
                ))}
                <div style={{ marginBottom:24 }}>
                  <label style={{ fontSize:13,fontWeight:600,color:"#9A9AB0",display:"block",marginBottom:6 }}>Catégorie</label>
                  <select value={postForm.category} onChange={e=>setPostForm(p=>({...p,category:e.target.value}))} style={{ width:"100%",padding:"12px 16px",background:"#0D0F1A",border:"1px solid #2A2D45",borderRadius:10,color:"#E8E8F0",fontSize:14 }}>
                    {CATEGORIES.filter(c=>c!=="Toutes").map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={modal.type==="add"?addPost:editPost} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
                  {modal.type==="add"?"Publier l'annonce":"Enregistrer les modifications"}
                </button>
              </>
            )}

            {/* Delete confirm */}
            {modal.type==="delete" && (
              <>
                <div style={{ textAlign:"center",marginBottom:24 }}>
                  <div style={{ fontSize:48,marginBottom:12 }}>🗑️</div>
                  <h3 style={{ fontWeight:800,fontSize:20,marginBottom:8 }}>Supprimer cette annonce ?</h3>
                  <p style={{ color:"#9A9AB0",fontSize:14 }}>"{modal.data.title}" sera définitivement supprimée.</p>
                </div>
                <div style={{ display:"flex",gap:12 }}>
                  <button onClick={()=>setModal(null)} style={{ flex:1,padding:"12px",background:"transparent",border:"1px solid #2A2D45",color:"#E8E8F0",borderRadius:12,fontWeight:600,fontSize:14 }}>Annuler</button>
                  <button onClick={()=>deletePost(modal.data.id)} style={{ flex:1,padding:"12px",background:"linear-gradient(135deg,#FF4757,#FF6584)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:14 }}>Supprimer</button>
                </div>
              </>
            )}

            {/* Contact */}
            {modal.type==="contact" && (
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                  <h3 style={{ fontWeight:800,fontSize:20 }}>💬 Contacter le vendeur</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:"#9A9AB0" }}><Icon name="x" size={20}/></button>
                </div>
                <div style={{ background:"#0D0F1A",borderRadius:12,padding:20,marginBottom:20 }}>
                  <p style={{ fontWeight:700,marginBottom:4 }}>{modal.data.title}</p>
                  <p style={{ color:"#9A9AB0",fontSize:13 }}>Publié par {modal.data.author}</p>
                </div>
                {modal.data.contact ? (
                  <div style={{ background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.3)",borderRadius:12,padding:20,textAlign:"center" }}>
                    <Icon name="mail" size={24}/>
                    <p style={{ fontWeight:700,fontSize:16,marginTop:8 }}>{modal.data.contact}</p>
                    <p style={{ color:"#9A9AB0",fontSize:12,marginTop:4 }}>Envoyez un email directement</p>
                  </div>
                ) : (
                  <p style={{ textAlign:"center",color:"#9A9AB0" }}>Aucun contact renseigné</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import CertifiedBadge from "./CertifiedBadge";
import Icon from "./Icon";
import VideoCardPlayer from "./VideoCardPlayer";

export default function ShopSection({ view, theme, boutiques, ateliers, restos, beaute,
  setBoutiques, setAteliers, setRestos, setBeaute,
  navigate, windowWidth, t, setView, setModal, user,
  featuredPosts, isCertified, notify, cardStyle }) {

  return (
    <>
      {view==="boutiques"&&(
        <div className="page-content" style={{ width:"100%",padding:"32px 24px",animation:"fadeIn 0.4s ease" }}>
          {/* Carousel urgent établissements */}
          <EstablishmentUrgentBanner boutiques={boutiques} ateliers={ateliers} restos={restos} beaute={beaute} theme={theme} navigate={navigate} windowWidth={windowWidth} sessionSeed={sessionSeed}/>
          <div style={{ textAlign:"center",marginBottom:40 }}>
            <h1 className="section-title" style={{ fontSize:46,fontWeight:800,marginBottom:12,color:theme.text }}>🛍️ <span style={{ background:"linear-gradient(135deg,#FF6584,#FFB347)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Boutiques</span></h1>
            <p style={{ color:theme.sub,fontSize:16,marginBottom:20 }}>Découvrez les boutiques près de chez vous · Cliquez sur Publier ma boutique</p>
            <div style={{ maxWidth:500,margin:"0 auto",position:"relative" }}>
              <div style={{ position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:theme.sub,pointerEvents:"none" }}><Icon name="search" size={16}/></div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une boutique par nom, type, mots clés..." style={{ width:"100%",padding:"14px 20px 14px 44px",background:theme.card,border:`1px solid ${theme.border}`,borderRadius:12,color:theme.text,fontSize:14,fontFamily:"inherit",outline:"none" }}/>
            </div>
          </div>
          {/* Filtres rapides par type */}
          <div style={{ display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",marginBottom:12,paddingBottom:4 }}>
            {["Tous",...BOUTIQUE_TYPES].map(t=>(
              <button key={t} onClick={()=>setSearch(t==="Tous"?"":t)}
                style={{ flexShrink:0,background:search===t||(!search&&t==="Tous")?"#FF6584":"rgba(255,101,132,0.08)",border:`1px solid ${search===t||(!search&&t==="Tous")?"#FF6584":"rgba(255,101,132,0.25)"}`,color:search===t||(!search&&t==="Tous")?"#fff":"#FF6584",padding:"5px 12px",borderRadius:18,fontWeight:700,fontSize:11,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s" }}>
                {t}
              </button>
            ))}
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:10 }}>
            <button onClick={getUserLocation} style={{ background:userLocation?"rgba(67,198,172,0.15)":"rgba(108,99,255,0.1)",border:`1px solid ${userLocation?"rgba(67,198,172,0.5)":"rgba(108,99,255,0.3)"}`,color:userLocation?"#43C6AC":"#6C63FF",padding:"8px 16px",borderRadius:24,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
              {locationLoading?"⏳...":userLocation?"📍 Position active":"📍 Près de moi"}
            </button>
            {canEdit ? (
              <button onClick={()=>{ setShopMode("boutique"); setShopForm({name:"",type:"",description:"",services:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:getPhonePrefix()}); setShopPhotos([]); setShopVideo(null); setMonths(1); setModal({type:"addshop"}); }} className="btn-glow" style={{ background:"linear-gradient(135deg,#FF6584,#FFB347)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,transition:"box-shadow 0.2s" }}>
                <Icon name="plus" size={16}/>Publier ma boutique
              </button>
            ) : (
              <button onClick={()=>setView("register")} style={{ ...cardStyle,border:"1px dashed #FF6584",color:"#FF6584",padding:"10px 20px",borderRadius:10,fontWeight:600,fontSize:14,display:"flex",alignItems:"center",gap:8 }}>
                <Icon name="lock" size={14}/>Créer un compte pour publier
              </button>
            )}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:gridCols,gap:16,width:"100%",alignItems:"start" }}>
            {boutiques.filter(b=>!search||normalizeText(b.name+b.description+(b.keywords||"")+(b.type||"")+(b.sousType||"")).includes(normalizeText(search)))
            .map(b=>({...b, distance: userLocation&&b.lat&&b.lng ? getDistance(userLocation.lat,userLocation.lng,parseFloat(b.lat),parseFloat(b.lng)) : null}))
            .sort((a,b)=>{
              if(featuredPosts.includes(a.id)&&!featuredPosts.includes(b.id)) return -1;
              if(!featuredPosts.includes(a.id)&&featuredPosts.includes(b.id)) return 1;
              if(a.sponsored&&!b.sponsored) return -1;
              if(!a.sponsored&&b.sponsored) return 1;
              if(sortByDistance){ if(a.distance===null) return 1; if(b.distance===null) return -1; return a.distance-b.distance; }
              return 0;
            }).slice(0,visibleBeaute)
            .map(b=>(
              <div key={b.id} onClick={()=>{ sessionStorage.setItem("mdr_scroll_pos",String(window.scrollY)); sessionStorage.setItem("mdr_back_view","boutiques"); navigate("/boutique/"+b.id, { state:{ fromView:"boutiques", scrollPos:window.scrollY } }); }} className={`card-hover${b.sponsored?" card-sponsored":""}`} style={{ ...cardStyle,borderRadius:16,overflow:"hidden",boxShadow:featuredPosts.includes(b.id)?"0 4px 24px rgba(255,215,0,0.4)":"none",border:featuredPosts.includes(b.id)?"2px solid #FFD700":b.sponsored?"2px solid #FFD700":`1px solid ${theme.border}`,cursor:"pointer" }}>
                <div style={{ position:"relative" }}>
                  {b.video && <VideoCardPlayer video={b.video?.url||b.video} photos={b.photos||[]} maxSeconds={120} autoPlay={windowWidth<=600}/>}
                  {!b.video && b.photos&&b.photos.length>0 && (
                    <div style={{ width:"100%",aspectRatio:"4/3",overflow:"hidden",background:"#1a1d30",position:"relative" }}>
                      <img src={b.photos[0]} alt={b.name} style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}
                        onError={e=>{ e.target.style.display="none"; }}/>
                      {b.photos.length>1 && <span style={{ position:"absolute",bottom:6,right:8,background:"rgba(0,0,0,0.55)",color:"#fff",borderRadius:10,padding:"2px 8px",fontSize:11,fontWeight:700 }}>+{b.photos.length-1}</span>}
                    </div>
                  )}
                  {isCertified(b.authorId) && (
                    <div style={{ position:"absolute",bottom:8,right:8 }}>
                      <CertifiedBadge size={52}/>
                    </div>
                  )}
                </div>
                <div style={{ padding:20 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                    <span className="tag" style={{ background:"rgba(255,101,132,0.15)",color:"#FF6584" }}>🛍️ {b.sousType||b.type}</span>
                  </div>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:6 }}>
                    {b.sponsored && <span style={{ background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#000",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:800 }}>🌟 Sponsorisé</span>}
                    {featuredPosts.includes(b.id) && <span style={{ background:"rgba(255,215,0,0.15)",border:"1px solid #FFD700",color:"#FFD700",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700 }}>🏆 En vedette</span>}
                  </div>
                  <h3 style={{ fontWeight:800,fontSize:17,marginBottom:6,color:theme.text }}>{b.name}</h3>
                  {b.distance!==null && <div style={{ display:"inline-flex",alignItems:"center",gap:4,background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.3)",borderRadius:20,padding:"3px 10px",marginBottom:8,fontSize:11,color:"#43C6AC",fontWeight:700 }}>📍 {formatDistance(b.distance)}</div>}
                  {getAvgRating(b.id) && <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}><div style={{ display:"flex" }}>{renderStars(getAvgRating(b.id))}</div><span style={{ fontSize:12,color:"#FFD700",fontWeight:700 }}>{getAvgRating(b.id)}</span><span style={{ fontSize:11,color:theme.sub }}>({getRatingCount(b.id)} avis)</span></div>}
                  <p style={{ color:theme.sub,fontSize:13,lineHeight:1.5,marginBottom:12 }}>{b.description.length>100?b.description.slice(0,100)+"...":b.description}</p>
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:12 }}>
                    <Icon name="pin" size={13}/>
                    <p style={{ fontSize:12,color:theme.sub }}>{b.ville}{b.quartier?`, ${b.quartier}`:""}{b.von?` · ${b.von}`:""}</p>
                  </div>
                  {b.horaires && <p style={{ fontSize:12,color:"#43C6AC",marginBottom:12 }}>🕐 {b.horaires}</p>}
                  {b.author && <p style={{ fontSize:12,color:theme.sub,marginBottom:10 }}>👤 {b.author}</p>}
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap",alignItems:"center" }}>
                    <button onClick={()=>likePost(b.id)} style={{ background:"transparent",border:"none",color:likedPosts.includes(b.id)?"#FF6584":theme.sub,display:"flex",alignItems:"center",gap:4,padding:"6px 8px",borderRadius:8,fontSize:12,fontWeight:600 }}><Icon name="heart" size={13}/>{b.likes}</button>
                    <button onClick={()=>setModal({type:"contact",data:{...b,title:b.name}})} style={{ background:"rgba(67,198,172,0.1)",border:"none",color:"#43C6AC",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}><Icon name="phone" size={13}/>Contact</button>
                    {b.phone && <a href={"tel:"+b.phone} style={{ textDecoration:"none" }}><div style={{ background:"rgba(67,198,172,0.1)",color:"#43C6AC",padding:"6px 8px",borderRadius:8,fontSize:12,display:"flex",alignItems:"center",cursor:"pointer" }} title="Appeler">📞</div></a>}
                    {b.lat && b.lng && <a href={"https://www.google.com/maps/dir/?api=1&destination="+b.lat+","+b.lng} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}><div style={{ background:"rgba(66,133,244,0.1)",color:"#4285F4",padding:"6px 8px",borderRadius:8,fontSize:12,display:"flex",alignItems:"center",cursor:"pointer" }} title="Itinéraire Google Maps">🗺️</div></a>}
                    <button onClick={()=>{ navigator.clipboard.writeText("https://marcheduroi.com/boutique/"+b.id); notify("Lien copié ! 📋"); }} style={{ background:"transparent",border:"none",color:theme.sub,padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Copier le lien">🔗</button>
                    <button onClick={()=>{ const shareUrl="https://marcheduroi.com/boutique/"+b.id; if(navigator.share){ navigator.share({ title:b.name, text:"*"+b.name+"*\nVoir la boutique: "+shareUrl+"\n\"Sur MarchéduRoi, vous êtes le Roi du Marché 👑\"", url:shareUrl }); } else { navigator.clipboard.writeText(shareUrl); notify("Lien copié ! 📋"); } }} style={{ background:"rgba(0,0,0,0.06)",border:"none",color:theme.text,padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:3 }} title="Partager"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
                    {b.phone&&user?.id!==b.authorId&&<a href={"https://wa.me/"+b.phone.replace(/[\s+()-]/g,"")+"?text="+encodeURIComponent("Bonjour! je suis intéressé(e) par votre boutique *"+b.name+"*\nLien: https://marcheduroi.com/boutique/"+b.id+"\nSur MarchéduRoi, vous êtes le Roi du Marché 👑")} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}><div style={{ background:"rgba(37,211,102,0.15)",color:"#25D366",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:4,cursor:"pointer" }} title="Contacter sur WhatsApp"><svg width="13" height="13" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>WA</div></a>}
                    <a href={"https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent("https://marcheduroi.com/boutique/"+b.id)} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(24,119,242,0.1)",color:"#1877F2",padding:"6px 8px",borderRadius:8,fontSize:12,display:"flex",alignItems:"center",cursor:"pointer" }}>
                        <svg width="13" height="13" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </div>
                    </a>
                    {user&&user.id!==b.authorId&&<button onClick={()=>{ setActiveConv({postId:b.id,postTitle:b.name,postPrice:b.tarifs||"",postPhoto:b.photos?.[0],receiverId:b.authorId,receiverName:b.author,messages:messages.filter(m=>(m.post_id===b.id)&&((m.sender_id===user.id&&m.receiver_id===b.authorId)||(m.receiver_id===user.id&&m.sender_id===b.authorId)))}); setShowMessages(true); }} style={{ background:"rgba(108,99,255,0.1)",border:"none",color:"#6C63FF",padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Message">💬</button>}
                    <button onClick={()=>setModal({type:"report",data:{...b,title:b.name}})} style={{ background:"transparent",border:"none",color:theme.sub,padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Signaler">🚩</button>
                    {user&&(user.id===b.authorId||user.role==="admin")&&(
                      <>
                        {!(b.urgent&&new Date(b.urgentUntil)>new Date()) && (user.role==="admin" || !b.sponsored) && <button onClick={()=>setModal({type:"urgentShop",data:{...b,title:b.name},shopTable:"boutiques",shopSetter:"setBoutiques"})} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }}>🔥</button>}
                        {b.urgent&&new Date(b.urgentUntil)>new Date()&&<button onClick={()=>removeUrgentShop(b.id,"boutiques",setBoutiques)} style={{ background:"rgba(255,71,87,0.15)",border:"1px solid #FF4757",color:"#FF4757",padding:"6px 8px",borderRadius:8,fontSize:11,cursor:"pointer" }}>✕🔥</button>}
                        <button onClick={e=>{e.stopPropagation();setModal({type:"addPromo",data:b,shopType:"boutique"});}} style={{ background:"rgba(255,140,0,0.1)",border:"none",color:"#FF8C00",padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Publier une Promo">📣</button>
                        <button onClick={e=>{e.stopPropagation();openEditShop(b,"boutique",editShop);}} style={{ background:"rgba(108,99,255,0.15)",border:"none",color:"#6C63FF",padding:"6px 8px",borderRadius:8,cursor:"pointer" }}><Icon name="edit" size={14}/></button>
                        <button onClick={e=>{e.stopPropagation();setModal({type:"deleteshop",data:b,shopType:"boutique"});}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"6px 8px",borderRadius:8,cursor:"pointer" }}><Icon name="trash" size={14}/></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {boutiques.length===0&&<div style={{ textAlign:"center",padding:"60px 0",color:theme.sub }}><p style={{ fontSize:40 }}>🛍️</p><p>Aucune boutique pour le moment</p></div>}
          {boutiques.length > visibleBoutiques && <div style={{ textAlign:"center",marginTop:24 }}><button onClick={()=>setVisibleBoutiques(v=>v+12)} style={{ background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.3)",color:"#FF6584",padding:"10px 28px",borderRadius:20,fontWeight:700,fontSize:14,cursor:"pointer" }}>Voir plus ({boutiques.length - visibleBoutiques} restants)</button></div>}
        </div>
      )}

      {/* ATELIERS */}
      {view==="ateliers"&&(
        <div style={{ width:"100%",padding:"16px 12px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ textAlign:"center",marginBottom:40 }}>
            <h1 style={{ fontSize:46,fontWeight:800,marginBottom:12,color:theme.text }}>🔧 <span style={{ background:"linear-gradient(135deg,#43C6AC,#6C63FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Ateliers</span></h1>
            <p style={{ color:theme.sub,fontSize:16,marginBottom:20 }}>Trouvez l'artisan qu'il vous faut · Cliquez sur Publier mon atelier</p>
            <div style={{ maxWidth:500,margin:"0 auto",position:"relative" }}>
              <div style={{ position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:theme.sub,pointerEvents:"none" }}><Icon name="search" size={16}/></div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un atelier par nom, type, services..." style={{ width:"100%",padding:"14px 20px 14px 44px",background:theme.card,border:`1px solid ${theme.border}`,borderRadius:12,color:theme.text,fontSize:14,fontFamily:"inherit",outline:"none" }}/>
            </div>
          </div>
          <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:24 }}>
            {canEdit ? (
              <button onClick={()=>{ setShopMode("atelier"); setShopForm({name:"",type:"",description:"",services:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:getPhonePrefix()}); setShopPhotos([]); setShopVideo(null); setMonths(1); setModal({type:"addshop"}); }} className="btn-glow" style={{ background:"linear-gradient(135deg,#43C6AC,#6C63FF)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,transition:"box-shadow 0.2s" }}>
                <Icon name="plus" size={16}/>Publier mon atelier
              </button>
            ) : (
              <button onClick={()=>setView("register")} style={{ ...cardStyle,border:"1px dashed #43C6AC",color:"#43C6AC",padding:"10px 20px",borderRadius:10,fontWeight:600,fontSize:14,display:"flex",alignItems:"center",gap:8 }}>
                <Icon name="lock" size={14}/>Créer un compte pour publier
              </button>
            )}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:gridCols,gap:16,width:"100%",alignItems:"start" }}>
            {ateliers.filter(a=>!search||normalizeText(a.name+a.description+(a.keywords||"")+(a.type||"")+(a.services||"")).includes(normalizeText(search)))
            .map(a=>({...a, distance: userLocation&&a.lat&&a.lng ? getDistance(userLocation.lat,userLocation.lng,parseFloat(a.lat),parseFloat(a.lng)) : null}))
            .sort((a,b)=>{
              if(featuredPosts.includes(a.id)&&!featuredPosts.includes(b.id)) return -1;
              if(!featuredPosts.includes(a.id)&&featuredPosts.includes(b.id)) return 1;
              if(a.sponsored&&!b.sponsored) return -1;
              if(!a.sponsored&&b.sponsored) return 1;
              if(sortByDistance){ if(a.distance===null) return 1; if(b.distance===null) return -1; return a.distance-b.distance; }
              return 0;
            }).slice(0,visibleAteliers)
            .map(a=>(
              <div key={a.id} onClick={()=>{ sessionStorage.setItem("mdr_scroll_pos",String(window.scrollY)); sessionStorage.setItem("mdr_back_view","ateliers"); navigate("/atelier/"+a.id, { state:{ fromView:"ateliers", scrollPos:window.scrollY } }); }} className={`card-hover${a.sponsored?" card-sponsored":""}`} style={{ ...cardStyle,borderRadius:16,overflow:"hidden",boxShadow:featuredPosts.includes(a.id)?"0 4px 24px rgba(255,215,0,0.4)":"none",border:featuredPosts.includes(a.id)?"2px solid #FFD700":a.sponsored?"2px solid #FFD700":`1px solid ${theme.border}`,cursor:"pointer" }}>
                <div style={{ position:"relative" }}>
                  {a.video && <VideoCardPlayer video={a.video?.url||a.video} photos={a.photos||[]} maxSeconds={120} autoPlay={windowWidth<=600}/>}
                  {!a.video && a.photos&&a.photos.length>0 && (
                    <div style={{ width:"100%",aspectRatio:"4/3",overflow:"hidden",background:"#1a1d30",position:"relative" }}>
                      <img src={a.photos[0]} alt={a.name} style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}
                        onError={e=>{ e.target.style.display="none"; }}/>
                      {a.photos.length>1 && <span style={{ position:"absolute",bottom:6,right:8,background:"rgba(0,0,0,0.55)",color:"#fff",borderRadius:10,padding:"2px 8px",fontSize:11,fontWeight:700 }}>+{a.photos.length-1}</span>}
                    </div>
                  )}
                  {isCertified(a.authorId) && (
                    <div style={{ position:"absolute",bottom:8,right:8 }}>
                      <CertifiedBadge size={52}/>
                    </div>
                  )}
                </div>
                <div style={{ padding:20 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                    <span className="tag" style={{ background:"rgba(67,198,172,0.15)",color:"#43C6AC" }}>🔧 {a.type}</span>
                  </div>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:6 }}>
                    {a.sponsored && <span style={{ background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#000",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:800 }}>🌟 Sponsorisé</span>}
                    {featuredPosts.includes(a.id) && <span style={{ background:"rgba(255,215,0,0.15)",border:"1px solid #FFD700",color:"#FFD700",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700 }}>🏆 En vedette</span>}
                  </div>
                  <h3 style={{ fontWeight:800,fontSize:17,marginBottom:6,color:theme.text }}>{a.name}</h3>
                  {a.distance!==null && <div style={{ display:"inline-flex",alignItems:"center",gap:4,background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.3)",borderRadius:20,padding:"3px 10px",marginBottom:8,fontSize:11,color:"#43C6AC",fontWeight:700 }}>📍 {formatDistance(a.distance)}</div>}
                  {getAvgRating(a.id) && <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}><div style={{ display:"flex" }}>{renderStars(getAvgRating(a.id))}</div><span style={{ fontSize:12,color:"#FFD700",fontWeight:700 }}>{getAvgRating(a.id)}</span><span style={{ fontSize:11,color:theme.sub }}>({getRatingCount(a.id)} avis)</span></div>}
                  <p style={{ color:theme.sub,fontSize:13,lineHeight:1.5,marginBottom:10 }}>{a.description.length>100?a.description.slice(0,100)+"...":a.description}</p>
                  {a.services && (
                    <div style={{ marginBottom:10 }}>
                      <p style={{ fontSize:11,color:theme.sub,fontWeight:600,marginBottom:4 }}>SERVICES :</p>
                      <p style={{ fontSize:12,color:theme.text }}>{a.services}</p>
                    </div>
                  )}
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:10 }}>
                    <Icon name="pin" size={13}/>
                    <p style={{ fontSize:12,color:theme.sub }}>{a.ville}{a.quartier?`, ${a.quartier}`:""}{a.von?` · ${a.von}`:""}</p>
                  </div>
                  {a.horaires && <p style={{ fontSize:12,color:"#43C6AC",marginBottom:12 }}>🕐 {a.horaires}</p>}
                  {a.author && <p style={{ fontSize:12,color:theme.sub,marginBottom:10 }}>👤 {a.author}</p>}
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap",alignItems:"center" }}>
                    <button onClick={()=>likePost(a.id)} style={{ background:"transparent",border:"none",color:likedPosts.includes(a.id)?"#FF6584":theme.sub,display:"flex",alignItems:"center",gap:4,padding:"6px 8px",borderRadius:8,fontSize:12,fontWeight:600 }}><Icon name="heart" size={13}/>{a.likes}</button>
                    <button onClick={()=>setModal({type:"contact",data:{...a,title:a.name}})} style={{ background:"rgba(67,198,172,0.1)",border:"none",color:"#43C6AC",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}><Icon name="phone" size={13}/>Contact</button>
                    {a.phone && <a href={"tel:"+a.phone} style={{ textDecoration:"none" }}><div style={{ background:"rgba(67,198,172,0.1)",color:"#43C6AC",padding:"6px 8px",borderRadius:8,fontSize:12,display:"flex",alignItems:"center",cursor:"pointer" }} title="Appeler">📞</div></a>}
                    {a.lat && a.lng && <a href={"https://www.google.com/maps/dir/?api=1&destination="+a.lat+","+a.lng} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}><div style={{ background:"rgba(66,133,244,0.1)",color:"#4285F4",padding:"6px 8px",borderRadius:8,fontSize:12,display:"flex",alignItems:"center",cursor:"pointer" }} title="Itinéraire Google Maps">🗺️</div></a>}
                    <button onClick={()=>{ navigator.clipboard.writeText("https://marcheduroi.com/atelier/"+a.id); notify("Lien copié ! 📋"); }} style={{ background:"transparent",border:"none",color:theme.sub,padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Copier le lien">🔗</button>
                    <button onClick={()=>{ const shareUrl="https://marcheduroi.com/atelier/"+a.id; if(navigator.share){ navigator.share({ title:a.name, text:"*"+a.name+"*\nVoir l\'atelier: "+shareUrl+"\n\"Sur MarchéduRoi, vous êtes le Roi du Marché 👑\"", url:shareUrl }); } else { navigator.clipboard.writeText(shareUrl); notify("Lien copié ! 📋"); } }} style={{ background:"rgba(0,0,0,0.06)",border:"none",color:theme.text,padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:3 }} title="Partager"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
                    <a href={"https://wa.me/?text="+encodeURIComponent("*"+a.name+"*"+"\n"+"Type: "+a.type+"\n"+"Voir l'atelier: https://marcheduroi.com/atelier/"+a.id)} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(37,211,102,0.1)",color:"#25D366",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}>
                        <svg width="12" height="12" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        Partager
                      </div>
                    </a>
                    <a href={"https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent("https://marcheduroi.com/atelier/"+a.id)} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(24,119,242,0.1)",color:"#1877F2",padding:"6px 8px",borderRadius:8,fontSize:12,display:"flex",alignItems:"center",cursor:"pointer" }}>
                        <svg width="13" height="13" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </div>
                    </a>
                    {a.phone&&user?.id!==a.authorId&&<a href={"https://wa.me/"+a.phone.replace(/[\s+()-]/g,"")+"?text="+encodeURIComponent("Bonjour! je suis intéressé(e) par votre atelier *"+a.name+"*\nLien: https://marcheduroi.com/atelier/"+a.id+"\nSur MarchéduRoi, vous êtes le Roi du Marché 👑")} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}><div style={{ background:"rgba(37,211,102,0.15)",color:"#25D366",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:4,cursor:"pointer" }} title="Contacter sur WhatsApp"><svg width="13" height="13" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>WA</div></a>}
                    {user&&user.id!==a.authorId&&<button onClick={()=>{ setActiveConv({postId:a.id,postTitle:a.name,postPrice:"",postPhoto:a.photos?.[0],receiverId:a.authorId,receiverName:a.author,messages:messages.filter(m=>(m.post_id===a.id)&&((m.sender_id===user.id&&m.receiver_id===a.authorId)||(m.receiver_id===user.id&&m.sender_id===a.authorId)))}); setShowMessages(true); }} style={{ background:"rgba(108,99,255,0.1)",border:"none",color:"#6C63FF",padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Envoyer un message">💬</button>}
                    <button onClick={()=>setModal({type:"report",data:{...a,title:a.name}})} style={{ background:"transparent",border:"none",color:theme.sub,padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Signaler">🚩</button>
                    {user&&(user.id===a.authorId||user.role==="admin")&&(
                      <>
                        {!(a.urgent&&new Date(a.urgentUntil)>new Date()) && (user.role==="admin" || !a.sponsored) && <button onClick={()=>setModal({type:"urgentShop",data:{...a,title:a.name},shopTable:"ateliers",shopSetter:"setAteliers"})} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }}>🔥</button>}
                        {a.urgent&&new Date(a.urgentUntil)>new Date()&&<button onClick={()=>removeUrgentShop(a.id,"ateliers",setAteliers)} style={{ background:"rgba(255,71,87,0.15)",border:"1px solid #FF4757",color:"#FF4757",padding:"6px 8px",borderRadius:8,fontSize:11,cursor:"pointer" }}>✕🔥</button>}
                        <button onClick={e=>{e.stopPropagation();setModal({type:"addPromo",data:a,shopType:"atelier"});}} style={{ background:"rgba(255,140,0,0.1)",border:"none",color:"#FF8C00",padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Publier une Promo">📣</button>
                        <button onClick={e=>{e.stopPropagation();openEditShop(a,"atelier",editShop);}} style={{ background:"rgba(108,99,255,0.15)",border:"none",color:"#6C63FF",padding:"6px 8px",borderRadius:8,cursor:"pointer" }}><Icon name="edit" size={14}/></button>
                        <button onClick={e=>{e.stopPropagation();setModal({type:"deleteshop",data:a,shopType:"atelier"});}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"6px 8px",borderRadius:8,cursor:"pointer" }}><Icon name="trash" size={14}/></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {ateliers.length===0&&<div style={{ textAlign:"center",padding:"60px 0",color:theme.sub }}><p style={{ fontSize:40 }}>🔧</p><p>Aucun atelier pour le moment</p></div>}
          {ateliers.length > visibleAteliers && <div style={{ textAlign:"center",marginTop:24 }}><button onClick={()=>setVisibleAteliers(v=>v+12)} style={{ background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.3)",color:"#43C6AC",padding:"10px 28px",borderRadius:20,fontWeight:700,fontSize:14,cursor:"pointer" }}>Voir plus ({ateliers.length - visibleAteliers} restants)</button></div>}
        </div>
      )}
      {/* RESTAURANTS & BARS */}
      {view==="restos"&&(
        <div style={{ width:"100%",padding:"16px 12px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ textAlign:"center",marginBottom:40 }}>
            <h1 style={{ fontSize:46,fontWeight:800,marginBottom:12,color:theme.text }}>🍽️ <span style={{ background:"linear-gradient(135deg,#FF8C00,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Restaurants & Bars</span></h1>
            <p style={{ color:theme.sub,fontSize:16,marginBottom:20 }}>Rendez votre établissement visible partout · Cliquez sur Publier mon établissement</p>
            <div style={{ maxWidth:500,margin:"0 auto",position:"relative" }}>
              <div style={{ position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:theme.sub,pointerEvents:"none" }}><Icon name="search" size={16}/></div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un restaurant, bar, maquis..." style={{ width:"100%",padding:"14px 20px 14px 44px",background:theme.card,border:`1px solid ${theme.border}`,borderRadius:12,color:theme.text,fontSize:14,fontFamily:"inherit",outline:"none" }}/>
            </div>
          </div>

          <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:24 }}>
            {canEdit ? (
              <button onClick={()=>{ setShopMode("resto"); setShopForm({name:"",type:"",description:"",specialite:"",plats:"",prixMoyen:"",capacite:"",services:"",keywords:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:getPhonePrefix()}); setShopPhotos([]); setShopVideo(null); setMonths(1); setModal({type:"addresto"}); }} className="btn-glow" style={{ background:"linear-gradient(135deg,#FF8C00,#FF6584)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,transition:"box-shadow 0.2s" }}>
                <Icon name="plus" size={16}/>Publier mon établissement
              </button>
            ) : (
              <button onClick={()=>setView("register")} style={{ ...cardStyle,border:"1px dashed #FF8C00",color:"#FF8C00",padding:"10px 20px",borderRadius:10,fontWeight:600,fontSize:14,display:"flex",alignItems:"center",gap:8 }}>
                <Icon name="lock" size={14}/>Créer un compte pour publier
              </button>
            )}
          </div>

          <div style={{ display:"grid",gridTemplateColumns:gridCols,gap:16,width:"100%",alignItems:"start" }}>
            {restos.filter(r=>!search||normalizeText(r.name+r.description+(r.keywords||"")+(r.type||"")+(r.specialite||"")).includes(normalizeText(search)))
            .map(r=>({...r, distance: userLocation&&r.lat&&r.lng ? getDistance(userLocation.lat,userLocation.lng,parseFloat(r.lat),parseFloat(r.lng)) : null}))
            .sort((a,b)=>{
              if(featuredPosts.includes(a.id)&&!featuredPosts.includes(b.id)) return -1;
              if(!featuredPosts.includes(a.id)&&featuredPosts.includes(b.id)) return 1;
              if(a.sponsored&&!b.sponsored) return -1;
              if(!a.sponsored&&b.sponsored) return 1;
              if(sortByDistance){ if(a.distance===null) return 1; if(b.distance===null) return -1; return a.distance-b.distance; }
              return 0;
            }).slice(0,visibleRestos)
            .map(r=>(
              <div key={r.id} onClick={()=>{ sessionStorage.setItem("mdr_scroll_pos",String(window.scrollY)); sessionStorage.setItem("mdr_back_view","restos"); navigate("/resto/"+r.id, { state:{ fromView:"restos", scrollPos:window.scrollY } }); }} className="card-hover" style={{ ...cardStyle,borderRadius:16,overflow:"hidden",boxShadow:featuredPosts.includes(r.id)?"0 4px 24px rgba(255,215,0,0.4)":r.sponsored?"0 4px 24px rgba(255,215,0,0.2)":"0 4px 20px rgba(0,0,0,0.15)",border:featuredPosts.includes(r.id)?`2px solid #FFD700`:r.sponsored?`1px solid rgba(255,215,0,0.5)`:`1px solid ${theme.border}`,cursor:"pointer" }}>
                <div style={{ position:"relative" }}>
                  {r.video && <VideoCardPlayer video={r.video?.url||r.video} photos={r.photos||[]} maxSeconds={120} autoPlay={windowWidth<=600}/>}
                  {!r.video && r.photos&&r.photos.length>0 && (
                    <div style={{ width:"100%",aspectRatio:"4/3",overflow:"hidden",background:"#1a1d30",position:"relative" }}>
                      <img src={r.photos[0]} alt={r.name} style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}
                        onError={e=>{ e.target.style.display="none"; }}/>
                      {r.photos.length>1 && <span style={{ position:"absolute",bottom:6,right:8,background:"rgba(0,0,0,0.55)",color:"#fff",borderRadius:10,padding:"2px 8px",fontSize:11,fontWeight:700 }}>+{r.photos.length-1}</span>}
                    </div>
                  )}
                  {isCertified(r.authorId) && (
                    <div style={{ position:"absolute",bottom:8,right:8 }}>
                      <CertifiedBadge size={52}/>
                    </div>
                  )}
                </div>
                <div style={{ padding:20 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                    <span className="tag" style={{ background:"rgba(255,140,0,0.15)",color:"#FF8C00" }}>🍽️ {r.type}</span>
                    {r.prixMoyen && <span style={{ fontSize:12,color:theme.sub,fontWeight:600 }}>{r.prixMoyen}</span>}
                  </div>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:6 }}>
                    {r.sponsored && <span style={{ background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#000",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:800 }}>🌟 Sponsorisé</span>}
                    {featuredPosts.includes(r.id) && <span style={{ background:"rgba(255,215,0,0.15)",border:"1px solid #FFD700",color:"#FFD700",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700 }}>🏆 En vedette</span>}
                  </div>
                  {r.distance!==null && <div style={{ display:"inline-flex",alignItems:"center",gap:4,background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.3)",borderRadius:20,padding:"3px 10px",marginBottom:8,fontSize:11,color:"#43C6AC",fontWeight:700 }}>📍 {formatDistance(r.distance)}</div>}
                  <h3 style={{ fontWeight:800,fontSize:17,marginBottom:4,color:theme.text }}>{r.name}</h3>
                  {getAvgRating(r.id) && <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}><div style={{ display:"flex" }}>{renderStars(getAvgRating(r.id))}</div><span style={{ fontSize:12,color:"#FFD700",fontWeight:700 }}>{getAvgRating(r.id)}</span><span style={{ fontSize:11,color:theme.sub }}>({getRatingCount(r.id)} avis)</span></div>}
                  {r.specialite && <p style={{ fontSize:13,color:"#FF8C00",fontWeight:600,marginBottom:8 }}>✨ {r.specialite}</p>}
                  {r.plats && <p style={{ fontSize:12,color:theme.sub,marginBottom:8 }}>🍴 {r.plats.length>60?r.plats.slice(0,60)+"...":r.plats}</p>}
                  {r.services && (
                    <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:10 }}>
                      {r.services.split(",").map(s=>(
                        <span key={s} className="tag" style={{ background:"rgba(255,140,0,0.1)",color:"#FF8C00",fontSize:10 }}>{s.trim()}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:10 }}>
                    <Icon name="pin" size={13}/>
                    <p style={{ fontSize:12,color:theme.sub }}>{r.ville}{r.quartier?`, ${r.quartier}`:""}{r.von?` · ${r.von}`:""}</p>
                  </div>
                  {r.horaires && <p style={{ fontSize:12,color:"#43C6AC",marginBottom:12 }}>🕐 {r.horaires}</p>}
                  {r.author && <p style={{ fontSize:12,color:theme.sub,marginBottom:10 }}>👤 {r.author}</p>}
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap",alignItems:"center" }}>
                    <button onClick={()=>likePost(r.id)} style={{ background:"transparent",border:"none",color:likedPosts.includes(r.id)?"#FF6584":theme.sub,display:"flex",alignItems:"center",gap:4,padding:"6px 8px",borderRadius:8,fontSize:12,fontWeight:600 }}><Icon name="heart" size={13}/>{r.likes}</button>
                    <button onClick={()=>setModal({type:"contact",data:{...r,title:r.name}})} style={{ background:"rgba(255,140,0,0.1)",border:"none",color:"#FF8C00",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}><Icon name="phone" size={13}/>Contact</button>
                    {r.phone && <a href={"tel:"+r.phone} style={{ textDecoration:"none" }}><div style={{ background:"rgba(255,140,0,0.1)",color:"#FF8C00",padding:"6px 8px",borderRadius:8,fontSize:12,display:"flex",alignItems:"center",cursor:"pointer" }} title="Appeler">📞</div></a>}
                    {r.lat && r.lng && <a href={"https://www.google.com/maps/dir/?api=1&destination="+r.lat+","+r.lng} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}><div style={{ background:"rgba(66,133,244,0.1)",color:"#4285F4",padding:"6px 8px",borderRadius:8,fontSize:12,display:"flex",alignItems:"center",cursor:"pointer" }} title="Itinéraire Google Maps">🗺️</div></a>}
                    <button onClick={()=>{ navigator.clipboard.writeText("https://marcheduroi.com/resto/"+r.id); notify("Lien copié ! 📋"); }} style={{ background:"transparent",border:"none",color:theme.sub,padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Copier le lien">🔗</button>
                    {user&&user.id!==r.authorId&&<button onClick={()=>{ setActiveConv({postId:r.id,postTitle:r.name,postPrice:"",postPhoto:r.photos?.[0],receiverId:r.authorId,receiverName:r.author,messages:messages.filter(m=>(m.post_id===r.id)&&((m.sender_id===user.id&&m.receiver_id===r.authorId)||(m.receiver_id===user.id&&m.sender_id===r.authorId)))}); setShowMessages(true); }} style={{ background:"rgba(108,99,255,0.1)",border:"none",color:"#6C63FF",padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Envoyer un message">💬</button>}
                    <button onClick={()=>{ const shareUrl="https://marcheduroi.com/resto/"+r.id; if(navigator.share){ navigator.share({ title:r.name, text:"*"+r.name+"*\nVoir l\'établissement: "+shareUrl+"\n\"Sur MarchéduRoi, vous êtes le Roi du Marché 👑\"", url:shareUrl }); } else { navigator.clipboard.writeText(shareUrl); notify("Lien copié ! 📋"); } }} style={{ background:"rgba(0,0,0,0.06)",border:"none",color:theme.text,padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:3 }} title="Partager"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
                    <a href={"https://wa.me/?text="+encodeURIComponent("*"+r.name+"*"+"\n"+"Type: "+r.type+"\n"+"Voir l'etablissement: https://marcheduroi.com/resto/"+r.id)} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(37,211,102,0.1)",color:"#25D366",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}>
                        <svg width="12" height="12" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        Partager
                      </div>
                    </a>
                    <a href={"https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent("https://marcheduroi.com/resto/"+r.id)} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(24,119,242,0.1)",color:"#1877F2",padding:"6px 8px",borderRadius:8,fontSize:12,display:"flex",alignItems:"center",cursor:"pointer" }}>
                        <svg width="13" height="13" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </div>
                    </a>
                    {r.phone&&user?.id!==r.authorId&&<a href={"https://wa.me/"+r.phone.replace(/[\s+()-]/g,"")+"?text="+encodeURIComponent("Bonjour! je suis intéressé(e) par votre restaurant *"+r.name+"*\nLien: https://marcheduroi.com/resto/"+r.id+"\nSur MarchéduRoi, vous êtes le Roi du Marché 👑")} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}><div style={{ background:"rgba(37,211,102,0.15)",color:"#25D366",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:4,cursor:"pointer" }} title="Contacter sur WhatsApp"><svg width="13" height="13" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>WA</div></a>}
                    {user&&user.id!==r.authorId&&<button onClick={()=>{ setActiveConv({postId:r.id,postTitle:r.name,postPrice:r.tarifs||"",postPhoto:r.photos?.[0],receiverId:r.authorId,receiverName:r.author,messages:messages.filter(m=>(m.post_id===r.id)&&((m.sender_id===user.id&&m.receiver_id===r.authorId)||(m.receiver_id===user.id&&m.sender_id===r.authorId)))}); setShowMessages(true); }} style={{ background:"rgba(108,99,255,0.1)",border:"none",color:"#6C63FF",padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Message">💬</button>}
                    <button onClick={()=>setModal({type:"report",data:{...r,title:r.name}})} style={{ background:"transparent",border:"none",color:theme.sub,padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Signaler">🚩</button>
                    {user&&(user.id===r.authorId||user.role==="admin")&&(
                      <>
                        {!(r.urgent&&new Date(r.urgentUntil)>new Date()) && (user.role==="admin" || !r.sponsored) && <button onClick={()=>setModal({type:"urgentShop",data:{...r,title:r.name},shopTable:"restos",shopSetter:"setRestos"})} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }}>🔥</button>}
                        {r.urgent&&new Date(r.urgentUntil)>new Date()&&<button onClick={()=>removeUrgentShop(r.id,"restos",setRestos)} style={{ background:"rgba(255,71,87,0.15)",border:"1px solid #FF4757",color:"#FF4757",padding:"6px 8px",borderRadius:8,fontSize:11,cursor:"pointer" }}>✕🔥</button>}
                        <button onClick={e=>{e.stopPropagation();setModal({type:"addPromo",data:r,shopType:"resto"});}} style={{ background:"rgba(255,140,0,0.1)",border:"none",color:"#FF8C00",padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Publier une Promo">📣</button>
                        <button onClick={e=>{e.stopPropagation();openEditShop(r,"resto",editResto);}} style={{ background:"rgba(108,99,255,0.15)",border:"none",color:"#6C63FF",padding:"6px 8px",borderRadius:8,cursor:"pointer" }}><Icon name="edit" size={14}/></button>
                        <button onClick={e=>{e.stopPropagation();setModal({type:"deleteshop",data:r,shopType:"resto"});}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"6px 8px",borderRadius:8,cursor:"pointer" }}><Icon name="trash" size={14}/></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {restos.length===0&&<div style={{ textAlign:"center",padding:"60px 0",color:theme.sub }}><p style={{ fontSize:40 }}>🍽️</p><p>Aucun établissement pour le moment</p></div>}
        </div>
      )}

      {/* BEAUTÉ & COIFFURE */}
      {view==="beaute"&&(
        <div style={{ width:"100%",padding:"16px 12px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ textAlign:"center",marginBottom:40 }}>
            <h1 style={{ fontSize:46,fontWeight:800,marginBottom:12,color:theme.text }}>💇 <span style={{ background:"linear-gradient(135deg,#FF69B4,#FF1493)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Beauté & Coiffure</span></h1>
            <p style={{ color:theme.sub,fontSize:16,marginBottom:20 }}>Rendez votre salon visible partout · Cliquez sur Publier mon salon</p>
            <div style={{ maxWidth:500,margin:"0 auto",position:"relative" }}>
              <div style={{ position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:theme.sub,pointerEvents:"none" }}><Icon name="search" size={16}/></div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un salon, coiffeur, make-up..." style={{ width:"100%",padding:"14px 20px 14px 44px",background:theme.card,border:`1px solid ${theme.border}`,borderRadius:12,color:theme.text,fontSize:14,fontFamily:"inherit",outline:"none" }}/>
            </div>
          </div>

          <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:24 }}>
            {canEdit ? (
              <button onClick={()=>{ setShopMode("beaute"); setShopForm({name:"",type:"",description:"",specialite:"",services:"",tarifs:"",rendezvous:"Non",produits:"",keywords:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:getPhonePrefix()}); setShopPhotos([]); setShopVideo(null); setMonths(1); setModal({type:"addbeaute"}); }} className="btn-glow" style={{ background:"linear-gradient(135deg,#FF69B4,#FF1493)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,transition:"box-shadow 0.2s" }}>
                <Icon name="plus" size={16}/>Publier mon salon
              </button>
            ) : (
              <button onClick={()=>setView("register")} style={{ ...cardStyle,border:"1px dashed #FF69B4",color:"#FF69B4",padding:"10px 20px",borderRadius:10,fontWeight:600,fontSize:14,display:"flex",alignItems:"center",gap:8 }}>
                <Icon name="lock" size={14}/>Créer un compte pour publier
              </button>
            )}
          </div>

          <div style={{ display:"grid",gridTemplateColumns:gridCols,gap:16,width:"100%",alignItems:"start" }}>
            {beaute.filter(b=>!search||normalizeText(b.name+b.description+(b.keywords||"")+(b.type||"")+(b.specialite||"")+(b.services||"")).includes(normalizeText(search)))
            .map(b=>({...b, distance: userLocation&&b.lat&&b.lng ? getDistance(userLocation.lat,userLocation.lng,parseFloat(b.lat),parseFloat(b.lng)) : null}))
            .sort((a,b)=>{
              if(featuredPosts.includes(a.id)&&!featuredPosts.includes(b.id)) return -1;
              if(!featuredPosts.includes(a.id)&&featuredPosts.includes(b.id)) return 1;
              if(a.sponsored&&!b.sponsored) return -1;
              if(!a.sponsored&&b.sponsored) return 1;
              if(sortByDistance){ if(a.distance===null) return 1; if(b.distance===null) return -1; return a.distance-b.distance; }
              return 0;
            }).slice(0,visibleBeaute)
            .map(b=>(
              <div key={b.id} onClick={()=>{ sessionStorage.setItem("mdr_scroll_pos",String(window.scrollY)); sessionStorage.setItem("mdr_back_view","beaute"); navigate("/beaute/"+b.id, { state:{ fromView:"beaute", scrollPos:window.scrollY } }); }} className={`card-hover${b.sponsored?" card-sponsored":""}`} style={{ ...cardStyle,borderRadius:16,overflow:"hidden",boxShadow:featuredPosts.includes(b.id)?"0 4px 24px rgba(255,215,0,0.4)":"none",border:featuredPosts.includes(b.id)?"2px solid #FFD700":b.sponsored?"2px solid #FFD700":`1px solid ${theme.border}`,cursor:"pointer" }}>
                <div style={{ position:"relative" }}>
                  {b.video && <VideoCardPlayer video={b.video?.url||b.video} photos={b.photos||[]} maxSeconds={120} autoPlay={windowWidth<=600}/>}
                  {!b.video && b.photos&&b.photos.length>0 && (
                    <div style={{ width:"100%",aspectRatio:"4/3",overflow:"hidden",background:"#1a1d30",position:"relative" }}>
                      <img src={b.photos[0]} alt={b.name} style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}
                        onError={e=>{ e.target.style.display="none"; }}/>
                      {b.photos.length>1 && <span style={{ position:"absolute",bottom:6,right:8,background:"rgba(0,0,0,0.55)",color:"#fff",borderRadius:10,padding:"2px 8px",fontSize:11,fontWeight:700 }}>+{b.photos.length-1}</span>}
                    </div>
                  )}
                  {isCertified(b.authorId) && (
                    <div style={{ position:"absolute",bottom:8,right:8 }}>
                      <CertifiedBadge size={52}/>
                    </div>
                  )}
                </div>
                <div style={{ padding:20 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                    <span className="tag" style={{ background:"rgba(255,105,180,0.15)",color:"#FF69B4" }}>💇 {b.type}</span>
                    {b.tarifs && <span style={{ fontSize:12,color:theme.sub,fontWeight:600 }}>{b.tarifs}</span>}
                  </div>
                  <h3 style={{ fontWeight:800,fontSize:17,marginBottom:4,color:theme.text }}>{b.name}</h3>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:6 }}>
                    {b.sponsored && <span style={{ background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#000",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:800 }}>🌟 Sponsorisé</span>}
                    {featuredPosts.includes(b.id) && <span style={{ background:"rgba(255,215,0,0.15)",border:"1px solid #FFD700",color:"#FFD700",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700 }}>🏆 En vedette</span>}
                  </div>
                  {b.distance!==null && <div style={{ display:"inline-flex",alignItems:"center",gap:4,background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.3)",borderRadius:20,padding:"3px 10px",marginBottom:8,fontSize:11,color:"#43C6AC",fontWeight:700 }}>📍 {formatDistance(b.distance)}</div>}
                  {getAvgRating(b.id) && <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}><div style={{ display:"flex" }}>{renderStars(getAvgRating(b.id))}</div><span style={{ fontSize:12,color:"#FFD700",fontWeight:700 }}>{getAvgRating(b.id)}</span><span style={{ fontSize:11,color:theme.sub }}>({getRatingCount(b.id)} avis)</span></div>}
                  {b.specialite && <p style={{ fontSize:13,color:"#FF69B4",fontWeight:600,marginBottom:6 }}>✨ {b.specialite}</p>}
                  {b.services && <p style={{ fontSize:12,color:theme.sub,marginBottom:8,lineHeight:1.5 }}>✂️ {b.services.length>80?b.services.slice(0,80)+"...":b.services}</p>}
                  {b.rendezvous && <span className="tag" style={{ background:"rgba(255,105,180,0.1)",color:"#FF69B4",marginBottom:8,display:"inline-flex" }}>📅 RDV: {b.rendezvous}</span>}
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:10 }}>
                    <Icon name="pin" size={13}/>
                    <p style={{ fontSize:12,color:theme.sub }}>{b.ville}{b.quartier?`, ${b.quartier}`:""}{b.von?` · ${b.von}`:""}</p>
                  </div>
                  {b.horaires && <p style={{ fontSize:12,color:"#43C6AC",marginBottom:12 }}>🕐 {b.horaires}</p>}
                  {b.author && <p style={{ fontSize:12,color:theme.sub,marginBottom:10 }}>👤 {b.author}</p>}
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    <button onClick={()=>likePost(b.id)} style={{ background:"transparent",border:"none",color:likedPosts.includes(b.id)?"#FF6584":theme.sub,display:"flex",alignItems:"center",gap:4,padding:"6px 8px",borderRadius:8,fontSize:12,fontWeight:600 }}><Icon name="heart" size={13}/>{b.likes}</button>
                    <button onClick={()=>setModal({type:"contact",data:{...b,title:b.name}})} style={{ background:"rgba(255,105,180,0.1)",border:"none",color:"#FF69B4",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}><Icon name="phone" size={13}/>Contact</button>
                    {b.phone && <a href={"tel:"+b.phone} style={{ textDecoration:"none" }}><div style={{ background:"rgba(255,105,180,0.1)",color:"#FF69B4",padding:"6px 8px",borderRadius:8,fontSize:12,display:"flex",alignItems:"center",cursor:"pointer" }} title="Appeler">📞</div></a>}
                    {b.lat && b.lng && <a href={"https://www.google.com/maps/dir/?api=1&destination="+b.lat+","+b.lng} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}><div style={{ background:"rgba(66,133,244,0.1)",color:"#4285F4",padding:"6px 8px",borderRadius:8,fontSize:12,display:"flex",alignItems:"center",cursor:"pointer" }} title="Itinéraire Google Maps">🗺️</div></a>}
                    <button onClick={()=>{ navigator.clipboard.writeText("https://marcheduroi.com/beaute/"+b.id); notify("Lien copié ! 📋"); }} style={{ background:"transparent",border:"none",color:theme.sub,padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Copier le lien">🔗</button>
                    {user&&user.id!==b.authorId&&<button onClick={()=>{ setActiveConv({postId:b.id,postTitle:b.name,postPrice:b.tarifs||"",postPhoto:b.photos?.[0],receiverId:b.authorId,receiverName:b.author,messages:messages.filter(m=>(m.post_id===b.id)&&((m.sender_id===user.id&&m.receiver_id===b.authorId)||(m.receiver_id===user.id&&m.sender_id===b.authorId)))}); setShowMessages(true); }} style={{ background:"rgba(108,99,255,0.1)",border:"none",color:"#6C63FF",padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Envoyer un message">💬</button>}
                    <button onClick={()=>{ const shareUrl="https://marcheduroi.com/beaute/"+b.id; if(navigator.share){ navigator.share({ title:b.name, text:"*"+b.name+"*\nVoir le salon: "+shareUrl+"\n\"Sur MarchéduRoi, vous êtes le Roi du Marché 👑\"", url:shareUrl }); } else { navigator.clipboard.writeText(shareUrl); notify("Lien copié ! 📋"); } }} style={{ background:"rgba(0,0,0,0.06)",border:"none",color:theme.text,padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:3 }} title="Partager"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
                    <a href={"https://wa.me/?text="+encodeURIComponent("*"+b.name+"*"+"\n"+"Type: "+b.type+"\n"+"Voir le salon: https://marcheduroi.com/beaute/"+b.id)} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(37,211,102,0.1)",color:"#25D366",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}>
                        <svg width="12" height="12" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        Partager
                      </div>
                    </a>
                    <a href={"https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent("https://marcheduroi.com/beaute/"+b.id)} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(24,119,242,0.1)",color:"#1877F2",padding:"6px 8px",borderRadius:8,fontSize:12,display:"flex",alignItems:"center",cursor:"pointer" }}>
                        <svg width="13" height="13" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </div>
                    </a>
                    {b.phone&&user?.id!==b.authorId&&<a href={"https://wa.me/"+b.phone.replace(/[\s+()-]/g,"")+"?text="+encodeURIComponent("Bonjour! je suis intéressé(e) par votre salon *"+b.name+"*\nLien: https://marcheduroi.com/beaute/"+b.id+"\nSur MarchéduRoi, vous êtes le Roi du Marché 👑")} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}><div style={{ background:"rgba(37,211,102,0.15)",color:"#25D366",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:4,cursor:"pointer" }} title="Contacter sur WhatsApp"><svg width="13" height="13" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>WA</div></a>}
                    {user&&user.id!==b.authorId&&<button onClick={()=>{ setActiveConv({postId:b.id,postTitle:b.name,postPrice:b.tarifs||"",postPhoto:b.photos?.[0],receiverId:b.authorId,receiverName:b.author,messages:messages.filter(m=>(m.post_id===b.id)&&((m.sender_id===user.id&&m.receiver_id===b.authorId)||(m.receiver_id===user.id&&m.sender_id===b.authorId)))}); setShowMessages(true); }} style={{ background:"rgba(108,99,255,0.1)",border:"none",color:"#6C63FF",padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Message">💬</button>}
                    {user&&(user.id===b.authorId||user.role==="admin")&&(
                      <>
                        {!(b.urgent&&new Date(b.urgentUntil)>new Date()) && (user.role==="admin" || !b.sponsored) && <button onClick={()=>setModal({type:"urgentShop",data:{...b,title:b.name},shopTable:"beaute",shopSetter:"setBeaute"})} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }}>🔥</button>}
                        {b.urgent&&new Date(b.urgentUntil)>new Date()&&<button onClick={()=>removeUrgentShop(b.id,"beaute",setBeaute)} style={{ background:"rgba(255,71,87,0.15)",border:"1px solid #FF4757",color:"#FF4757",padding:"6px 8px",borderRadius:8,fontSize:11,cursor:"pointer" }}>✕🔥</button>}
                        <button onClick={e=>{e.stopPropagation();setModal({type:"addPromo",data:b,shopType:"beaute"});}} style={{ background:"rgba(255,140,0,0.1)",border:"none",color:"#FF8C00",padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer" }} title="Publier une Promo">📣</button>
                        <button onClick={e=>{e.stopPropagation();openEditShop(b,"beaute",editBeaute);}} style={{ background:"rgba(108,99,255,0.15)",border:"none",color:"#6C63FF",padding:"6px 8px",borderRadius:8,cursor:"pointer" }}><Icon name="edit" size={14}/></button>
                        <button onClick={e=>{e.stopPropagation();setModal({type:"deleteshop",data:b,shopType:"beaute"});}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"6px 8px",borderRadius:8,cursor:"pointer" }}><Icon name="trash" size={14}/></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {beaute.length===0&&<div style={{ textAlign:"center",padding:"60px 0",color:theme.sub }}><p style={{ fontSize:40 }}>💇</p><p>Aucun salon pour le moment</p></div>}
          {beaute.length > visibleBeaute && <div style={{ textAlign:"center",marginTop:24 }}><button onClick={()=>setVisibleBeaute(v=>v+12)} style={{ background:"rgba(255,105,180,0.1)",border:"1px solid rgba(255,105,180,0.3)",color:"#FF69B4",padding:"10px 28px",borderRadius:20,fontWeight:700,fontSize:14,cursor:"pointer" }}>Voir plus ({beaute.length - visibleBeaute} restants)</button></div>}
        </div>
      )}

    </>
  );
}

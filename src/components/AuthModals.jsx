import React, { useState } from "react";
import { supabase } from "../supabase";

export default function AuthModals({ view, theme, authForm, setAuthForm,
  detectedCountry, setView, notify, cardStyle, inputStyle, windowWidth, user, setUser, t }) {

  const [authError,   setAuthError]   = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  return (
    <>
      {/* LOGIN */}
      {view==="login"&&(
        <div style={{ maxWidth:420,margin:"60px auto",padding:"0 24px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ ...cardStyle,borderRadius:20,padding:36 }}>
            <h2 style={{ fontWeight:800,fontSize:26,marginBottom:6,color:theme.text }}>Connexion</h2>
            <p style={{ color:theme.sub,fontSize:13,marginBottom:28 }}>Connectez-vous à votre compte</p>
            {[{label:"Email",key:"email",type:"email"},{label:"Mot de passe",key:"password",type:"password"}].map(f=>(
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>{f.label}</label>
                {f.key==="password" ? (
                  <div style={{ position:"relative" }}>
                    <input type={showPassword?"text":"password"} value={authForm[f.key]} onChange={e=>setAuthForm(a=>({...a,[f.key]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="••••••••" maxLength={64} style={{ ...inputStyle,paddingRight:44 }}/>
                    <button type="button" onClick={()=>setShowPassword(s=>!s)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:theme.sub,cursor:"pointer",fontSize:18 }}>{showPassword?"🙈":"👁️"}</button>
                  </div>
                ) : (
                  <input type="email" value={authForm[f.key]} onChange={e=>{ setAuthForm(a=>({...a,email:onlyEmail(e.target.value)})); setLoginError(null); }} placeholder="contact@marcheduroi.com" maxLength={80} inputMode="email" style={inputStyle}/>
                )}
              </div>
            ))}
            <button onClick={login} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,marginTop:8,transition:"box-shadow 0.2s" }}>Se connecter</button>

            {/* Message d'erreur inline */}
            {loginError==="unknown_email" && (
              <div style={{ marginTop:14,padding:"14px 16px",background:"rgba(255,71,87,0.08)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:12,textAlign:"center" }}>
                <p style={{ color:"#FF4757",fontWeight:700,fontSize:14,marginBottom:6 }}>❌ Cet email n'est pas encore inscrit</p>
                <p style={{ color:theme.sub,fontSize:12,marginBottom:10 }}>Créez votre compte gratuit pour continuer</p>
                <button onClick={()=>{ setLoginError(null); setView("register"); }} style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"8px 20px",borderRadius:20,fontWeight:700,fontSize:13,cursor:"pointer" }}>
                  ✨ Inscrivez-vous gratuitement
                </button>
              </div>
            )}
            {loginError==="wrong_password" && (
              <div style={{ marginTop:14,padding:"14px 16px",background:"rgba(255,165,0,0.08)",border:"1px solid rgba(255,165,0,0.3)",borderRadius:12,textAlign:"center" }}>
                <p style={{ color:"#FFA500",fontWeight:700,fontSize:14,marginBottom:6 }}>🔑 Vous êtes déjà inscrit</p>
                <p style={{ color:theme.sub,fontSize:12,marginBottom:10 }}>Mot de passe incorrect — vous avez oublié votre mot de passe ?</p>
                <button onClick={()=>{ setLoginError(null); setModal({type:"forgot"}); }} style={{ background:"linear-gradient(135deg,#FFA500,#FFD700)",border:"none",color:"#fff",padding:"8px 20px",borderRadius:20,fontWeight:700,fontSize:13,cursor:"pointer" }}>
                  🔓 Réinitialiser mon mot de passe
                </button>
              </div>
            )}

            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16 }}>
              <p style={{ color:theme.sub,fontSize:13 }}>Pas de compte ? <button onClick={()=>setView("register")} style={{ background:"none",border:"none",color:"#6C63FF",fontWeight:600,cursor:"pointer" }}>S'inscrire</button></p>
              <button onClick={()=>setModal({type:"forgot"})} style={{ background:"none",border:"none",color:theme.sub,fontSize:13,cursor:"pointer",textDecoration:"underline" }}>Mot de passe oublié ?</button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER */}
      {view==="register"&&(()=>{ const PHONE_CODES={"BJ":"+229 ","TG":"+228 ","CI":"+225 ","SN":"+221 ","ML":"+223 ","BF":"+226 ","NE":"+227 ","GN":"+224 ","NG":"+234 ","CM":"+237 ","CG":"+242 ","CD":"+243 ","GA":"+241 ","MG":"+261 ","RW":"+250 ","BI":"+257 ","TD":"+235 ","MR":"+222 ","FR":"+33 ","BE":"+32 ","CH":"+41 ","CA":"+1 "}; if(!authForm.phone&&detectedCountry&&PHONE_CODES[detectedCountry]){ setAuthForm(a=>({...a,phone:PHONE_CODES[detectedCountry],country:detectedCountry})); } return true; })()&&(
        <div style={{ maxWidth:420,margin:"60px auto",padding:"0 24px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ ...cardStyle,borderRadius:20,padding:36 }}>
            <h2 style={{ fontWeight:800,fontSize:26,marginBottom:6,color:theme.text }}>Créer un compte</h2>
            <p style={{ color:theme.sub,fontSize:13,marginBottom:28 }}>Lecture toujours gratuite</p>
            {[{label:"Nom complet",key:"name",type:"text"},{label:"Email",key:"email",type:"email"},{label:"Mot de passe",key:"password",type:"password"}].map(f=>(
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>{f.label}</label>
                {f.key==="password" ? (
                  <div style={{ position:"relative" }}>
                    <input type={showPassword?"text":"password"} value={authForm[f.key]} onChange={e=>setAuthForm(a=>({...a,[f.key]:e.target.value}))} placeholder="Min. 6 caractères" maxLength={64} style={{ ...inputStyle,paddingRight:44 }}/>
                    <button type="button" onClick={()=>setShowPassword(s=>!s)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:theme.sub,cursor:"pointer",fontSize:18 }}>{showPassword?"🙈":"👁️"}</button>
                  </div>
                ) : f.key==="email" ? (
                  <input type="email" value={authForm[f.key]} onChange={e=>setAuthForm(a=>({...a,email:noSpaces(e.target.value).toLowerCase()}))} placeholder="contact@marcheduroi.com" maxLength={80} inputMode="email" style={inputStyle}/>
                ) : (
                  <input type="text" value={authForm[f.key]} onChange={e=>setAuthForm(a=>({...a,name:cleanText(e.target.value,60)}))} placeholder="Votre prénom et nom" maxLength={60} style={inputStyle}/>
                )}
              </div>
            ))}
            {/* Pays */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>🌍 Pays</label>
              <select value={authForm.country} onChange={e=>{
                const PHONE_CODES={"BJ":"+229 ","TG":"+228 ","CI":"+225 ","SN":"+221 ","ML":"+223 ","BF":"+226 ","NE":"+227 ","GN":"+224 ","NG":"+234 ","CM":"+237 ","CG":"+242 ","CD":"+243 ","GA":"+241 ","MG":"+261 ","RW":"+250 ","BI":"+257 ","TD":"+235 ","MR":"+222 ","FR":"+33 ","BE":"+32 ","CH":"+41 ","CA":"+1 ","OTHER":"+"}; 
                setAuthForm(a=>({...a,country:e.target.value,phone:PHONE_CODES[e.target.value]||""}));
              }} style={inputStyle}>
                {[
                  {code:"BJ",name:"🇧🇯 Bénin"},{code:"TG",name:"🇹🇬 Togo"},{code:"CI",name:"🇨🇮 Côte d'Ivoire"},
                  {code:"SN",name:"🇸🇳 Sénégal"},{code:"ML",name:"🇲🇱 Mali"},{code:"BF",name:"🇧🇫 Burkina Faso"},
                  {code:"NE",name:"🇳🇪 Niger"},{code:"GN",name:"🇬🇳 Guinée"},{code:"NG",name:"🇳🇬 Nigeria"},
                  {code:"CM",name:"🇨🇲 Cameroun"},{code:"CG",name:"🇨🇬 Congo"},{code:"CD",name:"🇨🇩 RD Congo"},
                  {code:"GA",name:"🇬🇦 Gabon"},{code:"MG",name:"🇲🇬 Madagascar"},{code:"RW",name:"🇷🇼 Rwanda"},
                  {code:"BI",name:"🇧🇮 Burundi"},{code:"TD",name:"🇹🇩 Tchad"},{code:"MR",name:"🇲🇷 Mauritanie"},
                  {code:"FR",name:"🇫🇷 France"},{code:"BE",name:"🇧🇪 Belgique"},{code:"CH",name:"🇨🇭 Suisse"},
                  {code:"CA",name:"🇨🇦 Canada"},{code:"OTHER",name:"🌍 Autre pays"},
                ].map(p=><option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </div>
            {/* Téléphone / WhatsApp */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>📱 Téléphone / WhatsApp <span style={{ color:"#FF4757",fontSize:13 }}>*</span></label>
              <input
                type="tel"
                value={authForm.phone}
                onChange={e=>setAuthForm(a=>({...a,phone:e.target.value}))}
                placeholder="Ex: +229 01 23 45 67"
                maxLength={25}
                inputMode="tel"
                style={inputStyle}
              />
            </div>

            <button onClick={register} className="btn-glow" disabled={!authForm.name||!authForm.email||!authForm.password||!authForm.phone} style={{ width:"100%",padding:"14px",background:(!authForm.name||!authForm.email||!authForm.password||!authForm.phone)?"rgba(108,99,255,0.4)":"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,marginTop:8,transition:"box-shadow 0.2s",cursor:(!authForm.name||!authForm.email||!authForm.password||!authForm.phone)?"not-allowed":"pointer" }}>Créer mon compte</button>
            {/* Widget Turnstile */}
            <div style={{ marginTop:16,display:"flex",justifyContent:"center" }}>
              <div ref={turnstileRef} />
            </div>
            <p style={{ textAlign:"center",marginTop:20,color:theme.sub,fontSize:13 }}>Déjà inscrit ? <button onClick={()=>setView("login")} style={{ background:"none",border:"none",color:"#6C63FF",fontWeight:600,cursor:"pointer" }}>Se connecter</button></p>
          </div>
        </div>
      )}

      {/* ── RECRUTEMENT ── */}
      {view==="recrutement"&&(
        <div style={{ animation:"fadeIn 0.4s ease",padding:"24px 20px",maxWidth:820,margin:"0 auto",width:"100%" }}>
          <div style={{ textAlign:"center",marginBottom:28 }}>
            <h1 style={{ fontSize:windowWidth<=600?28:40,fontWeight:800,color:theme.text,marginBottom:8 }}>
              {"💼 "}
              <span style={{ background:"linear-gradient(135deg,#43C6AC,#6C63FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Recrutement</span>
            </h1>
            <p style={{ color:theme.sub,fontSize:14 }}>Offres d\'emploi et profils de candidats</p>
          </div>
          <div style={{ display:"flex",gap:8,marginBottom:24,background:theme.card,padding:4,borderRadius:14 }}>
            {[{key:"offres",label:"💼 Offres d\'emploi"},{key:"cvs",label:"👤 Profils / CV"}].map(tab=>(
              <button key={tab.key} onClick={()=>setRecrutTab(tab.key)}
                style={{ flex:1,padding:"10px 16px",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer",border:"none",
                  background:recrutTab===tab.key?"linear-gradient(135deg,#43C6AC,#6C63FF)":"transparent",
                  color:recrutTab===tab.key?"#fff":theme.sub,transition:"all 0.2s" }}>
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:20 }}>
            {user && recrutTab==="offres" && (
              <button onClick={()=>setModal({type:"addOffre"})} className="btn-glow"
                style={{ background:"linear-gradient(135deg,#43C6AC,#6C63FF)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer" }}>
                + Publier une offre
              </button>
            )}
            {user && recrutTab==="cvs" && (
              <button onClick={()=>setModal({type:"addCV"})} className="btn-glow"
                style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer" }}>
                + Publier mon CV
              </button>
            )}
          </div>
          {recrutTab==="offres" && (()=>{
            const offres = posts.filter(p=>p.category==="Offre d\'emploi").sort((a,b)=>new Date(b.date)-new Date(a.date));
            if (offres.length===0) return (
              <div style={{ textAlign:"center",padding:"60px 0",color:theme.sub }}>
                <p style={{ fontSize:40,marginBottom:12 }}>{"💼"}</p>
                <p style={{ fontWeight:600,marginBottom:8 }}>Aucune offre pour le moment</p>
                <p style={{ fontSize:13 }}>1 500 FCFA / 30 jours · 3 500 FCFA / 90 jours</p>
              </div>
            );
            return (
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {offres.map(o=>(
                  <div key={o.id} style={{ ...cardStyle,borderRadius:16,padding:20,border:`1px solid ${theme.border}` }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,flexWrap:"wrap",gap:8 }}>
                      <div>
                        <p style={{ fontWeight:800,fontSize:16,color:theme.text,marginBottom:4 }}>{o.title}</p>
                        <p style={{ fontWeight:700,fontSize:13,color:"#43C6AC" }}>{"🏢 "}{o.contact}</p>
                      </div>
                      {o.price&&<span style={{ background:"rgba(67,198,172,0.12)",color:"#43C6AC",borderRadius:8,padding:"4px 12px",fontSize:13,fontWeight:700 }}>{"💰 "}{o.price} FCFA</span>}
                    </div>
                    <p style={{ color:theme.sub,fontSize:13,lineHeight:1.6,marginBottom:10 }}>{o.description}</p>
                    <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>
                      {o.ville&&<span style={{ fontSize:12,color:theme.sub }}>{"📍 "}{o.ville}</span>}
                      <span style={{ fontSize:12,color:theme.sub }}>{"📅 "}{o.date}</span>
                      {o.phone&&user&&user.id!==o.authorId&&(
                        <a href={"https://wa.me/"+o.phone.replace(/[\s+()]/g,"")} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                          <div style={{ background:"rgba(37,211,102,0.15)",color:"#25D366",padding:"4px 10px",borderRadius:8,fontSize:12,fontWeight:700 }}>WA</div>
                        </a>
                      )}
                      {user&&user.id!==o.authorId&&(
                        <button onClick={()=>{ setActiveConv({postId:o.id,postTitle:o.title,postPrice:"",postPhoto:null,receiverId:o.authorId,receiverName:o.contact,messages:messages.filter(m=>(m.post_id===o.id)&&((m.sender_id===user.id&&m.receiver_id===o.authorId)||(m.receiver_id===user.id&&m.sender_id===o.authorId)))}); setShowMessages(true); }}
                          style={{ background:"rgba(108,99,255,0.1)",border:"none",color:"#6C63FF",padding:"4px 10px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer" }}>{"💬 Postuler"}</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
          {recrutTab==="cvs" && (()=>{
            const cvs = posts.filter(p=>p.category==="Profil CV").sort((a,b)=>new Date(b.date)-new Date(a.date));
            if (cvs.length===0) return (
              <div style={{ textAlign:"center",padding:"60px 0",color:theme.sub }}>
                <p style={{ fontSize:40,marginBottom:12 }}>{"👤"}</p>
                <p style={{ fontWeight:600,marginBottom:8 }}>Aucun profil pour le moment</p>
                <p style={{ fontSize:13 }}>Publication gratuite</p>
              </div>
            );
            return (
              <div style={{ display:"grid",gridTemplateColumns:windowWidth<=600?"1fr":windowWidth<=900?"1fr 1fr":"1fr 1fr 1fr",gap:14 }}>
                {cvs.map(cv=>(
                  <div key={cv.id} style={{ ...cardStyle,borderRadius:16,padding:18,border:`1px solid ${theme.border}` }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                      <div style={{ width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#43C6AC)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#fff",flexShrink:0 }}>{cv.contact?.[0]||"?"}</div>
                      <div>
                        <p style={{ fontWeight:800,fontSize:14,color:theme.text }}>{cv.contact}</p>
                        <p style={{ fontSize:12,color:"#43C6AC",fontWeight:600 }}>{cv.title.split(" — ")[0]}</p>
                      </div>
                    </div>
                    <p style={{ color:theme.sub,fontSize:12,lineHeight:1.6,marginBottom:10,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{cv.description}</p>
                    <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                      {cv.ville&&<span style={{ fontSize:11,color:theme.sub }}>{"📍 "}{cv.ville}</span>}
                      {user&&user.id!==cv.authorId&&(
                        <button onClick={()=>{ setActiveConv({postId:cv.id,postTitle:cv.title,postPrice:"",postPhoto:null,receiverId:cv.authorId,receiverName:cv.contact,messages:messages.filter(m=>(m.post_id===cv.id)&&((m.sender_id===user.id&&m.receiver_id===cv.authorId)||(m.receiver_id===user.id&&m.sender_id===cv.authorId)))}); setShowMessages(true); }}
                          style={{ background:"rgba(108,99,255,0.1)",border:"none",color:"#6C63FF",padding:"3px 8px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer" }}>{"💬 Contacter"}</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}


    </>
  );
}

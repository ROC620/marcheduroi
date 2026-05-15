import React, { useState } from "react";

export default function RecrutementSection({ theme, user, setModal, windowWidth, posts, view }) {
  const [recrutTab, setRecrutTab] = useState("offres"); // "offres" | "cvs"

  return (
                </div>
                <div style={{ display:"flex",gap:8,flexShrink:0,flexWrap:"wrap" }}>
                  <button onClick={()=>{ setAdEditing(ad.id); setAdForm({ entreprise:ad.entreprise||"", slogan:ad.slogan||"", logo_url:ad.logo_url||"", lien:ad.lien||"", couleur1:ad.couleur1||"#6C63FF", couleur2:ad.couleur2||"#8B84FF", fin:ad.fin||"" }); setShowAdForm(true); }} style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"7px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer" }}>✏️ Modifier</button>
                  <button onClick={async()=>{
                    await supabase.from("ads").update({actif:!ad.actif}).eq("id",ad.id);
                    setAds(prev=>prev.map(a=>a.id===ad.id?{...a,actif:!a.actif}:a));
                    notify(ad.actif?"Bannière désactivée":"Bannière réactivée ✅");
                  }} style={{ background:ad.actif?"rgba(67,198,172,0.15)":"rgba(255,71,87,0.1)",border:"none",color:ad.actif?"#43C6AC":"#FF4757",padding:"7px 12px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>
                    {ad.actif?"✅ Active":"⏸ Inactive"}
                  </button>
                  <button onClick={async()=>{
                    await supabase.from("ads").delete().eq("id",ad.id);
                    setAds(prev=>prev.filter(a=>a.id!==ad.id));
                    notify("Bannière supprimée.");
                  }} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"7px 10px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

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

  );
}

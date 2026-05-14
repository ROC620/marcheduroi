import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import { VITRINE_THEMES, VITRINE_TYPES, NEWS_TYPES, getVitrineTheme, toSlug } from "../vitrineConstants";
import { VitrineCarousel, VitrineSection } from "./VitrineCarousel";

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
}


// -----------------------------------------------
// VitrineRenewal — Page de renouvellement
// Route : /vitrine/:slug/renouveler?token=XXX
// -----------------------------------------------

export default VitrineRequest;

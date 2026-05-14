// src/utils.js
// Fonctions utilitaires partagées entre tous les composants MarchéduRoi

const THEMES = {
  dark:   { bg:"#0D0F1A", card:"#1A1D30", text:"#E8E8F0", sub:"#9A9AB0", border:"#2A2D45", accent:"#10B981" },
  light:  { bg:"#F8FAFC", card:"#FFFFFF", text:"#1A1D30", sub:"#6B7280", border:"#E2E8F0", accent:"#10B981" },
  ocean:  { bg:"#0A1628", card:"#112240", text:"#E6F1FF", sub:"#8892B0", border:"#1E3A5F", accent:"#38BDF8" },
  nature: { bg:"#0D1F14", card:"#1A3122", text:"#E8F5E9", sub:"#81C784", border:"#2E7D32", accent:"#4ADE80" },
  royal:  { bg:"#0F0A1A", card:"#1E1432", text:"#EDE7F6", sub:"#B39DDB", border:"#4A148C", accent:"#A78BFA" },
  sunset: { bg:"#1A0F0A", card:"#2D1B10", text:"#FFF3E0", sub:"#FFAB76", border:"#5D2E0C", accent:"#FB923C" },
};

export const getThemeFromStorage = () => {
  try { return THEMES[localStorage.getItem("mdr_theme")] || THEMES.dark; } catch { return THEMES.dark; }
};

export const PHONE_CODES = {
  "BJ":"+229","TG":"+228","CI":"+225","SN":"+221","ML":"+223","BF":"+226",
  "NE":"+227","GN":"+224","NG":"+234","CM":"+237","CG":"+242","CD":"+243",
  "GA":"+241","MG":"+261","RW":"+250","BI":"+257","TD":"+235","MR":"+222",
  "FR":"+33","BE":"+32","CH":"+41","CA":"+1","US":"+1","GB":"+44"
};

export const PHONE_PLACEHOLDERS = {
  "BJ":"+229 0100000000","TG":"+228 90000000","CI":"+225 0100000000",
  "SN":"+221 700000000","NG":"+234 8000000000","CM":"+237 600000000",
  "FR":"+33 600000000","BE":"+32 470000000","GB":"+44 7000000000"
};

export const getPhonePrefix = () => {
  const c = localStorage.getItem("mdr_country") || "BJ";
  return PHONE_CODES[c] || "+";
};

export const getPhonePlaceholder = () => {
  const c = localStorage.getItem("mdr_country") || "BJ";
  return PHONE_PLACEHOLDERS[c] || (PHONE_CODES[c] ? PHONE_CODES[c] + " votre numéro" : "+indicatif votre numéro");
};

export const normalizeText  = v => (v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const maxLen         = (v, n) => v.slice(0, n);

export const cleanText      = (v, n=200) => maxLen(v.replace(/[<>{}[\]\\]/g, ""), n);

export const cleanLongText  = (v, n=1000) => maxLen(v.replace(/[<>{}[\]\\]/g, ""), n);

export const noSpaces       = v => v.replace(/\s/g, "");

export const onlyPhone      = v => v.replace(/[^0-9+\s\-()]/g, "").slice(0, 20);

export const isUrgentActive = (p) => p.urgent && p.urgentUntil && new Date(p.urgentUntil) > new Date();

export const toSlug = (str) =>
    str.toLowerCase()

export const canModifyFree = (post) => true;

export const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1||!lon1||!lat2||!lon2) return null;
    const R = 6371;
    const dLat = (lat2-lat1)*Math.PI/180;
    const dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  };

export const formatDistance = (km) => {
    if (km === null || km === undefined) return null;
    if (km < 1) return Math.round(km*1000)+" m";
    return km.toFixed(1)+" km";
  };

export const checkBlacklist = (text) => {
    const normalized = (text||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    return BLACKLIST.some(word => normalized.includes(word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")));
  };


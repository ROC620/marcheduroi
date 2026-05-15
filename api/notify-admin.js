// api/notify-admin.js
// Envoie une notification WhatsApp à l'admin après chaque paiement
// Via CallMeBot — gratuit, pas de compte requis

export const config = { runtime: "edge" };

const PHONE   = "22996109636";
const APIKEY  = "2831958";
const DOMAIN  = "https://marcheduroi.com";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { type, nom, montant, details } = await req.json();

    if (!type) {
      return new Response(JSON.stringify({ error: "type requis" }), { status: 400 });
    }

    // Construire le message selon le type de paiement
    const EMOJIS = {
      vitrine:      "🏛️",
      renouvellement: "🔄",
      boutique:     "🛍️",
      atelier:      "🔧",
      resto:        "🍽️",
      beaute:       "💇",
      sponsoring:   "⭐",
      urgent:       "🔴",
      pro:          "👑",
      demande:      "📢",
      modification: "✏️",
    };

    const LABELS = {
      vitrine:        "Nouvelle vitrine créée",
      renouvellement: "Vitrine renouvelée",
      boutique:       "Publication boutique",
      atelier:        "Publication atelier",
      resto:          "Publication restaurant",
      beaute:         "Publication salon beauté",
      sponsoring:     "Sponsoring annonce",
      urgent:         "Badge URGENT activé",
      pro:            "Badge PRO activé",
      demande:        "Demande publiée",
      modification:   "Modification annonce",
    };

    const emoji  = EMOJIS[type]  || "💰";
    const label  = LABELS[type]  || type;
    const now    = new Date().toLocaleString("fr-FR", { timeZone:"Africa/Porto-Novo", day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" });

    const message = `${emoji} PAIEMENT REÇU — MarchéduRoi 👑
━━━━━━━━━━━━━━━━━━
📋 ${label}
👤 ${nom || "Utilisateur"}
💰 ${montant ? montant.toLocaleString("fr-FR") + " FCFA" : "—"}
${details ? "ℹ️ " + details : ""}
🕐 ${now}
━━━━━━━━━━━━━━━━━━
${DOMAIN}`;

    const url = `https://api.callmebot.com/whatsapp.php?phone=${PHONE}&text=${encodeURIComponent(message)}&apikey=${APIKEY}`;

    const res = await fetch(url);
    const text = await res.text();

    return new Response(JSON.stringify({ success: true, response: text }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

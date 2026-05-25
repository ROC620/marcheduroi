// /api/listings-par-ville.js
// Route: /benin/cotonou/boutiques → GET /api/listings-par-ville?pays=BJ&ville=cotonou&type=boutiques
// Retourne: HTML avec liste COMPLÈTE de tous les boutiques à Cotonou, Bénin

export const config = { runtime: "edge" };

const SUPABASE_URL = "https://mvkcgrextvxlzkqsyscm.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12a2NncmV4dHZ4bHprcXN5c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjIwNDcsImV4cCI6MjA4ODc5ODA0N30.dvVbB0E5F-vhZMYlzIl4r-N1jOrRgrNZsp4xbDI_Nho";
const DOMAIN = "https://marcheduroi.com";

// Lookup pays → code ISO
const PAYS_CODES = {
  benin: "BJ", bénin: "BJ",
  togo: "TG",
  senegal: "SN", sénégal: "SN",
  gabon: "GA",
  cameroun: "CM",
  cotedivoire: "CI", côte: "CI", ivoire: "CI",
  mali: "ML",
  burkina: "BF",
  niger: "NE",
  guinee: "GN", guinée: "GN",
  congo: "CG",
  rdcongo: "CD",
  madagascar: "MG",
};

// Lookup code ISO → nom français
const PAYS_NOMS = {
  BJ: "Bénin",
  TG: "Togo",
  SN: "Sénégal",
  GA: "Gabon",
  CM: "Cameroun",
  CI: "Côte d'Ivoire",
  ML: "Mali",
  BF: "Burkina Faso",
  NE: "Niger",
  GN: "Guinée",
  CG: "Congo",
  CD: "RD Congo",
  MG: "Madagascar",
};

// Types autorisés (validation pour éviter les injections SQL)
const VALID_TYPES = {
  posts: "posts",
  annonces: "posts",
  boutiques: "boutiques",
  ateliers: "ateliers",
  restos: "restos",
  restaurants: "restos",
  beaute: "beaute",
  beauty: "beaute",
};

// Labels et emojis par type
const TYPE_LABELS = {
  posts: { label: "Annonces Classiques", emoji: "📋", color: "#6C63FF" },
  boutiques: { label: "Boutiques", emoji: "🛍️", color: "#FF6584" },
  ateliers: { label: "Ateliers", emoji: "🔧", color: "#43C6AC" },
  restos: { label: "Restaurants", emoji: "🍽️", color: "#FF8C00" },
  beaute: { label: "Beauté", emoji: "💇", color: "#FF69B4" },
};

async function fetchFromSupabase(table, paysCode, villeParam) {
  const headers = {
    apikey: SUPABASE_ANON,
    Authorization: `Bearer ${SUPABASE_ANON}`,
  };
  const base = SUPABASE_URL + "/rest/v1/" + table;
  // posts a "title", les etablissements ont "name" — selects differents pour eviter 400
  const nameField = table === "posts" ? "title" : "name";
  const selectFields = `id,${nameField},description,photos,ville,created_at,likes`;
  const select = `&order=created_at.desc&limit=1000&select=${selectFields}`;
  const search = villeParam.toLowerCase();

  const filterByVille = (data) =>
    data.filter(item => item.ville?.toLowerCase().includes(search));

  try {
    // Tentative 1 : filtre par pays
    const r1 = await fetch(base + "?country=eq." + paysCode + select, { headers });
    if (r1.ok) {
      const d1 = await r1.json();
      const result = filterByVille(d1);
      if (result.length > 0) return result;
    }

    // Tentative 2 : sans filtre pays (colonne absente ou donnees manquantes)
    const r2 = await fetch(base + "?" + select.slice(1), { headers });
    if (!r2.ok) return [];
    const d2 = await r2.json();
    return filterByVille(d2);
  } catch (e) {
    console.error("Error fetching " + table + ":", e);
    return [];
  }
}

export default async function handler(req) {
  const url = new URL(req.url);
  const paysParam = url.searchParams.get("pays") || "benin";
  const villeParam = url.searchParams.get("ville") || "cotonou";
  const typeParam = (url.searchParams.get("type") || "posts").toLowerCase();

  // Convertir "benin" → "BJ" et valider
  const paysCode = PAYS_CODES[paysParam.toLowerCase()] || paysParam.toUpperCase();
  const paysNom = PAYS_NOMS[paysCode] || paysParam;

  // Valider le type (sécurité)
  const tableName = VALID_TYPES[typeParam];
  if (!tableName) {
    return new Response("Type non valide", { status: 400 });
  }

  // Mode debug temporaire : ?debug=1
  if (url.searchParams.get("debug") === "1") {
    const headers = { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` };
    const base = SUPABASE_URL + "/rest/v1/" + tableName;
    const nameField2 = tableName === "posts" ? "title" : "name";
    const r1 = await fetch(base + "?country=eq." + paysCode + "&order=created_at.desc&limit=10&select=id," + nameField2 + ",ville,country", { headers });
    const d1 = r1.ok ? await r1.json() : { error: r1.status };
    const search = villeParam.toLowerCase();
    const filtered = Array.isArray(d1) ? d1.filter(i => i.ville?.toLowerCase().includes(search)) : [];
    return new Response(JSON.stringify({ paysCode, villeParam, search, total: Array.isArray(d1) ? d1.length : 0, filtered: filtered.length, raw: d1 }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Récupérer les données
  const listings = await fetchFromSupabase(tableName, paysCode, villeParam);

  if (listings.length === 0) {
    const typeInfo2 = TYPE_LABELS[tableName];
    const villeDisplay = villeParam.charAt(0).toUpperCase() + villeParam.slice(1);
    return new Response(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>Aucun résultat — MarchéduRoi</title></head><body style="font-family:Arial,sans-serif;max-width:600px;margin:60px auto;text-align:center;color:#333"><h2>${typeInfo2.emoji} Aucune ${typeInfo2.label.toLowerCase()} trouvée</h2><p>Aucun résultat pour <strong>${villeDisplay}</strong>, ${paysNom}.</p><a href="https://marcheduroi.com" style="color:#43C6AC;font-weight:600">← Retour à MarchéduRoi</a></body></html>`, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const typeInfo = TYPE_LABELS[tableName];
  const titre = `${typeInfo.emoji} ${typeInfo.label} à ${villeParam.charAt(0).toUpperCase() + villeParam.slice(1)}, ${paysNom} | MarchéduRoi`;
  const description = `Découvrez ${listings.length} ${typeInfo.label.toLowerCase()} à ${villeParam} au ${paysNom}. MarchéduRoi - Plateforme multipolaire pour l'Afrique.`;
  const urlCanonical = `${DOMAIN}/${paysParam}/${villeParam}/${typeParam}`;

  // Générer les cartes
  const renderCard = (item) => {
    const image = item.photos?.[0] || `${DOMAIN}/marcheduRoi-icon.svg`;
    const nom = item.name || item.title;
    const lien = `${DOMAIN}/${tableName === "posts" ? "annonce" : tableName.slice(0, -1)}/${item.id}`;

    return `
      <div style="border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; background: white; transition: box-shadow 0.2s;">
        <img src="${image}" alt="${nom}" style="width: 100%; height: 180px; object-fit: cover;">
        <div style="padding: 12px;">
          <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #333;">${nom}</h3>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; line-height: 1.4;">${(item.description || "").substring(0, 80)}...</p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #999;">
            <span>📍 ${item.ville || villeParam.charAt(0).toUpperCase() + villeParam.slice(1)}</span>
            <span>❤️ ${item.likes || 0}</span>
          </div>
          <a href="${lien}" style="display: inline-block; margin-top: 8px; color: white; background: ${typeInfo.color}; padding: 6px 10px; border-radius: 3px; text-decoration: none; font-size: 11px; font-weight: 600;">Détails →</a>
        </div>
      </div>
    `;
  };

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${titre}</title>
  <meta name="description" content="${description}"/>
  <meta property="og:title" content="${titre}"/>
  <meta property="og:description" content="${description}"/>
  <meta property="og:image" content="${DOMAIN}/marcheduRoi-icon.svg"/>
  <meta property="og:url" content="${urlCanonical}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="MarchéduRoi"/>
  <link rel="canonical" href="${urlCanonical}"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f9f9f9; }
    .header { background: linear-gradient(135deg, ${typeInfo.color}, ${typeInfo.color}cc); color: white; padding: 24px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 8px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .container { max-width: 1000px; margin: 0 auto; padding: 24px; }
    .count { font-size: 14px; color: #666; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; border-top: 1px solid #ddd; margin-top: 40px; }
    a { color: ${typeInfo.color}; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${typeInfo.emoji} ${typeInfo.label}</h1>
    <p>à ${villeParam.charAt(0).toUpperCase() + villeParam.slice(1)}, ${paysNom}</p>
  </div>
  <div class="container">
    <p class="count">🔍 ${listings.length} résultat(s) trouvé(s)</p>
    <div class="grid">
      ${listings.map(item => renderCard(item)).join("")}
    </div>
    <div class="footer">
      <p>MarchéduRoi © 2026 • Plateforme numérique multipolaire • <a href="${DOMAIN}">Retour à l'accueil</a></p>
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=1800, stale-while-revalidate=86400",
    },
  });
}

// /api/ville-hub.js
// Route: /benin/cotonou → GET /api/ville-hub?pays=BJ&ville=cotonou
// Retourne: HTML avec top 5 annonces/boutiques/ateliers/restos/beaute de cette ville

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

async function fetchFromSupabase(table, paysCode, villeParam) {
  try {
    // IMPORTANT: Filtre ville avec ILIKE (case-insensitive) OU ville IS NULL (nationwide)
    // Limit 5 pour le hub
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?country=eq.${paysCode}&or=(ville.ilike.%25${villeParam}%25,ville.is.null)&order=created_at.desc&limit=5&select=id,name,title,description,photos,ville,created_at`,
      {
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: `Bearer ${SUPABASE_ANON}`,
        },
      }
    );

    if (!response.ok) return [];
    return await response.json();
  } catch (e) {
    console.error(`Error fetching ${table}:`, e);
    return [];
  }
}

export default async function handler(req) {
  const url = new URL(req.url);
  const paysParam = url.searchParams.get("pays") || "benin";
  const villeParam = url.searchParams.get("ville") || "cotonou";

  // Convertir "benin" → "BJ"
  const paysCode = PAYS_CODES[paysParam.toLowerCase()] || paysParam.toUpperCase();
  const paysNom = PAYS_NOMS[paysCode] || paysParam;

  // Valider que c'est un pays connu
  if (!Object.values(PAYS_CODES).includes(paysCode) && Object.keys(PAYS_NOMS).length === 0) {
    return new Response("Pays non reconnu", { status: 404 });
  }

  // Récupérer les données de Supabase en parallèle
  const [posts, boutiques, ateliers, restos, beaute] = await Promise.all([
    fetchFromSupabase("posts", paysCode, villeParam),
    fetchFromSupabase("boutiques", paysCode, villeParam),
    fetchFromSupabase("ateliers", paysCode, villeParam),
    fetchFromSupabase("restos", paysCode, villeParam),
    fetchFromSupabase("beaute", paysCode, villeParam),
  ]);

  // Construire le titre et description
  const titre = `Annonces à ${villeParam.charAt(0).toUpperCase() + villeParam.slice(1)}, ${paysNom} | MarchéduRoi`;
  const description = `Achetez, vendez, découvrez des boutiques, restaurants et services à ${villeParam} au ${paysNom}. Plateforme multipolaire pour l'Afrique francophone.`;
  const urlCanonical = `${DOMAIN}/${paysParam}/${villeParam}`;

  // Générer les cartes HTML
  const renderCard = (item, type) => {
    const image = item.photos?.[0] || `${DOMAIN}/marcheduRoi-icon.svg`;
    const nom = item.name || item.title;
    const lien = `${DOMAIN}/${type}/${item.id}`;

    return `
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 12px; background: #fff;">
        <img src="${image}" alt="${nom}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
        <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600;">${nom}</h3>
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${item.description?.substring(0, 100) || ""}...</p>
        <p style="margin: 0; font-size: 11px; color: #999;">📍 ${item.ville || villeParam.charAt(0).toUpperCase() + villeParam.slice(1)}</p>
        <a href="${lien}" style="display: inline-block; margin-top: 6px; color: #43C6AC; text-decoration: none; font-size: 12px; font-weight: 600;">Voir →</a>
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
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    h1 { color: #333; margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 24px; font-size: 14px; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 12px; border-bottom: 2px solid #43C6AC; padding-bottom: 8px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
    a { color: #43C6AC; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Annonces à ${villeParam.charAt(0).toUpperCase() + villeParam.slice(1)}</h1>
  <p class="subtitle">${paysNom} • Achetez, vendez, découvrez des établissements</p>

  ${posts.length > 0 ? `
    <div class="section">
      <div class="section-title">📋 Annonces Classiques (${posts.length})</div>
      <div class="grid">
        ${posts.map(p => renderCard(p, "annonce")).join("")}
      </div>
      <a href="${DOMAIN}/${paysParam}/${villeParam}/posts" style="display: inline-block; margin-top: 12px; padding: 10px 16px; background: #43C6AC; color: white; border-radius: 4px; font-weight: 600;">Voir toutes les annonces →</a>
    </div>
  ` : ""}

  ${boutiques.length > 0 ? `
    <div class="section">
      <div class="section-title">🛍️ Boutiques (${boutiques.length})</div>
      <div class="grid">
        ${boutiques.map(b => renderCard(b, "boutique")).join("")}
      </div>
      <a href="${DOMAIN}/${paysParam}/${villeParam}/boutiques" style="display: inline-block; margin-top: 12px; padding: 10px 16px; background: #FF6584; color: white; border-radius: 4px; font-weight: 600;">Voir toutes les boutiques →</a>
    </div>
  ` : ""}

  ${ateliers.length > 0 ? `
    <div class="section">
      <div class="section-title">🔧 Ateliers (${ateliers.length})</div>
      <div class="grid">
        ${ateliers.map(a => renderCard(a, "atelier")).join("")}
      </div>
      <a href="${DOMAIN}/${paysParam}/${villeParam}/ateliers" style="display: inline-block; margin-top: 12px; padding: 10px 16px; background: #43C6AC; color: white; border-radius: 4px; font-weight: 600;">Voir tous les ateliers →</a>
    </div>
  ` : ""}

  ${restos.length > 0 ? `
    <div class="section">
      <div class="section-title">🍽️ Restaurants (${restos.length})</div>
      <div class="grid">
        ${restos.map(r => renderCard(r, "resto")).join("")}
      </div>
      <a href="${DOMAIN}/${paysParam}/${villeParam}/restos" style="display: inline-block; margin-top: 12px; padding: 10px 16px; background: #FF8C00; color: white; border-radius: 4px; font-weight: 600;">Voir tous les restaurants →</a>
    </div>
  ` : ""}

  ${beaute.length > 0 ? `
    <div class="section">
      <div class="section-title">💇 Beauté (${beaute.length})</div>
      <div class="grid">
        ${beaute.map(b => renderCard(b, "beaute")).join("")}
      </div>
      <a href="${DOMAIN}/${paysParam}/${villeParam}/beaute" style="display: inline-block; margin-top: 12px; padding: 10px 16px; background: #FF69B4; color: white; border-radius: 4px; font-weight: 600;">Voir tous les services beauté →</a>
    </div>
  ` : ""}

  <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
    MarchéduRoi © 2026 • Plateforme numérique multipolaire • Bénin & Afrique
  </p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

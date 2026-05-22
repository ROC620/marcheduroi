// /api/sitemap.xml.js
// Route: /sitemap.xml
// Retourne: Sitemap XML dynamique avec toutes les villes/pays/types disponibles

export const config = { runtime: "edge" };

const SUPABASE_URL = "https://mvkcgrextvxlzkqsyscm.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12a2NncmV4dHZ4bHprcXN5c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjIwNDcsImV4cCI6MjA4ODc5ODA0N30.dvVbB0E5F-vhZMYlzIl4r-N1jOrRgrNZsp4xbDI_Nho";
const DOMAIN = "https://marcheduroi.com";

// Lookup code ISO → nom de pays pour l'URL
const PAYS_SLUGS = {
  BJ: "benin",
  TG: "togo",
  SN: "senegal",
  GA: "gabon",
  CM: "cameroun",
  CI: "cotedivoire",
  ML: "mali",
  BF: "burkina",
  NE: "niger",
  GN: "guinee",
  CG: "congo",
  CD: "rdcongo",
  MG: "madagascar",
};

const TYPES = ["posts", "boutiques", "ateliers", "restos", "beaute"];

async function getDistinctPayVille() {
  try {
    // Récupérer les pays/villes uniques depuis TOUS les types
    // Approche: lancer une requête par table et merger
    const results = new Map(); // key: "BJ:Cotonou"

    for (const table of ["posts", "boutiques", "ateliers", "restos", "beaute"]) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/${table}?select=country,ville&limit=1000`,
          {
            headers: {
              apikey: SUPABASE_ANON,
              Authorization: `Bearer ${SUPABASE_ANON}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          data.forEach((row) => {
            if (row.country) {
              const key = `${row.country}:${row.ville || "null"}`;
              results.set(key, { country: row.country, ville: row.ville });
            }
          });
        }
      } catch (e) {
        console.error(`Error fetching ${table}:`, e);
      }
    }

    return Array.from(results.values());
  } catch (e) {
    console.error("Error getting distinct pays/ville:", e);
    // Fallback: retourner les villes principales
    return [
      { country: "BJ", ville: "Cotonou" },
      { country: "BJ", ville: "Ouidah" },
      { country: "BJ", ville: "Porto-Novo" },
      { country: "TG", ville: "Lomé" },
      { country: "SN", ville: "Dakar" },
    ];
  }
}

export default async function handler(req) {
  const entries = [];

  // 1. URL racine
  entries.push({
    loc: DOMAIN,
    lastmod: new Date().toISOString().split("T")[0],
    changefreq: "daily",
    priority: "1.0",
  });

  // 2. Récupérer les pays/villes uniques
  const paysVilles = await getDistinctPayVille();

  // Créer un set unique (country, ville)
  const uniquePairs = new Set();
  paysVilles.forEach((pv) => {
    uniquePairs.add(`${pv.country}:${pv.ville || "null"}`);
  });

  // 3. Générer les URLs pour chaque pays/ville
  uniquePairs.forEach((pair) => {
    const [country, ville] = pair.split(":");
    const villeSlug = ville === "null" ? "national" : ville.toLowerCase().replace(/\s+/g, "-");
    const paysSlug = PAYS_SLUGS[country] || country.toLowerCase();

    // Hub ville
    entries.push({
      loc: `${DOMAIN}/${paysSlug}/${villeSlug}`,
      lastmod: new Date().toISOString().split("T")[0],
      changefreq: "daily",
      priority: "0.9",
    });

    // Chaque type de listing
    TYPES.forEach((type) => {
      entries.push({
        loc: `${DOMAIN}/${paysSlug}/${villeSlug}/${type}`,
        lastmod: new Date().toISOString().split("T")[0],
        changefreq: "weekly",
        priority: "0.8",
      });
    });
  });

  // 4. Générer le XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

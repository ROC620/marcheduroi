// api/vitrine-og.js
// Edge Function Vercel — retourne une page HTML avec les bonnes meta OG
// pour chaque vitrine selon son slug
// URL : marcheduroi.com/api/vitrine-og?slug=restaurant-chez-tante-rosine-calavi
//
// Usage dans index.html ou via redirection :
// WhatsApp et Facebook scrappent cette URL pour obtenir les meta OG

export const config = { runtime: "edge" };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  const SUPABASE_URL  = process.env.VITE_SUPABASE_URL    || process.env.SUPABASE_URL;
  const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const DOMAIN        = "https://marcheduroi.com";
  const DEFAULT_IMAGE = `${DOMAIN}/icons/icon-512x512.png`;

  // Valeurs par défaut (si pas de slug ou erreur)
  let title       = "MarchéduRoi — Annonces, Boutiques & Services au Bénin";
  let description = "Achetez, vendez, découvrez des boutiques, restaurants et services près de chez vous au Bénin et en Afrique.";
  let image       = DEFAULT_IMAGE;
  let url         = DOMAIN;
  let type        = "website";

  // Si un slug est fourni, charger les données de la vitrine
  if (slug) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/structures?slug=eq.${encodeURIComponent(slug)}&active=eq.true&select=name,type,slogan,description,cover_url,logo_url,photos,ville,quartier&limit=1`,
        {
          headers: {
            "apikey":        SUPABASE_ANON,
            "Authorization": `Bearer ${SUPABASE_ANON}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const s = data?.[0];

        if (s) {
          title       = `${s.name} — ${s.type}${s.ville ? ` à ${s.ville}` : ""} | MarchéduRoi`;
          description = (s.description || s.slogan || `Découvrez ${s.name}, ${s.type} sur MarchéduRoi`).slice(0, 160);
          image       = s.cover_url || s.logo_url || (s.photos?.[0]) || DEFAULT_IMAGE;
          url         = `${DOMAIN}/vitrine/${slug}`;
          type        = "local.business";
        }
      }
    } catch (e) {
      // Silencieux — utiliser les valeurs par défaut
    }
  }

  // Retourner une page HTML minimale avec les bonnes meta
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>

  <!-- Open Graph -->
  <meta property="og:title"       content="${title}"/>
  <meta property="og:description" content="${description}"/>
  <meta property="og:image"       content="${image}"/>
  <meta property="og:url"         content="${url}"/>
  <meta property="og:type"        content="${type}"/>
  <meta property="og:site_name"   content="MarchéduRoi"/>
  <meta property="og:locale"      content="fr_BJ"/>

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image"/>
  <meta name="twitter:title"       content="${title}"/>
  <meta name="twitter:description" content="${description}"/>
  <meta name="twitter:image"       content="${image}"/>

  <!-- Redirection automatique vers la vraie page -->
  <meta http-equiv="refresh" content="0; url=${url}"/>
  <link rel="canonical" href="${url}"/>
</head>
<body>
  <script>window.location.replace("${url}");</script>
  <p>Redirection vers <a href="${url}">${title}</a>...</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type":  "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

// api/og.js — Vercel Edge Function
// Génère des meta OG dynamiques pour chaque annonce
// avec logo MarchéduRoi en filigrane sur la photo

export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://mvkcgrextvxlzkqsyscm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12a2NncmV4dHZ4bHprcXN5c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjIwNDcsImV4cCI6MjA4ODc5ODA0N30.dvVbB0E5F-vhZMYlzIl4r-N1jOrRgrNZsp4xbDI_Nho';

const LOGO_URL = 'https://marcheduroi.com/marcheduRoi-icon.svg';
const SITE_URL = 'https://marcheduroi.com';
const DEFAULT_IMAGE = 'https://marcheduroi.com/icons/icon-512x512.png';
const SLOGAN = 'Sur MarchéduRoi, vous êtes le Roi du Marché 👑';

// Déterminer la table selon le type d'URL
function getTableAndId(pathname) {
  const patterns = [
    { regex: /^\/annonce\/(.+)$/, table: 'posts', titleField: 'title' },
    { regex: /^\/boutique\/(.+)$/, table: 'boutiques', titleField: 'name' },
    { regex: /^\/atelier\/(.+)$/, table: 'ateliers', titleField: 'name' },
    { regex: /^\/resto\/(.+)$/, table: 'restos', titleField: 'name' },
    { regex: /^\/beaute\/(.+)$/, table: 'beaute', titleField: 'name' },
  ];
  for (const p of patterns) {
    const m = pathname.match(p.regex);
    if (m) return { table: p.table, id: m[1], titleField: p.titleField };
  }
  return null;
}

// Générer l'URL d'image avec logo en overlay via SVG
function generateOgImageUrl(photoUrl, title, price) {
  // On utilise un SVG data URI qui combine photo + logo
  // Retourne directement l'URL de la photo Supabase si pas de canvas disponible
  return photoUrl || DEFAULT_IMAGE;
}

// HTML avec meta OG pour l'annonce
function buildHtml({ title, description, image, url, price, category }) {
  const fullTitle = price
    ? `${title} — ${price} FCFA | MarchéduRoi`
    : `${title} | MarchéduRoi`;
  const fullDesc = description
    ? `${description.slice(0, 160)} | ${SLOGAN}`
    : `${SLOGAN} — marcheduroi.com`;

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${fullTitle}</title>

    <!-- Open Graph -->
    <meta property="og:title" content="${fullTitle}" />
    <meta property="og:description" content="${fullDesc}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="MarchéduRoi" />
    <meta property="og:locale" content="fr_BJ" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${fullTitle}" />
    <meta name="twitter:description" content="${fullDesc}" />
    <meta name="twitter:image" content="${image}" />

    <!-- WhatsApp / Telegram -->
    <meta name="description" content="${fullDesc}" />

    <!-- Rediriger vers la SPA React après que les crawlers ont lu les meta -->
    <script>
      // Si c'est un vrai navigateur (pas un crawler), rediriger vers la SPA
      if (typeof window !== 'undefined') {
        window.location.replace('${url}#loaded');
      }
    </script>
    <noscript>
      <meta http-equiv="refresh" content="0; url=${url}" />
    </noscript>
  </head>
  <body style="background:#0D0F1A;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;flex-direction:column;gap:16px;padding:20px;text-align:center;">
    <img src="${LOGO_URL}" alt="MarchéduRoi" style="width:80px;height:auto;" />
    <h1 style="font-size:24px;margin:0;">${title}</h1>
    ${price ? `<p style="color:#43C6AC;font-size:20px;font-weight:700;margin:0;">${price} FCFA</p>` : ''}
    <p style="color:#FFD700;font-style:italic;margin:0;">"${SLOGAN}"</p>
    <a href="${url}" style="background:#6C63FF;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;">Voir l'annonce →</a>
  </body>
</html>`;
}

export default async function handler(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Vérifier si c'est un crawler (User-Agent)
  const ua = req.headers.get('user-agent') || '';
  const isCrawler = /facebookexternalhit|Twitterbot|WhatsApp|TelegramBot|LinkedInBot|Slackbot|Googlebot|bingbot|Applebot|Discordbot/i.test(ua);

  const match = getTableAndId(pathname);

  // Si ce n'est pas une URL d'annonce ou pas un crawler → retourner index.html normal
  if (!match || !isCrawler) {
    return new Response(null, {
      status: 302,
      headers: { 'Location': SITE_URL + pathname + url.search + url.hash }
    });
  }

  try {
    // Récupérer l'annonce depuis Supabase
    const apiUrl = `${SUPABASE_URL}/rest/v1/${match.table}?id=eq.${match.id}&select=*&limit=1`;
    const resp = await fetch(apiUrl, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    });

    const data = await resp.json();
    const item = data?.[0];

    if (!item) {
      // Annonce non trouvée → retourner page générique
      return new Response(buildHtml({
        title: 'MarchéduRoi — Le Marché des Rois',
        description: SLOGAN,
        image: DEFAULT_IMAGE,
        url: SITE_URL,
        price: null,
        category: null,
      }), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 's-maxage=300' }
      });
    }

    // Extraire les données
    const title = item[match.titleField] || item.title || item.name || 'Annonce MarchéduRoi';
    const description = item.description || '';
    const price = item.price ? String(item.price).replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : null;
    const photos = item.photos || [];
    const photo = photos[0] || null;
    const pageUrl = `${SITE_URL}${pathname}`;

    // Image avec logo en overlay
    // On utilise l'image directe de Supabase (la plus simple et fiable)
    const ogImage = photo || DEFAULT_IMAGE;

    const html = buildHtml({
      title,
      description,
      image: ogImage,
      url: pageUrl,
      price,
      category: item.category || item.type || '',
    });

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      }
    });

  } catch (err) {
    // En cas d'erreur → page générique
    return new Response(buildHtml({
      title: 'MarchéduRoi — Le Marché des Rois',
      description: SLOGAN,
      image: DEFAULT_IMAGE,
      url: SITE_URL,
      price: null,
    }), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

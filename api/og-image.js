// api/og-image.js — Génère une image OG avec logo MarchéduRoi en overlay
export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://mvkcgrextvxlzkqsyscm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12a2NncmV4dHZ4bHprcXN5c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjIwNDcsImV4cCI6MjA4ODc5ODA0N30.dvVbB0E5F-vhZMYlzIl4r-N1jOrRgrNZsp4xbDI_Nho';
const SITE_URL = 'https://marcheduroi.com';
const DEFAULT_IMAGE = 'https://marcheduroi.com/icons/icon-512x512.png';

// SVG du logo MarchéduRoi simplifié (couronne dorée)
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 36 32">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#111111"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff2a0"/>
      <stop offset="35%" stop-color="#ffd84d"/>
      <stop offset="70%" stop-color="#d59a00"/>
      <stop offset="100%" stop-color="#8a4f00"/>
    </linearGradient>
  </defs>
  <rect x="0.8" y="0.8" width="34.4" height="30.4" rx="6" fill="url(#bg)" stroke="url(#gold)" stroke-width="0.9"/>
  <g stroke="url(#gold)" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="18" cy="5.2" r="1.9" fill="#ffef8a" stroke-width="0.5"/>
    <circle cx="9.8" cy="9.1" r="1.6" fill="#ffef8a" stroke-width="0.45"/>
    <circle cx="26.2" cy="9.1" r="1.6" fill="#ffef8a" stroke-width="0.45"/>
    <path d="M10.8 10.2 L14.4 5.8 L18 8.7 L21.6 5.8 L25.2 10.2" fill="url(#gold)" stroke-width="0.8"/>
    <path d="M9.6 9.9 L9.4 13.2 L11.5 13.6 L12.4 10.7" fill="url(#gold)" stroke-width="0.55"/>
    <path d="M26.4 9.9 L26.6 13.2 L24.5 13.6 L23.6 10.7" fill="url(#gold)" stroke-width="0.55"/>
    <path d="M14 15.2 L14 24.8 L16.2 24.8 L16.2 19.8 L19.1 24.8 L21 24.8 L18.1 19.7 L20.9 15.2" fill="none" stroke-width="2.05"/>
    <path d="M14 15.2 L16.3 15.2 L16.3 17.5 L18.6 17.5 L18.6 15.2 L20.9 15.2" fill="none" stroke-width="2.05"/>
  </g>
</svg>`;

const LOGO_B64 = Buffer.from(LOGO_SVG).toString('base64');

function getTableAndId(url) {
  const patterns = [
    { regex: /^\/annonce\/(.+)$/, table: 'posts', titleField: 'title' },
    { regex: /^\/boutique\/(.+)$/, table: 'boutiques', titleField: 'name' },
    { regex: /^\/atelier\/(.+)$/, table: 'ateliers', titleField: 'name' },
    { regex: /^\/resto\/(.+)$/, table: 'restos', titleField: 'name' },
    { regex: /^\/beaute\/(.+)$/, table: 'beaute', titleField: 'name' },
  ];
  for (const p of patterns) {
    const m = url.match(p.regex);
    if (m) return { table: p.table, id: m[1], titleField: p.titleField };
  }
  return null;
}

function formatPrice(rawPrice) {
  if (!rawPrice) return null;
  const digits = String(rawPrice).replace(/[^0-9]/g, '');
  if (!digits) return null;
  return parseInt(digits).toLocaleString('fr-FR').replace(/\u202f|\s/g, ' ') + ' FCFA';
}

export default async function handler(req) {
  const url = new URL(req.url);
  const pathname = url.pathname.replace('/api/og-image', '') || url.searchParams.get('path') || '';

  const match = getTableAndId(pathname);
  if (!match) {
    return new Response(null, { status: 302, headers: { 'Location': DEFAULT_IMAGE } });
  }

  try {
    const apiUrl = SUPABASE_URL + '/rest/v1/' + match.table + '?id=eq.' + match.id + '&select=*&limit=1';
    const resp = await fetch(apiUrl, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    });
    const data = await resp.json();
    const item = data?.[0];

    const photoUrl = (item?.photos || [])[0] || null;
    const title = item ? (item[match.titleField] || item.title || item.name || '') : '';
    const price = item ? formatPrice(item.price) : null;

    if (!photoUrl) {
      return new Response(null, { status: 302, headers: { 'Location': DEFAULT_IMAGE } });
    }

    // Charger la photo de l'annonce
    const photoResp = await fetch(photoUrl);
    const photoBlob = await photoResp.arrayBuffer();
    const photoB64 = btoa(String.fromCharCode(...new Uint8Array(photoBlob)));
    const photoMime = photoResp.headers.get('content-type') || 'image/jpeg';

    // Générer SVG composite : photo en fond + logo + texte
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- Photo de l'annonce en fond -->
  <image href="data:${photoMime};base64,${photoB64}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>

  <!-- Dégradé sombre en bas pour lisibilité du texte -->
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="60%" stop-color="rgba(0,0,0,0.5)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.85)"/>
    </linearGradient>
    <linearGradient id="badge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(0,0,0,0.75)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#grad)"/>

  <!-- Badge logo coin haut-gauche -->
  <rect x="16" y="16" width="220" height="52" rx="12" fill="url(#badge)"/>
  <image href="data:image/svg+xml;base64,${LOGO_B64}" x="22" y="20" width="44" height="44"/>
  <text x="74" y="38" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#FFD700">MarchéduRoi</text>
  <text x="74" y="58" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,0.8)">marcheduroi.com</text>

  <!-- Titre de l'annonce en bas -->
  ${title ? `<text x="40" y="${price ? 555 : 580}" font-family="Arial,sans-serif" font-size="42" font-weight="800" fill="white" filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.8))">${title.slice(0, 40)}${title.length > 40 ? '...' : ''}</text>` : ''}
  ${price ? `<text x="40" y="605" font-family="Arial,sans-serif" font-size="36" font-weight="700" fill="#43C6AC" filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.8))">${price}</text>` : ''}

  <!-- Slogan coin bas-droit -->
  <text x="1160" y="615" font-family="Arial,sans-serif" font-size="14" font-style="italic" fill="#FFD700" text-anchor="end" opacity="0.9">Sur MarchéduRoi, vous êtes le Roi du Marché 👑</text>
</svg>`;

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600',
      }
    });

  } catch (e) {
    return new Response(null, { status: 302, headers: { 'Location': DEFAULT_IMAGE } });
  }
}

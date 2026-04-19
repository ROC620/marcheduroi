// api/og-image.js — Génère une image OG avec logo MarchéduRoi en overlay
export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://mvkcgrextvxlzkqsyscm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12a2NncmV4dHZ4bHprcXN5c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjIwNDcsImV4cCI6MjA4ODc5ODA0N30.dvVbB0E5F-vhZMYlzIl4r-N1jOrRgrNZsp4xbDI_Nho';
const SITE_URL = 'https://marcheduroi.com';
const DEFAULT_IMAGE = 'https://marcheduroi.com/icons/icon-512x512.png';

function getTableAndId(pathname) {
  const patterns = [
    { regex: /\/annonce\/(.+)$/, table: 'posts', titleField: 'title' },
    { regex: /\/boutique\/(.+)$/, table: 'boutiques', titleField: 'name' },
    { regex: /\/atelier\/(.+)$/, table: 'ateliers', titleField: 'name' },
    { regex: /\/resto\/(.+)$/, table: 'restos', titleField: 'name' },
    { regex: /\/beaute\/(.+)$/, table: 'beaute', titleField: 'name' },
  ];
  for (const p of patterns) {
    const m = pathname.match(p.regex);
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

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default async function handler(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  const match = getTableAndId(pathname);
  if (!match) {
    return new Response(null, { status: 302, headers: { 'Location': DEFAULT_IMAGE } });
  }

  try {
    // Récupérer l'annonce
    const apiUrl = SUPABASE_URL + '/rest/v1/' + match.table + '?id=eq.' + match.id + '&select=*&limit=1';
    const resp = await fetch(apiUrl, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    });
    const data = await resp.json();
    const item = data?.[0];

    if (!item) {
      return new Response(null, { status: 302, headers: { 'Location': DEFAULT_IMAGE } });
    }

    const photoUrl = (item?.photos || [])[0] || null;
    const title = (item[match.titleField] || item.title || item.name || '').slice(0, 45);
    const price = formatPrice(item.price);

    if (!photoUrl) {
      return new Response(null, { status: 302, headers: { 'Location': DEFAULT_IMAGE } });
    }

    // Charger la photo
    const photoResp = await fetch(photoUrl);
    if (!photoResp.ok) {
      return new Response(null, { status: 302, headers: { 'Location': DEFAULT_IMAGE } });
    }
    const photoBuffer = await photoResp.arrayBuffer();
    const photoB64 = arrayBufferToBase64(photoBuffer);
    const photoMime = photoResp.headers.get('content-type') || 'image/jpeg';

    // Logo MarchéduRoi en base64 (SVG inline)
    const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="39" viewBox="0 0 36 32"><defs><linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#111"/><stop offset="100%" stop-color="#000"/></linearGradient><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff2a0"/><stop offset="35%" stop-color="#ffd84d"/><stop offset="70%" stop-color="#d59a00"/><stop offset="100%" stop-color="#8a4f00"/></linearGradient></defs><rect x="0.8" y="0.8" width="34.4" height="30.4" rx="6" fill="url(#bg2)" stroke="url(#g2)" stroke-width="0.9"/><g stroke="url(#g2)" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5.2" r="1.9" fill="#ffef8a" stroke-width="0.5"/><circle cx="9.8" cy="9.1" r="1.6" fill="#ffef8a" stroke-width="0.45"/><circle cx="26.2" cy="9.1" r="1.6" fill="#ffef8a" stroke-width="0.45"/><path d="M10.8 10.2 L14.4 5.8 L18 8.7 L21.6 5.8 L25.2 10.2" fill="url(#g2)" stroke-width="0.8"/><path d="M9.6 9.9 L9.4 13.2 L11.5 13.6 L12.4 10.7" fill="url(#g2)" stroke-width="0.55"/><path d="M26.4 9.9 L26.6 13.2 L24.5 13.6 L23.6 10.7" fill="url(#g2)" stroke-width="0.55"/><path d="M14 15.2 L14 24.8 L16.2 24.8 L16.2 19.8 L19.1 24.8 L21 24.8 L18.1 19.7 L20.9 15.2" fill="none" stroke-width="2.05"/><path d="M14 15.2 L16.3 15.2 L16.3 17.5 L18.6 17.5 L18.6 15.2 L20.9 15.2" fill="none" stroke-width="2.05"/></g></svg>';
    const logoB64 = btoa(unescape(encodeURIComponent(logoSvg)));

    // Générer le SVG composite
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630">',
      '<defs>',
      '<linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0%" stop-color="rgba(0,0,0,0)"/>',
      '<stop offset="55%" stop-color="rgba(0,0,0,0.4)"/>',
      '<stop offset="100%" stop-color="rgba(0,0,0,0.88)"/>',
      '</linearGradient>',
      '</defs>',

      // Photo fond
      '<image href="data:' + photoMime + ';base64,' + photoB64 + '" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>',

      // Dégradé sombre
      '<rect width="1200" height="630" fill="url(#grad)"/>',

      // Badge haut-gauche fond
      '<rect x="14" y="14" width="226" height="54" rx="12" fill="rgba(0,0,0,0.7)"/>',

      // Logo
      '<image href="data:image/svg+xml;base64,' + logoB64 + '" x="20" y="18" width="44" height="44"/>',

      // Texte badge
      '<text x="72" y="37" font-family="Arial,sans-serif" font-size="17" font-weight="800" fill="#FFD700">MarchéduRoi</text>',
      '<text x="72" y="57" font-family="Arial,sans-serif" font-size="13" fill="rgba(255,255,255,0.75)">marcheduroi.com</text>',

      // Titre annonce
      title ? '<text x="40" y="' + (price ? '548' : '575') + '" font-family="Arial,sans-serif" font-size="44" font-weight="800" fill="white">' + title + (item[match.titleField]?.length > 45 ? '...' : '') + '</text>' : '',

      // Prix
      price ? '<text x="40" y="606" font-family="Arial,sans-serif" font-size="38" font-weight="700" fill="#43C6AC">' + price + '</text>' : '',

      // Slogan bas-droite
      '<text x="1185" y="618" font-family="Arial,sans-serif" font-size="15" font-style="italic" fill="#FFD700" text-anchor="end" opacity="0.95">Sur MarchéduRoi, vous êtes le Roi du Marché</text>',

      '</svg>'
    ].join('\n');

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 's-maxage=86400',
      }
    });

  } catch (e) {
    return new Response(null, { status: 302, headers: { 'Location': DEFAULT_IMAGE } });
  }
}

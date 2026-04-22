// api/og.js — Vercel Edge Function
export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://mvkcgrextvxlzkqsyscm.supabase.co';
const SUPABASE_KEY = 'TA_CLE_SUPABASE';
const SITE_URL = 'https://marcheduroi.com';
const DEFAULT_IMAGE = 'https://marcheduroi.com/icons/icon-512x512.png';
const SLOGAN = 'Sur MarchéduRoi, vous êtes le Roi du Marché';

const TABLE_MAP = {
  posts:     { table: 'posts',     titleField: 'title' },
  boutiques: { table: 'boutiques', titleField: 'name'  },
  ateliers:  { table: 'ateliers',  titleField: 'name'  },
  restos:    { table: 'restos',    titleField: 'name'  },
  beaute:    { table: 'beaute',    titleField: 'name'  },
};

const ROUTE_MAP = {
  posts: 'annonce',
  boutiques: 'boutique',
  ateliers: 'atelier',
  restos: 'resto',
  beaute: 'beaute',
};

function formatPrice(rawPrice) {
  if (!rawPrice) return null;
  const digits = String(rawPrice).replace(/[^0-9]/g, '');
  if (!digits) return null;
  return parseInt(digits, 10).toLocaleString('fr-FR').replace(/\u202f|\s/g, ' ') + ' FCFA';
}

function getPageUrl(id, source = 'posts') {
  const route = ROUTE_MAP[source] || 'annonce';
  return `${SITE_URL}/${route}/${id}`;
}

function buildCrawlerHtml(title, price, image, pageUrl) {
  const priceStr = price || '';
  const fullTitle = priceStr ? `${title} — ${priceStr} | MarchéduRoi` : `${title} | MarchéduRoi`;
  const fullDesc = `${title}${priceStr ? ` — ${priceStr}` : ''}. ${SLOGAN} - marcheduroi.com`;
  const ogImg = image || DEFAULT_IMAGE;

  return '<!DOCTYPE html><html lang="fr"><head>'
    + '<meta charset="UTF-8"/>'
    + '<title>' + fullTitle + '</title>'
    + '<meta name="description" content="' + fullDesc + '"/>'
    + '<link rel="canonical" href="' + pageUrl + '"/>'
    + '<meta property="og:title" content="' + fullTitle + '"/>'
    + '<meta property="og:description" content="' + fullDesc + '"/>'
    + '<meta property="og:image" content="' + ogImg + '"/>'
    + '<meta property="og:image:width" content="1200"/>'
    + '<meta property="og:image:height" content="630"/>'
    + '<meta property="og:url" content="' + pageUrl + '"/>'
    + '<meta property="og:type" content="website"/>'
    + '<meta property="og:site_name" content="MarchéduRoi"/>'
    + '<meta name="twitter:card" content="summary_large_image"/>'
    + '<meta name="twitter:title" content="' + fullTitle + '"/>'
    + '<meta name="twitter:description" content="' + fullDesc + '"/>'
    + '<meta name="twitter:image" content="' + ogImg + '"/>'
    + '<meta name="twitter:url" content="' + pageUrl + '"/>'
    + '</head><body></body></html>';
}

function buildUserHtml(pageUrl, title, price, image) {
  const priceStr = price || '';
  const fullTitle = priceStr ? `${title} — ${priceStr} | MarchéduRoi` : `${title} | MarchéduRoi`;
  const ogImg = image || DEFAULT_IMAGE;

  return '<!DOCTYPE html><html lang="fr"><head>'
    + '<meta charset="UTF-8"/>'
    + '<meta name="viewport" content="width=device-width,initial-scale=1"/>'
    + '<title>' + fullTitle + '</title>'
    + '<link rel="canonical" href="' + pageUrl + '"/>'
    + '<meta property="og:image" content="' + ogImg + '"/>'
    + '<meta http-equiv="refresh" content="0;url=' + pageUrl + '"/>'
    + '<style>body{margin:0;background:#0D0F1A;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;color:#fff;flex-direction:column;gap:12px;}</style>'
    + '</head><body>'
    + '<p style="font-size:20px">⏳</p>'
    + '<p style="color:#9A9AB0;font-size:14px">Chargement de l\\'annonce...</p>'
    + '<script>window.location.replace("' + pageUrl + '");</script>'
    + '</body></html>';
}

export default async function handler(req) {
  const url = new URL(req.url);
  const rawId = url.searchParams.get('id') || '';
  const id = rawId.includes('/') ? rawId.split('/')[0] : rawId;
  const source = url.searchParams.get('source') || 'posts';

  const ua = req.headers.get('user-agent') || '';
  const isCrawler = /facebookexternalhit|Twitterbot|WhatsApp|TelegramBot|LinkedInBot|Slackbot|Googlebot|bingbot|Applebot|Discordbot|vk|pinterest/i.test(ua);

  if (!id) {
    return new Response(null, { status: 302, headers: { Location: SITE_URL } });
  }

  try {
    const conf = TABLE_MAP[source] || TABLE_MAP.posts;
    const apiUrl = `${SUPABASE_URL}/rest/v1/${conf.table}?id=eq.${id}&select=*&limit=1`;

    const resp = await fetch(apiUrl, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
      },
    });

    const data = await resp.json();
    const item = Array.isArray(data) ? data[0] : null;

    const title = item ? (item[conf.titleField] || item.title || item.name || 'MarchéduRoi') : 'MarchéduRoi';
    const price = item ? formatPrice(item.price) : null;
    const photo = item ? ((item.photos || [])[0] || null) : null;
    const pageUrl = getPageUrl(id, source);

    if (isCrawler) {
      return new Response(buildCrawlerHtml(title, price, photo || DEFAULT_IMAGE, pageUrl), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 's-maxage=300',
        },
      });
    }

    return new Response(buildUserHtml(pageUrl, title, price, photo), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return new Response(null, { status: 302, headers: { Location: SITE_URL } });
  }
}

// api/send-vitrine-email.js
// Edge Function Vercel — envoie l'email de confirmation après paiement vitrine

export const config = { runtime: "edge" };

const RESEND_API_KEY = "re_VSJdqdgH_DGCjkig5szueGSp9BP9Ty5mU";
const FROM_EMAIL     = "MarchéduRoi <noreply@marcheduroi.com>";
const DOMAIN         = "https://marcheduroi.com";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { name, type, email, slug, token, expiresAt } = await req.json();

    if (!email || !name || !slug || !token) {
      return new Response(JSON.stringify({ error: "Paramètres manquants" }), { status: 400 });
    }

    const vitrineUrl  = `${DOMAIN}/vitrine/${slug}`;
    const modifUrl    = `${DOMAIN}/vitrine/${slug}/modifier?token=${token}`;
    const expireDate  = expiresAt ? new Date(expiresAt).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" }) : "dans 1 an";

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Votre vitrine est en ligne ! 🎉</title>
</head>
<body style="margin:0;padding:0;background:#0D0F1A;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#10B981;font-size:28px;margin:0;">MarchéduRoi 👑</h1>
      <p style="color:#9A9AB0;font-size:14px;margin:8px 0 0;">La plateforme des établissements au Bénin</p>
    </div>

    <!-- Card principale -->
    <div style="background:#1A1D30;border-radius:16px;padding:32px;border:1px solid #2A2D45;margin-bottom:24px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:48px;margin-bottom:12px;">🎉</div>
        <h2 style="color:#E8E8F0;font-size:22px;margin:0 0 8px;">Votre vitrine est en ligne !</h2>
        <p style="color:#9A9AB0;font-size:15px;margin:0;">Paiement confirmé avec succès</p>
      </div>

      <!-- Infos vitrine -->
      <div style="background:#0D0F1A;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#9A9AB0;font-size:13px;padding:6px 0;">Établissement</td>
            <td style="color:#E8E8F0;font-size:13px;font-weight:700;text-align:right;">${name}</td>
          </tr>
          <tr>
            <td style="color:#9A9AB0;font-size:13px;padding:6px 0;">Type</td>
            <td style="color:#E8E8F0;font-size:13px;text-align:right;">${type}</td>
          </tr>
          <tr>
            <td style="color:#9A9AB0;font-size:13px;padding:6px 0;">Valide jusqu'au</td>
            <td style="color:#10B981;font-size:13px;font-weight:700;text-align:right;">${expireDate}</td>
          </tr>
        </table>
      </div>

      <!-- Boutons -->
      <div style="margin-bottom:16px;">
        <a href="${vitrineUrl}" style="display:block;background:linear-gradient(135deg,#10B981,#059669);color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:700;font-size:15px;text-align:center;margin-bottom:12px;">
          🌐 Voir ma vitrine en ligne
        </a>
        <a href="${modifUrl}" style="display:block;background:#1A1D30;border:1px solid #2A2D45;color:#A78BFA;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:700;font-size:15px;text-align:center;">
          ✏️ Modifier ma vitrine
        </a>
      </div>

      <p style="color:#9A9AB0;font-size:12px;margin:0;text-align:center;">
        ⚠️ Conservez ce lien de modification — il est privé et vous permet de mettre à jour votre vitrine.
      </p>
    </div>

    <!-- Lien de modification -->
    <div style="background:#1A1D30;border-radius:12px;padding:20px;border:1px solid #4A148C;margin-bottom:24px;">
      <p style="color:#A78BFA;font-size:13px;font-weight:700;margin:0 0 8px;">🔐 Votre lien de modification privé</p>
      <p style="color:#9A9AB0;font-size:11px;word-break:break-all;margin:0;background:#0D0F1A;padding:10px;border-radius:8px;">${modifUrl}</p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;">
      <p style="color:#6B7280;font-size:12px;margin:0;">EDENPORTAIL · Ouidah, République du Bénin</p>
      <p style="color:#6B7280;font-size:12px;margin:4px 0 0;">
        <a href="mailto:contact@marcheduroi.com" style="color:#10B981;">contact@marcheduroi.com</a>
      </p>
    </div>

  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      [email],
        subject: `✅ Votre vitrine "${name}" est en ligne sur MarchéduRoi !`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Échec envoi email", detail: err }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

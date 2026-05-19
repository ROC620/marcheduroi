// api/send-feedback-reply.js
// Envoie la réponse admin au feedback par email via Resend

export const config = { runtime: "edge" };

const RESEND_API_KEY = "re_VSJdqdgH_DGCjkig5szueGSp9BP9Ty5mU";
const FROM_EMAIL     = "MarchéduRoi <contact@marcheduroi.com>";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { email, name, message, reponse } = await req.json();

    if (!email || !reponse) {
      return new Response(JSON.stringify({ error: "email et reponse requis" }), { status: 400 });
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #fff; borderRadius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0D0F1A, #1A1D30); padding: 32px 24px; text-align: center; }
    .header img { height: 48px; }
    .header h1 { color: #fff; font-size: 20px; margin: 12px 0 0; }
    .body { padding: 28px 24px; }
    .original { background: #f8f9fa; border-left: 4px solid #9A9AB0; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; }
    .original p { color: #6B7280; font-size: 13px; margin: 0; line-height: 1.6; }
    .reponse { background: #f0fdf4; border-left: 4px solid #10B981; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .reponse p { color: #065f46; font-size: 14px; margin: 0; line-height: 1.7; }
    .footer { background: #f8f9fa; padding: 20px 24px; text-align: center; }
    .footer p { color: #9A9AB0; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👑 MarchéduRoi</h1>
      <p style="color:#9A9AB0;font-size:13px;margin:4px 0 0">Réponse à votre avis</p>
    </div>
    <div class="body">
      <p style="color:#1A1D30;font-size:16px;margin:0 0 20px">Bonjour <strong>${name || "Utilisateur"}</strong>,</p>
      <p style="color:#6B7280;font-size:14px;margin:0 0 12px">L'équipe MarchéduRoi a répondu à votre avis :</p>
      
      <p style="color:#9A9AB0;font-size:12px;font-weight:600;text-transform:uppercase;margin:0 0 6px">Votre message</p>
      <div class="original">
        <p>${message || ""}</p>
      </div>

      <p style="color:#9A9AB0;font-size:12px;font-weight:600;text-transform:uppercase;margin:0 0 6px">Notre réponse</p>
      <div class="reponse">
        <p>${reponse}</p>
      </div>

      <p style="color:#6B7280;font-size:13px;margin:0">Merci de faire confiance à MarchéduRoi. N'hésitez pas à nous contacter pour toute question.</p>
    </div>
    <div class="footer">
      <p>© 2026 EDENPORTAIL — MarchéduRoi · Ouidah, Bénin</p>
      <p style="margin-top:4px"><a href="https://marcheduroi.com" style="color:#10B981;text-decoration:none">marcheduroi.com</a></p>
    </div>
  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      [email],
        subject: "👑 MarchéduRoi — Réponse à votre avis",
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// supabase/functions/expire-vitrines/index.ts
// Edge Function planifiée — s'exécute chaque nuit à minuit
// Pour activer le cron dans Supabase :
//   Dashboard → Edge Functions → expire-vitrines → Schedule
//   Cron expression : 0 0 * * * (chaque jour à minuit UTC)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  const now = new Date().toISOString();

  // Désactiver les vitrines dont expires_at est dépassé et qui sont encore actives
  const { data, error } = await supabase
    .from("structures")
    .update({ active: false })
    .lt("expires_at", now)
    .eq("active", true)
    .select("id, name, slug, email, phone");

  if (error) {
    console.error("Erreur expire-vitrines:", error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  const count = data?.length || 0;
  console.log(`✅ ${count} vitrine(s) expirée(s) désactivée(s)`);

  return new Response(
    JSON.stringify({ success: true, deactivated: count, structures: data?.map(s=>s.slug) }),
    { headers: { "Content-Type": "application/json" } }
  );
});

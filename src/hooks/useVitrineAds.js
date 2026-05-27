// src/hooks/useVitrineAds.js
// Insère automatiquement une bannière dans la table ads
// lors de la création (1 mois) ou du renouvellement (1 mois) d'une VitrineWeb

import { supabase } from "../supabase";

export function useVitrineAds() {
  const insertVitrineBanner = async (structure, type = "creation") => {
    try {
      const now = new Date();
      const fin = new Date(now);
      fin.setMonth(fin.getMonth() + 1); // 1 mois pour création ET renouvellement

      const badge = type === "creation" ? "✨ Nouveau sur MarchéduRoi" : "🔄 De retour sur MarchéduRoi";
      const slogan = `${badge} · ${structure.type}${structure.ville ? " à " + structure.ville : ""}`;

      await supabase.from("ads").insert({
        entreprise: structure.name,
        slogan:     slogan,
        logo_url:   structure.logo_url || "",
        lien:       `https://marcheduroi.com/vitrine/${structure.slug}`,
        couleur1:   "#10B981",
        couleur2:   "#059669",
        fin:        fin.toISOString().slice(0, 10),
        actif:      true,
      });
    } catch (e) {
      // Silencieux — la bannière est un bonus, ne pas bloquer l'activation
      console.error("Erreur insertion bannière vitrine:", e);
    }
  };

  return { insertVitrineBanner };
}

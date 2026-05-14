// src/hooks/usePromo.js
// Hook partagé — charge les promos actives et calcule les prix réduits

import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export function usePromo() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date().toISOString();
    supabase
      .from("promotions")
      .select("*")
      .eq("actif", true)
      .lte("debut", now)
      .gte("fin", now)
      .then(({ data }) => {
        setPromos(data || []);
        setLoading(false);
      });
  }, []);

  // Retourne la promo active pour une cible donnée
  const getPromo = (cible) => {
    return promos.find(p => p.cible === cible || p.cible === "all") || null;
  };

  // Calcule le prix après réduction
  const applyPromo = (prix, cible) => {
    const promo = getPromo(cible);
    if (!promo) return { prixFinal: prix, prixOriginal: null, promo: null };
    let prixFinal;
    if (promo.type === "pourcentage") {
      prixFinal = Math.round(prix * (1 - promo.valeur / 100));
    } else {
      prixFinal = Math.max(0, prix - promo.valeur);
    }
    return { prixFinal, prixOriginal: prix, promo };
  };

  // Formate le label de réduction
  const promoLabel = (cible) => {
    const promo = getPromo(cible);
    if (!promo) return null;
    return promo.type === "pourcentage"
      ? `-${promo.valeur}%`
      : `-${promo.valeur.toLocaleString("fr-FR")} F`;
  };

  return { promos, loading, getPromo, applyPromo, promoLabel };
}

// src/hooks/useNotifyAdmin.js
// Hook pour notifier l'admin via WhatsApp après chaque paiement

export function useNotifyAdmin() {
  const notify = async ({ type, nom, montant, details }) => {
    try {
      await fetch("/api/notify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, nom, montant, details }),
      });
    } catch (e) {
      // Silencieux — ne pas bloquer si la notification échoue
      console.warn("notify-admin failed:", e.message);
    }
  };

  return { notifyAdmin: notify };
}

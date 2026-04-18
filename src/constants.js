// ─── CONSTANTES GLOBALES MarchéduRoi ───────────────────────────────────────

export const CATEGORIES = ["Toutes", "Immobilier", "Électronique", "Véhicules", "Motos & Tricycles", "Services", "Sport", "Mode", "Autre"];

export const BACKGROUNDS = [
  // Thèmes sombres
  { id: "dark",    label: "Sombre",        bg: "#0D0F1A", card: "#1A1D30", border: "#2A2D45", text: "#E8E8F0", sub: "#9A9AB0" },
  { id: "blue",    label: "Océan",         bg: "#050E1F", card: "#0D1E38", border: "#1A3258", text: "#D8E8FF", sub: "#6A9ACF" },
  { id: "purple",  label: "Galaxie",       bg: "#0E0818", card: "#1A1030", border: "#2E1A50", text: "#EAD8FF", sub: "#9A78CF" },
  // Thèmes clairs
  { id: "light",   label: "Clair",         bg: "#F4F6FB", card: "#FFFFFF", border: "#E0E4F0", text: "#1A1D30", sub: "#6B7280" },
  { id: "cream",   label: "Crème",         bg: "#FDF8F0", card: "#FFFFFF", border: "#E8DDD0", text: "#2C1810", sub: "#8B7355" },
  { id: "mint",    label: "Menthe",        bg: "#F0FAF6", card: "#FFFFFF", border: "#C8EAD8", text: "#1A3028", sub: "#4A8A6A" },
  { id: "lavande", label: "Lavande",       bg: "#F5F0FF", card: "#FFFFFF", border: "#DDD0F0", text: "#2A1850", sub: "#7A60A8" },
  { id: "peche",   label: "Pêche",         bg: "#FFF5EE", card: "#FFFFFF", border: "#F0D8C0", text: "#3A1A08", sub: "#C07040" },
  { id: "ciel",    label: "Ciel",          bg: "#EFF6FF", card: "#FFFFFF", border: "#BFDBFE", text: "#1E3A5F", sub: "#5A8AB0" },
];

export const VEHICLE_FIELDS = [
  { key: "marque",        label: "Marque *",                  placeholder: "Ex: Toyota, Honda, Mercedes...",  type: "alpha",   max: 50  },
  { key: "modele",        label: "Modèle *",                  placeholder: "Ex: Corolla, Civic, Classe C...", type: "text",    max: 60  },
  { key: "annee",         label: "Année *",                   placeholder: "Ex: 2020",                       type: "year",    max: 4   },
  { key: "transmission",  label: "Transmission",              placeholder: "Automatique / Manuelle",          type: "alpha",   max: 30  },
  { key: "puissance",     label: "Puissance",                 placeholder: "Ex: 132 ch",                     type: "text",    max: 20  },
  { key: "carburant",     label: "Type de carburant",         placeholder: "Essence / Diesel / Électrique",   type: "alpha",   max: 30  },
  { key: "garniture",     label: "Garniture des sièges",      placeholder: "Cuir / Tissu / Alcantara...",     type: "alpha",   max: 40  },
  { key: "capacite",      label: "Capacité",                  placeholder: "Ex: 5 places",                   type: "text",    max: 20  },
  { key: "climatisation", label: "Climatisation",             placeholder: "Oui / Non / Automatique",         type: "alpha",   max: 30  },
  { key: "docs",          label: "Documents administratifs",  placeholder: "Carte grise, Assurance...",        type: "text",    max: 100 },
  { key: "serie",         label: "Série / Immatriculation",   placeholder: "Ex: AJ 1234 BJ",                 type: "alphaNum",max: 20  },
  { key: "position",      label: "Position / Localisation *", placeholder: "Ex: Cotonou, Porto-Novo...",      type: "text",    max: 80  },
  { key: "autre",         label: "Autre information",         placeholder: "Première main, kilométrage...",   type: "text",    max: 200 },
];

export const RESTO_TYPES = [
  "Restaurant", "Bar", "Maquis", "Buvette", "Fast-food",
  "Café / Salon de thé", "Pizzeria", "Grillade", "Fruits de mer", "Autre"
];

export const BEAUTE_TYPES = [
  "Salon de coiffure", "Institut de beauté", "Make-up / Maquillage",
  "Manucure & Pédicure", "Spa & Bien-être", "Barbier",
  "Tresses africaines", "Perruques & Extensions", "Épilation", "Autre"
];

export const MAX_MODIFS = 3;

export const MOTO_FIELDS = [
  { key: "marque",      label: "Marque *",              placeholder: "Ex: Honda, Yamaha, TVS, Bajaj...", type: "alpha",    max: 50  },
  { key: "modele",      label: "Modèle *",              placeholder: "Ex: Wave, CG 125, TVS King...",   type: "text",     max: 60  },
  { key: "type",        label: "Type *",                placeholder: "Moto / Tricycle / Scooter...",    type: "alpha",    max: 30  },
  { key: "annee",       label: "Année *",               placeholder: "Ex: 2022",                       type: "year",     max: 4   },
  { key: "cylindree",   label: "Cylindrée",             placeholder: "Ex: 125cc, 200cc...",            type: "text",     max: 20  },
  { key: "carburant",   label: "Carburant",             placeholder: "Essence / Électrique",           type: "alpha",    max: 20  },
  { key: "etat",        label: "État général",          placeholder: "Neuf / Bon état / À réviser",    type: "alpha",    max: 40  },
  { key: "couleur",     label: "Couleur",               placeholder: "Ex: Rouge, Noir, Bleu...",       type: "alpha",    max: 30  },
  { key: "docs",        label: "Documents",             placeholder: "Carte grise, Assurance...",      type: "text",     max: 100 },
  { key: "position",    label: "Localisation *",        placeholder: "Ex: Cotonou, Porto-Novo...",     type: "text",     max: 80  },
  { key: "autre",       label: "Autre information",     placeholder: "Kilométrage, options...",        type: "text",     max: 200 },
];

export const SPONSOR_PRICES = { week: 500, month: 1500 };

export const MODIF_PRICES = { simple: 200, pro: 300 };

export const PRICE_PER_MONTH = 1500;

export const COUNTRIES_FLAGS = [
  { code: "bj", pays: "Bénin" },
  { code: "tg", pays: "Togo" },
  { code: "bf", pays: "Burkina Faso" },
  { code: "ml", pays: "Mali" },
  { code: "sn", pays: "Sénégal" },
  { code: "ci", pays: "Côte d'Ivoire" },
  { code: "ng", pays: "Nigeria" },
  { code: "cm", pays: "Cameroun" },
  { code: "gn", pays: "Guinée" },
  { code: "ne", pays: "Niger" },
  { code: "cg", pays: "Congo" },
  { code: "cd", pays: "RDC" },
  { code: "ga", pays: "Gabon" },
  { code: "mg", pays: "Madagascar" },
  { code: "rw", pays: "Rwanda" },
  { code: "bi", pays: "Burundi" },
  { code: "td", pays: "Tchad" },
  { code: "mr", pays: "Mauritanie" },
];

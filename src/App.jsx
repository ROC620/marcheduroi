import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase";

const INITIAL_POSTS = [
  // IMMOBILIER
  {
    id: 1, title: "Belle villa avec piscine à louer", category: "Immobilier",
    description: "Magnifique villa moderne avec piscine, 4 chambres, 3 salles de bain, jardin paysager. Idéale pour famille ou investissement locatif. Quartier calme et sécurisé à Cotonou.",
    author: "Sophie M.", authorId: "u2", price: "450 000 FCFA/mois", date: "2026-03-01", likes: 14,
    contact: "sophie@email.com", phone: "+22997100001",
    photos: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80"
    ],
    immo: { sousType:"Villa", transaction:"Location", superficie:"350", pieces:"8 pièces", titre:"Oui - Titre foncier disponible", ville:"Cotonou", quartier:"Fidjrossè", von:"Von de la plage", eau:"Oui", electricite:"Oui", etat:"Bon état", recasee:"", autres:"Piscine, gardien, garage 2 voitures, groupe électrogène" }
  },
  {
    id: 2, title: "Appartement meublé 3 pièces - Akpakpa", category: "Immobilier",
    description: "Appartement entièrement meublé, climatisé, avec eau et électricité. Situé à Akpakpa près du marché. Disponible immédiatement. Idéal pour cadre ou couple.",
    author: "Adjovi R.", authorId: "u7", price: "120 000 FCFA/mois", date: "2026-03-03", likes: 9,
    contact: "adjovi@email.com", phone: "+22997100002",
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80"
    ],
    immo: { sousType:"Appartement", transaction:"Location", superficie:"85", pieces:"3 pièces", titre:"Oui - Titre foncier disponible", ville:"Cotonou", quartier:"Akpakpa", von:"Von du marché Akpakpa", eau:"Oui", electricite:"Oui", etat:"Bon état", autres:"Meublé, climatisé, gardien" }
  },
  {
    id: 16, title: "Grande parcelle à vendre - Calavi", category: "Immobilier",
    description: "Belle parcelle de 600m² dans un quartier résidentiel en plein développement. Proche de toutes commodités. Idéale pour construction d'une maison ou investissement.",
    author: "Germain K.", authorId: "u19", price: "12 000 000 FCFA", date: "2026-03-12", likes: 7,
    contact: "germain@email.com", phone: "+22997100016",
    photos: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
    ],
    immo: { sousType:"Parcelle", transaction:"Vente", superficie:"600", pieces:"", titre:"En cours d'obtention", ville:"Abomey-Calavi", quartier:"Godomey", von:"Von du rond-point Erevan", eau:"En attente", electricite:"Oui", etat:"Neuf", recasee:"Non", autres:"Quartier en développement, proche université" }
  },
  // ÉLECTRONIQUE
  {
    id: 3, title: "iPhone 15 Pro Max 256Go - Neuf", category: "Électronique",
    description: "iPhone 15 Pro Max couleur titane naturel, 256Go. Acheté il y a 2 mois, jamais tombé. Vendu avec boîte originale, chargeur MagSafe et coque de protection.",
    author: "Karim B.", authorId: "u3", price: "580 000 FCFA", date: "2026-03-05", likes: 11,
    contact: "karim@email.com", phone: "+22997100003",
    photos: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80"
    ]
  },
  {
    id: 4, title: "Samsung 65 pouces QLED 4K Smart TV", category: "Électronique",
    description: "Téléviseur Samsung QLED 65 pouces, 4K, Smart TV avec Netflix, YouTube intégrés. Acheté en janvier 2026, très peu utilisé. Avec télécommande et support mural.",
    author: "Franck T.", authorId: "u8", price: "320 000 FCFA", date: "2026-03-06", likes: 7,
    contact: "franck@email.com", phone: "+22997100004",
    photos: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600&q=80",
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&q=80"
    ]
  },
  // VÉHICULES
  {
    id: 5, title: "Toyota Corolla 2020 - Première main", category: "Véhicules",
    description: "Toyota Corolla en excellent état, première main, entretien régulier chez concessionnaire. Jamais accidentée. Tous documents à jour. Disponible à Cotonou.",
    author: "Marc D.", authorId: "u5", price: "8 500 000 FCFA", date: "2026-03-09", likes: 5,
    contact: "marc@email.com", phone: "+22997100005",
    photos: [
      "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=600&q=80",
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600&q=80",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80"
    ],
    vehicle: { marque:"Toyota", modele:"Corolla", annee:"2020", transmission:"Automatique", puissance:"132 ch", carburant:"Essence", garniture:"Tissu", capacite:"5 places", climatisation:"Automatique", docs:"Carte grise, Assurance, Visite technique", serie:"AJ 1234 BJ", position:"Cotonou, Bénin", autre:"Première main, 45 000 km" }
  },
  {
    id: 6, title: "Mercedes Classe C 2019 - Excellent état", category: "Véhicules",
    description: "Mercedes Benz Classe C 200, intérieur cuir beige, toit ouvrant, caméra de recul, GPS intégré. Voiture de direction, très bien entretenue. Prix négociable.",
    author: "Brice A.", authorId: "u9", price: "18 000 000 FCFA", date: "2026-03-10", likes: 18,
    contact: "brice@email.com", phone: "+22997100006",
    photos: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80",
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80"
    ],
    vehicle: { marque:"Mercedes", modele:"Classe C 200", annee:"2019", transmission:"Automatique", puissance:"184 ch", carburant:"Essence", garniture:"Cuir beige", capacite:"5 places", climatisation:"Automatique bi-zone", docs:"Carte grise, Assurance, Expertise", serie:"AK 5678 BJ", position:"Porto-Novo, Bénin", autre:"Toit ouvrant, GPS, Caméra recul" }
  },
  // SERVICES
  {
    id: 7, title: "Cours particuliers Maths & Physique", category: "Services",
    description: "Professeur diplômé en mathématiques et physique-chimie, 8 ans d'expérience. Cours à domicile pour collégiens, lycéens et étudiants. Résultats garantis. Disponible soirs et week-ends.",
    author: "Dr. Koffi M.", authorId: "u10", price: "5 000 FCFA/h", date: "2026-03-07", likes: 22,
    contact: "koffi@email.com", phone: "+22997100007",
    photos: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80"
    ]
  },
  {
    id: 8, title: "Plomberie & Installation sanitaire", category: "Services",
    description: "Plombier professionnel avec 12 ans d'expérience. Installation, réparation, dépannage urgent. Robinetterie, chauffe-eau, WC, douche. Intervention rapide sur Cotonou et environs.",
    author: "Yves P.", authorId: "u11", price: "Sur devis", date: "2026-03-08", likes: 6,
    contact: "yves@email.com", phone: "+22997100008",
    photos: [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80",
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80"
    ]
  },
  // SPORT
  {
    id: 9, title: "Vélo électrique VTT - Très bon état", category: "Sport",
    description: "VTT électrique 27,5 pouces, batterie longue durée 80km, moteur 250W, 21 vitesses. Parfait pour trajets quotidiens et randonnées. Chargeur inclus. Très peu utilisé.",
    author: "Léa K.", authorId: "u12", price: "280 000 FCFA", date: "2026-03-04", likes: 13,
    contact: "lea@email.com", phone: "+22997100009",
    photos: [
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"
    ]
  },
  {
    id: 10, title: "Équipement complet de musculation", category: "Sport",
    description: "Banc de musculation multifonction avec barre, haltères et disques de poids (50kg au total). Parfait état, déménagement oblige la vente. À récupérer sur place à Fidjrossè.",
    author: "Arnold S.", authorId: "u13", price: "95 000 FCFA", date: "2026-03-11", likes: 4,
    contact: "arnold@email.com", phone: "+22997100010",
    photos: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80"
    ]
  },
  // MODE
  {
    id: 11, title: "Robe de soirée élégante - Taille M", category: "Mode",
    description: "Magnifique robe de soirée longue, couleur bordeaux, ornements dorés. Portée une seule fois pour un mariage. Taille M (38-40). Parfaite pour cérémonies, soirées de gala.",
    author: "Nadège F.", authorId: "u14", price: "35 000 FCFA", date: "2026-03-02", likes: 16,
    contact: "nadege@email.com", phone: "+22997100011",
    photos: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80"
    ]
  },
  {
    id: 12, title: "Costume homme 3 pièces - Taille L", category: "Mode",
    description: "Costume 3 pièces (veste, pantalon, gilet) couleur gris anthracite. Tissu de qualité, coupe italienne. Porté 2 fois. Taille L. Idéal pour entretiens, mariages et cérémonies.",
    author: "Romuald A.", authorId: "u15", price: "28 000 FCFA", date: "2026-03-10", likes: 8,
    contact: "romuald@email.com", phone: "+22997100012",
    photos: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4a7c?w=600&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80"
    ]
  },
  // AUTRE - Ustensiles de cuisine
  {
    id: 13, title: "Set de casseroles inox 7 pièces", category: "Autre",
    description: "Lot de 7 casseroles et poêles en inox 18/10, fond épais anti-adhésif. Compatibles toutes plaques dont induction. Idéal pour cuisine professionnelle ou familiale. Neuves dans leur emballage.",
    author: "Ines C.", authorId: "u16", price: "45 000 FCFA", date: "2026-03-06", likes: 10,
    contact: "ines@email.com", phone: "+22997100013",
    photos: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
      "https://images.unsplash.com/photo-1584622781867-1c5fe959c3f4?w=600&q=80",
      "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&q=80"
    ]
  },
  {
    id: 14, title: "Robot de cuisine multifonction 1200W", category: "Autre",
    description: "Robot cuiseur multifonction 1200W, 6 programmes automatiques, bol inox 4L. Hache, mixe, pétrit, cuit à la vapeur. Parfait état, utilisé 3 mois. Avec tous les accessoires d'origine.",
    author: "Céleste M.", authorId: "u17", price: "75 000 FCFA", date: "2026-03-09", likes: 15,
    contact: "celeste@email.com", phone: "+22997100014",
    photos: [
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80",
      "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80"
    ]
  },
  {
    id: 15, title: "Couteaux de chef japonais - Set 5 pièces", category: "Autre",
    description: "Set de 5 couteaux de chef japonais en acier inoxydable, manche en bois d'olivier. Inclus : couteau de chef, couteau à pain, couteau d'office, santoku et cisailles. Avec bloc de rangement.",
    author: "Patrick N.", authorId: "u18", price: "32 000 FCFA", date: "2026-03-11", likes: 9,
    contact: "patrick@email.com", phone: "+22997100015",
    photos: [
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&q=80",
      "https://images.unsplash.com/photo-1566454544259-f4b94c3d758c?w=600&q=80"
    ]
  },
];

const CATEGORIES = ["Toutes", "Immobilier", "Électronique", "Véhicules", "Services", "Sport", "Mode", "Autre"];

const INITIAL_BOUTIQUES = [
  {
    id: "b1", name: "Beauté Dorée Cosmétiques", type: "Cosmétiques & Beauté",
    description: "Boutique spécialisée en produits cosmétiques naturels, soins de la peau, parfums et accessoires beauté. Produits importés et locaux de qualité.",
    ville: "Cotonou", quartier: "Akpakpa", von: "Von de la pharmacie centrale",
    horaires: "Lun-Sam 8h-20h · Dim 10h-18h",
    contact: "beaute@email.com", phone: "+22997200001",
    author: "Adjara K.", authorId: "b_u1", date: "2026-03-01", likes: 18,
    photos: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80"
    ], video: null, expiresAt: null
  },
  {
    id: "b2", name: "Tech Store Bénin", type: "Électronique & Informatique",
    description: "Vente et réparation de téléphones, ordinateurs, accessoires informatiques. Garantie sur tous les produits. Service après-vente disponible.",
    ville: "Porto-Novo", quartier: "Ouando", von: "Von du grand marché",
    horaires: "Lun-Ven 8h-19h · Sam 8h-17h",
    contact: "techstore@email.com", phone: "+22997200002",
    author: "Fiacre D.", authorId: "b_u2", date: "2026-03-03", likes: 12,
    photos: [
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80",
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80"
    ], video: null, expiresAt: null
  },
  {
    id: "b3", name: "Boulangerie Saveur d'Or", type: "Alimentation & Restauration",
    description: "Pains frais, viennoiseries, gâteaux personnalisés pour mariages et événements. Fabrication artisanale chaque matin. Livraison disponible.",
    ville: "Ouidah", quartier: "Centre-ville", von: "Von de l'église Saint-François",
    horaires: "Tous les jours 6h-21h",
    contact: "saveur@email.com", phone: "+22997200003",
    author: "Marie T.", authorId: "b_u3", date: "2026-03-05", likes: 25,
    photos: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
      "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&q=80"
    ], video: null, expiresAt: null
  },
];

const INITIAL_ATELIERS = [
  {
    id: "a1", name: "Atelier Couture Élégance", type: "Couture/Mode",
    description: "Confection de tenues sur mesure pour hommes, femmes et enfants. Spécialiste en tenues traditionnelles et modernes. Retouches et réparations acceptées.",
    services: "Couture sur mesure, Tenues de cérémonie, Retouches, Broderie, Formation couture",
    ville: "Cotonou", quartier: "Gbègamey", von: "Von du lycée technique",
    horaires: "Lun-Sam 8h-18h",
    contact: "elegance@email.com", phone: "+22997300001",
    author: "Rosine A.", authorId: "a_u1", date: "2026-03-02", likes: 20,
    photos: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&q=80"
    ], video: null, expiresAt: null
  },
  {
    id: "a2", name: "Garage Auto Pro", type: "Mécanique",
    description: "Réparation et entretien de tous types de véhicules. Diagnostic électronique, vidange, freins, climatisation. Pièces détachées disponibles.",
    services: "Diagnostic, Vidange, Freinage, Climatisation, Carrosserie, Électricité auto",
    ville: "Abomey-Calavi", quartier: "Godomey", von: "Von du rond-point Erevan",
    horaires: "Lun-Sam 7h30-18h30",
    contact: "garagepro@email.com", phone: "+22997300002",
    author: "Théodore M.", authorId: "a_u2", date: "2026-03-04", likes: 15,
    photos: [
      "https://images.unsplash.com/photo-1632823471565-1ecdf5c6da12?w=600&q=80",
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80"
    ], video: null, expiresAt: null
  },
  {
    id: "a3", name: "Atelier Bois & Métal", type: "Menuiserie/Soudure",
    description: "Fabrication de meubles sur mesure, portes, fenêtres, grilles de sécurité. Travaux de soudure et serrurerie. Devis gratuit.",
    services: "Meubles sur mesure, Portes et fenêtres, Grilles, Soudure, Serrurerie",
    ville: "Parakou", quartier: "Banikanni", von: "Von du marché central",
    horaires: "Lun-Sam 7h-18h",
    contact: "boismétal@email.com", phone: "+22997300003",
    author: "Justin F.", authorId: "a_u3", date: "2026-03-06", likes: 9,
    photos: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80"
    ], video: null, expiresAt: null
  },
];

const RESTO_TYPES = ["Restaurant","Bar","Maquis","Buvette","Fast-food","Café / Salon de thé","Pizzeria","Grillade","Fruits de mer","Autre"];
const RESTO_SERVICES = ["Sur place","À emporter","Livraison","Salle climatisée","Terrasse","Privatisation possible","Wifi disponible"];

const INITIAL_RESTOS = [
  {
    id: "r1", name: "Maquis Chez Maman Africa", type: "Maquis",
    specialite: "Cuisine béninoise traditionnelle",
    plats: "Sauce arachide, Riz au gras, Igname pilée, Poisson braisé, Akassa",
    prixMoyen: "1 500 - 5 000 FCFA", capacite: "40 couverts",
    services: "Sur place, À emporter, Terrasse",
    description: "Maquis familial proposant les meilleurs plats traditionnels béninois dans une ambiance chaleureuse. Idéal pour les repas en famille ou entre amis.",
    ville: "Cotonou", quartier: "Cadjehoun", von: "Von de l'aéroport",
    horaires: "Lun-Dim 7h-22h",
    contact: "mamanafrika@email.com", phone: "+22997400001",
    author: "Mama Africa", authorId: "r_u1", date: "2026-03-01", likes: 35,
    photos: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80"
    ], video: null, keywords: "cuisine béninoise maquis traditionnel repas famille", expiresAt: null
  },
  {
    id: "r2", name: "Bar Le Cocotier", type: "Bar",
    specialite: "Cocktails tropicaux et bières fraîches",
    plats: "Brochettes, Arachides grillées, Poisson frit, Accras",
    prixMoyen: "500 - 3 000 FCFA", capacite: "60 couverts",
    services: "Sur place, Terrasse, Wifi disponible",
    description: "Bar tendance en bord de mer avec une vue imprenable. Ambiance détendue, musique live le week-end. Le meilleur endroit pour se retrouver entre amis.",
    ville: "Ouidah", quartier: "Plage", von: "Von de la plage de Ouidah",
    horaires: "Mar-Dim 16h-02h",
    contact: "cocotier@email.com", phone: "+22997400002",
    author: "Patrick L.", authorId: "r_u2", date: "2026-03-03", likes: 28,
    photos: [
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80"
    ], video: null, keywords: "bar cocktails bières terrasse mer musique", expiresAt: null
  },
  {
    id: "r3", name: "Fast Food Le Goût", type: "Fast-food",
    specialite: "Burgers, Sandwichs et Grillades",
    plats: "Burger maison, Sandwich poulet, Brochettes bœuf, Frites, Boissons fraîches",
    prixMoyen: "1 000 - 4 000 FCFA", capacite: "25 couverts",
    services: "Sur place, À emporter, Livraison, Salle climatisée",
    description: "Fast-food moderne proposant des burgers faits maison, des grillades et des sandwichs. Livraison rapide dans tout Cotonou. Qualité garantie !",
    ville: "Cotonou", quartier: "Akpakpa", von: "Von du carrefour Missébo",
    horaires: "Lun-Dim 10h-23h",
    contact: "legout@email.com", phone: "+22997400003",
    author: "Hervé G.", authorId: "r_u3", date: "2026-03-05", likes: 19,
    photos: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80"
    ], video: null, keywords: "burger fast food livraison grillades sandwich", expiresAt: null
  },
];

const BOUTIQUE_TYPES = ["Cosmétiques & Beauté","Alimentation & Restauration","Électronique & Informatique","Mode & Vêtements","Pharmacie & Santé","Matériaux & Construction","Agriculture & Élevage","Librairie & Papeterie","Sport & Loisirs","Autre"];
const ATELIER_TYPES = ["Couture/Mode","Mécanique","Menuiserie/Soudure","Artistique (peinture, musique...)","Électricité & Plomberie","Coiffure & Beauté","Imprimerie & Communication","Autre"];
const IMMO_TYPES = ["Maison","Appartement","Parcelle","Domaine / Terrain","Local commercial","Villa"];
const IMMO_ETATS = ["Neuf","Bon état","À rénover","En construction"];
const IMMO_TITRES = ["Oui - Titre foncier disponible","Non - Sans titre","En cours d'obtention","Lettre d'attribution"];



const BACKGROUNDS = [
  { id: "dark", label: "Sombre", bg: "#0D0F1A", card: "#1A1D30", border: "#2A2D45", text: "#E8E8F0", sub: "#9A9AB0" },
  { id: "light", label: "Clair", bg: "#F4F6FB", card: "#FFFFFF", border: "#E0E4F0", text: "#1A1D30", sub: "#6B7280" },
  { id: "green", label: "Forêt", bg: "#0A1A10", card: "#122018", border: "#1E3A28", text: "#E0F0E8", sub: "#7AAB8A" },
  { id: "blue", label: "Océan", bg: "#050E1F", card: "#0D1E38", border: "#1A3258", text: "#D8E8FF", sub: "#6A9ACF" },
  { id: "purple", label: "Galaxie", bg: "#0E0818", card: "#1A1030", border: "#2E1A50", text: "#EAD8FF", sub: "#9A78CF" },
  { id: "sunset", label: "Coucher de soleil", bg: "#1A0A00", card: "#2A1408", border: "#4A2010", text: "#FFE8D0", sub: "#CF8A5A" },
];

const VEHICLE_FIELDS = [
  { key: "marque", label: "Marque *", placeholder: "Ex: Toyota, Honda, Mercedes..." },
  { key: "modele", label: "Modèle *", placeholder: "Ex: Corolla, Civic, Classe C..." },
  { key: "annee", label: "Année *", placeholder: "Ex: 2020" },
  { key: "transmission", label: "Transmission", placeholder: "Automatique / Manuelle" },
  { key: "puissance", label: "Puissance", placeholder: "Ex: 132 ch" },
  { key: "carburant", label: "Type de carburant", placeholder: "Essence / Diesel / Électrique / Hybride" },
  { key: "garniture", label: "Garniture des sièges", placeholder: "Cuir / Tissu / Alcantara..." },
  { key: "capacite", label: "Capacité", placeholder: "Ex: 5 places" },
  { key: "climatisation", label: "Climatisation", placeholder: "Oui / Non / Automatique" },
  { key: "docs", label: "Documents administratifs", placeholder: "Carte grise, Assurance, Visite technique..." },
  { key: "serie", label: "Série / Immatriculation", placeholder: "Ex: AJ 1234 BJ" },
  { key: "position", label: "Position / Localisation *", placeholder: "Ex: Cotonou, Porto-Novo..." },
  { key: "autre", label: "Autre information", placeholder: "Première main, kilométrage, options..." },
];

const Icon = ({ name, size = 18 }) => {
  const icons = {
    plus: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    edit: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    heart: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    search: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    x: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    crown: <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24"><path d="M2 19l3-10 5 5 2-9 2 9 5-5 3 10z"/></svg>,
    user: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    lock: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    mail: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    check: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    tag: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    eye: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    logout: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    image: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    chevronLeft: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
    chevronRight: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
    phone: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    whatsapp: <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
    palette: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20 2 2 0 0 1 0-4 2 2 0 0 0 0-4 2 2 0 0 1 0-4 10 10 0 0 1 0-8z"/></svg>,
    suggestion: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    car: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M14 2v5h5"/></svg>,
    pin: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  };
  return icons[name] || null;
};

function PhotoCarousel({ photos }) {
  const [current, setCurrent] = useState(0);
  if (!photos || photos.length === 0) return null;
  return (
    <div style={{ position:"relative",width:"100%",height:200,overflow:"hidden" }}>
      <img src={photos[current]} alt="photo" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
      {photos.length > 1 && (
        <>
          <button onClick={() => setCurrent(c=>(c-1+photos.length)%photos.length)} style={{ position:"absolute",left:6,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.5)",border:"none",color:"#fff",borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><Icon name="chevronLeft" size={14}/></button>
          <button onClick={() => setCurrent(c=>(c+1)%photos.length)} style={{ position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.5)",border:"none",color:"#fff",borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><Icon name="chevronRight" size={14}/></button>
          <div style={{ position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4 }}>
            {photos.map((_,i)=><div key={i} onClick={()=>setCurrent(i)} style={{ width:6,height:6,borderRadius:"50%",background:i===current?"#fff":"rgba(255,255,255,0.5)",cursor:"pointer" }}/>)}
          </div>
        </>
      )}
    </div>
  );
}

function PhotoUploader({ photos, setPhotos, theme }) {
  const fileRef = useRef();
  const handleFiles = (e) => {
    Array.from(e.target.files).slice(0,3-photos.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotos(prev=>[...prev,ev.target.result]);
      reader.readAsDataURL(file);
    });
  };
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:8 }}>Photos ({photos.length}/3)</label>
      <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
        {photos.map((photo,i)=>(
          <div key={i} style={{ position:"relative",width:90,height:90,borderRadius:10,overflow:"hidden",border:`1px solid ${theme.border}` }}>
            <img src={photo} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
            <button onClick={()=>setPhotos(prev=>prev.filter((_,j)=>j!==i))} style={{ position:"absolute",top:4,right:4,background:"rgba(255,71,87,0.9)",border:"none",color:"#fff",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><Icon name="x" size={10}/></button>
          </div>
        ))}
        {photos.length < 3 && (
          <div onClick={()=>fileRef.current.click()} style={{ width:90,height:90,borderRadius:10,border:`2px dashed ${theme.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",color:theme.sub,gap:4 }}>
            <Icon name="image" size={20}/><span style={{ fontSize:10,fontWeight:600 }}>Ajouter</span>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={handleFiles}/>
      <p style={{ fontSize:11,color:theme.sub,marginTop:6 }}>Maximum 3 photos · JPG, PNG, WEBP</p>
    </div>
  );
}

// Video Uploader
function VideoUploader({ video, setVideo, theme }) {
  const fileRef = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { alert("Vidéo trop lourde. Maximum 50MB."); return; }
    const url = URL.createObjectURL(file);
    setVideo({ url, name: file.name, file });
  };
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:8 }}>
        🎬 Vidéo de présentation (30 sec max · optionnel)
      </label>
      {video ? (
        <div style={{ position:"relative",borderRadius:12,overflow:"hidden",border:`1px solid ${theme.border}` }}>
          <video src={video.url} controls style={{ width:"100%",maxHeight:200,objectFit:"cover" }}/>
          <button onClick={()=>setVideo(null)} style={{ position:"absolute",top:8,right:8,background:"rgba(255,71,87,0.9)",border:"none",color:"#fff",borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14 }}>✕</button>
        </div>
      ) : (
        <div onClick={()=>fileRef.current.click()} style={{ border:`2px dashed ${theme.border}`,borderRadius:12,padding:24,textAlign:"center",cursor:"pointer",color:theme.sub }}>
          <div style={{ fontSize:32,marginBottom:8 }}>🎬</div>
          <p style={{ fontWeight:600,fontSize:13 }}>Cliquez pour ajouter une vidéo</p>
          <p style={{ fontSize:11,marginTop:4 }}>MP4, MOV · Max 50MB · 30 secondes</p>
        </div>
      )}
      <input ref={fileRef} type="file" accept="video/*" style={{ display:"none" }} onChange={handleFile}/>
    </div>
  );
}

// Fiche détaillée véhicule
function VehicleCard({ vehicle, theme }) {
  if (!vehicle) return null;
  const fields = [
    { label:"Marque", val:vehicle.marque },
    { label:"Modèle", val:vehicle.modele },
    { label:"Année", val:vehicle.annee },
    { label:"Transmission", val:vehicle.transmission },
    { label:"Puissance", val:vehicle.puissance },
    { label:"Carburant", val:vehicle.carburant },
    { label:"Garniture sièges", val:vehicle.garniture },
    { label:"Capacité", val:vehicle.capacite },
    { label:"Climatisation", val:vehicle.climatisation },
    { label:"Documents", val:vehicle.docs },
    { label:"Série/Immat.", val:vehicle.serie },
    { label:"Position", val:vehicle.position },
    { label:"Autre", val:vehicle.autre },
  ].filter(f => f.val);

  return (
    <div style={{ background:`${theme.bg}99`,border:`1px solid ${theme.border}`,borderRadius:12,padding:16,marginBottom:16 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
        <span style={{ color:"#6C63FF" }}><Icon name="car" size={16}/></span>
        <p style={{ fontWeight:700,fontSize:14,color:theme.text }}>Fiche technique</p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
        {fields.map(f=>(
          <div key={f.label} style={{ background:`${theme.card}`,border:`1px solid ${theme.border}`,borderRadius:8,padding:"8px 12px" }}>
            <p style={{ fontSize:10,color:theme.sub,fontWeight:600,marginBottom:2 }}>{f.label.toUpperCase()}</p>
            <p style={{ fontSize:13,color:theme.text,fontWeight:600 }}>{f.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fiche détaillée Immobilier
function ImmoCard({ immo, theme }) {
  if (!immo) return null;
  const colorMap = { "Vente":"#FF6584", "Location":"#6C63FF" };
  return (
    <div style={{ background:`${theme.bg}99`,border:`1px solid ${theme.border}`,borderRadius:12,padding:16,marginBottom:16 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
        <span style={{ fontSize:18 }}>🏠</span>
        <p style={{ fontWeight:700,fontSize:14,color:theme.text }}>Fiche immobilière</p>
        {immo.transaction && <span style={{ background:`${colorMap[immo.transaction]}22`,color:colorMap[immo.transaction]||"#6C63FF",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700 }}>{immo.transaction}</span>}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
        {/* Type + Recasée sur la même ligne */}
        {immo.sousType && <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:"8px 12px" }}><p style={{ fontSize:10,color:theme.sub,fontWeight:600,marginBottom:2 }}>TYPE</p><p style={{ fontSize:13,color:theme.text,fontWeight:600 }}>{immo.sousType}</p></div>}
        {immo.recasee && <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:"8px 12px" }}><p style={{ fontSize:10,color:theme.sub,fontWeight:600,marginBottom:2 }}>RECASÉE</p><p style={{ fontSize:13,color:immo.recasee==="Oui"?"#43C6AC":"#FF4757",fontWeight:700 }}>{immo.recasee}</p></div>}
        {immo.superficie && <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:"8px 12px" }}><p style={{ fontSize:10,color:theme.sub,fontWeight:600,marginBottom:2 }}>SUPERFICIE</p><p style={{ fontSize:13,color:theme.text,fontWeight:600 }}>{immo.superficie} m²</p></div>}
        {immo.pieces && <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:"8px 12px" }}><p style={{ fontSize:10,color:theme.sub,fontWeight:600,marginBottom:2 }}>NB. PIÈCES</p><p style={{ fontSize:13,color:theme.text,fontWeight:600 }}>{immo.pieces}</p></div>}
        {immo.titre && <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:"8px 12px" }}><p style={{ fontSize:10,color:theme.sub,fontWeight:600,marginBottom:2 }}>TITRE FONCIER</p><p style={{ fontSize:13,color:theme.text,fontWeight:600 }}>{immo.titre}</p></div>}
        {immo.etat && <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:"8px 12px" }}><p style={{ fontSize:10,color:theme.sub,fontWeight:600,marginBottom:2 }}>ÉTAT GÉNÉRAL</p><p style={{ fontSize:13,color:theme.text,fontWeight:600 }}>{immo.etat}</p></div>}
        {immo.eau && <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:"8px 12px" }}><p style={{ fontSize:10,color:theme.sub,fontWeight:600,marginBottom:2 }}>RÉSEAU EAU</p><p style={{ fontSize:13,color:theme.text,fontWeight:600 }}>{immo.eau}</p></div>}
        {immo.electricite && <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:"8px 12px" }}><p style={{ fontSize:10,color:theme.sub,fontWeight:600,marginBottom:2 }}>ÉLECTRICITÉ</p><p style={{ fontSize:13,color:theme.text,fontWeight:600 }}>{immo.electricite}</p></div>}
        {[immo.ville,immo.quartier,immo.von].filter(Boolean).join(", ") && <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:"8px 12px",gridColumn:"1/-1" }}><p style={{ fontSize:10,color:theme.sub,fontWeight:600,marginBottom:2 }}>LOCALISATION</p><p style={{ fontSize:13,color:theme.text,fontWeight:600 }}>{[immo.ville,immo.quartier,immo.von].filter(Boolean).join(", ")}</p></div>}
        {immo.autres && <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:"8px 12px",gridColumn:"1/-1" }}><p style={{ fontSize:10,color:theme.sub,fontWeight:600,marginBottom:2 }}>AUTRES INFOS</p><p style={{ fontSize:13,color:theme.text,fontWeight:600 }}>{immo.autres}</p></div>}
      </div>
    </div>
  );
}

export default function App() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [boutiques, setBoutiques] = useState(INITIAL_BOUTIQUES);
  const [ateliers, setAteliers] = useState(INITIAL_ATELIERS);
  const [restos, setRestos] = useState(INITIAL_RESTOS);
  const [suggestions, setSuggestions] = useState([{ id:1,text:"Ajouter un système de messagerie interne",author:"Visiteur anonyme",date:"2026-03-10",status:"en attente" }]);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("landing");
  const [shopForm, setShopForm] = useState({ name:"",type:"",description:"",services:"",keywords:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:"" });
  const [immoForm, setImmoForm] = useState({ sousType:"Maison", transaction:"Vente", superficie:"", pieces:"", titre:"", ville:"", quartier:"", von:"", eau:"Oui", electricite:"Oui", etat:"Bon état", recasee:"", autres:"" });
  const [shopPhotos, setShopPhotos] = useState([]);
  const [shopVideo, setShopVideo] = useState(null);
  const [shopMode, setShopMode] = useState("boutique");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [modal, setModal] = useState(null);
  const [notification, setNotification] = useState(null);
  const [likedPosts, setLikedPosts] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mf_favorites") || "[]"); }
    catch { return []; }
  });

  const toggleFavorite = (id) => {
    setFavorites(f => {
      const updated = f.includes(id) ? f.filter(x=>x!==id) : [...f, id];
      localStorage.setItem("mf_favorites", JSON.stringify(updated));
      return updated;
    });
  };
  const [authForm, setAuthForm] = useState({ email:"",password:"",name:"" });
  const [postForm, setPostForm] = useState({ title:"",category:"Autre",description:"",price:"",contact:"",phone:"" });
  const [postPhotos, setPostPhotos] = useState([]);
  const [vehicleForm, setVehicleForm] = useState({});
  const [themeId, setThemeId] = useState("dark");
  const [suggestionText, setSuggestionText] = useState("");
  const [suggestionName, setSuggestionName] = useState("");
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const nextId = useRef(100);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const theme = BACKGROUNDS.find(b=>b.id===themeId)||BACKGROUNDS[0];

  const notify = (msg, type="success") => { setNotification({msg,type}); setTimeout(()=>setNotification(null),3000); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from("profiles").select("*").eq("id", session.user.id).single()
          .then(({ data }) => {
            if (data) setUser({ id:session.user.id, name:data.name, role:data.role||"user", isPremium:data.is_premium||false, plan:data.plan });
          });
      }
    });
    supabase.auth.onAuthStateChange((_event, session) => { if (!session) setUser(null); });
  }, []);

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email:authForm.email, password:authForm.password });
    if (error) { notify("Email ou mot de passe incorrect","error"); return; }
    const { data: profile } = await supabase.from("profiles").select("*").eq("id",data.user.id).single();
    if (profile) setUser({ id:data.user.id, name:profile.name, role:profile.role||"user", isPremium:profile.is_premium||false, plan:profile.plan });
    setView("home"); notify(`Bienvenue !`);
  };

  const register = async () => {
    if (!authForm.name||!authForm.email||!authForm.password) { notify("Remplissez tous les champs","error"); return; }
    const { data, error } = await supabase.auth.signUp({ email:authForm.email, password:authForm.password });
    if (error) { notify("Erreur : "+error.message,"error"); return; }
    await supabase.from("profiles").insert({ id:data.user.id, name:authForm.name, role:"user", is_premium:false });
    setUser({ id:data.user.id, name:authForm.name, role:"user", isPremium:false });
    setView("home"); notify("Compte créé ! Vous pouvez maintenant publier des annonces.");
  };

  const logout = async () => { await supabase.auth.signOut(); setUser(null); setView("home"); notify("À bientôt !"); };
  const canEdit = user !== null;
  const isVehicle = postForm.category === "Véhicules";
  const [months, setMonths] = useState(1);
  const PRICE_PER_MONTH = 1500;

  useEffect(() => {
    const today = new Date();
    setPosts(prev => prev.map(post => {
      if (!post.expiresAt) return post;
      const expDate = new Date(post.expiresAt);
      const daysLeft = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) return { ...post, expired: true };
      if (daysLeft <= 7) return { ...post, expiringSoon: true };
      return post;
    }));
  }, []);

  const getDaysLeft = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const addPost = () => {
    if (!postForm.title||!postForm.description) { notify("Titre et description requis","error"); return; }
    if (isVehicle && !vehicleForm.marque) { notify("La marque du véhicule est requise","error"); return; }
    const isAdmin = user.role === "admin";
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + months);
    const newPost = {
      ...postForm,
      id: nextId.current++,
      author: user.name,
      authorId: user.id,
      date: new Date().toISOString().slice(0,10),
      likes: 0,
      photos: postPhotos,
      vehicle: isVehicle ? vehicleForm : null,
      immo: postForm.category==="Immobilier" ? immoForm : null,
      expiresAt: isAdmin ? null : expDate.toISOString().slice(0,10),
      months: isAdmin ? null : months,
    };
    setPosts(p=>[newPost,...p]);
    setModal(null);
    setPostForm({ title:"",category:"Autre",description:"",price:"",contact:"",phone:"" });
    setPostPhotos([]); setVehicleForm({}); setImmoForm({ sousType:"Maison",transaction:"Vente",superficie:"",pieces:"",titre:"",ville:"",quartier:"",von:"",eau:"Oui",electricite:"Oui",etat:"Bon état",recasee:"",autres:"" }); setMonths(1);
    notify(isAdmin ? "Annonce publiée !" : "Annonce publiée pour " + months + " mois · " + (months * 1500).toLocaleString() + " FCFA !");
  };

  const editPost = () => {
    setPosts(p=>p.map(post=>post.id===modal.data.id?{...post,...postForm,photos:postPhotos,vehicle:isVehicle?vehicleForm:null}:post));
    setModal(null); notify("Annonce modifiée !");
  };

  const deletePost = (id) => { setPosts(p=>p.filter(post=>post.id!==id)); setModal(null); notify("Annonce supprimée."); };

  const likePost = (id) => {
    if (likedPosts.includes(id)) return;
    setLikedPosts(l=>[...l,id]);
    setPosts(p=>p.map(post=>post.id===id?{...post,likes:post.likes+1}:post));
  };

  const openEdit = (post) => {
    setPostForm({ title:post.title, category:post.category, description:post.description, price:post.price||"", contact:post.contact||"", phone:post.phone||"" });
    setPostPhotos(post.photos||[]);
    setVehicleForm(post.vehicle||{});
    setModal({ type:"edit", data:post });
  };

  const submitSuggestion = () => {
    if (!suggestionText.trim()) { notify("Écrivez votre suggestion","error"); return; }
    setSuggestions(s=>[{ id:Date.now(), text:suggestionText, author:suggestionName||"Visiteur anonyme", date:new Date().toISOString().slice(0,10), status:"en attente" },...s]);
    setSuggestionText(""); setSuggestionName(""); setModal(null); notify("Merci pour votre suggestion !");
  };

  const addResto = () => {
    if (!shopForm.name||!shopForm.description) { notify("Nom et description requis","error"); return; }
    const isAdmin = user.role === "admin";
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + months);
    const newResto = {
      ...shopForm,
      id: "r" + nextId.current++,
      author: user.name, authorId: user.id,
      date: new Date().toISOString().slice(0,10),
      likes: 0, photos: shopPhotos, video: shopVideo,
      expiresAt: isAdmin ? null : expDate.toISOString().slice(0,10),
    };
    setRestos(r=>[newResto,...r]);
    setModal(null);
    setShopForm({ name:"",type:"",description:"",services:"",keywords:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:"" });
    setShopPhotos([]); setShopVideo(null); setMonths(1);
    notify("Restaurant/Bar publié !");
  };

  const addShop = () => {
    if (!shopForm.name||!shopForm.description) { notify("Nom et description requis","error"); return; }
    const isAdmin = user.role === "admin";
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + months);
    const newShop = {
      ...shopForm,
      id: (shopMode==="boutique"?"b":"a") + nextId.current++,
      author: user.name, authorId: user.id,
      date: new Date().toISOString().slice(0,10),
      likes: 0, photos: shopPhotos, video: shopVideo,
      expiresAt: isAdmin ? null : expDate.toISOString().slice(0,10),
    };
    if (shopMode==="boutique") setBoutiques(b=>[newShop,...b]);
    else setAteliers(a=>[newShop,...a]);
    setModal(null);
    setShopForm({ name:"",type:"",description:"",services:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:"" });
    setShopPhotos([]); setShopVideo(null); setMonths(1);
    notify(shopMode==="boutique" ? "Boutique publiée !" : "Atelier publié !");
  };

  const filtered = posts.filter(p=>{
    if (p.expired) return false;
    if (category!=="Toutes" && p.category!==category) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (priceMin || priceMax) {
      const rawPrice = (p.price||"").replace(/[^0-9]/g,"");
      const numPrice = parseInt(rawPrice);
      if (rawPrice) {
        if (priceMin && numPrice < parseInt(priceMin)) return false;
        if (priceMax && numPrice > parseInt(priceMax)) return false;
      }
    }
    return true;
  });
  const myPosts = user?posts.filter(p=>p.authorId===user.id):[];

  const inputStyle = { width:"100%",padding:"12px 16px",background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:10,color:theme.text,fontSize:14,fontFamily:"inherit" };
  const cardStyle = { background:theme.card, border:`1px solid ${theme.border}` };

  return (
    <div style={{ minHeight:"100vh",width:"100vw",background:theme.bg,color:theme.text,fontFamily:"'Sora','Segoe UI',sans-serif",overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{width:100%;overflow-x:hidden;}
        ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-thumb{background:#2A2D45;border-radius:3px;}
        input,textarea,select{outline:none;font-family:inherit;}
        button{cursor:pointer;font-family:inherit;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes notifIn{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
        .card-hover{transition:transform 0.25s ease,box-shadow 0.25s ease;}
        .card-hover:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(108,99,255,0.18)!important;}
        .btn-glow:hover{box-shadow:0 0 24px rgba(108,99,255,0.5);}
        .tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;}
        .bg-opt{transition:transform 0.15s;cursor:pointer;} .bg-opt:hover{transform:scale(1.08);}
      `}</style>

      {/* Bouton WhatsApp Support flottant */}
      <a href="https://wa.me/2290147562640?text=Bonjour%20MarketFlow%20Support%2C%20j'ai%20besoin%20d'aide%20concernant%20ma%20publication." target="_blank" rel="noopener noreferrer" style={{ position:"fixed",bottom:90,right:30,zIndex:999,width:52,height:52,borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(37,211,102,0.5)",cursor:"pointer",textDecoration:"none" }}>
        <svg width="26" height="26" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
      </a>

      {showScrollTop && (
        <button onClick={scrollToTop} style={{ position:"fixed",bottom:30,right:30,zIndex:999,width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(108,99,255,0.5)",cursor:"pointer",fontSize:20 }}>↑</button>
      )}

      {notification && <div style={{ position:"fixed",top:20,right:20,zIndex:9999,animation:"notifIn 0.3s ease",background:notification.type==="error"?"#FF4757":"#43C6AC",color:"#fff",padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14,boxShadow:"0 8px 30px rgba(0,0,0,0.3)" }}>{notification.msg}</div>}

      {/* Background picker */}
      {showBgPicker && (
        <div onClick={()=>setShowBgPicker(false)} style={{ position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.3)" }}>
          <div onClick={e=>e.stopPropagation()} style={{ position:"absolute",top:72,right:16,...cardStyle,borderRadius:16,padding:20,width:280,boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
            <p style={{ fontWeight:700,fontSize:14,marginBottom:14,color:theme.text }}>🎨 Choisir l'arrière-plan</p>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
              {BACKGROUNDS.map(bg=>(
                <div key={bg.id} className="bg-opt" onClick={()=>{setThemeId(bg.id);setShowBgPicker(false);}} style={{ background:bg.bg,border:`2px solid ${themeId===bg.id?"#6C63FF":bg.border}`,borderRadius:12,padding:"14px 8px",textAlign:"center",boxShadow:themeId===bg.id?"0 0 12px rgba(108,99,255,0.5)":"none" }}>
                  <div style={{ width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${bg.card},${bg.border})`,margin:"0 auto 6px" }}/>
                  <p style={{ fontSize:10,fontWeight:600,color:bg.text }}>{bg.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav style={{ background:`${theme.bg}EE`,borderBottom:`1px solid ${theme.border}`,padding:"0 32px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)",width:"100%" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer" }} onClick={()=>setView("landing")}>
          <img src="/logo.svg" alt="MarketFlow" style={{ width:40,height:40,borderRadius:8 }}/>
          <span style={{ fontWeight:800,fontSize:18,background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>MarketFlow</span>
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center",flexWrap:"wrap" }}>
          <button onClick={()=>setView("home")} style={{ background:view==="home"?"rgba(108,99,255,0.2)":"transparent",border:"none",color:view==="home"?"#6C63FF":theme.sub,padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>
            Annonces
          </button>
          <button onClick={()=>setModal({type:"howto"})} style={{ background:"rgba(67,198,172,0.1)",border:"none",color:"#43C6AC",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>
            💡 Comment publier ?
          </button>
          <button onClick={()=>setView("about")} style={{ background:view==="about"?"rgba(108,99,255,0.2)":"transparent",border:"none",color:view==="about"?"#6C63FF":theme.sub,padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>
            À propos
          </button>
          <button onClick={()=>setView("terms")} style={{ background:view==="terms"?"rgba(108,99,255,0.2)":"transparent",border:"none",color:view==="terms"?"#6C63FF":theme.sub,padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>
            CGU
          </button>
          <button onClick={()=>setModal({type:"suggestion"})} style={{ background:"rgba(67,198,172,0.1)",border:"none",color:"#43C6AC",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:6 }}><Icon name="suggestion" size={14}/>Suggestion</button>
          {user?.role==="admin"&&<button onClick={()=>setView("admin")} style={{ background:"transparent",border:"none",color:"#FF6584",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>Admin</button>}
          <button onClick={()=>setShowBgPicker(p=>!p)} style={{ background:"rgba(108,99,255,0.1)",border:`1px solid rgba(108,99,255,0.3)`,color:"#6C63FF",padding:"8px 12px",borderRadius:8,display:"flex",alignItems:"center",gap:6,fontWeight:600,fontSize:13 }}><Icon name="palette" size={14}/>Thème</button>
          {user?(
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>

              <button onClick={()=>setView("dashboard")} style={{ ...cardStyle,padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:6,color:theme.text }}><Icon name="user" size={14}/>{user.name.split(" ")[0]}</button>
              <button onClick={logout} style={{ background:"transparent",border:"none",color:theme.sub,padding:"8px" }}><Icon name="logout" size={16}/></button>
            </div>
          ):(
            <div style={{ display:"flex",gap:6 }}>
              <button onClick={()=>setView("login")} style={{ background:"transparent",border:`1px solid ${theme.border}`,color:theme.text,padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>Connexion</button>
              <button onClick={()=>setView("register")} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,transition:"box-shadow 0.2s" }}>S'inscrire</button>
            </div>
          )}
        </div>
      </nav>

      {/* LANDING PAGE */}
      {view==="landing"&&(
        <div style={{ width:"100%",minHeight:"calc(100vh - 64px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px",animation:"fadeIn 0.6s ease",position:"relative",overflow:"hidden" }}>

          {/* Background decoration */}
          <div style={{ position:"absolute",top:-100,left:-100,width:400,height:400,borderRadius:"50%",background:"rgba(108,99,255,0.06)",pointerEvents:"none" }}/>
          <div style={{ position:"absolute",bottom:-100,right:-100,width:500,height:500,borderRadius:"50%",background:"rgba(255,101,132,0.05)",pointerEvents:"none" }}/>

          {/* Logo */}
          <img src="/logo.svg" alt="MarketFlow" style={{ width:160,height:160,marginBottom:24,filter:"drop-shadow(0 8px 32px rgba(108,99,255,0.3))" }}/>

          {/* Titre */}
          <h1 style={{ fontSize:56,fontWeight:800,textAlign:"center",lineHeight:1.1,marginBottom:16,color:theme.text }}>
            Bienvenue sur{" "}
            <span style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>MarketFlow</span>
          </h1>

          {/* Slogan */}
          <p style={{ fontSize:20,color:theme.sub,textAlign:"center",maxWidth:600,lineHeight:1.7,marginBottom:40 }}>
            La plateforme qui connecte commerçants, entreprises et particuliers au <strong style={{ color:theme.text }}>Bénin</strong> et partout en <strong style={{ color:theme.text }}>Afrique</strong> 🌍
          </p>

          {/* Statistiques */}
          <div style={{ display:"flex",gap:20,marginBottom:48,flexWrap:"wrap",justifyContent:"center" }}>
            {[
              { val:posts.length, label:"Annonces", color:"#6C63FF", icon:"📋" },
              { val:boutiques.length, label:"Boutiques", color:"#FF6584", icon:"🛍️" },
              { val:ateliers.length, label:"Ateliers", color:"#43C6AC", icon:"🔧" },
              { val:restos.length, label:"Restos & Bars", color:"#FF8C00", icon:"🍽️" },
              { val:CATEGORIES.length-1, label:"Catégories", color:"#FFD700", icon:"🗂️" },
            ].map(s=>(
              <div key={s.label} style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:16,padding:"20px 28px",textAlign:"center",minWidth:120 }}>
                <p style={{ fontSize:24,marginBottom:4 }}>{s.icon}</p>
                <p style={{ fontSize:32,fontWeight:800,color:s.color }}>{s.val}</p>
                <p style={{ fontSize:13,color:theme.sub,fontWeight:600 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Catégories vitrine */}
          <div style={{ display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",marginBottom:48,maxWidth:800 }}>
            {[
              { label:"Immobilier", icon:"🏠", color:"#6C63FF" },
              { label:"Véhicules", icon:"🚗", color:"#FF6584" },
              { label:"Électronique", icon:"📱", color:"#43C6AC" },
              { label:"Services", icon:"🔧", color:"#FFD700" },
              { label:"Sport", icon:"⚽", color:"#FF6584" },
              { label:"Mode", icon:"👗", color:"#9A78CF" },
              { label:"Autre", icon:"🍳", color:"#43C6AC" },
            ].map(c=>(
              <button key={c.label} onClick={()=>{ setCategory(c.label); setView("home"); }} style={{ background:`${c.color}15`,border:`1px solid ${c.color}44`,color:c.color,padding:"10px 20px",borderRadius:24,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all 0.2s" }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Boutons CTA */}
          <div style={{ display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center",marginBottom:32 }}>
            <button onClick={()=>setView("home")} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"16px 40px",borderRadius:14,fontWeight:800,fontSize:18,cursor:"pointer",transition:"box-shadow 0.2s",boxShadow:"0 4px 20px rgba(108,99,255,0.4)" }}>
              Voir les annonces →
            </button>
            {!user && (
              <button onClick={()=>setView("register")} style={{ background:"transparent",border:`2px solid ${theme.border}`,color:theme.text,padding:"16px 40px",borderRadius:14,fontWeight:700,fontSize:18,cursor:"pointer" }}>
                Créer un compte
              </button>
            )}
          </div>

          {/* Boutiques & Ateliers */}
          <div style={{ display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center" }}>
            <button onClick={()=>setView("boutiques")} style={{ background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.3)",color:"#FF6584",padding:"10px 24px",borderRadius:24,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8 }}>
              🛍️ Boutiques <span style={{ background:"rgba(255,101,132,0.2)",borderRadius:12,padding:"2px 8px",fontSize:12 }}>{boutiques.length}</span>
            </button>
            <button onClick={()=>setView("ateliers")} style={{ background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.3)",color:"#43C6AC",padding:"10px 24px",borderRadius:24,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8 }}>
              🔧 Ateliers <span style={{ background:"rgba(67,198,172,0.2)",borderRadius:12,padding:"2px 8px",fontSize:12 }}>{ateliers.length}</span>
            </button>
            <button onClick={()=>setView("restos")} style={{ background:"rgba(255,140,0,0.1)",border:"1px solid rgba(255,140,0,0.3)",color:"#FF8C00",padding:"10px 24px",borderRadius:24,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8 }}>
              🍽️ Restos & Bars <span style={{ background:"rgba(255,140,0,0.2)",borderRadius:12,padding:"2px 8px",fontSize:12 }}>{restos.length}</span>
            </button>
          </div>

          {/* Footer landing */}
          <p style={{ color:theme.sub,fontSize:13,marginTop:40,textAlign:"center" }}>
            © 2026 MarketFlow · Ouidah, Bénin 🇧🇯 · <button onClick={()=>setView("terms")} style={{ background:"none",border:"none",color:"#6C63FF",cursor:"pointer",fontSize:13 }}>CGU</button> · <button onClick={()=>setView("about")} style={{ background:"none",border:"none",color:"#6C63FF",cursor:"pointer",fontSize:13 }}>À propos</button>
          </p>
        </div>
      )}

      {/* HOME */}
      {view==="home"&&(
        <div style={{ width:"100%",padding:"32px 40px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ textAlign:"center",marginBottom:48 }}>
            <h1 style={{ fontSize:52,fontWeight:800,lineHeight:1.1,marginBottom:16,color:theme.text }}>Découvrez des <span style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>annonces uniques</span></h1>
            <p style={{ color:theme.sub,fontSize:17,marginBottom:28 }}>Consultez gratuitement · Publiez avec un abonnement</p>
            <div style={{ maxWidth:600,margin:"0 auto",position:"relative" }}>
              <div style={{ position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:theme.sub,pointerEvents:"none" }}><Icon name="search" size={16}/></div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une annonce..." style={{ ...inputStyle,padding:"14px 20px 14px 44px",borderRadius:12,fontSize:15 }}/>
            </div>
          </div>

          {/* Boutons Boutiques & Ateliers */}
          <div style={{ display:"flex",gap:12,justifyContent:"center",marginBottom:20,flexWrap:"wrap" }}>
            <button onClick={()=>setView("boutiques")} className="card-hover" style={{ background:"linear-gradient(135deg,#FF6584,#FFB347)",border:"none",color:"#fff",padding:"10px 24px",borderRadius:24,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 15px rgba(255,101,132,0.3)",cursor:"pointer" }}>
              🛍️ Boutiques <span style={{ background:"rgba(255,255,255,0.3)",borderRadius:12,padding:"2px 8px",fontSize:12 }}>{boutiques.length}</span>
            </button>
            <button onClick={()=>setView("ateliers")} className="card-hover" style={{ background:"linear-gradient(135deg,#43C6AC,#6C63FF)",border:"none",color:"#fff",padding:"10px 24px",borderRadius:24,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 15px rgba(67,198,172,0.3)",cursor:"pointer" }}>
              🔧 Ateliers <span style={{ background:"rgba(255,255,255,0.3)",borderRadius:12,padding:"2px 8px",fontSize:12 }}>{ateliers.length}</span>
            </button>
            <button onClick={()=>setView("restos")} className="card-hover" style={{ background:"linear-gradient(135deg,#FF8C00,#FF6584)",border:"none",color:"#fff",padding:"10px 24px",borderRadius:24,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 15px rgba(255,140,0,0.3)",cursor:"pointer" }}>
              🍽️ Restaurants & Bars <span style={{ background:"rgba(255,255,255,0.3)",borderRadius:12,padding:"2px 8px",fontSize:12 }}>{restos.length}</span>
            </button>
          </div>

          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:28,justifyContent:"center" }}>
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setCategory(c)} style={{ background:category===c?"linear-gradient(135deg,#6C63FF,#8B84FF)":theme.card,border:category===c?"none":`1px solid ${theme.border}`,color:category===c?"#fff":theme.sub,padding:"8px 18px",borderRadius:24,fontWeight:600,fontSize:13,transition:"all 0.2s",display:"flex",alignItems:"center",gap:6 }}>
                {c==="Véhicules"&&<Icon name="car" size={12}/>}{c}
              </button>
            ))}
          </div>

          {/* Filtre par prix */}
          <div style={{ display:"flex",gap:12,justifyContent:"center",alignItems:"center",marginBottom:24,flexWrap:"wrap" }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,background:theme.card,border:`1px solid ${theme.border}`,borderRadius:12,padding:"8px 16px" }}>
              <span style={{ color:theme.sub,fontSize:13,fontWeight:600,whiteSpace:"nowrap" }}>Prix min</span>
              <input value={priceMin} onChange={e=>setPriceMin(e.target.value)} placeholder="0" type="number" style={{ width:100,background:"transparent",border:"none",color:theme.text,fontSize:14,fontFamily:"inherit",outline:"none" }}/>
              <span style={{ color:theme.sub,fontSize:12 }}>FCFA</span>
            </div>
            <span style={{ color:theme.sub,fontSize:16 }}>—</span>
            <div style={{ display:"flex",alignItems:"center",gap:8,background:theme.card,border:`1px solid ${theme.border}`,borderRadius:12,padding:"8px 16px" }}>
              <span style={{ color:theme.sub,fontSize:13,fontWeight:600,whiteSpace:"nowrap" }}>Prix max</span>
              <input value={priceMax} onChange={e=>setPriceMax(e.target.value)} placeholder="∞" type="number" style={{ width:100,background:"transparent",border:"none",color:theme.text,fontSize:14,fontFamily:"inherit",outline:"none" }}/>
              <span style={{ color:theme.sub,fontSize:12 }}>FCFA</span>
            </div>
            {(priceMin||priceMax) && (
              <button onClick={()=>{setPriceMin("");setPriceMax("");}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"8px 14px",borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer" }}>
                ✕ Effacer
              </button>
            )}
          </div>

          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
            <p style={{ color:theme.sub,fontSize:14 }}>{filtered.length} annonce{filtered.length!==1?"s":""}</p>
            {canEdit?(
              <button onClick={()=>{setPostForm({title:"",category:"Autre",description:"",price:"",contact:"",phone:""});setPostPhotos([]);setVehicleForm({});setModal({type:"add"});}} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,transition:"box-shadow 0.2s" }}>
                <Icon name="plus" size={16}/>Publier une annonce
              </button>
            ):(
              <button onClick={()=>user?setView("pricing"):setView("register")} style={{ ...cardStyle,border:`1px dashed #6C63FF`,color:"#6C63FF",padding:"10px 20px",borderRadius:10,fontWeight:600,fontSize:14,display:"flex",alignItems:"center",gap:8 }}>
                <Icon name="lock" size={14}/>{user?"Passer PRO pour publier":"Créer un compte"}
              </button>
            )}
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:20 }}>
            {filtered.map(post=>(
              <div key={post.id} className="card-hover" style={{ ...cardStyle,borderRadius:16,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"fadeIn 0.4s ease" }}>
                {post.photos&&post.photos.length>0&&<PhotoCarousel photos={post.photos}/>}
                <div style={{ padding:20 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                    <span className="tag" style={{ background:post.category==="Véhicules"?"rgba(255,101,132,0.15)":"rgba(108,99,255,0.15)",color:post.category==="Véhicules"?"#FF6584":"#8B84FF",display:"flex",alignItems:"center",gap:4 }}>
                      {post.category==="Véhicules"&&<Icon name="car" size={10}/>}{post.category}
                    </span>
                    {post.price&&<span style={{ fontWeight:700,color:"#43C6AC",fontSize:15 }}>{post.price}</span>}
                  </div>
                  {/* Badge expiration */}
                  {post.expiresAt && (() => { const d = getDaysLeft(post.expiresAt); return d !== null && d <= 7 ? (
                    <div style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:8,padding:"6px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:6 }}>
                      <span style={{ fontSize:12 }}>⚠️</span>
                      <p style={{ fontSize:12,color:"#FF4757",fontWeight:600 }}>Expire dans {d} jour{d>1?"s":""} · Prolongez depuis votre tableau de bord</p>
                    </div>
                  ) : d !== null && d <= 30 ? (
                    <div style={{ background:"rgba(255,165,0,0.1)",border:"1px solid rgba(255,165,0,0.3)",borderRadius:8,padding:"6px 12px",marginBottom:8 }}>
                      <p style={{ fontSize:12,color:"#FFA500",fontWeight:600 }}>⏳ Expire le {post.expiresAt}</p>
                    </div>
                  ) : null; })()}
                  <h3 style={{ fontWeight:700,fontSize:16,marginBottom:8,lineHeight:1.3,color:theme.text }}>{post.title}</h3>

                  {/* Mini fiche immobilière sur la carte */}
                  {post.immo&&(
                    <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:10 }}>
                      {[{v:post.immo.transaction},{v:post.immo.sousType},{v:post.immo.superficie?post.immo.superficie+" m²":null},{v:post.immo.pieces},{v:post.immo.ville}].filter(f=>f.v).map((f,i)=>(
                        <span key={i} className="tag" style={{ background:theme.bg,border:`1px solid ${theme.border}`,color:theme.sub }}>{f.v}</span>
                      ))}
                    </div>
                  )}
                  {/* Mini fiche véhicule sur la carte */}
                  {post.vehicle&&(
                    <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:10 }}>
                      {[{k:"marque",v:post.vehicle.marque},{k:"modele",v:post.vehicle.modele},{k:"annee",v:post.vehicle.annee},{k:"carburant",v:post.vehicle.carburant}].filter(f=>f.v).map(f=>(
                        <span key={f.k} className="tag" style={{ background:`${theme.bg}`,border:`1px solid ${theme.border}`,color:theme.sub }}>{f.v}</span>
                      ))}
                      {post.vehicle.position&&<span className="tag" style={{ background:`${theme.bg}`,border:`1px solid ${theme.border}`,color:theme.sub,display:"flex",alignItems:"center",gap:3 }}><Icon name="pin" size={9}/>{post.vehicle.position}</span>}
                    </div>
                  )}

                  <p style={{ color:theme.sub,fontSize:13,lineHeight:1.5,marginBottom:14 }}>{post.description.length>90?post.description.slice(0,90)+"...":post.description}</p>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                      <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#FF6584)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff" }}>{post.author[0]}</div>
                      <div><p style={{ fontSize:12,fontWeight:600,color:theme.text }}>{post.author}</p><p style={{ fontSize:11,color:theme.sub }}>{post.date}</p></div>
                    </div>
                    <div style={{ display:"flex",gap:4,alignItems:"center",flexWrap:"wrap" }}>
                      <button onClick={()=>likePost(post.id)} style={{ background:likedPosts.includes(post.id)?"rgba(255,101,132,0.2)":"transparent",border:"none",color:likedPosts.includes(post.id)?"#FF6584":theme.sub,display:"flex",alignItems:"center",gap:4,padding:"6px 8px",borderRadius:8,fontSize:12,fontWeight:600 }}><Icon name="heart" size={13}/>{post.likes}</button>
                      <button onClick={()=>toggleFavorite(post.id)} title={favorites.includes(post.id)?"Retirer des favoris":"Ajouter aux favoris"} style={{ background:favorites.includes(post.id)?"rgba(255,215,0,0.2)":"transparent",border:"none",color:favorites.includes(post.id)?"#FFD700":theme.sub,padding:"6px 8px",borderRadius:8,fontSize:16,cursor:"pointer" }}>{favorites.includes(post.id)?"★":"☆"}</button>
                      <button onClick={()=>setModal({type:"contact",data:post})} style={{ background:"rgba(67,198,172,0.1)",border:"none",color:"#43C6AC",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}><Icon name="mail" size={13}/>Contact</button>
                      <a href={"https://wa.me/?text="+encodeURIComponent("*"+post.title+"*"+"\n"+"Prix: "+(post.price||"Non precise")+"\n"+"Voir sur MarketFlow: https://marketflow-delta.vercel.app")} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                        <div style={{ background:"rgba(37,211,102,0.1)",border:"none",color:"#25D366",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4,cursor:"pointer" }}>
                          <svg width="13" height="13" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                          Partager
                        </div>
                      </a>
                      {user&&(user.id===post.authorId||user.role==="admin")&&canEdit&&(
                        <><button onClick={()=>openEdit(post)} style={{ background:"transparent",border:"none",color:"#6C63FF",padding:6,borderRadius:6 }}><Icon name="edit" size={14}/></button><button onClick={()=>setModal({type:"delete",data:post})} style={{ background:"transparent",border:"none",color:"#FF4757",padding:6,borderRadius:6 }}><Icon name="trash" size={14}/></button></>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length===0&&<div style={{ textAlign:"center",padding:"60px 0",color:theme.sub }}><p style={{ fontSize:40,marginBottom:12 }}>🔍</p><p>Aucune annonce trouvée</p></div>}


        </div>
      )}



      {/* DASHBOARD */}
      {view==="dashboard"&&user&&(
        <div style={{ width:"100%",maxWidth:900,margin:"0 auto",padding:"32px 40px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ ...cardStyle,borderRadius:20,padding:32,marginBottom:24 }}>
            <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:20 }}>
              <div style={{ width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#FF6584)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:800,color:"#fff" }}>{user.name[0]}</div>
              <div>
                <h2 style={{ fontWeight:800,fontSize:22,color:theme.text }}>{user.name}</h2>
                <div style={{ display:"flex",gap:8,marginTop:4 }}>
                  {user.isPremium?<span className="tag" style={{ background:"rgba(255,215,0,0.15)",color:"#FFD700" }}><Icon name="crown" size={10}/>PRO</span>:<span className="tag" style={{ background:"rgba(154,154,176,0.15)",color:theme.sub }}>Visiteur</span>}
                </div>
              </div>
            </div>

          </div>
          {/* Mes Favoris */}
          {favorites.length > 0 && (
            <div style={{ marginBottom:32 }}>
              <h3 style={{ fontWeight:700,fontSize:18,marginBottom:16,color:theme.text }}>⭐ Mes Favoris ({favorites.length})</h3>
              {posts.filter(p=>favorites.includes(p.id)).map(post=>(
                <div key={post.id} style={{ ...cardStyle,borderRadius:14,padding:16,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12 }}>
                  <div style={{ display:"flex",gap:12,alignItems:"center" }}>
                    {post.photos&&post.photos.length>0&&<img src={post.photos[0]} alt="" style={{ width:50,height:50,borderRadius:8,objectFit:"cover" }}/>}
                    <div>
                      <p style={{ fontWeight:700,marginBottom:4,color:theme.text }}>{post.title}</p>
                      <p style={{ color:theme.sub,fontSize:12 }}>{post.category} · {post.price||""}</p>
                    </div>
                  </div>
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>setModal({type:"contact",data:post})} style={{ background:"rgba(67,198,172,0.1)",border:"none",color:"#43C6AC",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>Contact</button>
                    <button onClick={()=>toggleFavorite(post.id)} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>Retirer</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ fontWeight:700,fontSize:18,marginBottom:16,color:theme.text }}>Mes annonces ({myPosts.length})</h3>
          {myPosts.map(post=>(
            <div key={post.id} style={{ ...cardStyle,borderRadius:14,padding:16,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12 }}>
              <div style={{ display:"flex",gap:12,alignItems:"center" }}>
                {post.photos&&post.photos.length>0&&<img src={post.photos[0]} alt="" style={{ width:50,height:50,borderRadius:8,objectFit:"cover" }}/>}
                <div>
                  <p style={{ fontWeight:700,marginBottom:4,color:theme.text }}>{post.title}</p>
                  <p style={{ color:theme.sub,fontSize:12 }}>{post.category}{post.vehicle?` · ${post.vehicle.marque} ${post.vehicle.modele}`:""} · {post.date}</p>
                </div>
              </div>
              <div style={{ display:"flex",gap:8,flexShrink:0,flexWrap:"wrap" }}>
                {post.expiresAt && (
                  <button onClick={()=>setModal({type:"prolong",data:post})} style={{ background:"rgba(67,198,172,0.15)",border:"none",color:"#43C6AC",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>⏳ Prolonger</button>
                )}
                <button onClick={()=>openEdit(post)} style={{ background:"rgba(108,99,255,0.15)",border:"none",color:"#6C63FF",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>Modifier</button>
                <button onClick={()=>setModal({type:"delete",data:post})} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {view==="admin"&&user?.role==="admin"&&(
        <div style={{ width:"100%",padding:"32px 40px",animation:"fadeIn 0.4s ease" }}>
          <h2 style={{ fontWeight:800,fontSize:28,marginBottom:8,color:theme.text }}>Panneau Admin</h2>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16,marginBottom:32,maxWidth:700 }}>
            {[{label:"Annonces",val:posts.length,color:"#6C63FF"},{label:"Véhicules",val:posts.filter(p=>p.category==="Véhicules").length,color:"#FF6584"},{label:"Boutiques",val:boutiques.length,color:"#FF6584"},{label:"Ateliers",val:ateliers.length,color:"#43C6AC"},{label:"Restos & Bars",val:restos.length,color:"#FF8C00"},{label:"Suggestions",val:suggestions.length,color:"#43C6AC"}].map(s=>(
              <div key={s.label} style={{ ...cardStyle,borderRadius:14,padding:20,textAlign:"center" }}><p style={{ fontSize:36,fontWeight:800,color:s.color }}>{s.val}</p><p style={{ color:theme.sub,fontSize:13 }}>{s.label}</p></div>
            ))}
          </div>
          <h3 style={{ fontWeight:700,fontSize:18,marginBottom:16,color:theme.text }}>Suggestions</h3>
          {suggestions.map(s=>(
            <div key={s.id} style={{ ...cardStyle,borderRadius:12,padding:16,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div><p style={{ fontWeight:600,color:theme.text,marginBottom:4 }}>{s.text}</p><p style={{ color:theme.sub,fontSize:12 }}>Par {s.author} · {s.date}</p></div>
              <span style={{ background:"rgba(67,198,172,0.1)",color:"#43C6AC",padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:600 }}>{s.status}</span>
            </div>
          ))}
          <h3 style={{ fontWeight:700,fontSize:18,margin:"24px 0 16px",color:theme.text }}>Toutes les annonces</h3>
          {posts.map(post=>(
            <div key={post.id} style={{ ...cardStyle,borderRadius:12,padding:16,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ display:"flex",gap:12,alignItems:"center" }}>
                {post.photos&&post.photos.length>0&&<img src={post.photos[0]} alt="" style={{ width:40,height:40,borderRadius:6,objectFit:"cover" }}/>}
                <div><p style={{ fontWeight:700,color:theme.text }}>{post.title}</p><p style={{ color:theme.sub,fontSize:12 }}>Par {post.author} · {post.category}</p></div>
              </div>
              <button onClick={()=>setModal({type:"delete",data:post})} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"8px 16px",borderRadius:8,fontWeight:600,fontSize:13 }}>Supprimer</button>
            </div>
          ))}
        </div>
      )}

      {/* LOGIN */}
      {view==="login"&&(
        <div style={{ maxWidth:420,margin:"60px auto",padding:"0 24px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ ...cardStyle,borderRadius:20,padding:36 }}>
            <h2 style={{ fontWeight:800,fontSize:26,marginBottom:6,color:theme.text }}>Connexion</h2>
            <p style={{ color:theme.sub,fontSize:13,marginBottom:28 }}>Connectez-vous à votre compte</p>
            {[{label:"Email",key:"email",type:"email"},{label:"Mot de passe",key:"password",type:"password"}].map(f=>(
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>{f.label}</label>
                <input type={f.type} value={authForm[f.key]} onChange={e=>setAuthForm(a=>({...a,[f.key]:e.target.value}))} style={inputStyle}/>
              </div>
            ))}
            <button onClick={login} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,marginTop:8,transition:"box-shadow 0.2s" }}>Se connecter</button>
            <p style={{ textAlign:"center",marginTop:20,color:theme.sub,fontSize:13 }}>Pas de compte ? <button onClick={()=>setView("register")} style={{ background:"none",border:"none",color:"#6C63FF",fontWeight:600,cursor:"pointer" }}>S'inscrire</button></p>
          </div>
        </div>
      )}

      {/* REGISTER */}
      {view==="register"&&(
        <div style={{ maxWidth:420,margin:"60px auto",padding:"0 24px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ ...cardStyle,borderRadius:20,padding:36 }}>
            <h2 style={{ fontWeight:800,fontSize:26,marginBottom:6,color:theme.text }}>Créer un compte</h2>
            <p style={{ color:theme.sub,fontSize:13,marginBottom:28 }}>Lecture toujours gratuite</p>
            {[{label:"Nom complet",key:"name",type:"text"},{label:"Email",key:"email",type:"email"},{label:"Mot de passe",key:"password",type:"password"}].map(f=>(
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>{f.label}</label>
                <input type={f.type} value={authForm[f.key]} onChange={e=>setAuthForm(a=>({...a,[f.key]:e.target.value}))} style={inputStyle}/>
              </div>
            ))}
            <button onClick={register} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,marginTop:8,transition:"box-shadow 0.2s" }}>Créer mon compte</button>
            <p style={{ textAlign:"center",marginTop:20,color:theme.sub,fontSize:13 }}>Déjà inscrit ? <button onClick={()=>setView("login")} style={{ background:"none",border:"none",color:"#6C63FF",fontWeight:600,cursor:"pointer" }}>Se connecter</button></p>
          </div>
        </div>
      )}

      {/* À PROPOS */}
      {view==="about"&&(
        <div style={{ width:"100%",padding:"48px 40px",animation:"fadeIn 0.4s ease" }}>

          {/* Hero */}
          <div style={{ textAlign:"center",marginBottom:64 }}>
            <img src="/logo.svg" alt="MarketFlow" style={{ width:120,height:120,borderRadius:20,boxShadow:"0 8px 32px rgba(108,99,255,0.4)",margin:"0 auto 20px",display:"block" }}/>
            <h1 style={{ fontSize:48,fontWeight:800,marginBottom:16,color:theme.text }}>À propos de <span style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>MarketFlow</span></h1>
            <p style={{ color:theme.sub,fontSize:18,maxWidth:700,margin:"0 auto",lineHeight:1.7 }}>La plateforme de petites annonces qui connecte commerçants, entreprises et particuliers au Bénin et au-delà des frontières.</p>
          </div>

          {/* Mission */}
          <div style={{ maxWidth:900,margin:"0 auto 48px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }}>
            <div style={{ ...{background:theme.card,border:`1px solid ${theme.border}`},borderRadius:20,padding:32 }}>
              <div style={{ fontSize:40,marginBottom:16 }}>🎯</div>
              <h2 style={{ fontWeight:800,fontSize:22,marginBottom:16,color:theme.text }}>Notre Mission</h2>
              <p style={{ color:theme.sub,fontSize:15,lineHeight:1.8 }}>
                Assister tous les commerçants formels et informels, ainsi que toutes personnes physiques et morales, à consulter et prendre des renseignements sur tous les produits, biens et services disponibles dans leur pays et au-delà de leurs frontières.
              </p>
            </div>
            <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:20,padding:32 }}>
              <div style={{ fontSize:40,marginBottom:16 }}>🌍</div>
              <h2 style={{ fontWeight:800,fontSize:22,marginBottom:16,color:theme.text }}>Notre Vision</h2>
              <p style={{ color:theme.sub,fontSize:15,lineHeight:1.8 }}>
                Permettre à toute personne intéressée de publier n'importe quel produit, bien ou service pour le bonheur du monde. Une plateforme ouverte, accessible et utile à tous, partout en Afrique et dans le monde.
              </p>
            </div>
          </div>

          {/* Valeurs */}
          <div style={{ maxWidth:900,margin:"0 auto 48px" }}>
            <h2 style={{ fontWeight:800,fontSize:28,marginBottom:24,color:theme.text,textAlign:"center" }}>Nos Valeurs</h2>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16 }}>
              {[
                { icon:"🤝", title:"Confiance", desc:"Des annonces vérifiées et des vendeurs responsables" },
                { icon:"💡", title:"Simplicité", desc:"Une interface claire et facile à utiliser pour tous" },
                { icon:"🚀", title:"Innovation", desc:"Des fonctionnalités modernes adaptées à l'Afrique" },
                { icon:"❤️", title:"Communauté", desc:"Relier les gens et favoriser les échanges locaux" },
              ].map(v=>(
                <div key={v.title} style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:16,padding:24,textAlign:"center" }}>
                  <div style={{ fontSize:32,marginBottom:12 }}>{v.icon}</div>
                  <h3 style={{ fontWeight:700,fontSize:16,marginBottom:8,color:theme.text }}>{v.title}</h3>
                  <p style={{ color:theme.sub,fontSize:13,lineHeight:1.6 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fondateur */}
          <div style={{ maxWidth:600,margin:"0 auto 48px" }}>
            <div style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:20,padding:32,textAlign:"center" }}>
              <div style={{ width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#FF6584)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:32,fontWeight:800,color:"#fff" }}>H</div>
              <h2 style={{ fontWeight:800,fontSize:22,marginBottom:4,color:theme.text }}>HOUNZA THÉOPHILE</h2>
              <p style={{ color:"#6C63FF",fontWeight:600,fontSize:14,marginBottom:16 }}>Fondateur & Directeur de MarketFlow</p>
              <p style={{ color:theme.sub,fontSize:14,lineHeight:1.7,marginBottom:20 }}>Passionné par le commerce et la technologie, HOUNZA Théophile a créé MarketFlow avec la vision de démocratiser le commerce en ligne au Bénin et en Afrique, en offrant une plateforme accessible à tous.</p>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <a href="mailto:thza@live.fr" style={{ textDecoration:"none",display:"flex",alignItems:"center",gap:10,background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.3)",borderRadius:10,padding:"10px 16px" }}>
                  <svg width="16" height="16" fill="none" stroke="#43C6AC" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span style={{ color:"#43C6AC",fontWeight:600,fontSize:14 }}>thza@live.fr</span>
                </a>
                <a href="https://wa.me/2290147562640" target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none",display:"flex",alignItems:"center",gap:10,background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",borderRadius:10,padding:"10px 16px" }}>
                  <svg width="16" height="16" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  <span style={{ color:"#25D366",fontWeight:600,fontSize:14 }}>+229 01 47 56 26 40</span>
                </a>
                <div style={{ display:"flex",alignItems:"center",gap:10,background:`${theme.bg}`,border:`1px solid ${theme.border}`,borderRadius:10,padding:"10px 16px" }}>
                  <svg width="16" height="16" fill="none" stroke={theme.sub} strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span style={{ color:theme.sub,fontSize:14 }}>Ouidah, Bénin 🇧🇯</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer about */}
          <div style={{ textAlign:"center",padding:"32px 0",borderTop:`1px solid ${theme.border}` }}>
            <p style={{ color:theme.sub,fontSize:14,marginBottom:16 }}>© 2026 MarketFlow · Tous droits réservés · Ouidah, Bénin</p>
            <button onClick={()=>setView("home")} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"12px 32px",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
              Voir les annonces →
            </button>
          </div>
        </div>
      )}


      {/* BOUTIQUES */}
      {view==="boutiques"&&(
        <div style={{ width:"100%",padding:"32px 40px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ textAlign:"center",marginBottom:40 }}>
            <h1 style={{ fontSize:46,fontWeight:800,marginBottom:12,color:theme.text }}>🛍️ <span style={{ background:"linear-gradient(135deg,#FF6584,#FFB347)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Boutiques</span></h1>
            <p style={{ color:theme.sub,fontSize:16,marginBottom:20 }}>Découvrez les boutiques près de chez vous · 3 000 FCFA/mois</p>
            <div style={{ maxWidth:500,margin:"0 auto",position:"relative" }}>
              <div style={{ position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:theme.sub,pointerEvents:"none" }}><Icon name="search" size={16}/></div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une boutique par nom, type, mots clés..." style={{ width:"100%",padding:"14px 20px 14px 44px",background:theme.card,border:`1px solid ${theme.border}`,borderRadius:12,color:theme.text,fontSize:14,fontFamily:"inherit",outline:"none" }}/>
            </div>
          </div>
          <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:24 }}>
            {canEdit ? (
              <button onClick={()=>{ setShopMode("boutique"); setShopForm({name:"",type:"",description:"",services:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:""}); setShopPhotos([]); setShopVideo(null); setMonths(1); setModal({type:"addshop"}); }} className="btn-glow" style={{ background:"linear-gradient(135deg,#FF6584,#FFB347)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,transition:"box-shadow 0.2s" }}>
                <Icon name="plus" size={16}/>Publier ma boutique
              </button>
            ) : (
              <button onClick={()=>setView("register")} style={{ ...cardStyle,border:"1px dashed #FF6584",color:"#FF6584",padding:"10px 20px",borderRadius:10,fontWeight:600,fontSize:14,display:"flex",alignItems:"center",gap:8 }}>
                <Icon name="lock" size={14}/>Créer un compte pour publier
              </button>
            )}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:20 }}>
            {boutiques.filter(b=>!search||(b.name+b.description+(b.keywords||"")+(b.type||"")).toLowerCase().includes(search.toLowerCase())).map(b=>(
              <div key={b.id} className="card-hover" style={{ ...cardStyle,borderRadius:16,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>
                {b.video && <video src={b.video.url} controls style={{ width:"100%",height:180,objectFit:"cover" }}/>}
                {!b.video && b.photos&&b.photos.length>0 && <PhotoCarousel photos={b.photos}/>}
                <div style={{ padding:20 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                    <span className="tag" style={{ background:"rgba(255,101,132,0.15)",color:"#FF6584" }}>🛍️ {b.type}</span>
                  </div>
                  <h3 style={{ fontWeight:800,fontSize:17,marginBottom:6,color:theme.text }}>{b.name}</h3>
                  <p style={{ color:theme.sub,fontSize:13,lineHeight:1.5,marginBottom:12 }}>{b.description.length>100?b.description.slice(0,100)+"...":b.description}</p>
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:12 }}>
                    <Icon name="pin" size={13}/>
                    <p style={{ fontSize:12,color:theme.sub }}>{b.ville}{b.quartier?`, ${b.quartier}`:""}{b.von?` · ${b.von}`:""}</p>
                  </div>
                  {b.horaires && <p style={{ fontSize:12,color:"#43C6AC",marginBottom:12 }}>🕐 {b.horaires}</p>}
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    <button onClick={()=>likePost(b.id)} style={{ background:"transparent",border:"none",color:likedPosts.includes(b.id)?"#FF6584":theme.sub,display:"flex",alignItems:"center",gap:4,padding:"6px 8px",borderRadius:8,fontSize:12,fontWeight:600 }}><Icon name="heart" size={13}/>{b.likes}</button>
                    <button onClick={()=>setModal({type:"contact",data:{...b,title:b.name}})} style={{ background:"rgba(67,198,172,0.1)",border:"none",color:"#43C6AC",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}><Icon name="phone" size={13}/>Contact</button>
                                        <a href={"https://wa.me/?text="+encodeURIComponent("*"+b.name+"*"+"\n"+"Type: "+b.type+"\n"+"Voir sur MarketFlow: https://marketflow-delta.vercel.app")} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(37,211,102,0.1)",color:"#25D366",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}>
                        <svg width="12" height="12" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        Partager
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {boutiques.length===0&&<div style={{ textAlign:"center",padding:"60px 0",color:theme.sub }}><p style={{ fontSize:40 }}>🛍️</p><p>Aucune boutique pour le moment</p></div>}
        </div>
      )}

      {/* ATELIERS */}
      {view==="ateliers"&&(
        <div style={{ width:"100%",padding:"32px 40px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ textAlign:"center",marginBottom:40 }}>
            <h1 style={{ fontSize:46,fontWeight:800,marginBottom:12,color:theme.text }}>🔧 <span style={{ background:"linear-gradient(135deg,#43C6AC,#6C63FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Ateliers</span></h1>
            <p style={{ color:theme.sub,fontSize:16,marginBottom:20 }}>Trouvez l'artisan qu'il vous faut · 3 000 FCFA/mois</p>
            <div style={{ maxWidth:500,margin:"0 auto",position:"relative" }}>
              <div style={{ position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:theme.sub,pointerEvents:"none" }}><Icon name="search" size={16}/></div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un atelier par nom, type, services..." style={{ width:"100%",padding:"14px 20px 14px 44px",background:theme.card,border:`1px solid ${theme.border}`,borderRadius:12,color:theme.text,fontSize:14,fontFamily:"inherit",outline:"none" }}/>
            </div>
          </div>
          <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:24 }}>
            {canEdit ? (
              <button onClick={()=>{ setShopMode("atelier"); setShopForm({name:"",type:"",description:"",services:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:""}); setShopPhotos([]); setShopVideo(null); setMonths(1); setModal({type:"addshop"}); }} className="btn-glow" style={{ background:"linear-gradient(135deg,#43C6AC,#6C63FF)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,transition:"box-shadow 0.2s" }}>
                <Icon name="plus" size={16}/>Publier mon atelier
              </button>
            ) : (
              <button onClick={()=>setView("register")} style={{ ...cardStyle,border:"1px dashed #43C6AC",color:"#43C6AC",padding:"10px 20px",borderRadius:10,fontWeight:600,fontSize:14,display:"flex",alignItems:"center",gap:8 }}>
                <Icon name="lock" size={14}/>Créer un compte pour publier
              </button>
            )}
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:20 }}>
            {ateliers.filter(a=>!search||(a.name+a.description+(a.keywords||"")+(a.type||"")+(a.services||"")).toLowerCase().includes(search.toLowerCase())).map(a=>(
              <div key={a.id} className="card-hover" style={{ ...cardStyle,borderRadius:16,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>
                {a.video && <video src={a.video.url} controls style={{ width:"100%",height:180,objectFit:"cover" }}/>}
                {!a.video && a.photos&&a.photos.length>0 && <PhotoCarousel photos={a.photos}/>}
                <div style={{ padding:20 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                    <span className="tag" style={{ background:"rgba(67,198,172,0.15)",color:"#43C6AC" }}>🔧 {a.type}</span>
                  </div>
                  <h3 style={{ fontWeight:800,fontSize:17,marginBottom:6,color:theme.text }}>{a.name}</h3>
                  <p style={{ color:theme.sub,fontSize:13,lineHeight:1.5,marginBottom:10 }}>{a.description.length>100?a.description.slice(0,100)+"...":a.description}</p>
                  {a.services && (
                    <div style={{ marginBottom:10 }}>
                      <p style={{ fontSize:11,color:theme.sub,fontWeight:600,marginBottom:4 }}>SERVICES :</p>
                      <p style={{ fontSize:12,color:theme.text }}>{a.services}</p>
                    </div>
                  )}
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:10 }}>
                    <Icon name="pin" size={13}/>
                    <p style={{ fontSize:12,color:theme.sub }}>{a.ville}{a.quartier?`, ${a.quartier}`:""}{a.von?` · ${a.von}`:""}</p>
                  </div>
                  {a.horaires && <p style={{ fontSize:12,color:"#43C6AC",marginBottom:12 }}>🕐 {a.horaires}</p>}
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>likePost(a.id)} style={{ background:"transparent",border:"none",color:likedPosts.includes(a.id)?"#FF6584":theme.sub,display:"flex",alignItems:"center",gap:4,padding:"6px 8px",borderRadius:8,fontSize:12,fontWeight:600 }}><Icon name="heart" size={13}/>{a.likes}</button>
                    <button onClick={()=>setModal({type:"contact",data:{...a,title:a.name}})} style={{ background:"rgba(67,198,172,0.1)",border:"none",color:"#43C6AC",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}><Icon name="phone" size={13}/>Contact</button>
                                        <a href={"https://wa.me/?text="+encodeURIComponent("*"+a.name+"*"+"\n"+"Type: "+a.type+"\n"+"Voir sur MarketFlow: https://marketflow-delta.vercel.app")} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(37,211,102,0.1)",color:"#25D366",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}>
                        <svg width="12" height="12" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        Partager
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {ateliers.length===0&&<div style={{ textAlign:"center",padding:"60px 0",color:theme.sub }}><p style={{ fontSize:40 }}>🔧</p><p>Aucun atelier pour le moment</p></div>}
        </div>
      )}
      {/* RESTAURANTS & BARS */}
      {view==="restos"&&(
        <div style={{ width:"100%",padding:"32px 40px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ textAlign:"center",marginBottom:40 }}>
            <h1 style={{ fontSize:46,fontWeight:800,marginBottom:12,color:theme.text }}>🍽️ <span style={{ background:"linear-gradient(135deg,#FF8C00,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Restaurants & Bars</span></h1>
            <p style={{ color:theme.sub,fontSize:16,marginBottom:20 }}>Rendez votre établissement visible partout · 3 000 FCFA/mois</p>
            <div style={{ maxWidth:500,margin:"0 auto",position:"relative" }}>
              <div style={{ position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:theme.sub,pointerEvents:"none" }}><Icon name="search" size={16}/></div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un restaurant, bar, maquis..." style={{ width:"100%",padding:"14px 20px 14px 44px",background:theme.card,border:`1px solid ${theme.border}`,borderRadius:12,color:theme.text,fontSize:14,fontFamily:"inherit",outline:"none" }}/>
            </div>
          </div>

          <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:24 }}>
            {canEdit ? (
              <button onClick={()=>{ setShopMode("resto"); setShopForm({name:"",type:"",description:"",specialite:"",plats:"",prixMoyen:"",capacite:"",services:"",keywords:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:""}); setShopPhotos([]); setShopVideo(null); setMonths(1); setModal({type:"addresto"}); }} className="btn-glow" style={{ background:"linear-gradient(135deg,#FF8C00,#FF6584)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,transition:"box-shadow 0.2s" }}>
                <Icon name="plus" size={16}/>Publier mon établissement
              </button>
            ) : (
              <button onClick={()=>setView("register")} style={{ ...cardStyle,border:"1px dashed #FF8C00",color:"#FF8C00",padding:"10px 20px",borderRadius:10,fontWeight:600,fontSize:14,display:"flex",alignItems:"center",gap:8 }}>
                <Icon name="lock" size={14}/>Créer un compte pour publier
              </button>
            )}
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:20 }}>
            {restos.filter(r=>!search||(r.name+r.description+(r.keywords||"")+(r.type||"")+(r.specialite||"")).toLowerCase().includes(search.toLowerCase())).map(r=>(
              <div key={r.id} className="card-hover" style={{ ...cardStyle,borderRadius:16,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>
                {r.video && <video src={r.video.url} controls style={{ width:"100%",height:180,objectFit:"cover" }}/>}
                {!r.video && r.photos&&r.photos.length>0 && <PhotoCarousel photos={r.photos}/>}
                <div style={{ padding:20 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                    <span className="tag" style={{ background:"rgba(255,140,0,0.15)",color:"#FF8C00" }}>🍽️ {r.type}</span>
                    {r.prixMoyen && <span style={{ fontSize:12,color:theme.sub,fontWeight:600 }}>{r.prixMoyen}</span>}
                  </div>
                  <h3 style={{ fontWeight:800,fontSize:17,marginBottom:4,color:theme.text }}>{r.name}</h3>
                  {r.specialite && <p style={{ fontSize:13,color:"#FF8C00",fontWeight:600,marginBottom:8 }}>✨ {r.specialite}</p>}
                  {r.plats && <p style={{ fontSize:12,color:theme.sub,marginBottom:8 }}>🍴 {r.plats.length>60?r.plats.slice(0,60)+"...":r.plats}</p>}
                  {r.services && (
                    <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:10 }}>
                      {r.services.split(",").map(s=>(
                        <span key={s} className="tag" style={{ background:"rgba(255,140,0,0.1)",color:"#FF8C00",fontSize:10 }}>{s.trim()}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:10 }}>
                    <Icon name="pin" size={13}/>
                    <p style={{ fontSize:12,color:theme.sub }}>{r.ville}{r.quartier?`, ${r.quartier}`:""}{r.von?` · ${r.von}`:""}</p>
                  </div>
                  {r.horaires && <p style={{ fontSize:12,color:"#43C6AC",marginBottom:12 }}>🕐 {r.horaires}</p>}
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>likePost(r.id)} style={{ background:"transparent",border:"none",color:likedPosts.includes(r.id)?"#FF6584":theme.sub,display:"flex",alignItems:"center",gap:4,padding:"6px 8px",borderRadius:8,fontSize:12,fontWeight:600 }}><Icon name="heart" size={13}/>{r.likes}</button>
                    <button onClick={()=>setModal({type:"contact",data:{...r,title:r.name}})} style={{ background:"rgba(255,140,0,0.1)",border:"none",color:"#FF8C00",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}><Icon name="phone" size={13}/>Contact</button>
                    <a href={"https://wa.me/?text="+encodeURIComponent("*"+r.name+"*"+"\n"+"Type: "+r.type+"\n"+"Voir sur MarketFlow: https://marketflow-delta.vercel.app")} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(37,211,102,0.1)",color:"#25D366",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}>
                        <svg width="12" height="12" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        Partager
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {restos.length===0&&<div style={{ textAlign:"center",padding:"60px 0",color:theme.sub }}><p style={{ fontSize:40 }}>🍽️</p><p>Aucun établissement pour le moment</p></div>}
        </div>
      )}

      {/* CONDITIONS GÉNÉRALES D'UTILISATION */}
      {view==="terms"&&(
        <div style={{ width:"100%",maxWidth:900,margin:"0 auto",padding:"48px 40px",animation:"fadeIn 0.4s ease" }}>

          {/* Header */}
          <div style={{ textAlign:"center",marginBottom:48 }}>
            <div style={{ fontSize:56,marginBottom:16 }}>📋</div>
            <h1 style={{ fontSize:42,fontWeight:800,marginBottom:12,color:theme.text }}>Conditions Générales <span style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>d'Utilisation</span></h1>
            <p style={{ color:theme.sub,fontSize:15 }}>Dernière mise à jour : Mars 2026 · MarketFlow, Ouidah, Bénin</p>
          </div>

          {/* Avertissement */}
          <div style={{ background:"rgba(255,71,87,0.08)",border:"2px solid rgba(255,71,87,0.3)",borderRadius:16,padding:24,marginBottom:40,display:"flex",gap:16,alignItems:"flex-start" }}>
            <span style={{ fontSize:28,flexShrink:0 }}>⚠️</span>
            <div>
              <p style={{ fontWeight:800,fontSize:16,color:"#FF4757",marginBottom:8 }}>Avertissement Important</p>
              <p style={{ color:theme.sub,fontSize:14,lineHeight:1.8 }}>
                En utilisant MarketFlow, vous acceptez pleinement et sans réserve les présentes conditions. Toute violation de ces conditions vous expose à des poursuites judiciaires conformément aux lois et textes en vigueur dans votre pays de résidence, ainsi qu'aux conventions et traités internationaux applicables.
              </p>
            </div>
          </div>

          {[
            {
              num:"1",
              title:"Présentation de MarketFlow",
              icon:"🏢",
              content:`MarketFlow est une plateforme numérique de petites annonces créée et gérée par HOUNZA THÉOPHILE, basée à Ouidah, Bénin. Elle permet à toute personne physique ou morale de consulter, publier et diffuser des annonces relatives à des produits, biens et services, au Bénin et dans le monde entier. L'accès à la plateforme implique l'acceptation sans réserve des présentes conditions générales d'utilisation.`
            },
            {
              num:"2",
              title:"Conditions d'accès et d'inscription",
              icon:"👤",
              content:`La consultation des annonces est gratuite et accessible à tous sans inscription. La publication d'annonces est réservée aux utilisateurs inscrits. Pour s'inscrire, l'utilisateur doit fournir des informations exactes, complètes et à jour. Toute inscription avec de fausses informations entraîne la suspension immédiate du compte et peut faire l'objet de poursuites judiciaires. L'utilisateur est seul responsable de la confidentialité de ses identifiants de connexion.`
            },
            {
              num:"3",
              title:"Publication d'annonces et tarification",
              icon:"💰",
              content:`La publication d'une annonce est payante à raison de 1 500 FCFA par mois. L'utilisateur choisit librement la durée de publication souhaitée. Passé le délai payé, l'annonce est automatiquement retirée de la plateforme. L'utilisateur peut prolonger la durée de publication depuis son tableau de bord. Les paiements s'effectuent via Mobile Money (MTN Money, Moov Money) via la plateforme FedaPay. Tout paiement effectué est non remboursable, sauf en cas de défaillance technique prouvée de la plateforme.`
            },
            {
              num:"4",
              title:"Contenus interdits",
              icon:"🚫",
              content:`Il est formellement interdit de publier sur MarketFlow : des armes, munitions ou matériels militaires ; des stupéfiants, drogues ou substances illicites ; des contenus à caractère pornographique ou sexuellement explicite ; des contenus impliquant des mineurs ; des animaux protégés ou en voie de disparition ; des médicaments sans autorisation ; des produits contrefaits ou volés ; des annonces frauduleuses ou trompeuses ; des contenus incitant à la haine, à la violence ou à la discrimination ; tout contenu portant atteinte aux droits de propriété intellectuelle. Toute annonce violant ces interdictions sera supprimée immédiatement et l'auteur signalé aux autorités compétentes.`
            },
            {
              num:"5",
              title:"Responsabilité des utilisateurs",
              icon:"⚖️",
              content:`Chaque utilisateur est entièrement et personnellement responsable du contenu qu'il publie sur MarketFlow. L'utilisateur garantit que ses annonces sont conformes aux lois en vigueur dans son pays et dans le pays destinataire. MarketFlow ne vérifie pas l'exactitude des informations publiées et ne peut être tenu responsable des transactions effectuées entre utilisateurs. En cas de litige entre acheteur et vendeur, MarketFlow ne peut être partie prenante et ne saurait être tenu pour responsable.`
            },
            {
              num:"6",
              title:"Limitation de responsabilité de MarketFlow",
              icon:"🛡️",
              content:`MarketFlow agit en qualité d'intermédiaire technique et ne peut être tenu responsable : des contenus publiés par les utilisateurs ; des transactions commerciales entre utilisateurs ; des pertes financières résultant d'une utilisation de la plateforme ; des interruptions temporaires de service pour maintenance ; des dommages indirects ou consécutifs liés à l'utilisation du site. MarketFlow s'engage cependant à faire ses meilleurs efforts pour assurer la disponibilité et la sécurité de la plateforme.`
            },
            {
              num:"7",
              title:"Protection des données personnelles",
              icon:"🔒",
              content:`MarketFlow collecte et traite les données personnelles des utilisateurs dans le strict respect de la vie privée. Les données collectées (nom, email, numéro de téléphone) sont utilisées uniquement pour le fonctionnement de la plateforme et ne sont jamais vendues à des tiers. L'utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données en contactant : thza@live.fr. MarketFlow s'engage à protéger vos données contre tout accès non autorisé.`
            },
            {
              num:"8",
              title:"Propriété intellectuelle",
              icon:"©️",
              content:`La plateforme MarketFlow, son logo, son design, son code source et tous ses contenus originaux sont la propriété exclusive de HOUNZA THÉOPHILE. Toute reproduction, modification, distribution ou utilisation commerciale sans autorisation écrite préalable est strictement interdite et constitue une violation du droit de la propriété intellectuelle passible de poursuites judiciaires. Les utilisateurs conservent la propriété des contenus qu'ils publient mais accordent à MarketFlow une licence d'affichage.`
            },
            {
              num:"9",
              title:"Suspension et suppression de compte",
              icon:"🔴",
              content:`MarketFlow se réserve le droit de suspendre ou supprimer tout compte sans préavis en cas de : violation des présentes conditions ; publication de contenus illicites ; comportement frauduleux ou abusif ; utilisation de fausses informations lors de l'inscription. La suppression d'un compte entraîne la perte de toutes les annonces publiées. L'utilisateur suspendu peut faire appel en contactant le support via WhatsApp ou email.`
            },
            {
              num:"10",
              title:"Sanctions et poursuites judiciaires",
              icon:"⚖️",
              content:`Tout utilisateur qui outrepasserait les présentes conditions d'utilisation s'expose à des sanctions graves. MarketFlow se réserve le droit d'engager toutes les procédures judiciaires nécessaires à la protection de ses intérêts et de ceux de ses utilisateurs. Les contrevenants seront poursuivis conformément aux lois et textes législatifs en vigueur dans leur pays de résidence, ainsi que selon les conventions et traités internationaux applicables en matière de commerce électronique, de cybercriminalité et de protection des données personnelles.`
            },
            {
              num:"11",
              title:"Modification des conditions",
              icon:"📝",
              content:`MarketFlow se réserve le droit de modifier les présentes conditions à tout moment. Les utilisateurs seront informés de toute modification importante par notification sur la plateforme. La poursuite de l'utilisation de MarketFlow après modification constitue une acceptation tacite des nouvelles conditions.`
            },
            {
              num:"12",
              title:"Contact et réclamations",
              icon:"📞",
              content:`Pour toute question, réclamation ou signalement d'abus, contactez-nous : Email : thza@live.fr · WhatsApp : +229 01 47 56 26 40 · Localisation : Ouidah, Bénin. Nous nous engageons à répondre à toute réclamation dans un délai de 48 heures ouvrables.`
            },
          ].map(section=>(
            <div key={section.num} style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:16,padding:28,marginBottom:16 }}>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
                <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14,flexShrink:0 }}>{section.num}</div>
                <h2 style={{ fontWeight:700,fontSize:17,color:theme.text }}>{section.icon} {section.title}</h2>
              </div>
              <p style={{ color:theme.sub,fontSize:14,lineHeight:1.9,paddingLeft:48 }}>{section.content}</p>
            </div>
          ))}

          {/* Signature */}
          <div style={{ background:"rgba(108,99,255,0.08)",border:"1px solid rgba(108,99,255,0.3)",borderRadius:16,padding:28,marginTop:32,textAlign:"center" }}>
            <p style={{ fontWeight:800,fontSize:16,color:theme.text,marginBottom:8 }}>En utilisant MarketFlow, vous confirmez avoir lu, compris et accepté l'intégralité des présentes conditions.</p>
            <p style={{ color:theme.sub,fontSize:13,marginBottom:20 }}>© 2026 MarketFlow · HOUNZA THÉOPHILE · Ouidah, Bénin 🇧🇯</p>
            <button onClick={()=>setView("home")} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"12px 32px",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
              Retour aux annonces →
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      {modal&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setModal(null)}} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24,backdropFilter:"blur(4px)" }}>
          <div style={{ ...cardStyle,borderRadius:20,padding:32,width:"100%",maxWidth:580,animation:"fadeIn 0.25s ease",maxHeight:"92vh",overflowY:"auto" }}>

            {/* ADD / EDIT */}
            {(modal.type==="add"||modal.type==="edit")&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>{modal.type==="add"?"Nouvelle annonce":"Modifier l'annonce"}</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>

                {/* Catégorie en premier */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Catégorie</label>
                  <select value={postForm.category} onChange={e=>setPostForm(p=>({...p,category:e.target.value}))} style={inputStyle}>
                    {CATEGORIES.filter(c=>c!=="Toutes").map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>

                <PhotoUploader photos={postPhotos} setPhotos={setPostPhotos} theme={theme}/>

                {/* Champs généraux */}
                {[{label:"Titre *",key:"title",type:"input"},{label:"Description *",key:"description",type:"textarea"},{label:"Prix",key:"price",type:"input"},{label:"Email de contact",key:"contact",type:"input"},{label:"Téléphone / WhatsApp",key:"phone",type:"input"}].map(f=>(
                  <div key={f.key} style={{ marginBottom:16 }}>
                    <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>{f.label}</label>
                    {f.type==="textarea"?<textarea value={postForm[f.key]} onChange={e=>setPostForm(p=>({...p,[f.key]:e.target.value}))} rows={3} style={{ ...inputStyle,resize:"vertical" }}/>:<input value={postForm[f.key]} onChange={e=>setPostForm(p=>({...p,[f.key]:e.target.value}))} style={inputStyle}/>}
                  </div>
                ))}

                {/* Champs immobilier */}
                {postForm.category==="Immobilier"&&(
                  <div style={{ marginTop:8 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16,padding:"12px 16px",background:theme.bg,border:`1px solid #6C63FF44`,borderRadius:10 }}>
                      <span style={{ fontSize:18 }}>🏠</span>
                      <p style={{ fontWeight:700,color:"#6C63FF",fontSize:14 }}>Fiche immobilière</p>
                    </div>
                    {/* Transaction + Type */}
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                      <div>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Transaction *</label>
                        <select value={immoForm.transaction} onChange={e=>setImmoForm(f=>({...f,transaction:e.target.value}))} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}>
                          <option>Vente</option><option>Location</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Type de bien *</label>
                        <select value={immoForm.sousType} onChange={e=>setImmoForm(f=>({...f,sousType:e.target.value}))} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}>
                          {IMMO_TYPES.map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                      <div>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Superficie (m²)</label>
                        <input value={immoForm.superficie} onChange={e=>setImmoForm(f=>({...f,superficie:e.target.value}))} placeholder="Ex: 200" style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                      </div>
                      <div>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Nombre de pièces</label>
                        <input value={immoForm.pieces} onChange={e=>setImmoForm(f=>({...f,pieces:e.target.value}))} placeholder="Ex: 5 pièces" style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                      </div>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Titre foncier</label>
                      <select value={immoForm.titre} onChange={e=>setImmoForm(f=>({...f,titre:e.target.value}))} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}>
                        {IMMO_TITRES.map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                      <div>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>État général</label>
                        <select value={immoForm.etat} onChange={e=>setImmoForm(f=>({...f,etat:e.target.value}))} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}>
                          {IMMO_ETATS.map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Réseau eau</label>
                        <select value={immoForm.eau} onChange={e=>setImmoForm(f=>({...f,eau:e.target.value}))} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}>
                          <option>Oui</option><option>Non</option><option>En attente</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                      <div>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Électricité</label>
                        <select value={immoForm.electricite} onChange={e=>setImmoForm(f=>({...f,electricite:e.target.value}))} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}>
                          <option>Oui</option><option>Non</option><option>En attente</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Ville *</label>
                        <input value={immoForm.ville} onChange={e=>setImmoForm(f=>({...f,ville:e.target.value}))} placeholder="Ex: Cotonou" style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                      </div>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                      <div>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Quartier</label>
                        <input value={immoForm.quartier} onChange={e=>setImmoForm(f=>({...f,quartier:e.target.value}))} placeholder="Ex: Akpakpa" style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                      </div>
                      <div>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Von de...</label>
                        <input value={immoForm.von} onChange={e=>setImmoForm(f=>({...f,von:e.target.value}))} placeholder="Ex: Von du marché" style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                      </div>
                    </div>
                    {immoForm.transaction==="Vente" && (
                      <div style={{ marginBottom:12 }}>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:8 }}>Recasée ?</label>
                        <div style={{ display:"flex",gap:10 }}>
                          {["Oui","Non"].map(v=>(
                            <button key={v} type="button" onClick={()=>setImmoForm(f=>({...f,recasee:v}))} style={{ flex:1,padding:"10px",borderRadius:10,border:`2px solid ${immoForm.recasee===v?"#43C6AC":theme.border}`,background:immoForm.recasee===v?"rgba(67,198,172,0.15)":theme.bg,color:immoForm.recasee===v?"#43C6AC":theme.sub,fontWeight:700,fontSize:14,cursor:"pointer",transition:"all 0.2s" }}>{v}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Autres renseignements</label>
                      <textarea value={immoForm.autres} onChange={e=>setImmoForm(f=>({...f,autres:e.target.value}))} rows={2} placeholder="Clôture, puits, parking, gardien..." style={{ ...inputStyle,resize:"vertical",fontSize:13 }}/>
                    </div>
                  </div>
                )}

                {/* Champs véhicule */}
                {isVehicle&&(
                  <div style={{ marginTop:8 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16,padding:"12px 16px",background:`${theme.bg}`,border:`1px solid #6C63FF44`,borderRadius:10 }}>
                      <span style={{ color:"#6C63FF" }}><Icon name="car" size={16}/></span>
                      <p style={{ fontWeight:700,color:"#6C63FF",fontSize:14 }}>Fiche technique du véhicule</p>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                      {VEHICLE_FIELDS.map(f=>(
                        <div key={f.key} style={{ gridColumn:f.key==="docs"||f.key==="autre"?"1/-1":"auto" }}>
                          <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>{f.label}</label>
                          <input value={vehicleForm[f.key]||""} onChange={e=>setVehicleForm(v=>({...v,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sélecteur de mois et paiement simulé - seulement pour les non-admins */}
                {modal.type==="add" && user?.role !== "admin" && (
                  <div style={{ background:theme.bg,border:`1px solid #6C63FF44`,borderRadius:14,padding:20,marginTop:16 }}>
                    <p style={{ fontWeight:700,fontSize:14,color:theme.text,marginBottom:4 }}>💰 Durée de publication</p>
                    <p style={{ fontSize:12,color:theme.sub,marginBottom:16 }}>1 500 FCFA par mois · L'annonce disparaît automatiquement à expiration</p>
                    <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
                      <button onClick={()=>setMonths(m=>Math.max(1,m-1))} style={{ width:36,height:36,borderRadius:"50%",background:"rgba(108,99,255,0.15)",border:"none",color:"#6C63FF",fontSize:20,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center" }}>-</button>
                      <div style={{ flex:1,textAlign:"center" }}>
                        <p style={{ fontSize:28,fontWeight:800,color:"#6C63FF" }}>{months}</p>
                        <p style={{ fontSize:12,color:theme.sub }}>mois</p>
                      </div>
                      <button onClick={()=>setMonths(m=>m+1)} style={{ width:36,height:36,borderRadius:"50%",background:"rgba(108,99,255,0.15)",border:"none",color:"#6C63FF",fontSize:20,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center" }}>+</button>
                    </div>
                    <div style={{ background:"rgba(108,99,255,0.1)",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                      <span style={{ color:theme.sub,fontSize:13 }}>Total à payer</span>
                      <span style={{ fontWeight:800,fontSize:18,color:"#43C6AC" }}>{(months*1500).toLocaleString()} FCFA</span>
                    </div>
                    <p style={{ fontSize:11,color:theme.sub,textAlign:"center" }}>⚠️ Paiement FedaPay (MTN/Moov Money) bientôt disponible</p>
                  </div>
                )}
                <button onClick={modal.type==="add"?addPost:editPost} className="btn-glow" style={{ width:"100%",marginTop:16,padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
                  {modal.type==="add" ? (user?.role==="admin" ? "Publier l'annonce" : `Publier · ${(months*1500).toLocaleString()} FCFA`) : "Enregistrer"}
                </button>
              </>
            )}

            {/* DELETE */}
            {modal.type==="delete"&&(
              <>
                <div style={{ textAlign:"center",marginBottom:24 }}>
                  <div style={{ fontSize:48,marginBottom:12 }}>🗑️</div>
                  <h3 style={{ fontWeight:800,fontSize:20,marginBottom:8,color:theme.text }}>Supprimer cette annonce ?</h3>
                  <p style={{ color:theme.sub,fontSize:14 }}>"{modal.data.title}" sera supprimée définitivement.</p>
                </div>
                <div style={{ display:"flex",gap:12 }}>
                  <button onClick={()=>setModal(null)} style={{ flex:1,padding:"12px",background:"transparent",border:`1px solid ${theme.border}`,color:theme.text,borderRadius:12,fontWeight:600,fontSize:14 }}>Annuler</button>
                  <button onClick={()=>deletePost(modal.data.id)} style={{ flex:1,padding:"12px",background:"linear-gradient(135deg,#FF4757,#FF6584)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:14 }}>Supprimer</button>
                </div>
              </>
            )}

            {/* CONTACT */}
            {modal.type==="contact"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>Contacter le vendeur</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                {modal.data.photos&&modal.data.photos.length>0&&<div style={{ borderRadius:12,overflow:"hidden",marginBottom:16 }}><PhotoCarousel photos={modal.data.photos}/></div>}
                <div style={{ background:theme.bg,borderRadius:12,padding:20,marginBottom:16 }}>
                  <p style={{ fontWeight:700,marginBottom:4,color:theme.text }}>{modal.data.title}</p>
                  <p style={{ color:theme.sub,fontSize:13 }}>Publié par {modal.data.author}{modal.data.price?` · ${modal.data.price}`:""}</p>
                </div>

                {/* Fiche véhicule dans le contact */}
                {modal.data.vehicle&&<VehicleCard vehicle={modal.data.vehicle} theme={theme}/>}
                {/* Fiche immobilière dans le contact */}
                {modal.data.immo&&<ImmoCard immo={modal.data.immo} theme={theme}/>}

                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {modal.data.contact&&(
                    <a href={`mailto:${modal.data.contact}`} style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.3)",borderRadius:12,padding:16,display:"flex",alignItems:"center",gap:12,cursor:"pointer" }}>
                        <div style={{ width:40,height:40,borderRadius:"50%",background:"rgba(67,198,172,0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"#43C6AC",flexShrink:0 }}><Icon name="mail" size={18}/></div>
                        <div><p style={{ fontWeight:700,fontSize:14,color:"#43C6AC" }}>Email</p><p style={{ color:theme.sub,fontSize:13 }}>{modal.data.contact}</p></div>
                      </div>
                    </a>
                  )}
                  {modal.data.phone&&(
                    <a href={`tel:${modal.data.phone}`} style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",borderRadius:12,padding:16,display:"flex",alignItems:"center",gap:12,cursor:"pointer" }}>
                        <div style={{ width:40,height:40,borderRadius:"50%",background:"rgba(108,99,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"#6C63FF",flexShrink:0 }}><Icon name="phone" size={18}/></div>
                        <div><p style={{ fontWeight:700,fontSize:14,color:"#6C63FF" }}>Appel téléphonique</p><p style={{ color:theme.sub,fontSize:13 }}>{modal.data.phone}</p></div>
                      </div>
                    </a>
                  )}
                  {modal.data.phone&&(
                    <a href={`https://wa.me/${modal.data.phone.replace(/[\s+\-]/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",borderRadius:12,padding:16,display:"flex",alignItems:"center",gap:12,cursor:"pointer" }}>
                        <div style={{ width:40,height:40,borderRadius:"50%",background:"rgba(37,211,102,0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"#25D366",flexShrink:0 }}><Icon name="whatsapp" size={18}/></div>
                        <div><p style={{ fontWeight:700,fontSize:14,color:"#25D366" }}>WhatsApp</p><p style={{ color:theme.sub,fontSize:13 }}>{modal.data.phone}</p></div>
                      </div>
                    </a>
                  )}
                  {!modal.data.contact&&!modal.data.phone&&<p style={{ textAlign:"center",color:theme.sub,padding:20 }}>Aucun moyen de contact renseigné</p>}
                </div>

                {/* Annonces similaires */}
                {(() => {
                  const similaires = posts.filter(p=>p.id!==modal.data.id && p.category===modal.data.category && !p.expired).slice(0,3);
                  if (similaires.length===0) return null;
                  return (
                    <div style={{ marginTop:24,borderTop:`1px solid ${theme.border}`,paddingTop:20 }}>
                      <p style={{ fontWeight:700,fontSize:14,color:theme.text,marginBottom:14 }}>📋 Annonces similaires</p>
                      <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                        {similaires.map(p=>(
                          <div key={p.id} style={{ background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:12,padding:12,display:"flex",gap:12,alignItems:"center" }}>
                            {p.photos&&p.photos.length>0 && <img src={p.photos[0]} alt="" style={{ width:52,height:52,borderRadius:8,objectFit:"cover",flexShrink:0 }}/>}
                            <div style={{ flex:1,minWidth:0 }}>
                              <p style={{ fontWeight:700,fontSize:13,color:theme.text,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.title}</p>
                              <p style={{ color:"#43C6AC",fontWeight:700,fontSize:13 }}>{p.price||""}</p>
                            </div>
                            <button onClick={()=>setModal({type:"contact",data:p})} style={{ background:"rgba(108,99,255,0.15)",border:"none",color:"#6C63FF",padding:"6px 12px",borderRadius:8,fontWeight:600,fontSize:12,flexShrink:0,cursor:"pointer" }}>
                              Voir →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* ADD RESTAURANT / BAR */}
            {modal.type==="addresto"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>🍽️ Publier mon établissement</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>

                <VideoUploader video={shopVideo} setVideo={setShopVideo} theme={theme}/>
                <PhotoUploader photos={shopPhotos} setPhotos={setShopPhotos} theme={theme}/>

                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Type d'établissement *</label>
                  <select value={shopForm.type} onChange={e=>setShopForm(s=>({...s,type:e.target.value}))} style={inputStyle}>
                    <option value="">-- Choisir --</option>
                    {RESTO_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>

                {[
                  {label:"Nom de l'établissement *",key:"name"},
                  {label:"Description *",key:"description",textarea:true},
                  {label:"Spécialité",key:"specialite",placeholder:"Ex: Cuisine béninoise, Grillades..."},
                  {label:"Plats / Menu phare",key:"plats",textarea:true,placeholder:"Ex: Sauce arachide, Riz au gras, Poisson braisé..."},
                  {label:"Prix moyen par repas",key:"prixMoyen",placeholder:"Ex: 1 500 - 5 000 FCFA"},
                  {label:"Capacité",key:"capacite",placeholder:"Ex: 40 couverts"},
                  {label:"Services proposés",key:"services",placeholder:"Sur place, À emporter, Livraison..."},
                  {label:"Mots clés",key:"keywords",placeholder:"Ex: maquis, traditionnel, livraison, famille..."},
                  {label:"Horaires",key:"horaires",placeholder:"Ex: Lun-Dim 7h-22h"},
                  {label:"Téléphone / WhatsApp",key:"phone",placeholder:"+229 XX XX XX XX"},
                  {label:"Email",key:"contact"},
                ].map(f=>(
                  <div key={f.key} style={{ marginBottom:16 }}>
                    <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>{f.label}</label>
                    {f.textarea
                      ? <textarea value={shopForm[f.key]||""} onChange={e=>setShopForm(s=>({...s,[f.key]:e.target.value}))} rows={2} placeholder={f.placeholder||""} style={{ ...inputStyle,resize:"vertical" }}/>
                      : <input value={shopForm[f.key]||""} onChange={e=>setShopForm(s=>({...s,[f.key]:e.target.value}))} placeholder={f.placeholder||""} style={inputStyle}/>
                    }
                  </div>
                ))}

                <div style={{ background:theme.bg,border:`1px solid #FF8C0044`,borderRadius:12,padding:16,marginBottom:16 }}>
                  <p style={{ fontWeight:700,color:"#FF8C00",fontSize:13,marginBottom:12,display:"flex",alignItems:"center",gap:6 }}><Icon name="pin" size={13}/>Localisation</p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                    {[{label:"Ville *",key:"ville"},{label:"Quartier",key:"quartier"}].map(f=>(
                      <div key={f.key}>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>{f.label}</label>
                        <input value={shopForm[f.key]||""} onChange={e=>setShopForm(s=>({...s,[f.key]:e.target.value}))} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                      </div>
                    ))}
                    <div style={{ gridColumn:"1/-1" }}>
                      <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Von de...</label>
                      <input value={shopForm.von||""} onChange={e=>setShopForm(s=>({...s,von:e.target.value}))} placeholder="Ex: Von du marché central..." style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                    </div>
                  </div>
                </div>

                {user?.role !== "admin" && (
                  <div style={{ background:theme.bg,border:`1px solid #FF8C0044`,borderRadius:14,padding:20,marginBottom:16 }}>
                    <p style={{ fontWeight:700,fontSize:14,color:theme.text,marginBottom:4 }}>💰 Durée de publication</p>
                    <p style={{ fontSize:12,color:theme.sub,marginBottom:16 }}>3 000 FCFA par mois</p>
                    <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
                      <button onClick={()=>setMonths(m=>Math.max(1,m-1))} style={{ width:36,height:36,borderRadius:"50%",background:"rgba(255,140,0,0.15)",border:"none",color:"#FF8C00",fontSize:20,fontWeight:700 }}>-</button>
                      <div style={{ flex:1,textAlign:"center" }}>
                        <p style={{ fontSize:28,fontWeight:800,color:"#FF8C00" }}>{months}</p>
                        <p style={{ fontSize:12,color:theme.sub }}>mois</p>
                      </div>
                      <button onClick={()=>setMonths(m=>m+1)} style={{ width:36,height:36,borderRadius:"50%",background:"rgba(255,140,0,0.15)",border:"none",color:"#FF8C00",fontSize:20,fontWeight:700 }}>+</button>
                    </div>
                    <div style={{ background:"rgba(255,140,0,0.1)",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between" }}>
                      <span style={{ color:theme.sub,fontSize:13 }}>Total</span>
                      <span style={{ fontWeight:800,fontSize:18,color:"#FF8C00" }}>{(months*3000).toLocaleString()} FCFA</span>
                    </div>
                    <p style={{ fontSize:11,color:theme.sub,textAlign:"center",marginTop:8 }}>⚠️ Paiement FedaPay bientôt disponible</p>
                  </div>
                )}

                <button onClick={addResto} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#FF8C00,#FF6584)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
                  {user?.role==="admin" ? "Publier l'établissement" : `Publier · ${(months*3000).toLocaleString()} FCFA`}
                </button>
              </>
            )}

            {/* ADD BOUTIQUE / ATELIER */}
            {modal.type==="addshop"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>{shopMode==="boutique"?"🛍️ Publier ma boutique":"🔧 Publier mon atelier"}</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>

                <VideoUploader video={shopVideo} setVideo={setShopVideo} theme={theme}/>
                <PhotoUploader photos={shopPhotos} setPhotos={setShopPhotos} theme={theme}/>

                {/* Type */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Type {shopMode==="boutique"?"de boutique":"d'atelier"} *</label>
                  <select value={shopForm.type} onChange={e=>setShopForm(s=>({...s,type:e.target.value}))} style={inputStyle}>
                    <option value="">-- Choisir --</option>
                    {(shopMode==="boutique"?BOUTIQUE_TYPES:ATELIER_TYPES).map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>

                {/* Champs principaux */}
                {[
                  {label:`Nom ${shopMode==="boutique"?"de la boutique":"de l'atelier"} *`,key:"name"},
                  {label:"Description *",key:"description",textarea:true},
                  ...(shopMode==="atelier"?[{label:"Services proposés",key:"services",textarea:true}]:[]),
                  {label:"Horaires d'ouverture",key:"horaires",placeholder:"Ex: Lun-Sam 8h-18h"},
                  {label:"Mots clés (pour la recherche)",key:"keywords",placeholder:"Ex: cosmétiques, soins, beauté, naturel, livraison..."},
                  {label:"Email de contact",key:"contact"},
                  {label:"Téléphone / WhatsApp",key:"phone",placeholder:"+229 XX XX XX XX"},
                ].map(f=>(
                  <div key={f.key} style={{ marginBottom:16 }}>
                    <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>{f.label}</label>
                    {f.textarea
                      ? <textarea value={shopForm[f.key]} onChange={e=>setShopForm(s=>({...s,[f.key]:e.target.value}))} rows={3} style={{ ...inputStyle,resize:"vertical" }}/>
                      : <input value={shopForm[f.key]} onChange={e=>setShopForm(s=>({...s,[f.key]:e.target.value}))} placeholder={f.placeholder||""} style={inputStyle}/>
                    }
                  </div>
                ))}

                {/* Localisation */}
                <div style={{ background:theme.bg,border:`1px solid #43C6AC44`,borderRadius:12,padding:16,marginBottom:16 }}>
                  <p style={{ fontWeight:700,color:"#43C6AC",fontSize:13,marginBottom:12,display:"flex",alignItems:"center",gap:6 }}><Icon name="pin" size={13}/>Localisation</p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                    {[{label:"Ville *",key:"ville",placeholder:"Ex: Cotonou"},{label:"Quartier",key:"quartier",placeholder:"Ex: Akpakpa"}].map(f=>(
                      <div key={f.key}>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>{f.label}</label>
                        <input value={shopForm[f.key]} onChange={e=>setShopForm(s=>({...s,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                      </div>
                    ))}
                    <div style={{ gridColumn:"1/-1" }}>
                      <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Von de...</label>
                      <input value={shopForm.von} onChange={e=>setShopForm(s=>({...s,von:e.target.value}))} placeholder="Ex: Von du marché central, Von de la pharmacie..." style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                    </div>
                  </div>
                </div>

                {/* Durée et paiement */}
                {user?.role !== "admin" && (
                  <div style={{ background:theme.bg,border:`1px solid #FF658444`,borderRadius:14,padding:20,marginBottom:16 }}>
                    <p style={{ fontWeight:700,fontSize:14,color:theme.text,marginBottom:4 }}>💰 Durée de publication</p>
                    <p style={{ fontSize:12,color:theme.sub,marginBottom:16 }}>3 000 FCFA par mois</p>
                    <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
                      <button onClick={()=>setMonths(m=>Math.max(1,m-1))} style={{ width:36,height:36,borderRadius:"50%",background:"rgba(255,101,132,0.15)",border:"none",color:"#FF6584",fontSize:20,fontWeight:700 }}>-</button>
                      <div style={{ flex:1,textAlign:"center" }}>
                        <p style={{ fontSize:28,fontWeight:800,color:"#FF6584" }}>{months}</p>
                        <p style={{ fontSize:12,color:theme.sub }}>mois</p>
                      </div>
                      <button onClick={()=>setMonths(m=>m+1)} style={{ width:36,height:36,borderRadius:"50%",background:"rgba(255,101,132,0.15)",border:"none",color:"#FF6584",fontSize:20,fontWeight:700 }}>+</button>
                    </div>
                    <div style={{ background:"rgba(255,101,132,0.1)",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between" }}>
                      <span style={{ color:theme.sub,fontSize:13 }}>Total</span>
                      <span style={{ fontWeight:800,fontSize:18,color:"#FF6584" }}>{(months*3000).toLocaleString()} FCFA</span>
                    </div>
                    <p style={{ fontSize:11,color:theme.sub,textAlign:"center",marginTop:8 }}>⚠️ Paiement FedaPay bientôt disponible</p>
                  </div>
                )}

                <button onClick={addShop} className="btn-glow" style={{ width:"100%",padding:"14px",background:shopMode==="boutique"?"linear-gradient(135deg,#FF6584,#FFB347)":"linear-gradient(135deg,#43C6AC,#6C63FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
                  {user?.role==="admin" ? `Publier ${shopMode==="boutique"?"la boutique":"l'atelier"}` : `Publier · ${(months*3000).toLocaleString()} FCFA`}
                </button>
              </>
            )}

            {/* HOWTO */}
            {modal.type==="howto"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>💡 Comment publier une annonce ?</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                {[
                  { step:"1", icon:"👤", title:"Créez un compte gratuit", desc:"Inscrivez-vous avec votre email et mot de passe. C'est gratuit et rapide !" },
                  { step:"2", icon:"📝", title:"Rédigez votre annonce", desc:"Remplissez le titre, la description, le prix et ajoutez jusqu'à 3 photos." },
                  { step:"3", icon:"📅", title:"Choisissez la durée", desc:"Sélectionnez le nombre de mois souhaité. 1 500 FCFA par mois." },
                  { step:"4", icon:"💳", title:"Payez via Mobile Money", desc:"Paiement sécurisé MTN Money ou Moov Money via FedaPay. (Bientôt disponible)" },
                  { step:"5", icon:"🚀", title:"Votre annonce est en ligne !", desc:"Elle sera visible par tous les visiteurs jusqu'à la date d'expiration." },
                ].map(s=>(
                  <div key={s.step} style={{ display:"flex",gap:14,marginBottom:16,alignItems:"flex-start" }}>
                    <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14,flexShrink:0 }}>{s.step}</div>
                    <div>
                      <p style={{ fontWeight:700,fontSize:14,color:theme.text,marginBottom:2 }}>{s.icon} {s.title}</p>
                      <p style={{ fontSize:13,color:theme.sub,lineHeight:1.5 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
                <div style={{ background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.3)",borderRadius:12,padding:16,marginTop:8,textAlign:"center" }}>
                  <p style={{ fontWeight:700,color:"#43C6AC",fontSize:16 }}>1 500 FCFA / mois / annonce</p>
                  <p style={{ color:theme.sub,fontSize:13,marginTop:4 }}>Prolongez à tout moment depuis votre tableau de bord</p>
                </div>
                {!user && <button onClick={()=>{setModal(null);setView("register");}} className="btn-glow" style={{ width:"100%",marginTop:16,padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>Créer mon compte gratuitement</button>}
              </>
            )}

            {/* PROLONGATION */}
            {modal.type==="prolong"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>⏳ Prolonger l'annonce</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                <div style={{ background:theme.bg,borderRadius:12,padding:16,marginBottom:20 }}>
                  <p style={{ fontWeight:700,color:theme.text,marginBottom:4 }}>{modal.data.title}</p>
                  <p style={{ color:theme.sub,fontSize:13 }}>Expire le : <strong style={{ color:"#FF4757" }}>{modal.data.expiresAt}</strong></p>
                </div>
                <p style={{ fontSize:13,color:theme.sub,marginBottom:16 }}>Choisissez le nombre de mois à ajouter :</p>
                <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
                  <button onClick={()=>setMonths(m=>Math.max(1,m-1))} style={{ width:36,height:36,borderRadius:"50%",background:"rgba(108,99,255,0.15)",border:"none",color:"#6C63FF",fontSize:20,fontWeight:700 }}>-</button>
                  <div style={{ flex:1,textAlign:"center" }}>
                    <p style={{ fontSize:28,fontWeight:800,color:"#6C63FF" }}>{months}</p>
                    <p style={{ fontSize:12,color:theme.sub }}>mois supplémentaire{months>1?"s":""}</p>
                  </div>
                  <button onClick={()=>setMonths(m=>m+1)} style={{ width:36,height:36,borderRadius:"50%",background:"rgba(108,99,255,0.15)",border:"none",color:"#6C63FF",fontSize:20,fontWeight:700 }}>+</button>
                </div>
                <div style={{ background:"rgba(67,198,172,0.1)",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                  <span style={{ color:theme.sub,fontSize:13 }}>Total à payer</span>
                  <span style={{ fontWeight:800,fontSize:18,color:"#43C6AC" }}>{(months*1500).toLocaleString()} FCFA</span>
                </div>
                <p style={{ fontSize:11,color:theme.sub,textAlign:"center",marginBottom:20 }}>⚠️ Paiement FedaPay bientôt disponible</p>
                <button onClick={()=>{
                  const newExp = new Date(modal.data.expiresAt);
                  newExp.setMonth(newExp.getMonth()+months);
                  setPosts(p=>p.map(post=>post.id===modal.data.id?{...post,expiresAt:newExp.toISOString().slice(0,10),expired:false,expiringSoon:false}:post));
                  setModal(null); setMonths(1);
                  notify("Annonce prolongée de "+months+" mois !");
                }} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#43C6AC,#6C63FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
                  Prolonger · {(months*1500).toLocaleString()} FCFA
                </button>
              </>
            )}

            {/* SUGGESTION */}
            {modal.type==="suggestion"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>💡 Envoyer une suggestion</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                <p style={{ color:theme.sub,fontSize:14,marginBottom:24,lineHeight:1.5 }}>Partagez vos idées pour améliorer MarketFlow ! Toutes les suggestions sont lues par l'équipe.</p>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Votre nom (optionnel)</label>
                  <input value={suggestionName} onChange={e=>setSuggestionName(e.target.value)} placeholder="Visiteur anonyme" style={inputStyle}/>
                </div>
                <div style={{ marginBottom:24 }}>
                  <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Votre suggestion *</label>
                  <textarea value={suggestionText} onChange={e=>setSuggestionText(e.target.value)} rows={4} placeholder="Décrivez votre idée..." style={{ ...inputStyle,resize:"vertical" }}/>
                </div>
                <button onClick={submitSuggestion} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#43C6AC,#6C63FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
                  Envoyer ma suggestion
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

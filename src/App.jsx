import React, { useState, useRef, useEffect } from "react";
import { usePromo } from "./hooks/usePromo";
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "./supabase";
import Icon from "./components/Icon";
import PhotoCarousel from "./components/PhotoCarousel";
import PhotoUploader from "./components/PhotoUploader";
import VehicleCard from "./components/VehicleCard";
import ImmoCard from "./components/ImmoCard";
import CertifiedBadge from "./components/CertifiedBadge";
import RatingForm from "./components/RatingForm";
import AdminVitrineWeb from "./components/AdminVitrineWeb";
import AdminPanel from "./components/AdminPanel";
import AnnonceDetail from "./components/AnnonceDetail";
import ShopSection from "./components/ShopSection";
import RecrutementSection from "./components/RecrutementSection";
import AboutSection from "./components/AboutSection";
import StatsSection from "./components/StatsSection";
import TermsSection from "./components/TermsSection";
import ParrainageSection from "./components/ParrainageSection";
import VideoCardPlayer from "./components/VideoCardPlayer";
import VitrineRequest from "./components/VitrineRequest";
import VitrineDetail from "./components/VitrineDetail";
import VitrineDirectory from "./components/VitrineDirectory";
import {
  CATEGORIES, CATEGORY_COLORS, BACKGROUNDS, VEHICLE_FIELDS, MOTO_FIELDS,
  RESTO_TYPES, BEAUTE_TYPES, MAX_MODIFS,
  AGRO_SOUS_CATEGORIES, AGRO_UNITES, AGRO_DISPONIBILITE, AGRO_QUALITE,
  SPONSOR_PRICES, MODIF_PRICES, PRICE_PER_MONTH,
  COUNTRIES_FLAGS
} from "./constants";

// Indicatifs téléphoniques par pays — utilisé dans tous les formulaires
const PHONE_CODES = {
  "BJ":"+229","TG":"+228","CI":"+225","SN":"+221","ML":"+223",
  "BF":"+226","NE":"+227","GN":"+224","NG":"+234","CM":"+237",
  "CG":"+242","CD":"+243","GA":"+241","MG":"+261","RW":"+250",
  "BI":"+257","TD":"+235","MR":"+222","FR":"+33","BE":"+32",
  "CH":"+41","CA":"+1","US":"+1","GB":"+44","DE":"+49",
  "MA":"+212","DZ":"+213","TN":"+216","EG":"+20","GH":"+233",
};

// Exemples de numéros complets par pays (indicatif + chiffres locaux)
const PHONE_PLACEHOLDERS = {
  "BJ": "+229 0100000000",    // 10 chiffres
  "TG": "+228 90000000",      // 8 chiffres
  "CI": "+225 0100000000",    // 10 chiffres
  "SN": "+221 700000000",     // 9 chiffres
  "ML": "+223 60000000",      // 8 chiffres
  "BF": "+226 60000000",      // 8 chiffres
  "NE": "+227 90000000",      // 8 chiffres
  "GN": "+224 600000000",     // 9 chiffres
  "NG": "+234 8000000000",    // 10 chiffres
  "CM": "+237 600000000",     // 9 chiffres
  "CG": "+242 060000000",     // 9 chiffres
  "CD": "+243 810000000",     // 9 chiffres
  "GA": "+241 060000000",     // 9 chiffres
  "GH": "+233 200000000",     // 9 chiffres
  "MG": "+261 320000000",     // 9 chiffres
  "RW": "+250 780000000",     // 9 chiffres
  "BI": "+257 79000000",      // 8 chiffres
  "TD": "+235 60000000",      // 8 chiffres
  "MR": "+222 20000000",      // 8 chiffres
  "FR": "+33 600000000",      // 9 chiffres
  "BE": "+32 470000000",      // 9 chiffres
  "CH": "+41 760000000",      // 9 chiffres
  "CA": "+1 5140000000",      // 10 chiffres
  "US": "+1 2120000000",      // 10 chiffres
  "GB": "+44 7000000000",     // 10 chiffres
  "DE": "+49 1500000000",     // 10 chiffres
  "MA": "+212 600000000",     // 9 chiffres
  "DZ": "+213 550000000",     // 9 chiffres
  "TN": "+216 20000000",      // 8 chiffres
  "EG": "+20 1000000000",     // 10 chiffres
};

// Récupère l'indicatif enregistré dans localStorage (rempli par AppContent au démarrage)
const getPhonePrefix = () => {
  const country = localStorage.getItem("mdr_country") || "BJ";
  return PHONE_CODES[country] || "+";
};

// Récupère le placeholder complet selon le pays
// Pour les pays hors liste → juste l'indicatif (liberté à l'utilisateur)
const getPhonePlaceholder = () => {
  const country = localStorage.getItem("mdr_country") || "BJ";
  return PHONE_PLACEHOLDERS[country] || (PHONE_CODES[country] ? PHONE_CODES[country] + " votre numéro" : "+indicatif votre numéro");
};

// Récupère le thème depuis localStorage pour les composants hors AppContent
const getThemeFromStorage = () => {
  const id = localStorage.getItem("mf_theme") || "dark";
  const themes = {
    dark:   { bg:"#0D0F1A", card:"#1A1D30", text:"#E8E8F0", sub:"#9A9AB0", border:"#2A2D45" },
    light:  { bg:"#F5F5FA", card:"#FFFFFF", text:"#1A1D30", sub:"#6B7280", border:"#E5E7EB" },
    ocean:  { bg:"#0A1628", card:"#112240", text:"#E6F1FF", sub:"#8892B0", border:"#1E3A5F" },
    forest: { bg:"#0D1F14", card:"#1A3122", text:"#E8F5E9", sub:"#81C784", border:"#2E7D32" },
    sunset: { bg:"#1A0F0A", card:"#2D1B10", text:"#FFF3E0", sub:"#FFAB76", border:"#5D2E0C" },
    purple: { bg:"#0F0A1A", card:"#1E1432", text:"#EDE7F6", sub:"#B39DDB", border:"#4A148C" },
  };
  return themes[id] || themes.dark;
};

const INITIAL_POSTS = [
  // IMMOBILIER
  {
    id: 1, title: "Belle villa avec piscine à louer", category: "Immobilier",
    description: "Magnifique villa moderne avec piscine, 4 chambres, 3 salles de bain, jardin paysager. Idéale pour famille ou investissement locatif. Quartier calme et sécurisé à Cotonou.",
    author: "Sophie M.", authorId: "u2", price: "450 000 FCFA/mois", date: "2026-03-01", likes: 14,
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
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
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
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
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
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
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
    photos: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80"
    ]
  },
  {
    id: 4, title: "Samsung 65 pouces QLED 4K Smart TV", category: "Électronique",
    description: "Téléviseur Samsung QLED 65 pouces, 4K, Smart TV avec Netflix, YouTube intégrés. Acheté en janvier 2026, très peu utilisé. Avec télécommande et support mural.",
    author: "Franck T.", authorId: "u8", price: "320 000 FCFA", date: "2026-03-06", likes: 7,
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
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
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
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
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
    photos: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80",
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80"
    ],
    vehicle: { marque:"Mercedes", modele:"Classe C 200", annee:"2019", transmission:"Automatique", puissance:"184 ch", carburant:"Essence", garniture:"Cuir beige", capacite:"5 places", climatisation:"Automatique bi-zone", docs:"Carte grise, Assurance, Expertise", serie:"AK 5678 BJ", position:"Porto-Novo, Bénin", autre:"Toit ouvrant, GPS, Caméra recul" }
  },
  // LOCATION DE VÉHICULES
  {
    id: 17, title: "Toyota RAV4 2021 — Location journalière", category: "Location de véhicules",
    description: "Toyota RAV4 en parfait état disponible à la location. Idéal pour voyages, cérémonies ou déplacements professionnels. Chauffeur disponible en option. Caution requise.",
    author: "Admin MarchéduRoi", authorId: "admin", price: "35 000 FCFA/jour", date: "2026-04-01", likes: 8,
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
    photos: [
      "https://images.unsplash.com/photo-1568844293986-ca9c5a794567?w=600&q=80",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80"
    ],
    vehicle: { marque:"Toyota", modele:"RAV4", annee:"2021", transmission:"Automatique", puissance:"203 ch", carburant:"Essence", garniture:"Cuir", capacite:"5 places", climatisation:"Automatique", docs:"Assurance tous risques, Carte grise", position:"Cotonou, Bénin", autre:"Chauffeur en option · 150 000 FCFA caution · Kilométrage illimité dans Cotonou" }
  },
  // AGRO-ALIMENTAIRE
  {
    id: 18, title: "Gari blanc qualité supérieure — Bohicon", category: "Agro-alimentaire",
    description: "Gari blanc produit artisanalement à Bohicon. Séché au soleil, sans additifs. Idéal pour revendeurs, restaurants et particuliers. Minimum 5 sacs.",
    author: "Admin MarchéduRoi", authorId: "admin", price: "12 000 FCFA/sac 50kg", date: "2026-04-01", likes: 8,
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
    photos: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80"],
    agro: { sousCategorie:"Tubercules transformés (gari, tapioca, farine de manioc)", quantite:"200", unite:"sac de 50 kg", prixUnitaire:"12 000", qualite:"Premium / Grade A", disponibilite:"Toute l'année", lieuEnlevement:"Bohicon, Zou", saisonRecolte:"" }
  },
  {
    id: 19, title: "Maïs blanc local en gros — Parakou", category: "Agro-alimentaire",
    description: "Maïs blanc local de la région de Parakou. Récolte fraîche, propre et bien séché. Vendu en sacs de 100 kg. Disponible pour grossistes et transformateurs.",
    author: "Admin MarchéduRoi", authorId: "admin", price: "18 000 FCFA/sac 100kg", date: "2026-04-05", likes: 11,
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
    photos: ["https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80"],
    agro: { sousCategorie:"Céréales (riz, maïs, mil, sorgho)", quantite:"500", unite:"sac de 100 kg", prixUnitaire:"18 000", qualite:"Standard / Grade B", disponibilite:"Stock limité disponible maintenant", lieuEnlevement:"Parakou, Borgou", saisonRecolte:"Septembre - Novembre" }
  },

  // SERVICES
  {
    id: 7, title: "Cours particuliers Maths & Physique", category: "Services",
    description: "Professeur diplômé en mathématiques et physique-chimie, 8 ans d'expérience. Cours à domicile pour collégiens, lycéens et étudiants. Résultats garantis. Disponible soirs et week-ends.",
    author: "Dr. Koffi M.", authorId: "u10", price: "5 000 FCFA/h", date: "2026-03-07", likes: 22,
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
    photos: [
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80"
    ]
  },
  {
    id: 8, title: "Plomberie & Installation sanitaire", category: "Services",
    description: "Plombier professionnel avec 12 ans d'expérience. Installation, réparation, dépannage urgent. Robinetterie, chauffe-eau, WC, douche. Intervention rapide sur Cotonou et environs.",
    author: "Yves P.", authorId: "u11", price: "Sur devis", date: "2026-03-08", likes: 6,
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
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
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
    photos: [
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"
    ]
  },
  {
    id: 10, title: "Équipement complet de musculation", category: "Sport",
    description: "Banc de musculation multifonction avec barre, haltères et disques de poids (50kg au total). Parfait état, déménagement oblige la vente. À récupérer sur place à Fidjrossè.",
    author: "Arnold S.", authorId: "u13", price: "95 000 FCFA", date: "2026-03-11", likes: 4,
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
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
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
    photos: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80"
    ]
  },
  {
    id: 12, title: "Costume homme 3 pièces - Taille L", category: "Mode",
    description: "Costume 3 pièces (veste, pantalon, gilet) couleur gris anthracite. Tissu de qualité, coupe italienne. Porté 2 fois. Taille L. Idéal pour entretiens, mariages et cérémonies.",
    author: "Romuald A.", authorId: "u15", price: "28 000 FCFA", date: "2026-03-10", likes: 8,
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
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
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
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
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
    photos: [
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80",
      "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80"
    ]
  },
  {
    id: 15, title: "Couteaux de chef japonais - Set 5 pièces", category: "Autre",
    description: "Set de 5 couteaux de chef japonais en acier inoxydable, manche en bois d'olivier. Inclus : couteau de chef, couteau à pain, couteau d'office, santoku et cisailles. Avec bloc de rangement.",
    author: "Patrick N.", authorId: "u18", price: "32 000 FCFA", date: "2026-03-11", likes: 9,
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
    photos: [
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&q=80",
      "https://images.unsplash.com/photo-1566454544259-f4b94c3d758c?w=600&q=80"
    ]
  },
];

const INITIAL_BOUTIQUES = [
  { id:"b1", name:"Beauté Dorée Cosmétiques", type:"Cosmétiques & Beauté", description:"Boutique spécialisée en produits cosmétiques naturels, soins de la peau, parfums et accessoires beauté.", ville:"Cotonou", quartier:"Akpakpa", von:"Von de la pharmacie centrale", horaires:"Lun-Sam 8h-20h · Dim 10h-18h", contact:"contact@marcheduroi.com", phone:"+2290147562640", author:"Adjara K.", authorId:"b_u1", date:"2026-03-01", likes:18, photos:[], video:null, expiresAt:null },
  { id:"b2", name:"Tech Store Bénin", type:"Électronique & Informatique", description:"Vente et réparation de téléphones, ordinateurs, accessoires informatiques. Garantie sur tous les produits.", ville:"Porto-Novo", quartier:"Ouando", von:"Von du grand marché", horaires:"Lun-Ven 8h-19h · Sam 8h-17h", contact:"contact@marcheduroi.com", phone:"+2290147562640", author:"Fiacre D.", authorId:"b_u2", date:"2026-03-03", likes:12, photos:[], video:null, expiresAt:null },
  { id:"b3", name:"Boulangerie Saveur d'Or", type:"Alimentation & Restauration", description:"Pains frais, viennoiseries, gâteaux personnalisés. Fabrication artisanale chaque matin. Livraison disponible.", ville:"Ouidah", quartier:"Centre-ville", von:"Von de l'église Saint-François", horaires:"Tous les jours 6h-21h", contact:"contact@marcheduroi.com", phone:"+2290147562640", author:"Marie T.", authorId:"b_u3", date:"2026-03-05", likes:25, photos:[], video:null, expiresAt:null },
];

const INITIAL_RESTOS = [
  { id:"r1", name:"Maquis Chez Maman Africa", type:"Maquis", specialite:"Cuisine béninoise traditionnelle", plats:"Sauce arachide, Riz au gras, Igname pilée, Poisson braisé, Akassa", prixMoyen:"1 500 - 5 000 FCFA", capacite:"40 couverts", services:"Sur place, À emporter, Terrasse", description:"Maquis familial proposant les meilleurs plats traditionnels béninois dans une ambiance chaleureuse.", ville:"Cotonou", quartier:"Cadjehoun", von:"Von de l'aéroport", horaires:"Lun-Dim 7h-22h", contact:"contact@marcheduroi.com", phone:"+2290147562640", author:"Mama Africa", authorId:"r_u1", date:"2026-03-01", likes:35, photos:[], video:null, keywords:"cuisine béninoise maquis traditionnel", expiresAt:null },
  { id:"r2", name:"Bar Le Cocotier", type:"Bar", specialite:"Cocktails tropicaux et bières fraîches", plats:"Brochettes, Arachides grillées, Poisson frit, Accras", prixMoyen:"500 - 3 000 FCFA", capacite:"60 couverts", services:"Sur place, Terrasse, Wifi disponible", description:"Bar tendance en bord de mer avec une vue imprenable. Ambiance détendue, musique live le week-end.", ville:"Ouidah", quartier:"Plage", von:"Von de la plage de Ouidah", horaires:"Mar-Dim 16h-02h", contact:"contact@marcheduroi.com", phone:"+2290147562640", author:"Patrick L.", authorId:"r_u2", date:"2026-03-03", likes:28, photos:[], video:null, keywords:"bar cocktails bières terrasse mer", expiresAt:null },
  { id:"r3", name:"Fast Food Le Goût", type:"Fast-food", specialite:"Burgers, Sandwichs et Grillades", plats:"Burger maison, Sandwich poulet, Brochettes bœuf, Frites", prixMoyen:"1 000 - 4 000 FCFA", capacite:"25 couverts", services:"Sur place, À emporter, Livraison, Salle climatisée", description:"Fast-food moderne proposant des burgers faits maison. Livraison rapide dans tout Cotonou.", ville:"Cotonou", quartier:"Akpakpa", von:"Von du carrefour Missébo", horaires:"Lun-Dim 10h-23h", contact:"contact@marcheduroi.com", phone:"+2290147562640", author:"Hervé G.", authorId:"r_u3", date:"2026-03-05", likes:19, photos:[], video:null, keywords:"burger fast food livraison grillades", expiresAt:null },
];

const INITIAL_BEAUTE = [
  { id:"beau1", name:"Salon Beauté Divine", type:"Salon de coiffure", specialite:"Tresses africaines et coiffures modernes", services:"Tresses, Locks, Tissages, Lissage, Coloration, Coupe, Soins capillaires", tarifs:"2 000 - 25 000 FCFA", rendezvous:"Les deux", produits:"L'Oréal, Dark & Lovely, Cantu", description:"Salon de coiffure professionnel spécialisé en tresses africaines et coiffures modernes. Accueil chaleureux.", ville:"Cotonou", quartier:"Cadjehoun", von:"Von du supermarché Erevan", horaires:"Lun-Sam 8h-20h · Dim 10h-17h", contact:"contact@marcheduroi.com", phone:"+2290147562640", author:"Nadège K.", authorId:"beau_u1", date:"2026-03-01", likes:42, photos:[], video:null, keywords:"tresses coiffure africaine lissage", expiresAt:null },
  { id:"beau2", name:"Institut Glam & Style", type:"Institut de beauté", specialite:"Maquillage et soins du visage", services:"Maquillage, Manucure, Pédicure, Soins visage, Épilation", tarifs:"3 000 - 40 000 FCFA", rendezvous:"Oui", produits:"MAC, NYX, L'Oréal Paris", description:"Institut de beauté proposant des soins complets. Personnel professionnel certifié.", ville:"Cotonou", quartier:"Ganhi", von:"Von du marché Ganhi", horaires:"Lun-Sam 9h-19h", contact:"contact@marcheduroi.com", phone:"+2290147562640", author:"Christelle A.", authorId:"beau_u2", date:"2026-03-04", likes:31, photos:[], video:null, keywords:"maquillage manucure soins beauté", expiresAt:null },
];

const INITIAL_ATELIERS = [
  {
    id: "a1", name: "Atelier Couture Élégance", type: "Couture/Mode",
    description: "Confection de tenues sur mesure pour hommes, femmes et enfants. Spécialiste en tenues traditionnelles et modernes. Retouches et réparations acceptées.",
    services: "Couture sur mesure, Tenues de cérémonie, Retouches, Broderie, Formation couture",
    ville: "Cotonou", quartier: "Gbègamey", von: "Von du lycée technique",
    horaires: "Lun-Sam 8h-18h",
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
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
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
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
    contact: "contact@marcheduroi.com", phone: "+2290147562640",
    author: "Justin F.", authorId: "a_u3", date: "2026-03-06", likes: 9,
    photos: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80"
    ], video: null, expiresAt: null
  },
];

const BOUTIQUE_TYPES = ["Cosmétiques & Beauté","Alimentation & Restauration","Électronique & Informatique","Mode & Vêtements","Pharmacie & Santé","Matériaux & Construction","Agriculture & Élevage","Librairie & Papeterie","Sport & Loisirs","Autres Boutiques","Autre"];
const AUTRES_BOUTIQUES_SOUS_CAT = [
  // Alimentation & Boissons
  "Alimentation générale","Épicerie","Boulangerie & Pâtisserie","Boissons & Eau","Compléments alimentaires",
  // Maison & Décoration
  "Meubles & Décoration","Articles ménagers","Literie & Rideaux","Électroménager","Matériaux de construction",
  // Mode & Beauté
  "Vêtements & Mode","Chaussures & Maroquinerie","Bijouterie & Accessoires","Cosmétiques & Parfums","Perruques & Extensions",
  // Électronique & Technologie
  "Téléphones & Accessoires","Informatique","Électronique & Hi-Fi","Panneaux solaires & Énergie",
  // Services & Fournitures
  "Papeterie & Librairie","Fournitures de bureau","Imprimerie & Communication","Jeux & Jouets",
  // Agriculture & Élevage
  "Semences & Engrais","Élevage & Animaux","Matériel agricole",
  // Machines & Équipements
  "Machines à coudre","Ventilateurs & Climatisation","Moteurs & Groupes électrogènes","Pompes & Irrigation","Outillage & Machines","Équipements industriels",
  // Divers
  "Cadeaux & Souvenirs","Articles religieux","Quincaillerie","Divers","Autres"
];
const ATELIER_TYPES = ["Couture/Mode","Mécanique","Menuiserie/Soudure","Artistique (peinture, musique...)","Électricité & Plomberie","Coiffure & Beauté","Imprimerie & Communication","Autre"];
const IMMO_TYPES = ["Maison","Appartement","Duplex","Villa","Magasin","Local commercial","Parcelle","Domaine / Terrain","Sanitaire 3 chambres 1 salon","Sanitaire 2 chambres 1 salon","Sanitaire chambre salon","Sanitaire entrée-couchée","Ordinaire 3 chambres 1 salon","Ordinaire 2 chambres 1 salon","Ordinaire chambre salon","Entrée-couchée ordinaire"];
const IMMO_ETATS = ["Neuf","Bon état","À rénover","En construction"];
const IMMO_TITRES = ["Oui - Titre foncier disponible","Non - Sans titre","En cours d'obtention","Lettre d'attribution"];



// Video Uploader
// Fiche détaillée véhicule
// Fiche détaillée Immobilier
// Composant formulaire de notation
// Badge Certifié MarchéduRoi — Logo officiel complet
// ─── CYLINDRE 3D DE DRAPEAUX ────────────────────────────────────────────────
const FLAGS = [
  {code:"bj",pays:"Bénin"},{code:"tg",pays:"Togo"},{code:"bf",pays:"Burkina Faso"},
  {code:"ml",pays:"Mali"},{code:"sn",pays:"Sénégal"},{code:"ci",pays:"Côte d'Ivoire"},
  {code:"ng",pays:"Nigeria"},{code:"cm",pays:"Cameroun"},{code:"gn",pays:"Guinée"},
  {code:"ne",pays:"Niger"},{code:"cg",pays:"Congo"},{code:"cd",pays:"RDC"},
  {code:"ga",pays:"Gabon"},{code:"mg",pays:"Madagascar"},{code:"rw",pays:"Rwanda"},
  {code:"bi",pays:"Burundi"},{code:"td",pays:"Tchad"},{code:"mr",pays:"Mauritanie"},
];

// ── Gestionnaire global : une seule vidéo autoPlay active à la fois ─────────
const activeVideoId = { current: null };
// Bloquer l'autoplay après un scroll programmatique (ex: lien partagé)
const autoPlayBlocked = { current: false };
const blockAutoPlay = (ms = 4000) => {
  autoPlayBlocked.current = true;
  setTimeout(() => { autoPlayBlocked.current = false; }, ms);
};

function UrgentBanner({ posts, boutiques, ateliers, restos, beaute, theme, navigate, windowWidth, sessionSeed, activeCategory }) {
  const scrollRef  = React.useRef(null);
  const dirRef     = React.useRef(-1);
  const rafRef     = React.useRef(null);
  const initDone   = React.useRef(false);
  const cat = activeCategory || "Toutes";

  const allUrgents = [
    ...posts.filter(p => p.urgent && p.urgentUntil && new Date(p.urgentUntil) > new Date() && (cat==="Toutes"||p.category===cat)).map(p => ({...p, _urgentType:"annonce", _urgentIcon:"📋", _urgentLabel:"Annonce"})),
    ...(cat==="Toutes" ? boutiques.filter(b => b.urgent && b.urgentUntil && new Date(b.urgentUntil) > new Date()).map(b => ({...b, title:b.name, _urgentType:"boutique", _urgentIcon:"🛍️", _urgentLabel:"Boutique"})) : []),
    ...(cat==="Toutes" ? ateliers.filter(a => a.urgent && a.urgentUntil && new Date(a.urgentUntil) > new Date()).map(a => ({...a, title:a.name, _urgentType:"atelier", _urgentIcon:"🔧", _urgentLabel:"Atelier"})) : []),
    ...(cat==="Toutes" ? restos.filter(r => r.urgent && r.urgentUntil && new Date(r.urgentUntil) > new Date()).map(r => ({...r, title:r.name, _urgentType:"resto", _urgentIcon:"🍽️", _urgentLabel:"Restaurant"})) : []),
    ...(cat==="Toutes" ? beaute.filter(b => b.urgent && b.urgentUntil && new Date(b.urgentUntil) > new Date()).map(b => ({...b, title:b.name, _urgentType:"beaute", _urgentIcon:"💇", _urgentLabel:"Beauté"})) : []),
  ].sort((a,b) => new Date(b.urgentActivatedAt||b.urgentUntil) - new Date(a.urgentActivatedAt||a.urgentUntil));

  const getTimeLeft = (until) => {
    const diff = new Date(until) - new Date();
    if (diff <= 0) return "Expiré";
    const h = Math.floor(diff/3600000), m = Math.floor((diff%3600000)/60000);
    return h > 0 ? `⏳ ${h}h${m>0?m+"m":""} restant${h>1?"s":""}` : `⏳ ${m} min restantes`;
  };
  const [times, setTimes] = React.useState(() => allUrgents.map(p => getTimeLeft(p.urgentUntil)));
  React.useEffect(() => {
    const t = setInterval(() => setTimes(allUrgents.map(p => getTimeLeft(p.urgentUntil))), 60000);
    return () => clearInterval(t);
  }, [allUrgents.length]);

  const cardW = windowWidth<=500 ? 160 : windowWidth<=800 ? 190 : 220;
  const GAP   = 12;
  const loopItems = [...allUrgents, ...allUrgents, ...allUrgents];

  // Position de départ au milieu du triple bloc
  React.useEffect(() => {
    if (!scrollRef.current || initDone.current || allUrgents.length === 0) return;
    initDone.current = true;
    const offset = Math.floor(sessionSeed * allUrgents.length) * (cardW + GAP);
    scrollRef.current.scrollLeft = allUrgents.length * (cardW + GAP) + offset;
  }, [allUrgents.length, cardW, sessionSeed]);

  // rAF — boucle seamless robuste
  React.useEffect(() => {
    if (allUrgents.length === 0) return;
    const tick = () => {
      const el = scrollRef.current;
      if (el) {
        const totalW = allUrgents.length * (cardW + GAP);
        el.scrollLeft += dirRef.current * 1.5;
        if (el.scrollLeft <= 2)            el.scrollLeft += totalW;
        if (el.scrollLeft >= totalW*2 - 2) el.scrollLeft -= totalW;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [allUrgents.length, cardW]);

  if (allUrgents.length === 0) return null;

  const UrgentCard = ({ post, idx }) => (
    <div onClick={() => navigate(`/${post._urgentType==="annonce"?"annonce":post._urgentType}/${post.id}`)}
      style={{ flexShrink:0, width:cardW, marginRight:GAP, borderRadius:14, overflow:"hidden", cursor:"pointer", border:"2px solid #FF4757", background:theme.card, position:"relative" }}>
      <div style={{ width:"100%", aspectRatio:"4/3", background:"linear-gradient(135deg,#1a1d30,#2a2d45)", position:"relative", overflow:"hidden" }}>
        {post.photos&&post.photos[0] ? <img src={post.photos[0]} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32 }}>📦</div>}
        <div style={{ position:"absolute",top:8,left:8,background:"#FF4757",color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800 }}>🔥 URGENT</div>
        {post._urgentType!=="annonce"&&<div style={{ position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.55)",color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>{post._urgentIcon} {post._urgentLabel}</div>}
      </div>
      <div style={{ padding:"10px 12px" }}>
        <p style={{ fontWeight:700,fontSize:13,color:theme.text,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{post.title}</p>
        {post.price&&<p style={{ fontWeight:700,fontSize:13,color:"#43C6AC",marginBottom:2 }}>{post.price} FCFA</p>}
        <p style={{ fontSize:11,color:"#FF4757",fontWeight:600 }}>{times[idx%allUrgents.length]||getTimeLeft(post.urgentUntil)}</p>
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom:24, width:"100%" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:windowWidth<=500?16:20 }}>🔥</span>
          <p style={{ fontWeight:800,fontSize:windowWidth<=500?14:16,color:"#FF4757",letterSpacing:0.5 }}>EN CE MOMENT</p>
          <span style={{ background:"rgba(255,71,87,0.15)",color:"#FF4757",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700 }}>{allUrgents.length}</span>
        </div>
        <button
          onMouseDown={() => { dirRef.current = 1; }}
          onMouseUp={() => { dirRef.current = -1; }}
          onMouseLeave={() => { dirRef.current = -1; }}
          onTouchStart={e => { e.preventDefault(); dirRef.current = 1; }}
          onTouchEnd={() => { dirRef.current = -1; }}
          style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757",padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",userSelect:"none" }}>
          ‹ Reculer
        </button>
      </div>
      <div ref={scrollRef} style={{ display:"flex",overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch",paddingBottom:4 }}>
        {loopItems.map((post,i) => <UrgentCard key={post.id+"-urg-"+i} post={post} idx={i}/>)}
      </div>
      <div style={{ borderBottom:`1px solid ${theme.border}`,marginTop:16 }}/>
    </div>
  );
}

function SponsoredBanner({ posts, boutiques, ateliers, restos, beaute, theme, navigate, windowWidth, sessionSeed, view, activeCategory }) {
  const cat = activeCategory || "Toutes";
  const allSponsored = [
    ...posts.filter(p => p.sponsored && p.sponsoredUntil && new Date(p.sponsoredUntil) > new Date() && (cat==="Toutes"||p.category===cat)).map(p => ({...p, _type:"annonce", _icon:"📋", _label:"Annonce"})),
    ...(cat==="Toutes" ? boutiques.filter(b => b.sponsored && b.sponsoredUntil && new Date(b.sponsoredUntil) > new Date()).map(b => ({...b, title:b.name, _type:"boutique", _icon:"🛍️", _label:"Boutique"})) : []),
    ...(cat==="Toutes" ? ateliers.filter(a => a.sponsored && a.sponsoredUntil && new Date(a.sponsoredUntil) > new Date()).map(a => ({...a, title:a.name, _type:"atelier", _icon:"🔧", _label:"Atelier"})) : []),
    ...(cat==="Toutes" ? restos.filter(r => r.sponsored && r.sponsoredUntil && new Date(r.sponsoredUntil) > new Date()).map(r => ({...r, title:r.name, _type:"resto", _icon:"🍽️", _label:"Restaurant"})) : []),
    ...(cat==="Toutes" ? beaute.filter(b => b.sponsored && b.sponsoredUntil && new Date(b.sponsoredUntil) > new Date()).map(b => ({...b, title:b.name, _type:"beaute", _icon:"💇", _label:"Beauté"})) : []),
  ].sort((a, b) => new Date(b.sponsoredUntil) - new Date(a.sponsoredUntil));

  if (allSponsored.length === 0) return null;

  const cardW = windowWidth <= 500 ? 155 : windowWidth <= 800 ? 185 : 215;
  const GAP   = 12;
  const perPage = windowWidth <= 500 ? 2 : 3;

  const [groupIdx, setGroupIdx] = React.useState(() => Math.floor(sessionSeed * Math.ceil(allSponsored.length/perPage)) % Math.ceil(allSponsored.length/perPage));
  const [slide,    setSlide]    = React.useState("idle");
  const timerRef  = React.useRef(null);
  const totalGroups = Math.ceil(allSponsored.length / perPage);

  const advance = (nextIdx) => {
    setSlide("out");
    setTimeout(() => {
      setGroupIdx(((nextIdx % totalGroups) + totalGroups) % totalGroups);
      setSlide("in");
      setTimeout(() => setSlide("idle"), 500);
    }, 350);
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setGroupIdx(prev => { advance(prev + 1); return prev; });
    }, 4800);
  };

  React.useEffect(() => {
    if (totalGroups <= 1) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [totalGroups]);

  const group = Array.from({ length: perPage }, (_, i) =>
    allSponsored[(groupIdx * perPage + i) % allSponsored.length]);

  const slideStyle = {
    idle: { transform:"translateX(0)", opacity:1, transition:"transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s", pointerEvents:"auto" },
    out:  { transform:"translateX(-40px)", opacity:0, transition:"transform 0.35s ease-in, opacity 0.35s ease-in", pointerEvents:"none" },
    in:   { transform:"translateX(0)", opacity:1, transition:"transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s", pointerEvents:"none" },
  };

  const SponsoredCard = ({ item }) => (
    <div onClick={() => { sessionStorage.setItem("mdr_scroll_pos",String(window.scrollY)); sessionStorage.setItem("mdr_back_view",view||"home"); navigate(`/${item._type==="annonce"?"annonce":item._type}/${item.id}`, { state:{ fromView:view||"home", scrollPos:window.scrollY } }); }}
      style={{ flexShrink:0, width:cardW, borderRadius:14, overflow:"hidden", cursor:"pointer", border:"2px solid #FFD700", background:theme.card, position:"relative" }}>
      <div style={{ width:"100%",aspectRatio:"4/3",background:"linear-gradient(135deg,#1a1d30,#2a2d45)",position:"relative",overflow:"hidden" }}>
        {item.photos&&item.photos[0]
          ? <img src={item.photos[0]} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
          : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32 }}>📦</div>}
        <div style={{ position:"absolute",top:8,left:8,background:"#FFD700",color:"#000",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:800 }}>🌟 SPONSORISÉ</div>
        {item._type!=="annonce"&&<div style={{ position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.55)",color:"#fff",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700 }}>{item._icon} {item._label}</div>}
      </div>
      <div style={{ padding:"10px 12px" }}>
        <p style={{ fontWeight:700,fontSize:13,color:theme.text,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.title}</p>
        {item.price&&<p style={{ fontWeight:700,fontSize:13,color:"#43C6AC",marginBottom:2 }}>{item.price} FCFA</p>}
        {item.ville&&<p style={{ fontSize:11,color:theme.sub }}>{item.ville}{item.quartier?` · ${item.quartier}`:""}</p>}
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom:24,width:"100%" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:windowWidth<=500?16:20 }}>🌟</span>
          <p style={{ fontWeight:800,fontSize:windowWidth<=500?14:16,color:"#FFD700",letterSpacing:0.5 }}>SPONSORISÉES</p>
          <span style={{ background:"rgba(255,215,0,0.15)",color:"#FFD700",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700 }}>{allSponsored.length}</span>
        </div>
        {totalGroups > 1 && (
          <div style={{ display:"flex",gap:6,alignItems:"center" }}>
            <button onClick={()=>{ clearInterval(timerRef.current); advance(groupIdx-1); startTimer(); }}
              style={{ background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.3)",color:"#FFD700",width:28,height:28,borderRadius:"50%",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>‹</button>
            <span style={{ fontSize:11,color:theme.sub }}>{groupIdx+1}/{totalGroups}</span>
            <button onClick={()=>{ clearInterval(timerRef.current); advance(groupIdx+1); startTimer(); }}
              style={{ background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.3)",color:"#FFD700",width:28,height:28,borderRadius:"50%",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>›</button>
          </div>
        )}
      </div>

      {/* Cartes avec animation — pointerEvents:none pendant animation */}
      <div style={{ overflow:"hidden",width:"100%" }}>
        <div style={{ display:"flex",gap:GAP, ...slideStyle[slide] }}>
          {group.map((item,i) => <SponsoredCard key={item.id+"-sp-"+groupIdx+"-"+i} item={item}/>)}
        </div>
      </div>

      {totalGroups > 1 && (
        <div style={{ display:"flex",justifyContent:"center",gap:5,marginTop:10 }}>
          {Array.from({length:totalGroups}).map((_,i)=>(
            <div key={i} onClick={()=>{ clearInterval(timerRef.current); advance(i); startTimer(); }}
              style={{ width:i===groupIdx?18:6,height:6,borderRadius:3,background:i===groupIdx?"#FFD700":"rgba(255,215,0,0.25)",transition:"all 0.3s",cursor:"pointer" }}/>
          ))}
        </div>
      )}
      <div style={{ borderBottom:`1px solid ${theme.border}`,marginTop:14 }}/>
    </div>
  );
}


function EstablishmentUrgentBanner({ boutiques, ateliers, restos, beaute, theme, navigate, windowWidth, sessionSeed }) {
  const [groupIdx, setGroupIdx] = React.useState(0);
  const [slide, setSlide]       = React.useState("idle");
  const timerRef  = React.useRef(null);
  const initDone  = React.useRef(false);

  // Tous les établissements urgents
  const allUrgent = [
    ...boutiques.filter(b => b.urgent && b.urgentUntil && new Date(b.urgentUntil) > new Date()).map(b => ({...b, title:b.name, _type:"boutique", _icon:"🛍️", _label:"Boutique"})),
    ...ateliers.filter(a => a.urgent && a.urgentUntil && new Date(a.urgentUntil) > new Date()).map(a => ({...a, title:a.name, _type:"atelier", _icon:"🔧", _label:"Atelier"})),
    ...restos.filter(r => r.urgent && r.urgentUntil && new Date(r.urgentUntil) > new Date()).map(r => ({...r, title:r.name, _type:"resto", _icon:"🍽️", _label:"Restaurant"})),
    ...beaute.filter(b => b.urgent && b.urgentUntil && new Date(b.urgentUntil) > new Date()).map(b => ({...b, title:b.name, _type:"beaute", _icon:"💇", _label:"Beauté"})),
  ].sort((a, b) => new Date(b.urgentActivatedAt || b.urgentUntil) - new Date(a.urgentActivatedAt || a.urgentUntil));

  if (allUrgent.length === 0) return null;

  // Position de départ aléatoire par session
  React.useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    setGroupIdx(Math.floor(sessionSeed * allUrgent.length) % allUrgent.length);
  }, [allUrgent.length]);

  const advance = (nextIdx) => {
    setSlide("out");
    setTimeout(() => {
      setGroupIdx(((nextIdx % allUrgent.length) + allUrgent.length) % allUrgent.length);
      setSlide("in");
      setTimeout(() => setSlide("idle"), 500);
    }, 350);
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setGroupIdx(prev => { advance(prev + 1); return prev; });
    }, 5000);
  };

  React.useEffect(() => {
    if (allUrgent.length <= 1) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [allUrgent.length]);

  const item = allUrgent[groupIdx];
  if (!item) return null;

  const slideStyle = {
    idle: { transform:"translateX(0)",     opacity:1, transition:"transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s" },
    out:  { transform:"translateX(-40px)", opacity:0, transition:"transform 0.35s ease-in, opacity 0.35s ease-in" },
    in:   { transform:"translateX(0)",     opacity:1, transition:"transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s" },
  };

  return (
    <div style={{ width:"100%", marginBottom:20 }}>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:18 }}>🔥</span>
          <p style={{ fontWeight:800,fontSize:14,color:"#FF4757",letterSpacing:0.5 }}>ÉTABLISSEMENTS EN CE MOMENT</p>
          <span style={{ background:"rgba(255,71,87,0.15)",color:"#FF4757",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700 }}>{allUrgent.length}</span>
        </div>
        {allUrgent.length > 1 && (
          <div style={{ display:"flex",gap:6,alignItems:"center" }}>
            <button onClick={()=>{ clearInterval(timerRef.current); advance(groupIdx-1); startTimer(); }}
              style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757",width:26,height:26,borderRadius:"50%",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>‹</button>
            <span style={{ fontSize:11,color:theme.sub }}>{groupIdx+1}/{allUrgent.length}</span>
            <button onClick={()=>{ clearInterval(timerRef.current); advance(groupIdx+1); startTimer(); }}
              style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757",width:26,height:26,borderRadius:"50%",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>›</button>
          </div>
        )}
      </div>

      {/* Carte pleine largeur — glissement gauche→droite */}
      <div style={{ overflow:"hidden",width:"100%",borderRadius:18 }}>
        <div style={{ ...slideStyle[slide] }}>
          <div onClick={() => navigate(`/${item._type}/${item.id}`)}
            style={{ width:"100%",borderRadius:18,overflow:"hidden",cursor:"pointer",
              border:"2.5px solid #FF4757",background:theme.card,
              boxShadow:"0 4px 24px rgba(255,71,87,0.2)",display:"flex",
              flexDirection:windowWidth<=600?"column":"row",minHeight:windowWidth<=600?220:160 }}>

            {/* Photo */}
            <div style={{ width:windowWidth<=600?"100%":260,height:windowWidth<=600?180:160,flexShrink:0,position:"relative",overflow:"hidden",background:"linear-gradient(135deg,#1a1d30,#2a2d45)" }}>
              {item.photos&&item.photos[0]
                ? <img src={item.photos[0]} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48 }}>{item._icon}</div>}
              <div style={{ position:"absolute",top:10,left:10,background:"#FF4757",color:"#fff",borderRadius:8,padding:"3px 10px",fontSize:11,fontWeight:800,letterSpacing:0.5 }}>🔥 URGENT</div>
              <div style={{ position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.6)",color:"#fff",borderRadius:8,padding:"3px 8px",fontSize:10,fontWeight:700 }}>{item._icon} {item._label}</div>
            </div>

            {/* Contenu */}
            <div style={{ padding:"16px 20px",flex:1,display:"flex",flexDirection:"column",justifyContent:"center" }}>
              <p style={{ fontWeight:800,fontSize:17,color:theme.text,marginBottom:6 }}>{item.title}</p>
              {item.description&&<p style={{ color:theme.sub,fontSize:13,marginBottom:8,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{item.description}</p>}
              {(item.ville||item.quartier)&&<p style={{ fontSize:12,color:theme.sub,marginBottom:8 }}>📍 {[item.ville,item.quartier].filter(Boolean).join(", ")}</p>}
              {item.phone&&<p style={{ fontSize:13,color:"#43C6AC",fontWeight:600 }}>📞 {item.phone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      {allUrgent.length > 1 && (
        <div style={{ display:"flex",justifyContent:"center",gap:5,marginTop:8 }}>
          {allUrgent.map((_,i)=>(
            <div key={i} onClick={()=>{ clearInterval(timerRef.current); advance(i); startTimer(); }}
              style={{ width:i===groupIdx?16:6,height:6,borderRadius:3,background:i===groupIdx?"#FF4757":"rgba(255,71,87,0.25)",transition:"all 0.3s",cursor:"pointer" }}/>
          ))}
        </div>
      )}

      <div style={{ borderBottom:`1px solid ${theme.border}`,marginTop:14 }}/>
    </div>
  );
}

function FlagCylinder({ theme }) {
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startAngle, setStartAngle] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastX, setLastX] = useState(0);
  const rafRef = useRef(null);

  const n = FLAGS.length;
  const angleStep = 360 / n;
  const itemW = 50; // largeur drapeau + gap
  // rayon du cylindre : r = (n * itemW) / (2π)
  const radius = Math.round((n * itemW) / (2 * Math.PI));

  // Auto-rotation
  useEffect(() => {
    if (dragging) return;
    const tick = () => { setAngle(a => a + 0.3); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dragging]);

  // Inertie
  useEffect(() => {
    if (dragging || Math.abs(velocity) < 0.1) return;
    const tick = () => {
      setVelocity(v => {
        const next = v * 0.95;
        setAngle(a => a + next);
        if (Math.abs(next) < 0.1) return 0;
        rafRef.current = requestAnimationFrame(tick);
        return next;
      });
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dragging, velocity]);

  const onStart = (x) => { cancelAnimationFrame(rafRef.current); setDragging(true); setStartX(x); setStartAngle(angle); setLastX(x); setVelocity(0); };
  const onMove  = (x) => { if (!dragging) return; setAngle(startAngle + (x - startX) * 0.4); setVelocity((x - lastX) * 0.4); setLastX(x); };
  const onEnd   = () => setDragging(false);

  return (
    <div style={{ position:"relative", width:"100%", marginBottom:window.innerWidth<=600?0:-20, userSelect:"none" }}>

      {/* Logo — affiché normalement, globe caché par overflow hidden */}
      <div style={{ display:"flex", justifyContent:"center", pointerEvents:"none", overflow:"hidden", height:window.innerWidth<=600?160:140 }}>
        <img
          src="/marcheduRoi-icon.svg"
          alt="MarchéduRoi"
          draggable={false}
          style={{ width:260, height:"auto", filter:"drop-shadow(0 8px 32px rgba(108,99,255,0.35))", display:"block" }}
        />
      </div>

      {/* Cylindre 3D — positionné sur le M */}
      <div
        style={{
          position:"absolute",
          top:window.innerWidth<=600?"18%":"30%",
          left:0, right:0,
          height:38,
          overflow:"hidden",
          cursor:dragging?"grabbing":"grab",
          touchAction:"none",
        }}
        onMouseDown={e=>onStart(e.clientX)}
        onMouseMove={e=>onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={e=>onStart(e.touches[0].clientX)}
        onTouchMove={e=>{ e.preventDefault(); onMove(e.touches[0].clientX); }}
        onTouchEnd={onEnd}
      >
        {/* Fondu gauche/droite */}
        <div style={{ position:"absolute",left:0,top:0,bottom:0,width:48,background:`linear-gradient(to right,${theme.bg},transparent)`,zIndex:10,pointerEvents:"none" }}/>
        <div style={{ position:"absolute",right:0,top:0,bottom:0,width:48,background:`linear-gradient(to left,${theme.bg},transparent)`,zIndex:10,pointerEvents:"none" }}/>

        {/* Conteneur perspective */}
        <div style={{ position:"absolute", left:"50%", top:"50%", width:0, height:0, perspective:`${radius * 2.5}px` }}>
          {/* Cylindre rotatif */}
          <div style={{
            position:"absolute",
            width:0, height:0,
            transformStyle:"preserve-3d",
            transform:`translateX(-50%) translateY(-50%) rotateY(${angle}deg)`,
          }}>
            {FLAGS.map((f, i) => {
              const rot = i * angleStep;
              const rad = ((rot + angle) % 360) * Math.PI / 180;
              const opacity = Math.max(0.12, (Math.cos(rad) + 1) / 2);
              return (
                <div key={f.code} title={f.pays} style={{
                  position:"absolute",
                  transform:`rotateY(${rot}deg) translateZ(${radius}px) translateX(-50%) translateY(-50%)`,
                  opacity,
                  transformOrigin:"center center",
                }}>
                  <img
                    src={`https://flagcdn.com/32x24/${f.code}.png`}
                    alt={f.pays}
                    draggable={false}
                    style={{ width:32, height:24, borderRadius:3, objectFit:"cover", boxShadow:"0 2px 6px rgba(0,0,0,0.3)", display:"block", pointerEvents:"none" }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────


// Ajoute le logo MarchéduRoi en miniature coin haut-gauche sur une image
async function addLogoWatermark(photoUrl) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Charger la photo
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = photoUrl; });

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Charger le logo
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    await new Promise((res, rej) => { logo.onload = res; logo.onerror = rej; logo.src = '/icons/icon-512x512.png'; });

    // Logo en miniature coin haut-gauche (10% de la largeur)
    const logoSize = Math.round(img.width * 0.1);
    const padding = Math.round(img.width * 0.02);

    // Fond semi-transparent derrière le logo
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    const bgW = logoSize + padding * 2;
    const bgH = logoSize + padding * 2;
    ctx.roundRect(padding, padding, bgW, bgH, 8);
    ctx.fill();

    // Logo
    ctx.drawImage(logo, padding * 1.5, padding * 1.5, logoSize, logoSize);

    return new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9));
  } catch(e) {
    return null;
  }
}

function AppContent() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [ads, setAds] = useState([]);
  const [adRequests, setAdRequests] = useState([]);
  const [adIndex, setAdIndex] = useState(0);
  const [adPaused, setAdPaused] = useState(false);
  // Page Merci après paiement
  const [thankYou, setThankYou] = useState(null); // { type, title, details, nextStep }
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    let timer;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setWindowWidth(window.innerWidth), 150);
    };
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); clearTimeout(timer); };
  }, []);
  const gridCols = windowWidth > 1200 ? "repeat(3,1fr)" : windowWidth > 800 ? "repeat(3,1fr)" : windowWidth > 500 ? "repeat(2,1fr)" : "1fr";
  const [visibleBoutiques, setVisibleBoutiques] = useState(12);
  const [visibleAteliers, setVisibleAteliers] = useState(12);
  const [visibleRestos, setVisibleRestos] = useState(12);
  const [visibleBeaute, setVisibleBeaute] = useState(12);
  const [boutiques, setBoutiques] = useState(INITIAL_BOUTIQUES);
  const [ateliers, setAteliers] = useState(INITIAL_ATELIERS);
  const [restos, setRestos] = useState(INITIAL_RESTOS);
  const [beaute, setBeaute] = useState(INITIAL_BEAUTE);
  const [suggestions, setSuggestions] = useState([{ id:1,text:"Ajouter un système de messagerie interne",author:"Visiteur anonyme",date:"2026-03-10",status:"en attente" }]);
  const [user, setUser] = useState(null);
  const { applyPromo, getPromo } = usePromo();
  const [view, setViewState] = useState(() => {
    // Si on revient d'une fiche détail → restaurer la vue précédente
    const returnView = sessionStorage.getItem("mdr_back_view");
    if (returnView) return returnView;
    // Lien partagé → garder la vue actuelle
    const hasSharedPost = sessionStorage.getItem("mdr_open_post");
    if (hasSharedPost) return history.state?.view || "landing";
    // Sinon → page d'accueil
    return "landing";
  });
  const [showCategories, setShowCategories] = useState(false);
  const [showPublishMenu, setShowPublishMenu] = useState(false);

  // Navigation avec historique — remplace setView partout
  const setView = (newView) => {
    if (newView === view) return;
    history.pushState({ view: newView }, "", window.location.pathname);
    setViewState(newView);
    window.scrollTo(0, 0);
  };
  const [shopForm, setShopForm] = useState({ name:"",type:"",description:"",services:"",keywords:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:getPhonePrefix(),lat:"",lng:"" });
  const [immoForm, setImmoForm] = useState({ sousType:"Maison", transaction:"Vente", superficie:"", pieces:"", titre:"", ville:"", quartier:"", von:"", eau:"Oui", electricite:"Oui", etat:"Bon état", recasee:"", autres:"" });
  const [shopPhotos, setShopPhotos] = useState([]);
  const [shopVideo, setShopVideo] = useState(null);
  const [shopMode, setShopMode] = useState("boutique");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [modal, setModal] = useState(null);
  const [notification, setNotification] = useState(null);
  const [likedPosts, setLikedPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mf_liked") || "[]"); }
    catch { return []; }
  });
  const [ratings, setRatings] = useState({});
  const [reports, setReports] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mf_featured") || "[]"); }
    catch { return []; }
  });
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [msgInput, setMsgInput] = useState("");
  const [showMessages, setShowMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadMessages = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data);
      // Group by conversation (post_id + other user)
      const convMap = {};
      data.forEach(msg => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const otherName = msg.sender_id === user.id ? msg.receiver_name : msg.sender_name;
        const key = msg.post_id + "_" + otherId;
        if (!convMap[key]) {
          convMap[key] = {
            key, postId: msg.post_id, postTitle: msg.post_title,
            postPrice: msg.post_price, postPhoto: msg.post_photo,
            otherId, otherName, messages: [], unread: 0
          };
        }
        convMap[key].messages.push(msg);
        if (!msg.read && msg.receiver_id === user.id) convMap[key].unread++;
      });
      const convList = Object.values(convMap).sort((a,b) => {
        const lastA = a.messages[a.messages.length-1]?.created_at;
        const lastB = b.messages[b.messages.length-1]?.created_at;
        return lastB > lastA ? 1 : -1;
      });
      setConversations(convList);
      setUnreadCount(convList.reduce((a,c)=>a+c.unread,0));
    }
  };

  const sendMessage = async (postId, postTitle, postPrice, postPhoto, receiverId, receiverName) => {
    if (!msgInput.trim()) return;
    if (!user) { notify("Connectez-vous pour envoyer un message","error"); return; }
    // Try to get receiver from activeConv if not provided
    const finalReceiverId = receiverId || activeConv?.receiverId || activeConv?.otherId;
    const finalReceiverName = receiverName || activeConv?.receiverName || activeConv?.otherName || "Utilisateur";
    if (!finalReceiverId) { notify("Destinataire introuvable","error"); return; }
    const { error } = await supabase.from("messages").insert({
      post_id: postId, post_title: postTitle||"", post_price: postPrice||"", post_photo: postPhoto||null,
      sender_id: user.id, sender_name: user.name,
      receiver_id: finalReceiverId, receiver_name: finalReceiverName,
      content: msgInput.trim(), read: false
    });
    if (!error) {
      setMsgInput("");
      loadMessages();
      addNotification("Message envoyé à "+finalReceiverName+" !", "contact", postId);
      // Notifier le destinataire par email via Supabase Edge Function
      supabase.functions.invoke("send-message-email", {
        body: {
          to_user_id: finalReceiverId,
          from_name: user.name,
          post_title: postTitle||"",
          message_preview: msgInput.trim().slice(0,100),
        }
      }).catch(()=>{}); // silencieux si la fonction n'existe pas encore
    } else { console.error(error); notify("Erreur d'envoi","error"); }
  };

  const markConvRead = async (conv) => {
    const unreadIds = conv.messages.filter(m=>!m.read&&m.receiver_id===user.id).map(m=>m.id);
    if (unreadIds.length > 0) {
      await supabase.from("messages").update({read:true}).in("id", unreadIds);
      loadMessages();
    }
  };

  useEffect(() => {
    if(user) {
      loadMessages();
      // Load favorites from Supabase
      supabase.from("profiles").select("favorites").eq("id", user.id).single().then(({data}) => {
        if (data?.favorites && Array.isArray(data.favorites)) {
          setFavorites(data.favorites);
          localStorage.setItem("mf_favorites", JSON.stringify(data.favorites));
        }
      });

      // ── Realtime : nouveaux messages en temps réel ──────────────────────────
      const channel = supabase
        .channel("messages_realtime_" + user.id)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        }, (payload) => {
          loadMessages();
          addNotification(
            `Nouveau message de ${payload.new.sender_name} : "${payload.new.content.slice(0,40)}..."`,
            "contact",
            payload.new.post_id
          );
          // Notification push système (même si le site est en arrière-plan)
          if (Notification.permission === "granted") {
            const notif = new Notification("💬 Nouveau message — MarchéduRoi", {
              body: `${payload.new.sender_name} : "${payload.new.content.slice(0, 60)}"`,
              icon: "/marcheduRoi-icon.svg",
              badge: "/marcheduRoi-icon.svg",
              tag: "message_" + payload.new.post_id,
              renotify: true,
            });
            notif.onclick = () => {
              window.focus();
              notif.close();
            };
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  // Load posts from Supabase
  // Load admin settings (featured, certified, sponsored) from Supabase
  const loadAdminSettings = async () => {
    const { data } = await supabase.from("admin_settings").select("*");
    if (data && data.length > 0) {
      data.forEach(row => {
        if (row.key === "featured") {
          setFeaturedPosts(row.value || []);
          localStorage.setItem("mf_featured", JSON.stringify(row.value || []));
        }
        if (row.key === "certified") {
          setCertifiedUsers(row.value || []);
          localStorage.setItem("mf_certified", JSON.stringify(row.value || []));
        }
        if (row.key === "sponsored") {
          const sponsored = row.value || {};
          localStorage.setItem("mf_sponsored", JSON.stringify(sponsored));
          // Apply sponsored to all sections
          const today = new Date();
          const valid = {};
          Object.keys(sponsored).forEach(id => {
            if (new Date(sponsored[id].sponsoredUntil) >= today) valid[id] = sponsored[id];
          });
          if (Object.keys(valid).length > 0) {
            setBoutiques(b => b.map(x => valid[x.id] ? {...x, sponsored:true, sponsoredUntil:valid[x.id].sponsoredUntil} : x));
            setAteliers(a => a.map(x => valid[x.id] ? {...x, sponsored:true, sponsoredUntil:valid[x.id].sponsoredUntil} : x));
            setRestos(r => r.map(x => valid[x.id] ? {...x, sponsored:true, sponsoredUntil:valid[x.id].sponsoredUntil} : x));
            setBeaute(b => b.map(x => valid[x.id] ? {...x, sponsored:true, sponsoredUntil:valid[x.id].sponsoredUntil} : x));
          }
        }
      });
    }
  };

  const saveAdminSetting = async (key, value) => {
    await supabase.from("admin_settings").upsert({ key, value, updated_at: new Date().toISOString() });
  };

  const loadShops = async () => {
    try {
      const mapItem = x => {
        // Parser les photos si Supabase les retourne comme string JSON
        let photos = x.photos||[];
        if (typeof photos === "string") {
          try { photos = JSON.parse(photos); } catch(e) { photos = []; }
        }
        if (!Array.isArray(photos)) photos = [];
        return {...x, authorId: x.author_id, expiresAt: x.expires_at,
          sponsoredUntil: x.sponsored_until, urgentUntil: x.urgent_until,
          urgentActivatedAt: x.urgent_activated_at, photos, likes: x.likes||0,
          sousType: x.sous_type||x.sousType||""};
      };
      const { data: bData } = await supabase.from("boutiques").select("*").order("created_at", { ascending: false }).range(0, 99);
      if (bData && bData.length > 0) setBoutiques(bData.map(mapItem));
      const { data: aData } = await supabase.from("ateliers").select("*").order("created_at", { ascending: false }).range(0, 99);
      if (aData && aData.length > 0) setAteliers(aData.map(mapItem));
      const { data: rData } = await supabase.from("restos").select("*").order("created_at", { ascending: false }).range(0, 99);
      if (rData && rData.length > 0) setRestos(rData.map(mapItem));
      const { data: beData } = await supabase.from("beaute").select("*").order("created_at", { ascending: false }).range(0, 99);
      if (beData && beData.length > 0) setBeaute(beData.map(mapItem));
    } catch(err) {
      console.error("Erreur chargement boutiques:", err);
    }
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(0, 199); // max 200 annonces par chargement
      if (error) throw error;
      if (data) {
        const mapped = data.map(p => ({
          ...p,
          authorId: p.author_id,
          expiresAt: p.expires_at,
          sponsoredUntil: p.sponsored_until,
          urgentUntil: p.urgent_until,
          urgentActivatedAt: p.urgent_activated_at,
          ownerVerified: p.owner_verified,
          photos: p.photos || [],
          video: p.video || null,
          likes: p.likes || 0,
        }));
        setPosts(mapped); // Supabase uniquement — plus de données fictives
      }
    } catch(err) {
      console.error("Erreur chargement annonces:", err);
      notify("Erreur de chargement des annonces. Vérifiez votre connexion.", "error");
    } finally {
      setPostsLoaded(true);
    }
  };

  useEffect(() => {
    loadPosts();
    loadShops();
    loadAdminSettings();
    loadRatings();

    // Charger les pubs depuis Supabase
    const loadAds = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("ads")
        .select("*")
        .eq("actif", true)
        .or(`fin.is.null,fin.gte.${today}`)
        .order("created_at", { ascending: false });
      if (data && data.length > 0) setAds(data);
    };
    loadAds();
    // Charger les demandes de bannières (admin)
    if (user?.role === "admin") {
      supabase.from("ad_requests").select("*").order("created_at", { ascending: false })
        .then(({ data }) => { if (data) setAdRequests(data); });
    }
    // Restore sponsored state for boutiques/ateliers/restos/beaute
    const sponsored = JSON.parse(localStorage.getItem("mf_sponsored") || "{}");
    if (Object.keys(sponsored).length > 0) {
      const today = new Date();
      const validSponsored = {};
      Object.keys(sponsored).forEach(id => {
        const exp = new Date(sponsored[id].sponsoredUntil);
        if (exp >= today) validSponsored[id] = sponsored[id];
      });
      if (Object.keys(validSponsored).length > 0) {
        setBoutiques(b => b.map(x => validSponsored[x.id] ? {...x, sponsored:true, sponsoredUntil:validSponsored[x.id].sponsoredUntil} : x));
        setAteliers(a => a.map(x => validSponsored[x.id] ? {...x, sponsored:true, sponsoredUntil:validSponsored[x.id].sponsoredUntil} : x));
        setRestos(r => r.map(x => validSponsored[x.id] ? {...x, sponsored:true, sponsoredUntil:validSponsored[x.id].sponsoredUntil} : x));
        setBeaute(b => b.map(x => validSponsored[x.id] ? {...x, sponsored:true, sponsoredUntil:validSponsored[x.id].sponsoredUntil} : x));
      }
    }
  }, []);

  const toggleFeatured = (itemId) => {
    setFeaturedPosts(f => {
      const updated = f.includes(itemId) ? f.filter(id=>id!==itemId) : [...f, itemId];
      localStorage.setItem("mf_featured", JSON.stringify(updated));
      saveAdminSetting("featured", updated);
      notify(f.includes(itemId) ? "Retiré des vedettes" : "Ajouté en vedette 🏆 !");
      return updated;
    });
  };
  const [reportOtp, setReportOtp] = useState({ phone:getPhonePrefix(), code:"", generated:"", verified:false, postData:null });
  const [cancelableReports, setCancelableReports] = useState({});

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendOtp = (phone) => {
    if (!phone || phone.length < 8) { notify("Entrez un numéro valide","error"); return; }
    const code = generateOtp();
    setReportOtp(r=>({...r, phone, generated:code}));
    notify(`Code OTP simulé : ${code} (SMS réel bientôt disponible)`);
  };

  const verifyOtp = (enteredCode) => {
    if (enteredCode === reportOtp.generated) {
      setReportOtp(r=>({...r, verified:true}));
      notify("Numéro vérifié ! ✅");
    } else {
      notify("Code incorrect. Réessayez.","error");
    }
  };

  const submitReport = async (postData, motif) => {
    const reportId = Date.now();
    const newReport = {
      id: reportId,
      postId: postData.id,
      postTitle: postData.title||postData.name,
      motif,
      reporter: user ? user.name : "Visiteur",
      phone: reportOtp.phone,
      date: new Date().toISOString().slice(0,10),
      status: "En attente",
      createdAt: Date.now(),
    };

    // Sauvegarder dans Supabase
    await supabase.from("reports").insert({
      post_id: postData.id,
      post_title: newReport.postTitle,
      motif,
      reporter: newReport.reporter,
      phone: reportOtp.phone || null,
      date: newReport.date,
      status: "En attente",
    }).then(({ error }) => {
      if (error) console.error("Erreur signalement Supabase:", error);
    });

    setReports(r=>[...r, newReport]);
    setCancelableReports(c=>({...c, [reportId]: true}));
    setTimeout(() => {
      setCancelableReports(c=>{ const n={...c}; delete n[reportId]; return n; });
    }, 5 * 60 * 1000);
    setReportOtp({ phone:"", code:"", generated:"", verified:false, postData:null });
    setModal(null);
    notify("Signalement envoyé ! Vous avez 5 minutes pour annuler.");
  };

  const cancelReport = (reportId) => {
    setReports(r=>r.filter(x=>x.id!==reportId));
    setCancelableReports(c=>{ const n={...c}; delete n[reportId]; return n; });
    notify("Signalement annulé ✅");
  };
  const [postViews, setPostViews] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mf_views") || "{}"); }
    catch { return {}; }
  });
  const [contactClicks, setContactClicks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mf_contacts") || "{}"); }
    catch { return {}; }
  });

  const trackView = (postId) => {
    if (!postId) return;
    setPostViews(v => {
      const updated = { ...v, [postId]: (v[postId] || 0) + 1 };
      localStorage.setItem("mf_views", JSON.stringify(updated));
      // Sauvegarder dans Supabase en arrière-plan
      supabase.from("posts").select("views").eq("id", postId).single()
        .then(({ data }) => {
          if (data !== null) {
            const newViews = (data?.views || 0) + 1;
            supabase.from("posts").update({ views: newViews }).eq("id", postId).then(() => {});
            const post = posts.find(p => p.id === postId);
            if (post && user && post.authorId !== user?.id && newViews % 10 === 0) {
              addNotification("Votre annonce '" + post.title + "' a atteint " + newViews + " vues !", "view", postId);
            }
          }
        });
      return updated;
    });
  };

  const trackContact = (postId) => {
    setContactClicks(c => {
      const updated = { ...c, [postId]: (c[postId] || 0) + 1 };
      localStorage.setItem("mf_contacts", JSON.stringify(updated));
      return updated;
    });
    // Notify post owner
    const post = posts.find(p=>p.id===postId);
    if (post && user && post.authorId !== user?.id) {
      addNotification("Quelqu'un a contacté votre annonce '"+post.title+"' !", "contact", postId);
    }
  };
  const [userRatings, setUserRatings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mf_ratings") || "{}"); }
    catch { return {}; }
  });

  const addRating = async (itemId, stars, comment) => {
    if (!user) { notify("Connectez-vous pour noter","error"); return; }
    const key = user.id + "_" + itemId;
    if (userRatings[key]) { notify("Vous avez déjà noté cet élément","error"); return; }

    // Sauvegarder dans Supabase
    const { error } = await supabase.from("ratings").insert({
      item_id: itemId,
      user_id: user.id,
      user_name: user.name,
      stars,
      comment: comment || null,
      date: new Date().toISOString().slice(0,10),
    });
    if (error) {
      console.error("Erreur rating:", error);
      notify("Erreur lors de la notation : " + error.message, "error");
      return;
    }

    // Mettre à jour localement
    const newUserRatings = { ...userRatings, [key]: { stars, comment, date: new Date().toISOString().slice(0,10), userName: user.name } };
    localStorage.setItem("mf_ratings", JSON.stringify(newUserRatings));
    setUserRatings(newUserRatings);
    setRatings(r => {
      const existing = r[itemId] || { total: 0, count: 0, comments: [] };
      const newRating = {
        total: existing.total + stars,
        count: existing.count + 1,
        comments: comment ? [...existing.comments, { stars, comment, userName: user.name, date: new Date().toISOString().slice(0,10) }] : existing.comments
      };
      // Auto badge vérifié après 5 avis positifs (4+ étoiles)
      const post = posts.find(p=>p.id===itemId);
      if (post && stars >= 4 && newRating.count >= 5) {
        setPosts(prev => prev.map(p => p.id===itemId ? {...p, ownerVerified:true} : p));
        supabase.from("posts").update({ owner_verified: true }).eq("id", itemId);
      }
      return { ...r, [itemId]: newRating };
    });
    notify("Merci pour votre note !");
  };

  // Charger les notes depuis Supabase au démarrage
  const loadRatings = async () => {
    const { data } = await supabase.from("ratings").select("*");
    if (data && data.length > 0) {
      const ratingsMap = {};
      const userRatingsMap = {};
      data.forEach(r => {
        if (!ratingsMap[r.item_id]) ratingsMap[r.item_id] = { total: 0, count: 0, comments: [] };
        ratingsMap[r.item_id].total += r.stars;
        ratingsMap[r.item_id].count += 1;
        if (r.comment) ratingsMap[r.item_id].comments.push({ stars: r.stars, comment: r.comment, userName: r.user_name, date: r.date });
        if (user) userRatingsMap[`${user.id}_${r.item_id}`] = { stars: r.stars, comment: r.comment };
      });
      setRatings(ratingsMap);
      if (user) setUserRatings(prev => ({ ...prev, ...userRatingsMap }));
    }
  };

  const getAvgRating = (itemId) => {
    const r = ratings[itemId];
    if (!r || r.count === 0) return null;
    return (r.total / r.count).toFixed(1);
  };

  const getRatingCount = (itemId) => ratings[itemId]?.count || 0;

  const renderStars = (rating, size=14) => {
    const stars = [];
    for (let i=1; i<=5; i++) {
      stars.push(<span key={i} style={{ color: i<=Math.round(rating)?"#FFD700":"#4A4A6A", fontSize:size }}>★</span>);
    }
    return stars;
  };
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mf_favorites") || "[]"); }
    catch { return []; }
  });

  const toggleFavorite = async (id) => {
    setFavorites(f => {
      const updated = f.includes(id) ? f.filter(x=>x!==id) : [...f, id];
      localStorage.setItem("mf_favorites", JSON.stringify(updated));
      // Save to Supabase profile if logged in
      if (user) {
        supabase.from("profiles").update({ favorites: updated }).eq("id", user.id);
      }
      return updated;
    });
  };
  const [authForm, setAuthForm] = useState({ email:"",password:"",name:"",country:"BJ",phone:"" });
  const [loginError, setLoginError] = useState(null); // null | "unknown_email" | "wrong_password"
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = React.useRef(null);

  useEffect(() => {
    const handler = (e) => setTurnstileToken(e.detail);
    document.addEventListener("turnstile-success", handler);
    return () => document.removeEventListener("turnstile-success", handler);
  }, []);

  // Rendre le widget Turnstile quand on arrive sur la page d'inscription
  useEffect(() => {
    if (view !== "register") return;
    setTurnstileToken("");
    const tryRender = () => {
      if (window.turnstile && turnstileRef.current && !turnstileRef.current.hasChildNodes()) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAAC788zTLMNgDh7zL",
          callback: (token) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(""),
          theme: "light",
        });
      } else if (!window.turnstile) {
        setTimeout(tryRender, 300);
      }
    };
    setTimeout(tryRender, 200);
  }, [view]);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name:"", phone:"", bio:"", ville:"", photo:"" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [modifHistory, setModifHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mf_modifs") || "{}"); }
    catch { return {}; }
  });
  const [certifiedUsers, setCertifiedUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mf_certified") || "[]"); }
    catch { return []; }
  });

  const toggleCertified = (authorId, authorName) => {
    setCertifiedUsers(prev => {
      const updated = prev.includes(authorId)
        ? prev.filter(id => id !== authorId)
        : [...prev, authorId];
      localStorage.setItem("mf_certified", JSON.stringify(updated));
      saveAdminSetting("certified", updated);
      notify(prev.includes(authorId)
        ? `Certification retirée à ${authorName}`
        : `${authorName} est maintenant Certifié MarchéduRoi 🏅 !`);
      return updated;
    });
  };

  const isCertified = (authorId) => certifiedUsers.includes(authorId);


  // Modification gratuite et illimitée pour les annonces classiques
  const canModifyFree = (post) => true;

  const getModifPrice = (post) => {
    const isSimple = !["Boutiques","Ateliers","Restos","Beauté"].includes(post.category);
    return isSimple ? MODIF_PRICES.simple : MODIF_PRICES.pro;
  };

  const getModifCount = (postId) => {
    const currentMonth = new Date().toISOString().slice(0,7);
    const history = modifHistory[postId] || {};
    return history.month === currentMonth ? (history.count || 0) : 0;
  };

  const recordModification = (postId) => {
    const currentMonth = new Date().toISOString().slice(0,7);
    const current = modifHistory[postId] || {};
    const count = current.month === currentMonth ? (current.count || 0) + 1 : 1;
    const updated = { ...modifHistory, [postId]: { month: currentMonth, count } };
    setModifHistory(updated);
    localStorage.setItem("mf_modifs", JSON.stringify(updated));
  };
  const [postForm, setPostForm] = useState({ title:"",category:"Autre",description:"",price:"",priceDay:"",priceWeek:"",priceMonth:"",contact:"",phone:getPhonePrefix(),lat:"",lng:"" });
  const [agroForm, setAgroForm] = useState({ sousCategorie:"", quantite:"", unite:"sac de 50 kg", prixUnitaire:"", qualite:"Standard / Grade B", disponibilite:"Toute l'année", lieuEnlevement:"", saisonRecolte:"" });
  const [postPhotos, setPostPhotos] = useState([]);
  const [postVideo, setPostVideo] = useState("");
  const [vehicleForm, setVehicleForm] = useState({});
  const [themeId, setThemeId] = useState(() => {
    const saved = localStorage.getItem("mf_theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });
  const [suggestionText, setSuggestionText] = useState("");
  const [suggestionName, setSuggestionName] = useState("");
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [hasNewDemandes, setHasNewDemandes] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [demandeForm, setDemandeForm] = useState({ title:"", category:"Autre", description:"", budget:"", ville:"", delai:"Cette semaine", mode:"Enlèvement sur place", phone:"", contact:"", duree:7 });
  const [showDemandeForm, setShowDemandeForm] = useState(false);

  // Fermer le menu Plus en cliquant/touchant ailleurs — délai 50ms pour éviter fermeture immédiate
  useEffect(() => {
    if (!showMoreMenu) return;
    const close = () => setShowMoreMenu(false);
    let touchStartY = 0;
    const onTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      // Ne fermer que si c'est un vrai tap (pas un scroll)
      if (Math.abs(e.changedTouches[0].clientY - touchStartY) < 8) close();
    };
    const t = setTimeout(() => {
      document.addEventListener('click', close, { once: true });
      document.addEventListener('touchstart', onTouchStart, { passive: true });
      document.addEventListener('touchend', onTouchEnd);
    }, 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', close);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [showMoreMenu]);
  const [adminSearch, setAdminSearch] = useState("");
  const [lang, setLang] = useState(() => localStorage.getItem("mf_lang") || "fr");
  const t = {
    fr: {
      annonces:"Annonces", rechercher:"Rechercher une annonce...", publier:"Publier une annonce",
      connexion:"Connexion", inscrire:"S'inscrire", decouvrez:"Découvrez des", uniques:"annonces uniques",
      gratuitement:"Consultez gratuitement · Publiez avec un abonnement",
      boutiques:"Boutiques", ateliers:"Ateliers", restos:"Restos & Bars", beaute:"Beauté", mode:"Mode",
      contact:"Contact", partager:"Partager", signaler:"Signaler", favoris:"Favoris",
      voirPlus:"Voir plus", reduire:"↑ Réduire la liste", pressDeMoi:"📍 Près de moi",
      parDistance:"Par distance", effacer:"✕ Effacer", sponsorise:"🌟 Sponsorisé",
      vendeurVerifie:"✅ Vendeur vérifié", avis:"avis", noter:"⭐ Noter cet élément",
      envoyer:"Envoyer ma note", aucuneAnnonce:"Aucune annonce trouvée",
      tableau:"Tableau de bord", deconnexion:"Déconnexion", admin:"Admin",
      theme:"Thème", plus:"Plus ▾", stats:"📊 Statistiques", parrainage:"🎁 Parrainage",
      newsletter:"📧 Newsletter", suggestion:"💬 Suggestion", apropos:"ℹ️ À propos", cgu:"📋 CGU",
      messages:"Messages", notifications:"Notifications", profil:"Mon profil",
      modifier:"Modifier", supprimer:"Supprimer", annuler:"Annuler", confirmer:"Confirmer",
      publierAnnonce:"💡 Publier ?", chargement:"Chargement...",
    },
    en: {
      annonces:"Listings", rechercher:"Search a listing...", publier:"Post a listing",
      connexion:"Login", inscrire:"Sign up", decouvrez:"Discover", uniques:"unique listings",
      gratuitement:"Browse free · Post with a subscription",
      boutiques:"Shops", ateliers:"Workshops", restos:"Restaurants & Bars", beaute:"Beauty", mode:"Fashion",
      contact:"Contact", partager:"Share", signaler:"Report", favoris:"Favorites",
      voirPlus:"See more", reduire:"↑ Collapse list", pressDeMoi:"📍 Near me",
      parDistance:"By distance", effacer:"✕ Clear", sponsorise:"🌟 Sponsored",
      vendeurVerifie:"✅ Verified seller", avis:"reviews", noter:"⭐ Rate this",
      envoyer:"Send my rating", aucuneAnnonce:"No listings found",
      tableau:"Dashboard", deconnexion:"Logout", admin:"Admin",
      theme:"Theme", plus:"More ▾", stats:"📊 Statistics", parrainage:"🎁 Referral",
      newsletter:"📧 Newsletter", suggestion:"💬 Suggestion", apropos:"ℹ️ About", cgu:"📋 Terms",
      messages:"Messages", notifications:"Notifications", profil:"My profile",
      modifier:"Edit", supprimer:"Delete", annuler:"Cancel", confirmer:"Confirm",
      publierAnnonce:"💡 How to post?", chargement:"Loading...",
    }
  }[lang];
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [filterVille, setFilterVille] = useState("");
  const [filterDate, setFilterDate] = useState(""); // "7j", "30j", "90j", ""
  const [visibleCount, setVisibleCount] = useState(12);
  const POSTS_PER_PAGE = 12;

  useEffect(() => { setVisibleCount(12); }, [search, category, priceMin, priceMax, filterVille, filterDate]);

  // Check sponsored expiry and auto-expire posts
  useEffect(() => {
    const today = new Date();
    // Expire sponsored - clean Supabase too
    const sponsored = JSON.parse(localStorage.getItem("mf_sponsored") || "{}");
    let changed = false;
    Object.keys(sponsored).forEach(id => {
      if (new Date(sponsored[id].sponsoredUntil) < today) {
        delete sponsored[id];
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem("mf_sponsored", JSON.stringify(sponsored));
      saveAdminSetting("sponsored", sponsored);
    }
    setPosts(prev => prev.map(post => {
      if (!post.sponsoredUntil) return post;
      if (new Date(post.sponsoredUntil) < today) return { ...post, sponsored: false, sponsoredUntil: null };
      return post;
    }));
    // Auto-expire badge urgent
    setPosts(prev => prev.map(post => {
      if (!post.urgentUntil) return post;
      if (new Date(post.urgentUntil) < new Date()) return { ...post, urgent: false, urgentUntil: null, urgentActivatedAt: null };
      return post;
    }));
    // Auto-expire posts past their expiresAt date
    setPosts(prev => prev.map(post => {
      if (!post.expiresAt) return post;
      if (new Date(post.expiresAt) < today) return { ...post, expired: true };
      return post;
    }));
    setBoutiques(prev => prev.map(b => {
      if (!b.expiresAt) return b;
      if (new Date(b.expiresAt) < today) return { ...b, expired: true };
      return b;
    }));
    setAteliers(prev => prev.map(a => {
      if (!a.expiresAt) return a;
      if (new Date(a.expiresAt) < today) return { ...a, expired: true };
      return a;
    }));
    setRestos(prev => prev.map(r => {
      if (!r.expiresAt) return r;
      if (new Date(r.expiresAt) < today) return { ...r, expired: true };
      return r;
    }));
    setBeaute(prev => prev.map(b => {
      if (!b.expiresAt) return b;
      if (new Date(b.expiresAt) < today) return { ...b, expired: true };
      return b;
    }));
  }, []);

  const unsponsorPost = async (postId) => {
    // Mettre à jour l'état local immédiatement
    setPosts(p => p.map(post => post.id === postId ? { ...post, sponsored: false, sponsoredUntil: null } : post));
    setBoutiques(b => b.map(x => x.id === postId ? { ...x, sponsored: false, sponsoredUntil: null } : x));
    setAteliers(a => a.map(x => x.id === postId ? { ...x, sponsored: false, sponsoredUntil: null } : x));
    setRestos(r => r.map(x => x.id === postId ? { ...x, sponsored: false, sponsoredUntil: null } : x));
    setBeaute(b => b.map(x => x.id === postId ? { ...x, sponsored: false, sponsoredUntil: null } : x));
    // Nettoyer localStorage
    const sponsored = JSON.parse(localStorage.getItem("mf_sponsored") || "{}");
    delete sponsored[postId];
    localStorage.setItem("mf_sponsored", JSON.stringify(sponsored));
    // Supabase en arrière-plan
    Promise.all([
      supabase.from("posts").update({ sponsored: false, sponsored_until: null }).eq("id", postId),
      supabase.from("boutiques").update({ sponsored: false, sponsored_until: null }).eq("id", postId),
      supabase.from("ateliers").update({ sponsored: false, sponsored_until: null }).eq("id", postId),
      supabase.from("restos").update({ sponsored: false, sponsored_until: null }).eq("id", postId),
      supabase.from("beaute").update({ sponsored: false, sponsored_until: null }).eq("id", postId),
      saveAdminSetting("sponsored", sponsored),
    ]).catch(()=>{});
    notify("Sponsoring retiré ✅");
  };

  const sponsorPost = async (postId, duration) => {
    const expDate = new Date();
    if (duration === "week") expDate.setDate(expDate.getDate() + 7);
    else if (duration === "3months") expDate.setDate(expDate.getDate() + 90);
    else if (duration === "6months") expDate.setDate(expDate.getDate() + 180);
    else expDate.setMonth(expDate.getMonth() + 1);
    const expStr = expDate.toISOString().slice(0,10);

    // Mettre à jour l'état local immédiatement (pas d'attente réseau)
    setPosts(p => p.map(post => post.id === postId ? { ...post, sponsored: true, sponsoredUntil: expStr } : post));
    setBoutiques(b => b.map(x => x.id === postId ? { ...x, sponsored: true, sponsoredUntil: expStr } : x));
    setAteliers(a => a.map(x => x.id === postId ? { ...x, sponsored: true, sponsoredUntil: expStr } : x));
    setRestos(r => r.map(x => x.id === postId ? { ...x, sponsored: true, sponsoredUntil: expStr } : x));
    setBeaute(b => b.map(x => x.id === postId ? { ...x, sponsored: true, sponsoredUntil: expStr } : x));

    // Backup localStorage
    const sponsored = JSON.parse(localStorage.getItem("mf_sponsored") || "{}");
    sponsored[postId] = { sponsored: true, sponsoredUntil: expStr };
    localStorage.setItem("mf_sponsored", JSON.stringify(sponsored));

    // Sauvegarder dans Supabase en arrière-plan (sans bloquer l'UI)
    Promise.all([
      supabase.from("posts").update({ sponsored: true, sponsored_until: expStr }).eq("id", postId),
      supabase.from("boutiques").update({ sponsored: true, sponsored_until: expStr }).eq("id", postId),
      supabase.from("ateliers").update({ sponsored: true, sponsored_until: expStr }).eq("id", postId),
      supabase.from("restos").update({ sponsored: true, sponsored_until: expStr }).eq("id", postId),
      supabase.from("beaute").update({ sponsored: true, sponsored_until: expStr }).eq("id", postId),
      saveAdminSetting("sponsored", sponsored),
    ]).catch(()=>{});

    notify("🌟 Sponsorisé jusqu'au " + expStr + " !");
  };

  const removeUrgent = async (postId) => {
    await supabase.from("posts").update({ urgent: false, urgent_until: null }).eq("id", postId);
    setPosts(p => p.map(x => x.id === postId ? { ...x, urgent: false, urgentUntil: null } : x));
    notify("🔥 Badge Urgent retiré ✅");
  };

  const removeUrgentShop = async (itemId, table, setter) => {
    await supabase.from(table).update({ urgent: false, urgent_until: null, urgent_activated_at: null }).eq("id", itemId);
    setter(prev => prev.map(x => x.id === itemId ? { ...x, urgent: false, urgentUntil: null, urgentActivatedAt: null } : x));
    notify("🔥 Badge Urgent retiré ✅");
  };

  const [showScrollTop, setShowScrollTop] = useState(false);
  const recoverySessionRef = React.useRef(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pwaPrompt, setPwaPrompt] = useState(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);
  const [adForm, setAdForm] = useState({ entreprise:"", slogan:"", logo_url:"", lien:"", couleur1:"#6C63FF", couleur2:"#8B84FF", fin:"" });
  const [adSaving, setAdSaving] = useState(false);
  const [adEditing, setAdEditing] = useState(null);
  const [showAdForm, setShowAdForm] = useState(false);
  const [expandedContacts, setExpandedContacts] = useState({}); // postId -> boolean
  const [contactDrawer, setContactDrawer] = useState(null);
  const [showWaTooltip, setShowWaTooltip] = useState(() => !localStorage.getItem("mdr_wa_tooltip_shown"));
  const [liveViewers, setLiveViewers] = useState({}); // postId -> count // post object for drawer on PC/tablet

  // Fermeture automatique du panneau contact au scroll
  React.useEffect(() => {
    if (Object.keys(expandedContacts).length === 0) return;
    const handleScroll = () => {
      const openId = Object.keys(expandedContacts)[0];
      const el = document.getElementById("contact-panel-" + openId);
      if (!el) { setExpandedContacts({}); return; }
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > window.innerHeight + 100) {
        setExpandedContacts({});
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [expandedContacts]);
  const contactTimerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mf_notifs") || "[]"); }
    catch { return []; }
  });
  const [showNotifs, setShowNotifs] = useState(false);

  // Le panneau notifs se ferme via son propre overlay — pas besoin d'écouter le document

  // SEO dynamique — titre de page selon l'annonce/vue active
  React.useEffect(() => {
    if (modal?.data?.title) {
      document.title = `${modal.data.title} — MarchéduRoi`;
      // Meta OG dynamique
      let ogTitle = document.querySelector('meta[property="og:title"]');
      let ogDesc = document.querySelector('meta[property="og:description"]');
      let ogImg = document.querySelector('meta[property="og:image"]');
      if (ogTitle) ogTitle.setAttribute("content", `${modal.data.title} | MarchéduRoi`);
      if (ogDesc) ogDesc.setAttribute("content", modal.data.description?.slice(0,160)||"MarchéduRoi — Petites annonces Bénin & Afrique");
      if (ogImg && modal.data.photos?.[0]) ogImg.setAttribute("content", modal.data.photos[0]);
    } else if (modal?.data?.name) {
      document.title = `${modal.data.name} — MarchéduRoi`;
    } else {
      document.title = "MarcheduRoi — Petites Annonces Bénin & Afrique";
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", "MarcheduRoi — Annonces, Boutiques & Services au Bénin");
    }
  }, [modal]);

  const addNotification = (msg, type="info", postId=null) => {
    const newNotif = { id:Date.now(), msg, type, postId, date:new Date().toISOString().slice(0,10), read:false };
    setNotifications(n => {
      const updated = [newNotif, ...n].slice(0, 20);
      localStorage.setItem("mf_notifs", JSON.stringify(updated));
      return updated;
    });
  };

  const markAllRead = () => {
    setNotifications(n => {
      const updated = n.map(x=>({...x,read:true}));
      localStorage.setItem("mf_notifs", JSON.stringify(updated));
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem("mf_notifs", "[]");
  };
  const [sortByDistance, setSortByDistance] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const nextId = useRef(100);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Ne pas fermer si on clique sur la cloche elle-même
      if (e.target.closest && e.target.closest('[data-notif-btn]')) return;
      setShowNotifs(false);
      setExpandedContacts({});
    };
    document.addEventListener("click", handleClickOutside);
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    const handleOnline = () => { setIsOnline(true); notify("Connexion rétablie ! ✅"); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    // Charger le script Turnstile
    window.onTurnstileSuccess = (token) => {
      // On stocke le token dans une variable globale temporaire
      window._turnstileToken = token;
      document.dispatchEvent(new CustomEvent("turnstile-success", { detail: token }));
    };
    // Charger Turnstile une seule fois
    if (!document.querySelector('script[src*="turnstile"]')) {
      const ts = document.createElement("script");
      ts.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      ts.async = true;
      ts.defer = true;
      document.head.appendChild(ts);
    }
    }
    // PWA install prompt
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setPwaPrompt(e);
      const dismissed = localStorage.getItem("mdr_pwa_dismissed");
      if (!dismissed) setShowPwaBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    // Bouton Retour mobile — restaurer la vue précédente
    const handlePopState = (e) => {
      if (e.state?.view) {
        setViewState(e.state.view);
        window.scrollTo(0, 0);
      } else {
        setViewState("home");
      }
      // Fermer les menus ouverts
      setShowMoreMenu(false);
      setShowPublishMenu(false);
      setModal(null);
    };
    window.addEventListener("popstate", handlePopState);

    // Initialiser l'historique avec la vue de départ
    if (!history.state?.view) {
      history.replaceState({ view: "landing" }, "", window.location.pathname);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1||!lon1||!lat2||!lon2) return null;
    const R = 6371;
    const dLat = (lat2-lat1)*Math.PI/180;
    const dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  };

  const formatDistance = (km) => {
    if (km === null || km === undefined) return null;
    if (km < 1) return Math.round(km*1000)+" m";
    return km.toFixed(1)+" km";
  };

  const getUserLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortByDistance(true);
        setLocationLoading(false);
        notify("Position detectee ! Resultats tries par distance");
      },
      () => { notify("Impossible d acces a votre position","error"); setLocationLoading(false); }
    );
  };

  const theme = BACKGROUNDS.find(b=>b.id===themeId)||BACKGROUNDS[0];
  useEffect(() => { localStorage.setItem("mf_theme", themeId); }, [themeId]);

  const notify = (msg, type="success") => { setNotification({msg,type}); setTimeout(()=>setNotification(null),3000); };

  // Seed aléatoire unique par session — mélange les annonces différemment pour chaque visiteur
  const [sessionSeed] = React.useState(() => Math.random());
  const shufflePosts = (arr) => {
    const seeded = [...arr].map((item, i) => ({ item, sort: (sessionSeed * (i + 1) * 9301 + 49297) % 233280 }));
    seeded.sort((a, b) => a.sort - b.sort);
    return seeded.map(x => x.item);
  };

  useEffect(() => {
    // Restaurer scroll si on revient d'une fiche
    const returnView = sessionStorage.getItem("mdr_back_view");
    const scrollPos = sessionStorage.getItem("mdr_scroll_pos");
    if (returnView) {
      sessionStorage.removeItem("mdr_back_view");
      if (scrollPos) {
        sessionStorage.removeItem("mdr_scroll_pos");
        requestAnimationFrame(() => requestAnimationFrame(() => {
          window.scrollTo({ top: parseInt(scrollPos), behavior: "instant" });
        }));
      }
    }
    // Forcer la page d'accueil à chaque rechargement (sauf retour depuis fiche ou lien partagé)
    const hasOgPost = new URLSearchParams(window.location.search).get("mdr_post");
    if (!hasOgPost && !returnView && window.location.pathname === "/") {
      setViewState("landing");
    }
    if (window.location.pathname === "/reset-password") {
      setViewState("reset-password");
      // Lire params depuis sessionStorage (capturés avant React dans index.html)
      const savedParams = sessionStorage.getItem("mdr_reset_params") || "";
      const params = new URLSearchParams(savedParams);
      const token = params.get("token");
      const email = params.get("email");
      if (token && email) {
        sessionStorage.removeItem("mdr_reset_params");
        supabase.auth.verifyOtp({ email, token, type: "recovery" })
          .then(({ data, error }) => {
            if (error) {
              console.error("verifyOtp error:", error);
            } else if (data?.session) {
              recoverySessionRef.current = data.session;
              console.log("Session recovery OK ✅");
            }
          });
      }
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle()
          .then(({ data }) => {
            if (data) {
            setUser({ id:session.user.id, name:data.name, role:data.role||"user" });
            localStorage.setItem("mdr_user_role", data.role||"user");
          }
          });
      }
    });

    // Ouvrir l'annonce partagée — stockée dans sessionStorage par og.js
    const postFromSession = sessionStorage.getItem("mdr_open_post");
    const srcFromSession = sessionStorage.getItem("mdr_open_src") || "posts";
    if (postFromSession) {
      sessionStorage.removeItem("mdr_open_post");
      sessionStorage.removeItem("mdr_open_src");
      // Mapper la source vers le chemin de route
      const srcRouteMap = {
        posts: null,           // annonces classiques → scroll dans le fil
        boutiques: "boutique",
        ateliers: "atelier",
        restos: "resto",
        beaute: "beaute",
      };
      const routePath = srcRouteMap[srcFromSession];
      if (routePath) {
        // Établissement → naviguer directement sur la fiche dédiée
        setTimeout(() => navigate("/" + routePath + "/" + postFromSession, { replace: true }), 0);
      } else {
        // Annonce classique → scroll dans le fil
        setView("home");
        setExpandedContacts({ [postFromSession]: true });
        setTimeout(() => {
          const el = document.getElementById("post-" + postFromSession);
          if (el) {
            blockAutoPlay(5000); // Bloquer l'autoplay 5s après le scroll
            el.scrollIntoView({ behavior:"smooth", block:"center" });
          }
        }, 800);
      }
    }
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) { setUser(null); localStorage.removeItem("mdr_user_role"); return; }
      if (event === "PASSWORD_RECOVERY") {
        setViewState("reset-password");
        recoverySessionRef.current = session;
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        if (window.location.pathname === "/reset-password") return;
        setTimeout(() => {
          supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle()
            .then(({ data }) => {
              if (data) {
                setUser({ id:session.user.id, name:data.name, role:data.role||"user", emailConfirmed:true });
                localStorage.setItem("mdr_user_role", data.role||"user");
                setView("home");
                if (event === "USER_UPDATED") notify("✅ Email confirmé ! Bienvenue sur MarchéduRoi 🎉");
              }
            });
        }, 500);
      }
    });
  }, []);

  // WhatsApp tooltip — affiché une seule fois dans la vie de l'utilisateur

  // Compteur visiteurs temps réel basé sur les vues
  React.useEffect(() => {
    const updateViewers = () => {
      const viewers = {};
      posts.filter(p=>(p.views||0)>5).slice(0,10).forEach(p => {
        const base = Math.min(Math.floor((p.views||0) / 10), 12);
        if (base > 0) viewers[p.id] = base + Math.floor(Math.random() * 3);
      });
      setLiveViewers(viewers);
    };
    updateViewers();
    const interval = setInterval(updateViewers, 30000);
    return () => clearInterval(interval);
  }, [posts]);

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email:authForm.email, password:authForm.password });
    if (error) {
      // Vérifier si l'email existe dans la base
      const { count } = await supabase.from("profiles").select("email", {count:"exact", head:true}).eq("email", authForm.email.toLowerCase().trim());
      if (count === 0) {
        setLoginError("unknown_email");
      } else {
        setLoginError("wrong_password");
      }
      return;
    }
    setLoginError(null);

    // Bloquer si email non confirmé
    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      notify("📧 Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte mail.", "error");
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id",data.user.id).maybeSingle();
    if (profile) {
      setUser({ id:data.user.id, name:profile.name, role:profile.role||"user", emailConfirmed:true });
    } else {
      // Récupérer le vrai nom depuis les métadonnées Supabase Auth si disponible
      const realName = data.user.user_metadata?.name || data.user.email.split("@")[0];
      await supabase.from("profiles").insert({ id:data.user.id, name:realName, role:"user", country:"BJ", email:data.user.email.toLowerCase() });
      setUser({ id:data.user.id, name:realName, role:"user" });
    }
    const pendingRef = localStorage.getItem("mdr_ref");
    if (pendingRef && pendingRef !== data.user.id) {
      await processReferral(pendingRef, data.user.id);
      localStorage.removeItem("mdr_ref");
    }
    setView("home"); notify("Bienvenue !");
    addNotification("Bienvenue sur MarchéduRoi ! Vos notifications apparaissent ici.", "info");
  };

const PHONE_REGEX = {
  BJ: /^\+229\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}$/,
  TG: /^\+228\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}$/,
  CI: /^\+225\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}$/,
  SN: /^\+221\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}$/,
  ML: /^\+223\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}$/,
  BF: /^\+226\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}$/,
  NE: /^\+227\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}$/,
  GN: /^\+224\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}$/,
  NG: /^\+234\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{4}$/,
  CM: /^\+237\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}$/,
  CG: /^\+242\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{4}$/,
  CD: /^\+243\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}$/,
  GA: /^\+241\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}$/,
  MG: /^\+261\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{2}$/,
  RW: /^\+250\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}$/,
  BI: /^\+257\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{4}$/,
  TD: /^\+235\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}$/,
  MR: /^\+222\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}$/,
  FR: /^\+33\s?[0-9]\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}$/,
  BE: /^\+32\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}\s?[0-9]{2}$/,
  CH: /^\+41\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}$/,
  CA: /^\+1\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{4}$/,
};
const PHONE_EXAMPLE = {
  BJ:"+229 01 23 45 67 89",TG:"+228 90 12 34 56",CI:"+225 01 23 45 67 89",
  SN:"+221 77 123 45 67",ML:"+223 76 12 34 56",BF:"+226 70 12 34 56",
  NE:"+227 96 12 34 56",GN:"+224 622 123 456",NG:"+234 801 234 5678",
  CM:"+237 677 123 456",CG:"+242 06 123 4567",CD:"+243 812 345 678",
  GA:"+241 07 12 34 56",MG:"+261 32 123 45 67",RW:"+250 788 123 456",
  BI:"+257 79 123456",TD:"+235 66 12 34 56",MR:"+222 22 12 34 56",
  FR:"+33 6 12 34 56 78",BE:"+32 470 12 34 56",CH:"+41 76 123 45 67",
  CA:"+1 514 123 4567",
};

  const register = async () => {
    if (!authForm.name||!authForm.email||!authForm.password||!authForm.phone) { notify("Tous les champs sont obligatoires","error"); return; }
    if (!turnstileToken) { notify("Veuillez compléter la vérification de sécurité","error"); return; }
    if (authForm.password.length < 6) { notify("Le mot de passe doit faire au moins 6 caractères","error"); return; }
    const phoneRx = PHONE_REGEX[authForm.country];
    if (phoneRx && !phoneRx.test(authForm.phone.trim())) {
      notify("Numéro invalide pour ce pays — ex: "+(PHONE_EXAMPLE[authForm.country]||"+XXX XX XX XX XX"), "error"); return;
    }

    const refFromUrl = new URLSearchParams(window.location.search).get("ref");
    if (refFromUrl) localStorage.setItem("mdr_ref", refFromUrl);

    const { data, error } = await supabase.auth.signUp({
      email: authForm.email,
      password: authForm.password,
      options: {
        emailRedirectTo: "https://marcheduroi.com",
        data: { name: authForm.name }
      }
    });
    if (error) {
      const msg = error.message||"";
      if (msg.includes("already registered") || msg.includes("already been registered") || msg.includes("User already")) {
        notify("📧 Vous êtes déjà inscrit avec cet email. Connectez-vous ou réinitialisez votre mot de passe.", "error");
        setTimeout(() => setAuthMode("login"), 1200);
      } else {
        notify("Erreur : "+msg, "error");
      }
      return;
    }
    if (!data.user) { notify("Erreur lors de la création du compte","error"); return; }

    // Créer le profil
    await supabase.from("profiles").insert({ id:data.user.id, name:authForm.name, role:"user", country:authForm.country||"BJ", phone:authForm.phone||null, email:authForm.email.toLowerCase().trim() });

    // NE PAS connecter l'utilisateur — attendre confirmation email
    setTurnstileToken("");
    const emailSent = authForm.email;
    setAuthForm({ email:"",password:"",name:"",country:"BJ" });
    setView("login");
    setModal({ type:"emailConfirmation", email: emailSent });
  };

  // ─── SYSTÈME DE PARRAINAGE ───────────────────────────────────────────────────
  const processReferral = async (referrerId, referredId) => {
    // Éviter les doublons
    const { data: existing } = await supabase
      .from("referrals")
      .select("id")
      .eq("referrer_id", referrerId)
      .eq("referred_id", referredId)
      .single();
    if (existing) return;

    // Enregistrer le parrainage
    await supabase.from("referrals").insert({
      referrer_id: referrerId,
      referred_id: referredId,
      confirmed: true,
    });

    // Compter les parrainages du parrain
    const { data: refs } = await supabase
      .from("referrals")
      .select("id")
      .eq("referrer_id", referrerId)
      .eq("confirmed", true);

    const count = refs?.length || 0;

    // Mettre à jour le compteur en temps réel
    setReferralStats(s => ({ ...s, count }));

    // Récompense tous les 10 parrainages
    if (count % 10 === 0) {
      await supabase.from("credits").insert({
        user_id: referrerId,
        months: 1,
        reason: `Parrainage — ${count} filleuls confirmés`,
        used: false,
      });
      // Notifier le parrain
      await supabase.from("notifications").insert({
        user_id: referrerId,
        message: `🎁 Félicitations ! Vous avez parrainé ${count} personnes. 1 mois gratuit crédité sur votre compte !`,
        type: "success",
        date: new Date().toISOString(),
      }).catch(()=>{});
    }
  };

  // Récupérer les stats de parrainage d'un utilisateur
  const [referralStats, setReferralStats] = useState({ count:0, credits:0, saved:0 });

  useEffect(() => {
    if (!user) return;
    const loadReferralStats = async () => {
      const { data: refs } = await supabase
        .from("referrals")
        .select("id")
        .eq("referrer_id", user.id)
        .eq("confirmed", true);
      const { data: creds } = await supabase
        .from("credits")
        .select("months, used")
        .eq("user_id", user.id);
      const count = refs?.length || 0;
      const totalCredits = creds?.reduce((a,c) => a + (c.used ? 0 : c.months), 0) || 0;
      const usedCredits = creds?.reduce((a,c) => a + (c.used ? c.months : 0), 0) || 0;
      setReferralStats({
        count,
        credits: totalCredits,
        saved: usedCredits * 1500,
      });
    };
    loadReferralStats();
  }, [user]);

  // Utiliser un crédit disponible avant de payer
  const useCredit = async () => {
    const { data: cred } = await supabase
      .from("credits")
      .select("id, months")
      .eq("user_id", user.id)
      .eq("used", false)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();
    if (!cred) return false;
    await supabase.from("credits").update({ used: true }).eq("id", cred.id);
    setReferralStats(s => ({ ...s, credits: Math.max(0, s.credits - 1), saved: s.saved + 1500 }));
    return true;
  };

  // ─────────────────────────────────────────────────────────────────────────────

  // ─── VALIDATION & SANITISATION DES CHAMPS ────────────────────────────────────
  const onlyDigits     = v => v.replace(/[^0-9]/g, "");
  const onlyYear       = v => v.replace(/[^0-9]/g, "").slice(0, 4);
  const onlyPhone      = v => v.replace(/[^0-9+\s\-()]/g, "").slice(0, 20);
  const onlyPrice      = v => v.replace(/[^0-9\s.,FCFA]/gi, "").slice(0, 30);
  const onlyAlpha      = v => v.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, "");
  const onlyAlphaNum   = v => v.replace(/[^a-zA-ZÀ-ÿ0-9\s\-'.,()]/g, "");
  const onlyEmail      = v => v.replace(/\s/g, "").toLowerCase();
  const maxLen         = (v, n) => v.slice(0, n);
  const cleanText      = (v, n=200) => maxLen(v.replace(/[<>{}[\]\\]/g, ""), n);
  const cleanLongText  = (v, n=1000) => maxLen(v.replace(/[<>{}[\]\\]/g, ""), n);
  const noSpaces       = v => v.replace(/\s/g, "");
  // Normalisation pour la recherche : supprime les accents et met en minuscules
  const normalizeText  = v => (v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Séparateur de milliers automatique : "15000" → "15 000"
  const formatThousands = v => {
    const digits = v.replace(/[^0-9]/g, "");
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const logout = async () => { await supabase.auth.signOut(); setUser(null); setView("home"); notify("À bientôt !"); };

  const updatePassword = async () => {
    if (!newPassword || newPassword.length < 6) { notify("Mot de passe trop court (min. 6 caractères)","error"); return; }
    // Utiliser la session stockée lors de PASSWORD_RECOVERY ou verifyOtp
    let session = recoverySessionRef.current;
    if (!session) {
      const { data } = await supabase.auth.getSession();
      session = data?.session;
    }
    if (!session) {
      notify("Session expirée. Veuillez cliquer à nouveau sur le lien reçu par email.", "error");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { notify("Erreur : " + error.message, "error"); return; }
    recoverySessionRef.current = null;
    notify("✅ Mot de passe mis à jour avec succès !");
    setNewPassword("");
    setIsResetMode(false);
    window.location.hash = "";
    setView("login");
  };

  const resetPassword = async (email) => {
    if (!email) { notify("Entrez votre email","error"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://marcheduroi.com/reset-password",
    });
    if (error) { notify("Erreur : "+error.message,"error"); return; }
    notify("Email de réinitialisation envoyé ! Vérifiez votre boîte mail 📧");
    setModal(null);
  };
  const canEdit = user !== null;
  const isVehicle = (postForm.category === "Véhicules" || postForm.category === "Location de véhicules");
  const isAgro = postForm.category === "Agro-alimentaire";
  const isMoto    = postForm.category === "Motos & Tricycles";

  // ─── GRILLE TARIFAIRE ────────────────────────────────────────────────────────
  // Annonces classiques : publication gratuite et illimitée
  // Monétisation uniquement via le Sponsoring
  const TARIFS_ANNONCE = []; // conservé pour compatibilité édition
  // Tarifs de lancement (valables jusqu'à fin juin 2026 — anciens: 2500/6000/10000/18000)
  const TARIFS_BOUTIQUE = [
    { label:"30 jours",  days:30,  price:1500  },
    { label:"90 jours",  days:90,  price:3500  },
    { label:"180 jours", days:180, price:6000  },
    { label:"360 jours", days:360, price:10000 },
  ];

  // 4 jours gratuits par mois — vérifie si l'utilisateur a déjà utilisé son crédit ce mois
  // Publication gratuite pour tous — plus de limite mensuelle (annonces classiques)
  const canPublishFree = async () => true;
  const useFreeDay = async () => {}; // no-op

  // 4 jours gratuits par mois pour les établissements (boutiques/ateliers/restos/beauté)
  const canPublishFreeShop = async () => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const month = new Date().toISOString().slice(0,7);
    const { data } = await supabase.from("free_days").select("shop_used").eq("user_id", user.id).eq("month", month).maybeSingle();
    return !data || !data.shop_used;
  };
  const useFreeShop = async () => {
    const month = new Date().toISOString().slice(0,7);
    const { data } = await supabase.from("free_days").select("shop_used").eq("user_id", user.id).eq("month", month).maybeSingle();
    if (data) {
      await supabase.from("free_days").update({ shop_used: true }).eq("user_id", user.id).eq("month", month);
    } else {
      await supabase.from("free_days").insert({ user_id: user.id, month, shop_used: true, used: 0 });
    }
  };
  const [canFree, setCanFree] = useState(true);
  const [canFreeShop, setCanFreeShop] = useState(false);
  useEffect(() => {
    if (user) canPublishFreeShop().then(setCanFreeShop);
  }, [user]);

  // Recharger les adRequests à chaque ouverture du dashboard admin
  useEffect(() => {
    if (view === "dashboard" && user?.role === "admin") {
      supabase.from("ad_requests").select("*").order("created_at", { ascending: false })
        .then(({ data }) => { if (data) setAdRequests(data); });
    }
  }, [view]);

  // Restaurer la vue et le scroll au retour depuis une fiche détail
  // Utilise un événement custom pour éviter tout conflit avec React Router
  useEffect(() => {
    const handler = (e) => {
      const { view: rv, scrollPos: sp } = e.detail;
      setViewState(rv);
      setModal(null);
      if (sp) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          window.scrollTo({ top: parseInt(sp), behavior: "instant" });
        }));
      }
    };
    window.addEventListener("mdr_restore_view", handler);
    return () => window.removeEventListener("mdr_restore_view", handler);
  }, []);
  // ─────────────────────────────────────────────────────────────────────────────

  // ─── FEDAPAY : Paiement avant publication ───────────────────────────────────
  const FEDAPAY_PUBLIC_KEY = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || "pk_sandbox_VOTRE_CLE_ICI";
  const FLUTTERWAVE_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-VOTRE_CLE_ICI-X";

  // Devises par pays pour Flutterwave
  const COUNTRY_CURRENCY = {
    BJ:"XOF", TG:"XOF", BF:"XOF", ML:"XOF", SN:"XOF", CI:"XOF", NE:"XOF", GN:"XOF",
    CM:"XAF", CG:"XAF", GA:"XAF", TD:"XAF",
    NG:"NGN", CD:"CDF", MG:"MGA", RW:"RWF", BI:"BIF", MR:"MRU",
  };

  // Taux de conversion approximatifs vers XOF (base)
  const XOF_RATES = {
    XOF:1, XAF:1, NGN:0.54, CDF:0.00018, MGA:0.11, RWF:0.38, BIF:0.28, MRU:10.8,
  };

  // Pays couverts par FedaPay (zone UEMOA + Guinée)
  const FEDAPAY_COUNTRIES = ["BJ","TG","BF","ML","SN","CI","NE","GN"];


  // ── SÉCURITÉ ─────────────────────────────────────────────────────────────────
  const BLACKLIST = [
    "arnaque","arnaquer","escroquerie","western union","moneygram","mandat",
    "avance","acompte","fraude","frauduleux","piratage","hacking","virus",
    "gratuit argent","gagner de l argent","investissement garanti",
    "doubler argent","crypto facile","bitcoin gratuit","loterie","gain assuré",
    "transfert urgent","heritage","succession","ambassade","fonctionnaire étranger",
    "scam","phishing","faux","contrefaçon"
  ];

  const checkBlacklist = (text) => {
    const normalized = (text||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    return BLACKLIST.some(word => normalized.includes(word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")));
  };

  const checkRateLimit = () => {
    if (user?.role === "admin") return true;
    const key = "mdr_pub_" + user?.id;
    const now = Date.now();
    const hour = 3600000;
    try {
      const data = JSON.parse(localStorage.getItem(key) || "[]");
      const recent = data.filter(t => now - t < hour);
      if (recent.length >= 5) {
        notify("⚠️ Limite atteinte — max 5 publications par heure. Réessayez plus tard.", "error");
        return false;
      }
      recent.push(now);
      localStorage.setItem(key, JSON.stringify(recent));
      return true;
    } catch { return true; }
  };

  // Formater un prix XOF en devise locale + USD
  const formatPriceLocal = (amountXOF) => {
    const country = getUserCountry();
    const currency = COUNTRY_CURRENCY[country] || "XOF";
    const usdRate = 610; // 1 USD ≈ 610 XOF
    const usd = (amountXOF / usdRate).toFixed(2);
    if (currency === "XOF" || currency === "XAF") {
      return `${amountXOF.toLocaleString()} FCFA (~${usd} USD)`;
    }
    const rate = XOF_RATES[currency] || 1;
    const local = Math.round(amountXOF / rate);
    return `${local.toLocaleString()} ${currency} (~${usd} USD)`;
  };
  // ─────────────────────────────────────────────────────────────────────────────

  // Pays détecté automatiquement via IP
  const [detectedCountry, setDetectedCountry] = useState("BJ");
  const [showAllCountries, setShowAllCountries] = useState(false);

  // Rotation automatique des pubs toutes les 8 secondes
  useEffect(() => {
    if (ads.length <= 1 || adPaused) return;
    const timer = setInterval(() => {
      setAdIndex(i => (i + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ads, adPaused]);

  useEffect(() => {
    fetch("https://cloudflare.com/cdn-cgi/trace")
      .then(r => r.text())
      .then(text => {
        const match = text.match(/loc=([A-Z]{2})/);
        const code = match ? match[1] : "BJ";
        setDetectedCountry(code);
        localStorage.setItem("mdr_country", code);
      })
      .catch(() => { setDetectedCountry("BJ"); localStorage.setItem("mdr_country","BJ"); });
  }, []);

  // Convertir un montant XOF vers la devise locale
  const convertAmount = (amountXOF, currency) => {
    const rate = XOF_RATES[currency] || 1;
    return Math.round(amountXOF / rate);
  };

  // Retourne le pays actif — profil utilisateur prioritaire, sinon IP
  const getUserCountry = () => user?.country || detectedCountry;

  const handleFlutterwavePayment = (amountXOF, description, onSuccess) => {
    if (user?.role === "admin") { onSuccess(); return; }
    const country = getUserCountry();
    const currency = COUNTRY_CURRENCY[country] || "XOF";
    const amount = convertAmount(amountXOF, currency);

    // Charger le script Flutterwave dynamiquement si pas encore chargé
    const doPayment = () => {
      const FlutterwaveCheckout = window.FlutterwaveCheckout;
      if (!FlutterwaveCheckout) {
        notify("Module de paiement non chargé. Rechargez la page.", "error");
        return;
      }
      FlutterwaveCheckout({
        public_key: FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: `MDR-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        amount,
        currency,
        payment_options: "mobilemoney,card,ussd",
        customer: {
          email: user?.email || "",
          name: user?.name || "Client MarchéduRoi",
        },
        customizations: {
          title: "MarchéduRoi",
          description,
          logo: "https://marcheduroi.com/marcheduRoi-icon.svg",
        },
        callback: (response) => {
          if (response.status === "successful" || response.status === "completed") {
            notify("✅ Paiement confirmé ! Publication en cours...");
            onSuccess();
          } else {
            notify("Paiement échoué. Réessayez ou contactez le support.", "error");
          }
        },
        onclose: () => {
          notify("Paiement annulé — votre annonce n'a pas été publiée.", "error");
        },
      });
    };

    if (!window.FlutterwaveCheckout) {
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.onload = doPayment;
      document.head.appendChild(script);
    } else {
      doPayment();
    }
  };

  // Gestionnaire universel — vérifie d'abord les crédits parrainage, sinon FedaPay ou Flutterwave
  const handlePayment = async (amountXOF, description, onSuccess, cible=null) => {
    if (user?.role === "admin") { onSuccess(); return; }
    // Appliquer la promo si disponible
    const { prixFinal } = cible ? applyPromo(amountXOF, cible) : { prixFinal: amountXOF };
    const montant = prixFinal;
    // Vérifier si l'utilisateur a un crédit parrainage disponible
    const creditUsed = await useCredit();
    if (creditUsed) {
      notify("🎁 Crédit parrainage utilisé — Publication gratuite !");
      onSuccess();
      return;
    }
    // Sinon paiement selon le pays détecté
    const country = getUserCountry();
    if (FEDAPAY_COUNTRIES.includes(country)) {
      handleFedaPayment(montant, description, onSuccess);
    } else {
      handleFlutterwavePayment(montant, description, onSuccess);
    }
  };

  const handleFedaPayment = (amount, description, onSuccess) => {
    if (user?.role === "admin") { onSuccess(); return; } // admins publient gratuitement
    const FedaPay = window["FedaPay"];
    if (!FedaPay) {
      notify("Le module de paiement n'est pas chargé. Rechargez la page.", "error");
      return;
    }
    FedaPay.init({
      public_key: FEDAPAY_PUBLIC_KEY,
      transaction: {
        amount: amount,
        description: description,
      },
      currency: { iso: "XOF" },
      customer: {
        email: user?.email || "",
        lastname: user?.name || "Client MarchéduRoi",
      },
      onComplete(resp) {
        console.log("FedaPay response:", JSON.stringify(resp));
        const reason = resp.reason || "";
        const isDismissed = reason === FedaPay.DIALOG_DISMISSED || reason === "dialog_dismissed" || reason === "dismissed";
        const isApproved = reason === FedaPay.TRANSACTION_APPROVED
          || reason === "approved"
          || reason === "transaction_approved"
          || reason === "CHECKOUT COMPLETE"
          || reason === "checkout_complete"
          || (resp.transaction && (resp.transaction.status === "approved" || resp.transaction.status === "Approved"));
        if (isDismissed) {
          notify("Paiement annulé — votre annonce n'a pas été publiée.", "error");
        } else if (isApproved) {
          notify("✅ Paiement confirmé ! Publication en cours...");
          onSuccess();
        } else {
          // En cas de doute, vérifier le statut de la transaction
          if (resp.transaction && resp.transaction.id) {
            notify("✅ Paiement reçu ! Publication en cours...");
            onSuccess();
          } else {
            notify("Paiement échoué. Réessayez ou contactez le support.", "error");
          }
        }
      }
    }).open();
  };
  // ────────────────────────────────────────────────────────────────────────────

  const [months, setMonths] = useState(1);
  const [selectedTarif, setSelectedTarif] = useState(0); // index dans TARIFS_ANNONCE ou TARIFS_BOUTIQUE
  const [promoForm, setPromoForm] = useState({ title:"", description:"", price:"" });
  const [promoPhotos, setPromoPhotos] = useState([]);
  const [recrutTab, setRecrutTab] = useState("offres"); // "offres" | "cvs"
  const [offreForm, setOffreForm] = useState({ entreprise:"", poste:"", description:"", salaire:"", localisation:"", contact:"", phone:"" });
  const [cvForm, setCvForm] = useState({ nom:"", poste:"", competences:"", experience:"", disponibilite:"", localisation:"", contact:"", phone:"" });
  const [selectedTarifOffre, setSelectedTarifOffre] = useState(0);
  const TARIFS_OFFRE = [
    { label:"30 jours", days:30, price:1500 },
    { label:"90 jours", days:90, price:3500 },
  ];

  // Vérifier les nouvelles demandes toutes les 5 minutes
  useEffect(() => {
    const checkNewDemandes = async () => {
      try {
        const lastVisit = localStorage.getItem('mdr_demandes_last_visit') || new Date(0).toISOString();
        const res = await fetch(
          `https://mvkcgrextvxlzkqsyscm.supabase.co/rest/v1/demandes?created_at=gt.${encodeURIComponent(lastVisit)}&select=id,title,category,ville&order=created_at.desc&limit=3`,
          { headers: { 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12a2NncmV4dHZ4bHprcXN5c2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjIwNDcsImV4cCI6MjA4ODc5ODA0N30.dvVbB0E5F-vhZMYlzIl4r-N1jOrRgrNZsp4xbDI_Nho' } }
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setHasNewDemandes(true);
          // Créer une notification locale pour chaque nouvelle demande
          data.forEach(d => {
            addNotification(`📢 Nouvelle demande : ${d.title} — ${d.ville}`, "demande");
          });
        }
      } catch(e) {}
    };
    checkNewDemandes();
    const interval = setInterval(checkNewDemandes, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

  // Valider le formulaire AVANT de lancer le paiement
  const validatePostForm = () => {
    if (!postForm.title?.trim()) { notify("Le titre est requis","error"); return false; }
    if (!postForm.description?.trim()) { notify("La description est requise","error"); return false; }
    if (isVehicle && !vehicleForm.marque) { notify("La marque du véhicule est requise","error"); return false; }
    if (isMoto && !vehicleForm.marque) { notify("La marque de la moto est requise","error"); return false; }
    if (postForm.category === "Location de véhicules" && !postForm.priceDay) { notify("Le prix par jour est requis pour la location","error"); return false; }
    if (checkBlacklist(postForm.title) || checkBlacklist(postForm.description)) {
      notify("⚠️ Votre annonce contient des termes non autorisés.","error"); return false;
    }
    if (!checkRateLimit()) return false;
    return true;
  };

  const addPost = async (expiresAt) => {
    // Validation déjà faite avant le paiement — on garde juste une vérif de sécurité
    if (!postForm.title?.trim()||!postForm.description?.trim()) { notify("Titre et description requis","error"); return; }
    const isAdmin = user.role === "admin";
    const postId = "post_" + Date.now();
    const isLocation = postForm.category === "Location de véhicules";
    const isAgroPost = postForm.category === "Agro-alimentaire";
    const newPost = {
      ...postForm,
      id: postId,
      author: user.name,
      authorId: user.id,
      date: new Date().toISOString().slice(0,10),
      likes: 0,
      photos: postPhotos,
      video: postVideo||null,
      vehicle: isVehicle ? vehicleForm : isMoto ? { ...vehicleForm, _isMoto: true } : null,
      immo: postForm.category==="Immobilier" ? immoForm : null,
      agro: isAgroPost ? {...agroForm} : null,
      expiresAt: isAdmin ? null : (expiresAt || null),
      price: isLocation ? (postForm.priceDay ? postForm.priceDay+" FCFA/jour" : postForm.price||"") : postForm.price||"",
    };
    const { error } = await supabase.from("posts").insert({
      id: postId,
      title: newPost.title,
      category: newPost.category,
      description: newPost.description,
      price: newPost.price || "",
      contact: newPost.contact || "",
      phone: newPost.phone || "",
      author: newPost.author,
      author_id: newPost.authorId,
      date: newPost.date,
      photos: newPost.photos || [],
      vehicle: newPost.vehicle || null,
      immo: newPost.immo || null,
      lat: newPost.lat || null,
      lng: newPost.lng || null,
      expires_at: newPost.expiresAt || null,
      likes: 0,
      price_day: postForm.priceDay || null,
      price_week: postForm.priceWeek || null,
      price_month: postForm.priceMonth || null,
      agro: isAgroPost ? {...agroForm} : null,
    });
    if (error) { console.error("Supabase error:", error); notify("Erreur de sauvegarde","error"); return; }
    setPosts(p=>[newPost,...p]);
    setModal(null);
    setPostForm({ title:"",category:"Autre",description:"",price:"",priceDay:"",priceWeek:"",priceMonth:"",contact:"",phone:getPhonePrefix(),lat:"",lng:"" });
    setAgroForm({ sousCategorie:"", quantite:"", unite:"sac de 50 kg", prixUnitaire:"", qualite:"Standard / Grade B", disponibilite:"Toute l'année", lieuEnlevement:"", saisonRecolte:"" });
    setPostPhotos([]); setPostVideo(""); setVehicleForm({}); setImmoForm({ sousType:"Maison",transaction:"Vente",superficie:"",pieces:"",titre:"",ville:"",quartier:"",von:"",eau:"Oui",electricite:"Oui",etat:"Bon état",recasee:"",autres:"" }); setMonths(1); setSelectedTarif(0);
    notify(isAdmin ? "✅ Annonce publiée !" : expiresAt ? `✅ Annonce publiée jusqu'au ${expiresAt} !` : "✅ Annonce publiée !");
    if (!isAdmin) setThankYou({
      type: "annonce",
      title: "Votre annonce est en ligne !",
      details: expiresAt ? `Visible jusqu'au ${expiresAt}` : "Publication gratuite et illimitée",
      nextStep: "Partagez votre annonce sur WhatsApp pour plus de visibilité.",
    });
  };

  const editPost = async () => {
    const basePost = posts.find(p=>p.id===modal.data.id) || modal.data;
    const updatedPost = {...basePost,...postForm,photos:postPhotos,video:postVideo||null,vehicle:isVehicle?vehicleForm:null};
    const { error, data } = await supabase.from("posts").update({
      title: updatedPost.title,
      category: updatedPost.category,
      description: updatedPost.description,
      price: updatedPost.price || "",
      contact: updatedPost.contact || "",
      phone: updatedPost.phone || "",
      photos: updatedPost.photos || [],
      video: updatedPost.video || null,
      vehicle: updatedPost.vehicle || null,
      lat: updatedPost.lat || null,
      lng: updatedPost.lng || null,
      immo: updatedPost.category==="Immobilier" ? immoForm : (updatedPost.immo || null),
    }).eq("id", modal.data.id).select();
    if (error) {
      console.error("Erreur modification:", error);
      notify("Erreur lors de la modification : " + error.message, "error");
      return;
    }
    if (!data || data.length === 0) {
      notify("Annonce introuvable dans la base de données", "error");
      return;
    }
    setPosts(p=>p.map(post=>post.id===modal.data.id?updatedPost:post));
    setModal(null);
    notify("✅ Annonce modifiée avec succès !");
    setTimeout(() => loadPosts(), 500);
  };

  const deletePost = async (id) => {
    const post = posts.find(p => p.id === id);
    // Supprimer les photos du Storage
    if (post?.photos?.length > 0) {
      const paths = post.photos
        .filter(url => url.includes("/storage/v1/object/public/photos/"))
        .map(url => url.split("/storage/v1/object/public/photos/")[1]);
      if (paths.length > 0) await supabase.storage.from("photos").remove(paths).catch(()=>{});
    }
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) { console.error("Delete error:", error); notify("Erreur suppression : " + error.message, "error"); return; }
    setPosts(p=>p.filter(post=>post.id!==id));
    setModal(null);
    notify("✅ Annonce supprimée.");
  };

  const likePost = async (id) => {
    if (!user) { notify("Connectez-vous pour liker","error"); return; }
    if (likedPosts.includes(id)) { notify("Vous avez déjà aimé cette publication","error"); return; }
    const updated = [...likedPosts, id];
    setLikedPosts(updated);
    localStorage.setItem("mf_liked", JSON.stringify(updated));
    // Update in all sections
    const updateLikes = arr => arr.map(x => x.id===id ? {...x, likes:(x.likes||0)+1} : x);
    setPosts(updateLikes);
    setBoutiques(updateLikes);
    setAteliers(updateLikes);
    setRestos(updateLikes);
    setBeaute(updateLikes);
    // Save to Supabase - try each table
    let saved = false;
    for (const table of ["posts","boutiques","ateliers","restos","beaute"]) {
      const { data } = await supabase.from(table).select("likes").eq("id",id).single();
      if (data) {
        const { error } = await supabase.from(table).update({ likes: (data.likes||0)+1 }).eq("id",id);
        if (error) console.error("Erreur like:", error);
        saved = true;
        break;
      }
    }
    if (!saved) console.warn("Like non sauvegardé pour id:", id);
  };


  const editShop = async () => {
    const id = modal.data?.id;
    if (!id) { notify("Identifiant manquant","error"); return; }
    // Déterminer la table depuis l'ID ou le shopMode
    const tableMap = {boutique:"boutiques", atelier:"ateliers", ateliers:"ateliers", resto:"restos", restos:"restos", beaute:"beaute"};
    const tableName = tableMap[shopMode] || (id.startsWith("boutique")?"boutiques":id.startsWith("atelier")?"ateliers":id.startsWith("resto")?"restos":id.startsWith("beaute")?"beaute":"boutiques");
    const { error } = await supabase.from(tableName).update({
      name: shopForm.name, type: shopForm.type||"", sous_type: shopForm.sousType||"",
      description: shopForm.description, services: shopForm.services||"",
      keywords: shopForm.keywords||"", ville: shopForm.ville||"",
      quartier: shopForm.quartier||"", von: shopForm.von||"",
      horaires: shopForm.horaires||"", contact: shopForm.contact||"",
      phone: shopForm.phone||"", photos: shopPhotos||[], video: shopVideo||null,
      lat: shopForm.lat||null, lng: shopForm.lng||null,
      specialite: shopForm.specialite||"", tarifs: shopForm.tarifs||"",
    }).eq("id", id);
    if (error) { notify("Erreur : "+error.message,"error"); return; }
    const updated = {...modal.data,...shopForm,sousType:shopForm.sousType,photos:shopPhotos,video:shopVideo};
    if (tableName==="boutiques") setBoutiques(b=>b.map(x=>x.id===id?updated:x));
    else if (tableName==="ateliers") setAteliers(a=>a.map(x=>x.id===id?updated:x));
    else if (tableName==="restos") setRestos(r=>r.map(x=>x.id===id?updated:x));
    else if (tableName==="beaute") setBeaute(b=>b.map(x=>x.id===id?updated:x));
    setModal(null);
    setShopForm({name:"",type:"",sousType:"",description:"",services:"",keywords:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:getPhonePrefix()});
    setShopPhotos([]); setShopVideo(null);
    notify("✅ Modification appliquée !");
  };

  const editResto = async () => {
    const id = modal.data?.id;
    if (!id) return;
    const { error } = await supabase.from("restos").update({
      name: shopForm.name, type: shopForm.type||"",
      description: shopForm.description, services: shopForm.services||"",
      keywords: shopForm.keywords||"", ville: shopForm.ville||"",
      quartier: shopForm.quartier||"", von: shopForm.von||"",
      horaires: shopForm.horaires||"", contact: shopForm.contact||"",
      phone: shopForm.phone||"", photos: shopPhotos||[], video: shopVideo||null,
      lat: shopForm.lat||null, lng: shopForm.lng||null,
      specialite: shopForm.specialite||"",
    }).eq("id", id);
    if (error) { notify("Erreur : "+error.message,"error"); return; }
    setRestos(r=>r.map(x=>x.id===id?{...x,...shopForm,photos:shopPhotos,video:shopVideo}:x));
    setModal(null);
    setShopForm({name:"",type:"",description:"",services:"",keywords:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:getPhonePrefix()});
    setShopPhotos([]); setShopVideo(null);
    notify("✅ Modification appliquée !");
  };

  const editBeaute = async () => {
    const id = modal.data?.id;
    if (!id) return;
    const { error } = await supabase.from("beaute").update({
      name: shopForm.name, type: shopForm.type||"",
      description: shopForm.description, services: shopForm.services||"",
      keywords: shopForm.keywords||"", ville: shopForm.ville||"",
      quartier: shopForm.quartier||"", von: shopForm.von||"",
      horaires: shopForm.horaires||"", contact: shopForm.contact||"",
      phone: shopForm.phone||"", photos: shopPhotos||[], video: shopVideo||null,
      lat: shopForm.lat||null, lng: shopForm.lng||null,
      specialite: shopForm.specialite||"", tarifs: shopForm.tarifs||"",
    }).eq("id", id);
    if (error) { notify("Erreur : "+error.message,"error"); return; }
    setBeaute(b=>b.map(x=>x.id===id?{...x,...shopForm,photos:shopPhotos,video:shopVideo}:x));
    setModal(null);
    setShopForm({name:"",type:"",description:"",services:"",keywords:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:getPhonePrefix()});
    setShopPhotos([]); setShopVideo(null);
    notify("✅ Modification appliquée !");
  };

  const openEditShop = (item, shopType, editFn) => {
    // Admin can always modify for free
    const isAdmin = user?.role === "admin";
    const isFree = isAdmin || canModifyFree(item);

    const doOpenModal = () => {

      setShopMode(shopType==="boutique"?"boutique":shopType==="atelier"?"atelier":shopType);
      setShopForm({
        name:item.name||"", type:item.type||"", sousType:item.sousType||item.sous_type||"",
        description:item.description||"",
        services:item.services||"", keywords:item.keywords||"",
        ville:item.ville||"", quartier:item.quartier||"", von:item.von||"",
        horaires:item.horaires||"", contact:item.contact||"", phone:item.phone||"",
        specialite:item.specialite||"", tarifs:item.tarifs||"",

        lat:item.lat||"", lng:item.lng||""
      });
      setShopPhotos(item.photos||[]);
      setShopVideo(item.video||null);
      const modalType = shopType==="resto"?"addresto":shopType==="beaute"?"addbeaute":"addshop";
      setModal({type:modalType, data:{...item, editing:true}});
    };

    if (isFree) {
      doOpenModal();
      return;
    }
    // Paid modification
    const count = getModifCount(item.id);
    if (count >= MAX_MODIFS) {
      notify(`Limite de ${MAX_MODIFS} modifications payantes atteinte ce mois-ci`, "error");
      return;
    }
    setModal({
      type: "confirmEditShop",
      data: item,
      shopType,
      editFn,
      price: MODIF_PRICES.pro,
      count,
      doOpenModal
    });
  };

  const openEdit = (post) => {
    // Admin peut modifier sans restriction
    if (user?.role === "admin") {
      setPostForm({ title:post.title, category:post.category, description:post.description, price:post.price||"", contact:post.contact||"", phone:post.phone||"" });
      setPostPhotos(post.photos||[]);
      setPostVideo(post.video||"");
      setVehicleForm(post.vehicle||{});
      if (post.immo) setImmoForm({...{ sousType:"Maison",transaction:"Vente",superficie:"",pieces:"",titre:"",ville:"",quartier:"",von:"",eau:"Oui",electricite:"Oui",etat:"Bon état",recasee:"",autres:"" },...post.immo});
      setModal({ type:"edit", data:post });
      return;
    }
    setPostForm({ title:post.title, category:post.category, description:post.description, price:post.price||"", contact:post.contact||"", phone:post.phone||"" });
    setPostPhotos(post.photos||[]);
    setPostVideo(post.video||"");
    setVehicleForm(post.vehicle||{});
    if (post.immo) setImmoForm({...{ sousType:"Maison",transaction:"Vente",superficie:"",pieces:"",titre:"",ville:"",quartier:"",von:"",eau:"Oui",electricite:"Oui",etat:"Bon état",recasee:"",autres:"" },...post.immo});
    setModal({ type:"edit", data:post });
  };

  const submitSuggestion = () => {
    if (!suggestionText.trim()) { notify("Écrivez votre suggestion","error"); return; }
    setSuggestions(s=>[{ id:Date.now(), text:suggestionText, author:suggestionName||"Visiteur anonyme", date:new Date().toISOString().slice(0,10), status:"en attente" },...s]);
    setSuggestionText(""); setSuggestionName(""); setModal(null); notify("Merci pour votre suggestion !");
  };

  const addBeaute = async (forcedExpiresAt) => {
    if (checkBlacklist(shopForm.name) || checkBlacklist(shopForm.description)) { notify("⚠️ Votre annonce contient des termes non autorisés.", "error"); return; }
    if (!checkRateLimit()) return;
    if (!shopForm.name||!shopForm.description) { notify("Nom et description requis","error"); return; }
    const isAdmin = user.role === "admin";
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + months);
    const beauteId = "beau_" + Date.now();
    const newBeaute = {
      ...shopForm,
      id: beauteId,
      author: user.name, authorId: user.id,
      date: new Date().toISOString().slice(0,10),
      likes: 0, photos: shopPhotos, video: shopVideo,
      expiresAt: isAdmin ? null : (forcedExpiresAt || expDate.toISOString().slice(0,10)),
    };
    const { error } = await supabase.from("beaute").insert({
      id: beauteId, name: newBeaute.name, type: newBeaute.type||"",
      description: newBeaute.description, specialite: newBeaute.specialite||"",
      services: newBeaute.services||"", tarifs: newBeaute.tarifs||"",
      keywords: newBeaute.keywords||"", ville: newBeaute.ville||"",
      quartier: newBeaute.quartier||"", von: newBeaute.von||"",
      horaires: newBeaute.horaires||"", contact: newBeaute.contact||"",
      phone: newBeaute.phone||"", photos: newBeaute.photos||[],
      video: newBeaute.video||null, lat: newBeaute.lat||null, lng: newBeaute.lng||null,
      author: newBeaute.author, author_id: newBeaute.authorId,
      date: newBeaute.date, likes: 0, expires_at: newBeaute.expiresAt||null,
    });
    if (error) { console.error(error); notify("Erreur de sauvegarde","error"); return; }
    setBeaute(b=>[newBeaute,...b]);
    setModal(null);
    setShopForm({ name:"",type:"",description:"",services:"",keywords:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:getPhonePrefix() });
    setShopPhotos([]); setShopVideo(null); setMonths(1);
    notify("Salon publié !");
  };

  const addResto = async (forcedExpiresAt) => {
    if (checkBlacklist(shopForm.name) || checkBlacklist(shopForm.description)) { notify("⚠️ Votre annonce contient des termes non autorisés.", "error"); return; }
    if (!checkRateLimit()) return;
    if (!shopForm.name||!shopForm.description) { notify("Nom et description requis","error"); return; }
    const isAdmin = user.role === "admin";
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + months);
    const restoId = "resto_" + Date.now();
    const newResto = {
      ...shopForm,
      id: restoId,
      author: user.name, authorId: user.id,
      date: new Date().toISOString().slice(0,10),
      likes: 0, photos: shopPhotos, video: shopVideo,
      expiresAt: isAdmin ? null : (forcedExpiresAt || expDate.toISOString().slice(0,10)),
    };
    const { error } = await supabase.from("restos").insert({
      id: restoId, name: newResto.name, type: newResto.type||"",
      description: newResto.description, specialite: newResto.specialite||"",
      plats: newResto.plats||"", services: newResto.services||"",
      keywords: newResto.keywords||"", ville: newResto.ville||"",
      quartier: newResto.quartier||"", von: newResto.von||"",
      horaires: newResto.horaires||"", contact: newResto.contact||"",
      phone: newResto.phone||"", photos: newResto.photos||[],
      video: newResto.video||null, lat: newResto.lat||null, lng: newResto.lng||null,
      author: newResto.author, author_id: newResto.authorId,
      date: newResto.date, likes: 0, expires_at: newResto.expiresAt||null,
    });
    if (error) { console.error("Supabase error:", error); notify("Erreur de sauvegarde","error"); return; }
    setRestos(r=>[newResto,...r]);
    setModal(null);
    setShopForm({ name:"",type:"",description:"",services:"",keywords:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:getPhonePrefix() });
    setShopPhotos([]); setShopVideo(null); setMonths(1);
    notify("Restaurant/Bar publié !");
  };

  const addShop = async (forcedExpiresAt) => {
    if (checkBlacklist(shopForm.name) || checkBlacklist(shopForm.description)) { notify("⚠️ Votre annonce contient des termes non autorisés.", "error"); return; }
    if (!checkRateLimit()) return;
    if (!shopForm.name||!shopForm.description) { notify("Nom et description requis","error"); return; }
    const isAdmin = user.role === "admin";
    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + months);
    const shopId = shopMode + "_" + Date.now();
    const newShop = {
      ...shopForm,
      id: shopId,
      author: user.name, authorId: user.id,
      date: new Date().toISOString().slice(0,10),
      likes: 0, photos: shopPhotos, video: shopVideo,
      expiresAt: isAdmin ? null : (forcedExpiresAt || expDate.toISOString().slice(0,10)),
    };
    const tableName = shopMode === "boutique" ? "boutiques" : "ateliers";
    const { error } = await supabase.from(tableName).insert({
      id: shopId, name: newShop.name, type: newShop.type||"", sous_type: newShop.sousType||"",
      description: newShop.description, services: newShop.services||"",
      keywords: newShop.keywords||"", ville: newShop.ville||"",
      quartier: newShop.quartier||"", von: newShop.von||"",
      horaires: newShop.horaires||"", contact: newShop.contact||"",
      phone: newShop.phone||"", photos: newShop.photos||[],
      video: newShop.video||null, lat: newShop.lat||null, lng: newShop.lng||null,
      author: newShop.author, author_id: newShop.authorId,
      date: newShop.date, likes: 0,
      expires_at: newShop.expiresAt||null,
    });
    if (error) { console.error("Supabase error:", error); notify("Erreur de sauvegarde","error"); return; }
    if (shopMode==="boutique") setBoutiques(b=>[newShop,...b]);
    else setAteliers(a=>[newShop,...a]);
    setModal(null);
    setShopForm({ name:"",type:"",description:"",services:"",keywords:"",ville:"",quartier:"",von:"",horaires:"",contact:"",phone:getPhonePrefix() });
    setShopPhotos([]); setShopVideo(null); setMonths(1);
    notify(shopMode==="boutique" ? "Boutique publiée !" : "Atelier publié !");
    if (!isAdmin) setThankYou({
      type: "etablissement",
      title: shopMode==="boutique" ? "Votre boutique est en ligne !" : "Votre atelier est en ligne !",
      details: "Visible dans la section dédiée de MarchéduRoi.",
      nextStep: "Partagez le lien de votre établissement sur WhatsApp et Facebook.",
    });
  };

  // Publication Promo/Nouveauté depuis un établissement (500 FCFA)
  const addPromo = async (establishment, establishmentType) => {
    if (!promoForm.title?.trim()||!promoForm.description?.trim()) {
      notify("Titre et description requis","error"); return;
    }
    const postId = "post_" + Date.now();
    const newPost = {
      id: postId,
      title: promoForm.title,
      description: promoForm.description,
      price: promoForm.price || "",
      category: "Promo & Nouveauté",
      contact: establishment.name,
      phone: establishment.phone || "",
      ville: establishment.ville || "",
      quartier: establishment.quartier || "",
      author: establishment.name,
      authorId: user.id,
      date: new Date().toISOString().slice(0,10),
      photos: promoPhotos,
      expiresAt: null,
      fromEstablishment: { id: establishment.id, name: establishment.name, type: establishmentType },
    };
    const { error } = await supabase.from("posts").insert({
      id: postId, title: newPost.title, description: newPost.description,
      price: newPost.price, category: newPost.category,
      contact: newPost.contact, phone: newPost.phone,
      ville: newPost.ville, quartier: newPost.quartier,
      author: newPost.author, author_id: newPost.authorId,
      date: newPost.date, photos: newPost.photos, expires_at: null,
      from_establishment: JSON.stringify(newPost.fromEstablishment),
    });
    if (error) { notify("Erreur : "+error.message,"error"); return; }
    setPosts(p=>[newPost,...p]);
    setModal(null);
    setPromoForm({ title:"", description:"", price:"" });
    setPromoPhotos([]);
    notify("📣 Promo publiée dans les annonces !");
  };

  // Publier une offre d'emploi (payant)
  const addOffre = async (expiresAt) => {
    if (!offreForm.poste?.trim()||!offreForm.description?.trim()||!offreForm.entreprise?.trim()) {
      notify("Entreprise, poste et description requis","error"); return;
    }
    const postId = "offre_" + Date.now();
    const exp = expiresAt || (() => { const d=new Date(); d.setDate(d.getDate()+30); return d.toISOString().slice(0,10); })();
    const newOffre = {
      id: postId, title: offreForm.poste, description: offreForm.description,
      price: offreForm.salaire||"", category: "Offre d'emploi",
      contact: offreForm.entreprise, phone: offreForm.phone||"",
      ville: offreForm.localisation||"", quartier:"",
      author: offreForm.entreprise, authorId: user.id,
      date: new Date().toISOString().slice(0,10), photos:[], expiresAt: exp,
      recrutType:"offre", entreprise: offreForm.entreprise,
    };
    const { error } = await supabase.from("posts").insert({
      id:postId, title:newOffre.title, description:newOffre.description,
      price:newOffre.price, category:newOffre.category,
      contact:newOffre.contact, phone:newOffre.phone,
      ville:newOffre.ville, author:newOffre.author,
      author_id:user.id, date:newOffre.date, photos:[],
      expires_at:exp, from_establishment:JSON.stringify({recrutType:"offre",entreprise:offreForm.entreprise}),
    });
    if (error) { notify("Erreur : "+error.message,"error"); return; }
    setPosts(p=>[newOffre,...p]);
    setModal(null);
    setOffreForm({ entreprise:"",poste:"",description:"",salaire:"",localisation:"",contact:"",phone:"" });
    notify("✅ Offre d'emploi publiée !");
    if (!isAdmin) setThankYou({
      type: "emploi",
      title: "Votre offre d'emploi est publiée !",
      details: "Elle est visible dans la section Recrutement.",
      nextStep: "Partagez-la pour recevoir des candidatures rapidement.",
    });
  };

  // Publier un profil CV (gratuit)
  const addCV = async () => {
    if (!cvForm.nom?.trim()||!cvForm.poste?.trim()||!cvForm.competences?.trim()) {
      notify("Nom, poste recherché et compétences requis","error"); return;
    }
    const postId = "cv_" + Date.now();
    const newCV = {
      id:postId, title:cvForm.poste+" — "+cvForm.nom,
      description:`${cvForm.competences}

Expérience : ${cvForm.experience||"Non précisée"}
Disponibilité : ${cvForm.disponibilite||"Immédiate"}`,
      price:"", category:"Profil CV",
      contact:cvForm.nom, phone:cvForm.phone||"",
      ville:cvForm.localisation||"", author:cvForm.nom,
      authorId:user.id, date:new Date().toISOString().slice(0,10),
      photos:[], expiresAt:null, recrutType:"cv",
    };
    const { error } = await supabase.from("posts").insert({
      id:postId, title:newCV.title, description:newCV.description,
      price:"", category:"Profil CV", contact:newCV.contact,
      phone:newCV.phone, ville:newCV.ville, author:newCV.author,
      author_id:user.id, date:newCV.date, photos:[], expires_at:null,
      from_establishment:JSON.stringify({recrutType:"cv"}),
    });
    if (error) { notify("Erreur : "+error.message,"error"); return; }
    setPosts(p=>[newCV,...p]);
    setModal(null);
    setCvForm({ nom:"",poste:"",competences:"",experience:"",disponibilite:"",localisation:"",contact:"",phone:"" });
    notify("✅ Profil publié dans la section Recrutement !");
  };

  const userCountry = getUserCountry();
  const filteredBase = posts.filter(p=>{
    if (p.expired) return false;
    if (category!=="Toutes" && p.category!==category) return false;
    if (search && !normalizeText(p.title).includes(normalizeText(search)) && !normalizeText(p.description).includes(normalizeText(search))) return false;
    // Filtre ville
    if (filterVille.trim()) {
      const villeP = normalizeText([p.ville, p.immo?.ville, p.vehicle?.position].filter(Boolean).join(" "));
      if (!villeP.includes(normalizeText(filterVille.trim()))) return false;
    }
    // Filtre date
    if (filterDate && p.created_at) {
      const days = filterDate === "7j" ? 7 : filterDate === "30j" ? 30 : 90;
      const limit = new Date(); limit.setDate(limit.getDate() - days);
      if (new Date(p.created_at) < limit) return false;
    }
    if (priceMin || priceMax) {
      const rawPrice = (p.price||"").replace(/[^0-9]/g,"");
      const numPrice = parseInt(rawPrice);
      if (rawPrice) {
        if (priceMin && numPrice < parseInt(priceMin)) return false;
        if (priceMax && numPrice > parseInt(priceMax)) return false;
      }
    }
    // Filtre par pays — si pas showAllCountries et pays détecté
    if (!showAllCountries && userCountry && !search) {
      const postCountry = p.country || p.immo?.pays || "";
      // Si l'annonce a un pays défini et différent → exclure
      if (postCountry && postCountry !== userCountry) return false;
    }
    return true;
  }).map(p=>({
    ...p,
    distance: userLocation && p.lat && p.lng ? getDistance(userLocation.lat, userLocation.lng, parseFloat(p.lat), parseFloat(p.lng)) : null
  }));

  // Urgent actif = dans le carousel ET dans le fil principal (avec bordure rouge)
  const isUrgentActive = (p) => p.urgent && p.urgentUntil && new Date(p.urgentUntil) > new Date();
  const filtered = (() => {
    // Ordre : urgent+sponsorisé > sponsorisé > urgent > normal
    const urgentSponsored = filteredBase.filter(p => isUrgentActive(p) && p.sponsored);
    const sponsoredOnly   = filteredBase.filter(p => p.sponsored && !isUrgentActive(p));
    const urgentOnly      = filteredBase.filter(p => isUrgentActive(p) && !p.sponsored);
    const normal          = filteredBase.filter(p => !p.sponsored && !isUrgentActive(p));
    if (sortByDistance) {
      const all = [...urgentSponsored, ...sponsoredOnly, ...urgentOnly, ...normal];
      return [...all.filter(p=>p.distance!==null).sort((a,b)=>a.distance-b.distance), ...all.filter(p=>p.distance===null)];
    }
    return [...shufflePosts(urgentSponsored), ...shufflePosts(sponsoredOnly), ...shufflePosts(urgentOnly), ...shufflePosts(normal)];
  })();

  // Recherche globale — toutes les sections (boutiques, ateliers, restos, beauté)
  const globalSearch = search.trim().length > 1 ? [
    ...boutiques.filter(b=> normalizeText([b.name,b.description,b.type,b.services,b.ville].filter(Boolean).join(" ")).includes(normalizeText(search))).map(b=>({...b,_type:"boutique",_label:"🛍️ Boutique"})),
    ...ateliers.filter(a=> normalizeText([a.name,a.description,a.type,a.services,a.ville].filter(Boolean).join(" ")).includes(normalizeText(search))).map(a=>({...a,_type:"atelier",_label:"🔧 Atelier"})),
    ...restos.filter(r=> normalizeText([r.name,r.description,r.type,r.plats,r.ville].filter(Boolean).join(" ")).includes(normalizeText(search))).map(r=>({...r,_type:"resto",_label:"🍽️ Resto & Bar"})),
    ...beaute.filter(b=> normalizeText([b.name,b.description,b.type,b.services,b.ville].filter(Boolean).join(" ")).includes(normalizeText(search))).map(b=>({...b,_type:"beaute",_label:"💇 Beauté"})),
  ] : [];

  const myPosts = user?posts.filter(p=>p.authorId===user.id):[];

  const inputStyle = { width:"100%",padding:"12px 16px",background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:10,color:theme.text,fontSize:14,fontFamily:"inherit" };
  const cardStyle = { background:theme.card, border:`1px solid ${theme.border}` };

  return (
    <div onContextMenu={e=>{ if(["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) return; e.preventDefault(); }} style={{ minHeight:"100vh",width:"100%",maxWidth:"100vw",background:theme.bg,color:theme.text,fontFamily:"'Sora','Segoe UI',sans-serif",overflowX:"hidden",boxSizing:"border-box",position:"relative" }}>

      {/* ---- Page Merci après paiement ---- */}
      {thankYou && (
        <div style={{ position:"fixed",inset:0,zIndex:9998,background:theme.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"Sora,sans-serif" }}>
          <div style={{ maxWidth:460,width:"100%",textAlign:"center" }}>
            <div style={{ fontSize:72,marginBottom:20 }}>
              {thankYou.type==="annonce"?"📢":thankYou.type==="etablissement"?"🏪":thankYou.type==="emploi"?"💼":"🎉"}
            </div>
            <h1 style={{ fontSize:26,fontWeight:800,color:theme.text,marginBottom:12 }}>{thankYou.title}</h1>
            <div style={{ background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:16,padding:20,marginBottom:24 }}>
              <p style={{ color:"#10B981",fontWeight:700,margin:"0 0 8px",fontSize:15 }}>✅ Paiement confirmé</p>
              <p style={{ color:theme.sub,margin:"0 0 8px",fontSize:14 }}>{thankYou.details}</p>
              {thankYou.nextStep && <p style={{ color:theme.sub,margin:0,fontSize:13,lineHeight:1.7,borderTop:`1px solid rgba(16,185,129,0.15)`,paddingTop:10,marginTop:10 }}>💡 {thankYou.nextStep}</p>}
            </div>
            <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" }}>
              <button onClick={()=>setThankYou(null)}
                style={{ background:"linear-gradient(135deg,#10B981,#059669)",border:"none",color:"#fff",padding:"13px 32px",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer" }}>
                Continuer sur MarchéduRoi →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filigrane MarchéduRoi */}
      <div aria-hidden="true" style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden" }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mdr-watermark" x="0" y="0" width="280" height="180" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
              <image href="/marcheduRoi-icon.svg" x="85" y="8" width="36" height="32" opacity="0.055"/>
              <text x="50" y="80" fontFamily="Sora,sans-serif" fontSize="16" fontWeight="700" fill="currentColor" opacity="0.045" letterSpacing="1">MarchéduRoi</text>
              <text x="60" y="100" fontFamily="Sora,sans-serif" fontSize="10" fontWeight="400" fill="currentColor" opacity="0.03" letterSpacing="0.5">marcheduroi.com</text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mdr-watermark)"/>
        </svg>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{width:100%;min-height:100vh;overflow-x:hidden;}
        #root,#app{width:100%;min-height:100vh;display:flex;flex-direction:column;}
        ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-thumb{background:#2A2D45;border-radius:3px;}
        input,textarea,select{outline:none;font-family:inherit;}
        button{cursor:pointer;font-family:inherit;}
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        .skeleton{background:linear-gradient(90deg,${theme.border} 25%,${theme.card} 50%,${theme.border} 75%);background-size:800px 100%;animation:shimmer 1.5s infinite linear;border-radius:8px;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes notifIn{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.85;transform:scale(1.05)}}
        @keyframes goldGlow{0%,100%{box-shadow:0 0 8px rgba(255,215,0,0.6),0 0 20px rgba(255,215,0,0.3),0 4px 24px rgba(255,215,0,0.25)}50%{box-shadow:0 0 16px rgba(255,215,0,0.9),0 0 36px rgba(255,215,0,0.5),0 4px 32px rgba(255,215,0,0.4)}}
        @keyframes urgentGlow{0%,100%{box-shadow:0 0 8px rgba(255,71,87,0.6),0 0 20px rgba(255,71,87,0.3),0 4px 24px rgba(255,71,87,0.2)}50%{box-shadow:0 0 18px rgba(255,71,87,0.9),0 0 40px rgba(255,71,87,0.5),0 4px 32px rgba(255,71,87,0.35)}}
        @keyframes carouselRTL{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes slideFromRight{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes carouselLTR{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
        .carousel-rtl{animation:carouselRTL 30s linear infinite;}
        .carousel-ltr{animation:carouselLTR 30s linear infinite;}
        .carousel-paused{animation-play-state:paused!important;}
        .card-sponsored{animation:goldGlow 2.5s ease-in-out infinite!important;border:2px solid #FFD700!important;}
        .card-urgent{animation:urgentGlow 1.8s ease-in-out infinite!important;border:2px solid #FF4757!important;}
        @keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
        .card-hover{transition:transform 0.25s ease,box-shadow 0.25s ease;}
        .card-hover:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(108,99,255,0.18)!important;}
        .btn-glow:hover{box-shadow:0 0 24px rgba(108,99,255,0.5);}
        .tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;}
        .bg-opt{transition:transform 0.15s;cursor:pointer;} .bg-opt:hover{transform:scale(1.08);}
        /* RESPONSIVE MOBILE & TABLETTE */
        @media(max-width:600px){
          .desktop-only{display:none!important;}
          .page-content{padding:8px!important;}
          .admin-row{flex-direction:column!important;align-items:flex-start!important;gap:8px!important;}
          .modal-inner{width:96vw!important;max-width:96vw!important;padding:16px!important;}
          .hero-title{font-size:26px!important;line-height:1.2!important;}
      @keyframes demandePulse{0%,100%{box-shadow:0 0 0 0 rgba(255,140,0,0.7)}50%{box-shadow:0 0 0 8px rgba(255,140,0,0)}}
      .btn-tooltip{position:relative;}
      .btn-tooltip::after{content:attr(data-tooltip);position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:5px 12px;border-radius:8px;font-size:12px;font-weight:700;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity 0.2s;}
      .btn-tooltip:hover::after{opacity:1;}
      .demande-pulse{animation:demandePulse 1.5s ease-in-out infinite;}
          .section-title{font-size:28px!important;}
          nav{padding:0 8px!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;}
          nav::-webkit-scrollbar{display:none!important;}
          nav button{padding:6px 8px!important;font-size:11px!important;white-space:nowrap!important;flex-shrink:0!important;}
          nav a{flex-shrink:0!important;}
        }
        @media(max-width:480px){
          .page-content{padding:8px!important;}
          .hero-title{font-size:20px!important;}
          .modal-inner{padding:12px!important;}
        }
      `}</style>

      {/* PANNEAU MESSAGERIE */}

      {/* TIROIR CONTACT — PC et tablette */}
      {contactDrawer && windowWidth > 600 && (
        <div onClick={()=>setContactDrawer(null)}
          style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:500,backdropFilter:"blur(2px)" }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ position:"fixed",right:0,top:0,bottom:0,width:Math.min(420,window.innerWidth*0.9),background:theme.card,boxShadow:"-20px 0 60px rgba(0,0,0,0.3)",display:"flex",flexDirection:"column",zIndex:501,overflowY:"auto",animation:"slideInRight 0.25s ease" }}>
            {/* Header */}
            <div style={{ padding:"20px 20px 16px",borderBottom:`1px solid ${theme.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,position:"sticky",top:0,background:theme.card,zIndex:1 }}>
              <div style={{ flex:1,minWidth:0 }}>
                <h3 style={{ fontWeight:800,fontSize:17,color:theme.text,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{contactDrawer.title}</h3>
                {contactDrawer.price && <p style={{ color:"#43C6AC",fontWeight:700,fontSize:15 }}>{contactDrawer.price} FCFA</p>}
              </div>
              <button onClick={()=>setContactDrawer(null)} style={{ background:"transparent",border:"none",color:theme.sub,cursor:"pointer",padding:8,flexShrink:0 }}><Icon name="x" size={22}/></button>
            </div>
            {/* Photo */}
            {contactDrawer.photos?.[0] && (
              <img src={contactDrawer.photos[0]} alt="" style={{ width:"100%",maxHeight:200,objectFit:"cover",flexShrink:0 }}/>
            )}
            {/* Content */}
            <div style={{ padding:"16px 20px",flex:1 }}>
              {/* Tags véhicule/immo */}
              {contactDrawer.vehicle && (
                <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:12 }}>
                  {[contactDrawer.vehicle.marque,contactDrawer.vehicle.modele,contactDrawer.vehicle.annee,contactDrawer.vehicle.carburant].filter(Boolean).map((v,i)=>(
                    <span key={i} className="tag" style={{ background:theme.bg,border:`1px solid ${theme.border}`,color:theme.sub }}>{v}</span>
                  ))}
                </div>
              )}
              {contactDrawer.immo && (
                <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:12 }}>
                  {[contactDrawer.immo.transaction,contactDrawer.immo.sousType,contactDrawer.immo.ville].filter(Boolean).map((v,i)=>(
                    <span key={i} className="tag" style={{ background:theme.bg,border:`1px solid ${theme.border}`,color:theme.sub }}>{v}</span>
                  ))}
                </div>
              )}
              {/* Description */}
              <p style={{ color:theme.sub,fontSize:13,lineHeight:1.6,marginBottom:16 }}>{contactDrawer.description}</p>

              {/* J'aime + Favoris + Partage */}
              <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${theme.border}` }}>
                <button onClick={()=>likePost(contactDrawer.id)} style={{ background:likedPosts.includes(contactDrawer.id)?"rgba(255,101,132,0.2)":"rgba(255,101,132,0.08)",border:"1px solid rgba(255,101,132,0.2)",color:likedPosts.includes(contactDrawer.id)?"#FF6584":theme.sub,display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer" }}>
                  <Icon name="heart" size={14}/> {contactDrawer.likes||0}
                </button>
                <button onClick={()=>toggleFavorite(contactDrawer.id)} style={{ background:favorites.includes(contactDrawer.id)?"rgba(255,215,0,0.2)":"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.2)",color:favorites.includes(contactDrawer.id)?"#FFD700":theme.sub,padding:"8px 14px",borderRadius:10,fontSize:16,cursor:"pointer" }}>
                  {favorites.includes(contactDrawer.id)?"★":"☆"}
                </button>
                <a href={"https://wa.me/?text="+encodeURIComponent("*"+contactDrawer.title+"*\nPrix: "+((contactDrawer.price||"Non précisé").toString().includes("FCFA")?(contactDrawer.price||"Non précisé"):(contactDrawer.price||"Non précisé")+" FCFA")+"\nVoir: https://marcheduroi.com/annonce/"+contactDrawer.id+"\n\"Sur MarchéduRoi, vous êtes le Roi du Marché 👑\"")} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                  <div style={{ background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.2)",color:"#25D366",padding:"8px 14px",borderRadius:10,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6,cursor:"pointer" }}>
                    Partager
                  </div>
                </a>
                <button onClick={async()=>{
                    const url="https://marcheduroi.com/annonce/"+contactDrawer.id;
                    const photo = contactDrawer.photos?.[0];
                    if(navigator.share && photo){
                      try {
                        let blob = await addLogoWatermark(photo);
                        if (!blob) { const r = await fetch(photo); blob = await r.blob(); }
                        const file = new File([blob], "annonce.jpg", { type: "image/jpeg" });
                        if(navigator.canShare && navigator.canShare({ files:[file] })){
                          await navigator.share({ title:contactDrawer.title, text:contactDrawer.title+(contactDrawer.price?" — "+contactDrawer.price+" FCFA":"")+".", url, files:[file] });
                          return;
                        }
                      } catch(e){}
                      navigator.share({ title:contactDrawer.title, text:contactDrawer.title+(contactDrawer.price?" — "+contactDrawer.price+" FCFA":"")+" "+url+" Sur MarchéduRoi, vous êtes le Roi du Marché 👑" });
                    } else if(navigator.share){
                      navigator.share({ title:contactDrawer.title, text:contactDrawer.title+(contactDrawer.price?" — "+contactDrawer.price+(String(contactDrawer.price).includes("FCFA")?"":" FCFA"):"")+". "+url+" Sur MarchéduRoi, vous êtes le Roi du Marché", url });
                    } else {
                      navigator.clipboard.writeText(url); notify("Lien copié !");
                    }
                  }} style={{ background:"rgba(108,99,255,0.08)",border:"1px solid rgba(108,99,255,0.2)",color:"#6C63FF",padding:"8px 14px",borderRadius:10,fontSize:13,cursor:"pointer",fontWeight:600 }}>
                  Autres apps
                </button>
              </div>

              {/* Auteur */}
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${theme.border}` }}>
                <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#FF6584)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0 }}>{contactDrawer.author?.[0]||"?"}</div>
                <div>
                  <p style={{ fontSize:13,fontWeight:600,color:theme.text }}>{contactDrawer.author}</p>
                  <p style={{ fontSize:11,color:theme.sub }}>{contactDrawer.date}</p>
                </div>
                {isCertified(contactDrawer.authorId||contactDrawer.author_id) && <CertifiedBadge size={36}/>}
              </div>
              {/* Boutons contact */}
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <button onClick={()=>setModal({type:"contact",data:contactDrawer})} style={{ background:"rgba(67,198,172,0.12)",border:"1px solid rgba(67,198,172,0.3)",color:"#43C6AC",padding:"12px 14px",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8 }}>
                  <Icon name="mail" size={16}/> Envoyer un message
                </button>
                {contactDrawer.phone && (
                  <div style={{ display:"flex",gap:10 }}>
                    <a href={"tel:"+contactDrawer.phone} style={{ flex:1,textDecoration:"none" }}>
                      <div style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"12px 14px",borderRadius:10,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,cursor:"pointer" }}>
                        📞 {contactDrawer.phone}
                      </div>
                    </a>
                    <a href={"https://wa.me/"+contactDrawer.phone.replace(/[\s+()-]/g,"")+"?text="+encodeURIComponent("Bonjour, je suis intéressé(e) par : *"+contactDrawer.title+"*\nLien : https://marcheduroi.com/annonce/"+contactDrawer.id)} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",color:"#25D366",padding:"12px 14px",borderRadius:10,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:6,cursor:"pointer" }}>
                        <svg width="16" height="16" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        WA
                      </div>
                    </a>
                  </div>
                )}
                {contactDrawer.lat && contactDrawer.lng && (
                  <a href={"https://www.google.com/maps/dir/?api=1&destination="+contactDrawer.lat+","+contactDrawer.lng} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                    <div style={{ background:"rgba(66,133,244,0.1)",border:"1px solid rgba(66,133,244,0.3)",color:"#4285F4",padding:"12px 14px",borderRadius:10,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8,cursor:"pointer" }}>
                      🗺️ Itinéraire Google Maps
                    </div>
                  </a>
                )}
                {user && user.id !== (contactDrawer.authorId||contactDrawer.author_id) && (contactDrawer.authorId||contactDrawer.author_id) && (
                  <button onClick={()=>{ const ownerId=contactDrawer.authorId||contactDrawer.author_id; setActiveConv({postId:contactDrawer.id,postTitle:contactDrawer.title,postPrice:contactDrawer.price,postPhoto:contactDrawer.photos?.[0],receiverId:ownerId,receiverName:contactDrawer.author,messages:[]}); setShowMessages(true); setContactDrawer(null); }} style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"12px 14px",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8 }}>
                    💬 Message privé
                  </button>
                )}
                <button onClick={()=>{ setModal({type:"report",data:contactDrawer}); setContactDrawer(null); }} style={{ background:"transparent",border:"none",color:theme.sub,padding:"4px 0",fontSize:12,cursor:"pointer",textAlign:"left" }}>
                  🚩 Signaler cette annonce
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANNEAU PLUS */}
      {showMoreMenu && (
        <div
          onTouchStart={e=>{ if(e.target===e.currentTarget) setShowMoreMenu(false); }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowMoreMenu(false); }}
          style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:500 }}>
          <div style={{ position:"fixed",right:0,top:0,bottom:0,width:Math.min(280,window.innerWidth),background:theme.card,boxShadow:"-20px 0 60px rgba(0,0,0,0.3)",display:"flex",flexDirection:"column",zIndex:501,overflowY:"auto",WebkitOverflowScrolling:"touch",maxHeight:"100vh",paddingBottom:"env(safe-area-inset-bottom,16px)" }}>
            <div style={{ padding:"20px 20px 16px",borderBottom:`1px solid ${theme.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <h3 style={{ fontWeight:800,fontSize:18,color:theme.text }}>Menu</h3>
              <button onTouchEnd={e=>{ e.preventDefault(); setShowMoreMenu(false); }} onClick={()=>setShowMoreMenu(false)} style={{ background:"transparent",border:"none",color:theme.sub,cursor:"pointer",padding:8 }}><Icon name="x" size={20}/></button>
            </div>
            {[
              ...(windowWidth <= 600 ? [
                { label:"📋 "+t.annonces, action:()=>{setView("home");setShowMoreMenu(false);} },
                { label:"💡 "+t.publierAnnonce, action:()=>{setModal({type:"howto"});setShowMoreMenu(false);} },
                ...(user?.role==="admin"?[{ label:"⚙️ "+t.admin, action:()=>{setView("admin");setShowMoreMenu(false);} }]:[]),
                { label:lang==="fr"?"🇬🇧 English":"🇫🇷 Français", action:()=>{ const newLang=lang==="fr"?"en":"fr"; setLang(newLang); localStorage.setItem("mf_lang",newLang); setShowMoreMenu(false); } },
                { label:"🎨 "+t.theme, action:()=>{setShowBgPicker(p=>!p);setShowMoreMenu(false);} },
              ] : []),
              { label:"📢 Tableau de demandes", action:()=>{ window.open("https://marcheduroi.com/demandes","_blank"); setShowMoreMenu(false); } },
              { label:"🏛️ Annuaire VitrineWeb", action:()=>{ setShowMoreMenu(false); navigate("/vitrines"); } },
              { label:"🏛️ Créer ma vitrine", action:()=>{ setShowMoreMenu(false); navigate("/vitrine"); } },
              { label:"📖 Exemples de publications", action:()=>{ window.open("https://marcheduroi.com/exemples.html","_blank"); setShowMoreMenu(false); } },
              { label:"📞 Support WhatsApp", action:()=>{ window.open("https://wa.me/2290140906020","_blank"); setShowMoreMenu(false); } },
              { label:t.stats, action:()=>{setView("stats");setShowMoreMenu(false);} },
              { label:t.parrainage, action:()=>{setView("parrainage");setShowMoreMenu(false);} },
              { label:t.newsletter, action:()=>{setModal({type:"newsletter"});setShowMoreMenu(false);} },
              { label:t.suggestion, action:()=>{setModal({type:"suggestion"});setShowMoreMenu(false);} },
              { label:"⚡ Show Faster", action:()=>{setModal({type:"showFaster"});setShowMoreMenu(false);} },
              { label:t.apropos, action:()=>{setView("about");setShowMoreMenu(false);} },
              { label:t.cgu, action:()=>{setView("terms");setShowMoreMenu(false);} },
            ].map((item,i,arr)=>{
              // Détecter si c'est un scroll ou un tap
              let touchStartY = 0;
              return (
              <button key={item.label}
                onTouchStart={e=>{ touchStartY = e.touches[0].clientY; }}
                onTouchEnd={e=>{
                  const diff = Math.abs(e.changedTouches[0].clientY - touchStartY);
                  if (diff < 8) { e.preventDefault(); e.stopPropagation(); item.action(); }
                }}
                onClick={e=>{ e.stopPropagation(); item.action(); }}
                style={{ width:"100%",padding:"14px 20px",background:"transparent",border:"none",color:theme.text,fontWeight:600,fontSize:14,cursor:"pointer",textAlign:"left",borderBottom:i<arr.length-1?`1px solid ${theme.border}`:"none",WebkitTapHighlightColor:"transparent",touchAction:"pan-y" }}>
                {item.label}
              </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PANNEAU NOTIFICATIONS */}
      {showNotifs && user && (
        <div onClick={()=>setShowNotifs(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:500 }}>
          <div onClick={e=>e.stopPropagation()} style={{ position:"fixed",right:0,top:0,bottom:0,width:Math.min(340,window.innerWidth),background:theme.card,boxShadow:"-20px 0 60px rgba(0,0,0,0.3)",display:"flex",flexDirection:"column",zIndex:501 }}>
            <div style={{ padding:"20px 20px 16px",borderBottom:`1px solid ${theme.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <h3 style={{ fontWeight:800,fontSize:18,color:theme.text }}>🔔 Notifications</h3>
              <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                {notifications.length > 0 && <button onClick={clearNotifications} style={{ background:"none",border:"none",color:theme.sub,fontSize:12,cursor:"pointer",fontWeight:600 }}>Tout effacer</button>}
                <button onClick={()=>setShowNotifs(false)} style={{ background:"transparent",border:"none",color:theme.sub,cursor:"pointer" }}><Icon name="x" size={20}/></button>
              </div>
            </div>
            <div style={{ flex:1,overflowY:"auto" }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign:"center",padding:"48px 16px",color:theme.sub }}>
                  <p style={{ fontSize:32,marginBottom:8 }}>🔔</p>
                  <p style={{ fontSize:14 }}>Aucune notification</p>
                </div>
              ) : notifications.map(n=>(
                <div key={n.id} style={{ padding:"14px 20px",borderBottom:`1px solid ${theme.border}`,background:n.read?theme.card:theme.bg,cursor:"pointer" }} onClick={()=>{ setShowNotifs(false); if(n.type==="demande") window.open("https://marcheduroi.com/demandes","_blank"); }}>
                  <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
                    <span style={{ fontSize:20,flexShrink:0 }}>{n.type==="contact"?"💬":n.type==="view"?"👁️":n.type==="demande"?"📢":"🔔"}</span>
                    <div>
                      <p style={{ fontSize:14,color:theme.text,lineHeight:1.4,marginBottom:2 }}>{n.msg}</p>
                      <p style={{ fontSize:12,color:theme.sub }}>{n.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showMessages && user && (
        <div onClick={()=>setShowMessages(false)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:500 }}>
          <div onClick={e=>e.stopPropagation()} style={{ position:"fixed",right:0,top:0,bottom:0,width:Math.min(420,window.innerWidth),background:theme.card,boxShadow:"-20px 0 60px rgba(0,0,0,0.3)",display:"flex",flexDirection:"column",zIndex:501 }}>
            
            {/* Header */}
            <div style={{ padding:"20px 20px 16px",borderBottom:`1px solid ${theme.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <h3 style={{ fontWeight:800,fontSize:18,color:theme.text }}>💬 Messages</h3>
              <button onClick={()=>{ setShowMessages(false); setActiveConv(null); }} style={{ background:"transparent",border:"none",color:theme.sub,cursor:"pointer" }}><Icon name="x" size={20}/></button>
            </div>

            {!activeConv ? (
              /* Liste des conversations */
              <div style={{ flex:1,overflowY:"auto" }}>
                {conversations.length === 0 ? (
                  <div style={{ textAlign:"center",padding:"60px 20px",color:theme.sub }}>
                    <p style={{ fontSize:40,marginBottom:12 }}>💬</p>
                    <p style={{ fontWeight:600,marginBottom:8 }}>Aucun message</p>
                    <p style={{ fontSize:13 }}>Cliquez sur 💬 sur une annonce pour envoyer un message</p>
                  </div>
                ) : conversations.map(conv=>(
                  <div key={conv.key} onClick={()=>{ setActiveConv(conv); markConvRead(conv); }} style={{ padding:"16px 20px",borderBottom:`1px solid ${theme.border}`,cursor:"pointer",display:"flex",gap:12,alignItems:"center",background:conv.unread>0?`rgba(108,99,255,0.05)`:"transparent" }}>
                    {conv.postPhoto ? <img src={conv.postPhoto} alt="" style={{ width:48,height:48,borderRadius:10,objectFit:"cover",flexShrink:0 }}/> : <div style={{ width:48,height:48,borderRadius:10,background:"rgba(108,99,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>🛍️</div>}
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontWeight:700,color:theme.text,fontSize:13,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{conv.postTitle}</p>
                      <p style={{ color:theme.sub,fontSize:12,marginBottom:2 }}>avec {conv.otherName}</p>
                      <p style={{ color:theme.sub,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{conv.messages[conv.messages.length-1]?.content}</p>
                    </div>
                    {conv.unread > 0 && <span style={{ background:"#6C63FF",color:"#fff",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0 }}>{conv.unread}</span>}
                  </div>
                ))}
              </div>
            ) : (
              /* Conversation active */
              <div style={{ flex:1,display:"flex",flexDirection:"column",minHeight:0 }}>
                {/* Back + annonce */}
                <div style={{ borderBottom:`1px solid ${theme.border}` }}>
                  <button onClick={()=>setActiveConv(null)} style={{ background:"transparent",border:"none",color:"#6C63FF",padding:"12px 20px",fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
                    ← Retour
                  </button>
                  {/* Annonce en haut */}
                  <div style={{ margin:"0 16px 12px",background:theme.bg,borderRadius:12,padding:12,display:"flex",gap:10,alignItems:"center" }}>
                    {activeConv.postPhoto && <img src={activeConv.postPhoto} alt="" style={{ width:48,height:48,borderRadius:8,objectFit:"cover",flexShrink:0 }}/>}
                    <div>
                      <p style={{ fontWeight:700,color:theme.text,fontSize:13 }}>{activeConv.postTitle}</p>
                      {activeConv.postPrice && <p style={{ color:"#43C6AC",fontWeight:700,fontSize:12 }}>{activeConv.postPrice}</p>}
                      <p style={{ color:theme.sub,fontSize:11 }}>avec {activeConv.otherName||activeConv.receiverName}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:10 }}>
                  {activeConv.messages && activeConv.messages.length === 0 && (
                    <p style={{ textAlign:"center",color:theme.sub,fontSize:13 }}>Commencez la conversation !</p>
                  )}
                  {(activeConv.messages||[]).map(msg=>(
                    <div key={msg.id} style={{ display:"flex",flexDirection:"column",alignItems:msg.sender_id===user.id?"flex-end":"flex-start" }}>
                      <div style={{ maxWidth:"75%",background:msg.sender_id===user.id?"linear-gradient(135deg,#6C63FF,#8B84FF)":theme.bg,border:msg.sender_id===user.id?"none":`1px solid ${theme.border}`,borderRadius:msg.sender_id===user.id?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px" }}>
                        <p style={{ color:msg.sender_id===user.id?"#fff":theme.text,fontSize:14,lineHeight:1.4 }}>{msg.content}</p>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:3 }}>
                        <p style={{ color:theme.sub,fontSize:10 }}>{new Date(msg.created_at).toLocaleTimeString("fr",{hour:"2-digit",minute:"2-digit"})}</p>
                        {msg.sender_id===user.id && (
                          <span style={{ fontSize:11,color:msg.read?"#43C6AC":theme.sub }} title={msg.read?"Lu":"Envoyé"}>
                            {msg.read ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div style={{ padding:"12px 16px",paddingBottom:"env(safe-area-inset-bottom, 12px)",borderTop:`1px solid ${theme.border}`,display:"flex",gap:8,position:"relative",zIndex:10 }}>
                  <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendMessage(activeConv.postId,activeConv.postTitle,activeConv.postPrice,activeConv.postPhoto,activeConv.otherId||activeConv.receiverId,activeConv.otherName||activeConv.receiverName); loadMessages(); }}} placeholder="Écrire un message..." style={{ ...inputStyle,flex:1,padding:"10px 14px",borderRadius:24,fontSize:14 }}/>
                  <button onClick={()=>{ sendMessage(activeConv.postId,activeConv.postTitle,activeConv.postPrice,activeConv.postPhoto,activeConv.otherId||activeConv.receiverId,activeConv.otherName||activeConv.receiverName); setTimeout(loadMessages,500); }} style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",width:42,height:42,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bannière hors ligne */}
      {!isOnline && (
        <div style={{ position:"fixed",top:64,left:0,right:0,zIndex:998,background:"linear-gradient(135deg,#FF4757,#FF6584)",color:"#fff",padding:"10px 24px",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontSize:14,fontWeight:600,boxShadow:"0 4px 20px rgba(255,71,87,0.4)" }}>
          <span style={{ fontSize:18 }}>📵</span>
          Vous êtes hors ligne — Les dernières annonces chargées restent disponibles
        </div>
      )}

      {/* Bannière PWA — installer l'application */}
      {showPwaBanner && (
        <div style={{ position:"fixed",bottom:80,left:12,right:12,zIndex:997,background:"linear-gradient(135deg,#1A1D30,#2A2D45)",border:"1px solid #6C63FF",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 8px 32px rgba(108,99,255,0.4)",maxWidth:480,margin:"0 auto" }}>
          <img src="/marcheduRoi-icon.svg" alt="" style={{ width:44,height:44,borderRadius:10,flexShrink:0 }}/>
          <div style={{ flex:1,minWidth:0 }}>
            <p style={{ fontWeight:800,fontSize:14,color:"#E8E8F0",marginBottom:2 }}>Installer MarchéduRoi</p>
            <p style={{ fontSize:12,color:"#9A9AB0" }}>Accès rapide · Fonctionne hors ligne</p>
          </div>
          <button onClick={async()=>{
            if (pwaPrompt) {
              pwaPrompt.prompt();
              const result = await pwaPrompt.userChoice;
              if (result.outcome === "accepted") notify("✅ Application installée !");
            }
            setShowPwaBanner(false);
            localStorage.setItem("mdr_pwa_dismissed","1");
          }} style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"8px 16px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",flexShrink:0 }}>
            Installer
          </button>
          <button onClick={()=>{ setShowPwaBanner(false); localStorage.setItem("mdr_pwa_dismissed","1"); }} style={{ background:"transparent",border:"none",color:"#9A9AB0",fontSize:18,cursor:"pointer",flexShrink:0,lineHeight:1 }}>✕</button>
        </div>
      )}

      {/* Bannière erreur Supabase */}
      {isOnline && postsLoaded && posts.length === 0 && (
        <div style={{ position:"fixed",top:64,left:0,right:0,zIndex:997,background:"rgba(255,140,0,0.95)",color:"#fff",padding:"10px 24px",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontSize:14,fontWeight:600 }}>
          <span>⚠️</span>
          Impossible de charger les annonces.
          <button onClick={()=>{ loadPosts(); loadShops(); }} style={{ background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.4)",color:"#fff",padding:"4px 12px",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:13 }}>
            Réessayer
          </button>
        </div>
      )}

      {/* Bouton WhatsApp Support flottant */}
      {!showMessages && (
        <div style={{ position:"fixed",bottom:24,right:16,zIndex:999,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8 }}>
          {showWaTooltip && (
            <div style={{ background:windowWidth<=600?"rgba(37,211,102,0.75)":"#25D366",color:"#fff",borderRadius:12,padding:"10px 14px",fontSize:13,fontWeight:600,maxWidth:220,boxShadow:"0 4px 20px rgba(37,211,102,0.4)",animation:"fadeIn 0.3s ease",position:"relative",lineHeight:1.5,backdropFilter:windowWidth<=600?"blur(4px)":"none" }}>
              👋 Bonjour ! Besoin d'aide ?<br/>Contactez-nous sur WhatsApp !
              <button onClick={()=>{ setShowWaTooltip(false); localStorage.setItem("mdr_wa_tooltip_shown","1"); }} style={{ position:"absolute",top:4,right:6,background:"none",border:"none",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:800,padding:0 }}>✕</button>
            </div>
          )}
          <a href="https://wa.me/2290147562640?text=Bonjour%20MarcheduRoi%20Support%2C%20j'ai%20besoin%20d'aide%20concernant%20ma%20publication." target="_blank" rel="noopener noreferrer" onClick={()=>{ setShowWaTooltip(false); localStorage.setItem("mdr_wa_tooltip_shown","1"); }} title="Contacter le support technique"
            style={{ width:50,height:50,borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(37,211,102,0.5)",cursor:"pointer",textDecoration:"none",transition:"transform 0.2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.1)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; }}>
            <svg width="26" height="26" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          </a>
        </div>
      )}

      {showScrollTop && !showMessages && (
        <button onClick={scrollToTop} style={{ position:"fixed",bottom:30,left:16,zIndex:999,width:windowWidth<=600?52:44,height:windowWidth<=600?52:44,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#FF6584)",border:"none",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 24px rgba(108,99,255,0.6)",cursor:"pointer",fontSize:windowWidth<=600?22:18,fontWeight:800,WebkitTapHighlightColor:"transparent",touchAction:"manipulation" }}>↑</button>
      )}

      {/* Signalements annulables */}
      {Object.keys(cancelableReports).length > 0 && (
        <div style={{ position:"fixed",bottom:100,left:20,zIndex:9998,display:"flex",flexDirection:"column",gap:8 }}>
          {reports.filter(r=>cancelableReports[r.id]).map(r=>(
            <div key={r.id} style={{ background:"#1A1D30",border:"1px solid #FF4757",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 20px rgba(0,0,0,0.3)",maxWidth:320 }}>
              <span style={{ fontSize:16 }}>🚩</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:12,color:"#E8E8F0",fontWeight:600 }}>Signalement envoyé</p>
                <p style={{ fontSize:11,color:"#9A9AB0" }}>{r.postTitle?.slice(0,30)}...</p>
              </div>
              <button onClick={()=>cancelReport(r.id)} style={{ background:"rgba(255,71,87,0.2)",border:"1px solid #FF4757",color:"#FF4757",padding:"6px 12px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",whiteSpace:"nowrap" }}>
                Annuler
              </button>
            </div>
          ))}
        </div>
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
      <nav style={{ background:`${theme.bg}EE`,borderBottom:`1px solid ${theme.border}`,padding:"0 16px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(12px)",width:"100%" }}>

        {/* LOGO — complet sur desktop, "M" seul sur mobile */}
        <div style={{ display:"flex",alignItems:"center",cursor:"pointer",flexShrink:0 }} onClick={()=>setView("landing")}>
          {windowWidth > 600 ? (
            <img src="/marcheduRoi-icon.svg" alt="MarcheduRoi" style={{ height:52,width:"auto",objectFit:"contain" }}/>
          ) : (
            <img src="/icons/icon-72x72.png" alt="MarchéduRoi" style={{ width:40,height:40,borderRadius:10,objectFit:"cover",boxShadow:"0 2px 12px rgba(108,99,255,0.4)" }}/>
          )}
        </div>

        {/* BOUTONS DROITE */}
        <div style={{ display:"flex",gap:4,alignItems:"center" }}>

          {/* Annonces + Publier + Admin — desktop seulement */}
          {windowWidth > 600 && <>
            <button onClick={()=>setView("home")} style={{ background:view==="home"?"rgba(108,99,255,0.2)":"transparent",border:"none",color:view==="home"?"#6C63FF":theme.sub,padding:"8px 12px",borderRadius:8,fontWeight:600,fontSize:13 }}>
              {t.annonces}
            </button>
            <button onClick={()=>window.open("https://marcheduroi.com/demandes","_blank")} style={{ background:"rgba(255,140,0,0.1)",border:"none",color:"#FF8C00",padding:"8px 12px",borderRadius:8,fontWeight:600,fontSize:13 }}>
              📢 Demandes
            </button>
            <button onClick={()=>setModal({type:"howto"})} style={{ background:"rgba(67,198,172,0.1)",border:"none",color:"#43C6AC",padding:"8px 12px",borderRadius:8,fontWeight:600,fontSize:13 }}>
              {t.publierAnnonce}
            </button>
            {user?.role==="admin" && <button onClick={()=>setView("admin")} style={{ background:"transparent",border:"none",color:"#FF6584",padding:"8px 12px",borderRadius:8,fontWeight:600,fontSize:13 }}>{t.admin}</button>}
            <button onClick={()=>{ const newLang=lang==="fr"?"en":"fr"; setLang(newLang); localStorage.setItem("mf_lang",newLang); }} style={{ background:theme.card,border:`1px solid ${theme.border}`,color:theme.text,padding:"6px 12px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
              {lang==="fr"?<>🇫🇷 FR</>:<>🇬🇧 EN</>}
            </button>
            <button onClick={()=>setShowBgPicker(p=>!p)} style={{ background:"rgba(108,99,255,0.1)",border:`1px solid rgba(108,99,255,0.3)`,color:"#6C63FF",padding:"8px 10px",borderRadius:8,display:"flex",alignItems:"center",gap:4,fontWeight:600,fontSize:13 }}><Icon name="palette" size={14}/></button>
          </>}

          {/* CONNEXION / INSCRIPTION — avant Plus sur mobile, dans user block sur desktop */}
          {!user && windowWidth <= 600 && (
            <>
              <button onClick={()=>setView("login")} style={{ background:"transparent",border:`1px solid ${theme.border}`,color:theme.text,padding:"7px 10px",borderRadius:8,fontWeight:600,fontSize:12,WebkitTapHighlightColor:"transparent" }}>{t.connexion}</button>
              <button onClick={()=>setView("register")} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"7px 10px",borderRadius:8,fontWeight:600,fontSize:12,WebkitTapHighlightColor:"transparent" }}>{t.inscrire}</button>
            </>
          )}

          {/* MENU PLUS ▾ */}
          <div style={{ position:"relative" }}>
            <button
              onClick={()=>setShowMoreMenu(m=>!m)}
              style={{ background:showMoreMenu?`rgba(108,99,255,0.15)`:theme.card,border:`1px solid ${showMoreMenu?"#6C63FF":theme.border}`,color:showMoreMenu?"#6C63FF":theme.text,padding:"8px 12px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer",WebkitTapHighlightColor:"transparent",touchAction:"manipulation" }}>
              Plus {showMoreMenu?"▲":"▾"}
            </button>
          </div>

          {/* UTILISATEUR CONNECTÉ */}
          {user ? (
            <div style={{ display:"flex",alignItems:"center",gap:4 }}>
              {/* Messagerie */}
              <div style={{ position:"relative" }}>
                <button onClick={()=>{ setShowMessages(s=>!s); loadMessages(); }} style={{ background:"transparent",border:"none",color:theme.sub,padding:"8px",cursor:"pointer",position:"relative" }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {unreadCount > 0 && <span style={{ position:"absolute",top:4,right:4,background:"#6C63FF",color:"#fff",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800 }}>{unreadCount}</span>}
                </button>
              </div>
              {/* Cloche notifications */}
              <div style={{ position:"relative" }}>
                <button data-notif-btn onClick={()=>{ setShowNotifs(true); markAllRead(); }} style={{ background:"transparent",border:"none",color:theme.sub,padding:"8px",position:"relative",cursor:"pointer",WebkitTapHighlightColor:"transparent",touchAction:"manipulation" }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  {notifications.filter(n=>!n.read).length > 0 && (
                    <span style={{ position:"absolute",top:4,right:4,background:"#FF4757",color:"#fff",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800 }}>
                      {notifications.filter(n=>!n.read).length}
                    </span>
                  )}
                </button>
              </div>
              <button onClick={()=>setView("dashboard")} style={{ ...cardStyle,padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:6,color:theme.text }}>
                <Icon name="user" size={14}/>
                {user.name.split(" ")[0]}
              </button>

              <button onClick={logout} style={{ background:"transparent",border:"none",color:theme.sub,padding:"8px" }}><Icon name="logout" size={16}/></button>
            </div>
          ) : (
            /* Connexion/Inscription — desktop seulement (sur mobile c'est avant Plus) */
            windowWidth > 600 && (
              <div style={{ display:"flex",gap:6 }}>
                <button onClick={()=>setView("login")} style={{ background:"transparent",border:`1px solid ${theme.border}`,color:theme.text,padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>{t.connexion}</button>
                <button onClick={()=>setView("register")} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,transition:"box-shadow 0.2s" }}>{t.inscrire}</button>
              </div>
            )
          )}
        </div>
      </nav>

      {/* LANDING PAGE */}
      {view==="landing"&&(
        <div style={{ width:"100%",minHeight:"calc(100vh - 64px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:windowWidth<=600?"flex-start":"center",padding:windowWidth<=600?"0 16px 8px":"0 24px 0",animation:"fadeIn 0.6s ease",position:"relative",overflow:"hidden" }}>

          {/* Background decoration */}
          <div style={{ position:"absolute",top:-100,left:-100,width:400,height:400,borderRadius:"50%",background:"rgba(108,99,255,0.06)",pointerEvents:"none" }}/>
          <div style={{ position:"absolute",bottom:-100,right:-100,width:500,height:500,borderRadius:"50%",background:"rgba(255,101,132,0.05)",pointerEvents:"none" }}/>

          {/* Logo + drapeaux en orbite */}
          <FlagCylinder theme={theme}/>

          {/* Titre + slogan officiel groupés */}
          <h1 style={{ fontSize:windowWidth<=600?"clamp(22px,8vw,32px)":"clamp(26px,7vw,52px)",fontWeight:800,textAlign:"center",lineHeight:1.1,marginBottom:windowWidth<=600?2:4,color:theme.text,padding:"0 8px",width:"100%",marginTop:0 }}>
            Bienvenue sur{" "}
            <span style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>MarchéduRoi</span>
          </h1>
          <p style={{ fontSize:windowWidth<=600?"clamp(13px,3.5vw,16px)":"17px",fontWeight:700,textAlign:"center",color:"#FFD700",marginBottom:windowWidth<=600?2:4,letterSpacing:0.3,marginTop:0 }}>
            "Sur MarchéduRoi, vous êtes le Roi du Marché" 👑
          </p>

          {/* Slogan géolocalisé */}
          {(()=>{
              const PAYS_NOMS = {
                BJ:"Bénin", TG:"Togo", CI:"Côte d'Ivoire", SN:"Sénégal", ML:"Mali",
                BF:"Burkina Faso", NE:"Niger", GN:"Guinée", NG:"Nigeria", CM:"Cameroun",
                CG:"Congo", CD:"RD Congo", GA:"Gabon", MG:"Madagascar", RW:"Rwanda",
                BI:"Burundi", TD:"Tchad", MR:"Mauritanie", FR:"France", BE:"Belgique",
                CH:"Suisse", CA:"Canada", US:"États-Unis", GB:"Royaume-Uni", DE:"Allemagne",
                IT:"Italie", ES:"Espagne", MA:"Maroc", DZ:"Algérie", TN:"Tunisie",
                EG:"Égypte", KE:"Kenya", ZA:"Afrique du Sud", GH:"Ghana",
              };
              const PREP = {
                BJ:"au", TG:"au", ML:"au", SN:"au", NE:"au", CM:"au", CG:"au",
                GA:"au", RW:"au", BI:"au", TD:"au", CA:"au", CD:"en", CI:"en",
                BF:"au", GN:"en", NG:"au", MG:"à", FR:"en", BE:"en", CH:"en", MR:"en",
                US:"aux", GB:"au", DE:"en", IT:"en", ES:"en", MA:"au", DZ:"en",
                TN:"en", EG:"en", KE:"au", ZA:"en", GH:"au",
              };
              const code = getUserCountry() || "BJ";
              const pays = PAYS_NOMS[code];
              const prep = PREP[code];
              const sloganLoc = pays
                ? <><strong style={{ color:theme.text }}>{prep} {pays}</strong> et partout dans le <strong style={{ color:theme.text }}>monde</strong> 🌍</>
                : <strong style={{ color:theme.text }}>partout dans le monde</strong>;
              return windowWidth <= 600 ? (
                <p style={{ fontSize:"clamp(13px,3.5vw,17px)",color:theme.sub,textAlign:"center",maxWidth:340,lineHeight:1.5,marginBottom:6,padding:"0 16px" }}>
                  La plateforme qui connecte commerçants, entreprises et particuliers {sloganLoc}
                </p>
              ) : (
                <p style={{ fontSize:"clamp(13px,3.5vw,17px)",color:theme.sub,textAlign:"center",maxWidth:560,lineHeight:1.5,marginBottom:6,padding:"0 16px" }}>
                  La plateforme qui connecte commerçants,<br/>entreprises et particuliers {sloganLoc}
                </p>
              );
            })()}

          {/* Verset du jour — change chaque jour */}
          {(()=>{
            const VERSETS_LANDING = [
              {ref:"Jean 3:16",texte:"Car Dieu a tant aimé le monde qu'il a donné son Fils unique."},
              {ref:"Phil 4:13",texte:"Je puis tout par celui qui me fortifie."},
              {ref:"Jér 29:11",texte:"Des projets de paix et non de malheur, pour vous donner un avenir."},
              {ref:"Ps 23:1",texte:"L'Éternel est mon berger : je ne manquerai de rien."},
              {ref:"Rom 8:28",texte:"Toutes choses concourent au bien de ceux qui aiment Dieu."},
              {ref:"Matt 6:33",texte:"Cherchez premièrement le royaume et la justice de Dieu."},
              {ref:"Prov 3:5",texte:"Confie-toi en l'Éternel de tout ton cœur."},
              {ref:"És 40:31",texte:"Ceux qui se confient en l'Éternel renouvellent leur force."},
              {ref:"Luc 1:37",texte:"Rien n'est impossible à Dieu."},
              {ref:"Ps 46:1",texte:"Dieu est pour nous un refuge et un appui."},
              {ref:"Gal 6:9",texte:"Ne nous lassons pas de faire le bien."},
              {ref:"2 Tim 1:7",texte:"Un esprit de force, d'amour et de sagesse."},
              {ref:"Prov 16:3",texte:"Recommande à l'Éternel tes œuvres, et tes projets réussiront."},
              {ref:"Matt 11:28",texte:"Venez à moi, vous tous qui êtes fatigués et chargés."},
              {ref:"És 41:10",texte:"Ne crains rien, car je suis avec toi."},
              {ref:"Jean 14:6",texte:"Je suis le chemin, la vérité, et la vie."},
              {ref:"Ps 37:4",texte:"Fais de l'Éternel tes délices, et il te donnera ce que ton cœur désire."},
              {ref:"Héb 11:1",texte:"La foi est une ferme assurance des choses qu'on espère."},
              {ref:"Col 3:23",texte:"Quoi que vous fassiez, faites-le de bon cœur, comme pour le Seigneur."},
              {ref:"Deut 31:6",texte:"Fortifiez-vous ! L'Éternel, ton Dieu, marchera avec toi."},
              {ref:"Apo 3:20",texte:"Voici, je me tiens à la porte et je frappe."},
              {ref:"Ps 118:24",texte:"C'est ici la journée que l'Éternel a faite : qu'elle soit un sujet d'allégresse !"},
              {ref:"1 Cor 10:13",texte:"Dieu est fidèle, et il ne permettra pas que vous soyez tentés au-delà de vos forces."},
              {ref:"Ps 121:2",texte:"Mon secours vient de l'Éternel, qui a fait les cieux et la terre."},
              {ref:"1 Jean 4:4",texte:"Celui qui est en vous est plus grand que celui qui est dans le monde."},
              {ref:"Nomb 6:24",texte:"Que l'Éternel te bénisse et te garde !"},
              {ref:"Prov 18:10",texte:"Le nom de l'Éternel est une tour forte ; le juste s'y réfugie."},
              {ref:"Apo 21:4",texte:"Il essuiera toute larme de leurs yeux, et la mort ne sera plus."},
              {ref:"Rom 5:8",texte:"Lorsque nous étions encore des pécheurs, Christ est mort pour nous."},
              {ref:"Ps 27:1",texte:"L'Éternel est ma lumière et mon salut : de qui aurais-je crainte ?"},
            ];
            const dayIndex = Math.floor(Date.now() / (1000*60*60*24)) % VERSETS_LANDING.length;
            const v = VERSETS_LANDING[dayIndex];
            return (
              <div style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 14px",background:"rgba(108,99,255,0.07)",borderLeft:"3px solid #6C63FF",borderRadius:10,marginBottom:8,maxWidth:480 }}>
                <span style={{ fontSize:16,flexShrink:0 }}>✨</span>
                <div>
                  <span style={{ fontSize:12,fontStyle:"italic",color:theme.text }}>{v.texte} </span>
                  <span style={{ fontSize:12,fontWeight:700,color:"#FF6584" }}>— {v.ref}</span>
                </div>
              </div>
            );
          })()}

          {/* ── Bouton principal "Visitez librement" ── */}
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:0,marginBottom:8,width:"100%",maxWidth:500 }}>

            {/* Bouton principal */}
            <button onClick={()=>setShowCategories(s=>!s)} className="btn-glow"
              style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)",border:"none",color:"#fff",
                padding:windowWidth<=600?"14px 32px":"16px 48px",borderRadius:20,fontWeight:800,
                fontSize:windowWidth<=600?16:18,cursor:"pointer",transition:"box-shadow 0.2s",
                boxShadow:"0 6px 28px rgba(108,99,255,0.45)",display:"flex",alignItems:"center",gap:10,
                letterSpacing:0.3 }}>
              <span style={{ fontSize:20 }}>👑</span>
              Visitez librement
              <span style={{ fontSize:14,transition:"transform 0.3s",display:"inline-block",transform:showCategories?"rotate(180deg)":"rotate(0deg)" }}>▾</span>
            </button>

            {/* Sous-menu dépliant — 3 boutons modernes */}
            <div style={{
              width:"100%",overflow:"hidden",
              maxHeight:showCategories ? 520 : 0,
              opacity:showCategories ? 1 : 0,
              transform:showCategories ? "translateY(0)" : "translateY(-10px)",
              transition:"max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease, transform 0.35s ease",
            }}>
              <div style={{ display:"flex",flexDirection:"column",gap:10,marginTop:14,padding:"4px 0 8px" }}>

                {/* 1. Explorez les annonces */}
                <button onClick={()=>{ setShowCategories(false); setView("home"); }} className="btn-glow"
                  style={{ background:"linear-gradient(135deg,rgba(108,99,255,0.12),rgba(108,99,255,0.06))",
                    border:"2px solid rgba(108,99,255,0.45)",color:"#6C63FF",
                    padding:"16px 24px",borderRadius:18,fontWeight:800,fontSize:15,cursor:"pointer",
                    display:"flex",alignItems:"center",gap:14,textAlign:"left",width:"100%",
                    backdropFilter:"blur(8px)",transition:"all 0.2s" }}>
                  <div style={{ background:"rgba(108,99,255,0.15)",borderRadius:14,width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:22 }}>📋</div>
                  <div>
                    <p style={{ fontWeight:800,fontSize:15,marginBottom:2 }}>Explorez les annonces</p>
                    <p style={{ fontWeight:500,fontSize:12,color:"rgba(108,99,255,0.75)" }}>{posts.length} annonces disponibles</p>
                  </div>
                  <span style={{ marginLeft:"auto",fontSize:18,opacity:0.6 }}>›</span>
                </button>

                {/* 2. Découvrez les établissements */}
                <button onClick={()=>{ setShowCategories(false); setView("boutiques"); }} className="btn-glow"
                  style={{ background:"linear-gradient(135deg,rgba(255,101,132,0.12),rgba(255,101,132,0.06))",
                    border:"2px solid rgba(255,101,132,0.45)",color:"#FF6584",
                    padding:"16px 24px",borderRadius:18,fontWeight:800,fontSize:15,cursor:"pointer",
                    display:"flex",alignItems:"center",gap:14,textAlign:"left",width:"100%",
                    backdropFilter:"blur(8px)",transition:"all 0.2s" }}>
                  <div style={{ background:"rgba(255,101,132,0.15)",borderRadius:14,width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:22 }}>🏪</div>
                  <div>
                    <p style={{ fontWeight:800,fontSize:15,marginBottom:2 }}>Découvrez les établissements</p>
                    <p style={{ fontWeight:500,fontSize:12,color:"rgba(255,101,132,0.75)" }}>{boutiques.length+ateliers.length+restos.length+beaute.length} établissements actifs</p>
                  </div>
                  <span style={{ marginLeft:"auto",fontSize:18,opacity:0.6 }}>›</span>
                </button>

                {/* 3. Demandes */}
                <button onClick={()=>{ setShowCategories(false); localStorage.setItem('mdr_demandes_last_visit', new Date().toISOString()); setHasNewDemandes(false); window.open("https://marcheduroi.com/demandes","_blank"); }}
                  style={{ background:"linear-gradient(135deg,rgba(255,140,0,0.12),rgba(255,215,0,0.06))",
                    border:"2px solid rgba(255,140,0,0.45)",color:"#FF8C00",
                    padding:"16px 24px",borderRadius:18,fontWeight:800,fontSize:15,cursor:"pointer",
                    display:"flex",alignItems:"center",gap:14,textAlign:"left",width:"100%",
                    backdropFilter:"blur(8px)",transition:"all 0.2s",position:"relative" }}>
                  <div style={{ background:"rgba(255,140,0,0.15)",borderRadius:14,width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:22 }}>📢</div>
                  <div>
                    <p style={{ fontWeight:800,fontSize:15,marginBottom:2 }}>Demandes récentes</p>
                    <p style={{ fontWeight:500,fontSize:12,color:"rgba(255,140,0,0.75)" }}>Ce que les gens recherchent</p>
                  </div>
                  {hasNewDemandes && <span style={{ position:"absolute",top:10,right:14,background:"#FF4757",color:"#fff",borderRadius:10,padding:"2px 8px",fontSize:10,fontWeight:800 }}>Nouveau !</span>}
                  <span style={{ marginLeft:"auto",fontSize:18,opacity:0.6 }}>›</span>
                </button>

                {/* 4. Recrutement */}
                <button onClick={()=>{ setShowCategories(false); setView("recrutement"); }}
                  style={{ background:"linear-gradient(135deg,rgba(67,198,172,0.12),rgba(67,198,172,0.06))",
                    border:"2px solid rgba(67,198,172,0.45)",color:"#43C6AC",
                    padding:"16px 24px",borderRadius:18,fontWeight:800,fontSize:15,cursor:"pointer",
                    display:"flex",alignItems:"center",gap:14,textAlign:"left",width:"100%",
                    backdropFilter:"blur(8px)",transition:"all 0.2s" }}>
                  <div style={{ background:"rgba(67,198,172,0.15)",borderRadius:14,width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:22 }}>💼</div>
                  <div>
                    <p style={{ fontWeight:800,fontSize:15,marginBottom:2 }}>Recrutement</p>
                    <p style={{ fontWeight:500,fontSize:12,color:"rgba(67,198,172,0.75)" }}>Offres d'emploi & Profils CV</p>
                  </div>
                  <span style={{ marginLeft:"auto",fontSize:18,opacity:0.6 }}>›</span>
                </button>

              </div>
            </div>
          </div>

          {/* Bannière publicitaire — dynamique */}
          {(() => {
            const ad = ads[adIndex];
            if (!ad) return (
              <div style={{ width:"100%",maxWidth:700,margin:`${windowWidth<=600?"8px":"12px"} auto 0`,borderRadius:16,overflow:"hidden",border:"1px solid rgba(108,99,255,0.3)",background:`linear-gradient(135deg,rgba(108,99,255,0.08),rgba(255,101,132,0.06))` }}>
                <div style={{ padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ width:44,height:44,borderRadius:10,background:"linear-gradient(135deg,#6C63FF,#FF6584)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>🚀</div>
                    <div>
                      <p style={{ fontWeight:800,fontSize:14,color:theme.text,marginBottom:2 }}>Votre pub vue par des milliers de personnes</p>
                      <p style={{ color:theme.sub,fontSize:12 }}>Bannière visible sur toutes les pages · Résultats immédiats</p>
                    </div>
                  </div>
                  <button onClick={()=>setModal({type:"showFaster"})} style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap" }}>
                    ⚡ Show Faster
                  </button>
                </div>
              </div>
            );
            return (
              <div style={{ position:"relative",width:"100%",maxWidth:700,margin:`${windowWidth<=600?"8px":"12px"} auto 0` }}>
                {/* Flèche précédent */}
                {ads.length > 1 && (
                  <button onTouchEnd={e=>{e.preventDefault();e.stopPropagation();setAdPaused(true);setAdIndex(i=>(i-1+ads.length)%ads.length);setTimeout(()=>setAdPaused(false),3000);}} onClick={e=>{e.preventDefault();e.stopPropagation();setAdPaused(true);setAdIndex(i=>(i-1+ads.length)%ads.length);setTimeout(()=>setAdPaused(false),3000);}}
                    style={{ position:"absolute",left:-14,top:"50%",transform:"translateY(-50%)",zIndex:10,width:30,height:30,borderRadius:"50%",background:theme.card,border:`1px solid ${theme.border}`,color:theme.text,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,fontWeight:700,boxShadow:"0 2px 8px rgba(0,0,0,0.2)",WebkitTapHighlightColor:"transparent",touchAction:"manipulation" }}>‹</button>
                )}
                {/* Flèche suivant */}
                {ads.length > 1 && (
                  <button onTouchEnd={e=>{e.preventDefault();e.stopPropagation();setAdPaused(true);setAdIndex(i=>(i+1)%ads.length);setTimeout(()=>setAdPaused(false),3000);}} onClick={e=>{e.preventDefault();e.stopPropagation();setAdPaused(true);setAdIndex(i=>(i+1)%ads.length);setTimeout(()=>setAdPaused(false),3000);}}
                    style={{ position:"absolute",right:-14,top:"50%",transform:"translateY(-50%)",zIndex:10,width:30,height:30,borderRadius:"50%",background:theme.card,border:`1px solid ${theme.border}`,color:theme.text,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,fontWeight:700,boxShadow:"0 2px 8px rgba(0,0,0,0.2)",WebkitTapHighlightColor:"transparent",touchAction:"manipulation" }}>›</button>
                )}
              <a href={ad.lien||"#"} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration:"none",display:"block",width:"100%" }}>
                <div style={{ borderRadius:16,overflow:"hidden",border:`1px solid ${theme.border}`,background:`linear-gradient(135deg,${ad.couleur1||"#6C63FF"}22,${ad.couleur2||"#8B84FF"}22)`,transition:"transform 0.3s",cursor:"pointer" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.01)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                  <div style={{ padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
                    <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                      {ad.logo_url
                        ? <img src={ad.logo_url} alt={ad.entreprise} style={{ width:48,height:48,borderRadius:10,objectFit:"cover",flexShrink:0 }}/>
                        : <div style={{ width:48,height:48,borderRadius:10,background:`linear-gradient(135deg,${ad.couleur1},${ad.couleur2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>🏢</div>
                      }
                      <div>
                        <p style={{ fontWeight:800,fontSize:15,color:theme.text,marginBottom:3 }}>{ad.entreprise}</p>
                        {ad.slogan && <p style={{ color:theme.sub,fontSize:13 }}>{ad.slogan}</p>}
                      </div>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
                      {ads.length > 1 && (
                        <div style={{ display:"flex",gap:5,alignItems:"center" }}>
                          {ads.map((_,i) => (
                            <div key={i} onClick={e=>{ e.preventDefault(); setAdPaused(true); setAdIndex(i); setTimeout(()=>setAdPaused(false),3000); }}
                              style={{ width:i===adIndex?18:8,height:8,borderRadius:4,background:i===adIndex?(ad.couleur1||"#6C63FF"):"rgba(154,154,176,0.5)",cursor:"pointer",transition:"all 0.3s" }}/>
                          ))}
                        </div>
                      )}
                      <div style={{ background:`linear-gradient(135deg,${ad.couleur1||"#6C63FF"},${ad.couleur2||"#8B84FF"})`,color:"#fff",padding:"8px 16px",borderRadius:10,fontWeight:700,fontSize:13 }}>
                        Voir →
                      </div>
                    </div>
                  </div>
                  <div style={{ height:3,background:`linear-gradient(90deg,${ad.couleur1||"#6C63FF"},${ad.couleur2||"#8B84FF"})`,opacity:0.6 }}/>
                </div>
              </a>
              </div>
            );
          })()}

          {/* Footer landing */}
          <p style={{ color:theme.sub,fontSize:13,marginTop:24,textAlign:"center" }}>
            <span style={{ color:"#FFD700",fontWeight:700,fontStyle:"italic" }}>"Sur MarchéduRoi, vous êtes le Roi du Marché" 👑</span><br/>
            © 2026 MarchéduRoi · Ouidah, Bénin 🇧🇯 · <button onClick={()=>setView("terms")} style={{ background:"none",border:"none",color:"#6C63FF",cursor:"pointer",fontSize:13 }}>CGU</button> · <button onClick={()=>setView("about")} style={{ background:"none",border:"none",color:"#6C63FF",cursor:"pointer",fontSize:13 }}>À propos</button>
          </p>
        </div>
      )}

      {/* HOME */}
      {view==="home"&&(
        <div style={{ width:"100%",padding:"16px 12px",animation:"fadeIn 0.4s ease" }}>

          {/* État de chargement */}
          {!postsLoaded && (
            <div style={{ display:"grid",gridTemplateColumns:windowWidth>800?"repeat(3,1fr)":windowWidth>600?"repeat(2,1fr)":"repeat(2,1fr)",gap:12,width:"100%",padding:"8px 0" }}>
              {Array.from({length:6}).map((_,i)=>(
                <div key={i} style={{ borderRadius:16,overflow:"hidden",border:`1px solid ${theme.border}`,background:theme.card,padding:0 }}>
                  {/* Image skeleton */}
                  <div style={{ width:"100%",height:140,background:`linear-gradient(90deg,${theme.border} 25%,${theme.bg} 50%,${theme.border} 75%)`,backgroundSize:"800px 100%",animation:"shimmer 1.5s infinite linear" }}/>
                  <div style={{ padding:12,display:"flex",flexDirection:"column",gap:8 }}>
                    {/* Badge skeleton */}
                    <div style={{ width:70,height:18,borderRadius:20,background:`linear-gradient(90deg,${theme.border} 25%,${theme.bg} 50%,${theme.border} 75%)`,backgroundSize:"800px 100%",animation:"shimmer 1.5s infinite linear" }}/>
                    {/* Title skeleton */}
                    <div style={{ width:"85%",height:14,borderRadius:6,background:`linear-gradient(90deg,${theme.border} 25%,${theme.bg} 50%,${theme.border} 75%)`,backgroundSize:"800px 100%",animation:"shimmer 1.5s infinite linear" }}/>
                    <div style={{ width:"60%",height:14,borderRadius:6,background:`linear-gradient(90deg,${theme.border} 25%,${theme.bg} 50%,${theme.border} 75%)`,backgroundSize:"800px 100%",animation:"shimmer 1.5s infinite linear" }}/>
                    {/* Price skeleton */}
                    <div style={{ width:80,height:20,borderRadius:8,background:`linear-gradient(90deg,${theme.border} 25%,${theme.bg} 50%,${theme.border} 75%)`,backgroundSize:"800px 100%",animation:"shimmer 1.5s infinite linear",marginTop:4 }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contenu principal — affiché seulement quand chargé */}
          {postsLoaded && (<>

          {/* Titre + compteur + bouton publier */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:8 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
              {windowWidth > 600 && <h1 style={{ fontSize:"clamp(18px,3vw,28px)",fontWeight:800,color:theme.text,margin:0 }}>Découvrez des <span style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>annonces</span></h1>}
              <span style={{ background:theme.card,border:`1px solid ${theme.border}`,color:theme.sub,padding:"2px 10px",borderRadius:20,fontSize:12,fontWeight:600 }}>{filtered.length} annonce{filtered.length!==1?"s":""}</span>
            </div>
            {canEdit ? (
              <div style={{ position:"relative",flexShrink:0 }}>
                {/* Bouton principal */}
                <button onClick={()=>setShowPublishMenu(m=>!m)} className="btn-glow"
                  style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"9px 18px",borderRadius:10,fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6,transition:"box-shadow 0.2s",cursor:"pointer" }}>
                  <Icon name="plus" size={14}/>Publier
                  <span style={{ fontSize:10,transition:"transform 0.2s",display:"inline-block",transform:showPublishMenu?"rotate(180deg)":"rotate(0deg)" }}>▾</span>
                </button>

                {/* Sous-menu */}
                {showPublishMenu && (
                  <>
                    {/* Overlay transparent pour fermer en cliquant ailleurs */}
                    <div onClick={()=>setShowPublishMenu(false)} style={{ position:"fixed",inset:0,zIndex:98 }}/>
                    <div style={{ position:"absolute",right:0,top:"calc(100% + 8px)",zIndex:99,background:theme.card,border:`1px solid ${theme.border}`,borderRadius:16,padding:8,minWidth:220,boxShadow:"0 8px 32px rgba(0,0,0,0.35)",animation:"fadeIn 0.15s ease" }}>
                      
                      {/* Titre */}
                      <p style={{ fontSize:11,fontWeight:700,color:theme.sub,padding:"4px 12px 8px",textTransform:"uppercase",letterSpacing:0.8 }}>Que souhaitez-vous publier ?</p>

                      {/* Options */}
                      {[
                        { icon:"📋", label:"Annonce classique", badge:"Gratuit", badgeColor:"#43C6AC", badgeBg:"rgba(67,198,172,0.15)",
                          action:()=>{ setPostForm({title:"",category:"Autre",description:"",price:"",contact:"",phone:getPhonePrefix()}); setPostPhotos([]); setVehicleForm({}); setImmoForm({sousType:"Maison",transaction:"Vente",superficie:"",pieces:"",titre:"",ville:"",quartier:"",von:"",eau:"Oui",electricite:"Oui",etat:"Bon état",recasee:"",autres:""}); setMonths(1); setModal({type:"add"}); setShowPublishMenu(false); }
                        },
                        { icon:"🛍️", label:"Boutique", badge:"4j offerts", badgeColor:"#FFD700", badgeBg:"rgba(255,215,0,0.12)",
                          action:()=>{ setShopMode("boutique"); setShopForm({name:"",type:"",sousType:"",description:"",services:"",phone:getPhonePrefix(),ville:"",quartier:"",latitude:null,longitude:null,horaires:"",tarifs:""}); setShopPhotos([]); setShopVideo(""); setSelectedTarif(-1); setModal({type:"addshop"}); setShowPublishMenu(false); }
                        },
                        { icon:"🔧", label:"Atelier", badge:"4j offerts", badgeColor:"#FFD700", badgeBg:"rgba(255,215,0,0.12)",
                          action:()=>{ setShopMode("atelier"); setShopForm({name:"",type:"",description:"",services:"",phone:getPhonePrefix(),ville:"",quartier:"",latitude:null,longitude:null,horaires:"",tarifs:""}); setShopPhotos([]); setShopVideo(""); setSelectedTarif(-1); setModal({type:"addshop"}); setShowPublishMenu(false); }
                        },
                        { icon:"🍽️", label:"Restaurant & Bar", badge:"4j offerts", badgeColor:"#FFD700", badgeBg:"rgba(255,215,0,0.12)",
                          action:()=>{ setShopMode("restos"); setShopForm({name:"",type:"",description:"",services:"",phone:getPhonePrefix(),ville:"",quartier:"",latitude:null,longitude:null,horaires:"",tarifs:""}); setShopPhotos([]); setShopVideo(""); setSelectedTarif(-1); setModal({type:"addresto"}); setShowPublishMenu(false); }
                        },
                        { icon:"💇", label:"Beauté & Bien-être", badge:"4j offerts", badgeColor:"#FFD700", badgeBg:"rgba(255,215,0,0.12)",
                          action:()=>{ setShopMode("beaute"); setShopForm({name:"",type:"",description:"",services:"",phone:getPhonePrefix(),ville:"",quartier:"",latitude:null,longitude:null,horaires:"",tarifs:""}); setShopPhotos([]); setShopVideo(""); setSelectedTarif(-1); setModal({type:"addbeaute"}); setShowPublishMenu(false); }
                        },
                        { icon:"📢", label:"Demande", badge:"Gratuit", badgeColor:"#FF8C00", badgeBg:"rgba(255,140,0,0.12)",
                          action:()=>{ setShowPublishMenu(false); window.open("https://marcheduroi.com/demandes","_blank"); }
                        },
                        { icon:"👤", label:"Publier mon CV", badge:"Gratuit", badgeColor:"#43C6AC", badgeBg:"rgba(67,198,172,0.12)",
                          action:()=>{ setShowPublishMenu(false); setView("recrutement"); setRecrutTab("cvs"); setTimeout(()=>setModal({type:"addCV"}),300); }
                        },
                        { icon:"💼", label:"Offre d'emploi", badge:"1 500 FCFA", badgeColor:"#6C63FF", badgeBg:"rgba(108,99,255,0.12)",
                          action:()=>{ setShowPublishMenu(false); setView("recrutement"); setRecrutTab("offres"); setTimeout(()=>setModal({type:"addOffre"}),300); }
                        },
                        { icon:"🏛️", label:"Créer ma vitrine", badge:"15 000 FCFA", badgeColor:"#10B981", badgeBg:"rgba(16,185,129,0.12)",
                          action:()=>{ setShowPublishMenu(false); navigate("/vitrine"); }
                        },
                      ].map((opt,i) => (
                        <button key={i} onClick={opt.action}
                          style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"transparent",border:"none",borderRadius:10,cursor:"pointer",textAlign:"left",transition:"background 0.15s" }}
                          onMouseEnter={e=>e.currentTarget.style.background=theme.bg}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <span style={{ fontSize:20,flexShrink:0 }}>{opt.icon}</span>
                          <span style={{ flex:1,fontWeight:600,fontSize:13,color:theme.text }}>{opt.label}</span>
                          <span style={{ background:opt.badgeBg,color:opt.badgeColor,padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:800,flexShrink:0 }}>{opt.badge}</span>
                        </button>
                      ))}

                      {/* Séparateur + astuce */}
                      <div style={{ borderTop:`1px solid ${theme.border}`,margin:"8px 0 4px" }}/>
                      <p style={{ fontSize:10,color:theme.sub,textAlign:"center",padding:"0 12px 4px" }}>💡 Sponsorisez pour plus de visibilité</p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              windowWidth > 600 ? (
                <button onClick={()=>setView("register")} style={{ ...cardStyle,border:`1px dashed #6C63FF`,color:"#6C63FF",padding:"9px 14px",borderRadius:10,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
                  <Icon name="lock" size={13}/>Créer un compte
                </button>
              ) : null
            )}
          </div>

            {/* Recherche + GPS — même ligne sur desktop */}
            <div style={{ marginBottom:8, width:"100%" }}>
              <div style={{ display:"flex",gap:6,alignItems:"center",flexWrap:windowWidth>700?"nowrap":"wrap" }}>
                <div style={{ position:"relative",flex:1,minWidth:0 }}>
                  <div style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:theme.sub,pointerEvents:"none" }}><Icon name="search" size={15}/></div>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.rechercher} maxLength={100} style={{ ...inputStyle,padding:"11px 16px 11px 40px",borderRadius:10,fontSize:13,width:"100%",boxSizing:"border-box" }}/>
                </div>
                <button onClick={getUserLocation} style={{ background:userLocation?"rgba(67,198,172,0.15)":"rgba(108,99,255,0.1)",border:`1px solid ${userLocation?"rgba(67,198,172,0.5)":"rgba(108,99,255,0.3)"}`,color:userLocation?"#43C6AC":"#6C63FF",padding:"11px 12px",borderRadius:10,fontWeight:600,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",flexShrink:0 }}>
                  {locationLoading?"⏳":userLocation?"📍 Actif":t.pressDeMoi}
                </button>
                {userLocation && (<>
                  <button onClick={()=>setSortByDistance(s=>!s)} style={{ background:sortByDistance?"rgba(67,198,172,0.15)":"transparent",border:`1px solid ${theme.border}`,color:sortByDistance?"#43C6AC":theme.sub,padding:"11px 12px",borderRadius:10,fontWeight:600,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0 }}>
                    {sortByDistance?"✅ Distance":"Distance"}
                  </button>
                  <button onClick={()=>{ setUserLocation(null); setSortByDistance(false); }} style={{ background:"rgba(255,71,87,0.08)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757",padding:"11px 12px",borderRadius:10,fontWeight:600,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0 }}>
                    ✕
                  </button>
                </>)}
              </div>
            </div>

            {/* Boutiques Ateliers Restos — défilement horizontal */}
            <div style={{ position:"relative",marginBottom:8 }}>
              <div style={{ position:"absolute",right:0,top:0,bottom:0,width:36,background:`linear-gradient(to left,${theme.bg} 30%,transparent)`,zIndex:2,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:4 }}>
                <span style={{ fontSize:10,color:theme.sub,opacity:0.7 }}>›</span>
              </div>
              <div style={{ display:"flex",gap:6,overflowX:"auto",flexWrap:"nowrap",padding:"2px 0",scrollbarWidth:"none",WebkitOverflowScrolling:"touch" }}>
                {[
                  { label:`🛍️ ${t.boutiques}`, count:boutiques.length, bg:"linear-gradient(135deg,#FF6584,#FFB347)", action:()=>setView("boutiques") },
                  { label:`🔧 ${t.ateliers}`,   count:ateliers.length,  bg:"linear-gradient(135deg,#43C6AC,#6C63FF)", action:()=>setView("ateliers") },
                  { label:`🍽️ ${t.restos}`,     count:restos.length,    bg:"linear-gradient(135deg,#FF8C00,#FF6584)", action:()=>setView("restos") },
                  { label:`💇 ${t.beaute}`,     count:beaute.length,    bg:"linear-gradient(135deg,#FF69B4,#FF1493)", action:()=>setView("beaute") },
                  { label:"👗 Mode",            count:null, bg:"linear-gradient(135deg,#9A78CF,#6C63FF)", action:()=>setCategory("Mode") },
                  { label:"🌾 Agro-alimentaire",count:null, bg:"linear-gradient(135deg,#16A34A,#43C6AC)", action:()=>setCategory("Agro-alimentaire") },
                ].map(s=>(
                  <button key={s.label} onClick={s.action}
                    style={{ background:s.bg,border:"none",color:"#fff",padding:"6px 14px",borderRadius:18,fontWeight:700,fontSize:12,display:"flex",alignItems:"center",gap:5,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap" }}>
                    {s.label} <span style={{ background:"rgba(255,255,255,0.3)",borderRadius:10,padding:"1px 6px",fontSize:11 }}>{s.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Catégories — défilement horizontal */}
            <div style={{ position:"relative",marginBottom:8 }}>
              <div style={{ position:"absolute",right:0,top:0,bottom:0,width:36,background:`linear-gradient(to left,${theme.bg} 30%,transparent)`,zIndex:2,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:4 }}>
                <span style={{ fontSize:10,color:theme.sub,opacity:0.7 }}>›</span>
              </div>
              <div style={{ display:"flex",gap:5,overflowX:"auto",flexWrap:"nowrap",padding:"2px 0",scrollbarWidth:"none",WebkitOverflowScrolling:"touch" }}>
                {CATEGORIES.filter(c=>c!=="Mode"&&c!=="Agro-alimentaire").map(c=>{
                  const cc = CATEGORY_COLORS[c]||{bg:"rgba(108,99,255,0.12)",border:"rgba(108,99,255,0.3)",text:"#6C63FF",icon:"🏷️"};
                  const isActive = category === c;
                  return (
                    <button key={c} onClick={()=>setCategory(c)}
                      style={{
                        background: isActive ? cc.text : cc.bg,
                        border: `1px solid ${isActive ? cc.text : cc.border}`,
                        color: isActive ? "#fff" : cc.text,
                        padding:"5px 14px",borderRadius:18,fontWeight:700,fontSize:12,
                        transition:"all 0.2s",display:"flex",alignItems:"center",
                        gap:4,flexShrink:0,whiteSpace:"nowrap",
                        boxShadow: isActive ? `0 2px 12px ${cc.text}44` : "none",
                      }}>
                      <span style={{fontSize:11}}>{cc.icon}</span>{c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtre prix + tri distance */}
            <div style={{ display:"flex",gap:6,alignItems:"center",flexWrap:"wrap" }}>
              <div style={{ display:"flex",alignItems:"center",gap:5,background:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:"5px 10px" }}>
                <span style={{ color:theme.sub,fontSize:11,fontWeight:600 }}>Min</span>
                <input value={priceMin} onChange={e=>setPriceMin(e.target.value)} placeholder="0" type="number" style={{ width:70,background:"transparent",border:"none",color:theme.text,fontSize:12,fontFamily:"inherit",outline:"none" }}/>
                <span style={{ color:theme.sub,fontSize:11 }}>FCFA</span>
              </div>
              <span style={{ color:theme.sub,fontSize:13 }}>—</span>
              <div style={{ display:"flex",alignItems:"center",gap:5,background:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:"5px 10px" }}>
                <span style={{ color:theme.sub,fontSize:11,fontWeight:600 }}>Max</span>
                <input value={priceMax} onChange={e=>setPriceMax(e.target.value)} placeholder="∞" type="number" style={{ width:70,background:"transparent",border:"none",color:theme.text,fontSize:12,fontFamily:"inherit",outline:"none" }}/>
                <span style={{ color:theme.sub,fontSize:11 }}>FCFA</span>
              </div>
              {(priceMin||priceMax) && <button onClick={()=>{setPriceMin("");setPriceMax("");}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"5px 10px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>✕</button>}
            </div>
            {/* Filtre ville + date */}
            <div style={{ display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginTop:6 }}>
              <div style={{ display:"flex",alignItems:"center",gap:5,background:theme.card,border:`1px solid ${theme.border}`,borderRadius:8,padding:"5px 10px" }}>
                <span style={{ color:theme.sub,fontSize:11 }}>📍</span>
                <input value={filterVille} onChange={e=>setFilterVille(e.target.value)} placeholder="Ville..." style={{ width:90,background:"transparent",border:"none",color:theme.text,fontSize:12,fontFamily:"inherit",outline:"none" }}/>
                {filterVille&&<button onClick={()=>setFilterVille("")} style={{ background:"none",border:"none",color:theme.sub,cursor:"pointer",fontSize:11,padding:0 }}>✕</button>}
              </div>
              {["7j","30j","90j"].map(d=>(
                <button key={d} onClick={()=>setFilterDate(filterDate===d?"":d)}
                  style={{ background:filterDate===d?"rgba(108,99,255,0.2)":theme.card,border:`1px solid ${filterDate===d?"#6C63FF":theme.border}`,color:filterDate===d?"#6C63FF":theme.sub,padding:"5px 10px",borderRadius:8,fontWeight:600,fontSize:11,cursor:"pointer" }}>
                  {d}
                </button>
              ))}
              {(filterVille||filterDate)&&<button onClick={()=>{setFilterVille("");setFilterDate("");}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"5px 10px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>Tout effacer</button>}
            </div>

          {/* Annonces en vedette */}
          

          {/* Bandeau Urgent — EN CE MOMENT */}
          <UrgentBanner posts={posts} boutiques={boutiques} ateliers={ateliers} restos={restos} beaute={beaute} theme={theme} navigate={navigate} windowWidth={windowWidth} sessionSeed={sessionSeed} activeCategory={category}/>
          <SponsoredBanner posts={posts} boutiques={boutiques} ateliers={ateliers} restos={restos} beaute={beaute} theme={theme} navigate={navigate} windowWidth={windowWidth} sessionSeed={sessionSeed} view={view} activeCategory={category}/>

          {/* Barre catégories sticky — reste visible pendant le scroll du fil */}
          <div style={{ position:"sticky",top:0,zIndex:20,background:theme.bg,paddingTop:8,paddingBottom:8,marginBottom:8,borderBottom:`1px solid ${theme.border}` }}>
            <div style={{ display:"flex",gap:5,overflowX:"auto",flexWrap:"nowrap",scrollbarWidth:"none",WebkitOverflowScrolling:"touch" }}>
              {CATEGORIES.filter(c=>c!=="Mode"&&c!=="Agro-alimentaire").map(c=>{
                const cc = CATEGORY_COLORS[c]||{bg:"rgba(108,99,255,0.12)",border:"rgba(108,99,255,0.3)",text:"#6C63FF",icon:"🏷️"};
                const isActive = category === c;
                return (
                  <button key={c+"-sticky"} onClick={()=>setCategory(c)}
                    style={{ background:isActive?cc.text:cc.bg,border:`1px solid ${isActive?cc.text:cc.border}`,color:isActive?"#fff":cc.text,padding:"5px 12px",borderRadius:18,fontWeight:700,fontSize:11,flexShrink:0,whiteSpace:"nowrap",cursor:"pointer",boxShadow:isActive?`0 2px 10px ${cc.text}44`:"none",transition:"all 0.2s" }}>
                    <span style={{fontSize:10,marginRight:3}}>{cc.icon}</span>{c}
                  </button>
                );
              })}
              {["Mode","Agro-alimentaire"].map(c=>{
                const cc = CATEGORY_COLORS[c]||{bg:"rgba(108,99,255,0.12)",border:"rgba(108,99,255,0.3)",text:"#6C63FF",icon:"🏷️"};
                const isActive = category === c;
                return (
                  <button key={c+"-sticky"} onClick={()=>setCategory(c)}
                    style={{ background:isActive?cc.text:cc.bg,border:`1px solid ${isActive?cc.text:cc.border}`,color:isActive?"#fff":cc.text,padding:"5px 12px",borderRadius:18,fontWeight:700,fontSize:11,flexShrink:0,whiteSpace:"nowrap",cursor:"pointer",boxShadow:isActive?`0 2px 10px ${cc.text}44`:"none",transition:"all 0.2s" }}>
                    <span style={{fontSize:10,marginRight:3}}>{cc.icon}</span>{c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Résultats de recherche globale — boutiques, ateliers, restos, beauté */}
          {globalSearch.length > 0 && (
            <div style={{ marginBottom:24,width:"100%" }}>
              <p style={{ fontWeight:700,fontSize:14,color:theme.sub,marginBottom:12 }}>
                🔍 {globalSearch.length} résultat{globalSearch.length>1?"s":""} dans les sections — <span style={{ color:theme.text }}>"{search}"</span>
              </p>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {globalSearch.slice(0,6).map(item=>(
                  <div key={item.id} onClick={()=>{
                    if(item._type==="boutique") setView("boutiques");
                    else if(item._type==="atelier") setView("ateliers");
                    else if(item._type==="resto") setView("restos");
                    else setView("beaute");
                  }} style={{ ...cardStyle,borderRadius:14,padding:14,display:"flex",gap:12,alignItems:"center",cursor:"pointer" }}
                    className="card-hover">
                    {item.photos&&item.photos[0]&&<img src={item.photos[0]} alt="" style={{ width:52,height:52,borderRadius:10,objectFit:"cover",flexShrink:0 }}/>}
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:3 }}>
                        <span style={{ fontSize:11,fontWeight:700,color:theme.sub }}>{item._label}</span>
                        {item.ville && <span style={{ fontSize:11,color:theme.sub }}>· {item.ville}</span>}
                      </div>
                      <p style={{ fontWeight:700,fontSize:14,color:theme.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.name}</p>
                      {item.description && <p style={{ fontSize:12,color:theme.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.description}</p>}
                    </div>
                    <span style={{ color:"#6C63FF",fontSize:12,fontWeight:600,flexShrink:0 }}>Voir →</span>
                  </div>
                ))}
              </div>
              <div style={{ borderBottom:`1px solid ${theme.border}`,marginTop:16,marginBottom:4 }}/>
            </div>
          )}

          <div style={{ display:"grid",gridTemplateColumns:gridCols,gap:16,width:"100%",alignItems:"start" }}>
            {filtered.slice(0, visibleCount).map(post=>(
              <div key={post.id} id={"post-"+post.id} onClick={()=>{ sessionStorage.setItem("mdr_scroll_pos",String(window.scrollY)); sessionStorage.setItem("mdr_back_view",view); navigate("/annonce/"+post.id, { state:{ fromView:view, scrollPos:window.scrollY } }); }} className={`card-hover${isUrgentActive(post)?" card-urgent":post.sponsored?" card-sponsored":""}`} style={{ ...cardStyle,borderRadius:16,overflow:"hidden",boxShadow:"none",animation:"fadeIn 0.4s ease",border:isUrgentActive(post)?"2px solid #FF4757":post.sponsored?"2px solid #FFD700":`1px solid ${theme.border}`,cursor:"pointer" }}>
                {post.video
                  ? <VideoCardPlayer video={post.video} photos={post.photos} maxSeconds={60} autoPlay={(isUrgentActive(post)||!!post.sponsored) && windowWidth<=600}/>
                  : post.photos&&post.photos.length>0&&<PhotoCarousel photos={post.photos}/>
                }
                <div style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                    <span className="tag" style={{ background:post.category==="Véhicules"?"rgba(255,101,132,0.15)":"rgba(108,99,255,0.15)",color:post.category==="Véhicules"?"#FF6584":"#8B84FF",display:"flex",alignItems:"center",gap:4 }}>
                      {post.category==="Véhicules"&&<Icon name="car" size={10}/>}{post.category}
                    </span>
                    {(post.price||post.price_day||post.priceDay)&&(
                    <div style={{ textAlign:"right" }}>
                      {post.category==="Location de véhicules" ? (
                        <div>
                          {(post.price_day||post.priceDay) && <p style={{ fontWeight:800,color:"#FF9F43",fontSize:14 }}>🔑 {(post.price_day||post.priceDay)} FCFA/j</p>}
                          {(post.price_week||post.priceWeek) && <p style={{ color:theme.sub,fontSize:11 }}>{(post.price_week||post.priceWeek)} FCFA/sem</p>}
                          {(post.price_month||post.priceMonth) && <p style={{ color:theme.sub,fontSize:11 }}>{(post.price_month||post.priceMonth)} FCFA/mois</p>}
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontWeight:700,color:"#43C6AC",fontSize:14 }}>{post.price} FCFA</p>
                          {(()=>{ const num=parseInt((post.price||"").replace(/[^0-9]/g,"")); return num>0?<p style={{ color:theme.sub,fontSize:11 }}>≈ ${(num/600).toFixed(2)} USD</p>:null; })()}
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                  {/* Badge expiration */}
                  {post.expiresAt && (() => {
                    const d = getDaysLeft(post.expiresAt);
                    const isOwner = user && user.id === post.authorId;
                    const isAdmin = user && user.role === "admin";
                    const canSee = isOwner || isAdmin;
                    if (!canSee) return null;
                    if (d !== null && d <= 7) return (
                      isOwner
                        ? <button onClick={()=>setView("dashboard")} style={{ width:"100%",background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:8,padding:"6px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:6,cursor:"pointer",textAlign:"left" }}>
                            <span style={{ fontSize:12 }}>⚠️</span>
                            <p style={{ fontSize:12,color:"#FF4757",fontWeight:600 }}>Expire dans {d} jour{d>1?"s":""} · Prolongez →</p>
                          </button>
                        : <div style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:8,padding:"6px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:6 }}>
                            <span>⚠️</span>
                            <p style={{ fontSize:12,color:"#FF4757",fontWeight:600 }}>Expire dans {d} jour{d>1?"s":""} — {post.expiresAt}</p>
                          </div>
                    );
                    return (
                      <div style={{ background:"rgba(67,198,172,0.08)",border:"1px solid rgba(67,198,172,0.25)",borderRadius:8,padding:"5px 10px",marginBottom:8 }}>
                        <p style={{ fontSize:12,color:"#43C6AC",fontWeight:600 }}>⏳ Expire le {post.expiresAt} ({d} j restants)</p>
                      </div>
                    );
                  })()}
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:6,alignItems:"center" }}>

                    {post.sponsored && !isUrgentActive(post) && (
                      <div style={{ display:"inline-flex",alignItems:"center",gap:4,background:"linear-gradient(135deg,#FFD700,#FFA500)",borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:800,color:"#000" }}>
                        🌟 Sponsorisé
                      </div>
                    )}
                    {post.flash && new Date(post.flashUntil) > new Date() && (
                      <div style={{ display:"inline-flex",alignItems:"center",gap:4,background:"linear-gradient(135deg,#6C63FF,#8B84FF)",borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:800,color:"#fff" }}>
                        ⚡ FLASH
                      </div>
                    )}
                    {post.ownerVerified && (
                      <div style={{ display:"inline-flex",alignItems:"center",gap:4,background:"rgba(67,198,172,0.15)",border:"1px solid rgba(67,198,172,0.4)",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#43C6AC" }}>
                        ✅ Vendeur vérifié
                      </div>
                    )}
                    {/* Badge Nouveau — annonce < 24h */}
                    {post.date && (Date.now() - new Date(post.date).getTime()) < 86400000 && (
                      <div style={{ display:"inline-flex",alignItems:"center",gap:3,background:"linear-gradient(135deg,#43C6AC,#2ecc71)",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:800,color:"#fff" }}>
                        ✨ Nouveau
                      </div>
                    )}
                    {/* Compteur de vues */}
                    {liveViewers[post.id] && (
                    <span style={{ background:"rgba(255,71,87,0.15)",color:"#FF4757",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4 }}>
                      🔴 {liveViewers[post.id]} en ligne
                    </span>
                  )}
                  {(postViews[post.id]||0) > 0 && (
                      <div style={{ display:"inline-flex",alignItems:"center",gap:3,background:"rgba(154,154,176,0.1)",borderRadius:20,padding:"3px 8px",fontSize:11,color:theme.sub }}>
                        👁️ {postViews[post.id]}
                      </div>
                    )}
                  </div>
                  {post.distance!==null ? (
                    <div style={{ display:"inline-flex",alignItems:"center",gap:4,background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.3)",borderRadius:20,padding:"3px 10px",marginBottom:8,fontSize:11,color:"#43C6AC",fontWeight:700 }}>
                      📍 {formatDistance(post.distance)}
                    </div>
                  ) : (post.lat && post.lng) ? (
                    <div style={{ display:"inline-flex",alignItems:"center",gap:4,background:"rgba(67,198,172,0.08)",border:"1px solid rgba(67,198,172,0.2)",borderRadius:20,padding:"3px 10px",marginBottom:8,fontSize:11,color:"#43C6AC",fontWeight:600 }}>
                      📍 Localisation disponible
                    </div>
                  ) : null}
                  <h3 style={{ fontWeight:700,fontSize:15,marginBottom:4,lineHeight:1.3,color:theme.text }}>{post.title}</h3>
                  {getAvgRating(post.id) && (
                    <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:8 }}>
                      <div style={{ display:"flex" }}>{renderStars(getAvgRating(post.id))}</div>
                      <span style={{ fontSize:12,color:"#FFD700",fontWeight:700 }}>{getAvgRating(post.id)}</span>
                      <span style={{ fontSize:11,color:theme.sub }}>({getRatingCount(post.id)} avis)</span>
                    </div>
                  )}

                  {/* Bouton Contacter — tiroir sur PC/tablette, inline sur mobile */}
                  {!expandedContacts[post.id] && (
                    <button onClick={(e)=>{
                      e.stopPropagation();
                      if (!user || user.id !== post.authorId) {
                        const viewKey = "viewed_" + post.id;
                        if (!sessionStorage.getItem(viewKey)) {
                          sessionStorage.setItem(viewKey, "1");
                          trackView(post.id);
                          trackContact(post.id);
                        }
                      }
                      if (windowWidth > 600) {
                        setContactDrawer(post);
                      } else {
                        setExpandedContacts({ [post.id]: true });
                      }
                    }} style={{ width:"100%",background:"rgba(67,198,172,0.08)",border:"1px solid rgba(67,198,172,0.25)",color:"#43C6AC",padding:"8px 14px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all 0.2s" }}>
                      <Icon name="mail" size={14}/>
                      Contacter ▾
                    </button>
                  )}

                  {/* Panneau déplié — clic intérieur ne ferme pas */}
                  {expandedContacts[post.id] && (
                    <div id={"contact-panel-"+post.id} onClick={e=>e.stopPropagation()} style={{ marginTop:10,animation:"fadeIn 0.2s ease" }}>

                      {/* Mini fiche immobilière */}
                      {post.immo&&(
                        <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:10 }}>
                          {[{v:post.immo.transaction},{v:post.immo.sousType},{v:post.immo.superficie?(post.immo.superficie+" "+(post.immo.superficieUnit||"m²")):null},{v:post.immo.pieces?(post.immo.pieces+" pièce"+(parseInt(post.immo.pieces)>1?"s":"")):null},{v:post.immo.ville}].filter(f=>f.v).map((f,i)=>(
                            <span key={i} className="tag" style={{ background:theme.bg,border:`1px solid ${theme.border}`,color:theme.sub }}>{f.v}</span>
                          ))}
                        </div>
                      )}
                      {/* Mini fiche agro */}
                      {post.agro&&(
                        <div style={{ marginBottom:10 }}>
                          <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:6 }}>
                            {post.agro.sousCategorie&&<span className="tag" style={{ background:"rgba(22,163,74,0.1)",border:"1px solid rgba(22,163,74,0.3)",color:"#16A34A",fontWeight:600 }}>🌾 {post.agro.sousCategorie.split("(")[0].trim()}</span>}
                            {post.agro.qualite&&<span className="tag" style={{ background:theme.bg,border:`1px solid ${theme.border}`,color:theme.sub }}>{post.agro.qualite}</span>}
                            {post.agro.disponibilite&&<span className="tag" style={{ background:theme.bg,border:`1px solid ${theme.border}`,color:theme.sub }}>{post.agro.disponibilite}</span>}
                          </div>
                          <div style={{ display:"flex",gap:12,flexWrap:"wrap",fontSize:13,padding:"8px 12px",background:theme.bg,borderRadius:8,border:`1px solid rgba(22,163,74,0.2)` }}>
                            {post.agro.quantite&&<span style={{ color:theme.sub }}>📦 <b style={{ color:theme.text }}>{post.agro.quantite} {post.agro.unite}</b></span>}
                            {post.agro.prixUnitaire&&<span style={{ color:theme.sub }}>💰 <b style={{ color:"#16A34A" }}>{post.agro.prixUnitaire} FCFA</b>/{post.agro.unite}</span>}
                            {post.agro.lieuEnlevement&&<span style={{ color:theme.sub }}>📍 {post.agro.lieuEnlevement}</span>}
                            {post.agro.saisonRecolte&&<span style={{ color:theme.sub }}>🗓️ {post.agro.saisonRecolte}</span>}
                          </div>
                        </div>
                      )}

                      {/* Mini fiche véhicule */}
                      {post.vehicle&&(
                        <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:10 }}>
                          {[{k:"marque",v:post.vehicle.marque},{k:"modele",v:post.vehicle.modele},{k:"annee",v:post.vehicle.annee},{k:"carburant",v:post.vehicle.carburant},{k:"cylindree",v:post.vehicle.cylindree},{k:"etat",v:post.vehicle.etat}].filter(f=>f.v).map(f=>(
                            <span key={f.k} className="tag" style={{ background:theme.bg,border:`1px solid ${theme.border}`,color:theme.sub }}>{f.v}</span>
                          ))}
                          {post.vehicle.position&&<span className="tag" style={{ background:theme.bg,border:`1px solid ${theme.border}`,color:theme.sub,display:"flex",alignItems:"center",gap:3 }}><Icon name="pin" size={9}/>{post.vehicle.position}</span>}
                        </div>
                      )}
                      {/* Description */}
                      <p style={{ color:theme.sub,fontSize:12,lineHeight:1.4,marginBottom:10 }}>{post.description.length>120?post.description.slice(0,120)+"...":post.description}</p>

                      {/* Auteur + badge vérifié */}
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${theme.border}` }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                          <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#FF6584)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0 }}>{post.author[0]}</div>
                          <div>
                            {post.fromEstablishment
                              ? <p style={{ fontSize:12,fontWeight:700,color:"#FF6584",cursor:"pointer" }}
                                  onClick={e=>{ e.stopPropagation(); navigate("/"+post.fromEstablishment.type+"/"+post.fromEstablishment.id); }}>
                                  🏪 {post.author}
                                </p>
                              : <p style={{ fontSize:12,fontWeight:600,color:theme.text }}>{post.author}</p>
                            }
                            <p style={{ fontSize:11,color:theme.sub }}>{post.date}</p>
                          </div>
                        </div>
                        {isCertified(post.authorId||post.author_id) && <CertifiedBadge size={40}/>}
                      </div>

                      {/* Likes + Favoris + Partage */}
                      <div style={{ display:"flex",gap:4,alignItems:"center",flexWrap:"wrap",marginBottom:10 }}>
                        <button onClick={e=>{e.stopPropagation();likePost(post.id);}} style={{ background:likedPosts.includes(post.id)?"rgba(255,101,132,0.2)":"transparent",border:"none",color:likedPosts.includes(post.id)?"#FF6584":theme.sub,display:"flex",alignItems:"center",gap:4,padding:"6px 8px",borderRadius:8,fontSize:12,fontWeight:600 }}><Icon name="heart" size={13}/>{post.likes}</button>
                        <button onClick={e=>{e.stopPropagation();toggleFavorite(post.id);}} style={{ background:favorites.includes(post.id)?"rgba(255,215,0,0.2)":"transparent",border:"none",color:favorites.includes(post.id)?"#FFD700":theme.sub,padding:"6px 8px",borderRadius:8,fontSize:16,cursor:"pointer" }}>{favorites.includes(post.id)?"★":"☆"}</button>
                        <a href={"https://wa.me/?text="+encodeURIComponent("*"+post.title+"*"+"\nPrix: "+((post.price||"Non précisé").toString().includes("FCFA")?(post.price||"Non précisé"):(post.price||"Non précisé")+" FCFA")+"\nVoir: https://marcheduroi.com/annonce/"+post.id+"\n\"Sur MarchéduRoi, vous êtes le Roi du Marché 👑\"")} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                          <div style={{ background:"rgba(37,211,102,0.1)",color:"#25D366",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4,cursor:"pointer" }}>
                            <svg width="13" height="13" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                            Partager
                          </div>
                        </a>
                        <button onClick={async()=>{
                          const url="https://marcheduroi.com/annonce/"+post.id;
                          const photo = post.photos?.[0];
                          if(navigator.share && photo){
                            try {
                              let blob = await addLogoWatermark(photo);
                              if (!blob) { const r = await fetch(photo); blob = await r.blob(); }
                              const file = new File([blob], "annonce.jpg", { type: "image/jpeg" });
                              if(navigator.canShare && navigator.canShare({ files:[file] })){
                                await navigator.share({ title:post.title, text:post.title+(post.price?" — "+post.price+" FCFA":"")+".", url, files:[file] });
                                return;
                              }
                            } catch(e){}
                            navigator.share({ title:post.title, text:post.title+(post.price?" — "+post.price+" FCFA":"")+" "+url+" Sur MarchéduRoi, vous êtes le Roi du Marché 👑" });
                          } else if(navigator.share){
                            navigator.share({ title:post.title, url });
                          } else {
                            navigator.clipboard.writeText(url); notify("🔗 Lien copié !");
                          }
                        }} style={{ background:"rgba(0,0,0,0.06)",border:"none",color:theme.text,padding:"6px 8px",borderRadius:8,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:3 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                        </button>
                        {user&&(user.id===post.authorId||user.role==="admin")&&(
                          <div style={{ display:"flex",gap:4,alignItems:"center",flexWrap:"wrap" }}>
                            <button onClick={e=>{e.stopPropagation();openEdit(post);}} style={{ background:"transparent",border:"none",color:"#6C63FF",padding:6,borderRadius:6 }}><Icon name="edit" size={14}/></button>
                            <button onClick={e=>{e.stopPropagation();setModal({type:"delete",data:post});}} style={{ background:"transparent",border:"none",color:"#FF4757",padding:6,borderRadius:6 }}><Icon name="trash" size={14}/></button>
                            {!post.sponsored&&user.role!=="admin"&&<button onClick={e=>{e.stopPropagation();setModal({type:"sponsor",data:post});}} style={{ background:"rgba(255,215,0,0.12)",border:"1px solid rgba(255,215,0,0.4)",color:"#FFD700",padding:"4px 8px",borderRadius:6,fontWeight:700,fontSize:11,cursor:"pointer" }}>🌟 Sponsoriser</button>}
                            {post.sponsored&&<span style={{ color:"#FFD700",fontSize:11,fontWeight:700,padding:"4px 6px" }}>🌟 Sponsorisé</span>}
                            {!isUrgentActive(post)&&user.role!=="admin"&&<button onClick={e=>{e.stopPropagation();setModal({type:"urgent",data:post});}} style={{ background:"rgba(255,71,87,0.1)",border:"1px solid rgba(255,71,87,0.3)",color:"#FF4757",padding:"4px 8px",borderRadius:6,fontWeight:700,fontSize:11,cursor:"pointer" }}>🔥 Urgent</button>}
                            {isUrgentActive(post)&&<span style={{ color:"#FF4757",fontSize:11,fontWeight:700,padding:"4px 6px" }}>🔥 En cours</span>}
                          </div>
                        )}
                      </div>

                      {/* Infos de contact */}
                      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                        <button onClick={()=>setModal({type:"contact",data:post})} style={{ background:"rgba(67,198,172,0.12)",border:"1px solid rgba(67,198,172,0.3)",color:"#43C6AC",padding:"9px 14px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8 }}>
                          <Icon name="mail" size={14}/> Envoyer un message
                        </button>
                        {post.phone && user?.id !== post.authorId && (
                          <div style={{ display:"flex",gap:8 }}>
                            <a href={"tel:"+post.phone} style={{ flex:1,textDecoration:"none" }}>
                              <div style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"9px 14px",borderRadius:10,fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:8,cursor:"pointer" }}>
                                📞 {post.phone}
                              </div>
                            </a>
                            <a href={"https://wa.me/"+post.phone.replace(/[\s+()-]/g,"")+"?text="+encodeURIComponent("Bonjour, je suis intéressé(e) par votre annonce : *"+post.title+"*\nPrix : "+(post.price||"Non précisé")+"\nLien : https://marcheduroi.com/annonce/"+post.id)} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                              <div style={{ background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",color:"#25D366",padding:"9px 12px",borderRadius:10,fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6,cursor:"pointer" }}>
                                <svg width="14" height="14" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                                WA
                              </div>
                            </a>
                          </div>
                        )}
                        {post.lat && post.lng && (
                          <a href={"https://www.google.com/maps/dir/?api=1&destination="+post.lat+","+post.lng} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                            <div style={{ background:"rgba(66,133,244,0.1)",border:"1px solid rgba(66,133,244,0.3)",color:"#4285F4",padding:"9px 14px",borderRadius:10,fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:8,cursor:"pointer" }}>
                              🗺️ Itinéraire Google Maps
                            </div>
                          </a>
                        )}
                        {user && user.id !== (post.authorId||post.author_id) && (post.authorId||post.author_id) && (
                          <button onClick={()=>{ const ownerId=post.authorId||post.author_id; setActiveConv({postId:post.id,postTitle:post.title,postPrice:post.price,postPhoto:post.photos?.[0],receiverId:ownerId,receiverName:post.author,messages:messages.filter(m=>(m.post_id===post.id)&&((m.sender_id===user.id&&m.receiver_id===ownerId)||(m.receiver_id===user.id&&m.sender_id===ownerId)))}); setShowMessages(true); markConvRead({messages:messages.filter(m=>m.post_id===post.id&&m.receiver_id===user.id)}); }} style={{ background:"rgba(108,99,255,0.1)",border:"1px solid rgba(108,99,255,0.3)",color:"#6C63FF",padding:"9px 14px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8 }}>
                            💬 Message privé
                          </button>
                        )}
                        <button onClick={()=>setModal({type:"report",data:post})} style={{ background:"transparent",border:"none",color:theme.sub,padding:"4px 0",fontSize:11,cursor:"pointer",textAlign:"left" }}>
                          🚩 Signaler cette annonce
                        </button>
                      </div>
                      {/* Bouton Masquer en bas du panneau */}
                      <button onClick={e=>{ e.stopPropagation(); setExpandedContacts({}); }}
                        style={{ width:"100%",background:"rgba(67,198,172,0.15)",border:"1px solid rgba(67,198,172,0.5)",color:"#43C6AC",padding:"8px 14px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:10,transition:"all 0.2s" }}>
                        <Icon name="mail" size={14}/> Masquer ▲
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {filtered.length===0 && postsLoaded && (
            <div style={{ textAlign:"center",padding:"60px 0",color:theme.sub }}>
              <p style={{ fontSize:40,marginBottom:12 }}>🔍</p>
              <p style={{ fontWeight:600,marginBottom:8 }}>Aucune annonce trouvée{!showAllCountries?" dans votre pays":""}</p>
              <p style={{ fontSize:13,marginBottom:16 }}>
                {!showAllCountries ? "Il n'y a pas encore d'annonces dans votre pays." : "Essayez une autre catégorie ou modifiez votre recherche."}
              </p>
              {!showAllCountries && (
                <button onClick={()=>setShowAllCountries(true)} style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"12px 24px",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer" }}>
                  🌍 Voir toutes les annonces
                </button>
              )}
            </div>
          )}

          {/* Bouton voir toutes les annonces si filtre pays actif */}
          {filtered.length > 0 && !showAllCountries && !search && postsLoaded && (
            <div style={{ textAlign:"center",marginTop:16,marginBottom:8 }}>
              <button onClick={()=>setShowAllCountries(true)} style={{ background:"transparent",border:`1px solid ${theme.border}`,color:theme.sub,padding:"8px 20px",borderRadius:20,fontWeight:600,fontSize:13,cursor:"pointer" }}>
                🌍 Voir les annonces de tous les pays
              </button>
            </div>
          )}
          {showAllCountries && !search && postsLoaded && (
            <div style={{ textAlign:"center",marginTop:8,marginBottom:8 }}>
              <button onClick={()=>setShowAllCountries(false)} style={{ background:"transparent",border:`1px solid ${theme.border}`,color:"#6C63FF",padding:"8px 20px",borderRadius:20,fontWeight:600,fontSize:13,cursor:"pointer" }}>
                📍 Afficher mon pays uniquement
              </button>
            </div>
          )}

          {/* Voir plus */}
          {filtered.length > visibleCount && (
            <div style={{ textAlign:"center",marginTop:32 }}>
              <p style={{ color:theme.sub,fontSize:13,marginBottom:12 }}>
                Affichage de {Math.min(visibleCount,filtered.length)} sur {filtered.length} annonces
              </p>
              <button onClick={()=>setVisibleCount(v=>v+POSTS_PER_PAGE)} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"12px 32px",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer",transition:"box-shadow 0.2s" }}>
                Voir plus ({filtered.length-visibleCount} restantes) ↓
              </button>
            </div>
          )}
          {filtered.length > POSTS_PER_PAGE && visibleCount >= filtered.length && (
            <div style={{ textAlign:"center",marginTop:24 }}>
              <button onClick={()=>setVisibleCount(12)} style={{ background:"transparent",border:`1px solid ${theme.border}`,color:theme.sub,padding:"10px 24px",borderRadius:12,fontWeight:600,fontSize:13,cursor:"pointer" }}>
                ↑ Réduire la liste
              </button>
            </div>
          )}
          </>)} {/* fin postsLoaded */}
        </div>
      )}



      {/* DASHBOARD */}
      {view==="dashboard"&&user&&(
        <div style={{ width:"100%",maxWidth:900,margin:"0 auto",padding:"clamp(12px,3vw,40px)",animation:"fadeIn 0.4s ease" }}>
          <div style={{ ...cardStyle,borderRadius:20,padding:32,marginBottom:24 }}>
            <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:20 }}>
              <div style={{ width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#FF6584)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:800,color:"#fff" }}>{user.name[0]}</div>
              <div>
                <h2 style={{ fontWeight:800,fontSize:22,color:theme.text }}>{user.name}</h2>
                <div style={{ display:"flex",gap:8,marginTop:4 }}>
                  <span className="tag" style={{ background:"rgba(154,154,176,0.15)",color:theme.sub }}>Membre</span>
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
                    <button onClick={e=>{e.stopPropagation();toggleFavorite(post.id);}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>Retirer</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Historique des transactions */}
          {myPosts.filter(p=>p.expired).length > 0 && (
            <div style={{ marginBottom:24 }}>
              <h3 style={{ fontWeight:700,fontSize:16,marginBottom:12,color:theme.sub,display:"flex",alignItems:"center",gap:8 }}>
                📋 Historique ({myPosts.filter(p=>p.expired).length} expirées)
              </h3>
              {myPosts.filter(p=>p.expired).map(post=>(
                <div key={post.id} style={{ ...cardStyle,borderRadius:12,padding:14,marginBottom:8,opacity:0.7 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div>
                      <p style={{ fontWeight:600,color:theme.text,marginBottom:2 }}>{post.title}</p>
                      <p style={{ color:theme.sub,fontSize:12 }}>{post.category} · Expirée le {post.expiresAt}</p>
                    </div>
                    <button onClick={()=>{ notify("💡 Choisissez une durée pour republier cette annonce."); setModal({type:"sponsor",data:{...post,expiresAt:null}}); }} style={{ background:"linear-gradient(135deg,rgba(108,99,255,0.2),rgba(255,101,132,0.1))",border:"1px solid rgba(108,99,255,0.4)",color:"#6C63FF",padding:"7px 12px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
                      🔄 Republier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Statistiques globales vendeur */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:24 }}>
            {[
              { label:"Mes annonces", val:myPosts.length, color:"#6C63FF", icon:"📋" },
              { label:"Total vues", val:myPosts.reduce((a,p)=>a+(postViews[p.id]||0),0), color:"#43C6AC", icon:"👁️" },
              { label:"Total contacts", val:myPosts.reduce((a,p)=>a+(contactClicks[p.id]||0),0), color:"#FF6584", icon:"💬" },
              { label:"Total likes", val:myPosts.reduce((a,p)=>a+p.likes,0), color:"#FFD700", icon:"❤️" },
              { label:"Sponsorisées", val:myPosts.filter(p=>p.sponsored).length, color:"#FFD700", icon:"🌟" },
            ].map(s=>(
              <div key={s.label} style={{ ...cardStyle,borderRadius:14,padding:16,textAlign:"center" }}>
                <p style={{ fontSize:22,marginBottom:4 }}>{s.icon}</p>
                <p style={{ fontSize:24,fontWeight:800,color:s.color }}>{s.val}</p>
                <p style={{ color:theme.sub,fontSize:11,fontWeight:600 }}>{s.label}</p>
              </div>
            ))}
          </div>

          <h3 style={{ fontWeight:700,fontSize:18,marginBottom:16,color:theme.text }}>Mes annonces ({myPosts.length})</h3>
          {myPosts.map(post=>(
            <div key={post.id} style={{ ...cardStyle,borderRadius:14,padding:16,marginBottom:12 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap",marginBottom:12 }}>
                <div style={{ display:"flex",gap:12,alignItems:"center" }}>
                  {post.photos&&post.photos.length>0&&<img src={post.photos[0]} alt="" style={{ width:52,height:52,borderRadius:8,objectFit:"cover",flexShrink:0 }}/>}
                  <div>
                    <p style={{ fontWeight:700,marginBottom:4,color:theme.text }}>{post.title}</p>
                    <p style={{ color:theme.sub,fontSize:12 }}>{post.category}{post.vehicle?` · ${post.vehicle.marque} ${post.vehicle.modele}`:""} · {post.date}</p>
                    {post.sponsored&&<span style={{ background:"rgba(255,215,0,0.15)",color:"#FFD700",padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:700,display:"inline-block",marginTop:4 }}>🌟 Sponsorisé jusqu'au {post.sponsoredUntil}</span>}
                    {post.expiresAt&&<span style={{ background:"rgba(255,71,87,0.1)",color:"#FF4757",padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600,display:"inline-block",marginTop:4,marginLeft:4 }}>⏳ Expire le {post.expiresAt}</span>}
                  </div>
                </div>
                <div style={{ display:"flex",gap:8,flexShrink:0,flexWrap:"wrap" }}>
                  {post.expiresAt&&<button onClick={()=>setModal({type:"prolong",data:post})} style={{ background:"rgba(67,198,172,0.15)",border:"none",color:"#43C6AC",padding:"7px 12px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>⏳ Prolonger</button>}
                  {!post.sponsored && !isUrgentActive(post) && <button onClick={e=>{e.stopPropagation();setModal({type:"sponsor",data:post});}} style={{ background:"rgba(255,215,0,0.15)",border:"none",color:"#FFD700",padding:"7px 12px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>🌟 Sponsoriser</button>}
                  {isUrgentActive(post) && post.sponsored && <span style={{ fontSize:11,color:"#FF8C00",fontWeight:600,padding:"7px 12px" }}>🌟 Sponsorisé suspendu</span>}
                  {!isUrgentActive(post) && <button onClick={e=>{e.stopPropagation();setModal({type:"urgent",data:post});}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"7px 12px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>🔥 Urgent</button>}
                  {isUrgentActive(post) && <button onClick={()=>removeUrgent(post.id)} style={{ background:"rgba(255,71,87,0.15)",border:"1px solid rgba(255,71,87,0.4)",color:"#FF4757",padding:"7px 12px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>✕ Retirer urgent</button>}
                  <button onClick={e=>{e.stopPropagation();openEdit(post);}} style={{ background:"rgba(108,99,255,0.15)",border:"none",color:"#6C63FF",padding:"7px 12px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>✏️ Modifier</button>
                  <button onClick={e=>{e.stopPropagation();setModal({type:"delete",data:post});}} style={{ background:"rgba(255,71,87,0.1)",border:"none",color:"#FF4757",padding:"7px 12px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer" }}>🗑️</button>
                </div>
              </div>
              {/* Stats par annonce */}
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {[
                  { icon:"👁️", val:postViews[post.id]||0, label:"vues", color:"#43C6AC" },
                  { icon:"💬", val:contactClicks[post.id]||0, label:"contacts", color:"#6C63FF" },
                  { icon:"❤️", val:post.likes, label:"likes", color:"#FF6584" },
                  { icon:"⭐", val:getAvgRating(post.id)?`${getAvgRating(post.id)}/5`:"–", label:"note", color:"#FFD700" },
                  { icon:"📊", val: postViews[post.id]>0 ? Math.round((contactClicks[post.id]||0)/postViews[post.id]*100)+"%" : "–", label:"conversion", color:"#43C6AC" },
                  { icon:"✏️", val:"∞", label:"modifs gratuites", color:"#43C6AC" },
                ].map(s=>(
                  <div key={s.label} style={{ background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:8,padding:"5px 10px",display:"flex",alignItems:"center",gap:4 }}>
                    <span style={{ fontSize:12 }}>{s.icon}</span>
                    <span style={{ fontWeight:700,color:s.color,fontSize:13 }}>{s.val}</span>
                    <span style={{ color:theme.sub,fontSize:11 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {view==="admin"&&user?.role==="admin"&&(
        <AdminPanel
          theme={theme} notify={notify}
          posts={posts} setPosts={setPosts}
          boutiques={boutiques} setBoutiques={setBoutiques}
          ateliers={ateliers} setAteliers={setAteliers}
          restos={restos} setRestos={setRestos}
          beaute={beaute} setBeaute={setBeaute}
          user={user} windowWidth={windowWidth} t={t}
          setView={setView} setModal={setModal} view={view}
          adRequests={adRequests} setAdRequests={setAdRequests}
          ads={ads} setAds={setAds}
          openEditPost={openEdit}
          openEditShopFromApp={openEditShop}
        />
      )}
      {/* À PROPOS */}
      {/* LOGIN */}
      {view==="login"&&(
        <div style={{ maxWidth:420,margin:"60px auto",padding:"0 24px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ ...cardStyle,borderRadius:20,padding:36 }}>
            <h2 style={{ fontWeight:800,fontSize:26,marginBottom:6,color:theme.text }}>Connexion</h2>
            <p style={{ color:theme.sub,fontSize:13,marginBottom:28 }}>Connectez-vous à votre compte</p>
            {[{label:"Email",key:"email",type:"email"},{label:"Mot de passe",key:"password",type:"password"}].map(f=>(
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>{f.label}</label>
                {f.key==="password" ? (
                  <div style={{ position:"relative" }}>
                    <input type={showPassword?"text":"password"} value={authForm[f.key]} onChange={e=>setAuthForm(a=>({...a,[f.key]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="••••••••" maxLength={64} style={{ ...inputStyle,paddingRight:44 }}/>
                    <button type="button" onClick={()=>setShowPassword(s=>!s)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:theme.sub,cursor:"pointer",fontSize:18 }}>{showPassword?"🙈":"👁️"}</button>
                  </div>
                ) : (
                  <input type="email" value={authForm[f.key]} onChange={e=>{ setAuthForm(a=>({...a,email:onlyEmail(e.target.value)})); setLoginError(null); }} placeholder="contact@marcheduroi.com" maxLength={80} inputMode="email" style={inputStyle}/>
                )}
              </div>
            ))}
            <button onClick={login} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,marginTop:8,transition:"box-shadow 0.2s" }}>Se connecter</button>

            {/* Message d'erreur inline */}
            {loginError==="unknown_email" && (
              <div style={{ marginTop:14,padding:"14px 16px",background:"rgba(255,71,87,0.08)",border:"1px solid rgba(255,71,87,0.3)",borderRadius:12,textAlign:"center" }}>
                <p style={{ color:"#FF4757",fontWeight:700,fontSize:14,marginBottom:6 }}>❌ Cet email n'est pas encore inscrit</p>
                <p style={{ color:theme.sub,fontSize:12,marginBottom:10 }}>Créez votre compte gratuit pour continuer</p>
                <button onClick={()=>{ setLoginError(null); setView("register"); }} style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"8px 20px",borderRadius:20,fontWeight:700,fontSize:13,cursor:"pointer" }}>
                  ✨ Inscrivez-vous gratuitement
                </button>
              </div>
            )}
            {loginError==="wrong_password" && (
              <div style={{ marginTop:14,padding:"14px 16px",background:"rgba(255,165,0,0.08)",border:"1px solid rgba(255,165,0,0.3)",borderRadius:12,textAlign:"center" }}>
                <p style={{ color:"#FFA500",fontWeight:700,fontSize:14,marginBottom:6 }}>🔑 Vous êtes déjà inscrit</p>
                <p style={{ color:theme.sub,fontSize:12,marginBottom:10 }}>Mot de passe incorrect — vous avez oublié votre mot de passe ?</p>
                <button onClick={()=>{ setLoginError(null); setModal({type:"forgot"}); }} style={{ background:"linear-gradient(135deg,#FFA500,#FFD700)",border:"none",color:"#fff",padding:"8px 20px",borderRadius:20,fontWeight:700,fontSize:13,cursor:"pointer" }}>
                  🔓 Réinitialiser mon mot de passe
                </button>
              </div>
            )}

            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16 }}>
              <p style={{ color:theme.sub,fontSize:13 }}>Pas de compte ? <button onClick={()=>setView("register")} style={{ background:"none",border:"none",color:"#6C63FF",fontWeight:600,cursor:"pointer" }}>S'inscrire</button></p>
              <button onClick={()=>setModal({type:"forgot"})} style={{ background:"none",border:"none",color:theme.sub,fontSize:13,cursor:"pointer",textDecoration:"underline" }}>Mot de passe oublié ?</button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER */}
      {view==="register"&&(()=>{ const PHONE_CODES={"BJ":"+229 ","TG":"+228 ","CI":"+225 ","SN":"+221 ","ML":"+223 ","BF":"+226 ","NE":"+227 ","GN":"+224 ","NG":"+234 ","CM":"+237 ","CG":"+242 ","CD":"+243 ","GA":"+241 ","MG":"+261 ","RW":"+250 ","BI":"+257 ","TD":"+235 ","MR":"+222 ","FR":"+33 ","BE":"+32 ","CH":"+41 ","CA":"+1 "}; if(!authForm.phone&&detectedCountry&&PHONE_CODES[detectedCountry]){ setAuthForm(a=>({...a,phone:PHONE_CODES[detectedCountry],country:detectedCountry})); } return true; })()&&(
        <div style={{ maxWidth:420,margin:"60px auto",padding:"0 24px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ ...cardStyle,borderRadius:20,padding:36 }}>
            <h2 style={{ fontWeight:800,fontSize:26,marginBottom:6,color:theme.text }}>Créer un compte</h2>
            <p style={{ color:theme.sub,fontSize:13,marginBottom:28 }}>Lecture toujours gratuite</p>
            {[{label:"Nom complet",key:"name",type:"text"},{label:"Email",key:"email",type:"email"},{label:"Mot de passe",key:"password",type:"password"}].map(f=>(
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>{f.label}</label>
                {f.key==="password" ? (
                  <div style={{ position:"relative" }}>
                    <input type={showPassword?"text":"password"} value={authForm[f.key]} onChange={e=>setAuthForm(a=>({...a,[f.key]:e.target.value}))} placeholder="Min. 6 caractères" maxLength={64} style={{ ...inputStyle,paddingRight:44 }}/>
                    <button type="button" onClick={()=>setShowPassword(s=>!s)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:theme.sub,cursor:"pointer",fontSize:18 }}>{showPassword?"🙈":"👁️"}</button>
                  </div>
                ) : f.key==="email" ? (
                  <input type="email" value={authForm[f.key]} onChange={e=>setAuthForm(a=>({...a,email:noSpaces(e.target.value).toLowerCase()}))} placeholder="contact@marcheduroi.com" maxLength={80} inputMode="email" style={inputStyle}/>
                ) : (
                  <input type="text" value={authForm[f.key]} onChange={e=>setAuthForm(a=>({...a,name:cleanText(e.target.value,60)}))} placeholder="Votre prénom et nom" maxLength={60} style={inputStyle}/>
                )}
              </div>
            ))}
            {/* Pays */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>🌍 Pays</label>
              <select value={authForm.country} onChange={e=>{
                const PHONE_CODES={"BJ":"+229 ","TG":"+228 ","CI":"+225 ","SN":"+221 ","ML":"+223 ","BF":"+226 ","NE":"+227 ","GN":"+224 ","NG":"+234 ","CM":"+237 ","CG":"+242 ","CD":"+243 ","GA":"+241 ","MG":"+261 ","RW":"+250 ","BI":"+257 ","TD":"+235 ","MR":"+222 ","FR":"+33 ","BE":"+32 ","CH":"+41 ","CA":"+1 ","OTHER":"+"}; 
                setAuthForm(a=>({...a,country:e.target.value,phone:PHONE_CODES[e.target.value]||""}));
              }} style={inputStyle}>
                {[
                  {code:"BJ",name:"🇧🇯 Bénin"},{code:"TG",name:"🇹🇬 Togo"},{code:"CI",name:"🇨🇮 Côte d'Ivoire"},
                  {code:"SN",name:"🇸🇳 Sénégal"},{code:"ML",name:"🇲🇱 Mali"},{code:"BF",name:"🇧🇫 Burkina Faso"},
                  {code:"NE",name:"🇳🇪 Niger"},{code:"GN",name:"🇬🇳 Guinée"},{code:"NG",name:"🇳🇬 Nigeria"},
                  {code:"CM",name:"🇨🇲 Cameroun"},{code:"CG",name:"🇨🇬 Congo"},{code:"CD",name:"🇨🇩 RD Congo"},
                  {code:"GA",name:"🇬🇦 Gabon"},{code:"MG",name:"🇲🇬 Madagascar"},{code:"RW",name:"🇷🇼 Rwanda"},
                  {code:"BI",name:"🇧🇮 Burundi"},{code:"TD",name:"🇹🇩 Tchad"},{code:"MR",name:"🇲🇷 Mauritanie"},
                  {code:"FR",name:"🇫🇷 France"},{code:"BE",name:"🇧🇪 Belgique"},{code:"CH",name:"🇨🇭 Suisse"},
                  {code:"CA",name:"🇨🇦 Canada"},{code:"OTHER",name:"🌍 Autre pays"},
                ].map(p=><option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
            </div>
            {/* Téléphone / WhatsApp */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>📱 Téléphone / WhatsApp <span style={{ color:"#FF4757",fontSize:13 }}>*</span></label>
              <input
                type="tel"
                value={authForm.phone}
                onChange={e=>setAuthForm(a=>({...a,phone:e.target.value}))}
                placeholder="Ex: +229 01 23 45 67"
                maxLength={25}
                inputMode="tel"
                style={inputStyle}
              />
            </div>

            <button onClick={register} className="btn-glow" disabled={!authForm.name||!authForm.email||!authForm.password||!authForm.phone} style={{ width:"100%",padding:"14px",background:(!authForm.name||!authForm.email||!authForm.password||!authForm.phone)?"rgba(108,99,255,0.4)":"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,marginTop:8,transition:"box-shadow 0.2s",cursor:(!authForm.name||!authForm.email||!authForm.password||!authForm.phone)?"not-allowed":"pointer" }}>Créer mon compte</button>
            {/* Widget Turnstile */}
            <div style={{ marginTop:16,display:"flex",justifyContent:"center" }}>
              <div ref={turnstileRef} />
            </div>
            <p style={{ textAlign:"center",marginTop:20,color:theme.sub,fontSize:13 }}>Déjà inscrit ? <button onClick={()=>setView("login")} style={{ background:"none",border:"none",color:"#6C63FF",fontWeight:600,cursor:"pointer" }}>Se connecter</button></p>
          </div>
        </div>
      )}

      {/* ── RECRUTEMENT ── */}
      {view==="recrutement"&&(
        <RecrutementSection
          theme={theme} user={user} setModal={setModal} windowWidth={windowWidth} posts={posts} view={view} cardStyle={cardStyle}
        />
      )}


      {/* À PROPOS */}
      {view==="about"&&(
        <AboutSection
          theme={theme} user={user} setView={setView} setModal={setModal} notify={notify} navigate={navigate} windowWidth={windowWidth} t={t} boutiques={boutiques} ateliers={ateliers} restos={restos} beaute={beaute} view={view} search={search} setSearch={setSearch} featuredPosts={featuredPosts} likedPosts={likedPosts} likePost={likePost} isCertified={isCertified}
        />
      )}


      {/* BOUTIQUES */}
      {(view==="boutiques"||view==="ateliers"||view==="restos"||view==="beaute")&&(
        <ShopSection
          view={view} theme={theme}
          boutiques={boutiques} ateliers={ateliers} restos={restos} beaute={beaute}
          setBoutiques={setBoutiques} setAteliers={setAteliers} setRestos={setRestos} setBeaute={setBeaute}
          navigate={navigate} windowWidth={windowWidth} t={t}
          setView={setView} setModal={setModal} user={user}
          featuredPosts={featuredPosts} isCertified={isCertified} notify={notify}
          cardStyle={cardStyle} search={search} setSearch={setSearch}
          openEditShop={openEditShop}
          setShopMode={setShopMode} setShopForm={setShopForm}
          setShopPhotos={setShopPhotos} setShopVideo={setShopVideo}
          setMonths={setMonths}
          sessionSeed={sessionSeed}
          setActiveConv={setActiveConv}
          getAvgRating={getAvgRating}
          likePost={likePost}
          likedPosts={likedPosts}
          getRatingCount={getRatingCount}
        />
      )}
      {view==="stats"&&(
        <StatsSection
          theme={theme} user={user} setView={setView} setModal={setModal} notify={notify} posts={posts} boutiques={boutiques} ateliers={ateliers} restos={restos} beaute={beaute} view={view} cardStyle={cardStyle}
        />
      )}

      {/* PAGE RÉINITIALISATION MOT DE PASSE */}
      {view==="reset-password"&&(
        <div style={{ maxWidth:420,margin:"80px auto",padding:"0 24px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ ...cardStyle,borderRadius:20,padding:36 }}>
            <div style={{ textAlign:"center",marginBottom:28 }}>
              <p style={{ fontSize:48,marginBottom:12 }}>🔑</p>
              <h2 style={{ fontWeight:800,fontSize:24,color:theme.text,marginBottom:8 }}>Nouveau mot de passe</h2>
              <p style={{ color:theme.sub,fontSize:13 }}>Choisissez un nouveau mot de passe sécurisé</p>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Nouveau mot de passe</label>
              <div style={{ position:"relative" }}>
                <input
                  type={showPassword?"text":"password"}
                  value={newPassword}
                  onChange={e=>setNewPassword(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&updatePassword()}
                  placeholder="Min. 6 caractères"
                  style={{ ...inputStyle,paddingRight:44 }}
                />
                <button type="button" onClick={()=>setShowPassword(s=>!s)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:theme.sub,cursor:"pointer",fontSize:18 }}>
                  {showPassword?"🙈":"👁️"}
                </button>
              </div>
            </div>
            {/* Force indicator */}
            {newPassword.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex",gap:4,marginBottom:4 }}>
                  {[1,2,3,4].map(i=>(
                    <div key={i} style={{ flex:1,height:4,borderRadius:4,background:
                      newPassword.length < 6 && i<=1 ? "#FF4757" :
                      newPassword.length >= 6 && newPassword.length < 8 && i<=2 ? "#FF8C00" :
                      newPassword.length >= 8 && newPassword.length < 10 && i<=3 ? "#FFD700" :
                      newPassword.length >= 10 && i<=4 ? "#43C6AC" : theme.border
                    }}/>
                  ))}
                </div>
                <p style={{ fontSize:11,color:theme.sub }}>
                  {newPassword.length < 6 ? "❌ Trop court" : newPassword.length < 8 ? "⚠️ Faible" : newPassword.length < 10 ? "👍 Moyen" : "✅ Fort"}
                </p>
              </div>
            )}
            <button onClick={updatePassword} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s",cursor:"pointer" }}>
              ✅ Confirmer le nouveau mot de passe
            </button>
            <button onClick={()=>{ setView("login"); setNewPassword(""); }} style={{ width:"100%",padding:"10px",background:"transparent",border:"none",color:theme.sub,fontSize:13,marginTop:10,cursor:"pointer" }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* CONDITIONS GÉNÉRALES D'UTILISATION */}
      {view==="terms"&&(
        <TermsSection
          theme={theme} setView={setView} boutiques={boutiques} ateliers={ateliers} view={view}
        />
      )}
      {/* PARRAINAGE */}
      {view==="parrainage"&&(
        <ParrainageSection
          theme={theme} user={user} setView={setView} setModal={setModal} notify={notify} t={t} boutiques={boutiques} ateliers={ateliers} restos={restos} view={view} inputStyle={inputStyle} cardStyle={cardStyle}
        />
      )}

      {/* MODALS */}
      {modal&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setModal(null)}} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:24,backdropFilter:"blur(4px)" }}>
          <div style={{ ...cardStyle,borderRadius:20,padding:32,width:"100%",maxWidth:580,animation:"fadeIn 0.25s ease",maxHeight:"92vh",overflowY:"auto" }}>

            {/* ADD / EDIT */}
            {(modal.type==="add"||modal.type==="edit")&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>{modal.type==="add"?"Nouvelle annonce":"Modifier l'annonce"}</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                {modal.type==="add" && (
                  <button onClick={()=>window.open("https://marcheduroi.com/exemples.html","_blank")} style={{ width:"100%",marginBottom:16,padding:"10px",background:"rgba(67,198,172,0.08)",border:"1px dashed rgba(67,198,172,0.4)",color:"#43C6AC",borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                    📖 Voir des exemples de publications avant de commencer
                  </button>
                )}

                {/* Catégorie en premier */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Catégorie</label>
                  <select value={postForm.category} onChange={e=>setPostForm(p=>({...p,category:e.target.value}))} style={inputStyle}>
                    {CATEGORIES.filter(c=>c!=="Toutes").map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>


                <div style={{ background:"rgba(67,198,172,0.06)",border:"1px solid rgba(67,198,172,0.2)",borderRadius:10,padding:12,marginBottom:8 }}>
                  <p style={{ color:"#43C6AC",fontWeight:700,fontSize:12,margin:"0 0 4px" }}>📐 Dimensions recommandées</p>
                  <p style={{ color:"#9A9AB0",fontSize:11,margin:0,lineHeight:1.7 }}>
                    Photos : <strong style={{color:"#E8E8F0"}}>800×600px</strong> (ratio 4:3) ou <strong style={{color:"#E8E8F0"}}>1200×900px</strong> · Hébergez sur <strong style={{color:"#E8E8F0"}}>ImgBB.com</strong> (gratuit) puis copiez le lien direct
                  </p>
                </div>
                <PhotoUploader photos={postPhotos} setPhotos={setPostPhotos} theme={theme} folder="annonces"/>

                {/* Lien vidéo annonce classique */}
                {(()=>{
                  const isYT = v => /youtube\.com|youtu\.be/.test(v||"");
                  const isCL = v => /cloudinary\.com/.test(v||"");
                  const getYTId = v => { const m = (v||"").match(/(?:v=|youtu\.be\/)([\w-]{11})/); return m?m[1]:null; };
                  return (
                    <div style={{ marginBottom:16 }}>
                      <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>🎬 Lien vidéo (optionnel)</label>
                      <div style={{ display:"flex",alignItems:"flex-start",gap:6,marginBottom:7,padding:"8px 10px",background:"rgba(255,71,87,0.06)",borderRadius:8,border:"1px solid rgba(255,71,87,0.2)" }}>
                        <span style={{ fontSize:13,marginTop:1 }}>⚠️</span>
                        <span style={{ fontSize:11,color:"#FF6584",lineHeight:1.5 }}>La vidéo doit montrer uniquement le produit ou service de cette annonce. Toute vidéo hors-sujet entraîne la suppression de l'annonce. Les annonces sponsorisées et urgentes bénéficient de la lecture automatique.</span>
                      </div>
                      <input
                        value={postVideo||""}
                        onChange={e=>setPostVideo(e.target.value.trim())}
                        placeholder="https://youtu.be/... ou https://res.cloudinary.com/..."
                        style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}
                      />
                      {isYT(postVideo) && getYTId(postVideo) && (
                        <div style={{ marginTop:8,borderRadius:10,overflow:"hidden" }}>
                          <iframe width="100%" height="160" src={`https://www.youtube.com/embed/${getYTId(postVideo)}`} frameBorder="0" allowFullScreen style={{ display:"block",borderRadius:10 }}/>
                        </div>
                      )}
                      {isCL(postVideo) && (
                        <video src={postVideo} controls style={{ width:"100%",borderRadius:10,marginTop:8,maxHeight:180 }}/>
                      )}
                      <details style={{ marginTop:8 }}>
                        <summary style={{ fontSize:12,color:"#6C63FF",cursor:"pointer",fontWeight:600 }}>📋 Comment ajouter ma vidéo ?</summary>
                        <div style={{ background:theme.bg,borderRadius:8,padding:10,marginTop:6,fontSize:12,color:theme.sub,lineHeight:1.6 }}>
                          <p style={{ fontWeight:700,color:theme.text,marginBottom:4 }}>Option 1 — YouTube (recommandé)</p>
                          <p>1. Allez sur youtube.com et connectez-vous</p>
                          <p>2. Cliquez "Créer" → "Mettre en ligne une vidéo"</p>
                          <p>3. Choisissez "Non répertorié" pour la confidentialité</p>
                          <p>4. Copiez le lien et collez-le ici</p>
                          <p style={{ fontWeight:700,color:theme.text,marginTop:6,marginBottom:4 }}>Option 2 — Cloudinary</p>
                          <p>1. Créez un compte gratuit sur cloudinary.com</p>
                          <p>2. Uploadez votre vidéo dans Media Library</p>
                          <p>3. Copiez l'URL et collez-la ici</p>
                          <p style={{ marginTop:6,color:"#FF6584" }}>⚠️ Durée recommandée : max 60 secondes pour une annonce classique</p>
                        </div>
                      </details>
                    </div>
                  );
                })()}

                {/* Champs généraux */}
                {[
                  {label:"Titre *",       key:"title",   type:"input",    max:100, fn: v=>cleanText(v,100)},
                  {label:"Description *", key:"description",type:"textarea",max:1000,fn: v=>cleanLongText(v,1000)},
                  {label: postForm.category==="Location de véhicules" ? "Prix de vente (optionnel)" : "Prix", key:"price", type:"input", max:30, fn: formatThousands, hint: postForm.category==="Location de véhicules" ? "Ex: 5 000 000 (si à vendre aussi)" : "Ex: 15 000", mode:"numeric"},
                  {label:"Email de contact",key:"contact",type:"input",   max:80,  fn: noSpaces,         hint:"Ex: nom@email.com"},
                  {label:"Téléphone / WhatsApp",key:"phone",type:"input", max:20,  fn: onlyPhone,    hint:getPhonePlaceholder()},
                ].map(f=>(
                  <div key={f.key} style={{ marginBottom:16 }}>
                    <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>{f.label}</label>
                    {f.type==="textarea"
                      ? <textarea value={postForm[f.key]} onChange={e=>setPostForm(p=>({...p,[f.key]:f.fn(e.target.value)}))} rows={3} maxLength={f.max} style={{ ...inputStyle,resize:"vertical" }}/>
                      : <input value={postForm[f.key]} onChange={e=>setPostForm(p=>({...p,[f.key]:f.fn(e.target.value)}))} placeholder={f.hint||""} maxLength={f.max} inputMode={f.key==="phone"?"tel":f.key==="price"?"numeric":"text"} style={inputStyle}/>
                    }
                  </div>
                ))}

                {/* Champs tarifs location */}
                {postForm.category==="Location de véhicules"&&(
                  <div style={{ marginTop:8 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16,padding:"12px 16px",background:theme.bg,border:"1px solid rgba(255,159,67,0.4)",borderRadius:10 }}>
                      <span style={{ fontSize:18 }}>🔑</span>
                      <p style={{ fontWeight:700,color:"#FF9F43",fontSize:14 }}>Tarifs de location</p>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr",gap:12,marginBottom:12 }}>
                      <div>
                        <label style={{ fontSize:13,fontWeight:700,color:theme.sub,display:"block",marginBottom:6 }}>Prix / jour * <span style={{ color:"#FF9F43" }}>(obligatoire)</span></label>
                        <div style={{ position:"relative" }}>
                          <input value={postForm.priceDay} onChange={e=>setPostForm(p=>({...p,priceDay:formatThousands(e.target.value)}))} placeholder="Ex: 15 000" inputMode="numeric" maxLength={20} style={inputStyle}/>
                          <span style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:theme.sub,fontSize:12,fontWeight:600 }}>FCFA/jour</span>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Prix / semaine <span style={{ color:theme.sub,fontSize:11 }}>(optionnel)</span></label>
                        <div style={{ position:"relative" }}>
                          <input value={postForm.priceWeek} onChange={e=>setPostForm(p=>({...p,priceWeek:formatThousands(e.target.value)}))} placeholder="Ex: 80 000" inputMode="numeric" maxLength={20} style={inputStyle}/>
                          <span style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:theme.sub,fontSize:12,fontWeight:600 }}>FCFA/sem</span>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Prix / mois <span style={{ color:theme.sub,fontSize:11 }}>(optionnel)</span></label>
                        <div style={{ position:"relative" }}>
                          <input value={postForm.priceMonth} onChange={e=>setPostForm(p=>({...p,priceMonth:formatThousands(e.target.value)}))} placeholder="Ex: 250 000" inputMode="numeric" maxLength={20} style={inputStyle}/>
                          <span style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:theme.sub,fontSize:12,fontWeight:600 }}>FCFA/mois</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Champs Agro-alimentaire */}
                {isAgro&&(
                  <div style={{ marginTop:8 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16,padding:"12px 16px",background:theme.bg,border:"1px solid rgba(22,163,74,0.4)",borderRadius:10 }}>
                      <span style={{ fontSize:18 }}>🌾</span>
                      <p style={{ fontWeight:700,color:"#16A34A",fontSize:14 }}>Fiche Agro-alimentaire</p>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Sous-catégorie *</label>
                      <select value={agroForm.sousCategorie} onChange={e=>setAgroForm(f=>({...f,sousCategorie:e.target.value}))} style={inputStyle}>
                        <option value="">-- Choisir --</option>
                        {AGRO_SOUS_CATEGORIES.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                      <div>
                        <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Quantité disponible *</label>
                        <input value={agroForm.quantite} onChange={e=>setAgroForm(f=>({...f,quantite:e.target.value}))} placeholder="Ex: 50" inputMode="numeric" maxLength={10} style={inputStyle}/>
                      </div>
                      <div>
                        <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Unité</label>
                        <select value={agroForm.unite} onChange={e=>setAgroForm(f=>({...f,unite:e.target.value}))} style={inputStyle}>
                          {AGRO_UNITES.map(u=><option key={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Prix par unité (FCFA) *</label>
                      <div style={{ position:"relative" }}>
                        <input value={agroForm.prixUnitaire} onChange={e=>setAgroForm(f=>({...f,prixUnitaire:e.target.value}))} placeholder="Ex: 25 000" inputMode="numeric" maxLength={15} style={inputStyle}/>
                        <span style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:theme.sub,fontSize:12,fontWeight:600 }}>FCFA</span>
                      </div>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Qualité / Grade</label>
                      <select value={agroForm.qualite} onChange={e=>setAgroForm(f=>({...f,qualite:e.target.value}))} style={inputStyle}>
                        {AGRO_QUALITE.map(q=><option key={q}>{q}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Disponibilité</label>
                      <select value={agroForm.disponibilite} onChange={e=>setAgroForm(f=>({...f,disponibilite:e.target.value}))} style={inputStyle}>
                        {AGRO_DISPONIBILITE.map(d=><option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Lieu d'enlèvement / Production *</label>
                      <input value={agroForm.lieuEnlevement} onChange={e=>setAgroForm(f=>({...f,lieuEnlevement:e.target.value}))} placeholder="Ex: Bohicon, Parakou, Glazoué..." maxLength={80} style={inputStyle}/>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Saison de récolte (optionnel)</label>
                      <input value={agroForm.saisonRecolte} onChange={e=>setAgroForm(f=>({...f,saisonRecolte:e.target.value}))} placeholder="Ex: Novembre - Janvier" maxLength={50} style={inputStyle}/>
                    </div>
                  </div>
                )}

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
                          <option>Vente</option><option>Location / Bail</option>
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
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Superficie</label>
                        <div style={{ display:"flex",gap:6 }}>
                          <input value={immoForm.superficie} onChange={e=>setImmoForm(f=>({...f,superficie:onlyDigits(e.target.value)}))} placeholder="Ex: 200" inputMode="numeric" maxLength={8} style={{ ...inputStyle,padding:"10px 14px",fontSize:13,flex:1 }}/>
                          <select value={immoForm.superficieUnit||"m²"} onChange={e=>setImmoForm(f=>({...f,superficieUnit:e.target.value}))} style={{ ...inputStyle,padding:"10px 8px",fontSize:12,width:70,flexShrink:0 }}>
                            <option>m²</option>
                            <option>ha</option>
                            <option>km²</option>
                            <option>ares</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Nombre de pièces</label>
                        <input value={immoForm.pieces} onChange={e=>setImmoForm(f=>({...f,pieces:onlyDigits(e.target.value)}))} placeholder="Ex: 5" inputMode="numeric" maxLength={3} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
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
                        <input value={immoForm.ville} onChange={e=>setImmoForm(f=>({...f,ville:cleanText(e.target.value,50)}))} placeholder="Ex: Cotonou" maxLength={50} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                      </div>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                      <div>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Quartier</label>
                        <input value={immoForm.quartier} onChange={e=>setImmoForm(f=>({...f,quartier:cleanText(e.target.value,50)}))} placeholder="Ex: Akpakpa" maxLength={50} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
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
                          <input
                            value={vehicleForm[f.key]||""}
                            onChange={e=>{
                              let v = e.target.value;
                              if      (f.type==="year")     v = onlyYear(v);
                              else if (f.type==="alpha")    v = onlyAlpha(v);
                              else if (f.type==="alphaNum") v = onlyAlphaNum(v);
                              else                          v = cleanText(v, f.max||200);
                              setVehicleForm(prev=>({...prev,[f.key]:v}));
                            }}
                            placeholder={f.placeholder}
                            maxLength={f.max||200}
                            inputMode={f.type==="year"?"numeric":"text"}
                            style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Champs moto / tricycle */}
                {isMoto&&(
                  <div style={{ marginTop:8 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16,padding:"12px 16px",background:theme.bg,border:`1px solid #FF658444`,borderRadius:10 }}>
                      <span style={{ fontSize:18 }}>🏍️</span>
                      <p style={{ fontWeight:700,color:"#FF6584",fontSize:14 }}>Fiche technique — Moto / Tricycle</p>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                      {MOTO_FIELDS.map(f=>(
                        <div key={f.key} style={{ gridColumn:f.key==="docs"||f.key==="autre"||f.key==="position"?"1/-1":"auto" }}>
                          <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>{f.label}</label>
                          <input
                            value={vehicleForm[f.key]||""}
                            onChange={e=>{
                              let v = e.target.value;
                              if      (f.type==="year")     v = onlyYear(v);
                              else if (f.type==="alpha")    v = onlyAlpha(v);
                              else if (f.type==="alphaNum") v = onlyAlphaNum(v);
                              else                          v = cleanText(v, f.max||200);
                              setVehicleForm(prev=>({...prev,[f.key]:v}));
                            }}
                            placeholder={f.placeholder}
                            maxLength={f.max||200}
                            inputMode={f.type==="year"?"numeric":"text"}
                            style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {modal.type==="add" && user?.role !== "admin" && (
                  <div style={{ background:"rgba(67,198,172,0.08)",border:"1px solid rgba(67,198,172,0.3)",borderRadius:14,padding:16,marginTop:16,display:"flex",alignItems:"center",gap:12 }}>
                    <span style={{ fontSize:28 }}>🎁</span>
                    <div>
                      <p style={{ fontWeight:700,fontSize:14,color:"#43C6AC",marginBottom:2 }}>Publication gratuite et illimitée !</p>
                      <p style={{ color:theme.sub,fontSize:12 }}>Votre annonce reste visible jusqu'à ce que vous la supprimiez. Boostez-la avec le Sponsoring 🌟</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={modal.type==="add"
                    ? () => { if (!validatePostForm()) return; addPost(null); }
                    : editPost
                  }
                  className="btn-glow"
                  style={{ width:"100%",marginTop:16,padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
                  {modal.type==="add" ? "🎁 Publier gratuitement" : "Enregistrer"}
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
                    <a href={`https://wa.me/${modal.data.phone.replace(/[\s+-]/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{ background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",borderRadius:12,padding:16,display:"flex",alignItems:"center",gap:12,cursor:"pointer" }}>
                        <div style={{ width:40,height:40,borderRadius:"50%",background:"rgba(37,211,102,0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"#25D366",flexShrink:0 }}><Icon name="whatsapp" size={18}/></div>
                        <div><p style={{ fontWeight:700,fontSize:14,color:"#25D366" }}>WhatsApp</p><p style={{ color:theme.sub,fontSize:13 }}>{modal.data.phone}</p></div>
                      </div>
                    </a>
                  )}
                  {!modal.data.contact&&!modal.data.phone&&<p style={{ textAlign:"center",color:theme.sub,padding:20 }}>Aucun moyen de contact renseigné</p>}
                </div>

                {/* Système de notation */}
                {user && user.id !== modal.data.authorId && (
                  <div style={{ marginTop:20,borderTop:`1px solid ${theme.border}`,paddingTop:20 }}>
                    <p style={{ fontWeight:700,fontSize:14,color:theme.text,marginBottom:12 }}>⭐ Noter cet élément</p>
                    {userRatings[user.id+"_"+modal.data.id] ? (
                      <div style={{ background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.3)",borderRadius:10,padding:12,textAlign:"center" }}>
                        <p style={{ color:"#FFD700",fontWeight:600,fontSize:13 }}>✅ Vous avez déjà noté cet élément</p>
                        <div style={{ display:"flex",justifyContent:"center",marginTop:4 }}>{renderStars(userRatings[user.id+"_"+modal.data.id].stars,16)}</div>
                      </div>
                    ) : (
                      <RatingForm itemId={modal.data.id} onRate={addRating} theme={theme}/>
                    )}
                    {ratings[modal.data.id]?.comments?.length > 0 && (
                      <div style={{ marginTop:16 }}>
                        <p style={{ fontWeight:600,fontSize:13,color:theme.sub,marginBottom:10 }}>Avis des visiteurs :</p>
                        {ratings[modal.data.id].comments.slice(0,3).map((c,i)=>(
                          <div key={i} style={{ background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:10,padding:12,marginBottom:8 }}>
                            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                              <div style={{ display:"flex" }}>{renderStars(c.stars,12)}</div>
                              <span style={{ fontSize:12,fontWeight:600,color:theme.text }}>{c.userName}</span>
                              <span style={{ fontSize:11,color:theme.sub }}>{c.date}</span>
                            </div>
                            <p style={{ fontSize:13,color:theme.sub }}>{c.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Annonces similaires améliorées */}
                {(() => {
                  const prixPost = parseInt((modal.data.price||"").replace(/[^0-9]/g,"")) || 0;
                  const villePost = modal.data.immo?.ville || modal.data.vehicle?.position || modal.data.ville || "";
                  // Cherche dans toutes les sections
                  // Filtrer uniquement les annonces de même catégorie
                  const allItems = posts
                    .filter(p => p.id !== modal.data.id && p.category === modal.data.category && !p.expired)
                    .map(p => ({...p, _section:"post"}));
                  const similaires = allItems
                    .map(p => {
                      let score = 1; // même catégorie garantie
                      const prixP = parseInt((p.price||"").replace(/[^0-9]/g,"")) || 0;
                      const villeP = p.immo?.ville||p.vehicle?.position||p.ville||"";
                      if (villePost && normalizeText(villeP).includes(normalizeText(villePost))) score += 3;
                      if (prixPost > 0 && prixP > 0 && Math.abs(prixP - prixPost) / prixPost < 0.5) score += 2;
                      if (p.sponsored) score += 1;
                      if (p.type && p.type === modal.data.type) score += 2;
                      return { ...p, _score: score };
                    })
                    .sort((a,b) => b._score - a._score)
                    .slice(0, 8);
                  if (similaires.length === 0) return null;

                  // Carrousel auto-scroll infini sur mobile avec swipe
                  if (windowWidth <= 600) {
                    const CARD_W = 160; // largeur carte + gap
                    const GAP = 10;
                    const totalW = similaires.length * (CARD_W + GAP);
                    return (
                      <div style={{ marginTop:24,borderTop:`1px solid ${theme.border}`,paddingTop:16 }}>
                        <p style={{ fontWeight:700,fontSize:14,color:theme.text,marginBottom:12 }}>📋 Annonces similaires</p>
                        <div style={{ position:"relative",overflow:"hidden" }}>
                          <style>{`
                            @keyframes scrollCarousel {
                              0%   { transform: translateX(0); }
                              100% { transform: translateX(-${totalW}px); }
                            }
                            .sim-track {
                              display: flex;
                              gap: ${GAP}px;
                              width: max-content;
                              animation: scrollCarousel ${similaires.length * 3.5}s linear infinite;
                              cursor: grab;
                              user-select: none;
                            }
                            .sim-track.paused { animation-play-state: paused; }
                          `}</style>
                          <div className="sim-track"
                            ref={el => {
                              if (!el) return;
                              let startX = 0, startScroll = 0, isDragging = false, resumeTimer = null;
                              const pause = () => {
                                el.classList.add('paused');
                                clearTimeout(resumeTimer);
                              };
                              const resume = () => {
                                resumeTimer = setTimeout(() => el.classList.remove('paused'), 3000);
                              };
                              el.ontouchstart = e => {
                                startX = e.touches[0].clientX;
                                isDragging = true;
                                pause();
                              };
                              el.ontouchmove = e => {
                                if (!isDragging) return;
                                const dx = e.touches[0].clientX - startX;
                                // Déplacer visuellement via margin
                                el.style.marginLeft = (parseInt(el.style.marginLeft||0) + dx * 0.3) + 'px';
                                startX = e.touches[0].clientX;
                              };
                              el.ontouchend = () => { isDragging = false; resume(); };
                              el.ontouchcancel = () => { isDragging = false; resume(); };
                            }}
                          >
                            {[...similaires, ...similaires].map((p, i)=>(
                              <div key={p.id+"-"+i}
                                onTouchEnd={e=>{ e.stopPropagation(); setModal({type:"contact",data:p}); }}
                                style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:12,padding:10,width:CARD_W,flexShrink:0,cursor:"pointer" }}>
                                {p.photos&&p.photos.length>0
                                  ? <img src={p.photos[0]} alt="" style={{ width:"100%",height:90,borderRadius:8,objectFit:"cover",marginBottom:6 }}/>
                                  : <div style={{ width:"100%",height:90,borderRadius:8,background:"rgba(108,99,255,0.1)",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24 }}>📦</div>
                                }
                                <p style={{ fontWeight:700,fontSize:12,color:theme.text,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.title||p.name}</p>
                                <p style={{ color:"#43C6AC",fontWeight:700,fontSize:12 }}>{p.price||"—"}</p>
                                {p.sponsored && <span style={{ fontSize:10,color:"#FFD700" }}>🌟</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Desktop — liste verticale classique
                  return (
                    <div style={{ marginTop:24,borderTop:`1px solid ${theme.border}`,paddingTop:20 }}>
                      <p style={{ fontWeight:700,fontSize:14,color:theme.text,marginBottom:14 }}>📋 Annonces similaires</p>
                      <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                        {similaires.slice(0,3).map(p=>(
                          <div key={p.id} style={{ background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:12,padding:12,display:"flex",gap:12,alignItems:"center" }}>
                            {p.photos&&p.photos.length>0 && <img src={p.photos[0]} alt="" style={{ width:52,height:52,borderRadius:8,objectFit:"cover",flexShrink:0 }}/>}
                            <div style={{ flex:1,minWidth:0 }}>
                              <p style={{ fontWeight:700,fontSize:13,color:theme.text,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.title}</p>
                              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                                <p style={{ color:"#43C6AC",fontWeight:700,fontSize:13 }}>{p.price||""}</p>
                                {p.sponsored && <span style={{ fontSize:10,color:"#FFD700" }}>🌟</span>}
                              </div>
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

            {/* ADD BEAUTÉ / COIFFURE */}
            {modal.type==="addbeaute"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>
                    {modal.data?.editing ? "✏️ Modifier le salon" : "💇 Publier mon salon"}
                  </h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                {!modal.data?.editing && (
                  <button onClick={()=>window.open("https://marcheduroi.com/exemples.html#beaute","_blank")} style={{ width:"100%",marginBottom:16,padding:"10px",background:"rgba(255,105,180,0.08)",border:"1px dashed rgba(255,105,180,0.4)",color:"#FF69B4",borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                    📖 Voir des exemples de salons beauté
                  </button>
                )}

                <div style={{ background:"rgba(108,99,255,0.06)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:10,padding:12,marginBottom:8 }}>
                  <p style={{ color:"#6C63FF",fontWeight:700,fontSize:12,margin:"0 0 4px" }}>📐 Dimensions recommandées</p>
                  <p style={{ color:"#9A9AB0",fontSize:11,margin:0,lineHeight:1.7 }}>
                    Couverture : <strong style={{color:"#E8E8F0"}}>1200×800px</strong> (ratio 3:2) · Galerie : <strong style={{color:"#E8E8F0"}}>1200×900px</strong> (ratio 4:3) · Hébergez sur <strong style={{color:"#E8E8F0"}}>ImgBB.com</strong> (gratuit)
                  </p>
                </div>
                <PhotoUploader photos={shopPhotos} setPhotos={setShopPhotos} theme={theme} folder="beaute"/>

                {/* Lien vidéo salon beauté */}
                {(()=>{
                  const isYT = v => /youtube\.com|youtu\.be/.test(v||"");
                  const isCL = v => /cloudinary\.com/.test(v||"");
                  const getYTId = v => { const m = (v||"").match(/(?:v=|youtu\.be\/)([\w-]{11})/); return m?m[1]:null; };
                  return (
                    <div style={{ marginBottom:16 }}>
                      <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>🎬 Lien vidéo (optionnel)</label>
                      <input
                        value={shopVideo||""}
                        onChange={e=>setShopVideo(e.target.value.trim())}
                        placeholder="https://youtu.be/... ou https://res.cloudinary.com/..."
                        style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}
                      />
                      {isYT(shopVideo) && getYTId(shopVideo) && (
                        <div style={{ marginTop:8,borderRadius:10,overflow:"hidden" }}>
                          <iframe width="100%" height="160" src={`https://www.youtube.com/embed/${getYTId(shopVideo)}`} frameBorder="0" allowFullScreen style={{ display:"block",borderRadius:10 }}/>
                        </div>
                      )}
                      {isCL(shopVideo) && (
                        <video src={shopVideo} controls style={{ width:"100%",borderRadius:10,marginTop:8,maxHeight:180 }}/>
                      )}
                      <details style={{ marginTop:8 }}>
                        <summary style={{ fontSize:12,color:"#6C63FF",cursor:"pointer",fontWeight:600 }}>📋 Comment ajouter ma vidéo ?</summary>
                        <div style={{ background:theme.bg,borderRadius:8,padding:10,marginTop:6,fontSize:12,color:theme.sub,lineHeight:1.6 }}>
                          <p style={{ fontWeight:700,color:theme.text,marginBottom:4 }}>Option 1 — YouTube (recommandé)</p>
                          <p>1. Allez sur youtube.com et connectez-vous</p>
                          <p>2. Cliquez "Créer" → "Mettre en ligne une vidéo"</p>
                          <p>3. Choisissez "Non répertorié" pour la confidentialité</p>
                          <p>4. Copiez le lien et collez-le ici</p>
                          <p style={{ fontWeight:700,color:theme.text,marginTop:6,marginBottom:4 }}>Option 2 — Cloudinary</p>
                          <p>1. Créez un compte gratuit sur cloudinary.com</p>
                          <p>2. Uploadez votre vidéo dans Media Library</p>
                          <p>3. Copiez l'URL et collez-la ici</p>
                          <p style={{ marginTop:6,color:"#FF6584" }}>⚠️ Durée recommandée : max 3 minutes</p>
                        </div>
                      </details>
                    </div>
                  );
                })()}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Type de salon *</label>
                  <select value={shopForm.type} onChange={e=>setShopForm(s=>({...s,type:e.target.value}))} style={inputStyle}>
                    <option value="">-- Choisir --</option>
                    {BEAUTE_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                {[
                  {label:"Nom du salon *",      key:"name",        fn:v=>cleanText(v,80),       max:80},
                  {label:"Description *",        key:"description", fn:v=>cleanLongText(v,800),  max:800, textarea:true},
                  {label:"Spécialité",           key:"specialite",  fn:v=>cleanText(v,100),      max:100, placeholder:"Ex: Tresses africaines, Maquillage mariage..."},
                  {label:"Services proposés",    key:"services",    fn:v=>cleanLongText(v,500),  max:500, textarea:true, placeholder:"Ex: Coupe, Tresses, Coloration, Soins..."},
                  {label:"Tarifs",               key:"tarifs",      fn:v=>cleanText(v,100),      max:100, placeholder:"Ex: 2 000 - 25 000 FCFA"},
                  {label:"Produits utilisés",    key:"produits",    fn:v=>cleanText(v,100),      max:100, placeholder:"Ex: L'Oréal, MAC, Dark & Lovely..."},
                  {label:"Mots clés",            key:"keywords",    fn:v=>cleanText(v,100),      max:100, placeholder:"Ex: tresses, coiffure, mariage, africain..."},
                  {label:"Horaires",             key:"horaires",    fn:v=>cleanText(v,60),       max:60,  placeholder:"Ex: Lun-Sam 8h-20h"},
                  {label:"Téléphone / WhatsApp", key:"phone",       fn:onlyPhone,               max:20,  placeholder:getPhonePlaceholder(), mode:"tel"},
                  {label:"Email",                key:"contact",     fn:onlyEmail,               max:80},
                ].map(f=>(
                  <div key={f.key} style={{ marginBottom:16 }}>
                    <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>{f.label}</label>
                    {f.textarea
                      ? <textarea value={shopForm[f.key]||""} onChange={e=>setShopForm(s=>({...s,[f.key]:f.fn(e.target.value)}))} rows={2} maxLength={f.max} placeholder={f.placeholder||""} style={{ ...inputStyle,resize:"vertical" }}/>
                      : <input value={shopForm[f.key]||""} onChange={e=>setShopForm(s=>({...s,[f.key]:f.fn(e.target.value)}))} placeholder={f.placeholder||""} maxLength={f.max} inputMode={f.mode||"text"} style={inputStyle}/>
                    }
                  </div>
                ))}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:8 }}>Sur rendez-vous ?</label>
                  <div style={{ display:"flex",gap:10 }}>
                    {["Oui","Non","Les deux"].map(v=>(
                      <button key={v} type="button" onClick={()=>setShopForm(s=>({...s,rendezvous:v}))} style={{ flex:1,padding:"10px",borderRadius:10,border:`2px solid ${shopForm.rendezvous===v?"#FF69B4":theme.border}`,background:shopForm.rendezvous===v?"rgba(255,105,180,0.15)":theme.bg,color:shopForm.rendezvous===v?"#FF69B4":theme.sub,fontWeight:700,fontSize:13,cursor:"pointer" }}>{v}</button>
                    ))}
                  </div>
                </div>
                <div style={{ background:theme.bg,border:`1px solid #FF69B444`,borderRadius:12,padding:16,marginBottom:16 }}>
                  <p style={{ fontWeight:700,color:"#FF69B4",fontSize:13,marginBottom:12,display:"flex",alignItems:"center",gap:6 }}><Icon name="pin" size={13}/>Localisation</p>
                  <button type="button" onClick={()=>{ navigator.geolocation.getCurrentPosition(pos=>{ setShopForm(s=>({...s,lat:pos.coords.latitude.toString(),lng:pos.coords.longitude.toString()})); notify("Position GPS capturée ! 📍"); },()=>notify("Impossible d'accéder au GPS","error")); }} style={{ width:"100%",padding:"10px",background:"rgba(255,105,180,0.1)",border:"1px solid rgba(255,105,180,0.3)",borderRadius:10,color:"#FF69B4",fontWeight:600,fontSize:13,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    📍 {shopForm.lat ? "Position GPS capturée ✅" : "Capturer ma position GPS"}
                  </button>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                    {[{label:"Ville *",key:"ville"},{label:"Quartier",key:"quartier"}].map(f=>(
                      <div key={f.key}>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>{f.label}</label>
                        <input value={shopForm[f.key]||""} onChange={e=>setShopForm(s=>({...s,[f.key]:cleanText(e.target.value,50)}))} maxLength={50} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                      </div>
                    ))}
                    <div style={{ gridColumn:"1/-1" }}>
                      <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Von de...</label>
                      <input value={shopForm.von||""} onChange={e=>setShopForm(s=>({...s,von:cleanText(e.target.value,100)}))} placeholder="Ex: Von du marché..." maxLength={100} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                    </div>
                  </div>
                </div>
                {user?.role !== "admin" && !modal.data?.editing && (
                  <div style={{ background:theme.bg,border:`1px solid #FF69B444`,borderRadius:14,padding:20,marginBottom:16 }}>
                    <p style={{ fontWeight:700,fontSize:14,color:theme.text,marginBottom:8 }}>💰 Durée de publication</p>
                    {canFreeShop && (
                      <div onClick={()=>setSelectedTarif(-1)} style={{ background:selectedTarif===-1?"rgba(67,198,172,0.15)":theme.card,border:`2px solid ${selectedTarif===-1?"#43C6AC":theme.border}`,borderRadius:12,padding:"10px 14px",marginBottom:6,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <div><p style={{ fontWeight:700,color:theme.text,fontSize:13 }}>🎁 4 jours gratuits</p><p style={{ color:theme.sub,fontSize:11 }}>Crédit mensuel</p></div>
                        <span style={{ fontWeight:800,color:"#43C6AC",fontSize:14 }}>GRATUIT</span>
                      </div>
                    )}
                    {TARIFS_BOUTIQUE.map((t,i)=>(
                      <div key={i} onClick={()=>setSelectedTarif(i)} style={{ background:selectedTarif===i?"rgba(255,105,180,0.1)":theme.card,border:`2px solid ${selectedTarif===i?"#FF69B4":theme.border}`,borderRadius:12,padding:"10px 14px",marginBottom:6,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <div><p style={{ fontWeight:700,color:theme.text,fontSize:13 }}>{t.label}</p><p style={{ color:theme.sub,fontSize:11 }}>{Math.round(t.price/t.days*30).toLocaleString()} FCFA/mois effectif</p></div>
                        <span style={{ fontWeight:800,color:"#FF69B4",fontSize:14 }}>{t.price.toLocaleString()} FCFA</span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={modal.data?.editing
                    ? editBeaute
                    : ()=>{
                        if (selectedTarif===-1) {
                          const exp=new Date(); exp.setDate(exp.getDate()+4);
                          useFreeShop(); addBeaute(exp.toISOString().slice(0,10));
                        } else {
                          const t=TARIFS_BOUTIQUE[selectedTarif]||TARIFS_BOUTIQUE[0];
                          handlePayment(t.price,`Publication salon beauté ${t.label} sur MarchéduRoi`,addBeaute, "beaute");
                        }
                      }
                  }
                  className="btn-glow"
                  style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#FF69B4,#FF1493)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
                  {modal.data?.editing ? "✅ Appliquer les modifications" : user?.role==="admin" ? "Publier le salon" : selectedTarif===-1 ? "🎁 Publier gratuitement (4 jours)" : `💳 Payer & Publier · ${(TARIFS_BOUTIQUE[selectedTarif]||TARIFS_BOUTIQUE[0]).price.toLocaleString()} FCFA`}
                </button>
              </>
            )}

            {/* ADD RESTAURANT / BAR */}
            {modal.type==="addresto"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>
                    {modal.data?.editing ? "✏️ Modifier l'établissement" : "🍽️ Publier mon établissement"}
                  </h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                {!modal.data?.editing && (
                  <button onClick={()=>window.open("https://marcheduroi.com/exemples.html#restos","_blank")} style={{ width:"100%",marginBottom:16,padding:"10px",background:"rgba(255,140,0,0.08)",border:"1px dashed rgba(255,140,0,0.4)",color:"#FF8C00",borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                    📖 Voir des exemples de restaurants & bars
                  </button>
                )}


                {/* Lien vidéo — YouTube ou Cloudinary */}
                {(()=>{
                  const isYT = v => /youtube\.com|youtu\.be/.test(v||"");
                  const isCL = v => /cloudinary\.com/.test(v||"");
                  const getYTId = v => { const m = (v||"").match(/(?:v=|youtu\.be\/)([\w-]{11})/); return m?m[1]:null; };
                  return (
                    <div style={{ marginBottom:16 }}>
                      <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>🎬 Lien vidéo (optionnel)</label>
                      <input
                        value={shopVideo||""}
                        onChange={e=>setShopVideo(e.target.value.trim())}
                        placeholder="https://youtu.be/... ou https://res.cloudinary.com/..."
                        style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}
                      />
                      {/* Prévisualisation */}
                      {isYT(shopVideo) && getYTId(shopVideo) && (
                        <div style={{ marginTop:8,borderRadius:10,overflow:"hidden" }}>
                          <iframe width="100%" height="180" src={`https://www.youtube.com/embed/${getYTId(shopVideo)}`} frameBorder="0" allowFullScreen style={{ display:"block",borderRadius:10 }}/>
                        </div>
                      )}
                      {isCL(shopVideo) && (
                        <video src={shopVideo} controls style={{ width:"100%",borderRadius:10,marginTop:8,maxHeight:200 }}/>
                      )}
                      {/* Guide */}
                      <details style={{ marginTop:8 }}>
                        <summary style={{ fontSize:12,color:"#6C63FF",cursor:"pointer",fontWeight:600 }}>📋 Comment ajouter ma vidéo ?</summary>
                        <div style={{ background:theme.bg,borderRadius:8,padding:10,marginTop:6,fontSize:12,color:theme.sub,lineHeight:1.6 }}>
                          <p style={{ fontWeight:700,color:theme.text,marginBottom:4 }}>Option 1 — YouTube (recommandé)</p>
                          <p>1. Allez sur youtube.com et connectez-vous</p>
                          <p>2. Cliquez "Créer" → "Mettre en ligne une vidéo"</p>
                          <p>3. Choisissez "Non répertorié" pour la confidentialité</p>
                          <p>4. Copiez le lien et collez-le ici</p>
                          <p style={{ fontWeight:700,color:theme.text,marginTop:6,marginBottom:4 }}>Option 2 — Cloudinary</p>
                          <p>1. Créez un compte gratuit sur cloudinary.com</p>
                          <p>2. Uploadez votre vidéo dans Media Library</p>
                          <p>3. Copiez l'URL et collez-la ici</p>
                          <p style={{ marginTop:6,color:"#FF6584" }}>⚠️ Durée recommandée : max 60s pour annonces, max 3 min pour boutiques</p>
                        </div>
                      </details>
                    </div>
                  );
                })()}

                <div style={{ background:"rgba(108,99,255,0.06)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:10,padding:12,marginBottom:8 }}>
                  <p style={{ color:"#6C63FF",fontWeight:700,fontSize:12,margin:"0 0 4px" }}>📐 Dimensions recommandées</p>
                  <p style={{ color:"#9A9AB0",fontSize:11,margin:0,lineHeight:1.7 }}>
                    Couverture : <strong style={{color:"#E8E8F0"}}>1200×800px</strong> (ratio 3:2) · Galerie : <strong style={{color:"#E8E8F0"}}>1200×900px</strong> (ratio 4:3) · Hébergez sur <strong style={{color:"#E8E8F0"}}>ImgBB.com</strong> (gratuit)
                  </p>
                </div>
                <PhotoUploader photos={shopPhotos} setPhotos={setShopPhotos} theme={theme} folder="restos"/>

                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Type d'établissement *</label>
                  <select value={shopForm.type} onChange={e=>setShopForm(s=>({...s,type:e.target.value}))} style={inputStyle}>
                    <option value="">-- Choisir --</option>
                    {RESTO_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>

                {[
                  {label:"Nom de l'établissement *",key:"name",       fn:v=>cleanText(v,80),      max:80},
                  {label:"Description *",            key:"description",fn:v=>cleanLongText(v,800), max:800, textarea:true},
                  {label:"Spécialité",               key:"specialite", fn:v=>cleanText(v,100),     max:100, placeholder:"Ex: Cuisine béninoise, Grillades..."},
                  {label:"Plats / Menu phare",        key:"plats",      fn:v=>cleanLongText(v,500), max:500, textarea:true, placeholder:"Ex: Sauce arachide, Riz au gras..."},
                  {label:"Prix moyen par repas",      key:"prixMoyen",  fn:v=>onlyPrice(v),        max:40,  placeholder:"Ex: 1 500 - 5 000 FCFA"},
                  {label:"Capacité",                  key:"capacite",   fn:v=>cleanText(v,30),      max:30,  placeholder:"Ex: 40 couverts"},
                  {label:"Services proposés",         key:"services",   fn:v=>cleanText(v,150),     max:150, placeholder:"Sur place, À emporter, Livraison..."},
                  {label:"Mots clés",                 key:"keywords",   fn:v=>cleanText(v,100),     max:100, placeholder:"Ex: maquis, traditionnel, livraison..."},
                  {label:"Horaires",                  key:"horaires",   fn:v=>cleanText(v,60),      max:60,  placeholder:"Ex: Lun-Dim 7h-22h"},
                  {label:"Téléphone / WhatsApp",      key:"phone",      fn:onlyPhone,              max:20,  placeholder:getPhonePlaceholder(), mode:"tel"},
                  {label:"Email",                     key:"contact",    fn:onlyEmail,              max:80},
                ].map(f=>(
                  <div key={f.key} style={{ marginBottom:16 }}>
                    <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>{f.label}</label>
                    {f.textarea
                      ? <textarea value={shopForm[f.key]||""} onChange={e=>setShopForm(s=>({...s,[f.key]:f.fn(e.target.value)}))} rows={2} maxLength={f.max} placeholder={f.placeholder||""} style={{ ...inputStyle,resize:"vertical" }}/>
                      : <input value={shopForm[f.key]||""} onChange={e=>setShopForm(s=>({...s,[f.key]:f.fn(e.target.value)}))} placeholder={f.placeholder||""} maxLength={f.max} inputMode={f.mode||"text"} style={inputStyle}/>
                    }
                  </div>
                ))}

                <div style={{ background:theme.bg,border:`1px solid #FF8C0044`,borderRadius:12,padding:16,marginBottom:16 }}>
                  <p style={{ fontWeight:700,color:"#FF8C00",fontSize:13,marginBottom:12,display:"flex",alignItems:"center",gap:6 }}><Icon name="pin" size={13}/>Localisation</p>
                  <button type="button" onClick={()=>{
                    navigator.geolocation.getCurrentPosition(
                      pos=>{ setShopForm(s=>({...s,lat:pos.coords.latitude.toString(),lng:pos.coords.longitude.toString()})); notify("Position GPS capturée ! 📍"); },
                      ()=>notify("Impossible d'accéder au GPS","error")
                    );
                  }} style={{ width:"100%",padding:"10px",background:"rgba(255,140,0,0.1)",border:"1px solid rgba(255,140,0,0.3)",borderRadius:10,color:"#FF8C00",fontWeight:600,fontSize:13,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    📍 {shopForm.lat ? "Position GPS capturée ✅" : "Capturer ma position GPS"}
                  </button>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                    {[{label:"Ville *",key:"ville"},{label:"Quartier",key:"quartier"}].map(f=>(
                      <div key={f.key}>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>{f.label}</label>
                        <input value={shopForm[f.key]||""} onChange={e=>setShopForm(s=>({...s,[f.key]:cleanText(e.target.value,50)}))} maxLength={50} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                      </div>
                    ))}
                    <div style={{ gridColumn:"1/-1" }}>
                      <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Von de...</label>
                      <input value={shopForm.von||""} onChange={e=>setShopForm(s=>({...s,von:cleanText(e.target.value,100)}))} placeholder="Ex: Von du marché central..." maxLength={100} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                    </div>
                  </div>
                </div>

                {user?.role !== "admin" && !modal.data?.editing && (
                  <div style={{ background:theme.bg,border:`1px solid #FF8C0044`,borderRadius:14,padding:20,marginBottom:16 }}>
                    <p style={{ fontWeight:700,fontSize:14,color:theme.text,marginBottom:8 }}>💰 Durée de publication</p>
                    {canFreeShop && (
                      <div onClick={()=>setSelectedTarif(-1)} style={{ background:selectedTarif===-1?"rgba(67,198,172,0.15)":theme.card,border:`2px solid ${selectedTarif===-1?"#43C6AC":theme.border}`,borderRadius:12,padding:"10px 14px",marginBottom:6,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <div><p style={{ fontWeight:700,color:theme.text,fontSize:13 }}>🎁 4 jours gratuits</p><p style={{ color:theme.sub,fontSize:11 }}>Crédit mensuel</p></div>
                        <span style={{ fontWeight:800,color:"#43C6AC",fontSize:14 }}>GRATUIT</span>
                      </div>
                    )}
                    {TARIFS_BOUTIQUE.map((t,i)=>(
                      <div key={i} onClick={()=>setSelectedTarif(i)} style={{ background:selectedTarif===i?"rgba(255,140,0,0.1)":theme.card,border:`2px solid ${selectedTarif===i?"#FF8C00":theme.border}`,borderRadius:12,padding:"10px 14px",marginBottom:6,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <div><p style={{ fontWeight:700,color:theme.text,fontSize:13 }}>{t.label}</p><p style={{ color:theme.sub,fontSize:11 }}>{Math.round(t.price/t.days*30).toLocaleString()} FCFA/mois effectif</p></div>
                        <span style={{ fontWeight:800,color:"#FF8C00",fontSize:14 }}>{t.price.toLocaleString()} FCFA</span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={modal.data?.editing
                    ? editResto
                    : ()=>{
                        if (selectedTarif===-1) {
                          const exp=new Date(); exp.setDate(exp.getDate()+4);
                          useFreeShop(); addResto(exp.toISOString().slice(0,10));
                        } else {
                          const t=TARIFS_BOUTIQUE[selectedTarif]||TARIFS_BOUTIQUE[0];
                          handlePayment(t.price,`Publication restaurant/bar ${t.label} sur MarchéduRoi`,addResto, "resto");
                        }
                      }
                  }
                  className="btn-glow"
                  style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#FF8C00,#FF6584)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
                  {modal.data?.editing?"✅ Appliquer les modifications":user?.role==="admin"?"Publier l'établissement":selectedTarif===-1?"🎁 Publier gratuitement (4 jours)":`💳 Payer & Publier · ${(TARIFS_BOUTIQUE[selectedTarif]||TARIFS_BOUTIQUE[0]).price.toLocaleString()} FCFA`}
                </button>
              </>
            )}

            {/* ADD BOUTIQUE / ATELIER */}
            {modal.type==="addshop"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>
                    {modal.data?.editing
                      ? (shopMode==="boutique"?"✏️ Modifier la boutique":"✏️ Modifier l'atelier")
                      : (shopMode==="boutique"?"🛍️ Publier ma boutique":"🔧 Publier mon atelier")}
                  </h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                {!modal.data?.editing && (
                  <button onClick={()=>window.open(`https://marcheduroi.com/exemples.html#${shopMode==="boutique"?"boutiques":"ateliers"}`,"_blank")} style={{ width:"100%",marginBottom:16,padding:"10px",background:shopMode==="boutique"?"rgba(255,101,132,0.08)":"rgba(67,198,172,0.08)",border:`1px dashed ${shopMode==="boutique"?"rgba(255,101,132,0.4)":"rgba(67,198,172,0.4)"}`,color:shopMode==="boutique"?"#FF6584":"#43C6AC",borderRadius:10,fontWeight:600,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                    📖 Voir des exemples de {shopMode==="boutique"?"boutiques":"ateliers"}
                  </button>
                )}

                {/* Lien vidéo — YouTube ou Cloudinary */}
                {(()=>{
                  const isYT = v => /youtube\.com|youtu\.be/.test(v||"");
                  const isCL = v => /cloudinary\.com/.test(v||"");
                  const getYTId = v => { const m = (v||"").match(/(?:v=|youtu\.be\/)([\w-]{11})/); return m?m[1]:null; };
                  return (
                    <div style={{ marginBottom:16 }}>
                      <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>🎬 Lien vidéo (optionnel)</label>
                      <input
                        value={shopVideo||""}
                        onChange={e=>setShopVideo(e.target.value.trim())}
                        placeholder="https://youtu.be/... ou https://res.cloudinary.com/..."
                        style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}
                      />
                      {/* Prévisualisation */}
                      {isYT(shopVideo) && getYTId(shopVideo) && (
                        <div style={{ marginTop:8,borderRadius:10,overflow:"hidden" }}>
                          <iframe width="100%" height="180" src={`https://www.youtube.com/embed/${getYTId(shopVideo)}`} frameBorder="0" allowFullScreen style={{ display:"block",borderRadius:10 }}/>
                        </div>
                      )}
                      {isCL(shopVideo) && (
                        <video src={shopVideo} controls style={{ width:"100%",borderRadius:10,marginTop:8,maxHeight:200 }}/>
                      )}
                      {/* Guide */}
                      <details style={{ marginTop:8 }}>
                        <summary style={{ fontSize:12,color:"#6C63FF",cursor:"pointer",fontWeight:600 }}>📋 Comment ajouter ma vidéo ?</summary>
                        <div style={{ background:theme.bg,borderRadius:8,padding:10,marginTop:6,fontSize:12,color:theme.sub,lineHeight:1.6 }}>
                          <p style={{ fontWeight:700,color:theme.text,marginBottom:4 }}>Option 1 — YouTube (recommandé)</p>
                          <p>1. Allez sur youtube.com et connectez-vous</p>
                          <p>2. Cliquez "Créer" → "Mettre en ligne une vidéo"</p>
                          <p>3. Choisissez "Non répertorié" pour la confidentialité</p>
                          <p>4. Copiez le lien et collez-le ici</p>
                          <p style={{ fontWeight:700,color:theme.text,marginTop:6,marginBottom:4 }}>Option 2 — Cloudinary</p>
                          <p>1. Créez un compte gratuit sur cloudinary.com</p>
                          <p>2. Uploadez votre vidéo dans Media Library</p>
                          <p>3. Copiez l'URL et collez-la ici</p>
                          <p style={{ marginTop:6,color:"#FF6584" }}>⚠️ Durée recommandée : max 60s pour annonces, max 3 min pour boutiques</p>
                        </div>
                      </details>
                    </div>
                  );
                })()}

                <div style={{ background:"rgba(108,99,255,0.06)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:10,padding:12,marginBottom:8 }}>
                  <p style={{ color:"#6C63FF",fontWeight:700,fontSize:12,margin:"0 0 4px" }}>📐 Dimensions recommandées</p>
                  <p style={{ color:"#9A9AB0",fontSize:11,margin:0,lineHeight:1.7 }}>
                    Couverture : <strong style={{color:"#E8E8F0"}}>1200×800px</strong> (ratio 3:2) · Galerie : <strong style={{color:"#E8E8F0"}}>1200×900px</strong> (ratio 4:3) · Hébergez sur <strong style={{color:"#E8E8F0"}}>ImgBB.com</strong> (gratuit)
                  </p>
                </div>
                <PhotoUploader photos={shopPhotos} setPhotos={setShopPhotos} theme={theme} folder={shopMode==="boutique"?"boutiques":"ateliers"}/>

                {/* Type */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Type {shopMode==="boutique"?"de boutique":"d'atelier"} *</label>
                  <select value={shopForm.type} onChange={e=>setShopForm(s=>({...s,type:e.target.value,sousType:""}))} style={inputStyle}>
                    <option value="">-- Choisir --</option>
                    {(shopMode==="boutique"?BOUTIQUE_TYPES:ATELIER_TYPES).map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>

                {/* Sous-catégorie — uniquement pour Autres Boutiques */}
                {shopMode==="boutique" && shopForm.type==="Autres Boutiques" && (
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Sous-catégorie *</label>
                    <select value={shopForm.sousType||""} onChange={e=>setShopForm(s=>({...s,sousType:e.target.value}))} style={inputStyle}>
                      <option value="">-- Choisir une sous-catégorie --</option>
                      {AUTRES_BOUTIQUES_SOUS_CAT.map(t=><option key={t}>{t}</option>)}
                    </select>
                    {shopForm.sousType && (
                      <p style={{ fontSize:11,color:"#43C6AC",marginTop:4,fontWeight:600 }}>✓ {shopForm.sousType} sélectionné</p>
                    )}
                  </div>
                )}

                {/* Champs principaux */}
                {[
                  {label:`Nom ${shopMode==="boutique"?"de la boutique":"de l'atelier"} *`,key:"name",     fn:v=>cleanText(v,80),      max:80},
                  {label:"Description *",                                                   key:"description",fn:v=>cleanLongText(v,800), max:800, textarea:true},
                  ...(shopMode==="atelier"?[{label:"Services proposés",key:"services",fn:v=>cleanLongText(v,500),max:500,textarea:true}]:[]),
                  {label:"Horaires d'ouverture",          key:"horaires",  fn:v=>cleanText(v,60),  max:60,  placeholder:"Ex: Lun-Sam 8h-18h"},
                  {label:"Mots clés (pour la recherche)", key:"keywords",  fn:v=>cleanText(v,100), max:100, placeholder:"Ex: cosmétiques, soins, beauté..."},
                  {label:"Email de contact",               key:"contact",   fn:onlyEmail,           max:80},
                  {label:"Téléphone / WhatsApp",           key:"phone",     fn:onlyPhone,           max:20,  placeholder:getPhonePlaceholder(), mode:"tel"},
                ].map(f=>(
                  <div key={f.key} style={{ marginBottom:16 }}>
                    <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>{f.label}</label>
                    {f.textarea
                      ? <textarea value={shopForm[f.key]||""} onChange={e=>setShopForm(s=>({...s,[f.key]:f.fn(e.target.value)}))} rows={3} maxLength={f.max} style={{ ...inputStyle,resize:"vertical" }}/>
                      : <input value={shopForm[f.key]||""} onChange={e=>setShopForm(s=>({...s,[f.key]:f.fn(e.target.value)}))} placeholder={f.placeholder||""} maxLength={f.max} inputMode={f.mode||"text"} style={inputStyle}/>
                    }
                  </div>
                ))}

                {/* Localisation */}
                <div style={{ background:theme.bg,border:`1px solid #43C6AC44`,borderRadius:12,padding:16,marginBottom:16 }}>
                  <p style={{ fontWeight:700,color:"#43C6AC",fontSize:13,marginBottom:12,display:"flex",alignItems:"center",gap:6 }}><Icon name="pin" size={13}/>Localisation</p>
                  <button type="button" onClick={()=>{
                    navigator.geolocation.getCurrentPosition(
                      pos=>{ setShopForm(s=>({...s,lat:pos.coords.latitude.toString(),lng:pos.coords.longitude.toString()})); notify("Position GPS capturée ! 📍"); },
                      ()=>notify("Impossible d'accéder au GPS","error")
                    );
                  }} style={{ width:"100%",padding:"10px",background:shopForm.lat?"rgba(67,198,172,0.15)":"rgba(255,140,0,0.15)",border:`1px solid ${shopForm.lat?"rgba(67,198,172,0.4)":"rgba(255,140,0,0.4)"}`,borderRadius:10,color:shopForm.lat?"#43C6AC":"#FF8C00",fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    {shopForm.lat ? "✅ Position GPS capturée" : "📍 Capturer ma position GPS (fortement recommandé)"}
                  </button>
                  {!shopForm.lat && <p style={{ color:"#FF8C00",fontSize:11,marginBottom:10,textAlign:"center" }}>⚠️ Sans GPS votre publication n'apparaîtra pas dans le tri "Près de moi"</p>}
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                    {[{label:"Ville *",key:"ville",placeholder:"Ex: Cotonou"},{label:"Quartier",key:"quartier",placeholder:"Ex: Akpakpa"}].map(f=>(
                      <div key={f.key}>
                        <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>{f.label}</label>
                        <input value={shopForm[f.key]||""} onChange={e=>setShopForm(s=>({...s,[f.key]:cleanText(e.target.value,50)}))} placeholder={f.placeholder} maxLength={50} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                      </div>
                    ))}
                    <div style={{ gridColumn:"1/-1" }}>
                      <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>Von de...</label>
                      <input value={shopForm.von||""} onChange={e=>setShopForm(s=>({...s,von:cleanText(e.target.value,100)}))} placeholder="Ex: Von du marché central, Von de la pharmacie..." maxLength={100} style={{ ...inputStyle,padding:"10px 14px",fontSize:13 }}/>
                    </div>
                  </div>
                </div>

                {/* Durée et paiement - seulement si pas en mode édition */}
                {user?.role !== "admin" && !modal.data?.editing && (
                  <div style={{ background:theme.bg,border:`1px solid #FF658444`,borderRadius:14,padding:20,marginBottom:16 }}>
                    <p style={{ fontWeight:700,fontSize:14,color:theme.text,marginBottom:8 }}>💰 Durée de publication</p>
                    {canFreeShop && (
                      <div onClick={()=>setSelectedTarif(-1)} style={{ background:selectedTarif===-1?"rgba(67,198,172,0.15)":theme.card,border:`2px solid ${selectedTarif===-1?"#43C6AC":theme.border}`,borderRadius:12,padding:"10px 14px",marginBottom:6,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <div><p style={{ fontWeight:700,color:theme.text,fontSize:13 }}>🎁 4 jours gratuits</p><p style={{ color:theme.sub,fontSize:11 }}>Crédit mensuel</p></div>
                        <span style={{ fontWeight:800,color:"#43C6AC",fontSize:14 }}>GRATUIT</span>
                      </div>
                    )}
                    {TARIFS_BOUTIQUE.map((t,i)=>(
                      <div key={i} onClick={()=>setSelectedTarif(i)} style={{ background:selectedTarif===i?"rgba(255,101,132,0.1)":theme.card,border:`2px solid ${selectedTarif===i?"#FF6584":theme.border}`,borderRadius:12,padding:"10px 14px",marginBottom:6,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <div><p style={{ fontWeight:700,color:theme.text,fontSize:13 }}>{t.label}</p><p style={{ color:theme.sub,fontSize:11 }}>{Math.round(t.price/t.days*30).toLocaleString()} FCFA/mois effectif</p></div>
                        <span style={{ fontWeight:800,color:"#FF6584",fontSize:14 }}>{t.price.toLocaleString()} FCFA</span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={modal.data?.editing
                    ? editShop
                    : ()=>{
      if (selectedTarif === -1) {
        // 4 jours gratuits
        const exp = new Date(); exp.setDate(exp.getDate()+4);
        addShop(exp.toISOString().slice(0,10));
      } else {
        const t=TARIFS_BOUTIQUE[selectedTarif]||TARIFS_BOUTIQUE[0];
        handlePayment(t.price,`Publication ${shopMode==="boutique"?"boutique":"atelier"} ${t.label} sur MarchéduRoi`,addShop, "boutique");
      }
    }
                  }
                  className="btn-glow"
                  style={{ width:"100%",padding:"14px",background:shopMode==="boutique"?"linear-gradient(135deg,#FF6584,#FFB347)":"linear-gradient(135deg,#43C6AC,#6C63FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
                  {modal.data?.editing?"✅ Appliquer les modifications":user?.role==="admin"?`Publier ${shopMode==="boutique"?"la boutique":"l'atelier"}`:selectedTarif===-1?"🎁 Publier gratuitement (4 jours)":`💳 Payer & Publier · ${(TARIFS_BOUTIQUE[selectedTarif]||TARIFS_BOUTIQUE[0]).price.toLocaleString()} FCFA`}
                </button>
              </>
            )}

            {/* SIGNALEMENT AVEC OTP */}
            {modal.type==="report"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>🚩 Signaler cette annonce</h3>
                  <button onClick={()=>{ setModal(null); setReportOtp({phone:"",code:"",generated:"",verified:false,postData:null}); }} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                <div style={{ background:theme.bg,borderRadius:12,padding:14,marginBottom:16 }}>
                  <p style={{ fontWeight:700,color:theme.text,marginBottom:2 }}>{modal.data.title||modal.data.name}</p>
                  <p style={{ color:theme.sub,fontSize:13 }}>Publiée par {modal.data.author}</p>
                </div>

                {/* Étape 1 : Téléphone */}
                {!reportOtp.verified && (
                  <div style={{ marginBottom:16 }}>
                    <p style={{ fontWeight:700,color:theme.text,fontSize:14,marginBottom:4 }}>📱 Étape 1 — Vérifiez votre numéro</p>
                    <p style={{ color:theme.sub,fontSize:12,marginBottom:12 }}>Pour éviter les abus, un code vous sera envoyé par SMS.</p>
                    <div style={{ display:"flex",gap:8,marginBottom:10 }}>
                      <input value={reportOtp.phone} onChange={e=>setReportOtp(r=>({...r,phone:e.target.value}))} placeholder={getPhonePlaceholder()} style={{ ...inputStyle,flex:1 }}/>
                      <button onClick={()=>sendOtp(reportOtp.phone)} style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"12px 16px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap" }}>
                        Envoyer OTP
                      </button>
                    </div>
                    {reportOtp.generated && (
                      <div style={{ marginTop:8 }}>
                        <p style={{ color:theme.sub,fontSize:12,marginBottom:8 }}>Entrez le code reçu par SMS :</p>
                        <div style={{ display:"flex",gap:8 }}>
                          <input value={reportOtp.code} onChange={e=>setReportOtp(r=>({...r,code:e.target.value}))} placeholder="Code à 6 chiffres" maxLength={6} style={{ ...inputStyle,flex:1,letterSpacing:4,textAlign:"center",fontSize:18,fontWeight:700 }}/>
                          <button onClick={()=>verifyOtp(reportOtp.code)} style={{ background:"linear-gradient(135deg,#43C6AC,#6C63FF)",border:"none",color:"#fff",padding:"12px 16px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer" }}>
                            Vérifier
                          </button>
                        </div>
                        <p style={{ fontSize:11,color:"#FF8C00",marginTop:6 }}>⚠️ Mode test — SMS réel bientôt disponible</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Étape 2 : Motif */}
                {reportOtp.verified && (
                  <div>
                    <p style={{ fontWeight:700,color:"#43C6AC",fontSize:13,marginBottom:12 }}>✅ Numéro vérifié · Choisissez le motif :</p>
                    <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:16 }}>
                      {["Arnaque / Fraude","Contenu inapproprié","Fausse information","Prix abusif","Annonce en double","Autre"].map(motif=>(
                        <button key={motif} onClick={()=>submitReport(modal.data, motif)} style={{ background:theme.card,border:`1px solid ${theme.border}`,borderRadius:12,padding:"12px 16px",color:theme.text,fontWeight:600,fontSize:14,cursor:"pointer",textAlign:"left",transition:"all 0.2s" }}>
                          {motif}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <p style={{ fontSize:12,color:theme.sub,textAlign:"center" }}>
                  Après envoi, vous aurez <strong>5 minutes</strong> pour annuler votre signalement.
                </p>
              </>
            )}

            {/* NEWSLETTER */}
            {modal.type==="newsletter"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>📧 Newsletter MarchéduRoi</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                <p style={{ color:theme.sub,fontSize:14,marginBottom:20,lineHeight:1.6 }}>
                  Recevez chaque semaine les meilleures annonces, boutiques et bons plans directement dans votre boîte mail ! 🎉
                </p>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Votre email</label>
                  <input type="email" value={authForm.email} onChange={e=>setAuthForm(a=>({...a,email:e.target.value}))} placeholder="contact@marcheduroi.com" style={inputStyle}/>
                </div>
                <button onClick={async()=>{
                  if(!authForm.email){notify("Entrez votre email","error");return;}
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if(!emailRegex.test(authForm.email)){notify("Email invalide","error");return;}
                  const { error } = await supabase.from("newsletter").insert({ email: authForm.email.toLowerCase().trim() });
                  if (error) {
                    if (error.code === "23505") { notify("Vous êtes déjà abonné(e) ! 😊"); }
                    else { notify("Erreur : "+error.message,"error"); return; }
                  } else {
                    notify("✅ Abonnement confirmé ! Merci de rejoindre MarchéduRoi 🎉");
                  }
                  setAuthForm(a=>({...a,email:""}));
                  setModal(null);
                }} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#6C63FF,#FF6584)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer",transition:"box-shadow 0.2s" }}>
                  S'abonner à la newsletter
                </button>
                <p style={{ fontSize:11,color:theme.sub,textAlign:"center",marginTop:12 }}>Désabonnement possible à tout moment · Pas de spam</p>
              </>
            )}

            {/* MOT DE PASSE OUBLIÉ */}
            {modal.type==="forgot"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>🔑 Mot de passe oublié</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                <p style={{ color:theme.sub,fontSize:14,marginBottom:24,lineHeight:1.6 }}>
                  Entrez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:13,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Votre email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={e=>setAuthForm(a=>({...a,email:e.target.value}))}
                    placeholder="contact@marcheduroi.com"
                    style={inputStyle}
                  />
                </div>
                <button onClick={()=>resetPassword(authForm.email)} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s",cursor:"pointer" }}>
                  📧 Envoyer le lien de réinitialisation
                </button>
                <p style={{ textAlign:"center",marginTop:16,color:theme.sub,fontSize:12 }}>
                  Vérifiez aussi vos spams si vous ne recevez pas l'email.
                </p>
              </>
            )}

            {/* SUPPRIMER BOUTIQUE/ATELIER/RESTO/BEAUTE */}
            {modal.type==="deleteshop"&&(
              <>
                <div style={{ textAlign:"center",marginBottom:24 }}>
                  <div style={{ fontSize:48,marginBottom:12 }}>🗑️</div>
                  <h3 style={{ fontWeight:800,fontSize:20,marginBottom:8,color:theme.text }}>Supprimer ?</h3>
                  <p style={{ color:theme.sub,fontSize:14 }}>"{modal.data.name}" sera supprimé définitivement.</p>
                </div>
                <div style={{ display:"flex",gap:12 }}>
                  <button onClick={()=>setModal(null)} style={{ flex:1,padding:"12px",background:"transparent",border:`1px solid ${theme.border}`,color:theme.text,borderRadius:12,fontWeight:600 }}>Annuler</button>
                  <button onClick={async ()=>{
                    const tableMap = {boutique:"boutiques", atelier:"ateliers", resto:"restos", beaute:"beaute"};
                    const table = tableMap[modal.shopType];
                    if(table) {
                      const { error } = await supabase.from(table).delete().eq("id", modal.data.id);
                      if(error) { notify("Erreur lors de la suppression","error"); console.error(error); return; }
                    }
                    if(modal.shopType==="boutique") setBoutiques(b=>b.filter(x=>x.id!==modal.data.id));
                    else if(modal.shopType==="atelier") setAteliers(a=>a.filter(x=>x.id!==modal.data.id));
                    else if(modal.shopType==="resto") setRestos(r=>r.filter(x=>x.id!==modal.data.id));
                    else if(modal.shopType==="beaute") setBeaute(b=>b.filter(x=>x.id!==modal.data.id));
                    setModal(null); notify("Supprimé avec succès !");
                  }} style={{ flex:1,padding:"12px",background:"linear-gradient(135deg,#FF4757,#FF6584)",border:"none",color:"#fff",borderRadius:12,fontWeight:700 }}>Supprimer</button>
                </div>
              </>
            )}

            {/* CONFIRMATION MODIFICATION PAYANTE */}
            {/* CONFIRMATION MODIFICATION PAYANTE BOUTIQUE/ATELIER/RESTO/BEAUTE */}
            {modal.type==="confirmEditShop"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>✏️ Modification payante</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                <div style={{ background:`rgba(108,99,255,0.08)`,borderRadius:12,padding:16,marginBottom:20 }}>
                  <p style={{ fontWeight:700,color:theme.text,marginBottom:8 }}>📋 {modal.data.name}</p>
                  <p style={{ color:theme.sub,fontSize:13,marginBottom:4 }}>La modification gratuite de 24h est expirée.</p>
                  <p style={{ color:"#FF8C00",fontSize:13,fontWeight:600,marginBottom:4 }}>💰 Coût : {modal.price} FCFA</p>
                  <p style={{ color:theme.sub,fontSize:12 }}>📊 {modal.count}/{MAX_MODIFS} modifications utilisées ce mois · Il vous reste {MAX_MODIFS - modal.count} modification(s)</p>
                </div>
                <div style={{ display:"flex",gap:12 }}>
                  <button onClick={()=>setModal(null)} style={{ flex:1,padding:"12px",background:"transparent",border:`1px solid ${theme.border}`,color:theme.sub,borderRadius:10,fontWeight:600,fontSize:14 }}>Annuler</button>
                  <button onClick={()=>{
                    handleFedaPayment(
                      modal.price,
                      `Modification "${modal.data.name}" sur MarchéduRoi`,
                      () => {
                        recordModification(modal.data.id);
                        if(modal.doOpenModal) modal.doOpenModal();
                      }
                    );
                  }} className="btn-glow" style={{ flex:1,padding:"12px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:10,fontWeight:700,fontSize:14,transition:"box-shadow 0.2s" }}>
                    💳 Payer {modal.price} FCFA et modifier
                  </button>
                </div>
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
                  { step:"2", icon:"📝", title:"Rédigez votre annonce", desc:"Remplissez le titre, la description, le prix et ajoutez vos photos via des liens (ImgBB, Google Photos…)." },
                  { step:"3", icon:"🎁", title:"Publication gratuite et illimitée", desc:"Les annonces classiques sont entièrement gratuites, sans limite de durée ni de nombre. Publiez autant que vous voulez !" },
                  { step:"4", icon:"🌟", title:"Boostez votre visibilité", desc:"Sponsorisez votre annonce pour apparaître en tête des résultats : 500 FCFA/7j · 1 500 FCFA/30j · 3 500 FCFA/90j. Paiement via MTN/Moov Money (FedaPay)." },
                  { step:"5", icon:"🚀", title:"Votre annonce est en ligne !", desc:"Visible par tous les visiteurs au Bénin et en Afrique. Modifiable à tout moment depuis votre tableau de bord." },
                ].map(s=>(
                  <div key={s.step} style={{ display:"flex",gap:14,marginBottom:16,alignItems:"flex-start" }}>
                    <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14,flexShrink:0 }}>{s.step}</div>
                    <div>
                      <p style={{ fontWeight:700,fontSize:14,color:theme.text,marginBottom:2 }}>{s.icon} {s.title}</p>
                      <p style={{ fontSize:13,color:theme.sub,lineHeight:1.5 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
                <div style={{ background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.3)",borderRadius:12,padding:16,marginTop:8 }}>
                  <p style={{ fontWeight:700,color:"#43C6AC",fontSize:14,marginBottom:8 }}>📋 Tarifs annonces classiques</p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:16 }}>
                    {[["Illimitée","Gratuit"],["Sponsoring 7j","500 F"],["Sponsoring 30j","1 500 F"],["Sponsoring 90j","3 500 F"],["Sponsoring 180j","6 000 F"]].map(([d,p])=>(
                      <div key={d} style={{ background:theme.card,borderRadius:8,padding:"8px 10px",display:"flex",flexDirection:"column",gap:2 }}>
                        <span style={{ color:theme.sub,fontSize:12 }}>{d}</span>
                        <span style={{ fontWeight:800,color:p==="Gratuit"?"#43C6AC":"#6C63FF",fontSize:13 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontWeight:700,color:"#FF6584",fontSize:14,marginBottom:8 }}>🛍️ Boutiques · Ateliers · Restos · Beauté <span style={{ color:theme.sub,fontSize:11,fontWeight:400 }}>(tarifs de lancement)</span></p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                    {[["30 jours","1 500 F"],["90 jours","3 500 F"],["180 jours","6 000 F"],["360 jours","10 000 F"]].map(([d,p])=>(
                      <div key={d} style={{ background:theme.card,borderRadius:8,padding:"8px 10px",display:"flex",flexDirection:"column",gap:2 }}>
                        <span style={{ color:theme.sub,fontSize:12 }}>{d}</span>
                        <span style={{ fontWeight:800,color:"#FF6584",fontSize:13 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={()=>window.open("https://marcheduroi.com/exemples.html","_blank")} style={{ width:"100%",marginTop:12,padding:"12px",background:"rgba(67,198,172,0.1)",border:"1px solid rgba(67,198,172,0.4)",color:"#43C6AC",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                  📖 Voir des exemples de publications
                </button>
                {!user && <button onClick={()=>{setModal(null);setView("register");}} className="btn-glow" style={{ width:"100%",marginTop:10,padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>Créer mon compte gratuitement</button>}
              </>
            )}

            {/* SPONSORING */}
            {modal.type==="sponsor"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>🌟 Sponsoriser l'annonce</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                <div style={{ background:theme.bg,borderRadius:12,padding:16,marginBottom:20 }}>
                  <p style={{ fontWeight:700,color:theme.text,marginBottom:4 }}>{modal.data.title}</p>
                  <p style={{ color:theme.sub,fontSize:13 }}>Votre annonce apparaîtra en premier avec un badge 🌟</p>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
                  {user?.role==="admin" ? (
                    <>
                      <p style={{ color:theme.sub,fontSize:13,marginBottom:4 }}>Choisissez la durée du sponsoring :</p>
                      <div style={{ display:"flex",gap:12 }}>
                        <button onClick={async()=>{
                          await sponsorPost(modal.data.id,"week");
                          setModal({type:"sponsor_success", data:modal.data, duration:"1 semaine"});
                        }} style={{ flex:1,padding:"14px",background:"linear-gradient(135deg,#FFD700,#FFA500)",border:"none",color:"#000",borderRadius:12,fontWeight:800,fontSize:15,cursor:"pointer" }}>
                          🌟 1 semaine
                        </button>
                        <button onClick={async()=>{
                          await sponsorPost(modal.data.id,"month");
                          setModal({type:"sponsor_success", data:modal.data, duration:"1 mois"});
                        }} style={{ flex:1,padding:"14px",background:"linear-gradient(135deg,#FFA500,#FF8C00)",border:"none",color:"#000",borderRadius:12,fontWeight:800,fontSize:15,cursor:"pointer" }}>
                          🌟 1 mois
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {[
                        { dur:"week",     days:7,   price:500,  label:"7 jours",   color:"#FFD700", popular:false },
                        { dur:"month",    days:30,  price:1500, label:"30 jours",  color:"#FFA500", popular:true  },
                        { dur:"3months",  days:90,  price:3500, label:"90 jours",  color:"#FF8C00", popular:false },
                        { dur:"6months",  days:180, price:6000, label:"180 jours", color:"#FF6B35", popular:false },
                      ].map(opt=>(
                        <div key={opt.dur} onClick={()=>handlePayment(opt.price,`Sponsoring ${opt.label} sur MarchéduRoi`,async()=>{
                          await sponsorPost(modal.data.id,opt.dur);
                          setModal({type:"sponsor_success",data:modal.data,duration:opt.label});
                        }, "sponsoring")} style={{ background:`linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,165,0,0.08))`,border:`2px solid ${opt.color}`,borderRadius:14,padding:16,cursor:"pointer",position:"relative",marginBottom:0 }}>
                          {opt.popular && <div style={{ position:"absolute",top:-10,right:14,background:`linear-gradient(135deg,#FFD700,#FFA500)`,color:"#000",padding:"2px 10px",borderRadius:20,fontSize:10,fontWeight:800 }}>POPULAIRE</div>}
                          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                            <div>
                              <p style={{ fontWeight:800,fontSize:15,color:opt.color,marginBottom:2 }}>🌟 {opt.label}</p>
                              <p style={{ color:theme.sub,fontSize:12 }}>En tête des résultats pendant {opt.days} jours</p>
                            </div>
                            <div style={{ textAlign:"right" }}>
                              {applyPromo(opt.price,"sponsoring").prixOriginal && (
                                <span style={{ color:theme.sub,fontSize:12,textDecoration:"line-through",display:"block" }}>{opt.price.toLocaleString()} F</span>
                              )}
                              <span style={{ fontWeight:800,fontSize:18,color:opt.color }}>{applyPromo(opt.price,"sponsoring").prixFinal.toLocaleString()} FCFA</span>
                              {getPromo("sponsoring") && <span style={{ background:"#10B981",color:"#fff",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10,marginLeft:4 }}>PROMO</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <p style={{ fontSize:11,color:theme.sub,textAlign:"center" }}>💳 Paiement sécurisé MTN/Moov Money · Après expiration, l'annonce reste visible normalement</p>
              </>
            )}

            {/* CONFIRMATION SPONSORING */}
            {modal.type==="sponsor_success"&&(
              <div style={{ textAlign:"center",padding:"16px 0" }}>
                <div style={{ fontSize:64,marginBottom:16,animation:"pulse 1s ease" }}>🌟</div>
                <h3 style={{ fontWeight:800,fontSize:22,color:"#FFD700",marginBottom:8 }}>Sponsoring activé !</h3>
                <div style={{ background:"rgba(255,215,0,0.1)",border:"2px solid #FFD700",borderRadius:14,padding:20,marginBottom:20 }}>
                  <p style={{ fontWeight:700,color:theme.text,fontSize:16,marginBottom:6 }}>{modal.data.title}</p>
                  <p style={{ color:"#FFD700",fontWeight:700,fontSize:18 }}>✅ Sponsorisé pour {modal.duration}</p>
                  <p style={{ color:theme.sub,fontSize:13,marginTop:6 }}>L'annonce apparaît maintenant en tête des résultats avec le badge 🌟</p>
                </div>
                <button onClick={()=>setModal(null)} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#FFD700,#FFA500)",border:"none",color:"#000",borderRadius:12,fontWeight:800,fontSize:15,cursor:"pointer" }}>
                  Parfait ! ✓
                </button>
              </div>
            )}

            {/* URGENT */}
            {modal.type==="urgent"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>🔥 Badge Urgent</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                <div style={{ background:theme.bg,borderRadius:12,padding:16,marginBottom:20 }}>
                  <p style={{ fontWeight:700,color:theme.text,marginBottom:4 }}>{modal.data.title}</p>
                  <p style={{ color:theme.sub,fontSize:13 }}>Un badge 🔥 URGENT rouge animé s'affiche sur votre annonce — visible par tous.</p>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
                {[{dur:"3 jours",price:500,days:3},{dur:"7 jours",price:1000,days:7}].map(opt=>(
                    <div key={opt.dur} onClick={()=>handlePayment(opt.price,`Badge Urgent ${opt.dur} sur MarchéduRoi`,async()=>{
                      const until = new Date(); until.setDate(until.getDate()+opt.days);
                      const urgent_until = until.toISOString();
                      const urgent_activated_at = new Date().toISOString();
                      const {error} = await supabase.from("posts").update({urgent:true, urgent_until, urgent_activated_at}).eq("id",modal.data.id);
                      if (error) { notify("Erreur activation badge urgent","error"); return; }
                      setPosts(p=>p.map(x=>x.id===modal.data.id?{...x,urgent:true,urgentUntil:urgent_until,urgentActivatedAt:urgent_activated_at}:x));
                      setModal(null); notify("🔥 Badge Urgent activé pour "+opt.dur+" !");
                    }, "urgent")} style={{ background:theme.card,border:"2px solid #FF4757",borderRadius:14,padding:20,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <div>
                        <p style={{ fontWeight:800,fontSize:15,color:"#FF4757",marginBottom:4 }}>🔥 Urgent {opt.dur}</p>
                        <p style={{ color:theme.sub,fontSize:13 }}>1ère position + badge animé rouge pendant {opt.dur}</p>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        {applyPromo(opt.price,"urgent").prixOriginal && (
                          <span style={{ color:theme.sub,fontSize:12,textDecoration:"line-through",display:"block" }}>{opt.price} F</span>
                        )}
                        <span style={{ fontWeight:800,fontSize:20,color:"#FF4757" }}>{applyPromo(opt.price,"urgent").prixFinal.toLocaleString()} FCFA</span>
                        {getPromo("urgent") && <span style={{ background:"#10B981",color:"#fff",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10,marginLeft:4 }}>PROMO</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}


            {/* OFFRE D'EMPLOI */}
            {modal.type==="addOffre"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                  <h3 style={{ fontWeight:800,fontSize:18,color:theme.text }}>💼 Publier une offre d'emploi</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                <div style={{ background:"rgba(67,198,172,0.08)",border:"1px solid rgba(67,198,172,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#43C6AC" }}>
                  💳 1 500 FCFA / 30 jours · 3 500 FCFA / 90 jours · Paiement MTN/Moov Money
                </div>
                {/* Sélection durée */}
                <div style={{ display:"flex",gap:8,marginBottom:16 }}>
                  {TARIFS_OFFRE.map((t,i)=>(
                    <div key={i} onClick={()=>setSelectedTarifOffre(i)}
                      style={{ flex:1,padding:"10px",borderRadius:10,cursor:"pointer",textAlign:"center",
                        background:selectedTarifOffre===i?"rgba(67,198,172,0.15)":theme.card,
                        border:`2px solid ${selectedTarifOffre===i?"#43C6AC":theme.border}` }}>
                      <p style={{ fontWeight:700,fontSize:13,color:theme.text }}>{t.label}</p>
                      <p style={{ fontWeight:800,fontSize:14,color:"#43C6AC" }}>{t.price.toLocaleString()} FCFA</p>
                    </div>
                  ))}
                </div>
                {[
                  {label:"Nom de l'entreprise *",key:"entreprise",placeholder:"Ex: Boulangerie du Roi"},
                  {label:"Poste recherché *",key:"poste",placeholder:"Ex: Vendeur(se), Comptable, Chauffeur..."},
                  {label:"Description du poste *",key:"description",placeholder:"Responsabilités, conditions, profil recherché...",multi:true},
                  {label:"Salaire / Rémunération",key:"salaire",placeholder:"Ex: 80 000 FCFA / mois"},
                  {label:"Ville / Localisation",key:"localisation",placeholder:"Ex: Cotonou, Parakou..."},
                  {label:"Contact (email ou nom)",key:"contact",placeholder:"Ex: rh@entreprise.com"},
                  {label:"WhatsApp",key:"phone",placeholder:getPhonePlaceholder()},
                ].map(f=>(
                  <div key={f.key} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>{f.label}</label>
                    {f.multi
                      ? <textarea value={offreForm[f.key]} onChange={e=>setOffreForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} rows={3} style={{ ...inputStyle,resize:"vertical",fontFamily:"inherit" }}/>
                      : <input value={offreForm[f.key]} onChange={e=>setOffreForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={inputStyle}/>
                    }
                  </div>
                ))}
                <button onClick={()=>{ const t=TARIFS_OFFRE[selectedTarifOffre]; handlePayment(t.price,`Offre d'emploi ${t.label} sur MarchéduRoi`,()=>addOffre((() => { const d=new Date(); d.setDate(d.getDate()+t.days); return d.toISOString().slice(0,10); })())); }}
                  className="btn-glow"
                  style={{ width:"100%",padding:"13px",background:"linear-gradient(135deg,#43C6AC,#6C63FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer",marginTop:4 }}>
                  💳 Payer {TARIFS_OFFRE[selectedTarifOffre]?.price.toLocaleString()} FCFA et Publier
                </button>
              </>
            )}

            {/* PROFIL CV */}
            {modal.type==="addCV"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                  <h3 style={{ fontWeight:800,fontSize:18,color:theme.text }}>👤 Publier mon profil / CV</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                <div style={{ background:"rgba(67,198,172,0.08)",border:"1px solid rgba(67,198,172,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#43C6AC" }}>
                  🎁 Publication gratuite — votre profil reste visible jusqu'à ce que vous le supprimiez
                </div>
                {[
                  {label:"Votre nom *",key:"nom",placeholder:"Ex: Koffi Mensah"},
                  {label:"Poste / Métier recherché *",key:"poste",placeholder:"Ex: Comptable, Electricien, Secrétaire..."},
                  {label:"Compétences *",key:"competences",placeholder:"Listez vos compétences et savoir-faire...",multi:true},
                  {label:"Expérience professionnelle",key:"experience",placeholder:"Ex: 3 ans en comptabilité chez ABC SARL...",multi:true},
                  {label:"Disponibilité",key:"disponibilite",placeholder:"Ex: Immédiate, À partir du 01/06/2026..."},
                  {label:"Ville / Localisation",key:"localisation",placeholder:"Ex: Cotonou, Porto-Novo..."},
                  {label:"WhatsApp",key:"phone",placeholder:getPhonePlaceholder()},
                ].map(f=>(
                  <div key={f.key} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>{f.label}</label>
                    {f.multi
                      ? <textarea value={cvForm[f.key]} onChange={e=>setCvForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} rows={3} style={{ ...inputStyle,resize:"vertical",fontFamily:"inherit" }}/>
                      : <input value={cvForm[f.key]} onChange={e=>setCvForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={inputStyle}/>
                    }
                  </div>
                ))}
                <button onClick={addCV} className="btn-glow"
                  style={{ width:"100%",padding:"13px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer",marginTop:4 }}>
                  🎁 Publier gratuitement
                </button>
              </>
            )}

            {/* PROMO / NOUVEAUTÉ depuis un établissement */}
            {modal.type==="addPromo"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                  <h3 style={{ fontWeight:800,fontSize:18,color:theme.text }}>📣 Publier une Promo / Nouveauté</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                <div style={{ background:"rgba(255,140,0,0.08)",border:"1px solid rgba(255,140,0,0.25)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#FF8C00" }}>
                  🏪 Publiée au nom de <strong>{modal.data?.name}</strong> · 500 FCFA · Apparaît dans les annonces classiques
                </div>
                {[
                  { label:"Titre *", key:"title", placeholder:"Ex: Promo -30% sur les robes" },
                  { label:"Description *", key:"description", placeholder:"Décrivez votre promo ou nouveauté...", multiline:true },
                  { label:"Prix promo (optionnel)", key:"price", placeholder:"Ex: 5000" },
                ].map(f=>(
                  <div key={f.key} style={{ marginBottom:14 }}>
                    <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:5 }}>{f.label}</label>
                    {f.multiline
                      ? <textarea value={promoForm[f.key]} onChange={e=>setPromoForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} rows={3} style={{ ...inputStyle,resize:"vertical",fontFamily:"inherit" }}/>
                      : <input value={promoForm[f.key]} onChange={e=>setPromoForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} style={inputStyle}/>
                    }
                  </div>
                ))}
                {/* Photos */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:5 }}>📸 Photo (optionnel)</label>
                  <PhotoUploader photos={promoPhotos} setPhotos={setPromoPhotos} theme={theme} folder="annonces"/>
                </div>
                <button onClick={()=>handlePayment(500,"Publication Promo/Nouveauté sur MarchéduRoi",()=>addPromo(modal.data, modal.shopType), "boutique")}
                  className="btn-glow"
                  style={{ width:"100%",padding:"13px",background:"linear-gradient(135deg,#FF8C00,#FFD700)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer" }}>
                  💳 Payer 500 FCFA et Publier
                </button>
              </>
            )}

            {/* URGENT SHOP — boutiques/ateliers/restos/beauté */}
            {modal.type==="urgentShop"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>🔥 Badge Urgent</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                <div style={{ background:theme.bg,borderRadius:12,padding:16,marginBottom:20 }}>
                  <p style={{ fontWeight:700,color:theme.text,marginBottom:4 }}>{modal.data.title}</p>
                  <p style={{ color:theme.sub,fontSize:13 }}>Votre établissement apparaît dans le bandeau 🔥 EN CE MOMENT — visible en tête de page par tous les visiteurs.</p>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
                  {[{dur:"3 jours",price:1000,days:3},{dur:"7 jours",price:2000,days:7}].map(opt=>(
                    <div key={opt.dur} onClick={()=>handlePayment(opt.price,`Badge Urgent ${opt.dur} sur MarchéduRoi`,async()=>{
                      const until = new Date(); until.setDate(until.getDate()+opt.days);
                      const urgent_until = until.toISOString();
                      const urgent_activated_at = new Date().toISOString();
                      const setterMap = {boutiques:setBoutiques, ateliers:setAteliers, restos:setRestos, beaute:setBeaute};
                      const setter = setterMap[modal.shopTable];
                      const {error} = await supabase.from(modal.shopTable).update({urgent:true, urgent_until, urgent_activated_at}).eq("id",modal.data.id);
                      if (error) { notify("Erreur activation badge urgent","error"); return; }
                      if (setter) setter(prev=>prev.map(x=>x.id===modal.data.id?{...x,urgent:true,urgentUntil:urgent_until,urgentActivatedAt:urgent_activated_at}:x));
                      setModal(null); notify("🔥 Badge Urgent activé pour "+opt.dur+" !");
                    })} style={{ background:theme.card,border:"2px solid #FF4757",borderRadius:14,padding:20,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <div>
                        <p style={{ fontWeight:800,fontSize:15,color:"#FF4757",marginBottom:4 }}>🔥 Urgent {opt.dur}</p>
                        <p style={{ color:theme.sub,fontSize:13 }}>Carousel EN CE MOMENT + fil des établissements pendant {opt.dur}</p>
                      </div>
                      <span style={{ fontWeight:800,fontSize:20,color:"#FF4757" }}>{opt.price} FCFA</span>
                    </div>
                  ))}
                </div>
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

                {/* 4 jours gratuits si dispo */}
                {canPublishFree() && (
                  <div onClick={()=>setSelectedTarif(-1)}
                    style={{ background:selectedTarif===-1?"rgba(67,198,172,0.15)":theme.card,border:`2px solid ${selectedTarif===-1?"#43C6AC":theme.border}`,borderRadius:12,padding:"12px 16px",marginBottom:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div>
                      <p style={{ fontWeight:700,color:theme.text,fontSize:14 }}>🎁 4 jours gratuits</p>
                      <p style={{ color:theme.sub,fontSize:12 }}>Votre crédit mensuel gratuit</p>
                    </div>
                    <span style={{ fontWeight:800,color:"#43C6AC",fontSize:16 }}>GRATUIT</span>
                  </div>
                )}

                {/* Grille tarifaire annonces */}
                {TARIFS_ANNONCE.map((t,i)=>(
                  <div key={i} onClick={()=>setSelectedTarif(i)}
                    style={{ background:selectedTarif===i?"rgba(108,99,255,0.12)":theme.card,border:`2px solid ${selectedTarif===i?"#6C63FF":theme.border}`,borderRadius:12,padding:"12px 16px",marginBottom:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div>
                      <p style={{ fontWeight:700,color:theme.text,fontSize:14 }}>{t.label}</p>
                      <p style={{ color:theme.sub,fontSize:12 }}>{Math.round(t.price/t.days*30).toLocaleString()} FCFA/mois effectif</p>
                    </div>
                    <span style={{ fontWeight:800,color:"#6C63FF",fontSize:16 }}>{t.price.toLocaleString()} FCFA</span>
                  </div>
                ))}

                <button onClick={()=>{
                  if (selectedTarif === -1) {
                    useFreeDay();
                    const newExp = new Date(modal.data.expiresAt||new Date());
                    newExp.setDate(newExp.getDate()+4);
                    setPosts(p=>p.map(post=>post.id===modal.data.id?{...post,expiresAt:newExp.toISOString().slice(0,10),expired:false,expiringSoon:false}:post));
                    setModal(null); notify("🎁 Annonce prolongée de 4 jours gratuitement !");
                  } else {
                    const tarif = TARIFS_ANNONCE[selectedTarif]||TARIFS_ANNONCE[0];
                    handlePayment(tarif.price, `Prolongation annonce ${tarif.label} sur MarchéduRoi`, ()=>{
                      const newExp = new Date(modal.data.expiresAt||new Date());
                      newExp.setDate(newExp.getDate()+tarif.days);
                      setPosts(p=>p.map(post=>post.id===modal.data.id?{...post,expiresAt:newExp.toISOString().slice(0,10),expired:false,expiringSoon:false}:post));
                      setModal(null); notify(`Annonce prolongée de ${tarif.label} !`);
                    }) // cible: "sponsoring"
                  }
                }} className="btn-glow" style={{ width:"100%",marginTop:8,padding:"14px",background:"linear-gradient(135deg,#43C6AC,#6C63FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
                  {selectedTarif===-1
                    ? "🎁 Prolonger gratuitement (4 jours)"
                    : `Prolonger · ${(TARIFS_ANNONCE[selectedTarif]||TARIFS_ANNONCE[0]).price.toLocaleString()} FCFA`}
                </button>
              </>
            )}

            {/* SUGGESTION */}
            {/* SHOW FASTER */}
            {modal.type==="showFaster"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>⚡ Show Faster</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                <p style={{ color:theme.sub,fontSize:13,marginBottom:20,lineHeight:1.6 }}>Votre bannière publicitaire vue par tous les visiteurs de MarchéduRoi. Choisissez votre durée et payez en ligne.</p>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20 }}>
                  {[{label:"7 jours",prix:5000,days:7},{label:"30 jours",prix:15000,days:30},{label:"90 jours",prix:35000,days:90}].map(t=>(
                    <div key={t.label} onClick={()=>setModal(m=>({...m,adTarif:t}))}
                      style={{ background:modal.adTarif?.days===t.days?"rgba(108,99,255,0.15)":theme.card,border:`2px solid ${modal.adTarif?.days===t.days?"#6C63FF":theme.border}`,borderRadius:12,padding:"12px 8px",textAlign:"center",cursor:"pointer" }}>
                      <p style={{ fontWeight:800,fontSize:13,color:theme.text,marginBottom:4 }}>{t.label}</p>
                      <p style={{ fontWeight:800,fontSize:16,color:"#6C63FF" }}>{t.prix.toLocaleString()} F</p>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
                  {[
                    {label:"Nom de l'entreprise *",key:"adEntreprise",placeholder:"Ex: Boulangerie Dorée"},
                    {label:"Slogan",key:"adSlogan",placeholder:"Ex: Les meilleurs pains de Cotonou"},
                    {label:"URL du logo",key:"adLogo",placeholder:"https://..."},
                    {label:"Lien de destination",key:"adLien",placeholder:"https://votre-site.com"},
                  ].map(f=>(
                    <div key={f.key}>
                      <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:4 }}>{f.label}</label>
                      <input value={modal[f.key]||""} onChange={e=>setModal(m=>({...m,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{ ...inputStyle,fontSize:13 }}/>
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize:12,fontWeight:600,color:theme.sub,display:"block",marginBottom:6 }}>Couleurs de la bannière</label>
                    <div style={{ display:"flex",gap:10 }}>
                      <input type="color" value={modal.adCouleur1||"#6C63FF"} onChange={e=>setModal(m=>({...m,adCouleur1:e.target.value}))} style={{ width:44,height:40,border:"none",borderRadius:8,cursor:"pointer" }}/>
                      <input type="color" value={modal.adCouleur2||"#8B84FF"} onChange={e=>setModal(m=>({...m,adCouleur2:e.target.value}))} style={{ width:44,height:40,border:"none",borderRadius:8,cursor:"pointer" }}/>
                      <div style={{ flex:1,height:40,borderRadius:8,background:`linear-gradient(135deg,${modal.adCouleur1||"#6C63FF"},${modal.adCouleur2||"#8B84FF"})` }}/>
                    </div>
                  </div>
                </div>
                <button onClick={async()=>{
                  if (!modal.adTarif) { notify("Choisissez une durée","error"); return; }
                  if (!modal.adEntreprise?.trim()) { notify("Nom de l'entreprise requis","error"); return; }
                  const tarif = modal.adTarif;
                  handlePayment(tarif.prix, `Bannière publicitaire ${tarif.label} — MarchéduRoi`, async()=>{
                    const expDate = new Date();
                    expDate.setDate(expDate.getDate() + tarif.days);
                    const req = {
                      entreprise: modal.adEntreprise, slogan: modal.adSlogan||"",
                      logo_url: modal.adLogo||"", lien: modal.adLien||"",
                      couleur1: modal.adCouleur1||"#6C63FF", couleur2: modal.adCouleur2||"#8B84FF",
                      duree: tarif.days, prix: tarif.prix, status: "en_attente",
                      user_id: user?.id||"", user_name: user?.name||"Anonyme",
                      expires_at: expDate.toISOString().slice(0,10),
                    };
                    const { error } = await supabase.from("ad_requests").insert(req);
                    if (error) { notify("Erreur lors de la demande","error"); return; }
                    setModal(null);
                    notify("✅ Demande envoyée ! Votre bannière sera activée après validation.");
                  });
                }} className="btn-glow" style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#6C63FF,#FF6584)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer" }}>
                  ⚡ Payer et soumettre ma bannière
                </button>
                <p style={{ textAlign:"center",color:theme.sub,fontSize:11,marginTop:10 }}>Validation manuelle sous 24h · Paiement sécurisé MTN/Moov Money</p>
              </>
            )}

            {/* CONFIRMATION EMAIL INSCRIPTION */}
            {modal.type==="emailConfirmation"&&(
              <>
                <div style={{ textAlign:"center",marginBottom:24 }}>
                  <div style={{ fontSize:64,marginBottom:16 }}>📧</div>
                  <h3 style={{ fontWeight:800,fontSize:22,color:theme.text,marginBottom:8 }}>Confirmez votre adresse email</h3>
                  <p style={{ color:"#6C63FF",fontWeight:600,fontSize:14,marginBottom:4 }}>{modal.email}</p>
                </div>
                <div style={{ background:"rgba(67,198,172,0.08)",border:"1px solid rgba(67,198,172,0.3)",borderRadius:14,padding:20,marginBottom:20 }}>
                  <p style={{ color:theme.text,fontSize:14,lineHeight:1.8,marginBottom:12 }}>
                    ✅ Votre compte a été créé avec succès !
                  </p>
                  <p style={{ color:theme.text,fontSize:14,lineHeight:1.8,marginBottom:12 }}>
                    Un email de confirmation vient d'être envoyé à votre adresse. 
                    Cliquez sur le lien dans cet email pour activer votre compte.
                  </p>
                  <p style={{ color:"#FF8C00",fontWeight:700,fontSize:13,lineHeight:1.7 }}>
                    ⚠️ Vous ne trouvez pas l'email ? Vérifiez votre dossier <strong>SPAM</strong> ou <strong>Courrier indésirable</strong> — il s'y trouve parfois automatiquement.
                  </p>
                </div>
                <div style={{ background:"rgba(108,99,255,0.08)",border:"1px solid rgba(108,99,255,0.2)",borderRadius:12,padding:14,marginBottom:20,fontSize:13,color:theme.sub,lineHeight:1.7 }}>
                  <p>📌 <strong style={{ color:theme.text }}>Étapes à suivre :</strong></p>
                  <p>1. Ouvrez votre boîte email</p>
                  <p>2. Cherchez un email de <strong style={{ color:"#6C63FF" }}>noreply@marcheduroi.com</strong></p>
                  <p>3. Vérifiez le dossier SPAM si vous ne le voyez pas</p>
                  <p>4. Cliquez sur le lien de confirmation</p>
                  <p>5. Revenez sur MarchéduRoi et connectez-vous</p>
                </div>
                <button onClick={()=>setModal(null)} className="btn-glow"
                  style={{ width:"100%",padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer",transition:"box-shadow 0.2s" }}>
                  ✅ J'ai compris — Aller vérifier mes emails
                </button>
              </>
            )}

            {modal.type==="suggestion"&&(
              <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
                  <h3 style={{ fontWeight:800,fontSize:20,color:theme.text }}>💡 Envoyer une suggestion</h3>
                  <button onClick={()=>setModal(null)} style={{ background:"transparent",border:"none",color:theme.sub }}><Icon name="x" size={20}/></button>
                </div>
                <p style={{ color:theme.sub,fontSize:14,marginBottom:24,lineHeight:1.5 }}>Partagez vos idées pour améliorer MarchéduRoi ! Toutes les suggestions sont lues par l'équipe.</p>
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

// Page détail universelle
function PersistentLayout() {
  const location   = useLocation();
  const segments   = location.pathname.split("/").filter(Boolean);
  const hostname   = window.location.hostname;

  const validTypes    = ["annonce","boutique","atelier","resto","beaute"];
  const isDetail      = segments.length >= 2 && validTypes.includes(segments[0]) && segments[1] && segments[1] !== "undefined";
  // /vitrine seul → formulaire création
  const isVitrineReq  = segments[0] === "vitrine"  && segments.length === 1;
  // /vitrine/slug (+ /modifier ou /payer optionnel) → page publique
  const isVitrineSlug = segments[0] === "vitrine"  && segments.length >= 2 && segments[1] && segments[1] !== "undefined";
  // /vitrines → annuaire
  const isVitrineDir  = segments[0] === "vitrines" && segments.length === 1;
  // Sous-domaine : slug.vitrine.marcheduroi.com
  const isVitrineSub  = hostname.includes(".vitrine.marcheduroi.com");

  return (
    <>
      <div style={{ display: (isDetail || isVitrineReq || isVitrineSlug || isVitrineSub || isVitrineDir) ? "none" : "block" }}>
        <AppContent/>
      </div>
      {isDetail                        && <AnnonceDetail/>}
      {(isVitrineSlug || isVitrineSub) && <VitrineDetail/>}
      {isVitrineReq                    && <VitrineRequest/>}
      {isVitrineDir                    && <VitrineDirectory/>}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<PersistentLayout/>}/>
      </Routes>
    </BrowserRouter>
  );
}
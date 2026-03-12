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
    ]
  },
  {
    id: 2, title: "Appartement meublé 3 pièces - Akpakpa", category: "Immobilier",
    description: "Appartement entièrement meublé, climatisé, avec eau et électricité. Situé à Akpakpa près du marché. Disponible immédiatement. Idéal pour cadre ou couple.",
    author: "Adjovi R.", authorId: "u7", price: "120 000 FCFA/mois", date: "2026-03-03", likes: 9,
    contact: "adjovi@email.com", phone: "+22997100002",
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80"
    ]
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

const PLANS = [
  { id: "monthly", label: "Mensuel", price: "9,99€", period: "/mois", color: "#6C63FF", desc: "Idéal pour commencer" },
  { id: "yearly", label: "Annuel", price: "79€", period: "/an", color: "#FF6584", desc: "2 mois offerts ✨", popular: true },
  { id: "lifetime", label: "À vie", price: "149€", period: " unique", color: "#43C6AC", desc: "Accès illimité pour toujours" },
];

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

export default function App() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [suggestions, setSuggestions] = useState([{ id:1,text:"Ajouter un système de messagerie interne",author:"Visiteur anonyme",date:"2026-03-10",status:"en attente" }]);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [modal, setModal] = useState(null);
  const [notification, setNotification] = useState(null);
  const [likedPosts, setLikedPosts] = useState([]);
  const [authForm, setAuthForm] = useState({ email:"",password:"",name:"" });
  const [postForm, setPostForm] = useState({ title:"",category:"Autre",description:"",price:"",contact:"",phone:"" });
  const [postPhotos, setPostPhotos] = useState([]);
  const [vehicleForm, setVehicleForm] = useState({});
  const [themeId, setThemeId] = useState("dark");
  const [suggestionText, setSuggestionText] = useState("");
  const [suggestionName, setSuggestionName] = useState("");
 const [showBgPicker, setShowBgPicker] = useState(false);
const [loading, setLoading] = useState(true);
  const nextId = useRef(100);

  const theme = BACKGROUNDS.find(b=>b.id===themeId)||BACKGROUNDS[0];

  const notify = (msg, type="success") => { setNotification({msg,type}); setTimeout(()=>setNotification(null),3000); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from("profiles").select("*").eq("id", session.user.id).single()
          .then(({ data }) => {
            if (data) setUser({ id:session.user.id, name:data.name, role:data.role||"user", isPremium:data.is_premium||false, plan:data.plan });
            setLoading(false);
          });
      } else {
        setLoading(false);
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
    setView("pricing"); notify("Compte créé ! Choisissez votre abonnement.");
  };

  const logout = async () => { await supabase.auth.signOut(); setUser(null); setView("home"); notify("À bientôt !"); };
  const activatePremium = (plan) => { setUser(u=>({...u,isPremium:true,plan:plan.label})); setModal(null); setView("home"); notify(`Abonnement ${plan.label} activé !`); };
  const canEdit = user && (user.isPremium || user.role === "admin");

  const isVehicle = postForm.category === "Véhicules";

  const addPost = () => {
    if (!postForm.title||!postForm.description) { notify("Titre et description requis","error"); return; }
    if (isVehicle && !vehicleForm.marque) { notify("La marque du véhicule est requise","error"); return; }
    const newPost = { ...postForm, id:nextId.current++, author:user.name, authorId:user.id, date:new Date().toISOString().slice(0,10), likes:0, photos:postPhotos, vehicle:isVehicle?vehicleForm:null };
    setPosts(p=>[newPost,...p]);
    setModal(null); setPostForm({ title:"",category:"Autre",description:"",price:"",contact:"",phone:"" }); setPostPhotos([]); setVehicleForm({});
    notify("Annonce publiée !");
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

  const filtered = posts.filter(p=>(category==="Toutes"||p.category===category)&&(p.title.toLowerCase().includes(search.toLowerCase())||p.description.toLowerCase().includes(search.toLowerCase())));
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
        <div style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer" }} onClick={()=>setView("home")}>
          <div style={{ width:32,height:32,background:"linear-gradient(135deg,#6C63FF,#FF6584)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center" }}><Icon name="tag" size={16}/></div>
          <span style={{ fontWeight:800,fontSize:18,background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>MarketFlow</span>
        </div>
        <div style={{ display:"flex",gap:6,alignItems:"center",flexWrap:"wrap" }}>
          {["home","pricing"].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ background:view===v?"rgba(108,99,255,0.2)":"transparent",border:"none",color:view===v?"#6C63FF":theme.sub,padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>
              {v==="home"?"Annonces":"Tarifs"}
            </button>
          ))}
          <button onClick={()=>setModal({type:"suggestion"})} style={{ background:"rgba(67,198,172,0.1)",border:"none",color:"#43C6AC",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:6 }}><Icon name="suggestion" size={14}/>Suggestion</button>
          {user?.role==="admin"&&<button onClick={()=>setView("admin")} style={{ background:"transparent",border:"none",color:"#FF6584",padding:"8px 14px",borderRadius:8,fontWeight:600,fontSize:13 }}>Admin</button>}
          <button onClick={()=>setShowBgPicker(p=>!p)} style={{ background:"rgba(108,99,255,0.1)",border:`1px solid rgba(108,99,255,0.3)`,color:"#6C63FF",padding:"8px 12px",borderRadius:8,display:"flex",alignItems:"center",gap:6,fontWeight:600,fontSize:13 }}><Icon name="palette" size={14}/>Thème</button>
          {loading ? (
  <div style={{ width:80,height:32,background:theme.border,borderRadius:8 }}/>
) : user?(
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
              {user.isPremium&&<span style={{ background:"linear-gradient(135deg,#FFD700,#FFA500)",color:"#000",padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4 }}><Icon name="crown" size={10}/>PRO</span>}
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

          <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:28,justifyContent:"center" }}>
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setCategory(c)} style={{ background:category===c?"linear-gradient(135deg,#6C63FF,#8B84FF)":theme.card,border:category===c?"none":`1px solid ${theme.border}`,color:category===c?"#fff":theme.sub,padding:"8px 18px",borderRadius:24,fontWeight:600,fontSize:13,transition:"all 0.2s",display:"flex",alignItems:"center",gap:6 }}>
                {c==="Véhicules"&&<Icon name="car" size={12}/>}{c}
              </button>
            ))}
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
                  <h3 style={{ fontWeight:700,fontSize:16,marginBottom:8,lineHeight:1.3,color:theme.text }}>{post.title}</h3>

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
                      <button onClick={()=>setModal({type:"contact",data:post})} style={{ background:"rgba(67,198,172,0.1)",border:"none",color:"#43C6AC",padding:"6px 10px",borderRadius:8,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}><Icon name="mail" size={13}/>Contact</button>
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

      {/* PRICING */}
      {view==="pricing"&&(
        <div style={{ width:"100%",padding:"48px 40px",animation:"fadeIn 0.4s ease" }}>
          <div style={{ textAlign:"center",marginBottom:48 }}>
            <h2 style={{ fontSize:40,fontWeight:800,marginBottom:12,color:theme.text }}>Choisissez votre <span style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>formule</span></h2>
            <p style={{ color:theme.sub,fontSize:16 }}>Lecture gratuite · Publiez avec photos avec un abonnement</p>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,maxWidth:900,margin:"0 auto" }}>
            {PLANS.map(plan=>(
              <div key={plan.id} className="card-hover" style={{ ...cardStyle,borderRadius:20,padding:32,position:"relative",border:`2px solid ${plan.popular?"#6C63FF":theme.border}` }}>
                {plan.popular&&<div style={{ position:"absolute",top:-14,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",color:"#fff",padding:"4px 16px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap" }}>POPULAIRE</div>}
                <div style={{ width:48,height:48,borderRadius:14,background:`${plan.color}22`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,color:plan.color }}><Icon name="crown" size={20}/></div>
                <h3 style={{ fontWeight:700,fontSize:20,marginBottom:4,color:theme.text }}>{plan.label}</h3>
                <p style={{ color:theme.sub,fontSize:13,marginBottom:24 }}>{plan.desc}</p>
                <div style={{ marginBottom:28 }}><span style={{ fontSize:36,fontWeight:800,color:plan.color }}>{plan.price}</span><span style={{ color:theme.sub,fontSize:14 }}>{plan.period}</span></div>
                {["Publier toutes catégories","Annonces véhicules détaillées","1 à 3 photos par annonce","Contact email, téléphone, WhatsApp","Modifier & supprimer vos annonces","Badge PRO"].map(f=>(
                  <div key={f} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10,fontSize:13,color:theme.text }}><span style={{ color:"#43C6AC" }}><Icon name="check" size={14}/></span>{f}</div>
                ))}
                <button onClick={()=>user?activatePremium(plan):setView("register")} className="btn-glow" style={{ width:"100%",marginTop:24,padding:"14px",background:`linear-gradient(135deg,${plan.color},${plan.color}BB)`,border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
                  {user?"Choisir ce plan":"S'inscrire d'abord"}
                </button>
              </div>
            ))}
          </div>
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
            {!user.isPremium&&<button onClick={()=>setView("pricing")} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"12px 24px",borderRadius:12,fontWeight:700,fontSize:14,transition:"box-shadow 0.2s" }}>Passer PRO</button>}
          </div>
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
              <div style={{ display:"flex",gap:8,flexShrink:0 }}>
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
            {[{label:"Annonces",val:posts.length,color:"#6C63FF"},{label:"Véhicules",val:posts.filter(p=>p.category==="Véhicules").length,color:"#FF6584"},{label:"Suggestions",val:suggestions.length,color:"#43C6AC"}].map(s=>(
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

                <button onClick={modal.type==="add"?addPost:editPost} className="btn-glow" style={{ width:"100%",marginTop:24,padding:"14px",background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
                  {modal.type==="add"?"Publier l'annonce":"Enregistrer"}
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

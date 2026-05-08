import { supabase } from "./supabase";
import { useNavigate, useLocation } from "react-router-dom";
import React from "react";

export const VITRINE_TYPES = ["Restaurant","Maquis / Buvette","Fast-food","Pâtisserie / Boulangerie","Bar / Lounge","École maternelle","École primaire","Collège","Lycée","Complexe scolaire","Université / Institut","Centre de formation","Crèche / Garderie","Clinique","Cabinet médical","Pharmacie","Cabinet dentaire","Cabinet ophtalmologique","Maternité","Centre de kinésithérapie","Laboratoire d'analyses","Hôtel","Auberge / Maison d'hôtes","Boutique / Magasin","Supermarché","Agence immobilière","Station-service","Garage / Mécanique","Salon de coiffure","Spa / Beauté","Pressing / Laverie","Imprimerie / Copie","Cabinet d'avocats","Notaire","Huissier","Bureau d'expertise comptable","Architecte","Bureau d'études","Agence de communication","Mairie","ONG","Association","Fondation","Paroisse / Église","Mosquée","Temple","Autre"];

export const NEWS_TYPES = ["Actualité","Promotion","Nouveauté","Événement","Offre d'emploi","Menu du jour","Spécialité","Annonce"];

export const VITRINE_THEMES = {
  dark:   { label:"🌑 Sombre",   bg:"#0D0F1A", card:"#1A1D30", text:"#E8E8F0", sub:"#9A9AB0", border:"#2A2D45", accent:"#10B981" },
  light:  { label:"☀️ Clair",    bg:"#F8FAFC", card:"#FFFFFF", text:"#1A1D30", sub:"#6B7280", border:"#E2E8F0", accent:"#10B981" },
  ocean:  { label:"🌊 Océan",    bg:"#0A1628", card:"#112240", text:"#E6F1FF", sub:"#8892B0", border:"#1E3A5F", accent:"#38BDF8" },
  nature: { label:"🌿 Nature",   bg:"#0D1F14", card:"#1A3122", text:"#E8F5E9", sub:"#81C784", border:"#2E7D32", accent:"#4ADE80" },
  royal:  { label:"👑 Royal",    bg:"#0F0A1A", card:"#1E1432", text:"#EDE7F6", sub:"#B39DDB", border:"#4A148C", accent:"#A78BFA" },
  sunset: { label:"🌅 Coucher",  bg:"#1A0F0A", card:"#2D1B10", text:"#FFF3E0", sub:"#FFAB76", border:"#5D2E0C", accent:"#FB923C" },
};

export const getVitrineTheme = (structure) => {
  return VITRINE_THEMES[structure?.theme] || VITRINE_THEMES.dark;
};

export const toSlug = (str) =>
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

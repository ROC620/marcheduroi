import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { getPhonePlaceholder, getPhonePrefix } from "../utils";
import { VITRINE_TYPES, toSlug } from "../vitrineConstants";

function AdminVitrineWeb({ theme, notify }) {
  const COLOR = "#10B981";

  // ---- Onglet actif : "liste", "creer" ou "modifier" ----
  const [tab, setTab] = React.useState("liste");

  // ---- Liste des structures ----
  const [structures, setStructures] = React.useState([]);
  const [loadingList, setLoadingList] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState(null);

  // ---- Structure en cours d'édition ----
  const [editingId, setEditingId] = React.useState(null);

  // ---- Formulaire création / modification ----
  const emptyForm = {
    slug:"", name:"", type:"Restaurant", slogan:"", description:"",
    logo_url:"", cover_url:"", photos:"", video:"",
    address:"", ville:"", quartier:"", von:"",
    gps_lat:"", gps_lng:"",
    phone:"", phone2:"", whatsapp:"", email:"",
    website:"", facebook:"", instagram:"",
    hours:"", languages:"", services:"",
    verified: false, active: true, free_activation: false,
  };
  const [form,    setForm]    = React.useState(emptyForm);
  const [saving,  setSaving]  = React.useState(false);
  const [saveMsg, setSaveMsg] = React.useState(null);

  // ---- Ouvrir le formulaire de modification ----
  const openEdit = async (s) => {
    setSaveMsg(null);
    // Charger la structure complète
    const { data } = await supabase.from("structures").select("*").eq("id", s.id).single();
    if (!data) return;
    setEditingId(data.id);
    setForm({
      slug:       data.slug       || "",
      name:       data.name       || "",
      type:       data.type       || "Restaurant",
      slogan:     data.slogan     || "",
      description:data.description|| "",
      logo_url:   data.logo_url   || "",
      cover_url:  data.cover_url  || "",
      photos:     (data.photos    || []).join("\n"),
      video:      data.video      || "",
      address:    data.address    || "",
      ville:      data.ville      || "",
      quartier:   data.quartier   || "",
      von:        data.von        || "",
      gps_lat:    data.gps_lat    ? String(data.gps_lat) : "",
      gps_lng:    data.gps_lng    ? String(data.gps_lng) : "",
      phone:      data.phone      || "",
      phone2:     data.phone2     || "",
      whatsapp:   data.whatsapp   || "",
      email:      data.email      || "",
      website:    data.website    || "",
      facebook:   data.facebook   || "",
      instagram:  data.instagram  || "",
      hours:      data.hours      || "",
      languages:  data.languages  || "",
      services:   data.services   || "",
      verified:   data.verified   || false,
      active:     data.active     || false,
      free_activation: false,
    });
    setTab("modifier");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---- Enregistrer les modifications admin ----
  const handleUpdate = async () => {
    if (!form.name.trim()) { setSaveMsg({ type:"error", text:"Le nom est obligatoire." }); return; }
    if (!form.slug.trim()) { setSaveMsg({ type:"error", text:"Le slug est obligatoire." }); return; }
    setSaving(true); setSaveMsg(null);
    const photosArray = form.photos.split("\n").map(l => l.trim()).filter(Boolean).slice(0,10);
    const { error } = await supabase.from("structures").update({
      slug:        form.slug.trim(),
      name:        form.name.trim(),
      type:        form.type,
      slogan:      form.slogan     || null,
      description: form.description|| null,
      logo_url:    form.logo_url   || null,
      cover_url:   form.cover_url  || null,
      photos:      photosArray,
      video:       form.video      || null,
      address:     form.address    || null,
      ville:       form.ville      || null,
      quartier:    form.quartier   || null,
      von:         form.von        || null,
      gps_lat:     form.gps_lat    ? parseFloat(form.gps_lat)  : null,
      gps_lng:     form.gps_lng    ? parseFloat(form.gps_lng)  : null,
      phone:       form.phone      || null,
      phone2:      form.phone2     || null,
      whatsapp:    form.whatsapp   || null,
      email:       form.email      || null,
      website:     form.website    || null,
      facebook:    form.facebook   || null,
      instagram:   form.instagram  || null,
      hours:       form.hours      || null,
      languages:   form.languages  || null,
      services:    form.services   || null,
      verified:    form.verified,
      active:      form.active,
      updated_at:  new Date().toISOString(),
    }).eq("id", editingId);
    if (error) {
      setSaveMsg({ type:"error", text: error.code === "23505" ? "Ce slug existe déjà." : "Erreur : " + error.message });
    } else {
      setSaveMsg({ type:"success", text:"✅ Vitrine mise à jour avec succès !" });
      await loadStructures();
      setTimeout(() => { setTab("liste"); setSaveMsg(null); setEditingId(null); }, 2000);
    }
    setSaving(false);
  };

  // ---- Chargement de la liste ----
  const loadStructures = React.useCallback(async () => {
    setLoadingList(true);
    const { data, error } = await supabase
      .from("structures")
      .select("id, slug, name, type, verified, active, created_at, edit_token, ville, phone, owner_id, paid_at, expires_at, domain_active, custom_domain")
      .order("created_at", { ascending: false });
    if (!error && data) setStructures(data);
    setLoadingList(false);
  }, []);

  React.useEffect(() => { loadStructures(); }, [loadStructures]);

  // ---- Auto-génération du slug depuis le nom ----
}


// -----------------------------------------------
// VitrineEdit — Page de modification client
// (rendu depuis VitrineDetail si isEditMode=true)
// -----------------------------------------------
// -----------------------------------------------
// VitrinePayment — Page de paiement client
// Route : /vitrine/:slug/payer?token=XXX
// -----------------------------------------------
// -----------------------------------------------
// VitrineRequest — Formulaire public de création
// Route : /vitrine
// -----------------------------------------------

export default AdminVitrineWeb;

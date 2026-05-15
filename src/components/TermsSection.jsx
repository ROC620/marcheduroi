import React from "react";
import { normalizeText, isUrgentActive, getPhonePrefix } from "../utils";

export default function TermsSection({ theme, setView, boutiques, ateliers, view }) {
  return (
    <>
{view==="terms"&&(
  <div style={{ width:"100%",maxWidth:900,margin:"0 auto",padding:"48px 40px",animation:"fadeIn 0.4s ease" }}>

    {/* Header */}
    <div style={{ textAlign:"center",marginBottom:48 }}>
      <div style={{ fontSize:56,marginBottom:16 }}>📋</div>
      <h1 style={{ fontSize:42,fontWeight:800,marginBottom:12,color:theme.text }}>Conditions Générales <span style={{ background:"linear-gradient(135deg,#6C63FF,#FF6584)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>d'Utilisation</span></h1>
      <p style={{ color:theme.sub,fontSize:15 }}>Dernière mise à jour : Mars 2026 · MarchéduRoi, Ouidah, Bénin</p>
      <p style={{ color:theme.sub,fontSize:13,marginTop:6 }}>Version 2.1 — Ces conditions remplacent toutes les versions antérieures.</p>
    </div>

    {/* Avertissement */}
    <div style={{ background:"rgba(255,71,87,0.08)",border:"2px solid rgba(255,71,87,0.3)",borderRadius:16,padding:24,marginBottom:40,display:"flex",gap:16,alignItems:"flex-start" }}>
      <span style={{ fontSize:28,flexShrink:0 }}>⚠️</span>
      <div>
        <p style={{ fontWeight:800,fontSize:16,color:"#FF4757",marginBottom:8 }}>Avertissement Important</p>
        <p style={{ color:theme.sub,fontSize:14,lineHeight:1.8 }}>
          En utilisant MarchéduRoi, vous acceptez pleinement et sans réserve les présentes conditions générales d'utilisation. Toute violation expose l'utilisateur à des poursuites judiciaires conformément aux lois en vigueur au Bénin et dans son pays de résidence, ainsi qu'aux conventions et traités internationaux applicables en matière de commerce électronique et de cybercriminalité.
        </p>
      </div>
    </div>

    {[
      {
        num:"1",
        title:"Présentation de MarchéduRoi",
        icon:"🏢",
        content:`MarchéduRoi est une plateforme numérique multipolaire de petites annonces, créée et exploitée par EDENPORTAIL, établissement spécialisé dans la création et le référencement de sites internet, dont le siège social est établi à Ouidah, République du Bénin. La plateforme permet à toute personne physique ou morale de consulter, publier et diffuser des annonces relatives à des produits, biens et services, au Bénin et dans toute l'Afrique francophone. L'accès et l'utilisation de la plateforme impliquent l'acceptation sans réserve des présentes conditions générales d'utilisation (CGU).`
      },
      {
        num:"2",
        title:"Conditions d'accès et d'inscription",
        icon:"👤",
        content:`La consultation des annonces est entièrement gratuite et accessible à tous sans inscription préalable. La publication d'annonces est réservée aux utilisateurs inscrits et ayant confirmé leur adresse email. Pour s'inscrire, l'utilisateur doit fournir des informations exactes, complètes et à jour. Toute inscription effectuée avec de fausses informations entraîne la suspension immédiate du compte et peut faire l'objet de poursuites judiciaires. L'utilisateur est seul responsable de la confidentialité de ses identifiants de connexion et de toute activité effectuée depuis son compte.`
      },
      {
        num:"3",
        title:"Publication d'annonces et tarification",
        icon:"💰",
        content:`TARIFS DE PUBLICATION : ANNONCES CLASSIQUES : publication gratuite et illimitée pour tous. SPONSORING ANNONCES : 500 FCFA pour 7 jours · 1 500 FCFA pour 30 jours · 3 500 FCFA pour 90 jours · 6 000 FCFA pour 180 jours. BOUTIQUES, ATELIERS, RESTAURANTS & BARS, SALONS BEAUTÉ : 4 jours gratuits par mois puis 1 500 FCFA pour 30 jours · 3 500 FCFA pour 90 jours · 6 000 FCFA pour 180 jours · 10 000 FCFA pour 360 jours (tarifs de lancement valables jusqu'à fin juin 2026). BADGE URGENT : 500 FCFA pour 3 jours · 1 000 FCFA pour 7 jours. VIDÉO : La vidéo ajoutée à une annonce doit montrer uniquement le produit ou service annoncé. Toute vidéo montrant autre chose (boutique entière, publicité générale, contenu non lié) constitue un abus et entraîne la suppression de l'annonce sans préavis. MODIFICATION : Gratuite et illimitée pour les annonces classiques. Pour les boutiques, ateliers, restaurants et salons beauté, les modifications sont incluses dans l'abonnement actif. Les paiements s'effectuent selon le pays de l'utilisateur : via Mobile Money (MTN Money, Moov Money) par l'intermédiaire de FedaPay pour les pays de la zone UEMOA, et via Flutterwave pour les autres pays africains couverts par la plateforme. REMBOURSEMENTS : Tout paiement est définitif et non remboursable, sauf défaillance technique avérée et prouvée de la plateforme. En cas de réclamation, contacter support@marcheduroi.com dans un délai de 7 jours ouvrables.`
      },
      {
        num:"4",
        title:"Contenus interdits",
        icon:"🚫",
        content:`Il est formellement interdit de publier sur MarchéduRoi : des armes, munitions ou matériels militaires de toute nature ; des stupéfiants, drogues ou substances illicites ; des contenus à caractère pornographique, obscène ou sexuellement explicite ; tout contenu impliquant des mineurs de manière inappropriée ; des animaux protégés ou en voie de disparition ; des médicaments sans autorisation officielle ; des produits contrefaits, volés ou illicites ; des annonces frauduleuses, trompeuses ou mensongères ; des contenus incitant à la haine raciale, ethnique, religieuse ou sexuelle ; des contenus portant atteinte aux droits de propriété intellectuelle ; tout contenu violant les lois et réglementations en vigueur. Toute annonce violant ces interdictions sera supprimée immédiatement et l'auteur signalé aux autorités compétentes.`
      },
      {
        num:"5",
        title:"Responsabilité des utilisateurs",
        icon:"⚖️",
        content:`Chaque utilisateur est entièrement et personnellement responsable du contenu qu'il publie sur MarchéduRoi. L'utilisateur garantit que ses annonces sont conformes aux lois en vigueur au Bénin et dans tout pays destinataire. MarchéduRoi n'a pas l'obligation de vérifier l'exactitude des informations publiées et ne peut être tenu responsable des transactions effectuées entre utilisateurs. En cas de litige entre un acheteur et un vendeur, MarchéduRoi ne peut être partie au litige et ne saurait voir sa responsabilité engagée à ce titre. L'utilisateur s'engage à utiliser la plateforme de manière loyale et à ne pas en perturber le fonctionnement technique.`
      },
      {
        num:"6",
        title:"Limitation de responsabilité de MarchéduRoi",
        icon:"🛡️",
        content:`MarchéduRoi agit en qualité d'intermédiaire technique hébergeant des contenus publiés par des tiers. MarchéduRoi ne peut être tenu responsable : des contenus publiés par les utilisateurs ; des transactions commerciales entre utilisateurs ; des pertes financières directes ou indirectes résultant d'une utilisation de la plateforme ; des interruptions temporaires de service pour raisons de maintenance ou de force majeure ; des dommages indirects, consécutifs ou imprévus liés à l'utilisation du site. MarchéduRoi ne prend aucune commission sur les transactions effectuées entre acheteurs et vendeurs. Toute transaction se fait directement entre le vendeur et l'acheteur, sans intervention de MarchéduRoi. MarchéduRoi ne gère ni les transactions financières entre particuliers, ni la livraison des produits ou services. ⚠️ AVERTISSEMENT IMPORTANT : Quel que soit le montant de la transaction, même inférieur à 1 FCFA, il est OBLIGATOIRE de vérifier l'identité du vendeur, l'authenticité du produit ou service, et l'état réel du bien avant tout paiement, remise d'argent ou échange de valeur. MarchéduRoi décline toute responsabilité pour toute perte financière, arnaque, tromperie ou préjudice résultant d'une transaction entre utilisateurs, indépendamment du montant concerné. La prudence et la vérification systématique sont de la seule responsabilité des parties à la transaction. MarchéduRoi s'engage cependant à déployer tous les efforts raisonnables pour assurer la disponibilité, la sécurité et la qualité de la plateforme.`
      },
      {
        num:"6bis",
        title:"Responsabilité concernant VitrineWeb",
        icon:"🏛️",
        content:`MarchéduRoi héberge des pages VitrineWeb pour des établissements (restaurants, boutiques, écoles, cliniques, etc.). Les informations publiées sur ces pages (horaires, tarifs, services, contacts, localisation GPS) sont fournies exclusivement par les établissements concernés et placées sous leur entière responsabilité. MarchéduRoi ne vérifie pas l'exactitude, la complétude ou l'actualité de ces informations et ne saurait être tenu responsable de toute erreur, omission ou modification non signalée. Les avis clients publiés sur les vitrines reflètent les opinions personnelles de leurs auteurs. MarchéduRoi n'est pas responsable du contenu de ces avis, sauf en cas d'avis manifestement illicites signalés et non retirés dans un délai raisonnable.`
      },
      {
        num:"7",
        title:"Force majeure",
        icon:"🌪️",
        content:`MarchéduRoi ne saurait être tenu responsable de tout manquement à ses obligations contractuelles résultant d'un événement de force majeure, entendu comme tout événement extérieur, imprévisible et irrésistible au sens du droit béninois. Sont notamment considérés comme cas de force majeure : les catastrophes naturelles, les coupures généralisées d'internet, les cyberattaques massives, les décisions gouvernementales, les épidémies ou pandémies, les conflits armés. En cas de force majeure, MarchéduRoi informera les utilisateurs dans les meilleurs délais et prendra les mesures nécessaires pour rétablir le service le plus rapidement possible.`
      },
      {
        num:"8",
        title:"Protection des données personnelles",
        icon:"🔒",
        content:`MarchéduRoi collecte et traite les données personnelles des utilisateurs dans le strict respect de la vie privée et conformément aux lois applicables. DONNÉES COLLECTÉES : nom, adresse email, numéro de téléphone (optionnel), localisation (optionnelle), photos et contenus publiés. FINALITÉ : ces données sont utilisées exclusivement pour le fonctionnement de la plateforme, la gestion des comptes, le traitement des paiements et la lutte contre la fraude. Elles ne sont jamais vendues ni cédées à des tiers à des fins commerciales. SOUS-TRAITANTS : MarchéduRoi utilise Supabase (hébergement et base de données), FedaPay (paiements zone UEMOA) et Flutterwave (paiements panafricains) comme sous-traitants techniques opérant dans le respect des règles de protection des données. DURÉE DE CONSERVATION : les données sont conservées pendant toute la durée d'activité du compte, puis 3 ans après sa suppression pour des obligations légales. DROITS : tout utilisateur dispose d'un droit d'accès, de rectification, de suppression et de portabilité de ses données en contactant : contact@marcheduroi.com. Nous nous engageons à répondre dans un délai de 30 jours.`
      },
      {
        num:"9",
        title:"Propriété intellectuelle",
        icon:"©️",
        content:`La plateforme MarchéduRoi, son logo, sa charte graphique, son design, son code source et l'ensemble de ses contenus originaux sont la propriété exclusive de EDENPORTAIL. Toute reproduction, modification, distribution, extraction ou utilisation commerciale, même partielle, sans autorisation écrite préalable est strictement interdite et constitue une contrefaçon passible de sanctions pénales et civiles. Les utilisateurs conservent l'entière propriété des contenus qu'ils publient (textes, photos, vidéos) et accordent à MarchéduRoi une licence d'affichage non exclusive, mondiale et gratuite, limitée à la durée de publication de l'annonce.`
      },
      {
        num:"10",
        title:"Suspension et sanctions",
        icon:"🔴",
        content:`MarchéduRoi se réserve le droit de suspendre ou supprimer tout compte, sans préavis ni remboursement, en cas de : violation des présentes CGU ; publication de contenus illicites ou frauduleux ; comportement abusif envers d'autres utilisateurs ou envers l'équipe MarchéduRoi ; usurpation d'identité ; tentative de piratage ou de perturbation technique de la plateforme ; utilisation de fausses informations lors de l'inscription. La suspension entraîne la désactivation immédiate de toutes les annonces actives sans remboursement. L'utilisateur suspendu peut introduire un recours en écrivant à contact@marcheduroi.com dans un délai de 15 jours. Indépendamment des sanctions internes, MarchéduRoi se réserve le droit d'engager toutes les procédures judiciaires nécessaires à la protection de ses droits et de ceux de ses utilisateurs, conformément aux lois béninoises et aux conventions internationales applicables.`
      },
      {
        num:"11",
        title:"Cookies et traceurs",
        icon:"🍪",
        content:`MarchéduRoi utilise des technologies de stockage local (localStorage) pour mémoriser vos préférences (thème, langue, favoris) et améliorer votre expérience de navigation. Ces données sont stockées uniquement sur votre appareil et ne sont pas transmises à des serveurs tiers. Aucun cookie publicitaire ou de traçage commercial n'est utilisé sur MarchéduRoi. Les annonces publicitaires de tiers sont strictement interdites sur la plateforme.`
      },
      {
        num:"12",
        title:"Modification des conditions et préavis",
        icon:"📝",
        content:`MarchéduRoi se réserve le droit de modifier les présentes CGU à tout moment. En cas de modification substantielle, les utilisateurs seront informés par notification sur la plateforme et par email au moins 30 jours avant l'entrée en vigueur des nouvelles conditions. La poursuite de l'utilisation de MarchéduRoi après l'expiration du délai de préavis constitue une acceptation tacite des nouvelles conditions. En cas de désaccord, l'utilisateur peut supprimer son compte avant l'entrée en vigueur des nouvelles conditions.`
      },
      {
        num:"13",
        title:"Droit applicable et juridiction",
        icon:"🏛️",
        content:`Les présentes CGU sont régies par le droit béninois. En cas de litige relatif à l'interprétation, à la validité ou à l'exécution des présentes conditions, les parties s'engagent à rechercher une solution amiable dans un premier temps. À défaut d'accord amiable dans un délai de 30 jours, tout litige sera soumis à la compétence exclusive des tribunaux compétents de Cotonou, République du Bénin, nonobstant pluralité de défendeurs ou appel en garantie.`
      },
      {
        num:"14",
        title:"Programme de Parrainage",
        icon:"🎁",
        content:`MarchéduRoi propose un programme de parrainage. L'utilisateur doit parrainer 10 nouveaux inscrits via son lien unique pour obtenir 1 mois de publication gratuit (valeur 1 500 FCFA) pour une annonce simple uniquement. Non applicable aux boutiques, ateliers, restaurants, bars ou salons de beauté. Les crédits obtenus ne sont ni remboursables ni échangeables contre de l'argent. Toute tentative de fraude (faux comptes, parrainages fictifs) entraîne la suppression immédiate du compte et l'annulation de tous les crédits.`
      },
      {
        num:"15",
        title:"Contact et réclamations",
        icon:"📞",
        content:`Pour toute question, réclamation ou signalement : Email général : contact@marcheduroi.com · Support technique : support@marcheduroi.com · WhatsApp Support : +229 01 40 90 60 20 · Adresse : EDENPORTAIL, Ouidah, République du Bénin. Délai de réponse garanti : 48 heures ouvrables pour les demandes générales, 24 heures pour les urgences techniques.`
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
      <p style={{ fontWeight:800,fontSize:16,color:theme.text,marginBottom:8 }}>En utilisant MarchéduRoi, vous confirmez avoir lu, compris et accepté l'intégralité des présentes conditions générales d'utilisation.</p>
      <p style={{ color:theme.sub,fontSize:13,marginBottom:4 }}>© 2026 MarchéduRoi · Ouidah, Bénin 🇧🇯 · contact@marcheduroi.com</p>
      <p style={{ color:theme.sub,fontSize:12,marginBottom:20 }}>Version 2.1 — Mars 2026 · 15 articles</p>
      <button onClick={()=>setView("home")} className="btn-glow" style={{ background:"linear-gradient(135deg,#6C63FF,#8B84FF)",border:"none",color:"#fff",padding:"12px 32px",borderRadius:12,fontWeight:700,fontSize:15,transition:"box-shadow 0.2s" }}>
        Retour aux annonces →
      </button>
    </div>
  </div>
)}

    </>
  );
}

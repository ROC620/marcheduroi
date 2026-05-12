import React from "react";

function VideoCardPlayer({ video, photos = [], maxSeconds = 60, autoPlay = false }) {
  const [playing, setPlaying] = React.useState(false);
  const containerRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const instanceId = React.useRef(Math.random().toString(36).slice(2));
  const isYT = /youtube\.com|youtu\.be/.test(video||"");
  const isCL = /cloudinary\.com/.test(video||"");
  const isShort = /youtube\.com\/shorts\//.test(video||"");
  const ytMatch = (video||"").match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/);
  const ytId = ytMatch ? ytMatch[1] : null;

  // Autoplay intelligent — démarre UNIQUEMENT si :
  // 1. L'utilisateur a arrêté de scroller
  // 2. La carte est au beau milieu de l'écran (zone 30%-70%)
  // 3. L'utilisateur attend 2.5 secondes dessus sans bouger
  const dwellTimer = React.useRef(null);
  const scrollStopTimer = React.useRef(null);
  const isVisible = React.useRef(false);

  React.useEffect(() => {
    if (!containerRef.current || !autoPlay) return;

    // Observer pour savoir si la carte est visible
    const observer = new IntersectionObserver(([entry]) => {
      isVisible.current = entry.isIntersecting && entry.intersectionRatio >= 0.6;
      if (!isVisible.current) {
        // Sort du viewport — tout annuler
        clearTimeout(dwellTimer.current);
        dwellTimer.current = null;
        if (activeVideoId.current === instanceId.current) activeVideoId.current = null;
        setPlaying(false);
      }
    }, { threshold: [0.0, 0.3, 0.6, 1.0] });
    observer.observe(containerRef.current);

    // Détecter l'arrêt du scroll — seulement là on vérifie le centre
    const onScroll = () => {
      // Pendant le scroll : annuler tout timer en cours
      clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
      clearTimeout(scrollStopTimer.current);

      // 400ms après arrêt du scroll : vérifier si cette carte est au centre
      scrollStopTimer.current = setTimeout(() => {
        if (!isVisible.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const cardCenterY = rect.top + rect.height / 2;
        const viewH = window.innerHeight;
        // Zone stricte : centre de la carte entre 30% et 70% du viewport
        const inCenter = cardCenterY >= viewH * 0.30 && cardCenterY <= viewH * 0.70;
        if (!inCenter) return;

        // La carte est au centre et le scroll est arrêté — démarrer le dwell 2.5s
        dwellTimer.current = setTimeout(() => {
          dwellTimer.current = null;
          if (!isVisible.current) return;
          // Ne pas démarrer si le scroll était programmatique (lien partagé, navigation)
          if (autoPlayBlocked.current) return;
          // Vérifier une dernière fois qu'elle est toujours au centre
          const r2 = containerRef.current.getBoundingClientRect();
          const c2 = r2.top + r2.height / 2;
          if (c2 < viewH * 0.25 || c2 > viewH * 0.75) return;
          // Lancer la vidéo — stopper les autres
          window.dispatchEvent(new CustomEvent("mdr_stop_videos", { detail: instanceId.current }));
          activeVideoId.current = instanceId.current;
          setPlaying(true);
        }, 2500);
      }, 400);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Écouter les demandes d'arrêt des autres instances
    const handleStop = (e) => {
      if (e.detail !== instanceId.current) {
        clearTimeout(dwellTimer.current);
        dwellTimer.current = null;
        setPlaying(false);
      }
    };
    window.addEventListener("mdr_stop_videos", handleStop);

    return () => {
      observer.disconnect();
      clearTimeout(dwellTimer.current);
      clearTimeout(scrollStopTimer.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mdr_stop_videos", handleStop);
    };
  }, [autoPlay]);

  // Sans autoPlay : arrêter quand sort du viewport
  React.useEffect(() => {
    if (!containerRef.current || autoPlay) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setPlaying(false);
    }, { threshold: 0.3 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoPlay]);

  // Limite de durée pour Cloudinary
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= maxSeconds) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setPlaying(false);
    }
  };

  if (!video || (!isYT && !isCL)) return null;

  return (
    <div ref={containerRef} style={{ width:"100%", position:"relative" }}>
      {playing ? (
        <div style={{ position:"relative", width:"100%", aspectRatio:"16/9", background:"#000", overflow:"hidden" }}>
          {isYT && ytId ? (
            isShort ? (
              <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:16,background:"#000" }}>
                <p style={{ color:"#fff",fontSize:14,fontWeight:600 }}>📱 YouTube Short</p>
                <a href={video} target="_blank" rel="noopener noreferrer"
                  style={{ background:"#FF0000",color:"#fff",padding:"12px 24px",borderRadius:10,fontWeight:700,fontSize:14,textDecoration:"none",display:"flex",alignItems:"center",gap:8 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                  Voir sur YouTube
                </a>
                <p style={{ color:"rgba(255,255,255,0.5)",fontSize:11 }}>Les Shorts YouTube ne peuvent pas être lus ici</p>
              </div>
            ) : (
              <iframe
                title="Vidéo annonce MarchéduRoi"
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&modestbranding=1&rel=0`}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                style={{ width:"100%",height:"100%",border:"none",display:"block" }}
              />
            )
          ) : isCL ? (
            <video ref={videoRef} src={video} autoPlay controls playsInline onTimeUpdate={handleTimeUpdate} style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}/>
          ) : null}
          <button onClick={()=>setPlaying(false)} style={{ position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.6)",border:"none",color:"#fff",borderRadius:"50%",width:28,height:28,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10 }}>✕</button>
        </div>
      ) : (
        <div style={{ position:"relative" }}>
          {photos && photos.length > 0
            ? <PhotoCarousel photos={photos}/>
            : <div style={{ width:"100%",aspectRatio:"16/9",background:"linear-gradient(135deg,#1a1d30,#2a2d45)",display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ fontSize:32 }}>🎬</span></div>
          }
          <button onClick={()=>setPlaying(true)} style={{ position:"absolute",bottom:0,left:0,right:0,padding:"8px",background:"rgba(0,0,0,0.55)",border:"none",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,backdropFilter:"blur(4px)" }}>
            ▶ Voir la vidéo
          </button>
        </div>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────


export default VideoCardPlayer;

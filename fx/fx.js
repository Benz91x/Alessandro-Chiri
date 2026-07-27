/* ===== FX LAYER — aurora + constellation + spotlight + scramble + contatore visite ===== */
(function(){"use strict";
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine    = matchMedia("(pointer:fine)").matches;
  function accent(){ var v=getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(); return v||"#2dd4bf"; }

  /* ---------- tema (mirror di data-theme su body, per il CSS) ---------- */
  function syncTheme(){
    var r=document.getElementById("ac-root");
    var t=(r&&r.getAttribute("data-theme"))||"dark";
    document.body.setAttribute("fx-theme", t);
    document.documentElement.style.setProperty("--fx-ink",
      getComputedStyle(r||document.body).color || (t==="light"?"#10161a":"#e8f1ef"));
  }
  syncTheme();
  new MutationObserver(syncTheme).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:["data-theme"]});

  /* ---------- 1) AURORA: blob di luce che derivano dietro i contenuti ---------- */
  if(!reduced){
    var au=document.createElement("div"); au.id="fx-aurora"; au.setAttribute("aria-hidden","true");
    au.innerHTML='<div class="fx-blob fx-blob-1"></div><div class="fx-blob fx-blob-2"></div><div class="fx-blob fx-blob-3"></div>';
    document.body.appendChild(au);
  }

  /* ---------- 2) CONSTELLATION: particelle collegate, reattive al mouse ---------- */
  if(!reduced){
    var cv=document.createElement("canvas"); cv.id="fx-stars"; cv.setAttribute("aria-hidden","true");
    document.body.appendChild(cv);
    var ctx=cv.getContext("2d"), W=0,H=0, dpr=Math.min(devicePixelRatio||1,2), pts=[], mx=-9999, my=-9999;
    function size(){ W=innerWidth; H=innerHeight; cv.width=W*dpr; cv.height=H*dpr;
      cv.style.width=W+"px"; cv.style.height=H+"px"; ctx.setTransform(dpr,0,0,dpr,0,0);
      var n=Math.max(34,Math.min(95,Math.round(W*H/19000))); pts=[];
      for(var i=0;i<n;i++) pts.push({x:Math.random()*W,y:Math.random()*H,
        vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35, r:Math.random()*1.4+.7}); }
    size(); addEventListener("resize",size,{passive:true});
    addEventListener("pointermove",function(e){mx=e.clientX;my=e.clientY;},{passive:true});
    addEventListener("pointerleave",function(){mx=my=-9999;},{passive:true});
    var LINK=130, MR=170, run=true;
    document.addEventListener("visibilitychange",function(){run=!document.hidden; if(run)frame();});
    function frame(){
      if(!run) return;
      ctx.clearRect(0,0,W,H);
      var col=accent(), light=document.body.getAttribute("fx-theme")==="light";
      var aP=light?.35:.55, aL=light?.10:.16;
      for(var i=0;i<pts.length;i++){ var p=pts[i];
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<-20)p.x=W+20; if(p.x>W+20)p.x=-20; if(p.y<-20)p.y=H+20; if(p.y>H+20)p.y=-20;
        var dx=mx-p.x, dy=my-p.y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<MR&&d>0.1){ p.x+=dx/d*.6; p.y+=dy/d*.6; }
        ctx.globalAlpha=aP; ctx.fillStyle=col;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.2832); ctx.fill(); }
      ctx.globalAlpha=1; ctx.strokeStyle=col; ctx.lineWidth=1;
      for(var a=0;a<pts.length;a++)for(var b=a+1;b<pts.length;b++){
        var A=pts[a],B=pts[b],dxx=A.x-B.x,dyy=A.y-B.y,dd=dxx*dxx+dyy*dyy;
        if(dd<LINK*LINK){ ctx.globalAlpha=aL*(1-Math.sqrt(dd)/LINK);
          ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(B.x,B.y); ctx.stroke(); } }
      ctx.globalAlpha=1;
      requestAnimationFrame(frame); }
    frame();
  }

  /* ---------- 3) SPOTLIGHT: alone luminoso che segue il mouse sulle card ---------- */
  if(fine) document.addEventListener("pointermove",function(e){
    var c=e.target&&e.target.closest?e.target.closest("[data-tilt]"):null; if(!c)return;
    var r=c.getBoundingClientRect();
    c.style.setProperty("--fxmx",(e.clientX-r.left)+"px");
    c.style.setProperty("--fxmy",(e.clientY-r.top)+"px");
  },{passive:true});

  /* ---------- 4) SHIMMER sul nome nell'hero ---------- */
  function shine(){ var s=document.querySelector("h1 [data-split]")||document.querySelector("h1");
    if(s&&!s.classList.contains("fx-shine")) s.classList.add("fx-shine"); }
  shine(); setTimeout(shine,1200); setTimeout(shine,3000);

  /* ---------- 5) SCRAMBLE: i titoli di sezione si "decodificano" allo scroll ---------- */
  if(!reduced){
    var CH="ABCDEFGHILMNOPQRSTUVZ#@/\\<>*";
    function scramble(el){
      if(el.dataset.fxDone) return; el.dataset.fxDone="1";
      var orig=el.textContent, len=orig.length, t0=performance.now(), DUR=650+len*14;
      el.classList.add("fx-scrambled");
      (function tick(now){
        var p=Math.min(1,(now-t0)/DUR), out="";
        for(var i=0;i<len;i++){ var c=orig[i];
          out += (i/len < p || c===" " || c==="." || c==="→") ? c : CH[(Math.random()*CH.length)|0]; }
        el.textContent=out;
        if(p<1) requestAnimationFrame(tick); else el.textContent=orig;
      })(t0); }
    var io=new IntersectionObserver(function(es){ es.forEach(function(en){
      if(en.isIntersecting){ io.unobserve(en.target); scramble(en.target); } }); },{threshold:.35});
    function watch(){ document.querySelectorAll("h2[data-reveal]").forEach(function(h){
      if(!h.dataset.fxDone&&!h.dataset.fxWatch){ h.dataset.fxWatch="1"; io.observe(h); } }); }
    watch(); setInterval(watch,1500);
  }

  /* ---------- 6) CONTATORE VISITE live (zero configurazione) nel footer ---------- */
  (function(){
    var span=document.createElement("span"); span.id="fx-visits";
    span.innerHTML='<span class="fx-eye">&#9673;</span><span id="fx-visits-n">VISITE: &hellip;</span>';
    function mount(){ var f=document.querySelector("footer > div");
      if(f&&!document.getElementById("fx-visits")) f.appendChild(span); }
    mount(); setInterval(mount,1500);
    fetch("https://api.counterapi.dev/v1/benz91x-alessandro-chiri/visite/up")
      .then(function(r){return r.json();})
      .then(function(j){ var n=document.getElementById("fx-visits-n");
        if(n&&typeof j.count==="number") n.textContent="VISITE: "+j.count.toLocaleString("it-IT"); })
      .catch(function(){ span.style.display="none"; });
  })();
})();

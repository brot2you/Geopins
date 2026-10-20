
(function(){
'use strict';
var GEO=JSON.parse(document.getElementById('geo-data').textContent);
var DB=JSON.parse(document.getElementById('reperes-data').textContent);
var FLAGS=JSON.parse(document.getElementById('flags-data').textContent);
var FLAGN=0;
function flagSvg(c){var s=FLAGS[c];if(!s)return '';FLAGN++;var p='f'+FLAGN+'_';return s.replace(/\bid="([^"]+)"/g,'id="'+p+'$1"').replace(/url\(#([^)]+)\)/g,'url(#'+p+'$1)').replace(/href="#([^"]+)"/g,'href="#'+p+'$1"').replace('<svg ','<svg preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true" ');}
function flagImg(c,cls,alt){var s=flagSvg(c);return s?'<span class="flag '+(cls||'')+'" role="img" aria-label="'+(alt||'Drapeau')+'">'+s+'</span>':'';}
function hasQuiz(pid){var L=BYPACK[pid];for(var a=0;a<L.length;a++)if(L[a].fl)return true;return false;}
function hasFlagMode(pid){var L=BYPACK[pid];for(var a=0;a<L.length;a++)if(L[a].t==='country'&&L[a].fl)return true;return false;}
var PACKS=DB.packs,ITEMS=DB.items,NAMES=DB.names,BYID={},BYPACK={},PACK={};
var i,j;
for(i=0;i<PACKS.length;i++){PACK[PACKS[i].id]=PACKS[i];BYPACK[PACKS[i].id]=[];}
for(i=0;i<ITEMS.length;i++){BYID[ITEMS[i].id]=ITEMS[i];BYPACK[ITEMS[i].p].push(ITEMS[i]);}
var D2R=Math.PI/180;var TQ=[],TBUSY=false;
var KIND_EMO={'Continent':'🌍','Océan':'🌊','Mer':'🌊','Ligne imaginaire':'📏','Fleuve':'🏞️','Chaîne de montagnes':'⛰️','Massif':'⛰️','Sommet':'🏔️','Désert':'🏜️','Forêt':'🌳','Pays':'🏳️','Foyer de peuplement':'👥','Espace peu peuplé':'❄️','Métropole':'🏙️','Port':'⚓','Passage maritime':'🧭','Façade maritime':'🚢','Région':'🗺️','Ville':'🏘️','Département d\'outre-mer':'🏝️','Territoire d\'outre-mer':'🏝️','Capitale':'⭐','Lagune':'🦩'};
function $(id){return document.getElementById(id);}
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
var SVGNS='http://www.w3.org/2000/svg';
function sv(tag,attrs){var e=document.createElementNS(SVGNS,tag);for(var k in attrs){if(attrs.hasOwnProperty(k))e.setAttribute(k,attrs[k]);}return e;}

/* ---------- state ---------- */
var KEY='brot2you-reperes-v1';
function defState(){return {v:1,name:'',xp:0,items:{},streak:{cur:0,best:0,last:''},daily:{day:'',score:0},badges:{},stats:{games:0,pins:0,perfects:0,bestCombo:0,eclairBest:0,maps:{},flagPerfects:0,daily:0,stars3:0,explore:0,reviews:0,quizOk:0},settings:{sound:true,vib:true,dys:false}};}
var S=defState();
try{var raw=localStorage.getItem(KEY);if(raw){var o=JSON.parse(raw);if(o&&o.v===1){for(var k0 in S){if(o[k0]!==undefined)S[k0]=o[k0];}var dk=defState().stats;for(var k1 in dk){if(S.stats[k1]===undefined)S.stats[k1]=dk[k1];}}}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function yesterday(){var d=new Date();d.setDate(d.getDate()-1);return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function itemSt(id){return S.items[id]||null;}
function boxOf(id){var s=S.items[id];return s?s.b:0;}
function packMastery(pid){var L=BYPACK[pid],t=0;for(var a=0;a<L.length;a++)t+=Math.min(boxOf(L[a].id),4)/4;return L.length?t/L.length:0;}
function weakList(){var out=[];for(var a=0;a<ITEMS.length;a++){var s=S.items[ITEMS[a].id];if(s&&(s.b<=1||s.l<50))out.push(ITEMS[a]);}out.sort(function(x,y){return (S.items[x.id].t||0)-(S.items[y.id].t||0);});return out;}
function xpFor(L){return 50*(L-1)*L;}
function levelOf(xp){var L=1;while(xpFor(L+1)<=xp)L++;return L;}
var TITLES=[[1,'Touriste'],[3,'Guide'],[5,'Pilote'],[7,'Cartographe'],[10,'Géographe'],[14,'Légende du globe']];
function titleOf(L){var t=TITLES[0][1];for(var a=0;a<TITLES.length;a++)if(L>=TITLES[a][0])t=TITLES[a][1];return t;}

/* ---------- projections ---------- */
function natEarthRaw(){return {f:function(l,p){var p2=p*p,p4=p2*p2;return [l*(0.8707-0.131979*p2+p4*(-0.013791+p4*(0.003971*p2-0.001529*p4))),p*(1.007226+p2*(0.015085+p4*(-0.044475+0.028874*p2-0.005916*p4)))];},
 i:function(x,y){var p=y,n=25,d,p2,p4;do{p2=p*p;p4=p2*p2;d=(p*(1.007226+p2*(0.015085+p4*(-0.044475+0.028874*p2-0.005916*p4)))-y)/(1.007226+p2*(0.015085*3+p4*(-0.044475*7+0.028874*9*p2-0.005916*11*p4)));p-=d;}while(Math.abs(d)>1e-7&&--n>0);p2=p*p;return [x/(0.8707+p2*(-0.131979+p2*(-0.013791+p2*p2*p2*(0.003971-0.001529*p2)))),p];}};}
function lccRaw(a1,a2,lon0){var y0=a1*D2R,y1=a2*D2R,L0=lon0*D2R;function t(y){return Math.tan((Math.PI/2+y)/2);}
 var cy0=Math.cos(y0),n=Math.log(cy0/Math.cos(y1))/Math.log(t(y1)/t(y0)),F=cy0*Math.pow(t(y0),n)/n;
 return {f:function(l,p){var r=F/Math.pow(t(p),n),a=n*(l-L0);return [r*Math.sin(a),F-r*Math.cos(a)];},
 i:function(x,y){var fy=F-y,r=(n>0?1:-1)*Math.sqrt(x*x+fy*fy),l=Math.atan2(x,Math.abs(fy))*(fy<0?-1:1);if(fy*n<0)l-=Math.PI*(x<0?-1:1)*(fy<0?-1:1);return [l/n+L0,2*Math.atan(Math.pow(F/r,1/n))-Math.PI/2];}};}
function makeProj(raw,samples,W,pad){var mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;for(var a=0;a<samples.length;a++){var q=raw.f(samples[a][0]*D2R,samples[a][1]*D2R);if(q[0]<mnx)mnx=q[0];if(q[0]>mxx)mxx=q[0];if(q[1]<mny)mny=q[1];if(q[1]>mxy)mxy=q[1];}
 var s=(W-2*pad)/(mxx-mnx),H=Math.round((mxy-mny)*s+2*pad);
 return {W:W,H:H,fwd:function(lon,lat){var q=raw.f(lon*D2R,lat*D2R);return [pad+(q[0]-mnx)*s,pad+(mxy-q[1])*s];},
 inv:function(x,y){var q=raw.i((x-pad)/s+mnx,mxy-(y-pad)/s);return [q[0]/D2R,q[1]/D2R];}};}
function boxSamples(x0,y0,x1,y1){var o=[],a;for(a=0;a<=20;a++){o.push([x0+(x1-x0)*a/20,y0]);o.push([x0+(x1-x0)*a/20,y1]);o.push([x0,y0+(y1-y0)*a/20]);o.push([x1,y0+(y1-y0)*a/20]);}return o;}
var MAPS={
 world:{proj:makeProj(natEarthRaw(),boxSamples(-180,-90,180,90),1000,6),land:'world',grat:20,gratOff:10,maxZ:16,tol:{area:60,pt:250,line:220,sea:150},scale:1400},
 europe:{proj:makeProj(lccRaw(38,62,12),boxSamples(-11,34,35,71),1000,10),land:'europe',grat:10,gratOff:5,maxZ:12,tol:{area:15,pt:30,line:40,sea:30},scale:350,clip:[-35,24,60,75]},
 france:{proj:makeProj(lccRaw(44,49,3),boxSamples(-5.3,41.3,9.7,51.15),1000,14),land:'france',grat:0,maxZ:45,tol:{area:8,pt:15,line:20,sea:12},scale:120,clip:[-9,39,14,54]}
};

/* ---------- geometry helpers ---------- */
function ringPath(P,flat){var s='',a,q;for(a=0;a<flat.length;a+=2){q=P.fwd(flat[a],flat[a+1]);s+=(a?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1);}return s;}
function featPath(P,rings,closed){var s='';for(var a=0;a<rings.length;a++){s+=ringPath(P,rings[a])+(closed?'Z':'');}return s;}
function densify(pts,step){var o=[],a,b,n;for(a=0;a<pts.length-1;a++){var x0=pts[a][0],y0=pts[a][1],x1=pts[a+1][0],y1=pts[a+1][1];n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))/step));for(b=0;b<n;b++)o.push(x0+(x1-x0)*b/n,y0+(y1-y0)*b/n);}var L=pts[pts.length-1];o.push(L[0],L[1]);return o;}
function flatDensify(flat,step){var p=[];for(var a=0;a<flat.length;a+=2)p.push([flat[a],flat[a+1]]);return densify(p,step);}
function hav(lo1,la1,lo2,la2){var dl=(la2-la1)*D2R,dn=(lo2-lo1)*D2R,a=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(la1*D2R)*Math.cos(la2*D2R)*Math.sin(dn/2)*Math.sin(dn/2);return 12742*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
function inRings(rings,x,y){var c=false;for(var r=0;r<rings.length;r++){var f=rings[r],n=f.length;for(var a=0,b=n-2;a<n;b=a,a+=2){var yi=f[a+1],yj=f[b+1];if((yi>y)!==(yj>y)&&x<(f[b]-f[a])*(y-yi)/(yj-yi)+f[a])c=!c;}}return c;}
function featuresFor(it){var m=MAPS[it.mp],set=GEO[m.land],o=[],a;
 if(it.t==='country'){for(a=0;a<set.length;a++)if(set[a].id===it.g)o.push(set[a]);}
 else if(it.t==='cont'){for(a=0;a<set.length;a++)if(set[a].c===it.g)o.push(set[a]);}
 else if(it.t==='sea'){o.push({r:GEO.seas[it.g]});}
 else if(it.t==='region'){for(a=0;a<GEO.regions.length;a++)if(GEO.regions[a].id===it.g)o.push(GEO.regions[a]);}
 return o;}
var LINECACHE={};
function linesFor(it){if(LINECACHE[it.id])return LINECACHE[it.id];var o=[],a;
 if(it.t==='river'){var R=GEO.rivers[it.g];for(a=0;a<R.length;a++)o.push(flatDensify(R[a],0.15));}
 else if(it.t==='line'){o.push(densify(it.g,0.25));}
 LINECACHE[it.id]=o;return o;}
function distTo(it,lon,lat){var best=1e9,bp=null,a,b,d;
 if(it.t==='pt'){for(a=0;a<it.g.length;a++){d=hav(lon,lat,it.g[a][0],it.g[a][1]);if(d<best){best=d;bp=it.g[a];}}}
 else if(it.t==='river'||it.t==='line'){var L=linesFor(it);for(a=0;a<L.length;a++)for(b=0;b<L[a].length;b+=2){d=hav(lon,lat,L[a][b],L[a][b+1]);if(d<best){best=d;bp=[L[a][b],L[a][b+1]];}}}
 else {var F=featuresFor(it);for(a=0;a<F.length;a++)if(inRings(F[a].r,lon,lat))return {d:0,p:[lon,lat]};
  for(a=0;a<F.length;a++)for(b=0;b<F[a].r.length;b++){var f=flatDensify(F[a].r[b],it.t==='sea'&&it.mp==='world'?0.3:0.1);for(var c=0;c<f.length;c+=2){d=hav(lon,lat,f[c],f[c+1]);if(d<best){best=d;bp=[f[c],f[c+1]];}}}}
 return {d:best,p:bp};}
function tolOf(it){if(it.tol)return it.tol;var m=MAPS[it.mp];if(it.t==='pt')return m.tol.pt;if(it.t==='line'||it.t==='river')return m.tol.line;if(it.t==='sea')return m.tol.sea;return m.tol.area;}
function scaleOf(it){var p=PACK[it.p];return p.scale||MAPS[it.mp].scale;}
function scoreFor(it,d){var t=tolOf(it);if(d<=t)return 100;return Math.max(0,Math.round(100*Math.exp(-(d-t)/scaleOf(it))));}
for(i=0;i<ITEMS.length;i++)ITEMS[i].mp=PACK[ITEMS[i].p].m;

/* ---------- sound / fx ---------- */
var AC=null;
function tone(fr,dur,type,when,vol){if(!S.settings.sound)return;try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(!C)return;AC=new C();}if(AC.state==='suspended')AC.resume();var t=AC.currentTime+(when||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(fr,t);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.18,t+0.015);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+dur+0.05);}catch(e){}}
function sfx(k){if(k==='tap'){tone(880,0.08,'triangle');}else if(k==='perfect'){tone(660,.12,'triangle',0);tone(880,.12,'triangle',.08);tone(1320,.22,'triangle',.16);}else if(k==='good'){tone(600,.1,'triangle');tone(800,.16,'triangle',.08);}else if(k==='meh'){tone(420,.16,'sine');}else if(k==='miss'){tone(260,.22,'sawtooth',0,.08);tone(200,.28,'sawtooth',.12,.08);}else if(k==='level'){tone(523,.12,'square',0,.08);tone(659,.12,'square',.1,.08);tone(784,.12,'square',.2,.08);tone(1046,.3,'square',.3,.08);}}
function vib(p){if(S.settings.vib&&navigator.vibrate){try{navigator.vibrate(p);}catch(e){}}}
var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function confetti(n){if(RM)return;var c=$('fx'),x=c.getContext('2d'),W=c.width=window.innerWidth,H=c.height=window.innerHeight,P=[],cols=['#FF3D7F','#FFCF33','#22D69B','#2F4DFF','#ffffff'];
 for(var a=0;a<(n||90);a++)P.push({x:W/2+(Math.random()-.5)*W*.4,y:H*.45,vx:(Math.random()-.5)*14,vy:-Math.random()*16-6,s:Math.random()*8+5,r:Math.random()*6,vr:(Math.random()-.5)*.3,c:cols[a%5]});
 var t0=Date.now();(function fr(){x.clearRect(0,0,W,H);var alive=false;for(var b=0;b<P.length;b++){var p=P[b];p.vy+=.55;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;if(p.y<H+20)alive=true;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66);x.restore();}if(alive&&Date.now()-t0<3500)requestAnimationFrame(fr);else x.clearRect(0,0,W,H);})();}
function toast(emo,txt){TQ.push([emo,txt]);if(!TBUSY)nextToast();}
function nextToast(){var q=TQ.shift();if(!q){TBUSY=false;return;}TBUSY=true;var t=el('div','toast','<span class="e">'+q[0]+'</span><span>'+q[1]+'</span>');document.body.appendChild(t);setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);nextToast();},2300);}
function modal(title,text,okLabel,cancelLabel,onOk){var v=el('div','veil');v.style.alignItems='center';var m=el('div','modal','<h3>'+title+'</h3><p>'+text+'</p><div class="row"><button class="btn alt" data-a="c">'+cancelLabel+'</button><button class="btn" data-a="o">'+okLabel+'</button></div>');v.appendChild(m);document.body.appendChild(v);
 v.onclick=function(e){var a=e.target.getAttribute&&e.target.getAttribute('data-a');if(e.target===v||a==='c'){document.body.removeChild(v);}else if(a==='o'){document.body.removeChild(v);onOk();}};}
var PIN_SVG='<svg viewBox="0 0 40 52" aria-hidden="true"><path d="M20 50C20 50 4 30 4 18a16 16 0 0 1 32 0C36 30 20 50 20 50z" fill="#FF3D7F" stroke="#101C5E" stroke-width="3" stroke-linejoin="round"/><circle cx="20" cy="18" r="6" fill="#fff" stroke="#101C5E" stroke-width="2.5"/></svg>';

/* ---------- badges ---------- */
var BG={prog:'Débuts et progression',reg:'Régularité',prec:'Précision',speed:'Vitesse et combos',defi:'Défis et révisions',cur:'Drapeaux et curiosité',pack:'Packs maîtrisés'};
var BADGES=[
 {id:'first',g:'prog',e:'📍',n:'Premier pin',d:'Place ton premier repère.',k:'pins',t:1},
 {id:'pins100',g:'prog',e:'💯',n:'Cap des 100',d:'Place 100 repères.',k:'pins',t:100},
 {id:'pins500',g:'prog',e:'🌲',n:'Pinède',d:'Place 500 repères.',k:'pins',t:500},
 {id:'pins1000',g:'prog',e:'🌳',n:'Forêt de pins',d:'Place 1 000 repères.',k:'pins',t:1000},
 {id:'games10',g:'prog',e:'🎮',n:'Bon rythme',d:'Termine 10 parties.',k:'games',t:10},
 {id:'games50',g:'prog',e:'🕹️',n:'Accro à la carte',d:'Termine 50 parties.',k:'games',t:50},
 {id:'l3',g:'prog',e:'🧭',n:'Guide',d:'Atteins le niveau 3.',k:'level',t:3},
 {id:'l5',g:'prog',e:'✈️',n:'Pilote',d:'Atteins le niveau 5.',k:'level',t:5},
 {id:'l7',g:'prog',e:'🗺️',n:'Cartographe',d:'Atteins le niveau 7.',k:'level',t:7},
 {id:'l10',g:'prog',e:'🏆',n:'Géographe',d:'Atteins le niveau 10.',k:'level',t:10},
 {id:'l14',g:'prog',e:'🌐',n:'Légende du globe',d:'Atteins le niveau 14.',k:'level',t:14},
 {id:'s3',g:'reg',e:'📆',n:'3 jours d\'affilée',d:'Joue 3 jours de suite.',k:'streak',t:3},
 {id:'s7',g:'reg',e:'🗓️',n:'Une semaine pile',d:'Joue 7 jours de suite.',k:'streak',t:7},
 {id:'s14',g:'reg',e:'🔥',n:'Deux semaines',d:'Joue 14 jours de suite.',k:'streak',t:14},
 {id:'s30',g:'reg',e:'🌋',n:'Un mois de géo',d:'Joue 30 jours de suite.',k:'streak',t:30},
 {id:'early',g:'reg',e:'🌅',n:'Lève-tôt',d:'Termine une partie avant 8 h.'},
 {id:'weekend',g:'reg',e:'🛋️',n:'Week-end géo',d:'Termine une partie le week-end.'},
 {id:'p10',g:'prec',e:'🎯',n:'Œil de lynx',d:'10 réponses parfaites.',k:'perfects',t:10},
 {id:'p50',g:'prec',e:'🏹',n:'Tir de précision',d:'50 réponses parfaites.',k:'perfects',t:50},
 {id:'p200',g:'prec',e:'🛰️',n:'GPS humain',d:'200 réponses parfaites.',k:'perfects',t:200},
 {id:'p500',g:'prec',e:'🧲',n:'Boussole vivante',d:'500 réponses parfaites.',k:'perfects',t:500},
 {id:'km1',g:'prec',e:'📏',n:'Au kilomètre près',d:'Place une ville à moins de 2 km.'},
 {id:'clean',g:'prec',e:'💎',n:'Sans faute',d:'Une partie sans aucune réponse sous 80.'},
 {id:'star3',g:'prec',e:'⭐',n:'Trois étoiles',d:'Finis une partie avec 3 étoiles.',k:'stars3',t:1},
 {id:'star10',g:'prec',e:'🌟',n:'Pluie d\'étoiles',d:'Obtiens 3 étoiles 10 fois.',k:'stars3',t:10},
 {id:'revenge',g:'prec',e:'🔁',n:'Revanche',d:'Réussis un repère que tu avais raté.'},
 {id:'c5',g:'speed',e:'🔥',n:'En feu',d:'Combo de 5.',k:'combo',t:5},
 {id:'c10',g:'speed',e:'☄️',n:'Inarrêtable',d:'Combo de 10.',k:'combo',t:10},
 {id:'c15',g:'speed',e:'🌪️',n:'Tornade',d:'Combo de 15.',k:'combo',t:15},
 {id:'c20',g:'speed',e:'🌀',n:'Cyclone',d:'Combo de 20.',k:'combo',t:20},
 {id:'ec15',g:'speed',e:'⚡',n:'Éclair',d:'15 repères en mode éclair.',k:'eclair',t:15},
 {id:'ec20',g:'speed',e:'🌩️',n:'Foudre',d:'20 repères en mode éclair.',k:'eclair',t:20},
 {id:'ec25',g:'speed',e:'🚀',n:'Supersonique',d:'25 repères en mode éclair.',k:'eclair',t:25},
 {id:'daily',g:'defi',e:'☀️',n:'Défi relevé',d:'Termine un défi du jour.',k:'daily',t:1},
 {id:'daily5',g:'defi',e:'🌞',n:'Fidèle au défi',d:'Termine 5 défis du jour.',k:'daily',t:5},
 {id:'daily20',g:'defi',e:'🏅',n:'Défi de fer',d:'Termine 20 défis du jour.',k:'daily',t:20},
 {id:'dailyTop',g:'defi',e:'🥇',n:'Défi en or',d:'Fais 900 points au défi du jour.'},
 {id:'review1',g:'defi',e:'🧠',n:'Rattrapage',d:'Termine une session « À revoir ».',k:'reviews',t:1},
 {id:'review10',g:'defi',e:'📚',n:'Révisions sérieuses',d:'Termine 10 sessions « À revoir ».',k:'reviews',t:10},
 {id:'flags',g:'cur',e:'🏁',n:'Porte-drapeau',d:'10 drapeaux placés parfaitement.',k:'flagPerfects',t:10},
 {id:'flags30',g:'cur',e:'🎌',n:'Diplomate',d:'30 drapeaux placés parfaitement.',k:'flagPerfects',t:30},
 {id:'quiz50',g:'cur',e:'🎏',n:'Vexillologue',d:'50 bonnes réponses au quiz drapeaux.',k:'quizOk',t:50},
 {id:'quiz200',g:'cur',e:'🏳️',n:'As des drapeaux',d:'200 bonnes réponses au quiz drapeaux.',k:'quizOk',t:200},
 {id:'quiz10',g:'cur',e:'🎖️',n:'Sans fausse note',d:'10 sur 10 au quiz drapeaux.'},
 {id:'explore20',g:'cur',e:'🔍',n:'Esprit curieux',d:'Consulte 20 repères en mode découverte.',k:'explore',t:20},
 {id:'globe',g:'cur',e:'🌍',n:'Globe-trotter',d:'Joue sur les 3 cartes.'},
 {id:'master',g:'pack',e:'👑',n:'Premier pack',d:'Maîtrise un pack à 100 %.'},
 {id:'pk_conts',g:'pack',e:'🌍',n:'Tour du monde',pk:'conts'},
 {id:'pk_relief',g:'pack',e:'🏔️',n:'Sommets et fleuves',pk:'relief'},
 {id:'pk_peuple',g:'pack',e:'👥',n:'Démographe',pk:'peuple'},
 {id:'pk_metro',g:'pack',e:'🏙️',n:'Mégapole',pk:'metro'},
 {id:'pk_mondia',g:'pack',e:'🚢',n:'Capitaine',pk:'mondia'},
 {id:'pk_regions',g:'pack',e:'🗺️',n:'Hexagone',pk:'regions'},
 {id:'pk_reliefFr',g:'pack',e:'⛰️',n:'Relief de France',pk:'reliefFr'},
 {id:'pk_villes',g:'pack',e:'🏘️',n:'GPS de France',pk:'villes'},
 {id:'pk_om',g:'pack',e:'🏝️',n:'Outre-mer',pk:'om'},
 {id:'pk_ue',g:'pack',e:'💫',n:'Douze étoiles',pk:'ue'},
 {id:'pk_capitales',g:'pack',e:'⭐',n:'Capitales d\'Europe',pk:'capitales'},
 {id:'pk_drapeaux',g:'pack',e:'🏁',n:'Tour des drapeaux',pk:'drapeaux'},
 {id:'pk_chez',g:'pack',e:'☀️',n:'Cœur catalan',pk:'chez'},
 {id:'allpacks',g:'pack',e:'📖',n:'Encyclopédie vivante',d:'Maîtrise tous les packs à 100 %.'}];
for(i=0;i<BADGES.length;i++)if(BADGES[i].pk&&!BADGES[i].d)BADGES[i].d='Maîtrise le pack « '+PACK[BADGES[i].pk].n+' » à 100 %.';
function statVal(k){var st=S.stats;if(k==='level')return levelOf(S.xp);if(k==='streak')return S.streak.best;if(k==='combo')return st.bestCombo;if(k==='eclair')return st.eclairBest;return st[k]||0;}
function unlock(id){if(S.badges[id])return false;S.badges[id]=Date.now();var b=null;for(var a=0;a<BADGES.length;a++)if(BADGES[a].id===id)b=BADGES[a];if(b){toast(b.e,'Badge débloqué : '+b.n);if(G)G.newBadges.push(b);}save();return true;}
function checkBadges(){var a,b,all=true,any=false;for(a=0;a<BADGES.length;a++){b=BADGES[a];if(b.k&&statVal(b.k)>=b.t)unlock(b.id);if(b.pk){if(packMastery(b.pk)>=1){unlock(b.id);any=true;}else all=false;}}if(any)unlock('master');if(all)unlock('allpacks');var m=S.stats.maps;if(m.world&&m.europe&&m.france)unlock('globe');}

/* ---------- home ---------- */
var FILTER='Tout',TAB='play';
function ringSvg(v,col){var r=12,c=2*Math.PI*r;return '<svg class="ring" viewBox="0 0 30 30"><circle cx="15" cy="15" r="'+r+'" fill="none" stroke="#E4E7F7" stroke-width="5"/><circle cx="15" cy="15" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="5" stroke-linecap="round" stroke-dasharray="'+(c*v).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 15 15)"/></svg>';}
function renderHome(){var h=$('home');var L=levelOf(S.xp),a=xpFor(L),b=xpFor(L+1),pct=Math.round(100*(S.xp-a)/(b-a));
 var dDone=S.daily.day===today();var weak=weakList();
 var html='<div class="col"><div class="top"><div class="logo">'+PIN_SVG+'GéoPins</div><div class="chips"><span class="chip" title="Jours de suite">🔥 '+(S.streak.last===today()||S.streak.last===yesterday()?S.streak.cur:0)+'</span><span class="chip" title="Expérience">✨ '+S.xp+'</span></div></div>';
 html+='<p class="hello">'+(S.name?'Salut '+esc(S.name)+' ! ':'Salut ! ')+'Prêt·e à planter quelques pins ?</p>';
 html+='<div class="lvl"><div class="lvl-n">'+L+'</div><div class="lvl-info"><div class="lvl-t">'+titleOf(L)+'</div><div class="lvl-s">'+(b-S.xp)+' XP avant le niveau '+(L+1)+'</div><div class="bar"><i style="width:'+pct+'%"></i></div></div></div>';
 html+='<div class="daily'+(dDone?' done':'')+'"><div class="bigpin">'+PIN_SVG+'</div><h2>'+(dDone?'Défi du jour réussi':'Défi du jour')+'</h2><p>'+(dDone?'Ton score : <b>'+S.daily.score+' pts</b>. Reviens demain pour un nouveau défi.':'10 repères du monde entier, les mêmes pour toute la classe. Tes XP comptent double.')+'</p><button class="btn '+(dDone?'alt':'')+'" id="bDaily">'+(dDone?'Rejouer pour le fun':'Relever le défi')+'</button></div>';
 html+='<button class="review" id="bReview"><span class="ic">🧠</span><span><b>À revoir</b><span>'+(weak.length?weak.length+' repère'+(weak.length>1?'s':'')+' à retravailler':'Rien pour l\'instant, joue une mission !')+'</span></span><span class="go">›</span></button>';
 html+='<div class="sec">Les packs</div><div class="tabs">';var F=['Tout','6e','5e','4e','3e','Bonus'];for(var x=0;x<F.length;x++)html+='<button class="tab'+(FILTER===F[x]?' on':'')+'" data-f="'+F[x]+'">'+F[x]+'</button>';html+='</div><div class="grid">';
 for(x=0;x<PACKS.length;x++){var p=PACKS[x];if(FILTER!=='Tout'&&p.lv!==FILTER)continue;var m=packMastery(p.id);html+='<button class="pack" data-p="'+p.id+'"><div class="band" style="background:'+p.c+'"><span class="em">'+(p.fl?flagImg(p.fl,'pk'):p.e)+'</span><span class="lv">'+p.lv+'</span></div><div class="nm">'+esc(p.n)+'</div><div class="ft">'+ringSvg(m,p.c)+'<span>'+BYPACK[p.id].length+' repères<br>'+Math.round(m*100)+' % maîtrisé</span></div></button>';}
 html+='</div></div>';h.innerHTML=html;
 $('bDaily').onclick=function(){startGame('daily');};
 $('bReview').onclick=function(){if(!weak.length){toast('🧠','Ta liste est vide. Lance une mission pour la remplir.');return;}startGame('review');};
 var tabs=h.querySelectorAll('.tab');for(x=0;x<tabs.length;x++)tabs[x].onclick=function(){FILTER=this.getAttribute('data-f');renderHome();};
 var pk=h.querySelectorAll('.pack');for(x=0;x<pk.length;x++)pk[x].onclick=function(){openPack(this.getAttribute('data-p'));};}
function openPack(pid){var p=PACK[pid],L=BYPACK[pid],m=Math.round(packMastery(pid)*100);var v=el('div','veil');var s=el('div','sheet');
 var html='<div class="grab"></div><div class="sh-head"><div class="sh-em" style="background:'+p.c+'">'+(p.fl?flagImg(p.fl,'pk'):p.e)+'</div><div><h3>'+esc(p.n)+'</h3><p>'+L.length+' repères, '+m+' % maîtrisé, carte '+({world:'du monde',europe:'de l\'Europe',france:'de France'})[p.m]+'</p></div></div>';
 html+='<div class="modes"><button class="mode" data-m="mission"><i>🎯</i><b>Mission</b><span>'+Math.min(10,L.length)+' repères, prends ton temps</span></button><button class="mode ec" data-m="eclair"><i>⚡</i><b>Éclair</b><span>60 secondes, un seul toucher</span></button>'+(hasFlagMode(pid)?'<button class="mode fl" data-m="flags"><i>📍</i><b>Drapeau → carte</b><span>Seul le drapeau s\'affiche : place le pays</span></button>':'')+(hasQuiz(pid)?'<button class="mode qz'+(hasFlagMode(pid)?'':' full')+'" data-m="quiz"><i>🏁</i><b>Quiz drapeaux</b><span>'+(hasFlagMode(pid)?'4 choix : le bon drapeau ou le bon pays':'4 choix : dans quel pays se trouve chaque ville ?')+'</span></button>':'')+'</div>';
 html+='<div class="list"><h4>Les repères du pack</h4><p class="hint">Touche un repère pour le voir sur la carte et l\'apprendre.</p>';
 for(var a=0;a<L.length;a++){var b=boxOf(L[a].id),d='';for(var c=0;c<4;c++)d+='<i'+(c<b?' class="on"':'')+'></i>';html+='<button class="li" data-i="'+L[a].id+'"><span class="k">'+(L[a].fl?flagImg(L[a].fl,'mini'):(KIND_EMO[L[a].k]||'📍'))+'</span><span class="t">'+esc(L[a].n)+'</span><span class="dots" aria-label="maîtrise '+b+' sur 4">'+d+'</span></button>';}
 html+='</div>';s.innerHTML=html;v.appendChild(s);document.body.appendChild(v);
 v.onclick=function(e){if(e.target===v)document.body.removeChild(v);};
 var ms=s.querySelectorAll('.mode');for(a=0;a<ms.length;a++)ms[a].onclick=function(){document.body.removeChild(v);startGame(this.getAttribute('data-m'),pid);};
 var li=s.querySelectorAll('.li');for(a=0;a<li.length;a++)li[a].onclick=function(){document.body.removeChild(v);startGame('explore',null,this.getAttribute('data-i'));};}

/* ---------- profile ---------- */
function renderProfile(){var h=$('profile'),L=levelOf(S.xp),st=S.stats;
 var html='<div class="col"><div class="top"><div class="logo">'+PIN_SVG+'Mon profil</div></div>';
 html+='<div class="pcard"><h3>Mon pseudo</h3><input class="namein" id="nameIn" maxlength="20" placeholder="Ton prénom ou un pseudo" value="'+esc(S.name)+'"><p class="small">Ta progression reste sur cet appareil, dans ce navigateur.</p></div>';
 html+='<div class="lvl"><div class="lvl-n">'+L+'</div><div class="lvl-info"><div class="lvl-t">'+titleOf(L)+'</div><div class="lvl-s">'+S.xp+' XP au total</div><div class="bar"><i style="width:'+Math.round(100*(S.xp-xpFor(L))/(xpFor(L+1)-xpFor(L)))+'%"></i></div></div></div>';
 var K=[[st.games,'parties'],[st.pins,'repères placés'],[st.perfects,'parfaits'],[st.bestCombo,'meilleur combo'],[st.eclairBest,'record éclair'],[S.streak.best,'jours de suite max']];
 html+='<div class="pcard"><h3>Mes stats</h3><div class="stats">';for(var a=0;a<K.length;a++)html+='<div class="kpi"><b>'+K[a][0]+'</b><span>'+K[a][1]+'</span></div>';html+='</div></div>';
 var n=0;for(a=0;a<BADGES.length;a++)if(S.badges[BADGES[a].id])n++;
 html+='<div class="pcard"><h3>Mes badges ('+n+'/'+BADGES.length+')</h3><div class="bar" style="margin:0 0 6px"><i style="width:'+Math.round(100*n/BADGES.length)+'%"></i></div>';for(var gk in BG){html+='<h4 class="bgh">'+BG[gk]+'</h4><div class="badges">';for(a=0;a<BADGES.length;a++){var B=BADGES[a];if(B.g!==gk)continue;var got=!!S.badges[B.id],pr='';if(!got){var cur=null,tot=null;if(B.k){cur=Math.min(statVal(B.k),B.t);tot=B.t;}else if(B.pk){cur=Math.round(packMastery(B.pk)*100);tot=100;}if(tot&&tot>1)pr='<div class="bp"><i style="width:'+Math.round(100*cur/tot)+'%"></i></div><em>'+cur+(B.pk?' %':' / '+tot)+'</em>';}html+='<div class="bdg'+(got?'':' off')+'"><div class="e">'+B.e+'</div><b>'+B.n+'</b><span>'+B.d+'</span>'+pr+'</div>';}html+='</div>';}html+='</div>';
 html+='<div class="pcard"><h3>Réglages</h3>'+tg('sound','🔊 Sons')+tg('vib','📳 Vibrations')+tg('dys','🔤 Police plus lisible (Lexend)')+'<button class="danger" id="bReset">Effacer ma progression</button></div></div>';
 h.innerHTML=html;
 $('nameIn').oninput=function(){S.name=this.value.replace(/^\s+/,'');save();};
 var t=h.querySelectorAll('.sw');for(a=0;a<t.length;a++)t[a].onclick=function(){var k=this.getAttribute('data-k');S.settings[k]=!S.settings[k];save();applySettings();renderProfile();};
 $('bReset').onclick=function(){modal('Tout effacer ?','Ton niveau, tes badges et ta liste à revoir seront supprimés de cet appareil.','Effacer','Annuler',function(){var keep=S.settings;S=defState();S.settings=keep;save();renderProfile();toast('🧽','Progression effacée.');});};}
function tg(k,label){return '<div class="tg"><span>'+label+'</span><button class="sw'+(S.settings[k]?' on':'')+'" data-k="'+k+'" role="switch" aria-checked="'+(S.settings[k]?'true':'false')+'" aria-label="'+label+'"></button></div>';}
function applySettings(){document.body.className=S.settings.dys?'dys':'';}
function showTab(t){TAB=t;$('home').className='screen'+(t==='play'?'':' hidden');$('profile').className='screen'+(t==='me'?'':' hidden');var b=$('nav').querySelectorAll('button');for(var a=0;a<b.length;a++)b[a].className=b[a].getAttribute('data-t')===t?'on':'';if(t==='play')renderHome();else renderProfile();window.scrollTo(0,0);}

/* ---------- map view ---------- */
var svg=$('map'),gMap,gOv,VW=0,VH=0,T={k:1,x:0,y:0},FIT={k:1,x:0,y:0},CUR=null,BUILT={};
function buildMap(id){var M=MAPS[id],P=M.proj;if(BUILT[id])return BUILT[id];var g=sv('g',{}),a,b,d;
 if(M.grat){d='';for(a=-180+M.gratOff;a<180;a+=M.grat){var pts=[];for(b=-85;b<=85;b+=2.5)pts.push([a,b]);if(!M.clip||(a>=M.clip[0]&&a<=M.clip[2]))d+=ringPath(P,densify(pts,5));}
  for(a=-90+M.gratOff;a<90;a+=M.grat){pts=[];var x0=M.clip?M.clip[0]:-180,x1=M.clip?M.clip[2]:180;for(b=x0;b<=x1;b+=2.5)pts.push([b,a]);d+=ringPath(P,densify(pts,5));}
  g.appendChild(sv('path',{d:d,'class':'grat','vector-effect':'non-scaling-stroke'}));}
 var set=GEO[M.land],dl='',df='';for(a=0;a<set.length;a++){var s=featPath(P,set[a].r,true);if(id==='france'&&set[a].id!=='FRA')df+=s;else dl+=s;}
 if(df)g.appendChild(sv('path',{d:df,'class':'land far','vector-effect':'non-scaling-stroke','fill-rule':'evenodd'}));
 g.appendChild(sv('path',{d:dl,'class':'land','vector-effect':'non-scaling-stroke','fill-rule':'evenodd'}));
 if(id==='france'){d='';for(a=0;a<GEO.regions.length;a++)d+=featPath(P,GEO.regions[a].r,true);g.appendChild(sv('path',{d:d,'class':'regs','vector-effect':'non-scaling-stroke','fill-rule':'evenodd'}));}
 BUILT[id]=g;return g;}
var gBase,gHL;
function initSvg(){svg.innerHTML='';gMap=sv('g',{});gBase=sv('g',{});gHL=sv('g',{});gMap.appendChild(gBase);gMap.appendChild(gHL);gOv=sv('g',{});svg.appendChild(gMap);svg.appendChild(gOv);}
function setMap(id){if(CUR===id)return;CUR=id;while(gBase.firstChild)gBase.removeChild(gBase.firstChild);gBase.appendChild(buildMap(id));measure();resetView(false);}
function measure(){var r=svg.getBoundingClientRect();VW=r.width;VH=r.height;svg.setAttribute('viewBox','0 0 '+VW+' '+VH);}
function safeRect(){var top=G&&$('qcard')?$('qcard').getBoundingClientRect().bottom+8:0,bot=VH-80;var rs=$('res');if(!rs.classList.contains('hidden')&&rs.firstChild){bot=VH-rs.firstChild.getBoundingClientRect().height-8;}return {x0:8,y0:top,x1:VW-66,y1:Math.max(top+120,bot)};}
function fitView(){var M=MAPS[CUR].proj,R=safeRect(),w=R.x1-R.x0,h=R.y1-R.y0,k=Math.min(w/M.W,h/M.H);FIT={k:k,x:R.x0+(w-M.W*k)/2,y:R.y0+(h-M.H*k)/2};return FIT;}
function clampT(t){var M=MAPS[CUR],P=M.proj,kmin=FIT.k*0.9,kmax=FIT.k*M.maxZ;t.k=Math.max(kmin,Math.min(kmax,t.k));var w=P.W*t.k,h=P.H*t.k,m=60;
 if(w<VW)t.x=Math.max(Math.min(t.x,VW-w),0);else t.x=Math.min(m,Math.max(VW-w-m,t.x));
 if(h<VH)t.y=Math.max(Math.min(t.y,VH-h+40),-40);else t.y=Math.min(m+120,Math.max(VH-h-m-80,t.y));return t;}
function applyT(){gMap.setAttribute('transform','translate('+T.x.toFixed(2)+' '+T.y.toFixed(2)+') scale('+T.k.toFixed(5)+')');updOv();}
var ANIM=null;
function animTo(t,ms){if(ANIM)cancelAnimationFrame(ANIM);var f={k:T.k,x:T.x,y:T.y},t0=Date.now();ms=RM?0:(ms||450);
 (function st(){var u=ms?Math.min(1,(Date.now()-t0)/ms):1,e=1-Math.pow(1-u,3);T.k=f.k+(t.k-f.k)*e;T.x=f.x+(t.x-f.x)*e;T.y=f.y+(t.y-f.y)*e;applyT();if(u<1)ANIM=requestAnimationFrame(st);else ANIM=null;})();}
function resetView(anim){fitView();var t={k:FIT.k,x:FIT.x,y:FIT.y};var M=MAPS[CUR].proj,R=safeRect(),w=R.x1-R.x0,h=R.y1-R.y0,cover=Math.max(w/M.W,h/M.H),k=Math.min(cover,FIT.k*1.6);if(CUR==='world'&&k>FIT.k*1.05){var cx=M.W/2,cy=M.H*(CUR==='world'?0.46:0.5);t={k:k,x:R.x0+w/2-cx*k,y:R.y0+h/2-cy*k};t=clampT(t);}if(anim)animTo(t);else{T=t;applyT();}}
function zoomAt(f,sx,sy,anim){var nk=T.k*f,t={k:nk,x:sx-(sx-T.x)*nk/T.k,y:sy-(sy-T.y)*nk/T.k};var kk=Math.max(FIT.k*0.9,Math.min(FIT.k*MAPS[CUR].maxZ,nk));t.x=sx-(sx-T.x)*kk/T.k;t.y=sy-(sy-T.y)*kk/T.k;t.k=kk;clampT(t);if(anim)animTo(t,250);else{T=t;applyT();}}
function fitPts(pts,minKm){var P=MAPS[CUR].proj,R=safeRect(),mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;for(var a=0;a<pts.length;a++){var q=P.fwd(pts[a][0],pts[a][1]);if(q[0]<mnx)mnx=q[0];if(q[0]>mxx)mxx=q[0];if(q[1]<mny)mny=q[1];if(q[1]>mxy)mxy=q[1];}
 var cx=(mnx+mxx)/2,cy=(mny+mxy)/2,bw=Math.max(mxx-mnx,minKm||40),bh=Math.max(mxy-mny,minKm||40),w=R.x1-R.x0,h=R.y1-R.y0;var k=Math.min(w/(bw*1.35),h/(bh*1.35));k=Math.max(FIT.k,Math.min(FIT.k*MAPS[CUR].maxZ*0.8,k));
 animTo({k:k,x:R.x0+w/2-cx*k,y:R.y0+h/2-cy*k},600);}
function toMap(sx,sy){return [(sx-T.x)/T.k,(sy-T.y)/T.k];}
function toScr(mx,my){return [T.x+mx*T.k,T.y+my*T.k];}
/* overlay */
var OV={pin:null,pinM:null,tgt:null,tgtM:null,line:null};
function clearOv(){while(gOv.firstChild)gOv.removeChild(gOv.firstChild);while(gHL.firstChild)gHL.removeChild(gHL.firstChild);OV={pin:null,pinM:null,tgt:null,tgtM:null,line:null};}
function makePin(){var g=sv('g',{}),d=sv('g',{'class':'pin-drop'});d.innerHTML='<ellipse cx="0" cy="0" rx="7" ry="2.5" fill="rgba(16,28,94,.35)"/><path d="M0 0C0 0-15-18-15-29a15 15 0 0 1 30 0C15-18 0 0 0 0z" fill="#FF3D7F" stroke="#101C5E" stroke-width="2.8" stroke-linejoin="round"/><circle cx="0" cy="-29" r="5.5" fill="#fff" stroke="#101C5E" stroke-width="2.4"/>';g.appendChild(d);return g;}
function placePin(m){if(!OV.pin){OV.pin=makePin();gOv.appendChild(OV.pin);}else{var d=OV.pin.firstChild;d.setAttribute('class','');void d.getBoundingClientRect();d.setAttribute('class','pin-drop');}OV.pinM=m;updOv();}
function updOv(){if(OV.line&&OV.pinM&&OV.tgtM){var a=toScr(OV.pinM[0],OV.pinM[1]),b=toScr(OV.tgtM[0],OV.tgtM[1]);OV.line.setAttribute('x1',a[0]);OV.line.setAttribute('y1',a[1]);OV.line.setAttribute('x2',b[0]);OV.line.setAttribute('y2',b[1]);}
 if(OV.tgt&&OV.tgtM){var c=toScr(OV.tgtM[0],OV.tgtM[1]);OV.tgt.setAttribute('transform','translate('+c[0].toFixed(1)+' '+c[1].toFixed(1)+')');}
 if(OV.pin&&OV.pinM){var p=toScr(OV.pinM[0],OV.pinM[1]);OV.pin.setAttribute('transform','translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+')');}}
function kmToUnits(lon,lat,km){var P=MAPS[CUR].proj,a=P.fwd(lon,lat),b=P.fwd(lon,Math.max(-89,Math.min(89,lat+km/111.2)));return Math.abs(b[1]-a[1])||km/10;}
function drawTarget(it,near){var P=MAPS[CUR].proj,a,d;
 if(it.t==='pt'){var tol=tolOf(it);for(a=0;a<it.g.length;a++){var q=P.fwd(it.g[a][0],it.g[a][1]);if(tol>=100)gHL.appendChild(sv('circle',{cx:q[0],cy:q[1],r:kmToUnits(it.g[a][0],it.g[a][1],tol),'class':'hl-zone','vector-effect':'non-scaling-stroke'}));}}
 else if(it.t==='river'||it.t==='line'){var L=it.t==='river'?GEO.rivers[it.g]:[densify(it.g,1)];d='';for(a=0;a<L.length;a++)d+=ringPath(P,L[a]);gHL.appendChild(sv('path',{d:d,'class':'hl-line2','vector-effect':'non-scaling-stroke'}));gHL.appendChild(sv('path',{d:d,'class':'hl-line','vector-effect':'non-scaling-stroke'}));}
 else{var F=featuresFor(it);d='';for(a=0;a<F.length;a++)d+=featPath(P,F[a].r,true);gHL.appendChild(sv('path',{d:d,'class':'hl','vector-effect':'non-scaling-stroke'}));}
 var tp=near||(it.t==='pt'?it.g[0]:(it.t==='sea'?GEO.seaPt[it.g]:null));if(!tp){if(it.t==='river'||it.t==='line'){var LL=linesFor(it)[0];var mid=Math.floor(LL.length/4)*2;tp=[LL[mid],LL[mid+1]];}else{var bb=bboxOf(it);tp=[(bb[0]+bb[2])/2,(bb[1]+bb[3])/2];}}
 OV.tgtM=P.fwd(tp[0],tp[1]);
 if(OV.pinM){OV.line=sv('line',{'class':'ovline'});gOv.insertBefore(OV.line,gOv.firstChild);}
 OV.tgt=sv('g',{});OV.tgt.innerHTML='<circle r="9" class="tgt-ring"/><circle r="8" fill="#22D69B" stroke="#101C5E" stroke-width="3"/><circle r="2.5" fill="#101C5E"/>';gOv.appendChild(OV.tgt);if(OV.pin)gOv.appendChild(OV.pin);updOv();}
function bboxOf(it){var o=[1e9,1e9,-1e9,-1e9],a,b,f;function add(x,y){if(x<o[0])o[0]=x;if(y<o[1])o[1]=y;if(x>o[2])o[2]=x;if(y>o[3])o[3]=y;}
 if(it.t==='pt'){for(a=0;a<it.g.length;a++)add(it.g[a][0],it.g[a][1]);}
 else if(it.t==='river'||it.t==='line'){var L=linesFor(it);for(a=0;a<L.length;a++)for(b=0;b<L[a].length;b+=2)add(L[a][b],L[a][b+1]);}
 else{var F=featuresFor(it);for(a=0;a<F.length;a++)for(b=0;b<F[a].r.length;b++){f=F[a].r[b];for(var c=0;c<f.length;c+=2){if(it.t==='country'&&it.g==='FRA'&&f[c+1]<40)continue;add(f[c],f[c+1]);}}}
 return o;}
/* pointer handling */
var PTR={},TAP=null,PINCH=null;
function rel(e){var r=svg.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];}
svg.addEventListener('pointerdown',function(e){var p=rel(e);try{svg.setPointerCapture(e.pointerId);}catch(x){}PTR[e.pointerId]=p;var ids=Object.keys(PTR);
 if(ids.length===1){TAP={x:p[0],y:p[1],t:Date.now(),ok:true,lx:p[0],ly:p[1]};}
 else if(ids.length===2){if(TAP)TAP.ok=false;var a=PTR[ids[0]],b=PTR[ids[1]];PINCH={d:Math.max(10,Math.hypot(a[0]-b[0],a[1]-b[1])),cx:(a[0]+b[0])/2,cy:(a[1]+b[1])/2,T:{k:T.k,x:T.x,y:T.y}};}});
svg.addEventListener('pointermove',function(e){if(!PTR[e.pointerId])return;var p=rel(e);PTR[e.pointerId]=p;var ids=Object.keys(PTR);
 if(ids.length>=2&&PINCH){var a=PTR[ids[0]],b=PTR[ids[1]],d=Math.max(10,Math.hypot(a[0]-b[0],a[1]-b[1])),cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2,nk=PINCH.T.k*d/PINCH.d;var M=MAPS[CUR];nk=Math.max(FIT.k*0.9,Math.min(FIT.k*M.maxZ,nk));var mx=(PINCH.cx-PINCH.T.x)/PINCH.T.k,my=(PINCH.cy-PINCH.T.y)/PINCH.T.k;T=clampT({k:nk,x:cx-mx*nk,y:cy-my*nk});applyT();}
 else if(ids.length===1&&TAP){var dx=p[0]-TAP.lx,dy=p[1]-TAP.ly;if(Math.abs(p[0]-TAP.x)+Math.abs(p[1]-TAP.y)>9)TAP.ok=false;if(!TAP.ok){T=clampT({k:T.k,x:T.x+dx,y:T.y+dy});applyT();}TAP.lx=p[0];TAP.ly=p[1];}});
function ptrEnd(e){if(!PTR[e.pointerId])return;delete PTR[e.pointerId];var n=Object.keys(PTR).length;if(n<2)PINCH=null;
 if(n===0&&TAP){if(TAP.ok&&Date.now()-TAP.t<600&&e.type==='pointerup')onMapTap(TAP.x,TAP.y);TAP=null;}else if(n===1){var id=Object.keys(PTR)[0];TAP={x:PTR[id][0],y:PTR[id][1],t:0,ok:false,lx:PTR[id][0],ly:PTR[id][1]};}}
svg.addEventListener('pointerup',ptrEnd);svg.addEventListener('pointercancel',ptrEnd);
svg.addEventListener('wheel',function(e){e.preventDefault();var p=rel(e);zoomAt(Math.exp(-e.deltaY*0.0018),p[0],p[1],false);},{passive:false});
$('zIn').onclick=function(){zoomAt(1.8,VW/2,(safeRect().y0+safeRect().y1)/2,true);};
$('zOut').onclick=function(){zoomAt(1/1.8,VW/2,(safeRect().y0+safeRect().y1)/2,true);};
$('zFit').onclick=function(){resetView(true);};
window.addEventListener('resize',function(){if(G&&CUR){measure();fitView();T=clampT(T);applyT();}});

/* ---------- game ---------- */
var G=null;
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul?Math.imul(seed^seed>>>15,1|seed):(seed^seed>>>15)*(1|seed);t=t+(Math.imul?Math.imul(t^t>>>7,61|t):(t^t>>>7)*(61|t))^t;return ((t^t>>>14)>>>0)/4294967296;};}
function hashStr(s){var h=2166136261;for(var a=0;a<s.length;a++){h^=s.charCodeAt(a);h=(h*16777619)>>>0;}return h;}
function shuffle(arr,r){r=r||Math.random;for(var a=arr.length-1;a>0;a--){var b=Math.floor(r()*(a+1)),t=arr[a];arr[a]=arr[b];arr[b]=t;}return arr;}
function weightOf(it){var s=S.items[it.id];if(!s)return 3;return [3,2,1.4,1,0.5][Math.min(4,s.b)];}
function pickWeighted(pool,n){var P=pool.slice(),o=[];while(o.length<n&&P.length){var tot=0,a;for(a=0;a<P.length;a++)tot+=weightOf(P[a]);var r=Math.random()*tot;for(a=0;a<P.length;a++){r-=weightOf(P[a]);if(r<=0)break;}a=Math.min(a,P.length-1);o.push(P[a]);P.splice(a,1);}return o;}
function dailyItems(){var r=rng(hashStr('reperes-'+today())),pk=[],a;for(a=0;a<PACKS.length;a++)if(PACKS[a].id!=='chez'&&PACKS[a].id!=='drapeaux')pk.push(PACKS[a].id);shuffle(pk,r);var o=[];for(a=0;a<10;a++){var L=BYPACK[pk[a%pk.length]];var it=L[Math.floor(r()*L.length)];if(o.indexOf(it)<0)o.push(it);else a--;}
 o.sort(function(x,y){var mo={world:0,europe:1,france:2};return mo[x.mp]-mo[y.mp];});return o;}
function startGame(mode,pid,itemId){var q;
 if(mode==='daily')q=dailyItems();else if(mode==='review')q=weakList().slice(0,10);else if(mode==='mission')q=pickWeighted(BYPACK[pid],10);else if(mode==='brevet'||mode==='brevet_long'){var brevetPool=[];for(var bi=0;bi<PACKS.length;bi++){var pp=PACKS[bi];if(pp.lv==='3e'||(mode==='brevet_long'&&pp.lv==='4e'))brevetPool=brevetPool.concat(BYPACK[pp.id]);}q=pickWeighted(brevetPool,mode==='brevet_long'?30:15);}else if(mode==='eclair')q=shuffle(BYPACK[pid].slice());else if(mode==='quiz'){var qp=[];for(var z=0;z<BYPACK[pid].length;z++)if(BYPACK[pid][z].fl)qp.push(BYPACK[pid][z]);q=shuffle(qp).slice(0,10);}else if(mode==='flags'){var fp=[];for(var z=0;z<BYPACK[pid].length;z++)if(BYPACK[pid][z].t==='country'&&BYPACK[pid][z].fl)fp.push(BYPACK[pid][z]);q=pickWeighted(fp,10);}else{q=[BYID[itemId]];S.stats.explore++;save();checkBadges();}
 G={qq:mode==='quiz'?buildQuiz(q,pid):null,mode:mode,pid:pid,q:q,i:0,score:0,combo:0,maxCombo:0,res:[],state:'',xpGain:0,newBadges:[],eclairCount:0,timer:null,end:0,replay:mode==='daily'&&S.daily.day===today()};
 $('game').className='';CUR=null;initSvg();$('res').className='res hidden';
 if(mode==='eclair'){G.end=Date.now()+60000;G.timer=setInterval(tick,100);}
 renderQ();}
function tick(){if(!G||G.mode!=='eclair')return;var left=Math.max(0,G.end-Date.now());var b=$('tbar');if(b)b.style.width=(left/600)+'%';if(left<=0){clearInterval(G.timer);G.timer=null;finishGame();}}
function renderQ(){if(G.mode==='quiz'){renderQuiz();return;}showMapUI(true);var it=G.q[G.i],qc=$('qcard'),top='';
 if(G.mode==='eclair')top='<div class="timer"><i id="tbar" style="width:'+Math.max(0,(G.end-Date.now())/600)+'%"></i></div>';
 else if(G.mode==='explore')top='<div style="flex:1;font-weight:800">Mode découverte</div>';
 else{top='<div class="prog">';for(var a=0;a<G.q.length;a++){var c='';if(a<G.res.length){var s=G.res[a].s;c=s>=80?'ok':(s>=40?'mid':'ko');}else if(a===G.i)c='now';top+='<i class="'+c+'"></i>';}top+='</div>';}
 var tile=(it.fl&&(it.t==='country'||G.mode==='explore'))?'<div class="qk qf">'+flagImg(it.fl)+'</div>':'<div class="qk">'+(KIND_EMO[it.k]||'📍')+'</div>';
 var body=G.mode==='flags'?'<div class="qbody qflag">'+flagImg(it.fl,'big','Drapeau mystère')+'<div><div class="qkind">Drapeaux</div><div class="qname">Où est ce pays ?</div></div></div>':'<div class="qbody">'+tile+'<div><div class="qkind">'+(G.mode==='explore'?it.k:'Place sur la carte · '+it.k.toLowerCase())+'</div><div class="qname">'+esc(it.n)+'</div></div></div>';
 qc.innerHTML='<div class="qtop"><button class="x" id="bQuit" aria-label="Quitter">✕</button>'+top+(G.combo>=2?'<span class="combo">×'+G.combo+'</span>':'')+(G.mode==='explore'?'':'<span class="score" id="sc">'+G.score+'</span>')+'</div>'+body;
 qc.className='qcard';void qc.offsetWidth;qc.className='qcard pop';
 $('bQuit').onclick=quitAsk;
 setMap(it.mp);clearOv();$('res').className='res hidden';
 setTimeout(function(){fitView();resetView(true);},20);
 if(G.mode==='explore'){G.state='reveal';drawTarget(it,null);var bb=bboxOf(it);setTimeout(function(){showExplore(it,bb);},40);return;}
 G.state='placing';G.guess=null;renderBottom();}

function showMapUI(on){svg.style.visibility=on?'visible':'hidden';$('zoomBox').style.display=on?'':'none';$('quiz').className=on?'quiz hidden':'quiz';if(!on){$('tip').style.opacity=0;$('bottom').innerHTML='';}}
function buildQuiz(q,pid){var pool=[],all=[],a,c;for(a=0;a<BYPACK[pid].length;a++){c=BYPACK[pid][a].fl;if(c&&pool.indexOf(c)<0)pool.push(c);}for(c in NAMES)if(NAMES.hasOwnProperty(c))all.push(c);
 var out=[];for(a=0;a<q.length;a++){var it=q[a],ans=it.fl,type=it.t==='country'?(Math.random()<0.5?'n2f':'f2n'):'c2f';var cand=shuffle(pool.slice()),opts=[ans];for(var b=0;b<cand.length&&opts.length<4;b++)if(opts.indexOf(cand[b])<0)opts.push(cand[b]);var rest=shuffle(all.slice());for(b=0;b<rest.length&&opts.length<4;b++)if(opts.indexOf(rest[b])<0)opts.push(rest[b]);out.push({type:type,ans:ans,opts:shuffle(opts)});}return out;}
function renderQuiz(){var it=G.q[G.i],Q=G.qq[G.i],qc=$('qcard'),a;showMapUI(false);$('res').className='res hidden';
 var top='<div class="prog">';for(a=0;a<G.q.length;a++){var c='';if(a<G.res.length){c=G.res[a].s>=80?'ok':'ko';}else if(a===G.i)c='now';top+='<i class="'+c+'"></i>';}top+='</div>';
 var body;if(Q.type==='f2n')body='<div class="qbody qflag">'+flagImg(Q.ans,'big','Drapeau mystère')+'<div><div class="qkind">Quiz drapeaux</div><div class="qname">Quel est ce pays ?</div></div></div>';
 else if(Q.type==='n2f')body='<div class="qbody"><div class="qk">🏁</div><div><div class="qkind">Trouve le drapeau de</div><div class="qname">'+esc(it.n)+'</div></div></div>';
 else body='<div class="qbody"><div class="qk">'+(KIND_EMO[it.k]||'📍')+'</div><div><div class="qkind">'+esc(it.k)+' : dans quel pays ?</div><div class="qname">'+esc(it.n)+'</div></div></div>';
 qc.innerHTML='<div class="qtop"><button class="x" id="bQuit" aria-label="Quitter">✕</button>'+top+(G.combo>=2?'<span class="combo">×'+G.combo+'</span>':'')+'<span class="score" id="sc">'+G.score+'</span></div>'+body;
 qc.className='qcard';void qc.offsetWidth;qc.className='qcard pop';$('bQuit').onclick=quitAsk;
 var h='<div class="qgrid'+(Q.type==='f2n'?' names':'')+'">';for(a=0;a<Q.opts.length;a++){var o=Q.opts[a];h+='<button class="qopt" data-c="'+o+'" aria-label="Choix '+(a+1)+(Q.type==='f2n'?' : '+esc(NAMES[o]):'')+'">'+(Q.type==='f2n'?'<span class="qn">'+esc(NAMES[o])+'</span>':flagImg(o,'opt'))+'</button>';}h+='</div>';
 var z=$('quiz');z.innerHTML=h;z.style.top=(qc.getBoundingClientRect().bottom+14)+'px';
 var bs=z.querySelectorAll('.qopt');for(a=0;a<bs.length;a++)bs[a].onclick=function(){quizPick(this.getAttribute('data-c'));};G.state='placing';}
function quizPick(code){if(!G||G.state!=='placing')return;G.state='reveal';var it=G.q[G.i],Q=G.qq[G.i],ok=code===Q.ans,s=ok?100:0;
 var bs=$('quiz').querySelectorAll('.qopt');for(var a=0;a<bs.length;a++){var c=bs[a].getAttribute('data-c');bs[a].disabled=true;if(c===Q.ans)bs[a].className='qopt ok';else if(c===code)bs[a].className='qopt ko';else bs[a].className='qopt dim';}
 var mult=1;if(ok){mult=1+0.1*Math.min(G.combo,5);G.combo++;}else G.combo=0;if(G.combo>G.maxCombo)G.maxCombo=G.combo;
 var pts=Math.round(s*mult);G.score+=pts;G.res.push({id:it.id,s:s,d:null,pts:pts});
 S.stats.pins++;if(ok){S.stats.perfects++;S.stats.quizOk++;}if(G.combo>S.stats.bestCombo)S.stats.bestCombo=G.combo;
 var xp=Math.round(pts/10),L0=levelOf(S.xp);S.xp+=xp;G.xpGain+=xp;save();if(levelOf(S.xp)>L0){setTimeout(function(){sfx('level');toast('⬆️','Niveau '+levelOf(S.xp)+' : '+titleOf(levelOf(S.xp)));},500);}
 checkBadges();if(ok){sfx('perfect');vib([20,40,30]);}else{sfx('miss');vib(60);}
 var sc=$('sc');if(sc)sc.textContent=G.score;
 var last=G.i>=G.q.length-1,rs=$('res');
 rs.innerHTML='<div class="card" role="status"><div class="rrow"><div class="remo">'+(ok?'🎯':'🙈')+'</div><div><div class="rt">'+(ok?'Bien vu !':'Raté…')+'</div><div class="rd">'+(ok?(mult>1?'Combo ×'+mult.toFixed(1).replace('.',','):'Bonne réponse'):'La bonne réponse : '+esc(NAMES[Q.ans]))+'</div></div><div class="rpts'+(pts?'':' z')+'">+'+pts+'</div></div><div class="fact"><b>'+flagImg(Q.ans,'tiny')+esc(it.t==='country'?it.n:it.n+' ('+NAMES[Q.ans]+')')+'</b>'+esc(it.f)+'</div><button class="btn wide" id="bNext">'+(last?'Voir mon résultat':'Suivant')+'</button></div>';
 rs.className='res';$('bNext').onclick=nextQ;$('bNext').focus({preventScroll:true});}
function renderBottom(){var b=$('bottom');if(G.state!=='placing'){b.innerHTML='';$('tip').style.opacity=0;return;}
 if(G.mode==='eclair'){b.innerHTML='<button class="btn alt" id="bSkip">Passer</button>';$('tip').textContent='Touche la carte : ta réponse est validée tout de suite';}
 else{b.innerHTML='<button class="btn alt" id="bSkip">Je ne sais pas</button><button class="btn" id="bOk"'+(G.guess?'':' disabled')+'>Valider</button>';$('tip').textContent='Touche la carte pour planter ton pin';var ok=$('bOk');ok.onclick=function(){if(G.guess)validate();};}
 $('tip').style.opacity=G.guess?0:1;$('bSkip').onclick=function(){validate(true);};}
function onMapTap(sx,sy){if(!G||G.state!=='placing')return;var m=toMap(sx,sy),P=MAPS[CUR].proj;if(m[0]<-20||m[1]<-20||m[0]>P.W+20||m[1]>P.H+20)return;var ll=P.inv(m[0],m[1]);if(!isFinite(ll[0])||!isFinite(ll[1])||Math.abs(ll[1])>90)return;
 if(MAPS[CUR].clip){var c=MAPS[CUR].clip;}
 G.guess={m:m,ll:ll};placePin(m);sfx('tap');vib(12);
 if(G.mode==='eclair'){validate();return;}renderBottom();}
function validate(skip){var it=G.q[G.i],res,s=0,dist=null,near=null;G.state='reveal';
 if(!skip&&G.guess){var r=distTo(it,G.guess.ll[0],G.guess.ll[1]);dist=r.d;near=r.p;s=scoreFor(it,dist);}else{clearOvPinOnly();}
 var mult=1;if(s>=80){mult=1+0.1*Math.min(G.combo,5);G.combo++;}else G.combo=0;if(G.combo>G.maxCombo)G.maxCombo=G.combo;
 var pts=Math.round(s*mult);G.score+=pts;G.res.push({id:it.id,s:s,d:dist,pts:pts});
 var st=S.items[it.id]||{b:0,s:0,n:0,l:0,t:0};if(st.n>0&&st.l<50&&s>=80)unlock('revenge');if(it.t==='pt'&&dist!==null&&dist<2&&tolOf(it)<=30)unlock('km1');st.n++;st.l=s;st.t=Date.now();if(s>st.s)st.s=s;if(s>=80)st.b=Math.min(4,st.b+1);else if(s<50)st.b=0;S.items[it.id]=st;
 S.stats.pins++;if(s===100){S.stats.perfects++;if(G.mode==='flags')S.stats.flagPerfects++;}if(G.combo>S.stats.bestCombo)S.stats.bestCombo=G.combo;S.stats.maps[it.mp]=1;
 var xp=Math.round(pts/10)*(G.mode==='daily'&&!G.replay?2:1);var L0=levelOf(S.xp);S.xp+=xp;G.xpGain+=xp;if(G.mode==='eclair')G.eclairCount++;
 save();if(levelOf(S.xp)>L0){setTimeout(function(){sfx('level');toast('⬆️','Niveau '+levelOf(S.xp)+' : '+titleOf(levelOf(S.xp)));},500);}
 checkBadges();
 if(s===100){sfx('perfect');vib([20,40,30]);if(G.mode!=='eclair')confetti(70);}else if(s>=80)sfx('good');else if(s>=40)sfx('meh');else{sfx('miss');vib(60);}
 drawTarget(it,near);
 var sc=$('sc');if(sc)sc.textContent=G.score;
 if(G.mode==='eclair'){showMini(s,pts);var pts2=[];if(G.guess)pts2.push(G.guess.ll);if(near&&(it.t==='pt'&&it.g.length===1))pts2.push(near);else{var bb=bboxOf(it);pts2.push([bb[0],bb[1]],[bb[2],bb[3]]);}fitPts(pts2,60);setTimeout(function(){if(G&&G.end>Date.now())nextQ();},1300);return;}
 showResult(it,s,dist,pts,mult);}
function clearOvPinOnly(){if(OV.pin&&OV.pin.parentNode)OV.pin.parentNode.removeChild(OV.pin);OV.pin=null;OV.pinM=null;}
function rating(s,skip){if(skip)return ['🫣','Pas de souci','Voilà où ça se trouve. Tu le retrouveras dans ta liste à revoir.'];if(s===100)return ['🎯','Parfait !',''];if(s>=80)return ['🔥','Tout près !',''];if(s>=50)return ['👍','Pas mal',''];if(s>=20)return ['🧭','Un peu loin',''];return ['🙈','Raté…',''];}
function fmtKm(d){if(d===0)return 'Pile dedans';if(d<1)return 'à moins d\'1 km';if(d<10)return 'à '+d.toFixed(1).replace('.',',')+' km';return 'à '+Math.round(d).toLocaleString('fr-FR')+' km';}
function showResult(it,s,dist,pts,mult){var skip=dist===null,r=rating(s,skip),rs=$('res');$('bottom').innerHTML='';$('tip').style.opacity=0;
 var last=G.i>=G.q.length-1;
 rs.innerHTML='<div class="card" role="status"><div class="rrow"><div class="remo">'+r[0]+'</div><div><div class="rt">'+r[1]+'</div><div class="rd">'+(skip?esc(it.n):fmtKm(dist)+(mult>1?', combo ×'+mult.toFixed(1).replace('.',','):''))+'</div></div><div class="rpts'+(pts?'':' z')+'">+'+pts+'</div></div><div class="fact"><b>'+(it.fl?flagImg(it.fl,'tiny'):'')+esc(it.n)+'</b>'+esc(it.f)+(r[2]?'<br><span style="color:var(--muted);font-size:13px">'+r[2]+'</span>':'')+'</div><button class="btn wide" id="bNext">'+(last?'Voir mon résultat':'Suivant')+'</button></div>';
 rs.className='res';
 $('bNext').onclick=nextQ;$('bNext').focus({preventScroll:true});
 setTimeout(function(){var pts2=[];if(G.guess&&!skip)pts2.push(G.guess.ll);var bb=bboxOf(it);if(it.t==='pt'&&it.g.length===1){pts2.push(it.g[0]);}else{pts2.push([bb[0],bb[1]],[bb[2],bb[3]]);}fitPts(pts2,CUR==='france'?(PACK[it.p].scale?6:30):50);},60);}
function showMini(s,pts){var rs=$('res'),r=rating(s,false);rs.innerHTML='<div class="card" style="padding:12px 18px calc(12px + env(safe-area-inset-bottom,0px))"><div class="rrow"><div class="remo" style="font-size:30px">'+r[0]+'</div><div class="rt" style="font-size:20px">'+r[1]+'</div><div class="rpts'+(pts?'':' z')+'">+'+pts+'</div></div></div>';rs.className='res';$('bottom').innerHTML='';$('tip').style.opacity=0;}
function showExplore(it,bb){var rs=$('res');$('bottom').innerHTML='';$('tip').style.opacity=0;
 rs.innerHTML='<div class="card"><div class="fact" style="margin-top:0"><b>'+esc(it.k)+'</b>'+esc(it.f)+'</div><div style="display:flex;gap:10px"><button class="btn alt" id="bBack" style="flex:1">Retour</button><button class="btn" id="bTry" style="flex:1">M\'entraîner sur le pack</button></div></div>';rs.className='res';
 $('bBack').onclick=function(){var p=it.p;closeGame();openPack(p);};$('bTry').onclick=function(){var p=it.p;closeGame();startGame('mission',p);};
 setTimeout(function(){var pts=it.t==='pt'&&it.g.length===1?[it.g[0]]:[[bb[0],bb[1]],[bb[2],bb[3]]];fitPts(pts,CUR==='france'?(PACK[it.p].scale?6:30):60);},60);}
function nextQ(){if(!G)return;if(G.mode==='eclair'){G.i++;if(G.i>=G.q.length){G.q=G.q.concat(shuffle(G.q.slice()));}renderQ();return;}
 if(G.i>=G.q.length-1){finishGame();return;}G.i++;renderQ();}
function quitAsk(){if(G.mode==='explore'||!G.res.length){closeGame();return;}modal('Quitter la partie ?','Tes repères déjà placés sont enregistrés, mais tu ne verras pas ton bilan.','Quitter','Continuer',function(){closeGame();});}
function closeGame(){if(G&&G.timer)clearInterval(G.timer);G=null;$('game').className='hidden';$('end').className='hidden';showTab(TAB);}
function finishGame(){if(!G)return;if(G.timer){clearInterval(G.timer);G.timer=null;}G.state='end';
 var n=G.res.length,avg=0,a;for(a=0;a<n;a++)avg+=G.res[a].s;avg=n?Math.round(avg/n):0;
 S.stats.games++;var td=today();if(S.streak.last!==td){S.streak.cur=S.streak.last===yesterday()?S.streak.cur+1:1;S.streak.last=td;if(S.streak.cur>S.streak.best)S.streak.best=S.streak.cur;}
 if(G.mode==='daily'&&!G.replay){S.daily={day:td,score:G.score};S.stats.daily++;if(G.score>=900)unlock('dailyTop');}
 if(G.mode==='review')S.stats.reviews++;if(G.mode==='quiz'&&n>=10&&avg===100)unlock('quiz10');
 var now=new Date();if(now.getHours()<8)unlock('early');if(now.getDay()===0||now.getDay()===6)unlock('weekend');
 var stars=G.mode==='eclair'?(G.eclairCount>=15&&avg>=60?3:G.eclairCount>=10?2:G.eclairCount>=5?1:0):(avg>=80?3:avg>=60?2:avg>=35?1:0);G.stars=stars;if(stars===3)S.stats.stars3++;
 if(G.mode==='eclair'&&G.eclairCount>S.stats.eclairBest)S.stats.eclairBest=G.eclairCount;
 var clean=G.mode!=='eclair'&&n>=5;for(a=0;a<n;a++)if(G.res[a].s<80)clean=false;if(clean)unlock('clean');
 save();checkBadges();showEnd(avg);}
function showEnd(avg){var e=$('end'),n=G.res.length,st=G.stars;
 var title=st===3?'Énorme !':st===2?'Bien joué !':st===1?'Ça avance !':'On s\'accroche !';
 var L=levelOf(S.xp),pct=Math.round(100*(S.xp-xpFor(L))/(xpFor(L+1)-xpFor(L)));
 var html='<div class="col" style="padding-bottom:40px"><div class="endc"><div class="stars">';for(var a=0;a<3;a++)html+='<span class="'+(a<st?'on':'')+'" style="animation-delay:'+(0.25+a*0.18)+'s">⭐</span>';
 html+='</div><h2>'+title+'</h2><div class="sub">'+({daily:'Défi du jour',review:'Révision',mission:'Mission',eclair:'Mode éclair',flags:'Drapeau → carte',quiz:'Quiz drapeaux',brevet:'Mission Brevet',brevet_long:'Grande épreuve'})[G.mode]+(G.pid?' : '+esc(PACK[G.pid].n):'')+'</div><div class="bigscore" id="bigS">0</div><div class="sub">points</div>';
 html+='<div class="kpis"><div class="kpi"><b>'+(G.mode==='eclair'?G.eclairCount:avg+' %')+'</b><span>'+(G.mode==='eclair'?'repères en 60 s':'précision')+'</span></div><div class="kpi"><b>×'+G.maxCombo+'</b><span>meilleur combo</span></div><div class="kpi"><b>+'+G.xpGain+'</b><span>XP'+(G.mode==='daily'&&!G.replay?' (×2)':'')+'</span></div></div>';
 html+='<div style="text-align:left;margin-top:8px"><div class="sub">Niveau '+L+', '+titleOf(L)+'</div><div class="bar"><i id="endBar" style="width:0%"></i></div></div>';
 if(G.newBadges.length){html+='<div class="newb">Nouveau'+(G.newBadges.length>1?'x badges':' badge')+' : ';for(a=0;a<G.newBadges.length;a++)html+=G.newBadges[a].e+' '+G.newBadges[a].n+(a<G.newBadges.length-1?', ':'');html+='</div>';}
 if(G.mode!=='eclair'){html+='<div class="recap">';for(a=0;a<n;a++){var r=G.res[a],it=BYID[r.id],c=r.s>=80?'var(--mint)':r.s>=40?'var(--sun)':'var(--pin)';html+='<div class="rc"><span>'+(it.fl?flagImg(it.fl,'mini'):(KIND_EMO[it.k]||'📍'))+'</span><span class="n">'+esc(it.n)+'</span><span class="sb"><i style="width:'+r.s+'%;background:'+c+'"></i></span><span class="v">'+r.s+'</span></div>';}html+='</div>';}
 html+='<div class="endbtns"><button class="btn alt" id="bHome">Accueil</button><button class="btn" id="bAgain">Rejouer</button></div></div></div>';
 e.innerHTML=html;e.className='';e.scrollTop=0;$('game').className='hidden';
 var target=G.score,t0=Date.now();(function cnt(){var u=RM?1:Math.min(1,(Date.now()-t0)/900);var bs=$('bigS');if(bs)bs.textContent=Math.round(target*(1-Math.pow(1-u,3)));if(u<1)requestAnimationFrame(cnt);})();
 setTimeout(function(){var b=$('endBar');if(b)b.style.width=pct+'%';},80);
 if(st>=2)setTimeout(function(){confetti(120);},300);
 var mode=G.mode,pid=G.pid;
 $('bHome').onclick=closeGame;$('bAgain').onclick=function(){$('end').className='hidden';startGame(mode,pid);};}
document.addEventListener('keydown',function(e){if(!G)return;if(G.mode==='quiz'&&G.state==='placing'&&/^[1-4]$/.test(e.key)){var ob=$('quiz').querySelectorAll('.qopt')[+e.key-1];if(ob)ob.click();return;}if(e.key==='Enter'){var b=$('bNext')||$('bOk');if(b&&!b.disabled){e.preventDefault();b.click();}}else if(e.key==='Escape'){quitAsk();}else if(e.key==='+'||e.key==='='){$('zIn').click();}else if(e.key==='-'){$('zOut').click();}});

/* ===== TERRA VILLAGE EXPANSION (shares the original GéoPins engine and saves) ===== */
var TV_KEY='brot2you-geopins-terra-v2';
var TV={avatar:'🧑🏻‍🚀',decor:[],welcomed:false};
try{var tvOld=JSON.parse(localStorage.getItem(TV_KEY)||'null');if(tvOld&&typeof tvOld==='object'){if(typeof tvOld.avatar==='string')TV.avatar=tvOld.avatar;if(Array.isArray(tvOld.decor))TV.decor=tvOld.decor.filter(function(n){return Number.isInteger(n)&&n>=0&&n<6;});if(tvOld.welcomed)TV.welcomed=true;}}catch(tvErr){}
function tvSave(){try{localStorage.setItem(TV_KEY,JSON.stringify(TV));}catch(err){}}
var TV_SCENE=`<svg class="terrain-art" viewBox="0 0 1200 720" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Îles verdoyantes, villages et mer turquoise dans un univers d’aventure">
<defs>
 <linearGradient id="v-sky" x2="0" y2="1"><stop stop-color="#B8E5ED"/><stop offset=".45" stop-color="#E8F4DF"/><stop offset="1" stop-color="#FFE0AA"/></linearGradient>
 <linearGradient id="v-sea" x2="0" y2="1"><stop stop-color="#91E3DD"/><stop offset=".48" stop-color="#4DB9CA"/><stop offset="1" stop-color="#177EA6"/></linearGradient>
 <linearGradient id="v-grass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#DFF3AD"/><stop offset=".48" stop-color="#98D37E"/><stop offset="1" stop-color="#5EAE67"/></linearGradient>
 <linearGradient id="v-earth" x2="0" y2="1"><stop stop-color="#C1A16A"/><stop offset=".45" stop-color="#AD795A"/><stop offset="1" stop-color="#75564E"/></linearGradient>
 <linearGradient id="v-walls" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFF5DA"/><stop offset="1" stop-color="#E8C99A"/></linearGradient>
 <linearGradient id="v-roof" x2="0" y2="1"><stop stop-color="#F19467"/><stop offset="1" stop-color="#BB5D55"/></linearGradient>
 <radialGradient id="v-sun"><stop stop-color="#FFFAD4" stop-opacity=".95"/><stop offset=".65" stop-color="#FFE8A8" stop-opacity=".52"/><stop offset="1" stop-color="#FFE8A8" stop-opacity="0"/></radialGradient>
 <filter id="v-shadow" x="-30%" width="160%" y="-50%" height="220%"><feGaussianBlur stdDeviation="13"/></filter>
 <filter id="v-dshadow" x="-50%" width="200%" y="-50%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#3E6E6A" flood-opacity=".23"/></filter>
 <pattern id="v-foam" width="85" height="51" patternUnits="userSpaceOnUse"><path d="M7 20q17-7 34 0M54 42q12-5 25 0" stroke="#C1FFF4" stroke-width="2" stroke-linecap="round" opacity=".42" fill="none"/></pattern>
</defs>
<path d="M0 0H1200V720H0Z" fill="url(#v-sky)"/>
<circle cx="1028" cy="154" r="190" fill="url(#v-sun)"/><circle cx="1028" cy="154" r="66" fill="#FFF4D4" opacity=".9"/>
<g transform="translate(98 130) scale(1.2)" fill="#FFFDF0" opacity=".72"><ellipse cx="12" cy="34" rx="72" ry="24"/><circle cx="-15" cy="16" r="36"/><circle cx="30" cy="7" r="48"/><circle cx="84" cy="25" r="27"/></g><g transform="translate(325 77) scale(0.8)" fill="#FFFDF0" opacity=".72"><ellipse cx="12" cy="34" rx="72" ry="24"/><circle cx="-15" cy="16" r="36"/><circle cx="30" cy="7" r="48"/><circle cx="84" cy="25" r="27"/></g><g transform="translate(775 120) scale(1.2)" fill="#FFFDF0" opacity=".72"><ellipse cx="12" cy="34" rx="72" ry="24"/><circle cx="-15" cy="16" r="36"/><circle cx="30" cy="7" r="48"/><circle cx="84" cy="25" r="27"/></g><g transform="translate(1030 68) scale(0.85)" fill="#FFFDF0" opacity=".72"><ellipse cx="12" cy="34" rx="72" ry="24"/><circle cx="-15" cy="16" r="36"/><circle cx="30" cy="7" r="48"/><circle cx="84" cy="25" r="27"/></g><g transform="translate(60 285) scale(0.65)" fill="#FFFDF0" opacity=".72"><ellipse cx="12" cy="34" rx="72" ry="24"/><circle cx="-15" cy="16" r="36"/><circle cx="30" cy="7" r="48"/><circle cx="84" cy="25" r="27"/></g><path d="M0 345L72 247 118 300 213 208 317 332 403 268 500 352 585 247 691 352 760 266 839 341 920 221 1007 336 1110 260 1200 320 1200 490H0Z" fill="#A6CCBA" opacity=".65"/><path d="M0 405L123 287 178 357 290 273 395 393 498 307 633 411 749 287 833 378 951 277 1021 375 1121 307 1200 364 1200 460H0Z" fill="#80B6A9" opacity=".65"/><path d="M0 375Q400 353 620 380T1200 360V720H0Z" fill="url(#v-sea)"/><path d="M0 388Q400 366 620 390T1200 370V720H0Z" fill="url(#v-foam)"/><ellipse cx="120" cy="512" rx="86" ry="14" fill="none" stroke="#D9FFEE" stroke-width="3" opacity=".36"/><ellipse cx="1060" cy="520" rx="72" ry="14" fill="none" stroke="#D9FFEE" stroke-width="3" opacity=".36"/><ellipse cx="328" cy="650" rx="115" ry="14" fill="none" stroke="#D9FFEE" stroke-width="3" opacity=".36"/><ellipse cx="890" cy="660" rx="87" ry="14" fill="none" stroke="#D9FFEE" stroke-width="3" opacity=".36"/><ellipse cx="210" cy="430" rx="60" ry="14" fill="none" stroke="#D9FFEE" stroke-width="3" opacity=".36"/><ellipse cx="700" cy="500" rx="72" ry="14" fill="none" stroke="#D9FFEE" stroke-width="3" opacity=".36"/><ellipse cx="1120" cy="580" rx="52" ry="14" fill="none" stroke="#D9FFEE" stroke-width="3" opacity=".36"/><g transform="translate(71 395) scale(0.75)"><ellipse cy="20" rx="119" ry="26" fill="#164C6C" opacity=".22" filter="url(#v-shadow)"/><path d="M-116 0Q-89 50 9 50Q94 49 114 0Z" fill="#A27F61"/><ellipse rx="118" ry="31" fill="#80C889"/><path d="M-34-4l34-68 39 68" fill="#99BEA4"/><path d="M-10-50l10-22 14 24" fill="#F7E9D6"/></g><g transform="translate(1103 444) scale(0.8)"><ellipse cy="20" rx="119" ry="26" fill="#164C6C" opacity=".22" filter="url(#v-shadow)"/><path d="M-116 0Q-89 50 9 50Q94 49 114 0Z" fill="#A27F61"/><ellipse rx="118" ry="31" fill="#80C889"/><path d="M-34-4l34-68 39 68" fill="#99BEA4"/><path d="M-10-50l10-22 14 24" fill="#F7E9D6"/></g><g transform="translate(967 330) scale(0.48)"><ellipse cy="20" rx="119" ry="26" fill="#164C6C" opacity=".22" filter="url(#v-shadow)"/><path d="M-116 0Q-89 50 9 50Q94 49 114 0Z" fill="#A27F61"/><ellipse rx="118" ry="31" fill="#80C889"/><path d="M-34-4l34-68 39 68" fill="#99BEA4"/><path d="M-10-50l10-22 14 24" fill="#F7E9D6"/></g><ellipse cx="628" cy="572" rx="458" ry="67" fill="#174A69" opacity=".25" filter="url(#v-shadow)"/>
<!-- contoured floating island -->
<path d="M181 445C199 386 310 345 427 328C538 300 709 311 837 350C962 384 1052 454 1035 496C1017 541 912 582 788 606C631 646 413 624 276 572C223 548 172 505 181 445Z" fill="url(#v-earth)" stroke="#6D7D65" stroke-width="5"/>
<path d="M196 468C301 558 461 592 621 598C775 608 960 566 1020 500C1009 545 899 607 757 623C590 656 379 617 260 571Z" fill="#795D4E" opacity=".46"/>
<path d="M181 440C188 379 320 332 459 314C624 287 790 330 896 365C981 393 1053 448 1039 477C1019 523 864 563 685 574C490 583 314 543 227 503C177 478 169 464 181 440Z" fill="url(#v-grass)" stroke="#679967" stroke-width="5"/>
<path d="M210 464C285 515 436 555 603 563" fill="none" stroke="#ECFAC3" stroke-width="7" opacity=".4"/>
<path d="M798 348Q813 412 840 460C854 488 865 531 853 565L846 597Q820 619 805 626L810 576 817 515 804 457 770 361Z" fill="#3DADC7" opacity=".83"/>
<path d="M810 570Q824 552 840 554L849 585 823 630 806 633Z" fill="#C9FAED" opacity=".7"/>
<!-- winding footpaths -->
<path d="M466 363Q554 421 472 463Q408 502 525 541M652 369Q722 416 668 480Q636 508 716 537" stroke="#BCA67D" stroke-width="30" fill="none" stroke-linecap="round" opacity=".48"/>
<path d="M466 363Q554 421 472 463Q408 502 525 541M652 369Q722 416 668 480Q636 508 716 537" stroke="#FFE6AE" stroke-width="20" fill="none" stroke-linecap="round" opacity=".95"/>
<g transform="translate(270 441) scale(0.82)" filter="url(#v-dshadow)"><ellipse cx="5" cy="9" rx="29" ry="9" fill="#498D66" opacity=".3"/><path d="M-7 0L-2-58 11-58 17 0Z" fill="#8C6B51"/><circle cx="-18" cy="-54" r="25" fill="#3E9C73"/><circle cx="16" cy="-60" r="27" fill="#5CAD78"/><circle cx="0" cy="-83" r="32" fill="#76BC78"/><circle cx="-6" cy="-91" r="12" fill="#A9D68B" opacity=".6"/></g><g transform="translate(318 381) scale(0.85)" filter="url(#v-dshadow)"><ellipse cx="5" cy="9" rx="29" ry="9" fill="#498D66" opacity=".3"/><path d="M-7 0L-2-58 11-58 17 0Z" fill="#8C6B51"/><circle cx="-18" cy="-54" r="25" fill="#3E9C73"/><circle cx="16" cy="-60" r="27" fill="#5CAD78"/><circle cx="0" cy="-83" r="32" fill="#76BC78"/><circle cx="-6" cy="-91" r="12" fill="#A9D68B" opacity=".6"/></g><g transform="translate(363 492) scale(0.78)" filter="url(#v-dshadow)"><ellipse cx="5" cy="9" rx="29" ry="9" fill="#498D66" opacity=".3"/><path d="M-7 0L-2-58 11-58 17 0Z" fill="#8C6B51"/><circle cx="-18" cy="-54" r="25" fill="#3E9C73"/><circle cx="16" cy="-60" r="27" fill="#5CAD78"/><circle cx="0" cy="-83" r="32" fill="#76BC78"/><circle cx="-6" cy="-91" r="12" fill="#A9D68B" opacity=".6"/></g><g transform="translate(545 516) scale(0.71)" filter="url(#v-dshadow)"><ellipse cx="5" cy="9" rx="29" ry="9" fill="#498D66" opacity=".3"/><path d="M-7 0L-2-58 11-58 17 0Z" fill="#8C6B51"/><circle cx="-18" cy="-54" r="25" fill="#3E9C73"/><circle cx="16" cy="-60" r="27" fill="#5CAD78"/><circle cx="0" cy="-83" r="32" fill="#76BC78"/><circle cx="-6" cy="-91" r="12" fill="#A9D68B" opacity=".6"/></g><g transform="translate(637 519) scale(0.83)" filter="url(#v-dshadow)"><ellipse cx="5" cy="9" rx="29" ry="9" fill="#498D66" opacity=".3"/><path d="M-7 0L-2-58 11-58 17 0Z" fill="#8C6B51"/><circle cx="-18" cy="-54" r="25" fill="#3E9C73"/><circle cx="16" cy="-60" r="27" fill="#5CAD78"/><circle cx="0" cy="-83" r="32" fill="#76BC78"/><circle cx="-6" cy="-91" r="12" fill="#A9D68B" opacity=".6"/></g><g transform="translate(753 486) scale(0.89)" filter="url(#v-dshadow)"><ellipse cx="5" cy="9" rx="29" ry="9" fill="#498D66" opacity=".3"/><path d="M-7 0L-2-58 11-58 17 0Z" fill="#8C6B51"/><circle cx="-18" cy="-54" r="25" fill="#3E9C73"/><circle cx="16" cy="-60" r="27" fill="#5CAD78"/><circle cx="0" cy="-83" r="32" fill="#76BC78"/><circle cx="-6" cy="-91" r="12" fill="#A9D68B" opacity=".6"/></g><g transform="translate(905 446) scale(0.72)" filter="url(#v-dshadow)"><ellipse cx="5" cy="9" rx="29" ry="9" fill="#498D66" opacity=".3"/><path d="M-7 0L-2-58 11-58 17 0Z" fill="#8C6B51"/><circle cx="-18" cy="-54" r="25" fill="#3E9C73"/><circle cx="16" cy="-60" r="27" fill="#5CAD78"/><circle cx="0" cy="-83" r="32" fill="#76BC78"/><circle cx="-6" cy="-91" r="12" fill="#A9D68B" opacity=".6"/></g><g transform="translate(899 496) scale(0.65)" filter="url(#v-dshadow)"><ellipse cx="5" cy="9" rx="29" ry="9" fill="#498D66" opacity=".3"/><path d="M-7 0L-2-58 11-58 17 0Z" fill="#8C6B51"/><circle cx="-18" cy="-54" r="25" fill="#3E9C73"/><circle cx="16" cy="-60" r="27" fill="#5CAD78"/><circle cx="0" cy="-83" r="32" fill="#76BC78"/><circle cx="-6" cy="-91" r="12" fill="#A9D68B" opacity=".6"/></g><g transform="translate(733 386) scale(0.68)" filter="url(#v-dshadow)"><ellipse cx="5" cy="9" rx="29" ry="9" fill="#498D66" opacity=".3"/><path d="M-7 0L-2-58 11-58 17 0Z" fill="#8C6B51"/><circle cx="-18" cy="-54" r="25" fill="#3E9C73"/><circle cx="16" cy="-60" r="27" fill="#5CAD78"/><circle cx="0" cy="-83" r="32" fill="#76BC78"/><circle cx="-6" cy="-91" r="12" fill="#A9D68B" opacity=".6"/></g><g transform="translate(398 366) scale(0.57)" filter="url(#v-dshadow)"><ellipse cx="5" cy="9" rx="29" ry="9" fill="#498D66" opacity=".3"/><path d="M-7 0L-2-58 11-58 17 0Z" fill="#8C6B51"/><circle cx="-18" cy="-54" r="25" fill="#3E9C73"/><circle cx="16" cy="-60" r="27" fill="#5CAD78"/><circle cx="0" cy="-83" r="32" fill="#76BC78"/><circle cx="-6" cy="-91" r="12" fill="#A9D68B" opacity=".6"/></g><g transform="translate(589 344) scale(0.65)" filter="url(#v-dshadow)"><ellipse cx="5" cy="9" rx="29" ry="9" fill="#498D66" opacity=".3"/><path d="M-7 0L-2-58 11-58 17 0Z" fill="#8C6B51"/><circle cx="-18" cy="-54" r="25" fill="#3E9C73"/><circle cx="16" cy="-60" r="27" fill="#5CAD78"/><circle cx="0" cy="-83" r="32" fill="#76BC78"/><circle cx="-6" cy="-91" r="12" fill="#A9D68B" opacity=".6"/></g><g transform="translate(968 466) scale(0.6)" filter="url(#v-dshadow)"><ellipse cx="5" cy="9" rx="29" ry="9" fill="#498D66" opacity=".3"/><path d="M-7 0L-2-58 11-58 17 0Z" fill="#8C6B51"/><circle cx="-18" cy="-54" r="25" fill="#3E9C73"/><circle cx="16" cy="-60" r="27" fill="#5CAD78"/><circle cx="0" cy="-83" r="32" fill="#76BC78"/><circle cx="-6" cy="-91" r="12" fill="#A9D68B" opacity=".6"/></g><g transform="translate(293 503) scale(0.48)" filter="url(#v-dshadow)"><ellipse cx="5" cy="9" rx="29" ry="9" fill="#498D66" opacity=".3"/><path d="M-7 0L-2-58 11-58 17 0Z" fill="#8C6B51"/><circle cx="-18" cy="-54" r="25" fill="#3E9C73"/><circle cx="16" cy="-60" r="27" fill="#5CAD78"/><circle cx="0" cy="-83" r="32" fill="#76BC78"/><circle cx="-6" cy="-91" r="12" fill="#A9D68B" opacity=".6"/></g><g transform="translate(380 398)"><circle r="5" fill="#F8A8A8"/><circle cx="-7" r="4" fill="#FFF1CC"/><circle cx="7" r="4" fill="#FFE9A0"/><circle cy="-7" r="4" fill="#FFF9DD"/><circle r="3" fill="#EEBB53"/></g><g transform="translate(612 406)"><circle r="5" fill="#F8A8A8"/><circle cx="-7" r="4" fill="#FFF1CC"/><circle cx="7" r="4" fill="#FFE9A0"/><circle cy="-7" r="4" fill="#FFF9DD"/><circle r="3" fill="#EEBB53"/></g><g transform="translate(687 520)"><circle r="5" fill="#F8A8A8"/><circle cx="-7" r="4" fill="#FFF1CC"/><circle cx="7" r="4" fill="#FFE9A0"/><circle cy="-7" r="4" fill="#FFF9DD"/><circle r="3" fill="#EEBB53"/></g><g transform="translate(529 491)"><circle r="5" fill="#F8A8A8"/><circle cx="-7" r="4" fill="#FFF1CC"/><circle cx="7" r="4" fill="#FFE9A0"/><circle cy="-7" r="4" fill="#FFF9DD"/><circle r="3" fill="#EEBB53"/></g><g transform="translate(255 461)"><circle r="5" fill="#F8A8A8"/><circle cx="-7" r="4" fill="#FFF1CC"/><circle cx="7" r="4" fill="#FFE9A0"/><circle cy="-7" r="4" fill="#FFF9DD"/><circle r="3" fill="#EEBB53"/></g><g transform="translate(950 475)"><circle r="5" fill="#F8A8A8"/><circle cx="-7" r="4" fill="#FFF1CC"/><circle cx="7" r="4" fill="#FFE9A0"/><circle cy="-7" r="4" fill="#FFF9DD"/><circle r="3" fill="#EEBB53"/></g><g transform="translate(578 356)"><circle r="5" fill="#F8A8A8"/><circle cx="-7" r="4" fill="#FFF1CC"/><circle cx="7" r="4" fill="#FFE9A0"/><circle cy="-7" r="4" fill="#FFF9DD"/><circle r="3" fill="#EEBB53"/></g><g transform="translate(785 435)"><circle r="5" fill="#F8A8A8"/><circle cx="-7" r="4" fill="#FFF1CC"/><circle cx="7" r="4" fill="#FFE9A0"/><circle cy="-7" r="4" fill="#FFF9DD"/><circle r="3" fill="#EEBB53"/></g><!-- village school / castle -->
<g filter="url(#v-dshadow)"><ellipse cx="536" cy="406" rx="93" ry="24" fill="#477D59" opacity=".24"/>
<rect x="483" y="302" width="112" height="100" rx="9" fill="url(#v-walls)" stroke="#BE9975" stroke-width="4"/>
<path d="M470 311L540 261 607 311Z" fill="url(#v-roof)" stroke="#AA685B" stroke-width="5" stroke-linejoin="round"/>
<rect x="466" y="319" width="31" height="75" rx="7" fill="#F6DCB6" stroke="#BA9674" stroke-width="4"/>
<path d="M454 321L482 273 510 321Z" fill="#C96253" stroke="#9E6659" stroke-width="4"/>
<rect x="575" y="292" width="28" height="105" rx="7" fill="#F8DEB9" stroke="#BA9674" stroke-width="4"/>
<path d="M564 298L589 244 614 298Z" fill="#C56C56" stroke="#A25C4D" stroke-width="4"/>
<rect x="520" y="348" width="34" height="54" rx="17" fill="#805D59" stroke="#5D5651" stroke-width="3"/>
<circle cx="542" cy="375" r="3" fill="#F9D28F"/>
<path d="M511 327h18v22h-18ZM560 327h17v22h-17Z" fill="#7ABCC5" stroke="#E5F6F1" stroke-width="5"/>
<path d="M588 241v-26M588 216l41 8-41 17Z" fill="#FFF1AD" stroke="#865F4E" stroke-width="3"/>
<rect x="482" y="311" width="112" height="9" fill="#E9BE94" opacity=".9"/></g>
<!-- lighthouse -->
<g filter="url(#v-dshadow)"><ellipse cx="850" cy="453" rx="38" ry="13" fill="#446B56" opacity=".28"/><path d="M830 444l10-112 25 0 14 112Z" fill="#FFF2D8" stroke="#A58A75" stroke-width="4"/>
<path d="M834 389h40l4 23h-46Z" fill="#E9A27B"/><path d="M836 367h35l3 16h-39Z" fill="#D76A5B"/><rect x="839" y="319" width="30" height="22" fill="#F9E49D" stroke="#85695E" stroke-width="4"/><path d="M825 320l28-24 30 24Z" fill="#BD6B5C" stroke="#91635C" stroke-width="4"/><rect x="847" y="421" width="14" height="24" rx="6" fill="#7DA6A4"/></g>
<!-- cottages -->
<g filter="url(#v-dshadow)"><rect x="665" y="395" width="69" height="59" rx="7" fill="#F8E4BA" stroke="#AC8C73" stroke-width="3"/><path d="M655 403l43-48 47 48Z" fill="#C97767" stroke="#9D6157" stroke-width="4"/><rect x="690" y="422" width="17" height="32" rx="8" fill="#8C6960"/><rect x="717" y="418" width="11" height="12" fill="#88C9C0" stroke="#F9F5D4" stroke-width="3"/></g>
<g filter="url(#v-dshadow)"><rect x="339" y="419" width="66" height="48" rx="6" fill="#F9E7CB" stroke="#AE927B" stroke-width="3"/><path d="M327 430l46-42 43 42Z" fill="#A96D69" stroke="#8B615C" stroke-width="4"/><rect x="364" y="440" width="17" height="27" rx="7" fill="#7C615D"/><rect x="387" y="433" width="10" height="10" fill="#87BCB4" stroke="#FFF7DC" stroke-width="3"/></g>
<!-- docks and exploration ship -->
<path d="M735 566l56 36M751 555l57 38M764 545l55 38" fill="none" stroke="#8A6652" stroke-width="10" stroke-linecap="round"/>
<g filter="url(#v-dshadow)"><path d="M803 616l103-2-21 32h-66Z" fill="#9D7359" stroke="#634E48" stroke-width="4"/><path d="M852 610V541" stroke="#70594C" stroke-width="6"/><path d="M857 543l-2 61 48 4Z" fill="#FFF5D5" stroke="#CCB58C" stroke-width="3"/><path d="M847 556l-37 46 35 0Z" fill="#FFE3AA" stroke="#B39872" stroke-width="3"/><path d="M829 634h45" stroke="#F4D89F" stroke-width="4"/></g>
<!-- scattered patches -->
<g fill="#DDF4A6" opacity=".75"><ellipse cx="614" cy="367" rx="22" ry="7"/><ellipse cx="437" cy="532" rx="26" ry="8"/><ellipse cx="966" cy="458" rx="13" ry="6"/></g>
<!-- floating feathers/birds -->
<g fill="none" stroke="#5D9A99" stroke-width="4" stroke-linecap="round"><path d="M244 232q14-14 29 1 15-16 30-1"/><path d="M732 220q11-11 22 2 12-13 24-2"/><path d="M1037 275q9-10 19 1 9-10 20-1"/></g>
</svg>`;
var TV_DECORS=[['🌳','Grand chêne',0],['🌷','Jardin fleuri',150],['🏡','Maisonnette',500],['⛲','Fontaine',1000],['🎈','Fête du village',1800],['🦄','Compagnon rare',2800]];
function tvLevel(){var L=levelOf(S.xp),a=xpFor(L),b=xpFor(L+1);return {L:L,pct:Math.max(0,Math.min(100,Math.round(100*(S.xp-a)/(b-a)))),next:b-S.xp};}
function tvOwl(){return '<svg viewBox="0 0 120 136" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><ellipse cx="61" cy="120" rx="43" ry="10" fill="#345859" opacity=".22"/><path d="M22 60Q2 42 18 16L39 31Q60 18 81 31L104 13Q119 41 101 67Q109 101 77 117Q55 126 33 109Q11 94 22 60Z" fill="#B47A50" stroke="#724E42" stroke-width="3.5"/><path d="M25 67Q11 39 39 36Q58 43 60 66Q66 44 84 36Q108 45 97 70Q84 86 60 85Q36 89 25 67Z" fill="#F5DAB1"/><ellipse cx="44" cy="65" rx="17" ry="21" fill="#FEFFF4" stroke="#8D6A50" stroke-width="2"/><ellipse cx="78" cy="65" rx="17" ry="21" fill="#FEFFF4" stroke="#8D6A50" stroke-width="2"/><circle cx="48" cy="66" r="8" fill="#3C514E"/><circle cx="74" cy="66" r="8" fill="#3C514E"/><circle cx="51" cy="62" r="3" fill="white"/><circle cx="77" cy="62" r="3" fill="white"/><path d="M56 83l7 11 8-11Z" fill="#E9A04E"/><path d="M38 106q5 17 21 10m20-9q-6 15-16 10" fill="none" stroke="#D79F61" stroke-width="5"/><path d="M25 83Q2 87 11 104Q21 114 34 105" fill="#8E694B" stroke="#715142" stroke-width="3"/><path d="M92 84q21-3 22 16l-20 5" fill="#8E694B" stroke="#715142" stroke-width="3"/><path d="M39 49q-7-22-1-38 5-7 11 3M76 47q4-25-3-36" fill="none" stroke="#8E694B" stroke-width="4"/><path d="M22 38q38-49 78 0" stroke="#725444" stroke-width="8" fill="none"/><path d="M27 38q33-36 70 0" stroke="#D1B27E" stroke-width="11" fill="none"/><ellipse cx="45" cy="44" rx="19" ry="12" fill="#EFB96C" stroke="#785743" stroke-width="3"/><ellipse cx="79" cy="44" rx="19" ry="12" fill="#EFB96C" stroke="#785743" stroke-width="3"/><circle cx="45" cy="44" r="7" fill="#9AD4D6" stroke="#EAF7E9" stroke-width="3"/><circle cx="79" cy="44" r="7" fill="#9AD4D6" stroke="#EAF7E9" stroke-width="3"/><path d="M41 112h12M72 112h11" stroke="#8C6848" stroke-width="7" stroke-linecap="round"/></svg>';}
function tvHeader(){var l=tvLevel();var nick=S.name?'Salut, '+esc(S.name)+' !':'Bonjour, explorateur !';return '<header class="v2-head"><div class="v2-brand"><span class="v2-brand-mark" aria-hidden="true">🧭</span><div><h1>Géo<span class="pink">Pins</span></h1><small>TERRA VILLAGE</small></div></div><div class="v2-greeting"><strong>'+nick+'</strong><span>Un monde de découvertes t’attend 🌿</span></div><div class="v2-topstats"><div class="v2-pill" title="Série de jours"><i>🔥</i><b>'+(S.streak.last===today()||S.streak.last===yesterday()?S.streak.cur:0)+'</b></div><div class="v2-pill xpill" title="Expérience gagnée"><i>✨</i><b>'+S.xp+'</b><span>XP</span></div><button class="v2-profiletap" data-nav="me"><span class="v2-tinyavatar">'+TV.avatar+'</span>Profil</button></div></header>';}
function tvTitle(eyebrow,title,desc,action){return '<div class="v2-heading"><div><div class="v2-eyebrow">'+eyebrow+'</div><h2>'+title+'</h2><p>'+desc+'</p></div>'+(action||'')+'</div>';}
function tvScene(edition){var pins='<button class="v2-hotspot france" data-open="regions" aria-label="Explorer les régions de France"><span class="hicon">🇫🇷</span><span><b>France</b><small>13 régions</small></span></button><button class="v2-hotspot europe" data-open="ue" aria-label="Explorer l’Europe"><span class="hicon">🧭</span><span><b>Europe</b><small>27 pays</small></span></button><button class="v2-hotspot world" data-open="conts" aria-label="Explorer le monde"><span class="hicon">🌍</span><span><b>Monde</b><small>7 continents</small></span></button><button class="v2-hotspot brevet" data-nav="brevet" aria-label="Préparer le brevet"><span class="hicon">🎓</span><span><b>Brevet</b><small>Défis spéciaux</small></span></button>';
 var placed='';TV.decor.forEach(function(idx){placed+='<span class="v2-placed d'+idx+'" aria-hidden="true">'+TV_DECORS[idx][0]+'</span>';});
 return '<div class="v2-hero" id="v2Hero">'+TV_SCENE+placed+'<div class="v2-scene-head"><div class="micro">☀️ TON ÎLE D’AVENTURE</div><strong>Terra Village</strong><p>'+(edition?'Personnalise ton île avec tes découvertes !':'Chaque destination cache une nouvelle mission.')+'</p></div>'+pins+'<div class="v2-scene-bottom"><div class="v2-buddy">'+tvOwl()+'<div class="v2-bubble">'+(edition?'Choisis un décor ci-dessous pour embellir notre île !':'Bienvenue ! Je suis Plume, ton guide. Quelle région visites-tu ?')+'</div></div><button class="v2-hero-cta" data-nav="missions">'+(edition?'🧭 Voir les missions':'▶ Partir explorer')+'</button></div></div>';}
function tvHud(){var l=tvLevel(),st=S.stats,ok=S.daily.day===today(),wl=weakList();return '<aside class="v2-rightcol"><section class="v2-card"><span class="overline">✦ TON EXPLORATEUR</span><div class="v2-stat-flex"><div class="v2-level-num">'+l.L+'</div><div class="v2-level-data"><b>'+titleOf(l.L)+'</b><small>Encore '+l.next+' XP avant le niv. '+(l.L+1)+'</small><div class="v2-progress"><i style="width:'+l.pct+'%"></i></div></div></div><div class="v2-recap"><div><strong>'+st.pins+'</strong><span>REPÈRES POSÉS</span></div><div><strong>'+st.games+'</strong><span>EXPÉDITIONS</span></div></div></section><section class="v2-card v2-daily-card"><h3>☀️ Défi du jour</h3><p>'+(ok?'Bien joué ! Tu as marqué '+S.daily.score+' points. Tu peux rejouer sans limite.':'10 repères mystères à retrouver. Gagne le double d’XP lors de ta première partie !')+'</p><button class="v2-orangebtn" id="v2Daily">'+(ok?'↻ Rejouer pour le plaisir':'▶ Relever le défi')+'</button></section><section class="v2-card"><h3>✨ À découvrir</h3><div class="v2-small-links"><button class="v2-mini-link" id="v2Rev"><span>🧠</span><b>Mes révisions<br><small>'+(wl.length?wl.length+' repères à revoir':'Tout va bien !')+'</small></b></button><button class="v2-mini-link" data-nav="collection"><span>🏆</span><b>Ma collection<br><small>Badges & objets</small></b></button></div></section></aside>';}
function tvPackArt(p){var ocean=p.m==='world'?'#79C9D2':p.m==='france'?'#ECA69E':'#A2BCE3';var mountain=p.m==='world'?'#729E8F':p.m==='france'?'#BA9186':'#7798AC';return '<svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><circle cx="262" cy="36" r="32" fill="#FFF8C8" opacity=".9"/><g fill="white" opacity=".65"><ellipse cx="49" cy="35" rx="41" ry="14"/><ellipse cx="73" cy="25" rx="25" ry="19"/></g><path d="M0 98L50 45 94 85 136 25 216 105 270 63 320 101V160H0" fill="'+mountain+'" opacity=".7"/><path d="M97 74l39-49 34 49-29-18-12 8Z" fill="#FFF9E8" opacity=".75"/><path d="M0 108Q80 70 155 107T320 96V160H0" fill="'+ocean+'"/><path d="M0 127Q112 98 190 132T320 120V160H0" fill="#3FACA5" opacity=".7"/><path d="M0 142Q92 124 175 145T320 140V160H0" fill="#267C91" opacity=".4"/><ellipse cx="170" cy="128" rx="66" ry="17" fill="#A9D595"/><path d="M153 117v-23M153 95l-10 15h20ZM185 121V86M185 85l-13 20h26Z" fill="#337D65" stroke="#337D65" stroke-width="5"/><path d="M226 112l14-24 14 24Z" fill="#EED5AB"/><path d="M215 121l25-24 26 24Z" fill="#F5C48D"/><rect x="231" y="120" width="17" height="14" fill="#E7C7A2"/></svg>';}
function tvPacks(limit){var html='';var shown=0;for(var j=0;j<PACKS.length;j++){var p=PACKS[j];if(FILTER!=='Tout'&&p.lv!==FILTER)continue;if(limit&&shown>=limit)break;shown++;var value=packMastery(p.id);var scene=p.fl?'flags':p.m;html+='<button class="v2-pack" data-p="'+p.id+'"><div class="v2-pack-top" data-scene="'+scene+'">'+'<img class="v13-pack-image" loading="lazy" alt="" src="assets/missions-v13/'+(p.fl?'coast':p.m==='france'?'harbor':p.m==='world'?'archipel':'academy')+'.webp">'+'<span class="v2-pack-level">'+p.lv+'</span><span class="v2-pack-symbol">'+(p.fl?'🌟':p.e)+'</span></div><div class="v2-pack-body"><strong>'+esc(p.n)+'</strong><div class="foot"><span>'+BYPACK[p.id].length+' repères</span><span>'+Math.round(value*100)+' % maîtrisés</span><span class="arr">›</span></div><div class="v2-progress"><i style="width:'+Math.round(value*100)+'%"></i></div></div></button>';}return html;}
function tvVillage(){FILTER='Tout';return tvTitle('L’AVENTURE COMMENCE ICI','Ton petit coin de planète 🌿','Explore, apprends, collectionne… et fais grandir ton monde !','<button class="v2-subaction" data-nav="village">🏡 Décorer mon île →</button>')+'<div class="v2-grid">'+tvScene(false)+tvHud()+'</div><div class="v2-below"><section class="v2-feature-box"><div class="v2-section-title"><h3>🗺️ Tes destinations</h3><button class="v2-subaction" data-nav="missions">Toutes les missions →</button></div><div class="v2-dest-grid"><button class="v2-dest" data-open="conts"><span class="symbol">🌍</span><div><b>Explorer le monde</b><small>Continents & océans</small></div></button><button class="v2-dest" data-open="ue"><span class="symbol">🇪🇺</span><div><b>Visiter l’Europe</b><small>Pays & capitales</small></div></button><button class="v2-dest" data-open="regions"><span class="symbol">🇫🇷</span><div><b>Découvrir la France</b><small>Régions & reliefs</small></div></button></div></section><section class="v2-helper"><span class="em">🪴</span><div><strong>Une île à toi !</strong><p>En gagnant des XP, tu débloques de nouvelles décorations pour ton village.</p></div></section></div>';
}
function tvMissions(){
 var btns=['Tout','6e','5e','4e','3e','Bonus'];
 var mastered=PACKS.filter(function(p){return packMastery(p.id)>=.8;}).length;
 var h=tvTitle('CARNET DES EXPÉDITIONS','La carte des missions 🗺️','Choisis une destination et retrouve les vrais repères géographiques de GéoPins.','<button class="v2-subaction" data-nav="village">← Retour au village</button>');
 h+='<section class="v13-mission-map" aria-label="Panorama des destinations">';
 h+='<div class="v13-mission-map-copy"><span class="v13-kicker">🌿 TERRA VILLAGE · EXPLORATIONS</span><h3>Une grande aventure commence ici !</h3><p>Des régions françaises aux océans, chaque destination te rapproche du prochain défi.</p><div class="v13-map-stats"><span>🗺️ '+PACKS.length+' missions</span><span>✅ '+mastered+' maîtrisées</span><span>⭐ '+S.xp+' XP</span></div></div>';
 h+='<div class="v13-map-pins"><button type="button" data-v13-filter="6e" class="v13-pin p1">🌍 <b>Découvrir</b><small>6e</small></button><button type="button" data-v13-filter="5e" class="v13-pin p2">🧭 <b>Explorer</b><small>5e</small></button><button type="button" data-v13-filter="4e" class="v13-pin p3">🏔️ <b>Voyager</b><small>4e</small></button><button type="button" data-v13-filter="3e" class="v13-pin p4">🎓 <b>Se préparer</b><small>3e</small></button></div></section>';
 h+='<section class="v2-panel v13-mission-panel"><div class="v2-section-title"><h3>📜 Choisir une mission</h3><small>Tu peux rejouer une mission autant de fois que nécessaire.</small></div><div class="v2-tabs" aria-label="Filtrer par niveau">';
 btns.forEach(function(f){h+='<button type="button" data-f="'+f+'" class="'+(FILTER===f?'on':'')+'" aria-pressed="'+(FILTER===f)+'">'+f+'</button>';});
 h+='</div><div class="v2-packs">'+tvPacks()+'</div></section>';
 return h;
}
function tvBrevet(){
 var ids=PACKS.filter(function(p){return p.lv==='3e';}),sum=0,weight=0;
 ids.forEach(function(p){sum+=packMastery(p.id)*BYPACK[p.id].length;weight+=BYPACK[p.id].length;});
 var pct=weight?Math.round(100*sum/weight):0;
 var h=tvTitle('ACADÉMIE DE TERRA VILLAGE','L’Académie du Brevet 🎓','Entraîne-toi sur les repères géographiques et suis ta progression.','<button class="v2-subaction" data-nav="missions">🗺️ Toutes les missions</button>');
 h+='<section class="v14-academy" aria-label="Académie illustrée du brevet"><div class="v14-academy-info"><span class="v14-eyebrow">🏰 TON AVENTURE DE GÉOGRAPHIE</span><h3>Prêt pour le grand défi ?</h3><p>Explore les repères de troisième à ton rythme. Chaque essai te permet de mieux comprendre et de progresser.</p><div class="v14-mastery"><strong>Maîtrise des repères de 3e <span>'+pct+' %</span></strong><div class="v14-track" role="progressbar" aria-label="Maîtrise des repères de troisième" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><i style="width:'+pct+'%"></i></div></div><button type="button" data-run="brevet" class="v14-start">▶ Commencer l’entraînement</button></div></section>';
 h+='<div class="v14-section-heading"><div><span class="v14-eyebrow">⚔️ CHOISIS TON PARCOURS</span><h3>Les trois portes de l’Académie</h3></div><p>De vrais exercices issus des cartes de GéoPins.</p></div>';
 var cards=[
  {img:'entrainement',icon:'🎯',name:'Entraînement',tag:'15 repères · sans chrono',description:'Révise les repères de troisième, sans pression.',attr:'data-run="brevet"',action:'Commencer'},
  {img:'epreuve',icon:'🏆',name:'Grande épreuve',tag:'30 repères · sans chrono',description:'Un mélange de repères de troisième et de quatrième.',attr:'data-run="brevet_long"',action:'Relever le défi'},
  {img:'revision',icon:'🧠',name:'Mes points faibles',tag:'Révision ciblée',description:'Retrouve les lieux qui te demandent encore de l’entraînement.',attr:'data-special="review"',action:'Réviser'}
 ];
 h+='<div class="v14-challenges">';
 cards.forEach(function(c){h+='<button type="button" class="v14-challenge" '+c.attr+'><span class="v14-challenge-art" style="background-image:url(assets/brevet-v14/'+c.img+'.webp)"><span class="v14-challenge-icon">'+c.icon+'</span></span><span class="v14-challenge-body"><small>'+c.tag+'</small><strong>'+c.name+'</strong><span>'+c.description+'</span><em>'+c.action+' →</em></span></button>';});
 h+='</div>';
 h+='<section class="v14-courses"><div class="v14-section-heading"><div><span class="v14-eyebrow">🧭 PROGRESSER PAS À PAS</span><h3>Les repères de troisième</h3></div><p>Rejoue les missions pour consolider tes connaissances.</p></div><div class="v14-course-grid">';
 ids.forEach(function(p,i){var m=Math.round(packMastery(p.id)*100);h+='<button type="button" class="v14-course" data-p="'+p.id+'"><span class="v14-course-num">'+(i+1)+'</span><span class="v14-course-copy"><strong>'+esc(p.n)+'</strong><small>'+BYPACK[p.id].length+' repères · '+m+' % maîtrisés</small><span class="v14-mini-track"><i style="width:'+m+'%"></i></span></span><span class="v14-course-arrow">›</span></button>';});
 h+='</div></section><div class="v14-note">🌿 <strong>Le secret des explorateurs :</strong> chaque nouvelle tentative compte. Prends le temps de lire les explications après tes réponses.</div>';
 return h;
}
function tvDecorPage(){var html=tvTitle('UN MONDE QUI GRANDIT','Personnalise ton village 🏡','Chaque nouvelle décoration se débloque avec ton expérience.','<button class="v2-subaction" data-nav="missions">🧭 Gagner des XP</button>');html+='<div class="v2-grid">'+tvScene(true)+tvHud()+'</div><div class="v2-feature-box" style="margin-top:18px"><div class="v2-section-title"><h3>🌷 Mon jardin de découvertes</h3><small>'+TV.decor.length+' décorations installées / '+TV_DECORS.length+'</small></div><p style="color:#839789;font-size:13px;font-weight:700;margin:0">Clique sur un objet débloqué pour l’ajouter ou le retirer de l’île. Tes choix sont enregistrés sur cet appareil.</p><div class="v2-decor-grid">';TV_DECORS.forEach(function(d,i){var unlocked=S.xp>=d[2],on=TV.decor.indexOf(i)>-1;html+='<button class="v2-decor'+(!unlocked?' locked':'')+(on?' selected':'')+'" data-decor="'+i+'"><span class="ico">'+(unlocked?d[0]:'🔒')+'</span><span>'+d[1]+'</span><span class="cost">'+(unlocked?(on?'✓ Installé':'Débloqué'):'✨ '+d[2]+' XP requis')+'</span></button>';});html+='</div></div>';return html;}
function tvCollection(){var earned=BADGES.filter(function(b){return !!S.badges[b.id];}).length;var result=tvTitle('SOUVENIRS D’EXPLORATION','Ta collection de trésors 🏆','Débloque des badges et des objets en explorant le monde.','<button class="v2-subaction" data-nav="village">🏡 Mon village</button>');result+='<section class="v2-feature-box"><div class="v2-section-title"><h3>🏅 Mes badges</h3><small>'+earned+' / '+BADGES.length+' découverts</small></div><div class="v2-progress" style="margin:0 0 22px;height:13px"><i style="width:'+Math.round(100*earned/BADGES.length)+'%"></i></div><div class="v2-badge-grid">';BADGES.forEach(function(b){var got=!!S.badges[b.id];result+='<div class="v2-badge'+(got?'':' off')+'" title="'+esc(b.d||'')+'"><div class="icon">'+b.e+'</div><b>'+esc(b.n)+'</b><span>'+(got?'Débloqué ✓':'À découvrir')+'</span></div>';});result+='</div></section>';return result;}
function tvProfile(){var L=tvLevel(),stat=S.stats;var h=tvTitle('TON CARNET DE VOYAGE','Mon profil d’explorateur '+TV.avatar,'Choisis ton compagnon de voyage et retrouve tes progrès.','<button class="v2-subaction" data-nav="collection">🏆 Mes badges</button>');h+='<div class="v2-profile-grid"><section class="v2-feature-box"><h3 style="font:600 23px var(--disp);margin:0 0 17px">👋 Qui es-tu ?</h3><label class="v2-input-label" for="nameIn">Mon pseudo</label><input class="v2-name" id="nameIn" maxlength="20" placeholder="Ton prénom ou un pseudo" value="'+esc(S.name)+'"><p style="font-size:12px;color:#85998D;font-weight:700">Ton pseudo et ta progression restent sur cet appareil.</p><label class="v2-input-label" style="margin-top:25px">Mon avatar</label><div class="v2-av-grid">';['🧑🏻‍🚀','🦊','🐼','🐸','🦉'].forEach(function(em){h+='<button class="v2-av'+(TV.avatar===em?' on':'')+'" data-avatar="'+em+'" aria-label="Choisir avatar '+em+'" aria-pressed="'+(TV.avatar===em?'true':'false')+'">'+em+'</button>';});h+='</div></section><section class="v2-feature-box"><h3 style="font:600 23px var(--disp);margin:0 0 17px">📊 Mon carnet de bord</h3><div class="v2-statgrid"><div><b>'+L.L+'</b><span>MON NIVEAU</span></div><div><b>'+stat.games+'</b><span>MISSIONS</span></div><div><b>'+stat.pins+'</b><span>REPÈRES</span></div><div><b>'+stat.perfects+'</b><span>PARFAITS</span></div><div><b>'+stat.bestCombo+'</b><span>COMBO MAX</span></div><div><b>'+stat.eclairBest+'</b><span>RECORD ÉCLAIR</span></div></div><p style="font-size:13px;font-weight:800;color:#709382;margin:20px 0 5px">'+S.xp+' XP · '+L.next+' XP jusqu’au prochain niveau</p><div class="v2-progress"><i style="width:'+L.pct+'%"></i></div></section><section class="v2-feature-box"><h3 style="font:600 23px var(--disp);margin:0 0 12px">⚙️ Mes préférences</h3>'+tg('sound','🔊 Effets sonores')+tg('vib','📳 Vibrations')+tg('dys','🔤 Police de lecture Lexend')+'<button class="v2-danger" id="bReset">🧹 Effacer ma progression</button></section><section class="v2-feature-box"><h3 style="font:600 23px var(--disp);margin:0 0 12px">🌿 Ton village évolue</h3><p style="font-size:14px;color:#82998D;line-height:1.7;font-weight:700">Tes XP débloquent de nouveaux objets pour ton île. Les décorations sont uniquement visuelles : aucune boutique, aucun achat et aucun compte nécessaire.</p><div class="v2-recap"><div><strong>'+TV.decor.length+'</strong><span>OBJETS PLACÉS</span></div><div><strong>'+S.streak.best+'</strong><span>MEILLEURE SÉRIE</span></div></div><button class="v2-subaction" style="margin-top:20px" data-nav="village">🏡 Revoir mon village →</button></section></div>';return h;}
function tvRenderEvents(root){var nav=root.querySelectorAll('[data-nav]');for(var i=0;i<nav.length;i++)nav[i].onclick=function(){showTab(this.getAttribute('data-nav'));};var packs=root.querySelectorAll('[data-p], [data-open]');for(i=0;i<packs.length;i++)packs[i].onclick=function(){openPack(this.getAttribute('data-p')||this.getAttribute('data-open'));};var fs=root.querySelectorAll('[data-f]');for(i=0;i<fs.length;i++)fs[i].onclick=function(){FILTER=this.getAttribute('data-f');renderHome();};var daily=$('v2Daily');if(daily)daily.onclick=function(){startGame('daily');};var review=$('v2Rev');if(review)review.onclick=function(){if(weakList().length){startGame('review');}else{toast('🧠','Aucun repère à revoir pour le moment. Commence une mission !');}};var run=root.querySelectorAll('[data-run]');for(i=0;i<run.length;i++)run[i].onclick=function(){startGame(this.getAttribute('data-run'));};var r=root.querySelectorAll('[data-special]');for(i=0;i<r.length;i++)r[i].onclick=function(){if(weakList().length){startGame('review');}else{toast('🌱','Ton carnet est vide. Fais une mission pour commencer !');}};var ds=root.querySelectorAll('[data-decor]');for(i=0;i<ds.length;i++)ds[i].onclick=function(){var j=+this.getAttribute('data-decor'),d=TV_DECORS[j];if(S.xp<d[2]){toast('🔒','Encore '+(d[2]-S.xp)+' XP pour débloquer '+d[1]+' !');return;}var ix=TV.decor.indexOf(j);if(ix<0)TV.decor.push(j);else TV.decor.splice(ix,1);tvSave();sfx('tap');renderHome();};}
// V13: interactive waypoints use the same existing pack-filter handler.
(function(){var orig=tvRenderEvents;tvRenderEvents=function(root){orig(root);root.querySelectorAll('[data-v13-filter]').forEach(function(btn){btn.addEventListener('click',function(){var f=this.getAttribute('data-v13-filter');var existing=root.querySelector('[data-f="'+f+'"]');if(existing)existing.click();});});};})();
renderHome=function(){var root=$('home');var html=tvHeader();if(TAB==='missions')html+=tvMissions();else if(TAB==='brevet')html+=tvBrevet();else if(TAB==='collection')html+=tvCollection();else if(TAB==='village-edit')html+=tvDecorPage();else html+=tvVillage();root.innerHTML='<div class="v2-wrap">'+html+'</div>';tvRenderEvents(root);};
renderProfile=function(){var root=$('profile');root.innerHTML='<div class="v2-wrap">'+tvHeader()+tvProfile()+'</div>';tvRenderEvents(root);$('nameIn').oninput=function(){S.name=this.value.replace(/^\s+/,'');save();};var opts=root.querySelectorAll('.sw');for(var a=0;a<opts.length;a++)opts[a].onclick=function(){var k=this.getAttribute('data-k');S.settings[k]=!S.settings[k];save();applySettings();renderProfile();};var avs=root.querySelectorAll('[data-avatar]');for(a=0;a<avs.length;a++)avs[a].onclick=function(){TV.avatar=this.getAttribute('data-avatar');tvSave();renderProfile();sfx('tap');};$('bReset').onclick=function(){modal('Repartir de zéro ?','Les scores, XP et badges de cet appareil seront effacés, ainsi que les décorations placées.','Effacer','Annuler',function(){var keep=S.settings;S=defState();S.settings=keep;TV.decor=[];tvSave();save();renderProfile();toast('🧽','Progression remise à zéro.');});};};
showTab=function(t){if(t==='play')t='village';if(t==='village-edit')t='village';TAB=t;$('home').className='screen'+(t==='me'?' hidden':'');$('profile').className='screen'+(t==='me'?'':' hidden');var btns=$('nav').querySelectorAll('button');for(var z=0;z<btns.length;z++)btns[z].className=btns[z].getAttribute('data-t')===t?'on':'';if(t==='me')renderProfile();else if(t==='village'){renderHome();}else renderHome();window.scrollTo(0,0);};
// Village editor button: village opens the editor when pressed on the village screen.
var tvEventsOriginal=tvRenderEvents;
tvRenderEvents=function(root){tvEventsOriginal(root);var edit=root.querySelector('.v2-heading button[data-nav="village"]');if(edit&&TAB==='village'){edit.onclick=function(){TAB='village-edit';renderHome();window.scrollTo(0,0);};}if(TAB==='village-edit'){var nav=$('nav').querySelectorAll('button');for(var n=0;n<nav.length;n++)nav[n].className=nav[n].getAttribute('data-t')==='village'?'on':'';}};
/* ===== END TERRA VILLAGE EXPANSION ===== */

/* GÉOPINS — TERRA VILLAGE V3 / living island, exploration companions
   Extension of V2, preserving the existing geographic engine and storage. */
var V3_KEY='brot2you-geopins-terra-v3';
var V3={buddy:'plume',sky:'day',places:{}};
var V3_PICK=null;
var V3_BUDDIES=[
 {id:'plume',name:'Plume',kind:'La chouette des cartes',xp:0,tag:'La boussole du groupe',color:'#F3D2A0',line:'« Chaque erreur est une nouvelle découverte ! »'},
 {id:'kiko',name:'Kiko',kind:'Le panda roux cartographe',xp:100,tag:'L’ami des sentiers',color:'#FFCEAF',line:'« Il y a toujours un nouveau chemin à explorer ! »'},
 {id:'nori',name:'Nori',kind:'Le petit dinosaure aventurier',xp:300,tag:'Le navigateur',color:'#BFE9DB',line:'« Prends ton temps, et regarde bien la carte. »'},
 {id:'siro',name:'Siro',kind:'Le renard éclaireur',xp:650,tag:'Le chercheur d’oasis',color:'#FFE5B6',line:'« Le monde est immense : on avance repère après repère ! »'},
 {id:'luma',name:'Luma',kind:'Le lapin inventeur',xp:1200,tag:'Le guide des constellations',color:'#E2D6FF',line:'« Les progrès brillent, même quand ils sont petits. »'},
 {id:'sora',name:'Sora',kind:'Le pingouin observateur',xp:2100,tag:'Le gardien des sommets',color:'#C8E6FB',line:'« Une aventure se construit à chaque mission ! »'}
];
var V3_DECORS=[
 {name:'Grand chêne',xp:0,icon:'tree'},
 {name:'Jardin de fleurs',xp:0,icon:'flowers'},
 {name:'Champignon mignon',xp:0,icon:'mushroom'},
 {name:'Fontaine',xp:150,icon:'fountain'},
 {name:'Guirlande de fête',xp:320,icon:'bunting'},
 {name:'Tente des explorateurs',xp:550,icon:'tent'},
 {name:'Petit observatoire',xp:800,icon:'observatory'},
 {name:'Grande longue-vue',xp:1200,icon:'telescope'},
 {name:'Moulin fleuri',xp:1650,icon:'windmill'},
 {name:'Passerelle',xp:2200,icon:'bridge'},
 {name:'Arc-en-ciel',xp:2900,icon:'rainbow'},
 {name:'Montgolfière',xp:3700,icon:'balloon'}
];
// Hand-selected decorative positions on the illustrated island.
var V3_SITES=[[19,55],[27,65],[39,60],[50,57],[62,59],[73,57],[85,65],[24,44],[46,71],[59,45],[79,72],[91,54]];
try{
 var vv=JSON.parse(localStorage.getItem(V3_KEY)||'null');
 if(vv&&typeof vv==='object'){
  if(V3_BUDDIES.some(function(x){return x.id===vv.buddy;}))V3.buddy=vv.buddy;
  if(['day','sunset','night'].indexOf(vv.sky)>-1)V3.sky=vv.sky;
  if(vv.places&&typeof vv.places==='object')Object.keys(vv.places).forEach(function(k){var i=+k,n=+vv.places[k];if(Number.isInteger(i)&&i>=0&&i<12&&Number.isInteger(n)&&n>=0&&n<12)V3.places[k]=n;});
 }else if(TV.decor&&TV.decor.length){
  TV.decor.forEach(function(n,i){if(i<12&&Number.isInteger(n)&&n>=0&&n<6)V3.places[String(i)]=n;});
 }
}catch(v3e){}
function v3Save(){try{localStorage.setItem(V3_KEY,JSON.stringify(V3));}catch(e){}}
function v3Buddy(){return V3_BUDDIES.filter(function(c){return c.id===V3.buddy;})[0]||V3_BUDDIES[0];}
function v3SvgWrap(id,shapes){
 return '<svg class="v3-sprite" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 158" role="img" aria-label="'+esc(V3_BUDDIES.filter(function(x){return x.id===id;})[0].name)+'">'+
 '<defs><linearGradient id="v3-'+id+'-a" x2=".8" y2="1"><stop stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>'+
 '<ellipse cx="72" cy="146" rx="43" ry="8" fill="#204D56" opacity=".14"/>'+shapes+'</svg>';
}
function v3Face(x1,x2,y,r){return '<g fill="#243F47"><ellipse cx="'+x1+'" cy="'+y+'" rx="'+r+'" ry="'+(r+2)+'"/><ellipse cx="'+x2+'" cy="'+y+'" rx="'+r+'" ry="'+(r+2)+'"/></g><g fill="white"><circle cx="'+(x1-2)+'" cy="'+(y-3)+'" r="3"/><circle cx="'+(x2-2)+'" cy="'+(y-3)+'" r="3"/></g><g fill="#F8A7A7" opacity=".65"><ellipse cx="'+(x1-15)+'" cy="'+(y+14)+'" rx="7" ry="4"/><ellipse cx="'+(x2+15)+'" cy="'+(y+14)+'" rx="7" ry="4"/></g>'};
function v3Sprite(id){
 if(id==='plume')return tvOwl().replace('<svg viewBox=', '<svg class="v3-sprite" viewBox=');
 if(id==='kiko')return v3SvgWrap(id,
 '<path d="M29 110Q4 104 19 80Q27 67 42 74L57 105" fill="#E7835D" stroke="#9D6252" stroke-width="4"/>'+
 '<path d="M26 48 25 13 56 34M90 35l28-25-2 52" fill="#E98B63" stroke="#9D6252" stroke-width="4"/><path d="m35 25 0 19 14-12M98 33l14-11-2 28" fill="#F4C0A4"/>'+
 '<ellipse cx="72" cy="105" rx="40" ry="36" fill="#E98B63" stroke="#9D6252" stroke-width="4"/><path d="M52 95Q73 119 94 95L91 132Q73 146 55 131" fill="#FFF2D6"/>'+
 '<path d="M28 73Q24 35 65 29Q107 21 118 68Q124 104 83 111H61Q24 110 28 73Z" fill="#F29A73" stroke="#9D6252" stroke-width="4"/>'+
 '<path d="M36 78q-5 30 37 31Q110 106 112 75Q99 80 87 89Q70 97 55 88Z" fill="#FFF5DB"/>'+v3Face(55,88,68,7)+
 '<path d="m67 91 6 6 7-6Z" fill="#83554F"/><path d="M72 99q-6 7-12 1m12-1q6 7 12 1" fill="none" stroke="#885850" stroke-width="3" stroke-linecap="round"/>'+
 '<path d="M48 124q-8 17 4 18m42-18q9 17-3 18" stroke="#BE7357" stroke-width="10" stroke-linecap="round"/><path d="M38 115Q72 134 104 116" fill="none" stroke="#79BFAA" stroke-width="8"/><circle cx="72" cy="124" r="5" fill="#F5D27A"/>');
 if(id==='nori')return v3SvgWrap(id,
 '<path d="M34 95Q4 84 13 108Q22 127 42 115M109 95q27-7 24 17-2 13-24 2" fill="#79C6AC" stroke="#5B998D" stroke-width="4"/>'+
 '<ellipse cx="72" cy="105" rx="43" ry="36" fill="#6FB7A4" stroke="#4E938A" stroke-width="4"/><ellipse cx="72" cy="100" rx="36" ry="28" fill="#408D91"/>'+
 '<path d="M72 73 52 89l9 19h22l9-19Z" fill="#7BD2BB"/><path d="m52 89-10 7 15 22 5-10m30-19 10 7-15 22-4-10" stroke="#A3E3C7" stroke-width="3" fill="none"/>'+
 '<path d="M27 71Q28 27 72 27Q116 26 119 71Q122 99 73 109Q22 104 27 71Z" fill="#94DDC1" stroke="#589E91" stroke-width="4"/>'+
 '<path d="M49 55q23-23 46 0" fill="none" stroke="#DAF1CE" stroke-width="7"/>'+v3Face(53,91,72,7)+'<path d="M71 85q4 6 9 0" stroke="#517E73" stroke-width="3" stroke-linecap="round" fill="none"/>'+
 '<path d="M36 45Q72 11 108 45" fill="none" stroke="#8A6A54" stroke-width="11"/><path d="M43 42Q72 20 102 42" fill="none" stroke="#F6D893" stroke-width="13"/>'+
 '<circle cx="71" cy="35" r="10" fill="#FFF8DF" stroke="#96794A" stroke-width="2"/><path d="m71 28 3 9-6 2Z" fill="#D77F6B"/>'+
 '<ellipse cx="48" cy="141" rx="13" ry="8" fill="#69B29E"/><ellipse cx="95" cy="141" rx="13" ry="8" fill="#69B29E"/>');
 if(id==='siro')return v3SvgWrap(id,
 '<path d="M21 69 11 4 58 46M86 42 131 4 122 73" fill="#F5C889" stroke="#AE906A" stroke-width="4"/><path d="M24 25 27 60 49 47M116 25l-3 37-19-16" fill="#EAA5A6"/>'+
 '<ellipse cx="73" cy="114" rx="40" ry="31" fill="#F3D6A0" stroke="#AE906A" stroke-width="4"/><path d="M29 78Q24 35 69 33Q121 27 121 79Q121 111 76 119Q26 115 29 78Z" fill="#F9DCA6" stroke="#AE906A" stroke-width="4"/>'+
 '<path d="M38 93Q43 107 73 109Q102 109 114 93Q88 84 73 94Q54 85 38 93Z" fill="#FFF8E4"/>'+v3Face(55,89,78,7)+'<path d="m68 99 6 6 6-6Z" fill="#94725E"/><path d="M72 109q-5 4-10 0m10 0q5 4 10 0" fill="none" stroke="#94725E" stroke-width="3"/>'+
 '<path d="M33 126q39 16 80-1" fill="none" stroke="#DE9D6C" stroke-width="12"/><rect x="62" y="122" width="20" height="17" rx="5" fill="#7EBAAC" stroke="#6B9D90" stroke-width="3"/>'+
 '<path d="M51 137q-9 11 1 12m40-12q9 11-1 12" stroke="#CBA878" stroke-width="8" stroke-linecap="round"/>');
 if(id==='luma')return v3SvgWrap(id,
 '<path d="M48 51Q23 29 31 12m17 34Q38 20 18 24m76 28q26-20 17-40m-18 33q14-23 31-21" fill="none" stroke="#B69B9D" stroke-width="7" stroke-linecap="round"/>'+
 '<path d="M31 55 23 38 51 48M89 49l28-12-6 34" fill="#BCA8D9" stroke="#8F83AE" stroke-width="4"/>'+
 '<ellipse cx="71" cy="109" rx="40" ry="32" fill="#BCA8D9" stroke="#8F83AE" stroke-width="4"/>'+
 '<path d="M24 75Q23 33 72 32Q120 33 119 75Q121 114 70 118Q25 115 24 75Z" fill="#D7C8EC" stroke="#8F83AE" stroke-width="4"/>'+
 '<path d="M38 94Q72 127 106 94L95 111Q71 129 47 111Z" fill="#FDF6E8"/>'+v3Face(53,91,76,8)+'<path d="m67 99 6 6 7-6Z" fill="#967E96"/>'+
 '<path d="M66 47l7-12 7 12-7 9Z" fill="#FFEEA5" stroke="#E7BD7C" stroke-width="2"/>'+
 '<path d="M44 130q-8 15 2 17m51-17q8 15-2 17" stroke="#A998C3" stroke-width="8" stroke-linecap="round"/>'+
 '<path d="m14 97 4 7 8 2-8 3-4 8-3-8-8-3 8-2Zm112-17 3 8 8 1-8 4-3 7-3-7-8-4 8-1Z" fill="#F6D587"/>');
 if(id==='sora')return v3SvgWrap(id,
 '<path d="M30 93Q0 62 12 46Q25 57 49 74M111 93q31-23 26-47-19 17-41 29" fill="#83C1D0" stroke="#6396AB" stroke-width="4"/>'+
 '<path d="M36 41 26 23 52 31M92 31l27-8-10 26" fill="#8DD3DB" stroke="#6396AB" stroke-width="4"/>'+
 '<path d="M44 32 48 13 62 30 76 10 89 31 98 18l12 23" fill="#EFD5AD" stroke="#6396AB" stroke-width="3"/>'+
 '<ellipse cx="72" cy="108" rx="43" ry="34" fill="#76B7D1" stroke="#6396AB" stroke-width="4"/><path d="M55 104q16-8 33 0l-6 37H63Z" fill="#D5F2ED"/>'+
 '<path d="M26 74Q25 33 72 29Q119 30 119 74Q121 111 75 116Q25 111 26 74Z" fill="#8DD3DB" stroke="#6396AB" stroke-width="4"/>'+
 '<path d="M47 98q24 22 49 0" fill="none" stroke="#DAF7F2" stroke-width="15" stroke-linecap="round"/>'+v3Face(51,92,76,8)+'<path d="m65 97 8 7 8-7Z" fill="#5C97A7"/>'+
 '<path d="M48 139q-7 12 4 13m42-13q8 13-5 13" stroke="#72B4CA" stroke-width="8" stroke-linecap="round"/>'+
 '<circle cx="71" cy="129" r="8" fill="#F6D891"/><path d="m69 124 7 5-7 6" stroke="#AD8E60" fill="none" stroke-width="2"/>');
 return tvOwl();
}
function v3Art(n){
 var art=[
  '<ellipse cx="48" cy="84" rx="37" ry="7" fill="#2E7257" opacity=".22"/><path d="M43 79 45 24h8l3 55Z" fill="#9B745A"/><circle cx="36" cy="37" r="22" fill="#55A579"/><circle cx="65" cy="39" r="24" fill="#65BE88"/><circle cx="50" cy="20" r="26" fill="#8AD09A"/><circle cx="42" cy="12" r="9" fill="#C4EAA7" opacity=".55"/>',
  '<ellipse cx="50" cy="83" rx="42" ry="7" fill="#427F60" opacity=".19"/><rect x="12" y="58" width="76" height="19" rx="7" fill="#B88569"/><path d="M18 59H82" stroke="#F6DCC4" stroke-width="4"/><g fill="#83C897"><path d="M27 61V38M46 61V35M65 61V39M78 61V45" stroke="#4B9D72" stroke-width="4"/></g><g fill="#F8A5A8"><circle cx="26" cy="36" r="9"/><circle cx="45" cy="34" r="9"/></g><g fill="#F7CD6A"><circle cx="65" cy="37" r="10"/><circle cx="80" cy="44" r="8"/></g>',
  '<ellipse cx="50" cy="84" rx="40" ry="8" fill="#46735B" opacity=".2"/><path d="M29 47Q27 16 52 16Q79 16 80 47Z" fill="#F4B36A" stroke="#C78468" stroke-width="4"/><circle cx="39" cy="37" r="5" fill="#FFF2DC"/><circle cx="60" cy="37" r="5" fill="#FFF2DC"/><path d="m27 43 23-10 30 10" fill="none" stroke="#FFF1C7" stroke-width="6"/><path d="M28 45h50v34H28Z" fill="#FFF0D1" stroke="#B38C70" stroke-width="4"/><rect x="45" y="54" width="16" height="25" rx="8" fill="#9C716A"/>',
  '<ellipse cx="50" cy="84" rx="37" ry="7" fill="#4C7466" opacity=".2"/><path d="M24 71Q23 51 50 45Q75 51 76 71Z" fill="#7AB4CC" stroke="#548CA4" stroke-width="4"/><path d="M14 57h72v12H14Z" fill="#F5E9D5" stroke="#C8B9A1" stroke-width="4"/><path d="M27 56q-11-12 0-19h46q11 8 0 19" fill="#9ECFDB" stroke="#6C9FB6" stroke-width="4"/><path d="M49 37V22" stroke="#6C9FB6" stroke-width="7"/><circle cx="49" cy="18" r="10" fill="#F8D6A6"/><path d="M19 70q30 16 62 0" stroke="#D1F3FF" stroke-width="5" fill="none"/>',
  '<ellipse cx="50" cy="84" rx="40" ry="7" fill="#396E5A" opacity=".19"/><path d="M16 36q16-18 34 0t34 0" fill="none" stroke="#BE9872" stroke-width="5"/><path d="M19 38h12v22H19Zm17 0h12v22H36Zm17 0h12v22H53Zm17 0h12v22H70Z" fill="#F5B88A"/><path d="m18 38 6 13 6-13m6 0 6 13 6-13m6 0 6 13 6-13m6 0 6 13 6-13" fill="#F8DB8A"/>',
  '<ellipse cx="50" cy="84" rx="42" ry="7" fill="#46735B" opacity=".21"/><path d="M16 72 50 22l34 50Z" fill="#ECA27D" stroke="#B87D65" stroke-width="4"/><path d="m50 22 0 50H16Z" fill="#F9DDA7"/><path d="M44 57h13v16H44Z" fill="#7BA7A0"/><path d="M14 74h73" stroke="#8B796A" stroke-width="6" stroke-linecap="round"/>',
  '<ellipse cx="50" cy="84" rx="39" ry="7" fill="#477B65" opacity=".21"/><rect x="20" y="46" width="60" height="34" rx="5" fill="#F5DDAE" stroke="#AE9370" stroke-width="4"/><path d="M14 48 50 18l36 30Z" fill="#B77F74" stroke="#956C66" stroke-width="4"/><rect x="43" y="55" width="16" height="25" rx="6" fill="#8C776E"/><path d="M29 48h13v13H29Zm31 0h11v13H60Z" fill="#8DCDCC"/><circle cx="50" cy="27" r="5" fill="#FFEDB9"/>',
  '<ellipse cx="50" cy="84" rx="41" ry="7" fill="#477B65" opacity=".19"/><path d="m31 79 17-31 12 31" stroke="#8B7865" stroke-width="7" fill="none"/><rect x="37" y="39" width="40" height="17" rx="6" transform="rotate(-20 37 39)" fill="#8BC0CA" stroke="#558B9F" stroke-width="4"/><circle cx="73" cy="39" r="10" fill="#F8E5B1" stroke="#7A8D86" stroke-width="4"/><path d="m27 71-10 12M60 71l13 13" stroke="#8B7865" stroke-width="5"/>',
  '<ellipse cx="50" cy="84" rx="40" ry="7" fill="#477B65" opacity=".18"/><path d="M42 78V22h16v56Z" fill="#F5E4C1" stroke="#BCA17E" stroke-width="4"/><path d="M49 22 29 13l-8 18 28-9 8-20 17 6-17 14 27 6 5 15-32-21-8 31-16 10Z" fill="#F9D9A0" stroke="#CFA979" stroke-width="3"/><path d="M35 80h30" stroke="#8F765F" stroke-width="6" stroke-linecap="round"/>',
  '<ellipse cx="50" cy="84" rx="44" ry="7" fill="#477B65" opacity=".2"/><path d="M10 67q40-33 80 0" fill="none" stroke="#9D7859" stroke-width="17" stroke-linecap="round"/><path d="M10 67q40-33 80 0" fill="none" stroke="#E8C590" stroke-width="11" stroke-linecap="round" stroke-dasharray="8 6"/><path d="M14 67V81m73-14v14" stroke="#845F50" stroke-width="7"/>',
  '<path d="M15 70Q50 0 85 70" fill="none" stroke="#EA9AA2" stroke-width="13"/><path d="M20 70Q50 13 80 70" fill="none" stroke="#F8D88E" stroke-width="11"/><path d="M27 70Q50 26 73 70" fill="none" stroke="#96D1AB" stroke-width="10"/><path d="M36 70Q50 42 64 70" fill="none" stroke="#9FCBD3" stroke-width="9"/><ellipse cx="28" cy="78" rx="15" ry="9" fill="#FFF8ED"/><ellipse cx="73" cy="79" rx="15" ry="9" fill="#FFF8ED"/>',
  '<path d="M48 67V27" stroke="#947D64" stroke-width="5"/><path d="M24 30Q17 9 37 9Q50 0 63 9Q84 10 77 31L66 51H34Z" fill="#F1A77D" stroke="#B67D68" stroke-width="4"/><path d="M28 26h46M49 9v42" fill="none" stroke="#FFF0D2" stroke-width="5"/><path d="m34 51 15 25 16-25" fill="#FFF0D6" stroke="#BBA182" stroke-width="3"/><ellipse cx="50" cy="79" rx="11" ry="5" fill="#E8D5AE"/>'
 ];
 return '<img class="v3-object-svg v10-object-image" src="assets/decorations/object-'+n+'.webp" alt="" loading="lazy" decoding="async">';
}
function v3Places(edit){var h='<div class="v3-object-layer">';
 V3_SITES.forEach(function(pt,i){var n=Object.prototype.hasOwnProperty.call(V3.places,String(i))?V3.places[i]:null;
  if(edit){h+='<button type="button" class="v3-site'+(n===null?' empty':'')+'" data-v3-slot="'+i+'" style="left:'+pt[0]+'%;top:'+pt[1]+'%" aria-label="'+(n===null?'Emplacement vide '+(i+1):V3_DECORS[n].name+' : déplacer ou retirer')+'">'+(n===null?'<span class="v3-site-plus">+</span>':v3Art(n))+'</button>';}
  else if(n!==null){h+='<span class="v3-placed-object" aria-hidden="true" style="left:'+pt[0]+'%;top:'+pt[1]+'%">'+v3Art(n)+'</span>';}
 });return h+'</div>';}
var v3OldScene=tvScene;
tvScene=function(edit){
 var c=v3Buddy();var sky={day:['☀️','Journée'],sunset:['🌅','Coucher du soleil'],night:['🌙','Nuit étoilée']}[V3.sky];
 var original=v3OldScene(edit);
 original=original.replace('class="v2-hero" id="v2Hero"','class="v2-hero v3-living v3-'+V3.sky+(edit?' v3-building':'')+'" id="v2Hero"');
 original=original.replace(/<span class="v2-placed d\d"[^>]*>[^<]*<\/span>/g,'');
 original=original.replace('class="v2-scene-head"','class="v2-scene-head"');
 original=original.replace('<div class="v2-scene-bottom">',
  v3Places(edit)+'<div class="v3-sky-dust" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>'+
  '<button class="v3-time" type="button" data-v3-sky aria-label="Changer la lumière de l’île : '+sky[1]+'">'+sky[0]+' <span>'+sky[1]+'</span> ↻</button>'+
  (edit?'<div class="v3-build-help">'+(V3_PICK===null?'1. Choisis un objet ci-dessous, puis touche un emplacement.':'2. Touche un cercle sur ton île pour installer l’objet !')+'</div>':'')+
  '<div class="v2-scene-bottom">');
 original=original.replace(tvOwl(),v3Sprite(c.id));
 original=original.replace(/Bienvenue ! Je suis Plume, ton guide\. Quelle région visites-tu \?/,'<b>'+c.name+'</b> · '+c.line);
 original=original.replace('Choisis un décor ci-dessous pour embellir notre île !','Construisons notre île ! Choisis un objet et touche un emplacement.');
 original=original.replace('☀️ TON ÎLE D’AVENTURE','✦ TON MONDE À EXPLORER');
 return original;
};
function v3Card(c){var unlock=S.xp>=c.xp,active=V3.buddy===c.id;return '<button class="v3-creature'+(unlock?'':' v3-locked')+(active?' v3-active':'')+'" '+(unlock?'data-v3-buddy="'+c.id+'"':'disabled')+' aria-pressed="'+active+'"><div class="v3-creature-art" style="--creature-tint:'+c.color+'">'+v3Sprite(c.id)+'</div><div class="v3-creature-info"><span class="v3-creature-tag">'+(active?'✓ TON COMPAGNON':unlock?'COMPAGNON DÉBLOQUÉ':'🔒 '+c.xp+' XP')+'</span><strong>'+c.name+'</strong><small>'+c.kind+'</small><p>'+c.tag+'</p><span class="v3-creature-action">'+(active?'À tes côtés':unlock?'Choisir ce compagnon →':'Encore '+(c.xp-S.xp)+' XP')+'</span></div></button>';}
var v3OldCollection=tvCollection;
tvCollection=function(){
 var head=tvTitle('MON CARNET DE COMPAGNONS','Rencontre les amis de Terra Village 🐾','Six petites créatures originales à découvrir en progressant dans les missions.','<button class="v2-subaction" data-nav="village">🏡 Retour au village</button>');
 var count=V3_BUDDIES.filter(function(x){return S.xp>=x.xp;}).length;
 head+='<section class="v3-compendium"><div class="v2-section-title"><h3>✨ Les compagnons de l’explorateur</h3><small>'+count+' / 6 rencontrés</small></div><p class="v3-collection-note">Clique sur un compagnon débloqué pour qu’il t’accompagne sur l’île et t’encourage après tes expéditions. Tous s’obtiennent en jouant.</p><div class="v3-creature-grid">'+V3_BUDDIES.map(v3Card).join('')+'</div></section>';
 var earned=BADGES.filter(function(b){return !!S.badges[b.id];}).length;
 head+='<section class="v2-feature-box v3-badges"><div class="v2-section-title"><h3>🏅 Mes badges de voyage</h3><small>'+earned+' / '+BADGES.length+' découverts</small></div><div class="v2-progress" style="margin:0 0 22px;height:13px"><i style="width:'+Math.round(100*earned/BADGES.length)+'%"></i></div><div class="v2-badge-grid">';
 BADGES.forEach(function(b){var got=!!S.badges[b.id];head+='<div class="v2-badge'+(got?'':' off')+'" title="'+esc(b.d||'')+'"><div class="icon">'+b.e+'</div><b>'+esc(b.n)+'</b><span>'+(got?'Débloqué ✓':'À découvrir')+'</span></div>';});
 return head+'</div></section>';
};
function v3CountPlaced(){return Object.keys(V3.places).length;}
tvDecorPage=function(){
 var h=tvTitle('ATELIER DE DÉCORATION','Construis ton île, à ta façon 🏡','Choisis tes objets, puis place-les sur les emplacements du paysage.','<button class="v2-subaction" data-v3-finish>✓ Terminer la déco</button>');
 h+='<div class="v2-grid">'+tvScene(true)+tvHud()+'</div>';
 h+='<section class="v3-workshop"><div class="v2-section-title"><h3>🎨 L’atelier de construction</h3><small>'+v3CountPlaced()+' / 12 emplacements occupés</small></div><p class="v3-workshop-desc">1. Sélectionne une décoration débloquée. &nbsp; 2. Touche un cercle sur l’île pour l’installer ou la déplacer. &nbsp; 3. Sans objet sélectionné, touche un décor pour le retirer.</p><div class="v3-object-grid">';
 V3_DECORS.forEach(function(d,i){var locked=S.xp<d.xp,installed=Object.keys(V3.places).some(function(k){return V3.places[k]===i;});
  h+='<button type="button" class="v3-object-card'+(locked?' v3-locked':'')+(V3_PICK===i?' v3-picked':'')+'" data-v3-select="'+i+'" '+(locked?'disabled':'')+' aria-pressed="'+(V3_PICK===i)+'"><span class="v3-object-pic">'+v3Art(i)+'</span><b>'+d.name+'</b><small>'+(locked?'🔒 '+d.xp+' XP':V3_PICK===i?'✓ À placer':installed?'✓ Sur l’île':'Ajouter sur l’île')+'</small></button>';
 });
 h+='</div><div class="v3-builder-actions"><button data-v3-unselect class="v2-subaction" type="button">✕ Annuler la sélection</button><span>Les objets se gagnent avec les XP. Aucun achat nécessaire.</span></div></section>';
 return h;
};
var v3OldVillage=tvVillage;
tvVillage=function(){var h=v3OldVillage();var c=v3Buddy();var next=V3_BUDDIES.find(function(b){return S.xp<b.xp;});
 h+='<section class="v3-home-band"><div class="v3-home-buddy">'+v3Sprite(c.id)+'</div><div class="v3-home-band-text"><div class="v3-eyebrow">✦ TA PETITE ÉQUIPE D’AVENTURE</div><h3>'+c.name+' t’accompagne !</h3><p>'+c.line+' '+(next?'Prochaine rencontre : <strong>'+esc(next.name)+'</strong> à '+next.xp+' XP.':'Bravo, tu as rencontré tous les compagnons !')+'</p></div><button class="v3-band-button" data-nav="collection">Découvrir les compagnons <span>↗</span></button></section>';
 var checkpoints=[{t:'Premiers pas',goal:5,v:S.stats.pins,icon:'📍',d:'Poser 5 repères'},{t:'Curiosité',goal:100,v:S.xp,icon:'✨',d:'Gagner 100 XP'},{t:'Aventurier',goal:3,v:S.stats.games,icon:'🧭',d:'Terminer 3 missions'}];
 h+='<section class="v3-steps"><div class="v2-section-title"><h3>🌱 Tes premiers objectifs</h3><small>À ton rythme, sans compétition</small></div><div class="v3-step-grid">';
 checkpoints.forEach(function(it){var ok=it.v>=it.goal,pc=Math.min(100,Math.floor(it.v/it.goal*100));h+='<div class="v3-step"><span class="v3-step-icon">'+it.icon+'</span><div><b>'+it.t+'</b><small>'+it.d+'</small></div><span class="v3-step-progress">'+(ok?'✓':Math.min(it.v,it.goal)+'/'+it.goal)+'</span><div class="v2-progress"><i style="width:'+pc+'%"></i></div></div>';});
 return h+'</div></section>';
};
var v3OldRenderEvents=tvRenderEvents;
tvRenderEvents=function(root){
 v3OldRenderEvents(root);
 var sky=root.querySelector('[data-v3-sky]');if(sky)sky.onclick=function(){var list=['day','sunset','night'];V3.sky=list[(list.indexOf(V3.sky)+1)%3];v3Save();sfx('tap');renderHome();};
 var done=root.querySelector('[data-v3-finish]');if(done)done.onclick=function(){V3_PICK=null;TAB='village';sfx('tap');renderHome();window.scrollTo(0,0);};
 var picks=root.querySelectorAll('[data-v3-select]');for(var i=0;i<picks.length;i++)picks[i].onclick=function(){var idx=+this.getAttribute('data-v3-select');if(S.xp<V3_DECORS[idx].xp)return;V3_PICK=V3_PICK===idx?null:idx;sfx('tap');renderHome();};
 var slots=root.querySelectorAll('[data-v3-slot]');for(i=0;i<slots.length;i++)slots[i].onclick=function(){var spot=this.getAttribute('data-v3-slot'),current=Object.prototype.hasOwnProperty.call(V3.places,spot)?V3.places[spot]:null;if(V3_PICK===null){if(current!==null){delete V3.places[spot];v3Save();sfx('tap');renderHome();}else{toast('🪴','Choisis d’abord une décoration dans l’atelier.');}return;}
  Object.keys(V3.places).forEach(function(k){if(V3.places[k]===V3_PICK)delete V3.places[k];});
  V3.places[spot]=V3_PICK;V3_PICK=null;v3Save();sfx('tap');renderHome();toast('🌼','Décoration installée !');
 };
 var cancel=root.querySelector('[data-v3-unselect]');if(cancel)cancel.onclick=function(){V3_PICK=null;renderHome();};
 var buddies=root.querySelectorAll('[data-v3-buddy]');for(i=0;i<buddies.length;i++)buddies[i].onclick=function(){var id=this.getAttribute('data-v3-buddy'),c=V3_BUDDIES.find(function(x){return x.id===id;});if(!c||S.xp<c.xp)return;V3.buddy=id;v3Save();sfx('tap');renderHome();toast('💛',c.name+' rejoint ton équipe !');};
 // Add a proper direct link to the builder on the home page.
 var edit=root.querySelector('.v2-heading button[data-nav="village"]');if(edit&&TAB==='village')edit.onclick=function(){V3_PICK=null;TAB='village-edit';renderHome();window.scrollTo(0,0);};
};
var v3OldShowEnd=showEnd;
showEnd=function(avg){v3OldShowEnd(avg);var c=v3Buddy(),dest=$('end').querySelector('.kpis');if(!dest)return;var msg=avg>=80?'Quelle belle expédition ! Tu connais déjà beaucoup de repères.':avg>=45?'Bien joué ! On apprend aussi en faisant des essais.':'Continue à explorer : chaque repère reviendra plus facilement.';
 dest.insertAdjacentHTML('afterend','<div class="v3-result-buddy"><span>'+v3Sprite(c.id)+'</span><div><b>'+c.name+' te félicite !</b><p>'+msg+'</p></div></div>');};
// If the user resets their progress, remove the optional cosmetic placements, too.
var v3OldProfile=renderProfile;
renderProfile=function(){v3OldProfile();var reset=$('bReset');if(reset){var original=reset.onclick;reset.onclick=function(){original();var m=document.querySelector('.modal');if(m){var yes=m.querySelector('[data-a="o"]');if(yes)yes.addEventListener('click',function(){V3={buddy:'plume',sky:'day',places:{}};V3_PICK=null;v3Save();},{once:true});}};}};
/* ===== END TERRA VILLAGE V3 ===== */

/* V4 artwork: all existing HTML buttons remain functional; only the decorative SVG scene is replaced. */
TV_SCENE='<img class="terrain-art" loading="eager" fetchpriority="high" src="assets/village-panorama-v12.webp" alt="Panorama original du village Terra Village, sans texte ni boutons dessinés" decoding="async">';
/* ---------- boot ---------- */
var nb=$('nav').querySelectorAll('button');for(i=0;i<nb.length;i++)nb[i].onclick=function(){showTab(this.getAttribute('data-t'));};
applySettings();showTab('village');
window.__R={S:S,G:function(){return G;},start:startGame,tap:onMapTap,proj:function(id){return MAPS[id].proj;},scr:toScr,T:function(){return T;},dist:distTo,ITEMS:ITEMS,validate:function(){validate();},next:function(){nextQ();}};
})();


;

/* V6 follows the same localStorage keys as V3; no progression reset. */
(function(){
 'use strict';
 var buddyKey='brot2you-geopins-terra-v3', savedKey='brot2you-geopins';
 var buddyNames={plume:'Plume',kiko:'Kiko',nori:'Nori',siro:'Siro',luma:'Luma',sora:'Sora'};
 function chosen(){try{var state=JSON.parse(localStorage.getItem(buddyKey)||'{}');return Object.prototype.hasOwnProperty.call(buddyNames,state.buddy)?state.buddy:'plume'}catch(e){return 'plume'}}
 function refreshBuddy(){
  var id=chosen();document.documentElement.style.setProperty('--v5-companion-image',"url('assets/"+id+".webp')");
  var hero=document.querySelector('#home .v2-buddy');
  if(hero){hero.classList.add('v6-buddy-ready');var pic=hero.querySelector('.v6-buddy-portrait');if(!pic){pic=document.createElement('img');pic.className='v6-buddy-portrait';pic.decoding='async';hero.insertBefore(pic,hero.firstChild)}pic.src='assets/'+id+'.webp';pic.alt=buddyNames[id]+' : compagnon explorateur';}
 }
 var panel=null,previousFocus=null;
 function closeJournal(){if(panel){panel.remove();panel=null;if(previousFocus&&previousFocus.focus)previousFocus.focus()}}
 function metric(label,value){return '<article><strong>'+value+'</strong><span>'+label+'</span></article>'}
 function makeJournal(){
  if(panel){closeJournal();return}
  previousFocus=document.activeElement;
  var progress=window.__R&&window.__R.S;if(!progress){return}
  var lvl=(function(){var xp=progress.xp||0,i=1;while(i<100&&xp>=100*i*i)i++;return i})();
  var stats=progress.stats||{};
  var packs=[];
  // Read the packs from rendered mission cards: the real data stays in the existing engine.
  var source=document.querySelectorAll('#home .v2-pack');
  if(!source.length){var m=document.querySelector('#nav button[data-t="missions"]');if(m){/* no navigation change necessary */}}
  var bName=buddyNames[chosen()];
  var html='<div class="v6-journal-head"><div><div class="v6-brandmark">GÉOPINS · TERRA VILLAGE</div><h2>📖 Mon carnet d’exploration</h2><p>Ton aventure, tes découvertes et tes prochaines étapes.</p></div><button class="v6-close" type="button" aria-label="Fermer le carnet">×</button></div>';
  html+='<div class="v6-overview">'+metric('XP gagnés',progress.xp||0)+metric('Repères placés',stats.pins||0)+metric('Parties terminées',stats.games||0)+metric('Compagnon',bName)+'</div>';
  html+='<h3 class="v6-subtitle">🗺️ Mes prochains défis</h3><div class="v6-mastery-list">';
  var challenges=[{title:'Découvrir les cartes',hint:'Explorer les pays et les régions',tab:'missions',icon:'🌍'},{title:'Objectif Brevet',hint:'Réviser les repères de troisième',tab:'brevet',icon:'🎓'},{title:'Mon village',hint:'Installer de nouvelles décorations',tab:'village',icon:'🏡'},{title:'Collection',hint:'Retrouver mes badges et compagnons',tab:'collection',icon:'🏆'}];
  challenges.forEach(function(q){html+='<button type="button" class="v6-mastery-item" data-v6-dest="'+q.tab+'"><b>'+q.icon+' '+q.title+'</b><small>'+q.hint+' →</small></button>'});
  html+='</div><h3 class="v6-subtitle">🌱 Mon aventure à mon rythme</h3><div class="v6-mastery-list">';
  [{name:'5 repères placés',v:stats.pins||0,goal:5},{name:'3 expéditions',v:stats.games||0,goal:3},{name:'100 XP',v:progress.xp||0,goal:100},{name:'500 XP',v:progress.xp||0,goal:500}].forEach(function(a){var pct=Math.min(100,Math.floor(100*a.v/a.goal));html+='<div class="v6-mastery-item" style="cursor:default"><b>'+a.name+'</b><div class="v6-progress-track"><i style="width:'+pct+'%"></i></div><small>'+Math.min(a.v,a.goal)+' / '+a.goal+(pct>=100?' ✓':'')+'</small></div>'});
  html+='</div><div class="v6-journal-foot"><span class="v6-brandmark">BROT2YOU · Apprendre en explorant</span><button type="button" data-v6-go="missions">Partir en mission →</button></div>';
  panel=document.createElement('div');panel.className='v6-journal-overlay';panel.innerHTML='<section class="v6-journal" role="dialog" aria-modal="true" aria-label="Mon carnet d’exploration">'+html+'</section>';
  document.body.appendChild(panel);panel.querySelector('.v6-close').onclick=closeJournal;
  panel.onclick=function(e){if(e.target===panel)closeJournal()};
  panel.querySelectorAll('[data-v6-dest], [data-v6-go]').forEach(function(el){el.onclick=function(){var dest=el.dataset.v6Dest||el.dataset.v6Go;closeJournal();var btn=document.querySelector('#nav button[data-t="'+dest+'"]');if(btn)btn.click();else if(dest==='village'){var v=document.querySelector('#nav button[data-t="village"]');if(v)v.click()}}});
  panel.querySelector('.v6-close').focus();
 }
 function update(){
  refreshBuddy();
  var header=document.querySelector('#home .v2-head')||document.querySelector('#profile .v2-head');
  if(header&&!header.querySelector('.v6-journal-trigger')){var b=document.createElement('button');b.className='v6-journal-trigger';b.type='button';b.innerHTML='📖 <span>Mon carnet</span>';b.onclick=makeJournal;header.appendChild(b)}
 }
 document.addEventListener('keydown',function(e){if(e.key==='Escape')closeJournal();if(e.key==='Tab'&&panel){var buttons=panel.querySelectorAll('button');var first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 var schedule=false;var root=document.getElementById('home');var profile=document.getElementById('profile');
 var observer=new MutationObserver(function(){if(schedule)return;schedule=true;requestAnimationFrame(function(){schedule=false;update()})});
 if(root)observer.observe(root,{childList:true});if(profile)observer.observe(profile,{childList:true});
 window.addEventListener('storage',update);update();
})();

;

(function(){
'use strict';
function getState(){return window.__R&&window.__R.S||{};}
function makeTag(t,c){var n=document.createElement(t);if(c)n.className=c;return n}
function escapeText(t){return String(t||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function navigate(tab){var btn=document.querySelector('#nav button[data-t="'+tab+'"]');if(btn)btn.click();window.scrollTo({top:0,behavior:'smooth'});}
function makeQuests(){
 var home=document.querySelector('#home');if(!home)return;
 var hero=home.querySelector('.v2-hero');
 if(hero&&!hero.querySelector('.v7-ambient')){var a=makeTag('span','v7-ambient');a.setAttribute('aria-hidden','true');a.innerHTML='<i>✦</i><i>✧</i><i>✦</i>';hero.appendChild(a)}
 var anchor=home.querySelector('.v2-below');if(!anchor||home.querySelector('.v7-quests'))return;
 var state=getState();var xp=Number(state.xp)||0;var stats=state.stats||{};
 var keys=Object.keys(stats);var started=keys.length;var goalxp=Math.min(100,Math.floor(xp%100));
 var block=makeTag('section','v7-quests');block.setAttribute('aria-label','Mon itinéraire de découverte');
 block.innerHTML='<h2>🧭 Ton itinéraire de découverte</h2><p>Trois aventures à portée de clic. Chaque petit progrès compte !</p><div class="v7-quest-row">'+
 '<button type="button" class="v7-quest" data-v7-go="missions"><span class="v7-icon">🗺️</span><strong>Explorer une destination</strong><small>Choisis ta prochaine carte</small><span class="v7-progress"><span style="width:'+Math.max(5,Math.min(100,started*7))+'%"></span></span></button>'+
 '<button type="button" class="v7-quest" data-v7-go="brevet"><span class="v7-icon">🎓</span><strong>S’entraîner pour le brevet</strong><small>Une mission, à ton rythme</small><span class="v7-progress"><span style="width:'+goalxp+'%"></span></span></button>'+
 '<button type="button" class="v7-quest" data-v7-go="collection"><span class="v7-icon">🏆</span><strong>Découvrir ta collection</strong><small>Compagnons et récompenses</small><span class="v7-progress"><span style="width:'+Math.min(100,xp/10)+'%"></span></span></button></div>';
 anchor.parentNode.insertBefore(block,anchor);
}
function makeScenic(){var home=document.querySelector('#home');if(!home)return;
 var panel=home.querySelector('.v2-panel:has(.v2-packs)');if(panel&&!panel.querySelector('.v7-scenic')){
 var scene=makeTag('div','v7-scenic');scene.innerHTML='<div><h2>🗺️ Le carnet des destinations</h2><p>Découvre des lieux, apprends à te repérer et collectionne tes découvertes.</p></div>';
 panel.insertBefore(scene,panel.firstChild);}
 var all=home.querySelectorAll('.v2-pack');all.forEach(function(card){if(card.querySelector('.v7-mission-visual'))return;var d=makeTag('div','v7-mission-visual');d.setAttribute('aria-hidden','true');card.insertBefore(d,card.firstChild)});
}
function reapply(){makeQuests();makeScenic()}
document.addEventListener('click',function(e){var el=e.target.closest('[data-v7-go]');if(el){navigate(el.getAttribute('data-v7-go'));}});
var pending=false;var observer=new MutationObserver(function(){if(pending)return;pending=true;requestAnimationFrame(function(){pending=false;reapply()})});
var start=function(){var h=document.getElementById('home');if(h){observer.observe(h,{childList:true,subtree:false});reapply()}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

;

(function(){
'use strict';
var names={plume:'Plume',kiko:'Kiko',nori:'Nori',siro:'Siro',luma:'Luma',sora:'Sora'};
var oldSprite=v3Sprite;
v3Sprite=function(id){if(!Object.prototype.hasOwnProperty.call(names,id))return oldSprite(id);return '<img class="v8-illustrated-buddy" src="assets/'+id+'.webp" alt="'+names[id]+', compagnon explorateur illustré" loading="lazy">'};
// Six illustrated landscape keepsakes, awarded by actual progress only.
var rewards=[
 {key:'rivages',name:'Les rivages',hint:'Première exploration',ok:function(){return S.stats.games>=1}},
 {key:'montagnes',name:'Les sommets',hint:'Deux explorations',ok:function(){return S.stats.games>=2}},
 {key:'cascade',name:'La cascade',hint:'Cinq repères posés',ok:function(){return S.stats.pins>=5}},
 {key:'phare',name:'Le phare',hint:'Dix repères posés',ok:function(){return S.stats.pins>=10}},
 {key:'foret',name:'La forêt',hint:'150 XP accumulés',ok:function(){return S.xp>=150}},
 {key:'ocean',name:'Le grand large',hint:'300 XP accumulés',ok:function(){return S.xp>=300}}
];
function cardHtml(r){var unlocked=r.ok();return '<button class="v8-postcard'+(unlocked?'':' is-locked')+'" type="button" data-v8-photo="'+r.key+'" '+(unlocked?'':'disabled')+' aria-label="'+(unlocked?'Voir la carte postale : ':'Carte postale verrouillée : ')+r.name+'"><img loading="lazy" src="assets/postcards/'+r.key+'.webp" alt="'+(unlocked?r.name:'Souvenir à découvrir')+'"><b>'+r.name+'</b><small>'+(unlocked?'✦ Souvenir débloqué':'🔒 '+r.hint)+'</small></button>'}
function addGallery(){var home=document.getElementById('home');if(!home||home.classList.contains('hidden')||typeof TAB==='undefined'||TAB!=='collection')return;var anchor=home.querySelector('.v3-compendium')||home.querySelector('.v2-wrap');if(!anchor||home.querySelector('.v8-photo-section'))return;var block=document.createElement('section');block.className='v8-photo-section';block.setAttribute('aria-label','Album de cartes postales');block.innerHTML='<h3>📮 Mon album de cartes postales</h3><p>Explore les cartes et découvre des paysages de Terra Village. Les souvenirs se débloquent avec tes parties et tes XP.</p><div class="v8-photo-grid">'+rewards.map(cardHtml).join('')+'</div>';anchor.insertAdjacentElement('afterend',block);var footer=document.createElement('p');footer.className='v8-credits';footer.textContent='GéoPins · Terra Village V9 — par BROT2YOU';home.appendChild(footer)}
function showPhoto(key){var r=rewards.find(function(x){return x.key===key});if(!r||!r.ok())return;var overlay=document.createElement('div');overlay.className='v8-picture-modal';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Carte postale : '+r.name);overlay.innerHTML='<div class="v8-picture-frame"><button class="v8-picture-close" type="button" aria-label="Fermer la carte postale">×</button><img alt="Paysage illustré : '+r.name+'" src="assets/postcards/'+r.key+'.webp"><h3>📮 '+r.name+'</h3><p>Une étape de plus dans ton carnet d’exploration !</p></div>';document.body.appendChild(overlay);function close(){overlay.remove();document.removeEventListener('keydown',escape)}function escape(e){if(e.key==='Escape')close()}overlay.addEventListener('click',function(e){if(e.target===overlay||e.target.closest('.v8-picture-close'))close()});document.addEventListener('keydown',escape);overlay.querySelector('button').focus()}
document.addEventListener('click',function(e){var p=e.target.closest('[data-v8-photo]');if(p)showPhoto(p.getAttribute('data-v8-photo'))});
var queued=false;var obs=new MutationObserver(function(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;addGallery()})});
function boot(){var el=document.getElementById('home');if(el){obs.observe(el,{childList:true,subtree:false});addGallery()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

;

(function(){'use strict';
function enrich(){
 var home=document.getElementById('home');if(!home||home.classList.contains('hidden'))return;
 var hero=home.querySelector('.v2-hero');if(!hero)return;
 var header=home.querySelector('.v2-heading');
 if(header&&!home.querySelector('.v9-label')){var p=document.createElement('span');p.className='v9-label';p.textContent='🌿 TERRA VILLAGE · BROT2YOU';header.insertAdjacentElement('afterend',p);}
 if(hero.classList.contains('v3-building')&&!home.querySelector('.v9-help')){var info=document.createElement('div');info.className='v9-help';info.innerHTML='🏡 <strong>Ton atelier de village :</strong> choisis une décoration débloquée, puis touche un emplacement « + » sur la carte. Pour la retirer, touche l’objet sans sélection active. Tes choix restent enregistrés sur cet appareil.';hero.insertAdjacentElement('afterend',info);}
 if(false&&hero&&!hero.classList.contains('v3-building')&&!home.querySelector('.v9-shortcuts')){var buttons=document.createElement('nav');buttons.className='v9-shortcuts';buttons.setAttribute('aria-label','Accès rapides Terra Village');buttons.innerHTML='<button data-v9-tab="village-edit">🏡 Décorer mon village</button><button data-v9-tab="missions">🗺️ Toutes les missions</button><button data-v9-tab="brevet">🎓 Académie du Brevet</button><button data-v9-tab="collection">🏆 Mes récompenses</button>';hero.insertAdjacentElement('afterend',buttons);}
 home.querySelectorAll('[data-v9-tab]').forEach(function(btn){btn.onclick=function(){var dest=this.dataset.v9Tab;var original=home.querySelector('[data-nav="'+dest+'"]');if(original){original.click();return;}var nav=home.querySelector('[data-nav="village"]');if(dest==='village-edit'&&nav){nav.click();return;}var link=document.querySelector('[data-t="'+dest+'"]');if(link)link.click();};});
}
var obs=new MutationObserver(function(){if(!document.getElementById('home'))return;requestAnimationFrame(enrich);});
obs.observe(document.getElementById('home'),{childList:true});
requestAnimationFrame(enrich);
})();

;

(function(){'use strict';
// All student progress is read from the existing state (S, V3) – no save format is changed.
var originalCollection=tvCollection;
function countBadges(){return BADGES.filter(function(b){return !!S.badges[b.id]}).length}
function buddy(){var id=V3.buddy||'plume';return V3_BUDDIES.find(function(b){return b.id===id})||V3_BUDDIES[0]}
function cover(){var b=buddy(),unlocked=V3_BUDDIES.filter(function(x){return S.xp>=x.xp}).length;
 return '<section class="v15-cover" aria-label="Présentation de ta collection"><div class="v15-cover-content"><span class="v15-tag">✦ CARNET D’EXPLORATEUR · V15</span><h2>Mes trésors d’aventure</h2><p>Compagnons, souvenirs et badges : chaque découverte raconte une étape de ton voyage.</p><div class="v15-counts"><span>🐾 '+unlocked+'/6 compagnons</span><span>🏅 '+countBadges()+'/'+BADGES.length+' badges</span><span>✨ '+S.xp+' XP</span></div></div></section>'+
 '<div class="v15-guide"><img src="assets/'+b.id+'.webp" alt="" loading="lazy"><div><strong>'+esc(b.name)+', ton compagnon de route</strong><p>'+esc(b.line)+' Continue à explorer pour agrandir ta collection !</p></div></div>';
}
function badgePanel(){var total=countBadges();var html='<section class="v15-badge-panel" aria-label="Album des badges"><h3>🏅 Album des badges</h3><p>'+total+' badges sur '+BADGES.length+'. Utilise les filtres pour retrouver tes récompenses.</p><div class="v15-tabs" role="group" aria-label="Filtrer les badges"><button type="button" class="v15-filter" data-v15-filter="all" aria-pressed="true">Tous</button><button type="button" class="v15-filter" data-v15-filter="yes" aria-pressed="false">Débloqués</button><button type="button" class="v15-filter" data-v15-filter="no" aria-pressed="false">À découvrir</button></div><div class="v15-badge-list">';
 BADGES.forEach(function(b){var got=!!S.badges[b.id];html+='<div class="v15-badge'+(got?'':' locked')+'" data-v15-unlocked="'+(got?'yes':'no')+'" title="'+esc(b.d||'')+'"><span class="em" aria-hidden="true">'+b.e+'</span><b>'+esc(b.n)+'</b><small>'+(got?'✓ Débloqué':'🔒 À découvrir')+'</small></div>';});return html+'</div></section>';
}
tvCollection=function(){return cover()+originalCollection()+badgePanel()};
var oldEvents=tvRenderEvents;
tvRenderEvents=function(root){oldEvents(root);root.querySelectorAll('[data-v15-filter]').forEach(function(btn){btn.addEventListener('click',function(){var val=this.dataset.v15Filter;root.querySelectorAll('[data-v15-filter]').forEach(function(b){b.setAttribute('aria-pressed',String(b===btn))});root.querySelectorAll('[data-v15-unlocked]').forEach(function(el){el.hidden=(val!=='all'&&el.dataset.v15Unlocked!==val)});});});};
var oldProfile=renderProfile;
renderProfile=function(){oldProfile();var h=document.getElementById('profile');if(!h||h.querySelector('.v15-profile-top'))return;var c=buddy(),L=levelOf(S.xp),min=xpFor(L),max=xpFor(L+1),pct=Math.max(0,Math.min(100,Math.round((S.xp-min)/(max-min)*100)));var stats=S.stats;
 var intro='<section class="v15-profile-top"><img src="assets/'+c.id+'.webp" alt="'+esc(c.name)+'" loading="lazy"><div><span class="v15-tag">MON PASSEPORT D’EXPLORATEUR</span><h2>'+esc(S.name||'Explorateur')+'</h2><p>Niveau '+L+' · '+esc(titleOf(L))+'<br>'+esc(c.name)+' voyage avec toi</p><div class="v15-progress-track" role="progressbar" aria-label="Progression vers le prochain niveau" aria-valuenow="'+pct+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+pct+'%"></i></div><small>'+S.xp+' XP · '+(max-S.xp)+' XP avant le niveau '+(L+1)+'</small></div></section>';
 var achievements='<section class="v15-achievements"><h3>🧭 Mon journal de voyage</h3><div class="v15-achievement-grid"><div><b>'+stats.games+'</b><span>Expéditions</span></div><div><b>'+stats.pins+'</b><span>Repères placés</span></div><div><b>'+countBadges()+'</b><span>Badges obtenus</span></div></div></section>';
 var target=h.querySelector('.col');if(target){target.insertAdjacentHTML('afterbegin',intro);var name=target.querySelector('.pcard');if(name)name.insertAdjacentHTML('beforebegin',achievements)};
};
// Include the passport in the V2 theme profile too, where the separate home screen is used.
var oldTvProfile=tvProfile;
tvProfile=function(){var c=buddy(),L=levelOf(S.xp),a=xpFor(L),z=xpFor(L+1),pct=Math.max(0,Math.min(100,Math.round(100*(S.xp-a)/(z-a))));
 var top='<section class="v15-profile-top"><img src="assets/'+c.id+'.webp" alt="" loading="lazy"><div><span class="v15-tag">PASSEPORT GÉOPINS</span><h2>'+esc(S.name||'Explorateur')+'</h2><p>'+esc(titleOf(L))+' · Niveau '+L+'<br>Compagnon : '+esc(c.name)+'</p><div class="v15-progress-track" role="progressbar" aria-label="Progression du niveau" aria-valuenow="'+pct+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+pct+'%"></i></div><small>'+(z-S.xp)+' XP jusqu’au niveau '+(L+1)+'</small></div></section>';
 return top+oldTvProfile();};
})();

;

(function(){'use strict';
// Separate, additive cosmetic save: existing progress (S), placements (V3) and companions are untouched.
var KEY='geopins-terra-v16-buildings';
var BUILDINGS=[
 {id:'academy',name:'Académie du Brevet',emoji:'🏰',hint:'Un lieu de révision qui grandit avec tes expéditions.',stages:['Salle des cartes','Bibliothèque des repères','Grande académie'],limits:[0,450,1650]},
 {id:'observatory',name:'Observatoire',emoji:'🔭',hint:'Observe les paysages du monde entier.',stages:['Petite longue-vue','Dôme astronomique','Observatoire des étoiles'],limits:[0,700,2200]},
 {id:'workshop',name:'Atelier des cartes',emoji:'🛠️',hint:'L’atelier des explorateurs et des décorations.',stages:['Cabane en bois','Atelier du cartographe','Grande maison des cartes'],limits:[0,300,1300]},
 {id:'lodge',name:'Maison des compagnons',emoji:'🏡',hint:'Un foyer chaleureux pour tous tes compagnons.',stages:['Petit refuge','Maison fleurie','Pavillon des compagnons'],limits:[0,550,1850]}
];
var levels={};try{var stored=JSON.parse(localStorage.getItem(KEY)||'{}');if(stored&&typeof stored==='object')BUILDINGS.forEach(function(b){var n=Number(stored[b.id]);levels[b.id]=Number.isInteger(n)?Math.max(0,Math.min(2,n)):0})}catch(e){};
BUILDINGS.forEach(function(b){if(levels[b.id]===undefined)levels[b.id]=0});
function save(){try{localStorage.setItem(KEY,JSON.stringify(levels))}catch(e){}}
function total(){return BUILDINGS.reduce(function(n,b){return n+levels[b.id]},0)}
function summary(){return '<div class="v16-village-summary"><b>🏘️ Village niveau '+(1+Math.floor(total()/3))+'</b><span class="v16-pill">'+total()+' / 8 améliorations</span><span class="v16-pill">🌳 '+Object.keys(V3.places||{}).length+' / 12 décorations</span></div>'}
function workshop(){var out='<section class="v16-banner"><span class="mini">TERRA VILLAGE · V22</span><h3>🏡 Fais grandir ton village !</h3><p>Chaque expédition te rapporte des XP. Débloque des améliorations et choisis toi-même quand agrandir les bâtiments. Rien à acheter, aucun point dépensé.</p><strong>'+total()+' améliorations réalisées sur 8</strong><div class="v16-meter" aria-label="'+total()+' améliorations sur 8"><i style="width:'+(total()/8*100)+'%"></i></div></section><div class="v16-districts">';
 BUILDINGS.forEach(function(b){var stage=levels[b.id],next=stage+1,need=next<=2?b.limits[next]:0,can=next<=2&&S.xp>=need;
 out+='<article class="v16-district"><div class="v16-district-art"><img class="v17-building-picture" src="assets/buildings-v17/'+b.id+'-'+(stage+1)+'.webp" alt="Illustration de '+b.name+', niveau '+(stage+1)+'" loading="lazy"><span class="stars">'+('★'.repeat(stage+1))+'</span></div><h4>'+b.name+'</h4><span class="v16-stage">Niveau '+(stage+1)+' / 3 · '+b.stages[stage]+'</span><p>'+b.hint+'</p>';
 if(stage===2)out+='<button class="v16-upgrade" disabled>✨ Bâtiment entièrement amélioré</button>';
 else if(can)out+='<button class="v16-upgrade" type="button" data-v16-upgrade="'+b.id+'">⬆️ Améliorer : '+b.stages[next]+' · '+need+' XP requis</button>';
 else out+='<button class="v16-upgrade" disabled>🔒 Prochaine amélioration à '+need+' XP · encore '+Math.max(0,need-S.xp)+' XP</button>';
 out+='</article>'});
 out+='</div><p class="v16-notice">💾 Toutes les améliorations restent enregistrées sur cet appareil. Elles n’affectent ni les scores ni la difficulté des exercices.</p>';
 return out;
}
var oldPage=tvDecorPage;
tvDecorPage=function(){return oldPage()+workshop()};
var oldVillage=tvVillage;
tvVillage=function(){return oldVillage()+summary()};
var oldScene=tvScene;
tvScene=function(edit){var scene=oldScene(edit);var built=BUILDINGS.map(function(b){return '<span class="v16-scene-building v17-scene-building" title="'+b.name+' · niveau '+(levels[b.id]+1)+'"><img src="assets/buildings-v17/'+b.id+'-'+(levels[b.id]+1)+'.webp" alt=""><span>'+b.name+'<i>'+('★'.repeat(levels[b.id]+1))+'</i></span></span>'}).join('');return scene.replace('<div class="v2-scene-bottom">','<div class="v16-scene-buildings" aria-hidden="true">'+built+'</div><div class="v16-scene-badge" aria-hidden="true">🏘️ Village niv. '+(1+Math.floor(total()/3))+' · '+total()+'/8 améliorations</div><div class="v2-scene-bottom">')};
var oldEvents=tvRenderEvents;
tvRenderEvents=function(root){oldEvents(root);root.querySelectorAll('[data-v16-upgrade]').forEach(function(btn){btn.addEventListener('click',function(){var id=this.getAttribute('data-v16-upgrade');var b=BUILDINGS.find(function(x){return x.id===id});if(!b)return;var next=levels[id]+1;if(next>2||S.xp<b.limits[next])return;levels[id]=next;save();if(typeof sfx==='function')sfx('tap');renderHome();if(typeof toast==='function')toast('🏗️',b.name+' amélioré : '+b.stages[next]+' !')})})};
// Prevent resetting the main profile from leaving behind orphaned cosmetic building levels.
var oldProfile=renderProfile;
renderProfile=function(){oldProfile();var reset=document.getElementById('bReset');if(!reset)return;var previous=reset.onclick;reset.onclick=function(ev){if(previous)previous.call(this,ev);var modalEl=document.querySelector('.modal');if(!modalEl)return;var confirm=modalEl.querySelector('[data-a="o"]');if(confirm){confirm.addEventListener('click',function(){BUILDINGS.forEach(function(b){levels[b.id]=0});save()},{once:true})}}};
})();

;

(function(){'use strict';
// The four illustrated buildings read the original V16 level data; no migration or XP reset.
var lines={
 plume:['Chaque exploration construit notre village !','Super ! Une nouvelle amélioration apparaît sur la carte.'],
 kiko:['Une carte, un chemin, une aventure !','Je vais dessiner notre village encore plus grand !'],
 nori:['Une belle journée pour explorer !','Bravo ! Notre île devient encore plus accueillante.'],
 siro:['Observe les nouveaux détails du village !','Bien joué ! Chaque progrès compte.'],
 luma:['J’ai plein d’idées pour décorer notre île !','Super construction ! Et si on ajoutait des fleurs ?'],
 sora:['Regarde tout ce que nous avons découvert.','Une nouvelle étape de notre voyage !']
};
var previousDecor=tvDecorPage;
tvDecorPage=function(){var content=previousDecor(),key='plume';try{key=(V3.buddy||V3.pet||localStorage.getItem('geopins-terra-v3-buddy')||'plume').toLowerCase()}catch(e){}if(!lines[key])key='plume';return content+'<aside class="v17-companion-tip"><img src="assets/'+key+'.webp" alt="Compagnon explorateur"><div><strong>🐾 Le conseil de ton compagnon</strong>'+lines[key][0]+'</div></aside>'};
})();

;

/* V18 protective enhancements — no changes to learning progress or saved data. */
(function(){'use strict';
var artBase='assets/';
var companions=['plume','kiko','nori','siro','luma','sora'];
function fixArt(){
  // Render painted companions if an old vector avatar survives from an earlier UI module.
  document.querySelectorAll('[data-companion], [data-buddy]').forEach(function(el){
    var id=(el.getAttribute('data-companion')||el.getAttribute('data-buddy')||'').toLowerCase();
    if(companions.indexOf(id)<0 || el.querySelector('img'))return;
    var svg=el.querySelector('svg');if(!svg)return;
    var im=document.createElement('img');im.src=artBase+id+'.webp';im.alt='';im.loading='lazy';im.className='v18-portrait';
    im.style.cssText='display:block;width:100%;height:100%;object-fit:cover;border-radius:inherit;';
    im.onerror=function(){im.remove();svg.style.display='';};svg.style.display='none';el.appendChild(im);
  });
  document.querySelectorAll('.v9-shortcuts button').forEach(function(button){button.style.transform='none';});
}
var root=document.getElementById('home');if(root){
  var pending=false,observer=new MutationObserver(function(){if(pending)return;pending=true;requestAnimationFrame(function(){pending=false;fixArt();});});
  observer.observe(root,{subtree:true,childList:true});
}
fixArt();
})();

;

/* V19: artwork icons are real images, labels/actions remain live HTML. */
(function(){'use strict';
const icons={play:'village',village:'village',missions:'missions',brevet:'brevet',collection:'collection',me:'me',carnet:'carnet',review:'review'};
const labels={play:'Village',village:'Village',missions:'Missions',brevet:'Brevet',collection:'Collection',me:'Profil',carnet:'Carnet'};
function icon(k){const im=document.createElement('img');im.src='assets/icons-v21/'+(icons[k]||k)+'.png';im.className='tv19-icon';im.alt='';im.setAttribute('aria-hidden','true');im.loading='lazy';return im;}
function decorate(){
 const nav=document.getElementById('nav');if(nav){nav.querySelectorAll('button[data-t]').forEach(b=>{const k=b.dataset.t;if(!icons[k])return;if(b.querySelector('.tv19-icon'))return;b.replaceChildren(icon(k));const span=document.createElement('span');span.className='tv19-label';span.textContent=labels[k]||k;b.append(span);b.setAttribute('aria-label',span.textContent);});}
 document.querySelectorAll('.v9-shortcuts button[data-v9-tab]').forEach(b=>{if(b.querySelector('.tv19-icon'))return;const k=b.dataset.v9Tab;b.replaceChildren(icon(k));const span=document.createElement('span');span.textContent=({missions:'Partir en mission',brevet:'Académie du Brevet',collection:'Mes récompenses',village:'Mon village'})[k]||'Explorer';b.append(span);});
 document.querySelectorAll('.v2-hotspot .hicon').forEach(el=>{if(el.querySelector('.tv19-icon'))return;const p=el.closest('.v2-hotspot');const k=p?.classList.contains('france')?'missions':p?.classList.contains('europe')?'missions':p?.classList.contains('world')?'village':'brevet';el.replaceChildren(icon(k));});
 document.querySelectorAll('.v2-mini-link > span:first-child').forEach(el=>{if(el.querySelector('.tv19-icon'))return;el.replaceChildren(icon(el.parentElement.dataset.nav==='collection'?'collection':'review'));});
}
let scheduled=false;const mo=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate()})});
function start(){decorate();mo.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

;

(function(){'use strict';
const names=['plume','kiko','nori','siro','luma','sora'];
// Use existing *painted* companion art, never the original vector owl.
tvOwl=function(){let id='plume';try{if(typeof V3!=='undefined' && names.includes(V3.buddy))id=V3.buddy}catch(e){}return '<img class="v20-painted-buddy" src="assets/'+id+'.webp" alt="Compagnon explorateur illustré" draggable="false">';};
})();

;

/* V24: dedicated painted icon assets; labels and action targets stay native HTML. */
(function(){
 const icons={village:'village',missions:'missions',brevet:'brevet',collection:'collection',me:'me',carnet:'carnet'};
 const words={village:'Village',missions:'Missions',brevet:'Brevet',collection:'Collection',me:'Profil',carnet:'Carnet'};
 function refresh(){
  document.querySelectorAll('#nav button[data-t]').forEach(btn=>{
   const key=btn.getAttribute('data-t'),file=icons[key];if(!file)return;
   if(btn.getAttribute('data-v24-icon')===key)return;
   btn.innerHTML='<img class="tv19-icon" alt="" src="assets/ui-v24/'+file+'.png"><span class="tv19-label">'+words[key]+'</span>';
   btn.setAttribute('data-v24-icon',key);btn.setAttribute('aria-label',words[key]);
  });
 }
 refresh();const nav=document.getElementById('nav');if(nav)new MutationObserver(refresh).observe(nav,{childList:true,subtree:false});
 // The old guide was drawn as an SVG. Use the actual painted companion selected by the learner.
 if(typeof tvOwl==='function')tvOwl=function(){
  let nm='plume';try{if(typeof TV!=='undefined'){nm=(TV.companion||TV.buddy||TV.pet||'plume').toString().toLowerCase();}}catch(e){}
  if(!['plume','kiko','nori','siro','luma','sora'].includes(nm))nm='plume';
  return '<img class="v24-buddy-art" alt="Compagnon explorateur" src="assets/'+nm+'.webp">';
 };
})();

;

(function(){
  function visible(el){return el && !el.classList.contains('hidden') && getComputedStyle(el).display!=='none';}
  function sync(){document.body.classList.toggle('tv25-playing', visible(document.getElementById('game')) || visible(document.getElementById('end')));}
  function go(){
    try{if(typeof quitAsk==='function' && visible(document.getElementById('game'))){quitAsk();setTimeout(sync,100);return;}}
    catch(e){console.warn('Quit confirmation unavailable',e);}
    try{if(typeof closeGame==='function'){closeGame();sync();return;}}catch(e){console.warn('Close game unavailable',e);}
    document.getElementById('game')?.classList.add('hidden');document.getElementById('end')?.classList.add('hidden');sync();
  }
  var b=document.createElement('button');b.type='button';b.id='tv25-exit';b.textContent='← Quitter l’activité';b.setAttribute('aria-label','Quitter l’activité et revenir au village');b.addEventListener('click',go);document.body.appendChild(b);
  ['game','end'].forEach(function(id){var el=document.getElementById(id);if(el)new MutationObserver(sync).observe(el,{attributes:true,attributeFilter:['class','style']});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape' && document.body.classList.contains('tv25-playing') && !document.querySelector('.modal'))go();});
  sync();
})();

;

(()=>{const patterns=[[/\b(europe|européen|européenne)\b/i,'europe'],[/\bfrance|français|française\b/i,'france'],[/\b(monde|continent|océan)\b/i,'monde'],[/royaume.uni|angleterre|britannique/i,'royaume-uni'],[/\b(usa|états.unis|united states)\b/i,'usa'],[/\bcanada\b/i,'canada'],[/\baustralie\b/i,'australie'],[/\basie\b/i,'asie']];let scheduled=false;function update(){scheduled=false;document.querySelectorAll('.v2-pack').forEach(el=>{if(el.dataset.tv26Land)return;let title=(el.querySelector('.nm,.v2-pack-title,h3,strong')?.textContent||el.textContent||'').slice(0,130);for(const [pattern,k] of patterns){if(pattern.test(title)){el.dataset.tv26Land=k;break}}});}new MutationObserver(()=>{if(scheduled)return;scheduled=true;setTimeout(update,80)}).observe(document.body,{subtree:true,childList:true});update();})();

;

(function(){'use strict';
const entries={play:['village','Village'],village:['village','Village'],missions:['missions','Missions'],brevet:['brevet','Brevet'],collection:['collection','Collection'],me:['me','Profil'],carnet:['carnet','Carnet']};
let active=false;
function update(){if(active)return;active=true;try{const nav=document.getElementById('nav');if(!nav)return;nav.querySelectorAll('button[data-t]').forEach(function(btn){const k=btn.getAttribute('data-t');const e=entries[k];if(!e)return;const path='assets/ui-v27/'+e[0]+'.png';let icon=btn.querySelector('img.tv19-icon');if(!icon){icon=document.createElement('img');icon.className='tv19-icon';icon.alt='';icon.setAttribute('aria-hidden','true');btn.prepend(icon);}if(!icon.getAttribute('src')?.endsWith(path))icon.src=path;icon.loading='eager';icon.decoding='async';let label=btn.querySelector('.tv19-label');if(!label){label=document.createElement('span');label.className='tv19-label';btn.appendChild(label);}if(label.textContent!==e[1])label.textContent=e[1];btn.setAttribute('aria-label',e[1]);btn.setAttribute('data-v24-icon',k);});}finally{active=false;}}
function start(){const n=document.getElementById('nav');if(!n)return;update();new MutationObserver(function(){queueMicrotask(update)}).observe(n,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

;

(()=>{'use strict';
 const toggle=document.getElementById('v28SoundToggle');
 const KEY='geopins_v28_sfx';let enabled=false;let ac=null;
 try{enabled=localStorage.getItem(KEY)==='1'}catch(e){}
 function refresh(){toggle.textContent=enabled?'Son : activé':'Son : désactivé';toggle.setAttribute('aria-pressed',String(enabled));toggle.setAttribute('aria-label',enabled?'Désactiver les effets sonores':'Activer les effets sonores')}
 function note(freq,duration=0.09,shape='sine',delay=0,volume=.028){if(!enabled)return;
   try{const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;ac??=new AudioContext();if(ac.state==='suspended')ac.resume().catch(()=>{});
    const osc=ac.createOscillator(),gain=ac.createGain(),t=ac.currentTime+delay;osc.type=shape;osc.frequency.setValueAtTime(freq,t);gain.gain.setValueAtTime(0.001,t);gain.gain.linearRampToValueAtTime(volume,t+.012);gain.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(gain);gain.connect(ac.destination);osc.start(t);osc.stop(t+duration+.01)
   }catch(e){}
 }
 refresh();toggle.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem(KEY,enabled?'1':'0')}catch(e){}refresh();note(560,.10)});
 document.addEventListener('click',e=>{if(!enabled||e.target.closest('#v28SoundToggle'))return;
 const btn=e.target.closest('button');if(!btn)return;
 if(btn.id==='bQuit'||btn.id==='bNext'||/quit|retour|fermer/i.test(btn.textContent||'')){note(320,.09);return;}
 if(btn.classList.contains('qopt')){note(540,.07,'triangle');return}
 if(btn.closest('#nav')){note(440,.07,'sine');note(660,.10,'sine',.075,.018);return}
 if(btn.id==='bDaily'||btn.id==='bReview'||btn.matches('[data-m]')){note(440,.08,'triangle');note(660,.13,'triangle',.08);return}
 note(390,.045,'sine',0,.014)
 },true);
 // Feedback effects are triggered when the result card becomes visible.
 const result=document.getElementById('res');if(result){let last='';new MutationObserver(()=>{if(!enabled||result.classList.contains('hidden')||!result.textContent.trim())return;const signature=result.textContent.slice(0,80);if(signature===last)return;last=signature;const match=signature.match(/\+(\d+)/),n=match?Number(match[1]):0; if(n>0){note(523,.12,'triangle');note(659,.14,'triangle',.09);note(784,.19,'sine',.19)}else note(300,.12,'sine')}).observe(result,{subtree:true,childList:true,attributes:true})}
})();

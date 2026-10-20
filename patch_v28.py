from pathlib import Path
p=Path('/mnt/data/terra_v28/index.html')
s=p.read_text()
s=s.replace('Terra Village V27','Terra Village V28')
insert='''
<style id="terra-v28-cards">
/* V28: visual refinements confined to existing game and mission elements */
#game .qcard,#game .res .card{background:linear-gradient(150deg,#fffdf3 0%,#fff4d7 100%);border:3px solid #87532f;border-radius:22px;box-shadow:0 7px 0 #63391f,0 18px 30px #203b4380;color:#403021}
#game .qcard::before{content:"";position:absolute;inset:6px;border:1px solid #d3af75;pointer-events:none;border-radius:15px}
#game .qname{color:#3f3022;text-shadow:0 1px #fff}
#game .qk{background:linear-gradient(#fff8d4,#ebd6a2);border-color:#915c34;box-shadow:0 3px #bd8c57}
#game .qopt{background:linear-gradient(145deg,#fffbec,#f3e1bb);border:2px solid #94613a;box-shadow:0 4px 0 #694327;color:#352819}
#game .qopt.ok{background:#a0e0ac}#game .qopt.ko{background:#f5a5a0}
#game .qopt:focus-visible,#game button:focus-visible{outline:3px solid #276ac1;outline-offset:3px}
#game .flag{box-shadow:0 2px 5px #0002;overflow:hidden}
.v28-sound-control{position:fixed;right:12px;bottom:calc(95px + env(safe-area-inset-bottom,0px));z-index:76;border:2px solid #95603a;border-radius:99px;background:#ffefc9;color:#423023;box-shadow:0 3px 0 #664023;padding:8px 12px;font:bold 13px system-ui;min-height:44px}
.v28-sound-control:focus-visible{outline:3px solid #146cb8;outline-offset:2px}
@media(min-width:800px){.v28-sound-control{bottom:18px}}
@media(prefers-reduced-motion:reduce){#game .qcard,#game .qopt{animation:none!important;transition:none!important}}
</style>
<button type="button" id="v28SoundToggle" class="v28-sound-control" aria-label="Activer les effets sonores" aria-pressed="false">Son : désactivé</button>
<script id="terra-v28-sound">
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
 const result=document.getElementById('res');if(result){let last='';new MutationObserver(()=>{if(!enabled||result.classList.contains('hidden')||!result.textContent.trim())return;const signature=result.textContent.slice(0,80);if(signature===last)return;last=signature;const match=signature.match(/\\+(\\d+)/),n=match?Number(match[1]):0; if(n>0){note(523,.12,'triangle');note(659,.14,'triangle',.09);note(784,.19,'sine',.19)}else note(300,.12,'sine')}).observe(result,{subtree:true,childList:true,attributes:true})}
})();
</script>
'''
s=s.replace('</body>',insert+'</body>')
p.write_text(s)

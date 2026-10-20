
(function(){'use strict';
function enrich(){
 var home=document.getElementById('home');if(!home||home.classList.contains('hidden'))return;
 var hero=home.querySelector('.v2-hero');if(!hero)return;
 var header=home.querySelector('.v2-heading');
 if(header&&!home.querySelector('.v9-label')){var p=document.createElement('span');p.className='v9-label';p.textContent='🌿 ÉDITION ILLUSTRÉE V9 · BROT2YOU';header.insertAdjacentElement('afterend',p);}
 if(hero.classList.contains('v3-building')&&!home.querySelector('.v9-help')){var info=document.createElement('div');info.className='v9-help';info.innerHTML='🏡 <strong>Ton atelier de village :</strong> choisis une décoration débloquée, puis touche un emplacement « + » sur la carte. Pour la retirer, touche l’objet sans sélection active. Tes choix restent enregistrés sur cet appareil.';hero.insertAdjacentElement('afterend',info);}
 if(hero&&!hero.classList.contains('v3-building')&&!home.querySelector('.v9-shortcuts')){var buttons=document.createElement('nav');buttons.className='v9-shortcuts';buttons.setAttribute('aria-label','Accès rapides Terra Village');buttons.innerHTML='<button data-v9-tab="village-edit">🏡 Décorer mon village</button><button data-v9-tab="missions">🗺️ Toutes les missions</button><button data-v9-tab="brevet">🎓 Académie du Brevet</button><button data-v9-tab="collection">🏆 Mes récompenses</button>';hero.insertAdjacentElement('afterend',buttons);}
 home.querySelectorAll('[data-v9-tab]').forEach(function(btn){btn.onclick=function(){var dest=this.dataset.v9Tab;var original=home.querySelector('[data-nav="'+dest+'"]');if(original){original.click();return;}var nav=home.querySelector('[data-nav="village"]');if(dest==='village-edit'&&nav){nav.click();return;}var link=document.querySelector('[data-t="'+dest+'"]');if(link)link.click();};});
}
var obs=new MutationObserver(function(){if(!document.getElementById('home'))return;requestAnimationFrame(enrich);});
obs.observe(document.getElementById('home'),{childList:true});
requestAnimationFrame(enrich);
})();

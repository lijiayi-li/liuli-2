const BADGE_CONTENT = [
 {name:'识色徽章',lesson:'颜色关',message:'认出鸡油黄，收下一抹亮眼的黄。',icon:'<path d="M 40 18 C 35 29 25 34 25 45 A 15 15 0 0 0 55 45 C 55 34 45 29 40 18 Z"/>'},
 {name:'吹制徽章',lesson:'吹制关',message:'从料团到空腔，吹制的门道记住啦。',icon:'<path d="M 34 19 H 46 M 35 19 V 32 C 35 38 24 41 24 52 Q 24 62 40 62 Q 56 62 56 52 C 56 41 45 38 45 32 V 19 M 33 47 Q 40 41 47 47"/>'},
 {name:'灯工徽章',lesson:'灯工关',message:'一片小花瓣，也藏着塑形的功夫。',icon:'<path d="M 26 55 C 20 31 39 20 57 23 C 59 43 49 62 26 55 Z M 26 55 Q 36 39 50 30"/>'}
];
const POSTCARD_GUIDE='向现场工作人员出示三枚徽章，领取明信片。';
const rewardKnowledge={};
function badgeIcon(i){
 return `<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="36"/><circle cx="40" cy="40" r="30"/>${BADGE_CONTENT[i].icon}</svg>`;
}
function badgeStates(){return [state.complete,blow.complete,lamp.complete];}
function badgeCollection(){
 const owned=badgeStates();
 return `<div class="badge-collection" aria-label="已收集 ${owned.filter(Boolean).length} 枚徽章，共三枚">${BADGE_CONTENT.map((badge,i)=>`<div class="badge-item ${owned[i]?'earned':'locked'}">${badgeIcon(i)}<strong>${badge.name}</strong><small>${owned[i]?'✓ 已获得':'待收集'}</small></div>`).join('')}</div>`;
}
function rewardNextButton(){
 const next=badgeStates().findIndex(complete=>!complete);
 if(next<0)return '<button class="primary" data-reward="postcard">集齐了，去领明信片 →</button>';
 return `<button class="primary" data-reward="next" data-level="${next}">继续${['第一关 · 认颜色','第二关 · 吹制工艺','第三关 · 灯工工艺'][next]} →</button>`;
}
function renderRewards(){
 app.querySelector('#badge-home')?.remove();
 const owned=badgeStates(),count=owned.filter(Boolean).length;
 if(location.hash==='#home'){
  app.classList.add('rewards-home');
  const section=document.createElement('section');section.id='badge-home';section.className='badge-home';
  section.innerHTML=`<div class="badge-home-heading"><h2>我的工艺徽章</h2><span>${count} / 3</span></div>${badgeCollection()}${count===3?'<button class="primary" data-reward="postcard">徽章集齐了，去领明信片 →</button>':'<p>集齐三枚徽章，就可以去领取明信片。</p>'}`;
  app.append(section);return;
 }
 app.classList.remove('rewards-home');
 const level=location.hash==='#color'&&step==='done'?0:location.hash==='#blowing'&&blow.page==='card'&&blow.claimed?1:location.hash==='#lampwork'&&lamp.page==='card'&&lamp.claimed?2:-1;
 if(level<0||!owned[level])return;
 const target=app.querySelector(level===0?'.color-finish':level===1?'.blow-card':'.lamp-card');
 if(!target)return;
 const card=target.querySelector(level===1?'.compact-knowledge':'.lamp-knowledge');
 if(card)rewardKnowledge[level]=card.outerHTML;
 target.classList.add('badge-finish');
 target.innerHTML=`<div class="badge-award" role="status">${badgeIcon(level)}<span>${BADGE_CONTENT[level].lesson}已完成</span><h1>获得${BADGE_CONTENT[level].name}</h1><p>${BADGE_CONTENT[level].message}</p></div><div class="badge-finish-collection"><p>已收集 ${count} / 3 枚</p>${badgeCollection()}</div><div class="badge-finish-actions">${rewardNextButton()}<button class="secondary" data-reward="home">返回首页</button><button class="secondary" ${level===0?'data-action="read"':`data-reward="knowledge" data-level="${level}"`}>再看看知识卡</button></div>`;
}
app.addEventListener('click',event=>{
 const button=event.target.closest('[data-reward]');if(!button)return;
 const action=button.dataset.reward;
 if(action==='home'){location.hash='home';return;}
 if(action==='next'){
  const level=Number(button.dataset.level);
  if(level===0)enter();
  else if(level===1)enterBlow();
  else enterLamp();
  return;
 }
 const dialog=document.querySelector('#viewer');
 if(action==='postcard'){
  if(!badgeStates().every(Boolean))return;
  dialog.querySelector('h2').textContent='三枚徽章，集齐啦！';
  dialog.querySelector('#panel').innerHTML=`<section class="postcard-reward"><div class="postcard-symbol" aria-hidden="true"><svg viewBox="0 0 160 110"><rect x="6" y="8" width="148" height="94" rx="8"/><path d="M 85 23 V 87 M 98 61 H 139 M 98 73 H 133 M 98 85 H 126"/><rect x="121" y="21" width="20" height="24" rx="2"/><path d="M 31 77 C 19 49 41 29 65 33 C 69 60 58 83 31 77 Z M 31 77 Q 40 58 57 43"/></svg></div>${badgeCollection()}<p>${POSTCARD_GUIDE}</p></section>`;
 }else if(action==='knowledge'){
  const level=Number(button.dataset.level);
  dialog.querySelector('h2').textContent=`${BADGE_CONTENT[level].lesson}知识卡`;
  dialog.querySelector('#panel').innerHTML=rewardKnowledge[level]||'';
 }else return;
 dialog.showModal();
});
renderRewards();

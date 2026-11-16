// 通用原理参考 https://allaboutglass.cmog.org/definition/flameworking
// 花卉灯工参考 https://blog.cmog.org/2024/flowery-flameworked-fun-glass-florist
// 花瓣夹压工具与离焰使用参考 https://lamp.work/products/47/
// 归一化框选范围 [x, y, width, height]，对应下方原图尺寸。
const LAMP_CONTENT = {
 images:{display:'assets/lampwork-display.jpg?v=20261116-31',panel:'assets/lampwork-panel.jpg?v=20261116-31'},
 imageSizes:{display:[1086,1448],panel:[1536,1024]},
 bounds:{flower:[.145,.63,.185,.135],petal:[.162,.685,.085,.05],leaves:[.19,.695,.135,.07]},
 steps:[
  {name:'加热',description:'先加热需要加工的部位，让它变软。'},
  {name:'塑形',description:'趁材料柔软，用工具调整形状，做出花瓣。'},
  {name:'成型',description:'花瓣成形了，看看它的轮廓。'}
 ],
 notes:{general:'工艺示意 · 介绍一般原理',formed:'成形展示 · 同一片花瓣'},
 observations:{petal:['看花瓣','看看花瓣的边缘和弯曲形状。'],leaves:['看枝叶','看看细小部件怎样组成整体造型。']},
 knowledge:[['材料','琉璃棒等材料'],['工具','喷灯、镊子等'],['关键方法','局部加热，使材料软化后进行塑形。'],['认识的细节','花瓣、枝叶等小造型']],
 connection:'刚才的吹制示意，重点是吹出内部空腔；这次的灯工示意，重点是局部加热与细节塑形。'
};
// 与前两关一致，每次重新打开从首页开始，同次体验内保留进度。
let lamp={page:'locate',viewed:[],claimed:false,complete:false};
let lampSelected=-1,lampFrame=0,lampFullPlayback=false;
function saveLamp(){try{localStorage.setItem('liuli-lampwork-v1',JSON.stringify(lamp))}catch{}}
function stopLamp(){cancelAnimationFrame(lampFrame);lampFrame=0;}
function lampPhoto(kind='display'){
 const box=kind==='display'?LAMP_CONTENT.bounds.flower:null;
 const [width,height]=LAMP_CONTENT.imageSizes[kind];
 const mark=box?`<svg class="lamp-photo-mark" viewBox="0 0 ${width} ${height}" aria-hidden="true"><rect x="${box[0]*width}" y="${box[1]*height}" width="${box[2]*width}" height="${box[3]*height}" rx="8"/></svg>`:'';
 return `<button class="lamp-photo" data-lamp="photo" data-kind="${kind}" aria-label="放大${kind==='panel'?'三阶段展板':'黄色花卉展柜'}照片"><img src="${LAMP_CONTENT.images[kind]}" alt="${kind==='panel'?'加热、塑形、成型三阶段展板':'黄色花卉所在展柜'}" onerror="this.hidden=true;this.parentElement.classList.add('missing-photo');this.nextElementSibling.hidden=false"><span class="lamp-photo-fallback" hidden>${kind==='panel'?'请看现场的三阶段工艺图':'请在展柜中寻找左下方的黄色花卉'}<small>现场照片待补充</small></span>${mark}</button>`;
}
function lampPetal(pressed=0,pulled=0,turned=0){
 // 侧面先压薄、轻拉。最后绕长轴转向正面，展示花瓣的宽面。
 const length=36+18*pressed+14*pulled;
 const thickness=14-6*pressed-pulled;
 const width=thickness+(20-thickness)*turned,end=222+length;
 return `M 222 128 C 230 128 ${230+8*turned} ${134-width} ${end-14} ${134-width} Q ${end} ${134-width} ${end} 134 Q ${end} ${134+width} ${end-14} ${134+width} C ${230+8*turned} ${134+width} 230 140 222 140 Z`;
}
function lampScene(){
 return `<svg viewBox="0 0 420 260" role="img" aria-labelledby="lamp-svg-title lamp-svg-description"><title id="lamp-svg-title">灯工工艺示意</title><desc id="lamp-svg-description">琉璃棒末端局部加热，再由工具塑成花瓣，最后展示同一片成形的花瓣。</desc><defs><linearGradient id="lamp-glass" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff1ad"/><stop offset=".45" stop-color="#f4ce58"/><stop offset="1" stop-color="#d4a62f"/></linearGradient><radialGradient id="lamp-hot"><stop stop-color="#ffe2a1"/><stop offset="1" stop-color="#ef9554"/></radialGradient><linearGradient id="lamp-flame" x2="0" y2="1"><stop stop-color="#c5eff4" stop-opacity=".25"/><stop offset=".7" stop-color="#68b9d5" stop-opacity=".75"/><stop offset="1" stop-color="#327ca3"/></linearGradient></defs><text id="lamp-phase" x="402" y="25" text-anchor="end" class="lamp-svg-caption"></text><g id="lamp-workshop"><path d="M 22 239 H 398" stroke="#d8d5ca" stroke-width="2"/><g id="lamp-torch"><path d="M 234 231 L 238 217 H 272 L 277 231 Z" fill="#647b79" stroke="#425d5b" stroke-width="2"/><rect x="248" y="193" width="14" height="26" rx="3" fill="#8fa19d" stroke="#425d5b" stroke-width="2"/><ellipse cx="255" cy="193" rx="9" ry="4" fill="#4a6261"/><path d="M 247 192 Q 238 168 255 120 Q 273 167 263 192 Z" fill="url(#lamp-flame)"/><path d="M 252 192 Q 247 177 255 162 Q 263 177 258 192 Z" fill="#b6e6f2"/></g><g id="lamp-material"><path d="M 84 128 H 222 V 140 H 84 Q 78 134 84 128 Z" fill="url(#lamp-glass)" stroke="#a98934" stroke-width="1.6"/><path id="lamp-tip" d="${lampPetal(0)}" fill="url(#lamp-glass)" stroke="#a98934" stroke-width="1.6"/><path id="lamp-tip-heat" d="${lampPetal(0)}" fill="url(#lamp-hot)" opacity="0"/><path d="M 91 131 H 198" stroke="#fff7d4" stroke-width="2" opacity=".7"/></g><g id="lamp-masher" opacity="0" stroke="#4c6261" stroke-width="2" stroke-linejoin="round"><path id="lamp-masher-arms" fill="none" stroke-width="5"/><rect id="lamp-plate-top" width="56" height="7" rx="2" fill="#b3c2bc"/><rect id="lamp-plate-bottom" width="56" height="7" rx="2" fill="#b3c2bc"/></g><g id="lamp-tweezers" opacity="0" fill="none" stroke="#586b6a" stroke-width="4" stroke-linecap="round"><path id="lamp-jaw-top"/><path id="lamp-jaw-bottom"/><path id="lamp-tweezer-bend"/></g></g><g id="lamp-finished-petal" opacity="0"><path d="${lampPetal(1,1,1)}" transform="translate(-62 0)" fill="url(#lamp-glass)" stroke="#a98934" stroke-width="1.6"/></g></svg>`;
}
function drawLamp(i,p){
 const svg=document.querySelector('#lamp-scene svg');if(!svg)return;
 const part=id=>svg.querySelector('#lamp-'+id);
 const ease=t=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v)};
 part('workshop').setAttribute('opacity','1');part('finished-petal').setAttribute('opacity','0');
 part('material').setAttribute('transform','translate(0 0)');
 part('masher').setAttribute('opacity','0');part('tweezers').setAttribute('opacity','0');
 part('tip').setAttribute('d',lampPetal(0));part('tip-heat').setAttribute('d',lampPetal(0));
 part('tip-heat').setAttribute('opacity',i===0?.7*ease(p):.7*(1-ease(p)));
 if(i===0){
  part('material').setAttribute('transform',`translate(${-48*(1-ease(p/.4))} 0)`);
  part('phase').textContent='① 加热 · 只暖末端';
 }
 if(i===1){
  const shift=-62*ease(p/.15);
  const approach=ease((p-.15)/.15),pressed=ease((p-.30)/.20);
  const withdraw=ease((p-.50)/.10),grip=ease((p-.60)/.08);
  const pulled=ease((p-.68)/.15),release=ease((p-.83)/.07);
  const turned=ease((p-.90)/.10);
  part('material').setAttribute('transform',`translate(${shift} 0)`);
  const outline=lampPetal(pressed,pulled,turned);
  part('tip').setAttribute('d',outline);part('tip-heat').setAttribute('d',outline);
  // 两块平夹面先合拢到料团上下表面，接触后才开始压薄。
  const gap=20*(1-approach)+24*withdraw;
  const top=120+6*pressed-gap,bottom=148-6*pressed+gap;
  const plateX=234+shift;
  part('masher').setAttribute('opacity',p>=.15&&p<.60?approach*(1-withdraw):0);
  part('plate-top').setAttribute('x',plateX);part('plate-top').setAttribute('y',top-7);
  part('plate-bottom').setAttribute('x',plateX);part('plate-bottom').setAttribute('y',bottom);
  part('masher-arms').setAttribute('d',`M ${plateX+56} ${top-3.5} Q ${plateX+59} 54 ${plateX+120} 48 Q ${plateX+140} 58 ${plateX+120} 68 Q ${plateX+70} 74 ${plateX+56} ${bottom+3.5}`);
  // 细镊尖在外端两侧闭合，拉伸期间随接触点移动，松开后撤走。
  const contact=222+shift+36+18*pressed+14*pulled-4;
  const half=(14-6*pressed-pulled)*.78;
  const opening=18*(1-grip)+22*release;
  const tipX=contact,upper=134-half-opening,lower=134+half+opening;
  part('tweezers').setAttribute('opacity',p>=.60&&p<.90?ease((p-.60)/.04)*(1-release):0);
  part('jaw-top').setAttribute('d',`M ${tipX+96} 55 Q ${tipX+32} 68 ${tipX} ${upper}`);
  part('jaw-bottom').setAttribute('d',`M ${tipX+96} 75 Q ${tipX+32} 93 ${tipX} ${lower}`);
  part('tweezer-bend').setAttribute('d',`M ${tipX+96} 55 Q ${tipX+112} 65 ${tipX+96} 75`);
  part('phase').textContent=p<.15?'② 塑形 · 移出火焰':p<.30?'② 塑形 · 工具靠近':p<.50?'② 塑形 · 夹住、压薄':p<.60?'② 塑形 · 松开夹面':p<.68?'② 塑形 · 夹住前端':p<.83?'② 塑形 · 轻轻拉长':p<.90?'② 塑形 · 松开镊子':'② 塑形 · 转动展示宽面';
 }
 if(i===2){
  const reveal=ease(p/.25);
  part('material').setAttribute('transform','translate(-62 0)');
  part('tip').setAttribute('d',lampPetal(1,1,1));
  part('tip-heat').setAttribute('opacity','0');
  part('workshop').setAttribute('opacity',1-reveal);
  part('finished-petal').setAttribute('transform','translate(0 0)');
  part('finished-petal').setAttribute('opacity',reveal);
  part('phase').textContent='③ 成型 · 看看这片花瓣';
 }
}
function updateLampProgress(){
 document.querySelector('#lamp-progress').textContent=`已查看 ${lamp.viewed.length} / 3 步`;
 document.querySelectorAll('[data-lamp="select"]').forEach(button=>{
  const i=Number(button.dataset.index);
  button.setAttribute('aria-pressed',String(lampSelected===i));
  button.querySelector('small').textContent=lamp.viewed.includes(i)?'✓ 已查看':'点击查看';
 });
}
function finishLamp(){
 stopLamp();if(lampSelected<0||lamp.page!=='steps')return;
 drawLamp(lampSelected,1);
 if(!lamp.viewed.includes(lampSelected))lamp.viewed.push(lampSelected);
 saveLamp();updateLampProgress();
 if(lampFullPlayback){
  if(lampSelected<LAMP_CONTENT.steps.length-1)playLamp(lampSelected+1);
  else{lamp.page='card';renderLamp();}
 }
}
function playLamp(i){
 stopLamp();lampSelected=i;
 document.querySelector('#lamp-scene').innerHTML=lampScene();
 document.querySelector('#lamp-title').textContent=`${i+1} ${LAMP_CONTENT.steps[i].name}`;
 document.querySelector('#lamp-description').textContent=LAMP_CONTENT.steps[i].description;
 document.querySelector('#lamp-note').textContent=i===2?LAMP_CONTENT.notes.formed:LAMP_CONTENT.notes.general;
 updateLampProgress();drawLamp(i,0);
 const start=performance.now();
 function tick(now){const p=Math.min(1,(now-start)/4000);drawLamp(i,p);if(p<1)lampFrame=requestAnimationFrame(tick);else finishLamp();}
 lampFrame=requestAnimationFrame(tick);
}
function renderLamp(){
 stopLamp();lampFullPlayback=false;app.classList.remove('blowing');app.classList.add('lampworking');
 let body='';
 if(lamp.page==='locate')body=`<span class="eyebrow">现场寻找 · 黄色花卉</span><h1>这些小花瓣，<br>是怎样做出来的？</h1><p>找到展柜左下方的黄色花卉，看看它的花瓣和细细的枝条。</p>${lampPhoto()}<p class="lamp-photo-hint">点照片可以放大，也可以对照照片继续。</p><button class="primary" data-lamp="panel">看看花瓣怎样做出来 →</button>`;
 if(lamp.page==='panel')body=`<h1>灯工工艺入门课</h1><p>抬头仔细看看展柜上方的展板，按①到③观察每一步。</p><ol class="lamp-order" aria-label="现场展板的三个阶段">${LAMP_CONTENT.steps.map((step,i)=>`<li><span>${i+1}</span><strong>${step.name}</strong></li>`).join('')}</ol><details class="lamp-panel"><summary>展板看不清？展开照片</summary>${lampPhoto('panel')}</details><button class="primary" data-lamp="steps">还有点懵？那看看动画吧</button><button class="secondary" data-lamp="card">看明白了，去看知识卡 →</button>`;
 if(lamp.page==='steps')body=`<h1>从一段琉璃，到一片花瓣</h1><p>动画会依次播放，也能点选某一步回看。</p><button class="lamp-back-panel" data-lamp="panel">← 回看展板</button><section class="lamp-animation"><div class="lamp-animation-heading"><h2 id="lamp-title"></h2><span>工艺示意</span></div><div id="lamp-scene"></div><p id="lamp-description"></p><p id="lamp-note"></p><div class="lamp-controls"><button data-lamp="replay">从头再看</button><button data-lamp="result">直接看结果</button></div></section><div class="lamp-step-buttons">${LAMP_CONTENT.steps.map((s,i)=>`<button data-lamp="select" data-index="${i}" aria-pressed="false"><strong>${i+1} ${s.name}</strong><small>点击查看</small></button>`).join('')}</div><p id="lamp-progress" role="status"></p><button class="primary" id="lamp-card-next" data-lamp="card">下一步 · 看知识卡 →</button>`;
 if(lamp.page==='card')body=`<section class="lamp-knowledge"><span class="eyebrow">灯工知识卡</span><h1>灯工<br>在火焰前塑造细节</h1><dl>${LAMP_CONTENT.knowledge.map(([term,value])=>`<div><dt>${term}</dt><dd>${value}</dd></div>`).join('')}</dl><p>${LAMP_CONTENT.connection}</p></section>${lamp.claimed?'<p class="success" role="status">✓ 灯工关已完成</p>':'<button class="primary" data-lamp="claim">收下灯工知识卡</button>'}<button class="${lamp.claimed?'primary':'secondary'}" data-lamp="home">返回首页</button><button class="secondary" data-lamp="steps">回看三个步骤</button>`;
 app.innerHTML=`<nav><button data-lamp="home">← 首页</button><span class="tag">第三关 · 灯工工艺</span></nav><section class="lamp-viewport lamp-${lamp.page}">${body}</section>`;
 if(lamp.page==='steps'){lampFullPlayback=true;playLamp(0);}
 saveLamp();window.scrollTo(0,0);
 if(typeof renderRewards==='function')renderRewards();
}
function openLampPhoto(kind){
 const detail=LAMP_CONTENT.observations[kind],imageKind=kind==='panel'?'panel':'display';
 document.querySelector('#viewer h2').textContent=detail?detail[0]:kind==='panel'?'三阶段工艺展板':'黄色花卉';
 const box=kind==='panel'?null:LAMP_CONTENT.bounds[detail?kind:'flower'];
 const [width,height]=LAMP_CONTENT.imageSizes.display;
 const crop=box?box.map((value,i)=>value*(i%2===0?width:height)):null;
 const image=crop?`<svg class="lamp-crop" viewBox="${crop.join(' ')}" style="aspect-ratio:${crop[2]}/${crop[3]}" role="img" aria-label="${detail?detail[0]:'黄色花卉'}局部"><image href="${LAMP_CONTENT.images.display}" width="${width}" height="${height}"/></svg>`:lampPhoto(imageKind);
 document.querySelector('#panel').innerHTML=(detail?`<p>${detail[1]}</p>`:'')+image+`<a class="lamp-original" href="${LAMP_CONTENT.images[imageKind]}" target="_blank" rel="noopener">查看${imageKind==='panel'?'展板':'展柜'}原图 ↗</a>`;
 document.querySelector('#viewer').showModal();
}
function enterLamp(){location.hash='lampwork';}
app.addEventListener('toggle',event=>{
 if(!event.target.matches('.lamp-panel'))return;
 if(event.target.open)stopLamp();
 else if(lamp.page==='steps')playLamp(lampSelected<0?0:lampSelected);
},true);
app.addEventListener('click',event=>{
 const button=event.target.closest('[data-lamp]');if(!button)return;
 const action=button.dataset.lamp;
 if(action==='enter'){enterLamp();return;}
 if(action==='home'){stopLamp();lampFullPlayback=false;saveLamp();location.hash='home';return;}
 if(action==='photo'||action==='detail'){openLampPhoto(button.dataset.kind);return;}
 if(action==='select'){lampFullPlayback=false;playLamp(Number(button.dataset.index));return;}
 if(action==='replay'){lampFullPlayback=true;playLamp(0);return;}
 if(action==='result'){lampFullPlayback=false;finishLamp();return;}
 if(action==='claim'){lamp.claimed=true;lamp.complete=true;lamp.page='card';}
 else if(['panel','steps','card'].includes(action))lamp.page=action;
 renderLamp();
});
const beforeLampRender=render;
render=function(){
 if(location.hash==='#lampwork'){stopBlowAnimation();blowFullPlayback=false;renderLamp();return;}
 stopLamp();lampFullPlayback=false;app.classList.remove('lampworking');beforeLampRender();
 if(location.hash==='#home'){
  const card=app.querySelectorAll('.home-card')[2];card.disabled=false;
  card.innerHTML=`<strong>第三关 · 灯工工艺 →</strong><small>${lamp.complete?'✓ 已完成':lamp.viewed.length||lamp.page!=='locate'?'进行中':'未开始'} · 约 1—2 分钟</small>`;
  card.onclick=enterLamp;
 }
};
saveLamp();render();

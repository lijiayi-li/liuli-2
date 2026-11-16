const BLOW_CONTENT = {
 locationGuide:'沿新辉厅展线找《凝露》，认认它的细瓶颈、鼓肚子。',
 panelSpots:[[220,675],[470,340],[710,675],[950,340],[1225,675]],
 colorNotes:{gather:'橙黄色是高温发光。冷下来，热光就淡了。',heating:'回炉加温，热光更亮。',cooling:'浅冰蓝为示意色，实际颜色看成分。时间已简化。'},
 images:{exhibit:'assets/ninglu.jpg?v=20261116-31',panel:'assets/blowing-panel.jpg?v=20261116-32'},
 steps:[
 ['取料、蘸料','空管进去，带料出来。开工！'],
 ['吹制','空气进来，料团鼓起来，里面的空腔也变大。'],
 ['加温','回再加热炉暖一暖，方便接着加工。'],
 ['塑形','先调整轮廓、整平底部，再转接接棒修整瓶口。'],
 ['退温','工件离杆后放稳在炉内搁板上，保温后慢慢降温。']]
};
const blowKey='liuli-blowing-v1';
let blow={page:'locate',viewed:[],claimed:false,complete:false};
let blowSelected=-1,blowTimer;
function saveBlow(){try{localStorage.setItem(blowKey,JSON.stringify(blow))}catch{}}
function blowPhoto(kind){return `<button class="blow-photo" data-blow="photo" data-kind="${kind}"><img src="${BLOW_CONTENT.images[kind]}" alt="${kind==='exhibit'?'《凝露》完整瓶形照片':'五步工艺展板原图'}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden>照片待补充 · ${kind==='exhibit'?'《凝露》':'现场工艺展板'}</span></button>`}
// 通用设备结构参考：康宁玻璃博物馆及 Wet Dog Glass 制造商资料。
// https://allaboutglass.cmog.org/definition/furnace
// https://allaboutglass.cmog.org/definition/glory-hole
// https://wdg-us.com/products/furnaces/
// https://wdg-us.com/products/glory-holes/
// 木拍整平底部、吹管中空、接棒实心：https://libanswers.cmog.org/faq/143658
// 转接实心接棒与离杆工艺 https://www.allardpierson.nl/blog/documenting-physical-evidence-of-roman-glass-making-processes
// 接棒是实心杆 https://allaboutglass.cmog.org/definition/pontil
// 内腔与外壁共用同一轮廓函数，内腔始终保留向内的壁厚。
function blowHalfWidth(x,rx,ry,neck,mouth){
 const root=180,shoulder=root+14,center=root+rx;
 if(x<=shoulder){
  const t=(x-root)/14;
  return mouth+(neck-mouth)*t*t*(3-2*t);
 }
 if(x<=center){
  const t=(x-shoulder)/(center-shoulder);
  return neck+(ry-neck)*t*t*(3-2*t);
 }
 const t=(x-center)/rx;
 return ry*Math.sqrt(Math.max(0,1-t*t));
}
function blowGeometry(rx,ry,neck=8,inset=0,mouth=9,baseInset=0){
 const first=180+inset,last=180+2*rx-baseInset-inset;
 const count=120;
 const upper=[],lower=[];
 for(let n=0;n<=count;n++){
  const x=first+(last-first)*n/count;
  let width=blowHalfWidth(x,rx,ry,neck,mouth);
  if(inset>0){
   const cap=Math.sqrt(Math.max(0,Math.min(1,(x-first)/inset,(last-x)/inset)));
   width=Math.max(0,width-inset)*cap;
  }
  upper.push(x.toFixed(3)+' '+(185-width).toFixed(3));
  lower.push(x.toFixed(3)+' '+(185+width).toFixed(3));
 }
 return 'M'+upper.join('L')+'L'+lower.reverse().join('L')+'Z';
}
function blowGlass(){
 const outline=blowGeometry(24,20);
 return '<g data-part="glass"><defs><clipPath id="glass-outline"><path data-part="glass-clip" d="'+outline+'"/></clipPath></defs><path data-part="outer" d="'+outline+'" fill="url(#workpiece-glass)" stroke="#a76536" stroke-width="2"/><g clip-path="url(#glass-outline)"><path data-part="cavity" d="'+blowGeometry(24,20,8,16)+'" fill="#fff9e9" stroke="#b77e4d" stroke-width="1.5" opacity="0"/><path data-part="air-channel" d="M180 185H228" stroke="#fff9e9" stroke-width="3" opacity="0"/><path data-part="highlight" d="M204 170Q212 166 218 174" fill="none" stroke="#fff9e3" stroke-width="3" stroke-linecap="round"/></g><ellipse data-part="mouth-rim" cx="181.5" cy="185" rx="2.5" ry="7" fill="#fff9e9" stroke="#b77e4d" stroke-width="1.5" opacity="0"/></g>';
}
const BLOW_HEAT_COLORS={
 hot:[[255,245,186],[249,162,62],[190,78,27]],
 working:[[243,213,161],[208,141,83],[149,92,51]],
 cooled:[[247,252,255],[207,232,247],[119,162,192]]
};
function paintBlowGlass(part,from,to,amount){
 ['glass-light','glass-mid','glass-edge'].forEach((name,index)=>{
  const color=from[index].map((value,channel)=>Math.round(value+(to[index][channel]-value)*amount));
  part(name).setAttribute('stop-color','rgb('+color.join(',')+')');
 });
 const edge=from[2].map((value,channel)=>Math.round(value+(to[2][channel]-value)*amount));
 part('outer').setAttribute('stroke','rgb('+edge.join(',')+')');
 part('mouth-rim').setAttribute('stroke','rgb('+edge.join(',')+')');
}
function blowMeltingFurnace(){
 return '<g data-part="melting-furnace"><path d="M340 58H600V307H340Z" fill="#ac8d70" stroke="#765d47" stroke-width="4"/><path d="M340 58L359 40H619V287L600 307V58Z" fill="#ceb89d"/><path d="M345 78H594M345 291H594" stroke="#8c7057" stroke-width="4"/><rect x="357" y="92" width="230" height="190" rx="8" fill="#73482c" stroke="#e2c298" stroke-width="8"/><rect x="368" y="103" width="208" height="168" fill="url(#furnace-light)"/><path d="M381 181H581L557 265Q482 294 405 265Z" fill="#ac8462" stroke="#78583d" stroke-width="4"/><ellipse cx="481" cy="182" rx="100" ry="15" fill="#ddbd94" stroke="#78583d" stroke-width="3"/><path d="M397 188H565L548 254Q480 277 414 254Z" fill="url(#molten)"/><ellipse cx="481" cy="188" rx="84" ry="10" fill="#ffd68a"/><text x="481" y="243" text-anchor="middle" class="equipment-label">坩埚内的玻璃液</text><path d="M350 311V327M591 311V327" stroke="#705b47" stroke-width="9"/><text x="481" y="345" text-anchor="middle" class="equipment-label">熔炉 · 坩埚剖面</text></g>';
}
function blowReheatingFurnace(){
 return '<g data-part="reheating-furnace"><path d="M360 75H525C625 75 625 295 525 295H360Z" fill="#718079" stroke="#45554e" stroke-width="4"/><path d="M379 89H521Q588 89 596 159" fill="none" stroke="#9eaba3" stroke-width="7"/><rect x="360" y="102" width="210" height="166" rx="24" fill="url(#furnace-light)" stroke="#cfb391" stroke-width="6"/><ellipse cx="360" cy="185" rx="42" ry="110" fill="#b4a58e" stroke="#4c5b53" stroke-width="5"/><ellipse cx="360" cy="185" rx="29" ry="88" fill="url(#furnace-light)" stroke="#ddc29c" stroke-width="7"/><path d="M390 299V323M554 299V323M377 325H404M541 325H568" stroke="#45554e" stroke-width="9"/><text x="481" y="345" text-anchor="middle" class="equipment-label">再加热炉</text></g>';
}
// 前景炉体遮住已伸入炉腔的工件，炉口保留可见的受热空间。
function blowReheatingFront(){
 return '<defs><mask id="reheating-front-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="360"><rect width="640" height="360" fill="white"/><ellipse cx="360" cy="185" rx="29" ry="88" fill="black"/><rect x="0" y="0" width="360" height="360" fill="black"/></mask></defs><g data-part="reheating-front" mask="url(#reheating-front-mask)"><path d="M360 75H525C625 75 625 295 525 295H360Z" fill="#718079" stroke="#45554e" stroke-width="4"/><path d="M379 89H521Q588 89 596 159" fill="none" stroke="#9eaba3" stroke-width="7"/><path d="M395 282H521Q583 282 597 220" fill="none" stroke="#52665b" stroke-width="5"/><ellipse cx="360" cy="185" rx="42" ry="110" fill="#b4a58e" stroke="#4c5b53" stroke-width="5"/><ellipse cx="360" cy="185" rx="29" ry="88" fill="none" stroke="#ddc29c" stroke-width="7"/></g>';
}
// 箱式退火炉内部示意，炉衬与搁板参考 https://wdg-us.com/products/ovens/annealing-ovens/
function blowAnnealer(){
 return '<g data-part="annealing-oven" aria-label="箱式退火炉内部示意"><rect x="290" y="60" width="315" height="242" rx="12" fill="#aea69a" stroke="#716c63" stroke-width="3"/><rect x="311" y="82" width="272" height="191" rx="6" fill="#d7c8ad" stroke="#e7decb" stroke-width="8"/><rect data-part="warm" x="315" y="86" width="264" height="183" rx="4" fill="#eea05a" opacity=".35"/><path d="M320 250H574" stroke="#827762" stroke-width="7"/><g data-part="upright-workpiece" transform="translate(220 18.5) rotate(90 228 185)">'+blowGlass()+'</g><rect x="311" y="82" width="272" height="191" rx="6" fill="none" stroke="#8e8372" stroke-dasharray="7 5" stroke-width="2"/><path d="M312 306V327M583 306V327" stroke="#716c63" stroke-width="10"/><text x="449" y="334" text-anchor="middle" class="equipment-label">平底器物直立示意</text><text x="448" y="119" text-anchor="middle" class="equipment-label">退火炉</text><text data-part="cooling-phase" x="448" y="145" text-anchor="middle" class="equipment-label">保温</text></g>';
}
function blowScene(i){
 const title=i<0?'工艺示意':BLOW_CONTENT.steps[i][0];
 const camera=i===1?'0 105 350 200':i===3?'0 30 470 300':i===4?'230 55 470 300':'0 0 640 360';
 return '<svg viewBox="'+camera+'" role="img" aria-label="'+title+'，工具与设备动作示意"><defs><linearGradient id="workpiece-glass" x1="0" y1="0" x2=".8" y2="1"><stop data-part="glass-light" stop-color="#fff5ba"/><stop data-part="glass-mid" offset=".4" stop-color="#f9a23e"/><stop data-part="glass-edge" offset="1" stop-color="#be4e1b"/></linearGradient><linearGradient id="molten" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff2bc"/><stop offset=".3" stop-color="#f5bd6b"/><stop offset=".75" stop-color="#d67c38"/><stop offset="1" stop-color="#99512e"/></linearGradient><linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d8d9d1"/><stop offset=".4" stop-color="#7b817b"/><stop offset=".65" stop-color="#4b514d"/><stop offset="1" stop-color="#9caaa0"/></linearGradient><radialGradient id="furnace-light"><stop stop-color="#fff3b0"/><stop offset=".65" stop-color="#f5b268"/><stop offset="1" stop-color="#bd6c37"/></radialGradient></defs><rect x="0" y="0" width="800" height="400" rx="12" fill="#fffaf0"/><text x="'+(i===4?240:20)+'" y="'+(i===1?125:i===3?52:i===4?79:32)+'" class="process-title">'+title+'</text><path d="M15 330H625" stroke="#e7decb" stroke-width="2"/>'+
 (i===0?blowMeltingFurnace():i===2?blowReheatingFurnace():'')+
 (i===4?blowAnnealer():
 '<g data-part="moving"><g data-part="pipe"><path data-part="pipe-outline" d="M24 185H181" stroke="#68796f" stroke-width="20" stroke-linecap="round"/><path data-part="pipe-body" d="M24 185H181" stroke="#ffffff" stroke-width="14" stroke-linecap="round"/><ellipse cx="24" cy="185" rx="5" ry="10" fill="#ffffff" stroke="#68796f" stroke-width="2"/><ellipse data-part="pipe-bore" cx="24" cy="185" rx="2.7" ry="6" fill="#365b50"/></g>'+blowGlass()+
 (i===1?'<path data-part="air" d="M30 185H178" stroke="#4a9683" stroke-width="3" stroke-dasharray="10 10"/><path d="M161 178L174 185L161 192" fill="none" stroke="#4a9683" stroke-width="3"/>':'')+'</g>'+
 (i===0?'<text data-part="gather-phase" x="160" y="313" text-anchor="middle" class="equipment-label">空吹管入炉</text>':'')+
 (i===1?'<text x="100" y="151" text-anchor="middle" class="equipment-label">中空吹管 · 吹入空气 →</text><path d="M65 161L85 178" stroke="#8c7651" fill="none"/><text x="175" y="274" text-anchor="middle" class="equipment-label">鼓起来，空腔变大</text>':i===3?'<g data-part="tool"><path data-part="upper-jaw" d="M340 85Q356 75 347 62Q339 51 327 65L272 117L194 169" stroke="url(#metal)" stroke-width="6" fill="none" stroke-linecap="round"/><path data-part="lower-jaw" d="M340 85L320 250L260 255L194 201" stroke="url(#metal)" stroke-width="6" fill="none" stroke-linecap="round"/></g><text data-part="tool-label" x="392" y="83" class="equipment-label">塑形钳</text><g data-part="blowpipe-label"><text x="105" y="270" text-anchor="middle" class="equipment-label">中空吹管</text><path d="M104 250V201" stroke="#8c7651" stroke-width="1.5"/></g><g data-part="base-paddle"><rect x="0" y="151" width="11" height="68" rx="3" fill="#967047" stroke="#624a32" stroke-width="2"/><path d="M11 185H44" stroke="#967047" stroke-width="10" stroke-linecap="round"/><text x="22" y="282" text-anchor="middle" class="equipment-label">木拍整平底部</text></g><g data-part="punty" opacity="0"><path d="M270 185H440" stroke="#65746b" stroke-width="10" stroke-linecap="round"/><path d="M276 182H437" stroke="#a8b5a9" stroke-width="2"/><ellipse cx="270" cy="185" rx="6" ry="8" fill="#e9aa61" stroke="#a76536" stroke-width="1.5"/><text x="365" y="238" text-anchor="middle" class="equipment-label">接棒（实心棒）</text><ellipse data-part="punty-end" cx="440" cy="185" rx="3" ry="5" fill="#65746b" stroke="#46574d" stroke-width="1.5"/><path d="M365 218V197" stroke="#8c7651" stroke-width="1.5"/></g><text data-part="shaping-phase" x="235" y="315" text-anchor="middle" class="equipment-label">先在吹管上塑形</text>':i===0||i===2?'<text x="92" y="279" text-anchor="middle" class="equipment-label">吹管</text><path data-part="pipe-leader" d="M92 259V203" stroke="#8c7651" stroke-width="1.5"/>':'') )+(i===2?blowReheatingFront():'')+'</svg>';
}
let blowFrame=0;
function stopBlowAnimation(){clearTimeout(blowTimer);cancelAnimationFrame(blowFrame);}
function drawBlowFrame(i,progress){
 const svg=document.querySelector('#blow-scene svg');if(!svg)return;
 const eased=progress*progress*(3-2*progress);
 const part=name=>svg.querySelector('[data-part="'+name+'"]');
 let rx=24,ry=20,neck=8,mouth=9,baseInset=0;
 if(i===1){rx=24+24*eased;ry=20+18*eased;}
 if(i>=2){rx=48;ry=38;}
 const shapingProgress=Math.min(1,progress/.25);
 const shaping=shapingProgress*shapingProgress*(3-2*shapingProgress);
 const flattenProgress=Math.max(0,Math.min(1,(progress-.1)/.15));
 const flatten=flattenProgress*flattenProgress*(3-2*flattenProgress);
 const finishingProgress=Math.max(0,Math.min(1,(progress-.78)/.22));
 const finishing=finishingProgress*finishingProgress*(3-2*finishingProgress);
 if(i===3){neck=8-4*shaping;mouth=9+3*finishing;baseInset=6*flatten;}
 if(i===4){neck=4;mouth=12;baseInset=6;}
 const outline=blowGeometry(rx,ry,neck,0,mouth,baseInset);
 part('outer').setAttribute('d',outline);
 part('glass-clip').setAttribute('d',outline);
 const inset=Math.min(ry-4,rx-4,8+(1-eased)*20);
 part('cavity').setAttribute('d',blowGeometry(rx,ry,neck,inset,mouth,baseInset));
 part('cavity').setAttribute('opacity',i===1?'1':'0');
 part('air-channel').setAttribute('opacity',i===1?'1':'0');
 part('air-channel').setAttribute('d','M180 185H'+(180+rx));
 part('highlight').setAttribute('d','M'+(180+rx*.95)+' '+(185-ry*.75)+'Q'+(180+rx*1.3)+' '+(185-ry*.92)+' '+(180+rx*1.6)+' '+(185-ry*.55));
 part('highlight').setAttribute('opacity',i===1?'0':'1');
 part('mouth-rim').setAttribute('opacity',i===4?'1':'0');
 part('mouth-rim').setAttribute('ry',mouth-2);
 const colors=BLOW_HEAT_COLORS;
 if(i===0){
  const insertion=Math.min(1,progress/.3);
  const withdrawal=Math.max(0,Math.min(1,(progress-.55)/.45));
  const insertionEase=insertion*insertion*(3-2*insertion);
  const withdrawalEase=withdrawal*withdrawal*(3-2*withdrawal);
  const shift=260*insertionEase*(1-withdrawalEase);
  const gathered=Math.max(0,Math.min(1,(progress-.3)/.25));
  part('moving').setAttribute('transform','translate('+shift+' 0)');
  part('glass').setAttribute('opacity',gathered);
  part('pipe-leader').setAttribute('d','M92 259L'+(92+shift)+' 198');
  part('gather-phase').textContent=progress<.3?'空吹管入炉':progress<.55?'转动吹管取料':'带料出炉';
  paintBlowGlass(part,colors.hot,colors.hot,0);
 }
 if(i===1){
  part('air').setAttribute('stroke-dashoffset',-progress*120);
  paintBlowGlass(part,colors.hot,colors.working,eased);
 }
 if(i===2){
  const shift=Math.sin(Math.PI*progress)**2*250;
  const heating=Math.min(1,progress/.65);
  part('moving').setAttribute('transform','translate('+shift+' 0)');
  part('pipe-leader').setAttribute('d','M92 259L'+(92+shift)+' 198');
  paintBlowGlass(part,colors.working,colors.hot,heating);
 }
 if(i===3){
  const transfer=Math.max(0,Math.min(1,(progress-.32)/.18));
  const transferEase=transfer*transfer*(3-2*transfer);
  const detach=Math.max(0,Math.min(1,(progress-.51)/.13));
  const detachEase=detach*detach*(3-2*detach);
  const toolRelease=Math.max(0,Math.min(1,(progress-.2)/.1));
  const toolApproach=Math.max(0,Math.min(1,(progress-.66)/.12));
  part('upper-jaw').setAttribute('d','M340 85Q356 75 347 62Q339 51 327 65L272 117L194 '+(169+12*shaping));
  part('lower-jaw').setAttribute('d','M340 85L320 250L260 255L194 '+(201-12*shaping));
  if(progress>=.66){
   const tip=166+16*toolApproach;
   part('upper-jaw').setAttribute('d','M340 85Q356 75 347 62Q339 51 327 65L272 117L'+tip+' '+(187-mouth));
   part('lower-jaw').setAttribute('d','M340 85L320 250L260 255L'+tip+' '+(183+mouth));
  }
  part('tool').setAttribute('opacity',progress>=.66?toolApproach:1-toolRelease);
  part('tool-label').setAttribute('opacity',progress>=.62?toolApproach:1-toolRelease);
  const paddleApproach=Math.min(1,progress/.1);
  const paddleWithdrawal=Math.max(0,Math.min(1,(progress-.25)/.07));
  part('base-paddle').setAttribute('transform','translate('+(276+21*(1-paddleApproach)-baseInset+24*paddleWithdrawal)+' 0)');
  part('base-paddle').setAttribute('opacity',1-paddleWithdrawal);
  part('punty').setAttribute('opacity',progress>=.32?'1':'0');
  part('punty').setAttribute('transform','translate('+(110*(1-transferEase))+' 0)');
  part('pipe').setAttribute('transform','translate('+(-190*detachEase)+' 0)');
  part('pipe').setAttribute('opacity',1-detachEase);
  part('blowpipe-label').setAttribute('opacity',1-detachEase);
  part('mouth-rim').setAttribute('opacity',detachEase);
  part('shaping-phase').textContent=progress<.32?'调整轮廓，整平底部':progress<.51?'接棒粘住底部':progress<.66?'吹管撤下，瓶口腾出来':'接棒托底，工具修整瓶口';
  paintBlowGlass(part,colors.hot,colors.working,eased);
 }
 if(i===4){
  const coolingProgress=Math.max(0,(progress-.2)/.8);
  const cooling=coolingProgress*coolingProgress*(3-2*coolingProgress);
  part('cooling-phase').textContent=progress<.2?'保温':'控制降温';
  part('warm').setAttribute('opacity',.35*(1-cooling)+.04);
  paintBlowGlass(part,colors.working,colors.cooled,cooling);
  part('outer').setAttribute('fill-opacity',1-.30*cooling);
 }
}

let blowRouteActive=false;
let blowFullPlayback=false;
const blowPages=['locate','panel','steps','card'];
function renderBlow(){
 stopBlowAnimation();
 blowFullPlayback=false;
 if(blow.page==='review')blow.page='locate';
 if(!blowPages.includes(blow.page))blow.page='locate';
 app.classList.add('blowing');
 const page=blow.page;
 let body='';
 if(page==='locate')body=`<span class="eyebrow">新辉厅 · 现场寻找</span><h1>先找展柜，再找《凝露》</h1><p>沿新辉厅展线找展柜，对照照片认认《凝露》。</p>${blowPhoto('exhibit')}<p class="observe">细瓶颈 · 鼓肚子</p><button class="primary" data-blow="panel">找到《凝露》了，开始学习 →</button>`;
 if(page==='panel')body=`<h1>吹制工艺入门课</h1><p class="onsite-lead">抬头仔细看看《凝露》上方的展板，按①到⑤观察每一步。</p><ol class="panel-order" aria-label="到现场展板上寻找的五个步骤">${BLOW_CONTENT.steps.map((step,index)=>`<li><span>${index+1}</span><strong>${step[0]}</strong></li>`).join('')}</ol><details class="onsite-scroll"><summary><span>展板看不清？</span><span class="fold-label">展开照片</span></summary><div class="onsite-sheet">${blowPhoto('panel')}<p class="process-note">展板介绍的是通用工艺。点照片可放大。</p></div></details><div class="panel-decisions"><button class="primary" data-blow="animate">还有点懵？那看看动画吧</button><button class="secondary" data-blow="card">看明白了，去看知识卡 →</button></div>`;
 if(page==='steps')body=`<section class="animation-card"><div class="animation-heading"><div id="blow-reference"><span>五步工艺，任选一步</span></div><button data-blow="panel">回看展板</button></div><h2 id="blow-title" class="sr-only">任选一步</h2><div id="blow-scene">${blowScene(-1)}</div><p id="blow-description">想看哪一步就点哪一步，也能直接进入知识卡。</p><p id="blow-note">工艺示意</p><div id="blow-controls"><button data-blow="full">全流程</button><button data-blow="replay" disabled>重播</button><button data-blow="result" disabled>看结果</button></div></section><div class="blow-grid">${BLOW_CONTENT.steps.map((s,i)=>`<button data-blow="select" data-index="${i}" aria-pressed="false"><strong>${i+1} ${s[0]}</strong><span id="blow-check-${i}">${blow.viewed.includes(i)?'✓ 已查看':'点击查看'}</span></button>`).join('')}</div><p id="blow-progress" role="status"></p><div class="blow-next-slot"><button id="blow-next" class="primary" data-blow="card">下一步 · 看知识卡 →</button></div>`;
 if(page==='card')body=`<section class="card compact-knowledge"><span class="eyebrow">工艺知识卡</span><h1>吹制工艺</h1><h2>关键工具 · 吹管</h2><p>吹管吹入空气，帮助形成、扩大空腔。</p><p>接棒是实心金属棒，粘住底部，腾出瓶口做修整。</p><p class="observe">取料、蘸料 · 吹制 · 加温 · 塑形 · 退温</p><p class="process-note">通用工艺示意，并非《凝露》制作实录。</p></section>${blow.claimed?'<p class="success">✓ 吹制关完成</p>':'<button class="primary" data-blow="claim">收下吹制知识卡</button>'}<button class="secondary" data-blow="panel">再看展板与工艺</button>`;
 app.innerHTML=`<nav><button data-blow="home">← 首页</button><span class="tag">第二关 · 吹制工艺</span></nav><section class="blow-viewport blow-${page}">${body}</section>`;
 if(page==='card'&&blow.claimed&&typeof enterLamp==='function'){const next=document.createElement('button');next.className='primary';next.dataset.lamp='enter';next.textContent='继续体验灯工 →';app.querySelector('.blow-viewport').append(next);}
 if(page==='steps')updateBlowProgress();
 saveBlow();
 window.scrollTo(0,0);
 if(typeof renderRewards==='function')renderRewards();
}
function blowPanelDetail(i){
 const [x,y]=BLOW_CONTENT.panelSpots[i];
 return `<svg viewBox="0 0 200 200" role="img" aria-label="展板中的${BLOW_CONTENT.steps[i][0]}照片"><defs><clipPath id="panel-photo-circle"><circle cx="100" cy="100" r="92"/></clipPath></defs><g clip-path="url(#panel-photo-circle)"><svg viewBox="${x-100} ${y-100} 200 200" width="200" height="200"><image href="${BLOW_CONTENT.images.panel}" width="1450" height="1085"/></svg></g><circle cx="100" cy="100" r="94" fill="none" stroke="#b58b25" stroke-width="3"/></svg><span>${BLOW_CONTENT.steps[i][0]}</span>`;
}
function updateBlowProgress(){const p=document.querySelector('#blow-progress');if(p)p.textContent=`看过 ${blow.viewed.length} / 5 步 · 随时下一步`;}
function finishBlow(){
 stopBlowAnimation();
 const scene=document.querySelector('#blow-scene');
 if(!scene||blowSelected<0)return;
 drawBlowFrame(blowSelected,1);
 if(!blow.viewed.includes(blowSelected))blow.viewed.push(blowSelected);
 document.querySelector(`#blow-check-${blowSelected}`).textContent='✓ 已查看';
 saveBlow();updateBlowProgress();
 if(blowFullPlayback&&blowSelected<4)playBlow(blowSelected+1);
 else blowFullPlayback=false;
}
function playBlow(i){
 stopBlowAnimation();blowSelected=i;
 document.querySelectorAll('[data-blow="select"]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.index)===i)));
 document.querySelector('#blow-title').textContent=`${i+1} ${BLOW_CONTENT.steps[i][0]}`;
 document.querySelector('#blow-reference').innerHTML=blowPanelDetail(i);
 const scene=document.querySelector('#blow-scene');scene.className=`scene-${i}`;scene.innerHTML=blowScene(i);
 document.querySelector('#blow-description').textContent=BLOW_CONTENT.steps[i][1];
 document.querySelector('#blow-reference').setAttribute('aria-label','展板中的'+BLOW_CONTENT.steps[i][0]);
 document.querySelector('#blow-note').textContent=i===0?BLOW_CONTENT.colorNotes.gather:i===1?'剖面示意 · 看清里面的空腔':i===2?BLOW_CONTENT.colorNotes.heating:i===4?BLOW_CONTENT.colorNotes.cooling:'示意一种常见转接方式，具体操作随作品而异。';
 document.querySelectorAll('#blow-controls button').forEach(b=>b.disabled=false);
 drawBlowFrame(i,0);
 const duration=i===3?5000:4000;
 const started=performance.now();
 function tick(now){
  const progress=Math.min((now-started)/duration,1);
  drawBlowFrame(i,progress);
  if(progress<1)blowFrame=requestAnimationFrame(tick);
  else finishBlow();
 }
 blowFrame=requestAnimationFrame(tick);
}
app.addEventListener('click',e=>{
 const b=e.target.closest('[data-blow]');if(!b)return;
 const action=b.dataset.blow;
 if(action==='enter'){enterBlow();return}
 if(action==='animate'){
  blow.page='steps';
  renderBlow();
  blowFullPlayback=true;
  playBlow(0);
  return;
 }
 if(action==='home'){stopBlowAnimation();blowFullPlayback=false;saveBlow();location.hash='home';return}
 if(action==='photo'){
 const kind=b.dataset.kind;
 document.querySelector('#viewer h2').textContent=kind==='panel'?'五步工艺展板原图':'《凝露》';
 document.querySelector('#panel').innerHTML=`<img src="${BLOW_CONTENT.images[kind]}" alt="${kind==='panel'?'现场五步工艺展板':'《凝露》完整瓶形'}">`;
 document.querySelector('#viewer').showModal();return;
 }
 if(action==='full'){blowFullPlayback=true;playBlow(0);return}
 if(action==='select'){blowFullPlayback=false;playBlow(Number(b.dataset.index));return}
 if(action==='replay'){blowFullPlayback=false;playBlow(blowSelected);return}
 if(action==='result'){blowFullPlayback=false;finishBlow();return}
 if(action==='claim'){blow.claimed=true;blow.complete=true;blow.page='card'}
 else blow.page=action;
 renderBlow();
});
app.addEventListener('toggle',event=>{
 if(!event.target.matches('.onsite-scroll'))return;
 event.target.querySelector('.fold-label').textContent=event.target.open?'收起照片':'展开照片';
 if(event.target.open){
  stopBlowAnimation();
  blowFullPlayback=false;
 }
},true);
function resetBlowEntry(){
 stopBlowAnimation();
 blow.page='locate';
 blowFullPlayback=false;
 blowSelected=-1;
 saveBlow();
}
function enterBlow(){
 resetBlowEntry();
 if(location.hash==='#blowing')renderBlow();
 else location.hash='blowing';
}
const originalRender=render;
saveBlow();
render=function(){
 if(location.hash==='#blowing'){
  if(!blowRouteActive)resetBlowEntry();
  blowRouteActive=true;renderBlow();return;
 }
 blowRouteActive=false;
 stopBlowAnimation();blowFullPlayback=false;app.classList.remove('blowing');originalRender();
 if(location.hash==='#home'){
 const card=app.querySelectorAll('.home-card')[1];card.disabled=false;card.removeAttribute('data-action');
 card.innerHTML=`<strong>第二关 · 吹制工艺 →</strong><small>${blow.complete?'✓ 已完成':blow.viewed.length?'进行中':'未开始'} · 新辉厅 · 约 2—3 分钟</small>`;
 card.onclick=enterBlow;
 }
};
render();


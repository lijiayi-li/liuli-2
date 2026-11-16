const app=document.querySelector('#app'),c=CONTENT,key='liuli-color-v1';
let state={started:false,correct:false,complete:false,viewed:[]};
let step='locate',wrong='',usedClue=false;
function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch{}}
function photo(type,alt){return `<div class="photo photo-${type}"><img src="${c.images[type]}" alt="${alt}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><div class="placeholder" hidden><span aria-hidden="true">◇</span><b>${alt}待补充</b><small>请观察展柜中的实物</small></div>${type==='display'?`<svg class="photo-annotation" viewBox="0 0 858 1014" aria-label="展板位于展柜上方"><rect x="71" y="14" width="581" height="319" rx="4" fill="none" stroke="#f2cc65" stroke-width="4"/><rect x="80" y="344" width="135" height="42" rx="5" fill="#fffefa"/><text x="91" y="374" font-size="28" fill="#594418">看这里 ↑</text></svg>`:''}</div>`}
function options(){return `<div class="options">${c.options.map((x,i)=>`<button class="option ${wrong===x?'wrong':''}" data-answer="${i}">${x}<span>${wrong===x?'再想一想':'○'}</span></button>`).join('')}</div>`}
function nav(label){return `<nav><button data-action="home">← 首页</button><span class="tag">${label}</span></nav>`}
function render(){const home=location.hash==='#home';if(home){app.innerHTML=`<div class="brand">中国陶瓷琉璃博物馆</div><h1>探索琉璃工艺</h1><p class="muted">在展柜旁，认识琉璃的颜色与工艺。</p><button class="home-card" data-action="enter"><strong>第一关 · 琉璃的颜色 →</strong><small>${state.complete?'✓ 已完成':state.started?'进行中':'未开始'} · 新辉厅 · 约 1 分钟</small></button><button class="home-card" disabled><strong>第二关 · 吹制工艺 →</strong><small>准备中 · 新辉厅 · 约 2—3 分钟</small></button><button class="home-card" disabled><strong>第三关 · 灯工工艺</strong><small>准备中</small></button>`;if(typeof renderRewards==='function')renderRewards();return}
let body='';
if(step==='locate')body=`<span class="eyebrow">${c.hall} · 现场寻找</span><h1>${c.locationTitle}</h1><p>${c.locationGuide}</p>${photo('location','新辉厅黄色琉璃展柜定位照片')}<button class="primary screen-next" data-action="found">找到展柜了，开始学习 →</button>`;
if(step==='question')body=`<h1>${c.title}</h1><p class="muted">${c.intro}</p><details class="photo-help"><summary>人多看不清？看照片</summary>${photo('bell',c.alt)}</details><h2>${c.question}</h2>${options()}<button class="secondary" data-action="clue">拿不准？抬头找找线索</button>`;
if(step==='clue')body=`<h1>${wrong?'再找找线索吧':'抬头找个小提示'}</h1>${wrong?'<p class="gentle" role="status">差一点点，展板来帮忙。</p>':''}<h2>${c.clueTitle}</h2><p class="muted">${c.clue}</p>${photo('display','展柜全景')}<button class="secondary" data-action="zoom">看不清？放大展板</button><h2 class="retry-title">找到啦？再选一次</h2>${options()}`;
if(step==='knowledge')body=`<div class="success" role="status">✓ ${usedClue?'找到了！它叫鸡油黄。':'答对了！这是鸡油黄。'}</div><h1>为什么叫鸡油黄？</h1><div class="name-diagram" aria-label="鸡油黄因色泽像鸡油而得名"><span class="color-chip" aria-hidden="true"></span><strong>色泽像鸡油</strong><span class="diagram-arrow" aria-hidden="true">→</span><strong class="amber-text">鸡油黄</strong></div><p class="muted">${c.correctDetail}</p><button class="primary screen-next" data-action="material">颜色从哪来？ →</button>`;
if(step==='material')body=`<h1>这抹黄，是怎么来的？</h1><section class="card knowledge"><span class="eyebrow">颜色知识卡</span><h2>${c.name}</h2><p class="material">相关着色材料：${c.material}</p><h3>${c.knowledgeTitle}</h3><div class="definition"><span aria-hidden="true">◈</span><p>${c.knowledge[0]}</p></div><p class="research">${c.knowledge[1]}</p><div class="conditions"><span>配方</span><span aria-hidden="true">＋</span><span>熔炼条件</span><span aria-hidden="true">→</span><strong>颜色有差别</strong></div><p class="sr-only">${c.knowledge[2]}</p><p class="note">${c.note}</p></section><button class="primary screen-next" data-action="done">完成第一关 →</button>`;
if(step==='done')body=`<div class="finish-mark" aria-hidden="true">✓</div><h1>颜色关已完成</h1><p>颜色认准了，接着看看瓶身怎么鼓起来。</p><button class="primary screen-next" data-blow="enter">进入第二关 · 吹制工艺 →</button><button class="secondary" data-action="home">返回首页</button><button class="secondary" data-action="read">再看看知识卡</button><button class="secondary" data-action="again">再选一次颜色</button>`;
const stages=['locate','question','knowledge','material'];const current=step==='clue'?'question':step;const guide=step==='done'?'':`<ol class="step-guide" aria-label="学习步骤">${['找展柜','认颜色','懂名字','学着色'].map((label,i)=>`<li ${stages[i]===current?'aria-current="step"':''}><span>${i+1}</span>${label}</li>`).join('')}</ol>`;
app.innerHTML=nav(step==='knowledge'?'第一关 · 颜色知识':'第一关 · 颜色')+guide+`<section class="screen-content${step==='done'?' color-finish':''}">${body}</section>`;
if(typeof renderRewards==='function')renderRewards();
}
function show(next){step=next;render();window.scrollTo(0,0)}
function enter(){state.started=true;save();wrong='';usedClue=false;step='locate';if(location.hash==='#color')render();else location.hash='color'}
app.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.answer!==undefined){const answer=c.options[Number(b.dataset.answer)];if(answer===c.name){state.correct=true;save();show('knowledge')}else{wrong=answer;usedClue=true;show('clue')}return}switch(b.dataset.action){case'home':location.hash='home';break;case'enter':enter();break;case'found':show('question');break;case'clue':usedClue=true;show('clue');break;case'zoom':document.querySelector('#viewer h2').textContent='展板局部';document.querySelector('#panel').innerHTML=photo('panel','展板局部照片');document.querySelector('#viewer').showModal();break;case'material':show('material');break;case'done':state.complete=true;save();show('done');break;case'read':show('material');break;case'again':wrong='';usedClue=false;show('question');break}});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});
// 每次打开页面开始新的体验，页内导航继续使用本次进度。
history.replaceState(null,'',location.pathname+location.search+'#home');
save();
render();





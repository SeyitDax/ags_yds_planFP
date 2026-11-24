/* Öğretmenler Günü sürprizi. index.html bu dosyayı yalnızca gerektiğinde yükler.
   Mektup ve fotoğraflar v/ altında şifreli; açmak için ayar.json'daki sorunun cevabı gerekir.
   Değiştirmek için: surpriz-kaynak/ içinde düzenle, sonra `python sifrele.py`. */
(()=>{
if(window.OGR24)return;
const B=new URL('./',document.currentScript.src).href;

/* Şifresiz ekran yazıları */
const PERDE=['Bugün 24 Kasım.','Öğretmenler Günü.','Ve bugün senin günün.'];
const BASLIK=['Öğretmenler Günün','kutlu olsun 🌷'],ALT='Benim en sevdiğim öğretmenime';

const INK='#2b3245',RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const f=n=>+n.toFixed(1);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const vurgu=s=>esc(s).replace(/_([^_\n]+)_/g,'<em>$1</em>'); // _kelime_ → vurgulu
const nextFrame=fn=>requestAnimationFrame(()=>requestAnimationFrame(fn));

/* ---------- şifre ---------- */
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const u8b64=u=>btoa(String.fromCharCode(...new Uint8Array(u)));
// sifrele.py içindeki sadelestir() ile birebir aynı olmalı
const TR={'ı':'i','ç':'c','ğ':'g','ö':'o','ş':'s','ü':'u','â':'a','î':'i','û':'u'};
// tarih gibi yazılmışsa (5.3.24, 05 03 2024, 5/3/2024) baştaki sıfırlar ve iki haneli yıl önemsiz: hepsi 05032024 olur
const TARIH=/^([0-9]{1,2})[\s.\-\/,]+([0-9]{1,2})[\s.\-\/,]+([0-9]{2}|[0-9]{4})$/;
const norm=s=>{s=s.normalize('NFC').trim();const t=s.match(TARIH);if(t)return t[1].padStart(2,'0')+t[2].padStart(2,'0')+(t[3].length===2?'20'+t[3]:t[3]);
  return s.replace(/[İI]/g,'i').toLowerCase().replace(/[ıçğöşüâîû]/g,c=>TR[c]).replace(/[\s.\-\/,'’]/g,'')};
// ikinci sır: özel linkin #k= kısmındaki rastgele anahtar (sunucuya hiç gitmez). Cevap tahmin edilse bile o olmadan dosyalar açılmaz.
const secret=()=>{const h=(location.hash.match(/[#&]k=([A-Za-z0-9_-]{20,})/)||[])[1];if(h)ls.set('ogr24:s',h);return h||ls.get('ogr24:s')};
async function derive(ans,m){const sec=m.v>1?'#'+(secret()||''):'';const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(norm(ans)+sec),'PBKDF2',false,['deriveBits']);return new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:b64(m.tuz),iterations:m.tur},base,256))}
const dec=(key,buf)=>{const u=new Uint8Array(buf);return crypto.subtle.decrypt({name:'AES-GCM',iv:u.slice(0,12)},key,u.slice(12))};

let meta=null,bufs=null,pre=null;
function prefetch(){
  if(pre)return pre;
  pre=fetch(B+'v/meta.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw 0;return r.json()}).then(m=>{
    meta=m;const v='?v='+encodeURIComponent(m.tuz.slice(0,10));
    bufs=[...Array(m.n+1)].map((_,i)=>fetch(B+'v/'+i+'.bin'+v).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}));
    bufs.forEach(p=>p.catch(()=>{}));return m}).catch(e=>{pre=null;throw e});
  return pre}

/* ---------- çizimler ---------- */
// planın çıkartma stili (mektup pulu, kapanış çiçekleri)
const petals=(x,y,r,c)=>{let h='';for(let a=0;a<5;a++){const t=a*72*Math.PI/180-Math.PI/2;h+=`<circle cx="${f(x+Math.cos(t)*r*.62)}" cy="${f(y+Math.sin(t)*r*.62)}" r="${f(r*.5)}" fill="${c}" stroke="${INK}" stroke-width="1.6"/>`}return h+`<circle cx="${x}" cy="${y}" r="${f(r*.34)}" fill="#f6e19a" stroke="${INK}" stroke-width="1.6"/>`};
const daisy=(x,y,r)=>{let h='';for(let a=0;a<10;a++)h+=`<ellipse cx="${x}" cy="${f(y-r*.55)}" rx="${f(r*.2)}" ry="${f(r*.45)}" transform="rotate(${a*36} ${x} ${y})" fill="#fff" stroke="${INK}" stroke-width="1.3"/>`;return h+`<circle cx="${x}" cy="${y}" r="${f(r*.3)}" fill="#f6e19a" stroke="${INK}" stroke-width="1.6"/>`};
const spark=(x,y,s,d)=>`<path class="spk" style="--d:${d}ms" d="M${x} ${y-s}L${f(x+s*.25)} ${f(y-s*.25)}L${x+s} ${y}L${f(x+s*.25)} ${f(y+s*.25)}L${x} ${y+s}L${f(x-s*.25)} ${f(y+s*.25)}L${x-s} ${y}L${f(x-s*.25)} ${f(y-s*.25)}z" fill="#f6e19a"/>`;

// buket: toz pembe laleler (opak suluboya, ince kontur), katmanlı kraft + pudra kâğıt, tül, krem saten fiyonk. viewBox 0 0 400 500 (transform-origin px için başlangıç 0 0 olmalı)
const BQDEFS=`<linearGradient id="o24pf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdebf0" stop-opacity=".86"/><stop offset=".18" stop-color="#fbdde6"/><stop offset=".62" stop-color="#f3b3c7"/><stop offset="1" stop-color="#dc819f"/></linearGradient>
<linearGradient id="o24ps" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe2ea" stop-opacity=".84"/><stop offset=".2" stop-color="#f8d0dc"/><stop offset=".7" stop-color="#eda2ba"/><stop offset="1" stop-color="#cf7193"/></linearGradient>
<linearGradient id="o24pb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4c6d4" stop-opacity=".9"/><stop offset=".5" stop-color="#e293ad"/><stop offset="1" stop-color="#b65d80"/></linearGradient>
<linearGradient id="o24pi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdeef2" stop-opacity=".88"/><stop offset="1" stop-color="#eab0c3"/></linearGradient>
<radialGradient id="o24pe" cx=".5" cy=".42" r=".62"><stop offset=".6" stop-color="#c45a82" stop-opacity="0"/><stop offset="1" stop-color="#c45a82" stop-opacity=".32"/></radialGradient>
<radialGradient id="o24ph" cx=".4" cy=".35" r=".65"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="o24la" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#4f7f63"/><stop offset=".6" stop-color="#76a684"/><stop offset="1" stop-color="#9cc6a6"/></linearGradient>
<linearGradient id="o24lb" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#6f9f80"/><stop offset=".55" stop-color="#9cc8a8"/><stop offset="1" stop-color="#c3e0c8"/></linearGradient>
<linearGradient id="o24lc" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8fb99b"/><stop offset=".6" stop-color="#c6e2cc"/><stop offset="1" stop-color="#e4f2e6"/></linearGradient>
<linearGradient id="o24rj" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c39b83"/><stop offset="1" stop-color="#ecd6c2"/></linearGradient>
<linearGradient id="o24kA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a77d55"/><stop offset=".5" stop-color="#c9a175"/><stop offset="1" stop-color="#a07650"/></linearGradient>
<linearGradient id="o24kB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7e4da"/><stop offset="1" stop-color="#dfb4a8"/></linearGradient>
<linearGradient id="o24kL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c0966b"/><stop offset=".45" stop-color="#ddbd94"/><stop offset=".85" stop-color="#e5c8a1"/><stop offset="1" stop-color="#cfa87d"/></linearGradient>
<linearGradient id="o24kR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ecd4b0"/><stop offset=".55" stop-color="#e0c097"/><stop offset="1" stop-color="#bb8f64"/></linearGradient>
<linearGradient id="o24kV" x1="0" y1="0" x2="0" y2="1"><stop offset=".3" stop-color="#6f4627" stop-opacity="0"/><stop offset="1" stop-color="#6f4627" stop-opacity=".4"/></linearGradient>
<linearGradient id="o24kU" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf0de"/><stop offset="1" stop-color="#e8cfaa"/></linearGradient>
<linearGradient id="o24kT" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b48a5f"/><stop offset=".5" stop-color="#d9b88f"/><stop offset="1" stop-color="#b08559"/></linearGradient>
<linearGradient id="o24rb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf3"/><stop offset=".5" stop-color="#f5e6d3"/><stop offset="1" stop-color="#dcbfa4"/></linearGradient>
<linearGradient id="o24ri" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#c39b83"/><stop offset="1" stop-color="#ecd6c2"/></linearGradient>
<linearGradient id="o24rt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcbfa4"/><stop offset=".28" stop-color="#fff8ef"/><stop offset=".6" stop-color="#d6b598"/><stop offset="1" stop-color="#f8ecdc"/></linearGradient>
<radialGradient id="o24rk" cx=".42" cy=".35" r=".7"><stop offset="0" stop-color="#fffaf3"/><stop offset="1" stop-color="#d2b193"/></radialGradient>
<filter id="o24bl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="o24bl2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
<pattern id="o24tp" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r=".6" fill="#fff" fill-opacity=".85"/></pattern>
<radialGradient id="o24bk"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".4" stop-color="#ffe1ea" stop-opacity=".5"/><stop offset="1" stop-color="#ffd1df" stop-opacity="0"/></radialGradient>
<radialGradient id="o24g"><stop offset="0" stop-color="#ffe3ec" stop-opacity=".5"/><stop offset=".5" stop-color="#f6b8cb" stop-opacity=".16"/><stop offset="1" stop-color="#f6b8cb" stop-opacity="0"/></radialGradient>
<filter id="o24sh" x="-35%" y="-30%" width="170%" height="175%"><feDropShadow dx="0" dy="3" stdDeviation="3.2" flood-color="#6e2a46" flood-opacity=".38"/></filter>`;

// sarma kâğıdı + kurdele yardımcıları (suluboya ton geçişleri, mürekkep çizgileri)
const PI='#6e4a30',RI='#a27a5c';
// iki ucu sivri, elle çizilmiş gibi ince çizgi
const SL=(x0,y0,cx,cy,x1,y1,w)=>{const l=Math.hypot(x1-x0,y1-y0)||1,nx=-(y1-y0)/l*w,ny=(x1-x0)/l*w;return`M${f(x0)} ${f(y0)}Q${f(cx+nx)} ${f(cy+ny)} ${f(x1)} ${f(y1)}Q${f(cx-nx)} ${f(cy-ny)} ${f(x0)} ${f(y0)}z`};
const cpath=(p,s)=>`M${p[0]} ${p[1]}`+s.map(c=>`C${c[0]} ${c[1]} ${c[2]} ${c[3]} ${c[4]} ${c[5]}`).join('');
// kenarın dışa kıvrılan şeridi: kenarı izler, uçlarda incelir
function lip(p,s,dx,dy){const n=s.length,P=[p,...s.map(c=>[c[4],c[5]])],w=i=>Math.sin(Math.PI*i/n);let r='';
  for(let i=n-1;i>=0;i--){const c=s[i],a=w(i+1),b=w(i);r+=`C${f(c[2]+dx*a)} ${f(c[3]+dy*a)} ${f(c[0]+dx*b)} ${f(c[1]+dy*b)} ${f(P[i][0]+dx*b)} ${f(P[i][1]+dy*b)}`}
  return cpath(p,s)+r+'z'}
const lipEl=(p,s,dx,dy,c)=>`<path d="${lip(p,s,dx,dy)}" fill="${c}" stroke="${PI}" stroke-opacity=".62" stroke-width="1" stroke-linejoin="round"/>`;
// kırışık: bir yanı gölge, bir yanı ışık (bulanık)
const fold=(x0,y0,x1,y1,w)=>`<path d="M${x0} ${y0}Q${f((x0+x1)/2+w*.5)} ${f((y0+y1)/2)} ${x1} ${y1}L${x0+w} ${y0+3}z" fill="#6f4627" fill-opacity=".24"/><path d="M${x0} ${y0}Q${f((x0+x1)/2-w*.35)} ${f((y0+y1)/2)} ${x1} ${y1}L${f(x0-w*.7)} ${y0+3}z" fill="#fff6e6" fill-opacity=".26"/>`;
// kırışık boyunca kısa mürekkep çizgisi
const crease=(x0,y0,x1,y1,k=.62,b=6)=>{const ex=x0+(x1-x0)*k,ey=y0+(y1-y0)*k;return SL(x0,y0,(x0+ex)/2+b,(y0+ey)/2,ex,ey,.75)};
// taslak çizimdeki gibi kısa paralel tarama
const hat=(x,y,a,n,len,gap)=>{const c=Math.cos(a*Math.PI/180),s=Math.sin(a*Math.PI/180);let d='';
  for(let i=0;i<n;i++){const L=len*(1-.16*((i*7)%3)),px=x-s*gap*i,py=y+c*gap*i;d+=SL(px-c*L/2,py-s*L/2,px,py,px+c*L/2,py+s*L/2,.5)}return d};
// kâğıt: zemin rengi, suluboya gibi koyulaşan kenar, iç detaylar, doku, mürekkep kontur
const paper=(id,d,fill,edge,inner='')=>`<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${fill}"/><g clip-path="url(#${id})"><path d="${d}" fill="none" stroke="${edge}" stroke-width="13" stroke-opacity=".42" filter="url(#o24bl)"/>${inner}<path d="${d}" fill="url(#o24tx)"/></g><path d="${d}" fill="none" stroke="${PI}" stroke-opacity=".72" stroke-width="1.15" stroke-linejoin="round"/>`;
const blot=(x,y,rx,ry,c,o)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" fill-opacity="${o}"/>`;
// kâğıt dokusu: bir kez üretilen küçük gürültü + lif deseni
let TXU='';
function tex(){if(TXU)return TXU;try{const N=96,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),im=x.createImageData(N,N),D=im.data;
  for(let i=0;i<D.length;i+=4){if(Math.random()<.5){D[i]=92;D[i+1]=60;D[i+2]=34;D[i+3]=Math.random()*36}else{D[i]=D[i+1]=255;D[i+2]=242;D[i+3]=Math.random()*28}}
  x.putImageData(im,0,0);x.lineCap='round';x.lineWidth=.7;
  for(let k=0;k<60;k++){const a=Math.random()*6.3,l=3+Math.random()*10,px=Math.random()*N,py=Math.random()*N;x.strokeStyle=k%2?'rgba(110,70,40,.17)':'rgba(255,248,235,.24)';x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}
  TXU=c.toDataURL()}catch(e){}return TXU}

// lale tonları (1: pudra, 2: gül) + fiyonk/kâğıt için ek tanımlar
const BQDEFS2=`<linearGradient id="o24pf1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2f5" stop-opacity=".86"/><stop offset=".2" stop-color="#fde6ec"/><stop offset=".65" stop-color="#f7c6d4"/><stop offset="1" stop-color="#e59ab2"/></linearGradient>
<linearGradient id="o24ps1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdeef2" stop-opacity=".84"/><stop offset=".25" stop-color="#fadbe4"/><stop offset=".7" stop-color="#f2b6c8"/><stop offset="1" stop-color="#d98aa5"/></linearGradient>
<linearGradient id="o24pb1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8d6e0" stop-opacity=".9"/><stop offset=".5" stop-color="#eaa9bd"/><stop offset="1" stop-color="#c47592"/></linearGradient>
<linearGradient id="o24pf2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbdbe5" stop-opacity=".86"/><stop offset=".2" stop-color="#f7c3d3"/><stop offset=".62" stop-color="#ec97b3"/><stop offset="1" stop-color="#cd6c8e"/></linearGradient>
<linearGradient id="o24ps2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f9d2de" stop-opacity=".84"/><stop offset=".25" stop-color="#f3b5c8"/><stop offset=".7" stop-color="#e58aa8"/><stop offset="1" stop-color="#c05f83"/></linearGradient>
<linearGradient id="o24pb2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efb4c7" stop-opacity=".9"/><stop offset=".5" stop-color="#d9819f"/><stop offset="1" stop-color="#a94f74"/></linearGradient>
<linearGradient id="o24rf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbf5"/><stop offset=".45" stop-color="#f7e9d8"/><stop offset="1" stop-color="#e2c8ae"/></linearGradient>
<linearGradient id="o24rd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98f75"/><stop offset=".6" stop-color="#d3b398"/><stop offset="1" stop-color="#e6cdb6"/></linearGradient>
<linearGradient id="o24rw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfae92"/><stop offset=".45" stop-color="#fbf1e4"/><stop offset="1" stop-color="#c9a68a"/></linearGradient>
<filter id="o24bs" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".9"/></filter>`;

// ---- sarma kâğıdı ----
// arka kraft (çiçeklerin arkası, iç yüz), tül, pudra kâğıt
const WA=[[191,402],[160,360,92,290,66,196],[66,196],[[56,178,50,160,60,146],[68,134,86,136,98,146],[116,124,146,104,176,110],[198,92,232,96,250,112],[272,100,306,112,320,132],[334,138,350,144,350,162],[352,176,344,190,336,200]],[310,292,240,360,209,402]];
const WT=[[196,402],[166,360,100,300,78,206],[78,206],[[70,188,74,170,86,166],[100,160,110,168,118,176],[136,146,170,132,198,140],[218,126,248,130,266,146],[288,138,312,150,322,170],[330,178,332,190,328,200]],[296,300,234,364,204,402]];
const WB=[[194,402],[168,360,110,300,88,214],[88,214],[[80,198,80,182,90,176],[104,170,116,176,124,184],[140,160,170,146,196,152],[214,140,244,142,260,156],[280,148,304,158,314,176],[322,182,326,194,320,206]],[290,300,232,364,206,402]];
const wpath=([o,a,p,t,b])=>cpath(o,[a,...t,b])+'z';
// arka kâğıdın yanlardan dolanıp öne kıvrılan kanatları: [boğaz, dış kenar, köşe, serbest iç kenar..., boğaza dönüş]
const SLc=[72,170],SLe=[[86,196,104,236,120,262],[134,286,150,316,166,338]];
const SLp=cpath([192,404],[[158,362,90,292,62,192],[58,180,62,170,72,170],...SLe,[178,356,188,382,198,404]])+'z';
const SRc=[332,176],SRe=[[318,200,300,236,288,256],[276,276,250,300,236,320]];
const SRp=cpath([208,404],[[244,362,312,292,340,196],[344,184,340,176,332,176],...SRe,[222,350,214,380,208,404]])+'z';
// ön kat: soldan sağa yükselen çapraz kenar
const FTc=[106,332],FTe=[[98,326,100,316,112,316],[138,316,160,304,184,300],[214,296,236,284,262,278],[286,272,308,258,326,250],[338,246,342,256,334,262]];
const FTp=cpath([190,404],[[170,384,130,356,106,332],...FTe,[316,320,250,372,212,404]])+'z';
// boğazın altındaki kısa büzgülü etek
const NKp=cpath([192,403],[[190,413,186,423,180,431],[186,436,190,432,195,437],[200,441,204,434,209,438],[214,437,218,435,221,431],[215,423,210,413,208,403]])+'z';

function wrapBack(){
  const a=wpath(WA),t=wpath(WT),b=wpath(WB);
  return paper('o24cA',a,'url(#o24kA)','#6f4627',`<rect x="40" y="200" width="320" height="210" fill="url(#o24kV)"/><g filter="url(#o24bl2)">${blot(120,200,30,40,'#7a4f2c',.22)+blot(286,190,34,38,'#7a4f2c',.2)+blot(200,130,44,24,'#f3dcbc',.32)}</g><g filter="url(#o24bl)">${fold(98,148,192,402,12)+fold(150,112,196,402,9)+fold(310,124,208,402,-12)+fold(250,110,204,402,-9)}</g><path d="${crease(98,150,192,402,.45,6)+crease(310,126,208,402,.45,-6)+hat(70,190,-70,4,13,3)+hat(334,186,70,4,13,3)}" fill="${PI}" fill-opacity=".4"/>`)
   +lipEl(WA[2],WA[3],0,8,'#ddbb93')
   +`<path d="${t}" fill="#fff" fill-opacity=".16" stroke="#fff" stroke-opacity=".35" stroke-width=".9"/><path d="${t}" fill="url(#o24tp)" opacity=".3"/>`
   +paper('o24cB',b,'url(#o24kB)','#b9847a',`<g filter="url(#o24bl2)">${blot(150,190,28,30,'#fff',.35)+blot(262,180,26,28,'#c98f86',.2)}</g>`)
   +lipEl(WB[2],WB[3],0,7,'#fcf1ea')}

// öndeki sarma: yan kanatlar, çapraz ön kat, büzgü, fiyonk altından çıkan saplar
function wrapFront(){
  // kâğıt kenarının çiçeklere düşen yumuşak gölgesi (kenarın üstünde kalan kısmı görünür)
  const edgeSh=p=>`<path d="${p}" fill="#2a1710" fill-opacity=".38" transform="translate(0 -5)" filter="url(#o24bl2)"/>`;
  const sr=paper('o24cS2',SRp,'url(#o24kL)','#6f4627',`<rect x="60" y="250" width="300" height="160" fill="url(#o24kV)"/><g filter="url(#o24bl)">${fold(326,190,210,402,-10)+fold(300,232,206,400,-8)}</g><path d="${crease(326,192,210,402,.5,-5)+hat(316,214,-120,4,12,3)}" fill="${PI}" fill-opacity=".42"/>`)+lipEl(SRc,SRe,7,3,'url(#o24kU)');
  const sl=paper('o24cS1',SLp,'url(#o24kL)','#6f4627',`<rect x="40" y="250" width="300" height="160" fill="url(#o24kV)"/><g filter="url(#o24bl)">${fold(72,196,192,402,12)+fold(90,250,194,402,9)}<path d="${FTp}" transform="translate(-6 7)" fill="#4f2f18" fill-opacity=".34"/></g><g filter="url(#o24bl2)">${blot(98,240,20,30,'#f6e3c6',.4)}</g><path d="${crease(74,200,192,402,.55,6)+crease(96,262,194,402,.5,4)+hat(86,232,-60,4,13,3)}" fill="${PI}" fill-opacity=".42"/>`)+lipEl(SLc,SLe,-7,3,'url(#o24kU)');
  const ft=paper('o24cF',FTp,'url(#o24kR)','#6f4627',`<g filter="url(#o24bl)">${fold(140,318,198,402,9)+fold(186,304,200,402,8)+fold(240,288,204,402,-8)+fold(292,268,208,402,-10)+fold(324,254,210,402,-9)}</g><rect x="60" y="260" width="300" height="150" fill="url(#o24kV)"/><g filter="url(#o24bl2)">${blot(250,320,30,16,'#fbecd4',.5)+blot(160,350,22,14,'#fbecd4',.35)}</g><path d="${crease(186,306,200,402,.6,4)+crease(240,292,204,402,.6,-5)+crease(292,272,208,402,.55,-6)+SL(178,372,190,388,196,400,.5)+SL(222,370,212,388,204,400,.5)+SL(200,368,200,386,200,400,.45)+hat(150,336,-40,5,13,3.2)+hat(270,300,-30,4,12,3)}" fill="${PI}" fill-opacity=".42"/>`)+lipEl(FTc,FTe,0,11,'url(#o24kU)');
  const nk=paper('o24cN',NKp,'url(#o24kT)','#6f4627',`<path d="${SL(195,436,196,420,198,406,.5)+SL(205,437,204,420,202,406,.5)+SL(186,432,190,418,194,406,.45)+SL(215,433,211,418,206,406,.45)}" fill="${PI}" fill-opacity=".5"/>`);
  // fiyonkun altından çıkan yeşil sap uçları
  const ends=[[194,180,474],[197,188,480],[199,196,478],[201,203,482],[203,210,477],[206,218,472],[198,200,470]].map(([x0,x1,y1])=>{const d=`M${x0} 426C${x0} 444 ${f((x0+x1)/2)} 456 ${x1} ${y1}`;return`<path d="${d}" fill="none" stroke="#4f7f63" stroke-width="4.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#88b696" stroke-width="2.9" stroke-linecap="round"/><ellipse cx="${x1}" cy="${y1+.4}" rx="1.9" ry="1.1" fill="#d7ecd9"/>`}).join('');
  return edgeSh(SRp)+sr+edgeSh(SLp)+sl+edgeSh(FTp)+ft+ends+nk+BOW}

// ---- fiyonk: düğümde büzülen, dışı geniş ilmekler; koyu iç yüz, açık dış yüz; dönen uçlar ----
const ribbon=(o,iN,rim,fl,hl,acc)=>`<path d="${iN}" fill="url(#o24rd)"/><path d="${o}" fill="url(#o24rf)"/>
<g filter="url(#o24bs)"><path d="${fl}" fill="#9b7259" fill-opacity=".42"/><path d="${hl}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="2.2" stroke-linecap="round"/></g>
<path d="${rim}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.2" stroke-linecap="round"/>
<path d="${acc}" fill="${RI}" fill-opacity=".7"/>`;
const BOWSH='M197 398C186 390 170 378 150 372C132 367 118 374 116 388C115 398 120 406 130 410C130 416 138 420 152 420C170 420 188 413 197 407ZM203 398C214 388 232 374 254 367C274 361 290 368 291 384C292 396 286 405 275 410C274 417 266 422 252 422C232 422 212 414 203 407ZM195 407C190 420 182 432 174 442C168 452 168 470 160 486L174 490C178 470 180 456 186 446C192 436 198 422 201 410ZM205 407C212 422 222 434 232 444C240 456 242 478 250 492L234 494C230 476 230 462 224 450C216 438 208 424 200 410Z';
const BOW=`<path d="${BOWSH}" fill="#3a2216" opacity=".3" transform="translate(2 5)" filter="url(#o24bl)"/>`
// uçlar: ön yüz (açık) → dönüş (arka yüz, koyu) → ön yüz, V kesik
+`<path d="M195 407C190 420 182 432 174 442Q180 446 184 446C190 436 197 422 201 410Z" fill="url(#o24rf)"/>
<path d="M174 442C169 449 167 455 170 461Q174 461 178 458C178 452 180 449 184 446Q180 446 174 442Z" fill="url(#o24rd)"/>
<path d="M170 461C168 470 164 478 160 486L168 482L174 490C176 480 177 470 178 458Q174 461 170 461Z" fill="url(#o24rf)"/>
<path d="M205 407C212 422 222 434 232 444Q228 448 223 449C215 438 207 424 200 410Z" fill="url(#o24rf)"/>
<path d="M232 444C238 452 240 460 236 468Q232 466 228 464C230 458 228 453 223 449Q228 448 232 444Z" fill="url(#o24rd)"/>
<path d="M236 468C240 476 244 484 250 492L241 488L234 494C232 484 230 474 228 464Q232 466 236 468Z" fill="url(#o24rf)"/>
<path d="${SL(196,410,186,428,175,442,.55)+SL(170,462,166,474,161,485,.5)+SL(204,410,216,428,231,445,.55)+SL(236,469,242,480,249,491,.5)}" fill="${RI}" fill-opacity=".55"/>
<path d="M199 414C195 426 189 434 183 441M175 466C174 474 172 480 170 485M209 420C215 430 221 436 226 442M232 470C235 478 238 484 242 488" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.3" stroke-linecap="round" filter="url(#o24bs)"/>`
+ribbon('M197 398C186 390 170 378 150 372C132 367 118 374 116 388C115 398 120 406 130 410C146 406 168 404 186 404C192 404 196 404 197 404Z',
  'M130 410C146 406 168 404 186 404C192 405 196 406 197 407C188 413 170 420 152 420C138 420 130 416 130 410Z',
  'M150 374C134 370 121 377 119 390',
  SL(195,400,176,389,150,381,1.1)+SL(194,402,170,397,140,394,.9)+SL(194,406,172,412,146,415,.8),
  'M186 393C174 384 160 378 146 377M128 402C140 399 156 398 170 399',
  SL(130,411,150,422,196,407,.7)+SL(117,386,116,398,129,410,.6))
+ribbon('M203 398C214 388 232 374 254 367C274 361 290 368 291 384C292 396 286 405 275 410C258 405 234 403 214 404C208 404 204 404 203 404Z',
  'M275 410C258 405 234 403 214 404C208 405 204 406 203 407C212 414 232 422 252 422C266 422 274 417 275 410Z',
  'M254 369C272 364 287 371 289 386',
  SL(205,400,226,388,254,378,1.1)+SL(206,402,232,396,266,393,.9)+SL(206,406,230,413,258,416,.8),
  'M214 392C228 381 244 374 260 372M272 403C258 399 240 398 226 399',
  SL(275,411,254,424,204,407,.7)+SL(290,384,291,398,276,410,.6))
// düğüm: ilmekleri sıkıştıran küçük kumaş sargısı
+`<path d="M191 395C196 392 204 392 209 395C211 400 211 406 209 411C204 414 196 414 191 411C189 406 189 400 191 395Z" fill="url(#o24rw)"/>
<path d="${SL(194,395,193,403,194,411,.5)+SL(198,394,197,403,198,412,.45)+SL(203,394,203,403,202,412,.45)+SL(207,395,207,403,206,411,.5)+SL(191,395,200,393,209,395,.4)+SL(191,411,200,414,209,411,.55)}" fill="#9b7259" fill-opacity=".6"/>
<path d="M200 396C201 401 201 406 200 410" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="1.2" stroke-linecap="round"/>`;

// ---- çiçekler ----
// lale başı: arka petal, iki iç petal ucu, iki yan petal (açılır), ön petal. tone: ''|1|2, turn: -1..1 (yana dönüklük)
function tHead(x,y,r,rot,d,bud,i,tone,turn){
  turn=turn||0;const T=tone||'',bx=x,by=y+r*.8,k=bud?.8:1,O=`transform-origin:${f(bx)}px ${f(by)}px`;
  const P=(a,b)=>`${f(x+a*k*r)} ${f(y+b*r)}`;
  const INKL=`stroke="#a65a78" stroke-opacity=".5" stroke-width=".85" stroke-linejoin="round"`;
  const pet=(d,fill,cls='',st='')=>`<path${cls} ${st} d="${d}" fill="${fill}" ${INKL}/><path d="${d}" fill="url(#o24pe)"/>`;
  const sh=turn*.16,bt=bud?.22:0; // ön petal kayması, tomurcukta uçlar içe/yukarı
  const backD=`M${P(0,.8)}C${P(-.6,.74)} ${P(-.64,-.3)} ${P(-.27,-.78)}C${P(-.14,-.94)} ${P(-.05,-1.02)} ${P(0,-1.03)}C${P(.05,-1.02)} ${P(.14,-.94)} ${P(.27,-.78)}C${P(.64,-.3)} ${P(.6,.74)} ${P(0,.8)}z`;
  const inner=s=>`M${P(s*.04+sh,.3)}C${P(s*.3+sh,-.1)} ${P(s*.36+sh,-.66)} ${P(s*.24+sh,-.94)}C${P(s*.2+sh,-.98)} ${P(s*.15+sh,-.95)} ${P(s*.12+sh,-.86)}C${P(s*.06+sh,-.55)} ${P(s*.02+sh,-.1)} ${P(s*.04+sh,.3)}z`;
  const side=s=>{const q=1-s*turn*.22,g=(a,b)=>P(-s*a*q,b);return`M${P(s*.04,.86)}C${g(.56,.84)} ${g(.84,.4)} ${g(.74,-.08)}C${g(.68-bt*.4,-.48)} ${g(.58-bt,-.72)} ${g(.52-bt,-.86)}C${g(.48-bt,-.94)} ${g(.41-bt,-.94)} ${g(.37-bt,-.84)}C${g(.22,-.56)} ${g(.12,-.24)} ${g(.06,.06)}C${g(.02,.36)} ${P(s*.02,.6)} ${P(s*.04,.86)}z`};
  const ft=bud?-.82:-.7,frontD=`M${P(sh*.4,.9)}C${P(-.5+sh*.5,.88)} ${P(-.62+sh,.32)} ${P(-.46+sh,-.2)}C${P(-.36+sh,-.48)} ${P(-.18+sh,ft+.08)} ${P(-.05+sh,ft)}C${P(-.02+sh,ft-.03)} ${P(.02+sh,ft-.03)} ${P(.05+sh,ft)}C${P(.18+sh,ft+.08)} ${P(.36+sh,-.48)} ${P(.46+sh,-.2)}C${P(.62+sh,.32)} ${P(.5+sh*.5,.88)} ${P(sh*.4,.9)}z`;
  const hs=r/34,cx=x+sh*k*r,hl=hat(cx-r*.24*k,y+r*.5,-62,3,7*hs,2.2*hs)+hat(cx+r*.3*k,y+r*.52,-118,3,6*hs,2.2*hs)+SL(x+sh*.4*k*r,y+r*.82,cx-r*.03,y+r*.1,cx+r*.01*k,y-r*.5,.45);
  const shine=`<ellipse cx="${f(cx-r*.16*k)}" cy="${f(y-r*.02)}" rx="${f(r*.13*k)}" ry="${f(r*.34)}" fill="url(#o24ph)" opacity=".45" transform="rotate(10 ${f(cx-r*.16*k)} ${f(y-r*.02)})"/>`;
  const sp=s=>pet(side(s),`url(#o24ps${T})`,' class="pl"',`style="--r:${bud?0:s*9}deg;${O}"`);
  const rec=`<path d="M${P(-.2,.78)}C${P(-.14,.98)} ${P(.14,.98)} ${P(.2,.78)}z" fill="#7fae8c" stroke="#4f7f63" stroke-opacity=".5" stroke-width=".8"/>`;
  const inn=bud?'':pet(inner(-1),'url(#o24pi)')+pet(inner(1),'url(#o24pi)');
  return`<g class="bob" style="--b:${(4.2+i*.45).toFixed(2)}s;--bd:-${(i*.7).toFixed(1)}s;${O}"><g class="head" style="--d:${d}ms;${O}"><g transform="rotate(${rot} ${f(bx)} ${f(by)})" filter="url(#o24sh)">${rec}${pet(backD,`url(#o24pb${T})`)}${inn}${sp(1)}${sp(-1)}${pet(frontD,`url(#o24pf${T})`)}<path d="${hl}" fill="#a65a78" fill-opacity=".36"/>${shine}</g></g></g>`}

// yaprak: uzun, kılıç biçimli, ucuna doğru kıvrılan; iki tonlu, orta damarlı. fold=1: açık (arka yüz) ton
function tLeaf(x,y,L,ang,dir,d,fold){
  const w=Math.min(L*.12,22),b=dir*L*.28,tx=b,ty=-L,ls=[-w*.55,0],rs=[w*.55,0];
  const left=`C${f(-w*1.25+b*.1)} ${f(-L*.32)} ${f(-w*.95+b*.55)} ${f(-L*.72)} ${f(tx)} ${f(ty)}`,right=`C${f(w*.7+b*.6)} ${f(-L*.74)} ${f(w*1.3+b*.12)} ${f(-L*.34)} ${f(rs[0])} 0`;
  const h=`<path d="M${f(ls[0])} 0${left}${right}z" fill="url(#${fold?'o24lc':'o24lb'})" stroke="#4f7f63" stroke-opacity=".5" stroke-width=".85" stroke-linejoin="round"/>
<path d="M${f(ls[0])} 0${left}C${f(b*.5)} ${f(-L*.76)} ${f(b*.05)} ${f(-L*.4)} 0 0z" fill="url(#o24la)"/>
<path d="${SL(0,-L*.05,b*.08,-L*.42,tx*.92,ty*.9,.6)}" fill="#4f7f63" fill-opacity=".4"/>
<path d="M${f(w*.5+b*.1)} ${f(-L*.2)}C${f(w*.8+b*.2)} ${f(-L*.4)} ${f(w*.6+b*.5)} ${f(-L*.62)} ${f(b*.7)} ${f(-L*.82)}" fill="none" stroke="#e8f4ea" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round"/>`;
  return`<g class="grow" style="--d:${d}ms;transform-origin:${x}px ${y}px"><g transform="translate(${x} ${y}) rotate(${ang})">${h}</g></g>`}

// gypsophila: ince dallar ucunda küçük beyaz çiçek kümeleri
function gyp(x,y,s,d,seed){
  let st='',fl='',R=seed*9301+49297;const rnd=()=>(R=(R*9301+49297)%233280)/233280;
  for(let j=0;j<5;j++){const a=-Math.PI/2+(rnd()-.5)*2.2,l=s*(.55+rnd()*.5),ex=x+Math.cos(a)*l,ey=y+Math.sin(a)*l;
    st+=`M${x} ${y}Q${f((x+ex)/2+(rnd()-.5)*4)} ${f((y+ey)/2)} ${f(ex)} ${f(ey)}`;
    for(let m=0;m<4;m++){const fx=ex+(rnd()-.5)*s*.55,fy=ey+(rnd()-.5)*s*.5,fr=1.5+rnd()*1.2;
      fl+=`<circle cx="${f(fx)}" cy="${f(fy)}" r="${f(fr)}" fill="#fffdfb"/><circle cx="${f(fx+.2)}" cy="${f(fy+.3)}" r="${f(fr*.38)}" fill="#e6d2cf"/>`}}
  return`<g class="pop" style="--d:${d}ms"><path d="${st}" fill="none" stroke="#7d9c86" stroke-opacity=".8" stroke-width=".7" stroke-linecap="round"/>${fl}</g>`}

// [x, y, r, eğim, tomurcuk, ton, yana dönüklük] — çizim sırası arkadan öne
const TH=[[206,108,22,3,1,1,0],[252,136,30,14,0,2,.6],[158,138,31,-15,0,0,-.5],[298,178,27,24,0,1,.8],[110,182,28,-26,0,2,-.8],[204,162,34,-3,0,0,.15],[102,226,21,-30,1,0,0],[152,210,37,-9,0,1,-.3],[252,214,35,11,0,2,.4],[304,226,27,24,0,0,.7],[202,248,32,2,0,1,-.15]];
const GY=[[182,122,15],[232,112,14],[128,164,14],[280,152,15],[228,188,12],[180,188,12],[122,250,14],[290,206,13],[232,266,12],[168,270,12],[84,200,13],[328,196,12],[206,214,11],[170,112,11],[244,120,10]];
function bouquet(){
  const O=[200,398];let st='',hd='';
  TH.forEach(([x,y,r],i)=>{const by=y+r*.8,c1x=200+(x-200)*.15,c2x=x+(200-x)*.1;
    const d=`M${O[0]} ${O[1]}C${f(c1x)} ${O[1]-70} ${f(c2x)} ${f(by+60)} ${x} ${f(by)}`;
    st+=`<path class="stem" pathLength="1" style="--d:${300+i*80}ms" d="${d}" fill="none" stroke="#4f7f63" stroke-width="5" stroke-linecap="round"/><path class="stem" pathLength="1" style="--d:${300+i*80}ms" d="${d}" fill="none" stroke="#86b494" stroke-width="3.4" stroke-linecap="round"/><path class="stem" pathLength="1" style="--d:${300+i*80}ms" d="${d}" fill="none" stroke="#d2ead7" stroke-opacity=".7" stroke-width="1" stroke-linecap="round" transform="translate(-.9 0)"/>`});
  TH.forEach(([x,y,r,rot,bud,tone,turn],i)=>{hd+=tHead(x,y,r,rot,1250+i*200,bud,i,tone,turn)});
  const gb=GY.slice(0,7).map(([x,y,s],i)=>gyp(x,y,s,3200+i*140,i+1)).join(''),gf=GY.slice(7).map(([x,y,s],i)=>gyp(x,y,s,3400+i*140,i+11)).join('');
  const lb=tLeaf(186,350,200,-25,-1,560,1)+tLeaf(214,350,194,26,1,600,1)+tLeaf(196,350,228,-12,1,640)+tLeaf(206,350,234,9,-1,680)+tLeaf(190,350,156,-34,-1,720)+tLeaf(212,350,152,35,1,760,1);
  const lf=tLeaf(192,352,156,-22,1,1500)+tLeaf(210,352,146,26,-1,1560,1);
  const bk=[[120,120,7],[292,108,6],[90,230,8],[318,236,6],[150,70,5],[250,62,6],[206,40,4],[60,160,5],[344,170,5],[110,290,4],[296,300,5],[200,150,4]].map(([x,y,s],i)=>`<circle class="bk" cx="${x}" cy="${y}" r="${s}" fill="url(#o24bk)" style="--d:${(2+i*.55).toFixed(2)}s;--t:${(5+i%4).toFixed(1)}s"/>`).join('');
  const sp=[[146,84,5],[268,80,4],[76,190,4],[330,196,5],[204,58,3.5]].map(([x,y,s],i)=>spark(x,y,s,3800+i*320)).join('');
  const fall=[0,1,2,3].map(i=>{const x=96+i*68,y=36+(i%2)*18;return`<g class="fall" style="--d:${(6+i*2.1).toFixed(1)}s;--t:${(9+i%2*2).toFixed(1)}s;--dx:${(i%2?-1:1)*(26+i*8)}px"><path d="M${x} ${y}c-5 4-6 11-1 15 5-2 8-9 6-15-2-1-4-1-5 0z" fill="#f7c3d3" fill-opacity=".9"/></g>`}).join('');
  // Telefonda kasmasın diye buket (çok sayıda blur/gölge filtresi) tek seferlik resme çevrilir: bqArt bir <img> olarak bir kez çizilir,
  // hareket (doğuş, salınım) resmin kendisine CSS ile verilir. Hafif süsler (ışıltı, bokeh, düşen yaprak) ayrı, filtresiz katmanlarda.
  return{art:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 64 400 432" width="800" height="864"><defs>${BQDEFS}${BQDEFS2}<pattern id="o24tx" width="48" height="48" patternUnits="userSpaceOnUse"><image href="${tex()}" width="48" height="48"/></pattern></defs>
${wrapBack()}
${lb}${st}${gb}${hd}${gf}${lf}
${wrapFront()}
</svg>`,back:`<svg class="o24-bql" viewBox="0 64 400 432" aria-hidden="true"><defs><radialGradient id="o24g"><stop offset="0" stop-color="#ffe3ec" stop-opacity=".5"/><stop offset=".5" stop-color="#f6b8cb" stop-opacity=".16"/><stop offset="1" stop-color="#f6b8cb" stop-opacity="0"/></radialGradient><radialGradient id="o24bk"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".4" stop-color="#ffe1ea" stop-opacity=".5"/><stop offset="1" stop-color="#ffd1df" stop-opacity="0"/></radialGradient></defs><circle class="glw" cx="200" cy="200" r="210" fill="url(#o24g)"/></svg>`,
  front:`<svg class="o24-bql" viewBox="0 64 400 432" aria-hidden="true">${bk}${sp}${fall}</svg>`}}
let BQ=null;
// buket resmini hazırlar (zarf açılırken arka planda); aynı resim "Tekrar izle"de de kullanılır
function prepBq(){
  if(BQ)return BQ.p;const b=bouquet(),u=URL.createObjectURL(new Blob([b.art],{type:'image/svg+xml'})),im=new Image();
  im.className='o24-bqi';im.alt='';im.src=u;BQ={u,b,p:im.decode().catch(()=>{})};return BQ.p}
function bqHTML(){return`<div class="o24-bq" aria-hidden="true">${BQ.b.back}<img class="o24-bqi" src="${BQ.u}" alt="">${BQ.b.front}</div>`}
// hüzmeler: [açı, genişlik px, uzunluk vmax, opaklık, gecikme ms, nabız s]. Tabanı geniş, ucu incelip silikleşir; her birinin bulanık bir ışıltı kopyası var
const RAYS=(()=>{let R=7,h='';const rnd=()=>(R=(R*9301+49297)%233280)/233280;
  for(let k=0;k<24;k++){const a=Math.round(k*15+(rnd()-.5)*11),up=Math.cos(a*Math.PI/180)>.2,w=2+rnd()*(k%3?8:16),l=Math.round((up?50:28)+rnd()*(up?48:34)),o=(.55+rnd()*.45).toFixed(2),d=Math.round(rnd()*420),p=(1.8+rnd()*1.6).toFixed(1);
    h+=`<i class="g" style="--a:${a}deg;--w:${f(w*4+10)}px;--l:${f(l*.85)}vmax;--o:${(o*.5).toFixed(2)};--d:${d}ms;--p:${p}s"><b></b></i><i style="--a:${a}deg;--w:${f(w)}px;--l:${l}vmax;--o:${o};--d:${d}ms;--p:${p}s"><b></b></i>`}
  return h})();
// hüzmeler her yöne: yukarı olanlar daha uzun; kenarları yumuşak (maske + bulanıklık), uca doğru silikleşir
// zarf: arka/iç yüz, ön cep, 3D açılan kapak (ön ve iç yüz), mum mühür (kırılınca iki parçaya ayrılır)
const EFLAP='M12 46Q12 44 16 44L224 44Q228 44 228 46L128 113Q120 118 112 113Z';
const EPOCK='M12 52L108 112Q120 120 132 112L228 52L228 152Q228 162 218 162L22 162Q12 162 12 152Z';
const blob=(cx,cy,rs)=>{const n=rs.length,p=rs.map((r,i)=>{const a=i/n*Math.PI*2;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r]});let d='';
  for(let i=0;i<n;i++){const a=p[i],b=p[(i+1)%n],m=[(a[0]+b[0])/2,(a[1]+b[1])/2];d+=(i?'':`M${f((p[n-1][0]+a[0])/2)} ${f((p[n-1][1]+a[1])/2)}`)+`Q${f(a[0])} ${f(a[1])} ${f(m[0])} ${f(m[1])}`}return d+'Z'};
const SEAL=`<ellipse cx="121" cy="118" rx="17" ry="14" fill="#3d2340" opacity=".35" filter="url(#o24eb)"/>
<path d="${blob(120,113,[17.4,18.6,16.8,18.1,19,17.2,17.8,18.5,16.6,17.9,18.8,17.1,16.9,18.3])}" fill="url(#o24m1)"/>
<path d="${blob(120,113,[17.4,18.6,16.8,18.1,19,17.2,17.8,18.5,16.6,17.9,18.8,17.1,16.9,18.3])}" fill="url(#o24m2)"/>
<circle cx="120" cy="113" r="11.6" fill="none" stroke="#9c3a61" stroke-opacity=".45" stroke-width="1.8"/>
<path d="M110.5 107A11.6 11.6 0 0 1 126 102.6" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="1.1" stroke-linecap="round"/>
<path d="M120 120.5C111 113.5 111.6 106 116.2 106.2C118 106.3 119.4 107.6 120 109C120.6 107.6 122 106.3 123.8 106.2C128.4 106 129 113.5 120 120.5Z" fill="#b84a72"/>
<path d="M116.2 106.6C113.4 106.8 112.6 110.6 115.4 114" fill="none" stroke="#ffd9e5" stroke-opacity=".55" stroke-width=".9" stroke-linecap="round"/>
<path d="M124.6 107C127.6 108.4 127 113 120.4 119.6" fill="none" stroke="#7d2648" stroke-opacity=".45" stroke-width=".9" stroke-linecap="round"/>
<ellipse cx="112.5" cy="104.5" rx="4.2" ry="2.4" fill="#fff" opacity=".5" transform="rotate(-28 112.5 104.5)" filter="url(#o24es)"/>`;
const ENV=`<svg class="o24-eb" viewBox="0 0 240 170" aria-hidden="true"><defs>
<linearGradient id="o24e1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9f88da"/><stop offset=".5" stop-color="#b29ee6"/><stop offset="1" stop-color="#c3b2ee"/></linearGradient>
<linearGradient id="o24e2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d3c5f6"/><stop offset=".7" stop-color="#c0adf0"/><stop offset="1" stop-color="#ae98e8"/></linearGradient>
<linearGradient id="o24e5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8a5ea"/><stop offset="1" stop-color="#9c86d6"/></linearGradient>
<linearGradient id="o24e4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9cdf8"/><stop offset="1" stop-color="#c2b0f0"/></linearGradient>
<radialGradient id="o24e3" cx=".5" cy=".55" r=".72"><stop offset=".55" stop-color="#5b4596" stop-opacity="0"/><stop offset="1" stop-color="#5b4596" stop-opacity=".32"/></radialGradient>
<radialGradient id="o24m1" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#f3a8c1"/><stop offset=".55" stop-color="#d8698f"/><stop offset="1" stop-color="#a8406a"/></radialGradient>
<radialGradient id="o24m2" cx=".5" cy=".5" r=".5"><stop offset=".8" stop-color="#7d2648" stop-opacity="0"/><stop offset="1" stop-color="#7d2648" stop-opacity=".45"/></radialGradient>
<pattern id="o24etx" width="48" height="48" patternUnits="userSpaceOnUse"><image href="${tex()}" width="48" height="48"/></pattern>
<filter id="o24eb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="o24es" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1"/></filter>
<clipPath id="o24mc1"><path d="M90 88L121 88L117 101L123 109L117.5 119L122 140L90 140Z"/></clipPath>
<clipPath id="o24mc2"><path d="M150 88L121 88L117 101L123 109L117.5 119L122 140L150 140Z"/></clipPath></defs>
<rect x="12" y="44" width="216" height="118" rx="10" fill="url(#o24e1)"/><rect x="12" y="44" width="216" height="118" rx="10" fill="url(#o24etx)" opacity=".5"/></svg>
<div class="o24-leak"></div>
<svg class="o24-el" viewBox="0 0 240 170" aria-hidden="true"><path d="${EPOCK}" fill="url(#o24e4)"/><path d="${EPOCK}" fill="url(#o24e3)"/><path d="${EPOCK}" fill="url(#o24etx)" opacity=".7"/>
<path d="M15 159L103 106M225 159L137 106" stroke="#8a72cc" stroke-opacity=".4" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M16 161L104 108M224 161L136 108" stroke="#fff" stroke-opacity=".35" stroke-width="1" fill="none" stroke-linecap="round"/>
<path d="${EPOCK}" fill="none" stroke="#8a72cc" stroke-opacity=".45" stroke-width="1"/>
<path class="o24-fsh" d="${EFLAP}" transform="translate(0 4)" fill="#3a2a6a" opacity=".38" filter="url(#o24eb)"/></svg>
<div class="o24-flapw"><svg viewBox="0 0 240 170" aria-hidden="true"><path d="${EFLAP}" fill="url(#o24e5)"/><path d="${EFLAP}" fill="url(#o24etx)" opacity=".5"/>
<g class="o24-ff"><path d="${EFLAP}" fill="url(#o24e2)"/><path d="${EFLAP}" fill="url(#o24e3)" opacity=".7"/><path d="${EFLAP}" fill="url(#o24etx)" opacity=".7"/><path d="M18 46.5L222 46.5" stroke="#fff" stroke-opacity=".45" stroke-width="1.2" stroke-linecap="round"/><path d="${EFLAP}" fill="none" stroke="#8a72cc" stroke-opacity=".5" stroke-width="1" stroke-linejoin="round"/></g></svg></div>
<svg class="o24-sealw" viewBox="0 0 240 170" aria-hidden="true"><g class="o24-sh1" clip-path="url(#o24mc1)">${SEAL}</g><g class="o24-sh2" clip-path="url(#o24mc2)">${SEAL}</g></svg>`;
const TWK=[[6,30,0],[88,18,1.6],[94,70,3.1],[2,82,4.4],[50,-6,2.3]].map(([x,y,d])=>`<s class="o24-tw" style="left:${x}%;top:${y}%;--d:${d}s"></s>`).join('');
const STAMP=`<svg class="o24-stamp" viewBox="0 0 56 56" aria-hidden="true">${petals(28,28,21,'#f8cfda')}</svg>`;
const MINI=`<svg class="o24-mini" viewBox="0 0 200 64" aria-hidden="true"><g class="pop" style="--d:200ms">${petals(52,34,22,'#c9b6f2')}</g><g class="pop" style="--d:450ms">${daisy(100,30,24)}</g><g class="pop" style="--d:700ms">${petals(148,34,22,'#ffc9a8')}</g></svg>`;
const IC={x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',on:'<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',off:'<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>'};

/* ---------- stil ---------- */
const CSS=`
.o24x{position:fixed;inset:0;z-index:1000;background:radial-gradient(120% 80% at 50% 30%,#262b48 0%,#151925 60%,#0e111b 100%);color:#f3eefe;font:16px/1.5 Nunito,system-ui,sans-serif;overflow:hidden;opacity:0;transition:opacity 1s;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
.o24x.on{opacity:1}
.o24x *{box-sizing:border-box}
.o24-stars{position:absolute;inset:0;pointer-events:none}
.o24-stars i{position:absolute;width:var(--z);height:var(--z);border-radius:50%;background:#fff;opacity:.15;animation:o24tw var(--t) ease-in-out var(--d) infinite alternate}
@keyframes o24tw{to{opacity:.9}}
.o24-s{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:calc(68px + env(safe-area-inset-top)) 16px calc(24px + env(safe-area-inset-bottom));text-align:center;opacity:0;visibility:hidden;transition:opacity 1.2s,visibility 0s 1.2s}
.o24-s.on{opacity:1;visibility:visible;transition:opacity 1.2s}
.o24-ctl{position:absolute;z-index:5;top:calc(10px + env(safe-area-inset-top));right:12px;display:flex;gap:8px}
.o24-ctl button{width:44px;height:44px;border-radius:50%;border:0;padding:0;background:rgba(21,25,37,.55);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18);color:#fff;display:grid;place-items:center;cursor:pointer;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.o24-ctl button[hidden]{display:none}
.o24-ctl svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.o24x button:focus-visible,.o24x input:focus-visible{outline:3px solid #ffc9a8;outline-offset:2px}
.o24-btn{font:800 17px/1 Nunito,system-ui,sans-serif;min-height:50px;padding:0 26px;border-radius:999px;border:2px solid ${INK};background:#ffc9a8;color:${INK};box-shadow:3px 4px 0 rgba(0,0,0,.35);cursor:pointer;flex:none}
.o24-btn:active{transform:translate(2px,2px);box-shadow:1px 2px 0 rgba(0,0,0,.35)}
.o24-btn:disabled{opacity:.6}
.o24-btn.ghost{background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.75);box-shadow:none}
.o24-later{opacity:0;transition:opacity 1.2s}
.o24-later.on{opacity:1}
.o24-later:not(.on){pointer-events:none}
.o24-lines{display:grid;gap:4px}
.o24-lines p{margin:0;font:600 clamp(27px,7.6vw,42px)/1.2 Fredoka,system-ui,sans-serif;opacity:0;transform:translateY(10px);transition:opacity 1.5s,transform 1.5s;text-wrap:balance}
.o24-lines p:first-child{font-size:clamp(18px,4.6vw,22px);color:#c9b6f2;margin-bottom:4px}
.o24-lines p.on{opacity:1;transform:none}
.o24-lines p.err{font:700 16px/1.4 Nunito,system-ui,sans-serif;color:#ffc9a8;margin-top:12px}
.o24-env{position:relative;width:min(220px,58vw);margin-top:10px;opacity:0;transform:translateY(24px) scale(.94);transition:opacity 1.2s,transform 1.2s cubic-bezier(.3,1.4,.5,1)}
.o24-env.on{opacity:1;transform:none}
.o24-envz{transition:transform .45s cubic-bezier(.3,1.5,.5,1)}
@media(hover:hover){.o24-env:not(.open):hover .o24-envz{transform:scale(1.04)}}
.o24-env:not(.open):active .o24-envz{transform:scale(1.04)}
.o24-envi{position:relative;animation:o24float 3s ease-in-out infinite alternate}
@keyframes o24float{from{transform:translateY(1.5px)}to{transform:translateY(-1.5px)}}
.o24-env svg{display:block;width:100%;height:auto;overflow:visible}
.o24-el,.o24-sealw,.o24-flapw{position:absolute;inset:0}
.o24-flapw{transform-origin:50% 25.9%;transform:perspective(520px) rotateX(0);transition:transform .62s cubic-bezier(.45,0,.25,1) .22s}
.o24-flapw svg{height:100%}
.o24-env.open .o24-flapw{transform:perspective(520px) rotateX(180deg)}
.o24-env.open .o24-ff{animation:o24fsw .62s linear .22s forwards}
@keyframes o24fsw{0%,49%{opacity:1}51%,100%{opacity:0}}
.o24-fsh{transition:opacity .3s .2s}
.o24-env.open .o24-fsh{opacity:0}
.o24-sealw{animation:o24seal 2.6s ease-in-out infinite alternate}
@keyframes o24seal{from{filter:drop-shadow(0 0 2px rgba(255,170,200,.25))}to{filter:drop-shadow(0 0 8px rgba(255,190,214,.8))}}
.o24-sh1,.o24-sh2{transform-box:fill-box;transform-origin:50% 50%;transition:transform .5s cubic-bezier(.3,0,.6,1),opacity .4s .1s}
.o24-env.open .o24-sealw{animation:none}
.o24-env.open .o24-sh1{transform:translate(-9px,7px) rotate(-28deg);opacity:0}
.o24-env.open .o24-sh2{transform:translate(9px,8px) rotate(24deg);opacity:0}
.o24-tw{position:absolute;width:12px;height:12px;margin:-6px;background:#fff4d6;clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%);opacity:0;pointer-events:none;animation:o24twk 5.2s ease-in-out var(--d) infinite}
@keyframes o24twk{0%,72%{opacity:0;transform:scale(.3) rotate(0)}82%{opacity:1;transform:scale(1) rotate(20deg)}100%{opacity:0;transform:scale(.4) rotate(45deg)}}
.o24-env.open .o24-tw{display:none}
.o24-env.no{animation:o24no .5s}
.o24-leak{position:absolute;left:12%;right:12%;top:12%;height:34%;border-radius:50%;background:radial-gradient(closest-side,#fffaf2 0%,rgba(255,236,242,.85) 35%,rgba(255,206,224,.35) 65%,transparent 100%);filter:blur(5px);opacity:0;transform:scale(.6);transition:opacity .8s .55s,transform 1.2s .55s}
.o24-env.open .o24-leak{opacity:1;transform:none}
.o24-env.lit .o24-leak{transform:scale(1.6);transition:transform 1s}
.o24-env.shk .o24-envz{animation:o24shk .95s linear forwards}
@keyframes o24shk{0%{transform:none}6%{transform:translate(-1px,.4px) rotate(-.5deg)}12%{transform:translate(1px,-.3px) rotate(.4deg)}18%{transform:translate(-.6px,-.5px) rotate(-.3deg)}26%{transform:translate(1.8px,.6px) rotate(.9deg)}33%{transform:translate(-2.2px,-.4px) rotate(-1.2deg)}40%{transform:translate(2.6px,-1px) rotate(1.4deg) scale(1.01)}47%{transform:translate(-3px,.8px) rotate(-1.8deg)}54%{transform:translate(3.2px,-1.4px) rotate(1.6deg) scale(1.015)}60%{transform:translate(-3.6px,-.6px) rotate(-2.2deg)}66%{transform:translate(4px,-2px) rotate(2.4deg) scale(1.025)}72%{transform:translate(-4.4px,-1.2px) rotate(-2.6deg) scale(1.02)}78%{transform:translate(5px,-2.6px) rotate(3deg) scale(1.035)}84%{transform:translate(-5px,-1.8px) rotate(-2.8deg) scale(1.04)}90%{transform:translate(3px,-3px) rotate(1.6deg) scale(1.03)}100%{transform:translateY(1px) scale(.97)}}
.o24-env.lit .o24-envz{animation:o24push .7s cubic-bezier(.2,1.6,.4,1) forwards}
@keyframes o24push{0%{transform:translateY(1px) scale(.97)}35%{transform:translateY(-3px) scale(1.06)}100%{transform:none}}
.o24-env.shk .o24-envi{animation:o24float 3s ease-in-out infinite alternate,o24flk .95s linear}
@keyframes o24flk{0%,100%{filter:none}15%{filter:brightness(1.08)}22%{filter:brightness(1.02)}38%{filter:brightness(1.14)}45%{filter:brightness(1.05)}62%{filter:brightness(1.22)}68%{filter:brightness(1.1)}84%{filter:brightness(1.32)}92%{filter:brightness(1.2)}}
.o24-env.shk .o24-leak{animation:o24leakf .95s linear}
@keyframes o24leakf{0%{opacity:1;transform:none}20%{opacity:.75;transform:scale(1.05)}32%{opacity:1;transform:scale(1.12)}48%{opacity:.8;transform:scale(1.1)}62%{opacity:1;transform:scale(1.25)}74%{opacity:.85;transform:scale(1.22)}88%{opacity:1;transform:scale(1.4)}100%{opacity:1;transform:scale(1.35)}}
.o24-eb,.o24-el,.o24-flapw svg{transition:filter 1s}
.o24-env.lit .o24-eb,.o24-env.lit .o24-el,.o24-env.lit .o24-flapw svg{filter:brightness(1.3) saturate(.85)}
.o24-rays{position:absolute;left:50%;top:25.9%;width:0;height:0;pointer-events:none;mix-blend-mode:screen;transition:filter 1.4s}
.o24-rr{position:absolute;left:0;top:0}
.o24-env.lit .o24-rr{animation:o24spin 9s ease-in-out infinite alternate}
@keyframes o24spin{from{transform:rotate(-6deg)}to{transform:rotate(8deg)}}
.o24-rays i{position:absolute;bottom:0;left:calc(var(--w) / -2);width:var(--w);height:var(--l);transform-origin:50% 100%;transform:rotate(var(--a));transition:transform 1.5s cubic-bezier(.5,0,.75,.5)}
.o24-rays b{display:block;width:100%;height:100%;transform-origin:50% 100%;transform:scaleY(0);opacity:0;background:linear-gradient(to top,rgba(255,255,255,.95) 0%,rgba(255,244,240,.75) 12%,rgba(255,226,236,.4) 45%,rgba(255,214,228,.12) 75%,rgba(255,214,228,0) 100%);-webkit-mask-image:linear-gradient(to right,transparent,#000 38%,#000 62%,transparent);mask-image:linear-gradient(to right,transparent,#000 38%,#000 62%,transparent);filter:blur(1.6px);border-radius:50%}
.o24-rays i.g b{filter:blur(12px)}
.o24-env.lit .o24-rays b{animation:o24ray .95s cubic-bezier(.12,.8,.2,1) var(--d) forwards,o24rayp var(--p) ease-in-out calc(var(--d) + .95s) infinite alternate}
@keyframes o24ray{to{transform:scaleY(1);opacity:var(--o)}}
@keyframes o24rayp{from{transform:scaleY(1);opacity:var(--o)}to{transform:scaleY(.74);opacity:calc(var(--o) * .65)}}
.o24-env.flood .o24-rays{filter:blur(5px)}
.o24-env.flood .o24-rays i{transform:rotate(var(--a)) scaleX(6)}
.o24-core{position:absolute;left:50%;top:25.9%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;pointer-events:none;background:radial-gradient(#fff 0%,#fff 22%,rgba(255,246,250,.9) 42%,rgba(255,210,226,0) 72%);opacity:0;transform:scale(.4)}
.o24-env.lit .o24-core{animation:o24core .7s cubic-bezier(.2,.8,.3,1) forwards,o24corep 1.3s ease-in-out .7s infinite alternate}
@keyframes o24core{to{opacity:1;transform:scale(3.6)}}
@keyframes o24corep{from{opacity:1;transform:scale(3.6)}to{opacity:.85;transform:scale(4.4)}}
.o24-env.flood .o24-core{animation:o24coref 1.7s cubic-bezier(.55,0,.85,.4) forwards}
@keyframes o24coref{from{opacity:1;transform:scale(4)}to{opacity:1;transform:scale(80)}}
.o24-perde .o24-lines{transition:opacity .6s}
.o24-perde.lit .o24-lines{opacity:0}
.o24-flash{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:0;background:radial-gradient(circle at 50% 50%,#fff 0%,#fff 55%,#fffaf6 100%)}
.o24-flash.go{opacity:1;transition:opacity .75s cubic-bezier(.5,0,.8,.6)}
.o24-flash.out{opacity:0;transition:opacity 2.4s cubic-bezier(.3,.2,.3,1)}
@keyframes o24no{20%,60%{transform:translateX(-10px)}40%,80%{transform:translateX(10px)}}
.o24-ask{display:grid;gap:10px;justify-items:center;width:min(340px,100%);opacity:0;transition:opacity 1s;pointer-events:none}
.o24-ask.on{opacity:1;pointer-events:auto}
.o24-ask label{font-weight:700;color:#e4dafb;font-size:17px}
.o24-ask input{width:100%;height:52px;border-radius:16px;border:2px solid #c9b6f2;background:rgba(255,255,255,.08);color:#fff;font:600 18px Nunito,system-ui,sans-serif;text-align:center;padding:0 14px;-webkit-user-select:text;user-select:text}
.o24-ask[data-m=tap] label,.o24-ask[data-m=tap] input{display:none}
.o24-hint{margin:0;font-size:14px;color:#a9b1c6;min-height:21px}
.o24-glow{position:absolute;left:50%;top:50%;width:40vmax;height:40vmax;margin:-20vmax 0 0 -20vmax;border-radius:50%;background:radial-gradient(#fff6e8 0%,rgba(255,201,168,.6) 35%,transparent 70%);transform:scale(0);opacity:0;pointer-events:none}
.o24-glow.go{animation:o24gl 2s ease-out forwards}
@keyframes o24gl{40%{opacity:1}to{transform:scale(4);opacity:0}}
.o24-buket h2{margin:0;font:600 clamp(30px,8.4vw,46px)/1.08 Fredoka,system-ui,sans-serif;color:#fff}
.o24-buket h2 span{display:block}
.o24-sub{margin:0;color:#c9b6f2;font-weight:700}
.o24-bq{position:relative;width:100%;height:min(56vh,500px);flex:0 1 auto;min-height:0;animation:o24born 1.9s cubic-bezier(.2,.7,.2,1) both}
@keyframes o24born{from{opacity:0;transform:scale(.9) translateY(14px);filter:blur(10px) brightness(2)}60%{filter:blur(1px) brightness(1.25)}to{opacity:1;transform:none;filter:none}}
.o24-bq>*{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.o24-bqi{display:block;object-fit:contain;transform-origin:50% 96%;-webkit-mask-image:linear-gradient(to top,#000 42%,transparent 72%);mask-image:linear-gradient(to top,#000 42%,transparent 72%);-webkit-mask-size:100% 300%;mask-size:100% 300%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:0 0;mask-position:0 0;animation:o24rise 2.8s cubic-bezier(.3,.6,.3,1) .15s forwards,o24sway 7s ease-in-out 5s infinite;will-change:transform}
@keyframes o24rise{to{-webkit-mask-position:0 100%;mask-position:0 100%}}
@keyframes o24sway{25%{transform:rotate(1deg)}75%{transform:rotate(-1deg)}}
.o24x .pop{transform-box:fill-box;transform-origin:center;transform:scale(0);animation:o24pop .9s cubic-bezier(.3,1.6,.5,1) var(--d) forwards}
@keyframes o24pop{to{transform:scale(1)}}
.o24-bq .glw{opacity:0;transform-box:fill-box;transform-origin:center;animation:o24glw 2.5s ease-out .4s forwards,o24pulse 4.5s ease-in-out 2.9s infinite alternate}
@keyframes o24glw{to{opacity:1}}
@keyframes o24pulse{from{opacity:1;transform:scale(1)}to{opacity:.65;transform:scale(1.07)}}
.o24-bq .spk{opacity:0;animation:o24tw 1.8s ease-in-out var(--d) infinite alternate}
.o24-bq .bk{opacity:0;transform-box:fill-box;transform-origin:center;animation:o24bk var(--t) ease-in-out var(--d) infinite}
@keyframes o24bk{0%{opacity:0;transform:none}35%{opacity:.9}100%{opacity:0;transform:translateY(-80px) scale(.6)}}
.o24-bq .fall{opacity:0;transform-box:fill-box;transform-origin:center;animation:o24fall var(--t) linear var(--d) infinite}
@keyframes o24fall{0%{opacity:0;transform:none}10%,80%{opacity:.9}100%{opacity:0;transform:translate(var(--dx),420px) rotate(300deg)}}
.o24-mektup{justify-content:flex-start;overflow-y:auto;-webkit-overflow-scrolling:touch}
.o24-card{margin:auto 0 0;width:min(560px,100%);flex:none;position:relative;background-color:#fffaf0;background-image:repeating-linear-gradient(to bottom,transparent 0 33px,#efe3d1 33px 34px);color:#3a3348;border:2px solid ${INK};border-radius:18px;box-shadow:5px 6px 0 rgba(0,0,0,.35);padding:34px 24px 30px;text-align:left;cursor:pointer}
.o24-card p{margin:0 0 34px;font:500 25px/34px Caveat,'Segoe Print',cursive;opacity:0;transform:translateY(6px);transition:opacity 1.3s,transform 1.3s}
.o24-card p.on{opacity:1;transform:none}
.o24-card p.imza{margin:0;text-align:right;font-weight:700;white-space:pre-line}
.o24-card p.imza .tarih{font-weight:500}
.o24-sig{display:block;margin:0 0 0 auto;height:68px;width:auto;max-width:70%;clip-path:inset(0 100% 0 0);transition:clip-path 2s ease-in-out 1s}
.o24-card p.imza.on .o24-sig{clip-path:inset(0 0 0 0)}
.o24-stamp{position:absolute;top:-24px;right:16px;width:56px;height:56px}
.o24-mektup .o24-btn{margin:18px 0 auto}
.o24-slayt{padding:0;background:#0b0d14}
.o24-wait{color:#a9b1c6}
.o24-sl{position:absolute;inset:0;opacity:0;transition:opacity 1.5s;--kb:calc(var(--dur) + 1600ms)}
.o24-sl.on{opacity:1}
.o24-sl img{position:absolute;display:block;-webkit-user-drag:none}
.o24-sl .bg{left:-8%;top:-8%;width:116%;height:116%;object-fit:cover;filter:blur(26px) brightness(.5) saturate(1.2)}
.o24-sl .fg{left:0;top:0;width:100%;height:100%;object-fit:contain;padding:calc(66px + env(safe-area-inset-top)) 12px calc(100px + env(safe-area-inset-bottom))}
.o24-sl.on .fg,.o24-sl.out .fg{animation:o24kb var(--kb) ease-out forwards}
@keyframes o24kb{from{transform:none}to{transform:scale(1.08) translate(var(--tx),var(--ty))}}
.o24-cap{position:absolute;left:16px;right:16px;bottom:calc(46px + env(safe-area-inset-bottom));margin:0;font:600 22px/1.2 Fredoka,system-ui,sans-serif;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.6)}
.o24-bar{position:absolute;left:16px;right:16px;bottom:calc(22px + env(safe-area-inset-bottom));display:flex;gap:4px;z-index:2}
.o24-bar i{flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.25);overflow:hidden}
.o24-bar b{display:block;height:100%;width:0;background:#fff}
.o24-bar i.done b{width:100%}
.o24-bar i.on b{animation:o24fill var(--dur) linear forwards}
@keyframes o24fill{to{width:100%}}
.o24x.paused *{animation-play-state:paused!important}
.o24-son{background:linear-gradient(180deg,#151925 0%,#2e2a55 38%,#8c74d6 74%,#ffc9a8 100%)}
.o24-son h2{margin:0;font:600 clamp(44px,12.5vw,76px)/1 Fredoka,system-ui,sans-serif;color:#fff;text-wrap:balance}
.o24-son p{margin:0;font-weight:700;color:#fff}
.o24-son h2 em{font-style:normal;color:#ffc9a8}
.o24-card em{font-style:normal;font-weight:700;color:#b2486a}
.o24-mini{width:180px;height:auto;overflow:visible}
.o24-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:14px}
@media(prefers-reduced-motion:reduce){.o24-stars i,.o24-bq .spk{animation:none;opacity:.45}.o24x .pop{animation:none;transform:none}.o24-sl.on .fg,.o24-sl.out .fg{animation:none}.o24-env,.o24-lines p,.o24-card p{transition-property:opacity}.o24-glow.go{animation:none}.o24-bq,.o24-bqi,.o24-bq .glw{animation:none;transform:none;opacity:1;filter:none;-webkit-mask-image:none;mask-image:none}.o24-bq .fall,.o24-bq .bk,.o24-rays{display:none}.o24-sig{clip-path:none;transition:none}.o24-envi,.o24-sealw,.o24-tw,.o24-env.shk .o24-envz{animation:none}.o24-tw{display:none}.o24-flapw{transition-duration:.25s}}`;

/* ---------- durum ---------- */
let root=null,aud=null,audU='',run=0,opt={},content=null,urls=[],photosP=null,cachedRaw=null,prevOv='',wasPlaying=false,tm={};
const S={},$=s=>root.querySelector(s);
const tset=(fn,ms)=>{clearTimeout(tm.id);tm={fn,left:ms,end:Date.now()+ms,id:setTimeout(()=>{tm={};fn()},ms)}};
const tclr=()=>{clearTimeout(tm.id);tm={}};
const tpause=()=>{if(tm.id){clearTimeout(tm.id);tm.left=Math.max(0,tm.end-Date.now());tm.id=0}};
const tresume=()=>{if(tm.fn&&!tm.id){const fn=tm.fn;tm.end=Date.now()+tm.left;tm.id=setTimeout(()=>{tm={};fn()},tm.left)}};
const show=k=>Object.keys(S).forEach(n=>S[n].classList.toggle('on',n===k));
const later=(sec,list,my)=>list.forEach(([i,ms])=>setTimeout(()=>{if(my===run)sec.querySelectorAll('.o24-later')[i].classList.add('on')},RM?Math.min(ms,600):ms));

function sndUI(){if(!root)return;const off=!aud||aud.muted||aud.paused,b=$('.o24-snd');b.innerHTML=off?IC.off:IC.on;b.setAttribute('aria-label',off?'Sesi aç':'Sesi kapat')}
const playA=()=>{try{const p=aud.play();if(p)p.then(sndUI,sndUI)}catch(e){}};
// iOS/Android sesi ancak bir dokunuşun içinde başlatmaya izin veriyor. Cevap klavyeden "git" ile gönderilince bu dokunuş sayılmayabiliyor
// ve şifre çözme birkaç saniye sürüyor; bu yüzden ilk dokunuşta şarkı sessizce çalmaya başlar, zarf açılınca baştan ve sesli devam eder.
let armed=false;
const unlock=()=>{if(armed||!aud)return;armed=true;aud.muted=true;try{const p=aud.play();if(p)p.catch(()=>{armed=false})}catch(e){armed=false}};
function onVis(){if(!root)return;if(document.hidden){root.classList.add('paused');wasPlaying=!aud.paused;aud.pause();tpause()}else{root.classList.remove('paused');if(wasPlaying)playA();tresume()}}
function onKey(e){if(e.key==='Escape')close()}

function build(){
  const st=document.getElementById('o24css')||document.head.appendChild(Object.assign(document.createElement('style'),{id:'o24css',textContent:CSS}));
  if(!document.getElementById('o24font'))document.head.appendChild(Object.assign(document.createElement('link'),{id:'o24font',rel:'stylesheet',href:'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap'}));
  let stars='';for(let i=0;i<70;i++)stars+=`<i style="left:${(Math.random()*100).toFixed(1)}%;top:${(Math.random()*100).toFixed(1)}%;--z:${(1+Math.random()*2).toFixed(1)}px;--t:${(2+Math.random()*3).toFixed(1)}s;--d:-${(Math.random()*4).toFixed(1)}s"></i>`;
  root=document.createElement('div');root.className='o24x';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Öğretmenler Günü sürprizi');
  root.innerHTML=`<div class="o24-stars">${stars}</div>
<div class="o24-ctl"><button type="button" class="o24-snd" hidden></button><button type="button" class="o24-cls" aria-label="Kapat">${IC.x}</button></div>
<section class="o24-s o24-perde"><div class="o24-lines" aria-live="polite"></div><div class="o24-env"><div class="o24-envz"><div class="o24-envi">${ENV}<div class="o24-core"></div><div class="o24-rays"><div class="o24-rr">${RAYS}</div></div>${TWK}</div></div></div><form class="o24-ask" autocomplete="off"><label for="o24q"></label><input id="o24q" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go"><button class="o24-btn" type="submit">Aç</button><p class="o24-hint" aria-live="polite"></p></form><div class="o24-glow"></div></section>
<section class="o24-s o24-buket"></section><section class="o24-s o24-mektup"></section><section class="o24-s o24-slayt"></section><section class="o24-s o24-son"></section><div class="o24-flash"></div>`;
  ['perde','buket','mektup','slayt','son'].forEach(k=>S[k]=$('.o24-'+k));
  $('.o24-cls').onclick=close;
  $('.o24-snd').onclick=()=>{if(aud.paused){aud.muted=false;playA()}else aud.muted=!aud.muted;sndUI()};
  $('.o24-ask').onsubmit=onAsk;
}

function setAsk(mode){const a=$('.o24-ask');a.dataset.m=mode;$('.o24-ask label').textContent=meta.soru;a.querySelector('button').textContent=mode==='tap'?'Zarfı aç':'Aç'}

async function start(o){
  if(root)return;opt=o||{};if(opt.reset)ls.del('ogr24:k');
  content=null;urls=[];photosP=null;
  build();document.body.appendChild(root);
  prevOv=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';
  document.addEventListener('visibilitychange',onVis);document.addEventListener('keydown',onKey);
  armed=false;aud=new Audio(B+'sarki.mp3');aud.preload='auto';aud.addEventListener('pause',sndUI);aud.addEventListener('play',sndUI);aud.addEventListener('volumechange',sndUI);
  // şarkıyı perde yazıları akarken tamamen indir; dokunuştan önce inerse çalmaya hemen hazır olur
  {const a=aud;fetch(B+'sarki.mp3').then(r=>{if(!r.ok)throw 0;return r.blob()}).then(bl=>{if(aud!==a||armed)return;audU=URL.createObjectURL(bl);a.src=audU;a.load()}).catch(()=>{})}
  root.addEventListener('touchend',unlock,{capture:true,passive:true});root.addEventListener('click',unlock,true);
  const my=++run,mp=prefetch();
  nextFrame(()=>root.classList.add('on'));show('perde');
  const lines=$('.o24-lines');await wait(1000);
  for(const t of PERDE){if(my!==run)return;const p=document.createElement('p');p.textContent=t;lines.appendChild(p);nextFrame(()=>p.classList.add('on'));await wait(2100)}
  let m;try{m=await mp}catch(e){if(my!==run)return;const p=document.createElement('p');p.className='err on';p.textContent='Sürpriz yüklenemedi. İnternete bağlanıp tekrar açar mısın?';lines.appendChild(p);return}
  if(my!==run)return;
  let c=null;try{c=JSON.parse(ls.get('ogr24:k'))}catch(e){}
  cachedRaw=c&&c.t===m.tuz?b64(c.k):null;
  if(m.v>1&&!cachedRaw&&!secret()){const p=document.createElement('p');p.className='err on';p.textContent='Bu zarf sana gönderdiğim özel bağlantıyla açılıyor 💌 Mesajlardaki linke dokunur musun?';lines.appendChild(p);$('.o24-env').classList.add('on');return}
  setAsk(cachedRaw?'tap':'q');
  $('.o24-env').classList.add('on');await wait(800);if(my!==run)return;$('.o24-ask').classList.add('on');
}

async function onAsk(e){
  e.preventDefault();const a=$('.o24-ask'),btn=a.querySelector('button'),inp=$('#o24q'),hint=$('.o24-hint'),env=$('.o24-env');
  if(btn.disabled)return;unlock();btn.disabled=true;const my=run,mode=a.dataset.m;
  let b0;try{b0=await bufs[0]}catch(err){btn.disabled=false;hint.textContent='Bağlantı koptu gibi, bir daha dener misin?';pre=null;prefetch().catch(()=>{});return}
  try{
    const raw=mode==='tap'?cachedRaw:await derive(inp.value,meta);
    const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);
    content=JSON.parse(new TextDecoder().decode(await dec(key,b0)));
    if(my!==run)return;
    ls.set('ogr24:k',JSON.stringify({t:meta.tuz,k:u8b64(raw)}));if(!opt.preview)ls.set('ogr24:seen','1');
    inp.blur();openEnv(key,my);
  }catch(err){
    if(my!==run)return;btn.disabled=false;
    if(mode==='tap'){ls.del('ogr24:k');setAsk('q');return}
    env.classList.remove('no');void env.offsetWidth;env.classList.add('no');
    hint.textContent='Olmadı. '+(meta.ipucu||'Bir daha dene.');inp.select();
  }
}

async function decPhotos(key){
  const list=await Promise.all(bufs.slice(1).map(async p=>{const u=URL.createObjectURL(new Blob([await dec(key,await p)],{type:'image/jpeg'}));const im=new Image();im.src=u;try{await im.decode()}catch(e){}return u}));
  urls=list;return list}

async function openEnv(key,my){
  photosP=decPhotos(key);photosP.catch(()=>{});prepBq();
  try{aud.currentTime=0}catch(e){}aud.muted=false;playA();$('.o24-snd').hidden=false;
  const env=$('.o24-env'),fl=$('.o24-flash');
  $('.o24-ask').classList.remove('on');env.classList.add('open');       // 1) mühür kırılır, kapak 3D açılır
  await wait(RM?300:950);if(my!==run)return;
  env.classList.add('shk');                                               // 2) içeriden ışık sızar, zarf titrer
  await wait(RM?100:950);if(my!==run)return;
  env.classList.add('lit');S.perde.classList.add('lit');                  // 3) hüzmeler patlar, yazılar kaybolur
  await wait(RM?200:750);if(my!==run)return;
  env.classList.add('flood');                                             // 4) ışık büyür, hüzmeler birleşir
  await wait(RM?100:650);if(my!==run)return;
  fl.classList.remove('out');fl.classList.add('go');                      //    ekran beyaza boğulur
  await wait(RM?200:1100);if(my!==run)return;
  await prepBq();if(my!==run)return;
  S.perde.style.transition='none';buket(my);                              // 5) beyaz kısa bir an kalır, buket sahnesi
  await wait(300);if(my!==run)return;
  fl.classList.add('out');fl.classList.remove('go');
  setTimeout(()=>{fl.classList.remove('out');S.perde.style.transition=''},2800)}

function buket(my){
  tclr();const s=S.buket;
  s.innerHTML=`<h2 class="o24-later"><span>${BASLIK[0]}</span><span>${BASLIK[1]}</span></h2>${bqHTML()}<p class="o24-sub o24-later">${ALT}</p><button class="o24-btn o24-later" type="button">Mektubun var ›</button>`;
  show('buket');later(s,[[0,4300],[1,5400],[2,6600]],my);
  s.querySelector('button').onclick=()=>{tclr();mektup(my)};
  tset(()=>{if(my===run)mektup(my)},19000)}

async function mektup(my){
  const s=S.mektup;
  s.innerHTML=`<div class="o24-card">${STAMP}${content.mektup.map(p=>`<p>${vurgu(p).replace(/\n/g,'<br>')}</p>`).join('')}${content.imza||content.tarih||content.imzaResim?`<p class="imza">${esc(content.imza||'')}${content.tarih?`<br><span class="tarih">${esc(content.tarih)}</span>`:''}${content.imzaResim?`<img class="o24-sig" src="${content.imzaResim}" alt="imza">`:''}</p>`:''}</div><button class="o24-btn o24-later" type="button">Şimdi biraz biz ›</button>`;
  show('mektup');s.scrollTop=0;
  const ps=[...s.querySelectorAll('.o24-card p')],btn=s.querySelector('.o24-btn');let all=false;
  const done=()=>{btn.classList.add('on')};
  s.querySelector('.o24-card').onclick=()=>{if(all)return;all=true;ps.forEach(p=>p.classList.add('on'));done()};
  btn.onclick=()=>slayt(my);
  await wait(1400);
  for(const p of ps){if(my!==run||all)return;p.classList.add('on');p.scrollIntoView({block:'nearest',behavior:RM?'auto':'smooth'});await wait(Math.min(5200,1300+p.textContent.length*38))}
  if(my===run&&!all){all=true;done();btn.scrollIntoView({block:'nearest',behavior:'smooth'})}}

async function slayt(my){
  const s=S.slayt;s.innerHTML='<p class="o24-wait">…</p>';show('slayt');
  try{await photosP}catch(e){return son(my)}
  if(my!==run)return;const n=urls.length;if(!n)return son(my);
  const rest=isFinite(aud.duration)&&!aud.paused?aud.duration-aud.currentTime-6:n*7;
  const per=Math.round(Math.max(5,Math.min(11,rest/n))*1000);
  const D=[[-2,-2],[2,-1.5],[-1.5,2],[2,2]];
  s.style.setProperty('--dur',per+'ms');
  s.innerHTML=urls.map((u,i)=>{const c=(content.fotolar[i]||{}).c||'';return`<div class="o24-sl" style="--tx:${D[i%4][0]}%;--ty:${D[i%4][1]}%"><img class="bg" src="${u}" alt=""><img class="fg" src="${u}" alt="${esc(c)}">${c?`<p class="o24-cap">${esc(c)}</p>`:''}</div>`}).join('')+`<div class="o24-bar">${urls.map(()=>'<i><b></b></i>').join('')}</div>`;
  const sl=[...s.querySelectorAll('.o24-sl')],bar=[...s.querySelectorAll('.o24-bar i')];let cur=-1;
  const go=j=>{
    if(my!==run)return;if(j>=n){tclr();return son(my)}j=Math.max(0,j);
    if(cur>=0&&cur!==j){const p=sl[cur];p.classList.remove('on');p.classList.add('out');setTimeout(()=>p.classList.remove('out'),1600)}
    sl[j].classList.remove('on','out');void sl[j].offsetWidth;sl[j].classList.add('on');
    bar.forEach((b,k)=>{b.classList.toggle('done',k<j);b.classList.remove('on')});void bar[j].offsetWidth;bar[j].classList.add('on');
    cur=j;tset(()=>go(cur+1),per)};
  s.onclick=e=>go(e.clientX<innerWidth/3?cur-1:cur+1);
  go(0)}

function son(my){
  const s=S.son;S.slayt.onclick=null;
  s.innerHTML=`${MINI}<h2 class="o24-later">${vurgu(content.kapanis||'Seni seviyorum')}</h2><p class="o24-later">Öğretmenler Günün kutlu olsun 🌷</p><div class="o24-row o24-later"><button class="o24-btn ghost" type="button" data-a="r">Tekrar izle</button><button class="o24-btn" type="button" data-a="c">Plana dön</button></div>`;
  show('son');later(s,[[0,700],[1,1900],[2,3200]],my);
  s.querySelector('[data-a=r]').onclick=()=>{const m2=++run;aud.currentTime=0;aud.muted=false;playA();prepBq().then(()=>{if(m2===run)buket(m2)})};
  s.querySelector('[data-a=c]').onclick=close}

function close(){
  if(!root)return;run++;tclr();if(!opt.preview)ls.set('ogr24:seen','1');
  const r=root,a=aud,u=urls,au=audU;root=null;aud=null;urls=[];photosP=null;audU='';armed=false;
  document.removeEventListener('visibilitychange',onVis);document.removeEventListener('keydown',onKey);
  let v=a.volume;const iv=setInterval(()=>{v-=.08;if(v<=0||a.paused){clearInterval(iv);a.pause();a.removeAttribute('src');a.load();if(au)URL.revokeObjectURL(au)}else a.volume=v},80);
  r.classList.remove('on');
  setTimeout(()=>{r.remove();u.forEach(x=>URL.revokeObjectURL(x));document.documentElement.style.overflow=prevOv},1000)}

window.OGR24={start,close};
})();

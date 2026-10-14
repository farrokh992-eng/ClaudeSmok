/* کهربا — فروشگاه دخانیات (نسخهٔ آزمایشی) */
const SITE={name:'کهربا',phone:'۰۲۱-۰۰۰۰۰۰۰۰',email:'info@kahrba.example',addr:'نشانی واقعی فروشگاه را اینجا بنویسید',hours:'شنبه تا پنجشنبه، ۹ تا ۱۸'};
const $=s=>document.querySelector(s), app=$('#app'), DIG='۰۱۲۳۴۵۶۷۸۹';
const fa=s=>String(s).replace(/\d/g,d=>DIG[d]);
const num=n=>Number(n).toLocaleString('fa-IR');
const T=n=>num(n)+' تومان';
const en=s=>String(s).replace(/[۰-۹]/g,d=>DIG.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem('kb_'+k))??d}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem('kb_'+k,JSON.stringify(v))}catch{}};
let cart=load('cart',{}),coupon=load('coupon',null),orders=load('orders',[]),stockMap=load('stock',{}),shipSel=load('ship','post'),timer=null;
let F={q:'',cat:-1,brand:'',sort:'pop',max:0};
const MAXQ=10, FREE_SHIP=800000;
const COUPONS={KAHRBA10:['۱۰٪ تخفیف',.1],WELCOME5:['۵٪ تخفیف',.05]};
const SHIPS={
 post:{name:'پست پیشتاز',fee:60000,days:[3,5],note:'سراسر کشور، بسته‌بندی بدون برند'},
 courier:{name:'پیک موتوری',fee:100000,days:[0,1],note:'فقط تهران',only:'تهران'},
 pickup:{name:'تحویل حضوری',fee:0,days:[0,0],note:'از فروشگاه با هماهنگی قبلی'}
};
const PROV='تهران,البرز,اصفهان,خراسان رضوی,فارس,آذربایجان شرقی,آذربایجان غربی,خوزستان,مازندران,گیلان,کرمان,قم,یزد,هرمزگان,کرمانشاه,همدان,مرکزی,زنجان,قزوین,لرستان,اردبیل,گلستان,سیستان و بلوچستان,کردستان,بوشهر,سمنان,ایلام,چهارمحال و بختیاری,خراسان شمالی,خراسان جنوبی,کهگیلویه و بویراحمد'.split(',');
const MONTHS='فروردین,اردیبهشت,خرداد,تیر,مرداد,شهریور,مهر,آبان,آذر,دی,بهمن,اسفند'.split(',');
const BRANDS=[...new Set(PRODUCTS.map(p=>p.brand))];
const P=id=>PRODUCTS.find(p=>p.id===+id);
const stock=id=>stockMap[id]??P(id).stock;
const lim=id=>Math.min(stock(id),MAXQ);
const MARK=(s=40)=>`<svg width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 3l22 14v30L32 61 10 47V17z" fill="#C8963E"/><path d="M32 3l22 14-22 12L10 17z" fill="#E0B565"/><path d="M32 29v32L10 47V17z" fill="#A57424"/><path d="M32 29l22-12v30L32 61z" fill="#8A5F1B"/></svg>`;
const SVGI=p=>`<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const pic=(p,c='')=>`<div class="pic ${c}"><svg viewBox="0 0 100 100" aria-hidden="true">${ART[p.art](p.c)}</svg><img src="images/p${p.id}.jpg" alt="${p.name}" loading="lazy" onerror="this.remove()"></div>`;
const when=d=>new Date(Date.now()+d*864e5).toLocaleDateString('fa-IR',{weekday:'long',day:'numeric',month:'long'});
const eta=m=>{const [a,b]=SHIPS[m].days;return !a&&!b?'آماده در ۲۴ ساعت':!a?'تحویل: امروز تا فردا':`تحویل: ${when(a)} تا ${when(b)}`};
const WARN='هشدار: مصرف دخانیات برای سلامت زیان‌آور است · فروش به افراد زیر ۱۸ سال ممنوع';

/* ---------- ابزارها ---------- */
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2000)}
function commit(){save('cart',cart);const n=num(Object.values(cart).reduce((a,b)=>a+b,0));document.querySelectorAll('.bd').forEach(b=>b.textContent=n)}
function add(id,n=1){
  const q=(cart[id]||0)+n,l=lim(id);
  if(q>l){toast(l<MAXQ?'موجودی کافی نیست':`حداکثر ${num(MAXQ)} عدد از هر کالا در هر سفارش`);return false}
  cart[id]=q;commit();toast('به سبد خرید اضافه شد');return true;
}
function totals(m){
  const sub=Object.entries(cart).reduce((s,[id,q])=>s+P(id).price*q,0);
  const disc=coupon&&COUPONS[coupon]?Math.round(sub*COUPONS[coupon][1]):0,base=sub-disc;
  const ship=m&&sub?(m==='post'&&base>=FREE_SHIP?0:SHIPS[m].fee):0;
  return{sub,disc,base,ship,total:base+ship};
}
function jnow(){const p=new Intl.DateTimeFormat('en-u-ca-persian',{year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date());const g=t=>parseInt(p.find(x=>x.type===t).value,10);return[g('year'),g('month'),g('day')]}
function adult(y,m,d){const[ny,nm,nd]=jnow();return ny-y-((nm<m||(nm===m&&nd<d))?1:0)>=18}
function nid(c){if(!/^\d{10}$/.test(c)||/^(\d)\1{9}$/.test(c))return false;let s=0;for(let i=0;i<9;i++)s+=c[i]*(10-i);const r=s%11;return r<2?+c[9]===r:+c[9]===11-r}

/* ---------- اجزا ---------- */
const card=p=>`<div class="card"><a href="#/product/${p.id}" aria-label="${p.name}">${p.old?`<span class="tag">${num(Math.round((1-p.price/p.old)*100))}٪ تخفیف</span>`:''}${pic(p)}</a>
 <div class="info"><a href="#/product/${p.id}"><h3>${p.name}</h3></a><div class="meta">${p.unit} · ${p.brand}</div>
 <div class="price">${p.old?`<s>${T(p.old)}</s>`:''}${T(p.price)}</div>
 <button class="btn sm" data-add="${p.id}" ${stock(p.id)<1?'disabled':''}>${stock(p.id)<1?'ناموجود':'افزودن به سبد'}</button>
 <button class="lnk" data-qv="${p.id}">نمای سریع</button></div></div>`;
function layout(){
  $('#warn').textContent=WARN;
  $('#lg').innerHTML=`${MARK(40)}<span><b>${SITE.name}</b><small>فروشگاه دخانیات و لوازم</small></span>`;
  $('#cn').innerHTML=`<a href="#/shop" data-cn="-1">همه</a>`+CATS.map((c,i)=>`<a href="#/shop?cat=${i}" data-cn="${i}">${c}</a>`).join('');
  const I={h:'<path d="M4 11l8-7 8 7v9H4z"/>',s:'<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',c:'<path d="M5 8h14l-1 12H6zM9 8a3 3 0 016 0"/>',o:'<path d="M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8"/>'};
  $('#tabs').innerHTML=`<a href="#/" data-t="">${SVGI(I.h)}خانه</a><a href="#/shop" data-t="shop">${SVGI(I.s)}فروشگاه</a><button data-cart><i>${SVGI(I.c)}<b class="bd">۰</b></i>سبد خرید</button><a href="#/orders" data-t="orders">${SVGI(I.o)}سفارش‌ها</a>`;
  $('#ft').innerHTML=`<div class="wrap"><div class="fg"><div><div style="display:flex;gap:10px;align-items:center">${MARK(36)}<h4 style="margin:0;font-size:1.7rem">${SITE.name}</h4></div><p style="margin-top:8px;max-width:340px">فروش دخانیات و لوازم جانبی فقط برای افراد بالای ۱۸ سال. ${WARN.split(' · ')[0]}</p></div>
  <div><h4>راهنما</h4><a href="#/page/rules">قوانین فروش دخانیات</a><a href="#/page/shipping">ارسال و هزینه‌ها</a><a href="#/page/returns">شرایط بازگشت</a><a href="#/page/faq">پرسش‌های متداول</a></div>
  <div><h4>ارتباط</h4><a href="#/page/about">دربارهٔ ما</a><a href="#/page/contact">تماس با ما</a><span>${SITE.phone}</span></div></div>
  <div class="cp">© ${SITE.name} — نسخهٔ آزمایشی: درگاه پرداخت و ارسال شبیه‌سازی شده‌اند. ${WARN}</div></div>`;
  commit();
}
function ageGate(){
  const g=$('#age');if(load('age18',false)){g.hidden=true;return}
  g.hidden=false;document.body.classList.add('lock');
  g.innerHTML=`<div class="in">${MARK(64)}<h1 id="agt">ورود فقط برای افراد بالای ۱۸ سال</h1><p>این فروشگاه دخانیات می‌فروشد. با ورود تأیید می‌کنید که حداقل ۱۸ سال سن دارید. ${WARN.split(' · ')[0]}</p>
  <button class="btn" data-age="1">بله، بالای ۱۸ سال هستم</button><button class="btn alt" data-age="0">خیر، خارج می‌شوم</button></div>`;
  g.querySelector('[data-age="1"]').focus();
}
/* ---------- سبد (کشو) ---------- */
function drawer(){
  const ids=Object.keys(cart),t=totals(),left=Math.max(0,FREE_SHIP-t.base);
  $('#dr').innerHTML=`<div class="dh"><h2>سبد خرید</h2><button class="x" data-close aria-label="بستن">✕</button></div>`+(ids.length?
  `<div class="db">${ids.map(id=>{const p=P(id);return `<div class="di">${pic(p,'ic')}<div><a href="#/product/${id}" data-close><b style="font-size:.88rem">${p.name}</b></a><div class="meta">${p.unit} · ${T(p.price)}</div>
   <div class="qty" style="margin-top:4px"><button data-dec="${id}" aria-label="کمتر">−</button><span>${num(cart[id])}</span><button data-inc="${id}" aria-label="بیشتر">+</button></div></div>
   <div style="text-align:left"><b class="price">${T(p.price*cart[id])}</b><br><button class="rm" data-del="${id}">حذف</button></div></div>`}).join('')}</div>
  <div class="df"><div class="meta">${left?`${T(left)} دیگر تا ارسال رایگان پست`:'ارسال پست برای سفارش شما رایگان است'}</div><div class="bar2"><i style="width:${Math.min(100,t.base/FREE_SHIP*100)}%"></i></div>
  <div class="sum"><div class="tot"><span>جمع کالاها</span><span>${T(t.sub)}</span></div></div>
  <a class="btn big" href="#/checkout" data-close style="margin-top:10px;display:block">ادامه و ثبت سفارش</a></div>`
  :`<div class="db empty"><p>سبد خرید شما خالی است.</p><br><a class="btn" href="#/shop" data-close>رفتن به فروشگاه</a></div>`);
}
function closeAll(){$('#dr').classList.remove('open');$('#dr').setAttribute('aria-hidden','true');$('#md').classList.remove('open');$('#md').setAttribute('aria-hidden','true');$('#ov').classList.remove('show');if(load('age18',false))document.body.classList.remove('lock')}
function openCart(){drawer();$('#dr').classList.add('open');$('#dr').setAttribute('aria-hidden','false');$('#ov').classList.add('show');document.body.classList.add('lock');const x=$('#dr .x');x&&x.focus()}
function quick(id){
  const p=P(id);if(!p)return;const s=stock(p.id);
  $('#md').innerHTML=`<div class="in">${pic(p)}<div><div class="meta">${p.unit} · ${p.brand}</div><h2 style="margin:4px 0">${p.name}</h2><p class="meta">${p.desc}</p>
  <div class="price" style="font-size:1.2rem;margin:8px 0">${p.old?`<s>${T(p.old)}</s>`:''}${T(p.price)}</div>
  <div style="display:flex;gap:8px"><button class="btn" style="flex:1" data-add="${p.id}" ${s<1?'disabled':''}>افزودن به سبد</button><a class="btn alt" href="#/product/${p.id}" data-close>جزئیات</a><button class="btn alt" data-close>بستن</button></div></div></div>`;
  $('#md').classList.add('open');$('#md').setAttribute('aria-hidden','false');$('#ov').classList.add('show');document.body.classList.add('lock');
}
/* ---------- صفحه‌ها ---------- */
function home(){
  const top=[...PRODUCTS].sort((a,b)=>b.reviews-a.reviews).slice(0,4),cnt=i=>PRODUCTS.filter(p=>p.cat===i).length;
  app.innerHTML=`<section class="hero"><div><h1>انتخاب‌های برگزیده برای اهل سلیقه</h1><p>سیگار، سیگار برگ، توتون و لوازم جانبی با ضمانت اصالت کالا. فروش فقط به افراد بالای ۱۸ سال.</p>
  <a class="btn" href="#/shop">مشاهدهٔ محصولات</a></div><div class="hm">${MARK(220)}</div></section>
  <div class="trust"><div><b>اصالت کالا</b>تأمین از مجاری مجاز</div><div><b>بسته‌بندی بدون برند</b>ارسال محتاطانه</div><div><b>تحویل با کارت ملی</b>فقط به خود شخص</div><div><b>پشتیبانی</b>${SITE.hours}</div></div>
  <h2>دسته‌بندی‌ها</h2><div class="tiles">${CATS.map((c,i)=>{const p=PRODUCTS.find(x=>x.cat===i);return `<a class="tile" href="#/shop?cat=${i}">${pic(p)}<span>${c}<small>${num(cnt(i))} محصول</small></span></a>`}).join('')}</div>
  <h2>پرفروش‌ها <a href="#/shop">همهٔ محصولات</a></h2><div class="grid">${top.map(card).join('')}</div>
  <h2>برندها</h2><div class="chips">${BRANDS.map(b=>`<a class="chip" href="#/shop?brand=${encodeURIComponent(b)}">${b}</a>`).join('')}</div>`;
}
function list(){
  const r=PRODUCTS.filter(p=>(F.cat<0||p.cat===F.cat)&&(!F.brand||p.brand===F.brand)&&(p.name+p.brand).includes(F.q.trim())&&(!F.max||p.price<=F.max));
  const s={pop:(a,b)=>b.reviews-a.reviews,rate:(a,b)=>b.rating-a.rating,lo:(a,b)=>a.price-b.price,hi:(a,b)=>b.price-a.price};r.sort(s[F.sort]||s.pop);
  $('#cnt').textContent=num(r.length)+' کالا';
  $('#list').innerHTML=r.length?r.map(card).join(''):'<div class="empty" style="grid-column:1/-1">محصولی پیدا نشد. فیلترها را تغییر دهید.</div>';
  document.querySelectorAll('[data-cat]').forEach(b=>b.classList.toggle('on',+b.dataset.cat===F.cat));
  document.querySelectorAll('[data-brand]').forEach(b=>b.classList.toggle('on',b.dataset.brand===F.brand));
}
function shop(qs){
  const u=new URLSearchParams(qs);F.cat=u.has('cat')?+u.get('cat'):-1;F.brand=u.get('brand')||'';F.q=u.get('q')||'';
  app.innerHTML=`<h2>فروشگاه <span class="meta" id="cnt"></span></h2><div class="shopl"><aside class="side"><h4>دسته‌بندی</h4><div class="chips"><button class="chip" data-cat="-1">همه</button>${CATS.map((c,i)=>`<button class="chip" data-cat="${i}">${c}</button>`).join('')}</div>
  <h4>برند</h4><div class="chips"><button class="chip" data-brand="">همه برندها</button>${BRANDS.map(b=>`<button class="chip" data-brand="${b}">${b}</button>`).join('')}</div></aside>
  <section><div class="tools"><select id="sort" aria-label="مرتب‌سازی"><option value="pop">پربازدیدترین</option><option value="rate">بیشترین امتیاز</option><option value="lo">ارزان‌ترین</option><option value="hi">گران‌ترین</option></select>
  <select id="max" aria-label="سقف قیمت"><option value="0">همهٔ قیمت‌ها</option><option value="100000">تا ۱۰۰ هزار تومان</option><option value="300000">تا ۳۰۰ هزار تومان</option><option value="600000">تا ۶۰۰ هزار تومان</option></select></div><div class="grid" id="list"></div></section></div>`;
  $('#sort').value=F.sort;$('#max').value=F.max;list();
}
function product(id){
  const p=P(id);if(!p)return notfound();const s=stock(p.id),rel=PRODUCTS.filter(x=>x.cat===p.cat&&x.id!==p.id).slice(0,4);
  app.innerHTML=`<div class="crumb"><a href="#/">خانه</a> › <a href="#/shop?cat=${p.cat}">${CATS[p.cat]}</a> › ${p.name}</div>
  <div class="detail">${pic(p)}<div><div class="meta">${p.unit} · برند ${p.brand}</div><h1>${p.name}</h1><div class="meta">امتیاز ${num(p.rating)} · ${num(p.reviews)} نظر</div>
  <p style="margin:10px 0;color:#CFC5B5">${p.desc}</p><div class="price" style="font-size:1.5rem">${p.old?`<s>${T(p.old)}</s>`:''}${T(p.price)}</div>
  <p class="${s<10?'':'ok'} meta" style="margin:6px 0">${s<1?'ناموجود':s<10?`فقط ${num(s)} عدد باقی مانده`:'موجود در انبار'}</p>
  <div class="notice">${WARN}. تحویل کالا فقط با نشان‌دادن کارت ملی و به شخص بالای ۱۸ سال انجام می‌شود.</div>
  <ul class="perks"><li>${eta('post')}</li><li>حداکثر ${num(MAXQ)} عدد از هر کالا در هر سفارش</li><li>ارسال رایگان پست بالای ${T(FREE_SHIP)}</li></ul></div></div>
  <div class="buy"><div class="qty"><button data-d="-1" aria-label="کمتر">−</button><span id="n" data-v="1">۱</span><button data-d="1" aria-label="بیشتر">+</button></div>
  <button class="btn" data-addn="${p.id}" ${s<1?'disabled':''}>افزودن به سبد</button></div>
  ${rel.length?`<h2>محصولات مشابه</h2><div class="grid">${rel.map(card).join('')}</div>`:''}<div style="height:70px"></div>`;
}
const steps=n=>`<div class="steps"><span class="on">۱. سبد</span><span class="${n>=2?'on':''}">۲. ارسال و پرداخت</span><span class="${n>=3?'on':''}">۳. تأیید</span></div>`;
function sumHTML(){
  const t=totals(shipSel);
  return Object.keys(cart).map(id=>`<div><span>${P(id).name} × ${num(cart[id])}</span><span>${T(P(id).price*cart[id])}</span></div>`).join('')+
  `${t.disc?`<div class="ok"><span>تخفیف</span><span>−${T(t.disc)}</span></div>`:''}<div><span>${SHIPS[shipSel].name}</span><span>${t.ship?T(t.ship):'رایگان'}</span></div><div class="tot"><span>مبلغ قابل پرداخت</span><span>${T(t.total)}</span></div>`;
}
function shipOpts(prov){
  if(shipSel==='courier'&&prov!=='تهران')shipSel='post';
  return Object.entries(SHIPS).map(([k,s])=>{const off=s.only&&prov!==s.only,t=totals(k);
   return `<label class="opt ${off?'dis':''}"><input type="radio" name="ship" value="${k}" ${shipSel===k?'checked':''} ${off?'disabled':''}><span>${s.name}<small>${off?'فقط برای استان '+s.only:s.note+' · '+eta(k)}</small></span><b>${t.ship?T(t.ship):'رایگان'}</b></label>`}).join('');
}
const fld=(n,label,inner)=>`<div data-f="${n}">${label?`<label>${label}</label>`:''}${inner}<div class="err"></div></div>`;
function checkout(){
  if(!Object.keys(cart).length){location.hash='#/shop';toast('سبد خرید خالی است');return}
  const u=load('user',{prov:'تهران'}),[ny]=jnow(),yrs=[];for(let y=ny-10;y>=ny-90;y--)yrs.push(y);
  app.innerHTML=`${steps(2)}<div class="lay"><form id="co" novalidate>
  <div class="box"><h2>تأیید هویت و سن</h2><p class="meta">طبق قانون، فروش دخانیات به افراد زیر ۱۸ سال ممنوع است. اطلاعات هویتی فقط برای تأیید سن استفاده و ذخیره نمی‌شود.</p>
  <div class="two">${fld('nid','کد ملی',`<input name="nid" dir="ltr" inputmode="numeric" maxlength="10" autocomplete="off">`)}
  ${fld('birth','تاریخ تولد (شمسی)',`<div class="three"><select name="by" aria-label="سال">${yrs.map(y=>`<option value="${y}">${fa(y)}</option>`).join('')}</select><select name="bm" aria-label="ماه">${MONTHS.map((m,i)=>`<option value="${i+1}">${m}</option>`).join('')}</select><select name="bd" aria-label="روز">${Array.from({length:31},(_,i)=>`<option value="${i+1}">${num(i+1)}</option>`).join('')}</select></div>`)}</div></div>
  <div class="box"><h2>اطلاعات گیرنده</h2><div class="two">
  ${fld('name','نام و نام خانوادگی',`<input name="name" autocomplete="name" value="${u.name||''}">`)}
  ${fld('phone','شمارهٔ موبایل',`<input name="phone" dir="ltr" inputmode="numeric" placeholder="09123456789" autocomplete="tel" value="${u.phone||''}">`)}
  ${fld('prov','استان',`<select name="prov">${PROV.map(x=>`<option ${x===u.prov?'selected':''}>${x}</option>`).join('')}</select>`)}
  ${fld('city','شهر',`<input name="city" autocomplete="address-level2" value="${u.city||''}">`)}
  ${fld('zip','کد پستی (۱۰ رقم)',`<input name="zip" dir="ltr" inputmode="numeric" maxlength="10" value="${u.zip||''}">`)}
  ${fld('unit','پلاک / واحد (اختیاری)',`<input name="unit" value="${u.unit||''}">`)}</div>
  ${fld('addr','نشانی کامل',`<textarea name="addr" rows="3" autocomplete="street-address">${u.addr||''}</textarea>`)}</div>
  <div class="box"><h2>روش ارسال</h2><div id="so">${shipOpts(u.prov)}</div></div>
  <div class="box"><h2>روش پرداخت</h2>
  <label class="opt"><input type="radio" name="pay" value="online" checked><span>پرداخت آنلاین (درگاه آزمایشی)<small>پرداخت با کارت بانکی</small></span></label>
  <label class="opt"><input type="radio" name="pay" value="cod"><span>پرداخت در محل<small>هنگام تحویل و نمایش کارت ملی</small></span></label></div>
  ${fld('terms','',`<label class="opt"><input type="checkbox" name="terms"><span>تأیید می‌کنم بالای ۱۸ سال هستم، اطلاعات واردشده درست است و کالا را شخصاً تحویل می‌گیرم.<small><a href="#/page/rules" style="text-decoration:underline">قوانین فروش دخانیات</a></small></span></label>`)}
  <button class="btn big">ثبت سفارش و ادامه</button></form>
  <div class="box sum" style="position:sticky;top:120px"><h2>خلاصهٔ سفارش</h2><div style="display:flex;gap:8px;margin-bottom:8px"><input id="cp" placeholder="کد تخفیف" dir="ltr" value="${coupon||''}"><button class="btn sm" id="applycp" type="button">اعمال</button></div><div class="err" id="cperr">${coupon&&COUPONS[coupon]?`<span class="ok">${COUPONS[coupon][0]} اعمال شد</span>`:''}</div><div id="sm">${sumHTML()}</div></div></div>`;
}
function validate(d){
  const e={};d.nid=en(d.nid||'').trim();d.phone=en(d.phone||'').trim();d.zip=en(d.zip||'').trim();
  if(!nid(d.nid))e.nid='کد ملی معتبر نیست';
  const by=+d.by,bm=+d.bm,bd=+d.bd;
  if(!by||!bm||!bd||bd>(bm<=6?31:bm<=11?30:29))e.birth='تاریخ تولد معتبر نیست';
  else if(!adult(by,bm,bd))e.birth='فروش به افراد زیر ۱۸ سال ممنوع است';
  if((d.name||'').trim().split(/\s+/).length<2||(d.name||'').trim().length<5)e.name='نام و نام خانوادگی را کامل بنویسید';
  if(!/^09\d{9}$/.test(d.phone))e.phone='شماره باید مثل 09123456789 باشد';
  if(!d.prov)e.prov='استان را انتخاب کنید';
  if((d.city||'').trim().length<2)e.city='شهر را وارد کنید';
  if(!/^\d{10}$/.test(d.zip))e.zip='کد پستی باید ۱۰ رقم باشد';
  if((d.addr||'').trim().length<10)e.addr='نشانی را کامل‌تر بنویسید';
  if(!d.terms)e.terms='برای ادامه باید موارد بالا را تأیید کنید';
  if(SHIPS[d.ship]&&SHIPS[d.ship].only&&d.prov!==SHIPS[d.ship].only)e.ship='این روش ارسال برای استان شما فعال نیست';
  return e;
}
function createOrder(d){
  const t=totals(d.ship),code='KH-'+Math.random().toString(36).slice(2,8).toUpperCase();
  const o={code,date:Date.now(),items:Object.entries(cart).map(([id,q])=>({id:+id,q})),t,pay:d.pay,ship:d.ship,state:d.pay==='cod'?'cod':'pending',addr:`${d.prov}، ${d.city}، ${d.addr}${d.unit?'، '+d.unit:''}`,name:d.name,phone:d.phone};
  orders.unshift(o);save('orders',orders);return o;
}
function place(form){
  const d=Object.fromEntries(new FormData(form)),e=validate(d);
  form.querySelectorAll('[data-f]').forEach(x=>{x.querySelector('.err').textContent=e[x.dataset.f]||''});
  const keys=Object.keys(e);
  if(keys.length){const f=form.querySelector(`[data-f="${keys[0]}"]`);if(f){const i=f.querySelector('input,select,textarea');i&&i.focus()}toast(e.ship||'لطفاً خطاهای فرم را اصلاح کنید');return}
  const lack=Object.keys(cart).find(id=>cart[id]>stock(id));if(lack){toast(`موجودی «${P(lack).name}» کافی نیست`);return}
  shipSel=d.ship;save('ship',d.ship);save('user',{name:d.name,phone:d.phone,prov:d.prov,city:d.city,zip:d.zip,unit:d.unit,addr:d.addr});
  const o=createOrder(d);d.pay==='cod'?finish(o):location.hash='#/pay/'+o.code;
}
function finish(o){
  o.items.forEach(i=>{stockMap[i.id]=stock(i.id)-i.q});save('stock',stockMap);
  cart={};coupon=null;save('coupon',null);commit();save('orders',orders);location.hash='#/success/'+o.code;
}
function gateway(code){
  const o=orders.find(x=>x.code===code);if(!o||o.state==='paid'||o.state==='cod')return notfound();
  let left=600;
  app.innerHTML=`<div class="gw"><div class="hd"><span>درگاه پرداخت آزمایشی</span><span id="tm" dir="ltr">۱۰:۰۰</span></div>
  <div class="test">حالت تست: هیچ پولی برداشت نمی‌شود. اطلاعات کارت نمونه است.</div>
  <form class="bd2" id="gwf" novalidate><div class="amt"><span>پذیرنده: ${SITE.name}</span><b>${T(o.t.total)}</b></div>
  ${fld('card','شمارهٔ کارت',`<input name="card" class="ltr" inputmode="numeric" maxlength="19" value="6037 9911 1111 1111">`)}
  <div class="two">${fld('cvv','CVV2',`<input name="cvv" class="ltr" inputmode="numeric" maxlength="4" value="123">`)}${fld('exp','تاریخ انقضا',`<input name="exp" class="ltr" placeholder="MM/YY" maxlength="5" value="12/30">`)}</div>
  ${fld('pin','رمز دوم (آزمایشی: ۱۲۳۴۵۶)',`<input name="pin" class="ltr" type="password" inputmode="numeric" maxlength="8" value="123456">`)}
  <div class="acts"><button class="btn" data-code="${code}">پرداخت</button><button type="button" class="btn alt" data-cancelpay="${code}">انصراف</button></div>
  <p class="meta" style="margin-top:12px">برای تست پرداخت ناموفق، شمارهٔ کارت را به 0000 ختم کنید یا «انصراف» را بزنید.</p></form></div>`;
  timer=setInterval(()=>{left--;const el=$('#tm');if(el)el.textContent=fa(String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0'));if(left<=0)payResult(code,false,'زمان پرداخت به پایان رسید.')},1000);
}
function payResult(code,ok,msg){
  clearInterval(timer);const o=orders.find(x=>x.code===code);if(!o)return;
  if(ok){o.state='paid';o.ref=String(Math.floor(1e11+Math.random()*9e11));finish(o)}
  else{o.state='failed';save('orders',orders);try{sessionStorage.setItem('kb_fail',msg||'پرداخت انجام نشد.')}catch{}location.hash='#/failed/'+code}
}
function payForm(f){
  const d=Object.fromEntries(new FormData(f)),c=en(d.card).replace(/\s/g,''),e={};
  if(!/^\d{16}$/.test(c))e.card='شمارهٔ کارت باید ۱۶ رقم باشد';
  if(!/^\d{3,4}$/.test(en(d.cvv)))e.cvv='CVV2 نامعتبر است';
  if(!/^(0[1-9]|1[0-2])\/\d{2}$/.test(en(d.exp)))e.exp='تاریخ را مثل 12/30 بنویسید';
  if(en(d.pin).length<5)e.pin='رمز دوم نامعتبر است';
  f.querySelectorAll('[data-f]').forEach(x=>{x.querySelector('.err').textContent=e[x.dataset.f]||''});
  if(Object.keys(e).length)return;
  const code=f.querySelector('[data-code]').dataset.code;
  c.endsWith('0000')?payResult(code,false,'تراکنش توسط بانک رد شد (کارت تست ناموفق).'):payResult(code,true);
}
function success(code){
  const o=orders.find(x=>x.code===code);if(!o)return notfound();
  app.innerHTML=`${steps(3)}<div class="box empty"><div class="seal">✓</div><h2 style="justify-content:center;color:var(--tx)">سفارش شما ثبت شد</h2>
  <p>کد پیگیری: <b dir="ltr">${o.code}</b></p>${o.ref?`<p>شمارهٔ مرجع تراکنش (آزمایشی): <b dir="ltr">${o.ref}</b></p>`:'<p>پرداخت هنگام تحویل انجام می‌شود.</p>'}
  <p>${SHIPS[o.ship].name} · ${eta(o.ship)}</p><p class="meta">تحویل فقط با نمایش کارت ملی توسط خریدار</p><br><a class="btn" href="#/orders">پیگیری سفارش</a> <a class="btn alt" href="#/shop">ادامه خرید</a></div>`;
}
function failed(code){
  let m='';try{m=sessionStorage.getItem('kb_fail')||''}catch{}
  app.innerHTML=`<div class="box empty"><div class="seal x">✕</div><h2 style="justify-content:center;color:var(--tx)">پرداخت ناموفق بود</h2><p>${m}</p>
  <p class="meta">سفارش حفظ شده و سبد خرید پاک نشده است. می‌توانید دوباره پرداخت کنید.</p><br><a class="btn" href="#/pay/${code}">تلاش مجدد پرداخت</a> <a class="btn alt" href="#/shop">بازگشت به فروشگاه</a></div>`;
}
function ordersView(){
  const S={pending:['در انتظار پرداخت','r'],failed:['پرداخت ناموفق','r']};
  app.innerHTML=`<h2>پیگیری سفارش</h2>`+(orders.length?orders.map(o=>{
    const age=(Date.now()-o.date)/6e4,ok=o.state==='paid'||o.state==='cod',st=S[o.state]||[['در حال پردازش','ارسال شد','تحویل شد'][age>30?2:age>5?1:0],'g'];
    return `<div class="box"><div style="display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap"><b dir="ltr">${o.code}</b><span class="status ${st[1]}">${st[0]}</span></div>
    <div class="meta">${new Date(o.date).toLocaleDateString('fa-IR')} · ${SHIPS[o.ship].name} · ${o.pay==='cod'?'پرداخت در محل':'پرداخت آنلاین'}</div><div class="meta">${o.addr}</div>
    <div style="margin:8px 0;font-size:.88rem">${o.items.map(i=>`${P(i.id).name} × ${num(i.q)}`).join('<br>')}</div><b class="price">${T(o.t.total)}</b>
    ${ok?'':`<div style="margin-top:8px"><a class="btn sm" href="#/pay/${o.code}">پرداخت</a></div>`}</div>`}).join('')
  :`<div class="empty">هنوز سفارشی ثبت نکرده‌اید.<br><br><a class="btn" href="#/shop">شروع خرید</a></div>`);
}
const PAGES={
 rules:['قوانین فروش دخانیات',`<ul><li>فروش و تحویل دخانیات به افراد زیر ۱۸ سال ممنوع است.</li><li>سن خریدار هنگام ثبت سفارش و هنگام تحویل با کارت ملی بررسی می‌شود.</li><li>حداکثر ${num(MAXQ)} عدد از هر کالا در هر سفارش قابل خرید است.</li><li>تبلیغ، اهدا و فروش به افراد ناشناس یا نمایندگان افراد زیر سن قانونی ممنوع است.</li><li>${WARN.split(' · ')[0]}.</li></ul>`],
 about:['دربارهٔ کهربا',`<p>کهربا یک فروشگاه آنلاین دخانیات و لوازم جانبی است که فقط به افراد بالای ۱۸ سال خدمات می‌دهد. ما کالا را از مجاری مجاز تأمین می‌کنیم و ارسال را محتاطانه و بدون نشان برند انجام می‌دهیم.</p>`],
 shipping:['ارسال و هزینه‌ها',`<ul><li><b>پست پیشتاز:</b> ${T(SHIPS.post.fee)}، ۳ تا ۵ روز کاری، رایگان بالای ${T(FREE_SHIP)}.</li><li><b>پیک موتوری:</b> فقط تهران، ${T(SHIPS.courier.fee)}.</li><li><b>تحویل حضوری:</b> رایگان با هماهنگی.</li></ul><p>در همهٔ روش‌ها، تحویل فقط با کارت ملی خریدار انجام می‌شود.</p>`],
 returns:['شرایط بازگشت',`<ul><li>به‌دلایل بهداشتی، فقط کالای باز نشده و دارای مهر و موم تا ۷ روز قابل بازگشت است.</li><li>کالای معیوب یا مغایر با سفارش با هزینهٔ فروشگاه جایگزین می‌شود.</li></ul>`],
 faq:['پرسش‌های متداول',`<p><b>چرا کد ملی می‌خواهید؟</b><br>برای احراز سن بالای ۱۸ سال؛ این اطلاعات ذخیره نمی‌شود.</p><p><b>سفارشم را چطور پیگیری کنم؟</b><br>از منوی «سفارش‌ها» با کد پیگیری.</p><p><b>پرداخت واقعی است؟</b><br>خیر، درگاه فعلی آزمایشی است.</p>`],
 contact:['تماس با ما',`<p>تلفن: <b>${SITE.phone}</b><br>ایمیل: <b dir="ltr">${SITE.email}</b><br>نشانی: ${SITE.addr}<br>ساعت پاسخ‌گویی: ${SITE.hours}</p><form id="ct" novalidate><label for="c1">نام</label><input id="c1" name="n"><label for="c2">پیام شما</label><textarea id="c2" name="m" rows="4"></textarea><div class="err" id="cte"></div><button class="btn" style="margin-top:8px">ارسال پیام</button></form>`]
};
function page(k){const p=PAGES[k];if(!p)return notfound();app.innerHTML=`<div class="crumb"><a href="#/">خانه</a> › ${p[0]}</div><div class="pg"><h1>${p[0]}</h1>${p[1]}</div>`}
function notfound(){app.innerHTML=`<div class="empty"><h2 style="justify-content:center">صفحه پیدا نشد</h2><a class="btn" href="#/">بازگشت به خانه</a></div>`}

/* ---------- مسیریابی و رویدادها ---------- */
function route(){
  clearInterval(timer);closeAll();
  const[path,qs]=(location.hash.slice(1)||'/').split('?'),[,pg,arg]=path.split('/');
  const m={'':home,shop:()=>shop(qs),product:()=>product(arg),checkout,success:()=>success(arg),orders:ordersView,pay:()=>gateway(arg),failed:()=>failed(arg),page:()=>page(arg)};
  (m[pg||'']||notfound)();window.scrollTo(0,0);
  document.querySelectorAll('[data-t]').forEach(a=>a.classList.toggle('on',a.dataset.t===(pg||'')||(pg==='product'&&a.dataset.t==='shop')));
  const c=pg==='shop'?(new URLSearchParams(qs).has('cat')?new URLSearchParams(qs).get('cat'):'-1'):null;
  document.querySelectorAll('[data-cn]').forEach(a=>a.classList.toggle('on',a.dataset.cn===c));
}
document.addEventListener('click',e=>{
  const g=a=>e.target.closest(a);let b;const qn=()=>+$('#n').dataset.v||1;
  if(b=g('[data-age]')){if(b.dataset.age==='1'){save('age18',true);$('#age').hidden=true;document.body.classList.remove('lock')}else{$('#age').innerHTML='<div class="in"><h1>ورود مجاز نیست</h1><p>این فروشگاه فقط برای افراد بالای ۱۸ سال است.</p></div>'}}
  else if(g('#ov')||g('[data-close]'))closeAll();
  else if(g('[data-cart]'))openCart();
  else if(b=g('[data-add]')){e.preventDefault();add(b.dataset.add);if($('#dr').classList.contains('open'))drawer()}
  else if(b=g('[data-qv]'))quick(b.dataset.qv);
  else if(b=g('[data-addn]'))add(b.dataset.addn,qn());
  else if(b=g('[data-d]')){const n=$('#n'),mx=Math.max(1,lim(+$('[data-addn]').dataset.addn)),v=Math.min(mx,Math.max(1,(+n.dataset.v||1)+ +b.dataset.d));n.dataset.v=v;n.textContent=num(v)}
  else if(b=g('[data-inc]')){add(b.dataset.inc);drawer()}
  else if(b=g('[data-dec]')){const i=b.dataset.dec;if(--cart[i]<=0)delete cart[i];commit();drawer()}
  else if(b=g('[data-del]')){delete cart[b.dataset.del];commit();drawer()}
  else if(b=g('[data-cat]')){F.cat=+b.dataset.cat;list()}
  else if(b=g('[data-brand]')){F.brand=b.dataset.brand;list()}
  else if(b=g('[data-cancelpay]'))payResult(b.dataset.cancelpay,false,'پرداخت توسط شما لغو شد.');
  else if(g('#applycp')){const c=$('#cp').value.trim().toUpperCase();
    if(COUPONS[c]){coupon=c;save('coupon',c);$('#cperr').innerHTML=`<span class="ok">${COUPONS[c][0]} اعمال شد</span>`;refreshCheckout()}else{if(coupon){coupon=null;save('coupon',null);refreshCheckout()}$('#cperr').textContent='این کد تخفیف معتبر نیست'}}
});
function curProv(){const s=document.querySelector('[name=prov]');return s?s.value:'تهران'}
function refreshCheckout(){$('#so').innerHTML=shipOpts(curProv());$('#sm').innerHTML=sumHTML()}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='sort'){F.sort=t.value;list()}else if(t.id==='max'){F.max=+t.value;list()}
  else if(t.name==='ship'){shipSel=t.value;$('#sm').innerHTML=sumHTML()}
  else if(t.name==='prov')refreshCheckout();
});
document.addEventListener('submit',e=>{
  const f=e.target;
  if(f.id==='co'){e.preventDefault();place(f)}
  else if(f.id==='gwf'){e.preventDefault();payForm(f)}
  else if(f.id==='ct'){e.preventDefault();if(f.m.value.trim().length<5){$('#cte').textContent='پیام را کامل‌تر بنویسید';return}const m=load('msgs',[]);m.push({n:f.n.value,m:f.m.value,d:Date.now()});save('msgs',m);f.reset();$('#cte').textContent='';toast('پیام شما ثبت شد')}
  else if(f.id==='hs'){e.preventDefault();const i=f.querySelector('input'),h='#/shop?q='+encodeURIComponent(i.value);if(location.hash===h)route();else location.hash=h;i.blur()}
});
window.addEventListener('hashchange',route);layout();ageGate();route();

// نام برندها و محصولات نمونه و خیالی هستند؛ قبل از انتشار با اطلاعات واقعی و مجاز جایگزین کنید. قیمت‌ها به تومان.
const CATS = ["سیگار", "سیگار برگ", "توتون و پیپ", "فندک و لوازم"];
const PRODUCTS = [
 {id:1, name:"برگ طلا کلاسیک", unit:"پاکت ۲۰ نخی", brand:"برگ طلا", cat:0, price:82000, art:"pack", c:"#B8862F", rating:4.5, reviews:210, stock:120, desc:"سیگار فیلتردار با طعم کلاسیک و بستهٔ دوباره‌بسته‌شونده."},
 {id:2, name:"برگ طلا نقره‌ای", unit:"پاکت ۲۰ نخی", brand:"برگ طلا", cat:0, price:88000, art:"pack", c:"#9AA3AE", rating:4.4, reviews:143, stock:90, desc:"طعم ملایم‌تر با فیلتر دوغشاء."},
 {id:3, name:"سدر قرمز", unit:"پاکت ۲۰ نخی", brand:"سدر", cat:0, price:95000, art:"pack", c:"#B3382C", rating:4.6, reviews:188, stock:100, desc:"ترکیب توتون سنتی با طعم پررنگ."},
 {id:4, name:"سدر منتول", unit:"پاکت ۲۰ نخی", brand:"سدر", cat:0, price:98000, old:104000, art:"pack", c:"#2E8B7A", rating:4.3, reviews:96, stock:70, desc:"طعم خنک منتول، بستهٔ دوباره‌بسته‌شونده."},
 {id:5, name:"آتیه اسلیم", unit:"پاکت ۲۰ نخی", brand:"آتیه", cat:0, price:105000, art:"pack", c:"#6C5CA8", rating:4.2, reviews:61, stock:55, desc:"سیگار باریک با فیلتر بلند."},
 {id:6, name:"سیگار برگ کهربا رویال", unit:"جعبه ۵ عددی", brand:"کهربا", cat:1, price:650000, art:"cigar", c:"#C8963E", rating:4.8, reviews:44, stock:20, desc:"برگ‌پیچ دست‌ساز با رایحهٔ چوب و کاکائو."},
 {id:7, name:"سیگار برگ مینی", unit:"جعبه ۱۰ عددی", brand:"کهربا", cat:1, price:380000, art:"cigar", c:"#7A4A22", rating:4.5, reviews:58, stock:30, desc:"اندازهٔ کوچک برای یک استراحت کوتاه."},
 {id:8, name:"توتون پیپ بلند", unit:"قوطی ۵۰ گرمی", brand:"آتیه", cat:2, price:210000, art:"pouch", c:"#7A4A22", rating:4.4, reviews:37, stock:25, desc:"توتون پیپ با برش بلند و رطوبت متعادل."},
 {id:9, name:"توتون سیگارپیچ", unit:"بستهٔ ۳۰ گرمی + کاغذ", brand:"برگ طلا", cat:2, price:160000, art:"pouch", c:"#5E7A3A", rating:4.1, reviews:29, stock:40, desc:"همراه با کاغذ پیچ و فیلتر."},
 {id:10, name:"فندک ضدباد فلزی", unit:"۱ عدد", brand:"کهربا", cat:3, price:340000, art:"lighter", c:"#3B3F47", rating:4.7, reviews:120, stock:35, desc:"شعلهٔ ضدباد، بدنهٔ فلزی و قابل شارژ مجدد گاز."},
 {id:11, name:"زیرسیگاری سرامیکی", unit:"۱ عدد", brand:"کهربا", cat:3, price:180000, art:"tray", c:"#8C5A3C", rating:4.3, reviews:33, stock:28, desc:"سرامیک لعابی با شیار نگهدارنده."},
 {id:12, name:"جاسیگاری چرمی", unit:"۱ عدد", brand:"کهربا", cat:3, price:420000, art:"case", c:"#5A3A22", rating:4.6, reviews:22, stock:14, desc:"چرم طبیعی با ظرفیت ۲۰ نخ و آستر نرم."}
];
const ART = {
 pack:c=>`<rect x="30" y="12" width="40" height="76" rx="3" fill="#EFE8DC"/><rect x="30" y="12" width="40" height="24" rx="3" fill="${c}"/><rect x="30" y="54" width="40" height="8" fill="${c}"/><circle cx="50" cy="45" r="5" fill="${c}"/><path d="M34 74h32" stroke="#0003" stroke-width="2"/>`,
 cigar:c=>`<g transform="rotate(-25 50 50)"><rect x="10" y="42" width="80" height="16" rx="8" fill="#8A5A2B"/><rect x="56" y="42" width="16" height="16" fill="${c}"/><rect x="61" y="42" width="3" height="16" fill="#F1D58B"/><rect x="10" y="42" width="10" height="16" rx="6" fill="#0003"/></g>`,
 pouch:c=>`<path d="M30 18h40l6 68H24z" fill="${c}"/><rect x="30" y="18" width="40" height="10" fill="#0004"/><rect x="38" y="46" width="24" height="22" rx="3" fill="#EFE8DC" opacity=".85"/>`,
 lighter:c=>`<rect x="34" y="36" width="32" height="52" rx="5" fill="${c}"/><rect x="34" y="36" width="32" height="12" fill="#0004"/><rect x="42" y="20" width="16" height="16" rx="2" fill="#C9CCD3"/><path d="M50 4c7 6 7 11 0 15-7-4-7-9 0-15z" fill="#F59E0B"/>`,
 tray:c=>`<ellipse cx="50" cy="64" rx="38" ry="16" fill="${c}"/><ellipse cx="50" cy="60" rx="28" ry="10" fill="#0005"/><rect x="38" y="48" width="30" height="5" rx="2.5" fill="#EFE8DC" transform="rotate(-14 50 50)"/>`,
 case:c=>`<rect x="22" y="22" width="56" height="62" rx="8" fill="${c}"/><path d="M22 42h56" stroke="#0005" stroke-width="3"/><rect x="43" y="37" width="14" height="9" rx="2" fill="#D9B25F"/>`
};

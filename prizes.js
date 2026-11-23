/* ══ פרסי גלגל המזל + קופונים ══
   משותף ל-games.html (הגלגל) ול-black-november.html (פענוח הקופון בטופס ההזמנה).

   איך מחליפים פרסים:
   - משנים name / short / emoji / color / weight.
   - weight = סיכוי יחסי (פרס עם 20 יוצא פי 2 יותר מפרס עם 10).
   - type:'again' = "סיבוב נוסף" במקום פרס.
   - לא לשנות id של פרס קיים: קופונים שכבר נשלחו ללקוחות מפוענחים לפי ה-id.
     פרס חדש מקבל id חדש (1 עד 30).
*/
const BN_PRIZES = [
  {id:1, name:'חבילת כפפות ניטריל כחול', short:'ניטריל כחול', emoji:'🧤', color:'#2563EB', weight:14},
  {id:2, name:'חבילת מסכות 3 שכבות',     short:'מסכות',       emoji:'😷', color:'#475569', weight:16},
  {id:3, name:'גליל מיטה',               short:'גליל מיטה',    emoji:'🧻', color:'#DB2777', weight:12},
  {id:4, name:'חבילת כפפות ויניל',       short:'ויניל',        emoji:'🧤', color:'#0891B2', weight:14},
  {id:5, name:'סיבוב נוסף',              short:'סיבוב נוסף',   emoji:'🔁', color:'#D97706', weight:12, type:'again'},
  {id:6, name:'חבילת כפפות ניטריל שחור', short:'ניטריל שחור',  emoji:'🖤', color:'#1F2937', weight:10},
  {id:7, name:'חבילת כפפות לטקס',        short:'לטקס',         emoji:'🧤', color:'#B45309', weight:12},
  {id:8, name:'חבילת מסכות צבעוניות',     short:'מסכות צבע',    emoji:'🎨', color:'#7C3AED', weight:10}
];

function bnPrizeById(id) { return BN_PRIZES.find(p => p.id === id) || null; }

/* קופון: AR-XXXXXXX (7 תווים). מקודדים בו עד 2 פרסים, הסוכן והמספר האקראי, ובסוף ספרת ביקורת.
   קוד שהוקלד באקראי כמעט אף פעם לא יעבור את הבדיקה. הסוכן עדיין מאשר כל קופון. */
const BN_CPN_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function bnCpnCheck(n) {
  let h = (n ^ 0x5A17C3) >>> 0;
  h = Math.imul(h, 2654435761) >>> 0; h ^= h >>> 15;
  h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13;
  return h & 2047;
}
function bnEncodeCoupon(prizeIds, agent) {
  const p1 = prizeIds[0] || 31, p2 = prizeIds[1] || 31;
  const r = Math.floor(Math.random() * 4096);
  const payload = (p1 << 19) | (p2 << 14) | ((Number(agent) & 3) << 12) | r;
  let v = payload * 2048 + bnCpnCheck(payload), s = '';
  for (let i = 0; i < 7; i++) { s = BN_CPN_ABC[v % 32] + s; v = Math.floor(v / 32); }
  return 'AR-' + s;
}
function bnDecodeCoupon(code) {
  let s = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (s.length === 9 && s.startsWith('AR')) s = s.slice(2);
  if (s.length !== 7) return null;
  let v = 0;
  for (const ch of s) { const i = BN_CPN_ABC.indexOf(ch); if (i < 0) return null; v = v * 32 + i; }
  const check = v % 2048, payload = Math.floor(v / 2048);
  if (bnCpnCheck(payload) !== check) return null;
  const ids = [(payload >> 19) & 31, (payload >> 14) & 31].filter(id => id !== 31);
  const prizes = ids.map(bnPrizeById);
  if (!prizes.length || prizes.some(p => !p || p.type === 'again')) return null;
  return {code: 'AR-' + s, prizes, agent: (payload >> 12) & 3};
}

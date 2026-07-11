// ── Feed ทัวร์แบบย่อ สำหรับ LINE Flex (id, name, image, price, country) ──
// GET /api/tour-feed        → ทั้งหมด
// GET /api/tour-feed?c=JP   → เฉพาะประเทศ
// ดึงผ่าน proxy /api/suppliers (พิสูจน์แล้วเวิร์ค + cache) กัน auth เพี้ยน
const SITE = 'https://wecraft-travel.com';

const SUP = { probooking: 'pb', wondergroup: 'pb', gs25tour: 'pb', zego: 'zego', ttn: 'ttn' };

// Thai country name → ISO2 (สำหรับ TTN ที่ระบุประเทศใน P_TAG)
const TH_ISO = { 'ญี่ปุ่น':'JP','เกาหลี':'KR','จีน':'CN','ฮ่องกง':'HK','มาเก๊า':'MO','ไต้หวัน':'TW',
  'เวียดนาม':'VN','สิงคโปร์':'SG','มาเลเซีย':'MY','พม่า':'MM','กัมพูชา':'KH','ลาว':'LA','อินโดนีเซีย':'ID',
  'อินเดีย':'IN','ดูไบ':'AE','ตุรกี':'TR','จอร์เจีย':'GE','อียิปต์':'EG','ยุโรป':'EU' };
function isoFromThai(text) { for (const [th, iso] of Object.entries(TH_ISO)) if ((text||'').includes(th)) return iso; return ''; }

function normalize(id, fmt, data) {
  const out = [];
  if (fmt === 'pb' && Array.isArray(data)) {
    for (const t of data) {
      const code = (t.countries || [])[0]?.code || '';
      const open = (t.periods || []).filter(p => p.status === 'Open');
      const price = open.length ? Math.min(...open.map(p => p.price)) : (t.price || 0);
      if (t.banner) out.push({ id: `sup_${id}_${t.id}`, name: t.name, image: t.banner, price, country: code });
    }
  } else if (fmt === 'zego' && Array.isArray(data)) {
    for (const t of data) {
      const book = (t.Periods || []).filter(p => p.PeriodStatus === 'Book');
      const prices = book.map(p => p.Price).filter(n => n > 0);
      const price = prices.length ? Math.min(...prices) : (t.Periods?.[0]?.Price || 0);
      if (t.URLImage) out.push({ id: `sup_zego_${t.ProductCode}`, name: t.ProductName, image: t.URLImage, price, country: t.CountryCodeISO2 || '' });
    }
  } else if (fmt === 'ttn' && Array.isArray(data)) {
    const progs = data.flatMap(x => x.program || []);
    for (const p of progs) {
      const iso = isoFromThai(p.P_TAG) || isoFromThai(p.P_NAME);
      const prices = (p.Period || []).flatMap(per => (per.Price || []).map(pr => parseFloat(pr.P_ADULT_PRICE))).filter(n => n > 0);
      const price = prices.length ? Math.min(...prices) : (parseFloat(p.P_PRICE) || 0);
      if (p.BANNER) out.push({ id: `sup_ttn_${p.P_ID}`, name: p.P_NAME, image: p.BANNER, price, country: iso });
    }
  }
  return out;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const wanted = (req.query?.c || '').toUpperCase();
  try {
    const results = await Promise.all(Object.entries(SUP).map(async ([id, fmt]) => {
      const data = await fetch(`${SITE}/api/suppliers?supplier=${id}`).then(r => r.ok ? r.json() : null).catch(() => null);
      return normalize(id, fmt, data);
    }));
    let all = results.flat().filter(t => t.name && t.price > 0);
    if (wanted) all = all.filter(t => t.country === wanted);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=1800');
    return res.status(200).json(all);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
};

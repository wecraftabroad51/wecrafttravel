// รับไฟล์โปรแกรมทัวร์ (PDF / รูปภาพ / Word .docx / ข้อความ)
// แล้วใช้ Claude AI อ่านและดึงข้อมูลออกมาเป็น JSON
// ทำงาน 2 รอบ: รอบแรก = ข้อมูลทั่วไป + โปรแกรม, รอบสอง = รวม/ไม่รวม (โฟกัสเฉพาะ)

const mammoth = require('mammoth');

// ── Prompt รอบที่ 1: ข้อมูลทั่วไป ─────────────────────────────────────
const PROMPT_GENERAL = `คุณคือผู้ช่วยแอดมินบริษัททัวร์ไทย อ่านไฟล์โปรแกรมทัวร์ที่แนบมา แล้วดึงข้อมูลออกมาเป็น JSON เป๊ะๆ
ห้ามใส่ข้อความอื่นนอกจาก JSON เด็ดขาด (ห้ามมี \`\`\`json ครอบ ห้ามมีคำอธิบายใดๆ):

{
  "name": { "th": "ชื่อทัวร์ภาษาไทยเต็ม", "en": "Full English tour name (blank if not found)" },
  "destination": { "th": "ปลายทาง เช่น โตเกียว โอซาก้า เกียวโต", "en": "Tokyo, Osaka, Kyoto" },
  "description": { "th": "คำโปรยไฮไลท์ทัวร์แบบย่อหน้า ภาษาไทย", "en": "English highlights paragraph if available" },
  "duration": 7,
  "groupSize": 20,
  "itinerary": [
    { "title": "วันที่ 1: กรุงเทพฯ – โตเกียว", "description": "รายละเอียดกิจกรรม สถานที่ มื้ออาหาร ครบถ้วน", "hotel": "ชื่อโรงแรมที่พักคืนนั้น" }
  ],
  "departures": [
    { "date": "2026-07-08", "returnDate": "2026-07-25", "totalSeats": 20, "price": 35900, "childPrice": 0, "infantPrice": 0, "singleSupplement": 0 }
  ],
  "hotels": ["ชื่อโรงแรมทั้งหมดในโปรแกรม (ไม่ซ้ำ)"]
}

กฎ: วันที่ → YYYY-MM-DD (ค.ศ., พ.ศ.ลบ543) | ราคา → ตัวเลขล้วน | ไม่พบ → "" / [] / 0`;

// ── Prompt รอบที่ 2: โฟกัสเฉพาะ รวม/ไม่รวม ────────────────────────────
const PROMPT_INCLUDES = `คุณคือผู้ช่วยแอดมินบริษัททัวร์ไทย งานนี้มีขั้นตอนเดียวคือ:

อ่านไฟล์ทั้งหมดอย่างละเอียดทุกหน้า แล้วค้นหาส่วนที่แสดงรายการ "รวม" และ "ไม่รวม" ในทุกรูปแบบที่พบ

═══ วิธีการค้นหา ═══

ส่วน "INCLUDES" (รวมในราคาทัวร์) — มองหาหัวข้อที่มีคำเหล่านี้:
  อัตราค่าบริการนี้รวม | ราคาทัวร์รวม | รวมในราคา | ราคานี้รวม | Price Includes

ส่วน "EXCLUDES" (ไม่รวมในราคาทัวร์) — มองหาหัวข้อที่มีคำเหล่านี้:
  อัตราค่าบริการนี้ไม่รวม | ราคาทัวร์ไม่รวม | ไม่รวมในราคา | ราคานี้ไม่รวม | Price Excludes

═══ รูปแบบที่ต้องอ่าน ═══
  • กราฟิก/Infographic สีสวยงาม พร้อมไอคอนรูปภาพ
  • ตาราง 2 คอลัมน์ ซ้าย–ขวา (อ่านทั้งซ้ายและขวาให้ครบ!)
  • หัวข้อสีเขียว ✅ หรือสัญลักษณ์ ✓ = รวม
  • หัวข้อสีแดง ❌ หรือสัญลักษณ์ ✗ = ไม่รวม
  • รายการ bullet point หรือ numbered list

═══ กฎการดึงข้อมูล ═══
  1. ดึงทุกรายการจากทั้งคอลัมน์ซ้ายและคอลัมน์ขวา ห้ามข้ามแม้แต่รายการเดียว
  2. คงข้อความเต็มทุกตัวอักษร ห้ามตัดทอนหรือย่อ
  3. แต่ละรายการ = 1 string ใน array
  4. เรียงตามลำดับที่ปรากฏในเอกสาร (ซ้ายก่อน-ขวาทีหลัง สำหรับ 2 คอลัมน์)
  5. ถ้าไม่พบส่วนนี้เลย ให้ใส่ array ว่าง []

ตอบกลับเป็น valid JSON เพียวๆ เท่านั้น ห้ามมี \`\`\`json ครอบ ห้ามมีคำอธิบาย:
{ "includes": ["...รายการที่รวมครบทุกข้อ..."], "excludes": ["...รายการที่ไม่รวมครบทุกข้อ..."] }`;

// ── helper: สร้าง content blocks ────────────────────────────────────────
function buildContent(mimeType, base64, textContent, promptText) {
  if (textContent != null) {
    return [{ type: 'text', text: `เนื้อหาจากไฟล์โปรแกรมทัวร์:\n\n"""\n${textContent.slice(0, 60000)}\n"""\n\n${promptText}` }];
  }
  if (mimeType === 'application/pdf') {
    return [
      { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
      { type: 'text', text: promptText },
    ];
  }
  if (mimeType.startsWith('image/')) {
    return [
      { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
      { type: 'text', text: promptText },
    ];
  }
  return null;
}

// ── helper: เรียก Claude API ─────────────────────────────────────────────
async function callClaude(apiKey, content) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 16000,
      messages: [{ role: 'user', content }],
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Anthropic API ${resp.status}: ${errText.slice(0, 300)}`);
  }
  const data = await resp.json();
  const raw = (data.content || []).map(b => b.text || '').join('').trim();
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  if (data.stop_reason === 'max_tokens') {
    throw new Error('MAX_TOKENS');
  }
  return { cleaned, stop_reason: data.stop_reason };
}

// ── Main handler ─────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY' });
  }

  try {
    let { fileBase64, fileUrl, mimeType, fileName } = req.body || {};
    if ((!fileBase64 && !fileUrl) || !mimeType) {
      return res.status(400).json({ error: 'ไม่พบไฟล์ที่อัปโหลด' });
    }

    // ดาวน์โหลดไฟล์จาก Supabase Storage URL (เลี่ยง Vercel body-size limit)
    if (!fileBase64 && fileUrl) {
      const fileResp = await fetch(fileUrl);
      if (!fileResp.ok) return res.status(400).json({ error: 'ไม่สามารถดึงไฟล์จากลิงก์ได้ กรุณาลองใหม่' });
      const arrayBuf = await fileResp.arrayBuffer();
      if (arrayBuf.byteLength > 28 * 1024 * 1024) {
        return res.status(413).json({ error: 'ไฟล์ใหญ่เกิน 28MB ที่ AI จะวิเคราะห์ได้ กรุณากรอกข้อมูลด้วยตนเอง' });
      }
      fileBase64 = Buffer.from(arrayBuf).toString('base64');
    }

    // แปลงประเภทไฟล์พิเศษเป็นข้อความ
    let textContent = null;
    const isDocx = /officedocument\.wordprocessingml/.test(mimeType) || /\.docx$/i.test(fileName || '');
    const isPlainText = mimeType.startsWith('text/') || /\.(txt|csv)$/i.test(fileName || '');
    if (isDocx) {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(fileBase64, 'base64') });
      textContent = result.value || '';
    } else if (isPlainText) {
      textContent = Buffer.from(fileBase64, 'base64').toString('utf-8');
    }

    const contentGeneral  = buildContent(mimeType, fileBase64, textContent, PROMPT_GENERAL);
    const contentIncludes = buildContent(mimeType, fileBase64, textContent, PROMPT_INCLUDES);
    if (!contentGeneral) {
      return res.status(400).json({ error: 'ไม่รองรับไฟล์ประเภทนี้ — รองรับ PDF, รูปภาพ (JPG/PNG/WebP), Word (.docx), ข้อความ (.txt/.csv)' });
    }

    // ── รอบที่ 1 และ 2 รันพร้อมกัน (parallel) เพื่อประหยัดเวลา ────────
    const [result1, result2] = await Promise.all([
      callClaude(apiKey, contentGeneral).catch(e => ({ error: e.message })),
      callClaude(apiKey, contentIncludes).catch(e => ({ error: e.message })),
    ]);

    // ── Parse รอบที่ 1 (ข้อมูลทั่วไป) ──────────────────────────────────
    let general = {};
    if (!result1.error) {
      try {
        general = JSON.parse(result1.cleaned);
      } catch (e) {
        console.error('Pass1 JSON parse failed:', result1.cleaned?.slice(-300));
      }
    } else {
      console.error('Pass1 error:', result1.error);
    }

    // ── Parse รอบที่ 2 (รวม/ไม่รวม) ────────────────────────────────────
    let incExc = { includes: [], excludes: [] };
    if (!result2.error) {
      try {
        const p2 = JSON.parse(result2.cleaned);
        if (Array.isArray(p2.includes)) incExc.includes = p2.includes.filter(Boolean);
        if (Array.isArray(p2.excludes)) incExc.excludes = p2.excludes.filter(Boolean);
      } catch (e) {
        console.error('Pass2 JSON parse failed:', result2.cleaned?.slice(-300));
      }
    } else {
      console.error('Pass2 error:', result2.error);
    }

    // ── รวมผลทั้งสองรอบ ──────────────────────────────────────────────────
    const merged = { ...general, includes: incExc.includes, excludes: incExc.excludes };

    if (!merged.name && !merged.itinerary?.length && !incExc.includes.length) {
      return res.status(502).json({ error: 'AI ไม่สามารถดึงข้อมูลจากไฟล์ได้ กรุณาลองใหม่อีกครั้ง' });
    }

    return res.status(200).json({ data: merged });

  } catch (err) {
    console.error('parse-tour-program error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดระหว่างประมวลผลไฟล์ กรุณาลองใหม่อีกครั้ง' });
  }
};

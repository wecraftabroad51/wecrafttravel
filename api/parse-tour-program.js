// รับไฟล์โปรแกรมทัวร์ (PDF / รูปภาพ / Word .docx / ข้อความ)
// แล้วใช้ Claude AI อ่านและดึงข้อมูลออกมาเป็น JSON
// สำหรับเติมฟอร์ม "เพิ่ม/แก้ไขทัวร์" ในหน้าแอดมินอัตโนมัติ
//
// ต้องตั้งค่า ENV: ANTHROPIC_API_KEY (Vercel → Project Settings → Environment Variables)

const mammoth = require('mammoth');

const SCHEMA_PROMPT = `คุณคือผู้ช่วยแอดมินบริษัททัวร์ มีหน้าที่อ่าน "ไฟล์โปรแกรมทัวร์" ที่แนบมา แล้วดึงข้อมูลออกมาเป็น JSON
ตามโครงสร้างด้านล่างนี้ "เป๊ะๆ" ห้ามใส่ข้อความอื่นนอกเหนือจาก JSON เด็ดขาด (ห้ามมี markdown code fence, ห้ามมีคำอธิบายใดๆ ก่อนหรือหลัง):

{
  "name": { "th": "ชื่อทัวร์ภาษาไทย", "en": "ชื่อทัวร์ภาษาอังกฤษ (ถ้าไม่มีให้เว้นว่าง)" },
  "destination": { "th": "ปลายทาง เช่น โตเกียว โอซาก้า เกียวโต", "en": "Tokyo, Osaka, Kyoto" },
  "description": { "th": "คำโปรยอธิบายไฮไลท์/จุดเด่นของทัวร์ แบบย่อหน้า ภาษาไทย", "en": "เวอร์ชันภาษาอังกฤษ ถ้าทำได้" },
  "duration": 7,
  "groupSize": 20,
  "itinerary": [
    { "title": "วันที่ 1: กรุงเทพฯ - โตเกียว", "description": "รายละเอียดกิจกรรม สถานที่ท่องเที่ยว มื้ออาหารของวันนั้นแบบเต็ม", "hotel": "ชื่อโรงแรมที่พักของคืนนั้น (ถ้าระบุ)" }
  ],
  "includes": ["รายการที่รวมอยู่ในราคาทัวร์ เช่น ตั๋วเครื่องบิน, ที่พัก, อาหาร, ไกด์ ฯลฯ — แยกเป็นรายการ"],
  "excludes": ["รายการที่ไม่รวมในราคาทัวร์ — แยกเป็นรายการ"],
  "departures": [
    { "date": "2026-07-08", "returnDate": "2026-07-25", "totalSeats": 20, "price": 35900, "childPrice": 0, "infantPrice": 0, "singleSupplement": 0 }
  ],
  "hotels": ["ชื่อโรงแรมที่พักทั้งหมดที่กล่าวถึงในเอกสาร (ไม่ซ้ำ)"]
}

กฎสำคัญ:
- วันที่ทุกชนิดให้แปลงเป็นรูปแบบ "YYYY-MM-DD" (ปี ค.ศ./คริสต์ศักราช) เท่านั้น — ถ้าเอกสารใช้ปี พ.ศ. ให้แปลงเป็น ค.ศ. โดยลบ 543
- ราคาทุกชนิดให้ใส่เป็นตัวเลขล้วน ไม่มีคอมม่า ไม่มีสัญลักษณ์สกุลเงิน
- ถ้าหาข้อมูลส่วนใดไม่เจอในเอกสาร ให้ใส่ "" หรือ [] หรือ 0 ตามชนิดข้อมูลของฟิลด์นั้น ห้ามแต่งข้อมูลขึ้นมาเองเด็ดขาด
- ตอบกลับเป็น JSON object ที่ถูกต้องตามรูปแบบ (valid JSON) เพียวๆ เท่านั้น ไม่ต้องมีคำนำ คำอธิบาย หรือ \`\`\`json ครอบ`;

function buildContent(mimeType, base64, textContent) {
  if (textContent != null) {
    return [{ type: 'text', text: `นี่คือเนื้อหาที่ดึงมาจากไฟล์โปรแกรมทัวร์:\n\n"""\n${textContent.slice(0, 60000)}\n"""\n\n${SCHEMA_PROMPT}` }];
  }
  if (mimeType === 'application/pdf') {
    return [
      { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
      { type: 'text', text: SCHEMA_PROMPT },
    ];
  }
  if (mimeType.startsWith('image/')) {
    return [
      { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
      { type: 'text', text: SCHEMA_PROMPT },
    ];
  }
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY (กรุณาแจ้งผู้ดูแลระบบให้ตั้งค่าใน Vercel Environment Variables)' });
  }

  try {
    let { fileBase64, fileUrl, mimeType, fileName } = req.body || {};
    if ((!fileBase64 && !fileUrl) || !mimeType) {
      return res.status(400).json({ error: 'ไม่พบไฟล์ที่อัปโหลด' });
    }

    // ถ้าส่งมาเป็นลิงก์ไฟล์ (อัปโหลดขึ้น Storage มาก่อนแล้ว) ให้ดึงไฟล์มาแปลงเป็น base64 ฝั่งเซิร์ฟเวอร์
    // วิธีนี้ทำให้รองรับไฟล์ขนาดใหญ่ได้ โดยไม่ติดข้อจำกัดขนาดคำขอ (request body) ของ Vercel Functions
    if (!fileBase64 && fileUrl) {
      const fileResp = await fetch(fileUrl);
      if (!fileResp.ok) {
        return res.status(400).json({ error: 'ไม่สามารถดึงไฟล์จากลิงก์ที่อัปโหลดได้ กรุณาลองใหม่อีกครั้ง' });
      }
      const arrayBuf = await fileResp.arrayBuffer();
      const AI_LIMIT = 28 * 1024 * 1024;
      if (arrayBuf.byteLength > AI_LIMIT) {
        return res.status(413).json({ error: 'ไฟล์มีขนาดใหญ่เกินกว่าที่ AI จะวิเคราะห์เนื้อหาได้โดยตรง (จำกัดประมาณ 25-28MB) กรุณากรอกข้อมูลด้วยตนเอง' });
      }
      fileBase64 = Buffer.from(arrayBuf).toString('base64');
    }

    let textContent = null;
    const isDocx = /officedocument\.wordprocessingml/.test(mimeType) || /\.docx$/i.test(fileName || '');
    const isPlainText = mimeType.startsWith('text/') || /\.(txt|csv)$/i.test(fileName || '');

    if (isDocx) {
      const buffer = Buffer.from(fileBase64, 'base64');
      const result = await mammoth.extractRawText({ buffer });
      textContent = result.value || '';
    } else if (isPlainText) {
      textContent = Buffer.from(fileBase64, 'base64').toString('utf-8');
    }

    const content = buildContent(mimeType, fileBase64, textContent);
    if (!content) {
      return res.status(400).json({ error: 'ไม่รองรับไฟล์ประเภทนี้ — รองรับ PDF, รูปภาพ (JPG/PNG/WebP), Word (.docx), และไฟล์ข้อความ (.txt/.csv)' });
    }

    const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        messages: [{ role: 'user', content }],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error('Anthropic API error:', aiResp.status, errText);
      return res.status(502).json({ error: 'เรียกใช้ AI ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง (' + aiResp.status + ')' });
    }

    const aiData = await aiResp.json();
    const raw = (aiData.content || []).map(b => b.text || '').join('').trim();
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error('JSON parse failed. Raw AI output:', cleaned.slice(0, 2000));
      return res.status(502).json({ error: 'AI อ่านไฟล์ได้ แต่ไม่สามารถแปลงผลลัพธ์เป็นข้อมูลได้ กรุณาลองใหม่อีกครั้ง' });
    }

    return res.status(200).json({ data: parsed });
  } catch (err) {
    console.error('parse-tour-program error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดระหว่างประมวลผลไฟล์ กรุณาลองใหม่อีกครั้ง' });
  }
};

// ── พร็อกซี PDF โปรแกรมทัวร์ ผ่านโดเมนเราเอง (ซ่อน URL ต้นทางของซัพพลายเออร์) ──
// เปิดที่ /api/tour-pdf?u=<base64url ของ url ต้นทาง>
// ใช้ Edge runtime + streaming เพราะ PDF บางไฟล์ใหญ่ >4.5MB (เกินลิมิต serverless)
export const config = { runtime: 'edge' };

// อนุญาตเฉพาะโดเมนซัพพลายเออร์ที่รู้จัก (กัน SSRF / open-proxy)
const ALLOW = [
  'probooking.co.th',
  'wondergrouptour.com',
  'booking.gs25tour.com',
  'zegotravel.com',
  'ttnplus.co.th',
  'ttnconnect.com',
  'bestinternational.com',
  'bestconsortium.com',
  'dev-bestconsortium.com',
  'superbholidayz.com',
  'checkingroup.co.th',
  'flywholesales.com',
  'realjourney.co.th',
  'tourfactory.co.th',
  'rarex.co.th',
  'itravels.center',
  'r2.cloudflarestorage.com',
  'uniqueinterwholesale.com',
  'supabase.co',
  'ht1freshdigital.com',
  'drive.google.com',
  'drive.usercontent.google.com',
];

function b64urlDecode(s) {
  s = String(s || '').replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return atob(s); // URL เป็น ASCII → ปลอดภัย
}

export default async function handler(req) {
  const enc = new URL(req.url).searchParams.get('u') || '';
  let target;
  try { target = b64urlDecode(enc); } catch { return new Response('bad ref', { status: 400 }); }

  let host;
  try { host = new URL(target).host.toLowerCase(); } catch { return new Response('bad url', { status: 400 }); }
  if (!ALLOW.some(h => host === h || host.endsWith('.' + h))) return new Response('forbidden', { status: 403 });

  // BEST (dev-bestconsortium.com) บล็อก IP ดาต้าเซนเตอร์ → รีไดเรกต์ให้เบราว์เซอร์ลูกค้าโหลดตรง
  if (host.endsWith('bestconsortium.com')) return Response.redirect(target, 302);

  // zego/gs25 บล็อก Edge → ข้ามไป serverless (Node) ทันที กัน edge fetch ค้าง ~20 วิ
  if (host.endsWith('zegotravel.com') || host.endsWith('gs25tour.com')) {
    return Response.redirect(new URL('/api/tour-pdf-alt?u=' + enc, req.url).href, 302);
  }

  // Google Drive: ลิงก์ /view คืนหน้า HTML → แปลงเป็น direct download
  if (host.includes('drive.google.com') || host.includes('drive.usercontent.google.com')) {
    const m = target.match(/[-\w]{25,}/);
    if (m) target = 'https://drive.google.com/uc?export=download&id=' + m[0];
  }

  // บางโฮสต์ (zego/gs25) บล็อก Edge → fallback ไป serverless (Node, IP/TLS ต่างกัน)
  const fallback = () => Response.redirect(new URL('/api/tour-pdf-alt?u=' + enc, req.url).href, 302);
  let upstream;
  try { upstream = await fetch(target, { redirect: 'follow' }); }
  catch { return fallback(); }
  if (!upstream.ok || !upstream.body) return fallback();

  // สตรีมกลับเป็น PDF โดยไม่โชว์ปลายทาง (address bar เห็นแค่ wecraft-travel.com)
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="wecraft-travel-tour.pdf"',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

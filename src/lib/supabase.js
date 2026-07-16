import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase env vars missing — running in offline/mock mode')
}

// client หลัก — ถือ session แอดมิน (Google OAuth) · ใช้เฉพาะงาน auth (auth.js)
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// client สำหรับข้อมูล/อัปโหลด — ไม่แนบ session (role = anon เสมอ)
// เหตุผล: RLS ของโปรเจกต์อนุญาต anon แต่บล็อก authenticated → ถ้าแนบ JWT
// ของแอดมิน ทุกการเขียน/อัปโหลดจะโดน "new row violates row-level security policy"
export const supabaseData = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'sb-wecraft-data', // แยกจาก client หลัก กันชนกัน
      },
    })
  : null

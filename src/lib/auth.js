// ── Admin auth (Google OAuth via Supabase) + allowlist ────────────
import { supabase } from './supabase.js';

// อีเมล super admin เริ่มต้น (เปลี่ยนได้ผ่าน env VITE_SUPER_ADMIN_EMAIL)
// ⚠️ ถ้าเปลี่ยนตรงนี้ ต้องแก้ใน RLS policy ของตาราง admins ใน Supabase ด้วย
export const SUPER_ADMIN_EMAIL =
  (import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'wecraftabroad51@gmail.com').toLowerCase();

// ── Sign in / out ────────────────────────────────────────────────
export async function signInWithGoogle() {
  if (!supabase) throw new Error('ระบบยังไม่ได้ตั้งค่า Supabase');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/admin',
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw error;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
}

export function onAuthChange(cb) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((event, session) => cb(session?.user || null, event));
  return () => data.subscription.unsubscribe();
}

// ── Authorization check ──────────────────────────────────────────
export async function checkAdminAccess(email) {
  if (!email) return { ok: false };
  const e = email.toLowerCase();
  if (e === SUPER_ADMIN_EMAIL) return { ok: true, role: 'super' };
  if (!supabase) return { ok: false };
  const { data, error } = await supabase
    .from('admins').select('email, role').eq('email', e).maybeSingle();
  if (error || !data) return { ok: false };
  return { ok: true, role: data.role || 'admin' };
}

// ── Admins management (super admin only) ─────────────────────────
export async function listAdmins() {
  if (!supabase) return [];
  const { data } = await supabase.from('admins').select('*').order('created_at', { ascending: true });
  return data || [];
}

export async function addAdmin(email, addedBy) {
  if (!supabase) throw new Error('ระบบยังไม่ได้ตั้งค่า Supabase');
  const e = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new Error('รูปแบบอีเมลไม่ถูกต้อง');
  if (e === SUPER_ADMIN_EMAIL) throw new Error('อีเมลนี้เป็น Super Admin อยู่แล้ว');

  const { error } = await supabase.from('admins').insert({ email: e, role: 'admin', added_by: addedBy });
  if (error) {
    if (error.code === '23505') throw new Error('อีเมลนี้เป็น admin อยู่แล้ว');
    throw new Error(error.message || 'เพิ่ม admin ไม่สำเร็จ');
  }

  // แจ้งเตือนทางอีเมล (ไม่ให้ error หยุดการทำงานหลัก)
  try {
    await fetch('/api/notify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e, addedBy }),
    });
  } catch (err) {
    console.warn('notify-admin failed:', err);
  }
  return e;
}

export async function removeAdmin(email) {
  if (!supabase) throw new Error('ระบบยังไม่ได้ตั้งค่า Supabase');
  const { error } = await supabase.from('admins').delete().eq('email', String(email).toLowerCase());
  if (error) throw new Error(error.message || 'ลบ admin ไม่สำเร็จ');
}

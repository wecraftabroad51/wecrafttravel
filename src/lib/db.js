/**
 * db.js — Supabase CRUD helpers
 * All functions return { data, error }
 * snake_case (DB) ↔ camelCase (JS) transform included
 */
import { supabase } from './supabase'

// ── Helpers ──────────────────────────────────────────────────
const toCamel = (obj) => {
  if (!obj) return obj
  const map = {
    tour_id:       'tourId',
    group_size:    'groupSize',
    price_tiers:   'priceTiers',
    created_at:    'createdAt',
    updated_at:    'updatedAt',
    expires_at:    'expiresAt',
    sort_order:    'sortOrder',
    read_time:     'readTime',
    tour_type:     'tourType',
    featured_order:'featuredOrder',
    child_price:   'childPrice',
    infant_price:  'infantPrice',
    pdf_url:       'pdfUrl',
    pdf_label:     'pdfLabel',
    pdf_updated:   'pdfUpdated',
    visitor_name:  'visitorName',
    visitor_email: 'visitorEmail',
    tour_name:     'tourName',
    departure_id:  'departureId',
    total_price:   'totalPrice',
    tour_interest: 'tourInterest',
  }
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [map[k] || k, v])
  )
}

const mapRows = (rows) => (rows || []).map(toCamel)

// UUID v4 pattern check — mock data uses "1","2" etc. which are NOT valid UUIDs
const isUUID = (id) => id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

// ── TOURS ─────────────────────────────────────────────────────
export const fetchTours = async () => {
  if (!supabase) return { data: null, error: 'offline' }
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: mapRows(data), error }
}

export const fetchPublicTours = async () => {
  if (!supabase) return { data: null, error: 'offline' }
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
  return { data: mapRows(data), error }
}

export const upsertTour = async (tour) => {
  if (!supabase) return { data: null, error: 'offline' }
  // Only send columns that exist in the Supabase schema
  // Skip id if it's not a valid UUID (mock data uses "1","2" etc.)
  const row = {
    ...(isUUID(tour.id) ? { id: tour.id } : {}),
    name:           tour.name           || { th: '', en: '' },
    destination:    tour.destination    || { th: '', en: '' },
    description:    tour.description    || { th: '', en: '' },
    image:          tour.image          || '',
    gallery:        tour.gallery        || [],
    continent:      tour.continent      || '',
    country:        tour.country        || '',
    tour_type:      tour.tourType       ?? tour.tour_type      ?? 'international',
    season:         tour.season         || {},
    duration:       tour.duration       || 1,
    group_size:     tour.groupSize      ?? tour.group_size     ?? 20,
    price:          tour.price          || 0,
    child_price:    tour.childPrice     ?? tour.child_price    ?? 0,
    infant_price:   tour.infantPrice    ?? tour.infant_price   ?? 0,
    featured:       tour.featured       ?? false,
    featured_order: tour.featuredOrder  ?? tour.featured_order ?? 0,
    active:         tour.active         ?? true,
    flight:         tour.flight         || {},
    hotels:         tour.hotels         || [],
    itinerary:      tour.itinerary      || [],
    includes:       tour.includes       || [],
    excludes:       tour.excludes       || [],
    price_tiers:    tour.priceTiers     ?? tour.price_tiers    ?? [],
    departures:     tour.departures     || [],
    pdf_url:        tour.pdfUrl         ?? tour.pdf_url        ?? '',
    pdf_label:      tour.pdfLabel       ?? tour.pdf_label      ?? {},
    pdf_updated:    tour.pdfUpdated     ?? tour.pdf_updated    ?? '',
    discount:       tour.discount       ?? 0,
  }
  const { data, error } = await supabase
    .from('tours')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()
  return { data: toCamel(data), error }
}

export const deleteTour = async (id) => {
  if (!supabase) return { error: 'offline' }
  return supabase.from('tours').delete().eq('id', id)
}

export const toggleTourFeatured = async (id, featured) => {
  if (!supabase) return { error: 'offline' }
  return supabase.from('tours').update({ featured }).eq('id', id)
}

export const toggleTourActive = async (id, active) => {
  if (!supabase) return { error: 'offline' }
  return supabase.from('tours').update({ active }).eq('id', id)
}

// ── ARTICLES ──────────────────────────────────────────────────
export const fetchArticles = async () => {
  if (!supabase) return { data: null, error: 'offline' }
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: mapRows(data), error }
}

export const upsertArticle = async (article) => {
  if (!supabase) return { data: null, error: 'offline' }
  const { id, createdAt, updatedAt, readTime, ...rest } = article
  const row = { ...rest, read_time: readTime, ...(isUUID(id) ? { id } : {}) }
  const { data, error } = await supabase
    .from('articles')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()
  return { data: toCamel(data), error }
}

export const deleteArticle = async (id) => {
  if (!supabase) return { error: 'offline' }
  return supabase.from('articles').delete().eq('id', id)
}

// ── PROMOTIONS ────────────────────────────────────────────────
export const fetchPromotions = async () => {
  if (!supabase) return { data: null, error: 'offline' }
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: mapRows(data), error }
}

export const upsertPromotion = async (promo) => {
  if (!supabase) return { data: null, error: 'offline' }
  const { id, createdAt, updatedAt, expiresAt, ...rest } = promo
  const row = { ...rest, expires_at: expiresAt, ...(isUUID(id) ? { id } : {}) }
  const { data, error } = await supabase
    .from('promotions')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()
  return { data: toCamel(data), error }
}

export const deletePromotion = async (id) => {
  if (!supabase) return { error: 'offline' }
  return supabase.from('promotions').delete().eq('id', id)
}

export const togglePromoActive = async (id, active) => {
  if (!supabase) return { error: 'offline' }
  return supabase.from('promotions').update({ active }).eq('id', id)
}

// ── FAQS ──────────────────────────────────────────────────────
export const fetchFaqs = async () => {
  if (!supabase) return { data: null, error: 'offline' }
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('sort_order', { ascending: true })
  return { data: mapRows(data), error }
}

export const upsertFaq = async (faq) => {
  if (!supabase) return { data: null, error: 'offline' }
  const { id, createdAt, sortOrder, ...rest } = faq
  const row = { ...rest, sort_order: sortOrder, ...(isUUID(id) ? { id } : {}) }
  const { data, error } = await supabase
    .from('faqs')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()
  return { data: toCamel(data), error }
}

export const deleteFaq = async (id) => {
  if (!supabase) return { error: 'offline' }
  return supabase.from('faqs').delete().eq('id', id)
}

// ── REVIEWS ───────────────────────────────────────────────────
export const fetchReviews = async () => {
  if (!supabase) return { data: null, error: 'offline' }
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: mapRows(data), error }
}

export const insertReview = async (review) => {
  if (!supabase) return { data: null, error: 'offline' }
  const { tourId, comment, ...rest } = review
  const { data, error } = await supabase
    .from('reviews')
    .insert({ ...rest, tour_id: tourId, text: comment ?? rest.text })
    .select()
    .single()
  return { data: toCamel(data), error }
}

export const approveReview = async (id, approved) => {
  if (!supabase) return { error: 'offline' }
  return supabase.from('reviews').update({ approved }).eq('id', id)
}

export const deleteReview = async (id) => {
  if (!supabase) return { error: 'offline' }
  return supabase.from('reviews').delete().eq('id', id)
}

// ── BOOKINGS ──────────────────────────────────────────────────
export const fetchBookings = async () => {
  if (!supabase) return { data: null, error: 'offline' }
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: mapRows(data), error }
}

export const insertBooking = async (booking) => {
  if (!supabase) return { data: null, error: 'offline' }
  const { tourId, tourName, ...rest } = booking
  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...rest, tour_id: tourId, tour_name: tourName })
    .select()
    .single()
  return { data: toCamel(data), error }
}

export const updateBookingStatus = async (id, status) => {
  if (!supabase) return { error: 'offline' }
  return supabase.from('bookings').update({ status }).eq('id', id)
}

export const deleteBooking = async (id) => {
  if (!supabase) return { error: 'offline' }
  return supabase.from('bookings').delete().eq('id', id)
}

// ── MESSAGES ──────────────────────────────────────────────────
export const fetchMessages = async () => {
  if (!supabase) return { data: null, error: 'offline' }
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: mapRows(data), error }
}

export const insertMessage = async (msg) => {
  if (!supabase) return { data: null, error: 'offline' }
  const { data, error } = await supabase
    .from('messages')
    .insert(msg)
    .select()
    .single()
  return { data: toCamel(data), error }
}

export const markMessageRead = async (id) => {
  if (!supabase) return { error: 'offline' }
  return supabase.from('messages').update({ read: true }).eq('id', id)
}

export const deleteMessage = async (id) => {
  if (!supabase) return { error: 'offline' }
  return supabase.from('messages').delete().eq('id', id)
}

// ── CHAT REALTIME ──────────────────────────────────────────────
export const subscribeChatSessions = (onUpdate) => {
  if (!supabase) return () => {}
  const channel = supabase
    .channel('chat-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' },
      payload => onUpdate(payload))
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// ── CHAT SESSIONS ─────────────────────────────────────────────
export const fetchChatSessions = async () => {
  if (!supabase) return { data: null, error: 'offline' }
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('updated_at', { ascending: false })
  return { data: mapRows(data), error }
}

export const upsertChatSession = async (session) => {
  if (!supabase) return { data: null, error: 'offline' }
  const { id, createdAt, updatedAt, ...rest } = session
  const row = { ...rest, ...(isUUID(id) ? { id } : {}) }
  const { data, error } = await supabase
    .from('chat_sessions')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()
  return { data: toCamel(data), error }
}

// ── SETTINGS ──────────────────────────────────────────────────
export const fetchSettings = async () => {
  if (!supabase) return { data: null, error: 'offline' }
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single()
  return { data, error }
}

export const updateSettings = async (settings) => {
  if (!supabase) return { error: 'offline' }
  return supabase
    .from('site_settings')
    .upsert({ id: 1, ...settings }, { onConflict: 'id' })
}

// ── IMAGE UPLOAD (Supabase Storage) ───────────────────────────
export const uploadImage = async (file, folder = 'tours') => {
  if (!supabase) return { url: null, error: 'offline' }
  const ext  = file.name.split('.').pop().toLowerCase()
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error: upErr } = await supabase.storage
    .from('tour-images')
    .upload(name, file, { cacheControl: '31536000', upsert: false })
  if (upErr) return { url: null, error: upErr }
  const { data } = supabase.storage.from('tour-images').getPublicUrl(name)
  return { url: data.publicUrl, error: null }
}

// ── PASSPORT UPLOAD (Supabase Storage → passports bucket) ────
export const uploadPassport = async (file, prefix = '') => {
  if (!supabase) return { url: null, name: file.name, error: 'offline' }
  const ext      = file.name.split('.').pop().toLowerCase()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path     = `${prefix ? prefix + '_' : ''}${Date.now()}-${safeName}`
  const { error: upErr } = await supabase.storage
    .from('passports')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (upErr) return { url: null, name: file.name, error: upErr.message || String(upErr) }
  const { data } = supabase.storage.from('passports').getPublicUrl(path)
  return { url: data.publicUrl, name: safeName, error: null }
}

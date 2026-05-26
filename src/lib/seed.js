/**
 * seed.js — นำ mock data จาก data.js เข้า Supabase
 * เรียกใช้ผ่านปุ่ม "Seed Database" ใน Admin > Settings > Database
 */
import { supabase } from './supabase.js';
import {
  TOURS_DATA, ARTICLES_DATA, PROMOTIONS_DATA, FAQS_DATA,
  REVIEWS_DATA, SITE_SETTINGS_DEFAULT, BOOKINGS_DATA,
  MESSAGES_DATA, CHAT_SESSIONS_DEFAULT,
} from '../data.js';

export async function seedDatabase(onProgress) {
  if (!supabase) return { errors: ['ไม่มีการเชื่อมต่อ Supabase'] };

  const errors = [];
  const log = (msg) => { console.log(msg); onProgress?.(msg); };

  // ── Tours ──────────────────────────────────────────────────
  log('กำลัง seed ทัวร์...');
  for (const tour of TOURS_DATA) {
    const { error } = await supabase.from('tours').insert({
      name:          tour.name,
      destination:   tour.destination,
      description:   tour.description,
      image:         tour.image || '',
      gallery:       tour.gallery || [],
      continent:     tour.continent || '',
      country:       tour.country || '',
      tour_type:     tour.tourType || 'international',
      season:        tour.season || {},
      duration:      tour.duration || 1,
      group_size:    tour.groupSize || 20,
      price:         tour.price || 0,
      child_price:   tour.childPrice || 0,
      infant_price:  tour.infantPrice || 0,
      featured:      tour.featured ?? false,
      featured_order: tour.featuredOrder || 0,
      active:        tour.active ?? true,
      flight:        tour.flight || {},
      hotels:        tour.hotels || [],
      itinerary:     tour.itinerary || [],
      includes:      tour.includes || [],
      excludes:      tour.excludes || [],
      price_tiers:   tour.priceTiers || [],
      departures:    tour.departures || [],
      pdf_url:       tour.pdfUrl || '',
      pdf_label:     tour.pdfLabel || {},
      pdf_updated:   tour.pdfUpdated || '',
    });
    if (error) errors.push(`ทัวร์ "${tour.name?.th}": ${error.message}`);
  }
  log(`✅ ทัวร์ ${TOURS_DATA.length} รายการ`);

  // ── Articles ───────────────────────────────────────────────
  log('กำลัง seed บทความ...');
  for (const article of ARTICLES_DATA) {
    const { error } = await supabase.from('articles').insert({
      title:     article.title,
      author:    article.author || '',
      date:      article.date || '',
      image:     article.coverImage || article.image || '',
      category:  article.category || '',
      excerpt:   article.excerpt || {},
      body:      article.body || {},
      read_time: article.readTime || 5,
      active:    true,
    });
    if (error) errors.push(`บทความ "${article.title?.th}": ${error.message}`);
  }
  log(`✅ บทความ ${ARTICLES_DATA.length} รายการ`);

  // ── Promotions ─────────────────────────────────────────────
  log('กำลัง seed โปรโมชั่น...');
  for (const promo of PROMOTIONS_DATA) {
    const { error } = await supabase.from('promotions').insert({
      title:       promo.title,
      description: promo.description || {},
      tour_id:     String(promo.tourId || ''),
      discount:    promo.discount || 0,
      code:        promo.code || '',
      end_date:    promo.endDate || '',
      image:       promo.image || '',
      active:      promo.active ?? true,
    });
    if (error) errors.push(`โปรโมชั่น "${promo.title?.th}": ${error.message}`);
  }
  log(`✅ โปรโมชั่น ${PROMOTIONS_DATA.length} รายการ`);

  // ── FAQs ───────────────────────────────────────────────────
  log('กำลัง seed FAQs...');
  for (let i = 0; i < FAQS_DATA.length; i++) {
    const faq = FAQS_DATA[i];
    const { error } = await supabase.from('faqs').insert({
      category:   faq.category || 'general',
      question:   faq.question,
      answer:     faq.answer,
      active:     faq.active ?? true,
      sort_order: i,
    });
    if (error) errors.push(`FAQ ${i + 1}: ${error.message}`);
  }
  log(`✅ FAQs ${FAQS_DATA.length} รายการ`);

  // ── Reviews ────────────────────────────────────────────────
  log('กำลัง seed รีวิว...');
  for (const review of REVIEWS_DATA) {
    const { error } = await supabase.from('reviews').insert({
      tour_id:  String(review.tourId || ''),
      name:     review.name,
      rating:   review.rating || 5,
      text:     review.text || {},
      tier:     review.tier || '',
      approved: review.approved ?? false,
      date:     review.date || '',
    });
    if (error) errors.push(`รีวิว "${review.name}": ${error.message}`);
  }
  log(`✅ รีวิว ${REVIEWS_DATA.length} รายการ`);

  // ── Bookings ───────────────────────────────────────────────
  log('กำลัง seed การจอง...');
  for (const booking of BOOKINGS_DATA) {
    const { error } = await supabase.from('bookings').insert({
      name:         booking.name,
      email:        booking.email || '',
      phone:        booking.phone || '',
      tour_id:      String(booking.tourId || ''),
      tour_name:    {},
      tier:         booking.tier || '',
      travelers:    booking.travelers || 1,
      departure_id: booking.departureId || '',
      total_price:  booking.totalPrice || 0,
      status:       booking.status || 'pending',
      date:         booking.date || '',
    });
    if (error) errors.push(`การจอง "${booking.name}": ${error.message}`);
  }
  log(`✅ การจอง ${BOOKINGS_DATA.length} รายการ`);

  // ── Messages ───────────────────────────────────────────────
  log('กำลัง seed ข้อความ...');
  for (const msg of MESSAGES_DATA) {
    const { error } = await supabase.from('messages').insert({
      name:          msg.name,
      email:         msg.email || '',
      phone:         msg.phone || '',
      tour_interest: msg.tourInterest || '',
      message:       msg.message || '',
      read:          msg.read ?? false,
      date:          msg.date || '',
    });
    if (error) errors.push(`ข้อความ "${msg.name}": ${error.message}`);
  }
  log(`✅ ข้อความ ${MESSAGES_DATA.length} รายการ`);

  // ── Chat Sessions ──────────────────────────────────────────
  log('กำลัง seed Chat Sessions...');
  for (const session of CHAT_SESSIONS_DEFAULT) {
    const { error } = await supabase.from('chat_sessions').upsert({
      id:            session.id,
      visitor_name:  session.visitorName || '',
      visitor_email: session.visitorEmail || '',
      status:        session.status || 'active',
      unread:        session.unread || 0,
      messages:      session.messages || [],
    }, { onConflict: 'id' });
    if (error) errors.push(`Chat "${session.id}": ${error.message}`);
  }
  log(`✅ Chat Sessions ${CHAT_SESSIONS_DEFAULT.length} รายการ`);

  // ── Site Settings ──────────────────────────────────────────
  log('กำลัง seed Settings...');
  const { error: settingsError } = await supabase.from('site_settings').upsert({
    id:      1,
    contact: SITE_SETTINGS_DEFAULT.contact,
    social:  SITE_SETTINGS_DEFAULT.social,
    popup:   SITE_SETTINGS_DEFAULT.popup,
  }, { onConflict: 'id' });
  if (settingsError) errors.push(`Settings: ${settingsError.message}`);
  else log('✅ Settings');

  return { errors, success: errors.length === 0 };
}

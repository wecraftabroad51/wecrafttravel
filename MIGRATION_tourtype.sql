-- Run this in Supabase SQL editor to update tourType values
UPDATE tours SET tour_type = 'outbound'      WHERE tour_type = 'international';
UPDATE tours SET tour_type = 'inbound'       WHERE tour_type = 'domestic';
UPDATE tours SET tour_type = 'premiumtour'   WHERE tour_type = 'premium';
UPDATE tours SET tour_type = 'hottour'       WHERE tour_type = 'hotdeal';
UPDATE tours SET tour_type = 'tourpackage'   WHERE tour_type = 'package';
-- cruise stays or becomes ticketbooking — update if needed:
-- UPDATE tours SET tour_type = 'ticketbooking' WHERE tour_type = 'cruise';

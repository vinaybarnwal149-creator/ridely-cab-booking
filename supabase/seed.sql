-- supabase/seed.sql
insert into ride_types (code, name, capacity, base_fare_paise, per_km_paise, per_min_paise, min_fare_paise, sort_order)
values
  ('bike', 'Bike', 1, 1500, 600, 80, 3000, 1),
  ('auto', 'Auto', 3, 2500, 1000, 100, 4000, 2),
  ('mini', 'Mini', 4, 4000, 1200, 150, 7000, 3),
  ('sedan', 'Sedan', 4, 5000, 1500, 200, 9000, 4),
  ('xl', 'XL', 6, 7000, 2000, 250, 13000, 5)
on conflict (code) do update set
  name = excluded.name,
  capacity = excluded.capacity,
  base_fare_paise = excluded.base_fare_paise,
  per_km_paise = excluded.per_km_paise,
  per_min_paise = excluded.per_min_paise,
  min_fare_paise = excluded.min_fare_paise,
  sort_order = excluded.sort_order;

insert into promo_codes (code, description, type, value, max_discount_paise, min_fare_paise, first_ride_only, is_active)
values
  ('WELCOME50', '50% off on your first ride up to ₹100', 'percent', 50, 10000, 0, true, true),
  ('FLAT30', 'Flat ₹30 off on rides above ₹150', 'flat', 3000, 3000, 15000, false, true)
on conflict (code) do nothing;

insert into app_settings (key, value)
values
  ('surge', '{"enabled": true, "cap": 2.0, "tiers": [{"ratio": 1, "mult": 1.2}, {"ratio": 2, "mult": 1.5}, {"ratio": 3, "mult": 2.0}]}'::jsonb),
  ('commission_percent', '20'::jsonb),
  ('cancellation_fee_paise', '3000'::jsonb),
  ('booking_fee_paise', '500'::jsonb)
on conflict (key) do nothing;


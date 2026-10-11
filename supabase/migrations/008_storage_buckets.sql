-- 008_storage_buckets.sql
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('driver-docs', 'driver-docs', false),
  ('ticket-files', 'ticket-files', false)
on conflict (id) do nothing;


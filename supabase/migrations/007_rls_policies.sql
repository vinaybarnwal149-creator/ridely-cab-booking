-- 007_rls_policies.sql
alter table profiles enable row level security;
alter table driver_profiles enable row level security;
alter table rides enable row level security;
alter table ride_offers enable row level security;
alter table payments enable row level security;
alter table notifications enable row level security;
alter table emergency_contacts enable row level security;
alter table support_tickets enable row level security;
alter table ticket_messages enable row level security;

create policy "Users can read own profile" on profiles for select using (id = auth.jwt()->>'sub');
create policy "Drivers can read own driver profile" on driver_profiles for select using (user_id = auth.jwt()->>'sub');
create policy "Riders can read own rides" on rides for select using (rider_id = auth.jwt()->>'sub');
create policy "Drivers can read assigned rides" on rides for select using (driver_id = auth.jwt()->>'sub');
create policy "Users can read own notifications" on notifications for select using (user_id = auth.jwt()->>'sub');
create policy "Users can manage own emergency contacts" on emergency_contacts for all using (user_id = auth.jwt()->>'sub');


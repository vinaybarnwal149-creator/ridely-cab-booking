-- 006_functions_triggers.sql
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function find_nearby_drivers(
  p geography,
  p_ride_type text,
  p_radius_m int default 5000,
  p_exclude text[] default '{}',
  p_limit int default 5
)
returns table (
  driver_id text,
  distance_m double precision,
  rating numeric,
  vehicle_plate text
) as $$
begin
  return query
  select
    dp.user_id as driver_id,
    st_distance(dp.current_location, p) as distance_m,
    dp.avg_rating as rating,
    dp.vehicle_plate
  from driver_profiles dp
  where dp.status = 'approved'
    and dp.is_online = true
    and dp.is_busy = false
    and (dp.ride_type_code = p_ride_type or p_ride_type is null)
    and not (dp.user_id = any(p_exclude))
    and st_dwithin(dp.current_location, p, p_radius_m)
  order by distance_m asc
  limit p_limit;
end;
$$ language plpgsql;

create or replace function accept_ride(
  p_ride_id uuid,
  p_driver_id text
)
returns jsonb as $$
declare
  v_ride rides%rowtype;
begin
  select * into v_ride from rides where id = p_ride_id for update;
  if not found or v_ride.status <> 'requested' then
    raise exception 'RIDE_UNAVAILABLE';
  end if;

  update rides
  set
    driver_id = p_driver_id,
    status = 'accepted',
    accepted_at = now(),
    updated_at = now()
  where id = p_ride_id;

  update driver_profiles
  set is_busy = true, updated_at = now()
  where user_id = p_driver_id;

  update ride_offers
  set status = 'accepted', responded_at = now()
  where ride_id = p_ride_id and driver_id = p_driver_id and status = 'pending';

  update ride_offers
  set status = 'cancelled'
  where ride_id = p_ride_id and driver_id <> p_driver_id and status = 'pending';

  return to_jsonb(v_ride);
end;
$$ language plpgsql;


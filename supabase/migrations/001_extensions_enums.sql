-- 001_extensions_enums.sql
create extension if not exists postgis;
create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists pgcrypto;

create type user_role as enum ('rider', 'driver', 'admin');
create type driver_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type ride_status as enum ('requested', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled', 'expired');
create type payment_method_type as enum ('card', 'cash');
create type payment_status as enum ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded');
create type offer_status as enum ('pending', 'accepted', 'declined', 'expired', 'cancelled');
create type earning_status as enum ('pending', 'paid');
create type ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type ticket_category as enum ('payment', 'lost_item', 'driver_behaviour', 'ride_issue', 'app_bug', 'other');
create type sos_status as enum ('active', 'resolved');
create type promo_type as enum ('percent', 'flat');


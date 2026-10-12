-- Core tenancy: Organization -> Brand, with members and RLS.
-- Applied to self-hosted Supabase (auth.users comes from GoTrue).

create schema if not exists core;

create type core.member_role as enum ('owner', 'admin', 'editor', 'viewer');

create table core.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  plan        text not null default 'free',
  created_at  timestamptz not null default now()
);

create table core.brands (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references core.organizations(id) on delete cascade,
  name             text not null,
  slug             text not null,
  industry         text,
  region           text,            -- e.g. 'IN-GJ' drives regional festival calendars
  language         text default 'en',
  created_at       timestamptz not null default now(),
  unique (organization_id, slug)
);

create table core.organization_members (
  organization_id  uuid not null references core.organizations(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  role             core.member_role not null default 'viewer',
  created_at       timestamptz not null default now(),
  primary key (organization_id, user_id)
);

-- Optional per-brand override (e.g. an agency editor on one brand only)
create table core.brand_members (
  brand_id   uuid not null references core.brands(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       core.member_role not null,
  primary key (brand_id, user_id)
);

-- Which products an org has switched on (Feature Centre)
create table core.organization_features (
  organization_id  uuid not null references core.organizations(id) on delete cascade,
  product          text not null,          -- 'social' | 'commerce' | 'crm' | 'fulfillment' ...
  enabled          boolean not null default true,
  primary key (organization_id, product)
);

-- Helper used by every product's RLS policies
create or replace function core.is_member(org uuid)
returns boolean
language sql stable security definer set search_path = core
as $$
  select exists (
    select 1 from core.organization_members
    where organization_id = org and user_id = auth.uid()
  );
$$;

alter table core.organizations         enable row level security;
alter table core.brands                enable row level security;
alter table core.organization_members  enable row level security;
alter table core.brand_members         enable row level security;
alter table core.organization_features enable row level security;

create policy org_read     on core.organizations         for select using (core.is_member(id));
create policy brand_read   on core.brands                for select using (core.is_member(organization_id));
create policy member_read  on core.organization_members  for select using (core.is_member(organization_id));
create policy feature_read on core.organization_features for select using (core.is_member(organization_id));
-- Writes go through core-api (service role), so no insert/update policies for clients.

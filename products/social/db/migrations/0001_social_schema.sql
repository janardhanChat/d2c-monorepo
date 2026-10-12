-- Social product schema. Owned by social-api; other products never write here.
-- Depends on core tenancy (platform/services/core-api/migrations/0001_core_tenancy.sql).

create schema if not exists social;

create type social.post_status as enum (
  'draft', 'pending_approval', 'approved', 'scheduled', 'publishing', 'published', 'failed'
);

create table social.posts (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references core.organizations(id) on delete cascade,
  brand_id         uuid not null references core.brands(id) on delete cascade,
  caption          text not null default '',
  format           text not null,
  platforms        text[] not null,
  channel_ids      text[] not null default '{}',
  media_urls       text[] not null default '{}',
  status           social.post_status not null default 'draft',
  scheduled_at     timestamptz,
  festival_id      text,
  created_by       uuid not null references auth.users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index posts_brand_status_idx on social.posts (brand_id, status, scheduled_at);

-- Publish attempts / external ids per channel (filled from integrations-api responses)
create table social.post_deliveries (
  post_id           uuid not null references social.posts(id) on delete cascade,
  channel_id        text not null,
  publisher         text not null,          -- 'postiz' today, 'meta' later
  external_post_id  text,
  status            text not null default 'pending',
  error             text,
  updated_at        timestamptz not null default now(),
  primary key (post_id, channel_id)
);

-- Transactional outbox: events written in the same transaction as the change,
-- relayed to the event bus (post.published.v1, ...) by a worker.
create table social.outbox (
  id          bigserial primary key,
  event_type  text not null,
  payload     jsonb not null,
  created_at  timestamptz not null default now(),
  sent_at     timestamptz
);

alter table social.posts           enable row level security;
alter table social.post_deliveries enable row level security;

create policy posts_read on social.posts
  for select using (core.is_member(organization_id));
create policy deliveries_read on social.post_deliveries
  for select using (exists (
    select 1 from social.posts p where p.id = post_id and core.is_member(p.organization_id)
  ));

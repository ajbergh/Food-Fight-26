create extension if not exists pgcrypto;

create table if not exists player_profile (
  id uuid primary key default gen_random_uuid(),
  external_subject text unique not null,
  display_name varchar(20) not null,
  xp bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists match (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  map_id text not null,
  mode_id text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  winning_team smallint
);

create table if not exists match_participant (
  match_id uuid not null references match(id) on delete cascade,
  player_id uuid not null references player_profile(id) on delete cascade,
  team smallint not null,
  score integer not null default 0,
  hits integer not null default 0,
  knockouts integer not null default 0,
  primary key (match_id, player_id)
);

create table if not exists cosmetic_inventory (
  player_id uuid not null references player_profile(id) on delete cascade,
  cosmetic_id text not null,
  acquired_at timestamptz not null default now(),
  primary key (player_id, cosmetic_id)
);

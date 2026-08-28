-- Brand My Mac — Schema
-- Beträge durchgehend in Cent (integer). Nie Fließkomma für Geld.

create table if not exists settings (
  id                  int primary key default 1,
  device_name         text        not null default 'MacBook Pro 14”, Silver',
  device_url          text,
  goal_cents          int         not null default 252900,
  currency            text        not null default 'eur',
  auction_ends_at     timestamptz not null,
  closed_at           timestamptz,
  min_increment_cents int         not null default 1000,
  deposit_bps         int         not null default 2000,   -- 20,00 %
  min_deposit_cents   int         not null default 1000,
  headline            text        not null default 'Your brand, on my Mac.',
  subheadline         text        not null default 'Your logo travels with me on a founder’s best friend: the MacBook.',
  owner_name          text        not null default '',
  owner_bio           text        not null default '',
  owner_x             text,
  owner_email         text,
  -- Datenblatt des Geraets: [["Chip","Apple M5 ..."], ...]
  device_specs        jsonb       not null default '[]'::jsonb,
  device_note         text        not null default '',
  constraint settings_singleton check (id = 1)
);

create table if not exists spots (
  id                int  primary key,
  label             text not null,
  size              text not null check (size in ('S','M','L')),
  dims              text not null,
  grid_area         text not null,
  start_price_cents int  not null,
  sort_order        int  not null default 0
);

-- Lebenslauf eines Gebots:
--   pending_payment -> review -> leading -> won
--                   \-> expired      \-> outbid
--                                     \-> rejected
create table if not exists bids (
  id                     bigserial primary key,
  spot_id                int         not null references spots(id),
  amount_cents           int         not null check (amount_cents > 0),
  deposit_cents          int         not null check (deposit_cents > 0),
  status                 text        not null check (status in
                           ('pending_payment','review','leading','outbid','rejected','expired','won')),
  sponsor_name           text        not null,
  sponsor_url            text,
  sponsor_email          text        not null,
  logo_url               text,
  stripe_session_id      text unique,
  stripe_payment_intent  text,
  stripe_refund_id       text,
  payment_link_url       text,
  remainder_paid_at      timestamptz,
  created_at             timestamptz not null default now(),
  paid_at                timestamptz,
  decided_at             timestamptz,
  refunded_at            timestamptz
);

create index if not exists bids_spot_status_amount on bids (spot_id, status, amount_cents desc, id);
create index if not exists bids_status           on bids (status);
create index if not exists bids_session          on bids (stripe_session_id);

-- Nachvollziehbarkeit: jede Zustandsänderung wird protokolliert.
create table if not exists events (
  id         bigserial   primary key,
  bid_id     bigint      references bids(id),
  kind       text        not null,
  detail     jsonb       not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_created on events (created_at desc);

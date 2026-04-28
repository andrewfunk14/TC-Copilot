-- Run this in your Supabase SQL editor to initialize the schema

-- Transactions table
create table if not exists transactions (
  id                          uuid primary key default gen_random_uuid(),
  created_at                  timestamptz default now(),
  status                      text default 'active',
  team                        text check (team in ('CHR', 'KW_UTAH', 'KW_IDAHO')),
  kw_side                     text,
  transaction_type            text,

  -- Buyer / Client
  client_name                 text,
  client_phone                text,
  client_email                text,

  -- Property
  property_address            text,
  short_address               text,
  mls_number                  text,

  -- Contract terms
  purchase_price              numeric,
  earnest_money               numeric,
  construction_deposit        numeric,
  concessions                 numeric,
  offer_reference_date        date,
  acceptance_date             date,

  -- Deadlines
  seller_disclosure_date      date,
  due_diligence_date          date,
  financing_date              date,
  close_date                  date,

  -- Commission
  sac_percent                 numeric,
  bac_percent                 numeric,
  net_or_gross                text,
  transaction_fee             numeric,

  -- Home warranty
  home_warranty               boolean,
  home_warranty_paid_by       text,
  home_warranty_amount        numeric,

  -- Seller contact
  seller_name                 text,
  seller_phone                text,
  seller_email                text,

  -- Buyer agent (KW agent)
  agent_name                  text,
  agent_company               text,
  agent_phone                 text,
  agent_email                 text,
  agent_office_address        text,
  tc_name                     text,

  -- Listing agent (seller's agent)
  sellers_agent_name          text,
  sellers_agent_company       text,
  sellers_agent_phone         text,
  sellers_agent_email         text,

  -- Buyer title company
  title_company               text,
  title_officer_name          text,
  title_officer_phone         text,
  title_officer_email         text,

  -- Seller title company
  seller_title_company        text,
  seller_title_officer_name   text,
  seller_title_officer_phone  text,
  seller_title_officer_email  text,

  -- Lender
  lender_company              text,
  lender_name                 text,
  lender_phone                text,
  lender_email                text,

  -- Integration IDs
  monday_checklist_id         text,
  monday_clients_id           text,
  drive_folder_id             text,
  drive_folder_url            text,

  -- Notes
  water_shares_rights         text,
  notes                       text
);

-- Config table
create table if not exists config (
  id              uuid primary key default gen_random_uuid(),
  key             text unique not null,
  value           text not null,
  updated_at      timestamptz default now(),
  editable_by_tc  boolean default false
);

-- Enable RLS
alter table transactions enable row level security;
alter table config enable row level security;

-- Transactions: authenticated users can manage rows
create policy "transactions_authenticated_all"
  on transactions
  for all
  to authenticated
  using (true)
  with check (true);

-- Config: authenticated users can read all
create policy "config_authenticated_select"
  on config
  for select
  to authenticated
  using (true);

-- Config: authenticated users can only update TC-editable rows
create policy "config_authenticated_update"
  on config
  for update
  to authenticated
  using (editable_by_tc = true)
  with check (editable_by_tc = true);

-- Seed required config keys (fill in values after setup)
insert into config (key, value, editable_by_tc) values
  ('office_context',                           '', false),
  ('email_tone_and_style',                     '', true),
  ('email_signature',                          '', true),
  ('tc_custom_instructions',                   '', true),
  ('deposit_link',                             '', true),
  ('chr_agent_names',                          '[]', false),
  ('monday_buyer_config',                      '{}', false),
  ('drive_buyer_config',                       '{}', false),
  ('email_template_title_lender_buyer',        '', false),
  ('email_template_sellers_agent_buyer',       '', false),
  ('email_template_client_buyer_residential',  '', false),
  ('email_template_client_buyer_land',         '', false),
  ('tc_monday_user_id',                        '', false)
on conflict (key) do nothing;

-- Migration: add columns introduced with the full info-sheet schema
-- Safe to run on existing databases (each alter is independent)
alter table transactions add column if not exists client_phone               text;
alter table transactions add column if not exists earnest_money              numeric;
alter table transactions add column if not exists construction_deposit       numeric;
alter table transactions add column if not exists concessions                numeric;
alter table transactions add column if not exists offer_reference_date       date;
alter table transactions add column if not exists acceptance_date            date;
alter table transactions add column if not exists seller_disclosure_date     date;
alter table transactions add column if not exists due_diligence_date        date;
alter table transactions add column if not exists financing_date             date;
alter table transactions add column if not exists sac_percent                numeric;
alter table transactions add column if not exists bac_percent                numeric;
alter table transactions add column if not exists net_or_gross               text;
alter table transactions add column if not exists transaction_fee            numeric;
alter table transactions add column if not exists home_warranty              boolean;
alter table transactions add column if not exists home_warranty_paid_by      text;
alter table transactions add column if not exists home_warranty_amount       numeric;
alter table transactions add column if not exists seller_name                text;
alter table transactions add column if not exists seller_phone               text;
alter table transactions add column if not exists seller_email               text;
alter table transactions add column if not exists agent_company              text;
alter table transactions add column if not exists agent_phone                text;
alter table transactions add column if not exists sellers_agent_company      text;
alter table transactions add column if not exists sellers_agent_phone        text;
alter table transactions add column if not exists title_officer_phone        text;
alter table transactions add column if not exists seller_title_company       text;
alter table transactions add column if not exists seller_title_officer_name  text;
alter table transactions add column if not exists seller_title_officer_phone text;
alter table transactions add column if not exists seller_title_officer_email text;
alter table transactions add column if not exists lender_company             text;
alter table transactions add column if not exists lender_phone               text;
alter table transactions add column if not exists water_shares_rights        text;

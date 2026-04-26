-- Run this in your Supabase SQL editor to initialize the schema

-- Transactions table
create table if not exists transactions (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz default now(),
  status                text default 'active',
  team                  text check (team in ('CHR', 'KW_UTAH', 'KW_IDAHO')),
  kw_side               text,
  transaction_type      text,
  client_name           text,
  client_email          text,
  property_address      text,
  short_address         text,
  agent_name            text,
  agent_email           text,
  agent_office_address  text,
  tc_name               text,
  contract_date         date,
  close_date            date,
  purchase_price        numeric,
  mls_number            text,
  lender_name           text,
  lender_email          text,
  title_company         text,
  title_officer_name    text,
  title_officer_email   text,
  sellers_agent_name    text,
  sellers_agent_email   text,
  monday_checklist_id   text,
  monday_clients_id     text,
  drive_folder_id       text,
  drive_folder_url      text,
  notes                 text
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

-- HiveTag v1.5.8
-- Additive Premium Feeding schema.
-- This migration creates new Feeding tables only. It does not rewrite or delete
-- existing apiary, hive, inspection, task, Logbook, Queen or veterinary data.
-- Historical "Fed Bees" Logbook rows remain untouched.

create table if not exists public.feeding_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  apiary_id uuid references public.apiaries(id) on delete set null,
  apiary_name_snapshot text not null,
  fed_on date not null,
  feed_type text not null,
  feed_type_other text,
  product_name text,
  reason text not null default 'not_recorded',
  reason_other text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  feed_subtype text,
  feed_subtype_other text,
  syrup_strength text,
  syrup_custom_water_per_kg numeric(6,3),
  recipe_sugar_kg numeric(8,2),
  recipe_water_litres numeric(8,3),
  weather text,
  weather_code text,

  constraint feeding_records_feed_type_check
    check (feed_type in (
      'sugar_syrup',
      'invert_syrup',
      'fondant',
      'pollen_protein',
      'frames_of_stores',
      'dry_sugar',
      'other'
    )),
  constraint feeding_records_feed_type_other_check
    check (
      feed_type <> 'other'
      or nullif(btrim(feed_type_other), '') is not null
    ),
  constraint feeding_records_feed_subtype_check
    check (
      feed_subtype is null
      or feed_subtype in (
        'pollen_substitute',
        'pollen_supplement',
        'pollen_patty',
        'stored_pollen',
        'other'
      )
    ),
  constraint feeding_records_feed_subtype_other_check
    check (
      feed_subtype <> 'other'
      or nullif(btrim(feed_subtype_other), '') is not null
    ),
  constraint feeding_records_syrup_strength_check
    check (
      syrup_strength is null
      or syrup_strength in ('thin','medium','thick','custom','not_recorded')
    ),
  constraint feeding_records_syrup_only_check
    check (
      feed_type = 'sugar_syrup'
      or (
        syrup_strength is null
        and syrup_custom_water_per_kg is null
        and recipe_sugar_kg is null
        and recipe_water_litres is null
      )
    ),
  constraint feeding_records_custom_syrup_check
    check (
      syrup_strength <> 'custom'
      or (
        syrup_custom_water_per_kg is not null
        and syrup_custom_water_per_kg > 0
      )
    ),
  constraint feeding_records_sugar_strength_required_check
    check (
      feed_type <> 'sugar_syrup'
      or syrup_strength is not null
    ),
  constraint feeding_records_pollen_subtype_required_check
    check (
      feed_type <> 'pollen_protein'
      or feed_subtype is not null
    ),
  constraint feeding_records_subtype_only_for_pollen_check
    check (
      feed_type = 'pollen_protein'
      or (
        feed_subtype is null
        and feed_subtype_other is null
      )
    ),
  constraint feeding_records_recipe_sugar_positive_check
    check (recipe_sugar_kg is null or recipe_sugar_kg > 0),
  constraint feeding_records_recipe_water_positive_check
    check (recipe_water_litres is null or recipe_water_litres > 0),
  constraint feeding_records_reason_check
    check (reason in (
      'build_stores',
      'low_stores',
      'spring_support',
      'nuc_split_support',
      'brood_build_up',
      'comb_drawing',
      'nectar_dearth',
      'queen_rearing',
      'post_shook_swarm',
      'other',
      'not_recorded'
    )),
  constraint feeding_records_reason_other_check
    check (
      reason <> 'other'
      or nullif(btrim(reason_other), '') is not null
    )
);

create table if not exists public.feeding_record_hives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  feeding_record_id uuid not null references public.feeding_records(id) on delete cascade,
  hive_id uuid references public.hives(id) on delete set null,
  hive_name_snapshot text not null,
  amount numeric(10,3) not null,
  amount_unit text not null,
  amount_unit_other text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  inspection_id uuid references public.inspections(id) on delete set null,

  constraint feeding_record_hives_amount_positive_check
    check (amount > 0),
  constraint feeding_record_hives_unit_check
    check (amount_unit in (
      'litres',
      'millilitres',
      'kilograms',
      'grams',
      'patties',
      'blocks',
      'frames',
      'other'
    )),
  constraint feeding_record_hives_unit_other_check
    check (
      amount_unit <> 'other'
      or nullif(btrim(amount_unit_other), '') is not null
    )
);

create index if not exists feeding_records_user_date_idx
  on public.feeding_records (user_id, fed_on desc);

create index if not exists feeding_records_apiary_idx
  on public.feeding_records (apiary_id);

create index if not exists feeding_records_user_idx
  on public.feeding_records (user_id);

create index if not exists feeding_record_hives_record_idx
  on public.feeding_record_hives (feeding_record_id);

create index if not exists feeding_record_hives_hive_idx
  on public.feeding_record_hives (hive_id);

create index if not exists feeding_record_hives_inspection_idx
  on public.feeding_record_hives (inspection_id);

create index if not exists feeding_record_hives_user_idx
  on public.feeding_record_hives (user_id);

create unique index if not exists feeding_record_hives_record_hive_uidx
  on public.feeding_record_hives (feeding_record_id, hive_id)
  where hive_id is not null;

drop trigger if exists feeding_records_set_updated_at on public.feeding_records;
create trigger feeding_records_set_updated_at
before update on public.feeding_records
for each row execute function public.set_updated_at();

drop trigger if exists feeding_record_hives_set_updated_at on public.feeding_record_hives;
create trigger feeding_record_hives_set_updated_at
before update on public.feeding_record_hives
for each row execute function public.set_updated_at();

alter table public.feeding_records enable row level security;
alter table public.feeding_record_hives enable row level security;

revoke all on table public.feeding_records from anon, authenticated;
revoke all on table public.feeding_record_hives from anon, authenticated;

grant select, insert, update, delete on table public.feeding_records to authenticated;
grant select, insert, update, delete on table public.feeding_record_hives to authenticated;

grant all on table public.feeding_records to service_role;
grant all on table public.feeding_record_hives to service_role;

drop policy if exists feeding_records_select_premium_own on public.feeding_records;
create policy feeding_records_select_premium_own
on public.feeding_records
for select
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

drop policy if exists feeding_records_insert_premium_own on public.feeding_records;
create policy feeding_records_insert_premium_own
on public.feeding_records
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
  and exists (
    select 1
    from public.apiaries a
    where a.id = feeding_records.apiary_id
      and a.user_id = (select auth.uid())
  )
);

drop policy if exists feeding_records_update_premium_own on public.feeding_records;
create policy feeding_records_update_premium_own
on public.feeding_records
for update
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
)
with check (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
  and (
    apiary_id is null
    or exists (
      select 1
      from public.apiaries a
      where a.id = feeding_records.apiary_id
        and a.user_id = (select auth.uid())
    )
  )
);

drop policy if exists feeding_records_delete_premium_own on public.feeding_records;
create policy feeding_records_delete_premium_own
on public.feeding_records
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

drop policy if exists feeding_record_hives_select_premium_own on public.feeding_record_hives;
create policy feeding_record_hives_select_premium_own
on public.feeding_record_hives
for select
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

drop policy if exists feeding_record_hives_insert_premium_own on public.feeding_record_hives;
create policy feeding_record_hives_insert_premium_own
on public.feeding_record_hives
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (select public.is_current_user_premium())
  and exists (
    select 1
    from public.feeding_records fr
    join public.hives h on h.id = feeding_record_hives.hive_id
    where fr.id = feeding_record_hives.feeding_record_id
      and fr.user_id = (select auth.uid())
      and h.user_id = (select auth.uid())
      and h.apiary_id = fr.apiary_id
  )
  and (
    inspection_id is null
    or exists (
      select 1
      from public.inspections i
      where i.id = feeding_record_hives.inspection_id
        and i.user_id = (select auth.uid())
        and i.hive_id = feeding_record_hives.hive_id
    )
  )
);

drop policy if exists feeding_record_hives_update_premium_own on public.feeding_record_hives;
create policy feeding_record_hives_update_premium_own
on public.feeding_record_hives
for update
to authenticated
using (
  user_id = (select auth.uid())
  and (select public.is_current_user_premium())
)
with check (
  user_id = (select auth.uid())
  and (select public.is_current_user_premium())
  and exists (
    select 1
    from public.feeding_records fr
    join public.hives h on h.id = feeding_record_hives.hive_id
    where fr.id = feeding_record_hives.feeding_record_id
      and fr.user_id = (select auth.uid())
      and h.user_id = (select auth.uid())
      and h.apiary_id = fr.apiary_id
  )
  and (
    inspection_id is null
    or exists (
      select 1
      from public.inspections i
      where i.id = feeding_record_hives.inspection_id
        and i.user_id = (select auth.uid())
        and i.hive_id = feeding_record_hives.hive_id
    )
  )
);

drop policy if exists feeding_record_hives_delete_premium_own on public.feeding_record_hives;
create policy feeding_record_hives_delete_premium_own
on public.feeding_record_hives
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_current_user_premium()
);

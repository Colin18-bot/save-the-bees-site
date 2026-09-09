alter table public.inspections
  add column frames_of_brood smallint,
  add column frames_of_stores smallint;

alter table public.inspections
  add constraint inspections_frames_of_brood_check
    check (frames_of_brood is null or frames_of_brood between 0 and 30),
  add constraint inspections_frames_of_stores_check
    check (frames_of_stores is null or frames_of_stores between 0 and 30);

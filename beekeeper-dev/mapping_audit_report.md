# Mapping Audit Report

Scanned JS/TS files: **97**

## Inspections date field variants

Prefer `date` for inspection rows. Found references to `inspection_date` which may not exist.

Occurrences: **2**

- `inspection_date` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Calendar.jsx** : line 282
- `inspection_date` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Calendar.jsx** : line 282
## Weather code field (legacy vs modern)

Prefer `weather_code` in your DB and code. Found `weathercode` occurrences that may be stale.

Occurrences: **6**

- `weathercode` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Dashboard.jsx** : line 169
- `weathercode` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Weather.jsx** : line 134
- `weathercode` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Inspections/NewInspection.jsx** : line 123
- `weathercode` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Weather.jsx** : line 134
- `weathercode` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/NewInspection.jsx** : line 102
- `weathercode` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/NewInspection.jsx** : line 108
## Direct `hive_name` usage

Using `hive_name` suggests denormalized field. Ensure the column exists (e.g., on todos) or replace with a join.

Occurrences: **46**

- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Dashboard.jsx** : line 90
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Dashboard.jsx** : line 239
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Dashboard.jsx** : line 239
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/EditTodo.jsx** : line 15
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/EditTodo.jsx** : line 26
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/EditTodo.jsx** : line 36
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/EditTodo.jsx** : line 54
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/EditTodo.jsx** : line 54
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/EditTodo.jsx** : line 82
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/EditTodo.jsx** : line 85
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/EditTodo.jsx** : line 88
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/EditTodo.jsx** : line 106
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/EditTodo.jsx** : line 106
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/NewTodo.jsx** : line 30
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/NewTodo.jsx** : line 70
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/NewTodo.jsx** : line 84
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/NewTodo.jsx** : line 88
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/NewTodo.jsx** : line 91
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/NewTodo.jsx** : line 134
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/NewTodo.jsx** : line 134
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/TodoList.jsx** : line 34
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/TodoList.jsx** : line 156
- `hive_name` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Todos/TodoList.jsx** : line 214
- `hive_name` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Dashboard.jsx** : line 64
- `hive_name` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Dashboard.jsx** : line 211
... and 21 more.

## Longitude field variants

Your DB uses `longitude`. Occurrences of `lng`/`lon` may be geocoder variables, but verify DB access doesn't expect `lng` or `lon`.

Occurrences: **80**

- `lng` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/components/LocationPicker.jsx** : line 20
- `lng` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/components/LocationPicker.jsx** : line 25
- `lng` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/components/LocationPicker.jsx** : line 27
- `lng` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/components/LocationPicker.jsx** : line 33
- `lng` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/components/LocationPicker.jsx** : line 50
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/components/LocationPicker.jsx** : line 27
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/components/LocationPicker.jsx** : line 43
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/components/LocationPicker.jsx** : line 44
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/components/LocationPicker.jsx** : line 48
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/components/LocationPicker.jsx** : line 50
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Dashboard.jsx** : line 134
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Dashboard.jsx** : line 136
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Dashboard.jsx** : line 136
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Dashboard.jsx** : line 138
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Dashboard.jsx** : line 143
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Weather.jsx** : line 184
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Weather.jsx** : line 188
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Weather.jsx** : line 188
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Weather.jsx** : line 190
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Weather.jsx** : line 220
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Weather.jsx** : line 242
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Weather.jsx** : line 265
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Weather.jsx** : line 310
- `lon` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Weather.jsx** : line 326
- `lng` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Apiaries/ApiaryList.jsx** : line 127
... and 55 more.

## Established/Installed field variants

Hives commonly use `date_established`. Found `established_on`/`installed_at` that might be legacy; Calendar tolerates variants.

Occurrences: **30**

- `established_on` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Calendar.jsx** : line 242
- `established_on` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Calendar.jsx** : line 262
- `installed_at` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Calendar.jsx** : line 262
- `date_established` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Hives/EditHive.jsx** : line 25
- `date_established` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Hives/EditHive.jsx** : line 55
- `date_established` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Hives/EditHive.jsx** : line 56
- `date_established` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Hives/EditHive.jsx** : line 260
- `date_established` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Hives/EditHive.jsx** : line 261
- `date_established` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Hives/HiveList.jsx** : line 190
- `date_established` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Hives/HiveList.jsx** : line 192
- `date_established` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Hives/NewHive.jsx** : line 17
- `date_established` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Hives/NewHive.jsx** : line 107
- `date_established` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Hives/NewHive.jsx** : line 130
- `date_established` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Hives/NewHive.jsx** : line 218
- `date_established` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Hives/NewHive.jsx** : line 219
- `established_on` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Calendar.jsx** : line 242
- `established_on` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Calendar.jsx** : line 262
- `installed_at` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Calendar.jsx** : line 262
- `date_established` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Hives/EditHive.jsx** : line 26
- `date_established` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Hives/EditHive.jsx** : line 56
- `date_established` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Hives/EditHive.jsx** : line 56
- `date_established` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Hives/EditHive.jsx** : line 252
- `date_established` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Hives/EditHive.jsx** : line 253
- `date_established` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Hives/HiveList.jsx** : line 179
- `date_established` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Hives/HiveList.jsx** : line 181
... and 5 more.

## Archived/Created camelCase vs snake_case

Mixed styles found. Calendar handles both, but keep DB snake_case (`archived_at`, `created_at`).

Occurrences: **8**

- `archivedAt` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Calendar.jsx** : line 104
- `created_on` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Calendar.jsx** : line 242
- `created_on` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Calendar.jsx** : line 262
- `created_on` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Calendar.jsx** : line 324
- `archivedAt` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Calendar.jsx** : line 104
- `created_on` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Calendar.jsx** : line 242
- `created_on` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Calendar.jsx** : line 262
- `created_on` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Calendar.jsx** : line 324
## Route capitalization mismatches

React Router paths are case-sensitive. Prefer lowercase (`/apiaries`, `/hives`, `/inspections`).

Occurrences: **5**

- `"/Apiaries` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Apiaries/EditApiary.jsx** : line 405
- `"/Inspections` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Inspections/EditInspection.jsx** : line 661
- `"/Apiaries` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Apiaries/EditApiary.jsx** : line 403
- `"/Hives` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Hives/EditHive.jsx** : line 328
- `"/Inspections` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/EditInspection.jsx** : line 690
## Queen status scalar usage

Spots where `queen_status` appears without `.includes` could be scalar usage. Review if array is intended everywhere.

Occurrences: **24**

- `queen_status` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Inspections/EditInspection.jsx** : line 92
- `queen_status` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Inspections/EditInspection.jsx** : line 149
- `queen_status` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Inspections/EditInspection.jsx** : line 149
- `queen_status` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Inspections/EditInspection.jsx** : line 211
- `queen_status` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Inspections/EditInspection.jsx** : line 276
- `queen_status` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Inspections/EditInspection.jsx** : line 276
- `queen_status` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Inspections/EditInspection.jsx** : line 276
- `queen_status` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Inspections/InspectionList.jsx** : line 48
- `queen_status` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Inspections/InspectionList.jsx** : line 98
- `queen_status` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Inspections/NewInspection.jsx** : line 57
- `queen_status` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Inspections/NewInspection.jsx** : line 140
- `queen_status` — **MySite_backup_16.08.20205_@_20.23_-_needs_checking/MySite backup 16.08.20205 @ 20.23 - needs checking/src/pages/Inspections/NewInspection.jsx** : line 433
- `queen_status` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/EditInspection.jsx** : line 104
- `queen_status` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/EditInspection.jsx** : line 166
- `queen_status` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/EditInspection.jsx** : line 166
- `queen_status` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/EditInspection.jsx** : line 218
- `queen_status` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/EditInspection.jsx** : line 294
- `queen_status` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/EditInspection.jsx** : line 294
- `queen_status` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/EditInspection.jsx** : line 294
- `queen_status` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/InspectionList.jsx** : line 48
- `queen_status` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/InspectionList.jsx** : line 98
- `queen_status` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/NewInspection.jsx** : line 57
- `queen_status` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/NewInspection.jsx** : line 124
- `queen_status` — **Latest_Backup_16.08.2025_@_17.20/Latest Backup 16.08.2025 @ 17.20/src/pages/Inspections/NewInspection.jsx** : line 419
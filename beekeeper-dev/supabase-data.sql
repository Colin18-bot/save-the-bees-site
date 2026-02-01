--
-- PostgreSQL database dump
--

\restrict NNbW0aAShZAJxIfSN6gGB9XoMAHBAWJn582u4L6aRv07qfv14p7RKdSaqeV1Yln

-- Dumped from database version 17.4
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: apiaries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.apiaries (id, name, latitude, longitude, address, established_date, location_type, site_setting, notes, photo_url, is_default, archived_at, created_at, user_id, tz, photo_path) FROM stdin;
ae456154-94b2-4740-8416-484f30383f88	Chill Bay Apiary	51.3471927	-2.9778916	\N	2024-02-09	Coastal	Rooftop	\N	https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/apiaries/5b2ea5c7-71d7-466b-8d32-f6d0c9b50620/ae456154-94b2-4740-8416-484f30383f88/1764110673876-20220730_135831.jpg	t	\N	2025-11-25 22:44:33.804023+00	5b2ea5c7-71d7-466b-8d32-f6d0c9b50620	\N	apiaries/5b2ea5c7-71d7-466b-8d32-f6d0c9b50620/ae456154-94b2-4740-8416-484f30383f88/1764110673876-20220730_135831.jpg
85e26764-4968-4d38-9138-55050b9c97db	Home	56.18898279190419	-363.54083776474	\N	2026-01-15	Rural	Urban Garden	\N	\N	t	\N	2026-01-15 12:44:08.507826+00	bc61019a-f750-41ff-ba0a-1ab623b08160	\N	\N
bd8edbf6-e196-4683-9919-e333b3c6fb2e	Peterston Apiary	51.4870919534403	-3.33656823648198	\N	2025-12-01	Rural	Farmland	Access on private road via locked gate	\N	f	\N	2026-01-06 16:27:43.829557+00	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N	apiaries/3a7458bd-a324-4524-aeb0-b40bc3b66b61/bd8edbf6-e196-4683-9919-e333b3c6fb2e/1767716863042-20220724_144828.jpg
6d0a1ccb-b0e5-45c3-bf10-ab35af76051d	COV - Cats On Vacation	51.8039312333087	-2.89366364479065	\N	2018-11-17	Rural	\N	\N	\N	t	\N	2025-11-23 20:05:15.998552+00	a5011905-8d27-461d-8293-6a460708e8a2	\N	\N
a2b64b84-cb95-4efd-a08d-51f482aa9121	Cardiff Road Apiary	51.41249256336861	-3.23845839513524	\N	2026-01-31	Urban	Urban Garden	\N	\N	f	\N	2026-01-31 17:54:03.739095+00	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N	\N
c8738507-d567-41e6-8360-b4ccd4e69bbf	Che's Apiary 	11.618235978407862	104.91355419158937	\N	2025-12-12	\N	\N	\N	\N	f	\N	2025-12-12 02:58:51.775894+00	14ec67fc-da44-41c4-8a52-d3d848d8938e	\N	\N
\.


--
-- Data for Name: hives; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hives (id, apiary_id, name, hive_type, hive_type_other, date_established, status, notes, photo_url, nfc_uid, archived_at, created_at, user_id, photo_path) FROM stdin;
f29690ef-4662-441b-af8e-d61e07c16123	bd8edbf6-e196-4683-9919-e333b3c6fb2e	Hive #4	National	\N	2025-07-06	active	National cedar hive	https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/hives/f29690ef-4662-441b-af8e-d61e07c16123-1767720305098-Hive_#4.jpg	04:0b:2c:3a:4b:21:91	\N	2026-01-06 17:25:05.837696+00	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
1f6e918e-927f-473b-9953-97e850b1d16e	bd8edbf6-e196-4683-9919-e333b3c6fb2e	Hive #9	National	\N	2025-07-06	active	National cedar hive	https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/hives/1f6e918e-927f-473b-9953-97e850b1d16e-1767719517956-Hive_#9.jpg	\N	\N	2026-01-06 17:10:02.384175+00	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
340b1911-0e0e-47e5-b337-517df9ada8e7	a2b64b84-cb95-4efd-a08d-51f482aa9121	Hive #1	National	\N	2025-07-05	active	\N	\N	\N	\N	2026-01-31 17:54:55.48017+00	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
6fbd8bc8-328f-4b6f-9787-05741066af27	a2b64b84-cb95-4efd-a08d-51f482aa9121	Hive #3	\N	\N	2025-07-05	active	\N	\N	\N	\N	2026-01-31 17:56:00.696359+00	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
8f4d9b9b-390b-4ca4-9029-8659433d958f	bd8edbf6-e196-4683-9919-e333b3c6fb2e	Hive #13	National	\N	2025-07-06	active	National pine hive	https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/hives/8f4d9b9b-390b-4ca4-9029-8659433d958f-1767720104624-Hive_#13.jpg	\N	\N	2026-01-06 17:21:45.380422+00	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
a2470714-0a4d-45a9-b79c-ec26dfe338cf	6d0a1ccb-b0e5-45c3-bf10-ab35af76051d	1	\N	\N	2025-04-26	inactive	Bought in April, killed by Wasps by Sept	\N	\N	\N	2025-11-23 20:07:02.938353+00	a5011905-8d27-461d-8293-6a460708e8a2	\N
dce70c7b-d5bf-42d2-808e-3f3261b29c63	bd8edbf6-e196-4683-9919-e333b3c6fb2e	Hive #5	National	\N	2025-07-06	active	National pine hive	https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/hives/dce70c7b-d5bf-42d2-808e-3f3261b29c63-1767720431570-Hive_#5.jpg	04:27:65:aa:e1:21:91	\N	2026-01-06 17:27:12.288802+00	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
2a43890e-06b3-4309-860c-f38e4cfd0bd0	85e26764-4968-4d38-9138-55050b9c97db	H1	National	\N	2026-01-15	inactive	\N	\N	\N	\N	2026-01-15 12:44:53.56391+00	bc61019a-f750-41ff-ba0a-1ab623b08160	\N
6d1d45ea-fe1a-4d41-b51c-da8de771394b	bd8edbf6-e196-4683-9919-e333b3c6fb2e	Hive #8	National	\N	2025-07-06	active	National pine hive	https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/hives/6d1d45ea-fe1a-4d41-b51c-da8de771394b-1767720027452-Hive_#8.jpg	04:7e:69:aa:e1:21:90	\N	2026-01-06 17:15:46.57276+00	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
bcc2c0cd-62e0-47e6-9507-82ddd2ca1ac8	bd8edbf6-e196-4683-9919-e333b3c6fb2e	Hive #14	National	\N	2025-07-06	active	National cedar hive	https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/hives/bcc2c0cd-62e0-47e6-9507-82ddd2ca1ac8-1767717132041-1d74aa4e-7334-4d13-b4fd-3287a82ea685.jpg	\N	\N	2026-01-06 16:32:12.820343+00	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
c410983f-3229-4514-93b0-6cd34d25f604	bd8edbf6-e196-4683-9919-e333b3c6fb2e	Hive #11	National	\N	2025-07-06	active	National cedar hive	https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/hives/c410983f-3229-4514-93b0-6cd34d25f604-1767720204063-Hive_#11.jpg	\N	\N	2026-01-06 17:23:24.81512+00	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
ce288c64-e3c7-49b9-9cf0-2a4eecaa1aaf	a2b64b84-cb95-4efd-a08d-51f482aa9121	Hive #2	\N	\N	2025-07-05	active	\N	\N	\N	\N	2026-01-31 17:55:41.4688+00	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
c00e3009-2628-425d-881a-e20e997ff96e	ae456154-94b2-4740-8416-484f30383f88	Hive #1	National	\N	2025-11-25	active	Cedarwood hive with entrance reducer - second hand!	https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/hives/c00e3009-2628-425d-881a-e20e997ff96e-1764111370858-20210604_174140.jpg	\N	\N	2025-11-25 22:56:10.790488+00	5b2ea5c7-71d7-466b-8d32-f6d0c9b50620	\N
30ad644c-3bdb-440a-8afe-65d87f7fed7d	ae456154-94b2-4740-8416-484f30383f88	Hive #2	National	\N	2025-11-23	active	\N	https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/hives/30ad644c-3bdb-440a-8afe-65d87f7fed7d-1764111947724-10838339-3d4c-4ef8-a996-7f98945ab45f.jpg	\N	\N	2025-11-25 23:05:47.726537+00	5b2ea5c7-71d7-466b-8d32-f6d0c9b50620	\N
da28d370-5dc5-4e49-b013-520489ffa2a1	a2b64b84-cb95-4efd-a08d-51f482aa9121	Hive #4	National	\N	2025-07-05	active	\N	\N	\N	\N	2026-01-31 17:56:24.310843+00	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, user_id, occurred_at, category, description, amount, currency, apiary_id, vendor, invoice_no, receipt_url, hive_id, invoice_number, notes, created_at) FROM stdin;
a9fd562a-6149-439c-990f-928015142566	3a7458bd-a324-4524-aeb0-b40bc3b66b61	2021-06-06	Insurance	Cardiff, Vale and Valleys Beekeepers Association subscription incl. BDI basic cover (up to 3 colonies).	20.00	GBP	\N	Cardiff, Vale and Valleys Beekeepers Association (WBKA/BDI)	\N	\N	\N	76980/20210606/80.5.10194	Electronic receipt ref from membership certificate.	2026-01-01 23:19:12.034417+00
84f535c6-58e5-4067-8993-467e60a37578	3a7458bd-a324-4524-aeb0-b40bc3b66b61	2022-02-15	Insurance	Cardiff, Vale and Valleys Beekeepers Association subscription incl. BDI basic cover (up to 3 colonies).	20.00	GBP	\N	Cardiff, Vale and Valleys Beekeepers Association (WBKA/BDI)	\N	\N	\N	76980/20220215/80.5.10194	Electronic receipt ref from membership certificate.	2026-01-01 23:19:12.034417+00
8bd154e8-d122-4de6-963f-cd74b1b4ce8a	3a7458bd-a324-4524-aeb0-b40bc3b66b61	2023-01-08	Insurance	Association subscription + BDI additional colonies cover (3 additional colonies).	24.70	GBP	\N	Cardiff, Vale and Valleys Beekeepers Association (WBKA/BDI)	\N	\N	\N	76980/20230108/80.5.10194	Subscription £20.00 + Additional BDI £4.70.	2026-01-01 23:19:12.034417+00
ff21d913-e9e1-4b32-947f-a42cd3e38f41	3a7458bd-a324-4524-aeb0-b40bc3b66b61	2024-01-25	Insurance	Association subscription + BDI additional colonies cover (17 additional colonies).	29.50	GBP	\N	Cardiff, Vale and Valleys Beekeepers Association (WBKA/BDI)	\N	\N	\N	76980/20240125/80.5.10194	Subscription £20.00 + Additional BDI £9.50.	2026-01-01 23:19:12.034417+00
480909de-0fbc-4a25-9499-3bc4dfd4d5a9	3a7458bd-a324-4524-aeb0-b40bc3b66b61	2025-12-30	Transport	Shipping for jar order (C. Wynne Jones invoice IN061202).	8.95	GBP	\N	C. Wynne Jones	\N	\N	\N	IN061202	Shipping tax excl £7.46 + VAT £1.49 = £8.95	2026-01-01 23:19:12.034417+00
17abe37a-673f-4575-9dfa-b85d46386b1e	3a7458bd-a324-4524-aeb0-b40bc3b66b61	2026-01-07	Insurance	\N	32.75	GBP	\N	Cardiff Vale & Valleys Beekeepers Association	\N	\N	\N	10476	Annual membership and insurance for 11 to 15 colonies SKU: 364215376135191	2026-01-07 17:34:40.996796+00
\.


--
-- Data for Name: inspections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inspections (id, apiary_id, hive_id, nfc_uid, date, weather, colony_behavior, colony_behavior_other, environmental_signs, environmental_signs_other, hive_population, brood_pattern, food_stores, queen_status, queen_status_other, signs_disease, disease_types, disease_other, signs_pests, pest_types, pest_other, notes, photos, archived_at, created_at, weather_code, user_id, photo_paths) FROM stdin;
306a3a82-4e25-4b3c-a7fe-6d14fd9d32bf	bd8edbf6-e196-4683-9919-e333b3c6fb2e	1f6e918e-927f-473b-9953-97e850b1d16e	\N	2026-01-04	Light drizzle			\N					\N		f	\N	\N	f	\N	\N	External winter check only (no brood frames lifted). Hefted hive to assess stores; entrance cleared; straps/roof checked; ventilation maintained.	{https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/inspections/306a3a82-4e25-4b3c-a7fe-6d14fd9d32bf-1767810860195-Hive_#9_Heft.jpg}	\N	2026-01-07 17:53:42.421231+00	51	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
76276711-c986-4c20-8a38-9aa790ad69c1	bd8edbf6-e196-4683-9919-e333b3c6fb2e	f29690ef-4662-441b-af8e-d61e07c16123	\N	2026-01-04	Light drizzle			\N					\N		f	\N	\N	f	\N	\N	External winter check only (no brood frames lifted). Hefted hive to assess stores, heavy on stores; entrance cleared; straps/roof checked; ventilation maintained.	{https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/inspections/76276711-c986-4c20-8a38-9aa790ad69c1-1767810085823-Hive_#4_-_Heft_hive.jpg}	\N	2026-01-07 17:58:02.519536+00	51	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
77ffe5a8-6e9c-4259-85eb-94cec8624e11	bd8edbf6-e196-4683-9919-e333b3c6fb2e	c410983f-3229-4514-93b0-6cd34d25f604	\N	2026-01-04	Light drizzle			\N					\N		f	\N	\N	f	\N	\N	External winter check only (no brood frames lifted). Hefted hive to assess stores, very light; entrance cleared; straps/roof checked; ventilation maintained.	{https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/inspections/77ffe5a8-6e9c-4259-85eb-94cec8624e11-1767810486417-Hive_#11_Heft.jpg}	\N	2026-01-07 17:58:25.486391+00	51	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
5fe07ceb-6abe-4994-b651-d309ae4cac50	ae456154-94b2-4740-8416-484f30383f88	c00e3009-2628-425d-881a-e20e997ff96e	\N	2025-11-25	Overcast	Calm	\N	{Entering/exiting,"Bringing in pollen"}	\N	Low	Solid	Moderate	{Seen,"Uncapped brood","Capped brood",Eggs}	\N	t	{Varroa,Nosema}	\N	t	{Ants}	\N	Look up information about ant preventive measures	{https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/inspections/5fe07ceb-6abe-4994-b651-d309ae4cac50-1764111635016-20210730_153749.jpg,https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/inspections/5fe07ceb-6abe-4994-b651-d309ae4cac50-1764111637160-20210924_155418.jpg,https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/inspections/5fe07ceb-6abe-4994-b651-d309ae4cac50-1764111639261-20211015_124607.jpg}	\N	2025-11-25 23:00:34.986447+00	3	5b2ea5c7-71d7-466b-8d32-f6d0c9b50620	\N
6d431898-c98c-4b94-8e33-5c37a6e40e4d	bd8edbf6-e196-4683-9919-e333b3c6fb2e	8f4d9b9b-390b-4ca4-9029-8659433d958f	\N	2026-01-04	Light drizzle	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	\N	External winter check only (no brood frames lifted). Hefted hive to assess stores; entrance cleared; straps/roof checked; ventilation maintained.	\N	\N	2026-01-07 17:58:54.704973+00	51	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
330920d6-83fa-4071-a2c9-cd7c4306d90a	bd8edbf6-e196-4683-9919-e333b3c6fb2e	6d1d45ea-fe1a-4d41-b51c-da8de771394b	\N	2026-01-04	Light drizzle			\N					\N		f	\N	\N	f	\N	\N	External winter check only (no brood frames lifted). Hefted hive to assess stores; entrance cleared; straps/roof checked; ventilation maintained.	{https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/inspections/330920d6-83fa-4071-a2c9-cd7c4306d90a-1767811480855-Hive_#8_(2).jpg}	\N	2026-01-07 17:59:25.997545+00	51	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
ffe57cd8-8f77-46c7-8ce0-614cfc347caf	bd8edbf6-e196-4683-9919-e333b3c6fb2e	bcc2c0cd-62e0-47e6-9507-82ddd2ca1ac8	\N	2026-01-04	Light drizzle			\N					\N		f	\N	\N	f	\N	\N	External winter check only (no brood frames lifted). Hefted hive to assess stores, very light; entrance cleared; straps/roof checked; ventilation maintained.	{https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/inspections/ffe57cd8-8f77-46c7-8ce0-614cfc347caf-1767810007064-Hive_#14_-_Heft_hive.jpg}	\N	2026-01-07 18:00:10.581456+00	51	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
5d8e87b8-f3e3-4951-a367-8135a2c61134	bd8edbf6-e196-4683-9919-e333b3c6fb2e	dce70c7b-d5bf-42d2-808e-3f3261b29c63	\N	2026-01-04	Light drizzle			\N					\N		f	\N	\N	f	\N	\N	External winter check only (no brood frames lifted). Hefted hive to assess stores, heavy, lots of stores; entrance cleared; straps/roof checked; ventilation maintained.	{https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/inspections/5d8e87b8-f3e3-4951-a367-8135a2c61134-1767811207331-Hive_#5_Heft.jpg}	\N	2026-01-07 17:57:21.97257+00	51	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_items (id, user_id, sku, name, category, subcategory, unit, is_consumable, track_stock, condition, notes, created_at, nfc_uid, status, quantity, purchase_date, purchase_type, purchase_price, currency, supplier_name, invoice_number, apiary_id, hive_id, serial_number, warranty_expires) FROM stdin;
c1002030-ac5e-4cae-9310-0e8cd443e095	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-CH-2S-FAP	B.S National Western Cedar Hive with 2 Supers, Frames & Foundation - Would you like your hive assembled?* : No- Number of Supers : 2	Frames & Foundation	Foundation	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-05-30	Online	214.99	GBP	Simon the Beekeeper	NZSVVWKIW	\N	\N	\N	\N
ea7af3aa-1e56-4ea2-b971-eca3b2d1fdf2	3a7458bd-a324-4524-aeb0-b40bc3b66b61	PAC-SK	Stainless Steel Smoker and Starter Kit	Tools	General	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-05-30	Online	24.99	GBP	Simon the Beekeeper	NZSVVWKIW	\N	\N	\N	\N
d2c72987-3386-411f-8f98-87dd993cfd02	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F-50	Replacement 2L Rapid Feeder Cup	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-05-30	Online	1.49	GBP	Simon the Beekeeper	NZSVVWKIW	\N	\N	\N	\N
6e4e8069-055f-467f-b07c-fb3c3fd23a8b	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F-BF	Bottle Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-05-30	Online	1.49	GBP	Simon the Beekeeper	NZSVVWKIW	\N	\N	\N	\N
481cc08b-7ee0-45c2-889c-c35745457f20	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F-EF	Hive Entrance Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-05-30	Online	1.39	GBP	Simon the Beekeeper	NZSVVWKIW	\N	\N	\N	\N
77d70268-b1ad-4042-884d-886fcfd0e05c	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO25-2	2 x Stainless Steel Frame Rests	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-05-30	Online	9.99	GBP	Simon the Beekeeper	NZSVVWKIW	\N	\N	\N	\N
a497160d-e1e2-4ed1-be13-859d3cc40748	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-GV-XL	Buzz Work Wear Ventilated Gloves - Size : XL	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2021-05-30	Online	6.99	GBP	Simon the Beekeeper	NZSVVWKIW	\N	\N	\N	\N
075cd61c-39fe-4b14-9940-4e636c5cb26e	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-GV-4XS	Children's Buzz Work Wear Ventilated Gloves - Size : 4XS	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-05-30	Online	4.9	GBP	Simon the Beekeeper	NZSVVWKIW	\N	\N	\N	\N
292fca35-d6b2-45a1-b9ba-806d10dced23	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-CJ-CL	Children's Buzz Work Wear Cappuccino Fencing Jacket - Size : Children's L	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-05-30	Online	14.0	GBP	Simon the Beekeeper	NZSVVWKIW	\N	\N	\N	\N
869f7f31-53ae-4fee-8c14-4dc02a0e03d6	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-1	White Toggle Round Veil	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2021-05-30	Online	3.99	GBP	Simon the Beekeeper	NZSVVWKIW	\N	\N	\N	\N
0ddad8e5-4f11-4014-bcf9-1c868b6d712d	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F20-1	1lb Fondant Block	Consumables	Feed	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-05-30	Online	1.79	GBP	Simon the Beekeeper	NZSVVWKIW	\N	\N	\N	\N
46608bca-ecab-4e1c-baa6-1a4895c11a56	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F1-1	Candipolline Gold 0.5kg Pouch	Consumables	Feed	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-05-30	Online	1.99	GBP	Simon the Beekeeper	NZSVVWKIW	\N	\N	\N	\N
092c4b00-d601-49e1-b733-d8ca027a097c	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F-53-S	Api-Bioxal - Syringe? : Yes	Consumables	Treatments	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-05-30	Online	10.79	GBP	Simon the Beekeeper	NZSVVWKIW	\N	\N	\N	\N
1459e643-167a-41de-b0e5-cf5d14954212	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-PW-M	Buzz Work Wear Professional White Suit - Size : M- Choose your veil : Fencing	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-06-01	Online	49.99	GBP	Simon the Beekeeper	OHLTTPCHO	\N	\N	\N	\N
3d3520c7-f483-4c6d-b955-edc49385b0d6	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO99	Frame Cleaner	Frames & Foundation	Frames	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-06-01	Online	4.99	GBP	Simon the Beekeeper	OHLTTPCHO	\N	\N	\N	\N
4e3381fb-0ca4-4b00-922b-0fc759962af0	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO21	Plastic Queen Clip Catcher	Tools	General	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-06-01	Online	1.49	GBP	Simon the Beekeeper	OHLTTPCHO	\N	\N	\N	\N
efd8b1fd-3494-41ec-af21-18969c7692ba	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO6-1	Mouse Guard	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-06-01	Online	0.99	GBP	Simon the Beekeeper	OHLTTPCHO	\N	\N	\N	\N
77fe1431-3dee-425d-9e54-78213fdd52f5	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO1-W	Queen Marker Pen - Pen Colour : White	Tools	General	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-07-12	Online	2.75	GBP	Simon the Beekeeper	LOMDADLVN	\N	\N	\N	\N
12ec1e46-b415-40b3-a519-72d1f027bffc	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO27-RJ	J End Stainless Steel Half-Red Hive Tool	Tools	General	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-07-12	Online	2.99	GBP	Simon the Beekeeper	LOMDADLVN	\N	\N	\N	\N
cc309f13-f818-4cdb-a202-a36e0f5e0cac	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO67	Yellow Clear Plastic Wasp Trap	Tools	General	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	5.0	2021-07-12	Online	1.99	GBP	Simon the Beekeeper	LOMDADLVN	\N	\N	\N	\N
17817e02-c133-42d5-8f86-e8bae53d4ddd	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F-52	Multi Purpose 1L Miller Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-09-04	Online	1.99	GBP	Simon the Beekeeper	QVUHGAPPR	\N	\N	\N	\N
eb3f07ea-9b7d-48c8-bb5a-4f2d2fa1d6db	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F8	4L (1 gallon) Shallow Rapid Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-09-04	Online	7.99	GBP	Simon the Beekeeper	QVUHGAPPR	\N	\N	\N	\N
9a5606cb-6246-45a1-a78e-805a34cb6b80	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-24-1	Sliding Mouse Guard & Travel Gate	Packaging	Jars/Lids	piece	f	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2021-09-04	Online	2.99	GBP	Simon the Beekeeper	QVUHGAPPR	\N	\N	\N	\N
01f8ffa9-fe77-4348-a1d1-32f0202b3f7a	3a7458bd-a324-4524-aeb0-b40bc3b66b61	GIF-B-PEN	Ballpoint Black Pen	Other	\N	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-09-04	Online	0.5	GBP	Simon the Beekeeper	QVUHGAPPR	\N	\N	\N	\N
a1b139e2-edf8-4f8a-a04e-49a503a84a4c	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F3-1	Candipolline Gold: 1kg Pouch	Consumables	Feed	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-10-01	Online	3.69	GBP	Simon the Beekeeper	QMYYEYNPU	\N	\N	\N	\N
6c9539a8-ce81-40ff-bc04-8720bea9c482	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F51-1	ApiCandy Proteico: 1kg Pouch	Other	\N	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2021-10-01	Online	2.99	GBP	Simon the Beekeeper	QMYYEYNPU	\N	\N	\N	\N
02931094-644e-41fd-9760-f127bd629295	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-GL-2XL	Buzz Work Wear Latex Gloves - Size : 2XL	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-03-13	Online	6.99	GBP	Simon the Beekeeper	ATZCMHEDU	\N	\N	\N	\N
23a8e59d-d299-41b4-907a-f59855bbf26f	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-FAP-S11	BS SN4 Super Frame & Foundation Pack - Pack Size : 11	Frames & Foundation	Foundation	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	3.0	2022-03-13	Online	16.99	GBP	Simon the Beekeeper	ATZCMHEDU	\N	\N	\N	\N
f768e700-f59c-4f31-a109-1da1603a9707	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP6	B.S National Plastic Queen Excluder - 460mm² - Quantity : 1	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	3.0	2022-03-13	Online	3.0	GBP	Simon the Beekeeper	ATZCMHEDU	\N	\N	\N	\N
b0cf6f89-03d6-4d81-81f7-c02814202a9f	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO42-2	2 x Porter Bee Escapes	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-03-13	Online	0.65	GBP	Simon the Beekeeper	ATZCMHEDU	\N	\N	\N	\N
bb2d0d10-359f-455b-8b50-21822247c42c	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP22-2	Steel National Frame Runner	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	3.0	2022-03-13	Online	1.99	GBP	Simon the Beekeeper	ATZCMHEDU	\N	\N	\N	\N
d6d3e18f-53e0-40b6-ab5b-3f0b46f1c8b3	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO62-EV	Economy Varroa Oxalic Vaporiser	Consumables	Treatments	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-03-13	Online	29.99	GBP	Simon the Beekeeper	ATZCMHEDU	\N	\N	\N	\N
481d1072-cb2e-44fe-a363-0898aa9fd0b3	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F25-1	Nicotplast 2L/4pt Rapid Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	3.0	2022-03-13	Online	3.55	GBP	Simon the Beekeeper	ATZCMHEDU	\N	\N	\N	\N
838d2612-21d4-4b9c-b109-6d00c2c48189	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F31	Oxalic Acid Crystals	Consumables	Treatments	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-03-13	Online	6.49	GBP	Simon the Beekeeper	ATZCMHEDU	\N	\N	\N	\N
76103220-5fc1-422f-b983-1a52ba87af1a	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F21	1kg Fondant Blocks	Consumables	Feed	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-03-13	Online	2.2	GBP	Simon the Beekeeper	ATZCMHEDU	\N	\N	\N	\N
4ed5d970-99d4-455e-801e-b3d66f8b816a	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP1	B.S National Porter Bee Escape Crown Board - 460mm²	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2022-05-08	Online	6.99	GBP	Simon the Beekeeper	OOMTTLAWA	\N	\N	\N	\N
acdc3da9-3f27-4969-9cdb-5fcd3bf97831	3a7458bd-a324-4524-aeb0-b40bc3b66b61	BT-F1	*Sale* Candipolline Gold 0.5kg Pouch - Quantity : 1	Consumables	Feed	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	3.0	2022-05-08	Online	1.5	GBP	Simon the Beekeeper	OOMTTLAWA	\N	\N	\N	\N
e27facbe-6a73-4aef-a879-be2bef9c2a4d	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F44	12.5kg Fondant Block	Consumables	Feed	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-05-08	Online	12.99	GBP	Simon the Beekeeper	OOMTTLAWA	\N	\N	\N	\N
0678e90a-197c-407c-9bc1-b06de0c622bd	3a7458bd-a324-4524-aeb0-b40bc3b66b61	EXT4-20	Settling Tank with Double Stainless Strainer - Bucket Size : 20L	Honey Processing	Equipment	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-05-08	Online	19.99	GBP	Simon the Beekeeper	OOMTTLAWA	\N	\N	\N	\N
47b4d447-4e3c-4754-a3a3-2978a8ff7846	3a7458bd-a324-4524-aeb0-b40bc3b66b61	EXT8-20L	Metal Handle Honey Storage Bucket - Bucket Size : 20L	Honey Processing	Equipment	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2022-05-08	Online	5.25	GBP	Simon the Beekeeper	OOMTTLAWA	\N	\N	\N	\N
1e394615-2292-4669-8362-726ea009f3bf	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO66	LED Honey Refractometer	Honey Processing	Equipment	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-05-08	Online	25.99	GBP	Simon the Beekeeper	OOMTTLAWA	\N	\N	\N	\N
edc373a4-4fd8-4940-99b2-cd8f7ebe1a4e	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-FJT-L-L	Buzz Work Wear Fencing Jacket and Trouser - Jacket Size : L- Trouser Size : L	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-07-17	Online	26.99	GBP	Simon the Beekeeper	RTMQYTSSI	\N	\N	\N	\N
825eb5ed-5551-4f84-ac68-879fa1cd129b	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-TR-M	Buzz Work Wear Trousers - Size : M	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-07-25	Online	8.99	GBP	Simon the Beekeeper	DQAOZNXQP	\N	\N	\N	\N
69ec08fe-901b-49ff-8950-386e4855ab3a	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F25-1	Nicotplast 2L/4pt Rapid Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	3.0	2022-08-25	Online	3.55	GBP	Simon the Beekeeper	AVUTFWTZL	\N	\N	\N	\N
7fc5b221-3c19-47b5-9e25-c7aeb3861764	3a7458bd-a324-4524-aeb0-b40bc3b66b61	PAC2-G	Queen Marking Set - Pen Colour : Green	Other	\N	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-08-25	Online	5.49	GBP	Simon the Beekeeper	AVUTFWTZL	\N	\N	\N	\N
3271a421-118c-4a46-b8b4-ffee7731923e	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP22-2	Steel National Frame Runner	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2022-08-25	Online	1.99	GBP	Simon the Beekeeper	AVUTFWTZL	\N	\N	\N	\N
c2407333-c6f8-49d6-bb06-edf9d6351cc1	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F-53-N	Api-Bioxal - Syringe? : No	Consumables	Treatments	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-08-25	Online	9.69	GBP	Simon the Beekeeper	AVUTFWTZL	\N	\N	\N	\N
925b98a5-b98b-44bc-94bf-79c771914264	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-PNMF	Maisemore National 6 Frame Poly Nuc With Miller Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2022-08-25	Online	57.99	GBP	Simon the Beekeeper	AVUTFWTZL	\N	\N	\N	\N
a7944c46-7918-4fdb-baa2-d28e0f28f3e0	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP36-N-1	B.S National Varroa Mesh	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2022-08-28	Online	6.99	GBP	Simon the Beekeeper	RIZAQCAYS	\N	\N	\N	\N
7f1bc4d2-2057-45ca-bacf-f84cab863aa2	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-EH-2S	National Value Wooden Hive With 2 Supers	Other	\N	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2022-11-12	Online	93.0	GBP	Simon the Beekeeper	XNGLNEDJT	\N	\N	\N	\N
ef295d0f-5209-48d5-8f02-4f82b7eab97b	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-CHFS-K-M	Buzz Basic Fencing Veil Suit - Size : M- Colour : Khaki	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2022-11-12	Online	1.0	GBP	Simon the Beekeeper	XNGLNEDJT	\N	\N	\N	\N
26980467-6681-4ef2-b17d-bf99ad55e68d	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO19	Yellow Queen Needle Isolator Cage	Tools	General	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2022-11-12	Online	0.99	GBP	Simon the Beekeeper	XNGLNEDJT	\N	\N	\N	\N
bcb0f01d-4f3f-4a5a-8e92-b3ff9bca9b85	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-49-11	BS SN4 Hoffman Super Frames & Pins - Pack Size : 11	Frames & Foundation	Frames	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	4.0	2022-11-12	Online	7.79	GBP	Simon the Beekeeper	XNGLNEDJT	\N	\N	\N	\N
65ae2222-2430-463e-886f-7cc955c59b65	3a7458bd-a324-4524-aeb0-b40bc3b66b61	BC-TO39	Uncapping Knife - Serrated Edge - Ex Display	Honey Processing	Equipment	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-11-12	Online	3.29	GBP	Simon the Beekeeper	XNGLNEDJT	\N	\N	\N	\N
990142cf-14f8-4641-a3dd-f3af62a6d23d	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-50-11	BS DN4 Hoffman Brood Frames & Pins - Pack Size : 11	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2022-11-12	Online	7.79	GBP	Simon the Beekeeper	XNGLNEDJT	\N	\N	\N	\N
f1daf954-9c65-4688-88c2-3b9ac6c3c21a	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F25-1	Nicotplast 2L/4pt Rapid Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2022-11-12	Online	3.55	GBP	Simon the Beekeeper	XNGLNEDJT	\N	\N	\N	\N
2c3399f8-37ea-4230-b313-9ea2d052a82f	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-24-1	Sliding Mouse Guard & Travel Gate	Packaging	Jars/Lids	piece	f	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2022-11-12	Online	2.99	GBP	Simon the Beekeeper	XNGLNEDJT	\N	\N	\N	\N
7712507f-91eb-4a6d-85ab-9bca852288ad	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP22-2	Steel National Frame Runner	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2022-11-12	Online	1.99	GBP	Simon the Beekeeper	XNGLNEDJT	\N	\N	\N	\N
20573113-4064-4496-a2de-dbc29b89f416	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-MHA-B	Mating Hive with Accessories - Pen Colour : Blue	Other	\N	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-11-12	Online	13.99	GBP	Simon the Beekeeper	XNGLNEDJT	\N	\N	\N	\N
ba9ede39-f0c1-4125-b8d0-34d3a8e583bf	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO-SW	Swarm Lure / Attractant Wipe	Tools	General	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2022-11-12	Online	1.49	GBP	Simon the Beekeeper	XNGLNEDJT	\N	\N	\N	\N
639f8b11-d53f-48f4-b787-7540a80bcc93	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO23-12	12 x White Queen Cages	Other	\N	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-11-12	Online	3.99	GBP	Simon the Beekeeper	XNGLNEDJT	\N	\N	\N	\N
a3ed567e-a5b5-4443-99fb-ffd31301518f	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F25-1	Nicotplast 2L/4pt Rapid Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	4.0	2022-11-30	Online	3.55	GBP	Simon the Beekeeper	ZOXAXLWLC	\N	\N	\N	\N
a0ff24af-93c6-4404-a024-a9d7bd23d1e8	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-24-1	Sliding Mouse Guard & Travel Gate	Packaging	Jars/Lids	piece	f	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	4.0	2022-11-30	Online	2.99	GBP	Simon the Beekeeper	ZOXAXLWLC	\N	\N	\N	\N
99bd7473-6beb-4a06-9a26-daa74cb07dbe	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-PMH	Poly Mating Hive	Other	\N	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	4.0	2022-11-30	Online	9.99	GBP	Simon the Beekeeper	ZOXAXLWLC	\N	\N	\N	\N
3d44b716-880c-4b85-90dc-4b89d823d8e5	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO42-2	2 x Porter Bee Escapes	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	5.0	2022-11-30	Online	0.65	GBP	Simon the Beekeeper	ZOXAXLWLC	\N	\N	\N	\N
5fb6ac42-202f-4ecc-839f-8465417e6233	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-GW-M	Buzz Work Wear White Leather Soft Hide Gloves - Size : M	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2022-11-30	Online	5.99	GBP	Simon the Beekeeper	ZOXAXLWLC	\N	\N	\N	\N
140c6be4-1eec-4195-871d-c62830122068	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-4	Buzz Work Wear Suit Fencing Veil	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-11-30	Online	7.99	GBP	Simon the Beekeeper	ZOXAXLWLC	\N	\N	\N	\N
578a4141-e42a-47ef-a008-9bf83b48300a	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP31-1	Adjustable Hive Fastener	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2022-11-30	Online	2.49	GBP	Simon the Beekeeper	ZOXAXLWLC	\N	\N	\N	\N
bcc8784d-9dce-4f39-93bb-a68300736c48	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F44	12.5kg Fondant Block	Consumables	Feed	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2023-01-14	Online	10.8	GBP	Simon the Beekeeper	LBMZMQVBN	\N	\N	\N	\N
e2faa407-384c-4ad1-b62b-6dd39983f2c3	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F-47	1L Mini Contact Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	8.0	2023-01-14	Online	1.0	GBP	Simon the Beekeeper	LBMZMQVBN	\N	\N	\N	\N
3665555f-1932-43bf-a01c-99b70a758b18	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F12	2L Contact Bucket Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	10.0	2023-01-14	Online	1.0	GBP	Simon the Beekeeper	LBMZMQVBN	\N	\N	\N	\N
cc4e3ae2-70d4-4113-9ef3-0862232da17a	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F34	4.5L Contact Bucket Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	5.0	2023-01-14	Online	1.0	GBP	Simon the Beekeeper	LBMZMQVBN	\N	\N	\N	\N
4b90a41f-df59-4747-b901-b883c171bac7	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F13	National Wooden Brood Frame Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2023-01-14	Online	3.5	GBP	Simon the Beekeeper	LBMZMQVBN	\N	\N	\N	\N
7604601e-2c9d-437e-94b3-2d5a441dda28	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO45	Grey Queen Marker Cage	Tools	General	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2023-01-14	Online	0.5	GBP	Simon the Beekeeper	LBMZMQVBN	\N	\N	\N	\N
bcf23d78-42a6-4ed6-a756-68e4bde2ad97	3a7458bd-a324-4524-aeb0-b40bc3b66b61	PAC-QC-110	Nicotplast Brown Cell Cups - Quantity : 110	Other	\N	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2023-01-14	Online	3.15	GBP	Simon the Beekeeper	LBMZMQVBN	\N	\N	\N	\N
974006f2-3044-4dd4-8ff5-932b73409360	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-55	4mm Correx Sheets - 50cm²	Other	\N	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	10.0	2023-01-14	Online	0.5	GBP	Simon the Beekeeper	CWGIGLLDO	\N	\N	\N	\N
9a6f8a8f-f115-4937-902d-17104b84f91c	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-10	Arm Protectors/Gauntlets	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2023-01-14	Online	1.5	GBP	Simon the Beekeeper	CWGIGLLDO	\N	\N	\N	\N
14321062-5d80-40f0-a2d0-fe7989a20162	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-GR-G-M	Rubber Gloves - Glove Size : M- Colour : Green	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2023-01-14	Online	0.5	GBP	Simon the Beekeeper	CWGIGLLDO	\N	\N	\N	\N
bbd63bdb-2618-4827-a4b0-ed0c9478ac30	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-CHFS-W-M	White Buzz Basic Fencing Veil Suit - Size : M	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	3.0	2023-01-14	Online	1.0	GBP	Simon the Beekeeper	CWGIGLLDO	\N	\N	\N	\N
6a8a6ad2-a6b9-4eec-a2d7-fa225c589512	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-CHFS-W-CL	White Buzz Basic Fencing Veil Suit - Size : Children's L	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2023-01-14	Online	1.0	GBP	Simon the Beekeeper	CWGIGLLDO	\N	\N	\N	\N
2f735948-7d0a-4ff1-af0b-e14c65ff9793	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-CJ-M	Buzz Work Wear Cappuccino Fencing Jacket - Size : M	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2023-01-14	Online	8.0	GBP	Simon the Beekeeper	CWGIGLLDO	\N	\N	\N	\N
4441b69c-8a86-4fa0-8992-bb3b5bcb48aa	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-TR-M	Buzz Work Wear Trousers - Size : M	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2023-01-14	Online	4.0	GBP	Simon the Beekeeper	CWGIGLLDO	\N	\N	\N	\N
e0ca7fbf-9513-4f99-992e-e35fd1956269	3a7458bd-a324-4524-aeb0-b40bc3b66b61	EXT7	Honey Gate / Valve	Honey Processing	Equipment	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2023-01-14	Online	1.0	GBP	Simon the Beekeeper	CWGIGLLDO	\N	\N	\N	\N
e3a05bb5-9a7c-48ba-8a7b-7313fb2b3470	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO23-12	12 x White Queen Cages	Other	\N	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	3.0	2023-01-14	Online	0.5	GBP	Simon the Beekeeper	CWGIGLLDO	\N	\N	\N	\N
45f597a5-f2c7-4549-b09d-d50b84a79a1f	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-PNMF	Maisemore National 6 Frame Poly Nuc With Miller Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2023-02-05	Online	52.19	GBP	Simon the Beekeeper	UVYZRVJUZ	\N	\N	\N	\N
57a8a9ff-48d2-4a16-b18b-44061b6d0d81	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-PMH	Poly Mating Hive	Other	\N	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	4.0	2023-02-05	Online	6.0	GBP	Simon the Beekeeper	UVYZRVJUZ	\N	\N	\N	\N
7494e0f4-a756-4cc5-8937-06aca01a5a45	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP22-2	Steel National Frame Runner	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	10.0	2023-02-05	Online	1.0	GBP	Simon the Beekeeper	UVYZRVJUZ	\N	\N	\N	\N
51e35a76-d093-4122-a11d-404bcfd5b065	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F44	12.5kg Fondant Block	Consumables	Feed	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2023-12-06	Online	24.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
191d2d1e-05c1-4873-a023-2ffa497532c6	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO42-2	2 x Porter Bee Escapes	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	4.0	2023-12-29	Online	0.79	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
a8610d53-d3f6-46f7-9547-4c315de654d1	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP1	B.S National Porter Bee Escape Crown Board - 460mm²	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2023-12-29	Online	7.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
2a2403dc-3def-46b7-963e-01378bff8e0c	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP6	B.S National Plastic Queen Excluder - 460mm² - 1	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2023-12-29	Online	3.74	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
edca6c9a-5a57-4ca8-a159-079f37584d37	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F25-1	Nicotplast 2L/4pt Rapid Feeder	Hive Equipment	Feeding	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2023-12-29	Online	3.79	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
438fca73-e90f-43b8-bd1e-dc7b651f61cc	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N	Apistan (10 Pack)	Consumables	Treatments	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2023-12-29	Online	21.49	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
83934670-b934-4221-ac15-390eddaee1eb	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-DF-55	BS Brood Wired Foundation Sheets - 55	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2023-12-29	Online	66.5	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
1444a282-a496-4ace-b12d-7a6eae03144f	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-DF-11	BS Brood Wired Foundation Sheets - 11	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2023-12-29	Online	13.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
e7254204-7307-4d9a-bf36-7351b9121733	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-SF-110	BS Super Wired Foundation Sheets - 110	Frames & Foundation	Foundation	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2023-12-29	Online	79.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
932b8078-e792-4f80-9e13-1e4f5777133c	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP18	Economy Hive Strap	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	10.0	2024-05-26	Online	1.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
502231e4-a37d-4586-866f-9dbb3eb38be7	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-WH-R	B.S National Premium Wooden Hive Roof	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2024-05-26	Online	34.0	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
4ef5211b-5375-4cab-8a57-08488777b71f	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-31-1	National Brood Wooden Dummy Board - 1	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	3.0	2024-05-26	Online	3.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
5ceb6ae6-5d5a-4bdb-8db2-c1f879b64bf9	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-30-1	National Super Wooden Dummy Board - 1	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	3.0	2024-05-26	Online	3.49	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
c82ae5fe-4eef-4dba-bfbf-424e8cdc107f	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N	Premium Varroa Oxalic Vaporiser	Consumables	Treatments	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2024-06-25	Online	59.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
97ae21bf-2d64-4179-9003-7f57e172ddbb	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-WH-BBF	National Premium Wooden Brood - No	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2024-06-25	Online	27.0	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
3d6b071b-522b-49dc-9f2e-ba842641f130	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N	Apistan (10 Pack)	Consumables	Treatments	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2024-06-25	Online	21.49	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
6f432827-c360-48ac-a8f0-2065db93bed1	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F-53-N	Api-Bioxal - No	Consumables	Treatments	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2024-08-12	Online	14.1	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
f79d0ebc-be3a-4941-b659-866af6c8bddb	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO21-M	Metal Queen Clip Catcher	Tools	General	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2024-09-29	Online	2.49	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
7827fc2c-d21f-47f3-bd4f-07068f24dace	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F44	12.5kg Fondant Block	Consumables	Feed	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	3.0	2024-09-29	Online	24.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
5b96f0c7-2599-4f4a-8a9e-b7207711c5bb	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F3-1	Candipolline Gold: 1kg Pouch	Consumables	Feed	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2024-09-29	Online	4.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
36576097-a123-44fd-8bb7-93fe6d888b09	3a7458bd-a324-4524-aeb0-b40bc3b66b61	EXT7	Honey Gate / Valve	Honey Processing	Equipment	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2025-03-03	Online	2.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
e7f7cb8c-38e5-44f2-931f-d9c3581c0d07	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F3-1	Candipolline Gold: 1kg Pouch	Consumables	Feed	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	3.0	2025-03-03	Online	4.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
281f19f0-33c8-43ba-8101-0b17762344cf	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-GW-M	Buzz Work Wear White Leather Soft Hide Gloves - M	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2025-03-03	Online	8.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
5e809c68-e6d8-4567-827d-6092e5eb9adb	3a7458bd-a324-4524-aeb0-b40bc3b66b61	EXT8-20L	Plastic Handle Honey Storage Bucket - 20L	Honey Processing	Equipment	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2025-08-14	Online	10.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
547b13a3-475f-46df-9eac-a5ffbe4bd0c9	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N	Honey Bucket Rest	Honey Processing	Equipment	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2025-08-14	Online	4.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
549246c1-badd-4bbb-864a-171cc6a37240	3a7458bd-a324-4524-aeb0-b40bc3b66b61	EXT7	Honey Gate / Valve	Honey Processing	Equipment	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2025-08-14	Online	2.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
2be9a249-5fda-4b9b-aa8b-f18d4624c9a0	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N	Apistan (10 Pack) EXP:03/2027	Consumables	Treatments	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	3.0	2025-08-14	Online	21.49	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
0eb0d3d1-bc51-4464-a361-806c4c886091	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-GW-M	Buzz Work Wear White Leather Soft Hide Gloves - M	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2025-12-01	Online	8.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
33db0ad3-2bfd-4c23-b284-e031e6fb6b22	3a7458bd-a324-4524-aeb0-b40bc3b66b61	EXT7	Honey Gate / Valve	Honey Processing	Equipment	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2025-12-01	Online	2.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
38afa844-b874-483a-b59a-b87a50ef16c4	3a7458bd-a324-4524-aeb0-b40bc3b66b61	EXT17	Honey Settling Tank with Valve - 15L	Honey Processing	Equipment	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2025-12-01	Online	11.49	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
a6765e29-08dc-47f1-8696-2267edf1b7d8	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO27-RJ	Personalised Laser Engraved Mini Hive Tool Engraving: HiveTag	Tools	General	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2026-01-01	Online	6.49	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
ba313592-7445-4f74-abf1-6f5f3dbeab34	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N	Apipasta Vitamins 10 x 1kg (10kg)	Consumables	Feed	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2026-01-01	Online	21.49	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
2154fe8b-0822-42c3-9aaf-14ef45e22bc1	3a7458bd-a324-4524-aeb0-b40bc3b66b61	CL-GW-M	Buzz Work Wear White Leather Soft Hide Gloves - M	PPE	Clothing	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2026-01-01	Online	8.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
2e574469-83bf-4591-9b92-ee55266a6e43	3a7458bd-a324-4524-aeb0-b40bc3b66b61	F30-12	12 x 1kg Simon The Beekeeper Fondant	Consumables	Feed	piece	t	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2026-01-01	Online	21.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
945dddab-f777-4a74-b277-a3ff67600b54	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO18	White Queen Needle Isolator Cage	Tools	General	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2026-01-01	Online	2.49	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
d8297976-71a6-4d69-9edd-7947315647d9	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO45	Yellow Queen Marker Cage	Tools	General	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	2.0	2026-01-01	Online	1.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
e5fdc557-ec08-425e-9e35-fe71c79798c9	3a7458bd-a324-4524-aeb0-b40bc3b66b61	TO44	White Queen Marker Cage	Tools	General	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2026-01-01	Online	2.49	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
904c8f6c-14e7-42de-bad6-c9e78bf3747c	3a7458bd-a324-4524-aeb0-b40bc3b66b61	HP-50-11	BS DN4 Hoffman Brood Frames & Pins - 11	Hive Equipment	Parts	piece	f	f	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	3.0	2026-01-01	Online	12.99	GBP	Simon the Beekeeper	\N	\N	\N	\N	\N
37d4b0bf-8edb-437f-988c-88fac2d51034	3a7458bd-a324-4524-aeb0-b40bc3b66b61	8ROUNDL	228ml Round Jars (63mm Neck) (96) - Include Lids? Yes - Lid Colour: Gold	Packaging	Jars/Lids	piece	f	t	\N	\N	2026-01-01 23:11:53.307355+00	\N	\N	1.0	2025-12-30	Online	37.47	GBP	C. Wynne Jones	IN061202	\N	\N	\N	\N
\.


--
-- Data for Name: inventory_item_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_item_assignments (id, owner_id, item_id, level, apiary_id, hive_id, qty_allocated, unit, starts_at, ends_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: location_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.location_types (id, name) FROM stdin;
4e90a695-d750-4cd1-8370-4bad720d7f76	Rural
96dff294-8656-486f-bf47-635d64db98fd	Urban
bb860493-991c-4310-b8fa-26647d678f94	Suburban
c69dbc05-7c22-41b3-b9d7-9367184ac54a	Industrial
d6c73485-e609-406c-b227-1ab0e80ade6c	Coastal
\.


--
-- Data for Name: logbook; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.logbook (id, user_id, apiary_id, hive_id, inspection_id, entry, all_hives, date, photo_url, archived_at, created_at, updated_at, fed_what, fed_amount, mite_method, disease, product_used, dosage, breed, breed_other, source, source_other, marking, marking_other, details, log_type, photo_path) FROM stdin;
a157b488-52a8-4b51-9aa6-96d899ed0f80	5b2ea5c7-71d7-466b-8d32-f6d0c9b50620	ae456154-94b2-4740-8416-484f30383f88	c00e3009-2628-425d-881a-e20e997ff96e	5fe07ceb-6abe-4994-b651-d309ae4cac50	Fed sugar water 2:1	f	2025-11-25	\N	\N	2025-11-25 23:03:12.772149+00	2025-11-25 23:08:47.380949+00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Fed Bees	\N
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (user_id, email, display_name, avatar_url, created_at, updated_at, subscription_level, timezone, locale, default_apiary_id, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end) FROM stdin;
5b2ea5c7-71d7-466b-8d32-f6d0c9b50620	lysha_71@msn.com	Booboo	https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/avatar/5b2ea5c7-71d7-466b-8d32-f6d0c9b50620/1764111185046-honeybee-kit.png?t=1764111187024	2025-11-25 22:35:05.213974+00	2025-11-25 23:08:37.697153+00	free	\N	\N	ae456154-94b2-4740-8416-484f30383f88	\N	\N	\N	\N
a5011905-8d27-461d-8293-6a460708e8a2	wizzo67@hotmail.co.uk	ATB - Andy The Beeman	\N	2025-11-23 19:57:49.449619+00	2025-11-23 20:09:53.451077+00	free	\N	\N	6d0a1ccb-b0e5-45c3-bf10-ab35af76051d	cus_TTgpBUJHBBfeRx	\N	\N	\N
bc61019a-f750-41ff-ba0a-1ab623b08160	dsmayne@yahoo.co.uk	DelBee	\N	2026-01-15 12:07:31.497031+00	2026-01-15 12:50:49.260504+00	free	\N	\N	85e26764-4968-4d38-9138-55050b9c97db	\N	\N	\N	\N
a87b4f6b-d138-4284-96fd-75e543892d16	karen.lim66@icloud.com	\N	\N	2026-01-25 06:08:45.994703+00	2026-01-25 06:08:45.478+00	free	\N	\N	\N	\N	\N	\N	\N
5297aca8-0642-4a04-9486-a6471d7f9095	cchorley19@gmail.com	\N	\N	2026-01-31 13:42:28.492921+00	2026-01-31 14:09:56.056933+00	free	\N	\N	\N	\N	\N	\N	\N
3a7458bd-a324-4524-aeb0-b40bc3b66b61	chorleyc@hotmail.co.uk	Colin the Beeman	https://uihngfpmoasnofyrvpmw.supabase.co/storage/v1/object/public/photos/avatar/3a7458bd-a324-4524-aeb0-b40bc3b66b61/1769346279802-beekeeper.jpg?t=1769346281087	2025-11-20 21:12:11.568564+00	2026-01-31 17:39:05.214969+00	premium	\N	\N	\N	cus_TSaSvJ8nLKSLuQ	sub_1SWFnB0qcS6XWpa2dALiZKYs	active	\N
\.


--
-- Data for Name: sales_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_orders (id, user_id, order_no, sold_at, channel, customer_name, currency, notes, invoice_number) FROM stdin;
dffaf3a9-8a35-462d-9055-985fc7b77499	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N	2022-08-04 00:00:00+00	Direct	Various	GBP	\N	\N
ccb0d74b-d413-444a-b8a4-ce865d9d2bbc	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N	2023-08-01 00:00:00+00	Direct	Various	GBP	\N	\N
e4a632fc-dcef-4537-ba59-254f7da4238f	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N	2024-08-01 00:00:00+00	Direct	Various	GBP	\N	\N
8118ace8-4241-4135-840d-4cf77f4a8298	3a7458bd-a324-4524-aeb0-b40bc3b66b61	\N	2025-12-01 00:00:00+00	Direct	Various	GBP	\N	\N
\.


--
-- Data for Name: sales_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_lines (id, user_id, order_id, packaging_id, product_name, qty, unit_price, discount, tax_rate, cogs_per_unit_cached, product_type, unit) FROM stdin;
4f2a7e2e-c984-4cb5-90b5-ac043383f5a0	3a7458bd-a324-4524-aeb0-b40bc3b66b61	dffaf3a9-8a35-462d-9055-985fc7b77499	\N	Marlos Welsh Honey	10	5.00	0.00	0.00	0.0000	Honey	jar
e63a9c30-2198-48e8-8b62-652b1a0eaca9	3a7458bd-a324-4524-aeb0-b40bc3b66b61	ccb0d74b-d413-444a-b8a4-ce865d9d2bbc	\N	Marlos Welsh Honey	62	5.00	0.00	0.00	0.0000	Honey	jar
5618cbbd-9e7c-4321-9d88-448d850e7e94	3a7458bd-a324-4524-aeb0-b40bc3b66b61	e4a632fc-dcef-4537-ba59-254f7da4238f	\N	Marlos Welsh Honey	250	5.50	0.00	0.00	0.0000	Honey	jar
88530314-e5d3-4e5e-ba81-639b60408db5	3a7458bd-a324-4524-aeb0-b40bc3b66b61	8118ace8-4241-4135-840d-4cf77f4a8298	\N	Marlos Welsh Honey	26	5.50	0.00	0.00	0.0000	Honey	unit
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (id, name) FROM stdin;
d67c227b-3972-4731-8b9e-2fa9e8b3440f	Heathland
0f2a0cf0-290c-4c50-a28a-daa1597bad97	Mountainous
5fb3bc79-8aed-48ee-bcc4-a14a853ada78	Forest
917197e5-389c-449d-a7f7-660cc9177102	Farmland
92607803-eb3c-436b-a1be-c5f2713d1b8e	Meadow
a9edc389-03f9-4336-9d2d-d3b7af3c56e4	Moorland
cac878e7-fa24-48b9-8536-aa206fa3d8e1	Orchard
e6f982b5-6a18-4ad3-b986-437d4a35f1f9	Wetland
cd783dd1-6190-458b-b596-315bbc555894	School Grounds
6b1459fb-c702-40d9-8a26-ed71bb9be1f0	Cemetery
cd555a8b-21b2-45c3-9eae-867ea077b3ec	Urban Garden
715b32d6-029d-4cad-93a9-750fcd7a31d9	Allotment
a5e13ec4-e419-4086-bc18-8377f99e43da	Rooftop
\.


--
-- Data for Name: todos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.todos (id, user_id, title, due_date, apiary_id, hive_id, status, notes, created_at, updated_at, hive_name, archived_at, completed_at) FROM stdin;
87143b0c-25d3-4b09-9264-4044b859567f	3a7458bd-a324-4524-aeb0-b40bc3b66b61	Treatment	2026-01-04	bd8edbf6-e196-4683-9919-e333b3c6fb2e	\N	completed	Api-Bioxal oxalic based VMA approved varroa treatment using vaporiser.	2026-01-07 17:43:39.519779+00	2026-01-07 17:50:37.276957+00	ALL	\N	2026-01-07 17:50:37.276957+00
bf9dde64-1dcc-4ee1-8611-0296cee65b1d	5b2ea5c7-71d7-466b-8d32-f6d0c9b50620	Requeen	2025-12-02	ae456154-94b2-4740-8416-484f30383f88	c00e3009-2628-425d-881a-e20e997ff96e	pending	Introduce queen	2025-11-25 23:04:28.376748+00	2025-12-31 17:31:31.516936+00	Hive #1	\N	\N
556b2dac-8974-437a-9a22-dff26b587c5f	3a7458bd-a324-4524-aeb0-b40bc3b66b61	Treatment	2025-08-31	bd8edbf6-e196-4683-9919-e333b3c6fb2e	\N	completed	Treated with Apistan varroa control strips	2026-01-07 17:46:48.957647+00	2026-01-07 17:50:33.958532+00	ALL	\N	2026-01-07 17:50:33.958532+00
7b6db1ee-9d05-4ff2-aaf9-4a1c4a0caaf2	3a7458bd-a324-4524-aeb0-b40bc3b66b61	Treatment	2025-10-08	bd8edbf6-e196-4683-9919-e333b3c6fb2e	\N	completed	Removed Apistan varroa control strips	2026-01-07 17:49:03.549855+00	2026-01-07 17:50:35.484162+00	ALL	\N	2026-01-07 17:50:35.484162+00
a6c10b89-b65d-443d-bc74-371ed411145d	3a7458bd-a324-4524-aeb0-b40bc3b66b61	Feed Bees	2026-01-04	bd8edbf6-e196-4683-9919-e333b3c6fb2e	\N	completed	Fed 1Kg of bee candy fondant and 1Kg Apipasta Vitamins – Fortified Fondant for Colony Strength and Vitality	2026-01-07 17:42:12.238594+00	2026-01-07 17:50:38.57627+00	ALL	\N	2026-01-07 17:50:38.57627+00
\.


--
-- PostgreSQL database dump complete
--

\unrestrict NNbW0aAShZAJxIfSN6gGB9XoMAHBAWJn582u4L6aRv07qfv14p7RKdSaqeV1Yln


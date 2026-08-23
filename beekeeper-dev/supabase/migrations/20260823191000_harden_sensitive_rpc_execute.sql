-- ============================================================
-- HIVETAG
-- HARDEN SENSITIVE RPC EXECUTE PERMISSIONS
--
-- Captures the permanent permission changes already tested in
-- STAGING.
--
-- Browser/client execution is removed.
-- Service-role execution is retained.
-- ============================================================


-- ------------------------------------------------------------
-- send_due_task_emails(integer)
-- ------------------------------------------------------------

REVOKE EXECUTE
ON FUNCTION public.send_due_task_emails(integer)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION public.send_due_task_emails(integer)
TO service_role;


-- ------------------------------------------------------------
-- enqueue_due_task_emails_dry_run()
-- ------------------------------------------------------------

REVOKE EXECUTE
ON FUNCTION public.enqueue_due_task_emails_dry_run()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION public.enqueue_due_task_emails_dry_run()
TO service_role;


-- ------------------------------------------------------------
-- delete_apiary_with_lifecycle_cleanup(uuid, uuid)
-- ------------------------------------------------------------

REVOKE EXECUTE
ON FUNCTION public.delete_apiary_with_lifecycle_cleanup(uuid, uuid)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION public.delete_apiary_with_lifecycle_cleanup(uuid, uuid)
TO service_role;


-- ------------------------------------------------------------
-- delete_inspection_with_linked_cleanup(uuid, uuid)
-- ------------------------------------------------------------

REVOKE EXECUTE
ON FUNCTION public.delete_inspection_with_linked_cleanup(uuid, uuid)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION public.delete_inspection_with_linked_cleanup(uuid, uuid)
TO service_role;


-- ------------------------------------------------------------
-- delete_hive_with_queen_cleanup(uuid, uuid)
-- ------------------------------------------------------------

REVOKE EXECUTE
ON FUNCTION public.delete_hive_with_queen_cleanup(uuid, uuid)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION public.delete_hive_with_queen_cleanup(uuid, uuid)
TO service_role;
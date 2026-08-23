-- ============================================================
-- HIVETAG
-- MARKETING EMAIL CONSENT INFRASTRUCTURE
--
-- Captures the permanent database changes already tested in
-- STAGING. Existing users are not opted in automatically.
-- ============================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS marketing_email_consent boolean,
ADD COLUMN IF NOT EXISTS marketing_email_consent_updated_at timestamptz,
ADD COLUMN IF NOT EXISTS marketing_email_consent_source text,
ADD COLUMN IF NOT EXISTS marketing_email_consent_version text,
ADD COLUMN IF NOT EXISTS brevo_contact_id text;


-- ============================================================
-- PROTECT MARKETING CONSENT / BREVO PROFILE FIELDS
--
-- Normal profile updates remain allowed.
-- Protected fields may only be changed by trusted
-- server/database roles.
-- ============================================================

CREATE OR REPLACE FUNCTION public.protect_profile_marketing_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    /*
     * Trusted server/database roles may change these fields.
     */
    IF current_user IN ('postgres', 'service_role', 'supabase_admin') THEN
        RETURN NEW;
    END IF;

    /*
     * For a new profile, browser/client code must not initialise
     * any protected marketing/Brevo fields.
     */
    IF TG_OP = 'INSERT' THEN
        IF NEW.marketing_email_consent IS NOT NULL
           OR NEW.marketing_email_consent_updated_at IS NOT NULL
           OR NEW.marketing_email_consent_source IS NOT NULL
           OR NEW.marketing_email_consent_version IS NOT NULL
           OR NEW.brevo_contact_id IS NOT NULL
        THEN
            RAISE EXCEPTION
                'Marketing consent fields cannot be set directly by the client';
        END IF;

        RETURN NEW;
    END IF;

    /*
     * For an existing profile, reject direct changes to any
     * protected field.
     */
    IF NEW.marketing_email_consent
           IS DISTINCT FROM OLD.marketing_email_consent
       OR NEW.marketing_email_consent_updated_at
           IS DISTINCT FROM OLD.marketing_email_consent_updated_at
       OR NEW.marketing_email_consent_source
           IS DISTINCT FROM OLD.marketing_email_consent_source
       OR NEW.marketing_email_consent_version
           IS DISTINCT FROM OLD.marketing_email_consent_version
       OR NEW.brevo_contact_id
           IS DISTINCT FROM OLD.brevo_contact_id
    THEN
        RAISE EXCEPTION
            'Marketing consent fields cannot be changed directly by the client';
    END IF;

    RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS protect_profile_marketing_fields
ON public.profiles;

CREATE TRIGGER protect_profile_marketing_fields
BEFORE INSERT OR UPDATE
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_marketing_fields();


-- ============================================================
-- NEW USER REGISTRATION
--
-- Copy an explicit boolean marketing preference supplied through
-- Supabase Auth metadata into the new profile.
--
-- TRUE  = opted in during registration
-- FALSE = declined during registration
-- absent = leave consent NULL
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_has_marketing_consent boolean := false;
  v_marketing_consent boolean;
BEGIN
  /*
   * Only treat the marketing choice as recorded when the signup
   * request explicitly contains a boolean value.
   *
   * If the value is absent, leave the profile fields NULL.
   */
  IF new.raw_user_meta_data IS NOT NULL
     AND new.raw_user_meta_data ? 'marketing_email_consent'
     AND jsonb_typeof(
       new.raw_user_meta_data -> 'marketing_email_consent'
     ) = 'boolean'
  THEN
    v_has_marketing_consent := true;
    v_marketing_consent :=
      (new.raw_user_meta_data ->> 'marketing_email_consent')::boolean;
  END IF;

  INSERT INTO public.profiles (
    user_id,
    email,
    marketing_email_consent,
    marketing_email_consent_updated_at,
    marketing_email_consent_source,
    marketing_email_consent_version
  )
  VALUES (
    new.id,
    new.email,
    CASE
      WHEN v_has_marketing_consent THEN v_marketing_consent
      ELSE NULL
    END,
    CASE
      WHEN v_has_marketing_consent THEN now()
      ELSE NULL
    END,
    CASE
      WHEN v_has_marketing_consent THEN 'registration'
      ELSE NULL
    END,
    CASE
      WHEN v_has_marketing_consent THEN 'v1'
      ELSE NULL
    END
  );

  RETURN new;
END;
$function$;
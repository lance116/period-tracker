
-- Fix the security definer function with immutable search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;

-- Add validation to prevent future period dates
CREATE OR REPLACE FUNCTION validate_period_date()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Check if start_date is in the future (beyond today)
  IF NEW.start_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Period start date cannot be in the future';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to validate period dates on insert and update
DROP TRIGGER IF EXISTS validate_period_date_trigger ON public.cycles;
CREATE TRIGGER validate_period_date_trigger
  BEFORE INSERT OR UPDATE ON public.cycles
  FOR EACH ROW
  EXECUTE FUNCTION validate_period_date();

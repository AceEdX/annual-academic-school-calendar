
-- Fix 1: Add auth check to has_paid_purchase function
CREATE OR REPLACE FUNCTION public.has_paid_purchase(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN auth.uid() = _user_id THEN
      EXISTS (
        SELECT 1 FROM public.purchases
        WHERE user_id = _user_id AND payment_status = 'paid'
      )
    ELSE
      false
  END
$$;

-- Fix 2: Deny all client-side updates on purchases (only service role can update via edge functions)
CREATE POLICY "No client updates on purchases"
ON public.purchases
FOR UPDATE
USING (false);

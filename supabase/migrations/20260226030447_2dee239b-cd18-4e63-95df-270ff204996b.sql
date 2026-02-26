-- Fix the overly permissive leads INSERT policy
-- Only the service role (edge functions) should insert leads, not anonymous users
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

-- Create a restrictive policy - only service role can insert (via edge functions)
-- The anon role should not be able to insert directly
CREATE POLICY "Only authenticated service can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (false);

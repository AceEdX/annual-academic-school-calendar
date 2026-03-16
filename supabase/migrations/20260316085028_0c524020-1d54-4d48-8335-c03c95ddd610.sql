
DROP POLICY IF EXISTS "Users can create purchases" ON public.purchases;

CREATE POLICY "Users can create purchases"
ON public.purchases
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND payment_status = 'pending'
  AND razorpay_payment_id IS NULL
  AND razorpay_signature IS NULL
  AND amount = 4900
  AND currency = 'INR'
);

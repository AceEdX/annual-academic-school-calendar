// Introductory price for unlocking calendar downloads and prints (one-time).
// Must match the amount in supabase/functions/create-razorpay-order and the purchases INSERT policy.
export const CALENDAR_PRICE_INR = 49;
export const CALENDAR_PRICE_PAISE = CALENDAR_PRICE_INR * 100;

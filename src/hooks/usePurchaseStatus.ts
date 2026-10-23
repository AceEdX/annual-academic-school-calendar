import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePurchaseStatus(userId: string | undefined) {
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkPurchase = useCallback(async () => {
    if (!userId) {
      setHasPaid(false);
      setLoading(false);
      return false;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("payment_status", "paid")
      .limit(1);

    const paid = !error && !!data && data.length > 0;
    setHasPaid(paid);
    setLoading(false);
    return paid;
  }, [userId]);

  // Asks the server to confirm a payment directly with Razorpay
  // (covers payments where the browser closed before confirmation).
  const recoverPayment = useCallback(async () => {
    if (!userId) return false;
    try {
      const { data, error } = await supabase.functions.invoke("check-payment-status");
      if (!error && data?.verified) {
        setHasPaid(true);
        return true;
      }
    } catch {
      // ignore — user can retry
    }
    return false;
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const paid = await checkPurchase();
      if (!paid && !cancelled) await recoverPayment();
    })();
    return () => {
      cancelled = true;
    };
  }, [checkPurchase, recoverPayment]);

  return { hasPaid, loading, refetch: checkPurchase, recoverPayment };
}

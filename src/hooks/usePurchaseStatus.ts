import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePurchaseStatus(userId: string | undefined) {
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkPurchase = useCallback(async () => {
    if (!userId) {
      setHasPaid(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("payment_status", "paid")
      .limit(1);

    if (!error && data && data.length > 0) {
      setHasPaid(true);
    } else {
      setHasPaid(false);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    checkPurchase();
  }, [checkPurchase]);

  return { hasPaid, loading, refetch: checkPurchase };
}

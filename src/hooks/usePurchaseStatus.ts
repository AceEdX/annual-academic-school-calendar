import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePurchaseStatus(userId: string | undefined) {
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setHasPaid(false);
      setLoading(false);
      return;
    }

    const checkPurchase = async () => {
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
    };

    checkPurchase();
  }, [userId]);

  return { hasPaid, loading };
}

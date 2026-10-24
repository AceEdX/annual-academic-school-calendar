import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * If a password-reset link lands on any page other than /reset-password
 * (e.g. the home page), send the user to the "set a new password" screen
 * instead of silently signing them in.
 */
export default function PasswordRecoveryRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const goToReset = () => {
      if (window.location.pathname !== "/reset-password") {
        navigate(`/reset-password${window.location.hash}`, { replace: true });
      }
    };

    if (window.location.hash.includes("type=recovery")) goToReset();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") goToReset();
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePurchaseStatus } from "@/hooks/usePurchaseStatus";
import Index from "./Index";

export default function CalendarPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { hasPaid, loading: purchaseLoading } = usePurchaseStatus(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!authLoading && !purchaseLoading && user && !hasPaid) {
      navigate("/");
    }
  }, [authLoading, purchaseLoading, user, hasPaid, navigate]);

  if (authLoading || purchaseLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !hasPaid) return null;

  return <Index user={user} onSignOut={signOut} />;
}

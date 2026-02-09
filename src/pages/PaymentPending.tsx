import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePurchaseStatus } from "@/hooks/usePurchaseStatus";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import aceEdxLogo from "@/assets/Ace_EduX_Logo_3.png";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

const PAYMENT_LINK = "https://rzp.io/rzp/spQ3H1T";
const POLL_INTERVAL_MS = 8000;

export default function PaymentPending() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasPaid, loading: purchaseLoading, refetch } = usePurchaseStatus(user?.id);
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // If already paid, redirect to calendar immediately
  useEffect(() => {
    if (!authLoading && !purchaseLoading && user && hasPaid) {
      setVerified(true);
      navigate("/calendar");
    }
  }, [authLoading, purchaseLoading, user, hasPaid, navigate]);

  // Auto-poll for payment verification every few seconds
  useEffect(() => {
    if (verified || !user || hasPaid) return;

    const checkPayment = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("check-payment-status");
        if (!error && data?.verified) {
          setVerified(true);
          await refetch();
          toast({
            title: "Payment Verified! 🎉",
            description: "Redirecting you to the calendar now...",
          });
          navigate("/calendar");
        }
      } catch {
        // Silent fail for auto-poll — user can still click manually
      }
    };

    // Start polling
    pollRef.current = setInterval(checkPayment, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [verified, user, hasPaid, refetch, toast, navigate]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-payment-status");

      if (error) throw new Error(error.message);

      if (data?.verified) {
        setVerified(true);
        toast({
          title: "Payment Verified! 🎉",
          description: "Redirecting you to the calendar now...",
        });
        await refetch();
        navigate("/calendar");
      } else {
        toast({
          title: "Payment not found yet",
          description:
            "Please complete the payment first, then try again. It may take a minute to process.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Verification failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  if (authLoading || purchaseLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto animate-bounce" />
          <h2 className="font-display text-2xl font-bold text-foreground">
            Payment Verified!
          </h2>
          <p className="text-muted-foreground">Redirecting to your calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <img
              src={aceEdxLogo}
              alt="AceEdX"
              className="h-14 w-auto mx-auto mb-4"
            />
            <h1 className="font-display text-3xl font-bold text-foreground">
              Complete Your Purchase
            </h1>
            <p className="text-muted-foreground mt-2">
              Follow the steps below to get full access to the calendar
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-6">
            {/* Steps */}
            <div className="space-y-4">
              <Step
                number={1}
                title="Pay ₹49 via Razorpay"
                description="Click the button below to open the secure payment page. Use the same email you signed up with."
              />
              <div className="pl-10">
                <Button
                  className="gap-2 w-full sm:w-auto"
                  onClick={() => window.open(PAYMENT_LINK, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Payment Page
                </Button>
              </div>

              <Step
                number={2}
                title="Complete the payment"
                description="Fill in your details and pay securely on Razorpay's hosted page."
              />

              <Step
                number={3}
                title="Get instant access"
                description="We auto-detect your payment. You'll be redirected to the calendar automatically, or click below to verify now."
              />
              <div className="pl-10">
                <Button
                  variant="secondary"
                  className="gap-2 w-full sm:w-auto"
                  onClick={handleVerify}
                  disabled={verifying}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Verify My Payment
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Auto-detect notice */}
            <div className="bg-primary/5 rounded-lg p-4 text-sm text-foreground flex items-start gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary mt-0.5 shrink-0" />
              <p>
                <strong>Auto-detecting payment...</strong> We're checking every few seconds. You'll be redirected as soon as we confirm your payment.
              </p>
            </div>

            {/* Hint */}
            <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
              <p>
                <strong>Important:</strong> Use the same email address (
                <span className="text-foreground font-medium">{user?.email}</span>)
                when paying on Razorpay so we can verify your payment automatically.
              </p>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Having trouble?{" "}
              <a
                href="mailto:support@aceedx.com"
                className="text-primary hover:underline"
              >
                Contact support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <h3 className="font-display text-base font-bold text-foreground">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

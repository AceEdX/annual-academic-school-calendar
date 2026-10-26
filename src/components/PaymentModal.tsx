import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, Phone, ShieldCheck, User as UserIcon } from "lucide-react";
import { z } from "zod";
import { CALENDAR_PRICE_INR } from "@/data/pricing";
import { friendlyPaymentError } from "@/utils/paymentErrors";

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
});

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onSuccess: () => void;
}

const isTestPreview =
  typeof window !== "undefined" &&
  (/\.lovableproject\.com$/.test(window.location.hostname) || window.location.hostname.startsWith("id-preview--"));

const metaName = (user: User) => String(user.user_metadata?.full_name ?? "").slice(0, 100);
const metaPhone = (user: User) => String(user.user_metadata?.phone ?? "").replace(/\D/g, "").slice(-10);

const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/** Undo anything an app pop-up left behind that blocks clicks on the page. */
const releasePage = () => {
  const body = document.body;
  if (body.style.pointerEvents === "none") body.style.pointerEvents = "";
  body.removeAttribute("inert");
  document.querySelectorAll<HTMLElement>(".razorpay-container").forEach((el) => {
    el.removeAttribute("aria-hidden");
    el.removeAttribute("inert");
    el.style.pointerEvents = "auto";
  });
};

/** Wait (max ~1.5s) until no app dialog is left on the page. */
const waitForDialogsToClose = async () => {
  const start = Date.now();
  await new Promise((r) => setTimeout(r, 50));
  while (document.querySelector('[role="dialog"][data-state="open"], [role="dialog"][data-state="closed"]') && Date.now() - start < 1500) {
    await new Promise((r) => setTimeout(r, 50));
  }
};

export default function PaymentModal({ open, onClose, user, onSuccess }: PaymentModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState(() => metaName(user));
  const [phone, setPhone] = useState(() => metaPhone(user));
  const [loading, setLoading] = useState(false);
  // While Razorpay Checkout is open our own dialog must be closed: an open dialog
  // blocks clicks/focus outside itself, which makes the card fields unclickable.
  const [checkoutActive, setCheckoutActive] = useState(false);

  useEffect(() => {
    if (open) {
      setName((n) => n || metaName(user));
      setPhone((p) => p || metaPhone(user));
      // Start loading the checkout script early so paying feels instant.
      loadRazorpay();
    }
  }, [open, user]);

  // While Checkout is showing, keep the page free: if any app pop-up (menu,
  // dialog) tries to switch off clicks or hide the page, undo it immediately.
  useEffect(() => {
    if (!checkoutActive) return;
    releasePage();
    const observer = new MutationObserver(releasePage);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style", "inert", "aria-hidden"] });
    return () => observer.disconnect();
  }, [checkoutActive]);

  const handlePay = async () => {
    const result = formSchema.safeParse({ name, phone });
    if (!result.success) {
      toast({
        title: "Please check your details",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        throw new Error("Couldn't open the payment window. Please check your internet and try again.");
      }

      const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          buyer_name: result.data.name,
          buyer_email: user.email,
          buyer_phone: result.data.phone,
        },
      });

      if (orderError || !orderData?.order_id) {
        throw new Error("Couldn't start the payment. Please try again in a moment.");
      }

      const razorpay = new window.Razorpay({
        key: orderData.razorpay_key_id,
        amount: orderData.amount,
        currency: "INR",
        name: "AceEdX",
        description: "Annual School Academic Calendar 2027–28",
        order_id: orderData.order_id,
        prefill: {
          name: result.data.name,
          email: user.email,
          contact: `+91${result.data.phone}`,
        },
        handler: async (response: any) => {
          setLoading(true);
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              "verify-razorpay-payment",
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  purchase_id: orderData.purchase_id,
                },
              }
            );
            let confirmed = !verifyError && !!verifyData?.success;
            if (!confirmed) {
              // Fallback: ask the server to confirm directly with Razorpay.
              const { data: recovered } = await supabase.functions.invoke("check-payment-status");
              confirmed = !!recovered?.verified;
            }
            if (!confirmed) throw new Error("verify");
            toast({ title: "Payment successful! 🎉", description: "Downloads and printing are now unlocked." });
            onSuccess();
          } catch {
            toast({
              title: "We couldn't confirm your payment yet",
              description: "If money was taken, refresh this page in a minute — downloads unlock automatically. Otherwise contact AceEdX with your payment ID.",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
            setCheckoutActive(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setCheckoutActive(false);
          },
        },
        theme: { color: "#1d4ed8" },
      });

      razorpay.on("payment.failed", (response: any) => {
        toast({
          title: "Payment didn't go through",
          description: friendlyPaymentError(response?.error),
          variant: "destructive",
        });
      });

      // Close our dialog first, then open Checkout once the dialog has fully let go
      // of the page (it blocks pointer events and focus while open).
      setCheckoutActive(true);
      await waitForDialogsToClose();
      releasePage();
      razorpay.open();
    } catch (err: any) {
      toast({ title: "Payment not started", description: err.message, variant: "destructive" });
      setLoading(false);
      setCheckoutActive(false);
    }
  };

  return (
    <Dialog open={open && !checkoutActive} onOpenChange={(v) => !v && !loading && onClose()}>
      <DialogContent className="sm:max-w-md font-body">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-primary">Unlock downloads & printing</DialogTitle>
          <DialogDescription>
            One small payment unlocks every download and print option for your calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">Annual School Academic Calendar 2027–28</p>
              <p className="text-sm text-muted-foreground">Month-wise PDFs, full list & CSV • Unlimited prints</p>
              <p className="text-xs font-semibold text-accent-foreground bg-accent inline-block rounded px-2 py-0.5 mt-2">
                Introductory price
              </p>
            </div>
            <div className="flex items-center text-2xl font-bold text-foreground shrink-0">
              <IndianRupee className="w-5 h-5" />
              {CALENDAR_PRICE_INR}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buyer-name">Full Name *</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="buyer-name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyer-phone">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="buyer-phone"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="pl-10"
                maxLength={10}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">Email: {user.email}</p>

          {isTestPreview && (
            <p className="text-xs rounded-md border border-accent bg-accent/20 text-foreground p-2">
              This is the test preview. Razorpay only accepts payments on your live website
              (academiccalendar.aceedx.com), so a payment here may be refused. No money is taken if it is.
            </p>
          )}

          <Button className="w-full gap-2" size="lg" onClick={handlePay} disabled={loading}>
            {loading ? "Please wait..." : `Pay ₹${CALENDAR_PRICE_INR} & unlock downloads`}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Secure payment by Razorpay — UPI, cards, net banking & wallets
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

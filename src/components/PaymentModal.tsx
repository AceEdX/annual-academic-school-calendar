import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, Phone, User as UserIcon } from "lucide-react";
import { z } from "zod";

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

export default function PaymentModal({ open, onClose, user, onSuccess }: PaymentModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
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
  };

  const handlePay = async () => {
    const result = formSchema.safeParse({ name, phone });
    if (!result.success) {
      toast({
        title: "Invalid input",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast({ title: "Error", description: "Failed to load Razorpay SDK. Please try again.", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Create order via edge function
      const { data: orderData, error: orderError } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          buyer_name: result.data.name,
          buyer_email: user.email,
          buyer_phone: result.data.phone,
        },
      });

      if (orderError || !orderData?.order_id) {
        throw new Error(orderError?.message || "Failed to create order");
      }

      // Open Razorpay checkout
      const options = {
        key: orderData.razorpay_key_id,
        amount: orderData.amount,
        currency: "INR",
        name: "School Annual Calendar",
        description: "Academic Year 2026–27",
        order_id: orderData.order_id,
        prefill: {
          name: result.data.name,
          email: user.email,
          contact: result.data.phone,
        },
        handler: async (response: any) => {
          // Verify payment
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

            if (verifyError || !verifyData?.success) {
              throw new Error("Payment verification failed");
            }

            toast({ title: "Payment Successful! 🎉", description: "You now have full access to the calendar." });
            onSuccess();
          } catch (err: any) {
            toast({ title: "Verification failed", description: err.message, variant: "destructive" });
          }
        },
        theme: {
          color: "#2a8f8f",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        toast({
          title: "Payment Failed",
          description: response.error.description || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      });
      razorpay.open();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md font-body">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Complete Your Purchase</DialogTitle>
        </DialogHeader>

        <div className="bg-muted rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">School Annual Calendar 2026–27</p>
              <p className="text-sm text-muted-foreground">Lifetime access • Fully customizable</p>
            </div>
            <div className="flex items-center gap-1 text-2xl font-bold text-foreground">
              <IndianRupee className="w-5 h-5" />
              49
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
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="pl-10"
                maxLength={10}
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Email: {user.email}
          </div>

          <Button className="w-full gap-2" size="lg" onClick={handlePay} disabled={loading}>
            {loading ? "Processing..." : "Pay ₹49 with Razorpay"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

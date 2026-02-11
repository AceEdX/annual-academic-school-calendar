import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import aceEdxLogo from "@/assets/Ace_EduX_Logo_3.png";
import { User, Mail, Phone, ArrowLeft, Download } from "lucide-react";

const leadSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(15).optional(),
});

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfOiLFx8htpGX59J_pKGmpdL-VTMMRTQWrUBvLB0wFcBIrUww/formResponse";

export default function LeadCapture() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitToGoogleForm = (name: string, emailVal: string, phoneVal: string) => {
    try {
      const params = new URLSearchParams({
        "entry.2005620554": name,
        "entry.1045781291": emailVal,
        "entry.1166974658": phoneVal,
      });
      // Fire-and-forget via hidden iframe
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = `${GOOGLE_FORM_URL}?${params.toString()}&submit=Submit`;
      document.body.appendChild(iframe);
      setTimeout(() => iframe.remove(), 5000);
    } catch {
      // Best effort — data is already in DB
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = leadSchema.safeParse({ full_name: fullName, email, phone });
    if (!result.success) {
      toast({
        title: "Please check your details",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Save to leads table
      const { error } = await supabase.from("leads").insert({
        full_name: result.data.full_name,
        email: result.data.email,
        phone: result.data.phone || null,
      });

      if (error) throw error;

      // Submit to Google Form (best-effort)
      submitToGoogleForm(result.data.full_name, result.data.email, result.data.phone || "");

      // Also send to Google Sheets webhook via edge function
      try {
        await supabase.functions.invoke("capture-lead", {
          body: {
            full_name: result.data.full_name,
            email: result.data.email,
            phone: result.data.phone || "",
          },
        });
      } catch {
        // Non-critical
      }

      // Grant access
      localStorage.setItem("calendar_access", "true");
      localStorage.setItem("user_name", result.data.full_name);
      localStorage.setItem("user_email", result.data.email);

      toast({ title: "Welcome! 🎉", description: "Enjoy your free academic calendar." });
      navigate("/calendar");
    } catch (err: any) {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={aceEdxLogo} alt="AceEdX" className="h-16 w-auto mx-auto mb-4" />
            <h1 className="font-display text-3xl font-bold text-foreground">
              Get Your Free Calendar
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter your details below to access the complete Annual School Academic Calendar
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    maxLength={15}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={submitting}>
                <Download className="w-4 h-4" />
                {submitting ? "Please wait..." : "Get Free Access"}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Your information is safe with us and will only be used to provide you access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

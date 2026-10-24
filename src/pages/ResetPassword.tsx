import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthErrorInfo } from "@/utils/authErrors";
import aceEdxLogo from "@/assets/Ace_EduX_Logo_3.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const hasRecoveryHint = hash.includes("type=recovery") || window.location.search.includes("code=");
    if (hash.includes("error")) setLinkInvalid(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && hasRecoveryHint)) {
        setReady(true);
        setLinkInvalid(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    // If no recovery session arrives, the link is probably expired or already used.
    const timer = window.setTimeout(() => {
      setLinkInvalid((invalid) => invalid || !hasRecoveryHint);
    }, 3000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6 || password.length > 72) {
      toast({ title: "Invalid password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", description: "Please type the same password in both boxes.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      const info = getAuthErrorInfo(error, "login");
      toast({ title: info.title === "Sign in failed" ? "Couldn't update password" : info.title, description: info.description, variant: "destructive" });
      return;
    }
    toast({ title: "Password updated ✅", description: "You're signed in. Opening your calendar…" });
    navigate("/calendar");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={aceEdxLogo} alt="AceEdX" className="h-16 w-auto mx-auto mb-4" />
            <h1 className="font-display text-3xl font-bold text-foreground">Set a new password</h1>
            <p className="text-muted-foreground mt-2">Choose a new password for your calendar account.</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            {!ready && linkInvalid ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  This reset link has expired or was already used. Please ask for a new one.
                </p>
                <Button className="w-full" onClick={() => navigate("/auth?mode=forgot")}>
                  Send a new reset link
                </Button>
              </div>
            ) : !ready ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Type it again"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="pl-10"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Please wait..." : "Save new password"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

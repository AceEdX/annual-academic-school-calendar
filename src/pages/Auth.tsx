import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowLeft, Phone, Eye, EyeOff } from "lucide-react";
import { getAuthErrorInfo } from "@/utils/authErrors";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import aceEdxLogo from "@/assets/Ace_EduX_Logo_3.png";

const emailSchema = z.string().trim().email("Please enter a valid email address").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);
const nameSchema = z.string().trim().min(1, "Name is required").max(100);
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{7,15}$/, "Please enter a valid phone number");

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/calendar");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast({ title: "Invalid email", description: emailResult.error.errors[0].message, variant: "destructive" });
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast({ title: "Invalid password", description: passwordResult.error.errors[0].message, variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "signup") {
        const nameResult = nameSchema.safeParse(fullName);
        if (!nameResult.success) {
          toast({ title: "Please enter your name", description: nameResult.error.errors[0].message, variant: "destructive" });
          setSubmitting(false);
          return;
        }
        const phoneResult = phoneSchema.safeParse(phone);
        if (!phoneResult.success) {
          toast({ title: "Invalid phone number", description: phoneResult.error.errors[0].message, variant: "destructive" });
          setSubmitting(false);
          return;
        }
        const { error } = await signUp(emailResult.data, password, nameResult.data, phoneResult.data);
        if (error) {
          console.error("Sign up error:", error.message);
          const info = getAuthErrorInfo(error, "signup");
          toast({ title: info.title, description: info.description, variant: "destructive" });
          if (info.switchToLogin) {
            setMode("login");
            setPassword("");
          }
        } else {
          toast({ title: "Welcome! 🎉", description: "Your account has been created. Your calendar is ready." });
        }
      } else {
        const { error } = await signIn(emailResult.data, password);
        if (error) {
          console.error("Login error:", error.message);
          const info = getAuthErrorInfo(error, "login");
          toast({ title: info.title, description: info.description, variant: "destructive" });
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    }

    setSubmitting(false);
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
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === "login"
                ? "Sign in to access the Annual School Academic Calendar"
                : "Sign up to access the Annual School Academic Calendar 2027–28"}
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
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
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
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
                {mode === "signup" && (
                  <p className="text-xs text-muted-foreground">
                    Avoid common passwords like "password123" — they are blocked for your safety.
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === "login" ? (
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <button className="text-primary font-medium hover:underline" onClick={() => setMode("signup")}>
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <button className="text-primary font-medium hover:underline" onClick={() => setMode("login")}>
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

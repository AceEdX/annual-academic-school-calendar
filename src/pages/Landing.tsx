import { useState } from "react";
import { useNavigate } from "react-router-dom";
import previewMonth from "@/assets/preview-month-view.jpg";
import previewYear from "@/assets/preview-year-view.jpg";
import previewEvent from "@/assets/preview-event-detail.jpg";
import previewFilters from "@/assets/preview-filters.jpg";
import aceEdxLogo from "@/assets/Ace_EduX_Logo_3.png";
import { useAuth } from "@/hooks/useAuth";
import { usePurchaseStatus } from "@/hooks/usePurchaseStatus";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  Pencil,
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  IndianRupee,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import PaymentModal from "@/components/PaymentModal";

const FEATURES = [
  {
    icon: Calendar,
    title: "13 Months Covered",
    desc: "March 2026 to March 2027 — complete academic year with Indian holidays, festivals & school events.",
  },
  {
    icon: Pencil,
    title: "Fully Customizable",
    desc: "Add, edit, or delete events to personalize the calendar for your school's unique schedule.",
  },
  {
    icon: Filter,
    title: "Smart Filters",
    desc: "Filter by category — holidays, sports, exams, cultural events, club activities & more.",
  },
  {
    icon: Download,
    title: "Download & Print",
    desc: "Export as CSV or print-ready format. Use it on your school website or notice board.",
  },
];

const SCREENSHOTS = [
  { title: "Month View", desc: "Clean calendar grid with color-coded events at a glance", img: previewMonth },
  { title: "Year Overview", desc: "See all 13 months in a beautiful grid layout", img: previewYear },
  { title: "Event Details", desc: "Click any day to add events or edit existing ones", img: previewEvent },
  { title: "Smart Filters", desc: "Toggle categories to focus on what matters", img: previewFilters },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasPaid, loading: purchaseLoading } = usePurchaseStatus(user?.id);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const loading = authLoading || (user ? purchaseLoading : false);

  // If already paid, redirect to calendar
  if (!loading && user && hasPaid) {
    navigate("/calendar");
    return null;
  }

  const handleBuyNow = () => {
    if (!user) {
      navigate("/auth");
    } else {
      setPaymentOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Navbar */}
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={aceEdxLogo} alt="AceEdX" className="h-10 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Button size="sm" onClick={handleBuyNow}>
                Buy Now — ₹49
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Academic Year 2026–27
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Annual School
              <span className="text-primary"> Academic Calendar</span>
            </h1>
            <p className="text-lg text-accent font-semibold mt-2">by AceEdX</p>
            <p className="text-lg sm:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
              100+ pre-loaded events — Indian holidays, sports tournaments, cultural fests, exams & club
              activities. Fully customizable for your school.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Button size="lg" className="gap-2 text-lg px-8 py-6" onClick={handleBuyNow}>
                <IndianRupee className="w-5 h-5" />
                Buy Now — Just ₹49
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Secure payment via Razorpay
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Carousel */}
      <section className="py-12 sm:py-16 bg-muted/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center text-foreground mb-8">
            Preview the Calendar
          </h2>

          <div className="relative">
            <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={SCREENSHOTS[currentSlide].img}
                  alt={SCREENSHOTS[currentSlide].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-6">
                  <h3 className="font-display text-xl font-bold text-primary-foreground">
                    {SCREENSHOTS[currentSlide].title}
                  </h3>
                  <p className="text-primary-foreground/80 text-sm mt-1">
                    {SCREENSHOTS[currentSlide].desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentSlide((p) => (p === 0 ? SCREENSHOTS.length - 1 : p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex gap-2">
                {SCREENSHOTS.map((_, i) => (
                  <button
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === currentSlide ? "bg-primary" : "bg-border"
                    }`}
                    onClick={() => setCurrentSlide(i)}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentSlide((p) => (p === SCREENSHOTS.length - 1 ? 0 : p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center text-foreground mb-10">
            Everything Your School Needs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">{f.title}</h3>
                <p className="text-muted-foreground text-sm mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-12 sm:py-16 bg-muted/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-8">
            What's Included for ₹49
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {[
              "All Indian national holidays",
              "Major religious festivals",
              "Sports tournaments & meets",
              "Club activities & workshops",
              "Examination schedules",
              "Cultural events & days",
              "CSV & print-ready export",
              "Lifetime access & updates",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Social proof */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-accent fill-accent" />
            ))}
          </div>
          <blockquote className="font-display text-xl sm:text-2xl text-foreground italic">
            "This calendar saved us hours of planning. The pre-loaded events are perfect for Indian schools!"
          </blockquote>
          <p className="text-muted-foreground mt-3 text-sm">— School Administrator</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="mt-4 text-primary-foreground/80 text-lg">
            Get your complete school calendar for just ₹49. Customize it for your school in minutes.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 text-lg px-8 py-6 gap-2"
            onClick={handleBuyNow}
          >
            <IndianRupee className="w-5 h-5" />
            Buy Now — ₹49
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>📚 Annual School Academic Calendar by AceEdX — Academic Year 2026–27</p>
        <p className="mt-1">Secure payments powered by Razorpay</p>
      </footer>

      {/* Payment Modal */}
      {user && (
        <PaymentModal
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          user={user}
          onSuccess={() => {
            setPaymentOpen(false);
            navigate("/calendar");
          }}
        />
      )}
    </div>
  );
}

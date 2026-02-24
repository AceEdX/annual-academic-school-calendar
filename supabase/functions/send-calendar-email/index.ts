import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, name } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const calendarLink = "https://annual-academic-school-calendar.lovable.app/auth";
    const displayName = name || "Educator";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AceEdX Calendar <onboarding@resend.dev>",
        to: [email],
        subject: "Your Free Annual School Academic Calendar 📚",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a1a2e; font-size: 24px;">Hi ${displayName}! 👋</h1>
            <p style="color: #444; font-size: 16px; line-height: 1.6;">
              Thank you for signing up! Your <strong>Annual School Academic Calendar (2026–27)</strong> is ready to use.
            </p>
            <p style="color: #444; font-size: 16px; line-height: 1.6;">
              Access your calendar anytime by clicking the link below. You can customize events, download as CSV, or print it for your school.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${calendarLink}" style="background-color: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
                Open My Calendar
              </a>
            </div>
            <p style="color: #888; font-size: 14px; line-height: 1.5;">
              Bookmark this link for easy access. You can edit, customize, and re-use your calendar anytime!
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              📚 Annual School Academic Calendar by AceEdX — Academic Year 2026–27
            </p>
          </div>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Email send error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

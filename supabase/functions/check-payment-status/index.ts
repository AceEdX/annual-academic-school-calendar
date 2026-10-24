import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Recovery check: confirms a calendar payment by looking ONLY at this user's own
// Razorpay orders (created by create-razorpay-order). Used when the browser closed
// or lost connection before verify-razorpay-payment could run.

const allowedOrigins = [
  "https://annual-academic-school-calendar.lovable.app",
  "https://academiccalendar-aceedx-com.lovable.app",
  "https://id-preview--ebbe0e7b-e0ae-41c5-8ae7-1bae6bf26c7a.lovable.app",
  "https://academiccalendar.aceedx.com",
  "https://www.academiccalendar.aceedx.com",
];

const CALENDAR_PRICE_PAISE = 4900;

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) return json({ error: "Unauthorized" }, 401);
    const userId = claimsData.claims.sub as string;

    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: paid } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("payment_status", "paid")
      .limit(1);
    if (paid && paid.length > 0) return json({ verified: true });

    const { data: pending } = await supabaseAdmin
      .from("purchases")
      .select("id, razorpay_order_id")
      .eq("user_id", userId)
      .eq("payment_status", "pending")
      .not("razorpay_order_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!pending || pending.length === 0) return json({ verified: false });

    const authString = btoa(`${Deno.env.get("RAZORPAY_KEY_ID")}:${Deno.env.get("RAZORPAY_KEY_SECRET")}`);

    for (const row of pending) {
      const res = await fetch(`https://api.razorpay.com/v1/orders/${row.razorpay_order_id}/payments`, {
        headers: { Authorization: `Basic ${authString}` },
      });
      if (!res.ok) {
        console.error("Razorpay order lookup failed", { status: res.status });
        continue;
      }
      const data = await res.json();
      const captured = (data.items || []).find(
        (p: any) =>
          p.status === "captured" &&
          p.amount === CALENDAR_PRICE_PAISE &&
          p.currency === "INR" &&
          p.order_id === row.razorpay_order_id
      );
      if (!captured) continue;

      const { error: updateError } = await supabaseAdmin
        .from("purchases")
        .update({
          payment_status: "paid",
          razorpay_payment_id: captured.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id)
        .eq("user_id", userId);

      if (updateError) {
        console.error("Failed to update purchase", { error_code: updateError.code });
        return json({ error: "Failed to update purchase record" }, 500);
      }
      console.log("Recovered paid purchase", { purchase_id: row.id });
      return json({ verified: true });
    }

    return json({ verified: false });
  } catch (err) {
    console.error("check-payment-status error", { type: err?.constructor?.name });
    return json({ error: "Internal server error" }, 500);
  }
});

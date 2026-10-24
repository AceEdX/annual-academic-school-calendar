import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  "https://annual-academic-school-calendar.lovable.app",
  "https://academiccalendar-aceedx-com.lovable.app",
  "https://id-preview--ebbe0e7b-e0ae-41c5-8ae7-1bae6bf26c7a.lovable.app",
  "https://academiccalendar.aceedx.com",
  "https://www.academiccalendar.aceedx.com",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${orderId}|${paymentId}`);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, data);
  const expectedSignature = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expectedSignature === signature;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, purchase_id } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !purchase_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof razorpay_order_id !== "string" || !razorpay_order_id.startsWith("order_")) {
      return new Response(JSON.stringify({ error: "Invalid order ID format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof razorpay_payment_id !== "string" || !razorpay_payment_id.startsWith("pay_")) {
      return new Response(JSON.stringify({ error: "Invalid payment ID format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (typeof razorpay_signature !== "string" || !/^[a-f0-9]{64}$/.test(razorpay_signature)) {
      return new Response(JSON.stringify({ error: "Invalid signature format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (typeof purchase_id !== "string" || !uuidRegex.test(purchase_id)) {
      return new Response(JSON.stringify({ error: "Invalid purchase ID format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayKeySecret
    );

    if (!isValid) {
      console.error("Invalid payment signature", { order_id: razorpay_order_id });
      return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Payment signature verified", { order_id: razorpay_order_id });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: purchase, error: updateError } = await supabaseAdmin
      .from("purchases")
      .update({
        payment_status: "paid",
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq("id", purchase_id)
      .eq("user_id", userId)
      .eq("razorpay_order_id", razorpay_order_id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update purchase", { error_code: updateError.code });
      return new Response(JSON.stringify({ error: "Failed to update purchase record" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Purchase updated to paid", { purchase_id });

    // Sync to Google Sheets (fire and forget)
    try {
      const sheetsWebhookUrl = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");
      if (sheetsWebhookUrl) {
        await fetch(sheetsWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: purchase.buyer_name,
            email: purchase.buyer_email,
            phone: purchase.buyer_phone,
            amount: "₹49",
            payment_id: razorpay_payment_id,
            date: new Date().toISOString(),
          }),
        });
        console.log("Synced to Google Sheets");
      }
    } catch {
      console.error("Google Sheets sync failed (non-critical)");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("verify-razorpay-payment error", { type: err?.constructor?.name });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

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
    const userEmail = claimsData.claims.email;

    const { buyer_name, buyer_email, buyer_phone } = await req.json();

    if (!buyer_name || typeof buyer_name !== "string" || buyer_name.trim().length < 1 || buyer_name.length > 100) {
      return new Response(JSON.stringify({ error: "Name is required and must be under 100 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!buyer_phone || typeof buyer_phone !== "string" || !/^[6-9]\d{9}$/.test(buyer_phone)) {
      return new Response(JSON.stringify({ error: "A valid 10-digit Indian phone number is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (buyer_email && (typeof buyer_email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer_email))) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const amountInPaise = 4900;

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${razorpayKeyId}:${razorpayKeySecret}`),
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `cal_${Date.now()}`,
        notes: {
          buyer_name,
          buyer_email: buyer_email || userEmail,
          buyer_phone,
        },
      }),
    });

    const razorpayOrder = await razorpayResponse.json();

    if (!razorpayOrder.id) {
      console.error("Razorpay order creation failed", { status: razorpayResponse.status });
      return new Response(JSON.stringify({ error: "Failed to create Razorpay order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Razorpay order created:", razorpayOrder.id);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: purchase, error: insertError } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id: userId,
        buyer_name,
        buyer_email: buyer_email || userEmail,
        buyer_phone,
        amount: amountInPaise,
        currency: "INR",
        payment_status: "pending",
        razorpay_order_id: razorpayOrder.id,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to insert purchase", { error_code: insertError.code });
      return new Response(JSON.stringify({ error: "Failed to record purchase" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Purchase recorded:", purchase.id);

    return new Response(
      JSON.stringify({
        order_id: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR",
        razorpay_key_id: razorpayKeyId,
        purchase_id: purchase.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-razorpay-order error", { type: err?.constructor?.name });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

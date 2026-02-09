import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  "https://annual-academic-school-calendar.lovable.app",
  "https://id-preview--ebbe0e7b-e0ae-41c5-8ae7-1bae6bf26c7a.lovable.app",
];

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

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      console.error("Auth verification failed");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = claimsData.user;
    const userEmail = user.email;
    const userId = user.id;

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "No email found for user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Checking payment status", { user_id: userId });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already has a paid purchase
    const { data: existingPurchase } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("payment_status", "paid")
      .limit(1);

    if (existingPurchase && existingPurchase.length > 0) {
      console.log("User already has a paid purchase");
      return new Response(
        JSON.stringify({ verified: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Query Razorpay API for payments by email
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    const fromTimestamp = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
    const razorpayUrl = `https://api.razorpay.com/v1/payments?count=50&from=${fromTimestamp}`;

    console.log("Fetching recent payments from Razorpay");

    const razorpayResponse = await fetch(razorpayUrl, {
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    });

    if (!razorpayResponse.ok) {
      console.error("Razorpay API request failed", { status: razorpayResponse.status });
      return new Response(
        JSON.stringify({ error: "Failed to verify payment with payment provider" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const razorpayData = await razorpayResponse.json();
    const payments = razorpayData.items || [];

    console.log("Razorpay payments fetched", { count: payments.length });

    // Find a captured payment matching user's email
    const matchingPayment = payments.find(
      (p: any) =>
        p.status === "captured" &&
        p.email?.toLowerCase() === userEmail.toLowerCase()
    );

    if (!matchingPayment) {
      console.log("No matching payment found");
      return new Response(
        JSON.stringify({ verified: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Matching payment found", { payment_id: matchingPayment.id });

    // Check if there's a pending purchase to update
    const { data: pendingPurchase } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("payment_status", "pending")
      .limit(1);

    if (pendingPurchase && pendingPurchase.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from("purchases")
        .update({
          payment_status: "paid",
          razorpay_payment_id: matchingPayment.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pendingPurchase[0].id);

      if (updateError) {
        console.error("Failed to update purchase", { error_code: updateError.code });
        return new Response(
          JSON.stringify({ error: "Failed to update purchase record" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from("purchases")
        .insert({
          user_id: userId,
          buyer_name: matchingPayment.notes?.name || userEmail.split("@")[0],
          buyer_email: userEmail,
          buyer_phone: matchingPayment.contact || "N/A",
          amount: matchingPayment.amount,
          currency: matchingPayment.currency || "INR",
          payment_status: "paid",
          razorpay_payment_id: matchingPayment.id,
        });

      if (insertError) {
        console.error("Failed to create purchase", { error_code: insertError.code });
        return new Response(
          JSON.stringify({ error: "Failed to create purchase record" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log("Payment verified and purchase recorded");
    return new Response(
      JSON.stringify({ verified: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("check-payment-status error", { type: err?.constructor?.name });
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

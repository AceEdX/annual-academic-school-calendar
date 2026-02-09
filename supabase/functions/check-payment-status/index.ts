import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate user
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

    // User client for auth
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      console.error("Auth error:", claimsError?.message);
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

    console.log(`Checking payment for user ${userId}, email: ${userEmail}`);

    // Service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // First, check if user already has a paid purchase
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

    // Fetch recent payments from Razorpay (last 7 days)
    const fromTimestamp = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
    const razorpayUrl = `https://api.razorpay.com/v1/payments?count=50&from=${fromTimestamp}`;

    console.log(`Fetching Razorpay payments from: ${razorpayUrl}`);

    const razorpayResponse = await fetch(razorpayUrl, {
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error("Razorpay API error:", razorpayResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to verify payment with payment provider" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const razorpayData = await razorpayResponse.json();
    const payments = razorpayData.items || [];

    console.log(`Found ${payments.length} recent payments from Razorpay`);

    // Find a captured payment matching user's email
    const matchingPayment = payments.find(
      (p: any) =>
        p.status === "captured" &&
        p.email?.toLowerCase() === userEmail.toLowerCase()
    );

    if (!matchingPayment) {
      console.log("No matching captured payment found for email:", userEmail);
      return new Response(
        JSON.stringify({ verified: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found matching payment: ${matchingPayment.id}, amount: ${matchingPayment.amount}`);

    // Check if there's a pending purchase to update
    const { data: pendingPurchase } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("payment_status", "pending")
      .limit(1);

    if (pendingPurchase && pendingPurchase.length > 0) {
      // Update existing pending purchase
      const { error: updateError } = await supabaseAdmin
        .from("purchases")
        .update({
          payment_status: "paid",
          razorpay_payment_id: matchingPayment.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pendingPurchase[0].id);

      if (updateError) {
        console.error("Failed to update purchase:", updateError.message);
        return new Response(
          JSON.stringify({ error: "Failed to update purchase record" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Create a new paid purchase record
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
        console.error("Failed to create purchase:", insertError.message);
        return new Response(
          JSON.stringify({ error: "Failed to create purchase record" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log("Payment verified and purchase updated successfully");
    return new Response(
      JSON.stringify({ verified: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

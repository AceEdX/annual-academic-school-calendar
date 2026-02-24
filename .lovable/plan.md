

# Store Resend API Key and Verify Email Delivery

## Overview
Store the provided Resend API key as a backend secret so the `send-calendar-email` function can send calendar links to users after signup.

## Steps

1. **Store the RESEND_API_KEY secret** using the secure secrets manager with the value you provided.

2. **Deploy the send-calendar-email function** to ensure it picks up the new secret.

3. **Verify the flow works end-to-end**: Sign up as a new user and confirm the welcome email with the calendar link is delivered.

## Technical Details
- The secret `RESEND_API_KEY` will be stored securely and accessible only by backend functions.
- The existing `send-calendar-email` function already references `Deno.env.get("RESEND_API_KEY")` so no code changes are needed -- just the secret needs to be added.
- Note: Resend's free tier uses `onboarding@resend.dev` as the sender, which works for testing. For production, you'll want to verify your own domain in Resend.




# Plan: Replace In-App Razorpay Checkout with Payment Link + Streamline User Journey

## Overview

This plan replaces the current in-app Razorpay checkout modal with a simple redirect to the Razorpay payment link (`https://rzp.io/rzp/spQ3H1T`). After payment, users will be directed back to the app where their purchase is verified and they get full access to the calendar with all features working smoothly.

## Current Flow (Problems)
1. User clicks "Buy Now" -> Opens in-app Razorpay modal -> Requires name/phone -> Creates order via edge function -> Opens Razorpay SDK -> Verifies payment via edge function -> Redirects to calendar
2. This flow has friction: multiple steps, SDK loading issues, and edge function complexity

## New Flow (Simplified)

```text
User clicks "Buy Now"
  |
  v
Not logged in? -> Redirect to /auth -> Sign up/Sign in
  |
  v
Logged in? -> Open Razorpay payment link (https://rzp.io/rzp/spQ3H1T) in new tab
  |
  v
User completes payment on Razorpay's hosted page
  |
  v
User returns to app -> App checks purchase status
  |
  v
Purchase verified? -> Full calendar access with all features
```

Since the Razorpay payment link handles the entire checkout externally, we need a way to track that the payment was completed. There are two approaches:

**Approach A - Razorpay Webhook:** Set up a webhook endpoint that Razorpay calls after successful payment. This requires configuring the webhook URL in the Razorpay dashboard and matching the payment to the user.

**Approach B - Manual/Admin Verification:** Since payments happen on Razorpay's hosted page, the payment link doesn't carry user context (no user_id). The simplest reliable approach is:
1. User clicks "Buy Now" -> a pending purchase record is created with their user_id
2. User is redirected to the Razorpay payment link
3. When user returns, the app shows a "Verify Payment" button
4. A backend function checks Razorpay's API for recent payments matching the user's email
5. If found, marks the purchase as paid

**Recommended: Approach B with email matching** - Since the Razorpay payment link collects the buyer's email, we can match it against the authenticated user's email.

## Detailed Changes

### 1. Simplify the Landing Page Payment Flow
**File: `src/pages/Landing.tsx`**
- Remove the `PaymentModal` component and its import
- Remove `paymentOpen` state
- Change `handleBuyNow` to:
  - If not logged in: redirect to `/auth`
  - If logged in but not paid: create a pending purchase record, then open `https://rzp.io/rzp/spQ3H1T` in a new tab, then navigate to `/payment-pending`
  - If already paid: redirect to `/calendar`

### 2. Create a Payment Pending / Verification Page
**New file: `src/pages/PaymentPending.tsx`**
- Shows a friendly message: "Complete your payment, then click Verify"
- Has a "Verify My Payment" button that calls a new edge function
- Has a link to open the payment link again if needed
- On successful verification, redirects to `/calendar`
- Shows loading state during verification

### 3. Create a New Edge Function to Verify Payment by Email
**New file: `supabase/functions/check-payment-status/index.ts`**
- Authenticates the user
- Fetches recent payments from Razorpay API filtered by the user's email
- If a successful payment is found, updates the user's purchase record to "paid"
- Returns success/failure status

### 4. Update App Routes
**File: `src/App.tsx`**
- Add new route `/payment-pending` for the PaymentPending page
- Keep all existing routes

### 5. Update CalendarPage to Handle Edge Cases
**File: `src/pages/CalendarPage.tsx`**
- Add a `refetch` capability to `usePurchaseStatus` so users can re-check after payment
- If user is logged in but hasn't paid, redirect to landing page (already works)

### 6. Update usePurchaseStatus Hook
**File: `src/hooks/usePurchaseStatus.ts`**
- Add a `refetch` function that re-checks the purchase status
- This allows the payment pending page to re-verify after the user clicks "Verify"

### 7. Clean Up (Optional but Recommended)
- The `PaymentModal` component can be kept for now but won't be used
- The `create-razorpay-order` and `verify-razorpay-payment` edge functions can remain as backup

## Technical Details

### New Edge Function: `check-payment-status`
```text
POST /check-payment-status
Auth: Required (Bearer token)
Body: none

Logic:
1. Get authenticated user's email
2. Query Razorpay Payments API for payments with this email
3. If a captured/paid payment of Rs 49 is found:
   - Update the user's pending purchase record to "paid"
   - Or create a new "paid" purchase record if none exists
4. Return { verified: true } or { verified: false }
```

### Payment Pending Page UX
- Clean, reassuring design matching the app's style
- Step-by-step instructions:
  1. "Click the payment link below to pay Rs 49"
  2. "Complete payment on Razorpay's secure page"
  3. "Return here and click 'Verify My Payment'"
- Payment link button (opens in new tab)
- "Verify My Payment" button with loading state
- Success animation when verified
- "Already paid? Contact support" fallback message

### Route Protection
- `/calendar` - requires auth + paid status (existing)
- `/payment-pending` - requires auth only (new)
- `/` - landing page, redirects to calendar if paid (existing)
- `/auth` - login/signup (existing)

### Config Update
**File: `supabase/config.toml`**
- Add the new edge function configuration:
```toml
[functions.check-payment-status]
verify_jwt = false
```


# AGENTS.md

- User details (name, email, phone) are saved to `public.profiles` by a database trigger on account creation, from sign-up metadata — keeps saving reliable even if the client navigates away.
- The calendar span and preparation boundary live in `src/data/calendarData.ts` constants; all views and exports derive months from `src/utils/calendarRange.ts` — one source of truth for dates.
- Download/print access is unlocked only by a `public.purchases` row with `payment_status = 'paid'`, set server-side by `verify-razorpay-payment` after HMAC signature check (Razorpay Checkout via `create-razorpay-order`) — clients can never mark themselves paid. The price constant in `src/data/pricing.ts` must match the edge function amounts (create order, check-payment-status) and the purchases INSERT policy.
- `check-payment-status` recovers interrupted payments by querying Razorpay only for the user's own pending order IDs (never by email) — the Razorpay account is shared with other AceEdX products, so email matching would unlock wrong buyers.
- Every edge function's CORS `allowedOrigins` list must include every address the app is served from (lovable.app published + preview, and the Hostinger-hosted `academiccalendar.aceedx.com`) — a missing origin silently blocks payments and sign-up calls from that site.
- Password reset: `/auth?mode=forgot` sends the link to `/reset-password`; `PasswordRecoveryRedirect` (in `App.tsx`) forwards recovery links that land on any other page — the external domain may not be an allowed auth redirect, so links can fall back to the site root.
- `PaymentModal` closes its own dialog before opening Razorpay Checkout — an open dialog blocks clicks and focus outside itself, which made the card fields unclickable.

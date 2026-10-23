import { describe, it, expect } from "vitest";
import { friendlyPaymentError } from "@/utils/paymentErrors";

describe("friendlyPaymentError", () => {
  it("explains a website-not-registered block without blaming the buyer", () => {
    const msg = friendlyPaymentError({
      reason: "payment_risk_check_failed",
      description: "Payment blocked as website does not match registered website(s)",
    });
    expect(msg).toMatch(/No money was taken/);
    expect(msg).not.toMatch(/registered website/);
  });

  it("explains a timed-out payment", () => {
    expect(friendlyPaymentError({ reason: "payment_timed_out" })).toMatch(/in time/);
  });

  it("falls back to Razorpay's own description", () => {
    expect(friendlyPaymentError({ description: "Card expired" })).toBe("Card expired");
  });
});

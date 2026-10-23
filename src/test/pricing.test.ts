import { describe, it, expect } from "vitest";
import { CALENDAR_PRICE_INR, CALENDAR_PRICE_PAISE } from "@/data/pricing";

describe("calendar download price", () => {
  it("is the introductory price of ₹49 (4900 paise for Razorpay)", () => {
    expect(CALENDAR_PRICE_INR).toBe(49);
    expect(CALENDAR_PRICE_PAISE).toBe(4900);
  });
});

// Turns Razorpay checkout failure details into a clear message for the buyer.
export function friendlyPaymentError(error?: { description?: string; reason?: string } | null): string {
  const reason = error?.reason ?? "";
  const description = error?.description ?? "";

  if (reason === "payment_risk_check_failed" || /website does not match/i.test(description)) {
    return "Online payments are being set up for this website and aren't accepted yet. No money was taken. Please try again later or contact AceEdX.";
  }
  if (reason === "payment_timed_out" || /not completed on time/i.test(description)) {
    return "The payment wasn't completed in time. No money was taken — please try again.";
  }
  if (/insufficient/i.test(description)) {
    return "Your bank declined the payment due to insufficient balance. Please try another card or UPI.";
  }
  return description || "Something went wrong. Please try again or use a different payment method.";
}

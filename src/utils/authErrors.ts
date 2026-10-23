type AuthLikeError = { message?: string; code?: string; status?: number } | null | undefined;

export type AuthErrorInfo = {
  title: string;
  description: string;
  /** True when the email already has an account — the form should switch to Sign In. */
  switchToLogin?: boolean;
};

/** Turns sign-up / sign-in errors into clear, friendly messages for teachers and principals. */
export function getAuthErrorInfo(error: AuthLikeError, mode: "login" | "signup"): AuthErrorInfo {
  const msg = (error?.message ?? "").toLowerCase();
  const code = (error?.code ?? "").toLowerCase();

  if (code === "weak_password" || msg.includes("weak") || msg.includes("easy to guess") || msg.includes("pwned")) {
    return {
      title: "Please choose a stronger password",
      description:
        "This password is too common or has appeared in a data leak. Try a mix of words, numbers and symbols, e.g. Sunrise@School2027.",
    };
  }
  if (code === "user_already_exists" || code === "email_exists" || msg.includes("already registered")) {
    return {
      title: "You already have an account",
      description: "This email is already registered. Please sign in with your password.",
      switchToLogin: true,
    };
  }
  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) {
    return {
      title: "Sign in failed",
      description: "The email or password is incorrect. Tap the eye icon to check your password and try again.",
    };
  }
  if (code.includes("rate_limit") || error?.status === 429 || msg.includes("rate limit")) {
    return {
      title: "Too many attempts",
      description: "Please wait a minute and then try again.",
    };
  }
  if (msg.includes("fetch") || msg.includes("network")) {
    return {
      title: "No connection",
      description: "Network error. Please check your internet connection and try again.",
    };
  }
  return {
    title: mode === "signup" ? "Sign up failed" : "Sign in failed",
    description: "Something went wrong. Please try again.",
  };
}

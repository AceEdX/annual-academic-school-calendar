import { describe, it, expect } from "vitest";
import { getAuthErrorInfo } from "@/utils/authErrors";

describe("sign-up error messages", () => {
  it("tells people to pick a stronger password when it is leaked or weak", () => {
    const info = getAuthErrorInfo(
      { message: "Password is known to be weak and easy to guess, please choose a different one.", code: "weak_password" },
      "signup"
    );
    expect(info.title).toBe("Please choose a stronger password");
    expect(info.switchToLogin).toBeUndefined();
  });

  it("switches to sign in when the email is already registered", () => {
    const info = getAuthErrorInfo({ message: "User already registered", code: "user_already_exists" }, "signup");
    expect(info.switchToLogin).toBe(true);
  });
});

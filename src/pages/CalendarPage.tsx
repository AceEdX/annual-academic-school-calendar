import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Index from "./Index";

export default function CalendarPage() {
  const navigate = useNavigate();
  const hasAccess = localStorage.getItem("calendar_access") === "true";
  const userName = localStorage.getItem("user_name") || "User";
  const userEmail = localStorage.getItem("user_email") || "";

  useEffect(() => {
    if (!hasAccess) {
      navigate("/get-started");
    }
  }, [hasAccess, navigate]);

  if (!hasAccess) return null;

  const handleSignOut = () => {
    localStorage.removeItem("calendar_access");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    navigate("/");
  };

  return <Index userName={userName} userEmail={userEmail} onSignOut={handleSignOut} />;
}

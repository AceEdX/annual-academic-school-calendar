// One shared list of the addresses allowed to call these functions.
// Every place the app is served from must match here, or the browser silently
// blocks payments and sign-up calls from that site.
const PROJECT_ID = "ebbe0e7b-e0ae-41c5-8ae7-1bae6bf26c7a";

const exactOrigins = new Set([
  "https://annual-academic-school-calendar.lovable.app",
  "https://academiccalendar-aceedx-com.lovable.app",
  "https://academiccalendar.aceedx.com",
  "https://www.academiccalendar.aceedx.com",
]);

const originPatterns: RegExp[] = [
  // Lovable preview addresses for this project (lovable.app and lovableproject.com forms)
  new RegExp(`^https://([a-z0-9-]+--)?${PROJECT_ID}\\.lovable\\.app$`),
  new RegExp(`^https://([a-z0-9-]+--)?${PROJECT_ID}\\.lovableproject\\.com$`),
  // Any subdomain of aceedx.com (e.g. future www/app addresses on Hostinger)
  /^https:\/\/([a-z0-9-]+\.)*aceedx\.com$/,
  // Local development
  /^http:\/\/localhost(:\d+)?$/,
];

export function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  return exactOrigins.has(origin) || originPatterns.some((p) => p.test(origin));
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin(origin) ? origin : "https://academiccalendar.aceedx.com",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    Vary: "Origin",
  };
}

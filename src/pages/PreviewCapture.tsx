import { User } from "@supabase/supabase-js";
import Index from "./Index";

const previewUser = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "preview@example.com",
  user_metadata: { full_name: "Preview User" },
} as unknown as User;

export default function PreviewCapture() {
  return <Index user={previewUser} userName="Preview User" userEmail="preview@example.com" onSignOut={() => {}} />;
}

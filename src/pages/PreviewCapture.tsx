import Index from "./Index";

const mockUser = {
  id: "preview-mock-user",
  email: "preview@example.com",
  aud: "authenticated",
  role: "authenticated",
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
} as any;

export default function PreviewCapture() {
  return <Index user={mockUser} onSignOut={() => {}} />;
}

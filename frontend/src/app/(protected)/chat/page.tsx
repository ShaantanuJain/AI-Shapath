import { ProtectedRoute } from "@/components/auth/protected-route";
import { Chat } from "@/components/chat";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <Chat />
    </ProtectedRoute>
  );
}

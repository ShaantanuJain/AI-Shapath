"use client";

import { useEffect, useState } from "react";
import { Chat } from "@/components/chat";
import { ModeToggle } from "@/components/mode-toggle";
import { ChatSidebar } from "@/components/chat-sidebar";
import { TopicSelectorModal } from "@/components/topic-selector-modal";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch, ApiError } from "@/lib/fetch";
import { TopicsProvider } from "@/contexts/topics-context";

interface ChatSession {
  id: string;
  title: string;
  topic: string;
  lastMessage: string;
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTopicSelectorOpen, setIsTopicSelectorOpen] = useState(false);
  const { token } = useAuth();

  // ----------------------------------------------------------------------------
  // 1. Fetch existing sessions from the backend when the component mounts
  // ----------------------------------------------------------------------------
  useEffect(() => {
    async function fetchSessions() {
      try {
        // Use our apiFetch function to GET sessions
        const data = await apiFetch<any[]>("/sessions", { token: token! });
        const fetchedSessions: ChatSession[] = data.map((session) => ({
          id: session._id, // from MongoDB document
          title: session.conversation?.name || "Untitled",
          topic: session.conversation?._id || "",
          lastMessage: session.summary || "",
          messages: [], // Fetch messages separately if needed
        }));
        setSessions(fetchedSessions);
      } catch (error) {
        if (error instanceof ApiError) {
          console.error(`Error [${error.status}]:`, error.message);
        } else {
          console.error("Error fetching sessions:", error);
        }
      }
    }

    if (token) fetchSessions();
  }, [token]);

  // ----------------------------------------------------------------------------
  // 2. Handler to open modal for picking a new topic
  // ----------------------------------------------------------------------------
  const handleNewChat = () => {
    setIsTopicSelectorOpen(true);
  };

  // ----------------------------------------------------------------------------
  // 3. Handler when a user picks a topic. Create a new session in the backend.
  // ----------------------------------------------------------------------------
  const handleSelectTopic = async (topicId: string) => {
    if (!token) return;
    try {
      // "topicId" here can be the conversationCategoryId from your database.
      // Use our custom apiFetch for a POST request.
      const newSessionData = await apiFetch<any>("/sessions", {
        token,
        method: "POST",
        body: JSON.stringify({ conversationCategoryId: topicId }),
      });

      // Convert the created session to ChatSession format for the frontend
      const newSession: ChatSession = {
        id: newSessionData._id,
        title: newSessionData.conversation?.name || "New Chat",
        topic: newSessionData.conversation?._id || "",
        lastMessage: "",
        messages: [],
      };

      setSessions([...sessions, newSession]);
      setActiveSessionId(newSession.id);
      setIsTopicSelectorOpen(false);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`Error [${error.status}]:`, error.message);
      } else {
        console.error("Error creating a new session:", error);
      }
    }
  };

  // ----------------------------------------------------------------------------
  // 4. Handler when selecting an existing session
  // ----------------------------------------------------------------------------
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    // Optionally, fetch messages from your ChatLog store via another apiFetch call.
  };

  // ----------------------------------------------------------------------------
  // 5. Find the active session to display in <Chat />
  // ----------------------------------------------------------------------------
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // ----------------------------------------------------------------------------
  // 6. Render
  // ----------------------------------------------------------------------------
  return (
    <ProtectedRoute>
      <TopicsProvider>
        <div className="flex h-screen bg-background">
          <ChatSidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
          />
          <div className="flex-1 flex flex-col">
            <header className="flex items-center justify-between p-4 border-b">
              <div>
                <h1 className="text-2xl font-bold">MindfulAI</h1>
                <p className="text-sm text-muted-foreground">
                  Your AI companion for mental wellness
                </p>
              </div>
              <ModeToggle />
            </header>
            <main className="flex-1 overflow-hidden">
              {activeSession ? (
                <Chat
                  session={activeSession}
                  onUpdateSession={(updatedSession) => {
                    setSessions((prev) =>
                      prev.map((s) =>
                        s.id === updatedSession.id ? updatedSession : s,
                      ),
                    );
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Select a chat or start a new one
                  </p>
                </div>
              )}
            </main>
          </div>
          <TopicSelectorModal
            isOpen={isTopicSelectorOpen}
            onClose={() => setIsTopicSelectorOpen(false)}
            onSelectTopic={handleSelectTopic}
          />
        </div>
      </TopicsProvider>
    </ProtectedRoute>
  );
}

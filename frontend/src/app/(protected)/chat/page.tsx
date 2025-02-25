"use client";

import { useEffect, useState } from "react";
import { Chat } from "@/components/chat";
import { ModeToggle } from "@/components/mode-toggle";
import { ChatSidebar } from "@/components/chat-sidebar";
import { TopicSelectorModal } from "@/components/topic-selector-modal";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { apiFetch, ApiError } from "@/lib/fetch";
import { TopicsProvider, useTopics } from "@/contexts/topics-context";

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
  role: "user" | "model";
  timestamp: Date;
}
const ProcessingDialog = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-lg shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-foreground">Processing your request...</p>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTopicSelectorOpen, setIsTopicSelectorOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { token } = useAuth();
  const { topics } = useTopics();

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

  const handleNewChat = () => {
    setIsTopicSelectorOpen(true);
  };

  const handleSelectTopic = async (topicId: string) => {
    if (!token) return;

    try {
      setIsProcessing(true); // Start processing
      setIsTopicSelectorOpen(false); // Close the modal immediately

      const newSessionData = await apiFetch<any>("/sessions", {
        token,
        method: "POST",
        body: JSON.stringify({ conversationCategoryId: topicId }),
      });

      const topic = topics.find((t) => t._id === topicId);

      const newSession: ChatSession = {
        id: newSessionData._id,
        title: topic?.name || "New Chat",
        topic: newSessionData.conversation,
        lastMessage: "",
        messages: [],
      };

      setSessions([...sessions, newSession]);
      setActiveSessionId(newSession.id);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`Error [${error.status}]:`, error.message);
        // You might want to show an error toast here
      } else {
        console.error("Error creating a new session:", error);
      }
    } finally {
      setIsProcessing(false); // End processing
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    // Optionally, fetch messages from your ChatLog store via another apiFetch call.
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

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
          {isProcessing && <ProcessingDialog />}
        </div>
      </TopicsProvider>
    </ProtectedRoute>
  );
}

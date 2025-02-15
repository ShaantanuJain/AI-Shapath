"use client";

import { useState } from "react";
import { Chat } from "@/components/chat";
import { ModeToggle } from "@/components/mode-toggle";
import { ChatSidebar } from "@/components/chat-sidebar";
import { TopicSelectorModal } from "@/components/topic-selector-modal";
import { ProtectedRoute } from "@/components/auth/protected-route";

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

  const handleNewChat = () => {
    setIsTopicSelectorOpen(true);
  };

  const handleSelectTopic = (topicId: string) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `New ${topicId.charAt(0).toUpperCase() + topicId.slice(1)} Chat`,
      topic: topicId,
      lastMessage: "",
      messages: [],
    };
    setSessions([...sessions, newSession]);
    setActiveSessionId(newSession.id);
    setIsTopicSelectorOpen(false);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId,
  );

  return (
    <ProtectedRoute>
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
                  setSessions(
                    sessions.map((s) =>
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
    </ProtectedRoute>
  );
}

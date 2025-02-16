"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useTopics } from "@/contexts/topics-context";
import { apiFetch } from "@/lib/fetch";
import { useAuth } from "@/contexts/auth-context";

// Keep the same TypeScript interfaces (adjust as needed for your application)
interface Message {
  id: string;
  content: string;
  role: "user" | "model"; // note: the backend returns a "model" role for the AI’s message
  timestamp: Date;
}

export interface ChatSession {
  id: string; // corresponds to session._id on the backend
  title: string;
  topic: string; // conversation category _id
  lastMessage: string;
  messages: Message[];
}

interface ChatProps {
  session: ChatSession;
  onUpdateSession: (updatedSession: ChatSession) => void;
}

export function Chat({ session, onUpdateSession }: ChatProps) {
  const [input, setInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const { topics } = useTopics();
  const token = useAuth().token;

  // Find the topic that matches the session's topic ID.
  const currentTopic = topics.find((t) => t._id === session.topic);

  const sendMessage = async (messageContent: string) => {
    // Build an optimistic update if you like; here we just send the message and wait for the response.
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: "user",
      timestamp: new Date(),
    };

    // Update the local session immediately
    const updatedLocalSession: ChatSession = {
      ...session,
      messages: [...session.messages, newUserMessage],
      lastMessage: messageContent,
    };
    onUpdateSession(updatedLocalSession);

    try {
      setIsAiTyping(true);
      const response = await apiFetch<{ chatLog: any; session: ChatSession }>(
        "/api/chat/message",
        {
          method: "POST",
          body: JSON.stringify({
            sessionId: session.id,
            userMessage: messageContent,
          }),
          token: token!,
        },
      );

      // The backend returns an updated chatLog and session
      // Assume chatLog.messages holds the full conversation.
      const { chatLog, session: updatedSession } = response;
      const messages: Message[] = chatLog.messages.map((msg: any) => ({
        id: Date.now().toString() + Math.random(), // for UI uniqueness
        content: msg.content,
        role: msg.role === "model" ? "assistant" : msg.role,
        timestamp: new Date(msg.timestamp),
      }));
      // Update the session with latest messages and last message
      onUpdateSession({
        ...updatedSession,
        messages,
        lastMessage:
          messages.length > 0 ? messages[messages.length - 1].content : "",
      });
    } catch (error: any) {
      console.error("Sending message failed:", error);
      // Handle error (e.g., show a toast)
    } finally {
      setIsAiTyping(false);
    }
  };

  // Called when the user clicks the send button
  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input.trim());
    setInput("");
  };

  // Optionally, you can pre-format an emotion text message then send it.
  const handleSendEmotion = async (emotion: string) => {
    const emotionText = `I'm feeling ${emotion.toLowerCase()}.`;
    await sendMessage(emotionText);
  };

  return (
    <Card className={`flex flex-col h-full ${currentTopic?.gradient || ""}`}>
      <div className={`p-4 border-b ${currentTopic?.textColor || ""}`}>
        <h2 className="text-lg font-semibold mb-2">
          {currentTopic?.name || "Chat"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {currentTopic?.emotions?.map((emotion) => (
            <Button
              key={emotion}
              variant="outline"
              size="sm"
              onClick={() => handleSendEmotion(emotion)}
            >
              {emotion}
            </Button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {session.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "user"
                    ? `bg-primary ${currentTopic?.textColor || ""}`
                    : `bg-muted ${currentTopic?.textColor || ""}`
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <time className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </time>
              </div>
            </div>
          ))}
          {isAiTyping && (
            <div className="flex justify-start">
              <div
                className={`rounded-lg px-4 py-2 bg-muted ${currentTopic?.textColor || ""}`}
              >
                <p className="text-sm">AI is typing...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </Card>
  );
}

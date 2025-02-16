"use client";

import { useState, useEffect } from "react";
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
  const [messages, setMessages] = useState<Message[]>(session.messages);
  const [redirectSuggestion, setRedirectSuggestion] = useState<string | null>(
    null,
  );
  const { topics } = useTopics();
  const token = useAuth().token;

  // Find the topic that matches the session's topic ID.
  const currentTopic = topics.find((t) => t._id === session.topic);

  // On mount (or whenever the session.id changes), fetch the base chat log
  useEffect(() => {
    const fetchChatLog = async () => {
      if (!session.id || !token) return;
      try {
        const fetchedChatLog = await apiFetch<{
          messages: Message[];
          session: ChatSession;
        }>(`/api/chat/session/${session.id}`, {
          method: "GET",
          token: token,
        });

        if (!fetchedChatLog) return;

        // Transform backend chatLog messages into our Message interface
        const newMessages: Message[] = fetchedChatLog.messages.map(
          (msg: any) => ({
            id: Date.now().toString() + Math.random(),
            content: msg.content,
            // Here, if role is "model", you may choose to map it to "assistant" for display.
            role: msg.role === "model" ? "model" : msg.role,
            timestamp: new Date(msg.timestamp),
          }),
        );

        setMessages(newMessages);
        if (session.lastMessage !== newMessages[0].content)
          onUpdateSession({
            ...session,
            lastMessage: newMessages.length > 0 ? newMessages[0].content : "",
          });
      } catch (error) {
        console.error("Failed to fetch chat log:", error);
        setMessages([]);
      }
    };

    fetchChatLog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id, token, onUpdateSession]);

  const sendMessage = async (messageContent: string) => {
    // Build an optimistic update if you like; here we just send the message and wait for the response.
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: "user",
      timestamp: new Date(),
    };

    // Update the local messages immediately
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    onUpdateSession({
      ...session,
      lastMessage: messageContent,
    });

    try {
      setIsAiTyping(true);
      const response = await apiFetch<{
        chatLog: any;
        session: ChatSession;
        redirectToOtherCategory?: string;
      }>("/api/chat/message", {
        method: "POST",
        body: JSON.stringify({
          sessionId: session.id,
          userMessage: messageContent,
        }),
        token: token!,
      });

      if (response.redirectToOtherCategory) {
        setRedirectSuggestion(response.redirectToOtherCategory);
      }

      // The backend returns an updated chatLog and session.
      // Convert chatLog.messages to the Message interface.
      const updatedMessages: Message[] = response.chatLog.messages.map(
        (msg: any) => ({
          id: Date.now().toString() + Math.random(),
          content: msg.content,
          role: msg.role === "model" ? "model" : msg.role,
          timestamp: new Date(msg.timestamp),
        }),
      );

      setMessages(updatedMessages);
      onUpdateSession({
        ...response.session,
        lastMessage:
          updatedMessages.length > 0
            ? updatedMessages[updatedMessages.length - 1].content
            : "",
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
  const handleCategoryChange = async () => {
    if (!redirectSuggestion || !token) return;

    try {
      const response = await apiFetch<{ session: ChatSession }>(
        `/api/chat/change-category`,
        {
          method: "POST",
          body: JSON.stringify({
            sessionId: session.id,
            newCategoryId: topics.find(
              (topic) => topic.name === redirectSuggestion,
            )?._id,
          }),
          token: token,
        },
      );

      if (response.session) {
        onUpdateSession(response.session);
        setRedirectSuggestion(null);

        // Reload chat messages
        const fetchedChatLog = await apiFetch<{
          messages: Message[];
          session: ChatSession;
        }>(`/api/chat/session/${session.id}`, {
          method: "GET",
          token: token,
        });

        if (fetchedChatLog) {
          const newMessages: Message[] = fetchedChatLog.messages.map(
            (msg: any) => ({
              id: Date.now().toString() + Math.random(),
              content: msg.content,
              role: msg.role === "model" ? "model" : msg.role,
              timestamp: new Date(msg.timestamp),
            }),
          );

          setMessages(newMessages);
        }
      }
    } catch (error) {
      console.error("Failed to change category:", error);
    }
  };

  return (
    <Card className={`flex flex-col h-full ${currentTopic?.gradient || ""}`}>
      <div className={`p-4 border-b ${currentTopic?.textColor || ""}`}>
        <h2 className="text-lg font-semibold mb-2">
          {currentTopic?.name || "Chat"}
        </h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "user"
                    ? // For user: white background and the topic text color for text
                      `bg-white ${currentTopic?.textColor || ""}`
                    : // For AI: background is the topic’s color and white text.
                      `bg-white/30 backdrop-blur-md ${(currentTopic?.textColor || "").replace("text-", "bg-")} text-white`
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
      {redirectSuggestion && (
        <div className="px-4 py-2 bg-yellow-100 border-t border-yellow-200">
          <p className="text-sm text-yellow-800 mb-2">
            Would you like to move this conversation to a more appropriate
            category? The AI suggests: {redirectSuggestion}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCategoryChange}>
              Yes, change category
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRedirectSuggestion(null)}
            >
              No, keep current category
            </Button>
          </div>
        </div>
      )}
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

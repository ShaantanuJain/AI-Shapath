"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useTopics } from "@/contexts/topics-context";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  topic: string;
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
  // Get topics from context instead of using a hardcoded array.
  const { topics } = useTopics();

  // Find the topic that matches the session's topic ID.
  // (This assumes the session.topic matches the topic _id from your categories.)
  const currentTopic = topics.find((t) => t._id === session.topic);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...session.messages, newMessage];
    onUpdateSession({
      ...session,
      messages: updatedMessages,
      lastMessage: input,
    });
    setInput("");

    // Simulate AI typing
    setIsAiTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "This is a simulated AI response. In a real application, this would be generated by the AI model.",
        role: "assistant",
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, aiResponse];
      onUpdateSession({
        ...session,
        messages: finalMessages,
        lastMessage: aiResponse.content,
      });
      setIsAiTyping(false);
    }, 2000);
  };

  const handleSendEmotion = (emotion: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content: `I'm feeling ${emotion.toLowerCase()}.`,
      role: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...session.messages, newMessage];
    onUpdateSession({
      ...session,
      messages: updatedMessages,
      lastMessage: newMessage.content,
    });

    // Simulate AI response
    setIsAiTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand that you're feeling ${emotion.toLowerCase()}. Let's talk about it.`,
        role: "assistant",
        timestamp: new Date(),
      };
      const finalMessages = [...updatedMessages, aiResponse];
      onUpdateSession({
        ...session,
        messages: finalMessages,
        lastMessage: aiResponse.content,
      });
      setIsAiTyping(false);
    }, 1500);
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
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

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTopics } from "@/contexts/topics-context";
import { PlusCircle, MessageCircle } from "lucide-react";
import { iconMap } from "./topic-selector-modal";

interface ChatSession {
  id: string;
  title: string;
  topic: string;
  lastMessage: string;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: ChatSidebarProps) {
  const { topics } = useTopics();
  return (
    <div className="w-64 border-r bg-background">
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full justify-start"
          variant="outline"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="space-y-2 p-4">
          {sessions.map((session) => {
            const topic =
              topics.find((t) => t._id === session.topic) || topics[0];
            if (!topic) return null;
            const Icon = iconMap[topic.icon] || MessageCircle;

            return (
              <Button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full justify-start ${topic.gradient} ${topic.textColor} ${activeSessionId === session.id ? "ring-2 ring-primary shadow-lg" : ""} `}
                variant="ghost"
              >
                <Icon className="mr-2 h-4 w-4" />
                {/* Wrap the text in a flex container with min-w-0 */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium">{session.title}</div>
                  <div className="text-xs opacity-80 truncate">
                    {session.lastMessage}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

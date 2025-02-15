import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  PlusCircle,
  Battery,
  Brain,
  Cloud,
  DollarSign,
  Flower2,
  Heart,
  LifeBuoy,
  NotebookIcon as Lotus,
  MessageCircle,
  Smartphone,
  Stethoscope,
  Users,
} from "lucide-react"

interface ChatSession {
  id: string
  title: string
  topic: string
  lastMessage: string
}

interface ChatSidebarProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
}

const topics = [
  {
    id: "general",
    name: "General Chat",
    icon: MessageCircle,
    gradient: "bg-gradient-to-r from-[#5CA9E9] to-white",
    textColor: "text-[#00264D]",
  },
  {
    id: "anxiety",
    name: "Anxiety Support",
    icon: Brain,
    gradient: "bg-gradient-to-r from-[#7BC393] to-[#E4F3E3]",
    textColor: "text-[#0B3B0B]",
  },
  {
    id: "relationships",
    name: "Relationship Guidance",
    icon: Heart,
    gradient: "bg-gradient-to-r from-[#FFA5CB] to-[#FFD3A5]",
    textColor: "text-[#800020]",
  },
  {
    id: "diagnosis",
    name: "Symptom Diagnosis",
    icon: Stethoscope,
    gradient: "bg-white",
    accentColor: "bg-[#F5F5F5]",
    textColor: "text-[#333333]",
  },
  {
    id: "burnout",
    name: "Burnout Prevention",
    icon: Battery,
    gradient: "bg-gradient-to-r from-[#31B7C2] to-[#B2EBF2]",
    textColor: "text-[#004D4D]",
  },
  {
    id: "digital-wellness",
    name: "Digital Wellness",
    icon: Smartphone,
    gradient: "bg-gradient-to-r from-[#9E7BB5] to-[#D3D3FF]",
    textColor: "text-[#3A015C]",
  },
  {
    id: "climate-anxiety",
    name: "Climate Anxiety",
    icon: Cloud,
    gradient: "bg-gradient-to-r from-[#45B649] to-[#DCE35B]",
    textColor: "text-[#3C4D03]",
  },
  {
    id: "financial-wellness",
    name: "Financial Wellness",
    icon: DollarSign,
    gradient: "bg-gradient-to-r from-[#006663] to-[#D2FFFF]",
    textColor: "text-[#000033]",
  },
  {
    id: "loneliness",
    name: "Loneliness Support",
    icon: Users,
    gradient: "bg-gradient-to-r from-[#FFA31D] to-[#FCCF31]",
    textColor: "text-[#4B2800]",
  },
  {
    id: "mindfulness",
    name: "Mindfulness & Meditation",
    icon: Lotus,
    gradient: "bg-gradient-to-r from-[#5CA9E9] to-[#E4F3E3]",
    textColor: "text-[#1A0066]",
  },
  {
    id: "crisis",
    name: "Crisis Management",
    icon: LifeBuoy,
    gradient: "bg-gradient-to-r from-[#505250] to-[#CBD3C1]",
    textColor: "text-[#000000]",
  },
  {
    id: "holistic-health",
    name: "Holistic Health",
    icon: Flower2,
    gradient: "bg-gradient-to-r from-[#26C6DA] to-[#7BC393]",
    textColor: "text-[#004D00]",
  },
]

export function ChatSidebar({ sessions, activeSessionId, onSelectSession, onNewChat }: ChatSidebarProps) {
  return (
    <div className="w-64 border-r bg-background">
      <div className="p-4">
        <Button onClick={onNewChat} className="w-full justify-start" variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="space-y-2 p-4">
          {sessions.map((session) => {
            const topic = topics.find((t) => t.id === session.topic) || topics[0]
            const Icon = topic.icon
            return (
              <Button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`w-full justify-start ${topic.gradient} ${topic.textColor} ${activeSessionId === session.id ? "ring-2 ring-primary" : ""}`}
                variant="ghost"
              >
                <Icon className="mr-2 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">{session.title}</div>
                  <div className="text-xs opacity-80 truncate">{session.lastMessage}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}


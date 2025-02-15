import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
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

const topics = [
  {
    id: "general",
    name: "General Chat",
    description: "Talk about anything that's on your mind",
    icon: MessageCircle,
    gradient: "bg-gradient-to-r from-[#5CA9E9] to-white",
    textColor: "text-[#00264D]",
  },
  {
    id: "anxiety",
    name: "Anxiety Support",
    description: "Discuss anxiety and coping strategies",
    icon: Brain,
    gradient: "bg-gradient-to-r from-[#7BC393] to-[#E4F3E3]",
    textColor: "text-[#0B3B0B]",
  },
  {
    id: "relationships",
    name: "Relationship Guidance",
    description: "Navigate relationship challenges",
    icon: Heart,
    gradient: "bg-gradient-to-r from-[#FFA5CB] to-[#FFD3A5]",
    textColor: "text-[#800020]",
  },
  {
    id: "diagnosis",
    name: "Symptom Diagnosis",
    description: "Discuss symptoms and get guidance",
    icon: Stethoscope,
    gradient: "bg-white",
    accentColor: "bg-[#F5F5F5]",
    textColor: "text-[#333333]",
  },
  {
    id: "burnout",
    name: "Burnout Prevention",
    description: "Strategies to avoid and recover from burnout",
    icon: Battery,
    gradient: "bg-gradient-to-r from-[#31B7C2] to-[#B2EBF2]",
    textColor: "text-[#004D4D]",
  },
  {
    id: "digital-wellness",
    name: "Digital Wellness",
    description: "Balance your digital life and well-being",
    icon: Smartphone,
    gradient: "bg-gradient-to-r from-[#9E7BB5] to-[#D3D3FF]",
    textColor: "text-[#3A015C]",
  },
  {
    id: "climate-anxiety",
    name: "Climate Anxiety",
    description: "Cope with concerns about climate change",
    icon: Cloud,
    gradient: "bg-gradient-to-r from-[#45B649] to-[#DCE35B]",
    textColor: "text-[#3C4D03]",
  },
  {
    id: "financial-wellness",
    name: "Financial Wellness",
    description: "Manage financial stress and plan for the future",
    icon: DollarSign,
    gradient: "bg-gradient-to-r from-[#006663] to-[#D2FFFF]",
    textColor: "text-[#000033]",
  },
  {
    id: "loneliness",
    name: "Loneliness Support",
    description: "Connect and cope with feelings of loneliness",
    icon: Users,
    gradient: "bg-gradient-to-r from-[#FFA31D] to-[#FCCF31]",
    textColor: "text-[#4B2800]",
  },
  {
    id: "mindfulness",
    name: "Mindfulness & Meditation",
    description: "Practice mindfulness and meditation techniques",
    icon: Lotus,
    gradient: "bg-gradient-to-r from-[#5CA9E9] to-[#E4F3E3]",
    textColor: "text-[#1A0066]",
  },
  {
    id: "crisis",
    name: "Crisis Management",
    description: "Get support during difficult times",
    icon: LifeBuoy,
    gradient: "bg-gradient-to-r from-[#505250] to-[#CBD3C1]",
    textColor: "text-[#000000]",
  },
  {
    id: "holistic-health",
    name: "Holistic Health",
    description: "Explore overall well-being and balance",
    icon: Flower2,
    gradient: "bg-gradient-to-r from-[#26C6DA] to-[#7BC393]",
    textColor: "text-[#004D00]",
  },
]

interface TopicSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTopic: (topicId: string) => void
}

export function TopicSelectorModal({ isOpen, onClose, onSelectTopic }: TopicSelectorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose a Topic</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid gap-4 py-4">
            {topics.map((topic) => {
              const Icon = topic.icon
              return (
                <Card
                  key={topic.id}
                  className={`p-4 cursor-pointer transition-colors ${topic.gradient} ${topic.textColor}`}
                  onClick={() => onSelectTopic(topic.id)}
                >
                  <div className="flex items-start gap-4">
                    <Icon className="w-5 h-5 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="font-medium leading-none">{topic.name}</h3>
                      <p className="text-sm opacity-80">{topic.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}


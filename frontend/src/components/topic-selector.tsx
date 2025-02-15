import { Card } from "@/components/ui/card"
import { Brain, Heart, MessageCircle, Stethoscope } from "lucide-react"

const topics = [
  {
    id: "general",
    name: "General Chat",
    description: "Talk about anything that's on your mind",
    icon: MessageCircle,
  },
  {
    id: "anxiety",
    name: "Anxiety Support",
    description: "Discuss anxiety and coping strategies",
    icon: Brain,
  },
  {
    id: "relationships",
    name: "Relationship Guidance",
    description: "Navigate relationship challenges",
    icon: Heart,
  },
  {
    id: "diagnosis",
    name: "Symptom Assessment",
    description: "Discuss symptoms and get guidance",
    icon: Stethoscope,
  },
]

export function TopicSelector() {
  return (
    <aside className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Choose a Topic</h2>
      <div className="grid gap-2">
        {topics.map((topic) => {
          const Icon = topic.icon
          return (
            <Card key={topic.id} className="p-4 cursor-pointer hover:bg-muted transition-colors">
              <div className="flex items-start gap-4">
                <Icon className="w-5 h-5 mt-0.5 text-primary" />
                <div className="space-y-1">
                  <h3 className="font-medium leading-none">{topic.name}</h3>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </aside>
  )
}


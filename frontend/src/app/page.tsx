import { Chat } from "@/components/chat"
import { TopicSelector } from "@/components/topic-selector"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">MindfulAI</h1>
            <p className="text-muted-foreground mt-1">Your AI companion for mental wellness</p>
          </div>
          <ModeToggle />
        </header>
        <main className="grid gap-6 md:grid-cols-[300px_1fr]">
          <TopicSelector />
          <Chat />
        </main>
      </div>
    </div>
  )
}


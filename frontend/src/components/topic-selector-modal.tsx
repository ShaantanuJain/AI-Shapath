import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import { apiFetch } from "@/lib/fetch";
import { useAuth } from "@/contexts/auth-context";

// Create a TypeScript type for a category as it comes from backend
interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  imageUrl?: string;
  gradient: string;
  textColor: string;
}

interface TopicSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (topicId: string) => void;
}

export function TopicSelectorModal({
  isOpen,
  onClose,
  onSelectTopic,
}: TopicSelectorModalProps) {
  const [topics, setTopics] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAuth().token;

  // Map the icon string to the actual lucide-react component.
  const iconMap: Record<string, React.ElementType> = {
    MessageCircle,
    Brain,
    Heart,
    Stethoscope,
    Battery,
    Smartphone,
    Cloud,
    DollarSign,
    Users,
    Lotus, // using lotus for mindfulness & meditation
    LifeBuoy,
    Flower2,
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        // Adjust the endpoint as necessary.
        const data = await apiFetch<Category[]>("/api/categories/public", {
          token: token!,
        });
        setTopics(data);
      } catch (err: any) {
        setError(err.message || "Failed to load topics.");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if modal is open
    if (isOpen) {
      if (token) {
        fetchCategories();
      }
    }
  }, [isOpen, token]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose a Topic</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="p-4">Loading topics…</div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : (
          <ScrollArea className="h-[60vh] pr-4">
            <div className="grid gap-4 py-4">
              {topics.map((topic) => {
                // Use the iconMap to select the appropriate icon component.
                // If no matching icon is found, fallback to a default icon, such as MessageCircle.
                const Icon = iconMap[topic.icon] || MessageCircle;
                return (
                  <Card
                    key={topic._id}
                    className={`p-4 cursor-pointer transition-colors ${topic.gradient} ${topic.textColor}`}
                    onClick={() => onSelectTopic(topic._id)}
                  >
                    <div className="flex items-start gap-4">
                      <Icon className="w-5 h-5 mt-0.5" />
                      <div className="space-y-1">
                        <h3 className="font-medium leading-none">
                          {topic.name}
                        </h3>
                        <p className="text-sm opacity-80">
                          {topic.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

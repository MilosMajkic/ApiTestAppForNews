"use client";

import { NewsTopic } from "@/types/news";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const topics: { value: NewsTopic; label: string; icon: string }[] = [
  { value: "general", label: "General", icon: "📰" },
  { value: "technology", label: "Technology", icon: "💻" },
  { value: "business", label: "Business", icon: "💼" },
  { value: "sports", label: "Sports", icon: "⚽" },
  { value: "science", label: "Science", icon: "🔬" },
  { value: "health", label: "Health", icon: "🏥" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" },
];

interface TopicSelectorProps {
  selectedTopic?: NewsTopic;
  onTopicChange: (topic: NewsTopic) => void;
}

export function TopicSelector({ selectedTopic, onTopicChange }: TopicSelectorProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Topics</h3>
      <div className="grid grid-cols-2 gap-2">
        {topics.map((topic) => (
          <Button
            key={topic.value}
            variant={selectedTopic === topic.value ? "default" : "outline"}
            className={cn(
              "justify-start h-auto py-3 px-4",
              selectedTopic === topic.value && "bg-primary text-primary-foreground"
            )}
            onClick={() => onTopicChange(topic.value)}
          >
            <span className="mr-2 text-lg">{topic.icon}</span>
            {topic.label}
          </Button>
        ))}
      </div>
    </div>
  );
}



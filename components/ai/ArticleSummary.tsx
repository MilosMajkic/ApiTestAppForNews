"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NewsArticle } from "@/types/news";
import { motion, AnimatePresence } from "framer-motion";

interface ArticleSummaryProps {
  article: NewsArticle;
}

export function ArticleSummary({ article }: ArticleSummaryProps) {
  const { toast } = useToast();
  const [summary, setSummary] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.url,
          content: article.content || article.description || "",
          title: article.title,
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: (data) => {
      setSummary(data.summary);
      if (data.cached) {
        toast({
          title: "Summary loaded",
          description: "This summary was previously generated",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!summary) {
      summarizeMutation.mutate();
    }
    setIsExpanded(true);
  };

  if (!summary && !summarizeMutation.isPending) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        className="w-full"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Read in 30 seconds (AI Summary)
      </Button>
    );
  }

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-4 mt-2 bg-primary/5 border-primary/20">
            {summarizeMutation.isPending ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating summary...
              </div>
            ) : summary ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">AI Summary</span>
                </div>
                <p className="text-sm leading-relaxed">{summary}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="mt-2"
                >
                  Hide
                </Button>
              </div>
            ) : null}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



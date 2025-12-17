"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopicSelector } from "./TopicSelector";
import { NewsTopic, NewsFilters } from "@/types/news";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTopic?: NewsTopic;
  filters: NewsFilters;
  onTopicChange: (topic: NewsTopic) => void;
  onFiltersChange: (filters: NewsFilters) => void;
}

export function FilterPanel({
  isOpen,
  onClose,
  selectedTopic,
  filters,
  onTopicChange,
  onFiltersChange,
}: FilterPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l z-50 overflow-y-auto"
          >
            <Card className="border-0 rounded-none h-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Filters</h2>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <TopicSelector
                    selectedTopic={selectedTopic}
                    onTopicChange={onTopicChange}
                  />
                </div>

                <div className="mt-8 pt-6 border-t">
                  <Button onClick={onClose} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}



"use client";

import { NewsArticle } from "@/types/news";
import { Card } from "@/components/ui/card";
import { formatDate, getReadingTime } from "@/lib/utils";
import { Heart, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArticleSummary } from "@/components/ai/ArticleSummary";

interface NewsCardProps {
  article: NewsArticle;
  isFavorite?: boolean;
  onToggleFavorite?: (article: NewsArticle) => void;
}

export function NewsCard({ article, isFavorite = false, onToggleFavorite }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);
  const readingTime = article.description
    ? getReadingTime(article.description)
    : 2;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(article);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
        <Link 
          href={`/reading/${encodeURIComponent(article.url)}`}
          onClick={() => {
            // Save article data to sessionStorage for reading mode
            sessionStorage.setItem('currentArticle', JSON.stringify(article));
          }}
          className="block"
        >
          <div className="relative w-full h-48 bg-muted overflow-hidden">
            {article.urlToImage && !imageError ? (
              <Image
                src={article.urlToImage}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <ExternalLink className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={handleFavoriteClick}
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorite
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground"
                  }`}
                />
              </Button>
            </div>
          </div>
        </Link>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="font-medium">{article.source.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readingTime} min read
            </span>
            <span>•</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>

          <Link href={`/reading/${encodeURIComponent(article.url)}`}>
            <h3 className="font-serif text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
          </Link>

          {article.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
              {article.description}
            </p>
          )}

          <div className="space-y-2 mt-auto">
            <ArticleSummary article={article} />
            <Link
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Read original <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}


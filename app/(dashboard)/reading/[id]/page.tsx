"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, Moon, Sun, Maximize2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { formatDate, getReadingTime } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ReadingModePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [fontSize, setFontSize] = useState(18);
  const [isDark, setIsDark] = useState(false);
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);

  const decodedUrl = decodeURIComponent(id);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        
        // First, try to get article from sessionStorage (from NewsCard)
        const storedArticle = sessionStorage.getItem('currentArticle');
        if (storedArticle) {
          try {
            const parsedArticle = JSON.parse(storedArticle);
            // Verify it's the same article
            if (parsedArticle.url === decodedUrl) {
              setArticle({
                url: parsedArticle.url,
                title: parsedArticle.title,
                content: parsedArticle.content || parsedArticle.description || "",
                source: parsedArticle.source?.name || parsedArticle.source || "Unknown",
                publishedAt: parsedArticle.publishedAt,
                imageUrl: parsedArticle.urlToImage || parsedArticle.imageUrl,
              });
              setIsLoading(false);
              // Clear sessionStorage after use
              sessionStorage.removeItem('currentArticle');
              return;
            }
          } catch (e) {
            // Invalid JSON, continue to other methods
          }
        }
        
        // Try to find article in favorites (if user is logged in)
        const favoritesResponse = await fetch("/api/favorites");
        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json();
          if (favoritesData.success) {
            const favorite = favoritesData.data.find(
              (fav: any) => fav.url === decodedUrl
            );
            if (favorite) {
              setArticle({
                url: favorite.url,
                title: favorite.title,
                content: favorite.description || "",
                source: favorite.source,
                publishedAt: favorite.publishedAt,
                imageUrl: favorite.imageUrl,
              });
              setIsLoading(false);
              return;
            }
          }
        }
        
        // Fallback: use URL as title
        setArticle({
          url: decodedUrl,
          title: "Article",
          content: "Unable to fetch article content. Click 'Read original article' to view the full content.",
        });
      } catch (error) {
        console.error("Error fetching article:", error);
        // Fallback
        setArticle({
          url: decodedUrl,
          title: "Article",
          content: "Unable to fetch article content. Click 'Read original article' to view the full content.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [decodedUrl]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${readingProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Controls */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg border p-2 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFontSize(Math.max(14, fontSize - 2))}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-sm w-8 text-center">{fontSize}px</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFontSize(Math.min(24, fontSize + 2))}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDark(!isDark)}
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to feed
          </Button>
          <h1
            className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight"
            style={{ fontSize: `${fontSize * 1.5}px` }}
          >
            {article?.title || "Article Title"}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {article?.publishedAt && (
              <>
                <span>{formatDate(new Date(article.publishedAt))}</span>
                <span>•</span>
              </>
            )}
            {article?.source && (
              <>
                <span>{article.source}</span>
                <span>•</span>
              </>
            )}
            <span>{getReadingTime(article?.content || "")} min read</span>
          </div>
        </div>

        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
        >
          {article?.imageUrl && (
            <div className="mb-8 -mx-6">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
          
          {article?.content ? (
            <div 
              className="text-foreground leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: article.content.replace(/\n/g, '<br />') 
              }}
            />
          ) : (
            <p className="text-muted-foreground leading-relaxed">
              Unable to fetch article content. Please click the button below to read the original article.
            </p>
          )}
          
          <div className="mt-8 pt-8 border-t">
            <Button
              variant="outline"
              onClick={() => window.open(decodedUrl, "_blank")}
            >
              Read original article <Maximize2 className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}


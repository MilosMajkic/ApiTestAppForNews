"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Filter, Heart, LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { NewsTopic } from "@/types/news";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";

interface NavbarProps {
  currentTopic?: NewsTopic;
  onFilterClick: () => void;
}

export function Navbar({ currentTopic, onFilterClick }: NavbarProps) {
  const { data: session } = useSession();
  const { darkMode, toggleDarkMode } = useUIStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsScrolled(false);
        setIsVisible(true);
      } else {
        setIsScrolled(true);
        // Hide on scroll down, show on scroll up
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const topicLabels: Record<NewsTopic, string> = {
    technology: "Technology",
    business: "Business",
    sports: "Sports",
    science: "Science",
    health: "Health",
    entertainment: "Entertainment",
    general: "General",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all ${
            isScrolled ? "shadow-sm" : ""
          }`}
        >
          <div className="container mx-auto px-4 py-3 max-w-7xl">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-serif">Nova</h1>
              </Link>

              <div className="flex items-center gap-2">
                {currentTopic && (
                  <span className="hidden sm:inline-block text-sm text-muted-foreground px-3 py-1.5 rounded-md bg-muted">
                    {topicLabels[currentTopic]}
                  </span>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onFilterClick}
                  className="relative"
                >
                  <Filter className="h-5 w-5" />
                </Button>

                <Link href="/favorites">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>

                <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                  {darkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>

                {session && (
                  <div className="flex items-center gap-2 ml-2 pl-2 border-l">
                    <span className="hidden sm:inline text-sm text-muted-foreground">
                      {session.user.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}


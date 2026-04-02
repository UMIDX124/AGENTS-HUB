"use client";

import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "seo-hub-favorite-urls";

interface FavoriteUrlsProps {
  onSelect: (url: string) => void;
  currentUrl?: string;
}

export function FavoriteUrls({ onSelect, currentUrl }: FavoriteUrlsProps) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setFavorites(JSON.parse(saved));
    } catch {}
  }, []);

  function save(urls: string[]) {
    setFavorites(urls);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
  }

  function addFavorite() {
    if (!currentUrl?.trim()) return;
    const url = currentUrl.trim();
    if (favorites.includes(url)) {
      toast.info("URL already bookmarked");
      return;
    }
    save([url, ...favorites].slice(0, 10));
    toast.success("URL bookmarked");
  }

  function removeFavorite(url: string) {
    save(favorites.filter((f) => f !== url));
    toast.success("Bookmark removed");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
          Bookmarked URLs ({favorites.length})
        </p>
        {currentUrl?.trim() && (
          <button
            onClick={addFavorite}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
          >
            <Star className="h-3 w-3" /> Bookmark current
          </button>
        )}
      </div>
      {favorites.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {favorites.map((url) => (
            <div
              key={url}
              className="group flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-2 py-1 text-[11px]"
            >
              <button
                onClick={() => onSelect(url)}
                className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px]"
              >
                {url.replace("https://", "").replace("http://", "")}
              </button>
              <button
                onClick={() => removeFavorite(url)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-red-400 transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

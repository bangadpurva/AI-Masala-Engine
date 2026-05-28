import React, { useState, useEffect } from "react";
import { Clapperboard, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";

interface BrutalImageProps {
  srcs: string[];
  alt: string;
  className?: string;
  aspectRatioClass?: string;
  fallbackText: string;
  index?: number;
  movieTitle?: string;
  contentType?: "movie" | "series";
}

const fetchITunesPoster = async (title: string, type: "movie" | "series" = "movie"): Promise<string | null> => {
  try {
    const cleanTitle = title.replace(/\s*\([^)]*\)/g, "").trim();
    const mediaType = type === "series" ? "tvShow" : "movie";
    
    // We try IN (India) first since it's a Bollywood/Masala recommendation app, then global fallbacks
    const urls = [
      `https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&media=${mediaType}&limit=1&country=in`,
      `https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&media=${mediaType}&limit=1`,
      `https://itunes.apple.com/search?term=${encodeURIComponent(cleanTitle)}&limit=1`
    ];

    for (const url of urls) {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const artworkUrl = data.results[0].artworkUrl100 || data.results[0].artworkUrl60;
        if (artworkUrl) {
          // Replace 100x100 height/width with high resolution 600x600 or 800x800
          return artworkUrl.replace("100x100bb.jpg", "800x800bb.jpg").replace("100x100", "800x800");
        }
      }
    }
  } catch (error) {
    console.error("iTunes fetch error", error);
  }
  return null;
};

const fetchTVMazePoster = async (title: string): Promise<string | null> => {
  try {
    const cleanTitle = title.replace(/\s*\([^)]*\)/g, "").trim();
    const url = `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(cleanTitle)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.image?.original) {
        return data.image.original;
      } else if (data.image?.medium) {
        return data.image.medium;
      }
    }
  } catch (error) {
    console.error("TV Maze fetch error", error);
  }
  return null;
};

const fetchWikipediaPoster = async (title: string, type: "movie" | "series" = "movie"): Promise<string | null> => {
  try {
    const cleanTitle = title.replace(/\s*\([^)]*\)/g, "").trim();
    const searchTerms = [
      `${cleanTitle} (${type === "series" ? "TV series" : "film"})`,
      `${cleanTitle} film`,
      `${cleanTitle} movie`,
      cleanTitle
    ];

    for (const term of searchTerms) {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srlimit=3&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) continue;
      const searchData = await searchRes.json();
      const results = searchData.query?.search;
      
      if (results && results.length > 0) {
        // Find best match matching film/series helper words or defaults to first
        const bestMatch = results.find((r: any) => 
          r.title.toLowerCase().includes(cleanTitle.toLowerCase()) || 
          r.title.toLowerCase().includes("film") || 
          r.title.toLowerCase().includes("series")
        ) || results[0];

        const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(bestMatch.title)}&pithumbsize=1000&format=json&origin=*`;
        const imgRes = await fetch(imgUrl);
        if (!imgRes.ok) continue;
        const imgData = await imgRes.json();
        const pages = imgData.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          const page = pages[pageId];
          if (page.thumbnail?.source) {
            return page.thumbnail.source;
          }
        }
      }
    }
  } catch (error) {
    console.error("Wikipedia fetch error", error);
  }
  return null;
};

export const BrutalImage: React.FC<BrutalImageProps> = ({
  srcs,
  alt,
  className,
  aspectRatioClass = "w-full h-full",
  fallbackText,
  index = 0,
  movieTitle,
  contentType = "movie",
}) => {
  const [srcIndex, setSrcIndex] = useState(0);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [resolvedSrcs, setResolvedSrcs] = useState<string[]>([]);

  const validSrcs = srcs.filter(s => typeof s === "string" && s.trim().length > 0);

  useEffect(() => {
    let active = true;
    const loadPoster = async () => {
      setStatus("loading");
      const fetchedCandidates: string[] = [];

      if (movieTitle) {
        // 1. Try iTunes search API first (incredibly robust for movie/TV, works with Indian content too)
        const itunesPoster = await fetchITunesPoster(movieTitle, contentType as "movie" | "series");
        if (itunesPoster && active) {
          fetchedCandidates.push(itunesPoster);
        }

        // 2. If series or if iTunes failed, try TV Maze
        if (contentType === "series" || fetchedCandidates.length === 0) {
          const tvMazePoster = await fetchTVMazePoster(movieTitle);
          if (tvMazePoster && active) {
            fetchedCandidates.push(tvMazePoster);
          }
        }

        // 3. Try Wikipedia
        const wikipediaPoster = await fetchWikipediaPoster(movieTitle, contentType as "movie" | "series");
        if (wikipediaPoster && active) {
          fetchedCandidates.push(wikipediaPoster);
        }
      }

      if (!active) return;

      const uniqFetched = Array.from(new Set(fetchedCandidates)).filter(s => !!s);

      if (uniqFetched.length > 0) {
        setResolvedSrcs([...uniqFetched, ...validSrcs]);
        setSrcIndex(0);
      } else if (validSrcs.length > 0) {
        setResolvedSrcs(validSrcs);
        setSrcIndex(0);
      } else {
        setResolvedSrcs([]);
        setStatus("error");
      }
    };

    loadPoster();

    return () => {
      active = false;
    };
  }, [movieTitle, contentType, srcs.join(",")]);

  const handleLoad = () => {
    setStatus("loaded");
  };

  const handleError = () => {
    if (srcIndex + 1 < resolvedSrcs.length) {
      // Try next source in the fallback list
      setSrcIndex(prev => prev + 1);
    } else {
      // No more fallback sources, show the clapperboard vectorfallback
      setStatus("error");
    }
  };

  const currentSrc = resolvedSrcs[srcIndex];

  return (
    <div className={cn("relative overflow-hidden bg-neutral-900 border-2 border-black", aspectRatioClass, className)}>
      {/* Loading Skeleton State */}
      {status === "loading" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-neutral-950 text-white font-mono gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-dashed border-[#FF007F] animate-spin flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#00FF00] animate-pulse" />
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse text-[#FFFF00]">
            LOADING FRAME...
          </span>
        </div>
      )}

      {/* Styled Canvas Fallback (Error or when there are no valid URLs) */}
      {(status === "error" || !currentSrc) ? (
        <div className="absolute inset-0 bg-[#0F0F13] p-4 flex flex-col justify-between text-white select-none z-20 border-4 border-black font-mono">
          {/* Ticket Header */}
          <div className="flex justify-between items-center text-[7px] border-b border-dashed border-neutral-700 pb-2 text-neutral-400 uppercase">
            <span className="bg-[#FF007F] text-black px-1.5 py-0.5 font-black">ADMIT ONE</span>
            <span className="tracking-widest">NO. {String(index + 3274).padStart(5, "0")}</span>
          </div>

          {/* Ticket Body / Movie Title Display */}
          <div className="flex-grow flex flex-col justify-center items-center text-center px-1 my-2 relative">
            <div className="absolute -inset-1 bg-[#FFFF00]/10 blur-sm pointer-events-none rounded" />
            
            <span className="text-[7px] font-black tracking-widest text-[#00FF00] mb-2 uppercase bg-[#00FF00]/10 px-2 py-0.5 border border-[#00FF00]/30">
              {contentType === "series" ? "★ MEGA SERIES ★" : "★ FEATURE FILM ★"}
            </span>

            <h4 className="font-masala text-2xl uppercase tracking-tighter leading-none text-[#FFFF00] line-clamp-3 bg-neutral-900 border-2 border-dashed border-[#FFFF00] p-3 shadow-[3px_3px_0_0_#FF007F] w-full max-w-full">
              {fallbackText || movieTitle || "CINEMA CLASSIC"}
            </h4>

            <p className="text-[8px] text-neutral-400 uppercase tracking-wider mt-3 font-semibold max-w-full line-clamp-1 italic text-[#00FFFF]">
              MASALA VERDICT: 10/10 BLOCKBUSTER
            </p>
          </div>

          {/* Ticket Footer details */}
          <div className="border-t border-dashed border-neutral-700 pt-2 flex justify-between text-[7px] tracking-wider font-bold text-neutral-400 uppercase">
            <span className="text-[#FF007F]">REEL: 04</span>
            <span className="text-neutral-500">ROW: M-18</span>
            <span className="text-[#00FF00]">SPECIALLY CURATED</span>
          </div>
        </div>
      ) : (
        /* Actual Image with Lazy Loading Fallback Chain */
        <img
          src={currentSrc}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            status === "loading" ? "opacity-0 scale-95" : "opacity-100 scale-100",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
};

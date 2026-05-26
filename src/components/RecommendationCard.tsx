import React from "react";
import { Clapperboard, MonitorPlay, Instagram, Youtube, Play } from "lucide-react";
import { motion } from "motion/react";
import { Recommendation } from "../types";
import { cn } from "../lib/utils";

export const RecommendationCard: React.FC<{
  item: Recommendation;
  index: number;
}> = ({ item, index }) => {
  const colors = ['bg-[#FFFF00]', 'bg-[#FF007F]', 'bg-[#00FF00]', 'bg-[#00FFFF]', 'bg-[#FF9D00]'];
  const bgColor = colors[index % colors.length];

  // Using a movie-themed placeholder service
  const imageUrl = `https://loremflickr.com/600/400/movie,poster,${encodeURIComponent(item.image_keywords || 'cinema')},lock=${index}`;
  const reelsSearchUrl = `https://www.instagram.com/explore/tags/${item.name.replace(/\s+/g, '').toLowerCase()}edits/`;
  const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(item.name + " recommendation reels")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: index % 2 === 0 ? -5 : 5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      className={cn(
        "group relative border-4 border-black brutal-shadow-hover transition-all flex flex-col h-full overflow-hidden",
        bgColor
      )}
    >
      <div className="absolute top-2 left-2 bg-black text-white px-4 py-1 font-masala text-xl z-20 brutal-shadow-sm">
        #{index + 1}
      </div>

      <div className="relative h-64 w-full border-b-4 border-black overflow-hidden bg-black group-hover:h-72 transition-all duration-500">
        <div className="absolute top-0 left-0 right-0 h-4 film-strip-edge bg-white/20 z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-4 film-strip-edge bg-white/20 z-10" />
        
        <img 
          src={`https://loremflickr.com/800/600/cinema,bollywood,movie,${encodeURIComponent(item.image_keywords || 'poster')}/all?lock=${index}`} 
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 brightness-90 group-hover:brightness-110 contrast-125"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
          <div className="flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-[#00FF00]" />
            <span className="text-[12px] font-black uppercase tracking-tighter bg-[#00FF00] text-black px-2 py-0.5 brutal-shadow-sm">
              PREMIERING ON {item.ott}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-grow">
        <div className="space-y-4">
          <h3 className="text-3xl font-masala uppercase tracking-tighter leading-none bg-white border-2 border-black p-2 inline-block -rotate-1 shadow-[4px_4px_0_0_#000]">
            {item.name}
          </h3>
        </div>
        
        <div className="bg-white/50 border-2 border-dashed border-black p-4 font-masala text-sm italic relative">
          <span className="absolute -top-3 -left-1 text-2xl font-black opacity-20">"</span>
          {item.tagline}
          <span className="absolute -bottom-5 -right-1 text-2xl font-black opacity-20">"</span>
        </div>

        <p className="text-sm leading-tight font-bold text-black border-l-4 border-black pl-4">
          {item.reason}
        </p>
      </div>

      <div className="p-6 pt-0">
        <a
          href={`https://www.google.com/search?q=watch+${encodeURIComponent(item.name)}+on+${encodeURIComponent(item.ott)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-black text-white py-4 font-masala text-xl text-center block hover:bg-white hover:text-black border-4 border-black transition-colors brutal-shadow-sm active:shadow-none"
        >
          GO DEKH!
        </a>
      </div>
    </motion.div>
  );
};

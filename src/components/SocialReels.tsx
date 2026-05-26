import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Play } from 'lucide-react';
import { Recommendation } from '../types';
import { cn } from '../lib/utils';

interface SocialReelsProps {
  recommendations: Recommendation[];
  isLoading?: boolean;
}

export const SocialReels: React.FC<SocialReelsProps> = ({ recommendations, isLoading }) => {
  return (
    <div className="mt-24 space-y-12">
      <div className="flex items-center gap-6">
        <h2 className="font-masala text-5xl md:text-7xl uppercase tracking-tighter bg-black text-white px-6 py-2 rotate-[-1deg] brutal-shadow">
          SOCIAL BUZZ
        </h2>
        <div className="h-2 flex-1 bg-black hidden md:block" />
        {isLoading && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#00FF00] border-2 border-black animate-pulse shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest">Scanning Reels</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {isLoading ? (
          Array(12).fill(0).map((_, i) => (
            <div key={i} className="group relative h-[300px] border-4 border-black bg-neutral-100 overflow-hidden brutal-shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-black/10 flex items-center justify-center animate-spin">
                  <Play className="w-6 h-6 text-black/10" fill="currentColor" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 bg-white/50 backdrop-blur-sm border-t-2 border-black">
                <div className="h-2 w-1/2 bg-black/10 mb-2" />
                <div className="h-4 w-3/4 bg-black/20" />
              </div>
            </div>
          ))
        ) : (
          recommendations.map((item, idx) => {
          const reelsUrl = `https://www.instagram.com/explore/tags/${item.name.replace(/\s+/g, '').toLowerCase()}edits/`;
          const tiktokUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(item.name + " aesthetic edits")}`;
          
          // Using movie poster keyword for a representative "clip" thumbnail
          const thumbUrl = `https://loremflickr.com/300/500/movie,poster,${encodeURIComponent(item.image_keywords || 'cinema')},aesthetic?lock=${idx}`;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative h-[300px] border-4 border-black bg-black overflow-hidden brutal-shadow-sm hover:brutal-shadow transition-all"
            >
              <img 
                src={`https://loremflickr.com/300/500/cinema,bollywood,vibe,${encodeURIComponent(item.image_keywords || 'aesthetic')}/all?lock=${idx}`} 
                alt={`${item.name} social`}
                className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500 scale-105 group-hover:scale-100"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center group-hover:border-[#00FF00]/50 transition-colors">
                  <Play className="w-8 h-8 text-white/40 group-hover:text-[#00FF00] transition-colors ml-1" fill="currentColor" />
                </div>
              </div>
              
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent z-20">
                <p className="text-[10px] font-black text-[#00FF00] uppercase mb-1">{item.trendingTheme || item.socialHype || 'Viral Vibe'}</p>
                <p className="text-white font-masala text-lg leading-tight mb-1 truncate group-hover:text-[#00FF00] transition-colors">{item.name}</p>
                <div className="flex gap-2 mt-3">
                  <a href={reelsUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#FF007F] text-white border-2 border-black hover:rotate-6 transition-transform"><Instagram size={12} /></a>
                  <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#00FFFF] text-black border-2 border-black hover:-rotate-6 transition-transform"><Play size={12} fill="currentColor" /></a>
                </div>
              </div>
            </motion.div>
          );
        })
        )}
      </div>
    </div>
  );
};

import React from "react";
import * as Icons from "lucide-react";
import { motion } from "motion/react";
import { Mood, MOOD_CONFIGS } from "../types";
import { cn } from "../lib/utils";

export const MoodCard: React.FC<{
  mood: Mood;
  isSelected: boolean;
  onSelect: (mood: Mood) => void;
}> = ({ mood, isSelected, onSelect }) => {
  const config = MOOD_CONFIGS[mood];
  const Icon = Icons[config.icon as keyof typeof Icons] as any;

  return (
    <motion.button
      whileHover={{ translate: '-4px -4px' }}
      whileTap={{ translate: '2px 2px', boxShadow: '2px 2px 0px 0px #000' }}
      onClick={() => onSelect(mood)}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 border-4 border-black transition-all h-48 w-full group overflow-hidden",
        config.color,
        isSelected ? "brutal-shadow translate-[-4px_-4px]" : "brutal-shadow-sm"
      )}
    >
      <div className="absolute top-0 right-0 p-2 bg-black text-white text-[10px] font-black uppercase">
        {mood.substring(0, 3)}
      </div>
      
      <div className="mb-4 bg-white border-2 border-black p-4 group-hover:rotate-12 transition-transform shadow-[4px_4px_0px_0px_#000]">
        <Icon className="w-8 h-8 text-black" />
      </div>

      <span className="font-masala text-xl uppercase tracking-tighter text-black break-all">
        {mood}
      </span>

      {isSelected && (
        <div className="absolute bottom-2 right-2">
          <div className="w-4 h-4 bg-black rotate-45" />
        </div>
      )}
    </motion.button>
  );
};
